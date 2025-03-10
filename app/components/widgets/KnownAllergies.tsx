'use client';

import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  backgroundColor: 'rgba(18, 18, 18, 0.8)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255, 95, 31, 0.2)',
  borderRadius: '16px !important',
  color: '#FFFFFF',
  transition: 'all 0.3s ease',
  '&:hover': {
    border: '1px solid rgba(255, 95, 31, 0.5)',
    boxShadow: '0 4px 20px rgba(255, 95, 31, 0.1)',
  },
  '&:before': {
    display: 'none',
  }
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 600,
  fontSize: '1.25rem',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const GridContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
}));

const AllergyCategoryBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: 'rgba(45, 45, 45, 0.8)',
  borderRadius: theme.shape.borderRadius,
  minHeight: '80px',
  border: '1px solid rgba(255, 95, 31, 0.2)',
  transition: 'all 0.3s ease',
  '&:hover': {
    border: '1px solid rgba(255, 95, 31, 0.5)',
    boxShadow: '0 4px 20px rgba(255, 95, 31, 0.1)',
  }
}));

async function fetchMedicalConditions(email: string) {
  const response = await fetch(`/api/medical-conditions?email=${encodeURIComponent(email)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch medical conditions');
  }
  return response.json();
}

export default function KnownAllergies() {
  const { data: session } = useSession();
  const email = session?.user?.email;

  const { data, isLoading, error } = useQuery({
    queryKey: ['medicalConditions', email],
    queryFn: () => fetchMedicalConditions(email || ''),
    enabled: !!email,
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, color: 'error.main' }}>
        Error loading allergies data
      </Box>
    );
  }

  // Extract allergy data from the response
  const medicationAllergies = data?.['Medication Allergies'] || '-';
  const foodAllergies = data?.['Food Allergies'] || '-';
  const environmentalAllergies = data?.['Environmental Allergies'] || '-';
  const foodIntolerances = data?.['Food Intolerances'] || '-';

  return (
    <StyledAccordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: theme => theme.palette.primary.main }} />}
        aria-controls="known-allergies-content"
        id="known-allergies-header"
      >
        <SectionTitle>Known Allergies</SectionTitle>
      </AccordionSummary>
      <AccordionDetails>
        <GridContainer>
          <AllergyCategoryBox>
            <Typography variant="subtitle2" sx={{ color: '#FFFFFF', mb: 1 }}>
              Medication Allergies
            </Typography>
            <Typography variant="body2" sx={{ color: '#999999' }}>{medicationAllergies}</Typography>
          </AllergyCategoryBox>
          <AllergyCategoryBox>
            <Typography variant="subtitle2" sx={{ color: '#FFFFFF', mb: 1 }}>
              Food Allergies
            </Typography>
            <Typography variant="body2" sx={{ color: '#999999' }}>{foodAllergies}</Typography>
          </AllergyCategoryBox>
          <AllergyCategoryBox>
            <Typography variant="subtitle2" sx={{ color: '#FFFFFF', mb: 1 }}>
              Environmental Allergies
            </Typography>
            <Typography variant="body2" sx={{ color: '#999999' }}>{environmentalAllergies}</Typography>
          </AllergyCategoryBox>
          <AllergyCategoryBox>
            <Typography variant="subtitle2" sx={{ color: '#FFFFFF', mb: 1 }}>
              Food Intolerances
            </Typography>
            <Typography variant="body2" sx={{ color: '#999999' }}>{foodIntolerances}</Typography>
          </AllergyCategoryBox>
        </GridContainer>
      </AccordionDetails>
    </StyledAccordion>
  );
} 