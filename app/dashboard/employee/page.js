import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import EnhancedEmployeeDashboard from './enhanced-page'
import { Metadata } from 'next';

// Add page-specific metadata
export const metadata = {
  title: "Employee Dashboard - Instrument Inventory",
  description: "Employee dashboard for borrowing and managing instruments",
  openGraph: {
    title: "Employee Dashboard - Instrument Inventory",
    description: "Employee dashboard for borrowing and managing instruments",
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
export default async function EmployeeDashboard() {
  const cookieStore = cookies()
  const supabase = createSupabaseClient(cookieStore)
  
  // Fetch all required data in parallel
  const [instrumentsRes, usersRes] = await Promise.all([
    supabase.from('instruments').select('*'),
    supabase.from('users').select('*')
  ])

  const initialData = {
    instruments: instrumentsRes.data || [],
    users: usersRes.data || []
  }

  return <EnhancedEmployeeDashboard initialData={initialData} />
}