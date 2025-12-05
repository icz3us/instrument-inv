import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const cookieStore = await cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      return NextResponse.json({ error: sessionError.message }, { status: 500 })
    }
    
    if (!session) {
      return NextResponse.json({ error: 'No active session' }, { status: 401 })
    }
    
    // Get user role from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('email', session.user.email)
    
    if (userError || !userData || userData.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }
    
    const userRole = userData[0].role
    
    return NextResponse.json({ 
      user: {
        id: session.user.id,
        email: session.user.email,
        role: userRole
      },
      session
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}