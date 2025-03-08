'use client';

import { Box, CircularProgress } from '@mui/material';
import { keyframes } from '@mui/system';
import { styled } from '@mui/material/styles';

const pulse = keyframes`
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
`;

const StyledLoader = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '200px',
  animation: `${pulse} 1.5s ease-in-out infinite`,
  '& .MuiCircularProgress-root': {
    color: theme.palette.primary.main,
  },
}));

export default function LoadingSpinner() {
  return (
    <StyledLoader>
      <CircularProgress size={40} thickness={4} />
    </StyledLoader>
  );
} 