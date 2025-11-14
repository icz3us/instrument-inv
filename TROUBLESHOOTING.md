# Troubleshooting Guide

## If Nothing Happens When Logging In

### 1. Check Browser Console
Open your browser's developer tools (F12) and check the Console tab for any error messages.

### 2. Check Network Tab
In the Network tab, look for failed requests to Supabase or your API endpoints.

### 3. Test Supabase Connection
Visit `/test-supabase` in your browser to run connection tests.

### 4. Verify Environment Variables
Make sure your `.env.local` file has the correct Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 5. Check Database Setup
Run the SQL queries in `supabase/verify_setup.sql` in your Supabase SQL Editor to verify:
- Tables exist
- Users are properly inserted
- Row Level Security is configured

### 6. Verify User Roles
Ensure users exist in both:
- `auth.users` (Supabase Authentication)
- `users` (Application table with roles)

### 7. Test API Endpoint
Visit `/api/test` to check if your API routes can connect to Supabase.

## Common Issues and Solutions

### Issue: "Cannot coerce the result to a single JSON object"
**Solution**: This happens when the user doesn't exist in the `users` table. Make sure you've run the user insertion SQL after creating users in the Authentication panel.

### Issue: Redirect loops or no navigation
**Solution**: Check middleware logs and ensure user roles are correctly set in the database.

### Issue: "Failed to fetch" errors
**Solution**: Verify your Supabase credentials in `.env.local` and check network connectivity.

## Debugging Steps

1. Open browser developer tools
2. Try to log in and watch the console logs
3. Check network requests for failures
4. Visit `/test-supabase` to run diagnostics
5. Check Supabase dashboard for any errors