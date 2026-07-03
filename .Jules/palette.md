## 2026-05-14 - Add ARIA Labels to Icon-Only Buttons
**Learning:** Missing text alternative for icon-only buttons is a common accessibility issue. Adding `aria-label` provides necessary context for screen reader users without disrupting the visual layout.
**Action:** Always add descriptive `aria-label` attributes to buttons and links that contain only icons to ensure proper accessibility.

## 2026-05-15 - Dynamic ARIA Labels for Stateful Icon-Only Buttons
**Learning:** Icon-only stateful toggle buttons (like password visibility toggles) must use dynamic ARIA labels that reflect their *current* action state in Arabic (e.g., 'إخفاء كلمة المرور' vs 'إظهار كلمة المرور'), rather than a static label. This is crucial for screen readers to accurately convey the action that will occur upon activation.
**Action:** When implementing icon-only buttons that toggle state, ensure the `aria-label` dynamically updates based on the current state.
## 2023-10-27 - Centralizing Password Toggles in ClayInput
**Learning:** Duplicate password visibility toggles across multiple auth pages (login, signup, admin, profile) often lead to inconsistent accessibility features (missing focus rings, static vs dynamic ARIA labels). Integrating the show/hide password toggle directly into the core `ClayInput` component ensures all password fields automatically inherit these crucial accessibility patterns out-of-the-box.
**Action:** Always integrate common stateful UX patterns (like show/hide password or copy-to-clipboard) directly into the reusable component library rather than implementing them individually on page forms, ensuring consistent a11y across the application.
