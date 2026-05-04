import React from 'react'

export default function ClayTextarea({
  placeholder = '',
  label,
  rows = 4,
  value,
  onChange,
  name,
  className = '',
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-bold text-clay-foreground" style={{ fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }}>
          {label}
        </label>
      )}
      <textarea
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        className="
          flex w-full border-0 bg-[#EFEBF5] px-6 py-4
          text-clay-foreground text-base rounded-2xl shadow-clayPressed
          placeholder:text-clay-muted resize-none
          focus:bg-white focus:ring-4 focus:ring-clay-accent/20 focus:outline-none
          transition-all duration-200
        "
      />
    </div>
  )
}
