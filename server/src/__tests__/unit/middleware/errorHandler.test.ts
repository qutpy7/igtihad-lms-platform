import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../../middleware/errorHandler';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    // Mock console.error to keep test output clean
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should handle ValidationError', () => {
    const error = {
      name: 'ValidationError',
      message: 'Validation failed',
    };

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(console.error).toHaveBeenCalledWith('Error:', error);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: 'Validation failed',
    });
  });

  it('should handle PGRST116 (Not Found)', () => {
    const error = {
      code: 'PGRST116',
    };

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(console.error).toHaveBeenCalledWith('Error:', error);
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: 'غير موجود',
    });
  });

  it('should handle insufficient balance error', () => {
    const error = {
      message: 'رصيدك غير كاف لإتمام هذه العملية',
    };

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(console.error).toHaveBeenCalledWith('Error:', error);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: error.message,
    });
  });

  it('should handle already subscribed error', () => {
    const error = {
      message: 'أنت مشترك بالفعل في هذه الدورة',
    };

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(console.error).toHaveBeenCalledWith('Error:', error);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: error.message,
    });
  });

  it('should handle unknown errors with 500 status', () => {
    const error = new Error('Some unexpected error');

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(console.error).toHaveBeenCalledWith('Error:', error);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: 'خطأ داخلي في الخادم',
    });
  });

  it('should handle errors without message property', () => {
    const error = { someOtherProp: 'value' };

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(console.error).toHaveBeenCalledWith('Error:', error);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: 'خطأ داخلي في الخادم',
    });
  });
});
