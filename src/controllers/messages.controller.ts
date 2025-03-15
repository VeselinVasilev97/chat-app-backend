import { Request, Response } from 'express';
import { MessagesService } from '../services/messages/messages.service';

export class MessagesController {
    private MessagesService: MessagesService;

    constructor() {
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