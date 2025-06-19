"use client";

import { useAuth } from "@/components/auth-provider";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Debug component to track auth state during navigation
 * Add this temporarily to identify session persistence issues
 */
export default function NavigationAuthDebug() {
  const { user, session, loading } = useAuth();
  const pathname = usePathname();
  const [authHistory, setAuthHistory] = useState<Array<{
    timestamp: string;
    path: string;
    hasUser: boolean;
    hasSession: boolean;
    loading: boolean;
    userEmail?: string;
  }>>([]);

  useEffect(() => {
    const entry = {
      timestamp: new Date().toISOString(),
      path: pathname,
      hasUser: !!user,
      hasSession: !!session,
      loading,
      userEmail: user?.email,
    };

    console.log('[NavigationAuthDebug] Auth state on', pathname, ':', entry);

    setAuthHistory(prev => [...prev.slice(-10), entry]); // Keep last 10 entries
  }, [pathname, user, session, loading]);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        maxWidth: '300px',
        zIndex: 9999,
        fontFamily: 'monospace'
      }}
    >
      <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
        Auth Debug - {pathname}
      </div>
      
      <div style={{ marginBottom: '5px' }}>
        <strong>Current State:</strong>
      </div>
      <div>Loading: {loading ? '🔄' : '✅'}</div>
      <div>User: {user ? `✅ ${user.email}` : '❌ None'}</div>
      <div>Session: {session ? '✅ Active' : '❌ None'}</div>
      
      {authHistory.length > 0 && (
        <>
          <div style={{ marginTop: '10px', marginBottom: '5px' }}>
            <strong>Navigation History:</strong>
          </div>
          <div style={{ maxHeight: '200px', overflowY: 'auto', fontSize: '10px' }}>
            {authHistory.slice(-5).map((entry, index) => (
              <div key={index} style={{ marginBottom: '3px', padding: '2px', background: 'rgba(255,255,255,0.1)' }}>
                <div>{entry.path}</div>
                <div>
                  {entry.loading ? '🔄' : ''} 
                  {entry.hasUser ? '👤' : '❌'} 
                  {entry.hasSession ? '🔑' : '❌'}
                  {entry.userEmail && ` (${entry.userEmail.split('@')[0]})`}
                </div>
                <div style={{ fontSize: '9px', opacity: 0.7 }}>
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      
      <div style={{ marginTop: '10px', fontSize: '10px', opacity: 0.7 }}>
        Add &debug=off to URL to hide
      </div>
    </div>
  );
}
