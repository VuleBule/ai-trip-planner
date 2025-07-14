import { createTheme } from '@mui/material';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FF6B35', // Basketball orange
      light: '#FF9A73',
      dark: '#E55A2B',
    },
    secondary: {
      main: '#FF1B8D', // Hot pink
      light: '#FF5FA8',
      dark: '#E0186E',
    },
    background: {
      default: '#0F0620', // Deep purple-black
      paper: 'rgba(255, 255, 255, 0.05)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#E0E0E0',
    },
    info: {
      main: '#00E5FF', // Electric cyan
    },
    warning: {
      main: '#FFD700', // Gold
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 900,
      background: 'linear-gradient(135deg, #FF6B35 0%, #FF1B8D 50%, #00E5FF 100%)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '0 0 30px rgba(255, 107, 53, 0.5)',
    },
    h3: {
      fontWeight: 800,
      color: '#FFFFFF',
      textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
    },
    h5: {
      fontWeight: 700,
      color: '#FFFFFF',
    },
    h6: {
      fontWeight: 600,
      color: '#FFFFFF',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});