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

  // Process data into categorized format
  const processToleranceData = (data: any[]): ToleranceData => {
    const result: ToleranceData = {
      tolerant: {
        supplements: [],
        foods: []
      },
      intolerant: {
        supplements: [],
        foods: []
      }
    };

    // Log the raw data for debugging
    console.log('Processing raw data:', data);
    console.log('Total items to process:', data.length);

    data.forEach((item, index) => {
      // Ensure we have valid data
      if (!item || !item.type || !item.introduction || !item.sensitivity) {
        console.log(`Skipping invalid item at index ${index}:`, item);
        return;
      }

      const type = item.type.trim();
      const introduction = item.introduction.trim();
      const sensitivity = item.sensitivity.trim();

      console.log(`Processing item ${index + 1}:`, { type, introduction, sensitivity });

      // Skip empty introductions
      if (!introduction) {
        return;
      }

      // Match exactly against "Tolerant" or "Intolerant"
      if (sensitivity === "Tolerant") {
        if (type === "Supplement") {
          result.tolerant.supplements.push(introduction);
          console.log(`Added to tolerant supplements: ${introduction}`);
        } else if (type === "Food") {
          result.tolerant.foods.push(introduction);
          console.log(`Added to tolerant foods: ${introduction}`);
        }
      } else if (sensitivity === "Intolerant") {
        if (type === "Supplement") {
          result.intolerant.supplements.push(introduction);
          console.log(`Added to intolerant supplements: ${introduction}`);
        } else if (type === "Food") {
          result.intolerant.foods.push(introduction);
          console.log(`Added to intolerant foods: ${introduction}`);
        }
      } else {
        console.log(`Skipping item with unknown sensitivity: ${sensitivity}`);
      }
    });

    // Remove duplicates and sort alphabetically
    result.tolerant.supplements = [...new Set(result.tolerant.supplements)].sort();
    result.tolerant.foods = [...new Set(result.tolerant.foods)].sort();
    result.intolerant.supplements = [...new Set(result.intolerant.supplements)].sort();
    result.intolerant.foods = [...new Set(result.intolerant.foods)].sort();

    // Log the processed results
    console.log('Processed tolerance data:', result);
    console.log('Counts:', {
      tolerantSupplements: result.tolerant.supplements.length,
      tolerantFoods: result.tolerant.foods.length,
      intolerantSupplements: result.intolerant.supplements.length,
      intolerantFoods: result.intolerant.foods.length
    });

    return result;
  };

  // Fetch food sensitivity data from weight_logs table
  useEffect(() => {
    const fetchToleranceData = async () => {
      if (!userData?.email) return;
      
      try {
        setIsLoading(true);
        console.log('Attempting to fetch tolerance data for email:', userData.email);
        
        // Fetch all relevant data in one query
        const { data, error } = await supabase
          .from('weight_logs')
          .select('*')
          .eq('Email', userData.email);

        if (error) {
          console.error('Error fetching data:', error);
          throw new Error('Failed to fetch data: ' + error.message);
        }

        console.log('Raw data from database:', data);

        if (!data || data.length === 0) {
          console.log('No data found');
          throw new Error('No food sensitivity data found for your account');
        }

        // Transform the data into the required format
        const combinedData = [];

        // Process supplements
        data.forEach(item => {
          if (item["Supplement Introduced"] && item["Tolerant/Intolerant"]) {
            combinedData.push({
              type: 'Supplement',
              introduction: item["Supplement Introduced"],
              sensitivity: item["Tolerant/Intolerant"]
            });
          }
          
          if (item["Food Item Introduced (Genos)"] && item["Tolerant/Intolerant"]) {
            combinedData.push({
              type: 'Food',
              introduction: item["Food Item Introduced (Genos)"],
              sensitivity: item["Tolerant/Intolerant"]
            });
          }
        });

        console.log('Combined data:', combinedData);
        
        if (combinedData.length === 0) {
          console.log('No tolerance data found after processing');
          throw new Error('No food sensitivity data found for your account');
        }

        // Store the raw data for debugging
        setRawData(data);
        
        // Process the data into the categorized format
        const processed = processToleranceData(combinedData);
        setToleranceData(processed);
        console.log('Processed tolerance data:', processed);
        
      } catch (err) {
        console.error('Error fetching data from weight_logs:', err);
        setError(`Failed to fetch your food sensitivity data: ${err instanceof Error ? err.message : 'Unknown error'}`);
        
        // When error occurs, try to fetch available tables to help debugging
        fetchAvailableTables();
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
            <Typography variant="h6" sx={{ textAlign: 'center', mb: 3 }}>
              Tolerances
            </Typography>
            
            {/* Supplements */}
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Supplements
            </Typography>
            {toleranceData.tolerant.supplements.length > 0 ? (
              <Box sx={{ mb: 3, pl: 2 }}>
                {toleranceData.tolerant.supplements.map((supplement, idx) => (
                  <Typography key={idx} sx={{ mb: 0.5 }}>
                    - {supplement}
                  </Typography>
                ))}
              </Box>
            ) : (
              <Typography sx={{ mb: 3, pl: 2, fontStyle: 'italic', color: 'rgba(255,255,255,0.7)' }}>
                No tolerant supplements found
              </Typography>
            )}
            
            {/* Foods */}
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Foods
            </Typography>
            {toleranceData.tolerant.foods.length > 0 ? (
              <Box sx={{ pl: 2 }}>
                {toleranceData.tolerant.foods.map((food, idx) => (
                  <Typography key={idx} sx={{ mb: 0.5 }}>
                    - {food}
                  </Typography>
                ))}
              </Box>
            ) : (
              <Typography sx={{ pl: 2, fontStyle: 'italic', color: 'rgba(255,255,255,0.7)' }}>
                No tolerant foods found
              </Typography>
            )}
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
            <Typography variant="h6" sx={{ textAlign: 'center', mb: 3 }}>
              Intolerances
            </Typography>
            
            {/* Supplements */}
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Supplements
            </Typography>
            {toleranceData.intolerant.supplements.length > 0 ? (
              <Box sx={{ mb: 3, pl: 2 }}>
                {toleranceData.intolerant.supplements.map((supplement, idx) => (
                  <Typography key={idx} sx={{ mb: 0.5 }}>
                    - {supplement}
                  </Typography>
                ))}
              </Box>
            ) : (
              <Typography sx={{ mb: 3, pl: 2, fontStyle: 'italic', color: 'rgba(255,255,255,0.7)' }}>
                No intolerant supplements found
              </Typography>
            )}
            
            {/* Foods */}
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Foods
            </Typography>
            {toleranceData.intolerant.foods.length > 0 ? (
              <Box sx={{ pl: 2 }}>
                {toleranceData.intolerant.foods.map((food, idx) => (
                  <Typography key={idx} sx={{ mb: 0.5 }}>
                    - {food}
                  </Typography>
                ))}
              </Box>
            ) : (
              <Typography sx={{ pl: 2, fontStyle: 'italic', color: 'rgba(255,255,255,0.7)' }}>
                No intolerant foods found
              </Typography>
            )}
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
            Table Being Used:
          </Typography>
          <Typography>weight_logs</Typography>
          
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
            Processed Data:
          </Typography>
          <pre style={{ overflow: 'auto', maxHeight: '200px' }}>
            {JSON.stringify(toleranceData, null, 2)}
          </pre>
          
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
            Raw Data Sample:
          </Typography>
          <pre style={{ overflow: 'auto', maxHeight: '200px' }}>
            {rawData && rawData.length > 0 ? JSON.stringify(rawData[0], null, 2) : 'No data'}
          </pre>
        </Box>
      )}
    </Box>
  );
} 