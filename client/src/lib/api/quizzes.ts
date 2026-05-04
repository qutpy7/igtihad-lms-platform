/* ═══════════════════════════════════════════════════
   api/quizzes.ts — Quiz, Quiz Questions, Results API (TypeScript)
   ═══════════════════════════════════════════════════ */
import { apiClient } from '../api-client'
import type { Quiz, QuizQuestion, QuizResult, LessonQuestion, SubmitQuizPayload } from '../../types'

// ─── Lesson Questions (inline quiz per lesson) ─────────────────
export async function fetchLessonQuestions(lessonId: number): Promise<LessonQuestion[]> {
  const { data } = await apiClient.get(`/quizzes/lesson/${lessonId}`)
  return data
}

export async function createLessonQuestion(question: Partial<LessonQuestion> & { lesson_id: number }): Promise<LessonQuestion> {
  const { data } = await apiClient.post('/quizzes/lesson', question)
  return data
}

export async function updateLessonQuestion(id: number, updates: Partial<LessonQuestion>): Promise<LessonQuestion> {
  const { data } = await apiClient.put(`/quizzes/lesson/${id}`, updates)
  return data
}

export async function deleteLessonQuestion(id: number): Promise<void> {
  await apiClient.delete(`/quizzes/lesson/${id}`)
}

// ─── Standalone Quizzes ────────────────────────────────────────
export async function fetchQuizzes(): Promise<Quiz[]> {
  const { data } = await apiClient.get('/quizzes')
  return data
}

export async function fetchQuizById(id: number): Promise<Quiz & { questions: QuizQuestion[] }> {
  const { data } = await apiClient.get(`/quizzes/${id}`)
  return data
}

export async function createQuiz(quiz: Partial<Quiz>): Promise<Quiz> {
  const { data } = await apiClient.post('/quizzes', {
    ...quiz,
    allow_retake: quiz.allow_retake === 0 ? 0 : 1
  })
  return data
}

export async function deleteQuiz(id: number): Promise<void> {
  await apiClient.delete(`/quizzes/${id}`)
}

// ─── Quiz Questions ────────────────────────────────────────────
export async function fetchQuizQuestions(quizId: number): Promise<QuizQuestion[]> {
  const { data } = await apiClient.get(`/quizzes/${quizId}/questions`)
  return data
}

export async function createQuizQuestion(question: Partial<QuizQuestion> & { quiz_id: number }): Promise<QuizQuestion> {
  const { data } = await apiClient.post(`/quizzes/${question.quiz_id}/questions`, question)
  return data
}

export async function deleteQuizQuestion(id: number): Promise<void> {
  await apiClient.delete(`/quizzes/questions/${id}`)
}

// ─── Quiz Results ──────────────────────────────────────────────
export async function saveQuizResult(payload: SubmitQuizPayload): Promise<QuizResult> {
  const { data } = await apiClient.post('/quizzes/results', payload)
  return data
}

export async function fetchStudentQuizResults(studentId: string): Promise<QuizResult[]> {
  const { data } = await apiClient.get(`/quizzes/results/student/${studentId}`)
  return data
}

export async function submitQuizResult(
  studentId: string, quizId: number | null, lessonId: number | null,
  score: number, total: number, answers: any[]
): Promise<QuizResult> {
  const { data } = await apiClient.post('/quizzes/results', {
    student_id: studentId, quiz_id: quizId, lesson_id: lessonId,
    score, total, answers
  })
  return data
}

export const fetchQuizResults = fetchStudentQuizResults

export async function fetchQuizResultDetails(studentId: string, quizId: number): Promise<QuizResult | null> {
  try {
    const { data } = await apiClient.get(`/quizzes/results/details/${quizId}`)
    return data
  } catch (err: any) {
    if (err.response && err.response.status === 404) return null
    throw err
  }
}
