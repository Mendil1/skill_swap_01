"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  Wallet,
  Gift,
  AlertCircle,
  Plus,
  ArrowRight,
} from "lucide-react";

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  bonus: number;
  popular: boolean;
  description: string;
}

const creditPackages: CreditPackage[] = [
  {
    id: "starter",
    name: "Starter Pack",
    credits: 100,
    price: 9.99,
    bonus: 0,
    popular: false,
    description: "Perfect for trying out a few sessions",
  },
  {
    id: "popular",
    name: "Popular Pack",
    credits: 500,
    price: 39.99,
    bonus: 50,
    popular: true,
    description: "Great value for regular learners",
  },
  {
    id: "premium",
    name: "Premium Pack",
    credits: 1000,
    price: 74.99,
    bonus: 150,
    popular: false,
    description: "Best value for power users",
  },
  {
    id: "ultimate",
    name: "Ultimate Pack",
    credits: 2500,
    price: 179.99,
    bonus: 500,
    popular: false,
    description: "Maximum credits for serious learners",
  },
];

interface CreditPurchaseProps {
  currentCredits: number;
  onPurchaseComplete?: (credits: number) => void;
}

export default function CreditPurchase({ currentCredits, onPurchaseComplete }: CreditPurchaseProps) {
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");

  const handlePurchase = async (creditPackage: CreditPackage) => {
    setIsProcessing(true);
    setSelectedPackage(creditPackage);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate success
    onPurchaseComplete?.(creditPackage.credits + creditPackage.bonus);
    setIsProcessing(false);
    setSelectedPackage(null);
  };

  const handleCustomPurchase = async () => {
    const credits = parseInt(customAmount);
    if (credits && credits > 0) {
      setIsProcessing(true);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onPurchaseComplete?.(credits);
      setIsProcessing(false);
      setCustomAmount("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Balance */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-700">
            <Wallet className="h-5 w-5" />
            Current Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-indigo-900 mb-2">
            {currentCredits.toLocaleString()} Credits
          </div>
          <p className="text-sm text-indigo-600">
            Need more credits to book sessions? Choose a package below.
          </p>
        </CardContent>
      </Card>

      {/* Credit Packages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {creditPackages.map((pkg) => (
          <Card 
            key={pkg.id} 
            className={`relative transition-all hover:shadow-lg ${
              pkg.popular ? 'ring-2 ring-indigo-500 scale-105' : ''
            }`}
          >
            {pkg.popular && (
              <Badge 
                className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-indigo-500"
              >
                Most Popular
              </Badge>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-lg">{pkg.name}</CardTitle>
              <div className="text-3xl font-bold text-gray-900">
                {pkg.credits.toLocaleString()}
                <span className="text-sm font-normal text-gray-500"> credits</span>
              </div>
              {pkg.bonus > 0 && (
                <div className="flex items-center justify-center gap-1 text-green-600">
                  <Gift className="h-4 w-4" />
                  <span className="text-sm font-medium">+{pkg.bonus} bonus</span>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 text-center">{pkg.description}</p>
              <div className="text-center">
                <div className="text-2xl font-bold">${pkg.price}</div>
                <div className="text-sm text-gray-500">
                  ${(pkg.price / (pkg.credits + pkg.bonus)).toFixed(3)} per credit
                </div>
              </div>
              <Button 
                className="w-full" 
                onClick={() => handlePurchase(pkg)}
                disabled={isProcessing}
                variant={pkg.popular ? "default" : "outline"}
              >
                {isProcessing && selectedPackage?.id === pkg.id ? (
                  "Processing..."
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Purchase
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Custom Amount */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Custom Amount
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="custom-credits">Credits</Label>
              <Input
                id="custom-credits"
                type="number"
                placeholder="Enter amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                min="1"
                max="10000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Credit Card</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="apple">Apple Pay</SelectItem>
                  <SelectItem value="google">Google Pay</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleCustomPurchase}
                disabled={!customAmount || parseInt(customAmount) <= 0 || isProcessing}
                className="w-full"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Purchase {customAmount || "0"} Credits
              </Button>
            </div>
          </div>
          
          {customAmount && parseInt(customAmount) > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Credits:</span>
                <span>{parseInt(customAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Price per credit:</span>
                <span>$0.10</span>
              </div>
              <div className="flex justify-between font-semibold pt-2 border-t">
                <span>Total:</span>
                <span>${(parseInt(customAmount) * 0.10).toFixed(2)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Processing Dialog */}
      <Dialog open={isProcessing} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Processing Payment
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              Please wait while we process your payment...
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This may take a few moments.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Info Panel */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-blue-900">How Credits Work</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Credits are used to book learning sessions with experts</li>
                <li>• Different sessions cost different amounts based on duration and complexity</li>
                <li>• You earn credits by teaching others your skills</li>
                <li>• Credits never expire and can be accumulated over time</li>
                <li>• Bulk purchases offer better value and bonus credits</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
