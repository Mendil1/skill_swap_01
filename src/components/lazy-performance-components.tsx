/**
 * Lazy Performance Components
 *
 * This file provides lazy-loaded versions of performance components
 * to reduce initial bundle size and improve page load times.
 */

import { lazy, Suspense } from 'react';
import MemoryOptimizationWrapper from './memory-optimization-wrapper';

// Lazy load performance components only when needed
const NetworkMonitorWrapper = lazy(() => import('./network-monitor-wrapper'));
const PerformanceMonitorWrapper = lazy(() => import('./performance-monitor-wrapper'));
const ServiceWorkerRegistration = lazy(() => import('./service-worker-registration'));

// Fallback component for loading states
const PerformanceFallback = () => null;

// Optimized lazy wrapper for network monitoring
export const LazyNetworkMonitor = ({ userId }: { userId: string | undefined }) => {
  // Only load when user is authenticated
  if (!userId) return null;

  return (
    <Suspense fallback={<PerformanceFallback />}>
      <NetworkMonitorWrapper userId={userId} />
    </Suspense>
  );
};

// Optimized lazy wrapper for performance monitoring (dev only)
export const LazyPerformanceMonitor = () => {
  // Only load in development
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <Suspense fallback={<PerformanceFallback />}>
      <PerformanceMonitorWrapper />
    </Suspense>
  );
};

// Optimized lazy wrapper for service worker registration
export const LazyServiceWorker = () => {
  // Only load if service workers are supported
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;

  return (
    <Suspense fallback={<PerformanceFallback />}>
      <ServiceWorkerRegistration />
    </Suspense>
  );
};

// Optimized lazy wrapper for memory optimization
export const LazyMemoryOptimization = () => {
  // Only load in development or when explicitly enabled
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <Suspense fallback={<PerformanceFallback />}>
      <MemoryOptimizationWrapper config={{ debugMode: true }} />
    </Suspense>
  );
};

// Combined lazy performance suite
export const LazyPerformanceSuite = ({ userId }: { userId: string | undefined }) => {
  return (
    <>
      <LazyNetworkMonitor userId={userId} />
      <LazyPerformanceMonitor />
      <LazyServiceWorker />
      <LazyMemoryOptimization />
    </>
  );
};
