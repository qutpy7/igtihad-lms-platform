/* ═══════════════════════════════════════════════════
   api/admin.ts — Admin Dashboard API (TypeScript)
   ═══════════════════════════════════════════════════ */
import { apiClient } from '../api-client'
import type { AccessCode, Notification } from '../../types'

interface DashboardStats {
  totalStudents: number
  totalCourses: number
  totalRevenue: number
}

export async function fetchStats(): Promise<DashboardStats> {
  const { data } = await apiClient.get('/admin/dashboard')
  return data
}

export async function fetchPublicStats(): Promise<{ totalStudents: number; activeCourses: number }> {
  const { data } = await apiClient.get('/public/stats')
  return data
}

export async function fetchSystemSettings(): Promise<{ categories: string[], locations: string[] }> {
  const { data } = await apiClient.get('/settings')
  return data
}

export async function updateSystemSettings(settings: Record<string, string[]>): Promise<any> {
  const { data } = await apiClient.put('/settings', settings)
  return data
}

export async function fetchAccessCodes(): Promise<(AccessCode & { courses?: { title: string } })[]> {
  const { data } = await apiClient.get('/admin/codes')
  return data
}

export async function generateAccessCodes(courseId: number, count: number = 10): Promise<{ success: boolean; count: number; generatedCodes: string[] }> {
  const { data } = await apiClient.post('/admin/codes/generate', { course_id: courseId, count })
  return data
}

export async function deleteAccessCode(id: number): Promise<void> {
  await apiClient.delete(`/admin/codes/${id}`)
}

export async function sendCourseNotification(courseId: number | string, type: string, text: string): Promise<{ success: boolean; count: number }> {
  const { data } = await apiClient.post('/admin/notifications/send', { course_id: courseId, type, text })
  return data
}

export async function fetchNotifications(userId: string): Promise<Notification[]> {
  const { data } = await apiClient.get(`/students/${userId}/notifications`)
  return data
}

export async function markNotificationsRead(userId: string): Promise<void> {
  await apiClient.put(`/students/${userId}/notifications/read`)
}

