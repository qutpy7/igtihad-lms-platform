import React, { useState, useEffect } from 'react'
import ClayCard from '../../components/ui/ClayCard'
import ClayButton from '../../components/ui/ClayButton'
import ClayInput from '../../components/ui/ClayInput'
import { Plus, Trash2, Loader2, Save } from 'lucide-react'
import { fetchSystemSettings, updateSystemSettings } from '../../lib/api/admin'
import { useToast } from '../../context/ToastContext'

const HEADING = { fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }

export default function ManageSettingsPage() {
  const [settings, setSettings] = useState({ categories: [], locations: [] })
  const [newCat, setNewCat] = useState('')
  const [newLoc, setNewLoc] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const data = await fetchSystemSettings()
      setSettings({
        categories: Array.isArray(data?.categories) ? data.categories : [],
        locations: Array.isArray(data?.locations) ? data.locations : []
      })
    } catch (err) {
      toast.error('حدث خطأ أثناء تحميل الإعدادات')
      setSettings({ categories: [], locations: [] })
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = () => {
    if (!newCat.trim()) return
    if (settings.categories.includes(newCat.trim())) {
      toast.error('هذا التصنيف موجود بالفعل')
      return
    }
    setSettings(prev => ({ ...prev, categories: [...prev.categories, newCat.trim()] }))
    setNewCat('')
  }

  const handleAddLocation = () => {
    if (!newLoc.trim()) return
    if (settings.locations.includes(newLoc.trim())) {
      toast.error('هذه المنطقة/الدولة موجودة بالفعل')
      return
    }
    setSettings(prev => ({ ...prev, locations: [...prev.locations, newLoc.trim()] }))
    setNewLoc('')
  }

  const handleRemoveCategory = (itemToRemove) => {
    setSettings(prev => ({ ...prev, categories: prev.categories.filter(c => c !== itemToRemove) }))
  }

  const handleRemoveLocation = (itemToRemove) => {
    setSettings(prev => ({ ...prev, locations: prev.locations.filter(c => c !== itemToRemove) }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateSystemSettings(settings)
      toast.success('تم حفظ التعديلات بنجاح')
    } catch (err) {
      toast.error('حدث خطأ أثناء الحفظ')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="animate-spin mx-auto text-clay-accent" size={32} /></div>

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black mb-2" style={HEADING}>إعدادات المنصة ⚙️</h1>
          <p className="text-clay-muted">إدارة التصنيفات والمناطق الجغرافية التي تظهر للطلاب عند التسجيل.</p>
        </div>
        <ClayButton onClick={handleSave} disabled={saving} className="flex items-center justify-center gap-2 w-full sm:w-auto">
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          حفظ التعديلات
        </ClayButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Categories Box */}
        <ClayCard hover={false}>
          <h3 className="text-lg font-bold mb-4" style={HEADING}>التصنيفات المتاحة (الصفوف الدراسية أو غيرها)</h3>
          
          <div className="flex gap-2 mb-6">
            <ClayInput 
              value={newCat} 
              onChange={e => setNewCat(e.target.value)} 
              placeholder="مثال: رجال أعمال، الصف الأول..."
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              className="flex-1"
            />
            <ClayButton onClick={handleAddCategory} className="flex items-center gap-2">
              <Plus size={18} />
              إضافة
            </ClayButton>
          </div>

          {settings.categories.length === 0 ? (
            <p className="text-center text-clay-muted py-4">لا توجد تصنيفات حالياً</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-2">
              {settings.categories.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-clay-accent/5 border border-clay-accent/10 rounded-xl">
                  <span className="font-medium text-clay-foreground">{cat}</span>
                  <button 
                    onClick={() => handleRemoveCategory(cat)}
                    aria-label="حذف الفئة"
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </ClayCard>

        {/* Locations Box */}
        <ClayCard hover={false}>
          <h3 className="text-lg font-bold mb-4" style={HEADING}>المناطق / المحافظات / الدول</h3>
          
          <div className="flex gap-2 mb-6">
            <ClayInput 
              value={newLoc} 
              onChange={e => setNewLoc(e.target.value)} 
              placeholder="مثال: القاهرة، السعودية، الكويت..."
              onKeyDown={(e) => e.key === 'Enter' && handleAddLocation()}
              className="flex-1"
            />
            <ClayButton onClick={handleAddLocation} className="flex items-center gap-2">
              <Plus size={18} />
              إضافة
            </ClayButton>
          </div>

          {settings.locations.length === 0 ? (
            <p className="text-center text-clay-muted py-4">لا توجد مناطق حالياً</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-2">
              {settings.locations.map((loc, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-clay-accent/5 border border-clay-accent/10 rounded-xl">
                  <span className="font-medium text-clay-foreground">{loc}</span>
                  <button 
                    onClick={() => handleRemoveLocation(loc)}
                    aria-label="حذف المحافظة"
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </ClayCard>
      </div>
    </div>
  )
}
