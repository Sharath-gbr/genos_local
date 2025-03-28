'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import FoodSensitivityWidget from '@/components/FoodSensitivity/FoodSensitivityWidget';
import GenosJourneyWidget from '@/components/FoodSensitivity/GenosJourneyWidget';

export default function FoodSensitivityHub() {
  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Typography variant="h5" sx={{ color: '#FF5F1F', mb: 3, fontWeight: 600 }}>
        Food and Sensitivity Hub
      </Typography>
      
      <FoodSensitivityWidget />
      <GenosJourneyWidget />
    </Box>
  );
} 