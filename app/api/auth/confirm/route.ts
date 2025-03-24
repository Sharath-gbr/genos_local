import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to confirm a user's email address
 * This is primarily for development when email confirmation is disabled
 */
export async function POST(request: NextRequest) {
  try {
    // Only allow this in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'This API is only available in development mode' }, { status: 403 });
    }

    // Get the email from the request body
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient(
      { cookies: () => cookieStore },
      { supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY }
    );

    // First, get the user by email
    const { data: { users }, error: getUserError } = await supabase.auth.admin.listUsers({
      filters: {
        email: email
      }
    });

    if (getUserError || !users || users.length === 0) {
      return NextResponse.json({ 
        error: getUserError?.message || 'User not found with that email' 
      }, { status: 404 });
    }

    const userId = users[0].id;

    // Update the user to set email_confirmed_at if not already set
    if (!users[0].email_confirmed_at) {
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        { email_confirmed_at: new Date().toISOString() }
      );

      if (updateError) {
        return NextResponse.json({ 
          error: `Failed to confirm email: ${updateError.message}` 
        }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Email confirmed successfully' 
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error in confirm-email API:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 