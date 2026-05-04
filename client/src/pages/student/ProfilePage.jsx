import * as React from 'react'
import { Lock, FileText, Settings, CheckCircle, Loader2, Camera } from 'lucide-react'
import ClayCard from '../../components/ui/ClayCard'
import ClayButton from '../../components/ui/ClayButton'
import ClayInput from '../../components/ui/ClayInput'
import ClaySelect from '../../components/ui/ClaySelect'
import { GRADES, GOVERNORATES } from '../../data/mockData'
import { useAuth } from '../../context/AuthContext'
import { updateProfile } from '../../lib/api'
import { fetchSystemSettings } from '../../lib/api/admin'
import { apiClient } from '../../lib/api-client'
import { useToast } from '../../context/ToastContext'

const HEADING = { fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }

export default function ProfilePage() {
  const { profile, setProfile, user, loading: authLoading, authError } = useAuth()
  const [saved, setSaved] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [categories, setCategories] = React.useState([])
  const [locations, setLocations] = React.useState([])
  const toast = useToast()
  const [formData, setFormData] = React.useState({
    full_name: '',
    phone: '',
    grade: '',
    governorate: ''
  })

  React.useEffect(() => {
    fetchSystemSettings().then(settings => {
      const validCats = Array.isArray(settings?.categories) ? settings.categories : []
      const validLocs = Array.isArray(settings?.locations) ? settings.locations : []
      setCategories(validCats.map(c => ({ value: c, label: c })))
      setLocations(validLocs.map(l => ({ value: l, label: l })))
    }).catch(console.error)
  }, [])

  React.useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        grade: profile.grade || '',
        governorate: profile.governorate || ''
      })
    }
  }, [profile])

  const govOptions = locations

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updateProfile(profile.id, formData)
      setProfile(prev => ({ ...prev, ...formData })) // Update the context immediately
      setSaved(true)
      toast.success('تم حفظ البيانات بنجاح!')
    } catch (err) {
      toast.error('خطأ في حفظ البيانات: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const [uploadingAvatar, setUploadingAvatar] = React.useState(false)

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const { data } = await apiClient.post('/upload', formData)
      
      const avatarUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${data.filePath}`
      
      // Update DB
      await updateProfile(profile.id, { avatar_url: avatarUrl })
      
      // Update Context
      setProfile(prev => ({ ...prev, avatar_url: avatarUrl }))
      toast.success('تم تحديث الصورة الشخصية بنجاح!')
    } catch (err) {
      toast.error('حدث خطأ أثناء رفع الصورة: ' + err.message)
    } finally {
      setUploadingAvatar(false)
    }
  }

  if (authLoading || (profile === null && !authLoading && user && !authError)) return <div className="text-center py-12 text-clay-muted">جاري تحميل البيانات...</div>
  if (!profile) return (
    <div className="text-center py-12 text-clay-muted">
      حدث خطأ أثناء تحميل الملف الشخصي. يرجى تسجيل الدخول مجدداً.<br />
      {authError && <span className="text-xs text-red-500 mt-2 block">{authError}</span>}
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-black mb-8" style={HEADING}>الملف الشخصي </h1>

      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <label className="relative cursor-pointer group mb-3">
          <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] shadow-clayButton flex items-center justify-center text-white text-3xl font-black overflow-hidden relative" style={HEADING}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              profile.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'ط'
            )}
            
            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${uploadingAvatar ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              {uploadingAvatar ? <Loader2 className="animate-spin text-white" size={24} /> : <Camera className="text-white" size={28} />}
            </div>
          </div>
        </label>
        <h2 className="text-xl font-bold" style={HEADING}>{profile.full_name || 'طالب جديد'}</h2>
        <p className="text-sm text-clay-muted">{user?.email}</p>
      </div>

      {/* Edit Form */}
      <ClayCard hover={false} className="mb-6">
        <h3 className="text-lg font-bold mb-6" style={HEADING}> تعديل البيانات</h3>
        <form className="flex flex-col gap-4" onSubmit={handleSave}>
          <ClayInput name="full_name" label="الاسم الكامل" placeholder="أدخل اسمك بالكامل" value={formData.full_name} onChange={handleChange} required />
          <ClayInput name="phone" label="رقم التليفون" placeholder="01XXXXXXXXX" value={formData.phone} onChange={handleChange} required />
          <ClayInput label="البريد الإلكتروني" placeholder="email" value={user?.email || ''} type="email" disabled readOnly />
          <div className="grid grid-cols-2 gap-4">
            <ClaySelect name="grade" label="التصنيف / الصف الدراسي" options={categories} value={formData.grade} onChange={handleChange} />
            <ClaySelect name="governorate" label="المحافظة" options={govOptions} value={formData.governorate} onChange={handleChange} />
          </div>
          <ClayButton type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? <Loader2 className="animate-spin mx-auto" /> : saved ? ' تم الحفظ بنجاح!' : 'حفظ التغييرات'}
          </ClayButton>
        </form>
      </ClayCard>

        {/* Change Password */}
        <ClayCard hover={false}>
          <h3 className="text-lg font-bold mb-6" style={HEADING}> تغيير كلمة المرور</h3>
          <form className="flex flex-col gap-4" onSubmit={async (e) => {
            e.preventDefault()
            toast.info('هذه الميزة غير متاحة حالياً مع النظام الجديد.')
          }}>
            <ClayInput name="current" label="كلمة المرور الحالية" type="password" placeholder="••••••" required />
            <ClayInput name="new" label="كلمة المرور الجديدة" type="password" placeholder="6 أحرف على الأقل" required />
            <ClayInput name="confirm" label="تأكيد كلمة المرور الجديدة" type="password" placeholder="أعد كتابة الكلمة الجديدة" required />
            <ClayButton type="submit" className="w-full">تغيير كلمة المرور</ClayButton>
          </form>
        </ClayCard>
    </div>
  )
}
