-- ═══════════════════════════════════════════════════════════
--  منصة اجتهاد — Secured Database Schema (Fixed RLS)
--  Run this file completely in Supabase SQL Editor
--
--  IMPORTANT: Drop existing tables first:
--  DROP TABLE IF EXISTS quiz_questions, quizzes, lesson_progress, enrollments, 
--    access_codes, quiz_results, notifications, course_reviews, student_questions,
--    wallet_transactions, lessons, units, courses, profiles CASCADE;
-- ═══════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════
-- STEP 1: Create Independent Tables (No Foreign Keys)
-- ═══════════════════════════════════════════════════════════

-- ─── 1. Profiles ───
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  email text,
  phone text,
  avatar_url text,
  role text not null default 'student' check (role in ('admin', 'student')),
  grade text,
  governorate text,
  balance integer default 0,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on profiles for select using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ─── 2. Courses ───
create table if not exists courses (
  id bigint generated always as identity primary key,
  title text not null,
  description text,
  short_desc text,
  grade text not null,
  term text not null default 'first',
  price integer default 0,
  original_price integer default 0,
  color text default 'from-violet-400 to-violet-600',
  cover_url text,
  is_featured boolean default false,
  is_active boolean default true,
  deleted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table courses enable row level security;
create policy "Anyone can view active courses" on courses for select using (is_active = true and deleted_at is null);
create policy "Admins can manage courses" on courses for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ═══════════════════════════════════════════════════════════
-- STEP 2: Create Tables that depend on Courses
-- ═══════════════════════════════════════════════════════════

-- ─── 3. Enrollments ───
create table if not exists enrollments (
  id bigint generated always as identity primary key,
  student_id uuid references profiles(id) on delete cascade not null,
  course_id bigint references courses(id) on delete cascade not null,
  enrolled_at timestamptz default now(),
  expires_at timestamptz,
  unique(student_id, course_id)
);

alter table enrollments enable row level security;
create policy "Students can view own enrollments" on enrollments for select using (student_id = auth.uid());
create policy "Students can insert own enrollments" on enrollments for insert with check (student_id = auth.uid());
create policy "Admins can manage enrollments" on enrollments for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ─── 4. Access Codes ───
create table if not exists access_codes (
  id bigint generated always as identity primary key,
  code text unique not null,
  course_id bigint references courses(id) on delete cascade not null,
  status text default 'available' check (status in ('available', 'used', 'expired')),
  student_id uuid references profiles(id),
  created_at timestamptz default now(),
  used_at timestamptz
);

alter table access_codes enable row level security;
create policy "Students can view own codes" on access_codes for select using (student_id = auth.uid());
create policy "Admins can manage codes" on access_codes for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ─── 5. Wallet Transactions ───
create table if not exists wallet_transactions (
  id bigint generated always as identity primary key,
  student_id uuid references profiles(id) on delete cascade not null,
  type text not null,
  amount integer not null,
  details text,
  status text default 'success',
  created_at timestamptz default now()
);

alter table wallet_transactions enable row level security;
create policy "Students can view own transactions" on wallet_transactions for select using (student_id = auth.uid());
create policy "Admins can view all transactions" on wallet_transactions for select using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ═══════════════════════════════════════════════════════════
-- STEP 3: Create Tables that depend on Courses
-- ═══════════════════════════════════════════════════════════

-- ─── 6. Units ───
create table if not exists units (
  id bigint generated always as identity primary key,
  course_id bigint references courses(id) on delete cascade not null,
  title text not null,
  sort_order integer default 0,
  thumbnail_url text,
  deleted_at timestamptz,
  created_at timestamptz default now()
);

alter table units enable row level security;
create policy "Enrolled students and admins can view units" on units for select using (
  exists (select 1 from enrollments e where e.student_id = auth.uid() and e.course_id = units.course_id)
  or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can manage units" on units for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ═══════════════════════════════════════════════════════════
-- STEP 4: Create Tables that depend on Units
-- ═══════════════════════════════════════════════════════════

-- ─── 7. Lessons ───
create table if not exists lessons (
  id bigint generated always as identity primary key,
  unit_id bigint references units(id) on delete cascade not null,
  title text not null,
  type text not null default 'video' check (type in ('video', 'pdf', 'quiz')),
  content_url text,
  attachment_url text,
  content text,
  duration text,
  sort_order integer default 0,
  thumbnail_url text,
  deleted_at timestamptz,
  created_at timestamptz default now()
);

alter table lessons enable row level security;
create policy "Enrolled students and admins can view lessons" on lessons for select using (
  exists (
    select 1 from enrollments e
    join units u on e.course_id = u.course_id
    where e.student_id = auth.uid() and u.id = lessons.unit_id
  ) or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can manage lessons" on lessons for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ═══════════════════════════════════════════════════════════
-- STEP 5: Create Tables that depend on Lessons
-- ═══════════════════════════════════════════════════════════

-- ─── 8. Lesson Progress ───
create table if not exists lesson_progress (
  id bigint generated always as identity primary key,
  student_id uuid references profiles(id) on delete cascade not null,
  lesson_id bigint references lessons(id) on delete cascade not null,
  completed boolean default false,
  completed_at timestamptz,
  unique(student_id, lesson_id)
);

alter table lesson_progress enable row level security;
create policy "Students can view own progress" on lesson_progress for select using (student_id = auth.uid());
create policy "Students can update own progress" on lesson_progress for insert with check (student_id = auth.uid());
create policy "Students can mark progress" on lesson_progress for update using (student_id = auth.uid());
create policy "Admins can view all progress" on lesson_progress for select using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ─── 9. Lesson Questions ───
create table if not exists lesson_questions (
  id bigint generated always as identity primary key,
  lesson_id bigint references lessons(id) on delete cascade not null,
  question text not null,
  options jsonb not null default '[]',
  correct_answer integer not null default 0,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table lesson_questions enable row level security;
create policy "Enrolled students and admins can view lesson questions" on lesson_questions for select using (
  exists (
    select 1 from enrollments e
    join units u on e.course_id = (select u2.course_id from units u2 where u2.id = (
      select l.unit_id from lessons l where l.id = lesson_questions.lesson_id
    ))
    where e.student_id = auth.uid()
  ) or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can manage lesson questions" on lesson_questions for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ─── 10. Student Questions ───
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
create policy "Students can view own questions" on student_questions for select using (student_id = auth.uid());
create policy "Students can ask questions" on student_questions for insert with check (student_id = auth.uid());
create policy "Admins can manage student questions" on student_questions for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ═══════════════════════════════════════════════════════════
-- STEP 6: Create Tables that depend on Courses (Quizzes)
-- ═══════════════════════════════════════════════════════════

-- ─── 11. Quizzes ───
create table if not exists quizzes (
  id bigint generated always as identity primary key,
  title text not null,
  course_id bigint references courses(id) on delete cascade not null,
  duration integer default 30,
  scheduled_date date,
  is_active boolean default true,
  deleted_at timestamptz,
  created_at timestamptz default now()
);

alter table quizzes enable row level security;
create policy "Enrolled students and admins can view quizzes" on quizzes for select using (
  exists (select 1 from enrollments e where e.student_id = auth.uid() and e.course_id = quizzes.course_id)
  or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can manage quizzes" on quizzes for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ─── 12. Quiz Questions ───
create table if not exists quiz_questions (
  id bigint generated always as identity primary key,
  quiz_id bigint references quizzes(id) on delete cascade not null,
  question text not null,
  options jsonb not null default '[]',
  correct_answer integer not null default 0,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table quiz_questions enable row level security;
create policy "Enrolled students and admins can view quiz questions" on quiz_questions for select using (
  exists (
    select 1 from enrollments e
    where e.student_id = auth.uid() and e.course_id = (select q.course_id from quizzes q where q.id = quiz_questions.quiz_id)
  ) or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can manage quiz questions" on quiz_questions for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ─── 13. Quiz Results ───
create table if not exists quiz_results (
  id bigint generated always as identity primary key,
  student_id uuid references profiles(id) on delete cascade not null,
  quiz_id bigint references quizzes(id) on delete cascade,
  lesson_id bigint references lessons(id) on delete cascade,
  score integer not null default 0,
  total integer not null default 0,
  answers jsonb default '[]',
  submitted_at timestamptz default now()
);

alter table quiz_results enable row level security;
create policy "Students can view own results" on quiz_results for select using (student_id = auth.uid());
create policy "Students can submit results" on quiz_results for insert with check (student_id = auth.uid());
create policy "Admins can view all results" on quiz_results for select using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ═══════════════════════════════════════════════════════════
-- STEP 7: Create Independent Tables
-- ═══════════════════════════════════════════════════════════

-- ─── 14. Notifications ───
create table if not exists notifications (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  type text not null default 'general',
  text text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

alter table notifications enable row level security;
create policy "Users can view own notifications" on notifications for select using (user_id = auth.uid());
create policy "Users can update own notifications" on notifications for update using (user_id = auth.uid());
create policy "Admins can insert notifications" on notifications for insert with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ─── 15. Course Reviews ───
create table if not exists course_reviews (
  id bigint generated always as identity primary key,
  course_id bigint references courses(id) on delete cascade not null,
  student_id uuid references profiles(id) on delete cascade not null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  comment text,
  created_at timestamptz default now(),
  unique(course_id, student_id)
);

alter table course_reviews enable row level security;
create policy "Anyone can view course reviews" on course_reviews for select using (true);
create policy "Students can insert own review" on course_reviews for insert with check (
  student_id = auth.uid() and exists (select 1 from enrollments e where e.student_id = auth.uid() and e.course_id = course_reviews.course_id)
);
create policy "Students can update own review" on course_reviews for update using (student_id = auth.uid());
create policy "Admins can manage course reviews" on course_reviews for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ═══════════════════════════════════════════════════════════
-- STEP 8: Trigger for welcome notification
-- ═══════════════════════════════════════════════════════════

create or replace function public.create_welcome_notification()
returns trigger as $$
begin
  insert into public.notifications (user_id, type, text)
  values (new.id, 'welcome', 'مرحباً بك في منصة اجتهاد! 🎉 نتمنى لك رحلة تعليمية موفقة.');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_profile_created on public.profiles;
create trigger on_profile_created
  after insert on public.profiles
  for each row execute procedure public.create_welcome_notification();

-- ═══════════════════════════════════════════════════════════
-- STEP 9: Create Storage Bucket (run in Supabase Dashboard > Storage)
-- ═══════════════════════════════════════════════════════════

-- Go to Supabase Dashboard > Storage > New Bucket
-- Name: lesson-content
-- Public: OFF (private bucket)

-- Then add these policies in Storage:
/*
-- Policy 1: Allow authenticated users to view files
create policy "Allow authenticated users to view"
on storage.objects for select
using ( bucket_id = 'lesson-content' and auth.role() = 'authenticated');

-- Policy 2: Allow authenticated users to upload
create policy "Allow authenticated users to upload"
on storage.objects for insert
with check ( bucket_id = 'lesson-content' and auth.role() = 'authenticated');
*/

-- ═══════════════════════════════════════════════════════════
-- STEP 10: Enable Realtime (run in Supabase Dashboard)
-- ═══════════════════════════════════════════════════════════

-- Go to Supabase Dashboard > Database > Replication
-- Enable replication for these tables:
-- - courses
-- - units
-- - lessons
-- - lesson_questions
-- - quizzes
-- - quiz_questions
-- - enrollments
-- - lesson_progress
-- - notifications
-- - student_questions
-- - course_reviews

-- ═══════════════════════════════════════════════════════════
--  Done! ✅ All tables created with correct order and RLS
-- ═══════════════════════════════════════════════════════════