import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;
  const errorMessage = params?.message || "An unexpected error occurred";

  return (
    <div className="container flex flex-col items-center justify-center min-h-[80vh] py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Error</CardTitle>
          <CardDescription>Something went wrong</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{errorMessage}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Possible solutions:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Try logging out and logging back in</li>
              <li>Clear your browser cookies</li>
              <li>If using an email link, request a new one</li>
              <li>Contact support if the problem persists</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center space-x-4">
          <Link href="/">
            <Button variant="outline">Return Home</Button>
          </Link>

          <Link href="/login">
            <Button>Login Again</Button>
          </Link>

          <Link href="/auth/logout">
            <Button variant="destructive">Force Logout</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
