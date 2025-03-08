// For login requests
export interface LoginDto {
    email: string;
    password: string;
}

// For registration requests
export interface RegisterDto {
    username: string;
    email: string;
    password: string;
}

// JWT Token structure
export interface Tokens {
    accessToken: string;
    refreshToken: string;
}

// Auth response when login/register is successful
export interface AuthResponse {
    user: {
        id: string;
        username: string;
        email: string;
    };
    tokens: Tokens;
}

// For token payload (what goes inside JWT)
export interface JwtPayload {
    sub: string;      // user id
    email: string;
    username: string;
    role: string;        // add role for authorization
    iat?: number;     // issued at
    exp?: number;     // expiration time
}