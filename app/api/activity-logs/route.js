import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Create a proper Supabase client for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for server-side operations
)

export async function GET(request) {
  try {
    // Get all activity logs
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/activity-logs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { user_id, user_email, action, description, ip_address, user_agent } = body
    
    // Validate required fields
    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 })
    }
    
    // Insert new activity log
    const { data, error } = await supabase
      .from('activity_logs')
      .insert([
        {
          user_id,
          user_email,
          action,
          description,
          ip_address,
          user_agent
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