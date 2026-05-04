import React, { useState, useEffect } from 'react'
import { CreditCard, Ticket, CheckCircle, Loader2 } from 'lucide-react'
import ClayCard from '../../components/ui/ClayCard'
import ClayButton from '../../components/ui/ClayButton'
import ClayInput from '../../components/ui/ClayInput'
import ClayBadge from '../../components/ui/ClayBadge'
import StatOrb from '../../components/ui/StatOrb'
import { fetchTransactions, redeemAccessCode } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

const HEADING = { fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }

export default function PaymentsPage() {
  const { profile } = useAuth()
  const [code, setCode] = useState('')
  const [result, setResult] = useState(null) // { type: 'success'|'error', msg: '' }
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [redeeming, setRedeeming] = useState(false)

  useEffect(() => {
    if (profile) loadData()
  }, [profile])

  async function loadData() {
    if (!profile) return
    setLoading(true)
    try {
      // Fetch transactions
      const txs = await fetchTransactions(profile.id)
      setTransactions(txs)
    } catch (err) {
      console.error('Error loading payments data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRedeem = async (e) => {
    e.preventDefault()
    if (!code.trim()) return
    if (!profile) {
      setResult({ type: 'error', msg: 'يجب تسجيل الدخول أولاً' })
      return
    }

    setRedeeming(true)
    setResult(null)
    try {
      const res = await redeemAccessCode(code.trim(), profile.id)
      setResult({ type: 'success', msg: res.success ? 'تم تفعيل الكود بنجاح' : 'تم' })
      setCode('')
      // Refresh transactions
      const txs = await fetchTransactions(profile.id)
      setTransactions(txs)
    } catch (err) {
      setResult({ type: 'error', msg: err.response?.data?.error || err.message })
    } finally {
      setRedeeming(false)
      setTimeout(() => setResult(null), 5000)
    }
  }

  if (loading) return <div className="flex items-center justify-center py-20 gap-3 text-clay-muted"><Loader2 size={28} className="animate-spin" /> جاري التحميل...</div>

  return (
    <div>
      <h1 className="text-3xl font-black mb-8" style={HEADING}>المدفوعات </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Redeem Code */}
        <div className="lg:col-span-2">
          <ClayCard hover={false}>
            <h3 className="text-lg font-bold mb-4" style={HEADING}> شحن رصيد بكود</h3>
            <form onSubmit={handleRedeem} className="flex flex-col sm:flex-row gap-3 items-end">
              <ClayInput
                label="كود الشحن"
                placeholder="مثلاً: IGT-2026-XXXX"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="flex-1"
              />
              <ClayButton type="submit" size="default" disabled={!code.trim() || redeeming}>
                {redeeming ? 'جاري التفعيل...' : 'تفعيل ✓'}
              </ClayButton>
            </form>

            {result?.type === 'success' && (
              <div className="mt-4 p-4 rounded-clay-sm bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium flex items-center gap-2 animate-fade-in">
                <span className="text-xl"><CheckCircle size={24} /></span> {result.msg}
              </div>
            )}
            {result?.type === 'error' && (
              <div className="mt-4 p-4 rounded-clay-sm bg-red-50 border border-red-200 text-red-600 font-medium flex items-center gap-2 animate-fade-in">
                <span className="text-xl">❌</span> {result.msg}
              </div>
            )}
          </ClayCard>
        </div>

        {/* Balance */}
        <ClayCard hover={false} className="flex flex-col items-center justify-center text-center">
          <p className="text-sm font-bold text-clay-muted mb-3" style={HEADING}>رصيدك الحالي</p>
          <StatOrb value={profile?.balance || 0} label="جنيه مصري" color="violet" />
        </ClayCard>
      </div>

      {/* Transaction History */}
      <ClayCard hover={false}>
        <h3 className="text-lg font-bold mb-6" style={HEADING}>📜 سجل المعاملات</h3>

        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-right text-clay-muted border-b border-clay-accent/10">
                  <th className="pb-3 font-bold">التاريخ</th>
                  <th className="pb-3 font-bold">النوع</th>
                  <th className="pb-3 font-bold">التفاصيل</th>
                  <th className="pb-3 font-bold">المبلغ</th>
                  <th className="pb-3 font-bold">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(p => (
                  <tr key={p.id} className="border-b border-clay-accent/5 last:border-0 hover:bg-white/40 transition-colors">
                    <td className="py-3 text-clay-muted whitespace-nowrap">{new Date(p.created_at).toLocaleDateString('ar-EG')}</td>
                    <td className="py-3 font-medium">
                      {p.type === 'deposit' ? 'شحن رصيد' : p.type === 'purchase' ? 'شراء كورس' : 'استرداد'}
                    </td>
                    <td className="py-3 text-clay-muted text-xs">{p.details}</td>
                    <td className={`py-3 font-black whitespace-nowrap ${p.amount > 0 ? 'text-emerald-600' : 'text-red-500'}`} style={HEADING}>
                      <span dir="ltr">{p.amount > 0 ? '+' : ''}{p.amount}</span> ج.م
                    </td>
                    <td className="py-3">
                      <ClayBadge color={p.status === 'success' ? 'success' : p.status === 'pending' ? 'blue' : 'red'}>
                        {p.status === 'success' ? 'تم' : p.status === 'pending' ? 'معلق' : 'فشل'}
                      </ClayBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <span className="text-4xl mb-3 block">📭</span>
            <p className="text-clay-muted">مفيش معاملات لسه</p>
          </div>
        )}
      </ClayCard>
    </div>
  )
}
