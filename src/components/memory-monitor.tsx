"use client";

import React, { useState, useEffect, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MemoryStick,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface MemoryStats {
  current: MemoryInfo;
  trend: 'up' | 'down' | 'stable';
  warningLevel: 'low' | 'medium' | 'high';
  timestamp: number;
}

// Format bytes to human readable format
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Calculate memory usage percentage
const getUsagePercentage = (used: number, total: number): number => {
  return Math.round((used / total) * 100);
};

// Determine warning level based on usage
const getWarningLevel = (percentage: number): 'low' | 'medium' | 'high' => {
  if (percentage < 60) return 'low';
  if (percentage < 80) return 'medium';
  return 'high';
};

// Memory usage monitoring component
function MemoryMonitor() {
  const [memoryStats, setMemoryStats] = useState<MemoryStats | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [history, setHistory] = useState<MemoryInfo[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Check if memory API is supported
  useEffect(() => {
    const supported = 'memory' in performance &&
                     typeof (performance as any).memory === 'object';
    setIsSupported(supported);
  }, []);

  // Collect memory statistics
  const collectMemoryStats = useCallback(() => {
    if (!isSupported) return;

    const memory = (performance as any).memory as MemoryInfo;
    const usagePercentage = getUsagePercentage(memory.usedJSHeapSize, memory.totalJSHeapSize);

    // Determine trend
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (history.length > 0) {
      const lastUsage = history[history.length - 1].usedJSHeapSize;
      const currentUsage = memory.usedJSHeapSize;
      const difference = Math.abs(currentUsage - lastUsage);
      const threshold = memory.totalJSHeapSize * 0.01; // 1% threshold

      if (difference > threshold) {
        trend = currentUsage > lastUsage ? 'up' : 'down';
      }
    }

    const stats: MemoryStats = {
      current: memory,
      trend,
      warningLevel: getWarningLevel(usagePercentage),
      timestamp: Date.now(),
    };

    setMemoryStats(stats);

    // Update history (keep last 20 readings)
    setHistory(prev => [...prev.slice(-19), memory]);
  }, [isSupported, history]);

  // Force garbage collection (if available)
  const forceGC = useCallback(() => {
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
      setTimeout(collectMemoryStats, 100); // Collect stats after GC
    } else {
      // Fallback: try to trigger GC through memory pressure
      const arrays = [];
      try {
        for (let i = 0; i < 100; i++) {
          arrays.push(new Array(1000000).fill(0));
        }
      } catch (e) {
        // Memory pressure created, now release
      }
      arrays.length = 0;
      setTimeout(collectMemoryStats, 100);
    }
  }, [collectMemoryStats]);

  // Set up periodic monitoring
  useEffect(() => {
    if (!isSupported) return;

    collectMemoryStats();
    const interval = setInterval(collectMemoryStats, 5000); // Every 5 seconds

    return () => clearInterval(interval);
  }, [isSupported, collectMemoryStats]);

  // Keyboard shortcut to toggle visibility (Ctrl+Shift+M)
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  if (!isSupported) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MemoryStick className="h-5 w-5" />
            Memory Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Memory monitoring is not supported in this browser.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50"
        title="Show Memory Monitor (Ctrl+Shift+M)"
      >
        <MemoryStick className="h-4 w-4" />
      </Button>
    );
  }

  if (!memoryStats) {
    return (
      <Card className="fixed bottom-4 right-4 w-80 z-50">
        <CardContent className="p-4">
          <p className="text-sm">Collecting memory statistics...</p>
        </CardContent>
      </Card>
    );
  }

  const { current, trend, warningLevel } = memoryStats;
  const usagePercentage = getUsagePercentage(current.usedJSHeapSize, current.totalJSHeapSize);

  const warningColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  const trendIcons = {
    up: <TrendingUp className="h-4 w-4 text-red-500" />,
    down: <TrendingDown className="h-4 w-4 text-green-500" />,
    stable: <div className="h-4 w-4" />,
  };

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <MemoryStick className="h-4 w-4" />
            Memory Monitor
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Usage:</span>
          <div className="flex items-center gap-2">
            <Badge className={warningColors[warningLevel]}>
              {usagePercentage}%
            </Badge>
            {trendIcons[trend]}
          </div>
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Used:</span>
            <span>{formatBytes(current.usedJSHeapSize)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total:</span>
            <span>{formatBytes(current.totalJSHeapSize)}</span>
          </div>
          <div className="flex justify-between">
            <span>Limit:</span>
            <span>{formatBytes(current.jsHeapSizeLimit)}</span>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              warningLevel === 'low' ? 'bg-green-500' :
              warningLevel === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${usagePercentage}%` }}
          />
        </div>

        {warningLevel === 'high' && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertTriangle className="h-4 w-4" />
            <span>High memory usage detected</span>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={collectMemoryStats}
            className="flex-1"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={forceGC}
            className="flex-1"
            title="Force garbage collection"
          >
            🗑️ GC
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          Press Ctrl+Shift+M to toggle
        </div>
      </CardContent>
    </Card>
  );
}

export default memo(MemoryMonitor);
