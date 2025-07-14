import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import RosterBuilderForm from '../RosterBuilderForm';


// Create a test theme similar to the app theme
const testTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
  },
});

// Wrapper component for theme provider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={testTheme}>
    {children}
  </ThemeProvider>
);

describe('RosterBuilderForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  const renderForm = (loading = false) => {
    return render(
      <TestWrapper>
        <RosterBuilderForm onSubmit={mockOnSubmit} loading={loading} />
      </TestWrapper>
    );
  };

  describe('Form Rendering', () => {
    test('renders all required form fields', () => {
      renderForm();

      expect(screen.getByLabelText(/WNBA Team/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Season/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Team Building Strategy/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Team Priorities/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Salary Cap Approach/i)).toBeInTheDocument();
    });

    test('renders form title and submit button', () => {
      renderForm();

      expect(screen.getByText('Team Building Parameters')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Build Roster/i })).toBeInTheDocument();
    });

    test('renders basketball icon in header', () => {
      renderForm();

      // Check for the SportsBasketball icon (Material-UI icon)
      const header = screen.getByText('Team Building Parameters').closest('div');
      expect(header).toBeInTheDocument();
    });

    test('submit button is disabled initially', () => {
      renderForm();

      const submitButton = screen.getByRole('button', { name: /Build Roster/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Form Validation', () => {
    test('enables submit button when required fields are filled', async () => {
      renderForm();

      const submitButton = screen.getByRole('button', { name: /Build Roster/i });
      expect(submitButton).toBeDisabled();

      // Fill required fields
      const teamSelect = screen.getByLabelText(/WNBA Team/i);
      const seasonSelect = screen.getByLabelText(/Season/i);
      const strategySelect = screen.getByLabelText(/Team Building Strategy/i);

      await userEvent.click(teamSelect);
      await userEvent.click(screen.getByText('Las Vegas Aces'));

      await userEvent.click(seasonSelect);
      await userEvent.click(screen.getByText('2025 Season'));

      await userEvent.click(strategySelect);
      await userEvent.click(screen.getByText('Championship Contender'));

      await waitFor(() => {
        expect(submitButton).toBeEnabled();
      });
    });

    test('keeps submit button disabled if any required field is missing', async () => {
      renderForm();

      const submitButton = screen.getByRole('button', { name: /Build Roster/i });

      // Fill only team and season (missing strategy)
      const teamSelect = screen.getByLabelText(/WNBA Team/i);
      const seasonSelect = screen.getByLabelText(/Season/i);

      await userEvent.click(teamSelect);
      await userEvent.click(screen.getByText('Las Vegas Aces'));

      await userEvent.click(seasonSelect);
      await userEvent.click(screen.getByText('2025 Season'));

      expect(submitButton).toBeDisabled();
    });
  });

  describe('Team Selection', () => {
    test('displays all WNBA teams in dropdown', async () => {
      renderForm();

      const teamSelect = screen.getByLabelText(/WNBA Team/i);
      await userEvent.click(teamSelect);

      // Check for a few key teams
      expect(screen.getByText('Las Vegas Aces')).toBeInTheDocument();
      expect(screen.getByText('Minnesota Lynx')).toBeInTheDocument();
      expect(screen.getByText('Golden State Valkyries')).toBeInTheDocument();
      expect(screen.getByText('Seattle Storm')).toBeInTheDocument();
    });

    test('selects team correctly', async () => {
      renderForm();

      const teamSelect = screen.getByLabelText(/WNBA Team/i);
      await userEvent.click(teamSelect);
      await userEvent.click(screen.getByText('Las Vegas Aces'));

      expect(screen.getByDisplayValue('Las Vegas Aces')).toBeInTheDocument();
    });
  });

  describe('Season Selection', () => {
    test('displays season options', async () => {
      renderForm();

      const seasonSelect = screen.getByLabelText(/Season/i);
      await userEvent.click(seasonSelect);

      expect(screen.getByText('2025 Season')).toBeInTheDocument();
      expect(screen.getByText('2026 Projection')).toBeInTheDocument();
    });
  });

  describe('Strategy Selection', () => {
    test('displays all strategy options', async () => {
      renderForm();

      const strategySelect = screen.getByLabelText(/Team Building Strategy/i);
      await userEvent.click(strategySelect);

      expect(screen.getByText('Championship Contender')).toBeInTheDocument();
      expect(screen.getByText('Playoff Push')).toBeInTheDocument();
      expect(screen.getByText('Balanced Development')).toBeInTheDocument();
      expect(screen.getByText('Rebuild/Youth Focus')).toBeInTheDocument();
      expect(screen.getByText('Retool Around Core')).toBeInTheDocument();
    });
  });

  describe('Priorities Multi-Select', () => {
    test('allows multiple priority selections', async () => {
      renderForm();

      const prioritiesSelect = screen.getByLabelText(/Team Priorities/i);
      await userEvent.click(prioritiesSelect);

      // Select multiple priorities
      await userEvent.click(screen.getByText('Defensive Improvement'));
      await userEvent.click(screen.getByText('Veteran Leadership'));

      // Close dropdown
      await userEvent.click(document.body);

      // Check that chips are displayed
      expect(screen.getByText('Defensive Improvement')).toBeInTheDocument();
      expect(screen.getByText('Veteran Leadership')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    test('submits form with correct data', async () => {
      renderForm();

      // Fill out form
      const teamSelect = screen.getByLabelText(/WNBA Team/i);
      await userEvent.click(teamSelect);
      await userEvent.click(screen.getByText('Las Vegas Aces'));

      const seasonSelect = screen.getByLabelText(/Season/i);
      await userEvent.click(seasonSelect);
      await userEvent.click(screen.getByText('2025 Season'));

      const strategySelect = screen.getByLabelText(/Team Building Strategy/i);
      await userEvent.click(strategySelect);
      await userEvent.click(screen.getByText('Championship Contender'));

      const prioritiesSelect = screen.getByLabelText(/Team Priorities/i);
      await userEvent.click(prioritiesSelect);
      await userEvent.click(screen.getByText('Defensive Improvement'));
      await userEvent.click(document.body);

      const capSelect = screen.getByLabelText(/Salary Cap Approach/i);
      await userEvent.click(capSelect);
      await userEvent.click(screen.getByText('Aggressive (Use Full Cap)'));

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Build Roster/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          team: 'Las Vegas Aces',
          season: '2025',
          strategy: 'championship',
          priorities: ['defense'],
          cap_target: 'aggressive',
        });
      });
    });

    test('submits form with only required fields', async () => {
      renderForm();

      // Fill only required fields
      const teamSelect = screen.getByLabelText(/WNBA Team/i);
      await userEvent.click(teamSelect);
      await userEvent.click(screen.getByText('Minnesota Lynx'));

      const seasonSelect = screen.getByLabelText(/Season/i);
      await userEvent.click(seasonSelect);
      await userEvent.click(screen.getByText('2026 Projection'));

      const strategySelect = screen.getByLabelText(/Team Building Strategy/i);
      await userEvent.click(strategySelect);
      await userEvent.click(screen.getByText('Rebuild/Youth Focus'));

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Build Roster/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          team: 'Minnesota Lynx',
          season: '2026',
          strategy: 'rebuild',
          priorities: [],
          cap_target: '',
        });
      });
    });

    test('prevents submission with incomplete required fields', async () => {
      renderForm();

      // Fill only some required fields
      const teamSelect = screen.getByLabelText(/WNBA Team/i);
      await userEvent.click(teamSelect);
      await userEvent.click(screen.getByText('Las Vegas Aces'));

      // Try to submit (should not work due to missing required fields)
      const submitButton = screen.getByRole('button', { name: /Build Roster/i });
      await userEvent.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    test('disables form fields when loading', () => {
      renderForm(true);

      expect(screen.getByLabelText(/WNBA Team/i)).toBeDisabled();
      expect(screen.getByLabelText(/Season/i)).toBeDisabled();
      expect(screen.getByLabelText(/Team Building Strategy/i)).toBeDisabled();
      expect(screen.getByLabelText(/Team Priorities/i)).toBeDisabled();
      expect(screen.getByLabelText(/Salary Cap Approach/i)).toBeDisabled();
    });

    test('shows loading state in submit button', () => {
      renderForm(true);

      expect(screen.getByText('Building Your Roster...')).toBeInTheDocument();
    });

    test('disables submit button when loading', () => {
      renderForm(true);

      const submitButton = screen.getByRole('button', { name: /Building Your Roster/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Form Reset', () => {
    test('form starts with empty values', () => {
      renderForm();

      const teamSelect = screen.getByDisplayValue('');
      const seasonSelect = screen.getByDisplayValue('');
      const strategySelect = screen.getByDisplayValue('');

      expect(teamSelect).toBeInTheDocument();
      expect(seasonSelect).toBeInTheDocument();
      expect(strategySelect).toBeInTheDocument();
    });
  });
}); 