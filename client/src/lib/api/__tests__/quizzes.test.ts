import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchQuizResultDetails } from '../quizzes';
import { apiClient } from '../../api-client';

vi.mock('../../api-client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('fetchQuizResultDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return data when the request is successful', async () => {
    const mockData = { id: 1, score: 90 };
    (apiClient.get as any).mockResolvedValueOnce({ data: mockData });

    const result = await fetchQuizResultDetails('student-1', 1);

    expect(apiClient.get).toHaveBeenCalledWith('/quizzes/results/details/1');
    expect(result).toEqual(mockData);
  });

  it('should return null when the request fails with a 404 error', async () => {
    const mockError = {
      response: {
        status: 404,
      },
    };
    (apiClient.get as any).mockRejectedValueOnce(mockError);

    const result = await fetchQuizResultDetails('student-1', 1);

    expect(apiClient.get).toHaveBeenCalledWith('/quizzes/results/details/1');
    expect(result).toBeNull();
  });

  it('should throw the error when the request fails with a non-404 error', async () => {
    const mockError = {
      response: {
        status: 500,
      },
      message: 'Internal Server Error',
    };
    (apiClient.get as any).mockRejectedValueOnce(mockError);

    await expect(fetchQuizResultDetails('student-1', 1)).rejects.toEqual(mockError);
    expect(apiClient.get).toHaveBeenCalledWith('/quizzes/results/details/1');
  });

  it('should throw the error when the error has no response property', async () => {
    const mockError = new Error('Network Error');
    (apiClient.get as any).mockRejectedValueOnce(mockError);

    await expect(fetchQuizResultDetails('student-1', 1)).rejects.toThrow('Network Error');
    expect(apiClient.get).toHaveBeenCalledWith('/quizzes/results/details/1');
  });
});
