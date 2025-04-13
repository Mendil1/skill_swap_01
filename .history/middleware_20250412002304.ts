import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function middleware(request: Request) {
  const { pathname } = new URL(request.url)
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes
  const protectedRoutes = ['/dashboard', '/profile', '/skills']
  
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}