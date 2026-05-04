-- ═══════════════════════════════════════════════════════════
--  منصة اجتهاد — Seed Data + Temporary Dev Policies
--  قم بنسخ هذا الملف ولصقه في Supabase SQL Editor → Run
-- ═══════════════════════════════════════════════════════════

-- ─── سياسات مؤقتة للتطوير (ستُحذف لاحقاً عند تفعيل Auth) ───
create policy "Dev: allow all inserts on courses" on courses for insert with check (true);
create policy "Dev: allow all updates on courses" on courses for update using (true);
create policy "Dev: allow all deletes on courses" on courses for delete using (true);

create policy "Dev: allow all inserts on units" on units for insert with check (true);
create policy "Dev: allow all updates on units" on units for update using (true);
create policy "Dev: allow all deletes on units" on units for delete using (true);

create policy "Dev: allow all inserts on lessons" on lessons for insert with check (true);
create policy "Dev: allow all updates on lessons" on lessons for update using (true);
create policy "Dev: allow all deletes on lessons" on lessons for delete using (true);

create policy "Dev: allow all inserts on lesson_questions" on lesson_questions for insert with check (true);
create policy "Dev: allow all updates on lesson_questions" on lesson_questions for update using (true);
create policy "Dev: allow all deletes on lesson_questions" on lesson_questions for delete using (true);

create policy "Dev: allow all inserts on quizzes" on quizzes for insert with check (true);
create policy "Dev: allow all updates on quizzes" on quizzes for update using (true);
create policy "Dev: allow all deletes on quizzes" on quizzes for delete using (true);

create policy "Dev: allow all inserts on quiz_questions" on quiz_questions for insert with check (true);
create policy "Dev: allow all updates on quiz_questions" on quiz_questions for update using (true);
create policy "Dev: allow all deletes on quiz_questions" on quiz_questions for delete using (true);

create policy "Dev: allow all inserts on access_codes" on access_codes for insert with check (true);
create policy "Dev: allow all updates on access_codes" on access_codes for update using (true);
create policy "Dev: allow all deletes on access_codes" on access_codes for delete using (true);
create policy "Dev: allow all select on access_codes" on access_codes for select using (true);

-- ─── إدخال البيانات الأولية ───

-- Courses
insert into courses (title, description, short_desc, grade, term, price, original_price, color, is_featured) values
  ('الرياضيات — الصف الثالث الثانوي', 'شرح كامل ومفصل لمنهج الرياضيات للصف الثالث الثانوي. يشمل التفاضل والتكامل والجبر والهندسة الفراغية مع تمارين وامتحانات.', 'شرح شامل للرياضيات مع تمارين وامتحانات تفاعلية', '3rd-sec', 'first', 200, 350, 'from-violet-400 to-violet-600', true),
  ('الفيزياء — الصف الثالث الثانوي', 'منهج الفيزياء كامل مع تجارب عملية مصورة وأسئلة على كل درس.', 'فيزياء شاملة مع تجارب وحل مسائل', '3rd-sec', 'first', 180, 300, 'from-blue-400 to-blue-600', true),
  ('الكيمياء — الصف الثالث الثانوي', 'منهج الكيمياء مع معادلات محلولة وتجارب عملية.', 'كيمياء مبسطة مع حل معادلات خطوة بخطوة', '3rd-sec', 'first', 170, 280, 'from-emerald-400 to-emerald-600', true),
  ('الرياضيات — الصف الثاني الثانوي', 'أساسيات الجبر والهندسة التحليلية وحساب المثلثات.', 'جبر وهندسة تحليلية مع تمارين', '2nd-sec', 'first', 150, 250, 'from-pink-400 to-pink-600', false),
  ('الرياضيات — الصف الأول الثانوي', 'تأسيس قوي في الجبر وحساب المثلثات والهندسة.', 'تأسيس قوي في الرياضيات', '1st-sec', 'first', 120, 200, 'from-amber-400 to-amber-600', false);

