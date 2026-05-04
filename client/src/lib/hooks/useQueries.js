/* ═══════════════════════════════════════════════════
   React Query — Custom Hooks
   ═══════════════════════════════════════════════════
   
   Provides caching, deduplication, background refetch,
   and optimistic updates for all API calls.
   
   Usage:
     const { data, isLoading } = useCourses()
     const { data, isLoading } = useStudentEnrollments(studentId)
     const { mutate } = useEnrollMutation()
   ═══════════════════════════════════════════════════ */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../api-client'
import { fetchCourses, fetchCourseById, fetchCourseWithCurriculum } from '../api/courses'
import { fetchEnrollments, fetchStudentProgress, fetchStudentProgressByCourse } from '../api/students'
import { fetchQuizzes, fetchStudentQuizResults } from '../api/quizzes'

// ─── Query Key Factories ────────────────────────────────────────
// Consistent key structure: [entity, scope, id/filter]
export const queryKeys = {
    courses: {
        all: ['courses'],
        detail: (id) => ['courses', id],
        curriculum: (id) => ['courses', id, 'curriculum'],
    },
    enrollments: {
        byStudent: (studentId) => ['enrollments', studentId],
        check: (studentId, courseId) => ['enrollments', studentId, courseId],
    },
    progress: {
        byStudent: (studentId) => ['progress', studentId],
        byCourse: (studentId) => ['progress', 'by-course', studentId],
    },
    quizzes: {
        all: ['quizzes'],
        results: (studentId) => ['quizzes', 'results', studentId],
    },
    students: {
        all: ['students'],
        analytics: (courseId) => ['students', 'analytics', courseId],
    },
    notifications: {
        byUser: (userId) => ['notifications', userId],
    },
}

// ═══════════════════════════════════════════════════
// COURSE HOOKS
// ═══════════════════════════════════════════════════

/** Fetch all courses — cached for 5 minutes */
export function useCourses() {
    return useQuery({
        queryKey: queryKeys.courses.all,
        queryFn: fetchCourses,
        staleTime: 5 * 60 * 1000, // 5 min
    })
}

/** Fetch single course by ID */
export function useCourse(id) {
    return useQuery({
        queryKey: queryKeys.courses.detail(id),
        queryFn: () => fetchCourseById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    })
}

/** Fetch course with full curriculum */
export function useCourseCurriculum(id) {
    return useQuery({
        queryKey: queryKeys.courses.curriculum(id),
        queryFn: () => fetchCourseWithCurriculum(id),
        enabled: !!id,
        staleTime: 10 * 60 * 1000, // 10 min — curriculum rarely changes
    })
}

// ═══════════════════════════════════════════════════
// ENROLLMENT HOOKS
// ═══════════════════════════════════════════════════

/** Fetch student enrollments */
export function useStudentEnrollments(studentId) {
    return useQuery({
        queryKey: queryKeys.enrollments.byStudent(studentId),
        queryFn: () => fetchEnrollments(studentId),
        enabled: !!studentId,
        staleTime: 2 * 60 * 1000,
    })
}

/** Enroll in a course — auto-invalidates related caches */
export function useEnrollMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ course_id, price, duration_days }) =>
            apiClient.post('/students/enroll', { course_id, price, duration_days }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['enrollments'] })
            queryClient.invalidateQueries({ queryKey: ['progress'] })
        },
    })
}

/** Redeem access code — auto-invalidates enrollments */
export function useRedeemMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (code) => apiClient.post('/students/redeem', { code }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['enrollments'] })
        },
    })
}

// ═══════════════════════════════════════════════════
// PROGRESS HOOKS
// ═══════════════════════════════════════════════════

/** Fetch completed lesson IDs for a student */
export function useStudentProgress(studentId) {
    return useQuery({
        queryKey: queryKeys.progress.byStudent(studentId),
        queryFn: () => fetchStudentProgress(studentId),
        enabled: !!studentId,
        staleTime: 60 * 1000, // 1 min
    })
}

/** Fetch progress percentages grouped by course */
export function useProgressByCourse(studentId) {
    return useQuery({
        queryKey: queryKeys.progress.byCourse(studentId),
        queryFn: () => fetchStudentProgressByCourse(studentId),
        enabled: !!studentId,
        staleTime: 60 * 1000,
    })
}

/** Mark lesson as completed — auto-invalidates progress */
export function useMarkLessonCompleteMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (lessonId) =>
            apiClient.post('/students/progress', { lesson_id: lessonId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['progress'] })
        },
    })
}

// ═══════════════════════════════════════════════════
// QUIZ HOOKS
// ═══════════════════════════════════════════════════

/** Fetch all quizzes */
export function useQuizzes() {
    return useQuery({
        queryKey: queryKeys.quizzes.all,
        queryFn: fetchQuizzes,
        staleTime: 5 * 60 * 1000,
    })
}

/** Fetch quiz results for a student */
export function useQuizResults(studentId) {
    return useQuery({
        queryKey: queryKeys.quizzes.results(studentId),
        queryFn: () => fetchStudentQuizResults(studentId),
        enabled: !!studentId,
        staleTime: 2 * 60 * 1000,
    })
}

// ═══════════════════════════════════════════════════
// ADMIN HOOKS
// ═══════════════════════════════════════════════════

/** Fetch all students (admin only) */
export function useStudents() {
    return useQuery({
        queryKey: queryKeys.students.all,
        queryFn: async () => {
            const { data } = await apiClient.get('/students')
            return data
        },
        staleTime: 2 * 60 * 1000,
    })
}

/** Fetch analytics for a course (admin only) */
export function useStudentAnalytics(courseId) {
    return useQuery({
        queryKey: queryKeys.students.analytics(courseId),
        queryFn: async () => {
            const { data } = await apiClient.get(`/students/analytics/${courseId}`)
            return data
        },
        enabled: !!courseId,
        staleTime: 2 * 60 * 1000,
    })
}
