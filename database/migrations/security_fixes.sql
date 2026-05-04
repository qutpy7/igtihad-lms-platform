-- ═══════════════════════════════════════════════════════════
-- إصلاحات أمنية حرجة — شغّل هذا الكود في Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════


-- ═══ 1. دالة الاشتراك في كورس عبر الرصيد (Atomic Transaction) ═══
-- بدل 4 عمليات منفصلة في الـ frontend، كلها تتم هنا في transaction واحدة

create or replace function public.enroll_course_safely(
  p_student_id uuid,
  p_course_id bigint,
  p_price numeric
)
returns json as $$
declare
  v_balance numeric;
  v_already_enrolled boolean;
  v_course_title text;
begin
  -- 1. Lock the student row to prevent race condition
  select balance into v_balance
  from profiles
  where id = p_student_id
  for update;

  if v_balance is null then
    raise exception 'الطالب غير موجود';
  end if;

  -- 2. Check balance
  if v_balance < p_price then
    raise exception 'رصيدك غير كافٍ للاشتراك. الرصيد: % — السعر: %', v_balance, p_price;
  end if;

  -- 3. Check if already enrolled
  select exists(
    select 1 from enrollments where student_id = p_student_id and course_id = p_course_id
  ) into v_already_enrolled;

  if v_already_enrolled then
    raise exception 'أنت مشترك بالفعل في هذا الكورس';
  end if;

  -- 4. Get course title for transaction log
  select title into v_course_title from courses where id = p_course_id;

  -- 5. Deduct balance (atomic — no race condition possible)
  update profiles
  set balance = balance - p_price
  where id = p_student_id;

  -- 6. Create enrollment
  insert into enrollments (student_id, course_id)
  values (p_student_id, p_course_id);

  -- 7. Log transaction
  insert into wallet_transactions (student_id, type, amount, details, status)
  values (p_student_id, 'purchase', -p_price, 'شراء كورس: ' || coalesce(v_course_title, 'غير معروف'), 'success');

  -- 8. Return success
  return json_build_object(
    'success', true,
    'new_balance', v_balance - p_price,
    'course_title', v_course_title
  );
end;
$$ language plpgsql security definer;


-- ═══ 2. دالة استرداد كود التفعيل (Atomic Transaction) ═══
-- يمنع استخدام نفس الكود مرتين حتى لو ضغط طالبان في نفس اللحظة

create or replace function public.redeem_code_safely(
  p_code text,
  p_student_id uuid
)
returns json as $$
declare
  v_code_id bigint;
  v_course_id bigint;
  v_course_title text;
  v_already_enrolled boolean;
begin
  -- 1. Lock and fetch the code (FOR UPDATE prevents double-use)
  select ac.id, ac.course_id, c.title
  into v_code_id, v_course_id, v_course_title
  from access_codes ac
  left join courses c on c.id = ac.course_id
  where ac.code = p_code and ac.status = 'available'
  for update;

  if v_code_id is null then
    raise exception 'الكود غير صحيح أو مستخدم من قبل';
  end if;

  if v_course_id is null then
    raise exception 'هذا الكود غير مرتبط بكورس صالح';
  end if;

  -- 2. Check if already enrolled
  select exists(
    select 1 from enrollments where student_id = p_student_id and course_id = v_course_id
  ) into v_already_enrolled;

  if v_already_enrolled then
    raise exception 'أنت مشترك بالفعل في هذا الكورس ولا يمكنك استخدام كود له';
  end if;

  -- 3. Mark code as used (locked row — safe)
  update access_codes
  set status = 'used', student_id = p_student_id, used_at = now()
  where id = v_code_id;

  -- 4. Create enrollment
  insert into enrollments (student_id, course_id)
  values (p_student_id, v_course_id);

  -- 5. Log transaction
  insert into wallet_transactions (student_id, type, amount, details, status)
  values (p_student_id, 'purchase', 0, 'تفعيل كورس (' || coalesce(v_course_title, 'مجهول') || ') عبر كود ' || p_code, 'success');

  -- 6. Return success
  return json_build_object(
    'success', true,
    'course_id', v_course_id,
    'course_title', v_course_title,
    'msg', 'تم تفعيل الكورس بنجاح!'
  );
end;
$$ language plpgsql security definer;


-- ═══ 3. حماية تسجيل الأدمن — نقل التحقق للـ Server ═══
-- بدل التحقق في الـ frontend (يمكن تجاوزه)، التحقق يتم في الـ database

create or replace function public.verify_admin_secret(p_secret text)
returns boolean as $$
declare
  v_stored_secret text;
begin
  select value into v_stored_secret
  from site_settings
  where key = 'admin_secret';

  if v_stored_secret is null then
    return false;
  end if;

  return v_stored_secret = p_secret;
end;
$$ language plpgsql security definer;
