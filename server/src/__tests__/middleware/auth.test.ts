import { Request, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../../middleware/auth';
import { verifyToken } from '../../utils/jwt';

jest.mock('../../utils/jwt');

describe('Auth Middleware - authenticate', () => {
    let mockRequest: Partial<AuthRequest>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;

    beforeEach(() => {
        mockRequest = {
            headers: {},
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        nextFunction = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 401 if no authorization header is provided', () => {
        authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized: No token provided' });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if authorization header does not start with "Bearer "', () => {
        mockRequest.headers = { authorization: 'Basic some-token' };

        authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized: No token provided' });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid or expired', () => {
        mockRequest.headers = { authorization: 'Bearer invalid-token' };
        (verifyToken as jest.Mock).mockReturnValue(null);

        authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

        expect(verifyToken).toHaveBeenCalledWith('invalid-token');
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized: Invalid or expired token' });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if token decodes to a string', () => {
        mockRequest.headers = { authorization: 'Bearer some-token' };
        (verifyToken as jest.Mock).mockReturnValue('string-payload');

        authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

        expect(verifyToken).toHaveBeenCalledWith('some-token');
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized: Invalid or expired token' });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next and populate req.user if token is valid', () => {
        mockRequest.headers = { authorization: 'Bearer valid-token' };
        const decodedPayload = { id: '123', email: 'test@example.com', role: 'user' };
        (verifyToken as jest.Mock).mockReturnValue(decodedPayload);

        authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

        expect(verifyToken).toHaveBeenCalledWith('valid-token');
        expect(mockRequest.user).toEqual(decodedPayload);
        expect(nextFunction).toHaveBeenCalled();
        expect(mockResponse.status).not.toHaveBeenCalled();
        expect(mockResponse.json).not.toHaveBeenCalled();
    });
});
