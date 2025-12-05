import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Create a proper Supabase client for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for server-side operations
)

export async function GET(request) {
  try {
    // Get all users
    const { data, error } = await supabase
      .from('users')
      .select('*')
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password_hash, role } = body
    
    // Validate required fields
    if (!email || !password_hash || !role) {
      return NextResponse.json({ error: 'Email, password_hash, and role are required' }, { status: 400 })
    }
    
    // Insert new user
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          password_hash,
          role
        }
      ])
      .select()
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data[0])
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
}

export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }
    
    const body = await request.json()
    const { role } = body
    
    // Validate required fields
    if (!role) {
      return NextResponse.json({ error: 'Role is required' }, { status: 400 })
    }
    
    // Update user
    const { data, error } = await supabase
      .from('users')
      .update({
        role,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    if (data.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    return NextResponse.json(data[0])
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    // Validate required fields
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }
    
    // Delete user
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}