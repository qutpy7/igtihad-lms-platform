import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react'

const ToastContext = createContext()

export const useToast = () => useContext(ToastContext)

const ICONS = {
  success: <CheckCircle size={20} className="text-emerald-500 flex-shrink-0" />,
  error: <XCircle size={20} className="text-red-500 flex-shrink-0" />,
  warning: <AlertTriangle size={20} className="text-amber-500 flex-shrink-0" />,
  info: <Info size={20} className="text-blue-500 flex-shrink-0" />,
}

const BG = {
  success: 'bg-emerald-50 border-emerald-200',
  error: 'bg-red-50 border-red-200',
  warning: 'bg-amber-50 border-amber-200',
  info: 'bg-blue-50 border-blue-200',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, duration)
    }
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // Shorthand methods
  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error', 6000),
    warning: (msg) => addToast(msg, 'warning', 5000),
    info: (msg) => addToast(msg, 'info'),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-6 left-6 z-[9999] flex flex-col gap-3 pointer-events-none" style={{ maxWidth: '420px' }}>
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-lg backdrop-blur-xl animate-slide-up ${BG[t.type] || BG.info}`}
            style={{ animation: 'slideUp 0.35s ease-out' }}
          >
            {ICONS[t.type]}
            <p className="text-sm font-bold text-slate-800 flex-1">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              aria-label="إغلاق"
              className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </ToastContext.Provider>
  )
}
