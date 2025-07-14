import React, { useState, lazy, Suspense } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Paper,
  Card,
  CardContent,
  Chip,
  CircularProgress
} from '@mui/material';
import { SportsBasketball, Groups, AutoAwesome } from '@mui/icons-material';
import { RosterRequest, RosterResponse } from './types/roster';

// Lazy load components for better performance
const RosterBuilderForm = lazy(() => import('./components/RosterBuilderForm'));
const TripResults = lazy(() => import('./components/TripResults'));

// Performance optimizations applied

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FF6B35',
      light: '#FF9A73',
      dark: '#E55A2B',
    },
    secondary: {
      main: '#FF1B8D',
      light: '#FF5FA8',
      dark: '#E0186E',
    },
    background: {
      default: '#0F0620',
      paper: 'rgba(255, 255, 255, 0.05)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#E0E0E0',
    },
    info: {
      main: '#00E5FF',
    },
    warning: {
      main: '#FFD700',
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
    },
    h3: {
      fontWeight: 800,
      color: '#FFFFFF',
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
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s ease',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(15, 6, 32, 0.9)',
          backdropFilter: 'blur(20px)',
          border: 'none',
          boxShadow: '0 10px 30px rgba(255, 107, 53, 0.2)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '15px',
          textTransform: 'none',
          fontWeight: 700,
          fontSize: '1.1rem',
          padding: '12px 30px',
          background: 'linear-gradient(135deg, #FF6B35 0%, #FF1B8D 100%)',
          boxShadow: '0 10px 30px rgba(255, 107, 53, 0.4)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 15px 40px rgba(255, 107, 53, 0.6)',
          },
        },
      },
    },
  },
});

// Loading component for Suspense
const LoadingSpinner = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
    <CircularProgress size={60} />
  </Box>
);

