import React from 'react'

const sizes = {
  sm: 'h-11 px-5 text-sm',
  default: 'h-14 px-8 text-base',
  lg: 'h-16 px-10 text-lg',
}

const variants = {
  primary:
    'bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white shadow-clayButton hover:shadow-clayButtonHover',
  secondary:
    'bg-white text-clay-foreground shadow-clayButton hover:shadow-clayButtonHover',
  outline:
    'border-2 border-clay-accent/20 bg-transparent text-clay-accent hover:border-clay-accent hover:bg-clay-accent/5',
  ghost:
    'text-clay-foreground hover:bg-clay-accent/10 hover:text-clay-accent',
  danger:
    'bg-gradient-to-br from-red-400 to-red-600 text-white shadow-clayButton hover:shadow-clayButtonHover',
}

export default function ClayButton({
  children,
  variant = 'primary',
  size = 'default',
  className = '',
  disabled = false,
  type = 'button',
  onClick,
  // ✅ Accessibility props
  'aria-label': ariaLabel,
  'aria-expanded': ariaExpanded,
  'aria-controls': ariaControls,
  'aria-pressed': ariaPressed,
  'aria-describedby': ariaDescribedby,
  ...rest
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      aria-pressed={ariaPressed}
      aria-describedby={ariaDescribedby}
      aria-disabled={disabled || undefined}
      className={`
        inline-flex items-center justify-center gap-2 font-bold tracking-wide
        rounded-clay-sm clay-squish cursor-pointer
        focus-visible:ring-4 focus-visible:ring-clay-accent/30 focus-visible:ring-offset-2
        focus-visible:outline-none
        ${disabled ? 'opacity-50 cursor-not-allowed !transform-none' : ''}
        ${sizes[size]} ${variants[variant]} ${className}
      `}
      style={{ fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }}
      {...rest}
    >
      {children}
    </button>
  )
}
