import React, { useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function ClayInput({
  placeholder = '',
  type = 'text',
  label,
  icon,
  error,
  value,
  onChange,
  name,
  className = '',
  required,
  // ✅ Accessibility
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  ...props
}) {
  // ✅ Auto-generate unique id for label<->input association
  const autoId = useId()
  const inputId = props.id || (label ? `input-${autoId}` : undefined)
  const errorId = error ? `error-${autoId}` : undefined

  const [showPassword, setShowPassword] = useState(false)
  const isPasswordInput = type === 'password'
  const actualType = isPasswordInput ? (showPassword ? 'text' : 'password') : type

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-bold text-clay-foreground"
          style={{ fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }}
        >
          {label}
          {required && <span aria-hidden="true" className="text-red-500 mr-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-clay-muted text-lg" aria-hidden="true">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          type={actualType}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          aria-label={!label ? ariaLabel : undefined}
          aria-describedby={errorId || ariaDescribedby}
          aria-invalid={error ? 'true' : undefined}
          aria-required={required ? 'true' : undefined}
          {...props}
          className={`
            flex w-full border-0 bg-[#EFEBF5] px-6 py-4 h-14
            text-clay-foreground text-base rounded-2xl shadow-clayPressed
            placeholder:text-clay-muted
            focus:bg-white focus:ring-4 focus:ring-clay-accent/20 focus:outline-none
            transition-all duration-200
            ${icon ? 'pr-12' : ''}
            ${isPasswordInput ? 'pl-12' : ''}
            ${error ? 'ring-2 ring-red-400' : ''}
          `}
        />
        {isPasswordInput && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-clay-muted hover:text-clay-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded-full p-1"
            aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && (
        <span id={errorId} role="alert" className="text-xs font-medium text-red-500">
          {error}
        </span>
      )}
    </div>
  )
}
