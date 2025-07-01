import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  SelectChangeEvent,
  Typography
} from '@mui/material';
import { Send, FlightTakeoff } from '@mui/icons-material';
import { TripRequest } from '../types/trip';

interface TripPlannerFormProps {
  onSubmit: (tripRequest: TripRequest) => void;
  loading: boolean;
}

const TripPlannerForm: React.FC<TripPlannerFormProps> = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState<TripRequest>({
    destination: '',
    duration: '',
    budget: '',
    interests: '',
    travel_style: '',
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (formData.destination && formData.duration) {
      onSubmit(formData);
    }
  };

  const isFormValid = formData.destination.trim() !== '' && formData.duration.trim() !== '';

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
        <FlightTakeoff sx={{ color: 'primary.main' }} />
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
          Trip Details
        </Typography>
      </Box>

      <TextField
        fullWidth
        required
        name="destination"
        label="Destination"
        value={formData.destination}
        onChange={handleInputChange}
        placeholder="e.g., Tokyo, Japan"
        margin="normal"
        disabled={loading}
        sx={{
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: 'primary.main',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'primary.main',
            },
          },
        }}
      />

      <TextField
        fullWidth
        required
        name="duration"
        label="Duration"
        value={formData.duration}
        onChange={handleInputChange}
        placeholder="e.g., 7 days, 2 weeks"
        margin="normal"
        disabled={loading}
        sx={{
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: 'primary.main',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'primary.main',
            },
          },
        }}
      />

      <TextField
        fullWidth
        name="budget"
        label="Budget (Optional)"
        value={formData.budget}
        onChange={handleInputChange}
        placeholder="e.g., $2000, ¥300000"
        margin="normal"
        disabled={loading}
        sx={{
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: 'primary.main',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'primary.main',
            },
          },
        }}
      />

      <TextField
        fullWidth
        name="interests"
        label="Interests (Optional)"
        value={formData.interests}
        onChange={handleInputChange}
        placeholder="e.g., food, culture, adventure, budget travel"
        margin="normal"
        multiline
        rows={2}
        disabled={loading}
        sx={{
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: 'primary.main',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'primary.main',
            },
          },
        }}
      />

      <FormControl fullWidth margin="normal" disabled={loading}>
        <InputLabel id="travel-style-label">Travel Style (Optional)</InputLabel>
        <Select
          labelId="travel-style-label"
          name="travel_style"
          value={formData.travel_style}
          label="Travel Style (Optional)"
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
          <MenuItem value="budget">Budget</MenuItem>
          <MenuItem value="mid-range">Mid-range</MenuItem>
          <MenuItem value="luxury">Luxury</MenuItem>
          <MenuItem value="backpacking">Backpacking</MenuItem>
          <MenuItem value="family">Family-friendly</MenuItem>
          <MenuItem value="romantic">Romantic</MenuItem>
          <MenuItem value="adventure">Adventure</MenuItem>
          <MenuItem value="cultural">Cultural</MenuItem>
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
        {loading ? 'Planning Your Trip...' : 'Plan My Trip'}
      </Button>
    </Box>
  );
};

export default TripPlannerForm;
