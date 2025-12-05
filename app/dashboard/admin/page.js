import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import EnhancedAdminDashboard from './enhanced-page'
import { Metadata } from 'next';

// Add page-specific metadata
export const metadata = {
  title: "Admin Dashboard - Instrument Inventory",
  description: "Admin dashboard for managing instruments, users, and inventory",
  openGraph: {
    title: "Admin Dashboard - Instrument Inventory",
    description: "Admin dashboard for managing instruments, users, and inventory",
  },
};

// Create a Supabase client for server-side operations
const createSupabaseClient = (cookieStore) => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      global: {
        headers: {
          cookie: cookieStore.toString()
        }
      }
    }
  )
}

// Server Component - fetches data on the server
export default async function AdminDashboard() {
  const cookieStore = cookies()
  const supabase = createSupabaseClient(cookieStore)
  
  // Fetch all required data in parallel
  const [instrumentsRes, borrowRequestsRes, maintenanceItemsRes, usersRes] = await Promise.all([
    supabase.from('instruments').select('*'),
    supabase.from('borrow_requests').select('*'),
    supabase.from('maintenance_logs').select('*'),
    supabase.from('users').select('*')
  ])

  const initialData = {
    instruments: instrumentsRes.data || [],
    borrowRequests: borrowRequestsRes.data || [],
    maintenanceItems: maintenanceItemsRes.data || [],
    users: usersRes.data || []
  }

  return <EnhancedAdminDashboard initialData={initialData} />
}