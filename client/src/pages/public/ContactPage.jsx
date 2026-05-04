import React, { useState } from 'react'
import { Mail, HelpCircle, CheckCircle, MessageCircle } from 'lucide-react'
import ClayCard from '../../components/ui/ClayCard'
import ClayButton from '../../components/ui/ClayButton'
import ClayInput from '../../components/ui/ClayInput'
import ClayTextarea from '../../components/ui/ClayTextarea'
import IconOrb from '../../components/ui/IconOrb'
import SectionHeader from '../../components/ui/SectionHeader'

const HEADING = { fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }

export default function ContactPage() {
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
      <SectionHeader title="تواصل معنا" subtitle="عندك سؤال أو استفسار؟ احنا هنا عشانك" badge="📞 تواصل" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        {/* Contact Form */}
        <ClayCard hover={false}>
          <h3 className="text-xl font-bold mb-6" style={HEADING}>ابعتلنا رسالة ✉️</h3>
          {sent ? (
            <div className="text-center py-12">
              <span className="text-5xl mb-4 block"><CheckCircle size={24} /></span>
              <h4 className="text-xl font-bold text-clay-accent mb-2" style={HEADING}>تم الإرسال بنجاح!</h4>
              <p className="text-clay-muted">هنرد عليك في أقرب وقت إن شاء الله</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <ClayInput label="الاسم" placeholder="اكتب اسمك..." />
              <ClayInput label="البريد الإلكتروني" placeholder="example@email.com" type="email" />
              <ClayInput label="الموضوع" placeholder="موضوع الرسالة..." />
              <ClayTextarea label="الرسالة" placeholder="اكتب رسالتك هنا..." rows={5} />
              <ClayButton type="submit" size="lg" className="w-full mt-2">إرسال الرسالة 📩</ClayButton>
            </form>
          )}
        </ClayCard>

        {/* Contact Info */}
        <div className="flex flex-col gap-6">
          <ClayCard hover={false}>
            <h3 className="text-xl font-bold mb-6" style={HEADING}>معلومات التواصل</h3>
            <div className="flex flex-col gap-5">
              {[
                { icon: '📞', label: 'التليفون', value: '01012345678', color: 'from-blue-400 to-blue-600' },
                { icon: <MessageCircle size={24} />, label: 'واتساب', value: '01012345678', color: 'from-emerald-400 to-emerald-600' },
                { icon: <Mail size={24} />, label: 'الإيميل', value: 'info@igthad.com', color: 'from-purple-400 to-purple-600' },
                { icon: '📍', label: 'العنوان', value: 'القاهرة، مصر', color: 'from-pink-400 to-pink-600' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <IconOrb emoji={item.icon} color={item.color} />
                  <div>
                    <p className="text-xs font-bold text-clay-muted uppercase tracking-wide">{item.label}</p>
                    <p className="font-medium text-clay-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </ClayCard>

          <ClayCard hover={false}>
            <h3 className="text-xl font-bold mb-6" style={HEADING}>تابعنا على السوشيال 🌐</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: '📘', label: 'فيسبوك', color: 'from-blue-400 to-blue-600' },
                { icon: '▶️', label: 'يوتيوب', color: 'from-red-400 to-red-600' },
                { icon: '✈️', label: 'تليجرام', color: 'from-cyan-400 to-cyan-600' },
              ].map((s, i) => (
                <a key={i} href="#" className="flex flex-col items-center gap-2 group">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} shadow-clayButton flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300`}>
                    {s.icon}
                  </div>
                  <span className="text-xs font-bold text-clay-muted">{s.label}</span>
                </a>
              ))}
            </div>
          </ClayCard>

          {/* FAQ */}
          <ClayCard hover={false}>
            <h3 className="text-xl font-bold mb-4" style={HEADING}>أسئلة شائعة </h3>
            {[
              { q: 'إزاي أشترك في كورس؟', a: 'سجّل حساب → اختار الكورس → ادفع بكود الشحن أو أونلاين' },
              { q: 'هل فيه ضمان استرداد؟', a: 'أيوه، لو مش راضي خلال 7 أيام من الاشتراك' },
              { q: 'هل أقدر أتواصل مع المدرس؟', a: 'طبعاً، من خلال قسم الأسئلة في كل درس أو الواتساب' },
            ].map((faq, i) => (
              <div key={i} className="py-3 border-b border-clay-accent/10 last:border-0">
                <p className="font-bold text-sm text-clay-foreground mb-1">{faq.q}</p>
                <p className="text-sm text-clay-muted">{faq.a}</p>
              </div>
            ))}
          </ClayCard>
        </div>
      </div>
    </section>
  )
}
