/* ═══════════════════════════════════════════════════════════════
   api/index.js — Barrel File (re-exports everything)
   
   الاستخدام في أي صفحة:
     import { fetchCourses, enrollCourse } from '../../lib/api'
   
   هذا الملف يحافظ على التوافقية مع كل الصفحات الموجودة،
   بدون الحاجة لتغيير أي import في أي مكان.
   ═══════════════════════════════════════════════════════════════ */

export * from './courses'
export * from './quizzes'
export * from './students'
export * from './admin'
export * from './auth'
export * from './storage'
