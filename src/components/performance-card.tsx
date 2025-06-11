"use client";

import OptimizedLink from "@/components/optimized-link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Gauge, Zap } from "lucide-react";

export default function PerformanceCard() {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-indigo-100">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-2">
        <div className="flex items-center gap-2">
          <Gauge className="h-5 w-5 text-indigo-600" />
          <CardTitle className="text-lg text-indigo-800">Performance Tools</CardTitle>
        </div>
        <CardDescription>Optimize application speed</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm text-slate-600 mb-2">
          Is the app running slow? Apply performance optimizations to make it faster:
        </p>
        <ul className="text-sm space-y-1 text-slate-700 list-disc list-inside mb-2">
          <li>Create database indexes for faster queries</li>
          <li>Optimize notification system</li>
          <li>Improve API response times</li>
        </ul>
      </CardContent>
      <CardFooter>
        <OptimizedLink href="/performance-tools" className="w-full">
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2">
            <span>Open Performance Tools</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </OptimizedLink>
      </CardFooter>
    </Card>
  );
}
