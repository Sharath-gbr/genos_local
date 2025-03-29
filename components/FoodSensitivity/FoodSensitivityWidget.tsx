'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  CircularProgress,
  Collapse,
  Alert,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SpaIcon from '@mui/icons-material/Spa';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import BugReportIcon from '@mui/icons-material/BugReport';

interface WeightLogData {
  id?: string;
  Email?: string;
  email?: string;
  "Food Item Introduced (Genos)"?: string;
  "Supplement Introduced"?: string;
  "Tolerant Food Items"?: string;
  "Intolerant Food Items"?: string;
  "Tolerant/Intolerant"?: string;
  [key: string]: any;
}

interface CategoryData {
  supplements: string[];
  foods: string[];
}

interface ToleranceData {
  tolerant: CategoryData;
  intolerant: CategoryData;
}

interface QueryResult {
  type: string;
  introduction: string;
  sensitivity: string;
}

export function TolerancesSection({ 
  toleranceData, 
  tolerancesExpanded, 
  setTolerancesExpanded 
}: { 
  toleranceData: ToleranceData, 
  tolerancesExpanded: boolean, 
  setTolerancesExpanded: (value: boolean) => void 
}) {
  return (
    <Accordion 
      expanded={tolerancesExpanded}
      onChange={() => setTolerancesExpanded(!tolerancesExpanded)}
      sx={{ 
        mb: 2,
        background: 'linear-gradient(145deg, rgba(45, 45, 45, 0.97) 0%, rgba(35, 35, 35, 0.95) 100%)',
        border: '1px solid rgba(139, 195, 74, 0.3)', 
        color: '#FFFFFF',
        borderRadius: '10px !important',
        position: 'relative',
        overflow: 'hidden',
        '&:before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '4px',
          background: 'linear-gradient(90deg, #8BC34A 0%, #4CAF50 100%)',
        },
        '&.Mui-expanded': {
          margin: '8px 0',
        }
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: '#FFFFFF' }} />}
        sx={{ padding: '8px 16px', borderRadius: '8px' }}
      >
        <ThumbUpAltIcon sx={{ color: '#8BC34A', mr: 1.5, fontSize: 24 }} />
        <Typography variant="h6" sx={{ color: '#8BC34A', fontWeight: 600 }}>
          Tolerances {toleranceData.tolerant.foods.length + toleranceData.tolerant.supplements.length > 0 && 
            `(${toleranceData.tolerant.foods.length + toleranceData.tolerant.supplements.length})`}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ padding: '0 16px 16px' }}>
        {/* Tolerant Supplements */}
        {toleranceData.tolerant.supplements.length > 0 && (
          <>
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 600, color: '#8BC34A' }}>
              Supplements
            </Typography>
            <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
              {toleranceData.tolerant.supplements.map((item, index) => (
                <li key={`tolerant-supplement-${index}`} style={{ marginBottom: '4px' }}>
                  {item}
                </li>
              ))}
            </ul>
          </>
        )}
        
        {/* Tolerant Foods */}
        {toleranceData.tolerant.foods.length > 0 ? (
          <>
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 600, color: '#8BC34A' }}>
              Foods
            </Typography>
            <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
              {toleranceData.tolerant.foods.map((item, index) => (
                <li key={`tolerant-food-${index}`} style={{ marginBottom: '4px' }}>
                  {item}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 1 }}>
            No tolerant foods identified yet.
          </Typography>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

export function IntolerancesSection({ 
  toleranceData, 
  intolerancesExpanded, 
  setIntolerancesExpanded 
}: { 
  toleranceData: ToleranceData, 
  intolerancesExpanded: boolean, 
  setIntolerancesExpanded: (value: boolean) => void 
}) {
  return (
    <Accordion 
      expanded={intolerancesExpanded}
      onChange={() => setIntolerancesExpanded(!intolerancesExpanded)}
      sx={{ 
        background: 'linear-gradient(145deg, rgba(45, 45, 45, 0.97) 0%, rgba(35, 35, 35, 0.95) 100%)',
        border: '1px solid rgba(244, 67, 54, 0.3)',
        color: '#FFFFFF',
        borderRadius: '10px !important',
        position: 'relative',
        overflow: 'hidden',
        '&:before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '4px',
          background: 'linear-gradient(90deg, #F44336 0%, #E53935 100%)',
        },
        '&.Mui-expanded': {
          margin: '8px 0',
        }
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: '#FFFFFF' }} />}
        sx={{ padding: '8px 16px', borderRadius: '8px' }}
      >
        <ThumbDownAltIcon sx={{ color: '#F44336', mr: 1.5, fontSize: 24 }} />
        <Typography variant="h6" sx={{ color: '#F44336', fontWeight: 600 }}>
          Intolerances {toleranceData.intolerant.foods.length + toleranceData.intolerant.supplements.length > 0 && 
            `(${toleranceData.intolerant.foods.length + toleranceData.intolerant.supplements.length})`}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ padding: '0 16px 16px' }}>
        {/* Intolerant Supplements */}
        {toleranceData.intolerant.supplements.length > 0 && (
          <>
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 600, color: '#F44336' }}>
              Supplements
            </Typography>
            <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
              {toleranceData.intolerant.supplements.map((item, index) => (
                <li key={`intolerant-supplement-${index}`} style={{ marginBottom: '4px' }}>
                  {item}
                </li>
              ))}
            </ul>
          </>
        )}
        
        {/* Intolerant Foods */}
        {toleranceData.intolerant.foods.length > 0 ? (
          <>
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 600, color: '#F44336' }}>
              Foods
            </Typography>
            <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
              {toleranceData.intolerant.foods.map((item, index) => (
                <li key={`intolerant-food-${index}`} style={{ marginBottom: '4px' }}>
                  {item}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 1 }}>
            No intolerant foods identified yet.
          </Typography>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

export default function FoodSensitivityWidget() {
  const [userData, setUserData] = useState<{ firstName: string; lastName: string; email: string } | null>(null);
  const [toleranceData, setToleranceData] = useState<ToleranceData>({
    tolerant: {
      supplements: [],
      foods: []
    },
    intolerant: {
      supplements: [],
      foods: []
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [availableTables, setAvailableTables] = useState<string[]>([]);
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [rawData, setRawData] = useState<any[] | null>(null);
  const [tolerancesExpanded, setTolerancesExpanded] = useState<boolean>(false);
  const [intolerancesExpanded, setIntolerancesExpanded] = useState<boolean>(false);
  
  const supabase = createClient();
  
  // Fetch the user's data from Supabase auth
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // Get the current user session
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          throw error;
        }
        
        if (data?.user) {
          // Extract user metadata containing first name and last name
          const metadata = data.user.user_metadata;
          console.log('User metadata:', metadata);
          console.log('User email:', data.user.email);
          
          setUserData({
            firstName: metadata?.first_name || '',
            lastName: metadata?.last_name || '',
            email: data.user.email || '',
          });
        } else {
          setError('No user is currently logged in');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to fetch user data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [supabase.auth]);

  // Fetch available tables to help debug
  const fetchAvailableTables = async () => {
    try {
      console.log('Fetching available tables and columns...');
      
      // Query for a sample row to get column information
      const { data, error } = await supabase
        .from('weight_logs')
        .select('*')
        .limit(1);
        
      if (error) {
        console.error('Error accessing weight_logs table:', error);
        setAvailableTables(['Error accessing weight_logs: ' + error.message]);
        return;
      }
      
      // If we got here, weight_logs exists
      setAvailableTables(['weight_logs']);
      
      // List all columns with their values to help debugging
      if (data && data.length > 0) {
        const sampleRow = data[0];
        console.log('Column names and sample values:');
        Object.entries(sampleRow).forEach(([column, value]) => {
          console.log(`Column: "${column}" | Sample Value: "${value}"`);
        });
      }
    } catch (err) {
      console.error('Error in fetchAvailableTables:', err);
      setAvailableTables(['Error checking tables: ' + (err instanceof Error ? err.message : String(err))]);
    }
  };

  // Fetch food sensitivity data using separate queries for foods and supplements
  useEffect(() => {
    const fetchToleranceData = async () => {
      if (!userData?.email) {
        console.log('No user email available, skipping data fetch');
        return;
      }
      
      try {
        setIsLoading(true);
        console.log('Fetching tolerance data for email:', userData.email);
        
        // Fetch all relevant data in one query with exact column names
        const { data, error } = await supabase
          .from('weight_logs')
          .select(`
            "Food Item Introduced  (Genos)",
            "Supplement Introduced",
            "Tolerant/Intolerant",
            "Tolerant Food Items",
            "Intolerant Food Items"
          `)
          .eq('Email', userData.email);

        if (error) {
          throw new Error(`Failed to fetch data: ${error.message}`);
        }

        console.log('Raw data:', data);

        const processed: ToleranceData = {
          tolerant: {
            supplements: [],
            foods: []
          },
          intolerant: {
            supplements: [],
            foods: []
          }
        };

        // Process each row
        data?.forEach((row: any) => {
          const isTolerant = row["Tolerant/Intolerant"]?.toLowerCase() === 'tolerant';
          const category = isTolerant ? 'tolerant' : 'intolerant';

          // Process foods from all relevant columns
          const foodSources = [
            row["Food Item Introduced  (Genos)"], // Note the two spaces after "Introduced"
            row["Tolerant Food Items"],
            row["Intolerant Food Items"]
          ];

          foodSources.forEach(source => {
            if (source) {
              const foods = source
                .split(',')
                .map(item => item.trim())
                .filter(item => item);

              foods.forEach(food => {
                if (!processed[category].foods.includes(food)) {
                  processed[category].foods.push(food);
                }
              });
            }
          });

          // Process supplements
          if (row["Supplement Introduced"]) {
            const supplements = row["Supplement Introduced"]
              .split(',')
              .map(item => item.trim())
              .filter(item => item);

            supplements.forEach(supplement => {
              if (!processed[category].supplements.includes(supplement)) {
                processed[category].supplements.push(supplement);
              }
            });
          }
        });

        // Sort all arrays
        processed.tolerant.supplements.sort();
        processed.tolerant.foods.sort();
        processed.intolerant.supplements.sort();
        processed.intolerant.foods.sort();

        console.log('Final processed data:', processed);
        console.log('Counts:', {
          tolerantSupplements: processed.tolerant.supplements.length,
          tolerantFoods: processed.tolerant.foods.length,
          intolerantSupplements: processed.intolerant.supplements.length,
          intolerantFoods: processed.intolerant.foods.length
        });
        
        // Store raw data for debugging
        setRawData(data || []);
        setToleranceData(processed);
        
      } catch (err) {
        console.error('Error in fetchToleranceData:', err);
        setError(`Failed to fetch your food sensitivity data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (userData?.email) {
      fetchToleranceData();
    }
  }, [userData, supabase]);

  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
    if (!debugMode) fetchAvailableTables();
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <CircularProgress color="primary" />
        <Typography sx={{ ml: 2 }}>Loading your food sensitivity data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button 
          variant="outlined" 
          color="secondary" 
          sx={{ mt: 1 }}
          onClick={toggleDebugMode}
        >
          {debugMode ? 'Hide Debug Info' : 'Show Debug Info'}
        </Button>
        
        {debugMode && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              Available Tables:
            </Typography>
            {availableTables.length > 0 ? (
              <ul>
                {availableTables.map((table, i) => (
                  <li key={i}>{table}</li>
                ))}
              </ul>
            ) : (
              <Typography>No tables found or permission denied</Typography>
            )}
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
              User Email:
            </Typography>
            <Typography>{userData?.email || 'Not logged in'}</Typography>
            
            {rawData && (
              <>
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                  Raw Data (first record):
                </Typography>
                <Box sx={{ overflowX: 'auto' }}>
                  <pre>{JSON.stringify(rawData[0], null, 2)}</pre>
                </Box>
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                  Available Columns: {rawData[0] ? Object.keys(rawData[0]).join(', ') : 'None'}
                </Typography>
              </>
            )}
          </Box>
        )}
      </Box>
    );
  }

  if (!userData) {
    return (
      <Alert severity="warning" sx={{ mb: 3 }}>
        Please log in to view your food sensitivity data.
      </Alert>
    );
  }

  if (Object.values(toleranceData).every(category => category.supplements.length === 0 && category.foods.length === 0)) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        No tolerance data found for {userData.firstName || ''} {userData.lastName || ''}. Please ensure your data is properly entered in the system.
      </Alert>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
          <CircularProgress color="primary" />
          <Typography sx={{ ml: 2 }}>Loading your food sensitivity data...</Typography>
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              startIcon={debugMode ? <VisibilityOffIcon /> : <BugReportIcon />}
              onClick={toggleDebugMode} 
              size="small"
              variant="outlined"
              sx={{ 
                fontSize: '0.7rem', 
                py: 0.5,
                textTransform: 'none',
                borderColor: 'rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.6)',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.4)',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                }
              }}
            >
              {debugMode ? 'Hide Debug Info' : 'Debug'}
            </Button>
          </Box>

          {/* Tolerances and Intolerances side by side */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TolerancesSection 
                toleranceData={toleranceData} 
                tolerancesExpanded={tolerancesExpanded} 
                setTolerancesExpanded={setTolerancesExpanded} 
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <IntolerancesSection 
                toleranceData={toleranceData} 
                intolerancesExpanded={intolerancesExpanded} 
                setIntolerancesExpanded={setIntolerancesExpanded}
              />
            </Grid>
          </Grid>

          {debugMode && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: 1, fontSize: '0.8rem' }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Raw Data Sample:
              </Typography>
              <pre style={{ overflow: 'auto', maxHeight: '200px' }}>
                {rawData && rawData.length > 0 ? JSON.stringify(rawData[0], null, 2) : 'No data'}
              </pre>
              
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                Processed Data:
              </Typography>
              <pre style={{ overflow: 'auto', maxHeight: '200px' }}>
                {JSON.stringify(toleranceData, null, 2)}
              </pre>
            </Box>
          )}
        </>
      )}
    </Box>
  );
} 