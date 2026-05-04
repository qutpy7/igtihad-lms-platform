import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ConfirmProvider } from './context/ConfirmContext'
import { QueryProvider } from './context/QueryProvider'
import ErrorBoundary from './components/ErrorBoundary'

/* ─── Layouts (loaded eagerly — small files, always needed) ─── */
import PublicLayout from './components/layout/PublicLayout'
import StudentLayout from './components/layout/StudentLayout'
import AdminLayout from './components/layout/AdminLayout'

/* ─── Route Guards (always needed) ─── */
import StudentRoute from './components/auth/StudentRoute'
import AdminRoute from './components/auth/AdminRoute'

/* ─── Skip to content (Accessibility) ─── */
import SkipToContent from './components/ui/SkipToContent'

// ⚡ Code Splitting — every page is a separate JS chunk
// Each lazy() below becomes a separate file, loaded only when the user navigates to that page

/* ─── Public Pages ─── */
const HomePage          = lazy(() => import('./pages/public/HomePage'))
const CoursesPage       = lazy(() => import('./pages/public/CoursesPage'))
const CourseDetailsPage = lazy(() => import('./pages/public/CourseDetailsPage'))
const AboutPage         = lazy(() => import('./pages/public/AboutPage'))
const ContactPage       = lazy(() => import('./pages/public/ContactPage'))
const NotFoundPage      = lazy(() => import('./pages/public/NotFoundPage'))

/* ─── Auth Pages ─── */
const LoginPage          = lazy(() => import('./pages/auth/LoginPage'))
const SignUpPage         = lazy(() => import('./pages/auth/SignUpPage'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'))
const AdminSignUpPage    = lazy(() => import('./pages/auth/AdminSignUpPage'))

/* ─── Student Pages ─── */
const DashboardPage     = lazy(() => import('./pages/student/DashboardPage'))
const MyCoursesPage     = lazy(() => import('./pages/student/MyCoursesPage'))
const LessonViewerPage  = lazy(() => import('./pages/student/LessonViewerPage'))
const QuizPage          = lazy(() => import('./pages/student/QuizPage'))
const QuizResultsPage   = lazy(() => import('./pages/student/QuizResultsPage'))
const ProfilePage       = lazy(() => import('./pages/student/ProfilePage'))
const PaymentsPage      = lazy(() => import('./pages/student/PaymentsPage'))

/* ─── Admin Pages ─── */
const AdminDashboardPage    = lazy(() => import('./pages/admin/AdminDashboardPage'))
const ManageCoursesPage     = lazy(() => import('./pages/admin/ManageCoursesPage'))
const CourseContentPage     = lazy(() => import('./pages/admin/CourseContentPage'))
const ManageStudentsPage    = lazy(() => import('./pages/admin/ManageStudentsPage'))
const ManageCodesPage       = lazy(() => import('./pages/admin/ManageCodesPage'))
const ManageQuizzesPage     = lazy(() => import('./pages/admin/ManageQuizzesPage'))
const ManageAdminsPage      = lazy(() => import('./pages/admin/ManageAdminsPage'))
const ManageQAPage          = lazy(() => import('./pages/admin/ManageQAPage'))
const SendNotificationsPage = lazy(() => import('./pages/admin/SendNotificationsPage'))
const ManageReviewsPage     = lazy(() => import('./pages/admin/ManageReviewsPage'))
const ManageSettingsPage    = lazy(() => import('./pages/admin/ManageSettingsPage'))

// ─── Page transition fallback while chunk loads ───────────────
function PageLoader() {
  return (
    <div
      role="status"
      aria-label="جاري تحميل الصفحة"
      className="flex items-center justify-center min-h-[60vh] gap-3 text-clay-muted"
    >
      <div className="flex gap-1.5" aria-hidden="true">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-clay-accent animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <span className="sr-only">جاري التحميل…</span>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
    <QueryProvider>
    <AuthProvider>
    <ToastProvider>
    <ConfirmProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        {/* ✅ Accessibility: Skip to main content link */}
        <SkipToContent />

        {/* ✅ Suspense wraps ALL routes — shows PageLoader while any chunk loads */}
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ═══ Public Routes ═══ */}
            <Route element={<PublicLayout />}>
              <Route path="/"            element={<HomePage />} />
              <Route path="/courses"     element={<CoursesPage />} />
              <Route path="/courses/:id" element={<CourseDetailsPage />} />
              <Route path="/about"       element={<AboutPage />} />
              <Route path="/contact"     element={<ContactPage />} />
            </Route>

            {/* ═══ Auth Routes ═══ */}
            <Route path="/login"           element={<LoginPage />} />
            <Route path="/signup"          element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/admin-signup"    element={<AdminSignUpPage />} />

            {/* ═══ Student Dashboard Routes ═══ */}
            <Route element={<StudentRoute />}>
              <Route path="/student" element={<StudentLayout />}>
                <Route index                    element={<DashboardPage />} />
                <Route path="courses"           element={<MyCoursesPage />} />
                <Route path="lesson/:id"        element={<LessonViewerPage />} />
                <Route path="quiz/:id"          element={<QuizPage />} />
                <Route path="quiz/:id/results"  element={<QuizResultsPage />} />
                <Route path="profile"           element={<ProfilePage />} />
                <Route path="payments"          element={<PaymentsPage />} />
              </Route>
            </Route>

            {/* ═══ Admin Dashboard Routes ═══ */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index                      element={<AdminDashboardPage />} />
                <Route path="courses"             element={<ManageCoursesPage />} />
                <Route path="courses/:id/content" element={<CourseContentPage />} />
                <Route path="students"            element={<ManageStudentsPage />} />
                <Route path="codes"               element={<ManageCodesPage />} />
                <Route path="quizzes"             element={<ManageQuizzesPage />} />
                <Route path="qa"                  element={<ManageQAPage />} />
                <Route path="notifications"       element={<SendNotificationsPage />} />
                <Route path="reviews"             element={<ManageReviewsPage />} />
                <Route path="admins"              element={<ManageAdminsPage />} />
                <Route path="settings"            element={<ManageSettingsPage />} />
              </Route>
            </Route>

            {/* ═══ 404 Catch-All ═══ */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ConfirmProvider>
    </ToastProvider>
    </AuthProvider>
    </QueryProvider>
    </ErrorBoundary>
  )
}

export default App