## 2026-05-14 - Add ARIA Labels to Icon-Only Buttons
**Learning:** Missing text alternative for icon-only buttons is a common accessibility issue. Adding `aria-label` provides necessary context for screen reader users without disrupting the visual layout.
**Action:** Always add descriptive `aria-label` attributes to buttons and links that contain only icons to ensure proper accessibility.
## 2024-05-24 - ARIA labels for icon-only buttons
**Learning:** Added Arabic ARIA labels to icon-only buttons (like delete and edit buttons) in admin pages to improve accessibility. The app uses Arabic as the primary language.
**Action:** Always verify that `aria-label` attributes are present and translated correctly on buttons that lack visible text, and ensure the language matches the application's locale.
