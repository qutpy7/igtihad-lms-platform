/* ═══════════════════════════════════════════════════
   Joi Validators — Admin Routes
   ═══════════════════════════════════════════════════ */
import Joi from 'joi'

export const generateCodesSchema = Joi.object({
    course_id: Joi.number().integer().positive().required().messages({
        'any.required': 'معرّف الكورس مطلوب',
        'number.base': 'معرّف الكورس يجب أن يكون رقم',
    }),
    count: Joi.number().integer().min(1).max(500).default(10).messages({
        'number.min': 'العدد يجب أن يكون 1 على الأقل',
        'number.max': 'الحد الأقصى 500 كود',
    }),
})

export const sendNotificationSchema = Joi.object({
    course_id: Joi.alternatives().try(
        Joi.number().integer().positive(),
        Joi.string().valid('all')
    ).required().messages({
        'any.required': 'اختر الكورس أو "الكل"',
    }),
    type: Joi.string().trim().min(1).max(50).default('general'),
    text: Joi.string().trim().min(1).max(1000).required().messages({
        'any.required': 'نص الإشعار مطلوب',
        'string.min': 'نص الإشعار لا يمكن أن يكون فارغ',
    }),
})

export const createAdminSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'any.required': 'الإيميل مطلوب',
        'string.email': 'صيغة الإيميل غير صحيحة',
    }),
    password: Joi.string().min(6).required().messages({
        'any.required': 'كلمة المرور مطلوبة',
        'string.min': 'كلمة المرور يجب أن تكون 6 حروف على الأقل',
    }),
    full_name: Joi.string().trim().min(2).max(100).required().messages({
        'any.required': 'الاسم مطلوب',
    }),
})
