#!/usr/bin/env python3
"""
Synthetic WNBA Roster Builder Generator
Generates multiple roster building requests with diverse synthetic data to test the API
"""

import requests
import json
import time
import random
from datetime import datetime
import os

# API Configuration
API_BASE_URL = "http://localhost:8000"
BUILD_ROSTER_ENDPOINT = f"{API_BASE_URL}/build-roster"

# Synthetic Data Sets for WNBA Teams
WNBA_TEAMS = [
    "Las Vegas Aces",
    "New York Liberty", 
    "Connecticut Sun",
    "Washington Mystics",
    "Chicago Sky",
    "Indiana Fever",
    "Minnesota Lynx",
    "Phoenix Mercury",
    "Seattle Storm",
    "Dallas Wings",
    "Atlanta Dream",
    "Los Angeles Sparks"
]

SEASONS = [
    "2025",
    "2026",
    "2027"
]

STRATEGIES = [
    "championship",
    "rebuild", 
    "retool",
    "contend",
    "develop",
    "win-now",
    "youth movement",
    "veteran leadership",
    "defensive focus",
    "offensive firepower",
    "balanced approach",
    "high-tempo",
    "defensive-minded",
    "three-point shooting",
    "inside-out game"
]

PRIORITIES = [
    "leadership",
    "scoring",
    "defense",
    "rebounding",
    "playmaking",
    "three-point shooting",
    "interior presence",
    "perimeter defense",
    "bench depth",
    "veteran experience",
    "youth development",
    "chemistry",
    "versatility",
    "athleticism",
    "basketball IQ",
    "clutch performance",
    "team culture",
    "injury prevention",
    "salary cap flexibility",
    "future assets"
]

CAP_TARGETS = [
    "aggressive spending",
    "conservative approach",
    "flexible cap space",
    "max contracts",
    "mid-level exceptions",
    "veteran minimums",
    "rookie scale contracts",
    "balanced spending",
    "under the cap",
    "over the cap",
    "luxury tax avoidance",
    "championship investment",
    "developmental focus",
    "win-now spending",
    "future planning"
]

def generate_synthetic_roster_requests(num_requests=15):
    """Generate synthetic WNBA roster building requests"""
    requests_data = []
    
    for i in range(num_requests):
        # Select random combinations
        team = random.choice(WNBA_TEAMS)
        season = random.choice(SEASONS)
        strategy = random.choice(STRATEGIES)
        
        # Generate 1-3 random priorities (30% chance of no priorities)
        priorities = random.sample(PRIORITIES, random.randint(1, 3)) if random.random() > 0.3 else []
        
        # 40% chance of having a cap target
        cap_target = random.choice(CAP_TARGETS) if random.random() > 0.4 else None
        
        request_data = {
            "team": team,
            "season": season,
            "strategy": strategy,
            "priorities": priorities,
            "cap_target": cap_target
        }
        
        # Clean up None values
        request_data = {k: v for k, v in request_data.items() if v is not None}
        
        requests_data.append({
            "id": i + 1,
            "request": request_data,
            "timestamp": datetime.now().isoformat()
        })
    
    return requests_data

def make_roster_request(request_data, request_id):
    """Make a single roster building request"""
    print(f"\n🏀 Request #{request_id}: Building roster for {request_data['team']}")
    print(f"   Season: {request_data['season']}")
    print(f"   Strategy: {request_data['strategy']}")
    print(f"   Priorities: {request_data.get('priorities', 'None')}")
    print(f"   Cap Target: {request_data.get('cap_target', 'Not specified')}")
    
    try:
        start_time = time.time()
        response = requests.post(BUILD_ROSTER_ENDPOINT, json=request_data, timeout=120)
        end_time = time.time()
        
        duration = end_time - start_time
        
        if response.status_code == 200:
            result = response.json()
            roster_length = len(result.get('result', ''))
            print(f"   ✅ Success! ({duration:.1f}s) - Generated {roster_length} characters")
            return {
                "success": True,
                "duration": duration,
                "roster_length": roster_length,
                "result": result.get('result', ''),
                "agent_type": result.get('agent_type', ''),
                "error": None
            }
        else:
            print(f"   ❌ Failed! Status {response.status_code}: {response.text}")
            return {
                "success": False,
                "duration": duration,
                "roster_length": 0,
                "result": None,
                "agent_type": None,
                "error": f"HTTP {response.status_code}: {response.text}"
            }
            
    except requests.exceptions.Timeout:
        print(f"   ⏰ Request timed out after 120 seconds")
        return {
            "success": False,
            "duration": 120,
            "roster_length": 0,
            "result": None,
            "agent_type": None,
            "error": "Request timeout"
        }
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        return {
            "success": False,
            "duration": 0,
            "roster_length": 0,
            "result": None,
            "agent_type": None,
            "error": str(e)
        }

