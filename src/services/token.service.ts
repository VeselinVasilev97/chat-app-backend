import jwt from 'jsonwebtoken';
import { JwtPayload, Tokens } from '../types/auth.types';

export class TokenService {
    generateTokens(payload: Omit<JwtPayload, 'iat' | 'exp'>): Tokens {
        const accessToken = jwt.sign(
            payload,
            process.env.JWT_ACCESS_SECRET!,
            { expiresIn: '12h' }
        );

        return { accessToken };
    }


    
    verifyAccessToken(token: string): JwtPayload {
        return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload;
    }
} 