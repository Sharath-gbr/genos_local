'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import GoogleIcon from '@mui/icons-material/Google';
import Link from 'next/link';

const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(3),
  background: 'linear-gradient(135deg, #111111 0%, #1A1A1A 100%)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 50% 50%, rgba(255, 95, 31, 0.1) 0%, rgba(0, 0, 0, 0) 50%)',
    pointerEvents: 'none',
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  width: '100%',
  maxWidth: 400,
  backdropFilter: 'blur(10px)',
  backgroundColor: 'rgba(26, 26, 26, 0.8)',
  border: '1px solid rgba(255, 95, 31, 0.2)',
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    border: '1px solid rgba(255, 95, 31, 0.4)',
    boxShadow: '0 4px 30px rgba(255, 95, 31, 0.2)',
  },
}));

const GlowingText = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(45deg, #FFFFFF 30%, #FF5F1F 90%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
  textShadow: '0 0 30px rgba(255, 95, 31, 0.3)',
}));

export default function Home() {
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ type: '', content: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', content: '' });
    setIsLoading(true);

    try {
      if (tab === 0) {
        // Register
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error);
        }

        setMessage({
          type: 'success',
          content: 'Registration successful! You can now log in.',
        });
        setTab(1); // Switch to login tab
      } else {
        // Login
        const result = await signIn('credentials', {
          redirect: false,
          email,
          password,
        });

        if (result?.error) {
          throw new Error(result.error);
        }

        setMessage({
          type: 'success',
          content: 'Login successful! Redirecting...',
        });

        // Redirect to dashboard
        window.location.href = '/dashboard';
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        content: error.message || 'An error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <StyledContainer>
      <GlowingText variant="h2" component="h1" gutterBottom>
        Genos
      </GlowingText>
      <GlowingText variant="h4" gutterBottom sx={{ opacity: 0.8 }}>
        Welcome to nen
      </GlowingText>

      <StyledPaper elevation={3}>
        <Tabs
          value={tab}
          onChange={(_, newValue) => setTab(newValue)}
          variant="fullWidth"
          sx={{ mb: 3 }}
        >
          <Tab label="Sign Up" />
          <Tab label="Log In" />
        </Tabs>

        {message.content && (
          <Alert severity={message.type as 'error' | 'success'} sx={{ mb: 2 }}>
            {message.content}
          </Alert>
        )}

        <Button
          fullWidth
          variant="outlined"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleSignIn}
          sx={{
            mb: 2,
            backgroundColor: 'rgba(255, 95, 31, 0.05)',
            borderColor: 'rgba(255, 95, 31, 0.2)',
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: 'rgba(255, 95, 31, 0.1)',
              borderColor: 'rgba(255, 95, 31, 0.4)',
              boxShadow: '0 4px 20px rgba(255, 95, 31, 0.2)',
            },
          }}
        >
          {tab === 0 ? 'Sign up with Google' : 'Sign in with Google'}
        </Button>

        <Divider sx={{ my: 2 }}>OR</Divider>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            margin="normal"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            margin="normal"
            helperText={tab === 0 ? "Must contain 8+ characters, uppercase, number & special character" : ""}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? 'Please wait...' : (tab === 0 ? 'Sign Up' : 'Log In')}
          </Button>

          {tab === 1 && (
            <Link href="/forgot-password" passHref>
              <Typography
                variant="body2"
                color="primary"
                sx={{ textAlign: 'center', mt: 1, cursor: 'pointer' }}
              >
                Forgot your password?
              </Typography>
            </Link>
          )}
        </Box>
      </StyledPaper>
    </StyledContainer>
  );
}
