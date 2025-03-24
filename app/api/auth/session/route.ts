import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * API route to get the current user session
 * This is useful for client-side session access and validation
 */
export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();

    // Return session data with appropriate status
    return NextResponse.json({ 
      session,
      user: session?.user || null 
    }, { status: 200 });
  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json(
      { error: 'Failed to get session' }, 
      { status: 500 }
    );
  }
} 