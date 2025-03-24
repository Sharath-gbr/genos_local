'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Button,
  Paper,
  Box,
  Grid,
  Card,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LoadingSpinner from '../components/LoadingSpinner';
import { UserCircleIcon, ClipboardDocumentListIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { useUser } from '@/contexts/UserContext';

const DashboardContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: '100%',
  position: 'relative',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const WelcomeSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  backgroundColor: '#2C2C2C',
  borderRadius: theme.shape.borderRadius,
  border: '1px solid rgba(255, 95, 31, 0.2)',
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2.5),
    marginBottom: theme.spacing(2),
  },
}));

const WelcomeText = styled(Typography)(({ theme }) => ({
  color: '#FFFFFF',
  fontSize: '2.5rem',
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  letterSpacing: '-0.5px',
  [theme.breakpoints.down('sm')]: {
    fontSize: '2rem',
    marginBottom: theme.spacing(1),
  },
}));

const SubText = styled(Typography)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.7)',
  fontSize: '1rem',
  marginBottom: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.9rem',
    marginBottom: theme.spacing(2),
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#1E1E1E',
  border: `1px solid ${theme.palette.primary.main}`,
  borderRadius: 16,
  padding: theme.spacing(3),
  transition: 'all 0.2s ease-in-out',
  height: '100%', // Ensure consistent height
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 4px 30px rgba(255, 51, 102, 0.2)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    '&:hover': {
      transform: 'translateY(-3px)',
    },
  },
}));

const CardTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: '1.5rem',
  fontWeight: 600,
  marginBottom: theme.spacing(1),
  textShadow: '0 0 10px rgba(255, 51, 102, 0.3)',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.25rem',
  },
}));

const CardDescription = styled(Typography)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.6)',
  fontSize: '0.9rem',
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.85rem',
  },
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
  [theme.breakpoints.down('sm')]: {
    width: 36,
    height: 36,
    marginBottom: theme.spacing(1.5),
  },
}));

const GlowingText = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  textShadow: '0 0 10px rgba(255, 95, 31, 0.3)',
  fontWeight: 600,
}));

const SignOutButton = styled(Button)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(3),
  right: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    top: theme.spacing(2),
    right: theme.spacing(2),
    fontSize: '0.8rem',
    padding: theme.spacing(0.5, 1.5),
  },
}));

export default function Dashboard() {
  const { user, loading, signOut } = useUser();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    
    // Get user's name from metadata if available
    if (user && user.user_metadata) {
      const firstName = user.user_metadata.first_name || '';
      setUserName(firstName);
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      // The router.push is handled in the signOut function from UserContext
    } catch (error) {
      console.error('Sign out error:', error);
      // Fallback navigation if signOut fails
      router.push('/login');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <DashboardContainer>
      <SignOutButton
        variant="contained"
        color="primary"
        onClick={handleSignOut}
      >
        Sign Out
      </SignOutButton>

      <WelcomeSection>
        <WelcomeText>
          {userName ? `Welcome, ${userName}` : 'Welcome'}
        </WelcomeText>
        <SubText>
          {/* User email hidden for privacy */}
        </SubText>

        <Grid container spacing={isMobile ? 2 : 3}>
          <Grid item xs={12} sm={6} md={4}>
            <StyledCard 
              onClick={() => router.push('/dashboard/profile')}
              sx={{ cursor: 'pointer' }}
            >
              <IconWrapper>
                <UserCircleIcon style={{ width: 24, height: 24, color: '#FF5F1F' }} />
              </IconWrapper>
              <CardTitle>
                Profile
              </CardTitle>
              <CardDescription>
                Manage your personal information and preferences
              </CardDescription>
            </StyledCard>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StyledCard>
              <IconWrapper>
                <ClipboardDocumentListIcon style={{ width: 24, height: 24, color: '#FF5F1F' }} />
              </IconWrapper>
              <CardTitle>
                Assessments
              </CardTitle>
              <CardDescription>
                View and complete your assessments
              </CardDescription>
            </StyledCard>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StyledCard>
              <IconWrapper>
                <ChartBarIcon style={{ width: 24, height: 24, color: '#FF5F1F' }} />
              </IconWrapper>
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