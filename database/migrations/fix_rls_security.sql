-- ═══════════════════════════════════════════════════════════
--  إصلاح أمان RLS - حماية المحتوى من الوصول غير المصرح به
--  قم بتشغيل هذا الملف كاملاً في Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- ─── 1. lessons ───
alter table lessons enable row level security;
drop policy if exists "Anyone can view lessons" on lessons;
drop policy if exists "Enrolled students can view lessons" on lessons;
drop policy if exists "Admins can manage lessons" on lessons;

create policy "Enrolled students and admins can view lessons" on lessons
  for select using (
    exists (
      select 1 from enrollments e
      join units u on e.course_id = u.course_id
      where e.student_id = auth.uid() and u.id = lessons.unit_id
    ) or exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can manage lessons" on lessons
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─── 2. units ───
alter table units enable row level security;
drop policy if exists "Anyone can view units" on units;
drop policy if exists "Admins can manage units" on units;

create policy "Enrolled students and admins can view units" on units
  for select using (
    exists (
      select 1 from enrollments e
      where e.student_id = auth.uid() and e.course_id = units.course_id
    ) or exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can manage units" on units
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─── 3. lesson_questions ───
alter table lesson_questions enable row level security;
drop policy if exists "Anyone can view lesson questions" on lesson_questions;
drop policy if exists "Admins can manage lesson questions" on lesson_questions;

create policy "Enrolled students and admins can view lesson questions" on lesson_questions
  for select using (
    exists (
      select 1 from enrollments e
      join lessons l on e.course_id = (select u.course_id from units u where u.id = l.unit_id)
      join lesson_questions lq on lq.lesson_id = l.id
      where e.student_id = auth.uid() and lq.id = lesson_questions.id
    ) or exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can manage lesson questions" on lesson_questions
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─── 4. quizzes ───
alter table quizzes enable row level security;
drop policy if exists "Anyone can view quizzes" on quizzes;
drop policy if exists "Admins can manage quizzes" on quizzes;

create policy "Enrolled students and admins can view quizzes" on quizzes
  for select using (
    exists (
      select 1 from enrollments e
      where e.student_id = auth.uid() and e.course_id = quizzes.course_id
    ) or exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can manage quizzes" on quizzes
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─── 5. quiz_questions ───
alter table quiz_questions enable row level security;
drop policy if exists "Anyone can view quiz questions" on quiz_questions;
drop policy if exists "Admins can manage quiz questions" on quiz_questions;

create policy "Enrolled students and admins can view quiz questions" on quiz_questions
  for select using (
    exists (
      select 1 from enrollments e
      join quizzes q on e.course_id = q.course_id
      where e.student_id = auth.uid() and q.id = quiz_questions.quiz_id
    ) or exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can manage quiz questions" on quiz_questions
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ═══════════════════════════════════════════════════════════
--  تم إصلاح الأمان! ✅ المحتوى الآن محمي من الوصول غير المصرح به
-- ═══════════════════════════════════════════════════════════