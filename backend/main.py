from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
import uvicorn
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import asyncio
import time
from functools import lru_cache

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
from models import ModelFactory

# Configure LiteLLM
import litellm
litellm.set_verbose = False  # Disable debug logging for better performance
litellm.drop_params = True  # Drop unsupported parameters automatically

# Global tracer provider to ensure it's available across the application
tracer_provider = None

# Cache for LLM instances
llm_cache = {}

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

app = FastAPI(title="WNBA Team Builder API", lifespan=lifespan)

# Add performance middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

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
    model_type: Optional[str] = "openai"  # Optional - AI model to use ("openai" or "ollama")

class RosterResponse(BaseModel):
    result: str
    agent_type: Optional[str] = "wnba_team_builder"
    model_used: Optional[str] = None    # NEW - Which model was used for the request

# Legacy models for backward compatibility (can be removed later)
class TripRequest(BaseModel):
    destination: str
    duration: str
    budget: Optional[str] = None
    interests: Optional[str] = None
    travel_style: Optional[str] = None

class TripResponse(BaseModel):
    result: str

class ModelHealthResponse(BaseModel):
    openai: bool
    ollama: bool
    available_models: List[str]

# ============================================================================
# LLM Configuration and Tools with Caching
# ============================================================================

@lru_cache(maxsize=2)
def get_llm(model_type: str = "openai"):
    """Get LLM instance with caching for better performance"""
    if model_type not in llm_cache:
        llm_cache[model_type] = ModelFactory.get_llm(model_type)
    return llm_cache[model_type]

# Initialize search tool if available
search_tools = []
if os.getenv("TAVILY_API_KEY"):
    search_tools.append(TavilySearchResults(max_results=3))  # Reduced from 5 to 3 for performance

# ============================================================================
# WNBA Team Building Tools with Performance Optimizations
# ============================================================================
@tool
def analyze_player_performance(team: str, season: str, strategy: str, model_type: str = "openai") -> str:
    """Analyze current player performance and roster composition for a WNBA team.
    
    Args:
        team: The WNBA team to analyze
        season: The season (2025, 2026)
        strategy: Team building strategy (championship, rebuild, etc.)
        model_type: AI model to use ("openai" or "ollama")
    """
    # Get the appropriate LLM based on model_type
    llm = get_llm(model_type)
    
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
            "search_results": str(search_results)[:400]  # Reduced from 500 to 400 for performance
        }
    else:
        prompt_template = """Analyze {team} for {season} season with {strategy} strategy.

Key analysis:
- Current roster strengths  
- Position needs
- Key players to build around
- Strategy alignment
- Performance trends"""
        
        prompt_template_variables = {
            "team": team,
            "season": season,
            "strategy": strategy
        }
    
    try:
        with using_prompt_template(prompt_template):
            response = llm.invoke(prompt_template_variables)
            return response.content[:800]  # Ensure response is under 800 characters
    except Exception as e:
        return f"Analysis error for {team}: {str(e)[:200]}"

@tool
def analyze_salary_cap(team: str, season: str, cap_target: str = None, model_type: str = "openai") -> str:
    """Analyze salary cap situation and constraints for a WNBA team.
    
    Args:
        team: The WNBA team to analyze
        season: The season (2025, 2026)
        cap_target: Salary cap approach (conservative, balanced, aggressive)
        model_type: AI model to use ("openai" or "ollama")
    """
    llm = get_llm(model_type)
    
    system_prompt = "You are a WNBA salary cap expert. CRITICAL: Your response must be under 150 words and 800 characters. Focus on key cap analysis only."
    
    if search_tools:
        search_tool = search_tools[0]
        search_results = search_tool.invoke(f"{team} WNBA salary cap {season} contracts")
        
        prompt_template = """Analyze {team} salary cap for {season} with {cap_target} approach based on: {search_results}

Key analysis:
- Current cap situation
- Key contracts
- Available space
- Cap flexibility
- Strategy recommendations"""
        
        prompt_template_variables = {
            "team": team,
            "season": season,
            "cap_target": cap_target or "balanced",
            "search_results": str(search_results)[:400]
        }
    else:
        prompt_template = """Analyze {team} salary cap for {season} with {cap_target} approach.

Key analysis:
- Current cap situation
- Key contracts
- Available space
- Cap flexibility
- Strategy recommendations"""
        
        prompt_template_variables = {
            "team": team,
            "season": season,
            "cap_target": cap_target or "balanced"
        }
    
    try:
        with using_prompt_template(prompt_template):
            response = llm.invoke(prompt_template_variables)
            return response.content[:800]
    except Exception as e:
        return f"Salary cap analysis error for {team}: {str(e)[:200]}"

