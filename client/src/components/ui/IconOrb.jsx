import React from 'react'

const sizeMap = {
  sm: 'w-10 h-10 text-lg rounded-xl',
  md: 'w-14 h-14 text-2xl rounded-2xl',
  lg: 'w-20 h-20 text-3xl rounded-2xl',
}

export default function IconOrb({ emoji, color = 'from-purple-400 to-purple-600', size = 'md' }) {
  return (
    <div
      className={`
        bg-gradient-to-br ${color}
        shadow-clayButton flex items-center justify-center flex-shrink-0
        ${sizeMap[size]}
      `}
    >
      {emoji}
    </div>
  )
}
