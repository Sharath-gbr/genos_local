/**
 * Migration Helper Utility
 * Provides a compatibility layer for transitioning from NextAuth.js to Supabase Auth
 * 
 * This helps existing components that were built with NextAuth to continue working
 * while we migrate the entire app to Supabase auth.
 */

import { useUser } from '@/contexts/UserContext';
import { useEffect, useState } from 'react';

/**
 * Hook that provides a NextAuth-like session object using Supabase auth
 * This helps in migrating components without changing their logic significantly
 */
export const useCompatSession = () => {
  const { user, loading } = useUser();
  const [sessionData, setSessionData] = useState<any>(null);
  
  useEffect(() => {
    if (user) {
      // Create a NextAuth-like session object from Supabase user
      setSessionData({
        user: {
          id: user.id,
          name: user.user_metadata?.full_name || 
                `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || 
                'User',
          email: user.email,
          image: user.user_metadata?.avatar_url || null,
        },
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours from now
      });
    } else {
      setSessionData(null);
    }
  }, [user]);
  
  // Return an object that mirrors NextAuth's useSession() hook
  return {
    data: sessionData,
    status: loading ? 'loading' : user ? 'authenticated' : 'unauthenticated',
    update: async () => {
      // This function doesn't do much in our migration context, but matches NextAuth API
      console.warn('Session update is not fully implemented in migration helper');
      return sessionData;
    }
  };
};

/**
 * Function to sign out through our Supabase auth service
 * Mirrors NextAuth's signOut function
 */
export const compatSignOut = async (options?: any) => {
  // Get the signOut function from the global window as a hacky way to access it
  // In a real implementation, you would properly import this
  const authService = window.authService;
  
  if (authService?.signOut) {
    await authService.signOut();
  } else {
    console.error('AuthService not available for sign out');
    // Fallback to redirect if needed
    if (options?.callbackUrl) {
      window.location.href = options.callbackUrl;
    }
  }
  
  return { url: options?.callbackUrl || '/login' };
};

/**
 * Function to sign in with credentials through our Supabase auth service
 * Mirrors NextAuth's signIn function for the 'credentials' provider
 */
export const compatSignIn = async (provider: string, options?: any) => {
  if (provider !== 'credentials') {
    console.error('Only credentials provider is supported in migration helper');
    return { error: 'Only credentials provider is supported', status: 400 };
  }
  
  const authService = window.authService;
  
  if (authService?.signIn) {
    try {
      const result = await authService.signIn(options.email, options.password);
      
      if (result.success) {
        if (options?.callbackUrl) {
          window.location.href = options.callbackUrl;
        }
        return { ok: true, error: null, status: 200, url: options?.callbackUrl || '/dashboard' };
      } else {
        return { ok: false, error: result.error || 'Authentication failed', status: 401 };
      }
    } catch (error) {
      console.error('Sign in error:', error);
      return { ok: false, error: 'An unexpected error occurred', status: 500 };
    }
  } else {
    console.error('AuthService not available for sign in');
    return { ok: false, error: 'Authentication service unavailable', status: 500 };
  }
};

// Make auth service available globally for the compatibility layer
declare global {
  interface Window {
    authService: any;
  }
}

// Export a function to register the auth service globally
export const registerAuthService = (authService: any) => {
  if (typeof window !== 'undefined') {
    window.authService = authService;
  }
}; 