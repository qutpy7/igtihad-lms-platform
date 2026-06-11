## 2026-05-14 - Add ARIA Labels to Icon-Only Buttons
**Learning:** Missing text alternative for icon-only buttons is a common accessibility issue. Adding `aria-label` provides necessary context for screen reader users without disrupting the visual layout.
**Action:** Always add descriptive `aria-label` attributes to buttons and links that contain only icons to ensure proper accessibility.

## 2026-05-15 - Dynamic ARIA Labels for Stateful Icon-Only Buttons
**Learning:** Icon-only stateful toggle buttons (like password visibility toggles) must use dynamic ARIA labels that reflect their *current* action state in Arabic (e.g., 'إخفاء كلمة المرور' vs 'إظهار كلمة المرور'), rather than a static label. This is crucial for screen readers to accurately convey the action that will occur upon activation.
**Action:** When implementing icon-only buttons that toggle state, ensure the `aria-label` dynamically updates based on the current state.
## 2026-06-11 - Native Password Toggle in ClayInput
**Learning:** Implementing the password toggle at the base input component level (ClayInput) ensures consistent accessibility (dynamic ARIA labels in Arabic, proper focus rings) across the entire application, eliminating redundant, often inaccessible custom toggle implementations in individual forms (like LoginPage and SignUpPage).
**Action:** When a basic input type like 'password' requires a standard interactive element (like a visibility toggle), embed it directly within the reusable component layer rather than scattering custom implementations across views. Always use dynamic ARIA labels representing the *action* (e.g., 'إخفاء/إظهار') rather than the state.
