"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";

export default function SupabaseTest() {
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("test123");
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testConnection = async () => {
    setLoading(true);
    addResult("🔍 Testing Supabase connection...");
    
    try {
      const supabase = createClient();
      addResult("✅ Supabase client created");
      
      // Test getting session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        addResult(`❌ Session error: ${sessionError.message}`);
      } else {
        addResult(`📝 Current session: ${sessionData.session?.user?.email || 'none'}`);
      }
      
      // Test getting user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        addResult(`❌ User error: ${userError.message}`);
      } else {
        addResult(`👤 Current user: ${userData.user?.email || 'none'}`);
      }
      
    } catch (error) {
      addResult(`❌ Connection test failed: ${error}`);
    }
    
    setLoading(false);
  };

  const testSignup = async () => {
    setLoading(true);
    addResult(`🆕 Testing signup with ${email}...`);
    
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) {
        addResult(`❌ Signup failed: ${error.message}`);
      } else {
        addResult(`✅ Signup successful! User: ${data.user?.email}`);
        if (data.user?.email_confirmed_at) {
          addResult("📧 Email confirmed");
        } else {
          addResult("📧 Check email for confirmation link");
        }
      }
    } catch (error) {
      addResult(`❌ Signup error: ${error}`);
    }
    
    setLoading(false);
  };

  const testLogin = async () => {
    setLoading(true);
    addResult(`🔐 Testing login with ${email}...`);
    
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        addResult(`❌ Login failed: ${error.message}`);
      } else {
        addResult(`✅ Login successful! User: ${data.user?.email}`);
        addResult("🔄 Page should update navigation now...");
      }
    } catch (error) {
      addResult(`❌ Login error: ${error}`);
    }
    
    setLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Test</h1>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Email:</label>
          <Input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Password:</label>
          <Input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={testConnection}
            disabled={loading}
            variant="outline"
          >
            Test Connection
          </Button>
          
          <Button 
            onClick={testSignup}
            disabled={loading}
            variant="secondary"
          >
            Test Signup
          </Button>
          
          <Button 
            onClick={testLogin}
            disabled={loading}
          >
            Test Login
          </Button>
          
          <Button 
            onClick={clearResults}
            disabled={loading}
            variant="ghost"
          >
            Clear
          </Button>
        </div>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="font-semibold mb-2">Test Results:</h2>
        <div className="space-y-1 text-sm font-mono">
          {results.length === 0 ? (
            <p className="text-gray-500">No tests run yet</p>
          ) : (
            results.map((result, index) => (
              <div key={index}>{result}</div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
