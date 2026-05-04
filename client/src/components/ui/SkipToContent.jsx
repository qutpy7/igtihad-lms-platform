/* ═══════════════════════════════════════════════════
   components/ui/SkipToContent.jsx
   Accessibility: Skip navigation link for keyboard users
   ═══════════════════════════════════════════════════ */
import React from 'react'

export default function SkipToContent() {
  return (
    <a
      href="#main-content"
      className={`
        fixed top-4 right-4 z-[9999]
        bg-clay-accent text-white font-bold px-6 py-3 rounded-2xl shadow-clay
        transform -translate-y-20 opacity-0
        focus:translate-y-0 focus:opacity-100
        transition-all duration-200
        focus:outline-none focus:ring-4 focus:ring-clay-accent/30
      `}
      style={{ fontFamily: 'Cairo, sans-serif' }}
    >
      تخطى للمحتوى الرئيسي
    </a>
  )
}
