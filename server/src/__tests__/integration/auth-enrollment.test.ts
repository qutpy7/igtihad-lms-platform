/**
 * ═══════════════════════════════════════════════
 * Integration Tests — Auth & Enrollment Flows
 * ═══════════════════════════════════════════════
 * 
 * Tests the critical user journeys:
 * 1. Registration → Login → Get Profile
 * 2. Enrollment → Progress → Wallet
 */

import request from 'supertest';
import express from 'express';
import { open, Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';
import path from 'path';
jest.mock('../../utils/sse', () => ({
    sseMiddleware: jest.fn((req, res, next) => next()),
    notifyClients: jest.fn()
}));


// ─── App Setup (isolated test instance) ───────────────────────
let db: Database<sqlite3.Database, sqlite3.Statement>;
let app: express.Express;
let studentToken: string;
let adminToken: string;
let testStudentId: string;
let testCourseId: number;

// We mock getDb to use in-memory SQLite
jest.mock('../../config/db', () => ({
    getDb: jest.fn(async () => db),
}));

// Mock rate limiter — disable in tests to avoid 429 errors
jest.mock('../../middleware/rateLimiter', () => ({
    loginLimiter: (req: any, res: any, next: any) => next(),
    globalLimiter: (req: any, res: any, next: any) => next(),
    uploadLimiter: (req: any, res: any, next: any) => next(),
}));

// Must import routes AFTER mocking
import authRoutes from '../../routes/auth';
import studentRoutes from '../../routes/students';

beforeAll(async () => {
    // Create in-memory database
    db = await open({ filename: ':memory:', driver: sqlite3.Database });
    await db.exec('PRAGMA foreign_keys = ON;');

    // Create schema
    await db.exec(`
        CREATE TABLE users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            phone TEXT,
            avatar_url TEXT,
            role TEXT NOT NULL DEFAULT 'student',
            grade TEXT,
            governorate TEXT,
            balance INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL, description TEXT, short_desc TEXT,
            grade TEXT NOT NULL DEFAULT 'prep_1', term TEXT DEFAULT 'first',
            price INTEGER DEFAULT 0, original_price INTEGER DEFAULT 0,
            color TEXT, thumbnail_url TEXT,
            is_featured INTEGER DEFAULT 0, is_active INTEGER DEFAULT 1,
            deleted_at DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE enrollments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
            enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            expires_at DATETIME,
            UNIQUE(student_id, course_id)
        );
        CREATE TABLE wallet_transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            type TEXT NOT NULL, amount INTEGER NOT NULL,
            details TEXT, status TEXT DEFAULT 'success',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE units (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
            title TEXT NOT NULL, sort_order INTEGER DEFAULT 0,
            thumbnail_url TEXT, deleted_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE lessons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            unit_id INTEGER NOT NULL REFERENCES units(id) ON DELETE CASCADE,
            title TEXT NOT NULL, type TEXT DEFAULT 'video',
            content_url TEXT, attachment_url TEXT, content TEXT,
            duration TEXT, sort_order INTEGER DEFAULT 0,
            thumbnail_url TEXT, allow_retake INTEGER DEFAULT 1,
            deleted_at DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE lesson_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
            completed INTEGER DEFAULT 0, completed_at DATETIME,
            UNIQUE(student_id, lesson_id)
        );
        CREATE TABLE access_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL,
            course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
            status TEXT DEFAULT 'available',
            student_id TEXT REFERENCES users(id),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP, used_at DATETIME
        );
        CREATE TABLE notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            type TEXT DEFAULT 'general', text TEXT NOT NULL,
            is_read INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE student_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lesson_id INTEGER NOT NULL, student_id TEXT NOT NULL,
            question TEXT NOT NULL, answer TEXT,
            is_answered INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP, answered_at DATETIME
        );
        CREATE TABLE quiz_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT NOT NULL, quiz_id INTEGER, lesson_id INTEGER,
            score INTEGER DEFAULT 0, total INTEGER DEFAULT 0,
            answers TEXT DEFAULT '[]',
            submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE quizzes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL, course_id INTEGER NOT NULL,
            duration INTEGER DEFAULT 30, scheduled_date TEXT,
            is_active INTEGER DEFAULT 1, allow_retake INTEGER DEFAULT 1,
            deleted_at DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Seed: admin user + test course
    const adminHash = await bcrypt.hash('admin123', 10);
    await db.run(
        `INSERT INTO users (id, email, password_hash, full_name, role, balance) VALUES (?, ?, ?, ?, ?, ?)`,
        ['admin-001', 'admin@test.com', adminHash, 'Admin User', 'admin', 0]
    );
    const courseResult = await db.run(
        `INSERT INTO courses (title, grade, price) VALUES (?, ?, ?)`,
        ['Test Math Course', 'prep_1', 50]
    );
    testCourseId = courseResult.lastID!;

    // Seed: access code
    await db.run(
        `INSERT INTO access_codes (code, course_id, status) VALUES (?, ?, ?)`,
        ['TESTCODE123', testCourseId, 'available']
    );

    // Build Express app
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use('/api/students', studentRoutes);
});

afterAll(async () => {
    await db.close();
});

// ═══════════════════════════════════════════════
// AUTH TESTS
// ═══════════════════════════════════════════════

describe('POST /api/auth/register', () => {
    it('should register a new student successfully', async () => {
        const res = await request(app).post('/api/auth/register').send({
            email: 'student@test.com',
            password: 'password123',
            full_name: 'Test Student',
            phone: '01012345678',
        });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user.role).toBe('student');
        expect(res.body.user.email).toBe('student@test.com');

        studentToken = res.body.token;
        testStudentId = res.body.user.id;
    });

    it('should ALWAYS register as student even if role=admin is sent', async () => {
        const res = await request(app).post('/api/auth/register').send({
            email: 'hacker@test.com',
            password: 'password123',
            full_name: 'Hacker',
            role: 'admin', // 🔒 This should be ignored
        });

        expect(res.status).toBe(200);
        expect(res.body.user.role).toBe('student'); // NOT admin!
    });

    it('should reject duplicate email', async () => {
        const res = await request(app).post('/api/auth/register').send({
            email: 'student@test.com',
            password: 'password123',
            full_name: 'Duplicate',
        });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/already registered/i);
    });

    it('should reject missing required fields', async () => {
        const res = await request(app).post('/api/auth/register').send({
            email: 'nopass@test.com',
        });

        expect(res.status).toBe(400);
    });
});

describe('POST /api/auth/login', () => {
    it('should login existing user with correct password', async () => {
        const res = await request(app).post('/api/auth/login').send({
            email: 'student@test.com',
            password: 'password123',
        });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user.email).toBe('student@test.com');
        studentToken = res.body.token;
    });

    it('should login admin user', async () => {
        const res = await request(app).post('/api/auth/login').send({
            email: 'admin@test.com',
            password: 'admin123',
        });

        expect(res.status).toBe(200);
        expect(res.body.user.role).toBe('admin');
        adminToken = res.body.token;
    });

    it('should reject wrong password', async () => {
        const res = await request(app).post('/api/auth/login').send({
            email: 'student@test.com',
            password: 'wrongpassword',
        });

        expect(res.status).toBe(401);
        expect(res.body.error).toMatch(/invalid credentials/i);
    });

    it('should reject non-existent email', async () => {
        const res = await request(app).post('/api/auth/login').send({
            email: 'nobody@test.com',
            password: 'password123',
        });

        expect(res.status).toBe(401);
    });

    it('should reject missing credentials', async () => {
        const res = await request(app).post('/api/auth/login').send({});
        expect(res.status).toBe(400);
    });
});

describe('GET /api/auth/me', () => {
    it('should return current user profile with valid token', async () => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${studentToken}`);

        expect(res.status).toBe(200);
        expect(res.body.user).toHaveProperty('id');
        expect(res.body.user).toHaveProperty('email', 'student@test.com');
        expect(res.body.user).toHaveProperty('balance');
        expect(res.body.user).not.toHaveProperty('password_hash');
    });

    it('should reject request without token', async () => {
        const res = await request(app).get('/api/auth/me');
        expect(res.status).toBe(401);
    });

    it('should reject invalid token', async () => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', 'Bearer invalid_token_here');
        expect(res.status).toBe(401);
    });
});

