import React from 'react'

const colorMap = {
  violet: 'from-purple-400 to-purple-600',
  pink:   'from-pink-400 to-pink-600',
  blue:   'from-blue-400 to-blue-600',
  green:  'from-emerald-400 to-emerald-600',
  amber:  'from-amber-400 to-amber-600',
  cyan:   'from-cyan-400 to-cyan-600',
}

export default function StatOrb({ value, label, color = 'violet' }) {
  return (
    <div className="flex flex-col items-center gap-3 group">
      <div
        className={`
          w-24 h-24 sm:w-28 sm:h-28 rounded-full
          bg-gradient-to-br ${colorMap[color]}
          shadow-clayButton flex items-center justify-center
          animate-clay-breathe
          group-hover:scale-110 transition-transform duration-300
        `}
      >
        <span
          className="text-2xl sm:text-3xl font-black text-white drop-shadow-md"
          style={{ fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }}
        >
          {value}
        </span>
      </div>
      <span className="text-sm font-medium text-clay-muted">{label}</span>
    </div>
  )
}
