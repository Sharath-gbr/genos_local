'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Label } from 'recharts';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TimelineIcon from '@mui/icons-material/Timeline';

interface WeightLogEntry {
  day: string;
  weight: number;
  food: string | null;
  isSpike: boolean;
  dayNumber: number;
}

export default function GenosJourneyWidget() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [weightData, setWeightData] = useState<WeightLogEntry[]>([]);
  const [expanded, setExpanded] = useState<boolean>(true);
  const [userData, setUserData] = useState<{ email: string } | null>(null);
  
  const supabase = createClient();

  // Fetch the user's data from Supabase auth
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get the current user session
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          throw error;
        }
        
        if (data?.user) {
          console.log('User email for Genos Journey:', data.user.email);
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
        
        // Fetch all relevant data in one query
        const { data, error } = await supabase
          .from('weight_logs')
          .select(`
            "Day of the Program",
            "Weight Recorded",
            "Food Item Introduced  (Genos)"
          `)
          .eq('Email', userData.email)
          .order('"Day of the Program"', { ascending: true });

        if (error) {
          throw new Error(`Failed to fetch weight data: ${error.message}`);
        }

        console.log('Raw weight data:', data);

        // Process the data for the chart
        const processedData = data?.map((entry: any, index: number) => {
          // Extract day and convert to number if possible
          let day = entry["Day of the Program"] || '';
          let dayNumber = parseInt(day.replace(/\D/g, '')) || (index + 1);
          
          // Extract weight and convert to number
          let weight = parseFloat(entry["Weight Recorded"] || '0') || 0;
          
          // Extract food item
          let food = entry["Food Item Introduced  (Genos)"] || null;
          
          return {
            day,
            dayNumber,
            weight,
            food,
            isSpike: false, // We'll calculate this in the next step
          };
        }) || [];

        // Calculate average weight and identify spikes
        if (processedData.length > 0) {
          const weights = processedData.filter(d => d.weight > 0).map(d => d.weight);
          const avgWeight = weights.reduce((sum, weight) => sum + weight, 0) / weights.length;
          const threshold = avgWeight * 0.02; // 2% above average is considered a spike
          
          processedData.forEach((entry, i) => {
            if (i > 0 && entry.weight > 0 && processedData[i-1].weight > 0) {
              const increase = entry.weight - processedData[i-1].weight;
              entry.isSpike = increase > threshold;
            }
          });
        }

        setWeightData(processedData.filter(d => d.weight > 0)); // Filter out entries with no weight
        
      } catch (err) {
        console.error('Error in fetchWeightData:', err);
        setError(`Failed to fetch weight journey data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (userData?.email) {
      fetchWeightData();
    }
  }, [userData, supabase]);

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Paper sx={{ 
          p: 2, 
          bgcolor: 'rgba(35, 35, 35, 0.95)', 
          border: '1px solid rgba(255, 95, 31, 0.2)',
          color: '#FFFFFF',
          boxShadow: 3,
          maxWidth: 220
        }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Day: {data.day}
          </Typography>
          <Typography sx={{ fontSize: '0.9rem' }}>
            Weight: {data.weight} kg
          </Typography>
          {data.food && (
            <Typography sx={{ 
              fontSize: '0.9rem', 
              mt: 1, 
              color: data.isSpike ? '#ff7043' : '#8BC34A' 
            }}>
              Food: {data.food}
              {data.isSpike && <span style={{ color: '#ff7043', marginLeft: 4 }}>⚠️ Spike</span>}
            </Typography>
          )}
        </Paper>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <CircularProgress color="primary" />
        <Typography sx={{ ml: 2 }}>Loading your weight journey data...</Typography>
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
        No weight journey data found. Please ensure your data is properly entered in the system.
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
            justifyContent: 'flex-start',
          }
        }}
      >
        <TimelineIcon sx={{ color: '#2196F3', mr: 1.5, fontSize: 24 }} />
        <Typography variant="h6" sx={{ color: '#2196F3', fontWeight: 600 }}>
          Genos Journey ({weightData.length} days)
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ padding: '0 16px 16px' }}>
        <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.7)' }}>
          Your weight journey over time. Weight spikes are highlighted and associated with introduced foods.
        </Typography>
        
        <Box sx={{ height: 300, position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={weightData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="dayNumber" 
                stroke="#FFFFFF" 
                tick={{ fill: '#FFFFFF' }}
              >
                <Label
                  value="Day of Program"
                  position="insideBottom"
                  offset={-5}
                  style={{ textAnchor: 'middle', fill: '#FFFFFF' }}
                />
              </XAxis>
              <YAxis 
                stroke="#FFFFFF" 
                tick={{ fill: '#FFFFFF' }}
                domain={['auto', 'auto']}
              >
                <Label
                  value="Weight (kg)"
                  position="insideLeft"
                  angle={-90}
                  style={{ textAnchor: 'middle', fill: '#FFFFFF' }}
                />
              </YAxis>
              <Tooltip content={<CustomTooltip />} />
              
              {/* Average Weight Line */}
              {weightData.length > 0 && (
                <ReferenceLine 
                  y={weightData.reduce((sum, entry) => sum + entry.weight, 0) / weightData.length} 
                  stroke="#FFEB3B" 
                  strokeDasharray="3 3"
                  label={{ 
                    value: "Avg", 
                    position: "right", 
                    fill: "#FFEB3B" 
                  }} 
                />
              )}
              
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#2196F3"
                dot={(props) => {
                  const isSpike = props.payload?.isSpike;
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={isSpike ? 6 : 4}
                      fill={isSpike ? "#ff7043" : "#2196F3"}
                      stroke={isSpike ? "#ff7043" : "#2196F3"}
                      strokeWidth={isSpike ? 2 : 1}
                    />
                  );
                }}
                activeDot={{ r: 8, fill: '#03A9F4' }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
        
        {/* Weight Spike Legend */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#2196F3', mr: 1 }} />
            <Typography variant="body2">Normal Weight</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff7043', mr: 1 }} />
            <Typography variant="body2">Weight Spike</Typography>
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
} 