import React, { useState, useEffect } from 'react'
import { GraduationCap, FileText, BookOpen, Rocket, Star, CheckCircle, Book, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import ClayButton from '../../components/ui/ClayButton'
import ClayCard from '../../components/ui/ClayCard'
import ClayBadge from '../../components/ui/ClayBadge'
import StatOrb from '../../components/ui/StatOrb'
import IconOrb from '../../components/ui/IconOrb'
import SectionHeader from '../../components/ui/SectionHeader'
import { fetchCourses, fetchSystemSettings as fetchSettings, fetchAllCourseReviews, fetchPublicStats as fetchAdminStats } from '../../lib/api'

const HEADING = { fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }

/* ─── Featured Course Card ─── */
function CourseCard({ course, gradeLabels }) {
  return (
    <Link to={`/courses/${course.id}`}>
      <ClayCard className="h-full flex flex-col">
        {/* Header (Image or Gradient) */}
        <div className={`-mx-6 -mt-6 sm:-mx-8 sm:-mt-8 h-40 relative overflow-hidden rounded-t-[32px] mb-6`}>
          {course.thumbnail_url ? (
            <img 
              src={course.thumbnail_url} 
              alt={course.title} 
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" 
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${course.color || 'from-violet-400 to-violet-600'} flex items-center justify-center`}>
              <span className="text-5xl"><BookOpen size={24} className="text-white" /></span>
            </div>
          )}
        </div>
        <ClayBadge color="accent" className="mb-3 self-start">
          {gradeLabels[course.grade] || course.grade}
        </ClayBadge>
        <h3 className="text-xl font-bold mb-2" style={HEADING}>{course.title}</h3>
        <p className="text-clay-muted text-sm leading-relaxed mb-4 line-clamp-2">{course.short_desc}</p>
        <div className="flex items-center gap-4 text-xs text-clay-muted mb-4">
          <span> {course.lessonsCount || 0} درس</span>
          <span>⏱ {course.duration || '—'}</span>
        </div>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-clay-accent/10">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-clay-accent" style={HEADING}>{course.price} ج.م</span>
            {course.original_price > course.price && (
              <span className="text-sm text-clay-muted line-through">{course.original_price}</span>
            )}
          </div>
          <span className="text-sm font-bold text-clay-accent">عرض التفاصيل ←</span>
        </div>
      </ClayCard>
    </Link>
  )
}

/* ─── Testimonial Card ─── */
function TestimonialCard({ t }) {
  return (
    <ClayCard className="h-full flex flex-col">
      <div className="flex items-center gap-1 mb-3">
        {Array.from({ length: t.rating }).map((_, i) => <span key={i} className="text-amber-400"><Star size={16} fill="currentColor" /></span>)}
      </div>
      <p className="text-clay-foreground leading-relaxed mb-4 flex-1">"{t.text}"</p>
      <div className="flex items-center gap-3 mt-auto pt-4 border-t border-clay-accent/5">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {t.name.charAt(0)}
        </div>
        <div>
          <p className="font-bold text-sm" style={HEADING}>{t.name}</p>
          <p className="text-xs text-clay-muted">{t.grade}</p>
        </div>
      </div>
    </ClayCard>
  )
}

/* ═══ HOME PAGE ═══ */
export default function HomePage() {
  const [featuredCourses, setFeaturedCourses] = useState([])
  const [reviews, setReviews] = useState([])
  const [gradeLabels, setGradeLabels] = useState({})
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ activeCourses: 0, totalStudents: 0 })
  const [avgRating, setAvgRating] = useState(0)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [allCourses, settings, allReviews, adminStats] = await Promise.all([
        fetchCourses().catch(() => []),
        fetchSettings().catch(() => ({ categories: [] })),
        fetchAllCourseReviews().catch(() => []),
        fetchAdminStats().catch(() => ({ activeCourses: 0, totalStudents: 0 }))
      ])

      setFeaturedCourses((allCourses || []).filter(c => c.is_featured).slice(0, 3))
      setReviews((allReviews || []).filter(r => r.rating >= 4).slice(0, 3)) // top reviews only
      setStats(adminStats || { activeCourses: 0, totalStudents: 0 })

      // Calculate real average rating
      if (allReviews && allReviews.length > 0) {
        const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        setAvgRating(avg.toFixed(1))
      }

      // Map grades
      const labels = {}
      if (settings && settings.categories) {
        settings.categories.forEach(g => { labels[g] = g })
      }
      setGradeLabels(labels)

    } catch (err) {
      console.error('Error loading homepage data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[70vh] gap-3 text-clay-muted"><Loader2 size={28} className="animate-spin" /> جاري تحميل الصفحة...</div>

  return (
    <>
      {/* ═══ 1. HERO ═══ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-16 sm:pt-24 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-xl rounded-full px-5 py-2.5 shadow-clayCard mb-8">
          <span className="text-lg"><GraduationCap size={24} /></span>
          <span className="text-sm font-bold text-clay-accent tracking-wide" style={HEADING}>منصة تعليمية متكاملة</span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 clay-text-gradient leading-[1.1]" style={HEADING}>
          اجتهاد
          <br />
          <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl">تعلّم بأسلوب مختلف</span>
        </h1>

        <p className="text-lg sm:text-xl text-clay-muted font-medium max-w-2xl mx-auto leading-relaxed mb-10">
          منصة تعليمية تفاعلية مع الأستاذ أحمد. محتوى مميز، شرح مبسط، امتحانات تفاعلية، ونتائج حقيقية.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/signup">
            <ClayButton size="lg" className="w-full sm:w-auto">
              <span><Rocket size={24} /></span> ابدأ التعلم مجاناً
            </ClayButton>
          </Link>
          <Link to="/courses">
            <ClayButton variant="secondary" size="lg" className="w-full sm:w-auto">
              تصفح الكورسات
            </ClayButton>
          </Link>
        </div>
      </section>

      {/* ═══ 2. STATS ═══ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <StatOrb value={`+${stats.totalStudents}`} label="طالب نشط" color="violet" />
          <StatOrb value={stats.activeCourses} label="كورس متاح" color="pink" />
          <StatOrb value="+1K" label="ساعة محتوى" color="blue" />
          <StatOrb value={avgRating || '—'} label="تقييم الطلاب" color="green" />
        </div>
      </section>

      {/* ═══ 3. FEATURED COURSES ═══ */}
      {featuredCourses.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
          <SectionHeader title="الكورسات المميزة" subtitle="أكتر الكورسات طلباً على المنصة" badge=" الأكثر مبيعاً" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map(c => <CourseCard key={c.id} course={c} gradeLabels={gradeLabels} />)}
          </div>
          <div className="text-center mt-8">
            <Link to="/courses">
              <ClayButton variant="outline" size="lg">عرض كل الكورسات</ClayButton>
            </Link>
          </div>
        </section>
      )}

      {/* ═══ 4. HOW IT WORKS ═══ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16">
        <SectionHeader title="إزاي تبدأ؟" subtitle="3 خطوات بس وتبدأ رحلة التعلم" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { num: '1', emoji: <FileText size={24} />, title: 'سجّل حسابك', desc: 'أنشئ حساب مجاني في ثواني' },
            { num: '2', emoji: <BookOpen size={24} />, title: 'اختار كورسك', desc: 'تصفح الكورسات واختار اللي يناسبك' },
            { num: '3', emoji: <Rocket size={24} />, title: 'ابدأ تعلّم', desc: 'ادرس في أي وقت ومن أي مكان' },
          ].map((step) => (
            <ClayCard key={step.num} className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] flex items-center justify-center text-white text-2xl font-black mx-auto mb-4" style={HEADING}>
                {step.num}
              </div>
              <span className="text-3xl mb-3 block">{step.emoji}</span>
              <h3 className="text-xl font-bold mb-2" style={HEADING}>{step.title}</h3>
              <p className="text-clay-muted font-medium">{step.desc}</p>
            </ClayCard>
          ))}
        </div>
      </section>

      {/* ═══ 5. BENEFITS ═══ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <SectionHeader title="ليه تختار اجتهاد؟" subtitle="كل اللي محتاجه في مكان واحد" align="right" />
            <div className="flex flex-col gap-4">
              {[
                { icon: <CheckCircle size={24} />, text: 'شرح مبسط ومفصل لكل جزء في المنهج' },
                { icon: <CheckCircle size={24} />, text: 'امتحانات تفاعلية بعد كل درس لتقييم مستواك' },
                { icon: <CheckCircle size={24} />, text: 'ملازم PDF جاهزة للتحميل والطباعة' },
                { icon: <CheckCircle size={24} />, text: 'دعم مباشر مع المدرس في أي وقت' },
                { icon: <CheckCircle size={24} />, text: 'متابعة تقدمك خطوة بخطوة' },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/60 backdrop-blur-xl rounded-clay-sm p-4 shadow-clayCard">
                  <span className="text-xl">{b.icon}</span>
                  <span className="font-medium text-clay-foreground">{b.text}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Decorative Clay Composition */}
          <div className="hidden lg:flex items-center justify-center relative">
            <div className="w-64 h-64 rounded-[48px] bg-gradient-to-br from-[#A78BFA]/20 to-[#7C3AED]/20 shadow-clayCard flex items-center justify-center">
              <div className="w-40 h-40 rounded-[32px] bg-gradient-to-br from-[#EC4899]/20 to-[#DB2777]/20 shadow-clayCard flex items-center justify-center animate-clay-breathe">
                <div className="w-20 h-20 rounded-[20px] bg-gradient-to-br from-[#0EA5E9]/30 to-[#0EA5E9]/10 shadow-clayCard flex items-center justify-center">
                  <span className="text-3xl"><GraduationCap size={24} /></span>
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-clayButton flex items-center justify-center animate-clay-float text-2xl"><Star size={16} fill="currentColor" /></div>
            <div className="absolute -bottom-4 -left-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-clayButton flex items-center justify-center animate-clay-float-delayed text-xl"><Book size={24} /></div>
          </div>
        </div>
      </section>

      {/* ═══ 6. REAL REVIEWS ═══ */}
      {reviews.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-8 py-16">
          <SectionHeader title="رأي طلابنا" subtitle="تقييمات حقيقية من الطلاب" badge="⭐ آراء حقيقية" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map(r => (
              <TestimonialCard key={r.id} t={{
                id: r.id,
                name: r.profiles?.full_name || 'طالب',
                rating: r.rating,
                text: r.comment,
                grade: r.courses?.title || ''
              }} />
            ))}
          </div>
        </section>
      )}

      {/* ═══ 7. CTA ═══ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 py-12 mb-8">
        <ClayCard hover={false} className="text-center bg-gradient-to-br from-[#A78BFA]/10 to-[#7C3AED]/10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-clay-foreground mb-4" style={HEADING}>
            مستعد تبدأ رحلة التعلم؟ 
          </h2>
          <p className="text-clay-muted font-medium mb-8 max-w-lg mx-auto">
            انضم لمئات الطلاب اللي بيحققوا نتائج مميزة مع اجتهاد
          </p>
          <Link to="/signup">
            <ClayButton size="lg">
              <span><GraduationCap size={24} /></span> سجّل دلوقتي — مجاناً
            </ClayButton>
          </Link>
        </ClayCard>
      </section>
    </>
  )
}
