'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TimelineIcon from '@mui/icons-material/Timeline';

interface WeightLogEntry {
  day: string;
  dayNumber: number;
  weight: number;
}

export default function GenosJourneyWidget() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [weightData, setWeightData] = useState<WeightLogEntry[]>([]);
  const [expanded, setExpanded] = useState<boolean>(true);
  const [userData, setUserData] = useState<{ email: string } | null>(null);
  const [yAxisDomain, setYAxisDomain] = useState<[number, number] | undefined>(undefined);
  
  const supabase = createClient();

  // Fetch the user's data from Supabase auth
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          throw error;
        }
        
        if (data?.user) {
          setUserData({
            email: data.user.email || '',
          });
        } else {
          setError('No user is currently logged in');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to fetch user data');
      }
    };

    fetchUserData();
  }, [supabase.auth]);

  // Fetch weight log data
  useEffect(() => {
    const fetchWeightData = async () => {
      if (!userData?.email) {
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Simple query to get just the day and weight data
        const { data, error } = await supabase
          .from('weight_logs')
          .select('*')
          .eq('Email', userData.email)
          .order('"Day of the Program"', { ascending: true });

        if (error) {
          console.error('Supabase error details:', error);
          throw new Error(`Failed to fetch weight data: ${error.message}`);
        }

        // Simple processing - just extract day and weight
        const processedData = data?.map((entry: any) => {
          const dayText = entry["Day of the Program"] || '';
          // Extract numeric value from day text (remove all non-digit characters)
          const dayNumber = parseInt(dayText.replace(/\D/g, '')) || 0;
          
          return {
            day: dayText,
            dayNumber: dayNumber,
            weight: parseFloat(entry["Weight Recorded"] || '0') || 0,
          };
        })
        .filter((entry: WeightLogEntry) => entry.weight > 0 && entry.dayNumber > 0)
        .sort((a, b) => a.dayNumber - b.dayNumber) || [];

        console.log('Processed weight data:', processedData);
        
        // Calculate min and max weight for Y-axis scaling
        if (processedData.length > 0) {
          const weights = processedData.map(entry => entry.weight);
          const minWeight = Math.min(...weights);
          const maxWeight = Math.max(...weights);
          
          // Calculate padding based on the weight range
          const range = maxWeight - minWeight;
          const padding = range < 10 ? 2.5 : 5;
          
          // Round down min and round up max for cleaner numbers
          const yMin = Math.floor(minWeight / padding) * padding;
          const yMax = Math.ceil(maxWeight / padding) * padding;
          
          console.log(`Weight range: ${minWeight} to ${maxWeight}, Y-axis: ${yMin} to ${yMax}`);
          setYAxisDomain([yMin, yMax]);
        }
        
        setWeightData(processedData);
        
      } catch (err) {
        console.error('Error in fetchWeightData:', err);
        setError(`Failed to fetch weight data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (userData?.email) {
      fetchWeightData();
    }
  }, [userData, supabase]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <CircularProgress color="primary" />
        <Typography sx={{ ml: 2 }}>Loading your weight data...</Typography>
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

  if (weightData.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        No weight data found. Please ensure your data is properly entered in the system.
      </Alert>
    );
  }

  return (
    <Accordion 
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      sx={{
        mt: 3,
        background: 'linear-gradient(145deg, rgba(45, 45, 45, 0.97) 0%, rgba(35, 35, 35, 0.95) 100%)',
        border: '1px solid rgba(255, 95, 31, 0.2)',
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
          background: 'linear-gradient(90deg, #2196F3 0%, #03A9F4 100%)',
        },
        '&.Mui-expanded': {
          margin: '16px 0',
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
          }
        }}
      >
        <TimelineIcon sx={{ color: '#2196F3', mr: 1.5, fontSize: 24 }} />
        <Typography variant="h6" sx={{ color: '#2196F3', fontWeight: 600 }}>
          Weight Journey ({weightData.length} entries)
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ padding: '0 16px 16px' }}>
        <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.7)' }}>
          Your weight measurements over time.
        </Typography>
        
        <Box sx={{ height: 300, width: '100%' }}>
          <ResponsiveContainer>
            <LineChart
              data={weightData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 30,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="dayNumber" 
                stroke="#FFFFFF" 
                tick={{ fill: '#FFFFFF' }}
                label={{ value: 'Day of Program', position: 'insideBottom', offset: -10, fill: '#FFFFFF' }}
              />
              <YAxis 
                stroke="#FFFFFF" 
                tick={{ fill: '#FFFFFF' }}
                label={{ value: 'Weight (kg)', position: 'insideLeft', angle: -90, fill: '#FFFFFF' }}
                domain={yAxisDomain}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(35, 35, 35, 0.95)', 
                  border: '1px solid #2196F3',
                  color: '#FFFFFF' 
                }}
                formatter={(value: any) => [`${value} kg`, 'Weight']}
                labelFormatter={(dayNumber) => `Day: ${dayNumber}`}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#2196F3"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
} 