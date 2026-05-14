import { Router } from 'express';
import { getDb } from '../config/db';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCourseSchema, createUnitSchema, createLessonSchema, reviewSchema } from '../validators/courses';
import { notifyClients } from '../utils/sse';

const router = Router();

const ALLOWED_COURSE_UPDATES = [
    'title', 'description', 'short_desc', 'grade', 'term', 'price',
    'original_price', 'color', 'thumbnail_url', 'is_featured', 'is_active'
];

const ALLOWED_UNIT_UPDATES = [
    'title', 'sort_order', 'thumbnail_url'
];

const ALLOWED_LESSON_UPDATES = [
    'title', 'type', 'content_url', 'attachment_url', 'content',
    'duration', 'sort_order', 'thumbnail_url', 'allow_retake'
];

// --- Courses ---

// Fetch all active courses
router.get('/', async (req, res) => {
    try {
        const db = await getDb();
        const courses = await db.all(
            'SELECT * FROM courses WHERE deleted_at IS NULL ORDER BY created_at DESC'
        );
        res.json(courses);
    } catch (error) {
        console.error('fetchCourses error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Fetch single course by ID
router.get('/:id', async (req, res) => {
    try {
        const db = await getDb();
        const course = await db.get(
            'SELECT * FROM courses WHERE id = ? AND deleted_at IS NULL',
            [req.params.id]
        );
        if (!course) return res.status(404).json({ error: 'Course not found' });
        res.json(course);
    } catch (error) {
        console.error('fetchCourseById error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Fetch course with curriculum
router.get('/:id/curriculum', async (req, res) => {
    try {
        const db = await getDb();
        
        // Fetch course
        const course = await db.get('SELECT * FROM courses WHERE id = ?', [req.params.id]);
        if (!course) return res.status(404).json({ error: 'Course not found' });

        // Fetch units for this course
        const units = await db.all('SELECT * FROM units WHERE course_id = ? ORDER BY sort_order ASC', [req.params.id]);
        
        // Fetch lessons for all these units
        const unitIds = units.map(u => u.id);
        let lessons: any[] = [];
        if (unitIds.length > 0) {
            const placeholders = unitIds.map(() => '?').join(',');
            lessons = await db.all(`SELECT * FROM lessons WHERE unit_id IN (${placeholders}) ORDER BY sort_order ASC`, unitIds);
        }

        // Map lessons to units
        const curriculum = units.map(unit => ({
            ...unit,
            lessons: lessons.filter(l => l.unit_id === unit.id)
        }));

        res.json({ ...course, curriculum });
    } catch (error) {
        console.error('fetchCourseWithCurriculum error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create a new course (Admin only)
router.post('/', authenticate, requireRole('admin'), validate(createCourseSchema), async (req, res) => {
    try {
        const db = await getDb();
        const { title, description, short_desc, grade, term, price, original_price, color, thumbnail_url, is_featured, is_active } = req.body;
        
        const result = await db.run(
            `INSERT INTO courses (title, description, short_desc, grade, term, price, original_price, color, thumbnail_url, is_featured, is_active) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, description, short_desc, grade, term || 'first', price || 0, original_price || 0, color, thumbnail_url, is_featured ? 1 : 0, is_active !== false ? 1 : 0]
        );
        
        const newCourse = await db.get('SELECT * FROM courses WHERE id = ?', [result.lastID]);
        notifyClients('courses');
        res.status(201).json(newCourse);
    } catch (error) {
        console.error('createCourse error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update a course (Admin only)
router.put('/:id', authenticate, requireRole('admin'), async (req, res) => {
    try {
        const db = await getDb();
        const updates = req.body;
        
        // Dynamic query builder
        const keys = Object.keys(updates).filter(k => ALLOWED_COURSE_UPDATES.includes(k));
        if (keys.length === 0) return res.status(400).json({ error: 'No fields to update' });
        
        // Add updated_at
        keys.push('updated_at');
        updates.updated_at = new Date().toISOString();

        const setClause = keys.map(k => `${k} = ?`).join(', ');
        const values = keys.map(k => updates[k]);
        values.push(req.params.id);

        await db.run(`UPDATE courses SET ${setClause} WHERE id = ?`, values);
        
        const updatedCourse = await db.get('SELECT * FROM courses WHERE id = ?', [req.params.id]);
        notifyClients('courses');
        res.json(updatedCourse);
    } catch (error) {
        console.error('updateCourse error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Soft delete a course (Admin only)
router.delete('/:id', authenticate, requireRole('admin'), async (req, res) => {
    try {
        const db = await getDb();
        await db.run(
            'UPDATE courses SET deleted_at = ?, is_active = 0 WHERE id = ?',
            [new Date().toISOString(), req.params.id]
        );
        notifyClients('courses');
        res.json({ success: true });
    } catch (error) {
        console.error('deleteCourse error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Restore a course (Admin only)
router.put('/:id/restore', authenticate, requireRole('admin'), async (req, res) => {
    try {
        const db = await getDb();
        await db.run(
            'UPDATE courses SET deleted_at = NULL, is_active = 1 WHERE id = ?',
            [req.params.id]
        );
        notifyClients('courses');
        res.json({ success: true });
    } catch (error) {
        console.error('restoreCourse error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- Units ---

// Fetch units for a course
router.get('/:courseId/units', async (req, res) => {
    try {
        const db = await getDb();
        const units = await db.all('SELECT * FROM units WHERE course_id = ? ORDER BY sort_order ASC', [req.params.courseId]);
        res.json(units);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Create a unit (Admin only)
router.post('/:courseId/units', authenticate, requireRole('admin'), validate(createUnitSchema), async (req, res) => {
    try {
        const db = await getDb();
        const { title, sort_order, thumbnail_url } = req.body;
        const result = await db.run(
            'INSERT INTO units (course_id, title, sort_order, thumbnail_url) VALUES (?, ?, ?, ?)',
            [req.params.courseId, title, sort_order || 0, thumbnail_url]
        );
        const newUnit = await db.get('SELECT * FROM units WHERE id = ?', [result.lastID]);
        notifyClients('courses');
        res.status(201).json(newUnit);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update a unit (Admin only)
router.put('/units/:unitId', authenticate, requireRole('admin'), async (req, res) => {
    try {
        const db = await getDb();
        const updates = req.body;
        const keys = Object.keys(updates).filter(k => ALLOWED_UNIT_UPDATES.includes(k));
        if (keys.length === 0) return res.status(400).json({ error: 'No fields to update' });

        const setClause = keys.map(k => `${k} = ?`).join(', ');
        const values = keys.map(k => updates[k]);
        values.push(req.params.unitId);

        await db.run(`UPDATE units SET ${setClause} WHERE id = ?`, values);
        const updated = await db.get(`SELECT * FROM ${req.path.includes('units') ? 'units' : 'lessons'} WHERE id = ?`, [req.params.unitId || req.params.lessonId]);
        notifyClients('courses');
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete a unit (Admin only)
router.delete('/units/:unitId', authenticate, requireRole('admin'), async (req, res) => {
    try {
        const db = await getDb();
        await db.run('UPDATE units SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [req.params.unitId]);
        notifyClients('courses');
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// --- Lessons ---

// Fetch lessons for a unit
router.get('/units/:unitId/lessons', async (req, res) => {
    try {
        const db = await getDb();
        const lessons = await db.all('SELECT * FROM lessons WHERE unit_id = ? ORDER BY sort_order ASC', [req.params.unitId]);
        res.json(lessons);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Create a lesson (Admin only)
router.post('/units/:unitId/lessons', authenticate, requireRole('admin'), validate(createLessonSchema), async (req, res) => {
    try {
        const db = await getDb();
        const { title, type, content_url, attachment_url, content, duration, sort_order, thumbnail_url, allow_retake } = req.body;
        const result = await db.run(
            `INSERT INTO lessons (unit_id, title, type, content_url, attachment_url, content, duration, sort_order, thumbnail_url, allow_retake) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.params.unitId, title, type || 'video', content_url, attachment_url, content, duration, sort_order || 0, thumbnail_url, allow_retake !== false ? 1 : 0]
        );
        const newLesson = await db.get('SELECT * FROM lessons WHERE id = ?', [result.lastID]);
        res.status(201).json(newLesson);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update a lesson (Admin only)
router.put('/lessons/:lessonId', authenticate, requireRole('admin'), async (req, res) => {
    try {
        const db = await getDb();
        const updates = req.body;
        const keys = Object.keys(updates).filter(k => ALLOWED_LESSON_UPDATES.includes(k));
        if (keys.length === 0) return res.status(400).json({ error: 'No fields to update' });

        const setClause = keys.map(k => `${k} = ?`).join(', ');
        const values = keys.map(k => updates[k]);
        values.push(req.params.lessonId);

        await db.run(`UPDATE lessons SET ${setClause} WHERE id = ?`, values);
        const updatedLesson = await db.get('SELECT * FROM lessons WHERE id = ?', [req.params.lessonId]);
        res.json(updatedLesson);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete a lesson (Admin only)
router.delete('/lessons/:lessonId', authenticate, requireRole('admin'), async (req, res) => {
    try {
        const db = await getDb();
        await db.run('UPDATE lessons SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [req.params.lessonId]);
        notifyClients('courses');
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update lesson orders (Admin only)
router.post('/lessons/reorder', authenticate, requireRole('admin'), async (req, res) => {
    try {
        const db = await getDb();
        const { lessons } = req.body; // array of {id, sort_order}
        
        await db.exec('BEGIN TRANSACTION');
        for (const lesson of lessons) {
            await db.run('UPDATE lessons SET sort_order = ? WHERE id = ?', [lesson.sort_order, lesson.id]);
        }
        await db.exec('COMMIT');
        
        notifyClients('courses');
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Fetch full lesson with its course context
router.get('/lessons/:lessonId/context', async (req, res) => {
    try {
        const db = await getDb();
        
        const lesson = await db.get('SELECT * FROM lessons WHERE id = ?', [req.params.lessonId]);
        if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
        
        const unit = await db.get('SELECT * FROM units WHERE id = ?', [lesson.unit_id]);
        const course = await db.get('SELECT * FROM courses WHERE id = ?', [unit.course_id]);
        
        const allUnits = await db.all('SELECT * FROM units WHERE course_id = ? ORDER BY sort_order ASC', [course.id]);
        
        const unitIds = allUnits.map(u => u.id);
        let allLessons: any[] = [];
        if (unitIds.length > 0) {
            const placeholders = unitIds.map(() => '?').join(',');
            allLessons = await db.all(`SELECT * FROM lessons WHERE unit_id IN (${placeholders}) ORDER BY sort_order ASC`, unitIds);
        }

        const curriculum = allUnits.map(u => ({
            ...u,
            lessons: allLessons.filter(l => l.unit_id === u.id)
        }));
        
        res.json({ lesson, course, curriculum });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// --- Reviews ---
router.get('/:courseId/reviews', async (req, res) => {
    try {
        const db = await getDb();
        const reviews = await db.all(`
            SELECT cr.*, u.full_name, u.grade 
            FROM course_reviews cr 
            JOIN users u ON cr.student_id = u.id 
            WHERE cr.course_id = ? 
            ORDER BY cr.created_at DESC
        `, [req.params.courseId]);
        
        // Re-map to match frontend expectation (profiles object)
        const formattedReviews = reviews.map(r => ({
            ...r,
            profiles: { full_name: r.full_name, grade: r.grade }
        }));
        res.json(formattedReviews);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/:courseId/reviews', authenticate, validate(reviewSchema), async (req, res) => {
    try {
        const db = await getDb();
        const { rating, comment } = req.body;
        const studentId = req.user.id;
        
        const result = await db.run(
            'INSERT INTO course_reviews (course_id, student_id, rating, comment) VALUES (?, ?, ?, ?)',
            [req.params.courseId, studentId, rating, comment]
        );
        const review = await db.get('SELECT * FROM course_reviews WHERE id = ?', [result.lastID]);
        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
