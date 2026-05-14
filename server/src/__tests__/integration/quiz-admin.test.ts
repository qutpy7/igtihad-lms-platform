/**
 * ═══════════════════════════════════════════════
 * Integration Tests — Quiz Submission & Admin CRUD
 * ═══════════════════════════════════════════════
 * 
 * Tests:
 * 1. Quiz creation → Add questions → Submit results
 * 2. Admin: Dashboard → Generate codes → Send notifications
 */

import request from 'supertest';
import express from 'express';
import { open, Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';

let db: Database<sqlite3.Database, sqlite3.Statement>;
let app: express.Express;
let adminToken: string;
let studentToken: string;
let testCourseId: number;
let testQuizId: number;
let testStudentId: string;

// Mock DB
jest.mock('../../config/db', () => ({
    getDb: jest.fn(async () => db),
}));

// Mock rate limiter
jest.mock('../../middleware/rateLimiter', () => ({
    loginLimiter: (req: any, res: any, next: any) => next(),
    globalLimiter: (req: any, res: any, next: any) => next(),
    uploadLimiter: (req: any, res: any, next: any) => next(),
}));

import authRoutes from '../../routes/auth';
import quizRoutes from '../../routes/quizzes';
import adminRoutes from '../../routes/admin';
import studentRoutes from '../../routes/students';
jest.mock('../../utils/sse', () => ({
    sseMiddleware: jest.fn((req, res, next) => next()),
    notifyClients: jest.fn()
}));


beforeAll(async () => {
    db = await open({ filename: ':memory:', driver: sqlite3.Database });
    await db.exec('PRAGMA foreign_keys = ON;');

    // Create schema
    await db.exec(`
        CREATE TABLE users (
            id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL, full_name TEXT NOT NULL,
            phone TEXT, avatar_url TEXT,
            role TEXT NOT NULL DEFAULT 'student', grade TEXT, governorate TEXT,
            balance INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
            student_id TEXT NOT NULL, course_id INTEGER NOT NULL,
            enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP, expires_at DATETIME,
            UNIQUE(student_id, course_id)
        );
        CREATE TABLE units (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_id INTEGER NOT NULL, title TEXT NOT NULL,
            sort_order INTEGER DEFAULT 0, thumbnail_url TEXT, deleted_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE lessons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            unit_id INTEGER NOT NULL, title TEXT NOT NULL,
            type TEXT DEFAULT 'video', content_url TEXT, attachment_url TEXT,
            content TEXT, duration TEXT, sort_order INTEGER DEFAULT 0,
            thumbnail_url TEXT, allow_retake INTEGER DEFAULT 1,
            deleted_at DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE quizzes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL, course_id INTEGER NOT NULL,
            duration INTEGER DEFAULT 30, scheduled_date TEXT,
            is_active INTEGER DEFAULT 1, allow_retake INTEGER DEFAULT 1,
            deleted_at DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE quiz_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            quiz_id INTEGER NOT NULL, question TEXT NOT NULL,
            options TEXT DEFAULT '[]', correct_answer INTEGER DEFAULT 0,
            sort_order INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE quiz_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT NOT NULL, quiz_id INTEGER, lesson_id INTEGER,
            score INTEGER DEFAULT 0, total INTEGER DEFAULT 0,
            answers TEXT DEFAULT '[]', submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE lesson_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lesson_id INTEGER NOT NULL, question TEXT NOT NULL,
            options TEXT DEFAULT '[]', correct_answer INTEGER DEFAULT 0,
            sort_order INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE lesson_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT NOT NULL, lesson_id INTEGER NOT NULL,
            completed INTEGER DEFAULT 0, completed_at DATETIME,
            UNIQUE(student_id, lesson_id)
        );
        CREATE TABLE access_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL, course_id INTEGER NOT NULL,
            status TEXT DEFAULT 'available', student_id TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP, used_at DATETIME
        );
        CREATE TABLE notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL, type TEXT DEFAULT 'general',
            text TEXT NOT NULL, is_read INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE wallet_transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT NOT NULL, type TEXT NOT NULL, amount INTEGER NOT NULL,
            details TEXT, status TEXT DEFAULT 'success',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE student_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lesson_id INTEGER NOT NULL, student_id TEXT NOT NULL,
            question TEXT NOT NULL, answer TEXT, is_answered INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP, answered_at DATETIME
        );
        CREATE TABLE course_reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_id INTEGER NOT NULL, student_id TEXT NOT NULL,
            rating INTEGER NOT NULL, comment TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(course_id, student_id)
        );
    `);

    // Seed data
    const adminHash = await bcrypt.hash('admin123', 10);
    const studentHash = await bcrypt.hash('student123', 10);
    testStudentId = 'student-quiz-001';

    await db.run(`INSERT INTO users (id, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)`,
        ['admin-quiz-001', 'quizadmin@test.com', adminHash, 'Quiz Admin', 'admin']);
    await db.run(`INSERT INTO users (id, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)`,
        [testStudentId, 'quizstudent@test.com', studentHash, 'Quiz Student', 'student']);

    const courseResult = await db.run(`INSERT INTO courses (title, grade, price) VALUES (?, ?, ?)`,
        ['Quiz Test Course', 'prep_1', 0]);
    testCourseId = courseResult.lastID!;

    // Enroll student
    await db.run(`INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)`,
        [testStudentId, testCourseId]);

    // Build Express app
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use('/api/quizzes', quizRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/students', studentRoutes);
});

afterAll(async () => {
    await db.close();
});

// ═══════════════════════════════════════════════
// Setup: Get tokens
// ═══════════════════════════════════════════════

describe('Setup: Authentication', () => {
    it('should get admin token', async () => {
        const res = await request(app).post('/api/auth/login').send({
            email: 'quizadmin@test.com', password: 'admin123',
        });
        expect(res.status).toBe(200);
        adminToken = res.body.token;
    });

    it('should get student token', async () => {
        const res = await request(app).post('/api/auth/login').send({
            email: 'quizstudent@test.com', password: 'student123',
        });
        expect(res.status).toBe(200);
        studentToken = res.body.token;
    });
});

// ═══════════════════════════════════════════════
// QUIZ TESTS
// ═══════════════════════════════════════════════

describe('Quiz CRUD', () => {
    it('should create a quiz (admin)', async () => {
        const res = await request(app)
            .post('/api/quizzes')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ title: 'Final Exam', course_id: testCourseId, duration: 45 });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        testQuizId = res.body.id;
    });

    it('should add questions to quiz', async () => {
        const res = await request(app)
            .post(`/api/quizzes/${testQuizId}/questions`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                question: 'ما هي عاصمة مصر؟',
                options: ['القاهرة', 'الإسكندرية', 'أسوان', 'الجيزة'],
                correct_answer: 0,
            });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
    });

    it('should fetch quiz questions', async () => {
        const res = await request(app)
            .get(`/api/quizzes/${testQuizId}/questions`)
            .set('Authorization', `Bearer ${studentToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(1);
        expect(res.body[0].question).toBe('ما هي عاصمة مصر؟');
    });
});

describe('Quiz Result Submission', () => {
    it('should submit quiz results', async () => {
        const res = await request(app)
            .post('/api/quizzes/results')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({
                student_id: testStudentId,
                quiz_id: testQuizId,
                score: 8,
                total: 10,
                answers: [0, 1, 0, 2],
            });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
    });

    it('should fetch student quiz results', async () => {
        const res = await request(app)
            .get(`/api/quizzes/results/student/${testStudentId}`)
            .set('Authorization', `Bearer ${studentToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].score).toBe(8);
        expect(res.body[0].total).toBe(10);
    });

    it('should reject result without required fields', async () => {
        const res = await request(app)
            .post('/api/quizzes/results')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ score: 5 }); // missing total

        expect(res.status).toBe(400);
    });
});

