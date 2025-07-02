from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
import uvicorn
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import asyncio

# Load environment variables from .env file
load_dotenv()

# Arize and tracing imports
from arize.otel import register
from openinference.instrumentation.langchain import LangChainInstrumentor
from openinference.instrumentation.openai import OpenAIInstrumentor
from openinference.instrumentation.litellm import LiteLLMInstrumentor
from openinference.instrumentation import using_prompt_template
from opentelemetry import trace  # Add trace context management

# LangGraph and LangChain imports
from langgraph.graph import StateGraph, END, START
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import ToolNode
from typing_extensions import TypedDict, Annotated
import operator
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langchain_community.tools.tavily_search import TavilySearchResults

# Configure LiteLLM
import litellm
litellm.set_verbose = True  # Enable debug logging for LiteLLM
litellm.drop_params = True  # Drop unsupported parameters automatically

# Global tracer provider to ensure it's available across the application
tracer_provider = None

# Initialize Arize tracing
def setup_tracing():
    global tracer_provider
    try:
        # Check if required environment variables are set
        space_id = os.getenv("ARIZE_SPACE_ID")
        api_key = os.getenv("ARIZE_API_KEY")
        
        if not space_id or not api_key or space_id == "your_arize_space_id_here" or api_key == "your_arize_api_key_here":
            print("WARNING: Arize credentials not configured properly.")
            print("NOTE: Please set ARIZE_SPACE_ID and ARIZE_API_KEY environment variables.")
            print("NOTE: Copy backend/env_example.txt to backend/.env and update with your credentials.")
            return None
            
        tracer_provider = register(
            space_id=space_id,
            api_key=api_key,
            project_name="wnba-team-builder"
        )
        
        # Only instrument LangChain to avoid duplicate traces
        # LangChain instrumentation will automatically trace LLM calls within tools
        LangChainInstrumentor().instrument(tracer_provider=tracer_provider)
        
        # Disable OpenAI direct instrumentation to prevent duplicate spans
        # OpenAIInstrumentor().instrument(tracer_provider=tracer_provider)
        
        # Keep LiteLLM instrumentation for direct LiteLLM calls
        LiteLLMInstrumentor().instrument(
            tracer_provider=tracer_provider,
            skip_dep_check=True
        )
        
        print("SUCCESS: Arize tracing initialized successfully (LangChain + LiteLLM only)")
        print(f"PROJECT: wnba-team-builder")
        print(f"SPACE ID: {space_id[:8]}...")
        
        return tracer_provider
        
    except Exception as e:
        print(f"WARNING: Arize tracing setup failed: {str(e)}")
        print("NOTE: Continuing without tracing - check your ARIZE_SPACE_ID and ARIZE_API_KEY")
        print("NOTE: Also ensure you have the latest version of openinference packages")
        return None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup tracing before anything else
    setup_tracing()
    yield

app = FastAPI(title="Trip Planner API", lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for WNBA Team Building
class RosterRequest(BaseModel):
    team: str                           # Required - WNBA team
    season: str                         # Required - Season year (2025, 2026)
    strategy: str                       # Required - Team building strategy
    priorities: Optional[List[str]] = []  # Optional - Team priorities
    cap_target: Optional[str] = None    # Optional - Salary cap approach

class RosterResponse(BaseModel):
    result: str
    agent_type: Optional[str] = "wnba_team_builder"

# Legacy models for backward compatibility (can be removed later)
class TripRequest(BaseModel):
    destination: str
    duration: str
    budget: Optional[str] = None
    interests: Optional[str] = None
    travel_style: Optional[str] = None

class TripResponse(BaseModel):
    result: str

# Define the state for our WNBA team building graph
class RosterBuilderState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]
    roster_request: Dict[str, Any]
    final_result: Optional[str]

# Legacy state for backward compatibility
class TripPlannerState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]
    trip_request: Dict[str, Any]
    final_result: Optional[str]

# Initialize the LLM - Using GPT-4.1 for production
# Note: This should be initialized after instrumentation setup
llm = ChatOpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    model="gpt-4o-mini",  # GPT-4o-mini
    temperature=0,
    max_tokens=2000,
    timeout=30
)

