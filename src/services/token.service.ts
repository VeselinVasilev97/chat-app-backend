import jwt from 'jsonwebtoken';
import { JwtPayload, Tokens } from '../types/auth.types';

export class TokenService {
    generateTokens(payload: Omit<JwtPayload, 'iat' | 'exp'>): Tokens {
        const accessToken = jwt.sign(
            payload,
            process.env.JWT_ACCESS_SECRET!,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            payload,
            process.env.JWT_REFRESH_SECRET!,
            { expiresIn: '7d' }
        );

        return { accessToken, refreshToken };
    }

    verifyAccessToken(token: string): JwtPayload {
        return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload;
    }

    verifyRefreshToken(token: string): JwtPayload {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JwtPayload;
    }
} 