// ═══════════════════════════════════════════════
// ADMIN TESTS
// ═══════════════════════════════════════════════

describe('Admin Dashboard', () => {
    it('should return dashboard stats', async () => {
        const res = await request(app)
            .get('/api/admin/dashboard')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('totalStudents');
        expect(res.body).toHaveProperty('activeCourses');
        expect(res.body).toHaveProperty('totalRevenue');
    });

    it('should reject dashboard for students', async () => {
        const res = await request(app)
            .get('/api/admin/dashboard')
            .set('Authorization', `Bearer ${studentToken}`);

        expect(res.status).toBe(403);
    });
});

describe('Admin Code Generation', () => {
    it('should generate access codes', async () => {
        const res = await request(app)
            .post('/api/admin/codes/generate')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ course_id: testCourseId, count: 3 });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.generatedCodes).toHaveLength(3);
        expect(res.body.generatedCodes[0]).toMatch(/^IGT-/);
    });

    it('should reject code generation without course_id', async () => {
        const res = await request(app)
            .post('/api/admin/codes/generate')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ count: 5 });

        expect(res.status).toBe(400);
    });

    it('should list all codes', async () => {
        const res = await request(app)
            .get('/api/admin/codes')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(3);
    });

    it('should delete a code', async () => {
        const codesRes = await request(app)
            .get('/api/admin/codes')
            .set('Authorization', `Bearer ${adminToken}`);

        const codeToDelete = codesRes.body[0].id;

        const res = await request(app)
            .delete(`/api/admin/codes/${codeToDelete}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
});

describe('Admin Notifications', () => {
    it('should send notification to all students', async () => {
        const res = await request(app)
            .post('/api/admin/notifications/send')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                course_id: 'all',
                type: 'general',
                text: 'مرحباً بكم في المنصة!',
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.count).toBeGreaterThan(0);
    });

    it('should send notification to specific course students', async () => {
        const res = await request(app)
            .post('/api/admin/notifications/send')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                course_id: testCourseId,
                type: 'exam',
                text: 'امتحان جديد متاح!',
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it('should reject notification without text', async () => {
        const res = await request(app)
            .post('/api/admin/notifications/send')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ course_id: 'all', type: 'general' });

        expect(res.status).toBe(400);
    });
});
