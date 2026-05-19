## 2026-05-14 - Add ARIA Labels to Icon-Only Buttons
**Learning:** Missing text alternative for icon-only buttons is a common accessibility issue. Adding `aria-label` provides necessary context for screen reader users without disrupting the visual layout.
**Action:** Always add descriptive `aria-label` attributes to buttons and links that contain only icons to ensure proper accessibility.
## 2024-05-19 - Added ARIA labels to close modals in admin pages
**Learning:** Found multiple instances where the generic `✕` character was used as a close button without an accessible label. Since this platform is primarily in Arabic, it was necessary to ensure the screen reader text was localized appropriately (`إغلاق`).
**Action:** When adding ARIA labels to icon-only buttons on this project, ensure the `aria-label` text matches the platform language (Arabic) to provide a consistent accessible experience.
