'use client';

import { useState } from 'react';
import { Box, Button, TextField, Alert, CircularProgress, Typography, Divider } from '@mui/material';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import GoogleIcon from '@mui/icons-material/Google';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit} 
      sx={{ 
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 3
      }}
    >
      {error && (
        <Alert severity="error">
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ position: 'relative', pt: 3 }}>
          <Typography 
            component="label" 
            htmlFor="email" 
            sx={{ 
              color: '#FF5F1F',
              position: 'absolute',
              top: 0,
              left: 0,
              fontSize: '1rem',
              fontWeight: 400,
            }}
          >
            Email<Typography component="span" sx={{ ml: 0.5 }}>*</Typography>
          </Typography>
          <TextField
            id="email"
            name="email"
            autoComplete="email"
            autoFocus
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            variant="outlined"
            placeholder="Enter your email"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#F8F9FA',
                borderRadius: '16px',
                height: '56px',
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover fieldset': {
                  borderColor: 'transparent',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#FF5F1F',
                },
              },
              '& .MuiOutlinedInput-input': {
                padding: '16px 20px',
                fontSize: '1rem',
              },
            }}
          />
        </Box>

        <Box sx={{ position: 'relative', pt: 3 }}>
          <Typography 
            component="label" 
            htmlFor="password" 
            sx={{ 
              color: '#FF5F1F',
              position: 'absolute',
              top: 0,
              left: 0,
              fontSize: '1rem',
              fontWeight: 400,
            }}
          >
            Password<Typography component="span" sx={{ ml: 0.5 }}>*</Typography>
          </Typography>
          <TextField
            name="password"
            type="password"
            id="password"
            autoComplete="current-password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            variant="outlined"
            placeholder="Enter your password"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#F8F9FA',
                borderRadius: '16px',
                height: '56px',
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover fieldset': {
                  borderColor: 'transparent',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#FF5F1F',
                },
              },
              '& .MuiOutlinedInput-input': {
                padding: '16px 20px',
                fontSize: '1rem',
              },
            }}
          />
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block',
              mt: 1,
              color: '#FF5F1F',
              fontSize: '0.875rem'
            }}
          >
            Must contain 8+ characters, uppercase, number & special character
          </Typography>
        </Box>
      </Box>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={isLoading}
        sx={{ 
          mt: 2,
          bgcolor: '#FF5F1F',
          borderRadius: '8px',
          height: '48px',
          textTransform: 'none',
          fontSize: '1rem',
          '&:hover': {
            bgcolor: '#e54e0e'
          }
        }}
      >
        {isLoading ? <CircularProgress size={24} /> : 'Log In'}
      </Button>

      <Divider sx={{ my: 2 }}>OR</Divider>

      <Button
        fullWidth
        variant="outlined"
        startIcon={<GoogleIcon />}
        onClick={handleGoogleSignIn}
        sx={{ 
          borderColor: '#FF5F1F',
          color: '#FF5F1F',
          borderRadius: '8px',
          height: '48px',
          textTransform: 'none',
          fontSize: '1rem',
          '&:hover': {
            borderColor: '#e54e0e',
            bgcolor: 'rgba(255, 95, 31, 0.04)'
          }
        }}
      >
        Sign in with Google
      </Button>

      <Link href="/forgot-password" passHref>
        <Typography
          variant="body2"
          sx={{ 
            textAlign: 'center',
            color: '#FF5F1F',
            cursor: 'pointer',
            fontSize: '0.875rem',
            '&:hover': {
              textDecoration: 'underline'
            }
          }}
        >
          Forgot your password?
        </Typography>
      </Link>
    </Box>
  );
}