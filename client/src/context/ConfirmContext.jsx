import React, { createContext, useContext, useState, useCallback } from 'react'
import { AlertTriangle } from 'lucide-react'
import ClayButton from '../components/ui/ClayButton'

const ConfirmContext = createContext()

export const useConfirm = () => useContext(ConfirmContext)

export function ConfirmProvider({ children }) {
  const [state, setState] = useState({
    open: false,
    title: '',
    message: '',
    confirmText: 'تأكيد',
    cancelText: 'إلغاء',
    danger: false,
    resolve: null,
  })

  const confirm = useCallback(({ title, message, confirmText, cancelText, danger } = {}) => {
    return new Promise((resolve) => {
      setState({
        open: true,
        title: title || 'تأكيد العملية',
        message: message || 'هل أنت متأكد؟',
        confirmText: confirmText || 'تأكيد',
        cancelText: cancelText || 'إلغاء',
        danger: danger ?? false,
        resolve,
      })
    })
  }, [])

  const handleClose = (result) => {
    state.resolve?.(result)
    setState(prev => ({ ...prev, open: false }))
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {/* Modal Overlay */}
      {state.open && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => handleClose(false)}
          />

          {/* Dialog */}
          <div
            className="relative bg-white rounded-[28px] shadow-2xl p-8 max-w-sm w-full"
            style={{ animation: 'dialogIn 0.2s ease-out' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                state.danger ? 'bg-red-100' : 'bg-amber-100'
              }`}>
                <AlertTriangle size={24} className={state.danger ? 'text-red-500' : 'text-amber-500'} />
              </div>
              <h3 className="text-lg font-black text-slate-800" style={{ fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }}>
                {state.title}
              </h3>
            </div>

            <p className="text-slate-600 text-sm mb-6 leading-relaxed">{state.message}</p>

            <div className="flex gap-3 justify-end">
              <ClayButton variant="outline" size="sm" onClick={() => handleClose(false)}>
                {state.cancelText}
              </ClayButton>
              <ClayButton
                size="sm"
                onClick={() => handleClose(true)}
                className={state.danger ? '!bg-red-500 !shadow-none hover:!bg-red-600' : ''}
              >
                {state.confirmText}
              </ClayButton>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes dialogIn {
          from { opacity: 0; transform: scale(0.9) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </ConfirmContext.Provider>
  )
}
