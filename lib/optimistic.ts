export type OptimisticResult<T> = { ok: true; data: T } | { ok: false; error: unknown }

/** Apply immediately, then restore the previous state if the write fails. */
export async function runOptimistic<T>(opts: {
  apply: () => void
  mutate: () => Promise<T>
  rollback: () => void
}): Promise<OptimisticResult<T>> {
  opts.apply()
  try {
    return { ok: true, data: await opts.mutate() }
  } catch (error) {
    opts.rollback()
    return { ok: false, error }
  }
}
