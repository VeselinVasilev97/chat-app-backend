import { query,withTransaction } from '../../config/database';
import { User } from '../../types/user.types';
import { Conversation, DirectMessage, MessageType } from '../../types/messages.types';
export class MessagesService {
    async getAllMessages(): Promise<Omit<User, 'password'>[]> {
        const result = await query(
            'SELECT id, username, email, role, created_at, updated_at FROM chatuser.users'
        );
        return result.rows;
    }

    async saveMessage(senderId:string,receiverId:string,content:string,content_type:MessageType): Promise<void | null> {
        const result = await withTransaction(async (client) => {
            const conversationResult = await client.query('INSERT INTO chatuser.conversations');
            const conversationId = conversationResult.rows[0].conversation_id;
            await client.query('INSERT INTO chatuser.conversations_participants (conversationId,user_id) VALUES($1)', [conversationId,[senderId,receiverId]]);
            await client.query('INSERT INTO chatuser.messages (conversation_id,sender_id,content,content_type) VALUES($1,$2,$3,$4)', [conversationId,senderId,content,content_type]);
        });
        return result;
    }
} 


