import SignUpForm from '@/app/components/auth/SignUpForm';
import { Box, Typography } from '@mui/material';

/**
 * Sign-up page that renders the SignUpForm component 
 * This page allows new users to register for an account
 */
export default function SignUpPage() {
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#1E1E1E', // Dark matte grey background
      color: 'white' 
    }}>
      <Box sx={{ 
        textAlign: 'center', 
        pt: 4,
        pb: 2
      }}>
        <Typography 
          variant="h2" 
          component="h1"
          sx={{ 
            fontWeight: 700,
            fontSize: { xs: '2.5rem', sm: '3rem' }
          }}
        >
          NEN
        </Typography>
      </Box>
      <SignUpForm />
    </Box>
  );
} 