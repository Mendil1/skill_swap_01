'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'

interface AuthFormProps {
  login: (formData: FormData) => Promise<void>
  signup: (formData: FormData) => Promise<void>
}

export function AuthForm({ login, signup }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  return (
    <Tabs defaultValue="login" onValueChange={(value) => setMode(value as 'login' | 'signup')}>
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
            onChange={(e) => setPassword(e.target.value)}
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
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="text-xs text-slate-500 mt-1">
            Password must be at least 6 characters
          </p>
        </div>

        <form action={signup}>
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