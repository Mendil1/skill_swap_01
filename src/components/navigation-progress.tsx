"use client";

import { useEffect, useState, useCallback, memo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Progress } from "@/components/ui/progress";

// Memoize the component to prevent unnecessary re-renders
export const NavigationProgress = memo(function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);

  // Reset state when navigation completes (route changes)
  useEffect(() => {
    // Set to complete when navigation completes
    setProgress(100);

    // Clean up progress after transition completes
    const timer = setTimeout(() => {
      setProgress(0);
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // Memoize the navigation start handler
  const handleNavigationStart = useCallback(() => {
    setProgress(20);

    // Simulate progress with fewer timer instances for better performance
    const timer = setTimeout(() => {
      setProgress(60);
      
      // Second stage of progress
      const timer2 = setTimeout(() => {
        setProgress(80);
      }, 200);
      
      return () => clearTimeout(timer2);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Listen for navigation start
  useEffect(() => {
    // Add event listeners for router events
    document.addEventListener('navigationStart', handleNavigationStart);

    return () => {
      document.removeEventListener('navigationStart', handleNavigationStart);
    };
  }, [handleNavigationStart]);

  // Only render when there's active progress
  if (progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <Progress 
        value={progress} 
        className="h-1 bg-transparent w-full"
        indicatorClassName="bg-indigo-600 transition-all duration-300 ease-in-out" 
      />
    </div>
  );
});
