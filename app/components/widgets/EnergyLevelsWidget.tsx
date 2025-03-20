'use client';

import { Accordion, AccordionSummary, AccordionDetails, Typography, Box } from '@mui/material';
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
  '&:before': {
    display: 'none',
  }
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 600,
  fontSize: '1.25rem',
}));

const GridContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
}));

const ContentBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: 'rgba(45, 45, 45, 0.8)',
  borderRadius: theme.shape.borderRadius,
  border: '1px solid rgba(255, 95, 31, 0.2)',
}));

interface EnergyLevelsData {
  energyStatus: {
    levels: string;
    fatigue: string;
  };
  medicalConditions: {
    hypothyroidism: string;
    anemia: string;
  };
  physicalSymptoms: {
    exhaustion: string;
    breathlessness: string;
  };
}

async function fetchEnergyLevels(email: string) {
  console.log('Fetching energy levels for email:', email);
  const response = await fetch(`/api/medical-conditions?email=${encodeURIComponent(email)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch energy levels data');
  }
  const data = await response.json();
  console.log('API Response:', data);
  return data;
}

export default function EnergyLevelsWidget() {
  const { data: session } = useSession();
  const email = session?.user?.email;

  const { data, isLoading, error } = useQuery({
    queryKey: ['energyLevels', email],
    queryFn: () => fetchEnergyLevels(email || ''),
    enabled: !!email,
  });

  console.log('Raw data from query:', data);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <Typography>Loading energy levels data...</Typography>
      </Box>
    );
  }

  if (error) {
    console.error('Error fetching energy levels:', error);
    return (
      <Box sx={{ p: 2, color: 'error.main' }}>
        Error loading energy levels data
      </Box>
    );
  }

  const energyData: EnergyLevelsData = {
    energyStatus: {
      levels: data?.fields?.['How are your energy levels?'] || '-',
      fatigue: data?.fields?.['Do you feel fatigued all the time?'] || 'No',
    },
    medicalConditions: {
      hypothyroidism: data?.fields?.['Have you been diagnosed with Hypothyroidism?'] || 'No',
      anemia: data?.fields?.['Have you been diagnosed with Anemia?'] || 'No',
    },
    physicalSymptoms: {
      exhaustion: data?.fields?.['Do you get exhausted from doing physical work?'] || 'No',
      breathlessness: data?.fields?.['Do you feel breathless on climbing stairs?'] || 'No',
    },
  };

  console.log('Processed energy data:', energyData);

  return (
    <StyledAccordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: theme => theme.palette.primary.main }} />}
        aria-controls="energy-levels-content"
        id="energy-levels-header"
      >
        <SectionTitle>Energy Levels History</SectionTitle>
      </AccordionSummary>
      <AccordionDetails>
        <GridContainer>
          <ContentBox>
            <Typography variant="subtitle2" sx={{ color: theme => theme.palette.primary.main, mb: 2 }}>
              General Energy
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <Box component="span" sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                Energy Levels:
              </Box>
              <Box component="span" sx={{ color: '#FFFFFF' }}> {energyData.energyStatus.levels}</Box>
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <Box component="span" sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                Fatigued all the time:
              </Box>
              <Box component="span" sx={{ color: '#FFFFFF' }}> {energyData.energyStatus.fatigue}</Box>
            </Typography>
          </ContentBox>

          <ContentBox>
            <Typography variant="subtitle2" sx={{ color: theme => theme.palette.primary.main, mb: 2 }}>
              Medical Conditions
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <Box component="span" sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                Hypothyroidism:
              </Box>
              <Box component="span" sx={{ color: '#FFFFFF' }}> {energyData.medicalConditions.hypothyroidism}</Box>
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <Box component="span" sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                Anemia:
              </Box>
              <Box component="span" sx={{ color: '#FFFFFF' }}> {energyData.medicalConditions.anemia}</Box>
            </Typography>
          </ContentBox>

          <ContentBox>
            <Typography variant="subtitle2" sx={{ color: theme => theme.palette.primary.main, mb: 2 }}>
              Physical Symptoms
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <Box component="span" sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                Exhausted from physical work:
              </Box>
              <Box component="span" sx={{ color: '#FFFFFF' }}> {energyData.physicalSymptoms.exhaustion}</Box>
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <Box component="span" sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                Breathless on climbing stairs:
              </Box>
              <Box component="span" sx={{ color: '#FFFFFF' }}> {energyData.physicalSymptoms.breathlessness}</Box>
            </Typography>
          </ContentBox>
        </GridContainer>
      </AccordionDetails>
    </StyledAccordion>
  );
} 