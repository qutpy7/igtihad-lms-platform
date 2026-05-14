/* ═══════════════════════════════════════════════════
   api/storage.ts — File Upload/Download (TypeScript)
   ═══════════════════════════════════════════════════ */
import { apiClient } from '../api-client'

export async function uploadFile(file: File, path: string, bucket: string = 'lesson-content'): Promise<{ path: string }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('path', path)
  formData.append('bucket', bucket)

  const { data } = await apiClient.post('/upload', formData)
  return { path: data.filePath }
}

export async function deleteFile(path: string, bucket: string = 'lesson-content'): Promise<void> {
  await apiClient.delete('/upload', { data: { path, bucket } })
}

export function getPublicUrl(path: string | null, bucket: string = 'lesson-content'): string | null {
  if (!path) return null
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  return `${baseUrl.replace('/api', '')}/uploads/${path.split('/').pop()}`
}
