'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, Box, Typography, Container, Paper } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn('google', { 
        callbackUrl: '/dashboard',
        redirect: true
      });
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: '#1E1E1E', // Dark matte grey from theme
        py: 6
      }}
    >
      <Container maxWidth="sm">
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            mb: 4
          }}
        >
          <Typography 
            variant="h1" 
            component="h1" 
            sx={{ 
              color: '#FFFFFF',
              fontWeight: 700,
              mb: 2,
              fontSize: '3rem'
            }}
          >
            NEN
          </Typography>
          <Typography 
            variant="h5" 
            component="h2" 
            sx={{ 
              color: '#FFFFFF',
              mb: 4,
              fontWeight: 500
            }}
          >
            Sign in to your account
          </Typography>
          <Button
            variant="contained"
            fullWidth
            size="large"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            sx={{
              background: 'linear-gradient(45deg, #FF5F1F 30%, #FF8C69 90%)', // Orange gradient from theme
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(45deg, #E54600 30%, #FF5F1F 90%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 5px 15px rgba(255, 95, 31, 0.3)',
              },
              textTransform: 'none',
              py: 1.5,
              fontSize: '1rem',
              borderRadius: 2,
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign in with Google'}
          </Button>
        </Box>
      </Container>
    </Box>
  );
} 