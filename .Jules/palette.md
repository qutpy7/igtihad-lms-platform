## 2026-05-14 - Add ARIA Labels to Icon-Only Buttons
**Learning:** Missing text alternative for icon-only buttons is a common accessibility issue. Adding `aria-label` provides necessary context for screen reader users without disrupting the visual layout.
**Action:** Always add descriptive `aria-label` attributes to buttons and links that contain only icons to ensure proper accessibility.
## 2025-02-23 - Accessibility of icon-only buttons
**Learning:** Found multiple icon-only buttons (`👁️`, `✕`, `ChevronRight/Left`) in `ManageStudentsPage.jsx` lacking `aria-label`s. Added labels in Arabic (`الصفحة السابقة`, `الصفحة التالية`, `عرض التفاصيل`, `إغلاق`) to match the platform's primary language.
**Action:** Always verify that icon-only buttons have descriptive `aria-label`s, particularly ensuring the language matches the application's locale (Arabic in this case). Avoid changing unrelated project dependencies when making small UX updates.
