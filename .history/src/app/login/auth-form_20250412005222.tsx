'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface AuthFormProps {
  login: (formData: FormData) => Promise<void>
  signup: (formData: FormData) => Promise<void>
}

export function AuthForm({ login, signup }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  
  // Validate password as user types
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setPassword(newPassword)
    
    // Check password length only in signup mode
    if (mode === 'signup') {
      if (newPassword.length > 0 && newPassword.length < 6) {
        setPasswordError('Password must be at least 6 characters')
      } else {
        setPasswordError(null)
      }
    } else {
      setPasswordError(null)
    }
  }
  
  // Validate before form submission
  const handleSignupSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }
    
    // Submit the form using the signup function
    const formData = new FormData(e.currentTarget)
    signup(formData)
  }

  return (
    <Tabs defaultValue="login" onValueChange={(value) => {
      setMode(value as 'login' | 'signup')
      setPasswordError(null) // Clear errors when switching tabs
    }}>
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="login">Log In</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      
      <TabsContent value="login" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email-login">Email</Label>
          <Input
            id="email-login"
            name="email"
            type="email"
            placeholder="yourname@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password-login">Password</Label>
          <Input
            id="password-login"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={handlePasswordChange}
          />
        </div>

        <form action={login}>
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="password" value={password} />
          <Button type="submit" className="w-full">
            Log in
          </Button>
        </form>
      </TabsContent>
      
      <TabsContent value="signup" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email-signup">Email</Label>
          <Input
            id="email-signup"
            name="email"
            type="email"
            placeholder="yourname@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password-signup">Password</Label>
          <Input
            id="password-signup"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={handlePasswordChange}
            className={passwordError ? "border-red-500" : ""}
          />
          {passwordError ? (
            <Alert variant="destructive" className="py-2 mt-1">
              <AlertDescription className="text-xs">{passwordError}</AlertDescription>
            </Alert>
          ) : (
            <p className="text-xs text-slate-500 mt-1">
              Password must be at least 6 characters
            </p>
          )}
        </div>

        <form onSubmit={handleSignupSubmit}>
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="password" value={password} />
          <Button type="submit" className="w-full">
            Create Account
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  )
}