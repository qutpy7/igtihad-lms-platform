import React, { useState, useEffect } from 'react'
import { Lock, FileText, Rocket, Users, Star, MessageCircle, Flame, Book, Loader2 } from 'lucide-react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import ClayCard from '../../components/ui/ClayCard'
import ClayButton from '../../components/ui/ClayButton'
import ClayBadge from '../../components/ui/ClayBadge'
import IconOrb from '../../components/ui/IconOrb'
import { fetchCourseWithCurriculum, checkEnrollment, enrollCourse, fetchCourseReviews, addCourseReview } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useConfirm } from '../../context/ConfirmContext'
import ClayTextarea from '../../components/ui/ClayTextarea'
import { useRealtimeMulti } from '../../lib/useRealtimeSync'

const HEADING = { fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }
const gradeLabels = { '3rd-sec': '3 ثانوي', '2nd-sec': '2 ثانوي', '1st-sec': '1 ثانوي', '3rd-prep': '3 إعدادي' }

export default function CourseDetailsPage() {
  const { id: idStr } = useParams()
  const id = parseInt(idStr, 10)  // ✅ Fix 4.3: useParams() returns string, DB needs bigint
  const navigate = useNavigate()
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [openUnit, setOpenUnit] = useState(0)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [reviews, setReviews] = useState([])
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const toast = useToast()
  const confirm = useConfirm()
  
  const loadCourse = async () => {
    try {
      setLoading(true)
      const data = await fetchCourseWithCurriculum(id)
      setCourse(data)
      
      if (user) {
        const enrolled = await checkEnrollment(user.id, data.id)
        setIsEnrolled(enrolled)
      } else {
        setIsEnrolled(false)
      }
      
      const courseReviews = await fetchCourseReviews(id)
      setReviews(courseReviews)
    } catch (err) {
      toast.error('خطأ في تحميل الكورس')
      setCourse(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourse()
  }, [id, user])

  // ⚡ Realtime: course content + reviews update live
  useRealtimeMulti([
    { table: 'courses' },
    { table: 'units' },
    { table: 'lessons' },
    { table: 'course_reviews', filter: { column: 'course_id', value: id } },
  ], loadCourse)

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!newReview.comment.trim()) return toast.warning('الرجاء كتابة تعليق')
    setSubmittingReview(true)
    try {
      const added = await addCourseReview({
        course_id: id,
        student_id: user.id,
        rating: newReview.rating,
        comment: newReview.comment.trim()
      })
      const updatedReviews = await fetchCourseReviews(id)
      setReviews(updatedReviews)
      setNewReview({ rating: 5, comment: '' })
      toast.success('تم إضافة تقييمك بنجاح! ⭐')
    } catch (err) {
      if (err.code === '23505') toast.warning('لقد قمت بتقييم هذا الكورس مسبقاً!')
      else toast.error('حدث خطأ أثناء حفظ التقييم: ' + err.message)
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleSubscribe = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    if (isEnrolled) {
      document.getElementById('curriculum')?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    
    const ok = await confirm({
      title: 'تأكيد الاشتراك',
      message: `سيتم خصم ${course.price} ج.م من رصيدك. هل أنت متأكد؟`,
      confirmText: 'اشترك الآن',
    })
    if (!ok) return
    
    setEnrolling(true)
    try {
      await enrollCourse(user.id, course.id, course.price)
      setIsEnrolled(true)
      toast.success('تم الاشتراك بنجاح! 🎉')
      navigate('/student')
    } catch (err) {
      if (err.message.includes('رصيدك غير كاف')) {
        const goPayments = await confirm({
          title: 'رصيد غير كافٍ',
          message: err.message + '\nهل ترغب في الذهاب لصفحة المدفوعات لشحن رصيدك؟',
          confirmText: 'شحن الرصيد',
        })
        if (goPayments) navigate('/student/payments')
      } else {
        toast.error('حدث خطأ: ' + err.message)
      }
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) {
    return <div className="text-center py-16 text-clay-muted font-bold text-xl"><Loader2 className="animate-spin mx-auto mb-4" size={32} />جاري تحميل الكورس...</div>
  }

  if (!course) {
    return (
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-16 text-center">
        <span className="text-5xl mb-4 block">😕</span>
        <h1 className="text-3xl font-black mb-4" style={HEADING}>الكورس مش موجود</h1>
        <Link to="/courses"><ClayButton>ارجع للكورسات</ClayButton></Link>
      </section>
    )
  }

  // Handle case where originalPrice might be undefined or 0
  const originalPrice = course.original_price || course.price * 1.5 // fallback
  const discount = Math.round((1 - course.price / originalPrice) * 100)
  const totalLessons = course.curriculum ? course.curriculum.reduce((sum, u) => sum + (u.lessons?.length || 0), 0) : 0

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
      {/* Hero */}
      <div className={`rounded-[40px] bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] p-8 sm:p-12 mb-10 text-white`}>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <ClayBadge color="accent" className="!bg-white/20 !text-white">{gradeLabels[course.grade] || course.grade}</ClayBadge>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={i < 5 ? 'text-amber-300' : 'text-white/30'}><Star size={16} fill="currentColor" /></span>
            ))}
            <span className="text-sm font-bold mr-1">5.0</span>
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4" style={HEADING}>{course.title}</h1>
        <div className="flex flex-wrap gap-6 text-sm font-medium">
          <span>{course.subject}</span>
          <span> {totalLessons} درس</span>
          <span>👨‍🏫 أ. أحمد</span>
        </div>
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Content — 3/5 */}
        <div className="lg:col-span-3 flex flex-col gap-8">
          {/* Description */}
          <ClayCard hover={false}>
            <h2 className="text-2xl font-bold mb-4" style={HEADING}>وصف الكورس</h2>
            <p className="text-clay-muted leading-relaxed text-lg whitespace-pre-wrap">{course.description || 'لا يوجد وصف متاح.'}</p>
          </ClayCard>

          {/* Curriculum Accordion */}
          <div id="curriculum">
            <ClayCard hover={false}>
              <h2 className="text-2xl font-bold mb-6" style={HEADING}>📋 محتوى المنهج</h2>
              <div className="flex flex-col gap-3">
              {course.curriculum && course.curriculum.map((unit, idx) => (
                <div key={unit.id} className="rounded-clay-sm overflow-hidden border border-clay-accent/10">
                  <button
                    onClick={() => setOpenUnit(openUnit === idx ? -1 : idx)}
                    className="w-full flex items-center justify-between p-4 bg-white/80 hover:bg-clay-accent/5 transition-colors text-right"
                  >
                    <div className="flex items-center gap-3">
                      <IconOrb emoji="📂" color="from-[#A78BFA] to-[#7C3AED]" size="sm" />
                      <span className="font-bold" style={HEADING}>{unit.title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-clay-muted">{unit.lessons?.length || 0} دروس</span>
                      <span className="text-clay-muted transition-transform duration-200" style={{ transform: openUnit === idx ? 'rotate(180deg)' : '' }}>▼</span>
                    </div>
                  </button>
                  {openUnit === idx && unit.lessons && (
                    <div className="bg-[#EFEBF5]/50 p-2">
                      {unit.lessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/60 transition-colors">
                          <div className="flex items-center gap-3">
                            {isEnrolled ? (
                              <>
                                <span className="text-lg text-clay-accent">▶️</span>
                                <Link 
                                  to={`/student/lesson/${lesson.id}`} 
                                  className="font-medium text-clay-foreground hover:text-clay-accent transition-colors"
                                  onClick={(e) => {
                                    // ✅ Fix 8: Check enrollment before allowing access
                                    if (!isEnrolled) {
                                      e.preventDefault()
                                      alert('يجب الاشتراك في الكورس أولاً')
                                    }
                                  }}
                                >
                                  {lesson.title}
                                </Link>
                              </>
                            ) : (
                              <>
                                <span className="text-lg"><Lock size={24} /></span>
                                <span className="font-medium text-clay-foreground">{lesson.title}</span>
                              </>
                            )}
                          </div>
                          {isEnrolled && (
                            <Link 
                              to={`/student/lesson/${lesson.id}`}
                              className="text-xs text-clay-accent hover:underline"
                            >
                              ابدأ الدرس ←
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              </div>
            </ClayCard>
          </div>

          {/* Reviews */}
          <ClayCard hover={false}>
            <h2 className="text-2xl font-bold mb-6" style={HEADING}>آراء الطلاب</h2>
            
            {isEnrolled && (
              <form onSubmit={handleReviewSubmit} className="mb-8 p-4 bg-clay-accent/5 rounded-2xl border border-clay-accent/10">
                <h3 className="font-bold mb-3 text-clay-foreground" style={HEADING}>أضف تقييمك للكورس</h3>
                <div className="flex gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                      className={`text-2xl transition-colors ${newReview.rating >= star ? 'text-amber-400' : 'text-slate-300'}`}
                    >
                      <Star size={24} fill="currentColor" />
                    </button>
                  ))}
                </div>
                <ClayTextarea 
                  placeholder="رأيك يهمنا..." 
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  rows={2}
                />
                <ClayButton size="sm" type="submit" className="mt-3" disabled={submittingReview}>
                  {submittingReview ? <Loader2 size={16} className="animate-spin" /> : 'نشر التقييم'}
                </ClayButton>
              </form>
            )}

            <div className="flex flex-col gap-4">
              {reviews.length === 0 ? (
                <p className="text-clay-muted text-center py-6">لا توجد تقييمات حتى الآن. كن أول من يقيّم!</p>
              ) : (
                reviews.map(t => (
                  <div key={t.id} className="bg-white/60 rounded-clay-sm p-4 border border-slate-100">
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: t.rating }).map((_, i) => <span key={i} className="text-amber-400 text-sm"><Star size={16} fill="currentColor" /></span>)}
                      {Array.from({ length: 5 - t.rating }).map((_, i) => <span key={i} className="text-slate-200 text-sm"><Star size={16} fill="currentColor" /></span>)}
                    </div>
                    <p className="text-clay-foreground mb-3">"{t.comment}"</p>
                    <p className="text-sm font-bold text-clay-muted">{t.profiles?.full_name} — {gradeLabels[t.profiles?.grade] || t.profiles?.grade}</p>
                  </div>
                ))
              )}
            </div>
          </ClayCard>
        </div>

        {/* Sidebar — 2/5 */}
        <div className="lg:col-span-2">
          <div className="sticky top-28">
            <ClayCard hover={false}>
              {/* Preview */}
              <div className={`-mx-6 -mt-6 sm:-mx-8 sm:-mt-8 h-44 relative overflow-hidden rounded-t-[32px] mb-6`}>
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] flex items-center justify-center`}>
                    <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center text-3xl backdrop-blur-sm">▶️</div>
                  </div>
                )}
                {!course.thumbnail_url && <div className="absolute inset-0 bg-black/10"></div>}
                {course.thumbnail_url && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center text-3xl backdrop-blur-sm">▶️</div>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl font-black text-clay-accent" style={HEADING}>{course.price} ج.م</span>
                <span className="text-lg text-clay-muted line-through">{originalPrice} ج.م</span>
              </div>
              <ClayBadge color="success" className="mb-6">خصم {discount}% </ClayBadge>

              {/* CTA */}
              <ClayButton size="lg" className="w-full mb-4" onClick={handleSubscribe} disabled={enrolling || (loading && !course)}>
                {enrolling ? <Loader2 className="animate-spin mx-auto" /> : 
                 !user ? 'سجل دخول للاشتراك' : 
                 isEnrolled ? 'تصفح المنهج بالأسفل 👇' : 'اشترك الآن'}
              </ClayButton>

              {/* Includes */}
              <div className="mt-6 pt-6 border-t border-clay-accent/10">
                <h4 className="font-bold mb-4" style={HEADING}>الكورس يتضمن:</h4>
                <div className="flex flex-col gap-3 text-sm text-clay-foreground">
                  <div className="flex items-center gap-3"><span>📹</span> {totalLessons} فيديو شرح</div>
                  <div className="flex items-center gap-3"><span>📄</span> ملازم PDF لكل درس</div>
                  <div className="flex items-center gap-3"><span><FileText size={24} /></span> امتحانات تفاعلية</div>
                  <div className="flex items-center gap-3"><span>🏆</span> شهادة إتمام</div>
                  <div className="flex items-center gap-3"><span><MessageCircle size={24} /></span> دعم مباشر</div>
                  <div className="flex items-center gap-3"><span>♾️</span> وصول مدى الحياة</div>
                </div>
              </div>
            </ClayCard>
          </div>
        </div>
      </div>
    </section>
  )
}
