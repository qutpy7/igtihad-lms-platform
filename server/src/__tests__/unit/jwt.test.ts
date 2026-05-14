import jwt from 'jsonwebtoken';
import { generateToken, verifyToken } from '../../utils/jwt';

describe('JWT Utils', () => {
    const userId = '12345';
    const role = 'admin';

    describe('generateToken', () => {
        it('should generate a valid JWT token', () => {
            const token = generateToken(userId, role);

            expect(typeof token).toBe('string');
            expect(token.length).toBeGreaterThan(0);

            // Verify the token manually with jsonwebtoken to ensure it was signed correctly
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

            expect(decoded.id).toBe(userId);
            expect(decoded.role).toBe(role);
            expect(decoded.exp).toBeDefined();
            expect(decoded.iat).toBeDefined();
        });
    });

    describe('verifyToken', () => {
        it('should successfully verify a valid token', () => {
            const token = generateToken(userId, role);
            const decoded = verifyToken(token) as any;

            expect(decoded).not.toBeNull();
            expect(decoded.id).toBe(userId);
            expect(decoded.role).toBe(role);
        });

        it('should return null for an invalid token', () => {
            const result = verifyToken('invalid-token');
            expect(result).toBeNull();
        });

        it('should return null for an empty token string', () => {
            const result = verifyToken('');
            expect(result).toBeNull();
        });
    });
});
