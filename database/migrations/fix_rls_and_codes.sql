-- ═══════════════════════════════════════════════════════════
--  إصلاح شامل لصلاحيات قاعدة البيانات (RLS Fix)
--  قم بتشغيل هذا الملف كاملاً في Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- ─── 1. enrollments ───
alter table enrollments enable row level security;
drop policy if exists "Students can insert own enrollments" on enrollments;
drop policy if exists "Students can view own enrollments" on enrollments;
drop policy if exists "Admins can manage enrollments" on enrollments;

create policy "Students can view own enrollments" on enrollments
  for select using (student_id = auth.uid());

create policy "Students can insert own enrollments" on enrollments
  for insert with check (student_id = auth.uid());

create policy "Admins can manage enrollments" on enrollments
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─── 2. wallet_transactions ───
alter table wallet_transactions enable row level security;
drop policy if exists "Students can view own transactions" on wallet_transactions;
drop policy if exists "Students can insert own transactions" on wallet_transactions;
drop policy if exists "Admins can manage transactions" on wallet_transactions;

create policy "Students can view own transactions" on wallet_transactions
  for select using (student_id = auth.uid());

create policy "Students can insert own transactions" on wallet_transactions
  for insert with check (student_id = auth.uid());

create policy "Admins can manage transactions" on wallet_transactions
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─── 3. lesson_questions (الأسئلة) — السماح للطالب بالقراءة ───
alter table lesson_questions enable row level security;
drop policy if exists "Anyone can view lesson questions" on lesson_questions;
drop policy if exists "Admins can manage lesson questions" on lesson_questions;

create policy "Anyone can view lesson questions" on lesson_questions
  for select using (true);

create policy "Admins can manage lesson questions" on lesson_questions
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─── 4. quiz_results (نتائج الواجبات) ───
alter table quiz_results enable row level security;
drop policy if exists "Students can view own results" on quiz_results;
drop policy if exists "Students can submit results" on quiz_results;
drop policy if exists "Admins can view all results" on quiz_results;

create policy "Students can view own results" on quiz_results
  for select using (student_id = auth.uid());

create policy "Students can submit results" on quiz_results
  for insert with check (student_id = auth.uid());

create policy "Admins can view all results" on quiz_results
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─── 5. lessons — السماح للطالب المشترك بالقراءة ───
alter table lessons enable row level security;
drop policy if exists "Anyone can view lessons" on lessons;
drop policy if exists "Enrolled students can view lessons" on lessons;
drop policy if exists "Admins can manage lessons" on lessons;

create policy "Anyone can view lessons" on lessons
  for select using (true);

create policy "Admins can manage lessons" on lessons
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─── 6. units ───
alter table units enable row level security;
drop policy if exists "Anyone can view units" on units;
drop policy if exists "Admins can manage units" on units;

create policy "Anyone can view units" on units
  for select using (true);

create policy "Admins can manage units" on units
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─── 7. lesson_progress (تقدم الطالب) ───
alter table lesson_progress enable row level security;
drop policy if exists "Students can view own progress" on lesson_progress;
drop policy if exists "Students can insert own progress" on lesson_progress;
drop policy if exists "Students can update own progress" on lesson_progress;
drop policy if exists "Admins can view all progress" on lesson_progress;

create policy "Students can view own progress" on lesson_progress
  for select using (student_id = auth.uid());

create policy "Students can insert own progress" on lesson_progress
  for insert with check (student_id = auth.uid());

create policy "Students can update own progress" on lesson_progress
  for update using (student_id = auth.uid());

create policy "Admins can view all progress" on lesson_progress
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─── 8. إرجاع الأكواد الضائعة (مع حماية إضافية) ───
-- تحذير: هذا يعيد الأكواد إذا لم يوجد اشتراك مطابق، لكن قد يسمح بإعادة استخدام إذا تم حذف الاشتراك.
-- لتجنب فقدان الإيرادات، نفذ يدوياً مع مراجعة، أو أضف شرط تاريخ (مثل used_at > 30 يوماً).
-- مؤقتاً، معطل للمراجعة.
/*
update access_codes
set status = 'available',
    student_id = null,
    used_at = null
where status = 'used'
  and not exists (
    select 1 from enrollments e
    where e.student_id = access_codes.student_id
      and e.course_id = access_codes.course_id
  );
*/

-- ═══════════════════════════════════════════════════════════
--  تم! ✅ جميع الصلاحيات مضبوطة الآن
-- ═══════════════════════════════════════════════════════════

