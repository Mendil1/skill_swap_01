import { login, signup } from './actions'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AuthForm } from './auth-form'
import Link from 'next/link'

interface PageProps {
  searchParams: { 
    message?: string 
  }
}

export default async function LoginPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (data?.user) {
    // User is already logged in, redirect them to the home page
    redirect('/')
  }
  
  // Handle searchParams properly in Next.js 15
  const message = searchParams?.message

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