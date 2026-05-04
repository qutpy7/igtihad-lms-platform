import React, { useState, useEffect, useMemo } from 'react'
import { BookOpen, Users, Star, Book, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import ClayCard from '../../components/ui/ClayCard'
import ClayButton from '../../components/ui/ClayButton'
import ClayInput from '../../components/ui/ClayInput'
import ClaySelect from '../../components/ui/ClaySelect'
import ClayBadge from '../../components/ui/ClayBadge'
import SectionHeader from '../../components/ui/SectionHeader'
import { GRADES, TERMS } from '../../data/mockData'
import { fetchCourses } from '../../lib/api'
import { useRealtimeSync } from '../../lib/useRealtimeSync'

const HEADING = { fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }

const gradeLabels = {
  '3rd-sec': '3 ثانوي', '2nd-sec': '2 ثانوي', '1st-sec': '1 ثانوي',
  '3rd-prep': '3 إعدادي', '2nd-prep': '2 إعدادي', '1st-prep': '1 إعدادي',
}

export default function CoursesPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [search, setSearch] = useState('')
  const [grade, setGrade] = useState('')
  const [term, setTerm] = useState('')

  const loadCourses = async () => {
    try {
      setLoading(true)
      const data = await fetchCourses()
      setCourses(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [])

  // ⚡ Realtime: courses list updates when admin adds/edits courses
  useRealtimeSync('courses', loadCourses)

  const filtered = useMemo(() => {
    return courses.filter(c => {
      const title = c.title || ''
      const desc = c.description || ''
      if (search && !title.includes(search) && !desc.includes(search)) return false
      if (grade && c.grade !== grade) return false
      if (term && c.term !== term) return false
      return true
    })
  }, [search, grade, term, courses])

  const resetFilters = () => { setSearch(''); setGrade(''); setTerm('') }

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
      <SectionHeader title="تصفح الكورسات" subtitle="اختار الكورس المناسب ليك وابدأ فوراً" badge=" الكورسات" />

      {/* Filters */}
      <ClayCard hover={false} className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ClayInput
            placeholder="ابحث عن كورس..."
            icon="🔍"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <ClaySelect
            placeholder="كل الصفوف"
            options={GRADES}
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
          />
          <ClaySelect
            placeholder="كل الترمات"
            options={TERMS}
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
        </div>
      </ClayCard>

      {/* Results count */}
      {loading ? (
        <div className="text-center py-16 text-clay-muted font-bold text-xl"><Loader2 className="animate-spin mx-auto mb-4" size={32} />جاري تحميل الكورسات...</div>
      ) : (
        <>
          <p className="text-clay-muted font-medium mb-6">عرض {filtered.length} كورس</p>

          {/* Courses Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(course => {
                const originalPrice = course.original_price || course.price * 1.5
                const discount = Math.round((1 - course.price / originalPrice) * 100)
                
                return (
                  <Link key={course.id} to={`/courses/${course.id}`}>
                    <ClayCard className="h-full">
                      <div className={`-mx-6 -mt-6 sm:-mx-8 sm:-mt-8 h-36 relative overflow-hidden rounded-t-[32px] mb-5`}>
                        {course.thumbnail_url ? (
                          <img 
                            src={course.thumbnail_url} 
                            alt={course.title} 
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" 
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] flex items-center justify-center">
                            <span className="text-4xl"><BookOpen size={24} className="text-white" /></span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <ClayBadge color="accent">{gradeLabels[course.grade] || course.grade}</ClayBadge>
                        {course.is_featured && <ClayBadge color="warning"> مميز</ClayBadge>}
                      </div>
                      <h3 className="text-lg font-bold mb-2" style={HEADING}>{course.title}</h3>
                      <p className="text-clay-muted text-sm leading-relaxed mb-4 line-clamp-2">{course.description}</p>
                      <div className="flex items-center gap-4 text-xs text-clay-muted mb-4">
                        <span> {course.subject}</span>
                        <span> 5.0</span>
                      </div>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-clay-accent/10">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-black text-clay-accent" style={HEADING}>{course.price} ج.م</span>
                          <span className="text-sm text-clay-muted line-through">{originalPrice}</span>
                        </div>
                        {discount > 0 && <ClayBadge color="success">خصم {discount}%</ClayBadge>}
                      </div>
                    </ClayCard>
                  </Link>
                )
              })}
            </div>
          ) : (
            <ClayCard hover={false} className="text-center py-16">
              <span className="text-5xl mb-4 block">🔍</span>
              <h3 className="text-xl font-bold mb-2" style={HEADING}>مفيش كورسات مطابقة</h3>
              <p className="text-clay-muted mb-6">جرّب تغيّر الفلاتر أو البحث</p>
              <ClayButton variant="outline" onClick={resetFilters}>إعادة ضبط الفلاتر</ClayButton>
            </ClayCard>
          )}
        </>
      )}
    </section>
  )
}
