"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Plus, Minus, ArrowUpRight, ArrowDownLeft, Clock, User } from "lucide-react";

// Mock credit data for production mode
const MOCK_CREDIT_DATA = {
  currentBalance: 15,
  transactions: [
    {
      id: "txn-1",
      type: "earned",
      amount: 5,
      description: "Completed JavaScript tutoring session with Alice Johnson",
      timestamp: "2025-06-13T10:30:00Z",
      status: "completed",
    },
    {
      id: "txn-2",
      type: "spent",
      amount: 3,
      description: "Python programming session with Bob Smith",
      timestamp: "2025-06-12T15:45:00Z",
      status: "completed",
    },
    {
      id: "txn-3",
      type: "earned",
      amount: 4,
      description: "UI/UX design consultation with Carol Chen",
      timestamp: "2025-06-11T09:15:00Z",
      status: "completed",
    },
    {
      id: "txn-4",
      type: "spent",
      amount: 2,
      description: "DevOps workshop participation",
      timestamp: "2025-06-10T14:20:00Z",
      status: "completed",
    },
    {
      id: "txn-5",
      type: "bonus",
      amount: 10,
      description: "Welcome bonus for joining SkillSwap",
      timestamp: "2025-06-09T12:00:00Z",
      status: "completed",
    },
  ],
};

function formatTimeAgo(timestamp: string) {
  const now = new Date();
  const txnTime = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - txnTime.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
}

function TransactionCard({
  transaction,
}: {
  transaction: (typeof MOCK_CREDIT_DATA.transactions)[0];
}) {
  const isEarned = transaction.type === "earned" || transaction.type === "bonus";
  const Icon = isEarned ? ArrowUpRight : ArrowDownLeft;
  const colorClass = isEarned ? "text-green-600" : "text-red-600";
  const bgClass = isEarned ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200";
  const amountPrefix = isEarned ? "+" : "-";

  return (
    <Card className={`${bgClass} border transition-colors hover:shadow-sm`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={`rounded-full border bg-white p-2 ${isEarned ? "border-green-200" : "border-red-200"}`}
          >
            <Icon className={`h-4 w-4 ${colorClass}`} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center justify-between">
              <span className={`text-lg font-medium ${colorClass}`}>
                {amountPrefix}
                {transaction.amount} credits
              </span>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-3 w-3" />
                {formatTimeAgo(transaction.timestamp)}
              </div>
            </div>
            <p className="mb-2 text-sm text-gray-700">{transaction.description}</p>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-1 text-xs ${
                  transaction.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {transaction.status}
              </span>
              <span className="text-xs font-medium uppercase text-gray-500">
                {transaction.type}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProductionCreditsPage() {
  const [isProduction, setIsProduction] = useState(false);

  useEffect(() => {
    setIsProduction(process.env.NODE_ENV === "production");
  }, []);

  const { currentBalance, transactions } = MOCK_CREDIT_DATA;
  const totalEarned = transactions
    .filter((t) => t.type === "earned" || t.type === "bonus")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalSpent = transactions
    .filter((t) => t.type === "spent")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Production Mode Banner */}
      {isProduction && (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
            <p className="text-sm font-medium text-yellow-800">
              Production Demo Mode - Showing sample credit data
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Credit Balance Overview */}
        <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Coins className="h-8 w-8" />
                <div>
                  <CardTitle className="text-2xl">Credit Balance</CardTitle>
                  <CardDescription className="text-indigo-100">
                    Your SkillSwap credits
                  </CardDescription>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{currentBalance}</div>
                <div className="text-sm text-indigo-100">credits available</div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Credit Statistics */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="mb-2 text-2xl font-bold text-green-600">{totalEarned}</div>
              <div className="text-sm text-gray-600">Total Earned</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="mb-2 text-2xl font-bold text-red-600">{totalSpent}</div>
              <div className="text-sm text-gray-600">Total Spent</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="mb-2 text-2xl font-bold text-indigo-600">{transactions.length}</div>
              <div className="text-sm text-gray-600">Total Transactions</div>
            </CardContent>
          </Card>
        </div>

        {/* How Credits Work */}
        <Card>
          <CardHeader>
            <CardTitle>How SkillSwap Credits Work</CardTitle>
            <CardDescription>
              Earn and spend credits by teaching and learning skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="flex items-center gap-2 font-medium text-green-600">
                  <Plus className="h-4 w-4" />
                  Earn Credits
                </h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Teaching sessions: 3-5 credits per hour</li>
                  <li>• Skill consultations: 2-4 credits per session</li>
                  <li>• Mentoring: 4-6 credits per session</li>
                  <li>• Workshop hosting: 5-10 credits</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="flex items-center gap-2 font-medium text-red-600">
                  <Minus className="h-4 w-4" />
                  Spend Credits
                </h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Learning sessions: 2-4 credits per hour</li>
                  <li>• Skill consultations: 1-3 credits per session</li>
                  <li>• Workshop participation: 2-5 credits</li>
                  <li>• Premium features: 1-2 credits</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your credit earning and spending history</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))
            ) : (
              <div className="py-8 text-center text-gray-500">
                <Coins className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">No transactions yet</h3>
                <p className="mb-4 text-gray-500">
                  Start teaching or learning to earn your first credits
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/sessions">
                <Button>Browse Sessions</Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline">
                  <User className="mr-2 h-4 w-4" />
                  View Profile
                </Button>
              </Link>
              <Link href="/messages">
                <Button variant="outline">View Messages</Button>
              </Link>
              <Link href="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Development Note */}
        {!isProduction && (
          <Card className="border-dashed border-gray-300">
            <CardContent className="pt-6">
              <div className="text-center text-gray-500">
                <Coins className="mx-auto mb-2 h-8 w-8" />
                <p className="text-sm">
                  <strong>Development Mode:</strong> In production, this page would show real credit
                  balance and transaction history from the database.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
