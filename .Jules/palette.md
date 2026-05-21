## 2026-05-14 - Add ARIA Labels to Icon-Only Buttons
**Learning:** Missing text alternative for icon-only buttons is a common accessibility issue. Adding `aria-label` provides necessary context for screen reader users without disrupting the visual layout.
**Action:** Always add descriptive `aria-label` attributes to buttons and links that contain only icons to ensure proper accessibility.
## 2026-05-21 - Adding Accessible Context to Icon Buttons
**Learning:** Missing `aria-label` attributes on icon-only buttons (like pagination chevrons, close '✕' buttons, or eye '👁️' icons) are a persistent accessibility hurdle. Dynamic attributes (e.g., `aria-label={"عرض تفاصيل الطالب " + s.full_name}`) significantly improve the screen reader experience.
**Action:** Audit complex pages for icon-only components and ensure both static and dynamically contextual `aria-label` attributes are added, translated appropriately (e.g., Arabic).
