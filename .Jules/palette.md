## 2026-05-23 - Add ARIA Labels to Icon-Only Buttons
**Learning:** Found that several icon-only buttons in the admin area lacked `aria-label` attributes, making them completely inaccessible to screen readers.
**Action:** Always add Arabic `aria-label` attributes (like 'إغلاق', 'تعديل', 'حذف') to icon-only buttons (`<button>✕</button>`, `<button><Trash2 /></button>`, etc.) to ensure baseline accessibility compliance.
