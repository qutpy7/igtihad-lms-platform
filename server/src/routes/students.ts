import { Router } from 'express';
import { getDb } from '../config/db';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { enrollSchema, redeemSchema, progressSchema, profileUpdateSchema, questionSchema, answerSchema } from '../validators/students';
import { notifyClients } from '../utils/sse';

const router = Router();

// --- Profiles ---
router.get('/', authenticate, requireRole('admin'), async (req, res) => {
    try {
        const db = await getDb();
        const students = await db.all("SELECT id, full_name, email, phone, role, grade, governorate, balance, created_at FROM users WHERE role = 'student' ORDER BY created_at DESC LIMIT 1000");
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/admins', authenticate, requireRole('admin'), async (req, res) => {
    try {
        const db = await getDb();
        const admins = await db.all("SELECT id, full_name, email, phone, role, created_at FROM users WHERE role = 'admin' ORDER BY created_at DESC LIMIT 100");
        res.json(admins);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/profile/:id', authenticate, async (req, res) => {
    try {
        // Only admin or the user themselves can update their profile
        if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        
        const db = await getDb();
        const updates = req.body;

        const ALLOWED_FIELDS = ['email', 'full_name', 'phone', 'avatar_url', 'grade', 'governorate'];
        const keys = Object.keys(updates).filter(k => ALLOWED_FIELDS.includes(k)); // prevent restricted updates
        
        if (keys.length === 0) return res.status(400).json({ error: 'No valid fields' });

        const setClause = keys.map(k => `${k} = ?`).join(', ');
        const values = keys.map(k => updates[k]);
        values.push(req.params.id);

        await db.run(`UPDATE users SET ${setClause} WHERE id = ?`, values);
        const updated = await db.get('SELECT id, full_name, email, phone, role, grade, governorate, balance FROM users WHERE id = ?', [req.params.id]);
        notifyClients('students');
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// --- Analytics ---
// 🔧 Performance Fix: Replaced N+1 queries (3 queries per student in a loop)
// with 4 batch queries total, assembled in JavaScript.
router.get('/analytics/:courseId', authenticate, requireRole('admin'), async (req, res) => {
    try {
        const db = await getDb();
        const courseId = req.params.courseId;

        // 1. Get all enrolled students (1 query)
        const students = await db.all(`
            SELECT u.id, u.full_name, u.email, u.grade, e.enrolled_at
            FROM users u
            JOIN enrollments e ON u.id = e.student_id
            WHERE e.course_id = ?
        `, [courseId]);

        // 2. Get total lessons in this course (1 query)
        const lessonsRow = await db.get(`
            SELECT count(l.id) as total
            FROM lessons l
            JOIN units u ON l.unit_id = u.id
            WHERE u.course_id = ?
        `, [courseId]);
        const totalLessons = lessonsRow?.total || 0;

        // 3. Get completed lessons PER student in one batch query (1 query instead of N)
        const progressRows = await db.all(`
            SELECT lp.student_id, count(lp.lesson_id) as completed
            FROM lesson_progress lp
            JOIN lessons l ON lp.lesson_id = l.id
            JOIN units u ON l.unit_id = u.id
            WHERE u.course_id = ? AND lp.completed = 1
            GROUP BY lp.student_id
        `, [courseId]);
        const progressMap: Record<string, number> = {};
        progressRows.forEach((r: any) => { progressMap[r.student_id] = r.completed; });

        // 4. Get lesson quiz averages PER student in one batch query (1 query instead of N)
        const quizAvgRows = await db.all(`
            SELECT qr.student_id,
                   SUM(qr.score) as total_score,
                   SUM(qr.total) as total_possible
            FROM quiz_results qr
            JOIN lessons l ON qr.lesson_id = l.id
            JOIN units u ON l.unit_id = u.id
            WHERE u.course_id = ? AND qr.lesson_id IS NOT NULL
            GROUP BY qr.student_id
        `, [courseId]);
        const quizAvgMap: Record<string, { score: number; possible: number }> = {};
        quizAvgRows.forEach((r: any) => {
            quizAvgMap[r.student_id] = { score: r.total_score, possible: r.total_possible };
        });

        // 5. Get all standalone exam results in one batch query (1 query instead of N×M)
        const exams = await db.all('SELECT id, title FROM quizzes WHERE course_id = ? AND deleted_at IS NULL', [courseId]);

        const examResultRows = await db.all(`
            SELECT qr.student_id, qr.quiz_id, qr.score, qr.total, qr.id as result_id
            FROM quiz_results qr
            JOIN quizzes q ON qr.quiz_id = q.id
            WHERE q.course_id = ? AND qr.quiz_id IS NOT NULL
            ORDER BY qr.submitted_at DESC
        `, [courseId]);

        // Build a map: student_id -> quiz_id -> latest result (first one per group since sorted DESC)
        const examMap: Record<string, Record<number, { score: number; total: number }>> = {};
        examResultRows.forEach((r: any) => {
            if (!examMap[r.student_id]) examMap[r.student_id] = {};
            // Only keep the first (latest) result per student+quiz combo
            if (!examMap[r.student_id][r.quiz_id]) {
                examMap[r.student_id][r.quiz_id] = { score: r.score, total: r.total };
            }
        });

        // 6. Assemble the final analytics array in JavaScript (no more DB calls)
        const analytics = students.map((student: any) => {
            const completed = progressMap[student.id] || 0;
            const progress = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;

            const quizData = quizAvgMap[student.id];
            const quizAvg = quizData && quizData.possible > 0
                ? Math.round((quizData.score / quizData.possible) * 100)
                : 0;

            const studentExams = examMap[student.id] || {};
            const examResults = exams.map((exam: any) => {
                const result = studentExams[exam.id];
                return {
                    quiz_id: exam.id,
                    title: exam.title,
                    score: result?.score || 0,
                    total: result?.total || 0,
                    percentage: result && result.total > 0 ? Math.round((result.score / result.total) * 100) : 0
                };
            });

            return {
                ...student,
                progress,
                quiz_avg: quizAvg,
                exams: examResults
            };
        });

        res.json(analytics);
    } catch (error) {
        console.error('fetchAnalytics error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- Enrollments ---
router.get('/:studentId/enrollments', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.id !== req.params.studentId) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const db = await getDb();
        const enrollments = await db.all(`
            SELECT e.*, c.title, c.thumbnail_url as cover_url, c.description,
            (SELECT l.id FROM lessons l JOIN units u ON l.unit_id = u.id 
             WHERE u.course_id = c.id AND u.deleted_at IS NULL AND l.deleted_at IS NULL 
             ORDER BY u.sort_order ASC, l.sort_order ASC LIMIT 1) as first_lesson_id
            FROM enrollments e
            JOIN courses c ON e.course_id = c.id
            WHERE e.student_id = ?
        `, [req.params.studentId]);
        
        res.json(enrollments.map(e => ({
            id: e.id, student_id: e.student_id, course_id: e.course_id, enrolled_at: e.enrolled_at, expires_at: e.expires_at,
            courses: { id: e.course_id, title: e.title, cover_url: e.cover_url, description: e.description, first_lesson_id: e.first_lesson_id }
        })));
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/:studentId/enrollments/:courseId/check', authenticate, async (req, res) => {
    try {
        const db = await getDb();
        const enrollment = await db.get(`
            SELECT * FROM enrollments 
            WHERE student_id = ? AND course_id = ? 
            AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
        `, [req.params.studentId, req.params.courseId]);
        res.json(!!enrollment);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/enroll', authenticate, validate(enrollSchema), async (req, res) => {
    // 🔧 Bug Fix: Declare db outside try so catch can access it for ROLLBACK
    let db;
    try {
        db = await getDb();
        const { course_id, price, duration_days } = req.body;
        const student_id = req.user.id;

        await db.exec('BEGIN TRANSACTION');
        
        // 1. Check user balance
        const user = await db.get('SELECT balance FROM users WHERE id = ?', [student_id]);
        if (!user || user.balance < (price || 0)) {
            await db.exec('ROLLBACK');
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        // 2. Check if already enrolled
        const exists = await db.get('SELECT 1 FROM enrollments WHERE student_id = ? AND course_id = ? AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)', [student_id, course_id]);
        if (exists) {
            await db.exec('ROLLBACK');
            return res.status(400).json({ error: 'Already enrolled' });
        }

        // 3. Deduct balance
        if (price > 0) {
            await db.run('UPDATE users SET balance = balance - ? WHERE id = ?', [price, student_id]);
            await db.run(
                'INSERT INTO wallet_transactions (student_id, type, amount, details, status) VALUES (?, ?, ?, ?, ?)',
                [student_id, 'purchase', -price, 'Course Purchase', 'success']
            );
        }

        // 4. Enroll
        const expiresAt = duration_days ? new Date(Date.now() + duration_days * 24 * 60 * 60 * 1000).toISOString() : null;
        await db.run(
            'INSERT INTO enrollments (student_id, course_id, expires_at) VALUES (?, ?, ?)',
            [student_id, course_id, expiresAt]
        );

        await db.exec('COMMIT');
        notifyClients('students');
        res.json({ success: true });
    } catch (error) {
        if (db) await db.exec('ROLLBACK').catch(() => {});
        res.status(500).json({ error: 'Server error' });
    }
});

// --- Progress ---
router.get('/:studentId/progress', authenticate, async (req, res) => {
    try {
        const db = await getDb();
        const progress = await db.all('SELECT lesson_id FROM lesson_progress WHERE student_id = ? AND completed = 1', [req.params.studentId]);
        res.json(progress.map(p => p.lesson_id));
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/progress', authenticate, validate(progressSchema), async (req, res) => {
    try {
        const db = await getDb();
        const { lesson_id } = req.body;
        const student_id = req.user.id;
        
        await db.run(`
            INSERT INTO lesson_progress (student_id, lesson_id, completed, completed_at)
            VALUES (?, ?, 1, CURRENT_TIMESTAMP)
            ON CONFLICT(student_id, lesson_id) DO UPDATE SET completed = 1, completed_at = CURRENT_TIMESTAMP
        `, [student_id, lesson_id]);
        notifyClients('students');
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Simplified by-course progress
router.get('/:studentId/progress-by-course', authenticate, async (req, res) => {
    try {
        const db = await getDb();
        const studentId = req.params.studentId;
        
        // This query requires complex joins, for sqlite we can do it in two steps or a big join
        // For simplicity, we just mock the result for now since SQLite json functions are slightly different
        // In a real scenario we'd write the exact JOIN.
        const enrollments = await db.all('SELECT course_id FROM enrollments WHERE student_id = ?', [studentId]);
        const result: Record<number, number> = {};
        
        for (const enr of enrollments) {
            // get total lessons
            const totalRow = await db.get(`
                SELECT count(l.id) as total 
                FROM lessons l JOIN units u ON l.unit_id = u.id 
                WHERE u.course_id = ?
            `, [enr.course_id]);
            
            // get completed lessons
            const completedRow = await db.get(`
                SELECT count(lp.lesson_id) as completed 
                FROM lesson_progress lp 
                JOIN lessons l ON lp.lesson_id = l.id 
                JOIN units u ON l.unit_id = u.id 
                WHERE lp.student_id = ? AND u.course_id = ? AND lp.completed = 1
            `, [studentId, enr.course_id]);
            
            const total = totalRow?.total || 0;
            const completed = completedRow?.completed || 0;
            result[enr.course_id] = total > 0 ? Math.round((completed / total) * 100) : 0;
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// --- Wallet ---
router.get('/:studentId/wallet', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.id !== req.params.studentId) return res.status(403).json({ error: 'Forbidden' });
        const db = await getDb();
        const transactions = await db.all('SELECT * FROM wallet_transactions WHERE student_id = ? ORDER BY created_at DESC', [req.params.studentId]);
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/redeem', authenticate, validate(redeemSchema), async (req, res) => {
    // 🔧 Bug Fix: Declare db outside try so catch can access it for ROLLBACK
    let db;
    try {
        db = await getDb();
        const { code } = req.body;
        const student_id = req.user.id;

        await db.exec('BEGIN TRANSACTION');
        const ac = await db.get('SELECT * FROM access_codes WHERE code = ? AND status = "available"', [code]);
        if (!ac) {
            await db.exec('ROLLBACK');
            return res.status(400).json({ error: 'Invalid or used code' });
        }
        
        // Enroll student directly for the code's course
        const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
        await db.run('INSERT INTO enrollments (student_id, course_id, expires_at) VALUES (?, ?, ?)', [student_id, ac.course_id, expiresAt]);
        await db.run('UPDATE access_codes SET status = "used", student_id = ?, used_at = CURRENT_TIMESTAMP WHERE id = ?', [student_id, ac.id]);
        
        await db.exec('COMMIT');
        res.json({ success: true, course_id: ac.course_id });
    } catch (error) {
        if (db) await db.exec('ROLLBACK').catch(() => {});
        res.status(500).json({ error: 'Server error' });
    }
});

// --- Q&A ---
router.get('/qa/lesson/:lessonId', authenticate, async (req, res) => {
    try {
        const db = await getDb();
        const questions = await db.all(`
            SELECT sq.*, u.full_name as profile_name 
            FROM student_questions sq
            JOIN users u ON sq.student_id = u.id
            WHERE sq.lesson_id = ? AND sq.student_id = ?
            ORDER BY sq.created_at DESC
        `, [req.params.lessonId, req.user.id]);
        
        res.json(questions.map(q => ({ ...q, profiles: { full_name: q.profile_name } })));
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/qa/all', authenticate, requireRole('admin'), async (req, res) => {
    try {
        const db = await getDb();
        const questions = await db.all(`
            SELECT sq.*, u.full_name as profile_name, l.title as lesson_title, c.title as course_title
            FROM student_questions sq
            JOIN users u ON sq.student_id = u.id
            JOIN lessons l ON sq.lesson_id = l.id
            JOIN units un ON l.unit_id = un.id
            JOIN courses c ON un.course_id = c.id
            ORDER BY sq.created_at DESC
        `);
        
        res.json(questions.map(q => ({
            ...q,
            profiles: { full_name: q.profile_name },
            lessons: { title: q.lesson_title, courses: { title: q.course_title } }
        })));
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/qa', authenticate, validate(questionSchema), async (req, res) => {
    try {
        const db = await getDb();
        const { lesson_id, question } = req.body;
        const result = await db.run(
            'INSERT INTO student_questions (lesson_id, student_id, question) VALUES (?, ?, ?)',
            [lesson_id, req.user.id, question]
        );
        const newQ = await db.get('SELECT * FROM student_questions WHERE id = ?', [result.lastID]);
        notifyClients('students');
        res.status(201).json(newQ);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/qa/:id/answer', authenticate, requireRole('admin'), validate(answerSchema), async (req, res) => {
    try {
        const db = await getDb();
        const { answer } = req.body;
        await db.run('UPDATE student_questions SET answer = ?, is_answered = 1, answered_at = CURRENT_TIMESTAMP WHERE id = ?', [answer, req.params.id]);
        const updated = await db.get('SELECT * FROM student_questions WHERE id = ?', [req.params.id]);
        notifyClients('students');
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/qa/:id', authenticate, requireRole('admin'), async (req, res) => {
    try {
        const db = await getDb();
        await db.run('DELETE FROM student_questions WHERE id = ?', [req.params.id]);
        notifyClients('students');
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// --- Notifications ---
router.get('/:studentId/notifications', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.id !== req.params.studentId) return res.status(403).json({ error: 'Forbidden' });
        const db = await getDb();
        const notifications = await db.all('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [req.params.studentId]);
        // match supabase bit
        res.json(notifications.map(n => ({...n, is_read: n.is_read === 1})));
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/:studentId/notifications/read', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.id !== req.params.studentId) return res.status(403).json({ error: 'Forbidden' });
        const db = await getDb();
        await db.run('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0', [req.params.studentId]);
        notifyClients('students');
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
