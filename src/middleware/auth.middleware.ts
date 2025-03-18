import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const validateToken = (token: string, secret: string) => {
    if (!token) return false;

    try {
        return jwt.verify(token, secret); // Returns decoded payload if valid
    } catch (err) {
        return false; // Invalid token
    }
};


export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authCookie = req.cookies['chat-auth-cookie'];
    const validationAccess = validateToken(authCookie, process.env.JWT_ACCESS_SECRET!);

    if (validationAccess) {
        // @ts-ignore
        req.user = validationAccess;
        return next();
    }

    return res.status(401).json({ message: 'Unauthorized' });
};

