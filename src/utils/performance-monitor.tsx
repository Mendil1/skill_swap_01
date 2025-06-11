"use client";

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
  longTasks: { duration: number; startTime: number }[];
  resourceLoads: { name: string; duration: number; size: number }[];
}

/**
 * Enhanced performance monitoring utility for Next.js application
 * Logs performance metrics to help identify bottlenecks and collects
 * Web Vitals for analysis
 */
export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    longTasks: [],
    resourceLoads: []
  });

  useEffect(() => {
    // Only run in development mode
    if (process.env.NODE_ENV !== 'development') return;

    // Save metrics to localStorage for persistence between page loads
    const saveMetrics = () => {
      if (metrics.lcp || metrics.longTasks.length) {
        localStorage.setItem('performance_metrics', JSON.stringify({
          ...metrics,
          timestamp: new Date().toISOString(),
          url: window.location.pathname
        }));
      }
    };

    // Check if the browser supports the Performance API
    if (typeof window !== 'undefined' && 'performance' in window && 'PerformanceObserver' in window) {
      // Create a PerformanceObserver to monitor long tasks
      const longTaskObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const newLongTasks = entries.map(entry => ({
          duration: Math.round(entry.duration),
          startTime: Math.round(entry.startTime)
        }));
        
        setMetrics(prev => ({
          ...prev,
          longTasks: [...prev.longTasks, ...newLongTasks]
        }));
        
        entries.forEach((entry) => {
          console.warn(`Long task detected: ${Math.round(entry.duration)}ms at ${Math.round(entry.startTime)}ms`, entry);
        });
      });

      // Start observing long tasks
      longTaskObserver.observe({ entryTypes: ['longtask'] });

      // Create a PerformanceObserver to monitor layout shifts (CLS)
      const layoutShiftObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        list.getEntries().forEach((entry) => {
          // Check if this is a layout shift entry
          if (entry.entryType === 'layout-shift' && 'value' in entry) {
            const layoutShiftEntry = entry as PerformanceEntry & { value: number };
            // Only log significant shifts
            if (layoutShiftEntry.value > 0.01) {
              clsValue += layoutShiftEntry.value;
              console.warn(`Layout shift detected: ${layoutShiftEntry.value.toFixed(4)}`, entry);
            }
          }
        });
        
        setMetrics(prev => ({
          ...prev,
          cls: parseFloat((prev.cls || 0 + clsValue).toFixed(4))
        }));
      });

      // Start observing layout shifts
      if ('layout-shift' in PerformanceObserver.supportedEntryTypes) {
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
      }

      // Create a PerformanceObserver to monitor largest contentful paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        const lcpTime = Math.round(lastEntry.startTime);
        
        setMetrics(prev => ({
          ...prev,
          lcp: lcpTime
        }));
        
        console.info(`Largest Contentful Paint: ${lcpTime}ms`);
      });

      // Start observing LCP
      if ('largest-contentful-paint' in PerformanceObserver.supportedEntryTypes) {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      }

      // Create a PerformanceObserver to monitor first input delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const firstInput = list.getEntries()[0];
        if (firstInput && 'processingStart' in firstInput) {
          const fidEntry = firstInput as PerformanceEntry & { processingStart: number };
          const fidTime = Math.round(fidEntry.processingStart - firstInput.startTime);
          
          setMetrics(prev => ({
            ...prev,
            fid: fidTime
          }));
          
          console.info(`First Input Delay: ${fidTime}ms`);
        }
      });

      // Start observing FID
      if ('first-input' in PerformanceObserver.supportedEntryTypes) {
        fidObserver.observe({ entryTypes: ['first-input'] });
      }

      // Monitor resource timing for slow resource loads
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const significantEntries = entries
          .filter(entry => entry.duration > 500) // Only track slow resources
          .map(entry => ({
            name: entry.name.split('/').pop() || entry.name,
            duration: Math.round(entry.duration),
            size: (entry as any).transferSize || 0
          }));
          
        if (significantEntries.length) {
          setMetrics(prev => ({
            ...prev,
            resourceLoads: [...prev.resourceLoads, ...significantEntries]
          }));
          
          significantEntries.forEach(entry => {
            console.warn(`Slow resource load: ${entry.name} - ${entry.duration}ms, size: ${Math.round(entry.size / 1024)}KB`);
          });
        }
      });
      
      // Start observing resource timing
      resourceObserver.observe({ entryTypes: ['resource'] });

      // Calculate TTFB from navigation timing
      const calculateTTFB = () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          const ttfb = Math.round(navigation.responseStart - navigation.requestStart);
          
          setMetrics(prev => ({
            ...prev,
            ttfb
          }));
          
          console.info(`Time to First Byte: ${ttfb}ms`);
        }
      };
      
      // Calculate TTFB after a short delay to ensure navigation data is available
      setTimeout(calculateTTFB, 1000);

      // Save metrics before page unload
      window.addEventListener('beforeunload', saveMetrics);

      // Clean up observers when component unmounts
      return () => {
        longTaskObserver.disconnect();
        layoutShiftObserver.disconnect();
        lcpObserver.disconnect();
        fidObserver.disconnect();
        resourceObserver.disconnect();
        window.removeEventListener('beforeunload', saveMetrics);
        saveMetrics();
      };
    }
  }, [metrics]);

  // This component doesn't render anything
  return null;
}
