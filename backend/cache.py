"""
Cache module for performance optimization
"""
import hashlib
import json
import time
from typing import Optional, Dict, Any
from functools import wraps

class SimpleCache:
    """Simple in-memory cache with TTL support"""
    
    def __init__(self, default_ttl: int = 300):  # 5 minutes default
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.default_ttl = default_ttl
    
    def _is_expired(self, entry: Dict[str, Any]) -> bool:
        """Check if cache entry is expired"""
        return time.time() > entry['expires_at']
    
    def _clean_expired(self):
        """Remove expired entries"""
        current_time = time.time()
        expired_keys = [
            key for key, value in self.cache.items() 
            if current_time > value['expires_at']
        ]
        for key in expired_keys:
            del self.cache[key]
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if key not in self.cache:
            return None
        
        entry = self.cache[key]
        if self._is_expired(entry):
            del self.cache[key]
            return None
        
        # Update access time for LRU-like behavior
        entry['last_accessed'] = time.time()
        return entry['value']
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Set value in cache"""
        ttl = ttl or self.default_ttl
        current_time = time.time()
        
        self.cache[key] = {
            'value': value,
            'created_at': current_time,
            'expires_at': current_time + ttl,
            'last_accessed': current_time
        }
        
        # Periodic cleanup
        if len(self.cache) % 100 == 0:
            self._clean_expired()
    
    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        if key in self.cache:
            del self.cache[key]
            return True
        return False
    
    def clear(self) -> None:
        """Clear all cache entries"""
        self.cache.clear()
    
    def size(self) -> int:
        """Get cache size"""
        return len(self.cache)

# Global cache instance
cache = SimpleCache()

def cache_key(*args, **kwargs) -> str:
    """Generate cache key from arguments"""
    key_data = {
        'args': args,
        'kwargs': sorted(kwargs.items())
    }
    key_str = json.dumps(key_data, sort_keys=True, default=str)
    return hashlib.md5(key_str.encode()).hexdigest()

def cached(ttl: int = 300):
    """Decorator for caching function results"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            key = f"{func.__name__}:{cache_key(*args, **kwargs)}"
            
            # Try to get from cache
            result = cache.get(key)
            if result is not None:
                return result
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            cache.set(key, result, ttl)
            return result
        
        return wrapper
    return decorator

def cache_roster_analysis(team: str, season: str, strategy: str, ttl: int = 600):
    """Specific caching for roster analysis"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            key = f"roster:{team}:{season}:{strategy}:{cache_key(*args, **kwargs)}"
            
            result = cache.get(key)
            if result is not None:
                return result
            
            result = func(*args, **kwargs)
            cache.set(key, result, ttl)
            return result
        
        return wrapper
    return decorator