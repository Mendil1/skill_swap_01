import { login, signup } from './actions'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AuthForm } from './auth-form'
import Link from 'next/link'

// Define proper types for page props
interface PageProps {
  searchParams?: { 
    [key: string]: string | string[] | undefined 
  }
}

// Helper function to safely resolve searchParams asynchronously
async function resolveSearchParams(params: any) {
  // Convert params to URLSearchParams format
  return new URLSearchParams(
    Array.isArray(params) ? params : Object.entries(params ?? {})
  );
}

// Helper function to safely extract message parameter
function getMessageParam(params: URLSearchParams): string | undefined {
  const message = params.get('message');
  return message || undefined;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  const { data } = await supabase.auth.getSession()

  if (data?.session) {
    // User is already logged in, redirect them to the home page
    redirect('/')
  }
  
  // First resolve searchParams asynchronously
  const resolvedParams = await resolveSearchParams(searchParams || {});
  
  // Now safely access message
  const message = getMessageParam(resolvedParams);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to SkillSwap</CardTitle>
          <CardDescription>
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert className="mb-4 bg-slate-100">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          
          <AuthForm login={login} signup={signup} />
        </CardContent>
        <CardFooter className="justify-center text-center text-sm text-slate-500">
          <div>
            By signing up, you agree to our <Link href="/terms" className="underline hover:text-slate-800">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-slate-800">Privacy Policy</Link>.
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}