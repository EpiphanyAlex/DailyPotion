import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { safeRedirectPath } from '@/lib/auth-helpers'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const next = safeRedirectPath(url.searchParams.get('next')) ?? '/zh'
  const code = url.searchParams.get('code')
  if (code) {
    const sb = await createServerSupabase()
    const { error } = await sb.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(new URL(next, url.origin))
  }
  return NextResponse.redirect(new URL('/zh/login?error=callback', url.origin))
}
