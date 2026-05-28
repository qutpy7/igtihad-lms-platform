## 2026-05-14 - Add ARIA Labels to Icon-Only Buttons
**Learning:** Missing text alternative for icon-only buttons is a common accessibility issue. Adding `aria-label` provides necessary context for screen reader users without disrupting the visual layout.
**Action:** Always add descriptive `aria-label` attributes to buttons and links that contain only icons to ensure proper accessibility.

## 2024-03-20 - Adding ARIA Labels to Dashboard Actions
**Learning:** Icon-only buttons used extensively in admin dashboard tables and cards (like Edit, Delete, Copy) lacked screen reader context. Dynamic stateful buttons (like show/hide password) need their `aria-label` to change based on current state, using Arabic as the primary language.
**Action:** When adding or auditing icon-only action buttons, always ensure an `aria-label` is present in Arabic. For stateful toggles, use a ternary operator to update the label dynamically (e.g., `aria-label={state ? 'إخفاء' : 'إظهار'}`).
