## 2026-05-14 - Add ARIA Labels to Icon-Only Buttons
**Learning:** Missing text alternative for icon-only buttons is a common accessibility issue. Adding `aria-label` provides necessary context for screen reader users without disrupting the visual layout.
**Action:** Always add descriptive `aria-label` attributes to buttons and links that contain only icons to ensure proper accessibility.

## 2026-05-15 - Dynamic ARIA Labels for Stateful Icon-Only Buttons
**Learning:** Icon-only stateful toggle buttons (like password visibility toggles) must use dynamic ARIA labels that reflect their *current* action state in Arabic (e.g., 'إخفاء كلمة المرور' vs 'إظهار كلمة المرور'), rather than a static label. This is crucial for screen readers to accurately convey the action that will occur upon activation.
**Action:** When implementing icon-only buttons that toggle state, ensure the `aria-label` dynamically updates based on the current state.

## 2026-05-16 - Toast Notification Close Button Accessibility
**Learning:** Custom global utility components, such as Toast notifications, often have icon-only close buttons that lack `aria-label`s and distinct focus states. Because these components can appear unpredictably, keyboard navigation and screen reader support for them is critical to avoid trapping users or confusing them.
**Action:** When auditing or building custom UI utilities (like modals or toasts), ensure all interactive elements, especially icon-only dismiss buttons, have a descriptive `aria-label` (e.g., in Arabic: "إغلاق الإشعار") and clear focus rings (e.g., `focus-visible:ring-2 focus-visible:ring-slate-400`).
