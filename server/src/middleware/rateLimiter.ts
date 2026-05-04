import rateLimit from 'express-rate-limit'

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'طلبات كثيرة جداً. حاول مرة أخرى لاحقاً' },
})

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, error: 'محاولات كثيرة جداً. انتظر 15 دقيقة وحاول مرة أخرى' },
})

export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, error: 'طلبات رفع كثيرة جداً' },
})
