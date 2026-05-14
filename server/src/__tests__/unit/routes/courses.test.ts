import request from 'supertest';
import express from 'express';
import { getDb } from '../../../config/db';
import coursesRouter from '../../../routes/courses';

jest.mock('../../../config/db', () => ({
    getDb: jest.fn()
}));

// Mock the SSE module to prevent open handles from setInterval
jest.mock('../../../utils/sse', () => ({
    sseMiddleware: jest.fn((req, res, next) => next()),
    notifyClients: jest.fn()
}));

const app = express();
app.use(express.json());
app.use('/api/courses', coursesRouter);

describe('Courses Routes Error Handling', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('GET /api/courses should return 500 when database throws an error', async () => {
        // Mock getDb to return an object where the `all` method throws an error
        const mockError = new Error('Database connection failed');
        (getDb as jest.Mock).mockResolvedValue({
            all: jest.fn().mockRejectedValue(mockError)
        });

        // Suppress console.error for this expected error
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        const response = await request(app).get('/api/courses');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Server error' });
        expect(consoleSpy).toHaveBeenCalledWith('fetchCourses error:', mockError);

        consoleSpy.mockRestore();
    });

    it('GET /api/courses/:id should return 500 when database throws an error', async () => {
        const mockError = new Error('Database error');
        (getDb as jest.Mock).mockResolvedValue({
            get: jest.fn().mockRejectedValue(mockError)
        });

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        const response = await request(app).get('/api/courses/123');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Server error' });
        expect(consoleSpy).toHaveBeenCalledWith('fetchCourseById error:', mockError);

        consoleSpy.mockRestore();
    });
});
