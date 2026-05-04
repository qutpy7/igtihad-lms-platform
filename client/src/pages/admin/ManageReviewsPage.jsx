import React, { useState, useEffect } from 'react'
import { Star, Trash2, Loader2, MessageCircle } from 'lucide-react'
import ClayCard from '../../components/ui/ClayCard'
import ClayButton from '../../components/ui/ClayButton'
import { fetchAllCourseReviews, deleteCourseReview } from '../../lib/api'
import { useToast } from '../../context/ToastContext'
import { useConfirm } from '../../context/ConfirmContext'

const HEADING = { fontFamily: 'Liftaswash, Nunito, Cairo, sans-serif' }
const gradeLabels = { '3rd-sec': '3 ثانوي', '2nd-sec': '2 ثانوي', '1st-sec': '1 ثانوي', '3rd-prep': '3 إعدادي' }

export default function ManageReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const toast = useToast()
  const confirm = useConfirm()

  const loadReviews = async () => {
    try {
      setLoading(true)
      const data = await fetchAllCourseReviews()
      setReviews(data)
    } catch (err) {
      toast.error('خطأ في تحميل التقييمات: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [])

  const handleDelete = async (id) => {
    const ok = await confirm({ title: 'حذف التقييم', message: 'هل أنت متأكد من حذف هذا التقييم؟', confirmText: 'حذف', danger: true })
    if (!ok) return
    try {
      await deleteCourseReview(id)
      await loadReviews()
      toast.success('تم حذف التقييم')
    } catch (err) {
      toast.error('حدث خطأ: ' + err.message)
    }
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-clay-accent" size={40} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-clay-foreground" style={HEADING}>تقييمات الطلاب</h1>
        <p className="text-clay-muted mt-1">مراقبة وإدارة تقييمات الطلاب على الكورسات</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ClayCard hover={false}>
          <div className="text-center">
            <p className="text-3xl font-black text-clay-accent" style={HEADING}>{reviews.length}</p>
            <p className="text-sm text-clay-muted font-bold">إجمالي التقييمات</p>
          </div>
        </ClayCard>
        <ClayCard hover={false}>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-3xl font-black text-amber-500" style={HEADING}>{avgRating}</span>
              <Star size={24} className="text-amber-400" fill="currentColor" />
            </div>
            <p className="text-sm text-clay-muted font-bold">متوسط التقييم</p>
          </div>
        </ClayCard>
        <ClayCard hover={false}>
          <div className="text-center">
            <p className="text-3xl font-black text-emerald-500" style={HEADING}>
              {reviews.filter(r => r.rating >= 4).length}
            </p>
            <p className="text-sm text-clay-muted font-bold">تقييمات إيجابية (4+⭐)</p>
          </div>
        </ClayCard>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <ClayCard hover={false}>
          <div className="text-center py-12 text-clay-muted">
            <MessageCircle size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-bold">لا توجد تقييمات بعد</p>
          </div>
        </ClayCard>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <ClayCard key={r.id} hover={false}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={i < r.rating ? 'text-amber-400' : 'text-slate-200'}
                        fill="currentColor"
                      />
                    ))}
                    <span className="text-sm font-bold text-clay-muted mr-2">{r.rating}/5</span>
                  </div>

                  {/* Comment */}
                  <p className="text-clay-foreground mb-3 leading-relaxed">"{r.comment}"</p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-clay-muted">
                    <span className="font-bold">👤 {r.profiles?.full_name}</span>
                    <span>📚 {r.courses?.title}</span>
                    <span>📅 {new Date(r.created_at).toLocaleDateString('ar-EG')}</span>
                  </div>
                </div>

                {/* Delete */}
                <ClayButton
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(r.id)}
                  className="!text-red-500 hover:!bg-red-50 flex-shrink-0"
                >
                  <Trash2 size={14} />
                </ClayButton>
              </div>
            </ClayCard>
          ))}
        </div>
      )}
    </div>
  )
}
