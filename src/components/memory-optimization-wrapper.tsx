/**
 * Memory Optimization Wrapper
 * 
 * This component provides memory monitoring and cleanup utilities
 * to optimize memory usage across the application.
 */

"use client";

import { useEffect, useCallback, useRef } from 'react';

interface MemoryOptimizationConfig {
  enableInProduction?: boolean;
  monitorInterval?: number;
  cleanupThreshold?: number;
  debugMode?: boolean;
}

interface MemoryMetrics {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  utilizationPercent: number;
}

const DEFAULT_CONFIG: MemoryOptimizationConfig = {
  enableInProduction: false,
  monitorInterval: 30000, // 30 seconds
  cleanupThreshold: 75, // Cleanup when memory usage exceeds 75%
  debugMode: false,
};

export function useMemoryOptimization(config: MemoryOptimizationConfig = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCleanupRef = useRef<number>(0);

  const getMemoryMetrics = useCallback((): MemoryMetrics | null => {
    if (typeof window === 'undefined' || !window.performance || !(window.performance as any).memory) {
      return null;
    }

    const memory = (window.performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      utilizationPercent: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
    };
  }, []);

  const performGarbageCollection = useCallback(() => {
    // Force garbage collection if available (Chrome DevTools)
    if (typeof window !== 'undefined' && (window as any).gc) {
      try {
        (window as any).gc();
        if (finalConfig.debugMode) {
          console.log('[MemoryOptimization] Manual garbage collection triggered');
        }
      } catch (error) {
        if (finalConfig.debugMode) {
          console.warn('[MemoryOptimization] Manual GC failed:', error);
        }
      }
    }
  }, [finalConfig.debugMode]);

  const cleanupMemory = useCallback(() => {
    const now = Date.now();
    
    // Prevent too frequent cleanups (minimum 30 seconds between cleanups)
    if (now - lastCleanupRef.current < 30000) {
      return;
    }

    const metrics = getMemoryMetrics();
    if (!metrics) return;

    if (metrics.utilizationPercent > finalConfig.cleanupThreshold!) {
      if (finalConfig.debugMode) {
        console.log(`[MemoryOptimization] Memory usage high (${metrics.utilizationPercent.toFixed(1)}%), performing cleanup`);
      }

      // Clear various caches and unused data
      try {
        // Clear any image caches
        if (typeof window !== 'undefined' && 'caches' in window) {
          window.caches.keys().then(cacheNames => {
            cacheNames.forEach(cacheName => {
              if (cacheName.includes('image') || cacheName.includes('temp')) {
                window.caches.delete(cacheName);
              }
            });
          });
        }

        // Clear localStorage of temporary data
        if (typeof window !== 'undefined' && window.localStorage) {
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('temp_') || key.includes('cache_'))) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));
        }

        // Trigger manual garbage collection
        performGarbageCollection();

        lastCleanupRef.current = now;
      } catch (error) {
        if (finalConfig.debugMode) {
          console.error('[MemoryOptimization] Cleanup error:', error);
        }
      }
    }
  }, [finalConfig.cleanupThreshold, finalConfig.debugMode, getMemoryMetrics, performGarbageCollection]);

  const monitorMemory = useCallback(() => {
    const metrics = getMemoryMetrics();
    if (!metrics) return;

    if (finalConfig.debugMode) {
      console.log('[MemoryOptimization] Memory metrics:', {
        used: `${(metrics.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        total: `${(metrics.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(metrics.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`,
        utilization: `${metrics.utilizationPercent.toFixed(1)}%`,
      });
    }

    // Perform cleanup if needed
    cleanupMemory();
  }, [getMemoryMetrics, cleanupMemory, finalConfig.debugMode]);

  useEffect(() => {
    // Only enable memory monitoring in development or if explicitly enabled for production
    const shouldMonitor = process.env.NODE_ENV === 'development' || finalConfig.enableInProduction;
    
    if (!shouldMonitor) return;

    // Start monitoring
    intervalRef.current = setInterval(monitorMemory, finalConfig.monitorInterval);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [monitorMemory, finalConfig.enableInProduction, finalConfig.monitorInterval]);

  return {
    getMemoryMetrics,
    cleanupMemory,
    performGarbageCollection,
  };
}

// Memory Optimization Wrapper Component
export default function MemoryOptimizationWrapper({ 
  children, 
  config = {} 
}: { 
  children?: React.ReactNode;
  config?: MemoryOptimizationConfig;
}) {
  useMemoryOptimization(config);

  // This component doesn't render anything visible, just manages memory
  return children || null;
}
