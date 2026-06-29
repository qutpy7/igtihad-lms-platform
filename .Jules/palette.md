## 2026-05-14 - Add ARIA Labels to Icon-Only Buttons
**Learning:** Missing text alternative for icon-only buttons is a common accessibility issue. Adding `aria-label` provides necessary context for screen reader users without disrupting the visual layout.
**Action:** Always add descriptive `aria-label` attributes to buttons and links that contain only icons to ensure proper accessibility.

## 2026-05-15 - Dynamic ARIA Labels for Stateful Icon-Only Buttons
**Learning:** Icon-only stateful toggle buttons (like password visibility toggles) must use dynamic ARIA labels that reflect their *current* action state in Arabic (e.g., 'إخفاء كلمة المرور' vs 'إظهار كلمة المرور'), rather than a static label. This is crucial for screen readers to accurately convey the action that will occur upon activation.
**Action:** When implementing icon-only buttons that toggle state, ensure the `aria-label` dynamically updates based on the current state.

## 2024-05-24 - Centralize Stateful UX Patterns in Core Library
**Learning:** Implementing stateful UX patterns like a show/hide password toggle individually across pages creates duplicated logic and increases the risk of inconsistent accessibility (e.g. missing ARIA labels).
**Action:** Integrate such patterns natively into core UI components (e.g., `ClayInput`) when possible to ensure consistent usage, DRY code, and proper accessibility across the entire app.
