"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthForm } from "./auth-form";
import Link from "next/link";

export default function LoginPageClient() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  const message = searchParams.get("message");
  const returnUrl = searchParams.get("returnUrl");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // If user is already authenticated, redirect to intended page or home
    if (mounted && !loading && user) {
      console.log("[LoginPage] User already authenticated, redirecting...");
      const redirectTo = returnUrl && returnUrl !== "/login" ? returnUrl : "/";
      router.push(redirectTo);
    }
  }, [user, loading, mounted, returnUrl, router]);

  // Don't render anything until mounted and auth loading is complete
  if (!mounted || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user is authenticated, don't show the form (redirect is in progress)
  if (user) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to SkillSwap</CardTitle>
          <CardDescription>Sign in to your account or create a new one</CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert className="mb-4 bg-slate-100">
              <AlertDescription>{decodeURIComponent(message)}</AlertDescription>
            </Alert>
          )}{" "}
          <AuthForm error={message ? decodeURIComponent(message) : undefined} />
        </CardContent>
        <CardFooter className="justify-center text-center text-sm text-slate-500">
          <div>
            By signing up, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-slate-800">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-slate-800">
              Privacy Policy
            </Link>
            .
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
