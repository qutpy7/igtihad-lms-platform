## 2026-05-14 - Add ARIA Labels to Icon-Only Buttons
**Learning:** Missing text alternative for icon-only buttons is a common accessibility issue. Adding `aria-label` provides necessary context for screen reader users without disrupting the visual layout.
**Action:** Always add descriptive `aria-label` attributes to buttons and links that contain only icons to ensure proper accessibility.

## 2026-05-15 - Dynamic ARIA Labels for Stateful Icon-Only Buttons
**Learning:** Icon-only stateful toggle buttons (like password visibility toggles) must use dynamic ARIA labels that reflect their *current* action state in Arabic (e.g., 'إخفاء كلمة المرور' vs 'إظهار كلمة المرور'), rather than a static label. This is crucial for screen readers to accurately convey the action that will occur upon activation.
**Action:** When implementing icon-only buttons that toggle state, ensure the `aria-label` dynamically updates based on the current state.

## 2026-07-07 - Centralize Stateful UX Patterns in Component Library
**Learning:** Duplicate UX state logic (such as show/hide password toggles) across multiple pages leads to inconsistent accessibility implementation and maintenance overhead. By refactoring such logic into the core reusable UI components (`ClayInput`), we guarantee consistent, accessible interactions wherever the component is used.
**Action:** When a common stateful UX pattern is required in multiple contexts, integrate it natively into the core reusable design system component rather than duplicating the implementation in page or form-level logic.