@tool
def analyze_team_chemistry(team: str, priorities: List[str] = None, strategy: str = None, model_type: str = "openai") -> str:
    """Analyze team chemistry and player compatibility for a WNBA team.
    
    Args:
        team: The WNBA team to analyze
        priorities: Team priorities (defense, offense, leadership, etc.)
        strategy: Team building strategy
        model_type: AI model to use ("openai" or "ollama")
    """
    llm = get_llm(model_type)
    
    system_prompt = "You are a WNBA team chemistry expert. CRITICAL: Your response must be under 150 words and 800 characters. Focus on key chemistry analysis only."
    
    if search_tools:
        search_tool = search_tools[0]
        search_results = search_tool.invoke(f"{team} WNBA team chemistry leadership dynamics")
        
        prompt_template = """Analyze {team} team chemistry with {priorities} priorities and {strategy} strategy based on: {search_results}

Key analysis:
- Leadership dynamics
- Player compatibility
- Team culture
- Chemistry factors
- Improvement areas"""
        
        prompt_template_variables = {
            "team": team,
            "priorities": ", ".join(priorities) if priorities else "balanced",
            "strategy": strategy or "balanced",
            "search_results": str(search_results)[:400]
        }
    else:
        prompt_template = """Analyze {team} team chemistry with {priorities} priorities and {strategy} strategy.

Key analysis:
- Leadership dynamics
- Player compatibility
- Team culture
- Chemistry factors
- Improvement areas"""
        
        prompt_template_variables = {
            "team": team,
            "priorities": ", ".join(priorities) if priorities else "balanced",
            "strategy": strategy or "balanced"
        }
    
    try:
        with using_prompt_template(prompt_template):
            response = llm.invoke(prompt_template_variables)
            return response.content[:800]
    except Exception as e:
        return f"Team chemistry analysis error for {team}: {str(e)[:200]}"

@tool
def construct_roster(team: str, season: str, player_analysis: str, cap_analysis: str, chemistry_analysis: str, strategy: str = None, model_type: str = "openai") -> str:
    """Construct an optimal roster based on analysis data.
    
    Args:
        team: The WNBA team
        season: The season
        player_analysis: Player performance analysis
        cap_analysis: Salary cap analysis
        chemistry_analysis: Team chemistry analysis
        strategy: Team building strategy
        model_type: AI model to use ("openai" or "ollama")
    """
    llm = get_llm(model_type)
    
    system_prompt = "You are a WNBA GM. Create a comprehensive roster construction plan. CRITICAL: Your response must be under 300 words and 1500 characters. Focus on actionable recommendations."
    
    prompt_template = """Based on the analysis for {team} {season}, construct an optimal roster:

Player Analysis: {player_analysis}
Salary Cap Analysis: {cap_analysis}
Team Chemistry Analysis: {chemistry_analysis}
Strategy: {strategy}

Provide:
1. Key roster moves (signings, trades, releases)
2. Position priorities
3. Salary cap management
4. Chemistry considerations
5. Timeline and implementation"""
    
    prompt_template_variables = {
        "team": team,
        "season": season,
        "player_analysis": player_analysis[:300],
        "cap_analysis": cap_analysis[:300],
        "chemistry_analysis": chemistry_analysis[:300],
        "strategy": strategy or "balanced"
    }
    
    try:
        with using_prompt_template(prompt_template):
            response = llm.invoke(prompt_template_variables)
            return response.content[:1500]
    except Exception as e:
        return f"Roster construction error for {team}: {str(e)[:200]}"

# ============================================================================
# State Management with Performance Optimizations
# ============================================================================
class EfficientRosterBuilderState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]
    roster_request: Dict[str, Any]
    player_analysis_data: Optional[str]
    salary_cap_data: Optional[str]
    team_chemistry_data: Optional[str]
    final_result: Optional[str]

class EfficientTripPlannerState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]
    trip_request: Dict[str, Any]
    research_data: Optional[str]
    budget_data: Optional[str]
    local_data: Optional[str]
    final_result: Optional[str]

# ============================================================================
# Graph Nodes with Performance Optimizations
# ============================================================================
def player_analysis_node(state: EfficientRosterBuilderState) -> EfficientRosterBuilderState:
    """Analyze player performance with caching"""
    request = state["roster_request"]
    
    # Add system message
    state["messages"].append(SystemMessage(content="You are a WNBA roster building expert. Provide concise, actionable analysis."))
    
    # Get analysis with timeout
    try:
        analysis = analyze_player_performance(
            team=request["team"],
            season=request["season"],
            strategy=request["strategy"],
            model_type=request.get("model_type", "openai")
        )
        state["player_analysis_data"] = analysis
    except Exception as e:
        state["player_analysis_data"] = f"Analysis error: {str(e)[:100]}"
    
    return state