# Initialize search tool if available
search_tools = []
if os.getenv("TAVILY_API_KEY"):
    search_tools.append(TavilySearchResults(max_results=5))

# Define WNBA team building tools with proper trace context
@tool
def analyze_player_performance(team: str, season: str, strategy: str) -> str:
    """Analyze current player performance and roster composition for a WNBA team.
    
    Args:
        team: The WNBA team to analyze
        season: The season (2025, 2026)
        strategy: Team building strategy (championship, rebuild, etc.)
    """
    # System message for constraints
    system_prompt = "You are a WNBA analyst. CRITICAL: Your response must be under 150 words and 800 characters. Focus on key roster analysis only."
    
    # Use search tool if available for real-time WNBA data
    if search_tools:
        search_tool = search_tools[0]
        search_results = search_tool.invoke(f"{team} WNBA roster {season} players performance stats")
        
        prompt_template = """Analyze {team} for {season} season with {strategy} strategy based on: {search_results}

Key analysis:
- Current roster strengths
- Key player performances
- Position needs
- Contract situations
- Strategy fit assessment"""
        
        prompt_template_variables = {
            "team": team,
            "season": season,
            "strategy": strategy,
            "search_results": str(search_results)[:500]  # Limit search results length
        }
    else:
        prompt_template = """Analyze {team} for {season} season with {strategy} strategy.

Key analysis:
- Current roster strengths  
- Position needs
- Key players to build around
- Strategy alignment
- Performance trends

Note: Using general WNBA knowledge."""
        
        prompt_template_variables = {
            "team": team,
            "season": season,
            "strategy": strategy
        }
    
    with using_prompt_template(
        template=prompt_template,
        variables=prompt_template_variables,
        version="player-analysis-v1.0",
    ):
        formatted_prompt = prompt_template.format(**prompt_template_variables)
        response = llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=formatted_prompt)
        ])
    return response.content

@tool
def analyze_salary_cap(team: str, season: str, cap_target: str = None) -> str:
    """Analyze salary cap situation and constraints for a WNBA team.
    
    Args:
        team: The WNBA team
        season: The season (2025, 2026)
        cap_target: Salary cap approach (conservative, aggressive, maximum)
    """
    cap_approach = cap_target or "balanced approach within CBA constraints"
    
    # Use system message for strict constraints
    system_prompt = "You are a WNBA salary cap expert. CRITICAL: Your response must be under 100 words and 500 characters. Focus on CBA compliance."
    
    prompt_template = """Salary cap analysis for {team} {season} season. Approach: {cap_approach}

2025 CBA Rules:
- Salary cap: $1,507,100
- Team minimum: $1,261,440
- Player max: $214,466
- Supermax: $249,244

Include only:
- Current cap situation
- Available space
- Contract recommendations
- CBA compliance notes
- Strategic opportunities

Be extremely concise."""
    
    prompt_template_variables = {
        "team": team,
        "season": season,
        "cap_approach": cap_approach
    }
    
    with using_prompt_template(
        template=prompt_template,
        variables=prompt_template_variables,
        version="salary-cap-v1.0",
    ):
        formatted_prompt = prompt_template.format(**prompt_template_variables)
        response = llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=formatted_prompt)
        ])
    return response.content

@tool
def analyze_team_chemistry(team: str, priorities: List[str] = None, strategy: str = None) -> str:
    """Analyze team chemistry, locker room dynamics, and player compatibility.
    
    Args:
        team: The WNBA team
        priorities: Team priorities (leadership, defense, youth, etc.)
        strategy: Team building strategy
    """
    priorities_text = ", ".join(priorities) if priorities else "general team chemistry and leadership"
    strategy_text = strategy or "balanced development"
    
    # System message for constraints
    system_prompt = "You are a WNBA team chemistry expert. CRITICAL: Your response must be under 100 words and 600 characters. Focus on team dynamics only."
    
    prompt_template = """Team chemistry analysis for {team} focusing on: {priorities}
Strategy: {strategy}

Analyze only:
- Current leadership structure
- Locker room dynamics
- Veteran-rookie mentorship
- Position group chemistry
- Chemistry gaps to address
- Cultural fit considerations

Be specific and concise."""
    
    prompt_template_variables = {
        "team": team,
        "priorities": priorities_text,
        "strategy": strategy_text
    }
    
    with using_prompt_template(
        template=prompt_template,
        variables=prompt_template_variables,
        version="team-chemistry-v1.0",
    ):
        formatted_prompt = prompt_template.format(**prompt_template_variables)
        response = llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=formatted_prompt)
        ])
    return response.content

