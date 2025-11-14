-- SQL to run in Supabase SQL Editor

-- Step 1: Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'employee')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Step 2: Create instruments table
CREATE TABLE instruments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'checked_out', 'maintenance')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Step 3: Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE instruments ENABLE ROW LEVEL SECURITY;

-- Step 4: Create policies for users table
CREATE POLICY "Allow authenticated users to read users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- Step 5: Create policies for instruments table
CREATE POLICY "Allow all authenticated users to read instruments"
  ON instruments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to update instruments"
  ON instruments FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow admins to insert instruments"
  ON instruments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow admins to delete instruments"
  ON instruments FOR DELETE
  TO authenticated
  USING (true);

-- Step 6: After creating users in Authentication panel, insert their roles
-- First create users via Supabase Dashboard > Authentication > Add User
-- Create: admin@instrument.com with password: admin123
-- Create: employee@instrument.com with password: employee123

-- Then run this to insert roles:
INSERT INTO users (id, email, role) VALUES
  ((SELECT id FROM auth.users WHERE email = 'admin@instrument.com'), 'admin@instrument.com', 'admin'),
  ((SELECT id FROM auth.users WHERE email = 'employee@instrument.com'), 'employee@instrument.com', 'employee');