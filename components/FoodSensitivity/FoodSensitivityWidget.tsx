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
  email?: string;
  day_of_program?: string;
  weight_recorded?: number;
  bp_systolic?: number;
  bp_diastolic?: number;
  blood_sugar?: number;
  deviation?: string;
  supplement_introduced?: string;
  body_physiology?: string;
  symptoms_observed?: string;
  tolerant_intolerant?: string;
  chest?: number;
  waist?: number;
  hips?: number;
  tolerant_food_items?: string;
  intolerant_food_items?: string;
  comments?: string;
  phase_of_program?: string;
  reason_for_diagnosing_tolerant?: string;
  client_name?: string;
  food_item_introduced?: string;
  first_name?: string;
  last_name?: string;
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
          background: 'linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%)',
        },
        '&.Mui-expanded': {
          margin: '8px 0',
        }
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: '#FFFFFF' }} />}
        sx={{ 
          padding: '8px 16px',
          borderRadius: '8px',
          '& .MuiAccordionSummary-content': {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
          }
        }}
      >
        <ThumbUpAltIcon sx={{ color: '#8BC34A', mr: 1.5, fontSize: 24 }} />
        <Typography variant="h6" sx={{ color: '#8BC34A', fontWeight: 600 }}>
          Tolerances {toleranceData.tolerant.foods.length + toleranceData.tolerant.supplements.length > 0 && 
            `(${toleranceData.tolerant.foods.length + toleranceData.tolerant.supplements.length})`}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ padding: '0 16px 16px' }}>
        {/* Supplements */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 2, 
            pb: 1, 
            borderBottom: '1px solid rgba(255,255,255,0.15)' 
          }}>
            <SpaIcon sx={{ mr: 1, color: '#8BC34A' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              Supplements {toleranceData.tolerant.supplements.length > 0 && `(${toleranceData.tolerant.supplements.length})`}
            </Typography>
          </Box>
          {toleranceData.tolerant.supplements.length > 0 ? (
            <Box sx={{ pl: 2 }}>
              {toleranceData.tolerant.supplements.map((supplement, idx) => (
                <Typography key={idx} sx={{ 
                  mb: 1, 
                  display: 'flex', 
                  alignItems: 'center',
                  fontSize: '0.95rem',
                  lineHeight: 1.4
                }}>
                  <Box 
                    sx={{ 
                      minWidth: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      bgcolor: '#8BC34A',
                      mr: 1.5,
                      mt: '1px'
                    }} 
                  />
                  {supplement}
                </Typography>
              ))}
            </Box>
          ) : (
            <Typography sx={{ 
              pl: 2, 
              fontStyle: 'italic', 
              color: 'rgba(255,255,255,0.5)',
              fontSize: '0.9rem' 
            }}>
              No tolerant supplements found
            </Typography>
          )}
        </Box>

        {/* Foods */}
        <Box>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 2, 
            pb: 1, 
            borderBottom: '1px solid rgba(255,255,255,0.15)' 
          }}>
            <RestaurantIcon sx={{ mr: 1, color: '#8BC34A' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              Foods {toleranceData.tolerant.foods.length > 0 && `(${toleranceData.tolerant.foods.length})`}
            </Typography>
          </Box>
          {toleranceData.tolerant.foods.length > 0 ? (
            <Box sx={{ pl: 2 }}>
              {toleranceData.tolerant.foods.map((food, idx) => (
                <Typography key={idx} sx={{ 
                  mb: 1, 
                  display: 'flex', 
                  alignItems: 'center',
                  fontSize: '0.95rem',
                  lineHeight: 1.4
                }}>
                  <Box 
                    sx={{ 
                      minWidth: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      bgcolor: '#8BC34A',
                      mr: 1.5,
                      mt: '1px'
                    }} 
                  />
                  {food}
                </Typography>
              ))}
            </Box>
          ) : (
            <Typography sx={{ 
              pl: 2, 
              fontStyle: 'italic', 
              color: 'rgba(255,255,255,0.5)',
              fontSize: '0.9rem' 
            }}>
              No tolerant foods found
            </Typography>
          )}
        </Box>
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
          background: 'linear-gradient(90deg, #f44336 0%, #ff7043 100%)',
        },
        '&.Mui-expanded': {
          margin: '8px 0',
        }
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: '#FFFFFF' }} />}
        sx={{ 
          padding: '8px 16px',
          borderRadius: '8px',
          '& .MuiAccordionSummary-content': {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
          }
        }}
      >
        <ThumbDownAltIcon sx={{ color: '#f44336', mr: 1.5, fontSize: 24 }} />
        <Typography variant="h6" sx={{ color: '#f44336', fontWeight: 600 }}>
          Intolerances {toleranceData.intolerant.foods.length + toleranceData.intolerant.supplements.length > 0 && 
            `(${toleranceData.intolerant.foods.length + toleranceData.intolerant.supplements.length})`}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ padding: '0 16px 16px' }}>
        {/* Supplements */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 2, 
            pb: 1, 
            borderBottom: '1px solid rgba(255,255,255,0.15)' 
          }}>
            <SpaIcon sx={{ mr: 1, color: '#ff7043' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              Supplements {toleranceData.intolerant.supplements.length > 0 && `(${toleranceData.intolerant.supplements.length})`}
            </Typography>
          </Box>
          {toleranceData.intolerant.supplements.length > 0 ? (
            <Box sx={{ pl: 2 }}>
              {toleranceData.intolerant.supplements.map((supplement, idx) => (
                <Typography key={idx} sx={{ 
                  mb: 1, 
                  display: 'flex', 
                  alignItems: 'center',
                  fontSize: '0.95rem',
                  lineHeight: 1.4
                }}>
                  <Box 
                    sx={{ 
                      minWidth: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      bgcolor: '#ff7043',
                      mr: 1.5,
                      mt: '1px'
                    }} 
                  />
                  {supplement}
                </Typography>
              ))}
            </Box>
          ) : (
            <Typography sx={{ 
              pl: 2, 
              fontStyle: 'italic', 
              color: 'rgba(255,255,255,0.5)',
              fontSize: '0.9rem' 
            }}>
              No intolerant supplements found
            </Typography>
          )}
        </Box>
        
        {/* Foods */}
        <Box>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 2, 
            pb: 1, 
            borderBottom: '1px solid rgba(255,255,255,0.15)' 
          }}>
            <RestaurantIcon sx={{ mr: 1, color: '#ff7043' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              Foods {toleranceData.intolerant.foods.length > 0 && `(${toleranceData.intolerant.foods.length})`}
            </Typography>
          </Box>
          {toleranceData.intolerant.foods.length > 0 ? (
            <Box sx={{ pl: 2 }}>
              {toleranceData.intolerant.foods.map((food, idx) => (
                <Typography key={idx} sx={{ 
                  mb: 1, 
                  display: 'flex', 
                  alignItems: 'center',
                  fontSize: '0.95rem',
                  lineHeight: 1.4
                }}>
                  <Box 
                    sx={{ 
                      minWidth: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      bgcolor: '#ff7043',
                      mr: 1.5,
                      mt: '1px'
                    }} 
                  />
                  {food}
                </Typography>
              ))}
            </Box>
          ) : (
            <Typography sx={{ 
              pl: 2, 
              fontStyle: 'italic', 
              color: 'rgba(255,255,255,0.5)',
              fontSize: '0.9rem' 
            }}>
              No intolerant foods found
            </Typography>
          )}
        </Box>
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
        
        // Add more detailed debugging
        console.log('Full sample row:', JSON.stringify(sampleRow, null, 2));
        console.log('Available columns:', Object.keys(sampleRow).join(', '));
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
        
        // Get all possible emails for this user (direct + mapped)
        const { data: mappingData, error: mappingError } = await supabase
          .from('user_mappings')
          .select('airtable_email')
          .eq('auth_email', userData.email);
          
        if (mappingError) {
          console.error('Error checking email mappings:', mappingError);
        }
        
        // Create array of all possible emails
        const possibleEmails = [userData.email];
        if (mappingData) {
          possibleEmails.push(...mappingData.map(m => m.airtable_email));
        }
        
        console.log('Checking for data with emails:', possibleEmails);
        
        // Fetch data for all possible emails in a single query
        const { data, error } = await supabase
          .from('weight_logs')
          .select('*')
          .in('email', possibleEmails);

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
          const isTolerant = row.tolerant_intolerant?.toLowerCase() === 'tolerant';
          const category = isTolerant ? 'tolerant' : 'intolerant';

          // Process foods from all relevant columns
          const foodSources = [
            row.food_item_introduced,
            row.tolerant_food_items,
            row.intolerant_food_items
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
          if (row.supplement_introduced) {
            const supplements = row.supplement_introduced
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