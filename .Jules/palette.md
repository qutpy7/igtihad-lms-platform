## 2026-05-14 - Add ARIA Labels to Icon-Only Buttons
**Learning:** Missing text alternative for icon-only buttons is a common accessibility issue. Adding `aria-label` provides necessary context for screen reader users without disrupting the visual layout.
**Action:** Always add descriptive `aria-label` attributes to buttons and links that contain only icons to ensure proper accessibility.

## 2026-05-15 - Dynamic ARIA Labels for Stateful Icon-Only Buttons
**Learning:** Icon-only stateful toggle buttons (like password visibility toggles) must use dynamic ARIA labels that reflect their *current* action state in Arabic (e.g., 'إخفاء كلمة المرور' vs 'إظهار كلمة المرور'), rather than a static label. This is crucial for screen readers to accurately convey the action that will occur upon activation.
**Action:** When implementing icon-only buttons that toggle state, ensure the `aria-label` dynamically updates based on the current state.

## 2026-05-16 - Integrate Stateful UX Patterns Natively into Core Components
**Learning:** When a common stateful UX pattern (e.g., show/hide password toggle) is required on multiple pages, it's best integrated natively into the core reusable component library (e.g., `ClayInput`) to prevent duplicate logic and ensure consistent accessibility across the application.
**Action:** Always encapsulate stateful UX patterns within core components rather than repeating the implementation in individual forms.
