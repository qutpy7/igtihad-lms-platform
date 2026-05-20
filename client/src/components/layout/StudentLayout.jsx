import React, { useState, useEffect } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import ClayBlobs from '../ui/ClayBlobs'
import { useAuth } from '../../context/AuthContext'
import { fetchNotifications, markNotificationsRead } from '../../lib/api'
import { useRealtimeSync } from '../../lib/useRealtimeSync'

import { Home, BookOpen, CreditCard, Settings, LogOut, Menu, Bell, Book, FileText } from 'lucide-react'

const sideLinks = [
  { to: '/student', label: 'لوحتي', icon: <Home size={20} />, end: true },
  { to: '/student/courses', label: 'كورساتي', icon: <BookOpen size={20} /> },
  { to: '/student/payments', label: 'المدفوعات', icon: <CreditCard size={20} /> },
  { to: '/student/profile', label: 'الملف الشخصي', icon: <Settings size={20} /> },
]

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const { profile, signOut } = useAuth()

  const loadNotifications = async () => {
    try {
      if (!profile?.id) return
      const data = await fetchNotifications(profile.id)
      setNotifications(data)
    } catch (err) {
      console.error('Failed to load notifications:', err)
    }
  }

  useEffect(() => {
    if (profile?.id) {
      loadNotifications()
    }
  }, [profile?.id])

  // ⚡ Realtime: instantly show new notifications when admin sends them
  useRealtimeSync('notifications', loadNotifications, profile?.id ? { column: 'user_id', value: profile.id } : null)

  const handleOpenNotif = async () => {
    setNotifOpen(!notifOpen)
    if (!notifOpen && notifications.some(n => !n.is_read)) {
      try {
        await markNotificationsRead(profile.id)
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      } catch (err) {
        console.error('Failed to mark read', err)
      }
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="min-h-screen bg-clay-canvas relative flex">
      <ClayBlobs />

      {/* ─── Sidebar ─── */}
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed top-0 right-0 h-full w-72 bg-white/80 backdrop-blur-xl shadow-clayCard z-50
        flex flex-col p-6 transition-transform duration-300
        lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <img src="/logo.png" alt="igthad logo" className="w-10 h-10 rounded-2xl shadow-sm object-cover" />
          <span className="text-xl font-black text-clay-accent" style={{ fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }}>
            اجتهاد
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-2 flex-1">
          {sideLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-clay-sm text-base font-medium transition-all duration-200
                ${isActive
                  ? 'bg-clay-accent/10 text-clay-accent shadow-clayPressed font-bold'
                  : 'text-clay-muted hover:bg-clay-accent/5 hover:text-clay-accent'
                }`
              }
            >
              <span className="text-xl">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <button onClick={async () => { await signOut(); window.location.href = '/login'; }} className="flex items-center gap-3 px-4 py-3 rounded-clay-sm text-base font-medium text-red-500 hover:bg-red-50 transition-colors mt-auto">
          <span className="text-xl"><LogOut size={20} /></span>
          تسجيل الخروج
        </button>
      </aside>

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-xl border-b border-white/50 px-4 sm:px-8 h-16 flex items-center justify-between">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="فتح القائمة"
            className="lg:hidden w-10 h-10 rounded-xl bg-clay-accent/10 flex items-center justify-center text-clay-accent"
          >
            <Menu size={24} />
          </button>

          <div className="flex-1" />

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={handleOpenNotif}
              aria-label="الإشعارات"
              className="w-10 h-10 rounded-xl bg-clay-accent/10 flex items-center justify-center text-clay-accent hover:bg-clay-accent/20 transition-colors relative"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -left-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute left-0 top-14 w-72 bg-white/95 backdrop-blur-xl rounded-[20px] shadow-clayCard p-4 flex flex-col gap-2">
                <h4 className="font-bold text-sm mb-2" style={{ fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }}>الإشعارات</h4>
                {notifications.length === 0 ? (
                  <p className="text-sm text-clay-muted text-center py-4">لا توجد إشعارات جديدة</p>
                ) : (
                  notifications.slice(0, 5).map((n) => {
                    const icons = { lesson: <Book size={16} />, result: '📊', payment: <CreditCard size={16} />, quiz: <FileText size={16} />, welcome: '🎉' }
                    return (
                      <div key={n.id} className={`text-sm py-2 border-b border-clay-accent/5 last:border-0 flex items-start gap-2 ${!n.is_read ? 'bg-clay-accent/5 p-2 rounded-lg' : ''}`}>
                        <span className="mt-0.5">{icons[n.type] || '📌'}</span>
                        <div>
                          <p className={`text-clay-foreground ${!n.is_read ? 'font-bold' : ''}`}>{n.text}</p>
                          <span className="text-xs text-clay-muted">{new Date(n.created_at).toLocaleDateString('ar-EG')}</span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>

          {/* User Info */}
          <Link to="/student/profile" className="flex items-center gap-3 mr-4 p-1.5 hover:bg-clay-accent/5 rounded-xl transition-colors cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] flex items-center justify-center text-white text-sm font-bold shadow-sm hover:scale-105 transition-transform overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                profile?.full_name?.charAt(0) || 'ط'
              )}
            </div>
            <span className="text-sm font-bold text-clay-foreground hidden sm:block">
              {profile?.full_name || 'طالب'}
            </span>
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}


