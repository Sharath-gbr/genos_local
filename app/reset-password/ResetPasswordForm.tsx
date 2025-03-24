'use client';

import { useState, useEffect, Suspense } from 'react';
import { Box, Button, TextField, Alert, CircularProgress } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordFormContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess('Password has been reset successfully. Redirecting to login...');
      setTimeout(() => router.push('/'), 2000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <Box sx={{ width: '100%' }}>
        <Alert severity="error">
          Invalid reset link. Please request a new password reset.
        </Alert>
        <Button
          fullWidth
          variant="contained"
          onClick={() => router.push('/forgot-password')}
          sx={{ mt: 2 }}
        >
          Request Password Reset
        </Button>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="New Password"
        type="password"
        id="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isLoading}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="confirmPassword"
        label="Confirm New Password"
        type="password"
        id="confirmPassword"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        disabled={isLoading}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={isLoading}
      >
        {isLoading ? <CircularProgress size={24} /> : 'Reset Password'}
      </Button>
      <Button
        fullWidth
        variant="text"
        onClick={() => router.push('/')}
        disabled={isLoading}
      >
        Back to Login
      </Button>
    </Box>
  );
}

// Wrap the form in a Suspense boundary to fix the deployment error with useSearchParams
export function ResetPasswordForm() {
  return (
    <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>}>
      <ResetPasswordFormContent />
    </Suspense>
  );
} 