-- ═══════════════════════════════════════════════════
-- Migration 002: Performance Indexes
-- Adds indexes for all major query patterns
-- ═══════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_access_codes_status ON access_codes(code, status);
CREATE INDEX IF NOT EXISTS idx_access_codes_course ON access_codes(course_id);
CREATE INDEX IF NOT EXISTS idx_wallet_student ON wallet_transactions(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_units_course ON units(course_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_lessons_unit ON lessons(unit_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_progress_student ON lesson_progress(student_id, completed);
CREATE INDEX IF NOT EXISTS idx_progress_lesson ON lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_qresults_student ON quiz_results(student_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_qresults_quiz ON quiz_results(quiz_id, student_id);
CREATE INDEX IF NOT EXISTS idx_qresults_lesson ON quiz_results(lesson_id, student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_lesson ON student_questions(lesson_id, student_id);
CREATE INDEX IF NOT EXISTS idx_reviews_course ON course_reviews(course_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_course ON quizzes(course_id, deleted_at);
CREATE INDEX IF NOT EXISTS idx_courses_active ON courses(is_active, deleted_at);
