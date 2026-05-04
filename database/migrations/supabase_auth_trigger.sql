-- ═══════════════════════════════════════════════════════════
--  إنشاء Trigger لربط مستخدمي Auth بجدول Profiles
-- ═══════════════════════════════════════════════════════════

-- 1. إنشاء الدالة (Function) التي تنفذ عند تسجيل مستخدم جديد
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role, phone, grade, governorate)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'grade',
    new.raw_user_meta_data->>'governorate'
  );
  return new;
end;
$$ language plpgsql security definer;

-- 2. ربط الدالة بـ Trigger يعمل فور إدخال صف جديد في auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. (اختياري) إضافة كود أدمن سري كإعداد في قاعدة البيانات 
insert into site_settings (key, value)
values ('admin_secret', '"IGTHAD_ADMIN_2026"')
on conflict (key) do nothing;

-- ═══════════════════════════════════════════════════════════
--  تم! قم بتشغيل هذا الملف في Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════
