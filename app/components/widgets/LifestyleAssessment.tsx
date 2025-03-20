'use client';

import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, Chip } from '@mui/material';
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

const LifestyleBox = styled(Box)(({ theme }) => ({
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

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  borderRadius: '16px',
  fontWeight: 500,
  fontSize: '0.875rem',
}));

async function fetchMedicalConditions(email: string) {
  const response = await fetch(`/api/medical-conditions?email=${encodeURIComponent(email)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch medical conditions');
  }
  return response.json();
}

const getChipColor = (condition: string) => {
  const colorMap: { [key: string]: { bg: string; color: string } } = {
    'Diabetes': { bg: '#E3F2FD', color: '#1565C0' },
    'Hypertension (High Blood Pressure)': { bg: '#E8F5E9', color: '#2E7D32' },
    'Cancer': { bg: '#FFF3E0', color: '#E65100' },
    'Depression': { bg: '#E8EAF6', color: '#283593' },
    'Alzheimer\'s': { bg: '#F3E5F5', color: '#6A1B9A' },
    'Asthma': { bg: '#FCE4EC', color: '#AD1457' },
    'Gout': { bg: '#E0F7FA', color: '#00838F' },
    'High cholesterol': { bg: '#F1F8E9', color: '#558B2F' },
    'Cerebro-Vascular Accident (Stroke)': { bg: '#FFF8E1', color: '#FF8F00' },
    'Parkinson\'s disease': { bg: '#F3E5F5', color: '#6A1B9A' },
    'Schizophrenia': { bg: '#FFE0B2', color: '#E65100' },
    'Hypothyroidism': { bg: '#E1F5FE', color: '#0277BD' },
    'Vitiligo': { bg: '#F5F5F5', color: '#424242' },
    'Rheumatoid arthritis': { bg: '#FFEBEE', color: '#B71C1C' },
    'Migraine': { bg: '#E8EAF6', color: '#1A237E' },
    'PCOD': { bg: '#F3E5F5', color: '#6A1B9A' },
    'Arthritis': { bg: '#E8F5E9', color: '#1B5E20' },
    'Cataract': { bg: '#E3F2FD', color: '#0D47A1' },
    'Kidney Stones': { bg: '#EFEBE9', color: '#3E2723' }
  };

  return colorMap[condition] || { bg: '#F5F5F5', color: '#424242' };
};

export default function LifestyleAndFamilyHistory() {
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
        <Typography>Loading lifestyle and family history data...</Typography>
      </Box>
    );
  }

  if (error) {
    console.error('Error fetching medical conditions:', error);
    return (
      <Box sx={{ p: 2, color: 'error.main' }}>
        Error loading lifestyle and family history data
      </Box>
    );
  }

  console.log('API Response:', data);
  console.log('Fields:', data?.fields);

  // Extract lifestyle data from the response
  const alcoholStatus = data?.fields?.['Do you drink Alcohol?'] || '-';
  const smokingStatus = data?.fields?.['Do you Smoke?'] || '-';
  const substanceUsage = data?.fields?.['Any Other substance usage?'] || '-';
  
  // Extract family history from fields
  const familyConditions = Object.entries(data?.fields || {})
    .filter(([key, value]) => key.startsWith('Family History of') && value === 'Yes')
    .map(([key]) => key.replace('Family History of ', ''))
    .join(', ') || '-';

  console.log('Family Conditions:', familyConditions);

  // Static family history conditions for now
  const familyHistory = [
    'Diabetes',
    'Hypertension (High Blood Pressure)',
    'Cancer',
    'Depression',
    'Alzheimer\'s',
    'Asthma',
    'Gout',
    'High cholesterol',
    'Cerebro-Vascular Accident (Stroke)',
    'Parkinson\'s disease',
    'Schizophrenia',
    'Hypothyroidism',
    'Vitiligo',
    'Rheumatoid arthritis',
    'Migraine',
    'PCOD',
    'Arthritis',
    'Cataract',
    'Kidney Stones'
  ];

  const getLifestyleChipColor = (value: string) => {
    // Define colors for lifestyle values
    const colorMap: { [key: string]: { bg: string; color: string } } = {
      'Social Drinker': { bg: '#E3F2FD', color: '#1565C0' },
      'Smoke Frequently': { bg: '#FCE4EC', color: '#AD1457' },
      'Other drugs': { bg: '#FFF3E0', color: '#E65100' },
      'LSD': { bg: '#E8EAF6', color: '#283593' },
      'Chewing Tobacco': { bg: '#FFEBEE', color: '#B71C1C' },
      'Marijuana': { bg: '#E8F5E9', color: '#2E7D32' },
    };
    return colorMap[value] || { bg: '#F5F5F5', color: '#424242' };
  };

  return (
    <StyledAccordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: theme => theme.palette.primary.main }} />}
        aria-controls="lifestyle-family-history-content"
        id="lifestyle-family-history-header"
      >
        <SectionTitle>Lifestyle & Family History</SectionTitle>
      </AccordionSummary>
      <AccordionDetails>
        <GridContainer>
          <LifestyleBox>
            <Typography variant="subtitle2" sx={{ color: '#FFFFFF', mb: 1 }}>
              Alcohol Consumption
            </Typography>
            <Typography variant="body2" sx={{ color: '#999999' }}>
              {alcoholStatus}
            </Typography>
          </LifestyleBox>
          <LifestyleBox>
            <Typography variant="subtitle2" sx={{ color: '#FFFFFF', mb: 1 }}>
              Smoking Status
            </Typography>
            <Typography variant="body2" sx={{ color: '#999999' }}>
              {smokingStatus}
            </Typography>
          </LifestyleBox>
          <LifestyleBox>
            <Typography variant="subtitle2" sx={{ color: '#FFFFFF', mb: 1 }}>
              Other Substances
            </Typography>
            <Typography variant="body2" sx={{ color: '#999999' }}>
              {substanceUsage}
            </Typography>
          </LifestyleBox>
          <LifestyleBox>
            <Typography variant="subtitle2" sx={{ color: '#FFFFFF', mb: 1 }}>
              Family History
            </Typography>
            <Typography variant="body2" sx={{ color: '#999999' }}>
              {familyConditions}
            </Typography>
          </LifestyleBox>
        </GridContainer>
      </AccordionDetails>
    </StyledAccordion>
  );
} 