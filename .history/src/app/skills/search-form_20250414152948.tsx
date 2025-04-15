"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";

export default function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [searchType, setSearchType] = useState(
    searchParams.get("type") || "all"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Build the search query parameters
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    params.set("type", searchType);

    // Navigate to the search results
    router.push(`/skills?${params.toString()}`);

    // We'll reset the loading state after navigation completes
    // This gives visual feedback that something is happening
    setTimeout(() => setIsLoading(false), 500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 mb-6">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-3 sm:space-y-4 md:space-y-0 md:flex-row md:items-end md:gap-3">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="search"
            placeholder="Search for skills or people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 shadow-sm"
            aria-label="Search query"
          />
        </div>
        <div className="flex gap-2 flex-col sm:flex-row md:flex-nowrap md:min-w-max">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="h-12 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 shadow-sm"
            aria-label="Search filter type"
          >
            <option value="all">All</option>
            <option value="teachers">Find Teachers</option>
            <option value="learners">Find Learners</option>
          </select>
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="h-12 w-full sm:w-auto whitespace-nowrap"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              "Search"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
