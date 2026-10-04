import createIntlMiddleware from 'next-intl/middleware'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from './i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)
const protectedPaths = new Set(['cabinet', 'favorites', 'history', 'profile'])

export default async function middleware(request: NextRequest) {
  const response = intlMiddleware(request)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookies) {
          cookies.forEach(({ name, value }) => request.cookies.set(name, value))
          cookies.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )
  // getUser validates the token and refreshes expired cookies.
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const parts = request.nextUrl.pathname.split('/').filter(Boolean)
  const locale =
    routing.locales.find((item) => item === parts[0]) ?? routing.defaultLocale
  const route = parts[0] === locale ? parts.slice(1) : parts
  if (protectedPaths.has(route[0]) && !user) {
    const target = new URL(`/${locale}/login`, request.url)
    target.searchParams.set(
      'redirect',
      `/${route.join('/')}${request.nextUrl.search}`,
    )
    const redirect = NextResponse.redirect(target, { status: 302 })
    response.cookies
      .getAll()
      .forEach(({ name, value, ...options }) =>
        redirect.cookies.set(name, value, options),
      )
    return redirect
  }
  return response
}

export const config = {
  matcher: ['/((?!api|auth|_next|_vercel|.*\\..*).*)'],
}
