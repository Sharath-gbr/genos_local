'use client';

import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, CircularProgress, Alert } from '@mui/material';
import { createClient } from '@/lib/supabase/client';

interface WeightLogData {
  id: string;
  Email?: string;
  email?: string; // Add lowercase version as well to handle potential case variations
  weight?: number;
  date?: string;
  [key: string]: any; // For any other fields in the weight_logs table
}

export default function FoodSensitivityWidget() {
  const [userData, setUserData] = useState<{ firstName: string; lastName: string; email: string } | null>(null);
  const [weightLogs, setWeightLogs] = useState<WeightLogData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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

  // Fetch weight logs data directly from Supabase when user is authenticated
  useEffect(() => {
    const fetchWeightLogs = async () => {
      if (!userData?.email) return;
      
      try {
        setIsLoading(true);
        console.log('Attempting to fetch weight logs for email:', userData.email);
        
        // First, check if the table exists by describing it
        const { error: tableError } = await supabase
          .from('weight_logs')
          .select('id')
          .limit(1);
          
        if (tableError) {
          console.error('Table access error:', tableError);
          // Try with weight_log singular as an alternative
          console.log('Trying alternative table name: weight_log');
          const { data: alternativeData, error: alternativeError } = await supabase
            .from('weight_log')
            .select('*');
            
          if (alternativeError) {
            console.error('Alternative table error:', alternativeError);
            throw new Error(`Table access error: ${tableError.message}`);
          }
          
          console.log('Data found in alternative table:', alternativeData);
          setWeightLogs(alternativeData || []);
          return;
        }
        
        // Query the weight_logs table - RLS will automatically filter for the current user
        const { data, error } = await supabase
          .from('weight_logs')
          .select('*');
        
        if (error) {
          console.error('Query error:', error);
          throw error;
        }
        
        console.log('Weight logs data:', data);
        
        // If no data found, try a direct query with the email
        if (!data || data.length === 0) {
          console.log('No data found with RLS, trying direct query with email');
          
          // Try uppercase Email
          const { data: emailData, error: emailError } = await supabase
            .from('weight_logs')
            .select('*')
            .eq('Email', userData.email);
            
          if (emailError) {
            console.error('Email query error:', emailError);
          } else if (emailData && emailData.length > 0) {
            console.log('Found data with uppercase Email:', emailData);
            setWeightLogs(emailData);
            setIsLoading(false);
            return;
          }
          
          // Try lowercase email
          const { data: lowerEmailData, error: lowerEmailError } = await supabase
            .from('weight_logs')
            .select('*')
            .eq('email', userData.email);
            
          if (lowerEmailError) {
            console.error('Lowercase email query error:', lowerEmailError);
          } else if (lowerEmailData && lowerEmailData.length > 0) {
            console.log('Found data with lowercase email:', lowerEmailData);
            setWeightLogs(lowerEmailData);
            setIsLoading(false);
            return;
          }
        }
        
        setWeightLogs(data || []);
      } catch (err) {
        console.error('Error fetching weight logs:', err);
        setError(`Failed to fetch your food sensitivity data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (userData?.email) {
      fetchWeightLogs();
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
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (!userData) {
    return (
      <Alert severity="warning" sx={{ mb: 3 }}>
        Please log in to view your food sensitivity data.
      </Alert>
    );
  }

  if (weightLogs.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        No food sensitivity data found for {userData.firstName || ''} {userData.lastName || ''}. Please ensure your data is properly entered in the system.
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
      
      {/* Display the weight logs data */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Your Weight Logs History
        </Typography>
        
        {weightLogs.map((log, index) => (
          <Box key={log.id || index} sx={{ mb: 2, p: 2, borderRadius: 1, bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
            {Object.entries(log).map(([key, value]) => {
              // Skip internal or non-essential fields
              if (key === 'id' || key === 'Email' || key === 'email' || value === null || value === undefined) return null;
              
              return (
                <Box key={key} sx={{ display: 'flex', mb: 1 }}>
                  <Typography sx={{ fontWeight: 500, minWidth: '200px', color: '#FF5F1F' }}>
                    {key.replace(/_/g, ' ')}:
                  </Typography>
                  <Typography>
                    {Array.isArray(value) 
                      ? value.join(', ') 
                      : typeof value === 'object' && value !== null
                        ? JSON.stringify(value)
                        : String(value)}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    </Paper>
  );
} 