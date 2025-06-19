import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
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

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Next.js 15.3 approved async searchParams handling
  const resolvedParams = await searchParams;
  const searchEntries: string[][] = Object.entries(resolvedParams ?? {}).map(([key, value]) => [
    key,
    Array.isArray(value) ? value[0] || "" : value || "",
  ]);
  const params = new URLSearchParams(searchEntries);
  const message = params.get("message");
  // Supabase auth check with async client and error handling
  const supabase = await createClient();

  let user = null;
  try {
    const { data, error } = await supabase.auth.getUser();

    // Handle invalid refresh token errors gracefully
    if (
      error &&
      (error.message.includes("Invalid Refresh Token") ||
        error.message.includes("Refresh Token Not Found"))
    ) {
      console.log("[Login] Invalid refresh token detected, clearing session");
      try {
        await supabase.auth.signOut();
      } catch (signOutError) {
        console.error("[Login] Error during signOut:", signOutError);
      }
      // Continue with user = null (show login form)
    } else if (!error && data?.user) {
      user = data.user;
    }
  } catch (error) {
    console.error("[Login] Error checking auth:", error);
    // Continue with user = null (show login form)
  }

  if (user) redirect("/");

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
          )}

          <AuthForm />
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
