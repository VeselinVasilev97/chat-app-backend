import bcrypt from 'bcrypt';
import { query } from '@/config/database';
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
            'INSERT INTO chatuser.users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id, username, email',
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

        const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);
        
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        const tokens = this.tokenService.generateTokens({
            sub: user.id,
            email: user.email,
            username: user.username,
            role: user.role
        });

        delete user.password_hash;
        delete user.last_active_at;
        delete user.created_at;
        delete user.updated_at;

        return { user, tokens };
    }
} 