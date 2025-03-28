'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ScaleIcon from '@mui/icons-material/Scale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface WeightLogData {
  id?: string;
  Email?: string;
  email?: string;
  Weight?: number;
  Date?: string;
  "Food Item Introduced (Genos)"?: string;
  "Food Item Introduced  (Genos)"?: string;
  [key: string]: any;
}

interface ChartDataPoint {
  date: string;
  weight: number;
  foodIntroduced?: string;
  isSpike?: boolean;
}

export default function GenosJourneyWidget() {
  const [userData, setUserData] = useState<{ firstName: string; lastName: string; email: string } | null>(null);
  const [weightData, setWeightData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<boolean>(true);
  
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

  // Fetch weight log data
  useEffect(() => {
    const fetchWeightData = async () => {
      if (!userData?.email) {
        console.log('No user email available, skipping data fetch');
        return;
      }
      
      try {
        setIsLoading(true);
        console.log('Fetching weight data for email:', userData.email);
        
        // Fetch weight logs with date and introduced food items
        const { data, error } = await supabase
          .from('weight_logs')
          .select(`
            id,
            Date,
            Weight,
            "Food Item Introduced (Genos)",
            "Food Item Introduced  (Genos)"
          `)
          .eq('Email', userData.email)
          .order('Date', { ascending: true });

        if (error) {
          throw new Error(`Failed to fetch weight data: ${error.message}`);
        }

        console.log('Raw weight data:', data);

        if (!data || data.length === 0) {
          setWeightData([]);
          return;
        }

        // Process the data for the chart
        const processedData: ChartDataPoint[] = data.map((item: WeightLogData) => {
          // Handle both column name variations
          const foodItem = item["Food Item Introduced (Genos)"] || item["Food Item Introduced  (Genos)"] || '';
          
          return {
            date: new Date(item.Date || '').toLocaleDateString(),
            weight: item.Weight || 0,
            foodIntroduced: foodItem,
            // We'll calculate spikes after all data is processed
          };
        }).filter(item => item.weight > 0); // Filter out entries with no weight data

        // Sort by date
        processedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Identify weight spikes (significant increases from previous day)
        for (let i = 1; i < processedData.length; i++) {
          const weightDiff = processedData[i].weight - processedData[i-1].weight;
          // Consider a spike if weight increases by more than 1.5% from previous reading
          processedData[i].isSpike = weightDiff > (processedData[i-1].weight * 0.015);
        }

        setWeightData(processedData);
      } catch (err) {
        console.error('Error in fetchWeightData:', err);
        setError(`Failed to fetch your weight data: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
          p: 1.5, 
          bgcolor: 'rgba(35, 35, 35, 0.95)', 
          border: '1px solid rgba(255, 95, 31, 0.2)',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {data.date}
          </Typography>
          <Typography variant="body2">
            Weight: {data.weight} kg
          </Typography>
          {data.foodIntroduced && (
            <Typography variant="body2" sx={{ mt: 0.5, color: data.isSpike ? '#f44336' : 'inherit' }}>
              Food: {data.foodIntroduced}
              {data.isSpike && ' ⚠️'}
            </Typography>
          )}
          {data.isSpike && (
            <Typography variant="body2" sx={{ mt: 0.5, color: '#f44336', fontWeight: 500 }}>
              Potential sensitivity detected!
            </Typography>
          )}
        </Paper>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <CircularProgress color="primary" />
        <Typography sx={{ ml: 2 }}>Loading your weight journey data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!userData) {
    return (
      <Alert severity="warning" sx={{ mb: 3 }}>
        Please log in to view your weight journey data.
      </Alert>
    );
  }

  if (weightData.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        No weight journey data found for {userData.firstName || ''} {userData.lastName || ''}. Please ensure your weight logs are properly entered in the system.
      </Alert>
    );
  }

  return (
    <Accordion 
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      sx={{ 
        mb: 2,
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
          background: 'linear-gradient(90deg, #FF5F1F 0%, #FFA726 100%)',
        },
        '&.Mui-expanded': {
          margin: 0,
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
        <ScaleIcon sx={{ color: '#FF5F1F', mr: 1.5, fontSize: 24 }} />
        <Typography variant="h6" sx={{ color: '#FF5F1F', fontWeight: 600 }}>
          Genos Journey
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ padding: '16px' }}>
        <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.7)' }}>
          Your weight journey showing potential food sensitivities. Weight spikes may indicate a reaction to recently introduced foods.
        </Typography>
        
        <Box sx={{ height: 300, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={weightData}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.5)"
                tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                tickLine={{ stroke: 'rgba(255,255,255,0.3)' }}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.5)"
                tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                tickLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                domain={['auto', 'auto']} 
                label={{ 
                  value: 'Weight (kg)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: 'rgba(255,255,255,0.6)', fontSize: 12 }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="#FF5F1F" 
                strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  return payload.isSpike ? (
                    <svg x={cx - 6} y={cy - 6} width={12} height={12} fill="#f44336" viewBox="0 0 12 12">
                      <circle cx="6" cy="6" r="6" />
                    </svg>
                  ) : (
                    <svg x={cx - 4} y={cy - 4} width={8} height={8} fill="#FF5F1F" viewBox="0 0 8 8">
                      <circle cx="4" cy="4" r="4" />
                    </svg>
                  );
                }}
                activeDot={{ r: 8, fill: '#FFA726' }}
              />
              {/* Add reference lines for weight spikes */}
              {weightData.filter(d => d.isSpike).map((d, i) => (
                <ReferenceLine key={i} x={d.date} stroke="#f44336" strokeDasharray="3 3" />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Box>
        
        {/* Legend */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#FF5F1F', mr: 1 }} />
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Weight
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f44336', mr: 1 }} />
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Weight spike
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 2, height: 12, bgcolor: '#f44336', mr: 1 }} />
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Potential sensitivity
            </Typography>
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
} 