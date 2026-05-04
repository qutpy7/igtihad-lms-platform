import React, { useState, useEffect } from 'react'
import { Lock, FileText, CheckCircle, Loader2, HelpCircle } from 'lucide-react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import ClayCard from '../../components/ui/ClayCard'
import ClayButton from '../../components/ui/ClayButton'
import ClayTextarea from '../../components/ui/ClayTextarea'
import { useAuth } from '../../context/AuthContext'
import { fetchLessonWithCourse, fetchStudentProgress, markLessonCompleted, fetchLessonQuestions, saveQuizResult, fetchLessonQuestionsQA, askStudentQuestion } from '../../lib/api'
import { useRealtimeSync } from '../../lib/useRealtimeSync'
import { useToast } from '../../context/ToastContext'

const HEADING = { fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }

// ─── Quiz Component ───────────────────────────────────────────────────────────
function QuizSection({ lessonId, lessonTitle, profileId, onComplete, allowRetake }) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState({}) // { questionId: selectedOptionIndex }
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [score, setScore] = useState(0)
  const [previousResult, setPreviousResult] = useState(null)
  const toast = useToast()

  const loadQuestions = async () => {
    try {
      setLoading(true)
      const [data, results] = await Promise.all([
        fetchLessonQuestions(lessonId),
        apiClient.get(`/quizzes/results/student/${profileId}`)
      ])
      setQuestions(data)
      
      // Check if user already did this quiz
      const existing = results.data.find(r => r.lesson_id === parseInt(lessonId))
      if (existing) {
        setPreviousResult(existing)
        setScore(existing.score)
        setSubmitted(true)
      }
    } catch (err) {
      console.error('Error loading questions:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadQuestions()
  }, [lessonId])

  // ⚡ Realtime: when admin adds/edits quiz questions, student sees them instantly
  useRealtimeSync('lesson_questions', loadQuestions, { column: 'lesson_id', value: lessonId })

  const handleSelectAnswer = (questionId, optionIndex) => {
    if (submitted) return
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }))
  }

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      toast.warning('الرجاء الإجابة على جميع الأسئلة قبل التسليم')
      return
    }
    setSubmitting(true)
    let correct = 0
    questions.forEach(q => {
      if (answers[q.id] === q.correct_answer) correct++
    })
    setScore(correct)
    setSubmitted(true)

    try {
      await saveQuizResult({
        student_id: profileId,
        lesson_id: parseInt(lessonId),
        score: correct,
        total: questions.length,
        answers: questions.map(q => ({ question_id: q.id, selected: answers[q.id] }))
      })
      if (onComplete) onComplete()
    } catch (err) {
      console.error('Error saving quiz result:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRetry = () => {
    setAnswers({})
    setSubmitted(false)
    setScore(0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={32} className="animate-spin text-amber-500" />
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-16 text-clay-muted">
        <HelpCircle size={48} className="mx-auto mb-4 opacity-30" />
        <p className="text-lg font-bold" style={HEADING}>لم يتم إضافة أسئلة لهذا الواجب بعد</p>
        <p className="text-sm mt-2">تواصل مع الأستاذ للاستفسار</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-[24px] p-6 border border-amber-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-sm">
            <HelpCircle size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-amber-900" style={HEADING}>{lessonTitle}</h2>
            <p className="text-sm text-amber-700">{questions.length} سؤال — اختيار من متعدد</p>
          </div>
        </div>
        {submitted && (
          <div className={`mt-4 p-4 rounded-2xl font-bold text-center text-lg ${score / questions.length >= 0.5 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
            {score / questions.length >= 0.7
              ? '🎉 ممتاز!'
              : score / questions.length >= 0.5
              ? '✅ جيد، يمكنك المراجعة'
              : '❌ تحتاج لمراجعة أكثر'}
            {' '}— نتيجتك: {score} / {questions.length} ({Math.round(score / questions.length * 100)}%)
          </div>
        )}
      </div>

      {/* Questions */}
      {questions.map((q, idx) => {
        const selected = answers[q.id]
        const isCorrect = submitted && selected === q.correct_answer
        const isWrong = submitted && selected !== undefined && selected !== q.correct_answer

        return (
          <div
            key={q.id}
            className={`bg-white rounded-[24px] p-6 shadow-sm border-2 transition-all ${
              submitted
                ? isWrong ? 'border-red-200' : isCorrect ? 'border-emerald-200' : 'border-gray-100'
                : 'border-clay-accent/10'
            }`}
          >
            <p className="font-bold text-base mb-5" style={HEADING}>
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700 text-sm font-black ml-2">
                {idx + 1}
              </span>
              {q.question}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(q.options || []).map((opt, optIdx) => {
                const isSelected = selected === optIdx
                const isCorrectOpt = submitted && optIdx === q.correct_answer
                const isWrongOpt = submitted && isSelected && optIdx !== q.correct_answer

                let optClass = 'border-transparent bg-slate-50 text-clay-muted hover:bg-clay-accent/5 hover:border-clay-accent/20 cursor-pointer'
                if (!submitted && isSelected) {
                  optClass = 'border-clay-accent bg-clay-accent/10 text-clay-accent font-bold'
                } else if (submitted && isCorrectOpt) {
                  optClass = 'border-emerald-300 bg-emerald-50 text-emerald-800 font-bold'
                } else if (submitted && isWrongOpt) {
                  optClass = 'border-red-300 bg-red-50 text-red-700 font-bold'
                } else if (submitted) {
                  optClass = 'border-transparent bg-slate-50 text-clay-muted opacity-60'
                }

                return (
                  <button
                    key={optIdx}
                    type="button"
                    disabled={submitted}
                    onClick={() => handleSelectAnswer(q.id, optIdx)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-sm text-right transition-all w-full ${optClass}`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 ${
                      !submitted && isSelected ? 'bg-clay-accent text-white'
                      : submitted && isCorrectOpt ? 'bg-emerald-500 text-white'
                      : submitted && isWrongOpt ? 'bg-red-400 text-white'
                      : 'bg-slate-200 text-slate-500'
                    }`}>
                      {['أ', 'ب', 'ج', 'د'][optIdx]}
                    </div>
                    <span className="flex-1">{opt}</span>
                    {submitted && isCorrectOpt && <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />}
                  </button>
                )
              })}
            </div>

            {submitted && (
              <p className="mt-3 text-xs text-clay-muted">
                الإجابة الصحيحة: <span className="font-bold text-emerald-600">{['أ', 'ب', 'ج', 'د'][q.correct_answer]} — {q.options[q.correct_answer]}</span>
              </p>
            )}
          </div>
        )
      })}

      {/* Submit / Retry */}
      <div className="flex gap-4 justify-center pt-2">
        {!submitted ? (
          <ClayButton
            onClick={handleSubmit}
            disabled={submitting || Object.keys(answers).length < questions.length}
            className="px-10"
          >
            {submitting ? <Loader2 size={20} className="animate-spin" /> : `تسليم الواجب (${Object.keys(answers).length}/${questions.length})`}
          </ClayButton>
        ) : allowRetake ? (
          <ClayButton variant="outline" onClick={handleRetry}>
            🔄 إعادة المحاولة
          </ClayButton>
        ) : (
          <p className="text-sm font-bold text-clay-muted">إعادة المحاولة غير مسموح بها لهذا الواجب</p>
        )}
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getEmbedUrl(url) {
  if (!url) return null
  
  // YouTube
  if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
    let id = ''
    if (url.includes('v=')) {
      id = url.split('v=')[1].split('&')[0]
    } else {
      id = url.split('/').pop().split('?')[0]
    }
    return `https://www.youtube.com/embed/${id}`
  }
  
  // Google Drive
  if (url.includes('drive.google.com/file/d/')) {
    const id = url.split('/d/')[1].split('/')[0]
    return `https://drive.google.com/file/d/${id}/preview`
  }
  
  return url
}

// ─── Main Lesson Viewer ────────────────────────────────────────────────────────
export default function LessonViewerPage() {
  const { id: idStr } = useParams()
  const id = parseInt(idStr, 10)  // ✅ Fix 4.3: useParams() returns string, DB needs bigint
  const navigate = useNavigate()
  const { profile } = useAuth()
  const toast = useToast()
  
  const [activeTab, setActiveTab] = useState('desc')
  const [question, setQuestion] = useState('')
  
  const [loading, setLoading] = useState(true)
  const [lessonData, setLessonData] = useState(null)
  const [completedLessons, setCompletedLessons] = useState([])
  const [marking, setMarking] = useState(false)
  const [qaList, setQaList] = useState([])
  const [submittingQA, setSubmittingQA] = useState(false)

  const loadLesson = async () => {
    try {
      setLoading(true)
      const [lessonData, progress, qas] = await Promise.all([
        fetchLessonWithCourse(id),
        fetchStudentProgress(profile.id),
        fetchLessonQuestionsQA(id)
      ])
      
      setLessonData(lessonData)
      setCompletedLessons(progress)
      setQaList(qas)
    } catch (err) {
      console.error('Error loading lesson:', err)
      toast.error('خطأ في تحميل الدرس. حاول مرة أخرى.')
      setLessonData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id && !isNaN(id) && profile?.id) {
      loadLesson()
    } else if (isNaN(id)) {
      setLoading(false)
      setLessonData(null)
    }
  }, [id, profile?.id])

  // ⚡ Realtime: when admin answers Q&A or lesson content changes
  useRealtimeSync('student_questions', () => {
    if (id) fetchLessonQuestionsQA(id).then(setQaList).catch(() => {})
  }, { column: 'lesson_id', value: id })
  useRealtimeSync('lessons', loadLesson)

  const handleAskQuestion = async () => {
    if (!question.trim()) return
    setSubmittingQA(true)
    try {
      await askStudentQuestion({
        lesson_id: id,
        student_id: profile.id,
        question: question.trim()
      })
      setQuestion('')
      const qas = await fetchLessonQuestionsQA(id)
      setQaList(qas)
      toast.success('تم إرسال سؤالك للمدرس بنجاح! ✉️')
    } catch (err) {
      toast.error('حدث خطأ أثناء الإرسال: ' + err.message)
    } finally {
      setSubmittingQA(false)
    }
  }

  const handleMarkCompleted = async () => {
    try {
      setMarking(true)
      await markLessonCompleted(profile.id, id)
      setCompletedLessons([...completedLessons, parseInt(id)])
    } catch (err) {
      toast.error('حدث خطأ: ' + err.message)
    } finally {
      setMarking(false)
    }
  }

  if (loading) {
    return <div className="text-center py-16 text-clay-muted font-bold text-xl"><Loader2 className="animate-spin mx-auto mb-4" size={32} />جاري تحميل الدرس...</div>
  }

  if (!lessonData) {
    return (
      <div className="text-center py-16">
        <span className="text-5xl mb-4 block">😕</span>
        <h1 className="text-2xl font-black mb-4" style={HEADING}>الدرس مش موجود</h1>
        <Link to="/student/courses"><ClayButton>ارجع لكورساتي</ClayButton></Link>
      </div>
    )
  }

  const { lesson: currentLesson, course: currentCourse, curriculum } = lessonData
  const isCompleted = completedLessons.includes(parseInt(id))
  const isQuiz = currentLesson.type === 'quiz'
  const isPdf = currentLesson.type === 'pdf'

  const allLessons = curriculum.flatMap(u => u.lessons)
  const lessonIndex = allLessons.findIndex(l => l.id === parseInt(id))
  const prevLesson = lessonIndex > 0 ? allLessons[lessonIndex - 1] : null
  const nextLesson = lessonIndex < allLessons.length - 1 ? allLessons[lessonIndex + 1] : null

  const tabs = [
    { value: 'desc', label: 'وصف الدرس' },
    { value: 'files', label: 'الملفات' },
    { value: 'qa', label: 'أسئلة وأجوبة' },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Content — 3/4 */}
      <div className="lg:col-span-3 flex flex-col gap-6">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 text-sm text-clay-muted flex-wrap">
            <Link to="/student/courses" className="hover:text-clay-accent transition-colors">كورساتي</Link>
            <span>›</span>
            <Link to={`/courses/${currentCourse.id}`} className="hover:text-clay-accent transition-colors">{currentCourse.title}</Link>
            <span>›</span>
            <span className="text-clay-accent font-bold">{currentLesson.title}</span>
          </div>
          
          {!isCompleted ? (
            <ClayButton size="sm" onClick={handleMarkCompleted} disabled={marking}>
              {marking ? <Loader2 className="animate-spin" size={16} /> : <><CheckCircle size={16} /> تعليم كمكتمل</>}
            </ClayButton>
          ) : (
            <span className="text-emerald-500 font-bold text-sm flex items-center gap-1"><CheckCircle size={18} /> درس مكتمل</span>
          )}
        </div>

        {/* ─── QUIZ Layout ─── */}
        {isQuiz ? (
          <QuizSection
            lessonId={id}
            lessonTitle={currentLesson.title}
            profileId={profile.id}
            allowRetake={currentLesson.allow_retake !== 0}
            onComplete={() => {
              if (!isCompleted) handleMarkCompleted()
            }}
          />
        ) : (
          <>
            {/* Video / PDF Player */}
            {isPdf ? (
              <div className="rounded-[32px] bg-gradient-to-br from-rose-50 to-red-100 p-10 flex flex-col items-center justify-center gap-4 shadow-clayCard border border-rose-200">
                <FileText size={64} className="text-rose-400" />
                <h2 className="text-xl font-black text-rose-800" style={HEADING}>{currentLesson.title}</h2>
                {currentLesson.content_url ? (
                  <a href={currentLesson.content_url} target="_blank" rel="noopener noreferrer">
                    <ClayButton>فتح الملف PDF ⬇️</ClayButton>
                  </a>
                ) : (
                  <p className="text-rose-600 text-sm">الملف غير متوفر حالياً</p>
                )}
              </div>
            ) : (
              <div className="rounded-[32px] bg-gradient-to-br from-slate-800 to-black aspect-video flex items-center justify-center shadow-clayCard relative overflow-hidden">
                {currentLesson.content_url ? (
                  <iframe
                    src={getEmbedUrl(currentLesson.content_url)}
                    className="w-full h-full absolute inset-0"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div className="text-center text-white z-10">
                    <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-4xl mx-auto mb-4">▶️</div>
                    <p className="text-lg font-bold" style={HEADING}>{currentLesson.title}</p>
                    <p className="text-sm text-white/70">الفيديو غير متوفر حالياً</p>
                  </div>
                )}
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 border-b border-clay-accent/10 pb-0">
              {tabs.map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-5 py-3 text-sm font-bold transition-all border-b-2 -mb-px ${
                    activeTab === tab.value
                      ? 'text-clay-accent border-clay-accent'
                      : 'text-clay-muted border-transparent hover:text-clay-accent'
                  }`}
                  style={HEADING}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <ClayCard hover={false}>
              {activeTab === 'desc' && (
                <div>
                  <h3 className="text-lg font-bold mb-3" style={HEADING}>{currentLesson.title}</h3>
                  <p className="text-clay-muted leading-relaxed whitespace-pre-wrap">
                    {currentLesson.content || 'لا يوجد وصف متاح لهذا الدرس.'}
                  </p>
                </div>
              )}

              {activeTab === 'files' && (
                <div className="flex flex-col gap-3">
                  {currentLesson.attachment_url ? (
                    <div className="flex items-center justify-between bg-white/60 rounded-clay-sm p-4 border border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{currentLesson.attachment_url.toLowerCase().endsWith('.pdf') ? '📄' : '📁'}</span>
                        <div>
                          <p className="font-bold text-sm" style={HEADING}>ملحقات الدرس: {currentLesson.title}</p>
                          <p className="text-xs text-clay-muted">ملف مرفق للتحميل</p>
                        </div>
                      </div>
                      <a href={currentLesson.attachment_url} target="_blank" rel="noopener noreferrer">
                        <ClayButton size="sm" variant="outline">تحميل ⬇️</ClayButton>
                      </a>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-clay-muted">
                      لا توجد ملفات مرفقة لهذا الدرس.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'qa' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-clay-muted" style={HEADING}>الأسئلة والأجوبة</h4>
                    <button 
                      onClick={loadLesson} 
                      className="p-2 rounded-xl hover:bg-clay-accent/5 text-clay-accent transition-colors flex items-center gap-2 text-xs font-bold"
                      title="تحديث الأسئلة"
                    >
                      <Loader2 size={14} className={loading ? 'animate-spin' : ''} /> تحديث
                    </button>
                  </div>

                  <div className="mb-6 bg-clay-accent/5 p-4 rounded-2xl border border-clay-accent/10">
                    <ClayTextarea
                      placeholder="عندك سؤال في الدرس؟ اكتبه هنا والمدرس هيرد عليك..."
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      rows={3}
                    />
                    <ClayButton 
                      size="sm" 
                      className="mt-3" 
                      disabled={!question.trim() || submittingQA}
                      onClick={handleAskQuestion}
                    >
                      {submittingQA ? <Loader2 size={16} className="animate-spin" /> : 'إرسال السؤال'}
                    </ClayButton>
                  </div>
                  <div className="flex flex-col gap-4">
                    {qaList.length === 0 ? (
                      <div className="text-center py-8 text-clay-muted">
                        لا توجد أسئلة حالياً. كن أول من يسأل!
                      </div>
                    ) : (
                      qaList.map(qa => (
                        <div key={qa.id} className="bg-white/60 rounded-clay-sm p-4 border border-slate-100">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-sm text-clay-foreground">{qa.profiles?.full_name}</span>
                            <span className="text-xs text-clay-muted">{new Date(qa.created_at).toLocaleDateString('ar-EG')}</span>
                          </div>
                          <p className="text-sm text-clay-foreground mb-3">{qa.question}</p>
                          
                          {qa.is_answered ? (
                            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 ml-4">
                              <p className="text-xs font-bold text-emerald-800 mb-1">رد المدرس:</p>
                              <p className="text-sm text-emerald-900">{qa.answer}</p>
                            </div>
                          ) : (
                            <div className="bg-slate-50 rounded-xl p-2 ml-4">
                              <p className="text-xs text-clay-muted flex items-center gap-1">
                                <Loader2 size={12} className="animate-spin" /> قيد المراجعة من المدرس...
                              </p>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </ClayCard>
          </>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <ClayButton variant="outline" disabled={!prevLesson} onClick={() => navigate(`/student/lesson/${prevLesson?.id}`)}>← الدرس السابق</ClayButton>
          <ClayButton disabled={!nextLesson} onClick={() => navigate(`/student/lesson/${nextLesson?.id}`)}>الدرس التالي →</ClayButton>
        </div>
      </div>

      {/* Sidebar — 1/4 */}
      <div className="lg:col-span-1">
        <div className="sticky top-20">
          <ClayCard hover={false} className="!p-4">
            <h3 className="text-base font-bold mb-4" style={HEADING}>📋 المنهج</h3>
            <div className="flex flex-col gap-1 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {curriculum.map((unit) => (
                <div key={unit.id} className="mb-3">
                  <p className="text-xs font-bold text-clay-muted py-2 px-2 bg-clay-accent/5 rounded-xl mb-1">{unit.title}</p>
                  {unit.lessons.map(lesson => {
                    const isCurrent = lesson.id === currentLesson.id
                    const isDone = completedLessons.includes(lesson.id)
                    const isQ = lesson.type === 'quiz'
                    const icon = isDone ? <CheckCircle size={16} className="text-emerald-500" /> : isCurrent ? (isQ ? '📝' : '▶️') : <Lock size={16} />
                    return (
                      <Link
                        key={lesson.id}
                        to={`/student/lesson/${lesson.id}`}
                        className={`flex items-center gap-2 px-2 py-2 rounded-xl text-xs hover:bg-clay-accent/5 transition-colors ${
                          isCurrent ? 'bg-clay-accent/10 text-clay-accent font-bold' : 'text-clay-muted'
                        }`}
                      >
                        <span className="w-5 flex justify-center">{icon}</span>
                        <span className="flex-1 truncate">{lesson.title}</span>
                      </Link>
                    )
                  })}
                </div>
              ))}
            </div>
          </ClayCard>
        </div>
      </div>
    </div>
  )
}
