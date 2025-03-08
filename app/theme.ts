import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#FF5F1F',
      light: '#FF7F45',
      dark: '#E54600',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FF8C69', // Soft coral
      light: '#FFB299',
      dark: '#FF6B45',
    },
    background: {
      default: '#1E1E1E', // Dark matte grey
      paper: '#2C2C2C', // Lighter matte grey
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#FF8C69',
    },
    action: {
      hover: 'rgba(255, 95, 31, 0.1)',
      selected: 'rgba(255, 95, 31, 0.2)',
    },
  },
  typography: {
    fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 5px 15px rgba(255, 95, 31, 0.3)',
          },
        },
        contained: {
          background: 'linear-gradient(45deg, #FF5F1F 30%, #FF8C69 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #E54600 30%, #FF5F1F 90%)',
          },
        },
        outlined: {
          borderColor: '#FF5F1F',
          '&:hover': {
            borderColor: '#FF8C69',
            backgroundColor: 'rgba(255, 95, 31, 0.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            '&:hover fieldset': {
              borderColor: '#FF5F1F',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#FF8C69',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#2C2C2C', // Matching matte grey
          borderRadius: 16,
          border: '1px solid rgba(255, 95, 31, 0.2)',
          boxShadow: '0 4px 30px rgba(255, 95, 31, 0.15)',
        },
      },
    },
  },
}); 