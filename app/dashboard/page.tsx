'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Button,
  Paper,
  Box,
  Grid,
  Card,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LoadingSpinner from '../components/LoadingSpinner';
import { UserCircleIcon, ClipboardDocumentListIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const DashboardContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: '100%',
  position: 'relative',
}));

const WelcomeSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  backgroundColor: '#2C2C2C',
  borderRadius: theme.shape.borderRadius,
  border: '1px solid rgba(255, 95, 31, 0.2)',
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
}));

const WelcomeText = styled(Typography)(({ theme }) => ({
  color: '#FFFFFF',
  fontSize: '2.5rem',
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  letterSpacing: '-0.5px',
}));

const SubText = styled(Typography)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.7)',
  fontSize: '1rem',
  marginBottom: theme.spacing(4),
}));

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#1E1E1E',
  border: `1px solid ${theme.palette.primary.main}`,
  borderRadius: 16,
  padding: theme.spacing(3),
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 4px 30px rgba(255, 51, 102, 0.2)',
  },
}));

const CardTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: '1.5rem',
  fontWeight: 600,
  marginBottom: theme.spacing(1),
  textShadow: '0 0 10px rgba(255, 51, 102, 0.3)',
}));

const CardDescription = styled(Typography)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.6)',
  fontSize: '0.9rem',
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: '50%',
  backgroundColor: 'rgba(255, 95, 31, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  transition: 'all 0.2s ease-in-out',
}));

const GlowingText = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  textShadow: '0 0 10px rgba(255, 95, 31, 0.3)',
  fontWeight: 600,
}));

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  const handleSignOut = async () => {
    try {
      await signOut({ 
        redirect: true,
        callbackUrl: '/'
      });
    } catch (error) {
      console.error('Sign out error:', error);
      // Fallback navigation if signOut fails
      router.push('/');
    }
  };

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  return (
    <DashboardContainer>
      <WelcomeSection>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3 
        }}>
          <WelcomeText>
            Welcome to Dashboard
          </WelcomeText>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSignOut}
            sx={{
              backgroundColor: 'rgba(255, 95, 31, 0.9)',
              '&:hover': {
                backgroundColor: 'rgba(255, 95, 31, 1)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 20px rgba(255, 95, 31, 0.3)',
              },
            }}
          >
            Sign Out
          </Button>
        </Box>

        <SubText>
          Logged in as: {session?.user?.email}
        </SubText>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <StyledCard>
              <CardTitle>
                Profile
              </CardTitle>
              <CardDescription>
                Manage your personal information and preferences
              </CardDescription>
            </StyledCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <StyledCard>
              <CardTitle>
                Assessments
              </CardTitle>
              <CardDescription>
                View and complete your assessments
              </CardDescription>
            </StyledCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <StyledCard>
              <CardTitle>
                Progress
              </CardTitle>
              <CardDescription>
                Track your progress and achievements
              </CardDescription>
            </StyledCard>
          </Grid>
        </Grid>
      </WelcomeSection>
    </DashboardContainer>
  );
} 