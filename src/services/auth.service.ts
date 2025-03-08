import bcrypt from 'bcrypt';
import { query } from '../config/database';
import { LoginDto, RegisterDto, AuthResponse } from '../types/auth.types';
import { TokenService } from './token.service';

export class AuthService {
    private tokenService: TokenService;

    constructor() {
        this.tokenService = new TokenService();
    }

    async register(dto: RegisterDto): Promise<AuthResponse> {
        const existingUser = await query('SELECT * FROM chatuser.users WHERE email = $1', [dto.email]);
        if (existingUser.rows.length) {
            throw new Error('User already exists');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const result = await query(
            'INSERT INTO chatuser.users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
            [dto.username, dto.email, hashedPassword]
        );
        const user = result.rows[0];
        const tokens = this.tokenService.generateTokens({
            sub: user.id,
            email: user.email,
            username: user.username,
            role: 'user'
        });
        return { user, tokens };
    }

    async login(dto: LoginDto): Promise<AuthResponse> {
        const result = await query('SELECT * FROM chatuser.users WHERE email = $1', [dto.email]);
        const user = result.rows[0];

        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        const tokens = this.tokenService.generateTokens({
            sub: user.id,
            email: user.email,
            username: user.username,
            role: user.role
        });

        // Remove password from response
        delete user.password;

        return { user, tokens };
    }
} 