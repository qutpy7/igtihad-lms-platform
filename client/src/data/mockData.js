/* ═══════════════════════════════════════════════════
   MOCK DATA — منصة اجتهاد
   ═══════════════════════════════════════════════════ */

export const GRADES = [
  { value: '1st-prep', label: 'الصف الأول الإعدادي' },
  { value: '2nd-prep', label: 'الصف الثاني الإعدادي' },
  { value: '3rd-prep', label: 'الصف الثالث الإعدادي' },
  { value: '1st-sec', label: 'الصف الأول الثانوي' },
  { value: '2nd-sec', label: 'الصف الثاني الثانوي' },
  { value: '3rd-sec', label: 'الصف الثالث الثانوي' },
]

export const TERMS = [
  { value: 'first', label: 'الترم الأول' },
  { value: 'second', label: 'الترم الثاني' },
]

export const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية',
  'المنوفية', 'الغربية', 'كفر الشيخ', 'البحيرة', 'الفيوم',
  'بني سويف', 'المنيا', 'أسيوط', 'سوهاج', 'قنا',
  'الأقصر', 'أسوان', 'البحر الأحمر', 'الوادي الجديد', 'مطروح',
  'شمال سيناء', 'جنوب سيناء', 'بورسعيد', 'السويس', 'الإسماعيلية',
  'دمياط',
]

