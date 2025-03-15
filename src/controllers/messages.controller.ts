import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { MessagesService } from '../services/messages/messages.service';

export class MessagesController {
    private authService: AuthService;
    private MessagesService: MessagesService;

    constructor() {
        this.authService = new AuthService();
        this.MessagesService = new MessagesService();
    }

    getMessages = async (req: Request, res: Response) => {
        try {
            const users = await this.MessagesService.getAllMessages();
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