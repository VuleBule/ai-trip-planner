// WNBA Team Building Types

export interface RosterRequest {
  team: string;                    // Required - Selected WNBA team
  season: string;                  // Required - Season year (2025, 2026)
  strategy: string;                // Required - Team building strategy
  priorities?: string[];           // Optional - Array of team priorities
  cap_target?: string;            // Optional - Salary cap approach
}

export interface RosterResponse {
  agent_type?: string;
  result: string;                 // Comprehensive roster analysis and recommendations
  route_taken?: string;
}

// WNBA Teams (2025 season with Golden State expansion)
export const WNBA_TEAMS = [
  'Atlanta Dream',
  'Chicago Sky', 
  'Connecticut Sun',
  'Dallas Wings',
  'Golden State Valkyries',
  'Indiana Fever',
  'Las Vegas Aces',
  'Minnesota Lynx',
  'New York Liberty',
  'Phoenix Mercury',
  'Seattle Storm',
  'Washington Mystics'
] as const;

// Team Building Strategies
export const TEAM_STRATEGIES = [
  { value: 'championship', label: 'Championship Contender' },
  { value: 'playoff', label: 'Playoff Push' },
  { value: 'balanced', label: 'Balanced Development' },
  { value: 'rebuild', label: 'Rebuild/Youth Focus' },
  { value: 'retool', label: 'Retool Around Core' }
] as const;

// Team Priorities
export const TEAM_PRIORITIES = [
  { value: 'defense', label: 'Defensive Improvement' },
  { value: 'offense', label: 'Offensive Firepower' },
  { value: 'leadership', label: 'Veteran Leadership' },
  { value: 'youth', label: 'Youth Development' },
  { value: 'depth', label: 'Bench Depth' },
  { value: 'athleticism', label: 'Athletic Upside' },
  { value: 'shooting', label: 'Three-Point Shooting' },
  { value: 'size', label: 'Size/Rebounding' }
] as const;

// Salary Cap Targets
export const CAP_TARGETS = [
  { value: 'conservative', label: 'Conservative (Leave Cap Space)' },
  { value: 'balanced', label: 'Balanced Approach' },
  { value: 'aggressive', label: 'Aggressive (Use Full Cap)' },
  { value: 'maximum', label: 'Maximum Utilization' }
] as const;

// Season Options
export const SEASON_OPTIONS = [
  { value: '2025', label: '2025 Season' },
  { value: '2026', label: '2026 Projection' }
] as const; 