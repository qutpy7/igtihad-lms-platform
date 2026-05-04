-- ═══════════════════════════════════════════════════════════
--  إضافة جدول الإشعارات (Notifications)
-- ═══════════════════════════════════════════════════════════

create table if not exists notifications (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  type text not null default 'general', -- e.g., 'lesson', 'result', 'payment', 'quiz', 'welcome'
  text text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

alter table notifications enable row level security;

-- Users can only read their own notifications
create policy "Users can view own notifications" on notifications
  for select using (user_id = auth.uid());

-- Users can update (mark as read) their own notifications
create policy "Users can update own notifications" on notifications
  for update using (user_id = auth.uid());

-- Admins can create notifications for anyone
create policy "Admins can insert notifications" on notifications
  for insert with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Function to create welcome notification on new user signup
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

-- Trigger to run after a profile is created
drop trigger if exists on_profile_created on public.profiles;
create trigger on_profile_created
  after insert on public.profiles
  for each row execute procedure public.create_welcome_notification();

-- ═══════════════════════════════════════════════════════════
--  تم! قم بتشغيل هذا الملف في Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════
