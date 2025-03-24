import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Auth callback handler for Supabase
 * This route handles the redirect after email verification
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Exchange code for session
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to dashboard or login page
  return NextResponse.redirect(new URL('/dashboard', request.url));
} 