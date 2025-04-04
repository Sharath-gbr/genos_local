-- This file contains SQL statements for managing email mappings
-- between Airtable emails and authentication system emails

-- Add a manual mapping from Airtable email to auth email
-- Replace 'airtable_email@example.com' with the email in Airtable
-- Replace 'auth_email@example.com' with the email used for login
INSERT INTO user_mappings (airtable_email, auth_email, auto_matched, created_at)
VALUES 
('airtable_email@example.com', 'auth_email@example.com', false, NOW());

-- Example of multiple mappings at once
INSERT INTO user_mappings (airtable_email, auth_email, auto_matched, created_at)
VALUES 
('airtable1@example.com', 'auth1@example.com', false, NOW()),
('airtable2@example.com', 'auth2@example.com', false, NOW()),
('airtable3@example.com', 'auth3@example.com', false, NOW());

-- View all current mappings
SELECT * FROM user_mappings ORDER BY created_at DESC;

-- View all Airtable emails from weight_logs
SELECT DISTINCT "Email" FROM weight_logs WHERE "Email" IS NOT NULL;

-- View all auth system emails (requires appropriate permissions)
-- You may need to run this in the Supabase Dashboard SQL Editor
SELECT email FROM auth.users;

-- Delete a specific mapping
DELETE FROM user_mappings 
WHERE airtable_email = 'airtable_email@example.com' 
AND auth_email = 'auth_email@example.com'; 