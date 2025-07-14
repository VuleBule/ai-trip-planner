import React, { useState, lazy, Suspense } from 'react';
import {
  ThemeProvider,
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
import { SportsBasketball, Groups, AutoAwesome, Whatshot, EmojiEvents } from '@mui/icons-material';
import { RosterRequest, RosterResponse } from './types/roster';
import { theme } from './styles/theme';
import { gradientShift, float, pulse, shimmer } from './styles/animations';
import { performanceMark } from './utils/performance';

// Lazy load heavy components for better performance
const RosterBuilderForm = lazy(() => import('./components/RosterBuilderForm'));
const TripResults = lazy(() => import('./components/TripResults'));

// Loading component for lazy-loaded components
const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
    <CircularProgress sx={{ color: 'primary.main' }} />
  </Box>
);

function App() {
  const [rosterResponse, setRosterResponse] = useState<RosterResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBuildRoster = async (rosterRequest: RosterRequest) => {
    performanceMark.start('build-roster');
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
      performanceMark.end('build-roster');
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
          background: {
            default: 'linear-gradient(135deg, #0F0620 0%, #1A0B3D 25%, #2D1B69 50%, #FF1B8D 100%)',
          },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: {
              default: `
                radial-gradient(circle at 20% 20%, rgba(255, 107, 53, 0.15) 0%, transparent 40%),
                radial-gradient(circle at 80% 80%, rgba(255, 27, 141, 0.15) 0%, transparent 40%),
                radial-gradient(circle at 50% 50%, rgba(0, 229, 255, 0.1) 0%, transparent 50%)
              `,
            },
            animation: `${gradientShift} 8s ease-in-out infinite`,
            zIndex: 0,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: {
              default: `
                repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 98px,
                  rgba(255, 255, 255, 0.03) 100px
                ),
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 98px,
                  rgba(255, 255, 255, 0.03) 100px
                )
              `,
            },
            zIndex: 0,
          }
        }}
      >
        {/* Floating Basketball Icons */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            right: '10%',
            zIndex: 1,
            animation: `${float} 6s ease-in-out infinite`,
            opacity: 0.6,
          }}
        >
          <SportsBasketball sx={{ fontSize: '4rem', color: '#FF6B35' }} />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            bottom: '20%',
            left: '5%',
            zIndex: 1,
            animation: `${float} 8s ease-in-out infinite`,
            animationDelay: '2s',
            opacity: 0.4,
          }}
        >
          <EmojiEvents sx={{ fontSize: '3rem', color: '#FFD700' }} />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: '60%',
            right: '20%',
            zIndex: 1,
            animation: `${float} 7s ease-in-out infinite`,
            animationDelay: '4s',
            opacity: 0.5,
          }}
        >
          <Whatshot sx={{ fontSize: '2.5rem', color: '#FF1B8D' }} />
        </Box>

        {/* Stunning Header */}
        <AppBar 
          position="static" 
          elevation={0}
          sx={{
            background: 'rgba(15, 6, 32, 0.95)',
            backdropFilter: 'blur(30px)',
            borderBottom: '2px solid rgba(255, 107, 53, 0.3)',
            position: 'relative',
            zIndex: 10,
          }}
        >
          <Toolbar sx={{ py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', animation: `${pulse} 3s ease-in-out infinite` }}>
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
                  textShadow: '0 0 30px rgba(255, 107, 53, 0.8)',
                  letterSpacing: '2px',
                }}
              >
                WNBA TEAM BUILDER
              </Typography>
            </Box>
            <Box sx={{ animation: `${float} 4s ease-in-out infinite` }}>
              <SportsBasketball sx={{ fontSize: '2.5rem', color: '#FF1B8D' }} />
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 5, py: 6 }}>
          {/* Spectacular Hero Section */}
          <Box
            sx={{
              textAlign: 'center',
              mb: 8,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: {
                  default: 'conic-gradient(from 0deg, #FF6B35, #FF1B8D, #00E5FF, #FFD700, #FF6B35)',
                },
                animation: `${gradientShift} 10s linear infinite`,
                opacity: 0.1,
                borderRadius: '50%',
                zIndex: -1,
              }
            }}
          >
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
                textShadow: '0 0 60px rgba(255, 107, 53, 0.8)',
                letterSpacing: '3px',
                animation: `${shimmer} 3s ease-in-out infinite`,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, transparent 40%, rgba(255, 255, 255, 0.1) 50%, transparent 60%)',
                  animation: `${shimmer} 2s ease-in-out infinite`,
                }
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
                textShadow: '0 0 80px rgba(255, 27, 141, 0.9)',
                letterSpacing: '4px',
                animation: `${pulse} 4s ease-in-out infinite`,
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
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
              }}
            >
              🏀 AI-Powered WNBA Roster Building • Salary Cap Analysis • Team Chemistry Optimization
            </Typography>
          </Box>

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
          </Box>

          {/* Spectacular Features Grid */}
          <Box sx={{ mb: 8, position: 'relative' }}>
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
                textShadow: '0 0 30px rgba(255, 107, 53, 0.6)',
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
                perspective: '1000px',
                mb: 8,
              }}
            >
              {/* AI Analysis Card */}
              <Card 
                sx={{ 
                  p: 4, 
                  textAlign: 'center', 
                  height: '300px',
                  background: 'rgba(255, 107, 53, 0.1)',
                  backdropFilter: 'blur(30px)',
                  border: '2px solid rgba(255, 107, 53, 0.3)',
                  borderRadius: '25px',
                  position: 'relative',
                  overflow: 'hidden',
                  transform: 'rotateY(0deg)',
                  transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
                  '&:hover': {
                    transform: 'translateY(-20px) rotateY(5deg) scale(1.05)',
                    boxShadow: '0 30px 60px rgba(255, 107, 53, 0.4)',
                    border: '2px solid rgba(255, 107, 53, 0.6)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(255, 27, 141, 0.1) 100%)',
                    borderRadius: '25px',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                  },
                  '&:hover::before': {
                    opacity: 1,
                  }
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 2 }}>
                  <AutoAwesome 
                    sx={{ 
                      fontSize: '4rem', 
                      color: '#FF6B35', 
                      mb: 2,
                      animation: `${pulse} 2s ease-in-out infinite`,
                      filter: 'drop-shadow(0 0 20px rgba(255, 107, 53, 0.6))',
                    }} 
                  />
                  <Typography 
                    variant="h5" 
                    component="h3" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 700,
                      color: '#FFFFFF',
                      textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                    }}
                  >
                    🤖 AI GENIUS
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: '#E0E0E0',
                      fontSize: '1.1rem',
                      lineHeight: 1.6,
                    }}
                  >
                    Advanced AI algorithms analyze player combinations, predict team chemistry, and optimize lineup configurations for maximum impact
                  </Typography>
                </Box>
              </Card>

              {/* Salary Cap Card */}
              <Card 
                sx={{ 
                  p: 4, 
                  textAlign: 'center', 
                  height: '300px',
                  background: 'rgba(255, 27, 141, 0.1)',
                  backdropFilter: 'blur(30px)',
                  border: '2px solid rgba(255, 27, 141, 0.3)',
                  borderRadius: '25px',
                  position: 'relative',
                  overflow: 'hidden',
                  transform: 'rotateY(0deg)',
                  transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
                  '&:hover': {
                    transform: 'translateY(-20px) rotateY(-5deg) scale(1.05)',
                    boxShadow: '0 30px 60px rgba(255, 27, 141, 0.4)',
                    border: '2px solid rgba(255, 27, 141, 0.6)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(255, 27, 141, 0.1) 0%, rgba(255, 215, 0, 0.1) 100%)',
                    borderRadius: '25px',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                  },
                  '&:hover::before': {
                    opacity: 1,
                  }
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 2 }}>
                  <Typography 
                    variant="h2" 
                    component="div" 
                    sx={{ 
                      color: '#FFD700', 
                      mb: 2,
                      fontWeight: 900,
                      textShadow: '0 0 30px rgba(255, 215, 0, 0.8)',
                      animation: `${shimmer} 3s ease-in-out infinite`,
                    }}
                  >
                    $
                  </Typography>
                  <Typography 
                    variant="h5" 
                    component="h3" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 700,
                      color: '#FFFFFF',
                      textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                    }}
                  >
                    💰 SALARY MASTER
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: '#E0E0E0',
                      fontSize: '1.1rem',
                      lineHeight: 1.6,
                    }}
                  >
                    Stay within WNBA CBA constraints while maximizing team value, competitive balance, and championship potential
                  </Typography>
                </Box>
              </Card>

              {/* Team Chemistry Card */}
              <Card 
                sx={{ 
                  p: 4, 
                  textAlign: 'center', 
                  height: '300px',
                  background: 'rgba(0, 229, 255, 0.1)',
                  backdropFilter: 'blur(30px)',
                  border: '2px solid rgba(0, 229, 255, 0.3)',
                  borderRadius: '25px',
                  position: 'relative',
                  overflow: 'hidden',
                  transform: 'rotateY(0deg)',
                  transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
                  '&:hover': {
                    transform: 'translateY(-20px) rotateY(5deg) scale(1.05)',
                    boxShadow: '0 30px 60px rgba(0, 229, 255, 0.4)',
                    border: '2px solid rgba(0, 229, 255, 0.6)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.1) 0%, rgba(255, 107, 53, 0.1) 100%)',
                    borderRadius: '25px',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                  },
                  '&:hover::before': {
                    opacity: 1,
                  }
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 2 }}>
                  <Groups 
                    sx={{ 
                      fontSize: '4rem', 
                      color: '#00E5FF', 
                      mb: 2,
                      animation: `${float} 3s ease-in-out infinite`,
                      filter: 'drop-shadow(0 0 20px rgba(0, 229, 255, 0.6))',
                    }} 
                  />
                  <Typography 
                    variant="h5" 
                    component="h3" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 700,
                      color: '#FFFFFF',
                      textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                    }}
                  >
                    🔥 TEAM SYNERGY
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: '#E0E0E0',
                      fontSize: '1.1rem',
                      lineHeight: 1.6,
                    }}
                  >
                    Evaluate player compatibility, leadership dynamics, and on-court chemistry for championship-winning combinations
                  </Typography>
                </Box>
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
                <Suspense fallback={<LoadingFallback />}>
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
                  <Suspense fallback={<LoadingFallback />}>
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
