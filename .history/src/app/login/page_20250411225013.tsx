import { login, signup } from './actions'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  const supabase = await createClient()

  const { data } = await supabase.auth.getSession()

  if (data?.session) {
    // User is already logged in, redirect them to the home page
    redirect('/')
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
          {searchParams?.message && (
            <Alert className="mb-4 bg-slate-100">
              <AlertDescription>{searchParams.message}</AlertDescription>
            </Alert>
          )}
          
          {/* Using two separate forms for login and signup */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="yourname@example.com"
                required
                form="auth-form"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                form="auth-form"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <form action={login} id="auth-form">
                <Button type="submit" className="w-full">
                  Log in
                </Button>
              </form>
              <form action={signup}>
                <input type="hidden" name="email" id="signup-email" />
                <input type="hidden" name="password" id="signup-password" />
                <Button type="submit" variant="outline" className="w-full" onClick={(e) => {
                  // Copy values from the visible form to the hidden signup form fields
                  const email = document.getElementById('email') as HTMLInputElement;
                  const password = document.getElementById('password') as HTMLInputElement;
                  
                  if (email && password) {
                    (document.getElementById('signup-email') as HTMLInputElement).value = email.value;
                    (document.getElementById('signup-password') as HTMLInputElement).value = password.value;
                  }
                }}>
                  Sign up
                </Button>
              </form>
            </div>
          </div>
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