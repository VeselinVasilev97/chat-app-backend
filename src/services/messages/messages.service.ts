import { query, withTransaction } from '../../config/database';
import { User } from '../../types/user.types';
import { Conversation, DirectMessage, MessageType } from '../../types/messages.types';
import { PoolClient } from 'pg'; // for client typing

export class MessagesService {
    async getAllMessages(sender_id:string,receiver_id:string): Promise<any> {
        let conversationId = await this._getExistingConversation(sender_id, receiver_id);
        console.log(conversationId);

        const result = await query(
            'SELECT content,content_type,sender_id FROM chatuser.messages where conversation_id = $1 and is_deleted = false ORDER BY sent_at DESC LIMIT 100',
            [conversationId]
        );
        console.log(result);

        if (result.rows.length === 0) {
            return [];
        }

        
        const messages = result.rows.map((row) => {
            return {
                content: row.content,
                content_type: row.content_type,
                sender_id: row.sender_id,
                receiver_id: sender_id === row.sender_id ? receiver_id : sender_id,
            };
        });

        return messages;
    }

    async saveMessage(
        senderId: string,
        receiverId: string,
        content: string,
        content_type: MessageType
    ): Promise<void | null> {
        const result = await withTransaction(async (client) => {
            let conversationId = await this._getExistingConversation(senderId, receiverId, client);

            if (!conversationId) {
                const conversationResult = await client.query(
                    'INSERT INTO chatuser.conversations DEFAULT VALUES RETURNING *'
                );
                conversationId = conversationResult.rows[0].conversation_id;

                await client.query(
                    'INSERT INTO chatuser.conversation_participants (conversation_id, user_id) VALUES ($1, $2)',
                    [conversationId, senderId]
                );
                await client.query(
                    'INSERT INTO chatuser.conversation_participants (conversation_id, user_id) VALUES ($1, $2)',
                    [conversationId, receiverId]
                );
            }

            await client.query(
                'INSERT INTO chatuser.messages (conversation_id, sender_id, content, content_type) VALUES ($1, $2, $3, $4)',
                [conversationId, senderId, content, content_type]
            );
        });

        return result;
    }

    // 🔒 Private helper to get existing conversation
    private async _getExistingConversation(
        userId1: string,
        userId2: string,
        client?: PoolClient
    ): Promise<string | null> {
        const sqlQuery = `SELECT cp.conversation_id
        FROM chatuser.conversation_participants cp
        WHERE cp.user_id IN ($1, $2)
        GROUP BY cp.conversation_id
        HAVING COUNT(*) = 2 AND COUNT(DISTINCT cp.user_id) = 2`;
        const sqlParams = [userId1, userId2];
        const result = client
            ? await client.query(
                sqlQuery,
                sqlParams
            )
            : await query(
                sqlQuery,
                sqlParams
            );

        return result.rows.length > 0 ? result.rows[0].conversation_id : null;
    }
}
