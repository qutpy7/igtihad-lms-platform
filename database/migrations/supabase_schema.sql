-- ═══════════════════════════════════════════════════════════
--  منصة اجتهاد — Supabase Database Schema
--  قم بنسخ هذا الملف بالكامل ولصقه في Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- ─── 1. Profiles (بيانات المستخدمين) ───
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

-- Enable RLS
alter table profiles enable row level security;

-- Policies: users can read their own profile, admins can read all
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Admins can view all profiles" on profiles
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─── 2. Courses (الكورسات) ───
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
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table courses enable row level security;

-- Everyone can read active courses
create policy "Anyone can view active courses" on courses
  for select using (is_active = true);

-- Admins can do everything
create policy "Admins can manage courses" on courses
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─── 3. Units (الوحدات) ───
create table if not exists units (
  id bigint generated always as identity primary key,
  course_id bigint references courses(id) on delete cascade not null,
  title text not null,
  sort_order integer default 0,
  thumbnail_url text,
  created_at timestamptz default now()
);

alter table units enable row level security;

create policy "Anyone can view units" on units
  for select using (true);

create policy "Admins can manage units" on units
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─── 4. Lessons (الدروس) ───
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
  created_at timestamptz default now()
);

alter table lessons enable row level security;

create policy "Anyone can view lessons" on lessons
  for select using (true);

create policy "Admins can manage lessons" on lessons
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─── 5. Lesson Questions (أسئلة الواجبات المرتبطة بالدروس) ───
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

create policy "Anyone can view lesson questions" on lesson_questions
  for select using (true);

create policy "Admins can manage lesson questions" on lesson_questions
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─── 6. Quizzes (الامتحانات الشاملة) ───
create table if not exists quizzes (
  id bigint generated always as identity primary key,
  title text not null,
  course_id bigint references courses(id) on delete cascade not null,
  duration integer default 30,
  scheduled_date date,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table quizzes enable row level security;

create policy "Anyone can view quizzes" on quizzes
  for select using (true);

create policy "Admins can manage quizzes" on quizzes
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─── 7. Quiz Questions (أسئلة الامتحانات) ───
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

create policy "Anyone can view quiz questions" on quiz_questions
  for select using (true);

create policy "Admins can manage quiz questions" on quiz_questions
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─── 8. Access Codes (أكواد الشحن) ───
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

create policy "Students can view own codes" on access_codes
  for select using (student_id = auth.uid());

create policy "Admins can manage codes" on access_codes
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─── 9. Enrollments (اشتراكات الطلاب) ───
create table if not exists enrollments (
  id bigint generated always as identity primary key,
  student_id uuid references profiles(id) on delete cascade not null,
  course_id bigint references courses(id) on delete cascade not null,
  enrolled_at timestamptz default now(),
  unique(student_id, course_id)
);

alter table enrollments enable row level security;

create policy "Students can view own enrollments" on enrollments
  for select using (student_id = auth.uid());

create policy "Students can insert own enrollments" on enrollments
  for insert with check (student_id = auth.uid());

create policy "Admins can manage enrollments" on enrollments
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─── 10. Lesson Progress (تقدم الطالب) ───
create table if not exists lesson_progress (
  id bigint generated always as identity primary key,
  student_id uuid references profiles(id) on delete cascade not null,
  lesson_id bigint references lessons(id) on delete cascade not null,
  completed boolean default false,
  completed_at timestamptz,
  unique(student_id, lesson_id)
);

alter table lesson_progress enable row level security;

create policy "Students can view own progress" on lesson_progress
  for select using (student_id = auth.uid());

create policy "Students can update own progress" on lesson_progress
  for insert with check (student_id = auth.uid());

create policy "Students can mark progress" on lesson_progress
  for update using (student_id = auth.uid());

create policy "Admins can view all progress" on lesson_progress
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─── 11. Quiz Results (نتائج الامتحانات) ───
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

create policy "Students can view own results" on quiz_results
  for select using (student_id = auth.uid());

create policy "Students can submit results" on quiz_results
  for insert with check (student_id = auth.uid());

create policy "Admins can view all results" on quiz_results
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─── 12. Notifications (الإشعارات) ───
create table if not exists notifications (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  type text not null default 'general',
  text text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

alter table notifications enable row level security;

create policy "Users can view own notifications" on notifications
  for select using (user_id = auth.uid());

create policy "Users can update own notifications" on notifications
  for update using (user_id = auth.uid());

create policy "Admins can insert notifications" on notifications
  for insert with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create or replace function public.create_welcome_notification()
returns trigger as $$
begin
  insert into public.notifications (user_id, type, text)
  values (
    new.id,
    'welcome',
    'مرحباً بك في منصة اجتهاد! 🎉 نتمنى لك رحلة تعليمية موفقة.'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_profile_created on public.profiles;
create trigger on_profile_created
  after insert on public.profiles
  for each row execute procedure public.create_welcome_notification();

-- ═══════════════════════════════════════════════════════════
--  تم إنشاء جميع الجداول بنجاح! ✅
--  الآن ارجع للتطبيق وابدأ باستخدام Supabase
-- ═══════════════════════════════════════════════════════════
