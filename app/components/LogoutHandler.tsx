'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface LogoutHandlerProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * LogoutHandler component
 * Handles the client-side logout process for Supabase authentication
 */
export default function LogoutHandler({ children, className, onClick }: LogoutHandlerProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (onClick) {
      onClick();
    }

    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error.message);
        return;
      }
      
      // Clear any browser storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear cookies related to authentication
      document.cookie.split(";").forEach(cookie => {
        document.cookie = cookie
          .replace(/^ +/, "")
          .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
      });
      
      // Redirect to home page
      router.push('/');
      
      // Force a hard refresh to clear any React state
      window.location.href = '/';
    } catch (err) {
      console.error('Unexpected error during logout:', err);
    }
  };

  return (
    <div onClick={handleLogout} className={className}>
      {children}
    </div>
  );
} 