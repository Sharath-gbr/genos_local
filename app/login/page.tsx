'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@mui/material';
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
    <div className="min-h-screen flex flex-col justify-center py-12 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-4xl font-bold text-gray-900 mb-8">
          NEN
        </h1>
        <h2 className="text-center text-2xl font-semibold text-gray-900 mb-8">
          Sign in to your account
        </h2>
        <Button
          variant="contained"
          fullWidth
          size="large"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          sx={{
            backgroundColor: '#4285f4',
            color: 'white',
            '&:hover': {
              backgroundColor: '#3367d6'
            },
            textTransform: 'none',
            py: 1.5,
            fontSize: '1rem'
          }}
        >
          {isLoading ? 'Signing in...' : 'Sign in with Google'}
        </Button>
      </div>
    </div>
  );
} 