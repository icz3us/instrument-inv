# Instrument Inventory System

A role-based instrument inventory management system for local hosting built with Next.js and Supabase.

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Setup Supabase and configure `.env.local` (see SETUP_GUIDE.md)

3. Run development server:
```bash
npm run dev
```

4. Access at `http://localhost:3000`

## Login Credentials

**Admin:**
- Email: `admin@instrument.com`
- Password: `admin123`

**Employee:**
- Email: `employee@instrument.com`
- Password: `employee123`

## Features

### Admin Dashboard
- ✅ Full CRUD operations on instruments
- ✅ Add, edit, and delete instruments
- ✅ Manage inventory status

### Employee Dashboard
- ✅ View all instruments
- ✅ Update instrument status
- ✅ Filter by status

## Tech Stack

- Next.js 14 (App Router)
- Supabase (PostgreSQL + Auth)
- CSS Modules

For detailed setup instructions, see [SETUP_GUIDE.md](SETUP_GUIDE.md)
