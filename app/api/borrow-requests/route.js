import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Create a proper Supabase client for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for server-side operations
)

export async function GET(request) {
  try {
    // Get all borrow requests
    const { data, error } = await supabase
      .from('borrow_requests')
      .select('*')
      .order('created_at', { ascending: false })
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/borrow-requests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { user_id, user_email, instrument_id, instrument_name, quantity, due_date, purpose } = body
    
    // Validate required fields
    if (!user_id || !user_email || !instrument_id || !instrument_name || !due_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Insert new borrow request
    const { data, error } = await supabase
      .from('borrow_requests')
      .insert([
        {
          user_id,
          user_email,
          instrument_id,
          instrument_name,
          quantity: quantity || 1,
          due_date,
          purpose,
          request_date: new Date().toISOString().split('T')[0]
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
    const body = await request.json()
    const { id, status } = body
    
    // Validate required fields
    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status are required' }, { status: 400 })
    }
    
    // Update borrow request
    const { data, error } = await supabase
      .from('borrow_requests')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    if (data.length === 0) {
      return NextResponse.json({ error: 'Borrow request not found' }, { status: 404 })
    }
    
    return NextResponse.json(data[0])
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
}