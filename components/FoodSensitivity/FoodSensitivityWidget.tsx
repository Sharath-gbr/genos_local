'use client';

import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, CircularProgress, Alert } from '@mui/material';
import { createClient } from '@/lib/supabase/client';

interface ToleranceData {
  id?: string;
  "Food Item Introduced (Genos)"?: string;
  "Supplement Introduced"?: string;
  "Tolerant Food Items"?: string;
  [key: string]: any;
}

export default function FoodSensitivityWidget() {
  const [userData, setUserData] = useState<{ firstName: string; lastName: string; email: string } | null>(null);
  const [toleranceData, setToleranceData] = useState<ToleranceData[]>([]);
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

  // Fetch tolerance data when user is authenticated
  useEffect(() => {
    const fetchToleranceData = async () => {
      if (!userData?.email) return;
      
      try {
        setIsLoading(true);
        console.log('Attempting to fetch tolerance data for email:', userData.email);
        
        // Try to query the food_sensitivity table for tolerance data
        // We'll select just the three columns we need and filter for non-null Tolerant Food Items
        const { data, error } = await supabase
          .from('food_sensitivity')
          .select('"Food Item Introduced (Genos)", "Supplement Introduced", "Tolerant Food Items"')
          .not('Tolerant Food Items', 'is', null)
          .neq('Tolerant Food Items', '');
        
        if (error) {
          console.error('Query error:', error);
          
          // Try alternative table name
          console.log('Trying alternative table name: food_sensitivities');
          const { data: altData, error: altError } = await supabase
            .from('food_sensitivities')
            .select('"Food Item Introduced (Genos)", "Supplement Introduced", "Tolerant Food Items"')
            .not('Tolerant Food Items', 'is', null)
            .neq('Tolerant Food Items', '');
            
          if (altError) {
            console.error('Alternative table error:', altError);
            throw error; // Throw the original error
          }
          
          console.log('Tolerance data found:', altData);
          setToleranceData(altData || []);
          return;
        }
        
        console.log('Tolerance data found:', data);
        setToleranceData(data || []);
      } catch (err) {
        console.error('Error fetching tolerance data:', err);
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
          Tolerances
        </Typography>
        
        {toleranceData.map((item, index) => (
          <Box key={index} sx={{ mb: 2, p: 2, borderRadius: 1, bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
            {/* Food Item Introduced */}
            {item["Food Item Introduced (Genos)"] && (
              <Box sx={{ display: 'flex', mb: 1 }}>
                <Typography sx={{ fontWeight: 500, minWidth: '200px', color: '#FF5F1F' }}>
                  Food Item Introduced:
                </Typography>
                <Typography>
                  {item["Food Item Introduced (Genos)"]}
                </Typography>
              </Box>
            )}
            
            {/* Supplement Introduced */}
            {item["Supplement Introduced"] && (
              <Box sx={{ display: 'flex', mb: 1 }}>
                <Typography sx={{ fontWeight: 500, minWidth: '200px', color: '#FF5F1F' }}>
                  Supplement Introduced:
                </Typography>
                <Typography>
                  {item["Supplement Introduced"]}
                </Typography>
              </Box>
            )}
            
            {/* Tolerant Food Items */}
            {item["Tolerant Food Items"] && (
              <Box sx={{ display: 'flex', mb: 1 }}>
                <Typography sx={{ fontWeight: 500, minWidth: '200px', color: '#FF5F1F' }}>
                  Tolerant Food Items:
                </Typography>
                <Typography>
                  {item["Tolerant Food Items"]}
                </Typography>
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Paper>
  );
} 