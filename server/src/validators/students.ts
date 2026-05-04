/* ═══════════════════════════════════════════════════
   Joi Validators — Students & Enrollments
   ═══════════════════════════════════════════════════ */
import Joi from 'joi'

export const enrollSchema = Joi.object({
    course_id: Joi.number().integer().positive().required().messages({
        'number.base': 'معرف الكورس يجب أن يكون رقم',
        'any.required': 'معرف الكورس مطلوب',
    }),
    price: Joi.number().integer().min(0).default(0),
    duration_days: Joi.number().integer().positive().optional(),
})

export const redeemSchema = Joi.object({
    code: Joi.string().trim().min(3).max(50).required().messages({
        'string.min': 'الكود يجب أن يكون 3 أحرف على الأقل',
        'any.required': 'كود التفعيل مطلوب',
    }),
})

export const progressSchema = Joi.object({
    lesson_id: Joi.number().integer().positive().required().messages({
        'any.required': 'معرف الدرس مطلوب',
    }),
})

export const profileUpdateSchema = Joi.object({
    full_name: Joi.string().min(2).max(100).optional(),
    phone: Joi.string().pattern(/^[0-9+\-\s]{8,20}$/).optional().messages({
        'string.pattern.base': 'رقم الهاتف غير صالح',
    }),
    grade: Joi.string().optional(),
    governorate: Joi.string().optional(),
    avatar_url: Joi.string().uri().optional(),
}).min(1).messages({
    'object.min': 'يجب إرسال حقل واحد على الأقل للتحديث',
})

export const questionSchema = Joi.object({
    lesson_id: Joi.number().integer().positive().required(),
    question: Joi.string().trim().min(3).max(1000).required().messages({
        'string.min': 'السؤال يجب أن يكون 3 أحرف على الأقل',
        'any.required': 'نص السؤال مطلوب',
    }),
})

export const answerSchema = Joi.object({
    answer: Joi.string().trim().min(1).max(2000).required().messages({
        'any.required': 'نص الإجابة مطلوب',
    }),
})
