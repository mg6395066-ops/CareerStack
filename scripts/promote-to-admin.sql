-- Script to promote a user to admin role
-- Usage: Update the email address below with the user you want to promote

UPDATE users 
SET role = 'admin'
WHERE email = 'your-email@example.com';  -- CHANGE THIS TO YOUR EMAIL

-- Verify the update
SELECT id, email, role FROM users WHERE role = 'admin';
