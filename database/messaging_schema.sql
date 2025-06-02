-- Messaging System Database Schema
-- This schema supports conversation-based messaging with admin assignment

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- Create conversations table
CREATE TABLE conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'resolved')),
    subject VARCHAR(255),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    sender_type VARCHAR(10) NOT NULL CHECK (sender_type IN ('user', 'admin')),
    message_content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_is_read ON messages(is_read);

-- Create function to update conversation's last_message_at and handle reopening
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    -- Update last_message_at for all messages
    UPDATE conversations
    SET
        last_message_at = NEW.created_at,
        updated_at = NOW()
    WHERE id = NEW.conversation_id;

    -- If a user sends a message to a resolved conversation, reopen it
    IF NEW.sender_type = 'user' THEN
        UPDATE conversations
        SET status = 'pending',
            updated_at = NOW()
        WHERE id = NEW.conversation_id
        AND status = 'resolved';

        -- If conversation was reopened, insert a system message
        IF FOUND THEN
            INSERT INTO messages (
                conversation_id,
                sender_id,
                sender_type,
                message_content,
                message_type,
                created_at
            ) VALUES (
                NEW.conversation_id,
                NEW.sender_id,
                'system',
                'Conversation reopened by customer',
                'system',
                NEW.created_at + INTERVAL '1 second'
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update last_message_at
CREATE TRIGGER trigger_update_conversation_last_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER trigger_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations" ON conversations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all conversations" ON conversations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() 
            AND (role = 'super_admin' OR role = 'admin')
        )
    );

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE id = conversation_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all messages" ON messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() 
            AND (role = 'super_admin' OR role = 'admin')
        )
    );

CREATE POLICY "Users can insert messages in their conversations" ON messages
    FOR INSERT WITH CHECK (
        sender_type = 'user' 
        AND sender_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM conversations 
            WHERE id = conversation_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can insert messages in any conversation" ON messages
    FOR INSERT WITH CHECK (
        sender_type = 'admin' 
        AND EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() 
            AND (role = 'super_admin' OR role = 'admin')
        )
    );

-- Create view for conversation details with user info and message counts
CREATE OR REPLACE VIEW conversation_details AS
SELECT
    c.id,
    c.user_id,
    c.status,
    c.subject,
    c.last_message_at,
    c.created_at,
    c.updated_at,
    -- User information
    u.email as user_email,
    COALESCE(p.first_name, '') as user_first_name,
    COALESCE(p.last_name, '') as user_last_name,
    -- Message counts
    COALESCE(msg_counts.total_messages, 0) as total_messages,
    COALESCE(msg_counts.unread_messages, 0) as unread_messages,
    -- Last message info
    last_msg.message_content as last_message_content,
    last_msg.sender_type as last_message_sender_type,
    last_msg.created_at as last_message_created_at
FROM conversations c
LEFT JOIN auth.users u ON c.user_id = u.id
LEFT JOIN profiles p ON c.user_id = p.id
LEFT JOIN (
    SELECT
        conversation_id,
        COUNT(*) as total_messages,
        COUNT(CASE WHEN NOT is_read AND sender_type = 'user' THEN 1 END) as unread_messages
    FROM messages
    GROUP BY conversation_id
) msg_counts ON c.id = msg_counts.conversation_id
LEFT JOIN (
    SELECT DISTINCT ON (conversation_id)
        conversation_id,
        message_content,
        sender_type,
        created_at
    FROM messages
    ORDER BY conversation_id, created_at DESC
) last_msg ON c.id = last_msg.conversation_id;

-- Grant permissions
GRANT ALL ON conversations TO authenticated;
GRANT ALL ON messages TO authenticated;
GRANT SELECT ON conversation_details TO authenticated;

-- Insert sample data for testing
INSERT INTO conversations (user_id, status, subject) VALUES
    ((SELECT id FROM auth.users LIMIT 1), 'pending', 'Question about pet care'),
    ((SELECT id FROM auth.users LIMIT 1), 'pending', 'Urgent appointment request'),
    ((SELECT id FROM auth.users LIMIT 1), 'resolved', 'Product inquiry');

-- Migration: Update existing 'active' conversations to 'pending'
UPDATE conversations SET status = 'pending' WHERE status = 'active';

-- Insert sample messages
INSERT INTO messages (conversation_id, sender_id, sender_type, message_content) VALUES
    ((SELECT id FROM conversations LIMIT 1), (SELECT user_id FROM conversations LIMIT 1), 'user', 'Hello, I have a question about my pet''s diet.'),
    ((SELECT id FROM conversations LIMIT 1), (SELECT id FROM admin_users WHERE role = 'admin' LIMIT 1), 'admin', 'Hi! I''d be happy to help you with your pet''s diet. What specific questions do you have?');
