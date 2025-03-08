// src/types/request.types.ts

import { User } from './user.types';

// Extend Express Request to include user
export interface AuthenticatedRequest extends Request {
  user?: User;
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