import React from 'react';
import { 
  FormControl, 
  FormLabel, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  Chip,
  Box,
  Typography,
  Alert
} from '@mui/material';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  modelStatus: { openai: boolean; ollama: boolean };
  isLoading?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  modelStatus,
  isLoading = false
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <FormControl component="fieldset" disabled={isLoading}>
        <FormLabel component="legend">
          <Typography variant="h6" component="span">
            AI Model Selection
          </Typography>
        </FormLabel>
        <RadioGroup
          row
          value={selectedModel}
          onChange={(e) => onModelChange(e.target.value)}
        >
          <FormControlLabel
            value="openai"
            control={<Radio />}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body1">OpenAI GPT-4o-mini</Typography>
                <Chip 
                  label={modelStatus.openai ? "Online" : "Offline"} 
                  color={modelStatus.openai ? "success" : "error"}
                  size="small"
                  variant="outlined"
                />
              </Box>
            }
          />
          <FormControlLabel
            value="ollama"
            control={<Radio />}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body1">Local Llama3 (8B)</Typography>
                <Chip 
                  label={modelStatus.ollama ? "Online" : "Offline"} 
                  color={modelStatus.ollama ? "success" : "error"}
                  size="small"
                  variant="outlined"
                />
              </Box>
            }
          />
        </RadioGroup>
      </FormControl>
      
      {!modelStatus.openai && !modelStatus.ollama && (
        <Alert severity="warning" sx={{ mt: 1 }}>
          No AI models are currently available. Please check your configuration.
        </Alert>
      )}
      
      {selectedModel === "ollama" && !modelStatus.ollama && (
        <Alert severity="error" sx={{ mt: 1 }}>
          Ollama is not running. Please start Ollama to use the local model.
        </Alert>
      )}
      
      {selectedModel === "openai" && !modelStatus.openai && (
        <Alert severity="error" sx={{ mt: 1 }}>
          OpenAI API key not configured. Please check your environment variables.
        </Alert>
      )}
    </Box>
  );
}; 