// ═══════════════════════════════════════════════
// ENROLLMENT TESTS
// ═══════════════════════════════════════════════

describe('POST /api/students/enroll', () => {
    it('should fail enrollment with insufficient balance', async () => {
        const res = await request(app)
            .post('/api/students/enroll')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ course_id: testCourseId, price: 50, duration_days: 365 });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/insufficient/i);
    });

    it('should succeed after adding balance', async () => {
        // Give student some balance
        await db.run('UPDATE users SET balance = 100 WHERE id = ?', [testStudentId]);

        const res = await request(app)
            .post('/api/students/enroll')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ course_id: testCourseId, price: 50, duration_days: 365 });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        // Check balance was deducted
        const user = await db.get('SELECT balance FROM users WHERE id = ?', [testStudentId]);
        expect(user.balance).toBe(50);

        // Check wallet transaction was created
        const tx = await db.get('SELECT * FROM wallet_transactions WHERE student_id = ?', [testStudentId]);
        expect(tx.amount).toBe(-50);
        expect(tx.type).toBe('purchase');
    });

    it('should reject duplicate enrollment', async () => {
        const res = await request(app)
            .post('/api/students/enroll')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ course_id: testCourseId, price: 50 });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/already enrolled/i);
    });
});

describe('GET /api/students/:id/enrollments', () => {
    it('should return student enrollments', async () => {
        const res = await request(app)
            .get(`/api/students/${testStudentId}/enrollments`)
            .set('Authorization', `Bearer ${studentToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].courses).toHaveProperty('title', 'Test Math Course');
    });

    it('should forbid accessing another student enrollments', async () => {
        const res = await request(app)
            .get('/api/students/other-student-id/enrollments')
            .set('Authorization', `Bearer ${studentToken}`);

        expect(res.status).toBe(403);
    });
});

describe('POST /api/students/redeem', () => {
    it('should redeem a valid access code', async () => {
        // First remove existing enrollment to test code redemption
        await db.run('DELETE FROM enrollments WHERE student_id = ? AND course_id = ?', [testStudentId, testCourseId]);

        const res = await request(app)
            .post('/api/students/redeem')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ code: 'TESTCODE123' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.course_id).toBe(testCourseId);

        // Check code status changed
        const code = await db.get('SELECT status FROM access_codes WHERE code = ?', ['TESTCODE123']);
        expect(code.status).toBe('used');
    });

    it('should reject already-used code', async () => {
        const res = await request(app)
            .post('/api/students/redeem')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ code: 'TESTCODE123' });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/invalid or used/i);
    });

    it('should reject non-existent code', async () => {
        const res = await request(app)
            .post('/api/students/redeem')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ code: 'DOESNOTEXIST' });

        expect(res.status).toBe(400);
    });
});

// ═══════════════════════════════════════════════
// PROGRESS TESTS
// ═══════════════════════════════════════════════

describe('Student Progress', () => {
    let lessonId: number;

    beforeAll(async () => {
        // Create a unit + lesson for progress tracking
        const unitResult = await db.run('INSERT INTO units (course_id, title) VALUES (?, ?)', [testCourseId, 'Unit 1']);
        const lessonResult = await db.run('INSERT INTO lessons (unit_id, title) VALUES (?, ?)', [unitResult.lastID, 'Lesson 1']);
        lessonId = lessonResult.lastID!;
    });

    it('should mark a lesson as completed', async () => {
        const res = await request(app)
            .post('/api/students/progress')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ lesson_id: lessonId });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it('should return completed lessons', async () => {
        const res = await request(app)
            .get(`/api/students/${testStudentId}/progress`)
            .set('Authorization', `Bearer ${studentToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toContain(lessonId);
    });

    it('should handle duplicate completion gracefully (upsert)', async () => {
        const res = await request(app)
            .post('/api/students/progress')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ lesson_id: lessonId });

        expect(res.status).toBe(200); // should not crash
    });
});
