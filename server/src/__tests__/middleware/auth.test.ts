import { Response, NextFunction } from 'express';
import { requireRole, AuthRequest } from '../../../src/middleware/auth';

describe('requireRole middleware', () => {
    let mockRequest: Partial<AuthRequest>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        mockNext = jest.fn();
    });

    it('should return 403 if req.user is undefined', () => {
        const middleware = requireRole('admin');
        middleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Forbidden: Insufficient permissions' });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 if req.user.role does not match the required role', () => {
        mockRequest = {
            user: {
                id: '1',
                email: 'test@example.com',
                role: 'student'
            }
        };

        const middleware = requireRole('admin');
        middleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Forbidden: Insufficient permissions' });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next if req.user.role matches the required role', () => {
        mockRequest = {
            user: {
                id: '1',
                email: 'test@example.com',
                role: 'admin'
            }
        };

        const middleware = requireRole('admin');
        middleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockResponse.status).not.toHaveBeenCalled();
        expect(mockResponse.json).not.toHaveBeenCalled();
    });
});
