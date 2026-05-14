import React, { useState, useEffect } from 'react'
import { FileText, Plus, Edit, Trash2, Clock, Calendar, Loader2 } from 'lucide-react'
import ClayCard from '../../components/ui/ClayCard'
import ClayButton from '../../components/ui/ClayButton'
import ClayInput from '../../components/ui/ClayInput'
import ClaySelect from '../../components/ui/ClaySelect'
import ClayBadge from '../../components/ui/ClayBadge'
import IconOrb from '../../components/ui/IconOrb'
import { fetchQuizzes, fetchQuizQuestions, createQuiz, createQuizQuestion, deleteQuiz, deleteQuizQuestion, fetchCourses } from '../../lib/api'
import { useToast } from '../../context/ToastContext'
import { useConfirm } from '../../context/ConfirmContext'

const HEADING = { fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }

export default function ManageQuizzesPage() {
  const [quizzes, setQuizzes] = useState([])
  const [questionsByQuiz, setQuestionsByQuiz] = useState({})
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [expandedQuiz, setExpandedQuiz] = useState(null)
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const toast = useToast()
  const confirm = useConfirm()

  // Form state
  const [formData, setFormData] = useState({ title: '', course_id: '', duration: '', scheduled_date: '', allow_retake: true })
  const [qForm, setQForm] = useState({ question: '', optA: '', optB: '', optC: '', optD: '', correct_answer: '0' })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [quizzesData, coursesData] = await Promise.all([fetchQuizzes(), fetchCourses()])
      setQuizzes(quizzesData)
      setCourses(coursesData)
      const qMap = {}
      for (const quiz of quizzesData) {
        const qs = await fetchQuizQuestions(quiz.id)
        qMap[quiz.id] = qs
      }
      setQuestionsByQuiz(qMap)
    } catch (err) { toast.error('خطأ في تحميل الامتحانات: ' + err.message) }
    finally { setLoading(false) }
  }

  const courseOptions = courses.map(c => ({ value: String(c.id), label: c.title }))

  async function handleCreateQuiz(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await createQuiz({ 
        title: formData.title, 
        course_id: parseInt(formData.course_id), 
        duration: parseInt(formData.duration) || 30, 
        scheduled_date: formData.scheduled_date || null,
        allow_retake: formData.allow_retake ? 1 : 0
      })
      await loadData()
      setShowForm(false)
      setFormData({ title: '', course_id: '', duration: '', scheduled_date: '', allow_retake: true })
      toast.success('تم إنشاء الامتحان بنجاح!')
    } catch (err) { toast.error('خطأ: ' + err.message) }
    finally { setSaving(false) }
  }

  async function handleDeleteQuiz(id) {
    const ok = await confirm({ title: 'حذف الامتحان', message: 'هل أنت متأكد؟ سيتم حذف كل أسئلة الامتحان.', confirmText: 'حذف', danger: true })
    if (!ok) return
    try { await deleteQuiz(id); await loadData(); toast.success('تم حذف الامتحان') } catch (err) { toast.error('خطأ: ' + err.message) }
  }

  async function handleAddQuestion(quizId) {
    setSaving(true)
    try {
      await createQuizQuestion({
        quiz_id: quizId, question: qForm.question,
        options: [qForm.optA, qForm.optB, qForm.optC, qForm.optD],
        correct_answer: parseInt(qForm.correct_answer),
        sort_order: (questionsByQuiz[quizId]?.length || 0)
      })
      const qs = await fetchQuizQuestions(quizId)
      setQuestionsByQuiz(prev => ({ ...prev, [quizId]: qs }))
      setShowQuestionForm(false)
      setQForm({ question: '', optA: '', optB: '', optC: '', optD: '', correct_answer: '0' })
      toast.success('تم إضافة السؤال!')
    } catch (err) { toast.error('خطأ: ' + err.message) }
    finally { setSaving(false) }
  }

  async function handleDeleteQuestion(qId, quizId) {
    try {
      await deleteQuizQuestion(qId)
      const qs = await fetchQuizQuestions(quizId)
      setQuestionsByQuiz(prev => ({ ...prev, [quizId]: qs }))
      toast.success('تم حذف السؤال')
    } catch (err) { toast.error('خطأ: ' + err.message) }
  }

  if (loading) return <div className="flex items-center justify-center py-20 gap-3 text-clay-muted"><Loader2 size={28} className="animate-spin" /> جاري التحميل...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-black" style={HEADING}>بنك الأسئلة </h1>
          <button 
            aria-label="تحديث قائمة الامتحانات"
            onClick={loadData}
            className="p-2 rounded-xl hover:bg-clay-accent/5 text-clay-accent transition-colors flex items-center gap-2 text-xs font-bold"
            title="تحديث القائمة"
            disabled={loading}
          >
            <Loader2 size={14} className={loading ? 'animate-spin' : ''} /> تحديث
          </button>
        </div>
        <ClayButton onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ إلغاء' : <><Plus size={18} className="inline ml-1"/> إضافة امتحان</>}
        </ClayButton>
      </div>

      {showForm && (
        <ClayCard hover={false} className="mb-8">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={HEADING}><Plus size={20} className="text-clay-accent" /> إنشاء امتحان جديد</h3>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleCreateQuiz}>
            <ClayInput label="عنوان الامتحان" placeholder="مثلاً: امتحان النهايات" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            <ClaySelect label="الكورس" options={courseOptions} value={formData.course_id} onChange={e => setFormData({...formData, course_id: e.target.value})} />
            <ClayInput label="مدة الامتحان (بالدقائق)" placeholder="30" type="number" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
            <ClayInput label="تاريخ الامتحان" type="date" value={formData.scheduled_date} onChange={e => setFormData({...formData, scheduled_date: e.target.value})} />
            
            <div className="md:col-span-2 flex items-center gap-2 p-2 bg-clay-accent/5 rounded-xl border border-clay-accent/10">
              <input 
                type="checkbox" 
                id="q_allow_retake" 
                checked={formData.allow_retake}
                onChange={e => setFormData({...formData, allow_retake: e.target.checked})}
                className="w-5 h-5 rounded-lg border-2 border-clay-accent text-clay-accent focus:ring-clay-accent"
              />
              <label htmlFor="q_allow_retake" className="text-sm font-bold text-clay-foreground cursor-pointer" style={HEADING}>
                السماح للطلاب بإعادة المحاولة (Retake)
              </label>
            </div>

            <div className="md:col-span-2 flex gap-3 justify-end">
              <ClayButton variant="outline" type="button" onClick={() => setShowForm(false)}>إلغاء</ClayButton>
              <ClayButton type="submit" disabled={saving}>{saving ? 'جاري الحفظ...' : 'إنشاء الامتحان'}</ClayButton>
            </div>
          </form>
        </ClayCard>
      )}

      <div className="flex flex-col gap-4">
        {quizzes.map(quiz => {
          const questions = questionsByQuiz[quiz.id] || []
          const isExpanded = expandedQuiz === quiz.id
          const courseName = quiz.courses?.title || ''

          return (
            <ClayCard key={quiz.id} hover={false}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <IconOrb emoji={<FileText size={24} />} color="from-violet-400 to-violet-600" size="md" />
                  <div>
                    <h3 className="text-lg font-bold" style={HEADING}>{quiz.title}</h3>
                    <p className="text-sm text-clay-muted">{courseName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <ClayBadge color="accent">{questions.length} سؤال</ClayBadge>
                  <ClayBadge color="blue" className="flex items-center gap-1"><Clock size={14}/> {quiz.duration} د</ClayBadge>
                  {quiz.scheduled_date && <ClayBadge color="gray" className="flex items-center gap-1"><Calendar size={14}/> {quiz.scheduled_date}</ClayBadge>}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-clay-accent/10">
                <ClayButton size="sm" variant="outline" onClick={() => setExpandedQuiz(isExpanded ? null : quiz.id)}>
                  {isExpanded ? 'إخفاء الأسئلة ▲' : `عرض الأسئلة ▼ (${questions.length})`}
                </ClayButton>
                <button aria-label="حذف الامتحان" onClick={() => handleDeleteQuiz(quiz.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors" title="حذف"><Trash2 size={16} /></button>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-clay-accent/10">
                  {questions.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {questions.map((q, idx) => {
                        const opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options
                        return (
                        <div key={q.id} className="bg-white/60 rounded-clay-sm p-4">
                          <p className="font-bold text-sm mb-3" style={HEADING}>
                            <span className="text-clay-accent ml-1">س{idx + 1}.</span> {q.question}
                          </p>
                          <div className="grid grid-cols-2 gap-2 mr-4">
                            {opts.map((opt, optIdx) => (
                              <div key={optIdx} className={`text-xs p-2 rounded-xl ${optIdx === q.correct_answer ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200' : 'bg-gray-50 text-clay-muted'}`}>
                                <span className="font-bold ml-1">{['أ', 'ب', 'ج', 'د'][optIdx]}.</span> {opt}
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-1 mt-2 justify-end">
                            <button aria-label="حذف السؤال" onClick={() => handleDeleteQuestion(q.id, quiz.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100"><Trash2 size={16} /></button>
                          </div>
                        </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-clay-muted py-4">مفيش أسئلة في الامتحان ده لسه</p>
                  )}

                  <div className="mt-4">
                    {showQuestionForm && expandedQuiz === quiz.id ? (
                      <div className="bg-clay-accent/5 rounded-clay-sm p-4">
                        <h4 className="text-sm font-bold mb-3 flex items-center gap-2" style={HEADING}><Plus size={16} className="text-clay-accent"/> إضافة سؤال</h4>
                        <form className="flex flex-col gap-3" onSubmit={e => { e.preventDefault(); handleAddQuestion(quiz.id) }}>
                          <ClayInput label="نص السؤال" placeholder="اكتب السؤال هنا..." value={qForm.question} onChange={e => setQForm({...qForm, question: e.target.value})} />
                          <div className="grid grid-cols-2 gap-3">
                            <ClayInput label="الإجابة أ" value={qForm.optA} onChange={e => setQForm({...qForm, optA: e.target.value})} />
                            <ClayInput label="الإجابة ب" value={qForm.optB} onChange={e => setQForm({...qForm, optB: e.target.value})} />
                            <ClayInput label="الإجابة ج" value={qForm.optC} onChange={e => setQForm({...qForm, optC: e.target.value})} />
                            <ClayInput label="الإجابة د" value={qForm.optD} onChange={e => setQForm({...qForm, optD: e.target.value})} />
                          </div>
                          <ClaySelect label="الإجابة الصحيحة" options={[{value:'0',label:'أ'},{value:'1',label:'ب'},{value:'2',label:'ج'},{value:'3',label:'د'}]} value={qForm.correct_answer} onChange={e => setQForm({...qForm, correct_answer: e.target.value})} />
                          <div className="flex gap-3 justify-end">
                            <ClayButton variant="outline" size="sm" type="button" onClick={() => setShowQuestionForm(false)}>إلغاء</ClayButton>
                            <ClayButton type="submit" size="sm" disabled={saving}>{saving ? 'جاري...' : 'إضافة السؤال'}</ClayButton>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <ClayButton variant="outline" size="sm" onClick={() => { setShowQuestionForm(true); setExpandedQuiz(quiz.id) }}>
                        <Plus size={16} className="inline ml-1" /> إضافة سؤال جديد
                      </ClayButton>
                    )}
                  </div>
                </div>
              )}
            </ClayCard>
          )
        })}
      </div>
    </div>
  )
}
