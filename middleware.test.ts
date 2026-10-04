import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

let refresh = false
const delayed = new Map<string, Promise<void>>()
vi.mock('next-intl/middleware', () => ({
  default: () => () => NextResponse.next(),
}))
vi.mock('@supabase/ssr', () => ({
  createServerClient: (
    _url: string,
    _key: string,
    options: {
      cookies: {
        getAll: () => { name: string; value: string }[]
        setAll: (
          cookies: { name: string; value: string; options: { path: string } }[],
        ) => void
      }
    },
  ) => {
    const identity =
      options.cookies.getAll().find((c) => c.name === 'identity')?.value ?? null
    return {
      auth: {
        getUser: async () => {
          if (identity) await delayed.get(identity)
          if (refresh)
            options.cookies.setAll([
              { name: 'sb-session', value: 'fresh', options: { path: '/' } },
            ])
          return { data: { user: identity ? { id: identity } : null } }
        },
      },
    }
  },
}))
import middleware from './middleware'

beforeEach(() => {
  refresh = false
  delayed.clear()
})
function req(path: string, identity?: string) {
  return new NextRequest(
    `http://localhost:3000${path}`,
    identity ? { headers: { cookie: `identity=${identity}` } } : undefined,
  )
}
describe('middleware session and route boundary', () => {
  it('protects the four private route prefixes and keeps a local return destination', async () => {
    for (const route of ['cabinet', 'favorites', 'history', 'profile']) {
      const res = await middleware(req(`/en/${route}/entry?tab=one`))
      expect(res.status).toBe(302)
      expect(res.headers.get('location')).toBe(
        `http://localhost:3000/en/login?redirect=%2F${route}%2Fentry%3Ftab%3Done`,
      )
    }
  })
  it('passes authenticated requests and forwards refreshed cookies', async () => {
    refresh = true
    const res = await middleware(req('/zh/profile', 'B'))
    expect(res.status).toBe(200)
    expect(res.cookies.get('sb-session')?.value).toBe('fresh')
  })
  it('keeps refresh cookies on an unauthenticated redirect and leaves public pages open', async () => {
    refresh = true
    const res = await middleware(req('/zh/cabinet'))
    expect(res.status).toBe(302)
    expect(res.cookies.get('sb-session')?.value).toBe('fresh')
    const publicRes = await middleware(req('/zh/recipes'))
    expect(publicRes.status).toBe(200)
  })
  it('does not use a late A identity to authorize B or a guest request', async () => {
    let releaseA!: () => void
    delayed.set(
      'A',
      new Promise<void>((resolve) => {
        releaseA = resolve
      }),
    )
    const oldRequest = middleware(req('/zh/profile', 'A'))
    const newRequest = middleware(req('/zh/profile', 'B'))
    const guestRequest = middleware(req('/zh/profile'))
    expect((await newRequest).status).toBe(200)
    expect((await guestRequest).status).toBe(302)
    releaseA()
    expect((await oldRequest).status).toBe(200)
  })
})
