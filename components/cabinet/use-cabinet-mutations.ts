'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { runOptimistic } from '@/lib/optimistic'
import { createClient } from '@/lib/supabase/client'
import {
  addUserBottle,
  fetchUserBottles,
  removeUserBottle,
  updateUserBottleStatus,
  type BottleCatalogRow,
  type UserBottleRow,
} from '@/lib/supabase/queries'

export interface CabinetMutations {
  rows: UserBottleRow[]
  errorKey: 'mutationFailed' | null
  clearError: () => void
  refreshFailed: boolean
  refreshing: boolean
  retryRefresh: () => Promise<void>
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
  const [refreshFailed, setRefreshFailed] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const readSequence = useRef(0)
  const needsRefresh = useRef(false)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      readSequence.current += 1
    }
  }, [])

  function commit(next: UserBottleRow[]) {
    if (!mounted.current) return
    rowsRef.current = next
    setRows(next)
  }

  async function refreshRows() {
    if (!mounted.current || inFlight.current.size > 0) return
    const sequence = ++readSequence.current
    setRefreshing(true)
    try {
      const authoritativeRows = await fetchUserBottles(sb)
      if (!mounted.current || sequence !== readSequence.current) return
      commit(authoritativeRows)
      setRefreshFailed(false)
      router.refresh()
    } catch {
      if (mounted.current && sequence === readSequence.current) setRefreshFailed(true)
    } finally {
      if (mounted.current && sequence === readSequence.current) setRefreshing(false)
    }
  }

  function begin(key: string) {
    inFlight.current.add(key)
    readSequence.current += 1
    setRefreshing(false)
  }

  async function finish(key: string) {
    inFlight.current.delete(key)
    if (needsRefresh.current && inFlight.current.size === 0) {
      needsRefresh.current = false
      await refreshRows()
    }
  }

  async function addRow(tempRow: UserBottleRow, mutate: () => Promise<UserBottleRow>, catalog: BottleCatalogRow | null): Promise<boolean> {
    const result = await runOptimistic({
      apply: () => commit([tempRow, ...rowsRef.current]),
      mutate,
      rollback: () => commit(rowsRef.current.filter((row) => row.id !== tempRow.id)),
    })
    if (!result.ok || !mounted.current) return false
    const saved = {
      ...result.data,
      bottles_catalog: result.data.bottles_catalog ?? catalog,
    } as UserBottleRow
    commit(rowsRef.current.map((row) => row.id === tempRow.id ? saved : row))
    needsRefresh.current = true
    return true
  }

  return {
    rows,
    errorKey,
    clearError: () => setErrorKey(null),
    refreshFailed,
    refreshing,
    retryRefresh: refreshRows,

    async addCatalog(bottle, status) {
      const key = `catalog:${bottle.id}`
      if (inFlight.current.has(key) || rowsRef.current.some((row) => row.bottle_id === bottle.id)) return false
      begin(key)
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
        await finish(key)
      }
    },

    async addCustom(input, status) {
      if (inFlight.current.has('custom')) return false
      begin('custom')
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
      try {
        return await addRow(tempRow, () => addUserBottle(sb, input, status), null)
      } finally {
        await finish('custom')
      }
    },

    async toggleStatus(id) {
      if (inFlight.current.has(id)) return
      const current = rowsRef.current.find((row) => row.id === id)
      if (!current) return
      begin(id)
      setErrorKey(null)
      const nextStatus: 'owned' | 'wishlist' = current.status === 'owned' ? 'wishlist' : 'owned'
      try {
        const result = await runOptimistic({
          apply: () => commit(rowsRef.current.map((row) => row.id === id ? { ...row, status: nextStatus } : row)),
          mutate: () => updateUserBottleStatus(sb, id, nextStatus),
          rollback: () => commit(rowsRef.current.map((row) => row.id === id ? { ...row, status: current.status } : row)),
        })
        if (result.ok) needsRefresh.current = true
        else if (mounted.current) setErrorKey('mutationFailed')
      } finally {
        await finish(id)
      }
    },

    async remove(id) {
      if (inFlight.current.has(id)) return
      const index = rowsRef.current.findIndex((row) => row.id === id)
      if (index < 0) return
      const removed = rowsRef.current[index]
      begin(id)
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
        if (result.ok) needsRefresh.current = true
        else if (mounted.current) setErrorKey('mutationFailed')
      } finally {
        await finish(id)
      }
    },
  }
}