@tool
def construct_roster(team: str, season: str, player_analysis: str, cap_analysis: str, chemistry_analysis: str, strategy: str = None) -> str:
    """Create a comprehensive roster construction plan and recommendations.
    
    Args:
        team: The WNBA team
        season: The season (2025, 2026)
        player_analysis: Player performance analysis
        cap_analysis: Salary cap analysis
        chemistry_analysis: Team chemistry analysis
        strategy: Team building strategy (optional)
    """
    strategy_text = strategy or "Balanced Development"
    
    # System message for constraints
    system_prompt = "You are a WNBA roster construction expert. CRITICAL: Your response must be under 200 words and 1200 characters. Provide actionable roster recommendations only."
    
    prompt_template = """Roster construction plan for {team} {season} season ({strategy} strategy):

Player Analysis: {player_analysis}
Salary Cap: {cap_analysis}
Team Chemistry: {chemistry_analysis}

CBA Constraints:
- Salary cap: $1,507,100
- Team minimum: $1,261,440  
- Roster: 11-12 players required

Provide specific recommendations:
- Priority signings/trades
- Contract structures
- Roster composition
- Timeline for moves
- Risk assessment

Be actionable and concise."""
    
    prompt_template_variables = {
        "team": team,
        "season": season,
        "strategy": strategy_text,
        "player_analysis": player_analysis[:200],  # Limit input length
        "cap_analysis": cap_analysis[:200],
        "chemistry_analysis": chemistry_analysis[:200]
    }
    
    with using_prompt_template(
        template=prompt_template,
        variables=prompt_template_variables,
        version="roster-construction-v1.0",
    ):
        formatted_prompt = prompt_template.format(**prompt_template_variables)
        response = llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=formatted_prompt)
        ])
    return response.content

# Enhanced state to track parallel data
# WNBA Team Building State
class EfficientRosterBuilderState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]
    roster_request: Dict[str, Any]
    player_analysis_data: Optional[str]
    salary_cap_data: Optional[str]
    team_chemistry_data: Optional[str]
    final_result: Optional[str]

# Legacy state for backward compatibility
class EfficientTripPlannerState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]
    trip_request: Dict[str, Any]
    research_data: Optional[str]
    budget_data: Optional[str]
    local_data: Optional[str]
    final_result: Optional[str]

# Define WNBA roster building nodes for parallel execution
def player_analysis_node(state: EfficientRosterBuilderState) -> EfficientRosterBuilderState:
    """Analyze player performance in parallel"""
    try:
        roster_req = state["roster_request"]
        print(f"[PLAYER] Starting player analysis for {roster_req.get('team', 'Unknown')}")
        
        player_result = analyze_player_performance.invoke({
            "team": roster_req["team"], 
            "season": roster_req["season"],
            "strategy": roster_req["strategy"]
        })
        
        print(f"[SUCCESS] Player analysis completed for {roster_req.get('team', 'Unknown')}")
        return {
            "messages": [HumanMessage(content=f"Player analysis completed: {player_result}")],
            "player_analysis_data": player_result
        }
    except Exception as e:
        print(f"[ERROR] Player analysis node error: {str(e)}")
        return {
            "messages": [HumanMessage(content=f"Player analysis failed: {str(e)}")],
            "player_analysis_data": f"Player analysis failed: {str(e)}"
        }

