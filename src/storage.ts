import { useEffect, useState, useCallback } from 'react'
import type { AppData, Box } from './types'

type ImportResult = { ok: boolean; error?: string }

const STORAGE_KEY = 'crm_traslochi_v1'

const emptyData: AppData = {
  version: 1,
  moveName: 'Il mio trasloco',
  boxes: [],
}

// Rinomina stanze legacy nei pacchi già salvati (Sala -> Soggiorno,
// Camera bambino -> Camera da letto).
const ROOM_MIGRATION: Record<string, string> = {
  Sala: 'Soggiorno',
  'Camera bambino': 'Camera da letto',
}

function migrateBoxes(boxes: Box[]): Box[] {
  let changed = false
  const next = boxes.map((b) => {
    const mapped = ROOM_MIGRATION[b.room]
    if (mapped) {
      changed = true
      return { ...b, room: mapped }
    }
    return b
  })
  return changed ? next : boxes
}

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...emptyData }
    const parsed = JSON.parse(raw) as AppData
    const boxes = Array.isArray(parsed.boxes) ? migrateBoxes(parsed.boxes) : []
    const data = {
      version: parsed.version ?? 1,
      moveName: parsed.moveName ?? 'Il mio trasloco',
      boxes,
    }
    // Se la migrazione ha cambiato dati, persisti subito la versione nuova.
    if (boxes !== parsed.boxes) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    }
    return data
  } catch {
    return { ...emptyData }
  }
}

let memData: AppData | null = null
const listeners = new Set<(d: AppData) => void>()

function getData(): AppData {
  if (!memData) memData = loadData()
  return memData
}

function setData(updater: (d: AppData) => AppData) {
  const next = updater(getData())
  memData = next
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  listeners.forEach((l) => l(next))
}

export function useAppData() {
  const [data, setLocalData] = useState<AppData>(() => getData())

  useEffect(() => {
    const l = (d: AppData) => setLocalData(d)
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  }, [])

  const addBox = useCallback(
    (b: Omit<Box, 'id' | 'number' | 'createdAt' | 'updatedAt'>) => {
      setData((d) => {
        const number = d.boxes.reduce((m, x) => Math.max(m, x.number), 0) + 1
        const now = Date.now()
        const box: Box = {
          ...b,
          id: crypto.randomUUID(),
          number,
          createdAt: now,
          updatedAt: now,
        }
        return { ...d, boxes: [...d.boxes, box] }
      })
    },
    [],
  )

  const updateBox = useCallback((id: string, patch: Partial<Box>) => {
    setData((d) => ({
      ...d,
      boxes: d.boxes.map((b) =>
        b.id === id ? { ...b, ...patch, updatedAt: Date.now() } : b,
      ),
    }))
  }, [])

  const deleteBox = useCallback((id: string) => {
    setData((d) => ({ ...d, boxes: d.boxes.filter((b) => b.id !== id) }))
  }, [])

  const toggleStatus = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      boxes: d.boxes.map((b) =>
        b.id === id
          ? {
              ...b,
              status: b.status === 'da_fare' ? 'fatto' : 'da_fare',
              updatedAt: Date.now(),
            }
          : b,
      ),
    }))
  }, [])

  const setMoveName = useCallback((name: string) => {
    setData((d) => ({ ...d, moveName: name }))
  }, [])

  const exportData = useCallback(() => {
    return JSON.stringify(getData(), null, 2)
  }, [])

  const importData = useCallback((json: string): ImportResult => {
    try {
      const parsed = JSON.parse(json) as AppData
      if (!parsed || !Array.isArray(parsed.boxes)) {
        return { ok: false, error: 'Formato JSON non valido' }
      }
      setData(() => ({ ...emptyData, ...parsed }))
      return { ok: true }
    } catch {
      return { ok: false, error: 'JSON non parseabile' }
    }
  }, [])

  const importFromFile = useCallback((file: File): Promise<ImportResult> =>
      new Promise<ImportResult>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => {
          resolve(importData(String(reader.result)))
        }
        reader.onerror = () => resolve({ ok: false, error: 'Lettura file fallita' })
        reader.readAsText(file)
      }),
    [importData],
  )

  return {
    data,
    addBox,
    updateBox,
    deleteBox,
    toggleStatus,
    setMoveName,
    exportData,
    importFromFile,
  }
}

export function downloadJson(filename: string, content: string) {
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}