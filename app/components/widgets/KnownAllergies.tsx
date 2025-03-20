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

const ContentBox = styled(Box)(({ theme }) => ({
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

  const allergies = {
    medication: medicationAllergies,
    food: foodAllergies,
    environmental: environmentalAllergies,
    intolerances: foodIntolerances,
  };

  return (
    <StyledAccordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: theme => theme.palette.primary.main }} />}
        aria-controls="allergies-content"
        id="allergies-header"
      >
        <SectionTitle>Known Allergies</SectionTitle>
      </AccordionSummary>
      <AccordionDetails>
        <GridContainer>
          <ContentBox>
            <Typography variant="subtitle2" sx={{ color: theme => theme.palette.primary.main, mb: 2 }}>
              Medication Allergies
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <Box component="span" sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                Medication Allergies:
              </Box>
              <Box component="span" sx={{ color: '#FFFFFF' }}> {allergies.medication || '-'}</Box>
            </Typography>
          </ContentBox>

          <ContentBox>
            <Typography variant="subtitle2" sx={{ color: theme => theme.palette.primary.main, mb: 2 }}>
              Food Allergies
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <Box component="span" sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                Food Allergies:
              </Box>
              <Box component="span" sx={{ color: '#FFFFFF' }}> {allergies.food || '-'}</Box>
            </Typography>
          </ContentBox>

          <ContentBox>
            <Typography variant="subtitle2" sx={{ color: theme => theme.palette.primary.main, mb: 2 }}>
              Environmental Allergies
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <Box component="span" sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                Environmental Allergies:
              </Box>
              <Box component="span" sx={{ color: '#FFFFFF' }}> {allergies.environmental || '-'}</Box>
            </Typography>
          </ContentBox>

          <ContentBox>
            <Typography variant="subtitle2" sx={{ color: theme => theme.palette.primary.main, mb: 2 }}>
              Food Intolerances
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <Box component="span" sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                Food Intolerances:
              </Box>
              <Box component="span" sx={{ color: '#FFFFFF' }}> {allergies.intolerances || '-'}</Box>
            </Typography>
          </ContentBox>
        </GridContainer>
      </AccordionDetails>
    </StyledAccordion>
  );
} 