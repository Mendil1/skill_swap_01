import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

export function createClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          const cookieStore = await cookies()
          return cookieStore.getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }))
        },
        async setAll(cookiesToSet) {
          const cookieStore = cookies()
          cookiesToSet.forEach(({ name, value, ...options }) => {
            cookieStore.set({
              name,
              value,
              ...options,
              // Security settings for Next.js 15.3
              httpOnly: true,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production'
            })
          })
        }
      }
    }
  )
}

export default createClient