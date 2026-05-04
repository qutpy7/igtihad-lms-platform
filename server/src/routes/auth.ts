import { Router } from 'express';
import { getDb } from '../config/db';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt';
import { authenticate } from '../middleware/auth';
import { loginLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';
import { signupSchema, loginSchema, adminSignUpSchema } from '../validators/auth';
import crypto from 'crypto';

const router = Router();

// Register — rate limited + validated
router.post('/register', loginLimiter, validate(signupSchema), async (req, res) => {
    try {
        const { email, password, full_name, phone } = req.body;

        const db = await getDb();
        
        // Check if user exists
        const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const id = crypto.randomUUID();
        // 🔒 Security Fix: Public registration is ALWAYS 'student'.
        // Admin accounts can only be created by existing admins via /admin/create-admin.
        const userRole = 'student';

        await db.run(
            'INSERT INTO users (id, email, password_hash, full_name, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
            [id, email, hashedPassword, full_name, phone || null, userRole]
        );

        const token = generateToken(id, userRole);
        res.json({ token, user: { id, email, full_name, role: userRole } });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin Register
router.post('/admin-register', loginLimiter, validate(adminSignUpSchema), async (req, res) => {
    try {
        const { email, password, full_name, secret } = req.body;

        if (secret !== process.env.ADMIN_SECRET) {
            return res.status(403).json({ error: 'Invalid admin secret' });
        }

        const db = await getDb();
        
        const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const id = crypto.randomUUID();
        const userRole = 'admin';

        await db.run(
            'INSERT INTO users (id, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)',
            [id, email, hashedPassword, full_name, userRole]
        );

        const token = generateToken(id, userRole);
        res.json({ token, user: { id, email, full_name, role: userRole } });
    } catch (error) {
        console.error('Admin Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login — rate limited + validated
router.post('/login', loginLimiter, validate(loginSchema), async (req, res) => {
    try {
        const { email, password } = req.body;

        const db = await getDb();
        const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(user.id, user.role);
        
        res.json({ 
            token, 
            user: { 
                id: user.id, 
                email: user.email, 
                full_name: user.full_name, 
                role: user.role 
            } 
        });
    } catch (error) {
        console.error('[Auth] Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get current user
router.get('/me', authenticate, async (req: any, res) => {
    try {
        const db = await getDb();
        const user = await db.get('SELECT id, email, full_name, phone, role, avatar_url, balance FROM users WHERE id = ?', [req.user.id]);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ user });
    } catch (error) {
        console.error('Me error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
