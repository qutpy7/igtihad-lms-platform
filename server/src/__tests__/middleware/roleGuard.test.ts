import { Request, Response, NextFunction } from 'express';
import { adminMiddleware } from '../../../src/middleware/roleGuard';
import { getDb } from '../../../src/config/db';
import { AuthRequest } from '../../../src/middleware/auth';

jest.mock('../../../src/config/db');

describe('roleGuard Middleware - adminMiddleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  it('should return 403 if req.user is undefined', async () => {
    await adminMiddleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'ممنوع الوصول' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 403 if req.user.id is undefined', async () => {
    mockRequest = {
      user: {
        role: 'admin',
        email: 'test@example.com'
      } as any
    };

    await adminMiddleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'ممنوع الوصول' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 403 if user is not found in the database', async () => {
    mockRequest = {
      user: {
        id: '1',
        role: 'admin',
        email: 'test@example.com'
      }
    };
    const mockDb = {
      get: jest.fn().mockResolvedValue(null)
    };
    (getDb as jest.Mock).mockResolvedValue(mockDb);

    await adminMiddleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

    expect(mockDb.get).toHaveBeenCalledWith('SELECT role FROM users WHERE id = ?', ['1']);
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'مطلوب صلاحيات مدير' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 403 if user role is not admin', async () => {
    mockRequest = {
      user: {
        id: '1',
        role: 'student',
        email: 'test@example.com'
      }
    };
    const mockDb = {
      get: jest.fn().mockResolvedValue({ role: 'student' })
    };
    (getDb as jest.Mock).mockResolvedValue(mockDb);

    await adminMiddleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

    expect(mockDb.get).toHaveBeenCalledWith('SELECT role FROM users WHERE id = ?', ['1']);
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'مطلوب صلاحيات مدير' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should call next if user is found and role is admin', async () => {
    mockRequest = {
      user: {
        id: '1',
        role: 'admin',
        email: 'test@example.com'
      }
    };
    const mockDb = {
      get: jest.fn().mockResolvedValue({ role: 'admin' })
    };
    (getDb as jest.Mock).mockResolvedValue(mockDb);

    await adminMiddleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

    expect(mockDb.get).toHaveBeenCalledWith('SELECT role FROM users WHERE id = ?', ['1']);
    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  it('should return 500 if an error occurs', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockRequest = {
      user: {
        id: '1',
        role: 'admin',
        email: 'test@example.com'
      }
    };
    const mockDb = {
      get: jest.fn().mockRejectedValue(new Error('Database error'))
    };
    (getDb as jest.Mock).mockResolvedValue(mockDb);

    await adminMiddleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

    expect(mockDb.get).toHaveBeenCalledWith('SELECT role FROM users WHERE id = ?', ['1']);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'خطأ في الخادم' });
    expect(nextFunction).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
