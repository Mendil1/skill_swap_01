"use client";

import { useEffect, useState } from "react";

export default function AuthTest() {
  const [authState, setAuthState] = useState({
    signInVisible: false,
    profileVisible: false,
    signOutVisible: false,
    hasCookies: false,
    localStorageKeys: 0
  });

  useEffect(() => {
    // Check auth state after component mounts
    const checkAuthState = () => {
      const signInBtn = document.querySelector('a[href="/login"]');
      const profileBtn = document.querySelector('a[href="/profile"]');
      const signOutBtn = document.querySelector('a[href="/auth/logout"]');
        setAuthState({
        signInVisible: !!signInBtn && (signInBtn as HTMLElement).offsetParent !== null,
        profileVisible: !!profileBtn && (profileBtn as HTMLElement).offsetParent !== null,
        signOutVisible: !!signOutBtn && (signOutBtn as HTMLElement).offsetParent !== null,
        hasCookies: document.cookie.includes('sb-'),
        localStorageKeys: Object.keys(localStorage).filter(k => k.includes('supabase')).length
      });
    };

    // Check immediately and after a delay
    checkAuthState();
    const timer = setTimeout(checkAuthState, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const clearClientStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Quick Actions:</h2>
          <div className="space-x-2">
            <a 
              href="/auth/force-logout" 
              className="inline-block bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Force Logout
            </a>
            <a 
              href="/login?force=true" 
              className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Force Login Page
            </a>
            <button 
              onClick={clearClientStorage}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Clear Client Storage
            </button>
          </div>
        </div>
        
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Current State:</h2>
          <div>
            <p><strong>Sign In button visible:</strong> {authState.signInVisible ? 'Yes' : 'No'}</p>
            <p><strong>Profile button visible:</strong> {authState.profileVisible ? 'Yes' : 'No'}</p>
            <p><strong>Sign Out button visible:</strong> {authState.signOutVisible ? 'Yes' : 'No'}</p>
            <p><strong>Cookies:</strong> {authState.hasCookies ? 'Has auth cookies' : 'No auth cookies'}</p>
            <p><strong>LocalStorage:</strong> {authState.localStorageKeys} supabase keys</p>
          </div>
        </div>
      </div>
    </div>
  );
}
