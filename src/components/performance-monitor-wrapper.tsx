"use client";

import { useState, useEffect } from 'react';
import PerformanceMonitor from '@/utils/performance-monitor';

interface PerformanceMetrics {
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
  longTasks: { duration: number; startTime: number }[];
  resourceLoads: { name: string; duration: number; size: number }[];
  timestamp: string;
  url: string;
}

// This wrapper only initializes the performance monitor in development
// and provides a minimal UI for developers to see performance issues
export default function PerformanceMonitorWrapper() {
  const [isDev, setIsDev] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  
  useEffect(() => {
    // Check if we're in development mode
    if (typeof process !== 'undefined' && process.env.NODE_ENV) {
      setIsDev(process.env.NODE_ENV === 'development');
    }
    
    // Only run in development mode
    if (process.env.NODE_ENV !== 'development') return;
    
    // Add keyboard shortcut to toggle metrics panel (Ctrl+Shift+P)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setShowMetrics(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Check for stored metrics every 5 seconds (optimized from 1 second)
    const intervalId = setInterval(() => {
      const storedMetrics = localStorage.getItem('performance_metrics');
      if (storedMetrics) {
        try {
          setMetrics(JSON.parse(storedMetrics) as PerformanceMetrics);
        } catch (error) {
          console.error('Failed to parse performance metrics:', error);
        }
      }
    }, 5000);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(intervalId);
    };
  }, []);
  
  if (!isDev) return null;
  
  return (
    <>
      <PerformanceMonitor />
      
      {showMetrics && metrics && (
        <div
          style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '12px',
            zIndex: 9999,
            maxWidth: '400px',
            maxHeight: '400px',
            overflow: 'auto',
          }}
        >
          <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
            <strong>Performance Metrics</strong>
            <button 
              onClick={() => setShowMetrics(false)}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
            >
              ×
            </button>
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <div><strong>Page:</strong> {metrics.url}</div>
            <div><strong>Time:</strong> {new Date(metrics.timestamp).toLocaleTimeString()}</div>
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>LCP:</span>
              <span style={{ color: metrics.lcp && metrics.lcp < 2500 ? '#4ade80' : metrics.lcp && metrics.lcp < 4000 ? '#facc15' : '#ef4444' }}>
                {metrics.lcp ?? 'N/A'}ms
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>FID:</span>
              <span style={{ color: metrics.fid && metrics.fid < 100 ? '#4ade80' : metrics.fid && metrics.fid < 300 ? '#facc15' : '#ef4444' }}>
                {metrics.fid ?? 'N/A'}ms
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>CLS:</span>
              <span style={{ color: metrics.cls && metrics.cls < 0.1 ? '#4ade80' : metrics.cls && metrics.cls < 0.25 ? '#facc15' : '#ef4444' }}>
                {metrics.cls ?? '0'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>TTFB:</span>
              <span style={{ color: metrics.ttfb && metrics.ttfb < 800 ? '#4ade80' : metrics.ttfb && metrics.ttfb < 1800 ? '#facc15' : '#ef4444' }}>
                {metrics.ttfb ?? 'N/A'}ms
              </span>
            </div>
          </div>
          
          {metrics.longTasks && metrics.longTasks.length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <strong>Long Tasks ({metrics.longTasks.length}):</strong>
              <ul style={{ margin: '5px 0', paddingLeft: '15px' }}>
                {metrics.longTasks.slice(0, 5).map((task, i) => (
                  <li key={i}>
                    {task.duration}ms at {task.startTime}ms
                  </li>
                ))}
                {metrics.longTasks.length > 5 && <li>...and {metrics.longTasks.length - 5} more</li>}
              </ul>
            </div>
          )}
          
          {metrics.resourceLoads && metrics.resourceLoads.length > 0 && (
            <div>
              <strong>Slow Resources ({metrics.resourceLoads.length}):</strong>
              <ul style={{ margin: '5px 0', paddingLeft: '15px' }}>
                {metrics.resourceLoads.slice(0, 5).map((resource, i) => (
                  <li key={i}>
                    {resource.name}: {resource.duration}ms, {Math.round(resource.size / 1024)}KB
                  </li>
                ))}
                {metrics.resourceLoads.length > 5 && <li>...and {metrics.resourceLoads.length - 5} more</li>}
              </ul>
            </div>
          )}
          
          <div style={{ marginTop: '10px', fontSize: '10px', opacity: 0.7 }}>
            Press Ctrl+Shift+P to toggle this panel
          </div>
        </div>
      )}
    </>
  );
}
