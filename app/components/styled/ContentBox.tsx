import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

export const ContentBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  '& .MuiTypography-subtitle2': {
    color: theme.palette.text.primary,
    fontWeight: 600,
    marginBottom: theme.spacing(1),
  },
  '& .MuiTypography-body2': {
    color: theme.palette.text.secondary,
  },
})); 