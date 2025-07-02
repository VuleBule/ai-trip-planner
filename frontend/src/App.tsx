import React, { useState } from 'react';
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
  Chip
} from '@mui/material';
import { SportsBasketball, Groups } from '@mui/icons-material';
import RosterBuilderForm from './components/RosterBuilderForm';
import TripResults from './components/TripResults';
import { RosterRequest, RosterResponse } from './types/roster';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
      light: '#e3f2fd',
      dark: '#42a5f5',
    },
    secondary: {
      main: '#f48fb1',
      light: '#f8bbd9',
      dark: '#ec407a',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
    divider: '#333333',
  },
  typography: {
    h3: {
      fontWeight: 600,
      color: '#ffffff',
    },
    h5: {
      fontWeight: 500,
      color: '#ffffff',
    },
    h6: {
      color: '#ffffff',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          border: '1px solid #333333',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          border: '1px solid #333333',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          borderBottom: '1px solid #333333',
        },
      },
    },
  },
});

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
      <Box sx={{ flexGrow: 1, minHeight: '100vh' }}>
        <AppBar position="static" elevation={0}>
          <Toolbar>
            <Groups sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              WNBA Team Builder
            </Typography>
            <SportsBasketball />
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {/* Hero Section */}
          <Paper
            sx={{
              p: 4,
              mb: 4,
              background: 'linear-gradient(135deg, #1a237e 0%, #311b92 50%, #4a148c 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 30% 20%, rgba(144, 202, 249, 0.1) 0%, transparent 50%)',
                pointerEvents: 'none',
              }
            }}
          >
            <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ position: 'relative', zIndex: 1 }}>
              Build Your Perfect WNBA Roster
            </Typography>
            <Typography variant="h6" align="center" sx={{ opacity: 0.9, position: 'relative', zIndex: 1 }}>
              Let our AI agents help you construct optimal rosters within CBA constraints,
              analyze player fits, manage salary caps, and plan team strategies
            </Typography>
          </Paper>

          {/* Features Cards */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
            <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
              <Card 
                sx={{ 
                  height: '100%', 
                  textAlign: 'center', 
                  p: 2,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(144, 202, 249, 0.15)',
                    borderColor: 'primary.main',
                  }
                }}
              >
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
              <Card 
                sx={{ 
                  height: '100%', 
                  textAlign: 'center', 
                  p: 2,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(76, 175, 80, 0.15)',
                    borderColor: 'success.main',
                  }
                }}
              >
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
            <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
              <Card 
                sx={{ 
                  height: '100%', 
                  textAlign: 'center', 
                  p: 2,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(255, 193, 7, 0.15)',
                    borderColor: 'warning.main',
                  }
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: 'warning.main' }}>
                    💰 Salary Cap
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Smart cap management and CBA compliance validation
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
              <Card 
                sx={{ 
                  height: '100%', 
                  textAlign: 'center', 
                  p: 2,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(244, 143, 177, 0.15)',
                    borderColor: 'secondary.main',
                  }
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: 'secondary.main' }}>
                    🎯 Team Chemistry
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Evaluate player compatibility and team dynamics
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Main Content */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            <Box sx={{ flex: '0 0 auto', width: { xs: '100%', md: '400px' } }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Build Your Roster
                </Typography>
                <RosterBuilderForm onSubmit={handleBuildRoster} loading={loading} />
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
                  <TripResults response={rosterResponse} onNewTrip={handleNewRoster} />
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
