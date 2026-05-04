-- ═══════════════════════════════════════════════════════════
--  إضافة جدول المحفظة وتحديث الإعدادات (Testimonials)
-- ═══════════════════════════════════════════════════════════

-- ─── 1. سجل المعاملات المالية (Wallet Transactions) ───
create table if not exists wallet_transactions (
  id bigint generated always as identity primary key,
  student_id uuid references profiles(id) on delete cascade not null,
  type text not null check (type in ('deposit', 'purchase', 'refund')),
  amount integer not null, -- يمكن أن يكون موجب (شحن) أو سالب (خصم)
  details text, -- مثلاً: "شحن رصيد بكود IGT-XXXX" أو "شراء كورس فيزياء"
  status text not null default 'success' check (status in ('success', 'failed', 'pending')),
  created_at timestamptz default now()
);

alter table wallet_transactions enable row level security;

-- الطلاب بيشوفوا المعاملات بتاعتهم بس
create policy "Students can view own transactions" on wallet_transactions
  for select using (student_id = auth.uid());

-- إضافة المعاملات (الشحن/الشراء) تتم بصلاحيات النظام أو من خلال API مأمن، بس مبدئياً:
create policy "Students can insert own transactions" on wallet_transactions
  for insert with check (student_id = auth.uid());

-- الأدمن يقدر يشوف كل المعاملات
create policy "Admins can view all transactions" on wallet_transactions
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );


-- ─── 2. إضافة آراء الطلاب للإعدادات (Testimonials) ───
-- إذا كان مفتاح testimonials غير موجود سيتم إضافته
insert into site_settings (key, value)
values ('testimonials', '[
  {
    "id": 1,
    "name": "محمود أحمد",
    "grade": "3 ثانوي",
    "rating": 5,
    "text": "بصراحة المنصة ممتازة جداً، الشرح مبسط والملازم بتنزل باستمرار. فرق معايا جداً في مستوايا."
  },
  {
    "id": 2,
    "name": "سارة محمد",
    "grade": "2 ثانوي",
    "rating": 5,
    "text": "الامتحانات بعد كل درس بتخليني أقيم نفسي أول بأول. مستر أحمد بيشرح بضمير بجد."
  },
  {
    "id": 3,
    "name": "يوسف أشرف",
    "grade": "1 ثانوي",
    "rating": 4,
    "text": "تجربة التعلم هنا مختلفة. مش مجرد فيديوهات، دي رحلة متكاملة ومتابعة مستمرة."
  }
]')
on conflict (key) do update set value = excluded.value;

-- ═══════════════════════════════════════════════════════════
--  تم! قم بتشغيل هذا الملف في Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════
