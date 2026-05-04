import React from 'react'
import { Link } from 'react-router-dom'
import ClayButton from '../../components/ui/ClayButton'
import ClayBlobs from '../../components/ui/ClayBlobs'

const HEADING = { fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-clay-canvas flex items-center justify-center p-4 relative">
      <ClayBlobs />
      <div className="relative z-10 text-center max-w-md">
        <div className="text-9xl font-black text-clay-accent/20 mb-2" style={HEADING}>404</div>
        <h1 className="text-3xl font-black text-clay-foreground mb-3" style={HEADING}>الصفحة غير موجودة</h1>
        <p className="text-clay-muted mb-8">الرابط اللي دخلت عليه مش موجود أو تم حذفه.</p>
        <Link to="/">
          <ClayButton size="lg">العودة للرئيسية 🏠</ClayButton>
        </Link>
      </div>
    </div>
  )
}
