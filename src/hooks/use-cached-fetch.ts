'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  staleTime: number;
  retryCount: number;
}

interface UseCachedFetchOptions {
  staleTime?: number; // How long data is considered fresh (ms)
  cacheTime?: number; // How long data stays in cache (ms)
  retryOnError?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  background?: boolean; // Allow background updates
  dedupe?: boolean; // Deduplicate identical requests
}

interface FetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isStale: boolean;
  isBackground: boolean;
}

// Global cache for storing fetched data
const globalCache = new Map<string, CacheEntry<any>>();
const activeRequests = new Map<string, Promise<any>>();

/**
 * Advanced caching hook for data fetching with SWR-like behavior
 */
export function useCachedFetch<T>(
  key: string | null,
  fetcher: (() => Promise<T>) | null,
  options: UseCachedFetchOptions = {}
): FetchState<T> & {
  mutate: (data?: T | ((prevData: T | null) => T)) => void;
  refetch: () => Promise<void>;
} {
  const {
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheTime = 10 * 60 * 1000, // 10 minutes
    retryOnError = true,
    maxRetries = 3,
    retryDelay = 1000,
    background = true,
    dedupe = true,
  } = options;

  const [state, setState] = useState<FetchState<T>>({
    data: null,
    isLoading: false,
    error: null,
    isStale: false,
    isBackground: false,
  });

  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Get cached data
  const getCachedData = useCallback((): CacheEntry<T> | null => {
    if (!key) return null;
    
    const cached = globalCache.get(key);
    if (!cached) return null;
    
    // Check if cache entry has expired
    const now = Date.now();
    if (now - cached.timestamp > cacheTime) {
      globalCache.delete(key);
      return null;
    }
    
    return cached;
  }, [key, cacheTime]);

  // Check if data is stale
  const isDataStale = useCallback((cached: CacheEntry<T> | null): boolean => {
    if (!cached) return true;
    
    const now = Date.now();
    return now - cached.timestamp > staleTime;
  }, [staleTime]);

  // Fetch data with error handling and retries
  const fetchData = useCallback(async (isBackgroundUpdate = false): Promise<void> => {
    if (!key || !fetcher || !mountedRef.current) return;

    // Check for duplicate requests
    if (dedupe && activeRequests.has(key)) {
      try {
        const result = await activeRequests.get(key);
        if (mountedRef.current) {
          setState(prev => ({ 
            ...prev, 
            data: result, 
            isLoading: false, 
            error: null,
            isBackground: false 
          }));
        }
        return;
      } catch (error) {
        if (mountedRef.current) {
          setState(prev => ({ 
            ...prev, 
            isLoading: false, 
            error: error as Error,
            isBackground: false 
          }));
        }
        return;
      }
    }

    // Update loading state
    if (mountedRef.current) {
      setState(prev => ({ 
        ...prev, 
        isLoading: !isBackgroundUpdate, 
        isBackground: isBackgroundUpdate,
        error: null 
      }));
    }

    const fetchPromise = (async () => {
      let lastError: Error | null = null;
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const result = await fetcher();
          
          // Cache the successful result
          const cacheEntry: CacheEntry<T> = {
            data: result,
            timestamp: Date.now(),
            staleTime,
            retryCount: 0,
          };
          globalCache.set(key, cacheEntry);
          
          if (mountedRef.current) {
            setState({
              data: result,
              isLoading: false,
              error: null,
              isStale: false,
              isBackground: false,
            });
          }
          
          return result;
        } catch (error) {
          lastError = error as Error;
          
          // Don't retry on the last attempt
          if (attempt < maxRetries && retryOnError) {
            await new Promise(resolve => 
              setTimeout(resolve, retryDelay * Math.pow(2, attempt))
            );
          }
        }
      }
      
      throw lastError;
    })();

    // Track active request
    if (dedupe) {
      activeRequests.set(key, fetchPromise);
    }

    try {
      await fetchPromise;
    } catch (error) {
      if (mountedRef.current) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: error as Error,
          isBackground: false 
        }));
      }
    } finally {
      // Clean up active request tracking
      if (dedupe) {
        activeRequests.delete(key);
      }
    }
  }, [key, fetcher, maxRetries, retryDelay, retryOnError, staleTime, dedupe]);

  // Mutate data manually
  const mutate = useCallback((
    data?: T | ((prevData: T | null) => T)
  ) => {
    if (!key) return;

    if (typeof data === 'function') {
      const updater = data as (prevData: T | null) => T;
      const currentData = state.data;
      const newData = updater(currentData);
      
      // Update cache
      const cacheEntry: CacheEntry<T> = {
        data: newData,
        timestamp: Date.now(),
        staleTime,
        retryCount: 0,
      };
      globalCache.set(key, cacheEntry);
      
      // Update state
      if (mountedRef.current) {
        setState(prev => ({ ...prev, data: newData, isStale: false }));
      }
    } else if (data !== undefined) {
      // Update cache
      const cacheEntry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        staleTime,
        retryCount: 0,
      };
      globalCache.set(key, cacheEntry);
      
      // Update state
      if (mountedRef.current) {
        setState(prev => ({ ...prev, data, isStale: false }));
      }
    }
  }, [key, state.data, staleTime]);

  // Force refetch
  const refetch = useCallback(async (): Promise<void> => {
    if (key) {
      globalCache.delete(key); // Clear cache
      await fetchData(false);
    }
  }, [key, fetchData]);

  // Main effect for data fetching
  useEffect(() => {
    if (!key || !fetcher) {
      setState({
        data: null,
        isLoading: false,
        error: null,
        isStale: false,
        isBackground: false,
      });
      return;
    }

    const cached = getCachedData();
    
    if (cached) {
      // We have cached data
      const stale = isDataStale(cached);
      
      setState({
        data: cached.data,
        isLoading: false,
        error: null,
        isStale: stale,
        isBackground: false,
      });
      
      // If data is stale and background updates are enabled, fetch fresh data
      if (stale && background) {
        fetchData(true);
      }
    } else {
      // No cached data, fetch immediately
      fetchData(false);
    }
  }, [key, fetcher, getCachedData, isDataStale, background, fetchData]);

  return {
    ...state,
    mutate,
    refetch,
  };
}

