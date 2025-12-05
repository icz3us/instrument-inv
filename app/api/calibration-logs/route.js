import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Create a proper Supabase client for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for server-side operations
)

export async function GET(request) {
  try {
    // Get all calibration logs
    const { data, error } = await supabase
      .from('calibration_logs')
      .select('*')
      .order('calibration_date', { ascending: false })
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/calibration-logs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { instrument_id, instrument_name, calibration_date, next_calibration_date, technician, certificate_number, notes } = body
    
    // Validate required fields
    if (!instrument_id || !instrument_name || !calibration_date || !next_calibration_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Insert new calibration log
    const { data, error } = await supabase
      .from('calibration_logs')
      .insert([
        {
          instrument_id,
          instrument_name,
          calibration_date,
          next_calibration_date,
          technician,
          certificate_number,
          notes
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
    const { id, calibration_date, next_calibration_date, technician, certificate_number, notes } = body
    
    // Validate required fields
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }
    
    // Prepare update data
    const updateData = {
      updated_at: new Date().toISOString()
    };
    
    if (calibration_date) updateData.calibration_date = calibration_date;
    if (next_calibration_date) updateData.next_calibration_date = next_calibration_date;
    if (technician) updateData.technician = technician;
    if (certificate_number) updateData.certificate_number = certificate_number;
    if (notes) updateData.notes = notes;
    
    // Update calibration log
    const { data, error } = await supabase
      .from('calibration_logs')
      .update(updateData)
      .eq('id', id)
      .select()
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    if (data.length === 0) {
      return NextResponse.json({ error: 'Calibration log not found' }, { status: 404 })
    }
    
    return NextResponse.json(data[0])
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
}