"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createClient } from "@/utils/supabase/client";
import { AlertCircle, CheckCircle2, Database } from "lucide-react";

export default function ApplyPerformanceOptimizations() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{success: boolean; message: string} | null>(null);

  const applyIndexes = async () => {
    setLoading(true);
    setResult(null);

    try {
      // Get the SQL from the add_notification_indexes.sql file
      const response = await fetch('/add_notification_indexes.sql');
      if (!response.ok) {
        throw new Error('Failed to fetch SQL file');
      }

      const sql = await response.text();

      // Connect to Supabase with admin privileges
      const supabase = createClient();

      // Execute the SQL directly - requires special permissions
      // Note: This would typically be done through an API route with service role
      const { error } = await supabase.rpc('execute_sql', { sql_string: sql });

      if (error) {
        throw error;
      }

      setResult({
        success: true,
        message: 'Successfully applied performance optimizations! Database indexes created.'
      });
    } catch (error) {
      console.error('Error applying indexes:', error);
      setResult({
        success: false,
        message: `Failed to apply optimizations: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Performance Optimization Tools</CardTitle>
          <CardDescription>
            Apply performance optimizations to improve application speed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This tool will apply database indexes and other performance optimizations to make the application faster.
            These optimizations include:
          </p>

          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Adding indexes to the notifications table for faster queries</li>
            <li>Optimizing database query patterns</li>
            <li>Improving database statistics for better query planning</li>
          </ul>

          {result && (
            <Alert className={result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
              {result.success ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={applyIndexes}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? (
              <>
                <Database className="mr-2 h-4 w-4 animate-spin" />
                Applying Optimizations...
              </>
            ) : (
              'Apply Performance Optimizations'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
