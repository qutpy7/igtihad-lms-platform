import React, { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import ClayBlobs from '../ui/ClayBlobs'
import { useAuth } from '../../context/AuthContext'

import { LineChart, Package, Users, Ticket, HelpCircle, Shield, LogOut, Menu, MessageCircle, Bell, Star, Settings } from 'lucide-react'

const sideLinks = [
  { to: '/admin', label: 'الإحصائيات', icon: <LineChart size={20} />, end: true },
  { to: '/admin/courses', label: 'إدارة الكورسات', icon: <Package size={20} /> },
  { to: '/admin/students', label: 'إدارة الطلاب', icon: <Users size={20} /> },
  { to: '/admin/codes', label: 'إدارة الأكواد', icon: <Ticket size={20} /> },
  { to: '/admin/quizzes', label: 'بنك الأسئلة', icon: <HelpCircle size={20} /> },
  { to: '/admin/qa', label: 'أسئلة الطلاب', icon: <MessageCircle size={20} /> },
  { to: '/admin/notifications', label: 'إرسال إشعارات', icon: <Bell size={20} /> },
  { to: '/admin/reviews', label: 'التقييمات', icon: <Star size={20} /> },
  { to: '/admin/admins', label: 'إدارة المديرين', icon: <Shield size={20} /> },
  { to: '/admin/settings', label: 'إعدادات المنصة', icon: <Settings size={20} /> },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { profile, signOut } = useAuth()


  return (
    <div className="min-h-screen bg-clay-canvas relative flex">
      <ClayBlobs />

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ─── Sidebar ─── */}
      <aside className={`
        fixed top-0 right-0 h-full w-72 bg-white/80 backdrop-blur-xl shadow-clayCard z-50
        flex flex-col p-6 transition-transform duration-300
        lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 mb-3">
          <img src="/logo.png" alt="igthad logo" className="w-10 h-10 rounded-2xl shadow-sm object-cover" />
          <span className="text-xl font-black text-clay-accent" style={{ fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }}>
            اجتهاد
          </span>
        </div>
        <span className="text-xs font-bold text-clay-muted bg-clay-accent/10 rounded-full px-3 py-1 self-start mb-8" style={{ fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }}>
          لوحة الإدارة
        </span>

        {/* Nav — scrollable if too many items */}
        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto min-h-0 pb-2">
          {sideLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-clay-sm text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-clay-accent/10 text-clay-accent shadow-clayPressed font-bold'
                  : 'text-clay-muted hover:bg-clay-accent/5 hover:text-clay-accent'
                }`
              }
            >
              <span className="text-lg">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout — always visible at bottom */}
        <div className="pt-3 border-t border-clay-accent/10 mt-2 flex-shrink-0">
          <button onClick={async () => { await signOut(); window.location.href = '/login'; }} className="flex items-center gap-3 px-4 py-2.5 rounded-clay-sm text-sm font-medium text-red-500 hover:bg-red-50 transition-colors w-full">
            <span className="text-lg"><LogOut size={18} /></span>
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-xl border-b border-white/50 px-4 sm:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Toggle mobile menu"
            className="lg:hidden w-10 h-10 rounded-xl bg-clay-accent/10 flex items-center justify-center text-clay-accent"
          >
            <Menu size={24} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3 p-1.5 hover:bg-clay-accent/5 rounded-xl transition-colors">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
              {profile?.full_name?.charAt(0) || 'أ'}
            </div>
            <span className="text-sm font-bold text-clay-foreground hidden sm:block">
              مرحباً، {profile?.full_name || 'المدير'}
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
