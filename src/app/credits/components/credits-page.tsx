"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Coins,
  TrendingUp,
  Calendar,
  Download,
  RefreshCw,
  Award,
  BookOpen,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Star,
  CheckCircle,
  XCircle,
  ShoppingCart,
} from "lucide-react";
import CreditPurchase from "./credit-purchase";

// Mock data types
interface CreditTransaction {
  id: string;
  type: "earned" | "spent" | "bonus" | "refund";
  amount: number;
  description: string;
  date: string;
  status: "completed" | "pending" | "failed";
  category: "teaching" | "learning" | "bonus" | "referral" | "system";
  sessionId?: string;
  partnerName?: string;
}

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

// Mock data
const mockStats: CreditStats = {
  totalCredits: 1247,
  creditsEarned: 2890,
  creditsSpent: 1643,
  monthlyEarnings: 420,
  monthlySpending: 180,
  averagePerSession: 35,
  totalSessions: 82,
  rating: 4.8,
};

const mockTransactions: CreditTransaction[] = [
  {
    id: "tx_001",
    type: "earned",
    amount: 50,
    description: "Teaching Session: JavaScript Fundamentals",
    date: "2024-06-08T14:30:00Z",
    status: "completed",
    category: "teaching",
    sessionId: "sess_123",
    partnerName: "Sarah Johnson",
  },
  {
    id: "tx_002",
    type: "spent",
    amount: -25,
    description: "Learning Session: Advanced React Patterns",
    date: "2024-06-07T10:15:00Z",
    status: "completed",
    category: "learning",
    sessionId: "sess_124",
    partnerName: "Mike Chen",
  },
  {
    id: "tx_003",
    type: "bonus",
    amount: 100,
    description: "Monthly Teaching Excellence Bonus",
    date: "2024-06-01T00:00:00Z",
    status: "completed",
    category: "bonus",
  },
  {
    id: "tx_004",
    type: "earned",
    amount: 75,
    description: "Teaching Session: Python Data Science",
    date: "2024-06-06T16:45:00Z",
    status: "completed",
    category: "teaching",
    sessionId: "sess_125",
    partnerName: "Emily Rodriguez",
  },
  {
    id: "tx_005",
    type: "spent",
    amount: -40,
    description: "Learning Session: Machine Learning Basics",
    date: "2024-06-05T13:20:00Z",
    status: "completed",
    category: "learning",
    sessionId: "sess_126",
    partnerName: "David Park",
  },
  {
    id: "tx_006",
    type: "bonus",
    amount: 50,
    description: "Referral Bonus: New user joined through your link",
    date: "2024-06-04T09:30:00Z",
    status: "completed",
    category: "referral",
  },
  {
    id: "tx_007",
    type: "earned",
    amount: 60,
    description: "Teaching Session: UI/UX Design Principles",
    date: "2024-06-03T11:00:00Z",
    status: "completed",
    category: "teaching",
    sessionId: "sess_127",
    partnerName: "Alex Thompson",
  },
  {
    id: "tx_008",
    type: "spent",
    amount: -30,
    description: "Learning Session: Advanced CSS Techniques",
    date: "2024-06-02T15:30:00Z",
    status: "completed",
    category: "learning",
    sessionId: "sess_128",
    partnerName: "Lisa Wang",
  },
  {
    id: "tx_009",
    type: "refund",
    amount: 25,
    description: "Refund: Cancelled Learning Session",
    date: "2024-06-01T14:00:00Z",
    status: "completed",
    category: "system",
    sessionId: "sess_129",
  },
  {
    id: "tx_010",
    type: "earned",
    amount: 45,
    description: "Teaching Session: Git & Version Control",
    date: "2024-05-31T10:45:00Z",
    status: "completed",
    category: "teaching",
    sessionId: "sess_130",
    partnerName: "James Wilson",
  },
];

