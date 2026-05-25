## 2026-05-14 - Add ARIA Labels to Icon-Only Buttons
**Learning:** Missing text alternative for icon-only buttons is a common accessibility issue. Adding `aria-label` provides necessary context for screen reader users without disrupting the visual layout.
**Action:** Always add descriptive `aria-label` attributes to buttons and links that contain only icons to ensure proper accessibility.

## 2026-05-14 - Add Dynamic ARIA Labels to Stateful Toggle Buttons
**Learning:** Icon-only stateful toggle buttons must use dynamic ARIA labels that reflect their *current* action state rather than a static label. This ensures screen reader users understand the specific action that will be performed.
**Action:** For toggles like password visibility (Eye/EyeOff), always use conditional logic for the `aria-label` matching the app's primary language (e.g., `aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}`).
