import React, { useState, useEffect } from 'react';
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
  keyframes,
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
import { ModelSelector } from './ModelSelector';

// Stunning animations for the form
const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(255, 107, 53, 0.5); }
  50% { box-shadow: 0 0 30px rgba(255, 27, 141, 0.8); }
`;

const slideIn = keyframes`
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const sparkle = keyframes`
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.1) rotate(180deg); }
`;

interface RosterBuilderFormProps {
  onSubmit: (rosterRequest: RosterRequest) => void;
  loading: boolean;
}

const RosterBuilderForm: React.FC<RosterBuilderFormProps> = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState<RosterRequest>({
    team: '',
    season: '',
    strategy: '',
    priorities: [],
    cap_target: '',
    model_type: 'openai', // Default to OpenAI
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
        animation: `${slideIn} 0.8s ease-out`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.05) 0%, rgba(255, 27, 141, 0.05) 50%, rgba(0, 229, 255, 0.05) 100%)',
          borderRadius: '25px',
          zIndex: 0,
        }
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
            textShadow: '0 0 30px rgba(255, 107, 53, 0.6)',
          }}
        >
          <SportsBasketball 
            sx={{ 
              color: '#FF6B35', 
              fontSize: '2.5rem',
              animation: `${sparkle} 3s ease-in-out infinite`,
              filter: 'drop-shadow(0 0 15px rgba(255, 107, 53, 0.8))',
            }} 
          />
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
                  borderWidth: '2px',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FF1B8D',
                  boxShadow: '0 0 20px rgba(255, 27, 141, 0.3)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FF6B35',
                  boxShadow: '0 0 25px rgba(255, 107, 53, 0.5)',
                },
                '& .MuiSelect-select': {
                  color: '#FFFFFF',
                  fontWeight: 500,
                },
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <MenuItem value="">
                <em>Select a team</em>
              </MenuItem>
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
                color: focusedField === 'season' ? '#FF1B8D' : '#E0E0E0',
                fontWeight: 600,
                '&.Mui-focused': { color: '#FF1B8D' }
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
                  borderColor: focusedField === 'season' ? '#FF1B8D' : 'rgba(255, 255, 255, 0.2)',
                  borderWidth: '2px',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#00E5FF',
                  boxShadow: '0 0 20px rgba(0, 229, 255, 0.3)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FF1B8D',
                  boxShadow: '0 0 25px rgba(255, 27, 141, 0.5)',
                },
                '& .MuiSelect-select': {
                  color: '#FFFFFF',
                  fontWeight: 500,
                },
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <MenuItem value="">
                <em>Select season</em>
              </MenuItem>
              {SEASON_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
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
              color: focusedField === 'strategy' ? '#00E5FF' : '#E0E0E0',
              fontWeight: 600,
              '&.Mui-focused': { color: '#00E5FF' }
            }}
          >
            ⚡ Team Building Strategy
          </InputLabel>
          <Select
            name="strategy"
            value={formData.strategy}
            onChange={handleSelectChange}
            label="⚡ Team Building Strategy"
            sx={{
              borderRadius: '15px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: focusedField === 'strategy' ? '#00E5FF' : 'rgba(255, 255, 255, 0.2)',
                borderWidth: '2px',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#FF6B35',
                boxShadow: '0 0 20px rgba(255, 107, 53, 0.3)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#00E5FF',
                boxShadow: '0 0 25px rgba(0, 229, 255, 0.5)',
              },
              '& .MuiSelect-select': {
                color: '#FFFFFF',
                fontWeight: 500,
              },
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <MenuItem value="">
              <em>Select strategy</em>
            </MenuItem>
            {ROSTER_STRATEGIES.map((strategy) => (
              <MenuItem key={strategy.value} value={strategy.value}>
                {strategy.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Team Priorities - Multi-select */}
        <FormControl 
          fullWidth
          margin="normal"
          disabled={loading}
          onFocus={() => setFocusedField('priorities')}
          onBlur={() => setFocusedField(null)}
        >
          <InputLabel 
            sx={{ 
              color: focusedField === 'priorities' ? '#FF1B8D' : '#E0E0E0',
              fontWeight: 600,
              '&.Mui-focused': { color: '#FF1B8D' }
            }}
          >
            🎯 Team Priorities (Optional)
          </InputLabel>
        <Select
          multiple
          value={formData.priorities || []}
          onChange={handlePrioritiesChange}
          input={<OutlinedInput label="🎯 Team Priorities (Optional)" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => {
                const priority = ROSTER_PRIORITIES.find(p => p.value === value);
                return (
                  <Chip 
                    key={value} 
                    label={priority?.label || value} 
                    size="small"
                    sx={{ 
                      backgroundColor: '#FF1B8D',
                      color: '#FFFFFF',
                      '& .MuiChip-deleteIcon': {
                        color: '#FFFFFF',
                      }
                    }}
                  />
                );
              })}
            </Box>
          )}
          sx={{
            borderRadius: '15px',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: focusedField === 'priorities' ? '#FF1B8D' : 'rgba(255, 255, 255, 0.2)',
              borderWidth: '2px',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#00E5FF',
              boxShadow: '0 0 20px rgba(0, 229, 255, 0.3)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#FF1B8D',
              boxShadow: '0 0 25px rgba(255, 27, 141, 0.5)',
            },
            '& .MuiSelect-select': {
              color: '#FFFFFF',
              fontWeight: 500,
            },
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {ROSTER_PRIORITIES.map((priority) => (
            <MenuItem key={priority.value} value={priority.value}>
              <Checkbox 
                checked={(formData.priorities || []).indexOf(priority.value) > -1}
                sx={{
                  color: 'primary.main',
                  '&.Mui-checked': {
                    color: 'primary.main',
                  },
                }}
              />
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
              color: focusedField === 'cap_target' ? '#00E5FF' : '#E0E0E0',
              fontWeight: 600,
              '&.Mui-focused': { color: '#00E5FF' }
            }}
          >
            💰 Salary Cap Approach (Optional)
          </InputLabel>
          <Select
            name="cap_target"
            value={formData.cap_target || ''}
            label="💰 Salary Cap Approach (Optional)"
            onChange={handleSelectChange}
            sx={{
              borderRadius: '15px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: focusedField === 'cap_target' ? '#00E5FF' : 'rgba(255, 255, 255, 0.2)',
                borderWidth: '2px',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#FF1B8D',
                boxShadow: '0 0 20px rgba(255, 27, 141, 0.3)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#00E5FF',
                boxShadow: '0 0 25px rgba(0, 229, 255, 0.5)',
              },
              '& .MuiSelect-select': {
                color: '#FFFFFF',
                fontWeight: 500,
              },
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
            }}
          >
          <MenuItem value="">
            <em>Not specified</em>
          </MenuItem>
          {CAP_TARGETS.map((target) => (
            <MenuItem key={target.value} value={target.value}>
              {target.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={!isFormValid || loading}
          startIcon={loading ? <CircularProgress size={20} sx={{ color: '#FFFFFF' }} /> : <AutoAwesome sx={{ animation: `${sparkle} 2s ease-in-out infinite` }} />}
          sx={{ 
            mt: 4, 
            mb: 2, 
            py: 1.5,
            borderRadius: '15px',
            fontSize: '1.1rem',
            fontWeight: 700,
            textTransform: 'none',
            background: 'linear-gradient(135deg, #FF6B35 0%, #FF1B8D 50%, #00E5FF 100%)',
            boxShadow: '0 8px 25px rgba(255, 107, 53, 0.4)',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            animation: !isFormValid || loading ? 'none' : `${glow} 2s ease-in-out infinite`,
            '&:hover': {
              background: 'linear-gradient(135deg, #FF1B8D 0%, #00E5FF 50%, #FF6B35 100%)',
              boxShadow: '0 12px 35px rgba(255, 27, 141, 0.6)',
              transform: 'translateY(-2px)',
            },
            '&:disabled': {
              background: 'rgba(255, 255, 255, 0.12)',
              boxShadow: 'none',
              color: 'rgba(255, 255, 255, 0.5)',
            }
          }}
        >
          {loading ? '🔄 Building Your Championship Roster...' : '🚀 Build Championship Roster'}
        </Button>
      </Box>
    </Paper>
  );
};

export default RosterBuilderForm; 