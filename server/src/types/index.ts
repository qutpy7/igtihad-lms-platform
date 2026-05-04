export interface Profile {
  id: string
  full_name: string
  email?: string
  phone?: string
  avatar_url?: string
  role: 'admin' | 'student'
  grade?: string
  governorate?: string
  balance: number
  created_at: string
}

export interface Course {
  id: number
  title: string
  description?: string
  short_desc?: string
  grade: string
  term: string
  price: number
  original_price?: number
  color?: string
  cover_url?: string
  is_featured: boolean
  is_active: boolean
  deleted_at?: string | null
  created_at: string
  updated_at: string
}

export interface Unit {
  id: number
  course_id: number
  title: string
  sort_order: number
  thumbnail_url?: string
  created_at: string
  lessons?: Lesson[]
}

export interface Lesson {
  id: number
  unit_id: number
  title: string
  type: 'video' | 'pdf' | 'quiz'
  content_url?: string
  attachment_url?: string
  content?: string
  duration?: string
  sort_order: number
  thumbnail_url?: string
  created_at: string
}

export interface LessonQuestion {
  id: number
  lesson_id: number
  question: string
  options: string[]
  correct_answer: number
  sort_order: number
  created_at: string
}

export interface Quiz {
  id: number
  title: string
  course_id: number
  duration: number
  scheduled_date?: string
  is_active: boolean
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
  created_at: string
}

export interface QuizResult {
  id: number
  student_id: string
  quiz_id?: number
  lesson_id?: number
  score: number
  total: number
  answers: any[]
  submitted_at: string
}

export interface Enrollment {
  id: number
  student_id: string
  course_id: number
  enrolled_at: string
  courses?: Course
}

export interface LessonProgress {
  id: number
  student_id: string
  lesson_id: number
  completed: boolean
  completed_at?: string
}

export interface AccessCode {
  id: number
  code: string
  course_id: number
  status: 'available' | 'used' | 'expired'
  student_id?: string
  created_at: string
  used_at?: string
  courses?: { title: string }
  profiles?: { full_name: string }
}

export interface Notification {
  id: number
  user_id: string
  type: string
  text: string
  is_read: boolean
  created_at: string
}

export interface WalletTransaction {
  id: number
  student_id: string
  type: 'deposit' | 'purchase' | 'refund'
  amount: number
  details: string
  status: 'success' | 'pending' | 'failed'
  created_at: string
}

export interface CourseReview {
  id: number
  course_id: number
  student_id: string
  rating: number
  comment?: string
  created_at: string
  profiles?: { full_name: string; grade?: string }
  courses?: { title: string }
}

export interface StudentQuestion {
  id: number
  lesson_id: number
  student_id: string
  question: string
  answer?: string
  is_answered: boolean
  created_at: string
  answered_at?: string
  profiles?: { full_name: string }
  lessons?: { title: string; course_id: number; courses?: { title: string } }
}

export interface SiteSetting {
  key: string
  value: any
  updated_at: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
