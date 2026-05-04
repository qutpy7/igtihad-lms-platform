-- ████████████████████████████████████████████████████████████████
-- SECURITY MIGRATION 2B — الجزء الثاني
-- RLS Policies فقط
-- شغّله بعد ما SECURITY_2A_TABLES.sql ينجح
-- ████████████████████████████████████████████████████████████████


-- ══════════════════════════════════════
-- wallet_transactions RLS
-- ══════════════════════════════════════
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wallet_transactions_student_select"  ON wallet_transactions;
DROP POLICY IF EXISTS "wallet_transactions_admin_select"    ON wallet_transactions;
DROP POLICY IF EXISTS "wallet_transactions_no_direct_insert" ON wallet_transactions;

CREATE POLICY "wallet_transactions_student_select"
  ON wallet_transactions FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "wallet_transactions_admin_select"
  ON wallet_transactions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- INSERT ممنوع مباشرة — فقط عبر SECURITY DEFINER RPCs
CREATE POLICY "wallet_transactions_no_direct_insert"
  ON wallet_transactions FOR INSERT
  WITH CHECK (false);


-- ══════════════════════════════════════
-- lesson_progress RLS
-- ══════════════════════════════════════
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lesson_progress_student_own"  ON lesson_progress;
DROP POLICY IF EXISTS "lesson_progress_admin_read"   ON lesson_progress;

CREATE POLICY "lesson_progress_student_own"
  ON lesson_progress FOR ALL
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "lesson_progress_admin_read"
  ON lesson_progress FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ══════════════════════════════════════
-- enrollments RLS
-- ══════════════════════════════════════
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "enrollments_student_own"   ON enrollments;
DROP POLICY IF EXISTS "enrollments_admin_all"     ON enrollments;
DROP POLICY IF EXISTS "enrollments_rpc_insert"    ON enrollments;

CREATE POLICY "enrollments_student_own"
  ON enrollments FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "enrollments_admin_all"
  ON enrollments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- INSERT/UPDATE فقط عبر enroll_course_safely RPC (SECURITY DEFINER تتجاوز RLS)
CREATE POLICY "enrollments_rpc_insert"
  ON enrollments FOR INSERT
  WITH CHECK (false);


SELECT 'Part 2B (RLS) done ✅' AS status;