def salary_cap_node(state: EfficientRosterBuilderState) -> EfficientRosterBuilderState:
    """Analyze salary cap in parallel"""
    try:
        roster_req = state["roster_request"]
        print(f"[CAP] Starting salary cap analysis for {roster_req.get('team', 'Unknown')}")
        
        cap_result = analyze_salary_cap.invoke({
            "team": roster_req["team"], 
            "season": roster_req["season"],
            "cap_target": roster_req.get("cap_target")
        })
        
        print(f"[SUCCESS] Salary cap analysis completed for {roster_req.get('team', 'Unknown')}")
        return {
            "messages": [HumanMessage(content=f"Salary cap analysis completed: {cap_result}")],
            "salary_cap_data": cap_result
        }
    except Exception as e:
        print(f"❌ Salary cap node error: {str(e)}")
        return {
            "messages": [HumanMessage(content=f"Salary cap analysis failed: {str(e)}")],
            "salary_cap_data": f"Salary cap analysis failed: {str(e)}"
        }

def team_chemistry_node(state: EfficientRosterBuilderState) -> EfficientRosterBuilderState:
    """Analyze team chemistry in parallel"""
    try:
        roster_req = state["roster_request"]
        print(f"🎯 Starting team chemistry analysis for {roster_req.get('team', 'Unknown')}")
        
        chemistry_result = analyze_team_chemistry.invoke({
            "team": roster_req["team"], 
            "priorities": roster_req.get("priorities", []),
            "strategy": roster_req["strategy"]
        })
        
        print(f"✅ Team chemistry analysis completed for {roster_req.get('team', 'Unknown')}")
        return {
            "messages": [HumanMessage(content=f"Team chemistry analysis completed: {chemistry_result}")],
            "team_chemistry_data": chemistry_result
        }
    except Exception as e:
        print(f"❌ Team chemistry node error: {str(e)}")
        return {
            "messages": [HumanMessage(content=f"Team chemistry analysis failed: {str(e)}")],
            "team_chemistry_data": f"Team chemistry analysis failed: {str(e)}"
        }

def roster_construction_node(state: EfficientRosterBuilderState) -> EfficientRosterBuilderState:
    """Create final roster construction plan using all gathered data"""
    try:
        roster_req = state["roster_request"]
        print(f"📋 Starting roster construction for {roster_req.get('team', 'Unknown')}")
        
        # Get data from previous nodes
        player_data = state.get("player_analysis_data", "")
        cap_data = state.get("salary_cap_data", "")
        chemistry_data = state.get("team_chemistry_data", "")
        
        print(f"📊 Data available - Player: {len(player_data) if player_data else 0} chars, Cap: {len(cap_data) if cap_data else 0} chars, Chemistry: {len(chemistry_data) if chemistry_data else 0} chars")
        
        roster_result = construct_roster.invoke({
            "team": roster_req["team"],
            "season": roster_req["season"],
            "player_analysis": player_data,
            "cap_analysis": cap_data,
            "chemistry_analysis": chemistry_data,
            "strategy": roster_req["strategy"]
        })
        
        print(f"✅ Roster construction completed for {roster_req.get('team', 'Unknown')}")
        return {
            "messages": [HumanMessage(content=roster_result)],
            "final_result": roster_result
        }
    except Exception as e:
        print(f"❌ Roster construction node error: {str(e)}")
        return {
            "messages": [HumanMessage(content=f"Roster construction failed: {str(e)}")],
            "final_result": f"Roster construction failed: {str(e)}"
        }

# Legacy trip planning nodes for backward compatibility
def research_node(state: EfficientTripPlannerState) -> EfficientTripPlannerState:
    """Research destination in parallel"""
    try:
        trip_req = state["trip_request"]
        print(f"🔍 Starting research for {trip_req.get('destination', 'Unknown')}")
        
        research_result = research_destination.invoke({
            "destination": trip_req["destination"], 
            "duration": trip_req["duration"]
        })
        
        print(f"✅ Research completed for {trip_req.get('destination', 'Unknown')}")
        return {
            "messages": [HumanMessage(content=f"Research completed: {research_result}")],
            "research_data": research_result
        }
    except Exception as e:
        print(f"❌ Research node error: {str(e)}")
        return {
            "messages": [HumanMessage(content=f"Research failed: {str(e)}")],
            "research_data": f"Research failed: {str(e)}"
        }

