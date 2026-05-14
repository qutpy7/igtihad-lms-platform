import React, { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Send, Menu, X } from 'lucide-react'
import { FaFacebook, FaYoutube } from 'react-icons/fa'
import ClayBlobs from '../ui/ClayBlobs'
import ClayButton from '../ui/ClayButton'
import { useAuth } from '../../context/AuthContext'

const navLinks = [
  { to: '/', label: 'الرئيسية' },
  { to: '/courses', label: 'الكورسات' },
  { to: '/about', label: 'عنّا' },
  { to: '/contact', label: 'تواصل معنا' },
]

export default function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { user, profile } = useAuth()

  return (
    <div className="min-h-screen bg-clay-canvas relative">
      <ClayBlobs />

      {/* ─── Navbar ─── */}
      <nav className="sticky top-4 z-50 mx-4 sm:mx-8 mt-4">
        <div className="max-w-6xl mx-auto h-16 sm:h-20 rounded-[32px] sm:rounded-[40px] bg-white/70 backdrop-blur-xl shadow-clayCard flex items-center justify-between px-4 sm:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="igthad logo" className="w-10 h-10 rounded-2xl shadow-sm object-cover" />
            <span className="text-xl sm:text-2xl font-black text-clay-accent hidden sm:block" style={{ fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }}>
              اجتهاد
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `text-base font-medium transition-colors ${
                    isActive ? 'text-clay-accent font-bold' : 'text-clay-muted hover:text-clay-accent'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link to={profile?.role === 'admin' ? '/admin' : '/student'}>
                <ClayButton size="sm">لوحة التحكم</ClayButton>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <ClayButton variant="ghost" size="sm">تسجيل الدخول</ClayButton>
                </Link>
                <Link to="/signup">
                  <ClayButton size="sm">إنشاء حساب</ClayButton>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle mobile menu"
            className="md:hidden w-10 h-10 rounded-xl bg-clay-accent/10 flex items-center justify-center text-clay-accent"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden mt-3 max-w-6xl mx-auto bg-white/90 backdrop-blur-xl rounded-[24px] shadow-clayCard p-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `text-lg font-medium py-2 ${
                    isActive ? 'text-clay-accent font-bold' : 'text-clay-foreground'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <hr className="border-clay-accent/10" />
            {user ? (
              <Link to={profile?.role === 'admin' ? '/admin' : '/student'} onClick={() => setMobileOpen(false)}>
                <ClayButton className="w-full">لوحة التحكم</ClayButton>
              </Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <ClayButton variant="outline" className="w-full">تسجيل الدخول</ClayButton>
                </Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)}>
                  <ClayButton className="w-full">إنشاء حساب</ClayButton>
                </Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* ─── Page Content ─── */}
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>

      {/* ─── Footer ─── */}
      <footer className="mt-20 bg-white/40 backdrop-blur-xl border-t border-white/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
            {/* About */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="igthad logo" className="w-8 h-8 rounded-xl shadow-sm object-cover" />
                <span className="text-lg font-black text-clay-accent" style={{ fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }}>اجتهاد</span>
              </div>
              <p className="text-clay-muted text-sm leading-relaxed">
                منصة تعليمية متكاملة تهدف لتقديم أفضل تجربة تعلم للطلاب في مصر.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-clay-foreground mb-4" style={{ fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }}>روابط سريعة</h4>
              <div className="flex flex-col gap-2">
                <Link to="/courses" className="text-sm text-clay-muted hover:text-clay-accent transition-colors">الكورسات</Link>
                <Link to="/about" className="text-sm text-clay-muted hover:text-clay-accent transition-colors">عن المدرس</Link>
                <Link to="/contact" className="text-sm text-clay-muted hover:text-clay-accent transition-colors">تواصل معنا</Link>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-clay-foreground mb-4" style={{ fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }}>تواصل معنا</h4>
              <div className="flex flex-col gap-2 text-sm text-clay-muted">
                <span>📞 01012345678</span>
                <span>📧 info@igthad.com</span>
                <span>💬 واتساب: 01012345678</span>
              </div>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-bold text-clay-foreground mb-4" style={{ fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }}>تابعنا</h4>
              <div className="flex gap-3">
              {/* ✅ FIX #18: Social media links */}
              {[
                { icon: <FaFacebook size={20} />, url: 'https://facebook.com/igthad', label: 'Facebook' },
                { icon: <FaYoutube size={20} />, url: 'https://youtube.com/@igthad', label: 'YouTube' },
                { icon: <Send size={20} />, url: 'https://t.me/igthad', label: 'Telegram' }
              ].map((item, i) => (
                <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" aria-label={item.label}
                   className="w-10 h-10 rounded-xl bg-clay-accent/10 flex items-center justify-center text-clay-accent hover:bg-clay-accent/20 transition-colors">
                  {item.icon}
                </a>
              ))}
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-clay-accent/10 text-center">
            <p className="text-sm text-clay-muted">
              © 2026 منصة اجتهاد — جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
