import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }))
        },
        set(name: any, value: any, options: string | ResponseCookie) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: any, options: string | ResponseCookie) {
          cookieStore.set({ name, value: '', ...options })
        }
      }
    }
  )
}

export default createClient