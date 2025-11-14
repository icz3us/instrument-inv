-- SQL script to verify Supabase setup

-- Check if users table exists and has data
SELECT 'users table' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'instruments table' as table_name, COUNT(*) as row_count FROM instruments;

-- Check the structure of users table
\d users;

-- Check the structure of instruments table
\d instruments;

-- Check if RLS is enabled on tables
SELECT 
  table_name, 
  CASE 
    WHEN relrowsecurity THEN 'Enabled' 
    ELSE 'Disabled' 
  END as rls_status
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN information_schema.tables t ON t.table_name = c.relname
WHERE c.relname IN ('users', 'instruments')
AND n.nspname = 'public';

-- Check policies on users table
SELECT policyname, permissive, roles, cmd FROM pg_policy pol
JOIN pg_class pc ON pc.oid = pol.polrelid
WHERE pc.relname = 'users';

-- Check policies on instruments table
SELECT policyname, permissive, roles, cmd FROM pg_policy pol
JOIN pg_class pc ON pc.oid = pol.polrelid
WHERE pc.relname = 'instruments';

-- Check if sample users exist in auth.users
SELECT id, email, created_at FROM auth.users 
WHERE email IN ('admin@instrument.com', 'employee@instrument.com');

-- Check if sample users exist in users table
SELECT id, email, role, created_at FROM users 
WHERE email IN ('admin@instrument.com', 'employee@instrument.com');