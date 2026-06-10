## 2026-05-14 - Add ARIA Labels to Icon-Only Buttons
**Learning:** Missing text alternative for icon-only buttons is a common accessibility issue. Adding `aria-label` provides necessary context for screen reader users without disrupting the visual layout.
**Action:** Always add descriptive `aria-label` attributes to buttons and links that contain only icons to ensure proper accessibility.

## 2026-05-15 - Dynamic ARIA Labels for Stateful Icon-Only Buttons
**Learning:** Icon-only stateful toggle buttons (like password visibility toggles) must use dynamic ARIA labels that reflect their *current* action state in Arabic (e.g., 'إخفاء كلمة المرور' vs 'إظهار كلمة المرور'), rather than a static label. This is crucial for screen readers to accurately convey the action that will occur upon activation.
**Action:** When implementing icon-only buttons that toggle state, ensure the `aria-label` dynamically updates based on the current state.

## 2024-06-10 - Centralized Password Visibility Toggle
**Learning:** Adding custom password visibility toggles with eye icons across multiple distinct pages (login, signup, profile) leads to duplicated state management, inconsistent aria-label strings (sometimes missing Arabic translations), and irregular styling/padding that can break alignment or overlap text.
**Action:** Always centralize reusable interactions (like an inline 'show/hide' password toggle) directly within the lowest-level UI component (e.g. `ClayInput`) so that any consumer passing `type="password"` automatically inherits the stateful toggle, proper accessibility traits (`aria-label`, `focus-visible`), and correct RTL padding.
