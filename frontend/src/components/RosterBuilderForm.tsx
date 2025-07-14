import React, { useState, useEffect, memo } from 'react';
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
import { SportsBasketball } from '@mui/icons-material';
import { 
  RosterRequest, 
  WNBA_TEAMS, 
  ROSTER_STRATEGIES, 
  ROSTER_PRIORITIES, 
  SEASON_OPTIONS,
  CAP_TARGETS
} from '../types/roster';
import { ModelSelector } from './ModelSelector';

interface RosterBuilderFormProps {
  onSubmit: (rosterRequest: RosterRequest) => void;
  loading: boolean;
}

const RosterBuilderForm: React.FC<RosterBuilderFormProps> = memo(({ onSubmit, loading }) => {
  const [formData, setFormData] = useState<RosterRequest>({
    team: '',
    season: '',
    strategy: '',
    priorities: [],
    cap_target: '',
    model_type: 'openai',
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [modelStatus, setModelStatus] = useState({ openai: false, ollama: false });

  // Check model health on component mount
  useEffect(() => {
    checkModelHealth();
  }, []);

  const checkModelHealth = async () => {
    try {
      const response = await fetch('http://localhost:8000/models/health');
      const health = await response.json();
      setModelStatus(health);
    } catch (error) {
      console.error('Failed to check model health:', error);
      setModelStatus({ openai: false, ollama: false });
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
    const { value } = event.target;
    setFormData(prev => ({
      ...prev,
      priorities: typeof value === 'string' ? value.split(',') : value,
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

  const isFormValid = formData.team.trim() !== '' && 
                     formData.season.trim() !== '' && 
                     formData.strategy.trim() !== '';

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 4,
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(30px)',
        border: '2px solid rgba(255, 107, 53, 0.3)',
        borderRadius: '25px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', position: 'relative', zIndex: 1 }}>
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            mb: 4,
            fontWeight: 800,
            background: 'linear-gradient(135deg, #FF6B35 0%, #FF1B8D 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          <SportsBasketball sx={{ color: '#FF6B35', fontSize: '2.5rem' }} />
          🏆 TEAM CONFIGURATION
        </Typography>

        {/* AI Model Selection */}
        <ModelSelector
          selectedModel={formData.model_type || 'openai'}
          onModelChange={handleModelChange}
          modelStatus={modelStatus}
          isLoading={loading}
        />

        {/* Team Selection */}
        <FormControl 
          fullWidth
          margin="normal"
          disabled={loading}
          required
          onFocus={() => setFocusedField('team')}
          onBlur={() => setFocusedField(null)}
        >
            <InputLabel 
              sx={{ 
                color: focusedField === 'team' ? '#FF6B35' : '#E0E0E0',
                fontWeight: 600,
                '&.Mui-focused': { color: '#FF6B35' }
              }}
            >
              🏀 Select Team
            </InputLabel>
            <Select
              name="team"
              value={formData.team}
              onChange={handleSelectChange}
              label="🏀 Select Team"
              sx={{
                borderRadius: '15px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: focusedField === 'team' ? '#FF6B35' : 'rgba(255, 255, 255, 0.2)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FF6B35',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FF6B35',
                  borderWidth: '2px',
                },
              }}
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
          margin="normal"
          disabled={loading}
          required
          onFocus={() => setFocusedField('season')}
          onBlur={() => setFocusedField(null)}
        >
            <InputLabel 
              sx={{ 
                color: focusedField === 'season' ? '#FF6B35' : '#E0E0E0',
                fontWeight: 600,
                '&.Mui-focused': { color: '#FF6B35' }
              }}
            >
              📅 Select Season
            </InputLabel>
            <Select
              name="season"
              value={formData.season}
              onChange={handleSelectChange}
              label="📅 Select Season"
              sx={{
                borderRadius: '15px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: focusedField === 'season' ? '#FF6B35' : 'rgba(255, 255, 255, 0.2)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FF6B35',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FF6B35',
                  borderWidth: '2px',
                },
              }}
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
          margin="normal"
          disabled={loading}
          required
          onFocus={() => setFocusedField('strategy')}
          onBlur={() => setFocusedField(null)}
        >
            <InputLabel 
              sx={{ 
                color: focusedField === 'strategy' ? '#FF6B35' : '#E0E0E0',
                fontWeight: 600,
                '&.Mui-focused': { color: '#FF6B35' }
              }}
            >
              🎯 Team Strategy
            </InputLabel>
            <Select
              name="strategy"
              value={formData.strategy}
              onChange={handleSelectChange}
              label="🎯 Team Strategy"
              sx={{
                borderRadius: '15px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: focusedField === 'strategy' ? '#FF6B35' : 'rgba(255, 255, 255, 0.2)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FF6B35',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FF6B35',
                  borderWidth: '2px',
                },
              }}
            >
                             {ROSTER_STRATEGIES.map((strategy) => (
                 <MenuItem key={strategy.value} value={strategy.value}>
                   {strategy.label}
                 </MenuItem>
               ))}
            </Select>
        </FormControl>

        {/* Team Priorities */}
        <FormControl 
          fullWidth
          margin="normal"
          disabled={loading}
          onFocus={() => setFocusedField('priorities')}
          onBlur={() => setFocusedField(null)}
        >
            <InputLabel 
              sx={{ 
                color: focusedField === 'priorities' ? '#FF6B35' : '#E0E0E0',
                fontWeight: 600,
                '&.Mui-focused': { color: '#FF6B35' }
              }}
            >
              🎯 Team Priorities (Optional)
            </InputLabel>
            <Select
              multiple
              name="priorities"
              value={formData.priorities}
              onChange={handlePrioritiesChange}
              input={<OutlinedInput label="🎯 Team Priorities (Optional)" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
              sx={{
                borderRadius: '15px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: focusedField === 'priorities' ? '#FF6B35' : 'rgba(255, 255, 255, 0.2)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FF6B35',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FF6B35',
                  borderWidth: '2px',
                },
              }}
            >
                             {ROSTER_PRIORITIES.map((priority) => (
                 <MenuItem key={priority.value} value={priority.value}>
                   <Checkbox checked={(formData.priorities || []).indexOf(priority.value) > -1} />
                   <ListItemText primary={priority.label} />
                 </MenuItem>
               ))}
            </Select>
        </FormControl>

        {/* Salary Cap Target */}
        <FormControl 
          fullWidth
          margin="normal"
          disabled={loading}
          onFocus={() => setFocusedField('cap_target')}
          onBlur={() => setFocusedField(null)}
        >
            <InputLabel 
              sx={{ 
                color: focusedField === 'cap_target' ? '#FF6B35' : '#E0E0E0',
                fontWeight: 600,
                '&.Mui-focused': { color: '#FF6B35' }
              }}
            >
              💰 Salary Cap Approach (Optional)
            </InputLabel>
            <Select
              name="cap_target"
              value={formData.cap_target}
              onChange={handleSelectChange}
              label="💰 Salary Cap Approach (Optional)"
              sx={{
                borderRadius: '15px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: focusedField === 'cap_target' ? '#FF6B35' : 'rgba(255, 255, 255, 0.2)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FF6B35',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FF6B35',
                  borderWidth: '2px',
                },
              }}
            >
                             {CAP_TARGETS.map((target) => (
                 <MenuItem key={target.value} value={target.value}>
                   {target.label}
                 </MenuItem>
               ))}
            </Select>
        </FormControl>

        {/* Submit Button */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            type="submit"
            variant="contained"
            disabled={!isFormValid || loading}
            sx={{
              px: 6,
              py: 2,
              fontSize: '1.2rem',
              fontWeight: 700,
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #FF6B35 0%, #FF1B8D 100%)',
              boxShadow: '0 10px 30px rgba(255, 107, 53, 0.4)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 15px 40px rgba(255, 107, 53, 0.6)',
              },
              '&:disabled': {
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.3)',
                transform: 'none',
                boxShadow: 'none',
              }
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={20} color="inherit" />
                Building Roster...
              </Box>
            ) : (
              '🏀 Build My Dream Team'
            )}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
});

RosterBuilderForm.displayName = 'RosterBuilderForm';

export default RosterBuilderForm; 