-- ████████████████████████████████████████████████████████████████████
-- FULL MIGRATION — منصة اجتهاد
-- انسخ هذا الملف كله والصقه في Supabase SQL Editor ثم اضغط Run
-- ████████████████████████████████████████████████████████████████████


-- ════════════════════════════════════════════════════════════════
-- STEP 1: دالة الاشتراك الآمن (Atomic Enrollment)
-- ════════════════════════════════════════════════════════════════

-- أضف عمود expires_at أولاً (مطلوب قبل إنشاء الدالة)
ALTER TABLE enrollments
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_enrollments_expires_at
  ON enrollments (expires_at)
  WHERE expires_at IS NOT NULL;

-- الدالة الكاملة والآمنة للاشتراك
-- Drop first to allow changing return type (JSON → JSONB)
DROP FUNCTION IF EXISTS public.enroll_course_safely(UUID, BIGINT, NUMERIC);
DROP FUNCTION IF EXISTS public.enroll_course_safely(UUID, BIGINT, NUMERIC, INT);

CREATE OR REPLACE FUNCTION public.enroll_course_safely(
  p_student_id    UUID,
  p_course_id     BIGINT,
  p_price         NUMERIC,
  p_duration_days INT DEFAULT 365
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance      NUMERIC;
  v_already      BOOLEAN;
  v_course_title TEXT;
  v_expires_at   TIMESTAMPTZ;
BEGIN
  -- 1. Lock the student row (يمنع race condition)
  SELECT balance INTO v_balance
  FROM profiles
  WHERE id = p_student_id
  FOR UPDATE;

  IF v_balance IS NULL THEN
    RAISE EXCEPTION 'الطالب غير موجود';
  END IF;

  -- 2. Check if already enrolled (with expiry awareness)
  SELECT EXISTS(
    SELECT 1 FROM enrollments
    WHERE student_id = p_student_id
      AND course_id  = p_course_id
      AND (expires_at IS NULL OR expires_at > NOW())
  ) INTO v_already;

  IF v_already THEN
    RAISE EXCEPTION 'أنت مشترك بالفعل في هذا الكورس';
  END IF;

  -- 3. Check balance (only if paid)
  IF p_price > 0 AND v_balance < p_price THEN
    RAISE EXCEPTION 'رصيدك غير كافٍ. رصيدك الحالي: % ج.م', v_balance;
  END IF;

  -- 4. Get course title
  SELECT title INTO v_course_title FROM courses WHERE id = p_course_id;

  -- 5. Deduct balance atomically
  IF p_price > 0 THEN
    UPDATE profiles
    SET balance = balance - p_price
    WHERE id = p_student_id;
  END IF;

  -- 6. Log wallet transaction
  INSERT INTO wallet_transactions (student_id, type, amount, details, status)
  VALUES (p_student_id, 'purchase', -p_price, 'شراء كورس: ' || COALESCE(v_course_title, ''), 'success')
  ON CONFLICT DO NOTHING;

  -- 7. Calculate expiry
  v_expires_at := CASE
    WHEN p_duration_days IS NULL THEN NULL
    ELSE NOW() + (p_duration_days || ' days')::INTERVAL
  END;

  -- 8. Create enrollment
  INSERT INTO enrollments (student_id, course_id, enrolled_at, expires_at)
  VALUES (p_student_id, p_course_id, NOW(), v_expires_at)
  ON CONFLICT (student_id, course_id) DO UPDATE SET expires_at = v_expires_at;

  RETURN jsonb_build_object(
    'success',     true,
    'new_balance', v_balance - COALESCE(p_price, 0),
    'course_title', v_course_title,
    'expires_at',  v_expires_at
  );
END;
$$;


-- ════════════════════════════════════════════════════════════════
-- STEP 2: دالة استخدام كود التفعيل (Atomic Code Redemption)
-- ════════════════════════════════════════════════════════════════

-- Drop first to allow changing return type (JSON → JSONB)
DROP FUNCTION IF EXISTS public.redeem_code_safely(TEXT, UUID);

CREATE OR REPLACE FUNCTION public.redeem_code_safely(
  p_code       TEXT,
  p_student_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code_id      BIGINT;
  v_course_id    BIGINT;
  v_course_title TEXT;
  v_already      BOOLEAN;
BEGIN
  -- 1. Lock and fetch the code (FOR UPDATE يمنع استخدامه مرتين)
  SELECT ac.id, ac.course_id, c.title
  INTO v_code_id, v_course_id, v_course_title
  FROM access_codes ac
  LEFT JOIN courses c ON c.id = ac.course_id
  WHERE ac.code = p_code AND ac.status = 'available'
  FOR UPDATE;

  IF v_code_id IS NULL THEN
    RAISE EXCEPTION 'الكود غير صحيح أو مستخدم من قبل';
  END IF;

  IF v_course_id IS NULL THEN
    RAISE EXCEPTION 'هذا الكود غير مرتبط بكورس صالح';
  END IF;

  -- 2. Check if already enrolled
  SELECT EXISTS(
    SELECT 1 FROM enrollments
    WHERE student_id = p_student_id AND course_id = v_course_id
      AND (expires_at IS NULL OR expires_at > NOW())
  ) INTO v_already;

  IF v_already THEN
    RAISE EXCEPTION 'أنت مشترك بالفعل في هذا الكورس';
  END IF;

  -- 3. Mark code as used
  UPDATE access_codes
  SET status = 'used', student_id = p_student_id, used_at = NOW()
  WHERE id = v_code_id;

  -- 4. Create enrollment (lifetime for code-based)
  INSERT INTO enrollments (student_id, course_id, enrolled_at, expires_at)
  VALUES (p_student_id, v_course_id, NOW(), NULL)
  ON CONFLICT (student_id, course_id) DO NOTHING;

  -- 5. Log
  INSERT INTO wallet_transactions (student_id, type, amount, details, status)
  VALUES (p_student_id, 'purchase', 0, 'تفعيل كود: ' || p_code || ' — ' || COALESCE(v_course_title, ''), 'success')
  ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object(
    'success',      true,
    'course_id',    v_course_id,
    'course_title', v_course_title,
    'msg',          'تم تفعيل الكورس بنجاح!'
  );
END;
$$;


-- ════════════════════════════════════════════════════════════════
-- STEP 3: التحقق من كلمة سر الأدمن (Server-Side)
-- ════════════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS public.verify_admin_secret(TEXT);

CREATE OR REPLACE FUNCTION public.verify_admin_secret(p_secret TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stored TEXT;
BEGIN
  SELECT value INTO v_stored
  FROM site_settings
  WHERE key = 'admin_secret';

  IF v_stored IS NULL THEN RETURN FALSE; END IF;
  RETURN v_stored = p_secret;
END;
$$;


-- ════════════════════════════════════════════════════════════════
-- STEP 4: التحقق من صلاحية الاشتراك (مع expires_at)
-- ════════════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS public.is_enrollment_active(UUID, BIGINT);

CREATE OR REPLACE FUNCTION public.is_enrollment_active(
  p_student_id UUID,
  p_course_id  BIGINT
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM enrollments
    WHERE student_id = p_student_id
      AND course_id  = p_course_id
      AND (expires_at IS NULL OR expires_at > NOW())
  );
$$;

-- View مساعد للاشتراكات النشطة
CREATE OR REPLACE VIEW public.active_enrollments AS
SELECT * FROM enrollments
WHERE expires_at IS NULL OR expires_at > NOW();


-- ════════════════════════════════════════════════════════════════
-- STEP 5: Unique Constraint على lesson_progress
-- ════════════════════════════════════════════════════════════════

-- حذف التكرارات أولاً (إن وُجدت)
DELETE FROM lesson_progress a
USING lesson_progress b
WHERE a.ctid < b.ctid
  AND a.student_id = b.student_id
  AND a.lesson_id  = b.lesson_id;

-- إضافة الـ constraint بأمان
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'lesson_progress_student_lesson_unique'
  ) THEN
    ALTER TABLE lesson_progress
      ADD CONSTRAINT lesson_progress_student_lesson_unique
      UNIQUE (student_id, lesson_id);
  END IF;
END
$$;


-- ════════════════════════════════════════════════════════════════
-- ✅ Migration Complete!
-- ════════════════════════════════════════════════════════════════
SELECT 'Migration completed successfully! ✅' AS status;
