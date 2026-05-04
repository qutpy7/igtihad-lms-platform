import { Request, Response, NextFunction } from 'express'

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err)

  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, error: err.message })
  }

  if (err.code === 'PGRST116') {
    return res.status(404).json({ success: false, error: 'غير موجود' })
  }

  if (err.message?.includes('رصيدك غير كاف')) {
    return res.status(400).json({ success: false, error: err.message })
  }

  if (err.message?.includes('مشترك بالفعل')) {
    return res.status(400).json({ success: false, error: err.message })
  }

  res.status(500).json({ success: false, error: 'خطأ داخلي في الخادم' })
}
