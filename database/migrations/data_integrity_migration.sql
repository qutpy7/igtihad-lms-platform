-- ════════════════════════════════════════════════════════════════
-- Migration: Data Integrity & Enrollment Expiry
-- منصة اجتهاد — شغّل هذا الملف في Supabase SQL Editor
-- ════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────
-- FIX 4.2: Ensure unique constraint on lesson_progress
-- ────────────────────────────────────────────────────────────────
-- Remove duplicate rows first (keep only the latest)
DELETE FROM lesson_progress a
USING lesson_progress b
WHERE a.id < b.id
  AND a.student_id = b.student_id
  AND a.lesson_id  = b.lesson_id;

-- Add the unique constraint (safe to run even if it already exists)
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

-- ────────────────────────────────────────────────────────────────
-- FIX 7: Add expires_at column to enrollments
-- ────────────────────────────────────────────────────────────────
-- Add the column if not already present
ALTER TABLE enrollments
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT NULL;

-- Add a computed index for fast expiry checks
CREATE INDEX IF NOT EXISTS idx_enrollments_expires_at
  ON enrollments (expires_at)
  WHERE expires_at IS NOT NULL;

-- ────────────────────────────────────────────────────────────────
-- UPDATE: enroll_course_safely RPC — now supports expires_at
-- ────────────────────────────────────────────────────────────────
-- Default enrollment duration: 365 days (1 year).
-- Pass NULL for p_duration_days to create a lifetime enrollment.

CREATE OR REPLACE FUNCTION enroll_course_safely(
  p_student_id  UUID,
  p_course_id   BIGINT,
  p_price       NUMERIC,
  p_duration_days INT DEFAULT 365   -- ✅ New param: days until expiry
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance      NUMERIC;
  v_already      BOOLEAN;
  v_expires_at   TIMESTAMPTZ;
BEGIN
  -- 1. Lock the student row to prevent race conditions
  SELECT balance INTO v_balance
  FROM profiles
  WHERE id = p_student_id
  FOR UPDATE;

  -- 2. Check if already enrolled
  SELECT EXISTS(
    SELECT 1 FROM enrollments
    WHERE student_id = p_student_id
      AND course_id  = p_course_id
      AND (expires_at IS NULL OR expires_at > NOW())
  ) INTO v_already;

  IF v_already THEN
    RAISE EXCEPTION 'أنت مشترك بالفعل في هذا الكورس';
  END IF;

  -- 3. Check sufficient balance (only if price > 0)
  IF p_price > 0 AND v_balance < p_price THEN
    RAISE EXCEPTION 'رصيدك غير كافٍ. رصيدك الحالي: % ج.م', v_balance;
  END IF;

  -- 4. Deduct balance atomically (safe subtract, no read-modify-write race)
  IF p_price > 0 THEN
    UPDATE profiles
    SET balance = balance - p_price
    WHERE id = p_student_id;

    -- 5. Record the wallet transaction
    INSERT INTO wallet_transactions (student_id, amount, type, description)
    VALUES (p_student_id, -p_price, 'debit', 'اشتراك في كورس رقم ' || p_course_id);
  END IF;

  -- 6. Calculate expiry date
  v_expires_at := CASE
    WHEN p_duration_days IS NULL THEN NULL         -- lifetime
    ELSE NOW() + (p_duration_days || ' days')::INTERVAL
  END;

  -- 7. Create the enrollment with expiry
  INSERT INTO enrollments (student_id, course_id, enrolled_at, expires_at)
  VALUES (p_student_id, p_course_id, NOW(), v_expires_at);

  RETURN jsonb_build_object(
    'success',     true,
    'new_balance', v_balance - COALESCE(p_price, 0),
    'expires_at',  v_expires_at
  );
END;
$$;

-- ────────────────────────────────────────────────────────────────
-- VIEW: active_enrollments — helper for checking valid subscriptions
-- (هذا الـ view يُستخدم بدلاً من enrollments مباشرةً في RLS)
-- ────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW active_enrollments AS
SELECT *
FROM enrollments
WHERE expires_at IS NULL
   OR expires_at > NOW();

-- ────────────────────────────────────────────────────────────────
-- HELPER FUNCTION: is_enrollment_active — for use in RLS policies
-- ────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION is_enrollment_active(p_student_id UUID, p_course_id BIGINT)
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
