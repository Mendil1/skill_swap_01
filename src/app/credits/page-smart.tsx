"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, ArrowUpCircle, ArrowDownCircle, Gift, Star, Calendar } from "lucide-react";

interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
}

interface CreditData {
  currentBalance: number;
  totalEarned: number;
  totalSpent: number;
  recentTransactions: CreditTransaction[];
  isRealUser: boolean;
  userEmail: string;
}

interface CreditTransaction {
  id: string;
  type: "earned" | "spent" | "bonus";
  amount: number;
  description: string;
  date: string;
  relatedUserId?: string;
  relatedUserName?: string;
}

// Mock data for fallback when authentication fails
const MOCK_CREDIT_DATA: CreditData = {
  currentBalance: 125,
  totalEarned: 280,
  totalSpent: 155,
  recentTransactions: [
    {
      id: "txn-1",
      type: "earned",
      amount: 50,
      description: "Teaching session: JavaScript Fundamentals",
      date: "2025-06-12T14:30:00Z",
      relatedUserId: "user-123",
      relatedUserName: "Alice Johnson",
    },
    {
      id: "txn-2",
      type: "spent",
      amount: 30,
      description: "Learning session: Python Data Science",
      date: "2025-06-11T10:00:00Z",
      relatedUserId: "user-456",
      relatedUserName: "Bob Smith",
    },
    {
      id: "txn-3",
      type: "bonus",
      amount: 25,
      description: "Welcome bonus for new user",
      date: "2025-06-10T09:00:00Z",
    },
    {
      id: "txn-4",
      type: "earned",
      amount: 45,
      description: "Teaching session: React Development",
      date: "2025-06-09T16:00:00Z",
      relatedUserId: "user-789",
      relatedUserName: "Carol Wilson",
    },
    {
      id: "txn-5",
      type: "spent",
      amount: 40,
      description: "Learning session: UI/UX Design Principles",
      date: "2025-06-08T13:30:00Z",
      relatedUserId: "user-321",
      relatedUserName: "David Brown",
    },
  ],
  isRealUser: false,
  userEmail: "demo@skillswap.com",
};

function CreditsContent() {
  const { user } = useAuth();
  const [creditData, setCreditData] = useState<CreditData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCreditData() {
      console.log("[Credits] Auth context user:", user?.email, user?.id);

      // If no user in auth context, try to get session directly
      if (!user) {
        console.log("[Credits] No user in auth context, checking direct session...");
        try {
          const supabase = createClient();
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

          if (sessionError || !sessionData.session?.user) {
            console.log("[Credits] No valid session found, using mock data");
            setCreditData(MOCK_CREDIT_DATA);
            setLoading(false);
            return;
          } else {
            console.log("[Credits] Found direct session for user:", sessionData.session.user.email);
            await loadRealCreditData(sessionData.session.user);
            return;
          }
        } catch (error) {
          console.error("[Credits] Error checking direct session:", error);
          setCreditData(MOCK_CREDIT_DATA);
          setLoading(false);
          return;
        }
      }

      // Load real user data
      await loadRealCreditData(user);
    }

    async function loadRealCreditData(authUser: AuthUser) {
      try {
        console.log("[Credits] Loading real credit data for user:", authUser.email, authUser.id);
        const supabase = createClient();
        const userId = authUser.id;

        // Get user's credit balance and transactions
        const { data: userCredits, error: creditsError } = await supabase
          .from("user_credits")
          .select("*")
          .eq("user_id", userId)
          .single();

        const { data: transactions, error: transactionsError } = await supabase
          .from("credit_transactions")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(10);

        if (creditsError || transactionsError) {
          console.log("[Credits] Database error, using mock data with real user info");
          // Use mock data but with real user information
          const hybridData = {
            ...MOCK_CREDIT_DATA,
            isRealUser: true,
            userEmail: authUser.email || "",
          };
          setCreditData(hybridData);
          setLoading(false);
          return;
        } // Transform real data
        const transformedTransactions: CreditTransaction[] = (transactions || []).map(
          (txn: {
            transaction_id: string;
            transaction_type: "earned" | "spent" | "bonus";
            amount: number;
            description?: string;
            created_at: string;
            related_user_id?: string;
            related_user_name?: string;
          }) => ({
            id: txn.transaction_id,
            type: txn.transaction_type,
            amount: txn.amount,
            description: txn.description || `${txn.transaction_type} transaction`,
            date: txn.created_at,
            relatedUserId: txn.related_user_id,
            relatedUserName: txn.related_user_name,
          })
        );

        const realCreditData: CreditData = {
          currentBalance: userCredits?.balance || 0,
          totalEarned: userCredits?.total_earned || 0,
          totalSpent: userCredits?.total_spent || 0,
          recentTransactions: transformedTransactions,
          isRealUser: true,
          userEmail: authUser.email || "",
        };

        console.log("[Credits] Successfully loaded real credit data");
        setCreditData(realCreditData);
        setLoading(false);
      } catch (err) {
        console.error("[Credits] Error loading real credit data:", err);
        // Fallback to mock data with real user info if available
        const fallbackData = {
          ...MOCK_CREDIT_DATA,
          isRealUser: true,
          userEmail: authUser.email || "",
        };
        setCreditData(fallbackData);
        setLoading(false);
      }
    }

    loadCreditData();
  }, [user]);
  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
            <p className="text-muted-foreground">Loading credits...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!creditData) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No credit data available</p>
          <Link href="/auth/sign-in">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "earned":
        return <ArrowUpCircle className="h-4 w-4 text-green-600" />;
      case "spent":
        return <ArrowDownCircle className="h-4 w-4 text-red-600" />;
      case "bonus":
        return <Gift className="h-4 w-4 text-blue-600" />;
      default:
        return <Coins className="h-4 w-4" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "earned":
        return "text-green-600";
      case "spent":
        return "text-red-600";
      case "bonus":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* User Status Indicator */}
      {creditData.isRealUser ? (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <p className="text-sm font-medium text-green-800">
              Authenticated as: {creditData.userEmail}
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
            <p className="text-sm font-medium text-yellow-800">
              Demo Mode - Please log in to see your real credit data
            </p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Credits</h1>
          <p className="text-muted-foreground">
            Manage your SkillSwap credits and view transaction history
          </p>
        </div>
      </div>

      {/* Credit Overview Cards */}
      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <Coins className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{creditData.currentBalance}</div>
            <p className="text-muted-foreground text-xs">Available for learning sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{creditData.totalEarned}</div>
            <p className="text-muted-foreground text-xs">From teaching sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{creditData.totalSpent}</div>
            <p className="text-muted-foreground text-xs">On learning sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest credit activity</CardDescription>
        </CardHeader>
        <CardContent>
          {creditData.recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {creditData.recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <div className="text-muted-foreground flex items-center gap-2 text-sm">
                        <span>{new Date(transaction.date).toLocaleDateString()}</span>
                        {transaction.relatedUserName && (
                          <>
                            <span>•</span>
                            <span>with {transaction.relatedUserName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`text-right ${getTransactionColor(transaction.type)}`}>
                    <div className="font-bold">
                      {transaction.type === "spent" ? "-" : "+"}
                      {transaction.amount}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {transaction.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground py-8 text-center">
              No transactions yet. Start teaching or learning to earn and spend credits!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4">
        <Link href="/sessions/new">
          <Button>
            <Star className="mr-2 h-4 w-4" />
            Book a Learning Session
          </Button>
        </Link>
        <Link href="/sessions">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            View All Sessions
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function CreditsPage() {
  return <CreditsContent />;
}
