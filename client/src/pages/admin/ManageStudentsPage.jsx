import React, { useState, useEffect, useMemo } from 'react'
import { Users, Loader2, Download, ChevronRight, ChevronLeft } from 'lucide-react'
import ClayCard from '../../components/ui/ClayCard'
import ClayInput from '../../components/ui/ClayInput'
import ClaySelect from '../../components/ui/ClaySelect'
import ClayBadge from '../../components/ui/ClayBadge'
import ClayButton from '../../components/ui/ClayButton'
import { StudentsTableSkeleton } from '../../components/ui/SkeletonLoader'
import { fetchStudents, fetchSystemSettings as fetchSettings, fetchCourses, fetchAnalytics } from '../../lib/api'
import { useToast } from '../../context/ToastContext'

const HEADING = { fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }
const PAGE_SIZE = 20

// ✅ Fix 7 — CSV Export
function exportToCSV(students, gradeLabels) {
  const headers = ['الاسم', 'الإيميل', 'التليفون', 'الصف', 'المحافظة', 'تاريخ التسجيل', 'الرصيد']
  const rows = students.map(s => [
    s.full_name || '',
    s.email || '',
    s.phone || '',
    gradeLabels[s.grade] || s.grade || '',
    s.governorate || '',
    s.created_at?.split('T')[0] || '',
    s.balance ?? 0,
  ])
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `students_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export default function ManageStudentsPage() {
  const [search, setSearch] = useState('')
  const [gradeFilter, setGradeFilter] = useState('')
  const [courseFilter, setCourseFilter] = useState('')
  const [minProgress, setMinProgress] = useState(0)
  const [minQuiz, setMinQuiz] = useState(0)
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [analytics, setAnalytics] = useState([])
  const [grades, setGrades] = useState([])
  const [gradeLabels, setGradeLabels] = useState({})
  const [loading, setLoading] = useState(true)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [page, setPage] = useState(1)   // ✅ Fix 5.3 — Pagination
  const toast = useToast()

  useEffect(() => { loadData() }, [])
  // Reset to page 1 when filter changes
  useEffect(() => { setPage(1) }, [search, gradeFilter, courseFilter, minProgress, minQuiz])

  useEffect(() => {
    if (courseFilter) {
      loadAnalytics(courseFilter)
    } else {
      setAnalytics([])
    }
  }, [courseFilter])

  async function loadData() {
    setLoading(true)
    try {
      const [studentsData, settings, coursesData] = await Promise.all([
        fetchStudents(),
        fetchSettings(['grades']),
        fetchCourses()
      ])
      setStudents(studentsData)
      setCourses(coursesData)
      const g = settings.grades || []
      setGrades(g)
      const labels = {}
      g.forEach(item => { labels[item.value] = item.label })
      setGradeLabels(labels)
    } catch (err) { toast.error('خطأ في تحميل البيانات: ' + err.message) }
    finally { setLoading(false) }
  }

  async function loadAnalytics(courseId) {
    setLoadingAnalytics(true)
    try {
      const data = await fetchAnalytics(courseId)
      setAnalytics(data)
    } catch (err) {
      toast.error('خطأ في تحميل التحليلات: ' + err.message)
    } finally {
      setLoadingAnalytics(false)
    }
  }

  const courseOptions = courses.map(c => ({ value: String(c.id), label: c.title }))

  const filtered = useMemo(() => {
    // If course filter is active, we use the analytics list (which is already restricted to that course)
    const baseList = courseFilter ? analytics : students;

    return baseList.filter(s => {
      // Basic filters
      if (search && !s.full_name?.includes(search) && !s.email?.includes(search)) return false
      if (gradeFilter && s.grade !== gradeFilter) return false
      
      // Metric filters (only if course is selected)
      if (courseFilter) {
        if (s.progress < minProgress) return false
        if (s.quiz_avg < minQuiz) return false
      }
      
      return true
    })
  }, [search, gradeFilter, courseFilter, minProgress, minQuiz, students, analytics])

  // ✅ Pagination logic
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-black" style={HEADING}>إدارة الطلاب </h1>
          <button 
            onClick={loadData}
            className="p-2 rounded-xl hover:bg-clay-accent/5 text-clay-accent transition-colors flex items-center gap-2 text-xs font-bold"
            title="تحديث القائمة"
            disabled={loading}
          >
            <Loader2 size={14} className={loading ? 'animate-spin' : ''} /> تحديث
          </button>
        </div>
        {/* ✅ CSV Export Button */}
        <ClayButton
          variant="secondary"
          onClick={() => exportToCSV(filtered, gradeLabels)}
          disabled={loading || filtered.length === 0}
        >
          <Download size={16} className="ml-2" />
          تصدير CSV ({filtered.length})
        </ClayButton>
      </div>

      <ClayCard hover={false} className="mb-6">
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ClayInput placeholder="ابحث بالاسم أو الإيميل..." value={search} onChange={e => setSearch(e.target.value)} />
            <ClaySelect placeholder="كل الصفوف" options={grades} value={gradeFilter} onChange={e => setGradeFilter(e.target.value)} />
            <ClaySelect placeholder="اختر كورس للتحليلات" options={courseOptions} value={courseFilter} onChange={e => setCourseFilter(e.target.value)} />
          </div>

          {courseFilter && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 bg-clay-accent/5 rounded-[24px] border border-clay-accent/10">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-clay-muted">الحد الأدنى للتقدم: <span className="text-clay-accent">{minProgress}%</span></label>
                  <button onClick={() => setMinProgress(0)} className="text-[10px] text-red-400 hover:underline">إعادة ضبط</button>
                </div>
                <input 
                  type="range" min="0" max="100" value={minProgress} 
                  onChange={e => setMinProgress(parseInt(e.target.value))} 
                  className="w-full h-1.5 bg-clay-accent/20 rounded-lg appearance-none cursor-pointer accent-clay-accent"
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-clay-muted">الحد الأدنى لمتوسط الواجبات: <span className="text-clay-accent">{minQuiz}%</span></label>
                  <button onClick={() => setMinQuiz(0)} className="text-[10px] text-red-400 hover:underline">إعادة ضبط</button>
                </div>
                <input 
                  type="range" min="0" max="100" value={minQuiz} 
                  onChange={e => setMinQuiz(parseInt(e.target.value))} 
                  className="w-full h-1.5 bg-clay-accent/20 rounded-lg appearance-none cursor-pointer accent-clay-accent"
                />
              </div>
            </div>
          )}
        </div>
      </ClayCard>

      <div className="flex items-center justify-between mb-4">
        <p className="text-clay-muted font-medium">
          عرض {paginated.length} من {filtered.length} طالب
          {filtered.length !== students.length && ` (من ${students.length} إجمالي)`}
        </p>
        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="الصفحة السابقة"
              className="w-8 h-8 rounded-xl bg-white/60 border border-clay-accent/20 flex items-center justify-center text-clay-muted hover:bg-white disabled:opacity-40 transition-all"
            >
              <ChevronRight size={16} />
            </button>
            <span className="text-sm font-bold text-clay-foreground">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="الصفحة التالية"
              className="w-8 h-8 rounded-xl bg-white/60 border border-clay-accent/20 flex items-center justify-center text-clay-muted hover:bg-white disabled:opacity-40 transition-all"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        )}
      </div>

      <ClayCard hover={false}>
        {loading ? (
          <StudentsTableSkeleton rows={8} />
        ) : paginated.length === 0 ? (
          <p className="text-center text-clay-muted py-8">
            {students.length === 0 ? 'لا يوجد طلاب مسجلين بعد.' : 'لا يوجد طلاب بهذه المعايير.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-right text-clay-muted border-b border-clay-accent/10">
                  <th className="pb-3 font-bold">الطالب</th>
                  {courseFilter ? (
                    <>
                      <th className="pb-3 font-bold">التقدم</th>
                      <th className="pb-3 font-bold">متوسط الواجبات</th>
                      <th className="pb-3 font-bold">الامتحانات</th>
                    </>
                  ) : (
                    <>
                      <th className="pb-3 font-bold hidden md:table-cell">الإيميل</th>
                      <th className="pb-3 font-bold hidden sm:table-cell">التليفون</th>
                      <th className="pb-3 font-bold">الصف</th>
                      <th className="pb-3 font-bold hidden lg:table-cell">الرصيد</th>
                    </>
                  )}
                  <th className="pb-3 font-bold">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(s => (
                  <tr key={s.id} className="border-b border-clay-accent/5 last:border-0 hover:bg-white/40 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {s.full_name?.charAt(0) || '?'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{s.full_name}</span>
                          {courseFilter && <span className="text-[10px] text-clay-muted truncate max-w-[120px]">{s.email}</span>}
                        </div>
                      </div>
                    </td>
                    
                    {courseFilter ? (
                      <>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-clay-accent/10 rounded-full overflow-hidden">
                              <div className="h-full bg-clay-accent" style={{ width: `${s.progress}%` }}></div>
                            </div>
                            <span className="font-bold text-xs">{s.progress}%</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <ClayBadge color={s.quiz_avg >= 50 ? 'accent' : 'warning'}>{s.quiz_avg}%</ClayBadge>
                        </td>
                        <td className="py-3">
                          <div className="flex flex-col gap-1">
                            {s.exams?.map((ex, idx) => (
                              <div key={idx} className="text-[10px] whitespace-nowrap">
                                <span className="text-clay-muted">{ex.title}:</span> <span className="font-bold">{ex.percentage}%</span>
                              </div>
                            ))}
                            {(!s.exams || s.exams.length === 0) && <span className="text-xs text-clay-muted">—</span>}
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 text-clay-muted text-xs hidden md:table-cell">{s.email}</td>
                        <td className="py-3 text-clay-muted text-xs hidden sm:table-cell">{s.phone || '—'}</td>
                        <td className="py-3"><ClayBadge color="accent">{gradeLabels[s.grade] || s.grade || '—'}</ClayBadge></td>
                        <td className="py-3 hidden lg:table-cell">
                          <span className="font-bold text-emerald-600 text-sm">{s.balance ?? 0} ج.م</span>
                        </td>
                      </>
                    )}

                    <td className="py-3">
                      <button
                        onClick={() => setSelectedStudent(s)}
                        aria-label="عرض التفاصيل"
                        className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs hover:bg-blue-100 transition-colors"
                        title="عرض التفاصيل"
                      >👁️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ClayCard>

      {/* Bottom pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const p = totalPages <= 7 ? i + 1 : 
              page <= 4 ? i + 1 :
              page >= totalPages - 3 ? totalPages - 6 + i :
              page - 3 + i
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                  p === page
                    ? 'bg-clay-accent text-white shadow-clay'
                    : 'bg-white/60 text-clay-muted hover:bg-white border border-clay-accent/20'
                }`}
              >{p}</button>
            )
          })}
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedStudent(null)}>
          <ClayCard hover={false} className="max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={HEADING}>تفاصيل الطالب</h3>
              <button onClick={() => setSelectedStudent(null)} aria-label="إغلاق" className="w-8 h-8 rounded-lg bg-clay-accent/10 flex items-center justify-center text-clay-accent">✕</button>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] flex items-center justify-center text-white text-2xl font-black" style={HEADING}>
                {selectedStudent.full_name?.charAt(0)}
              </div>
              <div>
                <h4 className="text-lg font-bold" style={HEADING}>{selectedStudent.full_name}</h4>
                <p className="text-sm text-clay-muted">{selectedStudent.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mb-8">
              {[
                { label: 'التليفون',      value: selectedStudent.phone || '—' },
                { label: 'الصف',          value: gradeLabels[selectedStudent.grade] || '—' },
                { label: 'المحافظة',      value: selectedStudent.governorate || '—' },
                { label: 'تاريخ التسجيل', value: selectedStudent.created_at?.split('T')[0] || '—' },
                { label: 'الرصيد',        value: `${selectedStudent.balance ?? 0} ج.م` },
              ].map((item, i) => (
                <div key={i} className="bg-white/60 rounded-xl p-3">
                  <p className="text-xs text-clay-muted font-bold mb-1">{item.label}</p>
                  <p className="font-medium">{item.value}</p>
                </div>
              ))}
            </div>

            {courseFilter && (
              <div className="p-4 bg-clay-accent/5 rounded-[24px] border border-clay-accent/10">
                <h4 className="text-sm font-bold mb-4 flex items-center gap-2" style={HEADING}>
                  📊 أداء الطالب في {courses.find(c => String(c.id) === courseFilter)?.title}
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-clay-muted font-bold">التقدم في الدروس</span>
                    <span className="font-black text-clay-accent">{selectedStudent.progress}%</span>
                  </div>
                  <div className="w-full h-3 bg-white rounded-full overflow-hidden shadow-sm">
                    <div className="h-full bg-clay-accent transition-all duration-1000" style={{ width: `${selectedStudent.progress}%` }}></div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-clay-accent/5">
                      <p className="text-[10px] text-clay-muted font-bold mb-1">متوسط الواجبات</p>
                      <p className="text-lg font-black text-clay-accent" style={HEADING}>{selectedStudent.quiz_avg}%</p>
                    </div>
                    {selectedStudent.exams?.map((ex, idx) => (
                      <div key={idx} className="p-3 bg-white rounded-xl shadow-sm border border-clay-accent/5">
                        <p className="text-[10px] text-clay-muted font-bold mb-1">{ex.title}</p>
                        <p className="text-lg font-black text-emerald-600" style={HEADING}>{ex.percentage}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </ClayCard>
        </div>
      )}
    </div>
  )
}
