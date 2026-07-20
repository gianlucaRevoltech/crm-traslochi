import { useCallback, useEffect, useRef, useState } from 'react'
import type { AppData, Box } from './types'

type ImportResult = { ok: boolean; error?: string }
type SyncStatus = 'idle' | 'pushing' | 'pulling' | 'synced' | 'error' | 'disabled'

const STORAGE_KEY = 'crm_traslochi_v1'
const SYNC_CODE_KEY = 'crm_traslochi_sync_code'
const SYNC_ENABLED_KEY = 'crm_traslochi_sync_enabled'

const emptyData: AppData = {
  version: 1,
  moveName: 'Il mio trasloco',
  boxes: [],
  updatedAt: 0,
}

// Rinomina stanze legacy nei pacchi gia' salvati (Sala -> Soggiorno,
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
    let boxes = Array.isArray(parsed.boxes) ? migrateBoxes(parsed.boxes) : []
    boxes = purgeOldTombstones(boxes)
    const data: AppData = {
      version: parsed.version ?? 1,
      moveName: parsed.moveName ?? 'Il mio trasloco',
      boxes,
      updatedAt: parsed.updatedAt ?? maxBoxUpdatedAt(boxes),
    }
    // Persisti subito se la migrazione ha cambiato qualcosa.
    if (boxes !== parsed.boxes) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    }
    return data
  } catch {
    return { ...emptyData }
  }
}

// Rimuove i tombstone (pacchi soft-deleted) piu' vecchi di PURGE_MS,
// cosi' l'archivio non cresce all'infinito. Dopo 7 giorni il tombstone
// e' stato sicuramente propagato a tutti i dispositivi che si sono sincronizzati.
const PURGE_MS = 7 * 24 * 60 * 60 * 1000

function purgeOldTombstones(boxes: Box[]): Box[] {
  const cutoff = Date.now() - PURGE_MS
  return boxes.filter((b) => !(b.deleted && (b.updatedAt ?? 0) < cutoff))
}

function maxBoxUpdatedAt(boxes: Box[]): number {
  return boxes.reduce((m, b) => Math.max(m, b.updatedAt ?? 0), 0)
}

let memData: AppData | null = null
const listeners = new Set<(d: AppData) => void>()

function getData(): AppData {
  if (!memData) memData = loadData()
  return memData
}

function setData(updater: (d: AppData) => AppData) {
  const prev = getData()
  const next = updater(prev)
  // Aggiorna sempre il timestamp globale di modifica.
  next.updatedAt = Math.max(next.updatedAt, maxBoxUpdatedAt(next.boxes), Date.now())
  memData = next
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  listeners.forEach((l) => l(next))
  // Notifica i sync watcher che ci sono dati locali nuovi da pushare.
  syncPushHandlers.forEach((h) => h(next))
}

// --- Sync helpers (localStorage-side config) ---

export function getSyncCode(): string | null {
  try {
    return localStorage.getItem(SYNC_CODE_KEY)
  } catch {
    return null
  }
}

export function setSyncCode(code: string | null) {
  try {
    if (code) localStorage.setItem(SYNC_CODE_KEY, code)
    else localStorage.removeItem(SYNC_CODE_KEY)
  } catch {
    /* ignore */
  }
}

export function isSyncEnabled(): boolean {
  try {
    return localStorage.getItem(SYNC_ENABLED_KEY) === '1'
  } catch {
    return false
  }
}

export function setSyncEnabled(on: boolean) {
  try {
    localStorage.setItem(SYNC_ENABLED_KEY, on ? '1' : '0')
  } catch {
    /* ignore */
  }
}

export function generateSyncCode(): string {
  // Codice breve leggibile: 3 gruppi di 4 char base36.
  const group = () =>
    Math.random().toString(36).slice(2, 6).padEnd(4, '0')
  return `${group()}-${group()}-${group()}`
}

// --- Remote via API ---

async function fetchRemote(code: string): Promise<AppData | null> {
  const r = await fetch(`/api/data?code=${encodeURIComponent(code)}`, {
    method: 'GET',
  })
  if (!r.ok) throw new Error('Remote GET failed: ' + r.status)
  const j = await r.json()
  return (j.data as AppData) ?? null
}