export const COURSES = [
  {
    id: 1,
    title: 'الرياضيات — الصف الثالث الثانوي',
    description: 'شرح كامل ومفصل لمنهج الرياضيات للصف الثالث الثانوي. يشمل التفاضل والتكامل والجبر والهندسة الفراغية مع تمارين وامتحانات.',
    shortDesc: 'شرح شامل للرياضيات مع تمارين وامتحانات تفاعلية',
    grade: '3rd-sec',
    term: 'first',
    price: 200,
    originalPrice: 350,
    color: 'from-violet-400 to-violet-600',
    lessonsCount: 45,
    duration: '32 ساعة',
    studentsCount: 234,
    rating: 4.8,
    isFeatured: true,
    curriculum: [
      {
        unit: 'الوحدة 1: التفاضل',
        lessons: [
          { id: 101, title: 'مقدمة في النهايات', duration: '45 دقيقة', completed: true },
          { id: 102, title: 'نظريات النهايات', duration: '50 دقيقة', completed: true },
          { id: 103, title: 'الاتصال', duration: '40 دقيقة', completed: false },
          { id: 104, title: 'التفاضل وقواعده', duration: '55 دقيقة', completed: false },
          { id: 1045, title: 'تطبيق واجب: التفاضل', duration: '15 دقيقة', completed: false },
        ],
      },
      {
        unit: 'الوحدة 2: التكامل',
        lessons: [
          { id: 105, title: 'مقدمة في التكامل', duration: '45 دقيقة', completed: false },
          { id: 106, title: 'التكامل المحدود', duration: '50 دقيقة', completed: false },
          { id: 107, title: 'تطبيقات التكامل', duration: '60 دقيقة', completed: false },
        ],
      },
      {
        unit: 'الوحدة 3: الجبر',
        lessons: [
          { id: 108, title: 'المصفوفات', duration: '50 دقيقة', completed: false },
          { id: 109, title: 'المحددات', duration: '45 دقيقة', completed: false },
        ],
      },
    ],
  },
  {
    id: 2,
    title: 'الفيزياء — الصف الثالث الثانوي',
    description: 'منهج الفيزياء كامل مع تجارب عملية مصورة وأسئلة على كل درس.',
    shortDesc: 'فيزياء شاملة مع تجارب وحل مسائل',
    grade: '3rd-sec',
    term: 'first',
    price: 180,
    originalPrice: 300,
    color: 'from-blue-400 to-blue-600',
    lessonsCount: 38,
    duration: '28 ساعة',
    studentsCount: 189,
    rating: 4.9,
    isFeatured: true,
    curriculum: [
      {
        unit: 'الوحدة 1: الكهربية',
        lessons: [
          { id: 201, title: 'التيار الكهربي', duration: '45 دقيقة', completed: true },
          { id: 202, title: 'قانون أوم', duration: '40 دقيقة', completed: false },
          { id: 203, title: 'المقاومات', duration: '50 دقيقة', completed: false },
        ],
      },
      {
        unit: 'الوحدة 2: المغناطيسية',
        lessons: [
          { id: 204, title: 'المجال المغناطيسي', duration: '45 دقيقة', completed: false },
          { id: 205, title: 'الحث الكهرومغناطيسي', duration: '55 دقيقة', completed: false },
        ],
      },
    ],
  },
  {
    id: 3,
    title: 'الكيمياء — الصف الثالث الثانوي',
    description: 'منهج الكيمياء مع معادلات محلولة وتجارب عملية.',
    shortDesc: 'كيمياء مبسطة مع حل معادلات خطوة بخطوة',
    grade: '3rd-sec',
    term: 'first',
    price: 170,
    originalPrice: 280,
    color: 'from-emerald-400 to-emerald-600',
    lessonsCount: 35,
    duration: '25 ساعة',
    studentsCount: 156,
    rating: 4.7,
    isFeatured: true,
    curriculum: [
      {
        unit: 'الوحدة 1: الكيمياء العضوية',
        lessons: [
          { id: 301, title: 'الهيدروكربونات', duration: '50 دقيقة', completed: false },
          { id: 302, title: 'المشتقات الهيدروكربونية', duration: '45 دقيقة', completed: false },
        ],
      },
    ],
  },
  {
    id: 4,
    title: 'الرياضيات — الصف الثاني الثانوي',
    description: 'أساسيات الجبر والهندسة التحليلية وحساب المثلثات.',
    shortDesc: 'جبر وهندسة تحليلية مع تمارين',
    grade: '2nd-sec',
    term: 'first',
    price: 150,
    originalPrice: 250,
    color: 'from-pink-400 to-pink-600',
    lessonsCount: 40,
    duration: '30 ساعة',
    studentsCount: 198,
    rating: 4.8,
    isFeatured: false,
    curriculum: [
      {
        unit: 'الوحدة 1: الجبر',
        lessons: [
          { id: 401, title: 'اللوغاريتمات', duration: '40 دقيقة', completed: false },
          { id: 402, title: 'المتتاليات', duration: '45 دقيقة', completed: false },
        ],
      },
    ],
  },
  {
    id: 5,
    title: 'الرياضيات — الصف الأول الثانوي',
    description: 'تأسيس قوي في الجبر وحساب المثلثات والهندسة.',
    shortDesc: 'تأسيس قوي في الرياضيات',
    grade: '1st-sec',
    term: 'first',
    price: 120,
    originalPrice: 200,
    color: 'from-amber-400 to-amber-600',
    lessonsCount: 35,
    duration: '26 ساعة',
    studentsCount: 145,
    rating: 4.6,
    isFeatured: false,
    curriculum: [
      {
        unit: 'الوحدة 1: الجبر والعلاقات',
        lessons: [
          { id: 501, title: 'المجموعات', duration: '35 دقيقة', completed: false },
          { id: 502, title: 'العلاقات والدوال', duration: '40 دقيقة', completed: false },
        ],
      },
    ],
  },
  {
    id: 6,
    title: 'الفيزياء — الصف الثاني الثانوي',
    description: 'الحركة والقوى والشغل والطاقة مع تجارب.',
    shortDesc: 'ميكانيكا وحرارة مع تطبيقات',
    grade: '2nd-sec',
    term: 'first',
    price: 150,
    originalPrice: 250,
    color: 'from-cyan-400 to-cyan-600',
    lessonsCount: 32,
    duration: '24 ساعة',
    studentsCount: 112,
    rating: 4.7,
    isFeatured: false,
    curriculum: [
      {
        unit: 'الوحدة 1: الحركة',
        lessons: [
          { id: 601, title: 'الحركة في خط مستقيم', duration: '40 دقيقة', completed: false },
          { id: 602, title: 'قوانين نيوتن', duration: '50 دقيقة', completed: false },
        ],
      },
    ],
  },
  {
    id: 7,
    title: 'الرياضيات — الصف الثالث الإعدادي',
    description: 'تأسيس الجبر والهندسة والإحصاء للمرحلة الإعدادية.',
    shortDesc: 'جبر وهندسة وإحصاء',
    grade: '3rd-prep',
    term: 'first',
    price: 100,
    originalPrice: 170,
    color: 'from-rose-400 to-rose-600',
    lessonsCount: 30,
    duration: '20 ساعة',
    studentsCount: 210,
    rating: 4.9,
    isFeatured: false,
    curriculum: [
      {
        unit: 'الوحدة 1: الأعداد الحقيقية',
        lessons: [
          { id: 701, title: 'الجذور التربيعية', duration: '30 دقيقة', completed: false },
        ],
      },
    ],
  },
  {
    id: 8,
    title: 'الرياضيات — الصف الثالث الثانوي (ترم ثاني)',
    description: 'الاستاتيكا والديناميكا مع حل مسائل متنوعة.',
    shortDesc: 'ميكانيكا واستاتيكا وديناميكا',
    grade: '3rd-sec',
    term: 'second',
    price: 200,
    originalPrice: 350,
    color: 'from-indigo-400 to-indigo-600',
    lessonsCount: 42,
    duration: '30 ساعة',
    studentsCount: 178,
    rating: 4.8,
    isFeatured: false,
    curriculum: [
      {
        unit: 'الوحدة 1: الاستاتيكا',
        lessons: [
          { id: 801, title: 'محصلة القوى', duration: '45 دقيقة', completed: false },
        ],
      },
    ],
  },
]

