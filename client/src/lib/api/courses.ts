/* ═══════════════════════════════════════════════════
   api/courses.ts — Course, Unit, Lesson API (TypeScript)
   ═══════════════════════════════════════════════════ */
import { apiClient } from '../api-client'
import type { Course, Unit, Lesson, CourseWithCurriculum, CourseReview } from '../../types'

// ─── Courses ───────────────────────────────────────────────────
export async function fetchCourses(): Promise<Course[]> {
  const { data } = await apiClient.get('/courses')
  return data
}

export async function fetchCourseById(id: number): Promise<Course> {
  const { data } = await apiClient.get(`/courses/${id}`)
  return data
}

export async function fetchCourseWithCurriculum(id: number): Promise<CourseWithCurriculum> {
  const { data } = await apiClient.get(`/courses/${id}/curriculum`)
  return data
}

export async function createCourse(course: Partial<Course>): Promise<Course> {
  const { data } = await apiClient.post('/courses', course)
  return data
}

export async function updateCourse(id: number, updates: Partial<Course>): Promise<Course> {
  const { data } = await apiClient.put(`/courses/${id}`, updates)
  return data
}

export async function deleteCourse(id: number): Promise<void> {
  await apiClient.delete(`/courses/${id}`)
}

export async function restoreCourse(id: number): Promise<void> {
  await apiClient.put(`/courses/${id}/restore`)
}

// ─── Units ─────────────────────────────────────────────────────
export async function fetchUnits(courseId: number): Promise<Unit[]> {
  const { data } = await apiClient.get(`/courses/${courseId}/units`)
  return data
}

export async function createUnit(unit: { course_id: number; title: string; sort_order?: number }): Promise<Unit> {
  const { data } = await apiClient.post(`/courses/${unit.course_id}/units`, unit)
  return data
}

export async function updateUnit(id: number, updates: Partial<Unit>): Promise<Unit> {
  const { data } = await apiClient.put(`/courses/units/${id}`, updates)
  return data
}

export async function deleteUnit(id: number): Promise<void> {
  await apiClient.delete(`/courses/units/${id}`)
}

// ─── Lessons ───────────────────────────────────────────────────
export async function fetchLessonWithCourse(lessonId: number): Promise<{ lesson: Lesson; course: Course }> {
  const { data } = await apiClient.get(`/courses/lessons/${lessonId}/context`)
  return data
}

export async function fetchLessons(unitId: number): Promise<Lesson[]> {
  const { data } = await apiClient.get(`/courses/units/${unitId}/lessons`)
  return data
}

export async function fetchLessonsByUnit(unitIds: number[]): Promise<Lesson[]> {
  const promises = unitIds.map(id => apiClient.get(`/courses/units/${id}/lessons`))
  const results = await Promise.all(promises)
  return results.flatMap(res => res.data)
}

export async function createLesson(unitId: number, lesson: Partial<Lesson>): Promise<Lesson> {
  const { data } = await apiClient.post(`/courses/units/${unitId}/lessons`, {
    ...lesson,
    allow_retake: lesson.allow_retake === 0 ? 0 : 1
  })
  return data
}

export async function updateLesson(lessonId: number, updates: Partial<Lesson>): Promise<Lesson> {
  const { data } = await apiClient.put(`/courses/lessons/${lessonId}`, updates)
  return data
}

export async function deleteLesson(id: number): Promise<void> {
  await apiClient.delete(`/courses/lessons/${id}`)
}

export async function updateLessonOrder(lessons: { id: number; sort_order: number }[]): Promise<void> {
  await apiClient.post('/courses/lessons/reorder', { lessons })
}

// ─── Reviews ───────────────────────────────────────────────────
export async function fetchCourseReviews(courseId: number): Promise<CourseReview[]> {
  const { data } = await apiClient.get(`/courses/${courseId}/reviews`)
  return data
}

export async function addCourseReview(reviewData: { course_id: number; rating: number; comment?: string }): Promise<CourseReview> {
  const { data } = await apiClient.post(`/courses/${reviewData.course_id}/reviews`, reviewData)
  return data
}

export async function deleteCourseReview(id: number): Promise<void> {
  await apiClient.delete(`/courses/reviews/${id}`)
}

export async function fetchAllCourseReviews(): Promise<CourseReview[]> {
  const { data } = await apiClient.get('/public/reviews')
  return data
}

export async function getSignedUrl(path: string | null, bucket: string = 'lesson-content'): Promise<string | null> {
  if (!path) return null
  return "/uploads/" + path
}
