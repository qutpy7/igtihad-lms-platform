import React, { useState, useEffect } from 'react'
import { MessageCircle, CheckCircle, Clock, Send, Trash2, Loader2, Search } from 'lucide-react'
import ClayCard from '../../components/ui/ClayCard'
import ClayButton from '../../components/ui/ClayButton'
import ClayTextarea from '../../components/ui/ClayTextarea'
import ClayInput from '../../components/ui/ClayInput'
import { fetchAllStudentQuestions, answerStudentQuestion, deleteStudentQuestion } from '../../lib/api'
import { useToast } from '../../context/ToastContext'
import { useConfirm } from '../../context/ConfirmContext'

const HEADING = { fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }

export default function ManageQAPage() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all | pending | answered
  const [search, setSearch] = useState('')
  const [answers, setAnswers] = useState({}) // { questionId: answerText }
  const [submitting, setSubmitting] = useState(null) // questionId being submitted
  const toast = useToast()
  const confirm = useConfirm()

  useEffect(() => {
    loadQuestions()
  }, [])

  const loadQuestions = async () => {
    try {
      setLoading(true)
      const data = await fetchAllStudentQuestions()
      setQuestions(data)
    } catch (err) {
      toast.error('خطأ في تحميل الأسئلة: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = async (questionId) => {
    const answerText = answers[questionId]?.trim()
    if (!answerText) return toast.warning('الرجاء كتابة الإجابة أولاً')
    setSubmitting(questionId)
    try {
      await answerStudentQuestion(questionId, answerText)
      setAnswers(prev => ({ ...prev, [questionId]: '' }))
      await loadQuestions()
      toast.success('تم إرسال الرد بنجاح!')
    } catch (err) {
      toast.error('حدث خطأ: ' + err.message)
    } finally {
      setSubmitting(null)
    }
  }

  const handleDelete = async (questionId) => {
    const ok = await confirm({ title: 'حذف السؤال', message: 'هل أنت متأكد من حذف هذا السؤال؟', confirmText: 'حذف', danger: true })
    if (!ok) return
    try {
      await deleteStudentQuestion(questionId)
      await loadQuestions()
      toast.success('تم حذف السؤال')
    } catch (err) {
      toast.error('حدث خطأ: ' + err.message)
    }
  }

  const filtered = questions.filter(q => {
    if (filter === 'pending' && q.is_answered) return false
    if (filter === 'answered' && !q.is_answered) return false
    if (search.trim()) {
      const s = search.toLowerCase()
      return q.question.toLowerCase().includes(s) ||
        q.profiles?.full_name?.toLowerCase().includes(s) ||
        q.lessons?.title?.toLowerCase().includes(s)
    }
    return true
  })

  const pendingCount = questions.filter(q => !q.is_answered).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-clay-accent" size={40} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-clay-foreground" style={HEADING}>أسئلة واستفسارات الطلاب</h1>
          <p className="text-clay-muted mt-1">الرد على أسئلة الطلاب في الدروس</p>
        </div>
        {pendingCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-2xl text-sm font-bold flex items-center gap-2">
            <Clock size={16} />
            {pendingCount} سؤال بانتظار الرد
          </div>
        )}
      </div>

      {/* Filters & Search */}
      <ClayCard hover={false}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'الكل', count: questions.length },
              { value: 'pending', label: 'بانتظار الرد', count: pendingCount },
              { value: 'answered', label: 'تم الرد', count: questions.length - pendingCount },
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  filter === f.value
                    ? 'bg-clay-accent text-white shadow-clayCard'
                    : 'bg-white/60 text-clay-muted hover:bg-clay-accent/10'
                }`}
              >
                {f.label} ({f.count})
              </button>
            ))}
          </div>
          <div className="flex-1 relative">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-clay-muted" />
            <ClayInput
              placeholder="ابحث بالاسم أو السؤال أو الدرس..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="!pr-10"
            />
          </div>
        </div>
      </ClayCard>

      {/* Questions List */}
      {filtered.length === 0 ? (
        <ClayCard hover={false}>
          <div className="text-center py-12 text-clay-muted">
            <MessageCircle size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-bold">لا توجد أسئلة</p>
          </div>
        </ClayCard>
      ) : (
        <div className="space-y-4">
          {filtered.map(q => (
            <ClayCard key={q.id} hover={false}>
              {/* Question Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                    {q.profiles?.full_name?.charAt(0) || '؟'}
                  </div>
                  <div>
                    <p className="font-bold text-clay-foreground text-sm">{q.profiles?.full_name}</p>
                    <p className="text-xs text-clay-muted">
                      📖 {q.lessons?.title} — 📚 {q.lessons?.courses?.title}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-clay-muted">{new Date(q.created_at).toLocaleDateString('ar-EG')}</span>
                  {q.is_answered ? (
                    <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                      <CheckCircle size={12} /> تم الرد
                    </span>
                  ) : (
                    <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                      <Clock size={12} /> بانتظار الرد
                    </span>
                  )}
                </div>
              </div>

              {/* Question Body */}
              <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100">
                <p className="text-clay-foreground text-sm leading-relaxed">{q.question}</p>
              </div>

              {/* Answer / Reply */}
              {q.is_answered ? (
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 mr-6">
                  <p className="text-xs font-bold text-emerald-800 mb-1 flex items-center gap-1">
                    <CheckCircle size={12} /> ردك:
                  </p>
                  <p className="text-sm text-emerald-900 leading-relaxed">{q.answer}</p>
                  <p className="text-xs text-emerald-600 mt-2">
                    {q.answered_at && new Date(q.answered_at).toLocaleDateString('ar-EG')}
                  </p>
                </div>
              ) : (
                <div className="mr-6">
                  <ClayTextarea
                    placeholder="اكتب ردك على السؤال..."
                    value={answers[q.id] || ''}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                    rows={2}
                  />
                  <div className="flex gap-2 mt-2">
                    <ClayButton
                      size="sm"
                      onClick={() => handleAnswer(q.id)}
                      disabled={submitting === q.id || !answers[q.id]?.trim()}
                    >
                      {submitting === q.id ? <Loader2 size={14} className="animate-spin" /> : <><Send size={14} /> إرسال الرد</>}
                    </ClayButton>
                    <ClayButton size="sm" variant="outline" onClick={() => handleDelete(q.id)}>
                      <Trash2 size={14} /> حذف
                    </ClayButton>
                  </div>
                </div>
              )}
            </ClayCard>
          ))}
        </div>
      )}
    </div>
  )
}
