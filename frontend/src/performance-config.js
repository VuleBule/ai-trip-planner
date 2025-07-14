// Performance Configuration for WNBA Team Builder

export const PERFORMANCE_CONFIG = {
  // Bundle optimization
  bundle: {
    enableCodeSplitting: true,
    enableTreeShaking: true,
    enableCompression: true,
    maxBundleSize: 200, // KB
  },
  
  // Caching
  cache: {
    enableServiceWorker: true,
    cacheVersion: 'v1.0.0',
    maxCacheAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    cacheableResources: [
      '/static/js/',
      '/static/css/',
      '/static/media/',
      '/api/health',
    ],
  },
  
  // API optimization
  api: {
    timeout: 60000, // 60 seconds
    retryAttempts: 3,
    retryDelay: 1000,
    enableCaching: true,
    cacheDuration: 5 * 60 * 1000, // 5 minutes
  },
  
  // UI optimization
  ui: {
    enableLazyLoading: true,
    enableVirtualization: false, // Not needed for current data size
    enableDebouncing: true,
    debounceDelay: 300,
    enableThrottling: true,
    throttleDelay: 100,
  },
  
  // Animation optimization
  animations: {
    enableReducedMotion: true,
    maxAnimationDuration: 300,
    enableGPUAcceleration: true,
  },
  
  // Image optimization
  images: {
    enableLazyLoading: true,
    enableWebP: true,
    maxImageSize: 100, // KB
    enableCompression: true,
  },
};

// Performance monitoring
export const PERFORMANCE_METRICS = {
  // Core Web Vitals thresholds
  coreWebVitals: {
    lcp: 2500, // Largest Contentful Paint (ms)
    fid: 100,  // First Input Delay (ms)
    cls: 0.1,  // Cumulative Layout Shift
  },
  
  // Custom metrics
  custom: {
    timeToInteractive: 3500,
    bundleLoadTime: 2000,
    apiResponseTime: 3000,
  },
};

// Performance utilities
export const PerformanceUtils = {
  // Measure execution time
  measureTime: (name, fn) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${name} took ${end - start}ms`);
    return result;
  },
  
  // Debounce function
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  // Throttle function
  throttle: (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  
  // Check if user prefers reduced motion
  prefersReducedMotion: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },
  
  // Check if device is low-end
  isLowEndDevice: () => {
    const memory = navigator.deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    return memory < 4 || cores < 4;
  },
};

export default PERFORMANCE_CONFIG;