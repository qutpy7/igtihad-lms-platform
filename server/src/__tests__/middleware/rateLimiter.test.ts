import express from 'express';
import request from 'supertest';
import { globalLimiter, loginLimiter, uploadLimiter } from '../../middleware/rateLimiter';

describe('Rate Limiter Middleware', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    // Setup routes with specific limiters
    app.get('/global', globalLimiter, (req, res) => {
      res.status(200).send('OK');
    });

    app.post('/login', loginLimiter, (req, res) => {
      res.status(200).send('OK');
    });

    app.post('/upload', uploadLimiter, (req, res) => {
      res.status(200).send('OK');
    });
  });

  describe('globalLimiter', () => {
    it('should allow requests below the limit', async () => {
      const res = await request(app).get('/global');
      expect(res.status).toBe(200);
    });

    it('should block requests above the limit (100 requests)', async () => {
      // Send 100 requests (which should succeed)
      for (let i = 0; i < 100; i++) {
        await request(app).get('/global');
      }

      // The 101st request should be blocked
      const res = await request(app).get('/global');
      expect(res.status).toBe(429);
      expect(res.body).toEqual({ success: false, error: 'طلبات كثيرة جداً. حاول مرة أخرى لاحقاً' });
    });
  });

  describe('loginLimiter', () => {
    it('should allow requests below the limit', async () => {
      const res = await request(app).post('/login');
      expect(res.status).toBe(200);
    });

    it('should block requests above the limit (5 requests)', async () => {
      // Send 5 requests (which should succeed)
      for (let i = 0; i < 5; i++) {
        await request(app).post('/login');
      }

      // The 6th request should be blocked
      const res = await request(app).post('/login');
      expect(res.status).toBe(429);
      expect(res.body).toEqual({ success: false, error: 'محاولات كثيرة جداً. انتظر 15 دقيقة وحاول مرة أخرى' });
    });
  });

  describe('uploadLimiter', () => {
    it('should allow requests below the limit', async () => {
      const res = await request(app).post('/upload');
      expect(res.status).toBe(200);
    });

    it('should block requests above the limit (10 requests)', async () => {
      // Send 10 requests (which should succeed)
      for (let i = 0; i < 10; i++) {
        await request(app).post('/upload');
      }

      // The 11th request should be blocked
      const res = await request(app).post('/upload');
      expect(res.status).toBe(429);
      expect(res.body).toEqual({ success: false, error: 'طلبات رفع كثيرة جداً' });
    });
  });
});
