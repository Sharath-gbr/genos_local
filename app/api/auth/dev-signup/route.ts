import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Development-only API for creating pre-confirmed user accounts
 * This bypasses the email confirmation flow entirely
 */
export async function POST(request: NextRequest) {
  try {
    // Only allow this in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'This API is only available in development mode' }, { status: 403 });
    }

    // Get user data from the request body
    const body = await request.json();
    const { email, password, firstName, lastName } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient(
      { cookies: () => cookieStore },
      { supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY }
    );

    // Use admin API to create a user (bypassing email verification)
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Pre-confirm the email
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`
      }
    });

    if (error) {
      return NextResponse.json({ 
        error: `Failed to create user: ${error.message}` 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      user: data.user,
      message: 'User created with pre-confirmed email'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error in dev-signup API:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 