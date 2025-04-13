iimport './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SkillSwap - Exchange Skills and Knowledge',
  description: 'Connect with others to teach and learn new skills',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  const user = data?.user

  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="border-b border-slate-200">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="font-bold text-xl">
              SkillSwap
            </Link>

            <nav>
              <ul className="flex items-center gap-4">
                {user ? (
                  <>
                    <li>
                      <Link href="/skills" className="text-slate-700 hover:text-slate-900">
                        Skills
                      </Link>
                    </li>
                    <li>
                      <Link href="/profile">
                        <Button variant="outline" size="sm">
                          My Profile
                        </Button>
                      </Link>
                    </li>
                  </>
                ) : (
                  <li>
                    <Link href="/login">
                      <Button variant="default" size="sm">
                        Sign In
                      </Button>
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  )
}
