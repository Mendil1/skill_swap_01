"use client";

import { useEffect, memo } from 'react';

interface ResourceHint {
  href: string;
  as?: 'script' | 'style' | 'image' | 'font' | 'fetch' | 'document';
  type?: string;
  crossorigin?: 'anonymous' | 'use-credentials';
  media?: string;
}

interface ResourceHintsProps {
  preload?: ResourceHint[];
  prefetch?: string[];
  preconnect?: string[];
  dnsPrefetch?: string[];
}

// Component for managing resource hints to improve performance
function ResourceHints({
  preload = [],
  prefetch = [],
  preconnect = [],
  dnsPrefetch = [],
}: ResourceHintsProps) {
  useEffect(() => {
    // Add preload hints
    preload.forEach((resource) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      if (resource.as) link.as = resource.as;
      if (resource.type) link.type = resource.type;
      if (resource.crossorigin) link.crossOrigin = resource.crossorigin;
      if (resource.media) link.media = resource.media;
      
      // Check if already exists
      const existing = document.querySelector(`link[rel="preload"][href="${resource.href}"]`);
      if (!existing) {
        document.head.appendChild(link);
      }
    });

    // Add prefetch hints
    prefetch.forEach((href) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      
      const existing = document.querySelector(`link[rel="prefetch"][href="${href}"]`);
      if (!existing) {
        document.head.appendChild(link);
      }
    });

    // Add preconnect hints
    preconnect.forEach((href) => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = href;
      
      const existing = document.querySelector(`link[rel="preconnect"][href="${href}"]`);
      if (!existing) {
        document.head.appendChild(link);
      }
    });

    // Add DNS prefetch hints
    dnsPrefetch.forEach((href) => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = href;
      
      const existing = document.querySelector(`link[rel="dns-prefetch"][href="${href}"]`);
      if (!existing) {
        document.head.appendChild(link);
      }
    });

    // Cleanup function to remove hints when component unmounts
    return () => {
      // Note: We don't remove hints on unmount as they might still be useful
      // This is intentional for performance reasons
    };
  }, [preload, prefetch, preconnect, dnsPrefetch]);

  return null; // This component doesn't render anything
}

// Predefined common resource hints for SkillSwap
export const CommonResourceHints = memo(() => {
  return (
    <ResourceHints
      preconnect={[
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'https://api.dicebear.com', // For avatar generation
      ]}
      dnsPrefetch={[
        'https://cdnjs.cloudflare.com',
        'https://unpkg.com',
      ]}
      preload={[
        {
          href: '/skill_swap_logo_no_background.png',
          as: 'image',
          type: 'image/png',
        },
        // Preload critical fonts
        {
          href: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
          as: 'font',
          type: 'font/woff2',
          crossorigin: 'anonymous',
        },
      ]}
      prefetch={[
        '/notifications',
        '/messages',
        '/profile',
        '/skills',
      ]}
    />
  );
});

CommonResourceHints.displayName = 'CommonResourceHints';

/**
 * Performance budget monitoring component for development
 */
export const PerformanceBudgetMonitor = memo(() => {
  useEffect(() => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
      return;
    }

    const checkPerformanceBudgets = () => {
      if (!('performance' in window)) return;

      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      // Performance budget thresholds (in milliseconds)
      const budgets = {
        domContentLoaded: 2000,
        firstPaint: 1500,
        firstContentfulPaint: 2500,
        loadComplete: 5000,
        jsHeapSize: 50 * 1024 * 1024, // 50MB
      };
      
      // Check DOMContentLoaded
      if (navigation.domContentLoadedEventEnd > budgets.domContentLoaded) {
        console.warn('⚠️ Performance Budget: DOMContentLoaded exceeded budget:', 
          `${navigation.domContentLoadedEventEnd.toFixed(0)}ms (budget: ${budgets.domContentLoaded}ms)`);
      }
      
      // Check Load Complete
      if (navigation.loadEventEnd > budgets.loadComplete) {
        console.warn('⚠️ Performance Budget: Load Complete exceeded budget:', 
          `${navigation.loadEventEnd.toFixed(0)}ms (budget: ${budgets.loadComplete}ms)`);
      }
      
      // Check paint metrics
      paint.forEach((entry) => {
        if (entry.name === 'first-paint' && entry.startTime > budgets.firstPaint) {
          console.warn('⚠️ Performance Budget: First Paint exceeded budget:', 
            `${entry.startTime.toFixed(0)}ms (budget: ${budgets.firstPaint}ms)`);
        }
        if (entry.name === 'first-contentful-paint' && entry.startTime > budgets.firstContentfulPaint) {
          console.warn('⚠️ Performance Budget: First Contentful Paint exceeded budget:', 
            `${entry.startTime.toFixed(0)}ms (budget: ${budgets.firstContentfulPaint}ms)`);
        }
      });
        // Check memory usage
      if ('memory' in performance) {
        const memory = (performance as Performance & { memory: { usedJSHeapSize: number } }).memory;
        if (memory.usedJSHeapSize > budgets.jsHeapSize) {
          console.warn('⚠️ Performance Budget: JS Heap Size exceeded budget:', 
            `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB (budget: ${budgets.jsHeapSize / 1024 / 1024}MB)`);
        }
      }

      // Monitor for long tasks
      if ('PerformanceObserver' in window) {
        try {
          const longTaskObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
              if (entry.duration > 50) { // Tasks longer than 50ms
                console.warn('⚠️ Performance Budget: Long Task detected:', 
                  `${entry.duration.toFixed(0)}ms - ${entry.name}`);
              }
            });
          });
          longTaskObserver.observe({ entryTypes: ['longtask'] });

          // Monitor LCP
          const lcpObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
              if (entry.startTime > 4000) { // LCP budget: 4s
                console.warn('⚠️ Performance Budget: Largest Contentful Paint exceeded budget:', 
                  `${entry.startTime.toFixed(0)}ms (budget: 4000ms)`);
              }
            });
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

          // Cleanup observers
          setTimeout(() => {
            longTaskObserver.disconnect();
            lcpObserver.disconnect();
          }, 30000); // Monitor for 30 seconds after load
        } catch {
          // Silently fail if PerformanceObserver APIs are not supported
        }
      }
    };

    // Run budget checks after page load
    if (document.readyState === 'complete') {
      setTimeout(checkPerformanceBudgets, 1000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(checkPerformanceBudgets, 1000);
      });
    }
  }, []);

  return null;
});

PerformanceBudgetMonitor.displayName = 'PerformanceBudgetMonitor';

export default memo(ResourceHints);