def save_results(results, filename="roster_builder_results.json"):
    """Save results to a JSON file"""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"\n💾 Results saved to {filename}")

def print_summary(results):
    """Print a summary of the test results"""
    total_requests = len(results)
    successful_requests = sum(1 for r in results if r['response']['success'])
    failed_requests = total_requests - successful_requests
    
    total_duration = sum(r['response']['duration'] for r in results)
    avg_duration = total_duration / total_requests if total_requests > 0 else 0
    
    total_characters = sum(r['response']['roster_length'] for r in results if r['response']['success'])
    avg_characters = total_characters / successful_requests if successful_requests > 0 else 0
    
    # Team distribution
    team_counts = {}
    strategy_counts = {}
    for r in results:
        team = r['request']['team']
        strategy = r['request']['strategy']
        team_counts[team] = team_counts.get(team, 0) + 1
        strategy_counts[strategy] = strategy_counts.get(strategy, 0) + 1
    
    print(f"\n📊 WNBA ROSTER BUILDER SUMMARY")
    print(f"=" * 60)
    print(f"Total Requests: {total_requests}")
    print(f"Successful: {successful_requests}")
    print(f"Failed: {failed_requests}")
    print(f"Success Rate: {(successful_requests/total_requests)*100:.1f}%")
    print(f"Average Duration: {avg_duration:.1f} seconds")
    print(f"Total Characters Generated: {total_characters:,}")
    print(f"Average Characters per Roster: {avg_characters:,.0f}")
    print(f"Total Test Duration: {total_duration:.1f} seconds")
    
    print(f"\n🏀 TEAM DISTRIBUTION:")
    for team, count in sorted(team_counts.items()):
        print(f"   {team}: {count} requests")
    
    print(f"\n🎯 STRATEGY DISTRIBUTION:")
    for strategy, count in sorted(strategy_counts.items()):
        print(f"   {strategy}: {count} requests")

def main():
    """Main execution function"""
    print("🏀 WNBA Roster Builder - Synthetic Data Generator")
    print("=" * 60)
    
    # Check if server is running
    try:
        health_response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        if health_response.status_code != 200:
            print("❌ Server health check failed!")
            return
        print("✅ Server is running")
    except Exception as e:
        print(f"❌ Cannot connect to server: {str(e)}")
        print("Make sure the backend is running on http://localhost:8000")
        return
    
    # Generate synthetic requests
    print(f"\n🎲 Generating 15 synthetic roster building requests...")
    synthetic_requests = generate_synthetic_roster_requests(15)
    
    # Execute requests
    results = []
    for req_data in synthetic_requests:
        response = make_roster_request(req_data['request'], req_data['id'])
        
        results.append({
            "id": req_data['id'],
            "request": req_data['request'],
            "timestamp": req_data['timestamp'],
            "response": response
        })
        
        # Add a small delay between requests to be nice to the server
        time.sleep(2)
    
    # Save and summarize results
    save_results(results)
    print_summary(results)
    
    # Print some example successful rosters
    successful_results = [r for r in results if r['response']['success']]
    if successful_results:
        print(f"\n🎯 SAMPLE SUCCESSFUL ROSTER ANALYSES")
        print("=" * 60)
        for i, result in enumerate(successful_results[:3]):  # Show first 3
            req = result['request']
            roster = result['response']['result'][:500] + "..." if len(result['response']['result']) > 500 else result['response']['result']
            print(f"\n{i+1}. {req['team']} ({req['season']}) - {req['strategy']}")
            print(f"   Priorities: {req.get('priorities', 'None')}")
            print(f"   Cap Target: {req.get('cap_target', 'Not specified')}")
            print(f"   Preview: {roster}")
            print("-" * 40)

if __name__ == "__main__":
    main() 