def budget_node(state: EfficientTripPlannerState) -> EfficientTripPlannerState:
    """Analyze budget in parallel"""
    try:
        trip_req = state["trip_request"]
        print(f"💰 Starting budget analysis for {trip_req.get('destination', 'Unknown')}")
        
        budget_result = analyze_budget.invoke({
            "destination": trip_req["destination"], 
            "duration": trip_req["duration"], 
            "budget": trip_req.get("budget")
        })
        
        print(f"✅ Budget analysis completed for {trip_req.get('destination', 'Unknown')}")
        return {
            "messages": [HumanMessage(content=f"Budget analysis completed: {budget_result}")],
            "budget_data": budget_result
        }
    except Exception as e:
        print(f"❌ Budget node error: {str(e)}")
        return {
            "messages": [HumanMessage(content=f"Budget analysis failed: {str(e)}")],
            "budget_data": f"Budget analysis failed: {str(e)}"
        }

def local_experiences_node(state: EfficientTripPlannerState) -> EfficientTripPlannerState:
    """Curate local experiences in parallel"""
    try:
        trip_req = state["trip_request"]
        print(f"🍽️ Starting local experiences curation for {trip_req.get('destination', 'Unknown')}")
        
        local_result = curate_local_experiences.invoke({
            "destination": trip_req["destination"], 
            "interests": trip_req.get("interests")
        })
        
        print(f"✅ Local experiences completed for {trip_req.get('destination', 'Unknown')}")
        return {
            "messages": [HumanMessage(content=f"Local experiences curated: {local_result}")],
            "local_data": local_result
        }
    except Exception as e:
        print(f"❌ Local experiences node error: {str(e)}")
        return {
            "messages": [HumanMessage(content=f"Local experiences failed: {str(e)}")],
            "local_data": f"Local experiences failed: {str(e)}"
        }

def itinerary_node(state: EfficientTripPlannerState) -> EfficientTripPlannerState:
    """Create final itinerary using all gathered data"""
    try:
        trip_req = state["trip_request"]
        print(f"📅 Starting itinerary creation for {trip_req.get('destination', 'Unknown')}")
        
        # Get data from previous nodes
        research_data = state.get("research_data", "")
        budget_data = state.get("budget_data", "")
        local_data = state.get("local_data", "")
        
        print(f"📊 Data available - Research: {len(research_data) if research_data else 0} chars, Budget: {len(budget_data) if budget_data else 0} chars, Local: {len(local_data) if local_data else 0} chars")
        
        itinerary_result = create_itinerary.invoke({
            "destination": trip_req["destination"],
            "duration": trip_req["duration"],
            "research": research_data,
            "budget_info": budget_data,
            "local_info": local_data,
            "travel_style": trip_req.get("travel_style")
        })
        
        print(f"✅ Itinerary creation completed for {trip_req.get('destination', 'Unknown')}")
        return {
            "messages": [HumanMessage(content=itinerary_result)],
            "final_result": itinerary_result
        }
    except Exception as e:
        print(f"❌ Itinerary node error: {str(e)}")
        return {
            "messages": [HumanMessage(content=f"Itinerary creation failed: {str(e)}")],
            "final_result": f"Itinerary creation failed: {str(e)}"
        }

# Build the WNBA roster building graph with parallel execution
def create_efficient_roster_building_graph():
    """Create and compile the optimized WNBA roster building graph with parallel execution"""
    
    # Create the state graph
    workflow = StateGraph(EfficientRosterBuilderState)
    
    # Add parallel processing nodes
    workflow.add_node("player_analysis", player_analysis_node)
    workflow.add_node("salary_cap", salary_cap_node)
    workflow.add_node("team_chemistry", team_chemistry_node)
    workflow.add_node("roster_construction", roster_construction_node)
    
    # Start all analysis tasks in parallel
    workflow.add_edge(START, "player_analysis")
    workflow.add_edge(START, "salary_cap")
    workflow.add_edge(START, "team_chemistry")
    
    # All parallel tasks feed into roster construction
    workflow.add_edge("player_analysis", "roster_construction")
    workflow.add_edge("salary_cap", "roster_construction")
    workflow.add_edge("team_chemistry", "roster_construction")
    
    # Roster construction is the final step
    workflow.add_edge("roster_construction", END)
    
    # Compile with memory
    memory = MemorySaver()
    return workflow.compile(checkpointer=memory)