export const STUDENTS = [
  { id: 1, name: 'محمد أحمد', email: 'mohamed@email.com', phone: '01012345678', grade: '3rd-sec', governorate: 'القاهرة', coursesCount: 3, status: 'active', joinDate: '2025-09-15' },
  { id: 2, name: 'أحمد حسن', email: 'ahmed@email.com', phone: '01123456789', grade: '3rd-sec', governorate: 'الجيزة', coursesCount: 2, status: 'active', joinDate: '2025-10-01' },
  { id: 3, name: 'يوسف محمود', email: 'youssef@email.com', phone: '01234567890', grade: '2nd-sec', governorate: 'الإسكندرية', coursesCount: 1, status: 'active', joinDate: '2025-10-20' },
  { id: 4, name: 'عمر خالد', email: 'omar@email.com', phone: '01098765432', grade: '3rd-sec', governorate: 'الدقهلية', coursesCount: 3, status: 'suspended', joinDate: '2025-08-05' },
  { id: 5, name: 'علي سعيد', email: 'ali@email.com', phone: '01567890123', grade: '1st-sec', governorate: 'الشرقية', coursesCount: 1, status: 'active', joinDate: '2025-11-10' },
  { id: 6, name: 'حسين رمضان', email: 'hussein@email.com', phone: '01298765432', grade: '3rd-prep', governorate: 'المنوفية', coursesCount: 2, status: 'active', joinDate: '2025-11-25' },
  { id: 7, name: 'كريم طارق', email: 'karim@email.com', phone: '01187654321', grade: '2nd-sec', governorate: 'الغربية', coursesCount: 1, status: 'active', joinDate: '2025-12-01' },
  { id: 8, name: 'مصطفى إبراهيم', email: 'mostafa@email.com', phone: '01076543210', grade: '3rd-sec', governorate: 'القاهرة', coursesCount: 2, status: 'active', joinDate: '2026-01-05' },
  { id: 9, name: 'ياسر عبدالله', email: 'yasser@email.com', phone: '01543210987', grade: '1st-sec', governorate: 'بني سويف', coursesCount: 1, status: 'suspended', joinDate: '2025-09-20' },
  { id: 10, name: 'أنس محمد', email: 'anas@email.com', phone: '01365432109', grade: '3rd-sec', governorate: 'المنيا', coursesCount: 3, status: 'active', joinDate: '2026-02-10' },
]

