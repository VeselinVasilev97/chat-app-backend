import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginDto, RegisterDto } from '../types/auth.types';

export class UserController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    register = async (req: Request, res: Response) => {
        try {
            const userData: RegisterDto = req.body;
            const result = await this.authService.register(userData);
            res.cookie('chat-auth-acs', result.tokens.accessToken);
            res.cookie('chat-auth-ref', result.tokens.refreshToken);
            res.status(302).json({
                success: true,
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                error: {
                    message: error.message
                }
            });
        }
    };

    login = async (req: Request, res: Response) => {
        try {
            const loginData: LoginDto = req.body;
            const result = await this.authService.login(loginData);
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error: any) {
            res.status(401).json({
                success: false,
                error: {
                    message: error.message
                }
            });
        }
    };
} 