import jwt from 'jsonwebtoken';
import { config } from '../config/jwt.config';
import { JwtPayload, Tokens } from '../types/auth.types';

export class TokenService {
    generateTokens(payload: JwtPayload): Tokens {
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




        return {
            accessToken,
            refreshToken
        };
    }
    verifyAccessToken(token: string): JwtPayload {
        return jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
      }
    
      verifyRefreshToken(token: string): JwtPayload {
        return jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
      }
}