export default function CreditsPage() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTab, setCurrentTab] = useState("overview");
  const [currentCredits, setCurrentCredits] = useState(mockStats.totalCredits);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handlePurchaseComplete = (newCredits: number) => {
    setCurrentCredits(prev => prev + newCredits);
    // You could also refresh the transactions here
  };

  const filteredTransactions = mockTransactions.filter(transaction => {
    if (selectedFilter === "all") return true;
    return transaction.type === selectedFilter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "earned":
        return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case "spent":
        return <ArrowDownLeft className="h-4 w-4 text-red-600" />;
      case "bonus":
        return <Award className="h-4 w-4 text-purple-600" />;
      case "refund":
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      default:
        return <Coins className="h-4 w-4 text-gray-600" />;
    }
  };

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
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Credits Dashboard</h1>
          <p className="text-gray-600">
            Manage your SkillSwap credits and track your earning history
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="purchase" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Buy Credits
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Credits */}            <Card className="border-l-4 border-l-indigo-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Credits
                </CardTitle>
                <Coins className="h-5 w-5 text-indigo-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {currentCredits.toLocaleString()}
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+12% from last month</span>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Earnings */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Monthly Earnings
                </CardTitle>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {mockStats.monthlyEarnings.toLocaleString()}
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-gray-500">
                    vs {mockStats.monthlySpending} spent
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Average Per Session */}
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Avg Per Session
                </CardTitle>
                <BookOpen className="h-5 w-5 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {mockStats.averagePerSession}
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-gray-500">
                    {mockStats.totalSessions} sessions completed
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Rating */}
            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Teaching Rating
                </CardTitle>
                <Star className="h-5 w-5 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {mockStats.rating}
                </div>
                <div className="flex items-center mt-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.floor(mockStats.rating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 ml-2">Excellent</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Monthly Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Earnings Goal Progress</span>
                    <span className="font-medium">{mockStats.monthlyEarnings} / 500 credits</span>
                  </div>
                  <Progress value={(mockStats.monthlyEarnings / 500) * 100} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="font-semibold text-green-700">Credits Earned</div>
                    <div className="text-2xl font-bold text-green-600">
                      {mockStats.creditsEarned.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="font-semibold text-red-700">Credits Spent</div>
                    <div className="text-2xl font-bold text-red-600">
                      {mockStats.creditsSpent.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <CardTitle className="flex items-center gap-2 mb-4 md:mb-0">
                  <Calendar className="h-5 w-5" />
                  Transaction History
                </CardTitle>
                <div className="flex gap-2">
                  <Tabs value={selectedFilter} onValueChange={setSelectedFilter}>
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="earned">Earned</TabsTrigger>
                      <TabsTrigger value="spent">Spent</TabsTrigger>
                      <TabsTrigger value="bonus">Bonus</TabsTrigger>
                      <TabsTrigger value="refund">Refund</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Partner</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTransactionIcon(transaction.type)}
                            <Badge
                              variant={
                                transaction.type === "earned"
                                  ? "default"
                                  : transaction.type === "spent"
                                  ? "destructive"
                                  : transaction.type === "bonus"
                                  ? "secondary"
                                  : "outline"
                              }
                              className="capitalize"
                            >
                              {transaction.type}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{transaction.description}</div>
                            {transaction.sessionId && (
                              <div className="text-sm text-gray-500">
                                Session ID: {transaction.sessionId}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {transaction.partnerName ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs text-indigo-600">
                                {transaction.partnerName.charAt(0)}
                              </div>
                              <span className="text-sm">{transaction.partnerName}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`font-semibold ${
                              transaction.amount > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {transaction.amount > 0 ? "+" : ""}
                            {transaction.amount} credits
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDate(transaction.date)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(transaction.status)}
                            <span className="capitalize text-sm">{transaction.status}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredTransactions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Coins className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No transactions found for the selected filter.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchase">
          <CreditPurchase 
            currentCredits={currentCredits}
            onPurchaseComplete={handlePurchaseComplete}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
