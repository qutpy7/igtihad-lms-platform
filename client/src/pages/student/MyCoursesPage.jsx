import React, { useState, useEffect } from 'react'
import { BookOpen, Backpack, Book } from 'lucide-react'
import { Link } from 'react-router-dom'
import ClayCard from '../../components/ui/ClayCard'
import ClayButton from '../../components/ui/ClayButton'
import { useAuth } from '../../context/AuthContext'
import { fetchEnrollments, fetchStudentProgress, fetchStudentProgressByCourse } from '../../lib/api'
import { useRealtimeMulti } from '../../lib/useRealtimeSync'

const HEADING = { fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }

export default function MyCoursesPage() {
  const { profile } = useAuth()
  const [filter, setFilter] = useState('all')
  const [enrolled, setEnrolled] = useState([])
  const [loading, setLoading] = useState(true)

  const loadCourses = async () => {
    try {
      if (!profile?.id) return
      setLoading(true)
      const enrolls = await fetchEnrollments(profile.id)
      
      // ✅ Fix 7.2: Get real progress percentages per course
      const progressMap = await fetchStudentProgressByCourse(profile.id)

      // Transform data
      const courses = enrolls.map(enroll => {
        const course = enroll.courses
        const progress = progressMap[course.id] || 0
        
        return {
          ...course,
          progress,
          firstLessonId: course.first_lesson_id,
          // Just as a fallback for color
          color: 'from-violet-400 to-violet-600'
        }
      })
      setEnrolled(courses)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (profile?.id) loadCourses()
    else if (profile === null) setLoading(false)
  }, [profile])

  // ⚡ Realtime: refresh when courses or enrollments change
  useRealtimeMulti([
    { table: 'courses' },
    { table: 'enrollments' },
    { table: 'lesson_progress' },
  ], () => { if (profile?.id) loadCourses() })

  const filtered = filter === 'all' ? enrolled
    : filter === 'active' ? enrolled.filter(c => c.progress < 100)
    : enrolled.filter(c => c.progress === 100)

  const tabs = [
    { value: 'all', label: 'الكل' },
    { value: 'active', label: 'قيد الدراسة' },
    { value: 'done', label: 'مكتملة' },
  ]

  return (
    <div>
      <h1 className="text-3xl font-black mb-6" style={HEADING}>كورساتي </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-5 py-2.5 rounded-clay-sm text-sm font-bold transition-all duration-200 ${
              filter === tab.value
                ? 'bg-clay-accent text-white shadow-clayButton'
                : 'bg-white/60 text-clay-muted hover:bg-clay-accent/10 hover:text-clay-accent shadow-clayCard'
            }`}
            style={HEADING}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="text-center py-12 text-clay-muted font-bold text-xl">جاري تحميل كورساتك...</div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(course => (
            <ClayCard key={course.id}>
              {/* Header */}
              <div className={`-mx-6 -mt-6 sm:-mx-8 sm:-mt-8 h-32 rounded-t-[32px] flex items-center justify-center mb-5 overflow-hidden ${!course.cover_url ? 'bg-gradient-to-br from-[#A78BFA] to-[#7C3AED]' : ''}`}>
                {course.cover_url ? (
                  <img src={course.cover_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl text-white"><BookOpen size={32} /></span>
                )}
              </div>

              <h3 className="text-lg font-bold mb-2" style={HEADING}>{course.title}</h3>
              <p className="text-sm text-clay-muted mb-4">{course.subject} - {course.grade}</p>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-clay-muted font-medium">التقدم</span>
                  <span className="font-black text-clay-accent" style={HEADING}>{course.progress}%</span>
                </div>
                <div className="h-3 bg-[#EFEBF5] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#A78BFA] to-[#7C3AED] rounded-full transition-all duration-700"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>

                <Link to={course.firstLessonId ? `/student/lesson/${course.firstLessonId}` : `/courses/${course.id}`}>
                  <ClayButton className="w-full">
                    {course.firstLessonId ? 'أكمل الدراسة ▶️' : 'تصفح محتوى الكورس'}
                  </ClayButton>
                </Link>
            </ClayCard>
          ))}
        </div>
      ) : (
        <ClayCard hover={false} className="text-center py-16">
          <span className="text-5xl mb-4 block">📭</span>
          <h3 className="text-xl font-bold mb-2" style={HEADING}>مفيش كورسات هنا</h3>
          <p className="text-clay-muted mb-6">
            {filter === 'done' ? 'لسه مخلصتش أي كورس' : 'مفيش كورسات في القسم ده'}
          </p>
          <Link to="/"><ClayButton variant="outline">تصفح الكورسات</ClayButton></Link>
        </ClayCard>
      )}
    </div>
  )
}
