'use client';

import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, CircularProgress, Alert, Button, Grid } from '@mui/material';
import { createClient } from '@/lib/supabase/client';

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

interface ToleranceData {
  supplements: string[];
  foods: string[];
}

export default function FoodSensitivityWidget() {
  const [userData, setUserData] = useState<{ firstName: string; lastName: string; email: string } | null>(null);
  const [toleranceData, setToleranceData] = useState<WeightLogData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [availableTables, setAvailableTables] = useState<string[]>([]);
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [rawData, setRawData] = useState<any[] | null>(null);
  const [processedData, setProcessedData] = useState<{
    tolerant: ToleranceData;
    intolerant: ToleranceData;
  }>({
    tolerant: { supplements: [], foods: [] },
    intolerant: { supplements: [], foods: [] }
  });
  
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
  const processToleranceData = (data: WeightLogData[]) => {
    const result = {
      tolerant: {
        supplements: [] as string[],
        foods: [] as string[]
      },
      intolerant: {
        supplements: [] as string[],
        foods: [] as string[]
      }
    };

    // First, log all available fields to help debug
    console.log('Available fields in data:', 
      Array.from(new Set(data.flatMap(item => Object.keys(item)))).join(', '));

    data.forEach(item => {
      // Check multiple fields that could indicate tolerance status
      const tolerantStatus = item["Tolerant/Intolerant"] || '';
      const isTolerant = tolerantStatus.toLowerCase().includes('tolerant') && 
                        !tolerantStatus.toLowerCase().includes('intolerant');
      
      // Log the item for debugging
      console.log('Processing item:', {
        tolerantStatus,
        isTolerant,
        supplements: item["Supplement Introduced"],
        tolerantFoods: item["Tolerant Food Items"],
        intolerantFoods: item["Intolerant Food Items"],
        foodItem: item["Food Item Introduced (Genos)"]
      });
      
      // Process supplements - check all possible field names
      if (item["Supplement Introduced"]) {
        const supplements = item["Supplement Introduced"].split(',')
          .map(s => s.trim())
          .filter(Boolean);
        
        // Categorize by the tolerant status
        if (isTolerant) {
          result.tolerant.supplements.push(...supplements);
        } else if (tolerantStatus.toLowerCase().includes('intolerant')) {
          result.intolerant.supplements.push(...supplements);
        } else {
          // If status is unclear, default to tolerant
          result.tolerant.supplements.push(...supplements);
        }
      }
      
      // Also check additional fields that might contain supplement info
      const additionalSupplementFields = ["Supplement", "supplements", "supplement introduced"];
      additionalSupplementFields.forEach(field => {
        if (item[field]) {
          const supplements = item[field].split(',')
            .map(s => s.trim())
            .filter(Boolean);
          
          if (isTolerant || !tolerantStatus) {
            result.tolerant.supplements.push(...supplements);
          } else {
            result.intolerant.supplements.push(...supplements);
          }
        }
      });
      
      // Process foods - handle each field explicitly
      // Tolerant foods
      if (item["Tolerant Food Items"]) {
        const foods = item["Tolerant Food Items"]
          .split(',')
          .map(f => f.trim())
          .filter(Boolean);
        result.tolerant.foods.push(...foods);
      }
      
      // Intolerant foods
      if (item["Intolerant Food Items"]) {
        const foods = item["Intolerant Food Items"]
          .split(',')
          .map(f => f.trim())
          .filter(Boolean);
        result.intolerant.foods.push(...foods);
      }
      
      // Food Item Introduced - categorize based on tolerance status
      if (item["Food Item Introduced (Genos)"]) {
        const foods = item["Food Item Introduced (Genos)"]
          .split(',')
          .map(f => f.trim())
          .filter(Boolean);
        
        if (isTolerant) {
          result.tolerant.foods.push(...foods);
        } else if (tolerantStatus.toLowerCase().includes('intolerant')) {
          result.intolerant.foods.push(...foods);
        }
        // If status is unclear, don't categorize the food
      }
      
      // Additional checks for specific field names in your data structure
      if (item["Tolerant"]) {
        const tolerantItems = String(item["Tolerant"])
          .split(',')
          .map(f => f.trim())
          .filter(Boolean);
        result.tolerant.foods.push(...tolerantItems);
      }
      
      if (item["Intolerant"]) {
        const intolerantItems = String(item["Intolerant"])
          .split(',')
          .map(f => f.trim())
          .filter(Boolean);
        result.intolerant.foods.push(...intolerantItems);
      }
    });
    
    // Remove duplicates and make sure empty elements are removed
    result.tolerant.supplements = [...new Set(result.tolerant.supplements)].filter(Boolean);
    result.tolerant.foods = [...new Set(result.tolerant.foods)].filter(Boolean);
    result.intolerant.supplements = [...new Set(result.intolerant.supplements)].filter(Boolean);
    result.intolerant.foods = [...new Set(result.intolerant.foods)].filter(Boolean);
    
    return result;
  };

  // Fetch food sensitivity data from weight_logs table
  useEffect(() => {
    const fetchToleranceData = async () => {
      if (!userData?.email) return;
      
      try {
        setIsLoading(true);
        console.log('Attempting to fetch tolerance data for email:', userData.email);
        
        // Try to query the weight_logs table
        const { data, error } = await supabase
          .from('weight_logs')
          .select('*');
          
        if (error) {
          console.error('Error querying weight_logs:', error);
          throw new Error(`Error accessing weight_logs: ${error.message}`);
        }
        
        // Store the raw data for debugging
        setRawData(data);
        console.log('Raw weight_logs data:', data);
        
        if (!data || data.length === 0) {
          throw new Error('No data found in weight_logs table');
        }
        
        setToleranceData(data);
        
        // Process the data into the categorized format
        const processed = processToleranceData(data);
        setProcessedData(processed);
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

  if (toleranceData.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        No tolerance data found for {userData.firstName || ''} {userData.lastName || ''}. Please ensure your data is properly entered in the system.
      </Alert>
    );
  }
  
  const { tolerant, intolerant } = processedData;

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
            {tolerant.supplements.length > 0 ? (
              <Box sx={{ mb: 3, pl: 2 }}>
                {tolerant.supplements.map((supplement, idx) => (
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
            {tolerant.foods.length > 0 ? (
              <Box sx={{ pl: 2 }}>
                {tolerant.foods.map((food, idx) => (
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
            {intolerant.supplements.length > 0 ? (
              <Box sx={{ mb: 3, pl: 2 }}>
                {intolerant.supplements.map((supplement, idx) => (
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
            {intolerant.foods.length > 0 ? (
              <Box sx={{ pl: 2 }}>
                {intolerant.foods.map((food, idx) => (
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
            {JSON.stringify(processedData, null, 2)}
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