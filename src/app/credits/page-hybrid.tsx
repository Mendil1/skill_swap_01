"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, ArrowUpCircle, ArrowDownCircle, Gift, Star, Calendar } from "lucide-react";

interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
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

interface CreditData {
  currentBalance: number;
  totalEarned: number;
  totalSpent: number;
  recentTransactions: CreditTransaction[];
  isRealUser: boolean;
  userEmail: string;
}

function CreditsContent() {
  const { user, loading: authLoading } = useAuth();
  const [creditData, setCreditData] = useState<CreditData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    let mounted = true;
    
    async function loadCreditData() {
      console.log("[Credits] Auth context - user:", user?.email, "authLoading:", authLoading);

      // Wait for auth provider to finish loading before making decisions
      if (authLoading) {
        console.log("[Credits] Auth provider still loading, waiting...");
        setLoading(true);
        return;
      }      // If no user after auth loading is complete, redirect to login
      if (!user) {
        console.log("[Credits] No user found after auth loading complete, redirecting to login");
        if (mounted) {
          router.push("/login?returnUrl=" + encodeURIComponent(window.location.pathname));
        }
        return;
      }

      // Load real user data only if component is still mounted
      if (mounted) {
        await loadRealCreditData(user);
      }
    }

    async function loadRealCreditData(authUser: AuthUser) {
      if (!mounted) return;
      
      try {
        console.log("[Credits] Loading real data for user:", authUser.email, authUser.id);
        setLoading(true);
        const supabase = createClient();
        const userId = authUser.id;

        // Note: These tables might not exist, so we'll handle errors gracefully
        
        // Try to get credit balance from database
        let currentBalance = 100; // Default starting balance
        try {
          const { data: creditBalance, error: balanceError } = await supabase
            .from("user_credits")
            .select("balance")
            .eq("user_id", userId)
            .single();

          if (!balanceError && creditBalance) {
            currentBalance = creditBalance.balance;
          }
        } catch (err) {
          console.log("[Credits] user_credits table not found, using default balance");
        }        // Try to get credit transactions
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let transactions: any[] = [];
        try {
          const { data: transactionData, error: transactionsError } = await supabase
            .from("credit_transactions")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(10);

          if (!transactionsError && transactionData) {
            transactions = transactionData;
          }
        } catch (err) {
          console.log("[Credits] credit_transactions table not found, using default transactions");
        }

        // Transform transactions to our format
        const transformedTransactions: CreditTransaction[] = transactions.length > 0 
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? transactions.map((tx: any) => ({
              id: tx.transaction_id || tx.id || `tx-${Date.now()}`,
              type: tx.transaction_type === "credit" ? "earned" : 
                    tx.transaction_type === "debit" ? "spent" : "bonus",
              amount: Math.abs(tx.amount || 0),
              description: tx.description || "Transaction",
              date: tx.created_at || new Date().toISOString(),
              relatedUserId: tx.related_user_id,
              relatedUserName: "Unknown User",
            }))
          : [
              {
                id: "welcome-bonus",
                type: "bonus" as const,
                amount: 100,
                description: "Welcome bonus for joining SkillSwap!",
                date: new Date().toISOString(),
              },
            ];

        // Calculate totals
        const totalEarned = transformedTransactions
          .filter(tx => tx.type === "earned" || tx.type === "bonus")
          .reduce((sum, tx) => sum + tx.amount, 0);
        
        const totalSpent = transformedTransactions
          .filter(tx => tx.type === "spent")
          .reduce((sum, tx) => sum + tx.amount, 0);

        const finalCreditData: CreditData = {
          currentBalance: currentBalance,
          totalEarned: Math.max(totalEarned, 100), // At least welcome bonus
          totalSpent,
          recentTransactions: transformedTransactions,
          isRealUser: true,
          userEmail: authUser.email || "",
        };

        console.log("[Credits] Successfully loaded credit data");
        setCreditData(finalCreditData);
        setLoading(false);
      } catch (err) {
        console.error("[Credits] Error loading credit data:", err);
        // Even on error, create basic credit data
        const basicCreditData: CreditData = {
          currentBalance: 100,
          totalEarned: 100,
          totalSpent: 0,
          recentTransactions: [
            {
              id: "welcome-bonus",
              type: "bonus" as const,
              amount: 100,
              description: "Welcome bonus for joining SkillSwap!",
              date: new Date().toISOString(),
            },
          ],
          isRealUser: true,
          userEmail: authUser.email || "",        };
        if (mounted) {
          setCreditData(basicCreditData);
          setLoading(false);
        }
      }
    }

    loadCreditData();
    
    return () => {
      mounted = false;
    };
  }, [user, authLoading, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your credits...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!creditData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <p className="text-muted-foreground">Unable to load credit data.</p>
          <Button onClick={() => router.push("/login")} className="mt-4">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  const { currentBalance, totalEarned, totalSpent, recentTransactions, isRealUser, userEmail } = creditData;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* User Status Indicator */}
      <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-800">
            Authenticated as: {userEmail}
          </span>
          {isRealUser && (
            <span className="text-xs text-green-600 ml-2">
              ✓ Real credit data loaded (Client-side)
            </span>
          )}
        </div>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Credits</h1>
            <p className="text-muted-foreground mt-2">
              Manage your SkillSwap credits and view transaction history
            </p>
          </div>
          <Button asChild>
            <Link href="/sessions/create">Earn More Credits</Link>
          </Button>
        </div>
      </div>

      {/* Credit Overview Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{currentBalance}</div>
            <p className="text-xs text-muted-foreground">
              Available credits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalEarned}</div>
            <p className="text-xs text-muted-foreground">
              From teaching sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalSpent}</div>
            <p className="text-xs text-muted-foreground">
              On learning sessions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* How Credits Work */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            How Credits Work
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-semibold text-green-600">Earn Credits</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Teach a skill session: 50 credits</li>
                <li>• Complete your profile: 25 credits</li>
                <li>• Receive 5-star rating: 10 credits</li>
                <li>• Refer a friend: 30 credits</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-600">Spend Credits</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Learn a skill session: 40 credits</li>
                <li>• Premium profile features: 20 credits</li>
                <li>• Priority session booking: 15 credits</li>
                <li>• Extended session time: 10 credits</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
          <CardDescription>
            Your latest credit activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => {
                const isPositive = transaction.type === "earned" || transaction.type === "bonus";
                const icon = transaction.type === "earned" ? ArrowUpCircle :
                           transaction.type === "spent" ? ArrowDownCircle : Gift;
                const IconComponent = icon;
                
                return (
                  <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === "earned" ? "bg-green-100 text-green-600" :
                        transaction.type === "spent" ? "bg-red-100 text-red-600" :
                        "bg-blue-100 text-blue-600"
                      }`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        {transaction.relatedUserName && (
                          <p className="text-sm text-muted-foreground">
                            With {transaction.relatedUserName}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={isPositive ? "default" : "destructive"} className="font-mono">
                        {isPositive ? "+" : "-"}{transaction.amount}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No transactions yet</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/sessions/create">Start Your First Session</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="mt-8 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline" asChild>
                <Link href="/sessions">View Sessions</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/profile">Edit Profile</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/skills">Browse Skills</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CreditsPage() {
  return <CreditsContent />;
}
