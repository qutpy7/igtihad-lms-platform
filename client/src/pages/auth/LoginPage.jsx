import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ClayBlobs from '../../components/ui/ClayBlobs'
import { useAuth } from '../../context/AuthContext'
import { apiClient } from '../../lib/api-client'
import ClayCard from '../../components/ui/ClayCard'
import ClayButton from '../../components/ui/ClayButton'
import ClayInput from '../../components/ui/ClayInput'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'

const HEADING = { fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }

export default function LoginPage() {
  const navigate = useNavigate()
  const { user, profile, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [serverStatus, setServerStatus] = useState('checking') // 'online', 'offline', 'checking'

  // Check server health on load
  useEffect(() => {
    const checkServer = async () => {
      try {
        await apiClient.get('/health', { timeout: 5000 });
        setServerStatus('online');
      } catch (err) {
        setServerStatus('offline');
        console.error('Server health check failed:', err);
      }
    };
    checkServer();
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user && profile) {
      const role = profile.role || 'student'
      navigate(role === 'admin' ? '/admin' : '/student', { replace: true })
    }
  }, [user, profile, navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    if (loading) return
    
    setLoading(true)
    setErrorMsg('')
    
    console.log('Login form submitted')
    
    try {
      console.log('LoginPage: form submitted, checking server health...');
      
      // 1. Quick check if server is even reachable
      try {
        await apiClient.get('/health', { timeout: 10000 });
        console.log('LoginPage: server is reachable');
      } catch (connErr) {
        console.error('LoginPage: server unreachable:', connErr);
        setErrorMsg('لا يمكن الاتصال بالسيرفر. تأكد أن السيرفر يعمل.');
        setLoading(false);
        return;
      }

      console.log('LoginPage: calling signIn');
      const { data, error } = await signIn(email, password)
      
      if (error) {
        console.error('LoginPage: signIn returned error:', error);
        setErrorMsg(error)
        setLoading(false)
        return
      }
      
      console.log('LoginPage: signIn success, user:', data.user);
      
      const role = data.user.role || 'student'
      const targetPath = role === 'admin' ? '/admin' : '/student'
      
      console.log('LoginPage: Redirecting to', targetPath);
      navigate(targetPath, { replace: true })
      
    } catch (err) {
      console.error('LoginPage: handleLogin caught error:', err);
      setErrorMsg('حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-clay-canvas flex items-center justify-center p-4 relative">
      <ClayBlobs />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <img src="/logo.png" alt="igthad logo" className="w-12 h-12 rounded-2xl shadow-sm object-cover" />
            <span className="text-2xl font-black text-clay-accent" style={HEADING}>اجتهاد</span>
          </Link>
        </div>

        <ClayCard hover={false}>
          <h1 className="text-2xl font-black mb-2 text-center" style={HEADING}>مرحباً بعودتك 👋</h1>
          <p className="text-clay-muted text-center mb-8">سجّل دخولك وأكمل تعلمك</p>

          <div className="mb-6 flex justify-center">
            {serverStatus === 'checking' && <span className="text-[10px] text-clay-muted italic">جاري فحص الاتصال بالسيرفر...</span>}
            {serverStatus === 'online' && <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">● السيرفر متصل</span>}
            {serverStatus === 'offline' && <span className="text-[10px] text-red-500 font-bold flex items-center gap-1">● السيرفر غير متصل!</span>}
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold text-center">
                {errorMsg}
              </div>
            )}
            
            <ClayInput 
              label="البريد الإلكتروني" 
              placeholder="example@email.com" 
              type="email" 
              icon={<Mail size={18} />} 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="relative">
              <ClayInput
                label="كلمة المرور"
                placeholder="••••••••"
                type="password"
                icon={<Lock size={18} />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm font-medium text-clay-accent hover:underline">نسيت كلمة المرور؟</Link>
            </div>

            <ClayButton type="submit" size="lg" className="w-full mt-2" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mx-auto" /> : 'تسجيل الدخول'}
            </ClayButton>
          </form>

          <p className="text-center text-sm text-clay-muted mt-6 pt-6 border-t border-clay-accent/10">
            مالكش حساب؟{' '}
            <Link to="/signup" className="text-clay-accent font-bold hover:underline">سجّل دلوقتي</Link>
          </p>
        </ClayCard>
      </div>
    </div>
  )
}
