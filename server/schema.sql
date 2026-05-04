-- ═══════════════════════════════════════════════════════════
-- SQLite Schema for LMS Platform
-- ═══════════════════════════════════════════════════════════

-- ─── 1. Users ───
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- Generate UUID in Node.js
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
  grade TEXT,
  governorate TEXT,
  balance INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── 2. Courses ───
CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  short_desc TEXT,
  grade TEXT NOT NULL,
  term TEXT NOT NULL DEFAULT 'first',
  price INTEGER DEFAULT 0,
  original_price INTEGER DEFAULT 0,
  color TEXT DEFAULT 'from-violet-400 to-violet-600',
  thumbnail_url TEXT,
  is_featured INTEGER DEFAULT 0, -- BOOLEAN is INTEGER in SQLite (0/1)
  is_active INTEGER DEFAULT 1,
  deleted_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── 3. Enrollments ───
CREATE TABLE IF NOT EXISTS enrollments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  UNIQUE(student_id, course_id)
);

-- ─── 4. Access Codes ───
CREATE TABLE IF NOT EXISTS access_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'used', 'expired')),
  student_id TEXT REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  used_at DATETIME
);

-- ─── 5. Wallet Transactions ───
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'success',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── 6. Units ───
CREATE TABLE IF NOT EXISTS units (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  thumbnail_url TEXT,
  deleted_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── 7. Lessons ───
CREATE TABLE IF NOT EXISTS lessons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  unit_id INTEGER NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'video' CHECK (type IN ('video', 'pdf', 'quiz')),
  content_url TEXT,
  attachment_url TEXT,
  content TEXT,
  duration TEXT,
  sort_order INTEGER DEFAULT 0,
  thumbnail_url TEXT,
  allow_retake INTEGER DEFAULT 1,
  deleted_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── 8. Lesson Progress ───
CREATE TABLE IF NOT EXISTS lesson_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed INTEGER DEFAULT 0,
  completed_at DATETIME,
  UNIQUE(student_id, lesson_id)
);

-- ─── 9. Lesson Questions ───
CREATE TABLE IF NOT EXISTS lesson_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options TEXT NOT NULL DEFAULT '[]', -- JSON string
  correct_answer INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── 10. Student Questions ───
CREATE TABLE IF NOT EXISTS student_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  is_answered INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  answered_at DATETIME
);

-- ─── 11. Quizzes ───
CREATE TABLE IF NOT EXISTS quizzes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  duration INTEGER DEFAULT 30,
  scheduled_date TEXT,
  is_active INTEGER DEFAULT 1,
  allow_retake INTEGER DEFAULT 1,
  deleted_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── 12. Quiz Questions ───
CREATE TABLE IF NOT EXISTS quiz_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options TEXT NOT NULL DEFAULT '[]', -- JSON string
  correct_answer INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── 13. Quiz Results ───
CREATE TABLE IF NOT EXISTS quiz_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  answers TEXT DEFAULT '[]', -- JSON string
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── 14. Notifications ───
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'general',
  text TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── 15. Course Reviews ───
CREATE TABLE IF NOT EXISTS course_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(course_id, student_id)
);

-- ═══════════════════════════════════════════════════════════
-- Performance Indexes
-- ═══════════════════════════════════════════════════════════

-- Users: login lookups (email already has UNIQUE → implicit index)
-- Users: role-based filtering
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Enrollments: student → courses lookup & course → students lookup
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);

-- Access Codes: code redemption (code already UNIQUE → implicit index)
CREATE INDEX IF NOT EXISTS idx_access_codes_status ON access_codes(code, status);
CREATE INDEX IF NOT EXISTS idx_access_codes_course ON access_codes(course_id);

-- Wallet: student transaction history
CREATE INDEX IF NOT EXISTS idx_wallet_student ON wallet_transactions(student_id, created_at DESC);

-- Units: course curriculum listing (sorted)
CREATE INDEX IF NOT EXISTS idx_units_course ON units(course_id, sort_order);

-- Lessons: unit lessons listing (sorted)
CREATE INDEX IF NOT EXISTS idx_lessons_unit ON lessons(unit_id, sort_order);

-- Lesson Progress: the hottest query — student×lesson completion checks
CREATE INDEX IF NOT EXISTS idx_progress_student ON lesson_progress(student_id, completed);
CREATE INDEX IF NOT EXISTS idx_progress_lesson ON lesson_progress(lesson_id);

-- Quiz Results: student results lookup & analytics aggregation
CREATE INDEX IF NOT EXISTS idx_qresults_student ON quiz_results(student_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_qresults_quiz ON quiz_results(quiz_id, student_id);
CREATE INDEX IF NOT EXISTS idx_qresults_lesson ON quiz_results(lesson_id, student_id);

-- Notifications: user feed (sorted by newest)
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- Student Questions: lesson Q&A feed
CREATE INDEX IF NOT EXISTS idx_questions_lesson ON student_questions(lesson_id, student_id);

-- Course Reviews: course reviews listing
CREATE INDEX IF NOT EXISTS idx_reviews_course ON course_reviews(course_id);

-- Quizzes: course exams listing
CREATE INDEX IF NOT EXISTS idx_quizzes_course ON quizzes(course_id, deleted_at);

-- Courses: active courses filter
CREATE INDEX IF NOT EXISTS idx_courses_active ON courses(is_active, deleted_at);
