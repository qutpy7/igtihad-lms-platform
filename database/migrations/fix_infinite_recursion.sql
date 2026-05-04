-- ═══════════════════════════════════════════════════════════
--  إصلاح مشكلة التكرار اللانهائي (Infinite Recursion Fix)
--  هذا الملف يحل مشكلة "infinite recursion detected in policy for relation profiles"
--  بواسطة استخدام دالة Security Definer للتحقق من الصلاحيات.
-- ═══════════════════════════════════════════════════════════

-- 1. إنشاء دالة للتحقق من كون المستخدم مديراً (Admin)
-- نستخدم SECURITY DEFINER لتجاوز RLS عند الاستعلام عن جدول profiles
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = 'admin'
  );
end;
$$ language plpgsql security definer set search_path = public;

-- 2. تحديث سياسات جدول profiles (المسبب الرئيسي للمشكلة)
alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Admins can manage all profiles" on public.profiles;

-- سياسة للمستخدم العادي: يرى نفسه فقط
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

-- سياسة للمدير: يرى الجميع (باستخدام الدالة الجديدة لمنع التكرار)
create policy "profiles_select_admin" on public.profiles
  for select using (is_admin());

-- سياسة التحديث للمستخدم لنفسه
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- سياسة الإدارة الكاملة للمدير
create policy "profiles_admin_all" on public.profiles
  for all using (is_admin());


-- 3. تحديث باقي الجداول لاستخدام الدالة الجديدة (أسرع وأكثر أماناً)

-- الكورسات (Courses)
drop policy if exists "Admins can manage courses" on courses;
create policy "Admins can manage courses" on courses
  for all using (is_admin());

-- الوحدات (Units)
drop policy if exists "Admins can manage units" on units;
create policy "Admins can manage units" on units
  for all using (is_admin());

-- الدروس (Lessons)
drop policy if exists "Admins can manage lessons" on lessons;
create policy "Admins can manage lessons" on lessons
  for all using (is_admin());

-- الأسئلة (Lesson Questions)
drop policy if exists "Admins can manage lesson questions" on lesson_questions;
create policy "Admins can manage lesson questions" on lesson_questions
  for all using (is_admin());

-- الامتحانات (Quizzes)
drop policy if exists "Admins can manage quizzes" on quizzes;
create policy "Admins can manage quizzes" on quizzes
  for all using (is_admin());

-- أسئلة الامتحانات (Quiz Questions)
drop policy if exists "Admins can manage quiz questions" on quiz_questions;
create policy "Admins can manage quiz questions" on quiz_questions
  for all using (is_admin());

-- الأكواد (Access Codes)
drop policy if exists "Admins can manage codes" on access_codes;
create policy "Admins can manage codes" on access_codes
  for all using (is_admin());

-- الاشتراكات (Enrollments)
drop policy if exists "Admins can manage enrollments" on enrollments;
create policy "Admins can manage enrollments" on enrollments
  for all using (is_admin());

-- تقدم الطالب (Lesson Progress)
drop policy if exists "Admins can view all progress" on lesson_progress;
create policy "Admins can view all progress" on lesson_progress
  for all using (is_admin());

-- النتائج (Quiz Results)
drop policy if exists "Admins can view all results" on quiz_results;
create policy "Admins can view all results" on quiz_results
  for all using (is_admin());

-- الإشعارات (Notifications)
drop policy if exists "Admins can insert notifications" on notifications;
create policy "Admins can insert notifications" on notifications
  for insert with check (is_admin());

-- المحفظة (Wallet Transactions)
drop policy if exists "Admins can manage transactions" on wallet_transactions;
create policy "Admins can manage transactions" on wallet_transactions
  for all using (is_admin());


-- ═══════════════════════════════════════════════════════════
--  تم الإصلاح! ✅ الآن يمكنك استخدام التطبيق بدون خطأ التكرار.
-- ═══════════════════════════════════════════════════════════
