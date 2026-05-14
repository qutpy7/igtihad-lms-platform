import { Response, NextFunction } from 'express';
import { adminMiddleware, studentMiddleware } from '../../middleware/roleGuard';
import { AuthRequest } from '../../middleware/auth';
import { getDb } from '../../config/db';

jest.mock('../../config/db');

describe('roleGuard Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;
  let mockDb: any;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();
    mockDb = {
      get: jest.fn()
    };
    (getDb as jest.Mock).mockResolvedValue(mockDb);
  });

  describe('studentMiddleware', () => {
    it('should return 403 if req.user.id is missing', async () => {
      mockRequest = { user: undefined };

      await studentMiddleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'ممنوع الوصول' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 403 if user is not found in database', async () => {
      mockRequest = { user: { id: '123', email: 'test@test.com', role: 'student' } };
      mockDb.get.mockResolvedValue(null);

      await studentMiddleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockDb.get).toHaveBeenCalledWith('SELECT role FROM users WHERE id = ?', ['123']);
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'هذا الإجراء للطلاب فقط' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 403 if user role is not student', async () => {
      mockRequest = { user: { id: '123', email: 'test@test.com', role: 'student' } };
      mockDb.get.mockResolvedValue({ role: 'admin' });

      await studentMiddleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'هذا الإجراء للطلاب فقط' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next if user is a student', async () => {
      mockRequest = { user: { id: '123', email: 'test@test.com', role: 'student' } };
      mockDb.get.mockResolvedValue({ role: 'student' });

      await studentMiddleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should return 500 if database query throws an error', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockRequest = { user: { id: '123', email: 'test@test.com', role: 'student' } };
      mockDb.get.mockRejectedValue(new Error('DB Error'));

      await studentMiddleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(consoleSpy).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'خطأ في الخادم' });
      expect(nextFunction).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('adminMiddleware', () => {
    it('should return 403 if req.user.id is missing', async () => {
      mockRequest = { user: undefined };

      await adminMiddleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'ممنوع الوصول' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 403 if user is not found in database', async () => {
      mockRequest = { user: { id: '123', email: 'test@test.com', role: 'admin' } };
      mockDb.get.mockResolvedValue(null);

      await adminMiddleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockDb.get).toHaveBeenCalledWith('SELECT role FROM users WHERE id = ?', ['123']);
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'مطلوب صلاحيات مدير' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 403 if user role is not admin', async () => {
      mockRequest = { user: { id: '123', email: 'test@test.com', role: 'admin' } };
      mockDb.get.mockResolvedValue({ role: 'student' });

      await adminMiddleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'مطلوب صلاحيات مدير' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next if user is an admin', async () => {
      mockRequest = { user: { id: '123', email: 'test@test.com', role: 'admin' } };
      mockDb.get.mockResolvedValue({ role: 'admin' });

      await adminMiddleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should return 500 if database query throws an error', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockRequest = { user: { id: '123', email: 'test@test.com', role: 'admin' } };
      mockDb.get.mockRejectedValue(new Error('DB Error'));

      await adminMiddleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(consoleSpy).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'خطأ في الخادم' });
      expect(nextFunction).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
