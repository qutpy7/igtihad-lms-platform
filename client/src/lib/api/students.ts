/* ═══════════════════════════════════════════════════
   api/students.ts — Student Profiles, Enrollments, Progress (TypeScript)
   ═══════════════════════════════════════════════════ */
import { apiClient } from '../api-client'
import type { User, Enrollment, StudentQuestion, WalletTransaction } from '../../types'

// ─── Profiles ──────────────────────────────────────────────────
export async function fetchStudents(): Promise<User[]> {
  const { data } = await apiClient.get('/students')
  return data
}

export async function fetchAdmins(): Promise<User[]> {
  const { data } = await apiClient.get('/students/admins')
  return data
}

export async function updateProfile(userId: string, updates: Partial<User>): Promise<User> {
  const { data } = await apiClient.put(`/students/profile/${userId}`, updates)
  return data
}

// ─── Enrollments ───────────────────────────────────────────────
export async function fetchEnrollments(studentId: string): Promise<Enrollment[]> {
  const { data } = await apiClient.get(`/students/${studentId}/enrollments`)
  return data
}

export async function checkEnrollment(studentId: string, courseId: number): Promise<{ enrolled: boolean }> {
  const { data } = await apiClient.get(`/students/${studentId}/enrollments/${courseId}/check`)
  return data
}

export async function enrollCourse(studentId: string, courseId: number, price: number, durationDays: number = 365): Promise<{ success: boolean }> {
  const { data } = await apiClient.post('/students/enroll', { course_id: courseId, price, duration_days: durationDays })
  return data
}

// ─── Student Progress ──────────────────────────────────────────
export async function fetchStudentProgress(studentId: string): Promise<number[]> {
  const { data } = await apiClient.get(`/students/${studentId}/progress`)
  return data
}

export async function markLessonCompleted(studentId: string, lessonId: number): Promise<void> {
  await apiClient.post('/students/progress', { lesson_id: lessonId })
}

export async function fetchStudentProgressByCourse(studentId: string): Promise<Record<number, number>> {
  const { data } = await apiClient.get(`/students/${studentId}/progress-by-course`)
  return data
}

export async function fetchAnalytics(courseId: number): Promise<any[]> {
  const { data } = await apiClient.get(`/students/analytics/${courseId}`)
  return data
}

// ─── Student Q&A ───────────────────────────────────────────────
export async function fetchLessonQuestionsQA(lessonId: number): Promise<StudentQuestion[]> {
  const { data } = await apiClient.get(`/students/qa/lesson/${lessonId}`)
  return data
}

export async function askStudentQuestion(questionData: { lesson_id: number; question: string }): Promise<StudentQuestion> {
  const { data } = await apiClient.post('/students/qa', questionData)
  return data
}

export async function fetchAllStudentQuestions(): Promise<StudentQuestion[]> {
  const { data } = await apiClient.get('/students/qa/all')
  return data
}

export async function answerStudentQuestion(id: number, answer: string): Promise<StudentQuestion> {
  const { data } = await apiClient.put(`/students/qa/${id}/answer`, { answer })
  return data
}

export async function deleteStudentQuestion(id: number): Promise<void> {
  await apiClient.delete(`/students/qa/${id}`)
}

// ─── Wallet & Transactions ────────────────────────────────────
export async function fetchTransactions(studentId: string): Promise<WalletTransaction[]> {
  const { data } = await apiClient.get(`/students/${studentId}/wallet`)
  return data
}

export async function redeemAccessCode(code: string, studentId?: string): Promise<{ success: boolean; course_id: number }> {
  const { data } = await apiClient.post('/students/redeem', { code })
  return data
}
