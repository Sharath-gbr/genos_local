import Image from 'next/image';
import { useState } from 'react';
import { Paper, Box, Typography, useMediaQuery, useTheme } from '@mui/material';

interface Recipe {
  id: string;
  name: string;
  image: string;
  ingredients: string;
  instructions: string;
  calories: number;
  carbs: number;
  proteins: number;
  fats: number;
  dietType: string[];
  mealType: string;
  phase: string;
  proteinMealType: string;
}

export function RecipeCard({ recipe, onClick }: { recipe: Recipe; onClick: () => void }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Paper
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 2,
        border: '1px solid rgba(255, 95, 31, 0.2)',
        overflow: 'hidden',
        transition: 'transform 0.2s, border-color 0.2s',
        width: '100%',
        maxWidth: isMobile ? '150px' : '200px',
        margin: '0 auto',
        '&:hover': {
          transform: 'translateY(-4px)',
          borderColor: 'rgba(255, 95, 31, 0.5)',
        },
        [theme.breakpoints.down('sm')]: {
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        }
      }}
    >
      <Box sx={{ 
        position: 'relative', 
        height: isMobile ? '110px' : '135px'
      }}>
        <Image
          src={recipe.image}
          alt={recipe.name}
          fill
          sizes={isMobile ? "150px" : "200px"}
          priority={false}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          style={{ 
            objectFit: 'cover',
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity 0.3s'
          }}
        />
        {!imageLoaded && (
          <Box sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            animation: 'pulse 1.5s infinite ease-in-out'
          }} />
        )}
      </Box>
      <Box sx={{ 
        p: isMobile ? 1 : 1.5 
      }}>
        <Typography 
          sx={{ 
            color: '#FFFFFF',
            fontWeight: 500,
            fontSize: isMobile ? '0.8rem' : '0.9rem',
            textAlign: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {recipe.name}
        </Typography>
      </Box>
    </Paper>
  );
} 