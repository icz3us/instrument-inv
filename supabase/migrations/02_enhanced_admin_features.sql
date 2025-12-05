-- Create borrow_requests table
CREATE TABLE borrow_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  instrument_id UUID REFERENCES instruments(id) ON DELETE CASCADE,
  instrument_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  request_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'returned', 'overdue')),
  purpose TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create maintenance_logs table
CREATE TABLE maintenance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instrument_id UUID REFERENCES instruments(id) ON DELETE CASCADE,
  instrument_name TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  completed_date DATE,
  technician TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  cost NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create calibration_logs table
CREATE TABLE calibration_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instrument_id UUID REFERENCES instruments(id) ON DELETE CASCADE,
  instrument_name TEXT NOT NULL,
  calibration_date DATE NOT NULL,
  next_calibration_date DATE NOT NULL,
  technician TEXT,
  certificate_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create instrument_conditions table
CREATE TABLE instrument_conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instrument_id UUID REFERENCES instruments(id) ON DELETE CASCADE,
  condition TEXT NOT NULL CHECK (condition IN ('good', 'needs_repair', 'under_maintenance', 'missing')),
  notes TEXT,
  reported_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create activity_logs table
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  user_email TEXT,
  action TEXT NOT NULL,
  description TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add additional columns to instruments table
ALTER TABLE instruments 
ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'good' CHECK (condition IN ('good', 'needs_repair', 'under_maintenance', 'missing')),
ADD COLUMN IF NOT EXISTS calibration_due DATE,
ADD COLUMN IF NOT EXISTS purchase_date DATE,
ADD COLUMN IF NOT EXISTS warranty_expiration DATE,
ADD COLUMN IF NOT EXISTS qr_code TEXT,
ADD COLUMN IF NOT EXISTS barcode TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_borrow_requests_status ON borrow_requests(status);
CREATE INDEX IF NOT EXISTS idx_borrow_requests_user_id ON borrow_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_borrow_requests_instrument_id ON borrow_requests(instrument_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_status ON maintenance_logs(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_instrument_id ON maintenance_logs(instrument_id);
CREATE INDEX IF NOT EXISTS idx_instruments_condition ON instruments(condition);
CREATE INDEX IF NOT EXISTS idx_instruments_calibration_due ON instruments(calibration_due);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- Enable Row Level Security
ALTER TABLE borrow_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE calibration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE instrument_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON TABLE borrow_requests TO authenticated;
GRANT ALL ON TABLE maintenance_logs TO authenticated;
GRANT ALL ON TABLE calibration_logs TO authenticated;
GRANT ALL ON TABLE instrument_conditions TO authenticated;
GRANT ALL ON TABLE activity_logs TO authenticated;