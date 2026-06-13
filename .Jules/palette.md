## 2026-05-14 - Add ARIA Labels to Icon-Only Buttons
**Learning:** Missing text alternative for icon-only buttons is a common accessibility issue. Adding `aria-label` provides necessary context for screen reader users without disrupting the visual layout.
**Action:** Always add descriptive `aria-label` attributes to buttons and links that contain only icons to ensure proper accessibility.

## 2026-05-15 - Dynamic ARIA Labels for Stateful Icon-Only Buttons
**Learning:** Icon-only stateful toggle buttons (like password visibility toggles) must use dynamic ARIA labels that reflect their *current* action state in Arabic (e.g., 'إخفاء كلمة المرور' vs 'إظهار كلمة المرور'), rather than a static label. This is crucial for screen readers to accurately convey the action that will occur upon activation.
**Action:** When implementing icon-only buttons that toggle state, ensure the `aria-label` dynamically updates based on the current state.

## 2026-06-13 - Native Integration of Password Toggles
**Learning:** When a common stateful UX pattern (like a show/hide password toggle) is required on multiple pages (e.g., login, sign-up, profile), developers often duplicate state logic and UI rendering across those pages. Integrating the toggle natively into the core reusable input component (e.g., `ClayInput`) ensures consistent accessibility (ARIA labels) and prevents duplicate logic.
**Action:** Always verify if a required micro-UX improvement on a specific page is better suited as a generic feature built directly into the foundational UI component library.
