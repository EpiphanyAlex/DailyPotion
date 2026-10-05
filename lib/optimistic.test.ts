import { describe, expect, it } from 'vitest'
import { runOptimistic } from './optimistic'

describe('runOptimistic', () => {
  it('applies before the write resolves and keeps the successful result', async () => {
    const events: string[] = []
    const result = await runOptimistic({
      apply: () => events.push('apply'),
      mutate: async () => {
        events.push('mutate')
        return 'saved'
      },
      rollback: () => events.push('rollback'),
    })
    expect(result).toEqual({ ok: true, data: 'saved' })
    expect(events).toEqual(['apply', 'mutate'])
  })

  it('rolls back and returns the write error', async () => {
    const events: string[] = []
    const failure = new Error('offline')
    const result = await runOptimistic({
      apply: () => events.push('apply'),
      mutate: async () => {
        events.push('mutate')
        throw failure
      },
      rollback: () => events.push('rollback'),
    })
    expect(result).toEqual({ ok: false, error: failure })
    expect(events).toEqual(['apply', 'mutate', 'rollback'])
  })
})
