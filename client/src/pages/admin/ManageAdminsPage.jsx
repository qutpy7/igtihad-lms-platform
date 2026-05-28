import React, { useState, useEffect } from 'react'
import { ShieldAlert, Trash2 } from 'lucide-react'
import ClayCard from '../../components/ui/ClayCard'
import ClayButton from '../../components/ui/ClayButton'
import { fetchAdmins, updateProfile } from '../../lib/api'
import { useToast } from '../../context/ToastContext'
import { useConfirm } from '../../context/ConfirmContext'

const HEADING = { fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }

export default function ManageAdminsPage() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const toast = useToast()
  const confirm = useConfirm()

  const loadAdmins = async () => {
    try {
      setLoading(true)
      const data = await fetchAdmins()
      setAdmins(data)
    } catch (err) {
      toast.error('خطأ في تحميل المديرين: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdmins()
  }, [])

  const handleDemote = async (id) => {
    const ok = await confirm({ title: 'سحب صلاحيات الإدارة', message: 'هل أنت متأكد من سحب صلاحيات الإدارة من هذا المستخدم؟', confirmText: 'سحب', danger: true })
    if (!ok) return
    try {
      await updateProfile(id, { role: 'student' })
      setAdmins(admins.filter(a => a.id !== id))
      toast.success('تم سحب الصلاحيات بنجاح')
    } catch (err) {
      toast.error('حدث خطأ: ' + err.message)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-black text-clay-foreground mb-2" style={HEADING}>إدارة المديرين </h1>
      <p className="text-clay-muted mb-8">عرض فريق إدارة المنصة وصلاحياتهم.</p>

      <ClayCard hover={false} className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-clay-accent/10">
                <th className="p-4 text-sm font-bold text-clay-muted">الاسم</th>
                <th className="p-4 text-sm font-bold text-clay-muted">البريد الإلكتروني</th>
                <th className="p-4 text-sm font-bold text-clay-muted">الصلاحية</th>
                <th className="p-4 text-sm font-bold text-clay-muted">الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="p-8 text-center text-clay-muted">جاري التحميل...</td></tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-clay-muted">لا يوجد مديرين آخرين.</td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id} className="border-b border-clay-accent/5 hover:bg-white/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-clay-foreground">{admin.full_name}</div>
                      <div className="text-xs text-clay-muted">{admin.phone}</div>
                    </td>
                    <td className="p-4 text-sm text-clay-muted">{admin.email || '...'}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-clay-accent/10 text-clay-accent rounded-full text-xs font-bold">
                        مدير نظام
                      </span>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleDemote(admin.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="سحب الصلاحيات" aria-label="سحب الصلاحيات"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </ClayCard>
    </div>
  )
}
