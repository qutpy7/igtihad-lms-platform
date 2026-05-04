import React, { useState, useEffect, useCallback } from 'react'
import { BookOpen, LineChart, Users, Ticket, Loader2, TrendingUp } from 'lucide-react'
import ClayCard from '../../components/ui/ClayCard'
import ClayBadge from '../../components/ui/ClayBadge'
import IconOrb from '../../components/ui/IconOrb'
import { DashboardSkeleton } from '../../components/ui/SkeletonLoader'
import { fetchStats as fetchAdminStats, fetchCourses, fetchAccessCodes } from '../../lib/api'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { useRealtimeMulti } from '../../lib/useRealtimeSync'

const HEADING = { fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }

export default function AdminDashboardPage() {
  const { profile } = useAuth()
  const [stats, setStats] = useState({ activeCourses: 0, totalStudents: 0, activatedCodes: 0, totalRevenue: 0 })
  const [courses, setCourses] = useState([])
  const [recentCodes, setRecentCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    try {
      const [statsData, coursesData, codesData] = await Promise.all([
        fetchAdminStats(),
        fetchCourses(),
        fetchAccessCodes(),
      ])
      setStats(statsData)
      setCourses(coursesData.slice(0, 5))
      setRecentCodes(codesData.filter(c => c.status === 'used').slice(0, 4))
    } catch (err) { toast.error('خطأ في تحميل لوحة التحكم: ' + err.message) }
    finally { setLoading(false) }
  }, [toast])

  useEffect(() => { loadDashboard() }, [loadDashboard])

  // ✅ FIX #14: Debounced reload - prevent re-fetch storm
  const debouncedReload = useCallback(() => {
    clearTimeout(window.__dashboardTimer)
    window.__dashboardTimer = setTimeout(() => {
      loadDashboard()
    }, 1000) // 1 second debounce
  }, [loadDashboard])

  // ✅ FIX: Realtime with debounce
  useRealtimeMulti([
    { table: 'courses' },
    { table: 'enrollments' },
    { table: 'lesson_progress' },
  ], debouncedReload)

  if (loading) return <DashboardSkeleton />

  const maxPrice = Math.max(...courses.map(c => c.price || 0), 1)

  const statCards = [
    { icon: <BookOpen size={24} />, label: 'كورسات نشطة',    value: stats.activeCourses,              color: 'from-violet-400 to-violet-600' },
    { icon: <Users size={24} />,    label: 'إجمالي الطلاب',  value: stats.totalStudents,              color: 'from-blue-400 to-blue-600' },
    { icon: <Ticket size={24} />,   label: 'أكواد مفعّلة',   value: stats.activatedCodes,             color: 'from-pink-400 to-pink-600' },
    { icon: <TrendingUp size={24}/>, label: 'إجمالي الإيرادات', value: `${stats.totalRevenue} ج.م`, color: 'from-emerald-400 to-emerald-600' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black" style={HEADING}>الإحصائيات </h1>
        <button 
          onClick={loadDashboard}
          className="p-3 rounded-2xl bg-white shadow-clayCard hover:shadow-clayCardHover text-clay-accent transition-all flex items-center gap-2 text-sm font-bold"
          disabled={loading}
        >
          <Loader2 size={18} className={loading ? 'animate-spin' : ''} /> تحديث البيانات
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <ClayCard key={i} hover={false} className="!p-5">
            <div className="flex items-center gap-3 mb-3">
              <IconOrb emoji={stat.icon} color={stat.color} size="sm" />
              <span className="text-xs font-bold text-clay-muted">{stat.label}</span>
            </div>
            <span className="text-2xl font-black text-clay-foreground" style={HEADING}>{stat.value}</span>
          </ClayCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Courses */}
        <ClayCard hover={false}>
          <h3 className="text-lg font-bold mb-6" style={HEADING}>🏆 الكورسات</h3>
          <div className="flex flex-col gap-4">
            {courses.map((course, i) => (
              <div key={course.id}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-clay-foreground">{course.title}</span>
                  <span className="font-bold text-clay-accent" style={HEADING}>{course.price} ج.م</span>
                </div>
                <div className="h-3 bg-[#EFEBF5] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(course.price / maxPrice) * 100}%`,
                      background: `linear-gradient(to left, #7C3AED, ${['#A78BFA', '#EC4899', '#0EA5E9', '#10B981', '#F59E0B'][i % 5]})`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ClayCard>

        {/* Recent Codes */}
        <ClayCard hover={false}>
          <h3 className="text-lg font-bold mb-6" style={HEADING}> آخر الأكواد المُفعَّلة</h3>
          {recentCodes.length > 0 ? (
            <div className="flex flex-col gap-2">
              {recentCodes.map(c => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/60 transition-colors">
                  <span className="font-mono text-xs font-bold text-clay-accent">{c.code}</span>
                  <span className="text-sm text-clay-muted flex-1">{c.courses?.title || '—'}</span>
                  <span className="text-xs text-clay-muted">{c.profiles?.full_name || '—'}</span>
                  <span className="text-xs text-clay-muted">{c.used_at?.split('T')[0] || '—'}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-clay-muted py-8">لا توجد أكواد مفعّلة بعد</p>
          )}
        </ClayCard>
      </div>
    </div>
  )
}
