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
    <form onSubmit={handleSubmit} className="flex gap-2 w-full md:w-auto">
      <div className="relative flex-grow">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
        <input
          type="search"
          placeholder="Search for skills or people..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-10 w-full md:w-[300px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
        />
      </div>
      <select
        value={searchType}
        onChange={(e) => setSearchType(e.target.value)}
        className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
      >
        <option value="all">All</option>
        <option value="teachers">Find Teachers</option>
        <option value="learners">Find Learners</option>
      </select>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Searching...
          </>
        ) : (
          "Search"
        )}
      </Button>
    </form>
  );
}
