import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  console.log('Middleware triggered for:', req.nextUrl.pathname);
  
  // Allow access to login page, root page, and API routes for everyone
  if (req.nextUrl.pathname === '/login' || 
      req.nextUrl.pathname === '/' || 
      req.nextUrl.pathname.startsWith('/api/')) {
    console.log('Allowing access to login, root, or API route');
    return NextResponse.next();
  }
  
  const res = NextResponse.next()
  
  // Check if required environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  console.log('Supabase env vars in middleware:', { supabaseUrl, supabaseAnonKey });
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not set, allowing access to all routes')
    return res
  }
  
  const supabase = createMiddlewareClient({ req, res })
  console.log('Supabase client created in middleware');
  
  try {
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession()
    
    console.log('Session data:', { session, sessionError });

    // Check if user is authenticated
    if (!session) {
      console.log('No session found, redirecting to login');
      // If not authenticated, redirect to login page
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // For dashboard routes, get user role from database
    if (req.nextUrl.pathname.startsWith('/dashboard')) {
      console.log('Checking user role for dashboard access');
      
      // Get user role from database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('email', session.user.email)

      console.log('User role data:', { userData, userError });

      if (userError) {
        console.error('Error fetching user role:', userError)
        return NextResponse.redirect(new URL('/login', req.url))
      }

      // Check if we got exactly one user
      if (!userData || userData.length === 0) {
        console.error('User not found in database')
        return NextResponse.redirect(new URL('/login', req.url))
      }
      
      if (userData.length > 1) {
        console.error('Multiple user entries found')
        return NextResponse.redirect(new URL('/login', req.url))
      }
      
      // Get the role from the first (and only) result
      const userRole = userData[0].role
      console.log('User role:', userRole);

      // Protect admin routes - only allow admin users
      if (req.nextUrl.pathname.startsWith('/dashboard/admin')) {
        if (userRole !== 'admin') {
          console.log('User is not admin, redirecting to employee dashboard');
          return NextResponse.redirect(new URL('/dashboard/employee', req.url))
        } else {
          console.log('Admin user accessing admin dashboard, allowing access');
        }
      }

      // Protect employee routes - only allow employee users
      if (req.nextUrl.pathname.startsWith('/dashboard/employee')) {
        if (!userRole || (userRole !== 'employee' && userRole !== 'admin')) {
          console.log('User is not authorized for employee dashboard, redirecting to login');
          return NextResponse.redirect(new URL('/login', req.url))
        } else {
          console.log('Authorized user accessing employee dashboard, allowing access');
        }
      }
    }
    
    console.log('Middleware allowing access to:', req.nextUrl.pathname);
  } catch (error) {
    console.error('Middleware error:', error)
    // In case of error, allow the request to proceed to let the client handle it
    return res
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*'],
}