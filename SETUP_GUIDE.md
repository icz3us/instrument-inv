# Instrument Inventory System - Setup Guide

## Overview
This is a role-based instrument inventory management system built with Next.js and Supabase.

## User Credentials
After setting up Supabase, you can login with these credentials:

**Admin Account:**
- Email: `admin@instrument.com`
- Password: `admin123`

**Employee Account:**
- Email: `employee@instrument.com`
- Password: `employee123`

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Supabase

1. Create a new project at [https://supabase.com](https://supabase.com)

2. Get your API credentials:
   - Go to Project Settings > API
   - Copy the Project URL
   - Copy the anon/public key
   - Copy the service_role key (for seeding)

3. Update `.env.local` file with your credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 3. Create Database Tables

In your Supabase dashboard, go to SQL Editor and run the following SQL:

```sql
-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'employee')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create instruments table
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

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE instruments ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Allow authenticated users to read users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for instruments table
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
```

### 4. Create Sample Users

In Supabase SQL Editor, run:

```sql
-- Create admin user in auth.users
-- You can also do this via Supabase Dashboard > Authentication > Add User

-- Then insert role data
INSERT INTO users (id, email, role) VALUES
  ((SELECT id FROM auth.users WHERE email = 'admin@instrument.com'), 'admin@instrument.com', 'admin'),
  ((SELECT id FROM auth.users WHERE email = 'employee@instrument.com'), 'employee@instrument.com', 'employee');
```

**Alternative: Create users via Supabase Dashboard**
1. Go to Authentication > Users
2. Click "Add user"
3. Create admin@instrument.com with password: admin123
4. Create employee@instrument.com with password: employee123
5. Then run the INSERT query above to assign roles

### 5. Run the Application

```bash
npm run dev
```

Navigate to `http://localhost:3000`

## Features

### Admin Dashboard
- Add new instruments
- Edit existing instruments
- Delete instruments
- View all instruments
- Manage instrument status

### Employee Dashboard
- View all instruments
- Update instrument status (available/checked_out/maintenance)
- Filter instruments by status

## Project Structure

```
instrument-inv/
├── app/
│   ├── api/
│   │   └── instruments/       # CRUD API routes
│   ├── dashboard/
│   │   ├── admin/            # Admin dashboard
│   │   ├── employee/         # Employee dashboard
│   │   └── dashboard.module.css
│   ├── login/                # Login page
│   ├── supabase/             # Supabase client
│   └── middleware.js         # Route protection
├── supabase/
│   └── migrations/           # Database schema
└── .env.local               # Environment variables
```

## Technology Stack

- **Frontend**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: CSS Modules

## Troubleshooting

1. **Login not working**: Make sure you've created the users in Supabase Authentication and added their roles to the users table

2. **Middleware errors**: Ensure you have the correct environment variables set

3. **Database errors**: Check that all tables are created and RLS policies are enabled

4. **CORS errors**: Make sure your Supabase project URL is correct in .env.local
