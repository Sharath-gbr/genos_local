'use client';

import { useState } from 'react';
import { TextField, Button, Box, Typography, Container, Alert, CircularProgress, Divider } from '@mui/material';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/services/auth-service';
import Link from 'next/link';

/**
 * Form data interface for the sign-up process
 */
export interface SignUpFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

/**
 * Sign-up form component that allows users to register with email and password
 * - Collects and validates user information
 * - Handles form submission and error states
 * - Redirects to login page upon successful registration
 */
export default function SignUpForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<SignUpFormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [errors, setErrors] = useState<Partial<SignUpFormData>>({});
  const [generalError, setGeneralError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Account created successfully! Redirecting to login...');
  const isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Handle input change for form fields
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field-specific error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    
    // Clear general error when user starts editing
    if (generalError) {
      setGeneralError('');
    }
  };

  /**
   * Validate form data before submission
   * Returns true if all validations pass
   */
  const validateForm = (): boolean => {
    const newErrors: Partial<SignUpFormData> = {};
    let isValid = true;

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
      isValid = false;
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
      isValid = false;
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  /**
   * Parse error messages from Supabase and other sources to user-friendly format
   */
  const parseErrorMessage = (error: string): string => {
    // Common Supabase auth errors
    if (error.includes('User already registered')) {
      return 'An account with this email already exists. Please sign in instead.';
    }
    if (error.includes('Email link is invalid or has expired')) {
      return 'The verification link is invalid or has expired. Please try signing up again.';
    }
    if (error.includes('Email rate limit exceeded')) {
      return 'Too many sign-up attempts. Please try again later.';
    }
    
    // Return the original error if no specific parsing is needed
    return error;
  };

  /**
   * Handle standard form submission with email verification
   */
  const handleStandardSignUp = async () => {
    try {
      // Call the auth service to register the user
      const result = await AuthService.signUp(formData);
      
      if (result.success) {
        setIsSuccess(true);
        setSuccessMessage('Account created successfully! Please check your email for verification link.');
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        const errorMessage = result.error 
          ? parseErrorMessage(result.error) 
          : 'Failed to create account';
        setGeneralError(errorMessage);
        
        // If it's an email-specific error, also set it in the field errors
        if (errorMessage.toLowerCase().includes('email')) {
          setErrors(prev => ({ ...prev, email: errorMessage }));
        }
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setGeneralError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle development-only signup without email verification
   */
  const handleDevSignUp = async () => {
    try {
      // Call the development API to create a pre-confirmed user
      const response = await fetch('/api/auth/dev-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);
        setSuccessMessage('Account created with pre-confirmed email! Redirecting to login...');
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        const errorMessage = data.error ? parseErrorMessage(data.error) : 'Failed to create account';
        setGeneralError(errorMessage);
      }
    } catch (error) {
      console.error('Dev sign up error:', error);
      setGeneralError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle form submission
   * - Validates the form data
   * - Calls the appropriate signup method
   * - Handles success/error states
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, skipEmailVerification = false) => {
    e.preventDefault();
    setGeneralError('');
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    if (skipEmailVerification && isDevelopment) {
      await handleDevSignUp();
    } else {
      await handleStandardSignUp();
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h4" sx={{ mb: 2 }}>
          Create Account
        </Typography>
        
        {isSuccess ? (
          <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
            {successMessage}
          </Alert>
        ) : (
          <>
            {generalError && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {generalError}
              </Alert>
            )}
            
            <Box component="form" onSubmit={(e) => handleSubmit(e, false)} sx={{ mt: 1, width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="First Name"
                name="firstName"
                autoComplete="given-name"
                value={formData.firstName}
                onChange={handleChange}
                error={!!errors.firstName}
                helperText={errors.firstName}
                disabled={isLoading}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                label="Last Name"
                name="lastName"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={handleChange}
                error={!!errors.lastName}
                helperText={errors.lastName}
                disabled={isLoading}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                label="Email Address"
                name="email"
                autoComplete="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                disabled={isLoading}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password || 'Password must be at least 8 characters with one uppercase letter and one number'}
                disabled={isLoading}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ 
                  mt: 3, 
                  mb: 2,
                  py: 1.5,
                  background: 'linear-gradient(45deg, #FF5F1F 30%, #FF8C69 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #E54600 30%, #FF5F1F 90%)',
                  },
                }}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
              </Button>
              
              {isDevelopment && (
                <>
                  <Divider sx={{ my: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      DEVELOPMENT OPTIONS
                    </Typography>
                  </Divider>
                  
                  <Button
                    fullWidth
                    variant="outlined"
                    color="warning"
                    onClick={(e) => handleSubmit(e as any, true)}
                    disabled={isLoading}
                    sx={{ mb: 2 }}
                  >
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up (Skip Email Verification)'}
                  </Button>
                </>
              )}
              
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link href="/login">
                    Sign in
                  </Link>
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
} 