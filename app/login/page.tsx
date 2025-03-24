'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Box, Typography, Container, TextField, Alert, CircularProgress } from '@mui/material';
import { AuthService } from '@/lib/services/auth-service';
import Link from 'next/link';

/**
 * Login page that allows users to sign in with email and password
 * Replaces the previous Google OAuth login with Supabase authentication
 */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmingEmail, setIsConfirmingEmail] = useState(false);

  /**
   * Handle the login form submission
   * Authenticates the user using Supabase
   */
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Basic validation
    if (!email.trim() || !password) {
      setError('Email and password are required');
      return;
    }

    setIsLoading(true);

    try {
      const result = await AuthService.signIn(email, password);
      
      if (result.success) {
        // Redirect to dashboard on successful login
        router.push('/dashboard');
      } else {
        const errorMessage = result.error || 'Invalid email or password';
        
        // Special handling for email not confirmed errors
        if (errorMessage.includes('Email not confirmed')) {
          setError('Your email has not been confirmed. Please check your inbox or confirm it below.');
        } else {
          setError(errorMessage);
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * For development: Confirm the user's email without going through the email flow
   */
  const handleConfirmEmail = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsConfirmingEmail(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage('Email confirmed successfully! You can now sign in.');
      } else {
        setError(data.error || 'Failed to confirm email');
      }
    } catch (error) {
      console.error('Error confirming email:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsConfirmingEmail(false);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: '#1E1E1E', // Dark matte grey
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

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {message && (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              {message}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email Address"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              sx={{
                '& .MuiInputBase-input': {
                  color: 'white',
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.23)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#FF5F1F',
                  },
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              sx={{
                '& .MuiInputBase-input': {
                  color: 'white',
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.23)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#FF5F1F',
                  },
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                mt: 3,
                mb: 2,
                background: 'linear-gradient(45deg, #FF5F1F 30%, #FF8C69 90%)', // Orange gradient
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
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign in'}
            </Button>

            {error && error.includes('Email not confirmed') && (
              <Button
                fullWidth
                variant="outlined"
                color="warning"
                onClick={handleConfirmEmail}
                disabled={isConfirmingEmail}
                sx={{
                  mb: 2,
                  borderColor: 'rgba(255, 95, 31, 0.5)',
                  color: '#FF5F1F',
                  '&:hover': {
                    borderColor: '#FF5F1F',
                    backgroundColor: 'rgba(255, 95, 31, 0.1)',
                  },
                }}
              >
                {isConfirmingEmail ? <CircularProgress size={24} color="inherit" /> : 'Confirm Email Address'}
              </Button>
            )}

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Don't have an account?{' '}
                <Link href="/signup" style={{ color: '#FF5F1F', textDecoration: 'none' }}>
                  Sign up
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
} 