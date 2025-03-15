-- First create the schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS chatuser;

-- Enable UUID extension directly in the chatuser schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA chatuser;

-- Users Table
CREATE TABLE chatuser.users (
    user_id UUID PRIMARY KEY DEFAULT chatuser.uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_picture_url TEXT,
    status VARCHAR(20) DEFAULT 'offline',
    last_active_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Conversations Table
CREATE TABLE chatuser.conversations (
    conversation_id UUID PRIMARY KEY DEFAULT chatuser.uuid_generate_v4(),
    title VARCHAR(100),
    type VARCHAR(20) NOT NULL CHECK (type IN ('direct', 'group')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Messages Table
CREATE TABLE chatuser.messages (
    message_id UUID PRIMARY KEY DEFAULT chatuser.uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES chatuser.conversations(conversation_id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES chatuser.users(user_id) ON DELETE SET NULL,
    content TEXT,
    content_type VARCHAR(20) DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'video', 'file', 'audio')),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT message_has_content CHECK (content IS NOT NULL OR is_deleted = TRUE)
);

-- Conversation Participants Junction Table
CREATE TABLE chatuser.conversation_participants (
    conversation_id UUID REFERENCES chatuser.conversations(conversation_id) ON DELETE CASCADE,
    user_id UUID REFERENCES chatuser.users(user_id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_read_message_id UUID REFERENCES chatuser.messages(message_id) ON DELETE SET NULL,
    PRIMARY KEY (conversation_id, user_id)
);

-- Message Reactions Table
CREATE TABLE chatuser.message_reactions (
    reaction_id UUID PRIMARY KEY DEFAULT chatuser.uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES chatuser.messages(message_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES chatuser.users(user_id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (message_id, user_id, reaction_type)
);

-- Attachments Table
CREATE TABLE chatuser.attachments (
    attachment_id UUID PRIMARY KEY DEFAULT chatuser.uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES chatuser.messages(message_id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Contacts Table
CREATE TABLE chatuser.user_contacts (
    user_id UUID REFERENCES chatuser.users(user_id) ON DELETE CASCADE,
    contact_id UUID REFERENCES chatuser.users(user_id) ON DELETE CASCADE,
    nickname VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, contact_id),
    CHECK (user_id != contact_id)
);

-- User Blocks Table
CREATE TABLE chatuser.user_blocks (
    user_id UUID REFERENCES chatuser.users(user_id) ON DELETE CASCADE,
    blocked_user_id UUID REFERENCES chatuser.users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, blocked_user_id),
    CHECK (user_id != blocked_user_id)
);

-- Read Receipts Table
CREATE TABLE chatuser.read_receipts (
    receipt_id UUID PRIMARY KEY DEFAULT chatuser.uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES chatuser.messages(message_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES chatuser.users(user_id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (message_id, user_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_messages_conversation_id ON chatuser.messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON chatuser.messages(sender_id);
CREATE INDEX idx_messages_sent_at ON chatuser.messages(sent_at);
CREATE INDEX idx_conversation_participants_user_id ON chatuser.conversation_participants(user_id);
CREATE INDEX idx_message_reactions_message_id ON chatuser.message_reactions(message_id);
CREATE INDEX idx_message_reactions_user_id ON chatuser.message_reactions(user_id);
CREATE INDEX idx_read_receipts_message_id ON chatuser.read_receipts(message_id);
CREATE INDEX idx_read_receipts_user_id ON chatuser.read_receipts(user_id);

-- Add trigger function to update the updated_at column
CREATE OR REPLACE FUNCTION chatuser.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create triggers for tables with updated_at
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON chatuser.users
FOR EACH ROW EXECUTE FUNCTION chatuser.update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON chatuser.conversations
FOR EACH ROW EXECUTE FUNCTION chatuser.update_updated_at_column();