import { query } from '../../config/database';
import { User } from '../../types/user.types';

export class MessagesService {
    async getAllMessages(): Promise<Omit<User, 'password'>[]> {
        const result = await query(
            'SELECT id, username, email, role, created_at, updated_at FROM chatuser.users'
        );
        return result.rows;
    }
} 