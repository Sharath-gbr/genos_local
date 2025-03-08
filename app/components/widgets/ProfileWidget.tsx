'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Skeleton,
  Box,
  Divider,
  Avatar,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ClientProfile } from '@/app/types/profile';
import { CameraAlt as CameraIcon } from '@mui/icons-material';

const ProfileCard = styled(Card)(({ theme }) => ({
  backgroundColor: 'rgba(35, 31, 32, 0.95)',
  border: `1px solid ${theme.palette.primary.main}`,
  borderRadius: 16,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: `0 4px 20px ${theme.palette.primary.main}25`,
  },
}));

const ProfileHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
  padding: theme.spacing(3),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const AvatarWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  marginRight: theme.spacing(3),
  '&:hover .upload-button': {
    opacity: 1,
  },
}));

const UploadButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  right: 0,
  backgroundColor: theme.palette.primary.main,
  padding: theme.spacing(1),
  opacity: 0,
  transition: 'opacity 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const ProfileField = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(0, 2),
}));

const FieldLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.grey[500],
  fontSize: '0.875rem',
  marginBottom: theme.spacing(0.5),
}));

const FieldValue = styled(Typography)(({ theme }) => ({
  color: theme.palette.common.white,
  fontSize: '1rem',
  fontWeight: 500,
}));

export default function ProfileWidget() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const handleProfilePictureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // For now, just create a local URL for preview
      const url = URL.createObjectURL(file);
      setProfilePicture(url);
      
      // TODO: Implement actual file upload to object storage
      console.log('Profile picture selected:', file);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (session?.user?.email) {
          const response = await fetch(
            `/api/profile?email=${encodeURIComponent(session.user.email)}`
          );
          
          if (!response.ok) {
            throw new Error('Failed to fetch profile');
          }

          const data = await response.json();
          setProfile(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session]);

  if (loading) {
    return <Skeleton variant="rectangular" height={400} />;
  }

  if (error) {
    return (
      <ProfileCard>
        <CardContent>
          <Typography color="error">Error: {error}</Typography>
        </CardContent>
      </ProfileCard>
    );
  }

  if (!profile) {
    return (
      <ProfileCard>
        <CardContent>
          <Typography>No profile data found</Typography>
        </CardContent>
      </ProfileCard>
    );
  }

  return (
    <ProfileCard>
      <ProfileHeader>
        <AvatarWrapper>
          <Avatar
            src={profilePicture || undefined}
            sx={{ width: 100, height: 100, border: '2px solid #FF5F1F' }}
          >
            {profile.firstName?.[0]}{profile.lastName?.[0]}
          </Avatar>
          <UploadButton
            className="upload-button"
            component="label"
            size="small"
          >
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleProfilePictureUpload}
            />
            <CameraIcon sx={{ fontSize: 20 }} />
          </UploadButton>
        </AvatarWrapper>
        <Box>
          <Typography variant="h4" color="primary" gutterBottom>
            {profile.firstName} {profile.lastName}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {profile.email}
          </Typography>
        </Box>
      </ProfileHeader>

      <CardContent>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <ProfileField>
              <FieldLabel>Gender</FieldLabel>
              <FieldValue>{profile.gender}</FieldValue>
            </ProfileField>
          </Grid>
          <Grid item xs={12} md={6}>
            <ProfileField>
              <FieldLabel>Age</FieldLabel>
              <FieldValue>{profile.age} years</FieldValue>
            </ProfileField>
          </Grid>
          <Grid item xs={12} md={6}>
            <ProfileField>
              <FieldLabel>Height</FieldLabel>
              <FieldValue>{profile.height} cm</FieldValue>
            </ProfileField>
          </Grid>
          <Grid item xs={12} md={6}>
            <ProfileField>
              <FieldLabel>Weight</FieldLabel>
              <FieldValue>{profile.weight} kg</FieldValue>
            </ProfileField>
          </Grid>
          <Grid item xs={12}>
            <ProfileField>
              <FieldLabel>Weight Loss Target</FieldLabel>
              <FieldValue>{profile.weightLossTarget}</FieldValue>
            </ProfileField>
          </Grid>
          <Grid item xs={12}>
            <ProfileField>
              <FieldLabel>Health Objective</FieldLabel>
              <FieldValue>{profile.healthObjective}</FieldValue>
            </ProfileField>
          </Grid>
          <Grid item xs={12} md={6}>
            <ProfileField>
              <FieldLabel>Diet Preference</FieldLabel>
              <FieldValue>{profile.dietPreference}</FieldValue>
            </ProfileField>
          </Grid>
          <Grid item xs={12} md={6}>
            <ProfileField>
              <FieldLabel>Country</FieldLabel>
              <FieldValue>{profile.country}</FieldValue>
            </ProfileField>
          </Grid>
        </Grid>
      </CardContent>
    </ProfileCard>
  );
} 