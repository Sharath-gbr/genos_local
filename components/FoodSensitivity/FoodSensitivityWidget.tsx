'use client';

import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, CircularProgress, Alert, Button, Grid } from '@mui/material';
import { createClient } from '@/lib/supabase/client';
import { SupabaseClient } from '@supabase/supabase-js';

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
      console.log('Fetching available tables...');
      
      // Query for tables in the public schema
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
      
      // List first few columns to help debugging
      if (data && data.length > 0) {
        console.log('Sample weight_logs columns:', Object.keys(data[0]).join(', '));
      }
    } catch (err) {
      console.error('Error in fetchAvailableTables:', err);
      setAvailableTables(['Error checking tables: ' + (err instanceof Error ? err.message : String(err))]);
    }
  };

  // Fetch food sensitivity data using separate queries
  useEffect(() => {
    const fetchToleranceData = async () => {
      if (!userData?.email) {
        console.log('No user email available, skipping data fetch');
        return;
      }
      
      try {
        setIsLoading(true);
        console.log('Fetching tolerance data for email:', userData.email);
        
        // 1. Fetch tolerant supplements
        const { data: tolerantSupplements, error: tolerantSupplementsError } = await supabase
          .from('weight_logs')
          .select('"Supplement Introduced", "Tolerant/Intolerant"')
          .eq('Email', userData.email)
          .eq('Tolerant/Intolerant', 'Tolerant')
          .not('Supplement Introduced', 'is', null)
          .not('Supplement Introduced', 'eq', '');

        if (tolerantSupplementsError) {
          throw new Error(`Failed to fetch tolerant supplements: ${tolerantSupplementsError.message}`);
        }
        console.log('Tolerant supplements:', tolerantSupplements);

        // 2. Fetch tolerant foods
        const { data: tolerantFoods, error: tolerantFoodsError } = await supabase
          .from('weight_logs')
          .select('"Food Item Introduced (Genos)", "Tolerant/Intolerant"')
          .eq('Email', userData.email)
          .eq('Tolerant/Intolerant', 'Tolerant')
          .not('Food Item Introduced (Genos)', 'is', null)
          .not('Food Item Introduced (Genos)', 'eq', '');

        if (tolerantFoodsError) {
          throw new Error(`Failed to fetch tolerant foods: ${tolerantFoodsError.message}`);
        }
        console.log('Tolerant foods:', tolerantFoods);

        // 3. Fetch intolerant supplements
        const { data: intolerantSupplements, error: intolerantSupplementsError } = await supabase
          .from('weight_logs')
          .select('"Supplement Introduced", "Tolerant/Intolerant"')
          .eq('Email', userData.email)
          .eq('Tolerant/Intolerant', 'Intolerant')
          .not('Supplement Introduced', 'is', null)
          .not('Supplement Introduced', 'eq', '');

        if (intolerantSupplementsError) {
          throw new Error(`Failed to fetch intolerant supplements: ${intolerantSupplementsError.message}`);
        }
        console.log('Intolerant supplements:', intolerantSupplements);

        // 4. Fetch intolerant foods
        const { data: intolerantFoods, error: intolerantFoodsError } = await supabase
          .from('weight_logs')
          .select('"Food Item Introduced (Genos)", "Tolerant/Intolerant"')
          .eq('Email', userData.email)
          .eq('Tolerant/Intolerant', 'Intolerant')
          .not('Food Item Introduced (Genos)', 'is', null)
          .not('Food Item Introduced (Genos)', 'eq', '');

        if (intolerantFoodsError) {
          throw new Error(`Failed to fetch intolerant foods: ${intolerantFoodsError.message}`);
        }
        console.log('Intolerant foods:', intolerantFoods);

        // Process the results
        const processed: ToleranceData = {
          tolerant: {
            supplements: [...new Set(tolerantSupplements?.map(item => item["Supplement Introduced"]) || [])].sort(),
            foods: [...new Set(tolerantFoods?.map(item => item["Food Item Introduced (Genos)"]) || [])].sort()
          },
          intolerant: {
            supplements: [...new Set(intolerantSupplements?.map(item => item["Supplement Introduced"]) || [])].sort(),
            foods: [...new Set(intolerantFoods?.map(item => item["Food Item Introduced (Genos)"]) || [])].sort()
          }
        };

        console.log('Processed data:', processed);
        
        // Store raw data for debugging
        setRawData([
          ...(tolerantSupplements || []),
          ...(tolerantFoods || []),
          ...(intolerantSupplements || []),
          ...(intolerantFoods || [])
        ]);
        
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
          onClick={() => {
            setDebugMode(!debugMode);
            if (!debugMode) fetchAvailableTables();
          }}
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
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" sx={{ color: '#FF5F1F', mb: 3, fontWeight: 600 }}>
        Food and Sensitivity Hub
      </Typography>
      
      <Grid container spacing={3}>
        {/* Tolerances Section */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3}
            sx={{
              p: 3,
              height: '100%',
              borderRadius: 2,
              backgroundColor: 'rgba(45, 45, 45, 0.95)',
              border: '1px solid rgba(255, 95, 31, 0.2)',
              color: '#FFFFFF',
            }}
          >
            <Typography variant="h6" sx={{ textAlign: 'center', mb: 3, color: '#4CAF50' }}>
              Tolerances
            </Typography>
            
            {/* Supplements */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 1 }}>
                🌿 Supplements
              </Typography>
              {toleranceData.tolerant.supplements.length > 0 ? (
                <Box sx={{ pl: 2 }}>
                  {toleranceData.tolerant.supplements.map((supplement, idx) => (
                    <Typography key={idx} sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                      <span style={{ marginRight: '8px' }}>•</span> {supplement}
                    </Typography>
                  ))}
                </Box>
              ) : (
                <Typography sx={{ pl: 2, fontStyle: 'italic', color: 'rgba(255,255,255,0.7)' }}>
                  No tolerant supplements found
                </Typography>
              )}
            </Box>
            
            {/* Foods */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 1 }}>
                🥗 Foods
              </Typography>
              {toleranceData.tolerant.foods.length > 0 ? (
                <Box sx={{ pl: 2 }}>
                  {toleranceData.tolerant.foods.map((food, idx) => (
                    <Typography key={idx} sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                      <span style={{ marginRight: '8px' }}>•</span> {food}
                    </Typography>
                  ))}
                </Box>
              ) : (
                <Typography sx={{ pl: 2, fontStyle: 'italic', color: 'rgba(255,255,255,0.7)' }}>
                  No tolerant foods found
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* Intolerances Section */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3}
            sx={{
              p: 3,
              height: '100%',
              borderRadius: 2,
              backgroundColor: 'rgba(45, 45, 45, 0.95)',
              border: '1px solid rgba(255, 95, 31, 0.2)',
              color: '#FFFFFF',
            }}
          >
            <Typography variant="h6" sx={{ textAlign: 'center', mb: 3, color: '#f44336' }}>
              Intolerances
            </Typography>
            
            {/* Supplements */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 1 }}>
                🌿 Supplements
              </Typography>
              {toleranceData.intolerant.supplements.length > 0 ? (
                <Box sx={{ pl: 2 }}>
                  {toleranceData.intolerant.supplements.map((supplement, idx) => (
                    <Typography key={idx} sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                      <span style={{ marginRight: '8px' }}>•</span> {supplement}
                    </Typography>
                  ))}
                </Box>
              ) : (
                <Typography sx={{ pl: 2, fontStyle: 'italic', color: 'rgba(255,255,255,0.7)' }}>
                  No intolerant supplements found
                </Typography>
              )}
            </Box>
            
            {/* Foods */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 1 }}>
                🥗 Foods
              </Typography>
              {toleranceData.intolerant.foods.length > 0 ? (
                <Box sx={{ pl: 2 }}>
                  {toleranceData.intolerant.foods.map((food, idx) => (
                    <Typography key={idx} sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                      <span style={{ marginRight: '8px' }}>•</span> {food}
                    </Typography>
                  ))}
                </Box>
              ) : (
                <Typography sx={{ pl: 2, fontStyle: 'italic', color: 'rgba(255,255,255,0.7)' }}>
                  No intolerant foods found
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      <Button 
        variant="text" 
        size="small"
        sx={{ mt: 2, color: 'rgba(255,255,255,0.5)' }}
        onClick={() => {
          setDebugMode(!debugMode);
          if (!debugMode) fetchAvailableTables();
        }}
      >
        {debugMode ? 'Hide Debug Info' : 'Debug'}
      </Button>
      
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
    </Box>
  );
} 