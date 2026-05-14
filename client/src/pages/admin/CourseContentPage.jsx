import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowRight, Plus, Video, FileText, Edit, Trash2, GripVertical, HelpCircle, ImagePlus, Loader2 } from 'lucide-react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import ClayCard from '../../components/ui/ClayCard'
import ClayButton from '../../components/ui/ClayButton'
import ClayInput from '../../components/ui/ClayInput'
import ClaySelect from '../../components/ui/ClaySelect'
import {
  fetchCourseById,
  fetchUnits,
  fetchLessonsByUnit,
  createUnit,
  updateUnit,
  deleteUnit,
  createLesson,
  updateLesson,
  deleteLesson,
  updateLessonOrder,
  fetchLessonQuestions,
  createLessonQuestion,
  deleteLessonQuestion,
  uploadFile,
  getPublicUrl
} from '../../lib/api'
import { useToast } from '../../context/ToastContext'
import { useConfirm } from '../../context/ConfirmContext'

const HEADING = { fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }

function SortableLesson({ lesson, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lesson.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 10 : 1, position: 'relative' };

  const isPdf = lesson.type === 'pdf'
  const isQuiz = lesson.type === 'quiz'
  let icon = <Video size={20} />
  let colorClass = 'bg-gradient-to-br from-violet-400 to-violet-600'
  let typeText = 'فيديو'
  if (isPdf) { icon = <FileText size={20} />; colorClass = 'bg-gradient-to-br from-rose-400 to-rose-600'; typeText = 'ملف PDF' }
  else if (isQuiz) { icon = <HelpCircle size={20} />; colorClass = 'bg-gradient-to-br from-amber-400 to-amber-600'; typeText = 'واجب / أسئلة' }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-4 p-3 bg-white/50 rounded-xl hover:bg-white/80 transition-colors border border-transparent hover:border-clay-accent/10 group mb-2">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 touch-none">
        <GripVertical size={18} className="text-clay-muted opacity-50 group-hover:opacity-100" />
      </div>
      <div className={`w-12 h-10 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0 ${colorClass}`}>{icon}</div>
      <div className="flex-1">
        <h3 className="font-bold text-sm text-clay-foreground">{lesson.title}</h3>
        <p className="text-xs text-clay-muted mt-0.5">{lesson.duration} • {typeText}</p>
      </div>
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button aria-label="تعديل الدرس" onClick={() => onEdit(lesson, isQuiz, isPdf)} className="w-8 h-8 rounded-lg bg-white text-blue-600 flex items-center justify-center shadow-sm hover:scale-105 transition-transform" title="تعديل الدرس"><Edit size={16} /></button>
        <button aria-label="حذف الدرس" onClick={() => onDelete(lesson)} className="w-8 h-8 rounded-lg bg-white text-red-600 flex items-center justify-center shadow-sm hover:scale-105 transition-transform" title="حذف الدرس"><Trash2 size={16} /></button>
      </div>
    </div>
  )
}

