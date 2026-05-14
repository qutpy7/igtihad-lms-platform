import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { validate } from '../../middleware/validate';

describe('validate middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();
  });

  const dummySchema = Joi.object({
    name: Joi.string().required(),
    age: Joi.number().min(18).required()
  });

  it('should call next() when validation succeeds', () => {
    mockRequest.body = {
      name: 'John Doe',
      age: 30
    };

    const middleware = validate(dummySchema);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  it('should call next() even if there are unknown fields (stripUnknown is true)', () => {
    mockRequest.body = {
      name: 'John Doe',
      age: 30,
      unknownField: 'test'
    };

    const middleware = validate(dummySchema);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should return badRequest (400) when validation fails', () => {
    mockRequest.body = {
      name: 'John Doe',
      age: 15 // age must be >= 18
    };

    const middleware = validate(dummySchema);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: expect.stringContaining('"age" must be greater than or equal to 18')
    });
  });

  it('should join multiple error messages when abortEarly is false', () => {
    mockRequest.body = {
      // missing name
      age: 15 // invalid age
    };

    const middleware = validate(dummySchema);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);

    // error message should contain both errors joined by ' - '
    const mockJsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
    expect(mockJsonCall.success).toBe(false);
    expect(mockJsonCall.error).toContain('"name" is required');
    expect(mockJsonCall.error).toContain('"age" must be greater than or equal to 18');
    expect(mockJsonCall.error).toContain(' - ');
  });
});
