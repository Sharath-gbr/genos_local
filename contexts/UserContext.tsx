'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { AuthService } from '@/lib/services/auth-service';
import { registerAuthService } from '@/lib/migrationHelper';

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
}

/**
 * Context for managing the current user's authentication state
 * This provides user data across the entire application
 */
const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  error: null,
  signOut: async () => {},
});

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Sign out function
  const signOut = async () => {
    try {
      // Call the signout API route
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to sign out');
      }

      // Redirect to login page
      router.push('/login');
    } catch (err) {
      console.error('Error signing out:', err);
      setError('Failed to sign out');
    }
  };

  // Register the auth service globally for backward compatibility
  useEffect(() => {
    registerAuthService(AuthService);
  }, []);

  // Load user on initial mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        
        // Get the current user session
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          throw error;
        }
        
        if (data?.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Failed to fetch user data');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth, router]);

  const value = {
    user,
    loading,
    error,
    signOut,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
} 