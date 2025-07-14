import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  Checkbox,
  ListItemText,
  Paper,
  CircularProgress
} from '@mui/material';
import { SportsBasketball, AutoAwesome } from '@mui/icons-material';
import { 
  RosterRequest, 
  WNBA_TEAMS, 
  ROSTER_STRATEGIES, 
  ROSTER_PRIORITIES, 
  SEASON_OPTIONS,
  CAP_TARGETS
} from '../types/roster';
import ModelSelector from './ModelSelector';

interface RosterBuilderFormProps {
  onSubmit: (rosterRequest: RosterRequest) => void;
  loading: boolean;
}

interface ModelHealth {
  openai: boolean;
  ollama: boolean;
}

const RosterBuilderForm: React.FC<RosterBuilderFormProps> = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState<RosterRequest>({
    team: '',
    season: '',
    strategy: '',
    priorities: [],
    cap_target: '',
    model_type: 'openai'
  });
  
  const [modelHealth, setModelHealth] = useState<ModelHealth>({ 
    openai: false, 
    ollama: false 
  });

  useEffect(() => {
    checkModelHealth();
  }, []);

  const checkModelHealth = async () => {
    try {
      const response = await fetch('http://localhost:8000/models/health');
      if (response.ok) {
        const health = await response.json();
        setModelHealth(health);
      }
    } catch (error) {
      console.error('Failed to check model health:', error);
    }
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePrioritiesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      priorities: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const handleModelChange = (model: string) => {
    setFormData(prev => ({
      ...prev,
      model_type: model
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (formData.team && formData.season && formData.strategy) {
      onSubmit(formData);
    }
  };

  const isFormValid = formData.team && formData.season && formData.strategy;

  return (
    <Box className="slide-in">
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          mb: 4,
          fontWeight: 700
        }}
      >
        <SportsBasketball sx={{ fontSize: 40, color: 'primary.main' }} className="sparkle" />
        Build Your Roster
        <AutoAwesome sx={{ fontSize: 32, color: 'secondary.main' }} className="glow" />
      </Typography>

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Team Selection */}
          <FormControl 
            fullWidth 
            required
            sx={{ animation: 'slideIn 0.5s ease-out 0.1s both' }}
          >
            <InputLabel>WNBA Team</InputLabel>
            <Select
              name="team"
              value={formData.team}
              onChange={handleSelectChange}
              label="WNBA Team"
            >
              {WNBA_TEAMS.map((team) => (
                <MenuItem key={team} value={team}>
                  {team}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

                     {/* Season Selection */}
           <FormControl 
             fullWidth 
             required
             sx={{ animation: 'slideIn 0.5s ease-out 0.2s both' }}
           >
             <InputLabel>Season</InputLabel>
             <Select
               name="season"
               value={formData.season}
               onChange={handleSelectChange}
               label="Season"
             >
               {SEASON_OPTIONS.map((season) => (
                 <MenuItem key={season.value} value={season.value}>
                   {season.label}
                 </MenuItem>
               ))}
             </Select>
           </FormControl>

                     {/* Strategy Selection */}
           <FormControl 
             fullWidth 
             required
             sx={{ animation: 'slideIn 0.5s ease-out 0.3s both' }}
           >
             <InputLabel>Team Building Strategy</InputLabel>
             <Select
               name="strategy"
               value={formData.strategy}
               onChange={handleSelectChange}
               label="Team Building Strategy"
             >
               {ROSTER_STRATEGIES.map((strategy) => (
                 <MenuItem key={strategy.value} value={strategy.value}>
                   {strategy.label}
                 </MenuItem>
               ))}
             </Select>
           </FormControl>

          {/* Priorities Selection */}
          <FormControl 
            fullWidth
            sx={{ animation: 'slideIn 0.5s ease-out 0.4s both' }}
          >
            <InputLabel>Team Priorities (Optional)</InputLabel>
            <Select
              multiple
              name="priorities"
              value={formData.priorities}
              onChange={handlePrioritiesChange}
              input={<OutlinedInput label="Team Priorities (Optional)" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip 
                      key={value} 
                      label={value} 
                      size="small"
                      sx={{ 
                        background: 'linear-gradient(45deg, #FF6B35 30%, #FF1B8D 90%)',
                        color: 'white'
                      }}
                    />
                  ))}
                </Box>
              )}
                         >
               {ROSTER_PRIORITIES.map((priority) => (
                 <MenuItem key={priority.value} value={priority.value}>
                   <Checkbox checked={formData.priorities?.includes(priority.value) || false} />
                   <ListItemText primary={priority.label} />
                 </MenuItem>
               ))}
             </Select>
          </FormControl>

          {/* Salary Cap Target */}
          <FormControl 
            fullWidth
            sx={{ animation: 'slideIn 0.5s ease-out 0.5s both' }}
          >
            <InputLabel>Salary Cap Approach (Optional)</InputLabel>
            <Select
              name="cap_target"
              value={formData.cap_target}
              onChange={handleSelectChange}
              label="Salary Cap Approach (Optional)"
                         >
               {CAP_TARGETS.map((target) => (
                 <MenuItem key={target.value} value={target.value}>
                   {target.label}
                 </MenuItem>
               ))}
             </Select>
          </FormControl>

          {/* Model Selection */}
          <Paper 
            sx={{ 
              p: 3, 
              background: 'rgba(255, 255, 255, 0.02)',
              animation: 'slideIn 0.5s ease-out 0.6s both'
            }}
          >
            <ModelSelector
                           selectedModel={formData.model_type || 'openai'}
             onModelChange={handleModelChange}
             modelStatus={modelHealth}
             isLoading={loading}
            />
          </Paper>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={!isFormValid || loading}
            className="glow"
            sx={{
              py: 2,
              fontSize: '1.2rem',
              fontWeight: 700,
              background: isFormValid && !loading 
                ? 'linear-gradient(135deg, #FF6B35 0%, #FF1B8D 100%)'
                : undefined,
              animation: 'slideIn 0.5s ease-out 0.7s both',
              '&:hover': {
                background: isFormValid && !loading 
                  ? 'linear-gradient(135deg, #E5471F 0%, #CC0066 100%)'
                  : undefined,
                transform: 'translateY(-2px)',
              },
              '&:disabled': {
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.3)',
              }
            }}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SportsBasketball />}
          >
            {loading ? 'Building Roster...' : 'Build Dream Team'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default RosterBuilderForm; 