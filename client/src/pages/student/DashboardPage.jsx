import React, { useState, useEffect } from 'react'
import { FileText, BookOpen, Target, CreditCard, Bell, Star, CheckCircle, Book, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import ClayCard from '../../components/ui/ClayCard'
import ClayButton from '../../components/ui/ClayButton'
import IconOrb from '../../components/ui/IconOrb'
import { useAuth } from '../../context/AuthContext'
import { fetchEnrollments, fetchQuizzes, fetchStudentProgress, fetchQuizResults, fetchStudentProgressByCourse } from '../../lib/api'
import { useRealtimeMulti } from '../../lib/useRealtimeSync'

const HEADING = { fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }

export default function DashboardPage() {
  const { profile } = useAuth()
  const [enrolled, setEnrolled] = useState([])
  const [upcomingQuizzes, setUpcomingQuizzes] = useState([])
  const [completedLessonsCount, setCompletedLessonsCount] = useState(0)
  const [generalAverage, setGeneralAverage] = useState(0)
  const [loading, setLoading] = useState(true)

  const loadDashboardData = async () => {
    try {
      if (!profile?.id) return
      setLoading(true)
      
      // 1. Fetch Enrollments
      const enrolls = await fetchEnrollments(profile.id)
      
      // 2. Fetch Progress
      const completedLessonIds = await fetchStudentProgress(profile.id)
      setCompletedLessonsCount(completedLessonIds.length)

      // Calculate progress per course
      const progressMap = await fetchStudentProgressByCourse(profile.id)

      const coursesWithProgress = enrolls.map(enroll => {
        const course = enroll.courses
        return {
          ...course,
          firstLessonId: course.first_lesson_id,
          progress: progressMap[course.id] || 0
        }
      })
      setEnrolled(coursesWithProgress)

      // 3. Fetch all Quizzes and filter for enrolled courses
      const allQuizzes = await fetchQuizzes()
      const enrolledCourseIds = enrolls.map(e => e.course_id)
      const myQuizzes = allQuizzes.filter(q => enrolledCourseIds.includes(q.course_id))
      setUpcomingQuizzes(myQuizzes.slice(0, 3))

      // 4. Fetch Quiz Results to calculate average
      const results = await fetchQuizResults(profile.id)
      if (results.length > 0) {
        const totalScore = results.reduce((acc, curr) => acc + curr.score, 0)
        const totalPossible = results.reduce((acc, curr) => acc + curr.total, 0)
        setGeneralAverage(Math.round((totalScore / totalPossible) * 100))
      } else {
        setGeneralAverage(0)
      }

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (profile?.id) {
      loadDashboardData()
    } else if (profile === null) {
      setLoading(false)
    }
  }, [profile])

  // ⚡ Realtime: dashboard updates when courses, enrollments, or progress change
  useRealtimeMulti([
    { table: 'courses' },
    { table: 'enrollments' },
    { table: 'lesson_progress' },
  ], () => { if (profile?.id) loadDashboardData() })

  if (loading) return <div className="text-center py-12 text-clay-muted font-bold text-xl">جاري تحميل البيانات...</div>

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black mb-2" style={HEADING}>
          أهلاً يا {profile?.full_name?.split(' ')[0] || 'طالب'} <Sparkles className="inline text-[#A78BFA] mr-2" size={32} />
        </h1>
        <p className="text-clay-muted font-medium">
          {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: <BookOpen size={24} />, label: 'كورساتي النشطة', value: enrolled.length, color: 'from-violet-400 to-violet-600' },
          { icon: <CheckCircle size={24} />, label: 'دروس مكتملة', value: completedLessonsCount, color: 'from-emerald-400 to-emerald-600' },
          { icon: <FileText size={24} />, label: 'امتحانات قادمة', value: upcomingQuizzes.length, color: 'from-amber-400 to-amber-600' },
          { icon: <Star size={16} fill="currentColor" />, label: 'المعدل العام', value: `${generalAverage}%`, color: 'from-pink-400 to-pink-600' },
        ].map((stat, i) => (
          <ClayCard key={i} hover={false} className="!p-5">
            <div className="flex items-center gap-3 mb-3">
              <IconOrb emoji={stat.icon} color={stat.color} size="sm" />
              <span className="text-xs font-bold text-clay-muted">{stat.label}</span>
            </div>
            <span className="text-2xl font-black text-clay-foreground" style={HEADING}>{stat.value}</span>
          </ClayCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Continue Learning */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <ClayCard hover={false}>
            <h2 className="text-xl font-bold mb-5" style={HEADING}> كورساتك</h2>
            <div className="flex flex-col gap-4">
              {enrolled.length === 0 ? (
                <div className="text-center py-6 text-clay-muted bg-white/40 rounded-xl">لا توجد كورسات مشتركة حالياً. توجه للمدير لتفعيل كود أو شراء كورس.</div>
              ) : enrolled.map(course => (
                <div key={course.id} className="bg-white/60 rounded-clay-sm p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0`}>
                    {course.cover_url ? (
                      <img src={course.cover_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] flex items-center justify-center text-white">
                        <BookOpen size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm mb-1" style={HEADING}>{course.title}</h3>
                    <p className="text-xs text-clay-muted mb-2">{course.subject} - {course.grade}</p>
                    {/* Progress Bar (Mock for now until units/lessons are fetched) */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2.5 bg-[#EFEBF5] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#A78BFA] to-[#7C3AED] rounded-full transition-all duration-500"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-clay-accent" style={HEADING}>{course.progress}%</span>
                    </div>
                  </div>
                  <Link to={course.firstLessonId ? `/student/lesson/${course.firstLessonId}` : `/courses/${course.id}`}>
                    <ClayButton size="sm">تكملة المذاكرة</ClayButton>
                  </Link>
                </div>
              ))}
            </div>
          </ClayCard>
        </div>

        {/* Upcoming Quizzes */}
        <div className="lg:col-span-2">
          <ClayCard hover={false} className="h-full">
            <h2 className="text-xl font-bold mb-5" style={HEADING}> امتحانات قادمة</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-right text-clay-muted border-b border-clay-accent/10">
                    <th className="pb-3 font-bold">الامتحان</th>
                    <th className="pb-3 font-bold">الكورس</th>
                    <th className="pb-3 font-bold"></th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingQuizzes.length === 0 ? (
                    <tr><td colSpan="3" className="py-4 text-center text-clay-muted">لا توجد امتحانات قادمة</td></tr>
                  ) : upcomingQuizzes.map(q => (
                    <tr key={q.id} className="border-b border-clay-accent/5 last:border-0">
                      <td className="py-3 font-medium">{q.title}</td>
                      <td className="py-3 text-clay-muted">{q.courses?.title}</td>
                      <td className="py-3">
                        <Link to={`/student/quiz/${q.id}`}>
                          <ClayButton size="sm" variant="outline">ابدأ</ClayButton>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ClayCard>
        </div>
      </div>
    </div>
  )
}
