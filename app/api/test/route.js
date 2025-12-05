import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const cookieStore = await cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  
  try {
    // Test 1: Get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    // Test 2: Get users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
    
    // Test 3: Get instruments
    const { data: instruments, error: instrumentsError } = await supabase
      .from('instruments')
      .select('*')
    
    return NextResponse.json({
      session,
      users,
      instruments,
      errors: {
        session: sessionError,
        users: usersError,
        instruments: instrumentsError
      }
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}