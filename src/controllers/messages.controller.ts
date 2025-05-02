import { Request, Response } from 'express';
import { MessagesService } from '../services/messages/messages.service';

export class MessagesController {
    private MessagesService: MessagesService;

    constructor() {
        this.MessagesService = new MessagesService();
    }

    getMessages = async (req: Request, res: Response) => {
        try {
            const messages = await this.MessagesService.getAllMessages(req.params.senderId, req.params.receiverId);
            res.status(200).json(
                messages
            );
        } catch (error: any) {
            res.status(500).json([]);
        }
    };
} 