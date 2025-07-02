# WNBA Team Builder

A fast, intelligent WNBA team building application powered by LangGraph, Groq, and Arize observability. Build championship rosters with CBA compliance and professional basketball analysis.

## 🏀 Basketball Features

- **WNBA Expertise**: Uses comprehensive 2025 CBA rules and salary cap constraints
- **Parallel Analysis**: Player performance, salary cap, and team chemistry run simultaneously
- **Championship Strategy**: Build rosters for championship runs, rebuilds, or development
- **CBA Compliance**: $1.5M salary cap, player max contracts, and roster requirements

## 🚀 Performance Features

- **Groq Integration**: Uses Groq's lightning-fast inference for 10x faster responses
- **Parallel Processing**: Player analysis, salary cap, and team chemistry run simultaneously
- **Optimized Graph**: Streamlined workflow eliminates unnecessary supervisor overhead
- **LiteLLM Instrumentation**: Comprehensive observability and prompt template tracking

## Architecture

### Frontend (React + TypeScript)
- Modern Material-UI interface with WNBA team selection
- Real-time roster building requests with strategy selection
- Multi-select priorities (leadership, scoring, defense, chemistry)
- Error handling and loading states

### Backend (FastAPI + LangGraph)
- **Parallel LangGraph Workflow**: 
  - Player Analysis Node: Performance evaluation and roster composition
  - Salary Cap Node: CBA compliance and contract recommendations
  - Team Chemistry Node: Leadership dynamics and compatibility analysis
  - Roster Construction Node: Combines all data into comprehensive team building plan
- **Groq LLM**: Fast inference with basketball domain expertise
- **Comprehensive Tracing**: LangChain + LiteLLM instrumentation

## Quick Start

### 1. Setup Environment

Create a `.env` file in the `backend/` directory:

```bash
# Required: Groq API Key (get from https://console.groq.com)
GROQ_API_KEY=your_groq_api_key_here

# Required: Arize observability (get from https://app.arize.com)
ARIZE_SPACE_ID=your_arize_space_id
ARIZE_API_KEY=your_arize_api_key

# Optional: For real-time WNBA data and stats
TAVILY_API_KEY=your_tavily_api_key

# Optional: Fallback to OpenAI if Groq unavailable
OPENAI_API_KEY=your_openai_api_key

# LiteLLM Configuration
LITELLM_LOG=DEBUG
```

### 2. Install Dependencies

```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend  
cd ../frontend
npm install
```

### 3. Run the Application

```bash
# Start both services
./start.sh

# Or run separately:
# Backend: cd backend && python main.py
# Frontend: cd frontend && npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## WNBA Features

### 🏆 Team Building Strategies
- **Championship**: Build for immediate title contention
- **Rebuild**: Focus on young talent and future assets
- **Development**: Balance veteran leadership with emerging players
- **Budget-Conscious**: Maximize value within salary constraints

### 📊 2025 CBA Integration
- **Salary Cap**: $1,507,100 team maximum
- **Team Minimum**: $1,261,440 required spending
- **Player Maximum**: $214,466 standard max contract
- **Supermax**: $249,244 for designated veterans
- **Roster Requirements**: 11-12 players mandatory

### 🏀 WNBA Teams (13 Teams)
- Las Vegas Aces, New York Liberty, Connecticut Sun
- Seattle Storm, Minnesota Lynx, Phoenix Mercury
- Chicago Sky, Indiana Fever, Atlanta Dream
- Washington Mystics, Dallas Wings, **Golden State Valkyries** (2025 expansion)

## Performance Optimizations

### ⚡ Groq Integration
- **10x faster inference** compared to OpenAI
- Uses `llama-3.1-70b-versatile` model for optimal speed/quality balance
- Basketball domain knowledge with 30-second timeout

### 🔄 Parallel Graph Execution
- Player analysis, salary cap, and team chemistry analysis run **simultaneously**
- Reduces total execution time from ~30-60 seconds to ~10-15 seconds
- Final roster construction waits for all parallel tasks to complete

### 📊 Observability
- **LangChain + LiteLLM instrumentation** for comprehensive tracing
- Prompt template tracking with WNBA-specific variables
- Real-time performance monitoring via Arize platform

## API Endpoints

### POST `/build-roster`
Creates a comprehensive WNBA roster building plan.

**Request:**
```json
{
  "team": "Las Vegas Aces",
  "season": "2025",
  "strategy": "championship",
  "priorities": ["leadership", "scoring"],
  "cap_target": "aggressive"
}
```

**Response:**
```json
{
  "result": "**Roster Construction Plan for Las Vegas Aces 2025 Season**\n\n1. **Priority Signings/Trades**:\n   - Restructure contracts to maintain A'ja Wilson, Kelsey Plum core...",
  "agent_type": "wnba_team_builder"
}
```

### GET `/health`
Health check endpoint.

### POST `/plan-trip` (Legacy)
Legacy trip planning endpoint maintained for backward compatibility.

## Development

### Graph Structure
```
START → [Player Analysis, Salary Cap, Team Chemistry] → Roster Construction → END
               (parallel execution)
```

### Key Components
- `player_analysis_node()`: Performance evaluation and roster composition analysis
- `salary_cap_node()`: CBA compliance and contract strategy recommendations
- `team_chemistry_node()`: Leadership dynamics and player compatibility
- `roster_construction_node()`: Comprehensive team building with all analysis data

### WNBA Analysis Tools
- `analyze_player_performance()`: Current roster strengths and performance trends
- `analyze_salary_cap()`: CBA compliance and cap optimization strategies
- `analyze_team_chemistry()`: Leadership assessment and team dynamics
- `construct_roster()`: Final roster recommendations with strategic planning

### Prompt Templates
All tools use comprehensive WNBA-specific prompt templates:
- `player-analysis-v1.0`: Performance and roster evaluation
- `salary-cap-v1.0`: CBA compliance and contract strategy
- `team-chemistry-v1.0`: Leadership and compatibility analysis
- `roster-construction-v1.0`: Comprehensive team building plans

## Basketball Domain Knowledge

### 2025 WNBA Landscape
- **13 teams** including Golden State Valkyries expansion
- **New CBA rules** with updated salary structures
- **Championship contenders** vs rebuilding teams analysis
- **Free agency** and draft consideration integration

### Analysis Capabilities
- **Player Performance**: Statistical analysis and fit assessment
- **Contract Strategy**: CBA-compliant deal structuring
- **Team Chemistry**: Leadership dynamics and locker room culture
- **Strategic Planning**: Multi-year roster construction

## Troubleshooting

### Common Issues
1. **Slow responses**: Ensure you're using Groq API key, not OpenAI
2. **Empty results**: Check API key configuration in `.env`
3. **Graph errors**: Verify all dependencies are installed correctly
4. **WNBA data**: Real-time stats require Tavily API key for current information

### Performance Monitoring
View detailed traces and performance metrics in your Arize dashboard to identify bottlenecks and optimize basketball analysis workflows.

## Tech Stack

- **Frontend**: React, TypeScript, Material-UI, Axios
- **Backend**: FastAPI, LangGraph, LangChain, Groq, LiteLLM
- **Domain**: WNBA CBA rules, salary cap analysis, basketball expertise
- **Observability**: Arize, OpenInference, OpenTelemetry
- **Infrastructure**: Docker, Docker Compose

## Contributing

This WNBA Team Builder represents a complete transformation from an AI trip planner, showcasing the flexibility of LangGraph architecture for domain-specific applications. The basketball analysis capabilities demonstrate professional-grade sports analytics with real CBA constraints and strategic team building intelligence.
