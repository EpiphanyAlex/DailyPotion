'use client'

import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { runOptimistic } from '@/lib/optimistic'
import { createClient } from '@/lib/supabase/client'
import {
  addUserBottle,
  removeUserBottle,
  updateUserBottleStatus,
  type BottleCatalogRow,
  type UserBottleRow,
} from '@/lib/supabase/queries'

export interface CabinetMutations {
  rows: UserBottleRow[]
  errorKey: 'mutationFailed' | null
  clearError: () => void
  addCatalog: (bottle: BottleCatalogRow, status: 'owned' | 'wishlist') => Promise<boolean>
  addCustom: (input: { customName: string; spiritTypeId: string; volumeMl?: number }, status: 'owned' | 'wishlist') => Promise<boolean>
  toggleStatus: (id: string) => Promise<void>
  remove: (id: string) => Promise<void>
}

/** The user_bottles rows are the only cabinet state; every view is derived from them. */
export function useCabinetMutations(initialRows: UserBottleRow[]): CabinetMutations {
  const sb = useMemo(() => createClient(), [])
  const router = useRouter()
  const [rows, setRows] = useState<UserBottleRow[]>(initialRows)
  const rowsRef = useRef(rows)
  const inFlight = useRef(new Set<string>())
  const [errorKey, setErrorKey] = useState<'mutationFailed' | null>(null)

  function commit(next: UserBottleRow[]) {
    rowsRef.current = next
    setRows(next)
  }

  async function addRow(tempRow: UserBottleRow, mutate: () => Promise<UserBottleRow>, catalog: BottleCatalogRow | null): Promise<boolean> {
    const result = await runOptimistic({
      apply: () => commit([tempRow, ...rowsRef.current]),
      mutate,
      rollback: () => commit(rowsRef.current.filter((row) => row.id !== tempRow.id)),
    })
    if (!result.ok) return false
    const saved = {
      ...result.data,
      bottles_catalog: result.data.bottles_catalog ?? catalog,
    } as UserBottleRow
    commit(rowsRef.current.map((row) => row.id === tempRow.id ? saved : row))
    router.refresh()
    return true
  }

  return {
    rows,
    errorKey,
    clearError: () => setErrorKey(null),

    async addCatalog(bottle, status) {
      const key = `catalog:${bottle.id}`
      if (inFlight.current.has(key) || rowsRef.current.some((row) => row.bottle_id === bottle.id)) return false
      inFlight.current.add(key)
      const tempRow = {
        id: `temp-${crypto.randomUUID()}`,
        bottle_id: bottle.id,
        custom_name: null,
        spirit_type_id: null,
        volume_ml: null,
        status,
        created_at: new Date().toISOString(),
        bottles_catalog: bottle,
      } as unknown as UserBottleRow
      try {
        return await addRow(tempRow, () => addUserBottle(sb, { bottleId: bottle.id }, status), bottle)
      } finally {
        inFlight.current.delete(key)
      }
    },

    async addCustom(input, status) {
      const tempRow = {
        id: `temp-${crypto.randomUUID()}`,
        bottle_id: null,
        custom_name: input.customName,
        spirit_type_id: input.spiritTypeId,
        volume_ml: input.volumeMl ?? null,
        status,
        created_at: new Date().toISOString(),
        bottles_catalog: null,
      } as unknown as UserBottleRow
      return addRow(tempRow, () => addUserBottle(sb, input, status), null)
    },

    async toggleStatus(id) {
      if (inFlight.current.has(id)) return
      const current = rowsRef.current.find((row) => row.id === id)
      if (!current) return
      inFlight.current.add(id)
      setErrorKey(null)
      const nextStatus: 'owned' | 'wishlist' = current.status === 'owned' ? 'wishlist' : 'owned'
      try {
        const result = await runOptimistic({
          apply: () => commit(rowsRef.current.map((row) => row.id === id ? { ...row, status: nextStatus } : row)),
          mutate: () => updateUserBottleStatus(sb, id, nextStatus),
          rollback: () => commit(rowsRef.current.map((row) => row.id === id ? { ...row, status: current.status } : row)),
        })
        if (result.ok) router.refresh()
        else setErrorKey('mutationFailed')
      } finally {
        inFlight.current.delete(id)
      }
    },

    async remove(id) {
      if (inFlight.current.has(id)) return
      const index = rowsRef.current.findIndex((row) => row.id === id)
      if (index < 0) return
      const removed = rowsRef.current[index]
      inFlight.current.add(id)
      setErrorKey(null)
      try {
        const result = await runOptimistic({
          apply: () => commit(rowsRef.current.filter((row) => row.id !== id)),
          mutate: () => removeUserBottle(sb, id),
          rollback: () => {
            const restored = [...rowsRef.current]
            restored.splice(Math.min(index, restored.length), 0, removed)
            commit(restored)
          },
        })
        if (result.ok) router.refresh()
        else setErrorKey('mutationFailed')
      } finally {
        inFlight.current.delete(id)
      }
    },
  }
}
