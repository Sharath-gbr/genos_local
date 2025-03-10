'use client';

import { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box, List, ListItem, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSession } from 'next-auth/react';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';

// Interfaces
interface MedicalCondition {
  condition: string;
  status: string;
}

interface MedicalConditionsData {
  intakeConditions: MedicalCondition[];
  diagnosedConditions: MedicalCondition[];
  medicalHistory: MedicalCondition[];
}

// Styled Components matching client portal theme
const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: 'rgba(18, 18, 18, 0.8)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255, 95, 31, 0.2)',
  borderRadius: '16px',
  padding: theme.spacing(3),
  height: '100%',
  minHeight: 300,
  transition: 'all 0.3s ease',
  '&:hover': {
    border: '1px solid rgba(255, 95, 31, 0.5)',
    boxShadow: '0 4px 20px rgba(255, 95, 31, 0.1)',
  }
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 600,
  fontSize: '1.25rem',
  marginBottom: theme.spacing(3),
  paddingBottom: theme.spacing(1),
  borderBottom: '1px solid rgba(255, 95, 31, 0.2)',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const ConditionItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(2, 0),
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  '&:last-child': {
    borderBottom: 'none',
  }
}));

const ConditionText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontSize: '0.95rem',
  fontWeight: 500,
}));

const StatusText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.85rem',
  marginTop: theme.spacing(0.5),
}));

const ConditionName = styled(Typography)(({ theme }) => ({
  color: '#FFFFFF',  // White text
  fontSize: '1rem',
  fontWeight: 500,
  marginBottom: theme.spacing(0.5)
}));

const ConditionStatus = styled(Typography)(({ theme }) => ({
  color: '#FF5F1F',  // Orange text for status
  fontSize: '0.9rem',
  marginBottom: theme.spacing(2)
}));

const ScrollablePaper = styled(StyledPaper)`
  max-height: ${({ theme }) => ({
    xs: '500px',  // Smaller height on mobile
    md: '700px'
  })};
  padding: ${({ theme }) => ({
    xs: theme.spacing(2),  // Smaller padding on mobile
    md: theme.spacing(3)
  })};
  overflow: auto;
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 95, 31, 0.3);
    border-radius: 4px;
    &:hover {
      background: rgba(255, 95, 31, 0.5);
    }
  }
`;

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  background: 'transparent',
  color: theme.palette.common.white,
  '&:before': {
    display: 'none',
  },
  '& .MuiAccordionSummary-root': {
    borderBottom: '1px solid rgba(255, 95, 31, 0.2)',
  },
  '& .MuiAccordionSummary-content': {
    margin: '8px 0',
  },
  '& .MuiAccordionDetails-root': {
    padding: theme.spacing(2, 1),
  },
}));

const GroupTitle = styled(Typography)`
  color: ${({ theme }) => theme.palette.primary.main};
  font-size: ${({ theme }) => ({
    xs: '1rem',  // Smaller font on mobile
    md: '1.1rem'
  })};
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

// Update the ConditionSection component
function ConditionSection({ title, conditions }: { title: string, conditions: MedicalCondition[] }) {
  return (
    <Grid item xs={12} md={4}>
      <ScrollablePaper elevation={0}>
        <StyledAccordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: 'primary.main' }} />}
          >
            <SectionTitle>
              {title} ({conditions.length})
            </SectionTitle>
          </AccordionSummary>
          <AccordionDetails>
            <List disablePadding>
              {conditions.map((item, idx) => (
                <Box key={idx} sx={{ mb: 2 }}>
                  <ConditionName>
                    {item.condition}
                  </ConditionName>
                  {item.status !== item.condition && (
                    <ConditionStatus>
                      {item.status}
                    </ConditionStatus>
                  )}
                </Box>
              ))}
            </List>
          </AccordionDetails>
        </StyledAccordion>
      </ScrollablePaper>
    </Grid>
  );
}

export default function MedicalConditionsGrid() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MedicalConditionsData>({
    intakeConditions: [],
    diagnosedConditions: [],
    medicalHistory: []
  });

  useEffect(() => {
    const fetchMedicalConditions = async () => {
      try {
        if (!session?.user?.email) {
          setError('No user email found');
          setLoading(false);
          return;
        }

        const response = await fetch(
          `/api/medical-conditions?email=${encodeURIComponent(session.user.email)}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch medical conditions');
        }

        const responseData = await response.json();

        // Parse conditions from bullet-point lists
        const parseConditions = (text: string): MedicalCondition[] => {
          if (!text) return [];
          return text.split('\n')
            .map(line => line.trim())
            .filter(line => line.startsWith('•'))
            .map(line => {
              const [condition, status] = line.substring(1).trim().split(':').map(s => s.trim());
              return {
                condition: condition || '',
                status: status || condition
              };
            });
        };

        // Get conditions from each category in the Airtable response
        const currentConditions = parseConditions(responseData.fields['Conditions from Intake Form']);
        const diagnosedConditions = parseConditions(responseData.fields['Diagnosed Conditions']);
        const medicalHistory = parseConditions(responseData.fields['Medical History']);

        setData({
          intakeConditions: currentConditions,
          diagnosedConditions: diagnosedConditions,
          medicalHistory: medicalHistory
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load medical conditions');
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalConditions();
  }, [session]);

  if (loading) {
    return (
      <Box sx={{ 
        p: 3, 
        textAlign: 'center',
        color: 'primary.main'
      }}>
        <Typography>Loading medical conditions...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        p: 3, 
        textAlign: 'center', 
        color: 'error.main'
      }}>
        <Typography>{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <ConditionSection 
          title="Current Conditions" 
          conditions={data.intakeConditions} 
        />
        <ConditionSection 
          title="Diagnosed Conditions" 
          conditions={data.diagnosedConditions} 
        />
        <ConditionSection 
          title="Medical History" 
          conditions={data.medicalHistory} 
        />
      </Grid>
    </Box>
  );
} 