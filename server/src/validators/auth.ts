import Joi from 'joi'

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'بريد إلكتروني غير صالح',
    'any.required': 'البريد الإلكتروني مطلوب',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
    'any.required': 'كلمة المرور مطلوبة',
  }),
})

export const signupSchema = Joi.object({
  full_name: Joi.string().required().min(2).max(100),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().optional(),
  grade: Joi.string().optional(),
  governorate: Joi.string().optional(),
})

export const adminSignUpSchema = Joi.object({
  full_name: Joi.string().required().min(2).max(100),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  secret: Joi.string().required().min(1),
})
