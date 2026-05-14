/* ═══════════════════════════════════════════════════
   api-client.ts — Typed Axios instance
   ═══════════════════════════════════════════════════ */
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios'

const apiUrl: string = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api')

export const apiClient: AxiosInstance = axios.create({
    baseURL: apiUrl,
    timeout: 10000,
})

// Interceptor to add the JWT token to requests
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // 🔒 Security Fix: Only log in development, never log request body
        if (import.meta.env.DEV) {
            console.log(`🚀 API: ${config.method?.toUpperCase()} ${config.url}`)
        }
        const token = localStorage.getItem('auth_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error: AxiosError) => {
        if (import.meta.env.DEV) {
            console.error('❌ API Request Error:', error.message)
        }
        return Promise.reject(error)
    }
)

// Interceptor to handle 401 Unauthorized responses
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('auth_token')
        }
        return Promise.reject(error)
    }
)
