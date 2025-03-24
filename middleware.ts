import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

/**
 * Middleware function that runs before the request is processed
 * Handles authentication and route protection using Supabase auth
 * 
 * @param request - The incoming request
 * @returns NextResponse object
 */
export async function middleware(request: NextRequest) {
  // Create a Supabase client for the middleware
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  
  // Get the current user's session
  const { data: { session } } = await supabase.auth.getSession();
  
  // Check if the requested path is an auth page (login or signup)
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                    request.nextUrl.pathname.startsWith('/signup');

  // If on an auth page and already logged in, redirect to dashboard
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protected routes check
  const protectedRoutes = ['/dashboard', '/profile'];
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );
  
  // If trying to access a protected route without a session, redirect to login
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}; 