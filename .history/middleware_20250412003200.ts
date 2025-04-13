import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function middleware(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = new URL(request.url)

  // Protected routes
  const protectedRoutes = ['/dashboard', '/profile', '/skills']

  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}