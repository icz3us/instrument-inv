import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Create a proper Supabase client for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for server-side operations
)

export async function GET(request) {
  try {
    // Get all maintenance logs
    const { data, error } = await supabase
      .from('maintenance_logs')
      .select('*')
      .order('scheduled_date', { ascending: true })
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/maintenance-logs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { instrument_id, instrument_name, scheduled_date, technician, notes, cost } = body
    
    // Validate required fields
    if (!instrument_id || !instrument_name || !scheduled_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Insert new maintenance log
    const { data, error } = await supabase
      .from('maintenance_logs')
      .insert([
        {
          instrument_id,
          instrument_name,
          scheduled_date,
          technician,
          notes,
          cost,
          status: 'scheduled'
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
    const { id, status, completed_date, technician, notes, cost } = body
    
    // Validate required fields
    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status are required' }, { status: 400 })
    }
    
    // Prepare update data
    const updateData = {
      status,
      updated_at: new Date().toISOString()
    };
    
    if (completed_date) updateData.completed_date = completed_date;
    if (technician) updateData.technician = technician;
    if (notes) updateData.notes = notes;
    if (cost) updateData.cost = cost;
    
    // Update maintenance log
    const { data, error } = await supabase
      .from('maintenance_logs')
      .update(updateData)
      .eq('id', id)
      .select()
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    if (data.length === 0) {
      return NextResponse.json({ error: 'Maintenance log not found' }, { status: 404 })
    }
    
    return NextResponse.json(data[0])
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
}