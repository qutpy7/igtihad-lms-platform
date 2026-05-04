import React from 'react'
import { GraduationCap, Rocket, Target, LineChart } from 'lucide-react'
import { Link } from 'react-router-dom'
import ClayCard from '../../components/ui/ClayCard'
import ClayButton from '../../components/ui/ClayButton'
import StatOrb from '../../components/ui/StatOrb'
import IconOrb from '../../components/ui/IconOrb'
import SectionHeader from '../../components/ui/SectionHeader'

const HEADING = { fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }

export default function AboutPage() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] shadow-clayButton flex items-center justify-center text-5xl mx-auto mb-6 animate-clay-breathe">
          👨‍🏫
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-clay-foreground mb-4" style={HEADING}>الأستاذ أحمد</h1>
        <p className="text-xl text-clay-accent font-bold mb-4" style={HEADING}>مدرس رياضيات وعلوم</p>
        <p className="text-lg text-clay-muted font-medium max-w-2xl mx-auto leading-relaxed">
          مدرس متخصص في تبسيط المواد العلمية وتقديمها بأسلوب سهل وممتع. هدفي إن كل طالب يفهم ويستمتع بالتعلم.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-16">
        <StatOrb value="+10" label="سنوات خبرة" color="violet" />
        <StatOrb value="+500" label="طالب تخرّج" color="pink" />
        <StatOrb value="25" label="كورس منشور" color="blue" />
        <StatOrb value="97%" label="نسبة النجاح" color="green" />
      </div>

      {/* Journey Timeline */}
      <div className="mb-16">
        <SectionHeader title="رحلتي في التعليم" subtitle="محطات مهمة في مسيرتي" />
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
          {[
            { year: '2015', title: 'بداية التدريس', desc: 'بدأت أدرس في مراكز تعليمية وقابلت أول دفعة طلاب', icon: '🌱' },
            { year: '2018', title: 'التوسع والانتشار', desc: 'وصل عدد الطلاب لأكتر من 200 طالب سنوياً', icon: <LineChart size={24} /> },
            { year: '2022', title: 'التحول الرقمي', desc: 'بدأت أسجل فيديوهات وأنشر محتوى تعليمي أونلاين', icon: '💻' },
            { year: '2026', title: 'إطلاق اجتهاد', desc: 'أطلقت المنصة لتقديم تجربة تعليمية متكاملة لكل الطلاب', icon: <Rocket size={24} /> },
          ].map((item, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="flex flex-col items-center">
                <IconOrb emoji={item.icon} color="from-[#A78BFA] to-[#7C3AED]" size="md" />
                {i < 3 && <div className="w-0.5 h-8 bg-clay-accent/20 mt-2" />}
              </div>
              <div className="flex-1 pb-4">
                <span className="text-xs font-bold text-clay-accent" style={HEADING}>{item.year}</span>
                <h3 className="text-lg font-bold mb-1" style={HEADING}>{item.title}</h3>
                <p className="text-clay-muted text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Teaching Style */}
      <div className="mb-16">
        <SectionHeader title="أسلوب الشرح" subtitle="3 مبادئ أساسية في طريقة تدريسي" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <Target size={24} />, title: 'تبسيط المفاهيم', desc: 'بحوّل أصعب المفاهيم لحاجات بسيطة وسهلة الفهم', color: 'from-violet-400 to-violet-600' },
            { icon: '💡', title: 'أمثلة عملية', desc: 'كل مفهوم بيتشرح بأمثلة حقيقية من الحياة والامتحانات', color: 'from-pink-400 to-pink-600' },
            { icon: '📊', title: 'متابعة مستمرة', desc: 'بتابع مستوى كل طالب وبقدم نصائح مخصصة', color: 'from-blue-400 to-blue-600' },
          ].map((item, i) => (
            <ClayCard key={i} className="text-center">
              <IconOrb emoji={item.icon} color={item.color} size="lg" className="mx-auto" />
              <div className="flex justify-center mt-4">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${item.color} shadow-clayButton flex items-center justify-center text-3xl`}>{item.icon}</div>
              </div>
              <h3 className="text-xl font-bold mt-5 mb-3" style={HEADING}>{item.title}</h3>
              <p className="text-clay-muted font-medium leading-relaxed">{item.desc}</p>
            </ClayCard>
          ))}
        </div>
      </div>

      {/* CTA */}
      <ClayCard hover={false} className="text-center bg-gradient-to-br from-[#A78BFA]/10 to-[#7C3AED]/10">
        <h2 className="text-2xl sm:text-3xl font-black text-clay-foreground mb-4" style={HEADING}>عاوز تبدأ معايا؟ </h2>
        <p className="text-clay-muted font-medium mb-6 max-w-md mx-auto">انضم لعائلة اجتهاد وابدأ رحلة التعلم</p>
        <Link to="/signup"><ClayButton size="lg">سجّل دلوقتي</ClayButton></Link>
      </ClayCard>
    </section>
  )
}
