/* ═══════════════════════════════════════════════════
   components/ui/SkeletonLoader.jsx
   بديل أنيق للـ Spinner — يعرض هياكل رمادية متحركة
   ═══════════════════════════════════════════════════ */
import React from 'react'

// مربع skeleton واحد
function Bone({ className = '' }) {
  return (
    <div
      className={`bg-clay-accent/10 rounded-xl animate-pulse ${className}`}
    />
  )
}

// ─── Skeletons مخصصة لكل نوع ───────────────────────────────────

/** بطاقة كورس skeleton */
export function CourseCardSkeleton() {
  return (
    <div className="rounded-3xl bg-white/60 border border-white/40 shadow-clay p-5 flex flex-col gap-4">
      <Bone className="h-40 rounded-2xl" />
      <Bone className="h-5 w-3/4" />
      <Bone className="h-4 w-1/2" />
      <div className="flex gap-2 mt-auto pt-2">
        <Bone className="h-4 w-16" />
        <Bone className="h-4 w-16" />
      </div>
      <Bone className="h-10 rounded-2xl mt-1" />
    </div>
  )
}

/** صف طالب في الجدول */
export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr className="border-b border-clay-accent/5">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-4 px-2">
          <Bone className={`h-4 ${i === 0 ? 'w-32' : 'w-20'}`} />
        </td>
      ))}
    </tr>
  )
}

/** بطاقة إحصائية */
export function StatCardSkeleton() {
  return (
    <div className="rounded-3xl bg-white/60 border border-white/40 shadow-clay p-5">
      <div className="flex items-center gap-3 mb-3">
        <Bone className="w-10 h-10 rounded-2xl" />
        <Bone className="h-3 w-20" />
      </div>
      <Bone className="h-8 w-16" />
    </div>
  )
}

/** درس أو وحدة في قائمة المحتوى */
export function LessonSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3">
      <Bone className="w-8 h-8 rounded-xl flex-shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <Bone className="h-4 w-3/4" />
        <Bone className="h-3 w-1/3" />
      </div>
    </div>
  )
}

/** صفحة كاملة من بطاقات كورسات */
export function CoursesGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  )
}

/** جدول طلاب */
export function StudentsTableSkeleton({ rows = 8 }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr>
          {['الطالب', 'الإيميل', 'التليفون', 'الصف', 'إجراءات'].map(h => (
            <th key={h} className="pb-3 text-right text-clay-muted font-bold">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRowSkeleton key={i} cols={5} />
        ))}
      </tbody>
    </table>
  )
}

/** صفحة الإحصائيات */
export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-white/60 border border-white/40 shadow-clay p-6 space-y-4">
          <Bone className="h-5 w-32" />
          {[...Array(5)].map((_, i) => <Bone key={i} className="h-8 rounded-xl" />)}
        </div>
        <div className="rounded-3xl bg-white/60 border border-white/40 shadow-clay p-6 space-y-3">
          <Bone className="h-5 w-32" />
          {[...Array(4)].map((_, i) => <Bone key={i} className="h-12 rounded-xl" />)}
        </div>
      </div>
    </div>
  )
}

export default Bone
