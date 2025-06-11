/**
 * Performance Resource Manager
 * 
 * This component manages critical resource loading optimizations
 * including preloading, prefetching, and lazy loading strategies.
 */

"use client";

import { useEffect, useCallback, useMemo } from 'react';

interface ResourceConfig {
  enablePreload?: boolean;
  enablePrefetch?: boolean;
  enableLazyImages?: boolean;
  criticalResources?: string[];
  lowPriorityResources?: string[];
}

const DEFAULT_CONFIG: ResourceConfig = {
  enablePreload: true,
  enablePrefetch: true,
  enableLazyImages: true,
  criticalResources: [
    '/next.js', // Next.js runtime
    '/fonts', // Critical fonts
  ],
  lowPriorityResources: [
    '/images/background',
    '/images/decorative',
  ],
};

export function useResourceOptimization(config: ResourceConfig = {}) {
  const finalConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);

  const preloadCriticalResources = useCallback(() => {
    if (!finalConfig.enablePreload) return;

    finalConfig.criticalResources?.forEach((href) => {
      // Check if already preloaded
      const existing = document.querySelector(`link[rel="preload"][href*="${href}"]`);
      if (existing) return;

      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      
      // Determine resource type
      if (href.includes('font')) {
        link.as = 'font';
        link.crossOrigin = 'anonymous';
      } else if (href.includes('.css')) {
        link.as = 'style';
      } else if (href.includes('.js')) {
        link.as = 'script';
      } else if (href.includes('image') || href.match(/\.(jpg|jpeg|png|webp|svg)$/)) {
        link.as = 'image';
      }

      document.head.appendChild(link);
    });
  }, [finalConfig.enablePreload, finalConfig.criticalResources]);

  const prefetchLowPriorityResources = useCallback(() => {
    if (!finalConfig.enablePrefetch) return;

    // Use requestIdleCallback to prefetch when browser is idle
    const prefetchWhenIdle = () => {
      finalConfig.lowPriorityResources?.forEach((href) => {
        const existing = document.querySelector(`link[rel="prefetch"][href*="${href}"]`);
        if (existing) return;

        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = href;
        document.head.appendChild(link);
      });
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(prefetchWhenIdle, { timeout: 5000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(prefetchWhenIdle, 2000);
    }
  }, [finalConfig.enablePrefetch, finalConfig.lowPriorityResources]);

  const optimizeImages = useCallback(() => {
    if (!finalConfig.enableLazyImages) return;

    // Add intersection observer for lazy loading images
    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;
            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
        threshold: 0.1,
      }
    );

    // Observer all images with data-src attribute
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach((img) => imageObserver.observe(img));

    return () => {
      imageObserver.disconnect();
    };
  }, [finalConfig.enableLazyImages]);

  const preconnectToExternalDomains = useCallback(() => {
    const externalDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      // Add your external domains here
    ];

    externalDomains.forEach((domain) => {
      const existing = document.querySelector(`link[rel="preconnect"][href="${domain}"]`);
      if (existing) return;

      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }, []);

  useEffect(() => {
    // Run optimizations on mount
    preloadCriticalResources();
    preconnectToExternalDomains();
    
    // Defer non-critical optimizations
    const timeoutId = setTimeout(() => {
      prefetchLowPriorityResources();
      optimizeImages();
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [preloadCriticalResources, preconnectToExternalDomains, prefetchLowPriorityResources, optimizeImages]);

  return {
    preloadCriticalResources,
    prefetchLowPriorityResources,
    optimizeImages,
    preconnectToExternalDomains,
  };
}

// Performance Resource Manager Component
export default function PerformanceResourceManager({ 
  config = {} 
}: { 
  config?: ResourceConfig;
}) {
  useResourceOptimization(config);

  // This component doesn't render anything visible
  return null;
}
