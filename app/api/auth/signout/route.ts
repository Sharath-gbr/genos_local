import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * API route to handle user sign-out
 * This properly clears the session and cookies
 */
export async function POST() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Sign out the user
    await supabase.auth.signOut();
    
    return NextResponse.json({ 
      success: true,
      message: 'Successfully signed out'
    }, { status: 200 });
  } catch (error) {
    console.error('Sign out API error:', error);
    return NextResponse.json(
      { error: 'Failed to sign out' }, 
      { status: 500 }
    );
  }
} 