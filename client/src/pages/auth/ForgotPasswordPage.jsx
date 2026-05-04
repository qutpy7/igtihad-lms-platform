import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import ClayBlobs from '../../components/ui/ClayBlobs'
import ClayCard from '../../components/ui/ClayCard'
import ClayButton from '../../components/ui/ClayButton'
import ClayInput from '../../components/ui/ClayInput'

const HEADING = { fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)

  return (
    <div className="min-h-screen bg-clay-canvas flex items-center justify-center p-4 relative">
      <ClayBlobs />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <img src="/logo.png" alt="igthad logo" className="w-12 h-12 rounded-2xl shadow-sm object-cover" />
            <span className="text-2xl font-black text-clay-accent" style={HEADING}>اجتهاد</span>
          </Link>
        </div>

        <ClayCard hover={false}>
          {sent ? (
            <div className="text-center py-6">
              <span className="text-5xl mb-4 block">📧</span>
              <h1 className="text-2xl font-black mb-3" style={HEADING}>تم الإرسال!</h1>
              <p className="text-clay-muted mb-6 leading-relaxed">تم إرسال رابط استعادة كلمة المرور على إيميلك. افحص البريد الوارد أو الـ Spam.</p>
              <Link to="/login"><ClayButton variant="outline" className="w-full">ارجع لتسجيل الدخول</ClayButton></Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <span className="text-4xl mb-3 block">🔑</span>
                <h1 className="text-2xl font-black mb-2" style={HEADING}>نسيت كلمة المرور؟</h1>
                <p className="text-clay-muted">هنبعتلك رابط على إيميلك لإعادة تعيينها</p>
              </div>

              <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); setSent(true) }}>
                <ClayInput label="البريد الإلكتروني" placeholder="اكتب الإيميل المسجل بيه" type="email" icon="📧" />
                <ClayButton type="submit" size="lg" className="w-full">إرسال رابط الاستعادة</ClayButton>
              </form>

              <p className="text-center text-sm text-clay-muted mt-6">
                فاكر كلمة المرور؟{' '}
                <Link to="/login" className="text-clay-accent font-bold hover:underline">سجّل دخول</Link>
              </p>
            </>
          )}
        </ClayCard>
      </div>
    </div>
  )
}
