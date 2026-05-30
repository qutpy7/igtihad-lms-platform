## 2026-05-14 - Add ARIA Labels to Icon-Only Buttons
**Learning:** Missing text alternative for icon-only buttons is a common accessibility issue. Adding `aria-label` provides necessary context for screen reader users without disrupting the visual layout.
**Action:** Always add descriptive `aria-label` attributes to buttons and links that contain only icons to ensure proper accessibility.

## 2024-05-30 - Dynamic ARIA labels for stateful toggle buttons
**Learning:** Icon-only stateful toggle buttons (like password visibility toggles) require dynamic ARIA labels that reflect their *current* action state (e.g., 'إخفاء كلمة المرور' vs 'إظهار كلمة المرور'), rather than a static label.
**Action:** Always verify that toggle buttons have dynamic `aria-label` attributes reflecting the current state/action.
