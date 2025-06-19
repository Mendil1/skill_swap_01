"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Coins,
  TrendingUp,
  Calendar,
  RefreshCw,
  Award,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Star,
  CheckCircle,
  XCircle,
  ShoppingCart,
  Loader2,
} from "lucide-react";
import CreditPurchase from "./credit-purchase";
import { useCredits } from "@/hooks/useCredits";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

interface CreditStats {
  totalCredits: number;
  creditsEarned: number;
  creditsSpent: number;
  monthlyEarnings: number;
  monthlySpending: number;
  averagePerSession: number;
  totalSessions: number;
  rating: number;
}

export default function CreditsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("");

  // Check authentication first
  const { loading: authLoading } = useAuthRedirect({ requireAuth: true });

  // Use the real credit system
  const { balance, transactions, isLoading, error, refreshBalance, refreshTransactions } =
    useCredits();

  // Calculate stats from real transaction data
  const stats = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {
        totalCredits: balance || 0,
        creditsEarned: 0,
        creditsSpent: 0,
        monthlyEarnings: 0,
        monthlySpending: 0,
        averagePerSession: 0,
        totalSessions: 0,
        rating: 5.0,
      };
    }
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const earned = transactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);

    const spent = transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const monthlyEarnings = transactions
      .filter((t) => {
        const date = new Date(t.date);
        return (
          t.amount > 0 && date.getMonth() === currentMonth && date.getFullYear() === currentYear
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlySpending = transactions
      .filter((t) => {
        const date = new Date(t.date);
        return (
          t.amount < 0 && date.getMonth() === currentMonth && date.getFullYear() === currentYear
        );
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const sessionTransactions = transactions.filter(
      (t) => t.type === "session_completed" || t.type === "session_taught"
    );

    const totalSessions = sessionTransactions.length;
    const averagePerSession =
      totalSessions > 0
        ? sessionTransactions.reduce((sum, t) => sum + t.amount, 0) / totalSessions
        : 0;

    return {
      totalCredits: balance || 0,
      creditsEarned: earned,
      creditsSpent: spent,
      monthlyEarnings,
      monthlySpending,
      averagePerSession: Math.round(averagePerSession),
      totalSessions,
      rating: 4.8, // This would come from a separate rating system
    };
  }, [transactions, balance]);

  const handleRefresh = async () => {
    await Promise.all([refreshBalance(), refreshTransactions()]);
  };

  // Helper functions
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="container mx-auto max-w-6xl p-6">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
            <p className="text-gray-600">Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl p-6">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
            <p className="text-gray-600">Loading your credits...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-6xl p-6">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <XCircle className="mx-auto mb-4 h-8 w-8 text-red-500" />
            <p className="mb-4 text-red-600">Error loading credits: {error}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl p-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Credits</h1>
            <p className="text-muted-foreground mt-2">
              Manage your credits and view transaction history
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={() => setShowPurchaseDialog(true)} size="sm">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Buy Credits
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="purchase">Purchase</TabsTrigger>
          </TabsList>

          {/* Overview Tab Content */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-l-4 border-l-indigo-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Credits</CardTitle>
                  <Coins className="h-4 w-4 text-indigo-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCredits.toLocaleString()}</div>
                  <p className="text-muted-foreground text-xs">Available balance</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Credits Earned
                  </CardTitle>
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    +{stats.creditsEarned.toLocaleString()}
                  </div>
                  <p className="text-muted-foreground text-xs">All time total</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Credits Spent</CardTitle>
                  <ArrowDownLeft className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    -{stats.creditsSpent.toLocaleString()}
                  </div>
                  <p className="text-muted-foreground text-xs">All time total</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Avg per Session
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.averagePerSession}</div>
                  <p className="text-muted-foreground text-xs">Credits per session</p>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Overview */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    This Month
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Earned</span>
                    <span className="font-semibold text-green-600">
                      +{stats.monthlyEarnings.toLocaleString()} credits
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Spent</span>
                    <span className="font-semibold text-red-600">
                      -{stats.monthlySpending.toLocaleString()} credits
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-2">
                    <span className="text-sm font-medium">Net Change</span>
                    <span
                      className={`font-bold ${
                        stats.monthlyEarnings - stats.monthlySpending >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {stats.monthlyEarnings - stats.monthlySpending >= 0 ? "+" : ""}
                      {(stats.monthlyEarnings - stats.monthlySpending).toLocaleString()} credits
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sessions Completed</span>
                    <span className="font-semibold">{stats.totalSessions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Average Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{stats.rating}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress to next milestone</span>
                      <span>75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                    <p className="text-muted-foreground text-xs">
                      250 more credits to reach 1,500 milestone
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                  <div>
                    <CardTitle>Transaction History</CardTitle>
                    <p className="text-muted-foreground mt-1 text-sm">
                      View all your credit transactions
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <select
                      className="rounded-md border px-3 py-2 text-sm"
                      onChange={(e) => setSelectedFilter(e.target.value)}
                    >
                      <option value="">All Transactions</option>
                      <option value="session_completed">Session Completed</option>
                      <option value="session_taught">Session Taught</option>
                      <option value="bonus">Bonus</option>
                      <option value="purchase">Purchase</option>
                      <option value="refund">Refund</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {transactions && transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions
                      .filter(
                        (transaction) => !selectedFilter || transaction.type === selectedFilter
                      )
                      .map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            {" "}
                            <div
                              className={`rounded-full p-2 ${
                                transaction.amount > 0 ? "bg-green-100" : "bg-red-100"
                              }`}
                            >
                              {transaction.amount > 0 ? (
                                <ArrowUpRight className="h-4 w-4 text-green-600" />
                              ) : (
                                <ArrowDownLeft className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">
                                {transaction.description || `${transaction.type.replace("_", " ")}`}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(transaction.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`font-semibold ${
                                transaction.amount > 0 ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {transaction.amount > 0 ? "+" : ""}
                              {transaction.amount.toLocaleString()} credits
                            </div>{" "}
                            <div className="text-sm text-gray-500">
                              Balance: {transaction.balanceAfter.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    <Coins className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                    <p>No transactions found.</p>
                    <p className="mt-2 text-sm">
                      Complete your first session to start earning credits!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Credit Analytics</CardTitle>
                <p className="text-muted-foreground text-sm">
                  Detailed insights into your credit usage
                </p>
              </CardHeader>
              <CardContent>
                <div className="py-8 text-center text-gray-500">
                  <TrendingUp className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                  <p>Analytics dashboard coming soon!</p>
                  <p className="mt-2 text-sm">Charts and insights will be available here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Purchase Tab */}
          <TabsContent value="purchase">
            <CreditPurchase currentCredits={balance || 0} onPurchaseComplete={handleRefresh} />
          </TabsContent>
        </Tabs>

        {/* Purchase Dialog */}
        {showPurchaseDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white">
              {" "}
              <CreditPurchase
                currentCredits={balance || 0}
                onPurchaseComplete={() => {
                  handleRefresh();
                  setShowPurchaseDialog(false);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
