## 2026-05-14 - Add ARIA Labels to Icon-Only Buttons
**Learning:** Missing text alternative for icon-only buttons is a common accessibility issue. Adding `aria-label` provides necessary context for screen reader users without disrupting the visual layout.
**Action:** Always add descriptive `aria-label` attributes to buttons and links that contain only icons to ensure proper accessibility.

## 2026-05-27 - Dynamic ARIA Labels for Stateful Toggles
**Learning:** For icon-only buttons that toggle states (like showing/hiding a password), a static `aria-label` is insufficient and can confuse screen reader users. The label must reflect the action that will occur when clicked based on the *current* state.
**Action:** When implementing stateful toggle buttons with only icons, always provide a dynamic `aria-label` (e.g., `'إخفاء كلمة المرور'` vs `'إظهار كلمة المرور'`) that accurately describes the resulting action.
