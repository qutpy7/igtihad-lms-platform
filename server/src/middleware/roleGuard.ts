import { Response, NextFunction } from 'express'
import { getDb } from '../config/db'
import { AuthRequest } from './auth'

/**
 * 🔒 Security Fix: Rewritten to use SQLite (getDb) instead of supabaseAdmin.
 * The old version imported from '../config/supabase' which no longer exists.
 */

export const adminMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      return res.status(403).json({ error: 'ممنوع الوصول' })
    }

    const db = await getDb()
    const user = await db.get('SELECT role FROM users WHERE id = ?', [req.user.id])

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'مطلوب صلاحيات مدير' })
    }

    next()
  } catch (error) {
    console.error('adminMiddleware error:', error)
    return res.status(500).json({ error: 'خطأ في الخادم' })
  }
}

export const studentMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      return res.status(403).json({ error: 'ممنوع الوصول' })
    }

    const db = await getDb()
    const user = await db.get('SELECT role FROM users WHERE id = ?', [req.user.id])

    if (!user || user.role !== 'student') {
      return res.status(403).json({ error: 'هذا الإجراء للطلاب فقط' })
    }

    next()
  } catch (error) {
    console.error('studentMiddleware error:', error)
    return res.status(500).json({ error: 'خطأ في الخادم' })
  }
}