-- Units for Course 1 (Riyada 3rd Sec)
insert into units (course_id, title, sort_order) values
  (1, 'الوحدة 1: التفاضل', 0),
  (1, 'الوحدة 2: التكامل', 1),
  (1, 'الوحدة 3: الجبر', 2);

-- Units for Course 2 (Physics)
insert into units (course_id, title, sort_order) values
  (2, 'الوحدة 1: الكهربية', 0),
  (2, 'الوحدة 2: المغناطيسية', 1);

-- Lessons for Unit 1 (التفاضل)
insert into lessons (unit_id, title, type, duration, sort_order) values
  (1, 'مقدمة في النهايات', 'video', '45 دقيقة', 0),
  (1, 'نظريات النهايات', 'video', '50 دقيقة', 1),
  (1, 'الاتصال', 'video', '40 دقيقة', 2),
  (1, 'التفاضل وقواعده', 'video', '55 دقيقة', 3),
  (1, 'تطبيق واجب: التفاضل', 'quiz', '15 دقيقة', 4);

-- Lessons for Unit 2 (التكامل)
insert into lessons (unit_id, title, type, duration, sort_order) values
  (2, 'مقدمة في التكامل', 'video', '45 دقيقة', 0),
  (2, 'التكامل المحدود', 'video', '50 دقيقة', 1),
  (2, 'تطبيقات التكامل', 'video', '60 دقيقة', 2);

-- Lessons for Unit 3 (الجبر)
insert into lessons (unit_id, title, type, duration, sort_order) values
  (3, 'المصفوفات', 'video', '50 دقيقة', 0),
  (3, 'المحددات', 'video', '45 دقيقة', 1);

-- Lessons for Physics Units
insert into lessons (unit_id, title, type, duration, sort_order) values
  (4, 'التيار الكهربي', 'video', '45 دقيقة', 0),
  (4, 'قانون أوم', 'video', '40 دقيقة', 1),
  (4, 'المقاومات', 'video', '50 دقيقة', 2),
  (5, 'المجال المغناطيسي', 'video', '45 دقيقة', 0),
  (5, 'الحث الكهرومغناطيسي', 'video', '55 دقيقة', 1);

-- Lesson Questions (for the quiz lesson)
insert into lesson_questions (lesson_id, question, options, correct_answer, sort_order) values
  (5, 'ما هو تفاضل الدالة س² ؟', '["س", "2س", "س³", "2"]', 1, 0),
  (5, 'تفاضل الدالة الثابتة يساوي:', '["1", "0", "∞", "الثابت نفسه"]', 1, 1);

-- Standalone Quizzes
insert into quizzes (title, course_id, duration, scheduled_date) values
  ('امتحان النهايات', 1, 30, '2026-05-15'),
  ('امتحان التفاضل', 1, 45, '2026-05-20'),
  ('امتحان الكهربية', 2, 35, '2026-05-18');

-- Quiz Questions
insert into quiz_questions (quiz_id, question, options, correct_answer, sort_order) values
  (1, 'ما قيمة نها (س → 2) للدالة د(س) = س² - 4 / س - 2 ؟', '["2", "4", "0", "غير موجودة"]', 1, 0),
  (1, 'نها (س → 0) للدالة جا(س)/س تساوي:', '["0", "1", "∞", "غير موجودة"]', 1, 1),
  (1, 'الدالة د(س) = |س| تكون متصلة عند س = 0:', '["صح", "خطأ", "أحياناً", "لا يمكن تحديد"]', 0, 2);

-- Access Codes
insert into access_codes (code, course_id, status) values
  ('IGT-2026-A7X9', 1, 'available'),
  ('IGT-2026-B3K2', 1, 'available'),
  ('IGT-2026-C5M8', 2, 'available'),
  ('IGT-2026-D1P4', 2, 'available'),
  ('IGT-2026-E9R6', 3, 'available'),
  ('IGT-2026-F2T1', 1, 'available');

-- ═══════════════════════════════════════════════════════════
--  تم إدخال البيانات بنجاح! ✅
-- ═══════════════════════════════════════════════════════════
