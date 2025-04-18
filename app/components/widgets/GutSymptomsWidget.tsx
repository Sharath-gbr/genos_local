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

async function fetchGutSymptoms(email: string) {
  console.log('Fetching gut symptoms for email:', email);
  const response = await fetch(`/api/medical-conditions?email=${encodeURIComponent(email)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch gut symptoms data');
  }
  const data = await response.json();
  console.log('API Response:', data);
  return data;
}

export default function GutSymptomsWidget() {
  const { data: session } = useSession();
  const email = session?.user?.email;

  const { data, isLoading, error } = useQuery({
    queryKey: ['gutSymptoms', email],
    queryFn: () => fetchGutSymptoms(email || ''),
    enabled: !!email,
  });

  console.log('Raw data from query:', data);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <Typography>Loading gut symptoms data...</Typography>
      </Box>
    );
  }

  if (error) {
    console.error('Error fetching gut symptoms:', error);
    return (
      <Box sx={{ p: 2, color: 'error.main' }}>
        Error loading gut symptoms data
      </Box>
    );
  }

  const gutData = {
    bowelMovement: data?.fields?.['How is your bowel movement?'] || '-',
    bloating: data?.fields?.['Do you experience bloating?'] || '-',
    burping: data?.fields?.['Do you burp frequently?'] || '-',
    flatulence: data?.fields?.['Do you frequently experience increased flatulence?'] || '-'
  };

  console.log('Processed gut data:', gutData);

  return (
    <StyledAccordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: theme => theme.palette.primary.main }} />}
        aria-controls="gut-symptoms-content"
        id="gut-symptoms-header"
      >
        <SectionTitle>Gut Symptoms</SectionTitle>
      </AccordionSummary>
      <AccordionDetails>
        <GridContainer>
          <ContentBox>
            <Typography variant="subtitle2" sx={{ color: theme => theme.palette.primary.main, mb: 2 }}>
              Bowel Movement
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <Box component="span" sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                Bowel Movement:
              </Box>
              <Box component="span" sx={{ color: '#FFFFFF' }}> {gutData.bowelMovement}</Box>
            </Typography>
          </ContentBox>

          <ContentBox>
            <Typography variant="subtitle2" sx={{ color: theme => theme.palette.primary.main, mb: 2 }}>
              Digestive Issues
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <Box component="span" sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                Bloating:
              </Box>
              <Box component="span" sx={{ color: '#FFFFFF' }}> {gutData.bloating}</Box>
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <Box component="span" sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                Burping:
              </Box>
              <Box component="span" sx={{ color: '#FFFFFF' }}> {gutData.burping}</Box>
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <Box component="span" sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                Flatulence:
              </Box>
              <Box component="span" sx={{ color: '#FFFFFF' }}> {gutData.flatulence}</Box>
            </Typography>
          </ContentBox>
        </GridContainer>
      </AccordionDetails>
    </StyledAccordion>
  );
} 