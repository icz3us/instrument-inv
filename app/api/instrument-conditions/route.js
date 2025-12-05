import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Create a proper Supabase client for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for server-side operations
)

export async function GET(request) {
  try {
    // Get all instrument conditions
    const { data, error } = await supabase
      .from('instrument_conditions')
      .select('*')
      .order('created_at', { ascending: false })
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/instrument-conditions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { instrument_id, condition, notes, reported_by } = body
    
    // Validate required fields
    if (!instrument_id || !condition) {
      return NextResponse.json({ error: 'Instrument ID and condition are required' }, { status: 400 })
    }
    
    // Insert new condition report
    const { data, error } = await supabase
      .from('instrument_conditions')
      .insert([
        {
          instrument_id,
          condition,
          notes,
          reported_by
        }
      ])
      .select()
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Also update the instrument's condition
    const { error: updateError } = await supabase
      .from('instruments')
      .update({ condition })
      .eq('id', instrument_id);
    
    if (updateError) {
      console.error('Error updating instrument condition:', updateError);
    }
    
    return NextResponse.json(data[0])
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
}