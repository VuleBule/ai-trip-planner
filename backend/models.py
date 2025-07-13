"""
Model Factory for WNBA Roster Builder
Handles model selection between OpenAI and Ollama
"""

from langchain_openai import ChatOpenAI
from langchain_community.llms import Ollama
from langchain_core.language_models.chat_models import BaseChatModel
import os
import requests
from typing import Dict, List

class ModelFactory:
    """Factory class for creating LLM instances based on model type"""
    
    @staticmethod
    def get_llm(model_type: str = "openai") -> BaseChatModel:
        """
        Get LLM instance based on model type
        
        Args:
            model_type: "openai" or "ollama"
            
        Returns:
            BaseChatModel instance
        """
        if model_type == "ollama":
            return Ollama(
                model="llama3:latest",  # Using existing model on host
                base_url="http://localhost:11434",
                temperature=0,
                timeout=120  # Longer timeout for local model
            )
        else:
            return ChatOpenAI(
                api_key=os.getenv("OPENAI_API_KEY"),
                model="gpt-4o-mini",
                temperature=0,
                max_tokens=2000,
                timeout=30
            )
    
    @staticmethod
    def check_ollama_health() -> bool:
        """
        Check if Ollama is running and accessible
        
        Returns:
            bool: True if Ollama is healthy, False otherwise
        """
        try:
            response = requests.get("http://localhost:11434/api/tags", timeout=5)
            return response.status_code == 200
        except Exception:
            return False
    
    @staticmethod
    def check_openai_health() -> bool:
        """
        Check if OpenAI API key is configured
        
        Returns:
            bool: True if OpenAI key is set, False otherwise
        """
        return bool(os.getenv("OPENAI_API_KEY"))
    
    @staticmethod
    def get_available_models() -> Dict[str, bool]:
        """
        Get status of all available models
        
        Returns:
            Dict with model status
        """
        return {
            "openai": ModelFactory.check_openai_health(),
            "ollama": ModelFactory.check_ollama_health()
        }
    
    @staticmethod
    def get_ollama_models() -> List[str]:
        """
        Get list of available Ollama models
        
        Returns:
            List of model names
        """
        try:
            response = requests.get("http://localhost:11434/api/tags", timeout=5)
            if response.status_code == 200:
                data = response.json()
                return [model["name"] for model in data.get("models", [])]
            return []
        except Exception:
            return [] 