export const TESTIMONIALS = [
  { id: 1, name: 'محمد أحمد', grade: 'الصف الثالث الثانوي', text: 'أسلوب الشرح ممتاز ومبسط جداً. فهمت حاجات كتير كنت مش فاهمها من المدرسة. شكراً يا أستاذ أحمد!', rating: 5 },
  { id: 2, name: 'يوسف محمود', grade: 'الصف الثاني الثانوي', text: 'الكورسات منظمة جداً والامتحانات بتساعدني أعرف مستوايا. المنصة دي غيرت مستوايا بجد.', rating: 5 },
  { id: 3, name: 'أحمد حسن', grade: 'الصف الثالث الثانوي', text: 'الملازم والفيديوهات على أعلى مستوى. المتابعة مع الأستاذ سهلة ومباشرة.', rating: 4 },
  { id: 4, name: 'كريم طارق', grade: 'الصف الثاني الثانوي', text: 'بجد أحسن منصة اتعلمت منها. الأسلوب بسيط والشرح واضح. ربنا يبارك فيك.', rating: 5 },
  { id: 5, name: 'حسين رمضان', grade: 'الصف الثالث الإعدادي', text: 'ابني اتحسن جداً بعد ما اشترك في الكورس. شكراً ليكم.', rating: 5 },
  { id: 6, name: 'علي سعيد', grade: 'الصف الأول الثانوي', text: 'أول مرة أحب الرياضيات! الأستاذ أحمد بيخلي المادة سهلة.', rating: 4 },
]

export const QUIZZES = [
  { id: 1, title: 'امتحان النهايات', courseId: 1, courseName: 'الرياضيات — 3 ثانوي', questionsCount: 10, duration: 30, date: '2026-05-15' },
  { id: 2, title: 'امتحان التفاضل', courseId: 1, courseName: 'الرياضيات — 3 ثانوي', questionsCount: 15, duration: 45, date: '2026-05-20' },
  { id: 3, title: 'امتحان الكهربية', courseId: 2, courseName: 'الفيزياء — 3 ثانوي', questionsCount: 12, duration: 35, date: '2026-05-18' },
  { id: 4, title: 'امتحان شامل ترم أول', courseId: 1, courseName: 'الرياضيات — 3 ثانوي', questionsCount: 30, duration: 90, date: '2026-06-01' },
  { id: 5, title: 'امتحان المصفوفات', courseId: 1, courseName: 'الرياضيات — 3 ثانوي', questionsCount: 8, duration: 20, date: '2026-05-25' },
]

export const QUIZ_QUESTIONS = [
  {
    id: 1, quizId: 1,
    question: 'ما قيمة نها (س → 2) للدالة د(س) = س² - 4 / س - 2 ؟',
    options: ['2', '4', '0', 'غير موجودة'],
    correctAnswer: 1,
  },
  {
    id: 2, quizId: 1,
    question: 'إذا كانت نها (س → ∞) للدالة د(س) = 3س + 1 / س - 2، فإن النهاية تساوي:',
    options: ['3', '1', '0', '∞'],
    correctAnswer: 0,
  },
  {
    id: 3, quizId: 1,
    question: 'الدالة د(س) = |س| تكون متصلة عند س = 0:',
    options: ['صح', 'خطأ', 'أحياناً', 'لا يمكن تحديد'],
    correctAnswer: 0,
  },
  {
    id: 4, quizId: 1,
    question: 'نها (س → 0) للدالة جا(س)/س تساوي:',
    options: ['0', '1', '∞', 'غير موجودة'],
    correctAnswer: 1,
  },
  {
    id: 5, quizId: 1,
    question: 'إذا كانت نها د(س) عند س → أ من اليمين ≠ نها د(س) من اليسار، فإن:',
    options: ['النهاية موجودة', 'النهاية غير موجودة', 'الدالة متصلة', 'الدالة قابلة للاشتقاق'],
    correctAnswer: 1,
  },
]

