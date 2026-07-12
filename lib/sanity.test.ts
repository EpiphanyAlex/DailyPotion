import { describe, expect, it } from 'vitest'
import { add } from '@/lib/sanity'

describe('vitest toolchain sanity', () => {
  it('runs typescript tests and resolves the @/* alias', () => {
    expect(add(1, 2)).toBe(3)
  })
})
