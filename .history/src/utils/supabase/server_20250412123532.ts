import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll().map(cookie => ({
            name: cookie.name,
            value: cookie.value,
            ...cookie.attributes
          }))
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, ...options }) => {
            cookieStore.set({
              name,
              value,
              ...options,
              // Next.js 15.3 security requirements
              httpOnly: true,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
              path: '/'
            })
          })
        }
      }
    }
  )
}

export default createClient