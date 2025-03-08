import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { LoginDto, RegisterDto } from '../types/auth.types';

export class UserController {
    private authService: AuthService;
    private userService: UserService;

    constructor() {
        this.authService = new AuthService();
        this.userService = new UserService();
    }

    register = async (req: Request, res: Response) => {
        try {
            const userData: RegisterDto = req.body;
            const result = await this.authService.register(userData);
            res.status(201).json({
                success: true,
                data: result
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

    getAllUsers = async (req: Request, res: Response) => {
        try {
            const users = await this.userService.getAllUsers();
            res.status(200).json({
                success: true,
                data: users
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error: {
                    message: error.message
                }
            });
        }
    };
} 