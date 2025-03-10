'use client';

import { useState, useEffect } from 'react';
import { Typography, Box, List, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSession } from 'next-auth/react';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';

interface Finding {
  finding: string;
  value: string;
}

interface BloodTestData {
  [key: string]: Finding[];
}

const BLOOD_TEST_CATEGORIES = [
  'Diabetic Markers Findings',
  'Complete Blood Count Findings',
  'Thyroid Markers Findings',
  'Iron Profile Findings',
  'Urinary Markers Findings',
  'Vitamin Markers Findings',
  'Renal Markers Findings',
  'Hormone Findings',
  'Cardiac Marker Findings',
  'Pancreatic Markers Findings',
  'Cholesterol Marker Findings',
  'Liver Marker Findings',
  'Electrolyte Findings'
];

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  background: 'rgba(18, 18, 18, 0.8)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255, 95, 31, 0.2)',
  borderRadius: '16px !important',
  color: theme.palette.common.white,
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
  marginBottom: 0,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const FindingText = styled(Typography)(({ theme }) => ({
  color: '#FFFFFF',
  fontSize: '0.875rem',
  fontWeight: 400,
  marginBottom: theme.spacing(0.5),
  lineHeight: 1.4,
}));

const SubSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1.5),
  padding: theme.spacing(1.5),
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: theme.spacing(1),
  '&:not(:first-of-type)': {
    marginTop: theme.spacing(1.5),
  }
}));

const SubSectionTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 500,
  fontSize: '1rem',
  marginBottom: theme.spacing(1),
}));

const GridContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5),
}));

export default function BloodReportAssessment() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [findings, setFindings] = useState<BloodTestData>({});

  useEffect(() => {
    const fetchBloodReport = async () => {
      try {
        if (!session?.user?.email) {
          console.error('No user email in session:', session);
          setError('No user email found');
          setLoading(false);
          return;
        }

        console.log('Fetching blood report for:', session.user.email);
        const response = await fetch(
          `/api/medical-conditions?email=${encodeURIComponent(session.user.email)}`
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error('Blood report API error:', {
            status: response.status,
            statusText: response.statusText,
            errorData
          });
          throw new Error(`Failed to fetch blood report: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Blood report data:', data);
        
        // Process all blood test categories
        const processedFindings: BloodTestData = {};
        
        BLOOD_TEST_CATEGORIES.forEach(category => {
          const categoryFindings = data.fields[category] || [];
          const parsedFindings = categoryFindings
            .filter((finding: string | null) => finding !== null)
            .map((finding: string) => {
              const line = finding.trim();
              const match = line.substring(1).trim().match(/(.*?)\s*\((.*?)\)/);
              if (match) {
                return {
                  finding: match[1].trim(),
                  value: match[2].trim()
                };
              }
              return null;
            })
            .filter(Boolean);

          if (parsedFindings.length > 0) {
            processedFindings[category] = parsedFindings;
          }
        });

        console.log('Processed findings:', processedFindings);
        setFindings(processedFindings);
      } catch (err) {
        console.error('Error in blood report component:', err);
        setError(err instanceof Error ? err.message : 'Failed to load blood report');
      } finally {
        setLoading(false);
      }
    };

    fetchBloodReport();
  }, [session]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography sx={{ textAlign: 'center', color: 'primary.main' }}>
          Loading blood report...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography sx={{ textAlign: 'center', color: 'error.main' }}>
          {error}
        </Typography>
      </Box>
    );
  }

  const hasFindings = Object.keys(findings).length > 0;

  if (!hasFindings) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography sx={{ textAlign: 'center', color: 'text.secondary' }}>
          No blood test findings available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <StyledAccordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: 'primary.main' }} />}
        >
          <SectionTitle>
            Blood Test Finding
          </SectionTitle>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 1 }}>
          <GridContainer>
            {Object.entries(findings).map(([category, categoryFindings]) => (
              <SubSection key={category}>
                <SubSectionTitle>
                  {category.replace(' Findings', '')} ({categoryFindings.length})
                </SubSectionTitle>
                <List disablePadding dense>
                  {categoryFindings.map((finding, idx) => (
                    <FindingText key={idx}>
                      • {finding.finding} ({finding.value})
                    </FindingText>
                  ))}
                </List>
              </SubSection>
            ))}
          </GridContainer>
        </AccordionDetails>
      </StyledAccordion>
    </Box>
  );
} 