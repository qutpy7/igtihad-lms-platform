import React, { useEffect, useState } from 'react'
import { BookOpen, CheckCircle, Loader2 } from 'lucide-react'
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom'
import ClayCard from '../../components/ui/ClayCard'
import ClayButton from '../../components/ui/ClayButton'
import StatOrb from '../../components/ui/StatOrb'
import { useAuth } from '../../context/AuthContext'
import { submitQuizResult } from '../../lib/api'

const HEADING = { fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }

export default function QuizResultsPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { profile } = useAuth()
  
  const [submitting, setSubmitting] = useState(true)
  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})

  // ✅ Fix 5: Load data from API if missing from navigation state
  useEffect(() => {
    if (location.state?.quiz && location.state?.questions) {
      // Data from navigation - use it
      setQuiz(location.state.quiz)
      setQuestions(location.state.questions)
      setAnswers(location.state.answers || {})
      saveResult(location.state)
    } else {
      // Data missing (e.g., page refresh) - fetch from API
      loadQuizData()
    }
  }, [id, profile])

  const loadQuizData = async () => {
    try {
      const [quizData, questionsData] = await Promise.all([
        fetchQuizById(id),
        fetchQuizQuestions(id)
      ])
      setQuiz(quizData)
      setQuestions(questionsData)
      // Note: answers will be lost on refresh - show message
    } catch (err) {
      console.error('Failed to load quiz data', err)
      setQuiz(null)
      setQuestions([])
    } finally {
      setSubmitting(false)
    }
  }

  const correct = questions ? questions.filter(q => answers[q.id] === q.correct_answer).length : 0
  const percentage = questions && questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0

  const saveResult = async (stateData) => {
    if (!stateData?.quiz || !stateData?.questions || !profile) return
    try {
      await submitQuizResult(profile.id, parseInt(id), correct, questions.length)
    } catch (err) {
      console.error('Failed to save quiz result', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (!quiz || !questions) {
    return (
      <div className="text-center py-16">
        <span className="text-5xl mb-4 block">😕</span>
        <h1 className="text-2xl font-black mb-4" style={HEADING}>النتيجة مش موجودة</h1>
        <ClayButton onClick={() => navigate('/student')}>ارجع للرئيسية</ClayButton>
      </div>
    )
  }

  const grade = percentage >= 90 ? 'ممتاز 🌟' : percentage >= 75 ? 'جيد جداً 👏' : percentage >= 60 ? 'جيد 👍' : 'حاول تاني 💪'
  const gradeColor = percentage >= 75 ? 'green' : percentage >= 60 ? 'amber' : 'pink'

  return (
    <div className="max-w-3xl mx-auto">
      {/* Hero Result */}
      <ClayCard hover={false} className="text-center mb-8 bg-gradient-to-br from-white/80 to-white/40">
        <h1 className="text-2xl font-black mb-6" style={HEADING}>{quiz.title} — النتيجة</h1>

        <div className="flex justify-center mb-4">
          <StatOrb value={`${percentage}%`} label={grade} color={gradeColor} />
        </div>

        <div className="flex items-center justify-center gap-6 mt-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">✓</span>
            <span className="text-clay-muted"><span className="font-bold text-emerald-600">{correct}</span> صحيح</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">✗</span>
            <span className="text-clay-muted"><span className="font-bold text-red-600">{questions.length - correct}</span> خطأ</span>
          </div>
        </div>
      </ClayCard>

      {/* Questions Detail */}
      <h2 className="text-xl font-bold mb-4" style={HEADING}>📋 تفصيل الأسئلة</h2>
      <div className="flex flex-col gap-4 mb-8">
        {questions.map((q, idx) => {
          const userAnswer = answers[q.id]
          const isCorrect = userAnswer === q.correct_option_index

          return (
            <ClayCard key={q.id} hover={false} className={`border-r-4 ${isCorrect ? 'border-emerald-400' : 'border-red-400'}`}>
              <div className="flex items-start gap-3 mb-4">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${isCorrect ? 'bg-emerald-500' : 'bg-red-500'}`}>
                  {isCorrect ? '✓' : '✗'}
                </span>
                <p className="font-bold text-base" style={HEADING}>
                  <span className="text-clay-muted ml-1">س{idx + 1}.</span> {q.question}
                </p>
              </div>

              <div className="flex flex-col gap-2 mr-10">
                {q.options.map((opt, optIdx) => {
                  const isUserChoice = userAnswer === optIdx
                  const isCorrectAnswer = q.correct_option_index === optIdx

                  let className = 'p-3 rounded-xl text-sm '
                  if (isCorrectAnswer) className += 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                  else if (isUserChoice && !isCorrect) className += 'bg-red-50 text-red-600 line-through border border-red-200'
                  else className += 'text-clay-muted'

                  return (
                    <div key={optIdx} className={className}>
                      <span className="font-bold ml-2">{['أ', 'ب', 'ج', 'د'][optIdx]}.</span>
                      {opt}
                      {isCorrectAnswer && <span className="mr-2 inline-flex align-middle"><CheckCircle size={16} /></span>}
                      {isUserChoice && !isCorrect && <span className="mr-2 inline-flex align-middle">❌</span>}
                    </div>
                  )
                })}
              </div>
            </ClayCard>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        {quiz?.allow_retake !== 0 ? (
          <Link to={`/student/quiz/${id}`}>
            <ClayButton variant="outline" size="lg">حاول تاني 🔄</ClayButton>
          </Link>
        ) : (
          <p className="text-sm font-bold text-clay-muted self-center">إعادة المحاولة غير مسموح بها حالياً</p>
        )}
        <Link to={`/courses/${quiz.course_id}`}>
          <ClayButton size="lg">ارجع للكورس </ClayButton>
        </Link>
      </div>
    </div>
  )
}
