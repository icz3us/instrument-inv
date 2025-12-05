import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const cookieStore = await cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  
  try {
    const { email, password } = await request.json()
    
    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    
    // Get user role from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('email', email)
    
    if (userError || !userData || userData.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }
    
    const userRole = userData[0].role
    
    return NextResponse.json({ 
      user: {
        id: data.user.id,
        email: data.user.email,
        role: userRole
      },
      session: data.session
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}