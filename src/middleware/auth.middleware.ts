import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const validateToken = (token: string, secret: string) => {
    if (!token) return false;
    jwt.verify(token, secret, (err, decoded) => {
        if (err) {
            return false;
        }
        return decoded;
    });
}


export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies['chat-auth-acs'];
    const validationAccess = validateToken(accessToken, process.env.ACCESS_TOKEN_SECRET!);

    if (validationAccess) {
        // @ts-ignore
        req.user = validationAccess;
        return next();
    }

    return res.status(401).json({ message: 'Unauthorized' });
};