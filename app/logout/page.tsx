'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Logout page component
 * Automatically logs the user out when navigated to
 */
export default function LogoutPage() {
  useEffect(() => {
    async function performLogout() {
      try {
        const supabase = createClient();
        
        // Sign out from Supabase
        await supabase.auth.signOut();
        
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
        window.location.href = '/';
      } catch (error) {
        console.error('Error during logout:', error);
        // Still redirect to home page on error
        window.location.href = '/';
      }
    }
    
    performLogout();
  }, []);
  
  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: 2
    }}>
      <CircularProgress size={40} color="primary" />
      <Typography variant="h6">Logging out...</Typography>
    </Box>
  );
} 