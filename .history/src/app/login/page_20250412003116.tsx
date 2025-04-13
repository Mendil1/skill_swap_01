import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AuthForm } from './auth-form'
import { login, signup } from './actions'
import Link from 'next/link'

export default async function LoginPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Next.js 15.3 compliant searchParams access
  const messageParam = searchParams?.message
  const message = Array.isArray(messageParam)
    ? decodeURIComponent(messageParam[0])
    : messageParam
    ? decodeURIComponent(messageParam)
    : undefined

  // Supabase auth check
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/')

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
            By signing up, you agree to our {' '}
            <Link href="/terms" className="underline hover:text-slate-800">Terms</Link> and {' '}
            <Link href="/privacy" className="underline hover:text-slate-800">Privacy Policy</Link>.
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}