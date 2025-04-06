'use client';

import { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface LogoutButtonProps {
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  fullWidth?: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

/**
 * LogoutButton Component
 * A standalone button that handles client-side logout for Supabase authentication
 * 
 * Usage:
 * <LogoutButton variant="contained" color="primary" />
 * <LogoutButton text="Sign Out" variant="outlined" />
 */
export default function LogoutButton({
  variant = 'contained',
  color = 'primary',
  fullWidth = false,
  className = '',
  size = 'medium',
  text = 'Logout'
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error.message);
        setIsLoading(false);
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
      
      // Force a hard refresh to clear any React state
      window.location.href = '/';
    } catch (err) {
      console.error('Unexpected error during logout:', err);
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      color={color}
      fullWidth={fullWidth}
      className={className}
      size={size}
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? <CircularProgress size={24} /> : text}
    </Button>
  );
} 