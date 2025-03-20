'use client';

import { Accordion, AccordionSummary, AccordionDetails, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';

// Reuse styled components from our template
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
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', // Slightly wider for longer content
  gap: theme.spacing(2),
  padding: theme.spacing(2),
}));

const ContentBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: 'rgba(45, 45, 45, 0.8)',
  borderRadius: theme.shape.borderRadius,
  minHeight: '100px', // Increased for multiple lines of content
  border: '1px solid rgba(255, 95, 31, 0.2)',
  transition: 'all 0.3s ease',
  '&:hover': {
    border: '1px solid rgba(255, 95, 31, 0.5)',
    boxShadow: '0 4px 20px rgba(255, 95, 31, 0.1)',
  }
}));

// Type for our sleep history data
interface SleepHistoryData {
  generalSleep: {
    quality: string;
    freshness: string;
  };
  sleepIssues: {
    difficultyFallingAsleep: string;
    wakesDuringNight: string;
    snoring: string;
    nasalSeptum: string;
  };
  coffeeHabits: {
    drinksCoffee: string;
    cupsPerDay: string;
    timing: string;
  };
}

async function fetchSleepHistory(email: string) {
  console.log('Fetching sleep history for email:', email);
  const response = await fetch(`/api/medical-conditions?email=${encodeURIComponent(email)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch sleep history data');
  }
  const data = await response.json();
  console.log('API Response:', data);
  return data;
}

export default function SleepHistoryWidget() {
  const { data: session } = useSession();
  const email = session?.user?.email;

  const { data, isLoading, error } = useQuery({
    queryKey: ['sleepHistory', email],
    queryFn: () => fetchSleepHistory(email || ''),
    enabled: !!email,
  });

  console.log('Raw data from query:', data);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <Typography>Loading sleep history data...</Typography>
      </Box>
    );
  }

  if (error) {
    console.error('Error fetching sleep history:', error);
    return (
      <Box sx={{ p: 2, color: 'error.main' }}>
        Error loading sleep history data
      </Box>
    );
  }

  // Process and organize the data
  const sleepData: SleepHistoryData = {
    generalSleep: {
      quality: data?.fields?.['How is your sleep?'] || '-',
      freshness: data?.fields?.['Do you feel fresh when you wake up in the morning?'] || '-',
    },
    sleepIssues: {
      difficultyFallingAsleep: data?.fields?.['Do you find it difficult to sleep after lying down?'] || '-',
      wakesDuringNight: data?.fields?.['Do you wake up in the middle of sleep and struggles to sleep back?'] || '-',
      snoring: data?.fields?.['Do you Snore?'] || '-',
      nasalSeptum: data?.fields?.['Have you been diagnosed with a Deviated nasal septum?'] || '-',
    },
    coffeeHabits: {
      drinksCoffee: data?.fields?.['Do you drink Coffee?'] || '-',
      cupsPerDay: data?.fields?.['How many cups of Coffee do you drink in a day?'] || '-',
      timing: data?.fields?.['At what time do you take your coffee?'] || '-',
    },
  };

  console.log('Processed sleep data:', sleepData);

  return (
    <StyledAccordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: theme => theme.palette.primary.main }} />}
        aria-controls="sleep-history-content"
        id="sleep-history-header"
      >
        <SectionTitle>Sleep History</SectionTitle>
      </AccordionSummary>
      <AccordionDetails>
        <GridContainer>
          {/* General Sleep Section */}
          <ContentBox>
            <Typography variant="subtitle2" sx={{ color: theme => theme.palette.primary.main, mb: 2 }}>
              Sleep Quality
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <Box component="span" sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                Sleep Quality:
              </Box>
              <Box component="span" sx={{ color: '#FFFFFF' }}> {sleepData.generalSleep.quality}</Box>
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <Box component="span" sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                Morning Freshness:
              </Box>
              <Box component="span" sx={{ color: '#FFFFFF' }}> {sleepData.generalSleep.freshness}</Box>
            </Typography>
          </ContentBox>

          {/* Sleep Issues Section */}
          <ContentBox>
            <Typography variant="subtitle2" sx={{ color: theme => theme.palette.primary.main, mb: 2 }}>
              Sleep Issues
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <Box component="span" sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                Difficulty Falling Asleep:
              </Box>
              <Box component="span" sx={{ color: '#FFFFFF' }}> {sleepData.sleepIssues.difficultyFallingAsleep}</Box>
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <Box component="span" sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                Night Wakings:
              </Box>
              <Box component="span" sx={{ color: '#FFFFFF' }}> {sleepData.sleepIssues.wakesDuringNight}</Box>
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <Box component="span" sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                Snoring:
              </Box>
              <Box component="span" sx={{ color: '#FFFFFF' }}> {sleepData.sleepIssues.snoring}</Box>
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <Box component="span" sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                Deviated Nasal Septum:
              </Box>
              <Box component="span" sx={{ color: '#FFFFFF' }}> {sleepData.sleepIssues.nasalSeptum}</Box>
            </Typography>
          </ContentBox>

          {/* Coffee Habits Section */}
          <ContentBox>
            <Typography variant="subtitle2" sx={{ color: '#FFFFFF', mb: 1 }}>
              Coffee Habits
            </Typography>
            <Typography variant="body2" sx={{ color: '#999999', mb: 1 }}>
              Drinks Coffee: {sleepData.coffeeHabits.drinksCoffee}
            </Typography>
            <Typography variant="body2" sx={{ color: '#999999', mb: 1 }}>
              Cups per Day: {sleepData.coffeeHabits.cupsPerDay}
            </Typography>
            <Typography variant="body2" sx={{ color: '#999999' }}>
              Timing: {sleepData.coffeeHabits.timing}
            </Typography>
          </ContentBox>
        </GridContainer>
      </AccordionDetails>
    </StyledAccordion>
  );
} 