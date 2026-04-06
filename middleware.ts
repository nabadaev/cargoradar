import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    // Check for Supabase auth cookie (supabase stores session in sb-*-auth-token cookie)
    const hasCookie = Array.from(request.cookies.getAll()).some(
      (c) => c.name.includes('auth-token') || c.name.startsWith('sb-'),
    )

    if (!hasCookie) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
