import { login, signup } from './actions'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AuthForm } from './auth-form'
import Link from 'next/link'

// In Next.js 15, we need to properly handle searchParams
export default async function LoginPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = await createClient()

  const { data } = await supabase.auth.getSession()

  if (data?.session) {
    // User is already logged in, redirect them to the home page
    redirect('/')
  }
  
  // Create a safe message variable that doesn't directly access searchParams.message
  let message: string | undefined
  
  try {
    // Using a separate variable to avoid direct property access
    const messageParam = searchParams.message
    message = typeof messageParam === 'string' ? messageParam : undefined
  } catch (e) {
    // Handle any errors with searchParams access
    message = undefined
  }

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
          {message ? (
            <Alert className="mb-4 bg-slate-100">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          ) : null}
          
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