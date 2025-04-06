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
  isSpike: boolean;
  foodItem: string | null;
  supplementIntroduced: string | null;
  bpSystolic: number | null;
  bpDiastolic: number | null;
  bloodSugar: number | null;
  tolerantIntolerant: string | null;
}

export default function GenosJourneyWidget() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [weightData, setWeightData] = useState<WeightLogEntry[]>([]);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [userData, setUserData] = useState<{ email: string } | null>(null);
  const [yAxisDomain, setYAxisDomain] = useState<[number, number] | undefined>(undefined);
  
  const supabase = createClient();

  // Fetch the user's data from our server-side API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Use our custom API endpoint instead of direct Supabase auth
        const response = await fetch('/api/auth/session-fix');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch user session');
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
  }, []);

  // Define emergency API fallback function
  const useFallbackWeightApi = async (userEmail: string) => {
    try {
      console.log('Using emergency bypass API for weight data...');
      
      const response = await fetch(`/api/user-data-bypass?email=${encodeURIComponent(userEmail)}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.weightData && data.weightData.length > 0) {
        // Process the data in the same way as the original function
        let processedData = data.weightData.map((entry: any) => {
          const dayText = entry.day_of_program || '';
          // Extract numeric value from day text (remove all non-digit characters)
          const dayNumber = parseInt(dayText.replace(/\D/g, '')) || 0;
          const weight = parseFloat(entry.weight_recorded || '0') || 0;
          const foodItem = entry.food_item_introduced || null;
          
          return {
            day: dayText,
            dayNumber: dayNumber,
            weight: weight,
            foodItem: foodItem,
            isSpike: false, // Will set this after sorting
            // Add additional data for tooltip/details
            supplementIntroduced: entry.supplement_introduced || null,
            bpSystolic: entry.bp_systolic || null,
            bpDiastolic: entry.bp_diastolic || null,
            bloodSugar: entry.blood_sugar || null,
            tolerantIntolerant: entry.tolerant_intolerant || null
          };
        })
        .filter((entry: WeightLogEntry) => entry.weight > 0 && entry.dayNumber > 0)
        .sort((a, b) => a.dayNumber - b.dayNumber);
        
        // Now calculate spikes AFTER sorting by day number
        processedData = processedData.map((entry, index, array) => {
          let isSpike = false;
          // Skip the first day (no previous data to compare)
          if (index > 0) {
            const prevWeight = array[index - 1].weight;
            isSpike = entry.weight > prevWeight;
          }
          
          return {
            ...entry,
            isSpike
          };
        });
        
        // Calculate Y-axis domain
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
          
          setYAxisDomain([yMin, yMax]);
        }
        
        setWeightData(processedData);
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Error in fallback weight API:', err);
      return false;
    }
  };

  // Fetch weight log data
  useEffect(() => {
    const fetchWeightData = async () => {
      if (!userData?.email) {
        return;
      }
      
      try {
        setIsLoading(true);
        
        try {
          // Simple query to get just the day and weight data
          const { data, error } = await supabase
            .from('weight_logs')
            .select('*')
            .eq('email', userData.email)
            .order('day_of_program', { ascending: true });

          if (error) {
            console.error('Supabase error details:', error);
            // If normal flow fails, try the emergency bypass
            console.log('Trying fallback API for weight data...');
            const fallbackSuccess = await useFallbackWeightApi(userData.email);
            
            if (!fallbackSuccess) {
              throw new Error(`Failed to fetch weight data: ${error.message}`);
            } else {
              setIsLoading(false);
              return; // Early return if fallback succeeded
            }
          }

          // Process the data... (the rest remains unchanged)
          console.log('Raw data from Supabase:', data);

          // Extract and process data first
          let processedData = data?.map((entry: any) => {
            const dayText = entry.day_of_program || '';
            // Extract numeric value from day text (remove all non-digit characters)
            const dayNumber = parseInt(dayText.replace(/\D/g, '')) || 0;
            const weight = parseFloat(entry.weight_recorded || '0') || 0;
            const foodItem = entry.food_item_introduced || null;
            
            return {
              day: dayText,
              dayNumber: dayNumber,
              weight: weight,
              foodItem: foodItem,
              isSpike: false, // Will set this after sorting
              // Add additional data for tooltip/details
              supplementIntroduced: entry.supplement_introduced || null,
              bpSystolic: entry.bp_systolic || null,
              bpDiastolic: entry.bp_diastolic || null,
              bloodSugar: entry.blood_sugar || null,
              tolerantIntolerant: entry.tolerant_intolerant || null
            };
          })
          .filter((entry: WeightLogEntry) => entry.weight > 0 && entry.dayNumber > 0)
          .sort((a, b) => a.dayNumber - b.dayNumber) || [];
          
          // Now calculate spikes AFTER sorting by day number
          processedData = processedData.map((entry, index, array) => {
            let isSpike = false;
            // Skip the first day (no previous data to compare)
            if (index > 0) {
              const prevWeight = array[index - 1].weight;
              isSpike = entry.weight > prevWeight;
              console.log(`Day ${entry.dayNumber} (${entry.weight}kg) > Day ${array[index-1].dayNumber} (${prevWeight}kg)? ${isSpike}`);
            }
            
            return {
              ...entry,
              isSpike
            };
          });

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
          // Try emergency bypass if anything goes wrong
          console.error('Error in normal weight data flow:', err);
          const fallbackSuccess = await useFallbackWeightApi(userData.email);
          
          if (!fallbackSuccess) {
            throw new Error(`Failed to fetch weight data: ${err instanceof Error ? err.message : 'Unknown error'}`);
          }
        }
        
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
          Weight Journey
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
                formatter={(value: any, name: string, props: any) => {
                  const isSpike = props.payload.isSpike;
                  return [`${value} kg${isSpike ? ' ↑' : ''}`, 'Weight'];
                }}
                labelFormatter={(dayNumber, payload) => {
                  if (payload && payload.length && payload[0].payload) {
                    const data = payload[0].payload;
                    let text = `Day: ${data.dayNumber}`;
                    
                    if (data.foodItem) {
                      text += `\nFood: ${data.foodItem}`;
                    }
                    
                    if (data.supplementIntroduced) {
                      text += `\nSupplement: ${data.supplementIntroduced}`;
                    }
                    
                    if (data.bpSystolic && data.bpDiastolic) {
                      text += `\nBP: ${data.bpSystolic}/${data.bpDiastolic}`;
                    }
                    
                    if (data.bloodSugar) {
                      text += `\nBlood Sugar: ${data.bloodSugar}`;
                    }
                    
                    if (data.tolerantIntolerant) {
                      text += `\nResult: ${data.tolerantIntolerant}`;
                    }
                    
                    return text;
                  }
                  return `Day: ${dayNumber}`;
                }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#2196F3"
                activeDot={{ r: 8 }}
                strokeWidth={2}
                dot={(props) => {
                  const isSpike = props.payload.isSpike;
                  if (!isSpike) {
                    return <circle cx={props.cx} cy={props.cy} r={2} fill="#2196F3" />;
                  }
                  return (
                    <circle 
                      cx={props.cx} 
                      cy={props.cy} 
                      r={5} 
                      fill="#FF5722" 
                      stroke="#FF5722"
                    />
                  );
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
} 