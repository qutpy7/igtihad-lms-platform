import React from 'react'
import ClayButton from './ui/ClayButton'

const HEADING = { fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-clay-canvas flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-black text-clay-foreground mb-3" style={HEADING}>حدث خطأ غير متوقع</h1>
            <p className="text-clay-muted mb-6">حصلت مشكلة أثناء تحميل الصفحة. جرب تحدّث الصفحة.</p>
            <ClayButton onClick={() => window.location.reload()}>
              تحديث الصفحة 🔄
            </ClayButton>
            {import.meta.env.DEV && this.state.error && (
              <pre className="mt-6 text-xs text-red-500 text-left bg-red-50 p-4 rounded-2xl overflow-auto max-h-40">
                {this.state.error.toString()}
              </pre>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
