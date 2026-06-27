## 2026-05-14 - Add ARIA Labels to Icon-Only Buttons
**Learning:** Missing text alternative for icon-only buttons is a common accessibility issue. Adding `aria-label` provides necessary context for screen reader users without disrupting the visual layout.
**Action:** Always add descriptive `aria-label` attributes to buttons and links that contain only icons to ensure proper accessibility.

## 2026-05-15 - Dynamic ARIA Labels for Stateful Icon-Only Buttons
**Learning:** Icon-only stateful toggle buttons (like password visibility toggles) must use dynamic ARIA labels that reflect their *current* action state in Arabic (e.g., 'إخفاء كلمة المرور' vs 'إظهار كلمة المرور'), rather than a static label. This is crucial for screen readers to accurately convey the action that will occur upon activation.
**Action:** When implementing icon-only buttons that toggle state, ensure the `aria-label` dynamically updates based on the current state.

## 2024-05-19 - Native Show/Hide Password Pattern
**Learning:** Reusable stateful UX patterns like a show/hide password toggle can often lead to scattered, duplicated logic across different forms (e.g. login, sign up, profile edit). Centralizing it in a core design system component ensures consistency and immediately enhances all forms using it. Moreover, icon-only toggles must have dynamic ARIA labels (e.g., 'إخفاء كلمة المرور' vs 'إظهار كلمة المرور') reflecting the current state, along with clear focus indicators.
**Action:** When asked to implement or fix stateful UX interactions that appear in multiple places (like show/hide password), look to integrate them directly into the core reusable UI component (like ClayInput) rather than repeating logic in individual pages. Ensure correct ARIA labels for accessibility.
