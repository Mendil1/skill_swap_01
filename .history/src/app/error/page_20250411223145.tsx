import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function ErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-red-600">Authentication Error</CardTitle>
          <CardDescription>
            There was a problem with your authentication request
          </CardDescription>
        </CardHeader>
        <CardContent className="text-slate-700">
          <p>
            We couldn't complete your authentication. This could be due to:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>An expired or invalid confirmation link</li>
            <li>An already used confirmation link</li>
            <li>A system issue with authentication</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Link href="/login" className="w-full">
            <Button className="w-full">
              Return to Login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}