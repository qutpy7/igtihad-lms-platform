import React, { useState, useEffect } from 'react'
import { Bell, Send, Loader2, CheckCircle } from 'lucide-react'
import ClayCard from '../../components/ui/ClayCard'
import ClayButton from '../../components/ui/ClayButton'
import ClayTextarea from '../../components/ui/ClayTextarea'
import ClaySelect from '../../components/ui/ClaySelect'
import { fetchCourses, sendCourseNotification } from '../../lib/api'
import { useToast } from '../../context/ToastContext'

const HEADING = { fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }

export default function SendNotificationsPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState('')
  const [notifType, setNotifType] = useState('info')
  const [notifText, setNotifText] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const toast = useToast()

  const loadCourses = async () => {
    try {
      setLoading(true)
      const data = await fetchCourses()
      setCourses(data)
    } catch (err) {
      toast.error('خطأ في تحميل الكورسات: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [])

  const handleSend = async () => {
    if (!selectedCourse) return toast.warning('الرجاء اختيار كورس')
    if (!notifText.trim()) return toast.warning('الرجاء كتابة نص الإشعار')
    setSending(true)
    setSent(false)
    try {
      await sendCourseNotification(selectedCourse === 'all' ? 'all' : parseInt(selectedCourse), notifType, notifText.trim())
      setSent(true)
      setNotifText('')
      toast.success('تم إرسال الإشعار بنجاح! 🎉')
      setTimeout(() => setSent(false), 4000)
    } catch (err) {
      toast.error('حدث خطأ أثناء الإرسال: ' + err.message)
    } finally {
      setSending(false)
    }
  }

  const notifTypes = [
    { value: 'info', label: '📢 إعلان عام', color: 'bg-blue-50 border-blue-200 text-blue-800' },
    { value: 'warning', label: '⚠️ تنبيه مهم', color: 'bg-amber-50 border-amber-200 text-amber-800' },
    { value: 'success', label: '🎉 بشرى سارة', color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
    { value: 'reminder', label: '🔔 تذكير', color: 'bg-violet-50 border-violet-200 text-violet-800' },
  ]

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
      <div>
        <h1 className="text-3xl font-black text-clay-foreground" style={HEADING}>إرسال إشعارات</h1>
        <p className="text-clay-muted mt-1">أرسل إشعاراً لجميع الطلاب المشتركين في كورس معين</p>
      </div>

      {/* Send Form */}
      <ClayCard hover={false}>
        <div className="space-y-6">
      {/* Step 1: Select Course */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-bold text-clay-foreground" style={{ fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }}>1️⃣ اختر الكورس</span>
          </div>
          <ClaySelect
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">-- اختر كورس --</option>
            <option value="all">📢 إرسال لكل الطلاب المسجلين</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </ClaySelect>

          {/* Step 2: Notification Type */}
          <div>
            <label className="block text-sm font-bold text-clay-foreground mb-3" style={HEADING}>
              2️⃣ نوع الإشعار
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {notifTypes.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setNotifType(t.value)}
                  className={`p-3 rounded-2xl border-2 text-sm font-bold transition-all text-center ${
                    notifType === t.value
                      ? `${t.color} border-current shadow-clayCard scale-105`
                      : 'bg-white/60 border-transparent text-clay-muted hover:bg-slate-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Message */}
          <div>
            <label className="block text-sm font-bold text-clay-foreground mb-2" style={HEADING}>
              3️⃣ نص الرسالة
            </label>
            <ClayTextarea
              placeholder="اكتب الإشعار الذي سيصل لجميع الطلاب المشتركين في الكورس..."
              value={notifText}
              onChange={(e) => setNotifText(e.target.value)}
              rows={4}
            />
          </div>

          {/* Preview */}
          {notifText.trim() && (
            <div>
              <label className="block text-sm font-bold text-clay-foreground mb-2" style={HEADING}>
                👁️ معاينة الإشعار
              </label>
              <div className={`p-4 rounded-2xl border ${notifTypes.find(t => t.value === notifType)?.color}`}>
                <p className="text-sm leading-relaxed">{notifText}</p>
              </div>
            </div>
          )}

          {/* Send Button */}
          <div className="flex items-center gap-4">
            <ClayButton
              size="lg"
              onClick={handleSend}
              disabled={sending || !selectedCourse || !notifText.trim()}
              className="px-10"
            >
              {sending ? (
                <><Loader2 size={18} className="animate-spin" /> جاري الإرسال...</>
              ) : (
                <><Send size={18} /> إرسال الإشعار لجميع المشتركين</>
              )}
            </ClayButton>

            {sent && (
              <span className="text-emerald-600 font-bold text-sm flex items-center gap-1 animate-pulse">
                <CheckCircle size={18} /> تم الإرسال بنجاح! 🎉
              </span>
            )}
          </div>
        </div>
      </ClayCard>

      {/* Info Card */}
      <ClayCard hover={false}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center flex-shrink-0">
            <Bell size={24} className="text-violet-600" />
          </div>
          <div>
            <h3 className="font-bold text-clay-foreground mb-1" style={HEADING}>كيف يعمل نظام الإشعارات؟</h3>
            <ul className="text-sm text-clay-muted space-y-1">
              <li>📌 الإشعار يصل فقط للطلاب المشتركين في الكورس المحدد</li>
              <li>🔔 يظهر الإشعار في جرس الإشعارات لدى كل طالب</li>
              <li>⚡ الإشعار يصل فوراً بعد الضغط على زر الإرسال</li>
            </ul>
          </div>
        </div>
      </ClayCard>
    </div>
  )
}
