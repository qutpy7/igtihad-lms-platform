import React, { useState, useEffect } from 'react'
import { CheckCircle, Clock, Loader2 } from 'lucide-react'
import ClayCard from '../../components/ui/ClayCard'
import ClayButton from '../../components/ui/ClayButton'
import ClayInput from '../../components/ui/ClayInput'
import ClaySelect from '../../components/ui/ClaySelect'
import ClayBadge from '../../components/ui/ClayBadge'
import { fetchAccessCodes, generateAccessCodes as createAccessCodes, fetchCourses } from '../../lib/api'
import { useToast } from '../../context/ToastContext'

const HEADING = { fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }

export default function ManageCodesPage() {
  const [codes, setCodes] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [genCount, setGenCount] = useState('')
  const [genCourse, setGenCourse] = useState('')
  const [generatedCodes, setGeneratedCodes] = useState([])
  const [copiedId, setCopiedId] = useState(null)
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [codesData, coursesData] = await Promise.all([fetchAccessCodes(), fetchCourses()])
      setCodes(codesData)
      setCourses(coursesData)
    } catch (err) { toast.error('خطأ في تحميل الأكواد: ' + err.message) }
    finally { setLoading(false) }
  }

  const courseOptions = courses.map(c => ({ value: String(c.id), label: c.title }))

  const handleGenerate = async (e) => {
    e.preventDefault()
    setSaving(true)
    const count = parseInt(genCount) || 3
    const courseId = parseInt(genCourse)
    if (!courseId) { toast.warning('اختر الكورس أولاً'); setSaving(false); return }

    try {
      const res = await createAccessCodes(courseId, count)
      setGeneratedCodes(res.generatedCodes)
      await loadData()
      toast.success(`تم إنشاء ${res.count} كود بنجاح!`)
    } catch (err) { toast.error('خطأ: ' + err.message) }
    finally { setSaving(false) }
  }

  const copyCode = (code, idx) => {
    navigator.clipboard.writeText(code)
    setCopiedId(idx)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const statusMap = {
    used: { label: 'مستخدم', color: 'success', icon: <CheckCircle size={14} /> },
    available: { label: 'متاح', color: 'blue', icon: <CheckCircle size={14} /> },
    expired: { label: 'منتهي', color: 'red', icon: <Clock size={14} /> },
  }

  if (loading) return <div className="flex items-center justify-center py-20 gap-3 text-clay-muted"><Loader2 size={28} className="animate-spin" /> جاري التحميل...</div>

  return (
    <div>
      <h1 className="text-3xl font-black mb-8" style={HEADING}>إدارة الأكواد </h1>

      <ClayCard hover={false} className="mb-6">
        <h3 className="text-lg font-bold mb-4" style={HEADING}>➕ توليد أكواد جديدة</h3>
        <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-4 items-end">
          <ClaySelect label="الكورس" options={courseOptions} value={genCourse} onChange={e => setGenCourse(e.target.value)} className="flex-1" />
          <ClayInput label="عدد الأكواد" placeholder="3" type="number" value={genCount} onChange={e => setGenCount(e.target.value)} className="w-32" />
          <ClayButton type="submit" disabled={saving}>{saving ? 'جاري...' : 'توليد 🎲'}</ClayButton>
        </form>

        {generatedCodes.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-bold text-clay-accent mb-3" style={HEADING}>✨ تم توليد {generatedCodes.length} كود وحفظهم في قاعدة البيانات:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {generatedCodes.map((code, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white/70 rounded-clay-sm p-3 border border-clay-accent/10">
                  <span className="font-mono text-sm font-bold text-clay-accent">{code}</span>
                  <button onClick={() => copyCode(code, idx)} className="text-sm hover:scale-110 transition-transform" title="نسخ">
                    {copiedId === idx ? <CheckCircle size={20} className="text-emerald-500" /> : '📋'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </ClayCard>

      <ClayCard hover={false}>
        <h3 className="text-lg font-bold mb-6" style={HEADING}>📋 كل الأكواد ({codes.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right text-clay-muted border-b border-clay-accent/10">
                <th className="pb-3 font-bold">الكود</th>
                <th className="pb-3 font-bold">الكورس</th>
                <th className="pb-3 font-bold">الحالة</th>
                <th className="pb-3 font-bold hidden md:table-cell">الطالب</th>
                <th className="pb-3 font-bold hidden sm:table-cell">تاريخ الإنشاء</th>
              </tr>
            </thead>
            <tbody>
              {codes.map(c => {
                const s = statusMap[c.status] || statusMap.available
                return (
                  <tr key={c.id} className="border-b border-clay-accent/5 last:border-0">
                    <td className="py-3 font-mono text-xs font-bold text-clay-accent">{c.code}</td>
                    <td className="py-3 text-clay-foreground">{c.courses?.title || '—'}</td>
                    <td className="py-3"><ClayBadge color={s.color}>{s.icon} {s.label}</ClayBadge></td>
                    <td className="py-3 text-clay-muted hidden md:table-cell">{c.profiles?.full_name || '—'}</td>
                    <td className="py-3 text-clay-muted hidden sm:table-cell">{c.created_at?.split('T')[0]}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </ClayCard>
    </div>
  )
}
