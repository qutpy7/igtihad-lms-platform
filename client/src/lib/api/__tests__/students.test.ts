import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkEnrollment } from '../students';
import { apiClient } from '../../api-client';

// Mock the api-client module
vi.mock('../../api-client', () => ({
  apiClient: {
    get: vi.fn()
  }
}));

describe('students api - checkEnrollment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return enrollment status true if student is enrolled', async () => {
    const mockResponse = { data: { enrolled: true } };
    (apiClient.get as any).mockResolvedValueOnce(mockResponse);

    const studentId = 'user123';
    const courseId = 42;

    const result = await checkEnrollment(studentId, courseId);

    expect(apiClient.get).toHaveBeenCalledWith(`/students/${studentId}/enrollments/${courseId}/check`);
    expect(result).toEqual({ enrolled: true });
  });

  it('should return enrollment status false if student is not enrolled', async () => {
    const mockResponse = { data: { enrolled: false } };
    (apiClient.get as any).mockResolvedValueOnce(mockResponse);

    const studentId = 'user456';
    const courseId = 99;

    const result = await checkEnrollment(studentId, courseId);

    expect(apiClient.get).toHaveBeenCalledWith(`/students/${studentId}/enrollments/${courseId}/check`);
    expect(result).toEqual({ enrolled: false });
  });

  it('should handle API errors appropriately', async () => {
    const error = new Error('API Error');
    (apiClient.get as any).mockRejectedValueOnce(error);

    const studentId = 'user789';
    const courseId = 101;

    await expect(checkEnrollment(studentId, courseId)).rejects.toThrow('API Error');
    expect(apiClient.get).toHaveBeenCalledWith(`/students/${studentId}/enrollments/${courseId}/check`);
  });
});
