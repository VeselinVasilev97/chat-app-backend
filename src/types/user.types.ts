// src/types/user.types.ts

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

// Complete user model (for database)
export interface User {
  id: string;
  username: string;
  email: string;
  password: string;  // hashed password
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// User data without sensitive information (for responses)
export interface UserResponse {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}