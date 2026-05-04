import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import ClayCard from '../../components/ui/ClayCard'
import ClayButton from '../../components/ui/ClayButton'
import StatOrb from '../../components/ui/StatOrb'
import { useAuth } from '../../context/AuthContext'
import { fetchQuizById, fetchQuizQuestions, fetchStudentQuizResults as fetchResults } from '../../lib/api'

const HEADING = { fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }

export default function QuizPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  
  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [hasTaken, setHasTaken] = useState(false)
  const [prevResult, setPrevResult] = useState(null)

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (profile) loadQuizData()
  }, [id, profile])

  const loadQuizData = async () => {
    try {
      setLoading(true)
      const [qz, qs, results] = await Promise.all([
        fetchQuizById(id),
        fetchQuizQuestions(id),
        fetchResults(profile.id)
      ])
      
      setQuiz(qz)
      setQuestions(qs)
      
      // Check for previous attempt
      const existing = results.find(r => r.quiz_id === Number(id))
      if (existing) {
        setHasTaken(true)
        setPrevResult(existing)
      }

      // ✅ Fix 6: Use `duration` (integer) instead of `duration_minutes`
      setTimeLeft((qz.duration || 30) * 60)
    } catch (err) {
      console.error(err)
      setQuiz(null)
    } finally {
      setLoading(false)
    }
  }

  // Timer
  useEffect(() => {
    if (loading || !quiz) return
    if (timeLeft <= 0) {
      handleFinish()
      return
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft, loading, quiz])

  const handleFinish = () => {
    navigate(`/student/quiz/${id}/results`, { state: { answers, quizId: Number(id), quiz, questions } })
  }

  if (loading) return <div className="text-center py-16 text-clay-muted font-bold text-xl"><Loader2 className="animate-spin mx-auto mb-4" size={32} />جاري تحميل الامتحان...</div>

  if (hasTaken && quiz && quiz.allow_retake === 0) {
    const percentage = Math.round((prevResult.score / prevResult.total) * 100)
    return (
      <div className="max-w-xl mx-auto py-10">
        <ClayCard hover={false} className="text-center p-10">
          <StatOrb value={percentage} label="درجتك السابقة" color="from-violet-400 to-violet-600" size="lg" />
          <h2 className="text-2xl font-black mt-8 mb-4" style={HEADING}>{quiz.title}</h2>
          <p className="text-clay-muted mb-8 font-bold">لقد أتممت هذا الامتحان مسبقاً، وإعادة المحاولة غير مسموح بها حالياً.</p>
          <ClayButton onClick={() => navigate('/student')}>العودة للرئيسية</ClayButton>
        </ClayCard>
      </div>
    )
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="text-5xl mb-4 block">😕</span>
        <h1 className="text-2xl font-black" style={HEADING}>الامتحان مش موجود أو لا توجد أسئلة</h1>
      </div>
    )
  }

  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60
  const q = questions[current]
  const answeredCount = Object.keys(answers).length

  const handleSelect = (optIdx) => {
    setAnswers({ ...answers, [q.id]: optIdx })
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <ClayCard hover={false} className="!p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-lg font-bold" style={HEADING}>{quiz.title}</h1>
            <p className="text-xs text-clay-muted">{quiz.courses?.title}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-clay-muted">{answeredCount}/{questions.length} سؤال</span>
            <div className={`px-4 py-2 rounded-clay-sm font-black text-lg ${timeLeft < 300 ? 'bg-red-100 text-red-600' : 'bg-clay-accent/10 text-clay-accent'}`} style={HEADING}>
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </div>
          </div>
        </div>
      </ClayCard>

      {/* Question */}
      <ClayCard hover={false} className="mb-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-8 h-8 rounded-full bg-clay-accent text-white flex items-center justify-center text-sm font-bold" style={HEADING}>
            {current + 1}
          </span>
          <span className="text-sm text-clay-muted">من {questions.length}</span>
        </div>

        <h2 className="text-xl font-bold mb-8 leading-relaxed" style={HEADING}>{q.question}</h2>

        <div className="flex flex-col gap-3">
          {Array.isArray(q.options) ? q.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`w-full text-right p-4 rounded-clay-sm border-2 transition-all duration-200 font-medium ${
                answers[q.id] === idx
                  ? 'border-clay-accent bg-clay-accent/10 text-clay-accent shadow-clayCard'
                  : 'border-transparent bg-white/60 text-clay-foreground hover:bg-clay-accent/5 hover:border-clay-accent/20'
              }`}
            >
              <span className="font-bold ml-3 text-clay-muted">{['أ', 'ب', 'ج', 'د'][idx]}.</span>
              {opt}
            </button>
          )) : (
            <p className="text-center text-red-500 font-bold">خطأ في تحميل خيارات السؤال</p>
          )}
        </div>
      </ClayCard>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
        {questions.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
              idx === current
                ? 'bg-clay-accent text-white scale-110'
                : answers[questions[idx].id] !== undefined
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/60 text-clay-muted shadow-clayCard'
            }`}
            style={HEADING}
          >
            {idx + 1}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <ClayButton variant="outline" onClick={() => setCurrent(c => c - 1)} disabled={current === 0}>
          ← السابق
        </ClayButton>

        {current === questions.length - 1 ? (
          <ClayButton variant="danger" onClick={() => setShowConfirm(true)}>
            إنهاء الامتحان ✓
          </ClayButton>
        ) : (
          <ClayButton onClick={() => setCurrent(c => c + 1)}>
            التالي →
          </ClayButton>
        )}
      </div>

      {/* Confirm Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowConfirm(false)}>
          <ClayCard hover={false} className="max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
            <span className="text-4xl mb-4 block">⚠️</span>
            <h3 className="text-xl font-black mb-2" style={HEADING}>إنهاء الامتحان؟</h3>
            <p className="text-clay-muted mb-6">أجبت على {answeredCount} من {questions.length} سؤال</p>
            <div className="flex gap-3">
              <ClayButton variant="outline" className="flex-1" onClick={() => setShowConfirm(false)}>ارجع</ClayButton>
              <ClayButton variant="danger" className="flex-1" onClick={handleFinish}>تأكيد الإنهاء</ClayButton>
            </div>
          </ClayCard>
        </div>
      )}
    </div>
  )
}