/**
 * Hook for prefetching data to improve perceived performance
 */
export function usePrefetch() {
  const prefetch = useCallback(async <T>(
    key: string,
    fetcher: () => Promise<T>,
    options: Pick<UseCachedFetchOptions, 'staleTime' | 'cacheTime'> = {}
  ): Promise<void> => {
    const { staleTime = 5 * 60 * 1000, cacheTime = 10 * 60 * 1000 } = options;
    
    // Check if we already have fresh data
    const cached = globalCache.get(key);
    if (cached) {
      const now = Date.now();
      const isStale = now - cached.timestamp > staleTime;
      const isExpired = now - cached.timestamp > cacheTime;
      
      if (!isStale && !isExpired) {
        return; // Data is fresh, no need to prefetch
      }
    }
    
    // Avoid duplicate prefetch requests
    if (activeRequests.has(key)) {
      return;
    }
    
    try {
      const fetchPromise = fetcher();
      activeRequests.set(key, fetchPromise);
      
      const result = await fetchPromise;
      
      // Cache the result
      const cacheEntry: CacheEntry<T> = {
        data: result,
        timestamp: Date.now(),
        staleTime,
        retryCount: 0,
      };
      globalCache.set(key, cacheEntry);
    } catch (error) {
      // Silently fail for prefetch requests
      console.warn('Prefetch failed for key:', key, error);
    } finally {
      activeRequests.delete(key);
    }
  }, []);

  return { prefetch };
}

/**
 * Hook for managing cache invalidation and cleanup
 */
export function useCacheManager() {
  const invalidateCache = useCallback((keyPattern?: string) => {
    if (keyPattern) {
      // Invalidate keys matching pattern
      const regex = new RegExp(keyPattern);
      for (const key of globalCache.keys()) {
        if (regex.test(key)) {
          globalCache.delete(key);
        }
      }
    } else {
      // Clear entire cache
      globalCache.clear();
    }
  }, []);

  const getCacheSize = useCallback(() => {
    let totalSize = 0;
    for (const entry of globalCache.values()) {
      totalSize += JSON.stringify(entry.data).length;
    }
    return totalSize;
  }, []);

  const getCacheStats = useCallback(() => {
    const stats = {
      entries: globalCache.size,
      totalSize: getCacheSize(),
      keys: Array.from(globalCache.keys()),
    };
    return stats;
  }, [getCacheSize]);

  return {
    invalidateCache,
    getCacheSize,
    getCacheStats,
  };
}