# Legacy trip planning graph for backward compatibility
def create_efficient_trip_planning_graph():
    """Create and compile the optimized trip planning graph with parallel execution"""
    
    # Create the state graph
    workflow = StateGraph(EfficientTripPlannerState)
    
    # Add parallel processing nodes
    workflow.add_node("research", research_node)
    workflow.add_node("budget", budget_node)
    workflow.add_node("local_experiences", local_experiences_node)
    workflow.add_node("itinerary", itinerary_node)
    
    # Start all research tasks in parallel
    workflow.add_edge(START, "research")
    workflow.add_edge(START, "budget")
    workflow.add_edge(START, "local_experiences")
    
    # All parallel tasks feed into itinerary creation
    workflow.add_edge("research", "itinerary")
    workflow.add_edge("budget", "itinerary")
    workflow.add_edge("local_experiences", "itinerary")
    
    # Itinerary is the final step
    workflow.add_edge("itinerary", END)
    
    # Compile with memory
    memory = MemorySaver()
    return workflow.compile(checkpointer=memory)

# API Routes
@app.get("/")
async def root():
    return {"message": "WNBA Team Builder API is running with parallel LangGraph analysis!"}


@app.post("/build-roster", response_model=RosterResponse)
async def build_roster(roster_request: RosterRequest):
    """Build a WNBA roster using optimized parallel LangGraph workflow"""
    try:
        # Create the efficient WNBA graph
        graph = create_efficient_roster_building_graph()
        
        # Prepare initial state with the new structure
        initial_state = {
            "messages": [],
            "roster_request": roster_request.model_dump(),
            "player_analysis_data": None,
            "salary_cap_data": None,
            "team_chemistry_data": None,
            "final_result": None
        }
        
        print(f"[START] Starting WNBA roster building for {roster_request.team} ({roster_request.season})")
        print(f"[STRATEGY] Strategy: {roster_request.strategy}")
        print(f"[PRIORITIES] Priorities: {roster_request.priorities}")
        print(f"[CAP] Cap Target: {roster_request.cap_target}")
        
        # Configure for thread-based execution
        config = {"configurable": {"thread_id": "wnba_roster_analysis"}}
        
        # Run the graph - this will execute all parallel nodes then final construction
        result = graph.invoke(initial_state, config)
        
        print(f"[SUCCESS] WNBA roster building completed for {roster_request.team}")
        
        # Extract the final result
        final_result = result.get("final_result", "Roster building analysis completed successfully.")
        
        return RosterResponse(
            result=final_result,
            agent_type="wnba_team_builder"
        )
        
    except Exception as e:
        print(f"[ERROR] Error in WNBA roster building: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Roster building failed: {str(e)}")


@app.post("/plan-trip", response_model=TripResponse)
async def plan_trip(trip_request: TripRequest):
    """Plan a trip using optimized parallel LangGraph workflow"""
    try:
        # Create the efficient graph
        graph = create_efficient_trip_planning_graph()
        
        # Prepare initial state with the new structure
        initial_state = {
            "messages": [],
            "trip_request": trip_request.model_dump(),
            "research_data": None,
            "budget_data": None,
            "local_data": None,
            "final_result": None
        }
        
        # Execute the workflow with parallel processing
        config = {"configurable": {"thread_id": f"trip_{trip_request.destination.replace(' ', '_')}_{trip_request.duration.replace(' ', '_')}"}}
        
        print(f"🚀 Starting trip planning for {trip_request.destination} ({trip_request.duration})")
        
        output = graph.invoke(initial_state, config)
        
        print(f"✅ Trip planning completed. Output keys: {list(output.keys()) if output else 'None'}")
        
        # Return the final result
        if output and output.get("final_result"):
            return TripResponse(result=output.get("final_result"))
        elif output and output.get("messages") and len(output.get("messages")) > 0:
            # Fallback to last message if final_result is not available
            last_message = output.get("messages")[-1]
            content = last_message.content if hasattr(last_message, 'content') else str(last_message)
            return TripResponse(result=content)
        
        return TripResponse(result="Trip planning completed but no detailed results available.")
        
    except Exception as e:
        print(f"❌ Trip planning error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Trip planning failed: {str(e)}")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "trip-planner-backend-simplified"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
    