async function pushRemote(code: string, data: AppData): Promise<void> {
  const r = await fetch(`/api/data?code=${encodeURIComponent(code)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!r.ok) throw new Error('Remote POST failed: ' + r.status)
}

// --- Merge: per-box last-write-wins, incluso il flag deleted (tombstone) ---

function mergeBoxes(local: Box[], remote: Box[]): Box[] {
  const map = new Map<string, Box>()
  for (const b of local) map.set(b.id, b)
  for (const b of remote) {
    const cur = map.get(b.id)
    if (!cur || (b.updatedAt ?? 0) > (cur.updatedAt ?? 0)) {
      map.set(b.id, b)
    }
  }
  // Merge preserva tutti i tombstone (anche deleted=true); vengono filtrati
  // lato UI. La purga avviene per eta' in loadData/import.
  return [...map.values()]
}

function mergeData(local: AppData, remote: AppData): AppData {
  const boxes = mergeBoxes(local.boxes, remote.boxes)
  // moveName: prendi quello del dataset piu' recente overall.
  const moveName =
    (remote.updatedAt ?? 0) > (local.updatedAt ?? 0) ? remote.moveName : local.moveName
  const updatedAt = Math.max(local.updatedAt ?? 0, remote.updatedAt ?? 0, maxBoxUpdatedAt(boxes))
  return { version: local.version ?? remote.version ?? 1, moveName, boxes, updatedAt }
}

// --- Push watcher (debounced auto-push dopo ogni mutazione locale) ---

const syncPushHandlers = new Set<(d: AppData) => void>()
let pushTimer: ReturnType<typeof setTimeout> | null = null

export function useAppData() {
  const [data, setLocalData] = useState<AppData>(() => getData())
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(null)
  const codeRef = useRef<string | null>(null)
  const inFlight = useRef(false)

  // Listener dati locali
  useEffect(() => {
    const l = (d: AppData) => setLocalData(d)
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  }, [])

  // Sync code corrente (lo teniamo in ref per usarlo nelle callback)
  useEffect(() => {
    codeRef.current = isSyncEnabled() ? getSyncCode() : null
  })

  // Auto-push debounced: registrato come push handler quando sync attiva.
  useEffect(() => {
    const handler = (d: AppData) => {
      const code = codeRef.current
      if (!code) return
      if (pushTimer) clearTimeout(pushTimer)
      setSyncStatus('pushing')
      pushTimer = setTimeout(async () => {
        if (inFlight.current) return
        inFlight.current = true
        try {
          await pushRemote(code, d)
          setSyncStatus('synced')
          setLastSyncAt(Date.now())
        } catch (e) {
          console.warn('push failed', e)
          setSyncStatus('error')
        } finally {
          inFlight.current = false
        }
      }, 1200)
    }

    if (codeRef.current) {
      syncPushHandlers.add(handler)
    }
    return () => {
      syncPushHandlers.delete(handler)
      if (pushTimer) clearTimeout(pushTimer)
    }
  }, [])

  // Pull iniziale all'avvio se sync attiva.
  useEffect(() => {
    const code = codeRef.current
    if (!code) {
      setSyncStatus('disabled')
      return
    }
    let cancelled = false
    inFlight.current = true
    setSyncStatus('pulling')
    ;(async () => {
      try {
        const remote = await fetchRemote(code)
        if (cancelled) return
        if (remote) {
          const merged = mergeData(getData(), remote)
          memData = merged
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
          setLocalData(merged)
        }
        setSyncStatus('synced')
        setLastSyncAt(Date.now())
      } catch (e) {
        console.warn('initial pull failed', e)
        setSyncStatus('error')
      } finally {
        inFlight.current = false
      }
    })()
    return () => {
      cancelled = true
    }
  }, [codeRef.current])

  // --- Operazioni CRUD ---

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
    // Soft-delete: marca deleted=true con updatedAt nuovo cosi' la
    // cancellazione si propaga agli altri dispositivi tramite merge LWW.
    setData((d) => ({
      ...d,
      boxes: d.boxes.map((b) =>
        b.id === id ? { ...b, deleted: true, updatedAt: Date.now() } : b,
      ),
    }))
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

  const importFromFile = useCallback(
    (file: File): Promise<ImportResult> =>
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

  // --- Sync controls ---

  const syncNow = useCallback(async (): Promise<{ ok: boolean; error?: string }> => {
    const code = codeRef.current
    if (!code) return { ok: false, error: 'Sincronizzazione non attiva' }
    if (inFlight.current) return { ok: false, error: 'operazione in corso' }
    inFlight.current = true
    setSyncStatus('pulling')
    try {
      const remote = await fetchRemote(code)
      if (remote) {
        const merged = mergeData(getData(), remote)
        memData = merged
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
        setLocalData(merged)
      }
      // Dopo il pull, pusha il risultato mergiato per fissarlo sul remoto.
      setSyncStatus('pushing')
      await pushRemote(code, getData())
      setSyncStatus('synced')
      setLastSyncAt(Date.now())
      return { ok: true }
    } catch (e) {
      setSyncStatus('error')
      return { ok: false, error: e instanceof Error ? e.message : 'errore' }
    } finally {
      inFlight.current = false
    }
  }, [])

  const applySyncConfig = useCallback(
    (enabled: boolean, code: string | null) => {
      setSyncEnabled(enabled)
      setSyncCode(enabled ? code : null)
      codeRef.current = enabled ? code : null
      if (!enabled) {
        setSyncStatus('disabled')
      } else {
        setSyncStatus('idle')
      }
    },
    [],
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
    syncNow,
    applySyncConfig,
    syncStatus,
    lastSyncAt,
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