'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import {
  authErrorKey,
  isPasswordLongEnough,
  isValidEmail,
  safeRedirectPath,
  type AuthActionResult,
} from '@/lib/auth-helpers'
import type { Locale } from '@/lib/matching'

function validLocale(locale: Locale): Locale {
  return locale === 'en' ? 'en' : 'zh'
}
async function origin() {
  const h = await headers()
  const requestOrigin = h.get('origin')
  if (requestOrigin) return new URL(requestOrigin).origin
  const host = h.get('x-forwarded-host') ?? h.get('host')
  if (!host) throw new Error('Missing host')
  const protocol =
    h.get('x-forwarded-proto') ??
    (host.startsWith('localhost') || host.startsWith('127.0.0.1')
      ? 'http'
      : 'https')
  return `${protocol}://${host}`
}

export async function signIn(input: {
  email: string
  password: string
  locale: Locale
  redirectTo: string | null
}): Promise<AuthActionResult> {
  if (!isValidEmail(input.email) || !isPasswordLongEnough(input.password))
    return { errorKey: 'auth.errors.invalidInput' }
  const sb = await createServerSupabase()
  const { error } = await sb.auth.signInWithPassword({
    email: input.email.trim(),
    password: input.password,
  })
  if (error) return { errorKey: authErrorKey(error.code) }
  revalidatePath('/', 'layout')
  redirect(
    `/${validLocale(input.locale)}${safeRedirectPath(input.redirectTo) ?? ''}`,
  )
}

export async function signUp(input: {
  email: string
  password: string
  locale: Locale
  redirectTo?: string | null
}): Promise<AuthActionResult> {
  if (!isValidEmail(input.email) || !isPasswordLongEnough(input.password))
    return { errorKey: 'auth.errors.invalidInput' }
  const sb = await createServerSupabase()
  const login = new URL(`/${validLocale(input.locale)}/login`, await origin())
  login.searchParams.set('confirmed', '1')
  const destination = safeRedirectPath(input.redirectTo)
  if (destination) login.searchParams.set('redirect', destination)
  const next = encodeURIComponent(`${login.pathname}${login.search}`)
  const { error } = await sb.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      emailRedirectTo: `${await origin()}/auth/callback?next=${next}`,
    },
  })
  return { errorKey: error ? authErrorKey(error.code) : null }
}

export async function signOut(locale: Locale): Promise<void> {
  const sb = await createServerSupabase()
  const { error } = await sb.auth.signOut()
  if (error) throw error
  revalidatePath('/', 'layout')
  redirect(`/${validLocale(locale)}`)
}

export async function resetPassword(input: {
  email: string
  locale: Locale
}): Promise<AuthActionResult> {
  if (!isValidEmail(input.email))
    return { errorKey: 'auth.errors.invalidInput' }
  const sb = await createServerSupabase()
  const next = encodeURIComponent(
    `/${validLocale(input.locale)}/reset-password?step=update`,
  )
  const { error } = await sb.auth.resetPasswordForEmail(input.email.trim(), {
    redirectTo: `${await origin()}/auth/callback?next=${next}`,
  })
  return { errorKey: error ? authErrorKey(error.code) : null }
}

export async function updatePassword(input: {
  password: string
  locale: Locale
}): Promise<AuthActionResult> {
  if (!isPasswordLongEnough(input.password))
    return { errorKey: 'auth.errors.weakPassword' }
  const sb = await createServerSupabase()
  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) return { errorKey: 'auth.errors.sessionExpired' }
  const { error } = await sb.auth.updateUser({ password: input.password })
  if (error) return { errorKey: authErrorKey(error.code) }
  revalidatePath('/', 'layout')
  redirect(`/${validLocale(input.locale)}`)
}