export default function CourseContentPage() {
  const { id } = useParams()
  const toast = useToast()
  const confirm = useConfirm()
  const [course, setCourse] = useState(null)
  const [units, setUnits] = useState([])
  const [lessonsByUnit, setLessonsByUnit] = useState({})
  const [loading, setLoading] = useState(true)

  const [showLessonModal, setShowLessonModal] = useState(false)
  const [showUnitModal, setShowUnitModal] = useState(false)
  const [selectedType, setSelectedType] = useState('video')
  const [currentUnitId, setCurrentUnitId] = useState(null)
  const [editingLessonId, setEditingLessonId] = useState(null)
  const [lessonForm, setLessonForm] = useState({
    title: '',
    content_url: '',
    attachment_url: '',
    content: '',
    duration: '',
    type: 'video',
    thumbnail_url: '',
    allow_retake: true
  })
  const [uploading, setUploading] = useState(false)
  const [savingLesson, setSavingLesson] = useState(false)
  const [editingUnitId, setEditingUnitId] = useState(null)
  const [unitForm, setUnitForm] = useState({
    title: '',
    thumbnail_url: ''
  })
  const [savingUnit, setSavingUnit] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Load course + units + lessons from Supabase
  useEffect(() => { loadData() }, [id])

  async function loadData() {
    setLoading(true)
    try {
      const courseData = await fetchCourseById(parseInt(id))
      setCourse(courseData)
      const unitsData = await fetchUnits(parseInt(id))
      setUnits(unitsData)
      if (unitsData.length > 0) {
        const unitIds = unitsData.map(u => u.id)
        const lessonsData = await fetchLessonsByUnit(unitIds)
        const grouped = {}
        unitsData.forEach(u => { grouped[u.id] = [] })
        lessonsData.forEach(l => { if (grouped[l.unit_id]) grouped[l.unit_id].push(l) })
        setLessonsByUnit(grouped)
      }
    } catch (err) { toast.error('خطأ في تحميل المحتوى: ' + err.message) }
    finally { setLoading(false) }
  }

  const handleDragEnd = async (event, unitId) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const lessons = [...(lessonsByUnit[unitId] || [])]
      const oldIndex = lessons.findIndex(l => l.id === active.id)
      const newIndex = lessons.findIndex(l => l.id === over.id)
      const reordered = arrayMove(lessons, oldIndex, newIndex)
      setLessonsByUnit(prev => ({ ...prev, [unitId]: reordered }))
      try { await updateLessonOrder(reordered) } catch (err) { toast.error('خطأ في حفظ الترتيب: ' + err.message) }
    }
  }

  // Inline Quiz Builder state
  const [showQuizBuilder, setShowQuizBuilder] = useState(false)
  const [quizBuilderLessonId, setQuizBuilderLessonId] = useState(null)
  const [quizBuilderLessonTitle, setQuizBuilderLessonTitle] = useState('')
  const [quizQuestions, setQuizQuestions] = useState([])
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [savingQuestion, setSavingQuestion] = useState(false)
  const [newQuestion, setNewQuestion] = useState({
    question: '', options: ['', '', '', ''], correctAnswer: 0
  })

  // Lock background scroll when modal is open
  useEffect(() => {
    if (showLessonModal || showUnitModal || showQuizBuilder) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [showLessonModal, showUnitModal, showQuizBuilder])

  const openQuizBuilder = async (lessonId, lessonTitle) => {
    setQuizBuilderLessonId(lessonId)
    setQuizBuilderLessonTitle(lessonTitle)
    setShowQuizBuilder(true)
    setShowQuestionForm(false)
    setNewQuestion({ question: '', options: ['', '', '', ''], correctAnswer: 0 })
    setLoadingQuestions(true)
    try {
      const data = await fetchLessonQuestions(lessonId)
      setQuizQuestions(data)
    } catch (err) {
      toast.error('خطأ في تحميل الأسئلة: ' + err.message)
    } finally {
      setLoadingQuestions(false)
    }
  }

  const handleAddQuestion = async (e) => {
    e.preventDefault()
    if (!newQuestion.question.trim() || newQuestion.options.some(o => !o.trim())) {
      toast.warning('الرجاء ملء نص السؤال وجميع الخيارات')
      return
    }
    setSavingQuestion(true)
    try {
      const saved = await createLessonQuestion({
        lesson_id: quizBuilderLessonId,
        question: newQuestion.question.trim(),
        options: newQuestion.options.map(o => o.trim()),
        correct_answer: newQuestion.correctAnswer,
        sort_order: quizQuestions.length
      })
      setQuizQuestions(prev => [...prev, saved])
      setNewQuestion({ question: '', options: ['', '', '', ''], correctAnswer: 0 })
      setShowQuestionForm(false)
      toast.success('تم إضافة السؤال!')
    } catch (err) {
      toast.error('خطأ أثناء حفظ السؤال: ' + err.message)
    } finally {
      setSavingQuestion(false)
    }
  }

  const handleDeleteQuestion = async (qId) => {
    const ok = await confirm({ title: 'حذف السؤال', message: 'هل أنت متأكد من حذف هذا السؤال؟', confirmText: 'حذف', danger: true })
    if (!ok) return
    try {
      await deleteLessonQuestion(qId)
      setQuizQuestions(prev => prev.filter(q => q.id !== qId))
      toast.success('تم حذف السؤال')
    } catch (err) {
      toast.error('خطأ أثناء الحذف: ' + err.message)
    }
  }

  if (loading) return <div className="flex items-center justify-center py-20 gap-3 text-clay-muted"><Loader2 size={28} className="animate-spin" /> جاري التحميل...</div>
  if (!course) return <div className="text-center py-20 text-clay-muted">الكورس غير موجود</div>

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/courses" className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center hover:bg-white transition-colors shadow-sm">
          <ArrowRight size={20} className="text-clay-muted" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-clay-foreground" style={HEADING}>محتوى: {course.title}</h1>
          <p className="text-clay-muted mt-1">بناء المنهج وترتيب الوحدات والدروس</p>
        </div>
        <div className="flex-1" />
        <ClayButton onClick={() => {
          setEditingUnitId(null)
          setUnitForm({ title: '', thumbnail: '' })
          setShowUnitModal(true)
        }}><Plus size={18} className="ml-2 inline" /> إضافة وحدة جديدة</ClayButton>
      </div>

      <div className="flex flex-col gap-6">
        {units.map((unit, uIdx) => {
          const unitLessons = lessonsByUnit[unit.id] || []
          return (
            <ClayCard key={unit.id} hover={false} className="!p-0 overflow-hidden">
              <div className="bg-gradient-to-r from-clay-accent/10 to-transparent p-4 flex items-center justify-between border-b border-clay-accent/10">
                <h2 className="text-xl font-bold text-clay-foreground flex items-center gap-3" style={HEADING}>
                  <span className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-clay-accent text-sm">{uIdx + 1}</span>
                  {unit.title}
                </h2>
                <div className="flex gap-2">
                  <button aria-label="تعديل الوحدة" onClick={() => {
                    setEditingUnitId(unit.id)
                    setUnitForm({ title: unit.title || '', thumbnail_url: unit.thumbnail_url || '' })
                    setShowUnitModal(true)
                  }} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors" title="تعديل الوحدة"><Edit size={16} /></button>
                  <button aria-label="حذف الوحدة" onClick={async () => {
                    const ok = await confirm({ title: 'حذف الوحدة', message: `هل أنت متأكد من حذف وحدة "${unit.title}" وكل محتوياتها؟`, confirmText: 'حذف', danger: true })
                    if (!ok) return
                    try {
                      await deleteUnit(unit.id)
                      toast.success('تم حذف الوحدة')
                      loadData()
                    } catch (err) { toast.error('خطأ في الحذف: ' + err.message) }
                  }} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors" title="حذف الوحدة"><Trash2 size={16} /></button>
                </div>
              </div>

              <div className="p-4 flex flex-col gap-0">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, unit.id)}>
                  <SortableContext items={unitLessons.map(l => l.id)} strategy={verticalListSortingStrategy}>
                    {unitLessons.map((lesson) => (
                      <SortableLesson
                        key={lesson.id}
                        lesson={lesson}
                        onEdit={(l, isQuiz, isPdf) => {
                          if (isQuiz) {
                            openQuizBuilder(l.id, l.title)
                          } else {
                            setEditingLessonId(l.id)
                            setLessonForm({
                              title: l.title || '',
                              content_url: l.content_url || '',
                              attachment_url: l.attachment_url || '',
                              content: l.content || '',
                              duration: l.duration || '',
                              type: l.type || 'video',
                              thumbnail_url: l.thumbnail_url || '',
                              allow_retake: l.allow_retake !== 0
                            })
                            setSelectedType(l.type || (isPdf ? 'pdf' : 'video'))
                            setCurrentUnitId(unit.id)
                            setShowLessonModal(true)
                          }
                        }}
                        onDelete={async (l) => {
                          const ok = await confirm({ title: 'حذف الدرس', message: `هل أنت متأكد من حذف درس "${l.title}"؟`, confirmText: 'حذف', danger: true })
                          if (!ok) return
                          try {
                            await deleteLesson(l.id)
                            toast.success('تم حذف الدرس بنجاح')
                            loadData()
                          } catch (err) { toast.error('خطأ في الحذف: ' + err.message) }
                        }}
                      />
                    ))}
                  </SortableContext>
                </DndContext>

                <button onClick={() => {
                  setEditingLessonId(null);
                  setLessonForm({ title: '', content_url: '', attachment_url: '', content: '', duration: '', type: 'video', thumbnail_url: '' });
                  setSelectedType('video');
                  setCurrentUnitId(unit.id);
                  setShowLessonModal(true)
                }} className="mt-2 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-clay-accent/20 rounded-xl text-clay-accent font-bold hover:bg-clay-accent/5 hover:border-clay-accent/40 transition-colors">
                  <Plus size={18} />
                  إضافة درس جديد هنا
                </button>
              </div>
            </ClayCard>
          )
        })}
      </div>

      {/* Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <form 
            className="w-full max-w-xl shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden rounded-[32px] bg-clay-cardBg text-clay-foreground shadow-clayCard backdrop-blur-xl"
            onSubmit={async (e) => {
              e.preventDefault()
              setSavingLesson(true)
              try {
                const payload = {
                  ...lessonForm,
                  unit_id: currentUnitId,
                  type: selectedType,
                  allow_retake: lessonForm.allow_retake ? 1 : 0,
                  sort_order: editingLessonId ? lessonForm.sort_order : (lessonsByUnit[currentUnitId]?.length || 0)
                }

                if (editingLessonId) {
                  await updateLesson(editingLessonId, payload)
                  toast.success('تم تحديث الدرس!')
                } else {
                  await createLesson(payload)
                  toast.success('تم إضافة الدرس!')
                }
                setShowLessonModal(false)
                loadData()
              } catch (err) {
                toast.error('خطأ في الحفظ: ' + err.message)
              } finally {
                setSavingLesson(false)
              }
            }}
          >
            {/* Modal Header - Fixed */}
            <div className="p-6 border-b border-clay-accent/10 flex items-center justify-between flex-shrink-0 relative z-10">
              <h3 className="text-xl font-bold" style={HEADING}>{editingLessonId ? 'تعديل الدرس' : 'إضافة درس جديد'}</h3>
              <button aria-label="إغلاق" type="button" onClick={() => setShowLessonModal(false)} className="text-clay-muted hover:text-red-500 transition-colors">✕</button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 min-h-0 custom-scrollbar">
              <ClayInput
                label="عنوان الدرس / التطبيق"
                placeholder="مثلاً: حل تمارين على كذا..."
                value={lessonForm.title}
                onChange={e => setLessonForm(prev => ({ ...prev, title: e.target.value }))}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-clay-foreground" style={HEADING}>نوع المحتوى</label>
                  <select
                    className="p-3 rounded-xl bg-white/50 border-2 border-white focus:border-clay-accent focus:outline-none focus:ring-4 focus:ring-clay-accent/10 transition-all font-medium text-clay-foreground"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    <option value="video">فيديو يوتيوب / شرح</option>
                    <option value="pdf">ملف PDF / مذكرة</option>
                    <option value="quiz">واجب / امتحان للدرس</option>
                  </select>
                </div>

                <ClayInput
                  label={selectedType === 'quiz' ? 'مدة الواجب (بالدقائق)' : 'مدة الدرس (إن وجد)'}
                  placeholder="30"
                  value={lessonForm.duration}
                  onChange={e => setLessonForm(prev => ({ ...prev, duration: e.target.value }))}
                />
              </div>

              {selectedType !== 'quiz' && (
                <div className="flex flex-col gap-2 p-4 bg-clay-accent/5 rounded-2xl border border-clay-accent/10">
                  <ClayInput 
                    label="رابط المحتوى (URL)" 
                    placeholder="https://youtube.com/... أو رابط الـ Drive" 
                    value={lessonForm.content_url}
                    onChange={e => setLessonForm(prev => ({ ...prev, content_url: e.target.value }))}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-clay-muted">أو ارفع ملف من جهازك:</span>
                    <input 
                      type="file" 
                      id="content-file" 
                      className="hidden" 
                      onChange={async (e) => {
                        const file = e.target.files[0]
                        if (!file) return
                        setUploading(true)
                        try {
                          const res = await uploadFile(file)
                          const url = getPublicUrl(res.path)
                          setLessonForm(prev => ({ ...prev, content_url: url }))
                          toast.success('تم رفع الملف بنجاح!')
                        } catch (err) { toast.error(err.message) }
                        finally { setUploading(false) }
                      }}
                    />
                    <ClayButton size="sm" variant="outline" type="button" onClick={() => document.getElementById('content-file').click()} disabled={uploading}>
                      {uploading ? <Loader2 size={14} className="animate-spin" /> : <><Plus size={14}/> اختر ملف</>}
                    </ClayButton>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-clay-foreground" style={HEADING}>وصف الدرس / ملاحظات</label>
                <textarea 
                  className="flex w-full border-0 bg-[#EFEBF5] px-6 py-4 min-h-[80px] text-clay-foreground text-base rounded-2xl shadow-clayPressed focus:bg-white focus:ring-4 focus:ring-clay-accent/20 focus:outline-none transition-all duration-200"
                  placeholder="اكتب وصفاً للدرس أو ملاحظات تظهر للطالب..."
                  value={lessonForm.content}
                  onChange={e => setLessonForm(prev => ({ ...prev, content: e.target.value }))}
                />
              </div>

              {selectedType === 'video' && (
                <div className="flex flex-col gap-2 p-4 bg-violet-50 rounded-2xl border border-violet-100">
                  <label className="text-sm font-bold text-violet-800" style={HEADING}>ملف مرفق للدرس (اختياري)</label>
                  <p className="text-xs text-violet-600 mb-1">مثل ملزمة الدرس أو ملف PDF إضافي</p>
                  <div className="flex items-center gap-3">
                    <ClayInput 
                      placeholder="رابط الملف المرفق..." 
                      value={lessonForm.attachment_url}
                      onChange={e => setLessonForm(prev => ({ ...prev, attachment_url: e.target.value }))}
                      className="flex-1"
                    />
                    <input 
                      type="file" 
                      id="attachment-file" 
                      className="hidden" 
                      onChange={async (e) => {
                        const file = e.target.files[0]
                        if (!file) return
                        setUploading(true)
                        try {
                          const res = await uploadFile(file)
                          const url = getPublicUrl(res.path)
                          setLessonForm(prev => ({ ...prev, attachment_url: url }))
                          toast.success('تم رفع المرفق بنجاح!')
                        } catch (err) { toast.error(err.message) }
                        finally { setUploading(false) }
                      }}
                    />
                    <button aria-label="اختر ملف مرفق" type="button" onClick={() => document.getElementById('attachment-file').click()} disabled={uploading} className="p-3 rounded-xl bg-white text-clay-accent border border-clay-accent/20 hover:bg-clay-accent/5 transition-colors">
                      {uploading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18}/>}
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="flex items-center gap-2 p-3 bg-clay-accent/5 rounded-xl border border-clay-accent/10">
                  <input 
                    type="checkbox" 
                    id="allow_retake" 
                    checked={lessonForm.allow_retake}
                    onChange={e => setLessonForm(prev => ({ ...prev, allow_retake: e.target.checked }))}
                    className="w-5 h-5 rounded-lg border-2 border-clay-accent text-clay-accent focus:ring-clay-accent"
                  />
                  <label htmlFor="allow_retake" className="text-sm font-bold text-clay-foreground cursor-pointer" style={HEADING}>
                    إعادة المحاولة (Retake)
                  </label>
                </div>

                <div className="flex flex-col gap-1">
                  <ClayInput
                    placeholder="رابط الصورة المصغرة..."
                    value={lessonForm.thumbnail_url}
                    onChange={e => setLessonForm(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                    label="صورة مصغرة (رابط)"
                  />
                </div>
              </div>

              {selectedType === 'quiz' && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <h4 className="font-bold text-amber-800 mb-1 flex items-center gap-2" style={HEADING}><HelpCircle size={18} /> بناء أسئلة الواجب</h4>
                  <p className="text-xs text-amber-700">بعد حفظ الدرس، افتحه من القائمة لإضافة الأسئلة عبر محرر الأسئلة.</p>
                </div>
              )}
            </div>

            {/* Modal Footer - Fixed */}
            <div className="p-6 border-t border-clay-accent/10 flex gap-3 justify-end flex-shrink-0 relative z-10 bg-white/50 backdrop-blur-md">
              <ClayButton variant="outline" type="button" onClick={() => setShowLessonModal(false)}>إلغاء</ClayButton>
              <ClayButton type="submit" disabled={savingLesson}>
                {savingLesson ? <Loader2 size={18} className="animate-spin" /> : 'حفظ الدرس'}
              </ClayButton>
            </div>
          </form>
        </div>
      )}

      {/* Unit Modal */}
      {showUnitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <ClayCard hover={false} className="w-full max-w-md shadow-2xl relative">
            <button aria-label="إغلاق" onClick={() => setShowUnitModal(false)} className="absolute top-4 left-4 text-clay-muted hover:text-red-500">✕</button>
            <h3 className="text-xl font-bold mb-6" style={HEADING}>{editingUnitId ? 'تعديل الوحدة' : 'إضافة وحدة جديدة'}</h3>

            <form className="flex flex-col gap-4" onSubmit={async (e) => {
              e.preventDefault();
              setSavingUnit(true);
              try {
                if (editingUnitId) {
                  await updateUnit(editingUnitId, unitForm)
                  toast.success('تم تحديث الوحدة')
                } else {
                  await createUnit({ ...unitForm, course_id: parseInt(id), sort_order: units.length })
                  toast.success('تم إضافة الوحدة')
                }
                setShowUnitModal(false)
                loadData()
              } catch (err) {
                toast.error('خطأ في الحفظ: ' + err.message)
              } finally {
                setSavingUnit(false)
              }
            }}>
              <ClayInput
                label="اسم الوحدة"
                placeholder="مثلاً: الوحدة الثانية: التفاضل والتكامل"
                value={unitForm.title}
                onChange={e => setUnitForm(prev => ({ ...prev, title: e.target.value }))}
                required
              />

              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-clay-foreground" style={HEADING}>صورة الوحدة (اختياري)</label>
                <ClayInput
                  placeholder="رابط صورة الوحدة..."
                  value={unitForm.thumbnail_url}
                  onChange={e => setUnitForm(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                />
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <ClayButton variant="outline" type="button" onClick={() => setShowUnitModal(false)}>إلغاء</ClayButton>
                <ClayButton type="submit" disabled={savingUnit}>
                  {savingUnit ? <Loader2 size={18} className="animate-spin" /> : 'حفظ الوحدة'}
                </ClayButton>
              </div>
            </form>
          </ClayCard>
        </div>
      )}

      {/* Inline Quiz Builder Modal */}
      {showQuizBuilder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
          <ClayCard hover={false} className="w-full max-w-4xl shadow-2xl relative h-[85vh] flex flex-col !p-0 overflow-hidden">
            <div className="p-4 bg-amber-50 border-b border-amber-100 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-xl font-bold text-amber-800 flex items-center gap-2" style={HEADING}><HelpCircle size={24} /> محرر الأسئلة</h3>
                <p className="text-sm text-amber-700 mt-1">درس: {quizBuilderLessonTitle}</p>
              </div>
              <button aria-label="إغلاق محرر الأسئلة" onClick={() => setShowQuizBuilder(false)} className="w-8 h-8 rounded-lg bg-white/50 text-amber-800 flex items-center justify-center hover:bg-white transition-colors">✕</button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-bold text-lg" style={HEADING}>الأسئلة الحالية ({quizQuestions.length})</h4>
                <ClayButton size="sm" onClick={() => setShowQuestionForm(true)}><Plus size={16} className="inline ml-1" /> إضافة سؤال جديد</ClayButton>
              </div>

              {loadingQuestions ? (
                <div className="flex items-center justify-center py-10"><Loader2 size={28} className="animate-spin text-amber-500" /></div>
              ) : quizQuestions.length === 0 && !showQuestionForm ? (
                <div className="text-center py-10 text-clay-muted">لم يتم إضافة أي أسئلة لهذا الواجب بعد.</div>
              ) : (
                <div className="flex flex-col gap-4">
                  {quizQuestions.map((q, idx) => (
                    <div key={q.id} className="bg-white rounded-2xl p-5 shadow-sm border border-clay-accent/10">
                      <p className="font-bold text-base mb-4" style={HEADING}>
                        <span className="text-amber-500 ml-2">س{idx + 1}.</span> {q.question}
                      </p>
                      <div className="grid grid-cols-2 gap-3 mr-6">
                        {(q.options || []).map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className={`text-sm p-3 rounded-xl flex items-center gap-2 ${optIdx === q.correct_answer
                                ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                                : 'bg-slate-50 text-clay-muted border border-transparent'
                              }`}
                          >
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs ${optIdx === q.correct_answer ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-500'}`}>
                              {['أ', 'ب', 'ج', 'د'][optIdx]}
                            </div>
                            {opt}
                            {optIdx === q.correct_answer && <span className="mr-auto text-xs bg-emerald-200 px-2 py-0.5 rounded-full">إجابة صحيحة</span>}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-4 justify-end pt-4 border-t border-slate-100">
                        <button aria-label="حذف السؤال" onClick={() => handleDeleteQuestion(q.id)} className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={14} /> حذف</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Question Form */}
              {showQuestionForm && (
                <div className="mt-6 bg-white rounded-2xl p-6 shadow-lg border-2 border-amber-200">
                  <h4 className="text-lg font-bold mb-4 flex items-center gap-2 text-amber-800" style={HEADING}><Plus size={18} /> إضافة سؤال جديد</h4>
                  <form className="flex flex-col gap-4" onSubmit={handleAddQuestion}>
                    <ClayInput
                      label="نص السؤال"
                      placeholder="اكتب السؤال هنا..."
                      value={newQuestion.question}
                      onChange={e => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                      required
                    />
                    <div className="grid grid-cols-2 gap-4">
                      {['أ', 'ب', 'ج', 'د'].map((letter, i) => (
                        <ClayInput
                          key={i}
                          label={`الإجابة ${letter}`}
                          placeholder={`الخيار ${letter}`}
                          value={newQuestion.options[i]}
                          onChange={e => {
                            const opts = [...newQuestion.options]
                            opts[i] = e.target.value
                            setNewQuestion(prev => ({ ...prev, options: opts }))
                          }}
                          required
                        />
                      ))}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-clay-foreground" style={HEADING}>الإجابة الصحيحة</label>
                      <select
                        className="flex w-full border-0 bg-[#EFEBF5] px-6 py-4 h-14 text-clay-foreground text-base rounded-2xl shadow-clayPressed focus:bg-white focus:ring-4 focus:ring-clay-accent/20 focus:outline-none transition-all duration-200"
                        value={newQuestion.correctAnswer}
                        onChange={e => setNewQuestion(prev => ({ ...prev, correctAnswer: parseInt(e.target.value) }))}
                      >
                        {['أ', 'ب', 'ج', 'د'].map((letter, i) => (
                          <option key={i} value={i}>{letter} — {newQuestion.options[i] || `الخيار ${letter}`}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-slate-100">
                      <ClayButton variant="outline" type="button" onClick={() => setShowQuestionForm(false)}>إلغاء</ClayButton>
                      <ClayButton type="submit" disabled={savingQuestion}>
                        {savingQuestion ? <Loader2 size={18} className="animate-spin" /> : 'حفظ السؤال ✓'}
                      </ClayButton>
                    </div>
                  </form>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t border-slate-100 flex justify-between items-center flex-shrink-0">
              <span className="text-sm text-clay-muted">يتم الحفظ فوراً في قاعدة البيانات.</span>
              <ClayButton onClick={() => setShowQuizBuilder(false)}>إغلاق المحرر والعودة</ClayButton>
            </div>
          </ClayCard>
        </div>
      )}
    </div>
  )
}
