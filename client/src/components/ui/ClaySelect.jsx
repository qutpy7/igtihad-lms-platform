import React, { useId } from 'react'

export default function ClaySelect({
  options = [],
  label,
  placeholder = 'اختر...',
  value,
  onChange,
  name,
  className = '',
  children, // ✅ Support both options prop and children
  ...rest
}) {
  const autoId = useId()
  const selectId = rest.id || (label ? `select-${autoId}` : undefined)

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-sm font-bold text-clay-foreground"
          style={{ fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }}
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        aria-label={!label ? placeholder : undefined}
        className="
          flex w-full border-0 bg-[#EFEBF5] px-6 py-4 h-14
          text-clay-foreground text-base rounded-2xl shadow-clayPressed
          focus:bg-white focus:ring-4 focus:ring-clay-accent/20 focus:outline-none
          transition-all duration-200 cursor-pointer appearance-none
        "
        {...rest}
      >
        <option value="" disabled>{placeholder}</option>
        {/* ✅ Support children (manual <option>) OR options prop */}
        {children
          ? children
          : options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
        }
      </select>
    </div>
  )
}
