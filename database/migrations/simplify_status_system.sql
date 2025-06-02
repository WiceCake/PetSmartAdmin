-- Migration: Simplify Status System to Two States (Pending/Resolved)
-- This migration updates the messaging system to use only 'pending' and 'resolved' statuses
-- and implements automatic conversation reopening when users message resolved conversations

-- Step 1: Update existing 'active' conversations to 'pending'
UPDATE conversations SET status = 'pending' WHERE status = 'active';

-- Step 2: Drop and recreate the status constraint to only allow 'pending' and 'resolved'
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_status_check;
ALTER TABLE conversations ADD CONSTRAINT conversations_status_check 
    CHECK (status IN ('pending', 'resolved'));

-- Step 3: Update the default status to 'pending'
ALTER TABLE conversations ALTER COLUMN status SET DEFAULT 'pending';

-- Step 4: Remove assignment and priority columns if they exist
ALTER TABLE conversations DROP COLUMN IF EXISTS assigned_admin_id;
ALTER TABLE conversations DROP COLUMN IF EXISTS priority;

-- Step 5: Drop related indexes if they exist
DROP INDEX IF EXISTS idx_conversations_assigned_admin_id;

-- Step 6: Update the conversation_details view to remove assignment and priority fields
DROP VIEW IF EXISTS conversation_details;

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

-- Step 7: Update the trigger function to handle conversation reopening
DROP TRIGGER IF EXISTS trigger_update_conversation_last_message ON messages;
DROP FUNCTION IF EXISTS update_conversation_last_message();

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

-- Recreate the trigger
CREATE TRIGGER trigger_update_conversation_last_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();

-- Step 8: Grant permissions on the updated view
GRANT SELECT ON conversation_details TO authenticated;

-- Step 9: Verify the migration
-- Check that all conversations now have valid statuses
DO $$
DECLARE
    invalid_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO invalid_count 
    FROM conversations 
    WHERE status NOT IN ('pending', 'resolved');
    
    IF invalid_count > 0 THEN
        RAISE EXCEPTION 'Migration failed: % conversations have invalid status', invalid_count;
    END IF;
    
    RAISE NOTICE 'Migration completed successfully. All conversations have valid status.';
END $$;
