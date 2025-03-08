'use client';

import { Container, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import ProfileWidget from '@/app/components/widgets/ProfileWidget';

const ProfileContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: '100%',
}));

const PageTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(4),
  fontSize: '2rem',
  fontWeight: 600,
}));

export default function ProfilePage() {
  return (
    <ProfileContainer>
      <Box sx={{ maxWidth: 1200, margin: '0 auto' }}>
        <PageTitle>Client Profile</PageTitle>
        <ProfileWidget />
      </Box>
    </ProfileContainer>
  );
} 