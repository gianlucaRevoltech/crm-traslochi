import { useMemo, useRef, useState } from 'react'
import { downloadJson, useAppData } from './storage'
import type { Box, Handler } from './types'
import * as Icons from './components/icons'
import Dashboard from './components/Dashboard'
import BoxCard from './components/BoxCard'
import BoxForm from './components/BoxForm'

type Tab = 'dashboard' | 'boxes' | 'add' | 'settings'
type Filter = 'all' | Handler

export default function App() {
  const {
    data,
    addBox,
    updateBox,
    deleteBox,
    toggleStatus,
    setMoveName,
    exportData,
    importFromFile,
  } = useAppData()

  const [tab, setTab] = useState<Tab>('dashboard')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [editing, setEditing] = useState<Box | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    let list = data.boxes
    if (filter !== 'all') list = list.filter((b) => b.handler === filter)
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (b) =>
          b.label.toLowerCase().includes(q) ||
          b.room.toLowerCase().includes(q) ||
          b.notes.toLowerCase().includes(q) ||
          b.contents.some((c) => c.toLowerCase().includes(q)),
      )
    }
    return [...list].sort((a, b) => (a.handler !== b.handler ? (a.handler === 'io' ? -1 : 1) : a.number - b.number))
  }, [data.boxes, filter, query])

  const handleExport = () => {
    const stamp = new Date().toISOString().slice(0, 10)
    downloadJson(`trasloco-${stamp}.json`, exportData())
  }

  const handleImport = async (file: File) => {
    if (!confirm('Importare i dati sovrascriverà quelli attuali. Continuare?')) return
    const res = await importFromFile(file)
    if (res.ok) alert('Dati importati ✓')
    else alert('Errore importazione: ' + (res.error ?? 'sconosciuto'))
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Riepilogo', icon: <Icons.HomeIcon className="h-5 w-5" /> },
    { id: 'boxes', label: 'Pacchi', icon: <Icons.ListIcon className="h-5 w-5" /> },
    { id: 'add', label: 'Aggiungi', icon: <Icons.PlusIcon className="h-5 w-5" /> },
  ]

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col bg-slate-50">
      {/* header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-slate-800">📦 {data.moveName}</h1>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
            aria-label="Impostazioni"
          >
            <Icons.SettingsIcon className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 pb-28 pt-4">
        {tab === 'dashboard' && <Dashboard boxes={data.boxes} />}

        {tab === 'boxes' && (
          <div className="space-y-3">
            {/* search */}
            <div className="relative">
              <Icons.SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cerca per nome, stanza, contenuto…"
                className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-base outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
              />
            </div>

            {/* filtri */}
            <div className="flex gap-2">
              {([
                ['all', 'Tutti'],
                ['io', 'Io'],
                ['ditta', 'Ditta'],
              ] as [Filter, string][]).map(([f, label]) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    filter === f
                      ? 'bg-slate-800 text-white'
                      : 'border border-slate-200 bg-white text-slate-500'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-400">
              {filtered.length} pacco{filtered.length !== 1 ? 'i' : ''}
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 py-12 text-center text-slate-400">
                <Icons.BoxIcon className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-2 text-sm">
                  {data.boxes.length === 0
                    ? 'Nessun pacco ancora. Tocca "Aggiungi" per partire!'
                    : 'Nessun risultato per questi filtri.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {filtered.map((b) => (
                  <BoxCard
                    key={b.id}
                    box={b}
                    onEdit={(box) => {
                      setEditing(box)
                      setTab('add')
                    }}
                    onDelete={deleteBox}
                    onToggle={toggleStatus}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'add' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800">
              {editing ? '✏️ Modifica pacco' : '➕ Nuovo pacco'}
            </h2>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <BoxForm
                initial={editing ?? undefined}
                submitLabel={editing ? 'Salva' : 'Aggiungi pacco'}
                onCancel={() => {
                  setEditing(null)
                  setTab('boxes')
                }}
                onSubmit={(b) => {
                  if (editing) {
                    updateBox(editing.id, b)
                  } else {
                    addBox(b)
                  }
                  setEditing(null)
                  setTab('boxes')
                }}
              />
            </div>
            {editing && (
              <button
                onClick={() => {
                  setEditing(null)
                  setTab('add')
                }}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-600"
              >
                + Aggiungi un altro pacco nuovo
              </button>
            )}
          </div>
        )}
      </main>

      {/* bottom nav */}
      <nav className="safe-bottom fixed bottom-0 left-1/2 z-20 w-full max-w-2xl -translate-x-1/2 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="grid grid-cols-3">
          {tabs.map((t) => {
            const active =
              tab === t.id || (t.id === 'add' && tab === 'add')
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition ${
                  active ? 'text-brand-600' : 'text-slate-400'
                }`}
              >
                {t.id === 'add' ? (
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      active ? 'bg-brand-600 text-white' : 'bg-brand-100 text-brand-600'
                    }`}
                  >
                    <Icons.PlusIcon className="h-6 w-6" />
                  </span>
                ) : (
                  t.icon
                )}
                {t.label}
              </button>
            )
          })}
        </div>
      </nav>

      {/* settings modal */}
      {showSettings && (
        <div
          className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 sm:items-center"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="w-full max-w-2xl rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Impostazioni</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="rounded-full px-3 py-1 text-sm font-medium text-slate-500 hover:bg-slate-100"
              >
                Chiudi ✕
              </button>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Nome del trasloco
                </label>
                <input
                  value={data.moveName}
                  onChange={(e) => setMoveName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                />
              </div>

              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                ℹ️ I dati sono salvati solo su questo dispositivo/browser. Esporta
                regolarmente un backup e importalo su un altro dispositivo se serve.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleExport}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-3 font-semibold text-slate-700 active:scale-[0.99] hover:bg-slate-50"
                >
                  <Icons.DownloadIcon className="h-5 w-5" /> Esporta JSON
                </button>
                <button
                  onClick={() => fileInput.current?.click()}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-3 font-semibold text-slate-700 active:scale-[0.99] hover:bg-slate-50"
                >
                  <Icons.UploadIcon className="h-5 w-5" /> Importa JSON
                </button>
                <input
                  ref={fileInput}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleImport(f)
                    e.target.value = ''
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}