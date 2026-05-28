import React, { useState, useEffect, useMemo } from 'react'
import { BookOpen, Edit, Trash2, ListVideo, ImagePlus, Loader2, Search, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import ClayCard from '../../components/ui/ClayCard'
import ClayButton from '../../components/ui/ClayButton'
import ClayInput from '../../components/ui/ClayInput'
import ClaySelect from '../../components/ui/ClaySelect'
import ClayTextarea from '../../components/ui/ClayTextarea'
import { CoursesGridSkeleton } from '../../components/ui/SkeletonLoader'
import ClayBadge from '../../components/ui/ClayBadge'
import { fetchCourses, createCourse, updateCourse, deleteCourse, fetchSystemSettings as fetchSettings, uploadFile, getPublicUrl } from '../../lib/api'
import { useToast } from '../../context/ToastContext'
import { useConfirm } from '../../context/ConfirmContext'

const HEADING = { fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }

export default function ManageCoursesPage() {
  const [showForm, setShowForm] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [courses, setCourses] = useState([])
  const [grades, setGrades] = useState([])
  const [terms, setTerms] = useState([])
  const [gradeLabels, setGradeLabels] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('') // ✅ Fix 7 — Admin course search
  const toast = useToast()
  const confirm = useConfirm()

  // Form state
  const [formData, setFormData] = useState({
    title: '', description: '', short_desc: '', grade: '', term: '',
    price: '', original_price: '', color: 'from-violet-400 to-violet-600',
    thumbnail_url: ''
  })

  // Fetch courses + settings from Supabase
  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [coursesData, settings] = await Promise.all([
        fetchCourses(),
        fetchSettings()
      ])
      setCourses(coursesData)
      
      const g = Array.isArray(settings?.categories) 
        ? settings.categories.map(c => ({ value: c, label: c }))
        : []
      
      setGrades(g)
      setTerms([{ value: 'first', label: 'الترم الأول' }, { value: 'second', label: 'الترم الثاني' }])
      
      // Build label map from grades
      const labels = {}
      g.forEach(item => { labels[item.value] = item.label })
      setGradeLabels(labels)
    } catch (err) {
      toast.error('خطأ في تحميل البيانات: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredCourses = useMemo(() =>
    courses.filter(c =>
      !search || c.title?.includes(search) || c.description?.includes(search)
    ), [courses, search])

  // Reset form
  function resetForm() {
    setFormData({ title: '', description: '', short_desc: '', grade: grades[0]?.value || '', term: 'first', price: '', original_price: '', color: 'from-violet-400 to-violet-600', thumbnail_url: '' })
    setSelectedCourse(null)
  }

  // Open edit form
  function handleEdit(course) {
    setSelectedCourse(course)
    setFormData({
      title: course.title || '',
      description: course.description || '',
      short_desc: course.short_desc || '',
      grade: course.grade || (grades[0]?.value || ''),
      term: course.term || 'first',
      price: course.price || '',
      original_price: course.original_price || '',
      color: course.color || 'from-violet-400 to-violet-600',
      thumbnail_url: course.thumbnail_url || '',
    })
    setShowForm(true)
  }

  // Submit form (create or update)
  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...formData,
        price: parseInt(formData.price) || 0,
        original_price: parseInt(formData.original_price) || 0,
      }
      if (selectedCourse) {
        await updateCourse(selectedCourse.id, payload)
      } else {
        await createCourse(payload)
      }
      await loadData()
      setShowForm(false)
      resetForm()
      toast.success(selectedCourse ? 'تم تحديث الكورس بنجاح!' : 'تم إنشاء الكورس بنجاح!')
    } catch (err) {
      toast.error('حدث خطأ أثناء الحفظ: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Delete course
  async function handleDelete(id) {
    const ok = await confirm({ title: 'حذف الكورس', message: 'هل أنت متأكد؟ سيتم حذف كل الوحدات والدروس المرتبطة.', confirmText: 'حذف نهائياً', danger: true })
    if (!ok) return
    try {
      await deleteCourse(id)
      await loadData()
      toast.success('تم حذف الكورس')
    } catch (err) {
      toast.error('حدث خطأ أثناء الحذف: ' + err.message)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-black" style={HEADING}>إدارة الكورسات </h1>
          <button 
            onClick={loadData}
            className="p-2 rounded-xl hover:bg-clay-accent/5 text-clay-accent transition-colors flex items-center gap-2 text-xs font-bold"
            title="تحديث القائمة"
            disabled={loading}
          >
            <Loader2 size={14} className={loading ? 'animate-spin' : ''} /> تحديث
          </button>
        </div>
        <div className="flex items-center gap-3">
          {/* ✅ Admin Search */}
          <div className="relative">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-clay-muted" />
            <input
              type="text"
              placeholder="ابحث في الكورسات..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pr-9 pl-4 py-2 rounded-xl border border-clay-accent/20 bg-white/60 text-sm focus:outline-none focus:border-clay-accent"
            />
          </div>
          <ClayButton onClick={() => { setShowForm(!showForm); resetForm() }}>
            {showForm ? '✕ إلغاء' : '➕ إضافة كورس'}
          </ClayButton>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <ClayCard hover={false} className="mb-8">
          <h3 className="text-lg font-bold mb-6" style={HEADING}>
            {selectedCourse ? 'تعديل كورس' : 'إضافة كورس جديد'}
          </h3>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
            <ClayInput label="عنوان الكورس" placeholder="مثلاً: الرياضيات — 3 ثانوي" className="md:col-span-2"
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            <ClayTextarea label="وصف الكورس" placeholder="وصف تفصيلي..." rows={3} className="md:col-span-2"
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            <ClaySelect label="الصف الدراسي" options={grades}
              value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} />
            <ClaySelect label="الترم" options={terms}
              value={formData.term} onChange={e => setFormData({...formData, term: e.target.value})} />
            <ClayInput label="السعر (ج.م)" placeholder="200" type="number"
              value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            <ClayInput label="السعر الأصلي (ج.م)" placeholder="350" type="number"
              value={formData.original_price} onChange={e => setFormData({...formData, original_price: e.target.value})} />
            
            {/* Course Cover Image */}
            <div className="md:col-span-2 flex flex-col gap-2">
              <label className="text-sm font-bold text-clay-foreground" style={HEADING}>غلاف الكورس (اختياري)</label>
              <div className="flex items-center gap-3">
                <ClayInput 
                  placeholder="رابط صورة الغلاف..."
                  value={formData.thumbnail_url}
                  onChange={e => setFormData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                  className="flex-1"
                />
                <input 
                  type="file" 
                  id="cover-image-file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0]
                    if (!file) return
                    setUploading(true)
                    try {
                      const res = await uploadFile(file, `course-covers/${Date.now()}-${file.name}`)
                      const url = getPublicUrl(res.path)
                      setFormData(prev => ({ ...prev, thumbnail_url: url }))
                      toast.success('تم رفع الصورة بنجاح!')
                    } catch (err) { toast.error(err.message) }
                    finally { setUploading(false) }
                  }}
                />
                <ClayButton size="sm" variant="outline" type="button" onClick={() => document.getElementById('cover-image-file').click()} disabled={uploading}>
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <><Plus size={14}/> اختر صورة</>}
                </ClayButton>
              </div>
            </div>

            <div className="md:col-span-2 flex gap-3 justify-end">
              <ClayButton variant="outline" type="button" onClick={() => { setShowForm(false); resetForm() }}>إلغاء</ClayButton>
              <ClayButton type="submit" disabled={saving}>
                {saving ? <><Loader2 size={18} className="animate-spin inline ml-2" /> جاري الحفظ...</> : (selectedCourse ? 'حفظ التعديلات' : 'إضافة الكورس')}
              </ClayButton>
            </div>
          </form>
        </ClayCard>
      )}

      {/* Courses Table */}
      <ClayCard hover={false}>
        {loading ? (
          <div className="p-4"><CoursesGridSkeleton count={3} /></div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12 text-clay-muted">
            {courses.length === 0 ? 'لا توجد كورسات بعد. اضغط "إضافة كورس" للبدء.' : `لا توجد نتائج لـ "${search}"`}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-right text-clay-muted border-b border-clay-accent/10">
                  <th className="pb-3 font-bold">الكورس</th>
                  <th className="pb-3 font-bold">الصف</th>
                  <th className="pb-3 font-bold">السعر</th>
                  <th className="pb-3 font-bold">الحالة</th>
                  <th className="pb-3 font-bold text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map(course => (
                  <tr key={course.id} className="border-b border-clay-accent/5 last:border-0">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${course.color || 'from-violet-400 to-violet-600'} flex items-center justify-center text-white text-sm flex-shrink-0`}><BookOpen size={24} /></div>
                        <span className="font-bold">{course.title}</span>
                      </div>
                    </td>
                    <td className="py-4"><ClayBadge color="accent">{gradeLabels[course.grade] || course.grade}</ClayBadge></td>
                    <td className="py-4 font-bold" style={HEADING}>{course.price} ج.م</td>
                    <td className="py-4"><ClayBadge color={course.is_active ? 'success' : 'warning'}>{course.is_active ? 'نشط' : 'متوقف'}</ClayBadge></td>
                    <td className="py-4">
                      <div className="flex gap-2 justify-center">
                        <Link
                          to={`/admin/courses/${course.id}/content`}
                          className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center hover:bg-violet-100 transition-colors"
                          title="إدارة المحتوى"
                        >
                          <ListVideo size={18} />
                        </Link>
                        <button
                          onClick={() => handleEdit(course)}
                          className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                          title="تعديل الكورس" aria-label="تعديل الكورس"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors"
                          title="حذف الكورس" aria-label="حذف الكورس"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ClayCard>
    </div>
  )
}
