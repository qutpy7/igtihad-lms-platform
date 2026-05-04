import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ClayBlobs from '../../components/ui/ClayBlobs'
import ClayCard from '../../components/ui/ClayCard'
import ClayButton from '../../components/ui/ClayButton'
import ClayInput from '../../components/ui/ClayInput'
import { User, Phone, Mail, Lock, KeyRound, ShieldAlert, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const HEADING = { fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }

export default function AdminSignUpPage() {
  const navigate = useNavigate()
  const { adminSignUp } = useAuth()
  const [formData, setFormData] = useState({
    fullName: '', phone: '', email: '', password: '', adminSecret: ''
  })
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleAdminSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    
    try {
      // Create account with admin role
      const { error } = await adminSignUp({
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        phone: formData.phone,
        secret: formData.adminSecret
      })

      if (error) throw new Error(error)

      // 3. Navigate to admin dashboard
      navigate('/admin', { replace: true })
    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-2xl font-black mb-2 text-center text-clay-accent flex items-center justify-center gap-2" style={HEADING}>
            <ShieldAlert size={28} /> تسجيل كمدير 
          </h1>
          <p className="text-clay-muted text-center mb-8">أدخل الكود السري للإنضمام للإدارة</p>

          <form className="flex flex-col gap-4" onSubmit={handleAdminSignUp}>
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold text-center">
                {errorMsg}
              </div>
            )}

            <ClayInput name="fullName" value={formData.fullName} onChange={handleChange} required label="الاسم الكامل" placeholder="مثلاً: أحمد محمود" icon={<User size={18} />} />
            <ClayInput name="phone" value={formData.phone} onChange={handleChange} required label="رقم التليفون" placeholder="01XXXXXXXXX" type="tel" icon={<Phone size={18} />} />
            <ClayInput name="email" value={formData.email} onChange={handleChange} required label="البريد الإلكتروني" placeholder="admin@example.com" type="email" icon={<Mail size={18} />} />
            <ClayInput name="password" value={formData.password} onChange={handleChange} required label="كلمة المرور" placeholder="6 أحرف على الأقل" type="password" minLength="6" icon={<Lock size={18} />} />
            <ClayInput name="adminSecret" value={formData.adminSecret} onChange={handleChange} required label="الكود السري للإدارة" placeholder="أدخل الكود السري" type="password" icon={<KeyRound size={18} />} />

            <ClayButton type="submit" size="lg" className="w-full mt-2" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mx-auto" /> : 'إنشاء حساب مدير 🚀'}
            </ClayButton>
          </form>

          <p className="text-center text-sm text-clay-muted mt-6">
            تسجيل كطالب؟{' '}
            <Link to="/signup" className="text-clay-accent font-bold hover:underline">اضغط هنا</Link>
          </p>
        </ClayCard>
      </div>
    </div>
  )
}