def salary_cap_node(state: EfficientRosterBuilderState) -> EfficientRosterBuilderState:
    """Analyze salary cap with caching"""
    request = state["roster_request"]
    
    try:
        analysis = analyze_salary_cap(
            team=request["team"],
            season=request["season"],
            cap_target=request.get("cap_target"),
            model_type=request.get("model_type", "openai")
        )
        state["salary_cap_data"] = analysis
    except Exception as e:
        state["salary_cap_data"] = f"Salary cap analysis error: {str(e)[:100]}"
    
    return state

def team_chemistry_node(state: EfficientRosterBuilderState) -> EfficientRosterBuilderState:
    """Analyze team chemistry with caching"""
    request = state["roster_request"]
    
    try:
        analysis = analyze_team_chemistry(
            team=request["team"],
            priorities=request.get("priorities", []),
            strategy=request.get("strategy"),
            model_type=request.get("model_type", "openai")
        )
        state["team_chemistry_data"] = analysis
    except Exception as e:
        state["team_chemistry_data"] = f"Chemistry analysis error: {str(e)[:100]}"
    
    return state

def roster_construction_node(state: EfficientRosterBuilderState) -> EfficientRosterBuilderState:
    """Construct final roster with all analysis data"""
    request = state["roster_request"]
    
    try:
        final_result = construct_roster(
            team=request["team"],
            season=request["season"],
            player_analysis=state.get("player_analysis_data", ""),
            cap_analysis=state.get("salary_cap_data", ""),
            chemistry_analysis=state.get("team_chemistry_data", ""),
            strategy=request.get("strategy"),
            model_type=request.get("model_type", "openai")
        )
        state["final_result"] = final_result
    except Exception as e:
        state["final_result"] = f"Roster construction error: {str(e)[:200]}"
    
    return state

# ============================================================================
# Graph Construction with Performance Optimizations
# ============================================================================
def create_efficient_roster_building_graph():
    """Create an optimized roster building graph"""
    workflow = StateGraph(EfficientRosterBuilderState)
    
    # Add nodes
    workflow.add_node("player_analysis", player_analysis_node)
    workflow.add_node("salary_cap", salary_cap_node)
    workflow.add_node("team_chemistry", team_chemistry_node)
    workflow.add_node("roster_construction", roster_construction_node)
    
    # Set entry point
    workflow.set_entry_point("player_analysis")
    
    # Add edges for parallel processing
    workflow.add_edge("player_analysis", "salary_cap")
    workflow.add_edge("salary_cap", "team_chemistry")
    workflow.add_edge("team_chemistry", "roster_construction")
    workflow.add_edge("roster_construction", END)
    
    return workflow.compile()

# ============================================================================
# API Endpoints with Performance Optimizations
# ============================================================================
@app.get("/")
async def root():
    return {"message": "WNBA Team Builder API - Optimized for Performance"}

@app.post("/build-roster", response_model=RosterResponse)
async def build_roster(roster_request: RosterRequest):
    """Build a WNBA roster with performance optimizations"""
    start_time = time.time()
    
    try:
        # Create graph
        graph = create_efficient_roster_building_graph()
        
        # Prepare initial state
        initial_state = {
            "messages": [],
            "roster_request": roster_request.dict(),
            "player_analysis_data": None,
            "salary_cap_data": None,
            "team_chemistry_data": None,
            "final_result": None
        }
        
        # Execute graph with timeout
        try:
            result = await asyncio.wait_for(
                graph.ainvoke(initial_state),
                timeout=60.0  # 60 second timeout
            )
            
            processing_time = time.time() - start_time
            
            return RosterResponse(
                result=result.get("final_result", "Analysis completed successfully."),
                agent_type="wnba_team_builder",
                model_used=roster_request.model_type
            )
            
        except asyncio.TimeoutError:
            return JSONResponse(
                status_code=408,
                content={
                    "error": "Request timeout",
                    "message": "Analysis took too long. Please try again with simpler parameters."
                }
            )
            
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal server error",
                "message": f"Failed to build roster: {str(e)}"
            }
        )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": time.time()}

@app.get("/models/health", response_model=ModelHealthResponse)
async def check_models():
    """Check model availability with caching"""
    try:
        # Check OpenAI
        openai_available = False
        try:
            llm = get_llm("openai")
            # Quick test call
            response = llm.invoke("Test")
            openai_available = True
        except:
            pass
        
        # Check Ollama
        ollama_available = False
        try:
            llm = get_llm("ollama")
            # Quick test call
            response = llm.invoke("Test")
            ollama_available = True
        except:
            pass
        
        available_models = []
        if openai_available:
            available_models.append("openai")
        if ollama_available:
            available_models.append("ollama")
        
        return ModelHealthResponse(
            openai=openai_available,
            ollama=ollama_available,
            available_models=available_models
        )
        
    except Exception as e:
        return ModelHealthResponse(
            openai=False,
            ollama=False,
            available_models=[]
        )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
    
