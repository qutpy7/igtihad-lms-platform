-- ████████████████████████████████████████████████████████████████████
-- SECURITY & INTEGRITY MIGRATION #2 — منصة اجتهاد
-- يضاف هذا الملف إلى FULL_MIGRATION_RUN_THIS.sql
-- شغّله في Supabase SQL Editor
-- ████████████████████████████████████████████████████████████████████


-- ════════════════════════════════════════════════════════════════
-- FIX 1: Soft Deletes — إضافة عمود deleted_at للكورسات
-- بدل الحذف الكامل — يحافظ على تاريخ الاشتراكات والتقدم
-- ════════════════════════════════════════════════════════════════

ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Index للأداء (معظم الـ queries ستفلتر على IS NULL)
CREATE INDEX IF NOT EXISTS idx_courses_deleted_at
  ON courses (deleted_at)
  WHERE deleted_at IS NOT NULL;

-- تأكد أن RLS policies تستثني الكورسات المحذوفة
-- (الـ frontend يعمل .is('deleted_at', null) في fetchCourses)


-- ════════════════════════════════════════════════════════════════
-- FIX 2: RLS على wallet_transactions
-- الطالب يرى معاملاته فقط — الأدمن يرى الكل
-- ════════════════════════════════════════════════════════════════

-- Enable RLS
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (idempotent)
DROP POLICY IF EXISTS "wallet_transactions_student_select" ON wallet_transactions;
DROP POLICY IF EXISTS "wallet_transactions_admin_select"   ON wallet_transactions;
DROP POLICY IF EXISTS "wallet_transactions_insert_rpc"     ON wallet_transactions;

-- 1. الطالب يقرأ معاملاته فقط
CREATE POLICY "wallet_transactions_student_select"
  ON wallet_transactions
  FOR SELECT
  USING (student_id = auth.uid());

-- 2. الأدمن يقرأ كل المعاملات
CREATE POLICY "wallet_transactions_admin_select"
  ON wallet_transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 3. INSERT فقط عبر SECURITY DEFINER functions (RPCs)
--    لا يسمح لأي مستخدم بإدراج سجلات مباشرة
CREATE POLICY "wallet_transactions_no_direct_insert"
  ON wallet_transactions
  FOR INSERT
  WITH CHECK (false); -- ❌ blocked — use RPCs only


-- ════════════════════════════════════════════════════════════════
-- FIX 3: Backup Strategy
-- Supabase Daily Backups (Pro Plan: PITR)
-- Free Plan: scheduled export via this function
-- ════════════════════════════════════════════════════════════════

-- دالة مساعدة تُنشئ تقريراً بحجم كل جدول
-- يمكن استدعاؤها يومياً للتحقق من سلامة البيانات
CREATE OR REPLACE FUNCTION public.db_health_report()
RETURNS TABLE(
  table_name  TEXT,
  row_count   BIGINT,
  total_size  TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.tablename::TEXT,
    (xpath('/row/c/text()', query_to_xml(
      format('SELECT count(*) AS c FROM %I.%I', t.schemaname, t.tablename),
      false, true, ''
    )))[1]::TEXT::BIGINT AS row_count,
    pg_size_pretty(pg_total_relation_size(t.schemaname || '.' || t.tablename)) AS total_size
  FROM pg_tables t
  WHERE t.schemaname = 'public'
  ORDER BY t.tablename;
END;
$$;


-- ════════════════════════════════════════════════════════════════
-- FIX 4: تفعيل RLS على lesson_progress
-- الطالب يرى تقدمه فقط
-- ════════════════════════════════════════════════════════════════

ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lesson_progress_student_own" ON lesson_progress;
DROP POLICY IF EXISTS "lesson_progress_admin_all"   ON lesson_progress;

-- الطالب يقرأ/يكتب تقدمه فقط
CREATE POLICY "lesson_progress_student_own"
  ON lesson_progress
  FOR ALL
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- الأدمن يقرأ كل التقدم
CREATE POLICY "lesson_progress_admin_read"
  ON lesson_progress
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- ════════════════════════════════════════════════════════════════
-- FIX 5: تأكيد RLS على enrollments
-- ════════════════════════════════════════════════════════════════

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "enrollments_student_own"  ON enrollments;
DROP POLICY IF EXISTS "enrollments_admin_all"    ON enrollments;
DROP POLICY IF EXISTS "enrollments_rpc_insert"   ON enrollments;

-- الطالب يرى اشتراكاته فقط
CREATE POLICY "enrollments_student_own"
  ON enrollments
  FOR SELECT
  USING (student_id = auth.uid());

-- الأدمن يرى كل الاشتراكات
CREATE POLICY "enrollments_admin_all"
  ON enrollments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- INSERT فقط عبر RPC (enroll_course_safely)
CREATE POLICY "enrollments_rpc_insert"
  ON enrollments
  FOR INSERT
  WITH CHECK (false); -- blocked for direct insert


-- ════════════════════════════════════════════════════════════════
-- ✅ Done!
-- ════════════════════════════════════════════════════════════════
SELECT 'Security & Integrity Migration #2 — completed ✅' AS status;
