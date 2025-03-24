'use client';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProvider } from '@/contexts/UserContext';

// Create a client for React Query
const queryClient = new QueryClient();

/**
 * Providers component wrapping the application with all necessary context providers
 * Now uses Supabase auth via UserProvider instead of NextAuth SessionProvider
 */
export function Providers({ 
  children 
}: { 
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </UserProvider>
  );
} 