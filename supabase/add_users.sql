-- SQL script to add users to Supabase
-- First create the users via Supabase Dashboard > Authentication > Users
-- Email: admin@instrument.com, Password: admin123
-- Email: employee@instrument.com, Password: employee123

-- After creating users in the Authentication panel, run this to verify they exist:
-- SELECT id, email FROM auth.users WHERE email IN ('admin@instrument.com', 'employee@instrument.com');

-- Then run this script to insert their roles into the users table:
-- First check if users already exist
SELECT email, role FROM users WHERE email IN ('admin@instrument.com', 'employee@instrument.com');

-- Insert or update users with their roles
INSERT INTO users (id, email, role) 
SELECT id, email, 
       CASE 
         WHEN email = 'admin@instrument.com' THEN 'admin'
         WHEN email = 'employee@instrument.com' THEN 'employee'
         ELSE 'employee'  -- default role
       END as role
FROM auth.users 
WHERE email IN ('admin@instrument.com', 'employee@instrument.com')
ON CONFLICT (email) DO UPDATE SET
  role = EXCLUDED.role;

-- Verify the users were added correctly
SELECT id, email, role FROM users WHERE email IN ('admin@instrument.com', 'employee@instrument.com');