-- Test Script: Conversation Reopening Mechanism
-- This script tests the automatic conversation reopening when users send messages to resolved conversations

-- Setup test data
DO $$
DECLARE
    test_user_id UUID;
    test_admin_id UUID;
    test_conversation_id UUID;
    message_count_before INTEGER;
    message_count_after INTEGER;
    conversation_status VARCHAR(20);
BEGIN
    -- Get or create test user
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    IF test_user_id IS NULL THEN
        RAISE EXCEPTION 'No users found in auth.users table. Please create a test user first.';
    END IF;
    
    -- Get or create test admin
    SELECT id INTO test_admin_id FROM admin_users WHERE role IN ('admin', 'super_admin') LIMIT 1;
    IF test_admin_id IS NULL THEN
        RAISE EXCEPTION 'No admin users found. Please create a test admin user first.';
    END IF;
    
    RAISE NOTICE 'Using test user: % and admin: %', test_user_id, test_admin_id;
    
    -- Test 1: Create a new conversation (should default to 'pending')
    INSERT INTO conversations (user_id, subject) 
    VALUES (test_user_id, 'Test conversation for reopening mechanism')
    RETURNING id INTO test_conversation_id;
    
    SELECT status INTO conversation_status FROM conversations WHERE id = test_conversation_id;
    IF conversation_status != 'pending' THEN
        RAISE EXCEPTION 'Test 1 FAILED: New conversation status is % instead of pending', conversation_status;
    END IF;
    RAISE NOTICE 'Test 1 PASSED: New conversation created with pending status';
    
    -- Test 2: Add initial user message
    INSERT INTO messages (conversation_id, sender_id, sender_type, message_content)
    VALUES (test_conversation_id, test_user_id, 'user', 'Hello, I need help with my pet');
    
    SELECT status INTO conversation_status FROM conversations WHERE id = test_conversation_id;
    IF conversation_status != 'pending' THEN
        RAISE EXCEPTION 'Test 2 FAILED: Conversation status changed unexpectedly to %', conversation_status;
    END IF;
    RAISE NOTICE 'Test 2 PASSED: User message added, conversation remains pending';
    
    -- Test 3: Admin responds
    INSERT INTO messages (conversation_id, sender_id, sender_type, message_content)
    VALUES (test_conversation_id, test_admin_id, 'admin', 'Hi! I would be happy to help you.');
    
    SELECT status INTO conversation_status FROM conversations WHERE id = test_conversation_id;
    IF conversation_status != 'pending' THEN
        RAISE EXCEPTION 'Test 3 FAILED: Conversation status changed unexpectedly to %', conversation_status;
    END IF;
    RAISE NOTICE 'Test 3 PASSED: Admin message added, conversation remains pending';
    
    -- Test 4: Mark conversation as resolved
    UPDATE conversations SET status = 'resolved' WHERE id = test_conversation_id;
    
    SELECT status INTO conversation_status FROM conversations WHERE id = test_conversation_id;
    IF conversation_status != 'resolved' THEN
        RAISE EXCEPTION 'Test 4 FAILED: Could not mark conversation as resolved';
    END IF;
    RAISE NOTICE 'Test 4 PASSED: Conversation marked as resolved';
    
    -- Test 5: Count messages before reopening
    SELECT COUNT(*) INTO message_count_before FROM messages WHERE conversation_id = test_conversation_id;
    
    -- Test 6: User sends message to resolved conversation (should trigger reopening)
    INSERT INTO messages (conversation_id, sender_id, sender_type, message_content)
    VALUES (test_conversation_id, test_user_id, 'user', 'I have another question about the same topic');
    
    -- Check if conversation was reopened
    SELECT status INTO conversation_status FROM conversations WHERE id = test_conversation_id;
    IF conversation_status != 'pending' THEN
        RAISE EXCEPTION 'Test 6 FAILED: Conversation was not reopened. Status is %', conversation_status;
    END IF;
    RAISE NOTICE 'Test 6 PASSED: Conversation automatically reopened to pending status';
    
    -- Test 7: Check if system message was added
    SELECT COUNT(*) INTO message_count_after FROM messages WHERE conversation_id = test_conversation_id;
    IF message_count_after != message_count_before + 2 THEN -- +1 for user message, +1 for system message
        RAISE EXCEPTION 'Test 7 FAILED: Expected % messages, found %', message_count_before + 2, message_count_after;
    END IF;
    
    -- Verify system message exists
    IF NOT EXISTS (
        SELECT 1 FROM messages 
        WHERE conversation_id = test_conversation_id 
        AND sender_type = 'system' 
        AND message_content = 'Conversation reopened by customer'
    ) THEN
        RAISE EXCEPTION 'Test 7 FAILED: System message for reopening not found';
    END IF;
    RAISE NOTICE 'Test 7 PASSED: System message added for conversation reopening';
    
    -- Test 8: Admin sends message to reopened conversation (should not trigger another reopening)
    SELECT COUNT(*) INTO message_count_before FROM messages WHERE conversation_id = test_conversation_id;
    
    INSERT INTO messages (conversation_id, sender_id, sender_type, message_content)
    VALUES (test_conversation_id, test_admin_id, 'admin', 'Thanks for following up! Let me help with your new question.');
    
    SELECT COUNT(*) INTO message_count_after FROM messages WHERE conversation_id = test_conversation_id;
    SELECT status INTO conversation_status FROM conversations WHERE id = test_conversation_id;
    
    IF conversation_status != 'pending' THEN
        RAISE EXCEPTION 'Test 8 FAILED: Conversation status changed unexpectedly to %', conversation_status;
    END IF;
    
    IF message_count_after != message_count_before + 1 THEN -- Only +1 for admin message, no system message
        RAISE EXCEPTION 'Test 8 FAILED: Unexpected number of messages added';
    END IF;
    RAISE NOTICE 'Test 8 PASSED: Admin message to reopened conversation works correctly';
    
    -- Test 9: Test that resolved conversations don't get reopened by admin messages
    UPDATE conversations SET status = 'resolved' WHERE id = test_conversation_id;
    
    INSERT INTO messages (conversation_id, sender_id, sender_type, message_content)
    VALUES (test_conversation_id, test_admin_id, 'admin', 'Final admin message');
    
    SELECT status INTO conversation_status FROM conversations WHERE id = test_conversation_id;
    IF conversation_status != 'resolved' THEN
        RAISE EXCEPTION 'Test 9 FAILED: Admin message incorrectly reopened resolved conversation';
    END IF;
    RAISE NOTICE 'Test 9 PASSED: Admin messages do not reopen resolved conversations';
    
    -- Cleanup test data
    DELETE FROM messages WHERE conversation_id = test_conversation_id;
    DELETE FROM conversations WHERE id = test_conversation_id;
    
    RAISE NOTICE '=== ALL TESTS PASSED ===';
    RAISE NOTICE 'Conversation reopening mechanism is working correctly!';
    
EXCEPTION
    WHEN OTHERS THEN
        -- Cleanup on error
        DELETE FROM messages WHERE conversation_id = test_conversation_id;
        DELETE FROM conversations WHERE id = test_conversation_id;
        RAISE;
END $$;
