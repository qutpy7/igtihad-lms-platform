import jwt from 'jsonwebtoken';

// 🔒 Security: No fallback — server MUST have JWT_SECRET configured
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('❌ JWT_SECRET is not set in .env — server cannot start without it!');
}

export const generateToken = (userId: string, role: string) => {
    return jwt.sign({ id: userId, role }, JWT_SECRET, {
        expiresIn: '7d', // Token valid for 7 days
    });
};

export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};
