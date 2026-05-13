import jwt from 'jsonwebtoken';
import { generateToken, verifyToken } from '../../../utils/jwt';

// We rely on the process.env.JWT_SECRET set by the test setup file.

describe('JWT Utils', () => {
    describe('generateToken', () => {
        it('should generate a valid JWT string containing the userId and role', () => {
            const userId = '123';
            const role = 'admin';
            const token = generateToken(userId, role);

            expect(typeof token).toBe('string');

            // Decode directly to verify contents without relying on verifyToken
            const decoded = jwt.decode(token) as jwt.JwtPayload;
            expect(decoded).not.toBeNull();
            expect(decoded.id).toBe(userId);
            expect(decoded.role).toBe(role);
            // It should have an exp field set (since expiresIn is 7d)
            expect(decoded.exp).toBeDefined();
        });
    });

    describe('verifyToken', () => {
        it('should return the decoded payload for a valid token', () => {
            const userId = '456';
            const role = 'user';
            const token = generateToken(userId, role);

            const result = verifyToken(token) as jwt.JwtPayload;
            expect(result).not.toBeNull();
            expect(result.id).toBe(userId);
            expect(result.role).toBe(role);
        });

        it('should return null for an invalid or malformed token', () => {
            const invalidToken = 'this.is.not.a.valid.token';
            const result = verifyToken(invalidToken);

            expect(result).toBeNull();
        });

        it('should return null for an expired token', () => {
            // Sign a token that expired 1 hour ago
            const expiredToken = jwt.sign(
                { id: '789', role: 'user' },
                process.env.JWT_SECRET as string,
                { expiresIn: '-1h' } // Negative time to make it already expired
            );

            const result = verifyToken(expiredToken);

            expect(result).toBeNull();
        });

        it('should return null for a token signed with a different secret', () => {
            const invalidSecretToken = jwt.sign(
                { id: '101', role: 'admin' },
                'wrong_secret_key'
            );

            const result = verifyToken(invalidSecretToken);

            expect(result).toBeNull();
        });
    });
});
