import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth';
import studentRoutes from './routes/students';
import courseRoutes from './routes/courses';
import adminRoutes from './routes/admin';
import quizRoutes from './routes/quizzes';
import uploadRoutes from './routes/upload';
import settingsRoutes from './routes/settings';
import { sseMiddleware } from './utils/sse';
import { logger, httpLogger } from './utils/logger';
import path from 'path';

const app = express();
const port = process.env.PORT || 5000;
const isDev = process.env.NODE_ENV !== 'production';

// Middleware
// 🔒 Security Fix: Restrict CORS to allowed origins only
const allowedOrigins = [
    'http://localhost:5173',   // Vite dev server
    'http://localhost:4173',   // Vite preview
    'http://localhost:3000',   // Alternative dev port
    process.env.CLIENT_URL,    // Production frontend URL (set in .env)
].filter(Boolean) as string[];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, server-to-server)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
    },
    credentials: true,
}));

// 📊 Structured HTTP request logging (Winston)
app.use(httpLogger);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'LMS Platform API is running' });
});

// Public Settings & Stats
import { getDb } from './config/db';


app.get('/api/public/stats', async (req, res) => {
    try {
        const db = await getDb();
        const studentsRow = await db.get("SELECT count(*) as count FROM users WHERE role = 'student'");
        const coursesRow = await db.get("SELECT count(*) as count FROM courses WHERE is_active = 1 AND deleted_at IS NULL");
        res.json({
            totalStudents: studentsRow?.count || 0,
            activeCourses: coursesRow?.count || 0
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/public/reviews', async (req, res) => {
    try {
        const db = await getDb();
        const reviews = await db.all(`
            SELECT cr.*, u.full_name, u.grade 
            FROM course_reviews cr 
            JOIN users u ON cr.student_id = u.id 
            WHERE cr.rating >= 4
            ORDER BY cr.created_at DESC LIMIT 10
        `);
        res.json(reviews.map(r => ({
            ...r,
            profiles: { full_name: r.full_name, grade: r.grade }
        })));
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', settingsRoutes);

// Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error(err.message, { stack: err.stack, status: err.status });
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
    });
});

// Only listen if not running in a serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.NETLIFY) {
    app.listen(Number(port), '0.0.0.0', () => {
        logger.info(`🚀 Server is running on http://0.0.0.0:${port}`);
    });
}

export { app };
