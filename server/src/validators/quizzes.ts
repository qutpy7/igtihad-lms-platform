/* ═══════════════════════════════════════════════════
   Joi Validators — Quizzes & Results
   ═══════════════════════════════════════════════════ */
import Joi from 'joi'

export const createQuizSchema = Joi.object({
    title: Joi.string().trim().min(2).max(200).required().messages({
        'any.required': 'عنوان الاختبار مطلوب',
    }),
    course_id: Joi.number().integer().positive().required().messages({
        'any.required': 'معرف الكورس مطلوب',
    }),
    duration: Joi.number().integer().min(1).max(300).default(30).messages({
        'number.max': 'مدة الاختبار لا يمكن أن تتجاوز 300 دقيقة',
    }),
    scheduled_date: Joi.string().optional().allow('', null),
    is_active: Joi.alternatives().try(Joi.boolean(), Joi.number().valid(0, 1)).default(true),
    allow_retake: Joi.alternatives().try(Joi.boolean(), Joi.number().valid(0, 1)).default(true),
})

export const createQuizQuestionSchema = Joi.object({
    question: Joi.string().trim().min(3).max(2000).required().messages({
        'any.required': 'نص السؤال مطلوب',
    }),
    options: Joi.array().items(Joi.string()).min(2).max(6).required().messages({
        'array.min': 'يجب إضافة خيارين على الأقل',
        'any.required': 'الخيارات مطلوبة',
    }),
    correct_answer: Joi.number().integer().min(0).default(0),
    sort_order: Joi.number().integer().min(0).default(0),
})

export const createLessonQuestionSchema = Joi.object({
    lesson_id: Joi.number().integer().positive().required(),
    question: Joi.string().trim().min(3).max(2000).required(),
    options: Joi.array().items(Joi.string()).min(2).max(6).required(),
    correct_answer: Joi.number().integer().min(0).default(0),
    sort_order: Joi.number().integer().min(0).default(0),
})

export const submitResultSchema = Joi.object({
    student_id: Joi.string().optional(), // Overridden by server with req.user.id
    lesson_id: Joi.number().integer().positive().optional().allow(null),
    quiz_id: Joi.number().integer().positive().optional().allow(null),
    score: Joi.number().integer().min(0).required().messages({
        'any.required': 'الدرجة مطلوبة',
    }),
    total: Joi.number().integer().min(1).required().messages({
        'any.required': 'الدرجة الكلية مطلوبة',
    }),
    answers: Joi.array().optional().default([]),
})
