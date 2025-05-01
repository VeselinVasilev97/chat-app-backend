import { User } from "./user.types";

type ConversationType = 'direct' | 'group';
export type Conversation = {
    conversation_id?: string;
    type: ConversationType;
    title?: string; // Only for group conversations
    participants: User["user_id"][]; // Array of user IDs
    created_at?: string;
    updated_at?: string;
}



export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'file';
type MessageStatus = 'sent' | 'delivered' | 'read';
export type DirectMessage = {
    id: string;
    sender_id: string;
    receiver_id: string;
    text: string;
    type: MessageType;
    status: MessageStatus;
    created_at: string;
}