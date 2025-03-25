'use client';

import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { createClient } from '@/lib/supabase/client';

interface WeightLogData {
  id?: string;
  Email?: string;
  email?: string;
  "Food Item Introduced (Genos)"?: string;
  "Supplement Introduced"?: string;
  "Tolerant Food Items"?: string;
  [key: string]: any;
}

export default function FoodSensitivityWidget() {
  const [userData, setUserData] = useState<{ firstName: string; lastName: string; email: string } | null>(null);
  const [toleranceData, setToleranceData] = useState<WeightLogData[]>([]);
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
        
        // Process the data to extract tolerance information
        // Look for relevant columns in the data (may be different per row)
        const toleranceFields = [
          "Food Item Introduced (Genos)", 
          "Supplement Introduced", 
          "Tolerant Food Items",
          "Food_Item_Introduced", 
          "Supplement_Introduced", 
          "Tolerant_Food_Items"
        ];
        
        // Check if any rows have tolerance data
        const relevantData = data.filter(row => {
          return toleranceFields.some(field => 
            row[field] !== undefined && row[field] !== null && row[field] !== ''
          );
        });
        
        if (relevantData.length > 0) {
          console.log('Found tolerance data in weight_logs:', relevantData);
          setToleranceData(relevantData);
        } else {
          // If no specific tolerance fields, just use all non-empty data
          setToleranceData(data);
        }
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

  return (
    <Paper 
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 2,
        backgroundColor: 'rgba(45, 45, 45, 0.95)',
        border: '1px solid rgba(255, 95, 31, 0.2)',
        color: '#FFFFFF',
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, color: '#FF5F1F' }}>
        Food Sensitivity Data for {userData.firstName || 'User'} {userData.lastName || ''}
      </Typography>
      
      {/* Tolerances Section */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, color: '#FF5F1F' }}>
          Weight Logs & Tolerance Data
        </Typography>
        
        {toleranceData.map((item, index) => (
          <Box key={index} sx={{ mb: 2, p: 2, borderRadius: 1, bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
            {Object.entries(item).map(([key, value]) => {
              // Skip null/undefined values and internal fields
              if (value === null || value === undefined || 
                  key === 'id' || 
                  (key === 'email' || key === 'Email') && value === userData.email) 
                return null;
              
              return (
                <Box key={key} sx={{ display: 'flex', mb: 1 }}>
                  <Typography sx={{ fontWeight: 500, minWidth: '200px', color: '#FF5F1F' }}>
                    {key.replace(/[_-]/g, ' ').replace(/\(Genos\)/g, '')}:
                  </Typography>
                  <Typography>
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
      
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
            User Email:
          </Typography>
          <Typography>{userData.email}</Typography>
          
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
            Record Count:
          </Typography>
          <Typography>{toleranceData.length} records found</Typography>
          
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
            Sample Data (First Record):
          </Typography>
          <pre style={{ overflow: 'auto', maxHeight: '200px' }}>
            {JSON.stringify(toleranceData[0], null, 2)}
          </pre>
        </Box>
      )}
    </Paper>
  );
} 