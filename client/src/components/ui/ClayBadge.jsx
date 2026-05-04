import React from 'react'

const colorMap = {
  accent:  'bg-clay-accent/10 text-clay-accent',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  pink:    'bg-pink-100 text-pink-700',
  blue:    'bg-blue-100 text-blue-700',
  red:     'bg-red-100 text-red-700',
  gray:    'bg-gray-100 text-gray-600',
}

export default function ClayBadge({ children, color = 'accent', className = '' }) {
  return (
    <span
      className={`
        inline-flex items-center rounded-full px-3 py-1
        text-xs font-bold tracking-wide
        ${colorMap[color]} ${className}
      `}
      style={{ fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }}
    >
      {children}
    </span>
  )
}
