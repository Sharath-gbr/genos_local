import { styled } from '@mui/material/styles';
import { Grid } from '@mui/material';

export const GridContainer = styled(Grid)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
})); 