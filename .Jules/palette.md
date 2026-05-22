## 2026-05-14 - Add ARIA Labels to Icon-Only Buttons
**Learning:** Missing text alternative for icon-only buttons is a common accessibility issue. Adding `aria-label` provides necessary context for screen reader users without disrupting the visual layout.
**Action:** Always add descriptive `aria-label` attributes to buttons and links that contain only icons to ensure proper accessibility.

## 2024-05-22 - Missing ARIA Labels on Toggle Buttons
**Learning:** Icon-only stateful toggle buttons (like password visibility) often lack dynamic ARIA labels.
**Action:** Ensure dynamic toggle buttons have ARIA labels reflecting their current action state in Arabic (e.g., "إخفاء كلمة المرور" vs "إظهار كلمة المرور").
