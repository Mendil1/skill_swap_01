"use client";

import { ReactNode, useState, useCallback, memo } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';

type OptimizedLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  prefetch?: boolean;
  onClick?: () => void;
};

// Memoize the component to prevent unnecessary re-renders
const OptimizedLink = memo(function OptimizedLink({
  href,
  children,
  className = '',
  prefetch = true,
  onClick,
}: OptimizedLinkProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  // Use useCallback to memoize the click handler
  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    // Skip if already navigating
    if (isNavigating) return;
    
    // Only handle internal links
    if (href.startsWith('/')) {
      e.preventDefault();
      setIsNavigating(true);

      // Trigger navigation event for progress indicator
      const navigationEvent = new Event('navigationStart');
      document.dispatchEvent(navigationEvent);

      // Execute any additional onClick handler
      if (onClick) onClick();

      // Navigate programmatically with a small delay to allow UI updates
      setTimeout(() => {
        router.push(href);
      }, 10);
    } else if (onClick) {
      onClick();
    }
  }, [href, onClick, router, isNavigating]);

  return (
    <NextLink
      href={href}
      className={`${className} ${isNavigating ? 'pointer-events-none opacity-70' : ''}`}
      prefetch={prefetch}
      onClick={handleClick}
    >
      {children}
    </NextLink>
  );
});

export default OptimizedLink;
