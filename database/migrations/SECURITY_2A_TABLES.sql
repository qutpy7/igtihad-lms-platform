-- ████████████████████████████████████████████████████████████████
-- SECURITY MIGRATION 2A — الجزء الأول
-- الجداول والدوال فقط (بدون RLS)
-- ████████████████████████████████████████████████████████████████

-- Soft Deletes للكورسات
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_courses_deleted_at
  ON courses (deleted_at)
  WHERE deleted_at IS NOT NULL;

-- دالة Health Report للـ Backup
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

SELECT 'Part 2A done ✅' AS status;
