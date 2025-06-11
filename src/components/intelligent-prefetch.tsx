'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Simple user hook - replace with your actual implementation
function useUser() {
  // This is a placeholder - replace with your actual user hook
  return { user: null };
}

/**
 * Intelligent prefetching component that preloads likely navigation paths
 * based on user behavior patterns and authentication state
 */
export function IntelligentPrefetch() {
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    // Only prefetch in browsers that support it
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    const prefetchPages = () => {
      // Common paths that users are likely to visit
      const commonPaths = [
        '/skills',
        '/messages',
        '/profile',
        '/notifications'
      ];

      // Authenticated user paths
      const authenticatedPaths = user ? [
        '/profile',
        '/messages',
        '/notifications',
        '/skills/create'
      ] : [];

      // Guest user paths
      const guestPaths = !user ? [
        '/login',
        '/register',
        '/skills'
      ] : [];

      const pathsToPrefetch = [
        ...commonPaths,
        ...(user ? authenticatedPaths : guestPaths)
      ];

      // Prefetch with a slight delay to avoid blocking critical resources
      setTimeout(() => {
        pathsToPrefetch.forEach((path, index) => {
          setTimeout(() => {
            router.prefetch(path);
          }, index * 100); // Stagger prefetch requests
        });
      }, 2000);
    };

    // Prefetch when the page becomes idle
    if ('requestIdleCallback' in window) {
      requestIdleCallback(prefetchPages, { timeout: 5000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(prefetchPages, 3000);
    }
  }, [router, user]);

  // This component doesn't render anything
  return null;
}

/**
 * Hook for intelligent link prefetching based on user interactions
 */
export function useIntelligentLinkPrefetch() {
  const router = useRouter();

  const prefetchOnHover = (href: string) => {
    // Prefetch the page when user hovers over a link
    router.prefetch(href);
  };

  const prefetchOnFocus = (href: string) => {
    // Prefetch when link receives focus (keyboard navigation)
    router.prefetch(href);
  };

  return {
    prefetchOnHover,
    prefetchOnFocus
  };
}

/**
 * Enhanced Link component with intelligent prefetching
 */
interface IntelligentLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  prefetchOnHover?: boolean;
  prefetchOnFocus?: boolean;
  [key: string]: unknown;
}

export function IntelligentLink({
  href,
  children,
  className,
  prefetchOnHover = true,
  prefetchOnFocus = true,
  ...props
}: IntelligentLinkProps) {
  const { prefetchOnHover: handleHover, prefetchOnFocus: handleFocus } = useIntelligentLinkPrefetch();

  const handleMouseEnter = () => {
    if (prefetchOnHover) {
      handleHover(href);
    }
  };

  const handleFocusEvent = () => {
    if (prefetchOnFocus) {
      handleFocus(href);
    }
  };

  return (
    <a
      href={href}
      className={className}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocusEvent}
      {...props}
    >
      {children}
    </a>
  );
}
