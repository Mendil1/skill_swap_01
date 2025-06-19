"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/components/auth-provider";

export interface CreditTransaction {
  id: string;
  amount: number;
  type: "earned" | "spent" | "purchased" | "session_completed" | "session_taught";
  description: string;
  date: string; // Changed from created_at to match component expectations
  balanceAfter: number; // Added to match component expectations
  created_at: string;
}

export interface UseCreditsReturn {
  balance: number;
  transactions: CreditTransaction[];
  isLoading: boolean;
  error: string | null;
  refreshBalance: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
}

export function useCredits(): UseCreditsReturn {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const supabase = createClient();

  const refreshBalance = async () => {
    if (!user) return;

    try {
      setError(null);

      // Get user's current credit balance
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("credits")
        .eq("user_id", user.id)
        .single();

      if (userError) {
        console.error("Error fetching user credits:", userError);
        setError("Failed to fetch credit balance");
        return;
      }

      setBalance(userData?.credits || 0);
    } catch (err) {
      console.error("Error in refreshBalance:", err);
      setError("An unexpected error occurred");
    }
  };

  const refreshTransactions = async () => {
    if (!user) return;

    try {
      setError(null);

      // For now, return empty transactions since we don't have a credit_transactions table
      // This can be implemented later when the credit system is fully built out
      setTransactions([]);

      // Example of what the query would look like:
      // const { data: transactionsData, error: transactionsError } = await supabase
      //   .from("credit_transactions")
      //   .select("*")
      //   .eq("user_id", user.id)
      //   .order("created_at", { ascending: false })
      //   .limit(50);

    } catch (err) {
      console.error("Error in refreshTransactions:", err);
      setError("Failed to fetch transactions");
    }
  };

  useEffect(() => {
    const loadCreditsData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      await Promise.all([refreshBalance(), refreshTransactions()]);
      setIsLoading(false);
    };

    loadCreditsData();
  }, [user]);

  return {
    balance,
    transactions,
    isLoading,
    error,
    refreshBalance,
    refreshTransactions,
  };
}