function App() {
  const [rosterResponse, setRosterResponse] = useState<RosterResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBuildRoster = async (rosterRequest: RosterRequest) => {
    setLoading(true);
    setError(null);
    setRosterResponse(null);

    try {
      const response = await fetch('http://localhost:8000/build-roster', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rosterRequest),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: RosterResponse = await response.json();
      setRosterResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error building roster:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewRoster = () => {
    setRosterResponse(null);
    setError(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0F0620 0%, #1A0B3D 25%, #2D1B69 50%, #FF1B8D 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Simplified floating icons */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            right: '10%',
            zIndex: 1,
            opacity: 0.6,
          }}
        >
          <SportsBasketball sx={{ fontSize: '4rem', color: '#FF6B35' }} />
        </Box>

        {/* Header */}
        <AppBar position="static" elevation={0}>
          <Toolbar sx={{ py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Groups sx={{ mr: 2, fontSize: '2rem', color: '#FF6B35' }} />
              <Typography 
                variant="h4" 
                component="div" 
                sx={{ 
                  flexGrow: 1,
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #FF6B35 0%, #FF1B8D 50%, #00E5FF 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '2px',
                }}
              >
                WNBA TEAM BUILDER
              </Typography>
            </Box>
            <SportsBasketball sx={{ fontSize: '2.5rem', color: '#FF1B8D' }} />
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 5, py: 6 }}>
          {/* Hero Section */}
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography 
              variant="h1" 
              component="h1" 
              sx={{ 
                fontSize: { xs: '3rem', md: '5rem', lg: '6rem' },
                fontWeight: 900,
                mb: 3,
                background: 'linear-gradient(135deg, #FF6B35 0%, #FF1B8D 30%, #00E5FF 60%, #FFD700 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '3px',
              }}
            >
              BUILD YOUR
            </Typography>
            <Typography 
              variant="h1" 
              component="h1" 
              sx={{ 
                fontSize: { xs: '3.5rem', md: '6rem', lg: '7rem' },
                fontWeight: 900,
                mb: 4,
                background: 'linear-gradient(135deg, #FFD700 0%, #FF1B8D 50%, #FF6B35 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '4px',
              }}
            >
              DREAM TEAM
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ 
                color: '#E0E0E0',
                maxWidth: '800px',
                mx: 'auto',
                mb: 6,
                fontSize: { xs: '1.2rem', md: '1.8rem' },
                fontWeight: 500,
                lineHeight: 1.4,
                opacity: 0.9,
              }}
            >
              🏀 AI-Powered WNBA Roster Building • Salary Cap Analysis • Team Chemistry Optimization
            </Typography>
          </Box>

          {/* Features Cards */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
            <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                    🏀 Player Analysis
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Analyze player performance, fit, and contract value assessments
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: 'success.main' }}>
                    📋 Roster Construction
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Build complete rosters with optimal player combinations
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Features Grid */}
          <Box sx={{ mb: 8 }}>
            <Typography 
              variant="h3" 
              component="h2" 
              align="center" 
              sx={{ 
                mb: 6,
                fontWeight: 800,
                background: 'linear-gradient(135deg, #FF6B35 0%, #FF1B8D 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '2px',
              }}
            >
              ✨ ELITE FEATURES ✨
            </Typography>
            <Box 
              sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' }, 
                gap: 4,
                mb: 8,
              }}
            >
              {/* AI Analysis Card */}
              <Card sx={{ p: 4, textAlign: 'center', height: '300px' }}>
                <AutoAwesome sx={{ fontSize: '4rem', color: '#FF6B35', mb: 2 }} />
                <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 700 }}>
                  🤖 AI GENIUS
                </Typography>
                <Typography variant="body1" sx={{ color: '#E0E0E0', fontSize: '1.1rem', lineHeight: 1.6 }}>
                  Advanced AI algorithms analyze player combinations, predict team chemistry, and optimize lineup configurations
                </Typography>
              </Card>

              {/* Salary Cap Card */}
              <Card sx={{ p: 4, textAlign: 'center', height: '300px' }}>
                <Typography variant="h2" component="div" sx={{ color: '#FFD700', mb: 2, fontWeight: 900 }}>
                  $
                </Typography>
                <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 700 }}>
                  💰 SALARY MASTER
                </Typography>
                <Typography variant="body1" sx={{ color: '#E0E0E0', fontSize: '1.1rem', lineHeight: 1.6 }}>
                  Stay within WNBA CBA constraints while maximizing team value and championship potential
                </Typography>
              </Card>

              {/* Team Chemistry Card */}
              <Card sx={{ p: 4, textAlign: 'center', height: '300px' }}>
                <Groups sx={{ fontSize: '4rem', color: '#00E5FF', mb: 2 }} />
                <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 700 }}>
                  🔥 TEAM SYNERGY
                </Typography>
                <Typography variant="body1" sx={{ color: '#E0E0E0', fontSize: '1.1rem', lineHeight: 1.6 }}>
                  Evaluate player compatibility, leadership dynamics, and on-court chemistry for championship-winning combinations
                </Typography>
              </Card>
            </Box>
          </Box>

          {/* Main Content */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 6, position: 'relative', zIndex: 5 }}>
            <Box sx={{ flex: '0 0 auto', width: { xs: '100%', lg: '500px' } }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Build Your Roster
                </Typography>
                <Suspense fallback={<LoadingSpinner />}>
                  <RosterBuilderForm onSubmit={handleBuildRoster} loading={loading} />
                </Suspense>
              </Paper>
            </Box>

            <Box sx={{ flex: 1 }}>
              {error && (
                <Paper sx={{ p: 3, mb: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
                  <Typography variant="h6" gutterBottom>
                    Error
                  </Typography>
                  <Typography>{error}</Typography>
                </Paper>
              )}

              {rosterResponse && (
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" gutterBottom>
                      Your Roster Analysis
                    </Typography>
                    <Chip
                      label={rosterResponse.agent_type}
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                  <Suspense fallback={<LoadingSpinner />}>
                    <TripResults response={rosterResponse} onNewTrip={handleNewRoster} />
                  </Suspense>
                </Paper>
              )}

              {!rosterResponse && !loading && !error && (
                <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'grey.50' }}>
                  <Typography variant="h6" color="text.secondary">
                    Fill out the form to get your personalized roster analysis
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Our AI agents will analyze WNBA rules and create the optimal team strategy
                  </Typography>
                </Paper>
              )}
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
