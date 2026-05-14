import { Router } from 'express';
import { getDb } from '../config/db';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createQuizSchema, createQuizQuestionSchema, createLessonQuestionSchema, submitResultSchema } from '../validators/quizzes';
import { notifyClients } from '../utils/sse';

const router = Router();

// --- Standalone Quizzes ---
router.get('/', async (req, res) => {
    try {
        const db = await getDb();
        const quizzes = await db.all(`
            SELECT q.*, c.title as course_title 
            FROM quizzes q 
            LEFT JOIN courses c ON q.course_id = c.id 
            ORDER BY q.created_at DESC
        `);
        // Map course_title to courses: { title } for frontend compatibility
        res.json(quizzes.map(q => ({ ...q, courses: { title: q.course_title } })));
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const db = await getDb();
        const quiz = await db.get(`
            SELECT q.*, c.title as course_title 
            FROM quizzes q 
            LEFT JOIN courses c ON q.course_id = c.id 
            WHERE q.id = ?
        `, [req.params.id]);
        if (!quiz) return res.status(404).json({ error: 'Not found' });
        res.json({ ...quiz, courses: { title: quiz.course_title } });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/', authenticate, requireRole('admin'), validate(createQuizSchema), async (req, res) => {
    try {
        const db = await getDb();
        const { title, course_id, duration, scheduled_date, is_active, allow_retake } = req.body;
        const result = await db.run(
            'INSERT INTO quizzes (title, course_id, duration, scheduled_date, is_active, allow_retake) VALUES (?, ?, ?, ?, ?, ?)',
            [title, course_id, duration || 30, scheduled_date, is_active !== false ? 1 : 0, allow_retake !== false ? 1 : 0]
        );
        const newQuiz = await db.get('SELECT * FROM quizzes WHERE id = ?', [result.lastID]);
        notifyClients('quizzes');
        res.status(201).json(newQuiz);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/:id', authenticate, requireRole('admin'), async (req, res) => {
    try {
        const db = await getDb();
        await db.run('UPDATE quizzes SET deleted_at = CURRENT_TIMESTAMP, is_active = 0 WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// --- Quiz Questions ---
router.get('/:quizId/questions', async (req, res) => {
    try {
        const db = await getDb();
        const questions = await db.all('SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY sort_order ASC', [req.params.quizId]);
        res.json(questions.map(q => {
            let options = [];
            try {
                options = JSON.parse(q.options || '[]');
                // If it's still a string, parse it again (handle double-stringify)
                if (typeof options === 'string') options = JSON.parse(options);
            } catch (e) {
                console.error('Error parsing quiz options:', e);
            }
            return { ...q, options: Array.isArray(options) ? options : [] };
        }));
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/:quizId/questions', authenticate, requireRole('admin'), validate(createQuizQuestionSchema), async (req, res) => {
    try {
        const db = await getDb();
        const { question, options, correct_answer, sort_order } = req.body;
        const result = await db.run(
            'INSERT INTO quiz_questions (quiz_id, question, options, correct_answer, sort_order) VALUES (?, ?, ?, ?, ?)',
            [req.params.quizId, question, JSON.stringify(options || []), correct_answer || 0, sort_order || 0]
        );
        const newQ = await db.get('SELECT * FROM quiz_questions WHERE id = ?', [result.lastID]);
        notifyClients('quizzes');
        res.status(201).json({ ...newQ, options: JSON.parse(newQ.options) });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/questions/:id', authenticate, requireRole('admin'), async (req, res) => {
    try {
        const db = await getDb();
        await db.run('DELETE FROM quiz_questions WHERE id = ?', [req.params.id]);
        notifyClients('quizzes');
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// --- Lesson Questions ---
router.get('/lesson/:lessonId', async (req, res) => {
    try {
        const db = await getDb();
        const questions = await db.all('SELECT * FROM lesson_questions WHERE lesson_id = ? ORDER BY sort_order ASC', [req.params.lessonId]);
        res.json(questions.map(q => ({ ...q, options: JSON.parse(q.options || '[]') })));
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/lesson', authenticate, requireRole('admin'), validate(createLessonQuestionSchema), async (req, res) => {
    try {
        const db = await getDb();
        const { lesson_id, question, options, correct_answer, sort_order } = req.body;
        const result = await db.run(
            'INSERT INTO lesson_questions (lesson_id, question, options, correct_answer, sort_order) VALUES (?, ?, ?, ?, ?)',
            [lesson_id, question, JSON.stringify(options || []), correct_answer || 0, sort_order || 0]
        );
        const newQ = await db.get('SELECT * FROM lesson_questions WHERE id = ?', [result.lastID]);
        res.status(201).json({ ...newQ, options: JSON.parse(newQ.options) });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/lesson/:id', authenticate, requireRole('admin'), async (req, res) => {
    try {
        const db = await getDb();
        const updates = req.body;

        const ALLOWED_FIELDS = ['question', 'options', 'correct_answer', 'sort_order'];
        const keys = Object.keys(updates).filter(k => ALLOWED_FIELDS.includes(k));

        if (keys.length === 0) return res.status(400).json({ error: 'No fields' });

        const setClause = keys.map(k => `${k} = ?`).join(', ');
        const values = keys.map(k => k === 'options' ? JSON.stringify(updates[k]) : updates[k]);
        values.push(req.params.id);

        await db.run(`UPDATE lesson_questions SET ${setClause} WHERE id = ?`, values);
        const updated = await db.get('SELECT * FROM lesson_questions WHERE id = ?', [req.params.id]);
        res.json({ ...updated, options: JSON.parse(updated.options) });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/lesson/:id', authenticate, requireRole('admin'), async (req, res) => {
    try {
        const db = await getDb();
        await db.run('DELETE FROM lesson_questions WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// --- Results ---
router.post('/results', authenticate, validate(submitResultSchema), async (req, res) => {
    try {
        const db = await getDb();
        const { lesson_id, quiz_id, score, total, answers } = req.body;
        const student_id = req.user.id;
        
        const result = await db.run(
            'INSERT INTO quiz_results (student_id, lesson_id, quiz_id, score, total, answers) VALUES (?, ?, ?, ?, ?, ?)',
            [student_id, lesson_id || null, quiz_id || null, score, total, JSON.stringify(answers || [])]
        );
        const saved = await db.get('SELECT * FROM quiz_results WHERE id = ?', [result.lastID]);
        notifyClients('quizzes');
        res.status(201).json(saved);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/results/student/:studentId', authenticate, async (req, res) => {
    try {
        const db = await getDb();
        const results = await db.all(`
            SELECT qr.*, l.title as lesson_title, l.type as lesson_type, q.title as quiz_title
            FROM quiz_results qr
            LEFT JOIN lessons l ON qr.lesson_id = l.id
            LEFT JOIN quizzes q ON qr.quiz_id = q.id
            WHERE qr.student_id = ?
            ORDER BY qr.submitted_at DESC
        `, [req.params.studentId]);
        
        res.json(results.map(r => ({
            ...r,
            answers: JSON.parse(r.answers || '[]'),
            lessons: r.lesson_id ? { title: r.lesson_title, type: r.lesson_type } : null,
            quizzes: r.quiz_id ? { title: r.quiz_title } : null
        })));
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/results/details/:quizId', authenticate, async (req, res) => {
    try {
        const db = await getDb();
        const result = await db.get(`
            SELECT qr.*, q.title as quiz_title
            FROM quiz_results qr
            LEFT JOIN quizzes q ON qr.quiz_id = q.id
            WHERE qr.student_id = ? AND qr.quiz_id = ?
        `, [req.user.id, req.params.quizId]);
        
        if (!result) return res.status(404).json({ error: 'Not found' });
        
        res.json({
            ...result,
            answers: JSON.parse(result.answers || '[]'),
            quizzes: { title: result.quiz_title }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
