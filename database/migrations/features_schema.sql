-- ═══════════════════════════════════════════════════════════
-- إضافة ميزات: التقييمات، أسئلة الطلاب، الإشعارات الجماعية
-- انسخ هذا الكود بالكامل وشغله في Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- ─── 1. جدول التقييمات (course_reviews) ───
create table if not exists course_reviews (
  id bigint generated always as identity primary key,
  course_id bigint references courses(id) on delete cascade not null,
  student_id uuid references profiles(id) on delete cascade not null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  comment text,
  created_at timestamptz default now(),
  unique(course_id, student_id) -- الطالب يقيم الكورس مرة واحدة فقط
);

alter table course_reviews enable row level security;

-- الجميع يرى التقييمات
drop policy if exists "Anyone can view course reviews" on course_reviews;
create policy "Anyone can view course reviews" on course_reviews
  for select using (true);

-- الطالب يضيف/يحدث تقييمه
drop policy if exists "Students can insert own review" on course_reviews;
create policy "Students can insert own review" on course_reviews
  for insert with check (student_id = auth.uid());

drop policy if exists "Students can update own review" on course_reviews;
create policy "Students can update own review" on course_reviews
  for update using (student_id = auth.uid());

-- المدير يدير كل شيء
drop policy if exists "Admins can manage course reviews" on course_reviews;
create policy "Admins can manage course reviews" on course_reviews
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );


-- ─── 2. جدول أسئلة الطلاب على الدروس (student_questions) ───
create table if not exists student_questions (
  id bigint generated always as identity primary key,
  lesson_id bigint references lessons(id) on delete cascade not null,
  student_id uuid references profiles(id) on delete cascade not null,
  question text not null,
  answer text,
  is_answered boolean default false,
  created_at timestamptz default now(),
  answered_at timestamptz
);

alter table student_questions enable row level security;

-- الطالب يرى أسئلته فقط، والمدرس يرى الجميع
drop policy if exists "Students can view own questions" on student_questions;
create policy "Students can view own questions" on student_questions
  for select using (student_id = auth.uid());

drop policy if exists "Students can ask questions" on student_questions;
create policy "Students can ask questions" on student_questions
  for insert with check (student_id = auth.uid());

-- إضافة سياسة للسماح للأدمن برؤية وتعديل وحذف كل الأسئلة
drop policy if exists "Admins can manage student questions" on student_questions;
create policy "Admins can manage student questions" on student_questions
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );


-- ─── 3. دالة إرسال إشعار لكل طلاب كورس معين (RPC) ───
create or replace function public.send_course_notification(
  p_course_id bigint,
  p_type text,
  p_text text
)
returns void as $$
begin
  -- إدخال الإشعار لكل طالب مسجل في هذا الكورس
  insert into public.notifications (user_id, type, text)
  select e.student_id, p_type, p_text
  from public.enrollments e
  where e.course_id = p_course_id;
end;
$$ language plpgsql security definer;


-- ═══════════════════════════════════════════════════════════
-- ─── 4. تفعيل Realtime للتزامن المباشر ───
-- هذا يسمح لـ Supabase بإرسال التحديثات فورياً للمتصفح
-- ═══════════════════════════════════════════════════════════

-- إزالة أي publication قديمة وإعادة إنشائها بكل الجداول
drop publication if exists supabase_realtime;
create publication supabase_realtime for table
  courses,
  units,
  lessons,
  lesson_questions,
  student_questions,
  course_reviews,
  notifications,
  enrollments,
  lesson_progress;
