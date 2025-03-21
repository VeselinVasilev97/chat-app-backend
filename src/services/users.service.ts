import { query } from '../config/database';
import { User } from '../types/user.types';

export class UsersService {
    async getUserByEmail(email: string): Promise<Omit<User, 'password'>[]> {
        const result = await query(
            'SELECT user_id, username, email, created_at, updated_at FROM chatuser.users WHERE email = $1',
            [email]
        );
        return result.rows;
    }
} 

