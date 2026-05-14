import { Router } from 'express';
import { getDb } from '../config/db';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { generateCodesSchema, sendNotificationSchema } from '../validators/admin';
import { notifyClients } from '../utils/sse';
import crypto from 'crypto';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get('/dashboard', async (req, res) => {
    try {
        const db = await getDb();
        const studentsRow = await db.get("SELECT count(*) as count FROM users WHERE role = 'student'");
        const coursesRow = await db.get("SELECT count(*) as count FROM courses WHERE is_active = 1 AND deleted_at IS NULL");
        const codesRow = await db.get("SELECT count(*) as count FROM access_codes WHERE status = 'used'");
        const revenueRow = await db.get(`
            SELECT SUM(c.price) as total 
            FROM enrollments e 
            JOIN courses c ON e.course_id = c.id
        `);
        
        res.json({
            totalStudents: studentsRow?.count || 0,
            activeCourses: coursesRow?.count || 0,
            activatedCodes: codesRow?.count || 0,
            totalRevenue: Math.abs(revenueRow?.total || 0)
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/codes', async (req, res) => {
    try {
        const db = await getDb();
        const codes = await db.all(`
            SELECT ac.*, c.title as course_title, u.full_name as student_name
            FROM access_codes ac
            LEFT JOIN courses c ON ac.course_id = c.id
            LEFT JOIN users u ON ac.student_id = u.id
            WHERE ac.status != 'deleted'
            ORDER BY ac.created_at DESC
            LIMIT 1000
        `);
        res.json(codes.map(c => ({
            ...c,
            courses: { title: c.course_title },
            profiles: c.student_name ? { full_name: c.student_name } : null
        })));
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/codes/generate', validate(generateCodesSchema), async (req, res) => {
    let db;
    try {
        db = await getDb();
        const { course_id, count } = req.body;
        const limit = count || 10;
        
        await db.exec('BEGIN TRANSACTION');
        const generatedCodes = [];
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        
        for (let i = 0; i < limit; i++) {
            let code;
            let exists = true;
            while (exists) {
                // Generate a professional code: IGT-XXXX-XXXX (e.g., IGT-A7X9-B3K2)
                const p1 = Array.from({ length: 4 }, () => chars[crypto.randomInt(0, chars.length)]).join('');
                const p2 = Array.from({ length: 4 }, () => chars[crypto.randomInt(0, chars.length)]).join('');
                code = `IGT-${p1}-${p2}`;
                
                const existing = await db.get('SELECT id FROM access_codes WHERE code = ?', [code]);
                if (!existing) exists = false;
            }
            
            await db.run('INSERT INTO access_codes (code, course_id) VALUES (?, ?)', [code, course_id]);
            generatedCodes.push(code);
        }
        
        await db.exec('COMMIT');
        res.status(201).json({ success: true, count: limit, generatedCodes });
    } catch (error) {
        if (db) await db.exec('ROLLBACK');
        console.error('generateCodes error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/codes/:id', async (req, res) => {
    try {
        const db = await getDb();
        await db.run('UPDATE access_codes SET status = "deleted" WHERE id = ?', [req.params.id]);
        notifyClients('admin');
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/notifications/send', validate(sendNotificationSchema), async (req, res) => {
    let db;
    try {
        db = await getDb();
        const { course_id, type, text } = req.body;
        
        await db.exec('BEGIN TRANSACTION');
        
        let usersToNotify = [];
        if (course_id && course_id !== 'all') {
            const enrollments = await db.all('SELECT student_id FROM enrollments WHERE course_id = ?', [course_id]);
            usersToNotify = enrollments.map(e => e.student_id);
        } else {
            const users = await db.all('SELECT id FROM users WHERE role = "student"');
            usersToNotify = users.map(u => u.id);
        }
        
        for (const userId of usersToNotify) {
            await db.run('INSERT INTO notifications (user_id, type, text) VALUES (?, ?, ?)', [userId, type, text]);
        }
        
        await db.exec('COMMIT');
        res.json({ success: true, count: usersToNotify.length });
    } catch (error) {
        if (db) await db.exec('ROLLBACK');
        console.error('sendNotifications error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
