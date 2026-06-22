## 2026-05-14 - Add ARIA Labels to Icon-Only Buttons
**Learning:** Missing text alternative for icon-only buttons is a common accessibility issue. Adding `aria-label` provides necessary context for screen reader users without disrupting the visual layout.
**Action:** Always add descriptive `aria-label` attributes to buttons and links that contain only icons to ensure proper accessibility.

## 2026-05-15 - Dynamic ARIA Labels for Stateful Icon-Only Buttons
**Learning:** Icon-only stateful toggle buttons (like password visibility toggles) must use dynamic ARIA labels that reflect their *current* action state in Arabic (e.g., 'إخفاء كلمة المرور' vs 'إظهار كلمة المرور'), rather than a static label. This is crucial for screen readers to accurately convey the action that will occur upon activation.
**Action:** When implementing icon-only buttons that toggle state, ensure the `aria-label` dynamically updates based on the current state.
## 2024-06-22 - ClayInput Shared Password Toggle UX
**Learning:** Replicating the 'show/hide password' toggle button manually on each form component (like LoginPage, SignUpPage, ProfilePage) leads to inconsistent styling and possible accessibility failures (like lacking dynamic aria-labels or `pl-12` padding, causing text overlap).
**Action:** Always integrate reusable, stateful UX elements directly into the core `ClayInput` component when standard form properties (like `type="password"`) dictate the behavior. The single source of truth guarantees accessible RTL layouts (e.g. `left-4` toggle and `pl-12` text padding) and dynamic screen reader support across the app without duplicating state.
