'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-cast to string
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return redirect(`/login?message=${encodeURIComponent(error.message || 'Could not authenticate user')}`)
  }

  revalidatePath('/', 'layout')
  return redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // type-cast to string
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  // Get origin for redirect URL - works in both development and production
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 
                 process.env.VERCEL_URL || 
                 'http://localhost:3000';
  
  const { error } = await supabase.auth.signUp({
    email: data.email, 
    password: data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        // Store any additional user metadata here if needed
        full_name: formData.get('full_name') as string || '',
      }
    },
  })

  if (error) {
    // Show specific error message rather than generic message
    return redirect(`/login?message=${encodeURIComponent(error.message || 'Could not authenticate user')}`)
  }

  return redirect('/login?message=Check email to continue sign in process')
}