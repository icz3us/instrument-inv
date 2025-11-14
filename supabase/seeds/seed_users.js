const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seed() {
  try {
    // Create admin user
    const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
      email: 'admin@instrument.com',
      password: 'admin123',
      email_confirm: true,
    })

    if (adminError) throw adminError

    // Insert admin profile with role
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: adminData.user.id,
          email: 'admin@instrument.com',
          password_hash: '$2a$10$uKX7kR6p9X5tFyZ6Z4Y3vOqJ9iH8jG7fT6gH5fD4sR3tE2qW1vU0a', // Hashed 'admin123'
          role: 'admin'
        }
      ])

    if (profileError) throw profileError

    // Create employee user
    const { data: employeeData, error: employeeError } = await supabase.auth.admin.createUser({
      email: 'employee@instrument.com',
      password: 'employee123',
      email_confirm: true,
    })

    if (employeeError) throw employeeError

    // Insert employee profile with role
    const { error: empProfileError } = await supabase
      .from('users')
      .insert([
        {
          id: employeeData.user.id,
          email: 'employee@instrument.com',
          password_hash: '$2a$10$uKX7kR6p9X5tFyZ6Z4Y3vOqJ9iH8jG7fT6gH5fD4sR3tE2qW1vU0a', // Hashed 'employee123'
          role: 'employee'
        }
      ])

    if (empProfileError) throw empProfileError

    console.log('Seed data inserted successfully')
  } catch (error) {
    console.error('Error seeding data:', error)
  }
}

seed()