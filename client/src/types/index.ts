/* ═══════════════════════════════════════════════════
   Shared TypeScript Types — LMS Platform
   ═══════════════════════════════════════════════════
   
   Defines all data models, API payloads, and component props
   used across the application. Import from '@/types'.
   ═══════════════════════════════════════════════════ */

// ─── Database Models ─────────────────────────────────────────

export interface User {
  id: string
  email: string
  full_name: string
  phone?: string | null
  avatar_url?: string | null
  role: 'admin' | 'student'
  grade?: string | null
  governorate?: string | null
  balance: number
  created_at: string
}

export interface Course {
  id: number
  title: string
  description?: string | null
  short_desc?: string | null
  grade: string
  term: 'first' | 'second'
  price: number
  original_price: number
  color?: string | null
  thumbnail_url?: string | null
  is_featured: 0 | 1
  is_active: 0 | 1
  deleted_at?: string | null
  created_at: string
  updated_at: string
}

export interface Enrollment {
  id: number
  student_id: string
  course_id: number
  enrolled_at: string
  expires_at?: string | null
  courses?: Pick<Course, 'title' | 'grade' | 'thumbnail_url'>
}

export interface Unit {
  id: number
  course_id: number
  title: string
  sort_order: number
  thumbnail_url?: string | null
  deleted_at?: string | null
  created_at: string
  lessons?: Lesson[]
}

export interface Lesson {
  id: number
  unit_id: number
  title: string
  type: 'video' | 'pdf' | 'quiz'
  content_url?: string | null
  attachment_url?: string | null
  content?: string | null
  duration?: string | null
  sort_order: number
  thumbnail_url?: string | null
  allow_retake: 0 | 1
  deleted_at?: string | null
  created_at: string
}

export interface LessonQuestion {
  id: number
  lesson_id: number
  question: string
  options: string[]
  correct_answer: number
  sort_order: number
}

export interface Quiz {
  id: number
  title: string
  course_id: number
  duration: number
  scheduled_date?: string | null
  is_active: 0 | 1
  allow_retake: 0 | 1
  deleted_at?: string | null
  created_at: string
  courses?: { title: string }
}

export interface QuizQuestion {
  id: number
  quiz_id: number
  question: string
  options: string[]
  correct_answer: number
  sort_order: number
}

export interface QuizResult {
  id: number
  student_id: string
  quiz_id?: number | null
  lesson_id?: number | null
  score: number
  total: number
  answers: any[]
  submitted_at: string
  lessons?: { title: string; type: string } | null
  quizzes?: { title: string } | null
}

export interface AccessCode {
  id: number
  code: string
  course_id: number
  status: 'available' | 'used' | 'expired'
  student_id?: string | null
  created_at: string
  used_at?: string | null
}

export interface WalletTransaction {
  id: number
  student_id: string
  type: string
  amount: number
  details?: string | null
  status: string
  created_at: string
}

export interface Notification {
  id: number
  user_id: string
  type: string
  text: string
  is_read: 0 | 1
  created_at: string
}

export interface CourseReview {
  id: number
  course_id: number
  student_id: string
  rating: 1 | 2 | 3 | 4 | 5
  comment?: string | null
  created_at: string
  profiles?: { full_name: string; grade?: string }
}

export interface StudentQuestion {
  id: number
  lesson_id: number
  student_id: string
  question: string
  answer?: string | null
  is_answered: 0 | 1
  created_at: string
  answered_at?: string | null
  full_name?: string
}

// ─── Analytics Models ────────────────────────────────────────

export interface StudentAnalytics {
  id: string
  full_name: string
  email: string
  grade?: string
  enrolled_at: string
  progress: number
  quiz_avg: number
  exams: ExamResult[]
}

export interface ExamResult {
  quiz_id: number
  title: string
  score: number
  total: number
  percentage: number
}

// ─── API Payloads ────────────────────────────────────────────

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  full_name: string
  phone?: string
  grade?: string
  governorate?: string
}

export interface EnrollPayload {
  course_id: number
  price: number
  duration_days?: number
}

export interface RedeemPayload {
  code: string
}

export interface SubmitQuizPayload {
  student_id?: string
  quiz_id?: number | null
  lesson_id?: number | null
  score: number
  total: number
  answers: any[]
}

// ─── Auth Context ────────────────────────────────────────────

export interface AuthContextType {
  user: User | null
  profile: User | null
  setProfile: (profile: User | null) => void
  loading: boolean
  authError: string | null
  signIn: (email: string, password: string) => Promise<{ data: any; error: string | null }>
  signUp: (userData: RegisterPayload) => Promise<{ data: any; error: string | null }>
  signOut: () => Promise<void>
}

// ─── Course with Curriculum ──────────────────────────────────

export interface CourseWithCurriculum extends Course {
  curriculum: Unit[]
}

// ─── Grade Option ────────────────────────────────────────────

export interface GradeOption {
  value: string
  label: string
}
