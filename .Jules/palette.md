## 2026-05-14 - Add ARIA Labels to Icon-Only Buttons
**Learning:** Missing text alternative for icon-only buttons is a common accessibility issue. Adding `aria-label` provides necessary context for screen reader users without disrupting the visual layout.
**Action:** Always add descriptive `aria-label` attributes to buttons and links that contain only icons to ensure proper accessibility.

## 2026-05-15 - Dynamic ARIA Labels for Stateful Icon-Only Buttons
**Learning:** Icon-only stateful toggle buttons (like password visibility toggles) must use dynamic ARIA labels that reflect their *current* action state in Arabic (e.g., 'إخفاء كلمة المرور' vs 'إظهار كلمة المرور'), rather than a static label. This is crucial for screen readers to accurately convey the action that will occur upon activation.
**Action:** When implementing icon-only buttons that toggle state, ensure the `aria-label` dynamically updates based on the current state.

## 2026-05-15 - Centralized Stateful UX for Password Visibility
**Learning:** When a common stateful UX pattern (like a show/hide password toggle) is required on multiple forms (login, signup, profile editing), implementing it ad-hoc on each page leads to duplicate logic and inconsistent accessibility.
**Action:** Integrate such patterns natively into the core reusable component library (e.g., `ClayInput`) so that any input with `type="password"` automatically inherits the accessible toggle functionality, reducing boilerplate and ensuring consistent UX across the application.
