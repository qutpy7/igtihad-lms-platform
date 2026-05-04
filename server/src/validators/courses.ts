/* ═══════════════════════════════════════════════════
   Joi Validators — Courses, Units, Lessons
   ═══════════════════════════════════════════════════ */
import Joi from 'joi'

export const createCourseSchema = Joi.object({
    title: Joi.string().trim().min(2).max(200).required().messages({
        'any.required': 'عنوان الكورس مطلوب',
    }),
    description: Joi.string().max(5000).optional().allow(''),
    short_desc: Joi.string().max(500).optional().allow(''),
    grade: Joi.string().required().messages({
        'any.required': 'المرحلة الدراسية مطلوبة',
    }),
    term: Joi.string().valid('first', 'second').default('first'),
    price: Joi.number().integer().min(0).default(0),
    original_price: Joi.number().integer().min(0).default(0),
    color: Joi.string().optional(),
    thumbnail_url: Joi.string().optional().allow('', null),
    is_featured: Joi.boolean().default(false),
    is_active: Joi.boolean().default(true),
})

export const updateCourseSchema = Joi.object({
    title: Joi.string().trim().min(2).max(200).optional(),
    description: Joi.string().max(5000).optional().allow(''),
    short_desc: Joi.string().max(500).optional().allow(''),
    grade: Joi.string().optional(),
    term: Joi.string().valid('first', 'second').optional(),
    price: Joi.number().integer().min(0).optional(),
    original_price: Joi.number().integer().min(0).optional(),
    color: Joi.string().optional(),
    thumbnail_url: Joi.string().optional().allow('', null),
    is_featured: Joi.alternatives().try(Joi.boolean(), Joi.number().valid(0, 1)).optional(),
    is_active: Joi.alternatives().try(Joi.boolean(), Joi.number().valid(0, 1)).optional(),
}).min(1)

export const createUnitSchema = Joi.object({
    title: Joi.string().trim().min(1).max(200).required().messages({
        'any.required': 'عنوان الوحدة مطلوب',
    }),
    sort_order: Joi.number().integer().min(0).default(0),
    thumbnail_url: Joi.string().optional().allow('', null),
})

export const createLessonSchema = Joi.object({
    title: Joi.string().trim().min(1).max(200).required().messages({
        'any.required': 'عنوان الدرس مطلوب',
    }),
    type: Joi.string().valid('video', 'pdf', 'quiz').default('video'),
    content_url: Joi.string().optional().allow('', null),
    attachment_url: Joi.string().optional().allow('', null),
    content: Joi.string().optional().allow('', null),
    duration: Joi.string().optional().allow('', null),
    sort_order: Joi.number().integer().min(0).default(0),
    thumbnail_url: Joi.string().optional().allow('', null),
    allow_retake: Joi.alternatives().try(Joi.boolean(), Joi.number().valid(0, 1)).default(true),
})

export const reviewSchema = Joi.object({
    rating: Joi.number().integer().min(1).max(5).required().messages({
        'number.min': 'التقييم يجب أن يكون من 1 لـ 5',
        'number.max': 'التقييم يجب أن يكون من 1 لـ 5',
        'any.required': 'التقييم مطلوب',
    }),
    comment: Joi.string().max(2000).optional().allow(''),
})
