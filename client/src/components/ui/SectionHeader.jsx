import React from 'react'

export default function SectionHeader({ title, subtitle, badge, align = 'center' }) {
  const alignClass = align === 'center' ? 'text-center' : 'text-right'

  return (
    <div className={`mb-12 ${alignClass}`}>
      {badge && (
        <div className={`inline-flex items-center gap-2 bg-white/70 backdrop-blur-xl rounded-full px-5 py-2.5 shadow-clayCard mb-6 ${align === 'center' ? '' : ''}`}>
          <span
            className="text-sm font-bold text-clay-accent tracking-wide"
            style={{ fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }}
          >
            {badge}
          </span>
        </div>
      )}
      <h2
        className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-clay-foreground mb-4"
        style={{ fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={`text-lg text-clay-muted font-medium ${align === 'center' ? 'max-w-xl mx-auto' : 'max-w-xl'}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
