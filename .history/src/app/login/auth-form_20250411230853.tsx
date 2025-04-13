'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'

interface AuthFormProps {
  login: (formData: FormData) => Promise<void>
  signup: (formData: FormData) => Promise<void>
}

export function AuthForm({ login, signup }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="yourname@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="flex flex-col space-y-2">
        <form action={login}>
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="password" value={password} />
          <Button type="submit" className="w-full">
            Log in
          </Button>
        </form>
        
        <form action={signup}>
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="password" value={password} />
          <Button type="submit" variant="outline" className="w-full">
            Sign up
          </Button>
        </form>
      </div>
    </div>
  )
}