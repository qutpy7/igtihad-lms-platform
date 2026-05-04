import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Loader2 } from 'lucide-react'

export default function AdminRoute() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-clay-canvas">
        <Loader2 size={32} className="animate-spin text-clay-accent" />
      </div>
    )
  }

  // Not logged in -> Go to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Logged in but not admin -> Go to student dashboard
  if (profile && profile.role !== 'admin') {
    return <Navigate to="/student" replace />
  }

  return <Outlet />
}
