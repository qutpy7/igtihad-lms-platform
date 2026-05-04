import { Request, Response, NextFunction } from 'express'

export function success(res: Response, data: any, message?: string) {
  res.status(200).json({ success: true, data, message })
}

export function created(res: Response, data: any, message?: string) {
  res.status(201).json({ success: true, data, message })
}

export function badRequest(res: Response, message: string) {
  res.status(400).json({ success: false, error: message })
}

export function unauthorized(res: Response, message = 'غير مصرح') {
  res.status(401).json({ success: false, error: message })
}

export function forbidden(res: Response, message = 'ممنوع الوصول') {
  res.status(403).json({ success: false, error: message })
}

export function notFound(res: Response, message = 'غير موجود') {
  res.status(404).json({ success: false, error: message })
}

export function serverError(res: Response, message = 'خطأ في الخادم') {
  res.status(500).json({ success: false, error: message })
}

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
