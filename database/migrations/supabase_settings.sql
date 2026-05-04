-- ═══════════════════════════════════════════════════════════
--  جدول الإعدادات الديناميكية
-- ═══════════════════════════════════════════════════════════

create table if not exists site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

alter table site_settings enable row level security;

create policy "Anyone can read settings" on site_settings for select using (true);
create policy "Dev: allow all on settings" on site_settings for all using (true);

-- إدخال البيانات الافتراضية
insert into site_settings (key, value) values
  ('grades', '[
    {"value": "1st-prep", "label": "الصف الأول الإعدادي"},
    {"value": "2nd-prep", "label": "الصف الثاني الإعدادي"},
    {"value": "3rd-prep", "label": "الصف الثالث الإعدادي"},
    {"value": "1st-sec", "label": "الصف الأول الثانوي"},
    {"value": "2nd-sec", "label": "الصف الثاني الثانوي"},
    {"value": "3rd-sec", "label": "الصف الثالث الثانوي"}
  ]'),
  ('terms', '[
    {"value": "first", "label": "الترم الأول"},
    {"value": "second", "label": "الترم الثاني"}
  ]'),
  ('site_name', '"منصة اجتهاد"'),
  ('site_description', '"منصة تعليمية متكاملة"');

-- ═══════════════════════════════════════════════════════════
--  تم! ✅
-- ═══════════════════════════════════════════════════════════
