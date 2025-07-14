import { useState, Suspense } from 'react';
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
import { SportsBasketball, Groups, AutoAwesome, Whatshot, EmojiEvents } from '@mui/icons-material';
import { RosterBuilderForm, TripResults } from './components/LazyComponents';
import { RosterRequest, RosterResponse } from './types/roster';
import './animations.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FF6B35', // Basketball orange
      light: '#FF9A73',
      dark: '#E5471F',
    },
    secondary: {
      main: '#FF1B8D', // Hot pink
      light: '#FF69B4',
      dark: '#CC0066',
    },
    background: {
      default: '#0A0B1E',
      paper: 'rgba(255, 255, 255, 0.05)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '3rem',
      background: 'linear-gradient(135deg, #FF6B35 0%, #FF1B8D 50%, #8A2BE2 100%)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      color: 'transparent',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 8px 25px rgba(255, 107, 53, 0.3)',
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          },
        },
      },
    },
  },
});

// Loading component for Suspense fallback
const LoadingFallback: React.FC<{ message?: string }> = ({ message = "Loading..." }) => (
  <Box 
    display="flex" 
    flexDirection="column" 
    alignItems="center" 
    justifyContent="center" 
    minHeight="200px"
    gap={2}
  >
    <CircularProgress size={48} thickness={2} />
    <Typography variant="body2" color="text.secondary">
      {message}
    </Typography>
  </Box>
);

// Header component
const AppHeader: React.FC = () => (
  <AppBar 
    position="static" 
    sx={{ 
      background: 'rgba(10, 11, 30, 0.8)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    }}
  >
    <Toolbar sx={{ justifyContent: 'center' }}>
      <Box display="flex" alignItems="center" gap={2} className="float">
        <SportsBasketball sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
          WNBA Team Builder
        </Typography>
        <EmojiEvents sx={{ fontSize: 40, color: 'secondary.main', animation: 'sparkle 1.5s ease-in-out infinite' }} />
      </Box>
    </Toolbar>
  </AppBar>
);

// Feature cards component
const FeatureCards: React.FC = () => (
  <Box display="flex" gap={3} mb={4} flexWrap="wrap" justifyContent="center">
    {[
      { icon: <Groups />, title: "Team Chemistry", description: "AI-powered roster analysis" },
      { icon: <AutoAwesome />, title: "Smart Strategy", description: "Optimized game plans" },
      { icon: <Whatshot />, title: "Performance", description: "Data-driven insights" }
    ].map((feature, index) => (
      <Card 
        key={index}
        sx={{ 
          minWidth: 200, 
          maxWidth: 300,
          animation: `slideIn 0.5s ease-out ${index * 0.1}s both`
        }}
      >
        <CardContent sx={{ textAlign: 'center', p: 3 }}>
          <Box sx={{ color: 'primary.main', mb: 2, fontSize: 48 }}>
            {feature.icon}
          </Box>
          <Typography variant="h6" gutterBottom>
            {feature.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {feature.description}
          </Typography>
        </CardContent>
      </Card>
    ))}
  </Box>
);

function App() {
  const [rosterResult, setRosterResult] = useState<RosterResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleBuildRoster = async (rosterRequest: RosterRequest) => {
    setLoading(true);
    setRosterResult(null);
    
    try {
      const response = await fetch('http://localhost:8000/build-roster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rosterRequest),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: RosterResponse = await response.json();
      setRosterResult(result);
    } catch (error) {
      console.error('Error building roster:', error);
      setRosterResult({
        result: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        agent_type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewRoster = () => {
    setRosterResult(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0A0B1E 0%, #1A1B3A 50%, #2A2B5A 100%)',
          backgroundSize: '400% 400%',
        }}
        className="gradient-shift"
      >
        <AppHeader />
        
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {!rosterResult ? (
            <>
              <Box textAlign="center" mb={6}>
                <Typography 
                  variant="h1" 
                  gutterBottom 
                  sx={{ 
                    mb: 2,
                    animation: 'pulse 2s ease-in-out infinite'
                  }}
                >
                  Build Your Dream Team
                </Typography>
                <Typography variant="h5" color="text.secondary" paragraph>
                  Create the perfect WNBA roster with AI-powered analysis and strategic planning
                </Typography>
                <Box display="flex" gap={1} justifyContent="center" flexWrap="wrap" mt={3}>
                  {['AI-Powered', 'Strategic', 'Championship Ready'].map((tag) => (
                    <Chip 
                      key={tag}
                      label={tag} 
                      sx={{ 
                        background: 'linear-gradient(45deg, #FF6B35 30%, #FF1B8D 90%)',
                        color: 'white',
                        fontWeight: 'bold',
                        '&:hover': { transform: 'scale(1.05)' },
                        transition: 'transform 0.2s ease'
                      }} 
                    />
                  ))}
                </Box>
              </Box>

              <FeatureCards />

              <Paper 
                sx={{ 
                  p: 4, 
                  mb: 4,
                  background: 'rgba(255, 255, 255, 0.05)',
                  animation: 'slideIn 0.6s ease-out'
                }}
                className="glow"
              >
                <Suspense fallback={<LoadingFallback message="Loading roster builder..." />}>
                  <RosterBuilderForm onSubmit={handleBuildRoster} loading={loading} />
                </Suspense>
              </Paper>
            </>
          ) : (
                         <Paper sx={{ p: 4, animation: 'slideIn 0.6s ease-out' }}>
               <Suspense fallback={<LoadingFallback message="Loading results..." />}>
                 <TripResults 
                   response={{ result: rosterResult.result }}
                   onNewTrip={handleNewRoster}
                 />
               </Suspense>
             </Paper>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
