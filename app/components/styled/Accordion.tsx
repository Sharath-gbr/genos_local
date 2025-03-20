import { styled } from '@mui/material/styles';
import {
  Accordion,
  AccordionSummary as MuiAccordionSummary,
  AccordionDetails as MuiAccordionDetails,
} from '@mui/material';

export const StyledAccordion = styled(Accordion)(({ theme }) => ({
  backgroundColor: 'transparent',
  boxShadow: 'none',
  '&:before': {
    display: 'none',
  },
  '& .MuiAccordionSummary-root': {
    padding: 0,
  },
  '& .MuiAccordionDetails-root': {
    padding: theme.spacing(2, 0),
  },
}));

export const AccordionSummary = styled(MuiAccordionSummary)(({ theme }) => ({
  '& .MuiTypography-sectionTitle': {
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
}));

export const AccordionDetails = styled(MuiAccordionDetails)({
  padding: 0,
}); 