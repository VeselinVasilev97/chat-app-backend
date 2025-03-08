// src/types/request.types.ts

import { Request } from 'express';
import { JwtPayload } from './auth.types';

// Extend Express Request to include user
export interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}

// Standard API response format
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
}