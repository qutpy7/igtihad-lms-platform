import React, { createContext, useContext, useEffect, useState } from 'react'
import { apiClient } from '../lib/api-client'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    // 1. Get current session on load
    const token = localStorage.getItem('auth_token')
    if (token) {
      fetchCurrentUser()
    } else {
      setLoading(false)
    }
  }, [])

  async function fetchCurrentUser() {
    try {
      setLoading(true)
      const { data } = await apiClient.get('/auth/me')
      // Our backend returns the combined user/profile object
      setUser(data.user)
      setProfile(data.user)
    } catch (err) {
      console.error('Error fetching profile:', err)
      setUser(null)
      setProfile(null)
      localStorage.removeItem('auth_token')
    } finally {
      setLoading(false)
    }
  }

  // Expose signIn for login pages
  const signIn = async (email, password) => {
    try {
      setAuthError(null)
      
      const { data } = await apiClient.post('/auth/login', { email, password })
      
      if (!data || !data.token) {
        throw new Error('Invalid response from server')
      }

      localStorage.setItem('auth_token', data.token)
      setUser(data.user)
      setProfile(data.user)
      return { data, error: null }
    } catch (err) {
      console.error('Login detailed error:', err)
      const msg = err.response?.data?.error || err.message || 'Unknown error occurred'
      setAuthError(msg)
      return { data: null, error: msg }
    }
  }

  // Expose signUp for registration pages
  const signUp = async (userData) => {
    try {
      setAuthError(null)
      const { data } = await apiClient.post('/auth/register', userData)
      localStorage.setItem('auth_token', data.token)
      setUser(data.user)
      setProfile(data.user)
      return { data, error: null }
    } catch (err) {
      const msg = err.response?.data?.error || err.message
      setAuthError(msg)
      return { data: null, error: msg }
    }
  }

  // Expose adminSignUp for admin registration
  const adminSignUp = async (userData) => {
    try {
      setAuthError(null)
      const { data } = await apiClient.post('/auth/admin-register', userData)
      localStorage.setItem('auth_token', data.token)
      setUser(data.user)
      setProfile(data.user)
      return { data, error: null }
    } catch (err) {
      const msg = err.response?.data?.error || err.message
      setAuthError(msg)
      return { data: null, error: msg }
    }
  }

  // Logout function
  const signOut = async () => {
    localStorage.removeItem('auth_token')
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, setProfile, loading, authError, signIn, signUp, adminSignUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