export const CODES = [
  { id: 1, code: 'IGT-2026-A7X9', courseId: 1, courseName: 'الرياضيات — 3 ثانوي', status: 'used', studentName: 'محمد أحمد', createdAt: '2026-03-01', usedAt: '2026-03-05' },
  { id: 2, code: 'IGT-2026-B3K2', courseId: 1, courseName: 'الرياضيات — 3 ثانوي', status: 'available', studentName: null, createdAt: '2026-04-01', usedAt: null },
  { id: 3, code: 'IGT-2026-C5M8', courseId: 2, courseName: 'الفيزياء — 3 ثانوي', status: 'used', studentName: 'أحمد حسن', createdAt: '2026-03-10', usedAt: '2026-03-12' },
  { id: 4, code: 'IGT-2026-D1P4', courseId: 2, courseName: 'الفيزياء — 3 ثانوي', status: 'available', studentName: null, createdAt: '2026-04-15', usedAt: null },
  { id: 5, code: 'IGT-2026-E9R6', courseId: 3, courseName: 'الكيمياء — 3 ثانوي', status: 'expired', studentName: null, createdAt: '2025-12-01', usedAt: null },
  { id: 6, code: 'IGT-2026-F2T1', courseId: 1, courseName: 'الرياضيات — 3 ثانوي', status: 'available', studentName: null, createdAt: '2026-04-20', usedAt: null },
  { id: 7, code: 'IGT-2026-G4V7', courseId: 4, courseName: 'الرياضيات — 2 ثانوي', status: 'used', studentName: 'كريم طارق', createdAt: '2026-02-15', usedAt: '2026-02-20' },
  { id: 8, code: 'IGT-2026-H8W3', courseId: 1, courseName: 'الرياضيات — 3 ثانوي', status: 'used', studentName: 'أنس محمد', createdAt: '2026-01-10', usedAt: '2026-01-15' },
]

export const NOTIFICATIONS = [
  { id: 1, text: 'تم إضافة درس جديد: التكامل المحدود', type: 'lesson', time: 'منذ ساعة' },
  { id: 2, text: 'نتيجة امتحان النهايات: 85%', type: 'result', time: 'منذ 3 ساعات' },
  { id: 3, text: 'تم تفعيل كود الشحن بنجاح', type: 'payment', time: 'أمس' },
  { id: 4, text: 'امتحان التفاضل يوم 20 مايو', type: 'quiz', time: 'منذ يومين' },
  { id: 5, text: 'مرحباً بك في منصة اجتهاد! 🎓', type: 'welcome', time: 'منذ أسبوع' },
]

export const PAYMENTS = [
  { id: 1, type: 'شحن رصيد', amount: 200, date: '2026-04-01', status: 'success', details: 'كود: IGT-2026-A7X9' },
  { id: 2, type: 'اشتراك كورس', amount: -200, date: '2026-04-01', status: 'success', details: 'الرياضيات — 3 ثانوي' },
  { id: 3, type: 'شحن رصيد', amount: 180, date: '2026-04-10', status: 'success', details: 'كود: IGT-2026-C5M8' },
  { id: 4, type: 'اشتراك كورس', amount: -180, date: '2026-04-10', status: 'success', details: 'الفيزياء — 3 ثانوي' },
]

/* ─── Current student data (for dashboard) ─── */
export const CURRENT_STUDENT = {
  id: 1,
  name: 'محمد أحمد',
  email: 'mohamed@email.com',
  phone: '01012345678',
  grade: '3rd-sec',
  governorate: 'القاهرة',
  balance: 0,
  enrolledCourses: [1, 2],
  avatar: null,
}

/* ─── Helper: get enrolled courses with progress ─── */
export function getEnrolledCourses() {
  return [
    { ...COURSES[0], progress: 45, lastLesson: 'نظريات النهايات' },
    { ...COURSES[1], progress: 20, lastLesson: 'التيار الكهربي' },
  ]
}

/* ─── Admin stats ─── */
export const ADMIN_STATS = {
  totalRevenue: 48500,
  newStudentsThisMonth: 32,
  activeCourses: 8,
  activatedCodes: 156,
  topCourses: [
    { name: 'الرياضيات — 3 ثانوي', students: 234, percentage: 100 },
    { name: 'الرياضيات — 3 إعدادي', students: 210, percentage: 90 },
    { name: 'الفيزياء — 3 ثانوي', students: 189, percentage: 81 },
    { name: 'الرياضيات — 2 ثانوي', students: 198, percentage: 85 },
    { name: 'الكيمياء — 3 ثانوي', students: 156, percentage: 67 },
  ],
}
