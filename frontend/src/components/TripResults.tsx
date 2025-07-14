
import {
  Box,
  Typography,
  Button,
  Chip,
  Divider,
  Paper,
  Card,
  CardContent
} from '@mui/material';
import { Refresh, Psychology, AutoAwesome } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { TripResponse } from '../types/trip';

interface TripResultsProps {
  response: TripResponse;
  onNewTrip: () => void;
}

const TripResults: React.FC<TripResultsProps> = ({ response, onNewTrip }) => {
  const getAgentIcon = (agentType?: string) => {
    if (!agentType) return '🗺️';
    if (agentType.toLowerCase().includes('research')) return '🔍';
    if (agentType.toLowerCase().includes('itinerary')) return '📅';
    if (agentType.toLowerCase().includes('budget')) return '💰';
    if (agentType.toLowerCase().includes('local')) return '🍽️';
    return '🤖';
  };

  const getRouteColor = (route?: string) => {
    if (!route) return 'primary';
    switch (route.toLowerCase()) {
      case 'research': return 'info';
      case 'itinerary': return 'success';
      case 'budget': return 'warning';
      case 'local': return 'secondary';
      default: return 'primary';
    }
  };

  // Provide default values for missing properties
  const agentType = response.agent_type || 'Trip Planner';
  const routeTaken = response.route_taken || 'complete';

  return (
    <Box>
      {/* Agent Info Header */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)', border: '1px solid #333' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              color: 'white',
              fontSize: '1.5rem'
            }}>
              {getAgentIcon(agentType)}
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
                {agentType}
              </Typography>
              <Chip
                label={`Route: ${routeTaken}`}
                color={getRouteColor(routeTaken) as any}
                size="small"
                icon={<Psychology />}
                sx={{ 
                  background: 'rgba(144, 202, 249, 0.1)',
                  border: '1px solid rgba(144, 202, 249, 0.3)',
                  color: 'primary.main'
                }}
              />
            </Box>
            <AutoAwesome sx={{ color: 'warning.main', fontSize: 30 }} />
          </Box>
        </CardContent>
      </Card>

      <Divider sx={{ mb: 3, borderColor: '#333' }} />

      {/* Results Content */}
      <Paper
        sx={{
          p: 3,
          bgcolor: '#1a1a1a',
          maxHeight: '600px',
          overflow: 'auto',
          border: '1px solid #333',
          borderRadius: 2,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#2a2a2a',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#555',
            borderRadius: '4px',
            '&:hover': {
              background: '#777',
            },
          },
          '& h1, & h2, & h3': {
            color: 'primary.main',
            marginTop: 2,
            marginBottom: 1,
            fontWeight: 600,
          },
          '& h1': { fontSize: '1.5rem' },
          '& h2': { fontSize: '1.3rem' },
          '& h3': { fontSize: '1.1rem' },
          '& p': {
            marginBottom: 1.5,
            lineHeight: 1.7,
            color: 'text.primary',
          },
          '& ul, & ol': {
            paddingLeft: 3,
            marginBottom: 2,
          },
          '& li': {
            marginBottom: 0.5,
            color: 'text.primary',
          },
          '& strong': {
            fontWeight: 600,
            color: 'primary.main',
          },
          '& em': {
            fontStyle: 'italic',
            color: 'text.secondary',
          },
          '& code': {
            backgroundColor: '#2a2a2a',
            color: 'primary.main',
            padding: '2px 4px',
            borderRadius: '4px',
            fontSize: '0.9em',
          },
          '& pre': {
            backgroundColor: '#2a2a2a',
            padding: '12px',
            borderRadius: '8px',
            overflow: 'auto',
            border: '1px solid #333',
          },
          '& blockquote': {
            borderLeft: '4px solid #1976d2',
            paddingLeft: '16px',
            margin: '16px 0',
            fontStyle: 'italic',
            color: 'text.secondary',
          },
        }}
      >
        <ReactMarkdown>
          {response.result}
        </ReactMarkdown>
      </Paper>

      {/* Action Button */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant="outlined"
          onClick={onNewTrip}
          startIcon={<Refresh />}
          sx={{ 
            px: 4,
            py: 1.5,
            borderColor: 'primary.main',
            color: 'primary.main',
            '&:hover': {
              borderColor: 'primary.dark',
              backgroundColor: 'rgba(144, 202, 249, 0.08)',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 8px rgba(144, 202, 249, 0.2)',
            },
            transition: 'all 0.3s ease-in-out',
          }}
        >
          Plan Another Trip
        </Button>
      </Box>
    </Box>
  );
};

export default TripResults;
