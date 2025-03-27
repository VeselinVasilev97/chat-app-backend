import { query } from '../config/database';
import { User } from '../types/user.types';

interface FriendshipResponse {
  friendship_id: number;
  requester_email: string;
  recipient_email: string;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  created_at: Date;
  updated_at: Date;
}

export class UsersService {
  async sendFriendRequest(currentUserEmail: string, recipientEmail: string): Promise<FriendshipResponse> {
    try {
      if (currentUserEmail === recipientEmail) {
        throw new Error("Cannot send request to yourself");
      }

      return {
        friendship_id: 123123,
        requester_email: "dust9722@gmail.com",
        recipient_email: "test@test.com",
        status: "pending",
        created_at: new Date(),
        updated_at: new Date(),
      };
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  }
  async findUser(userId: string): Promise<User | null> {
    try {
      const result = await query(
        'SELECT user_id,username,email,profile_picture_url,status,last_active_at,created_at,updated_at FROM chatuser.users WHERE user_id = $1',
        [userId]
      );
      return result.rows.length ? result.rows[0] : null;
    } catch (error) {
      console.error('Error finding user:', error);
      throw error;
    }
  }
  async findMatchingUsers(searchTerm: string): Promise<User[]> {
    try {
      const result = await query(
        'SELECT user_id,username, email FROM chatuser.users WHERE LOWER(username) LIKE LOWER($1) OR LOWER(email) LIKE LOWER($2)',
        [`%${searchTerm}%`, `%${searchTerm}%`]
      );
      return result.rows;
    } catch (error) {
      console.error('Error finding matching users:', error);
      throw error;
    }
  }
  async getAllFriends(userId: string): Promise<User[]> {
    try {
      const sql = `
        SELECT u.user_id, u.username, u.email
        FROM chatuser.friendships f
        JOIN chatuser.users u 
          ON u.user_id = 
            CASE 
              WHEN f.user_id_1 = $1 THEN f.user_id_2 
              ELSE f.user_id_1 
            END
        WHERE (f.user_id_1 = $1 OR f.user_id_2 = $1)
        AND f.status = 'accepted'
      `;
  
      const result = await query(sql, [userId]);
      
      return result.rows;
    } catch (error) {
      console.error("Error fetching friends:", error);
      throw new Error("Failed to retrieve friends");
    }
  }
}


