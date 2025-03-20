'use client';

import { Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to dashboard if they're already logged in
    // or to login page if they're not
    router.push('/login');
  }, [router]);

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        minHeight: '100vh',
        backgroundColor: '#1A1A1A',
        color: '#FFFFFF',
        p: { xs: 2, sm: 3 }
      }}
    >
      {/* Clean simple loading state */}
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">NEN</h1>
          <p>Loading...</p>
        </div>
      </div>
    </Box>
  );
} 