import React, { useState } from 'react';
import {
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  SelectChangeEvent,
  Typography,
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText
} from '@mui/material';
import { Send, SportsBasketball } from '@mui/icons-material';
import { 
  RosterRequest, 
  WNBA_TEAMS, 
  TEAM_STRATEGIES, 
  TEAM_PRIORITIES, 
  CAP_TARGETS, 
  SEASON_OPTIONS 
} from '../types/roster';

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
  });

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
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
        <SportsBasketball sx={{ color: 'primary.main' }} />
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
          Team Building Parameters
        </Typography>
      </Box>

      {/* Team Selection */}
      <FormControl fullWidth margin="normal" disabled={loading} required>
        <InputLabel id="team-label">WNBA Team</InputLabel>
        <Select
          labelId="team-label"
          name="team"
          value={formData.team}
          label="WNBA Team"
          onChange={handleSelectChange}
          sx={{
            '& .MuiOutlinedInput-notchedOutline': {
              '&:hover': {
                borderColor: 'primary.main',
              },
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main',
            },
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
      <FormControl fullWidth margin="normal" disabled={loading} required>
        <InputLabel id="season-label">Season</InputLabel>
        <Select
          labelId="season-label"
          name="season"
          value={formData.season}
          label="Season"
          onChange={handleSelectChange}
          sx={{
            '& .MuiOutlinedInput-notchedOutline': {
              '&:hover': {
                borderColor: 'primary.main',
              },
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main',
            },
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
      <FormControl fullWidth margin="normal" disabled={loading} required>
        <InputLabel id="strategy-label">Team Building Strategy</InputLabel>
        <Select
          labelId="strategy-label"
          name="strategy"
          value={formData.strategy}
          label="Team Building Strategy"
          onChange={handleSelectChange}
          sx={{
            '& .MuiOutlinedInput-notchedOutline': {
              '&:hover': {
                borderColor: 'primary.main',
              },
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main',
            },
          }}
        >
          <MenuItem value="">
            <em>Select strategy</em>
          </MenuItem>
          {TEAM_STRATEGIES.map((strategy) => (
            <MenuItem key={strategy.value} value={strategy.value}>
              {strategy.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Team Priorities - Multi-select */}
      <FormControl fullWidth margin="normal" disabled={loading}>
        <InputLabel id="priorities-label">Team Priorities (Optional)</InputLabel>
        <Select
          labelId="priorities-label"
          multiple
          value={formData.priorities || []}
          onChange={handlePrioritiesChange}
          input={<OutlinedInput label="Team Priorities (Optional)" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => {
                const priority = TEAM_PRIORITIES.find(p => p.value === value);
                return (
                  <Chip 
                    key={value} 
                    label={priority?.label || value} 
                    size="small"
                    sx={{ 
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      '& .MuiChip-deleteIcon': {
                        color: 'primary.contrastText',
                      }
                    }}
                  />
                );
              })}
            </Box>
          )}
          sx={{
            '& .MuiOutlinedInput-notchedOutline': {
              '&:hover': {
                borderColor: 'primary.main',
              },
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main',
            },
          }}
        >
          {TEAM_PRIORITIES.map((priority) => (
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
      <FormControl fullWidth margin="normal" disabled={loading}>
        <InputLabel id="cap-target-label">Salary Cap Approach (Optional)</InputLabel>
        <Select
          labelId="cap-target-label"
          name="cap_target"
          value={formData.cap_target || ''}
          label="Salary Cap Approach (Optional)"
          onChange={handleSelectChange}
          sx={{
            '& .MuiOutlinedInput-notchedOutline': {
              '&:hover': {
                borderColor: 'primary.main',
              },
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main',
            },
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
        startIcon={loading ? <CircularProgress size={20} /> : <Send />}
        sx={{ 
          mt: 4, 
          mb: 2, 
          py: 1.5,
          background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
          boxShadow: '0 3px 5px 2px rgba(25, 118, 210, .3)',
          '&:hover': {
            background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
            boxShadow: '0 6px 10px 4px rgba(25, 118, 210, .4)',
          },
          '&:disabled': {
            background: 'rgba(255, 255, 255, 0.12)',
            boxShadow: 'none',
          }
        }}
      >
        {loading ? 'Building Your Roster...' : 'Build Roster'}
      </Button>
    </Box>
  );
};

export default RosterBuilderForm; 