import React from 'react'

export default function ClayCard({
  children,
  className = '',
  hover = true,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-[32px] bg-clay-cardBg
        p-6 sm:p-8 text-clay-foreground shadow-clayCard
        backdrop-blur-xl
        ${hover ? 'clay-lift hover:shadow-clayCardHover' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      <div className="relative z-10 flex h-full flex-col">
        {children}
      </div>
    </div>
  )
}
