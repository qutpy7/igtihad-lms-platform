import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ClayBlobs from '../../components/ui/ClayBlobs'
import ClayCard from '../../components/ui/ClayCard'
import ClayButton from '../../components/ui/ClayButton'
import ClayInput from '../../components/ui/ClayInput'
import ClaySelect from '../../components/ui/ClaySelect'
import { User, Phone, Mail, Lock, Loader2 } from 'lucide-react'
import { fetchSystemSettings as fetchSettings } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

const HEADING = { fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }

const EGYPT_GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية', 'المنوفية',
  'القليوبية', 'البحيرة', 'الغربية', 'بورسعيد', 'دمياط', 'الإسماعيلية',
  'السويس', 'كفر الشيخ', 'الفيوم', 'بني سويف', 'مطروح', 'شمال سيناء',
  'جنوب سيناء', 'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'البحر الأحمر',
  'الأقصر', 'أسوان', 'الوادى الجديد'
]

export default function SignUpPage() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [formData, setFormData] = useState({
    fullName: '', phone: '', email: '', password: '', grade: '', governorate: ''
  })
  const [grades, setGrades] = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    fetchSettings().then(settings => {
      const validCategories = Array.isArray(settings?.categories) ? settings.categories : []
      const validLocations = Array.isArray(settings?.locations) ? settings.locations : []
      setGrades(validCategories.map(c => ({ value: c, label: c })))
      setLocations(validLocations.map(l => ({ value: l, label: l })))
    }).finally(() => {
      setPageLoading(false)
    })
  }, [])

  const govOptions = [
    { value: '', label: 'اختر المنطقة / الدولة' },
    ...locations
  ]
  const gradeOptions = [
    { value: '', label: 'اختر الصف' },
    ...grades
  ]

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSignUp = async (e) => {
    e.preventDefault()
    if (!formData.grade || !formData.governorate) {
      setErrorMsg('الرجاء اختيار الصف الدراسي والمحافظة')
      return
    }

    setLoading(true)
    setErrorMsg('')
    try {
      const { error } = await signUp({
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        phone: formData.phone,
        grade: formData.grade,
        governorate: formData.governorate,
        role: 'student'
      })
      
      if (error) throw new Error(error)
      
      // Navigate to student dashboard after successful signup
      navigate('/student', { replace: true })
    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) {
    return <div className="min-h-screen bg-clay-canvas flex items-center justify-center"><Loader2 className="animate-spin text-clay-accent" size={32} /></div>
  }

  return (
    <div className="min-h-screen bg-clay-canvas flex items-center justify-center p-4 relative">
      <ClayBlobs />

      <div className="w-full max-w-md relative z-10 my-8">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <img src="/logo.png" alt="igthad logo" className="w-12 h-12 rounded-2xl shadow-sm object-cover" />
            <span className="text-2xl font-black text-clay-accent" style={HEADING}>اجتهاد</span>
          </Link>
        </div>

        <ClayCard hover={false}>
          <h1 className="text-2xl font-black mb-2 text-center" style={HEADING}>انضم لعائلة اجتهاد 🎓</h1>
          <p className="text-clay-muted text-center mb-8">أنشئ حسابك وابدأ تعلم</p>

          <form className="flex flex-col gap-4" onSubmit={handleSignUp}>
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold text-center">
                {errorMsg}
              </div>
            )}

            <ClayInput name="fullName" value={formData.fullName} onChange={handleChange} required label="الاسم الكامل" placeholder="مثلاً: محمد أحمد" icon={<User size={18} />} />
            <ClayInput name="phone" value={formData.phone} onChange={handleChange} required label="رقم التليفون" placeholder="01XXXXXXXXX" type="tel" icon={<Phone size={18} />} />
            <ClayInput name="email" value={formData.email} onChange={handleChange} required label="البريد الإلكتروني" placeholder="example@email.com" type="email" icon={<Mail size={18} />} />
            <ClayInput name="password" value={formData.password} onChange={handleChange} required label="كلمة المرور" placeholder="6 أحرف على الأقل" type="password" minLength="6" icon={<Lock size={18} />} />

            <div className="grid grid-cols-2 gap-4">
              <ClaySelect name="grade" value={formData.grade} onChange={handleChange} label="الصف الدراسي" options={gradeOptions} required />
              <ClaySelect name="governorate" value={formData.governorate} onChange={handleChange} label="المحافظة" options={govOptions} required />
            </div>

            <ClayButton type="submit" size="lg" className="w-full mt-2" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mx-auto" /> : 'إنشاء حساب 🚀'}
            </ClayButton>
          </form>

          <p className="text-center text-sm text-clay-muted mt-6">
            عندك حساب؟{' '}
            <Link to="/login" className="text-clay-accent font-bold hover:underline">سجّل دخول</Link>
          </p>
        </ClayCard>
      </div>
    </div>
  )
}
