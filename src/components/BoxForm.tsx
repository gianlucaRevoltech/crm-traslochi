import { useMemo } from 'react'
import * as Icons from './icons'
import type { Box, Handler } from '../types'

interface Props {
  initial?: Partial<Box>
  onSubmit: (b: {
    label: string
    handler: Handler
    room: string
    contents: string[]
    fragile: boolean
    notes: string
    status: 'da_fare' | 'fatto'
  }) => void
  onCancel?: () => void
  submitLabel?: string
}

const ROOMS = ['Cucina', 'Sala', 'Camera da letto', 'Camera bambino', 'Bagno', 'Ripostiglio', 'Garage', 'Altro']

const empty = {
  label: '',
  handler: 'io' as Handler,
  room: 'Cucina',
  contentsText: '',
  fragile: false,
  notes: '',
  status: 'da_fare' as const,
}

export default function BoxForm({ initial, onSubmit, onCancel, submitLabel }: Props) {
  const state = useMemo(() => {
    const s = {
      label: initial?.label ?? empty.label,
      handler: initial?.handler ?? empty.handler,
      room: initial?.room ?? empty.room,
      contentsText: (initial?.contents ?? []).join('\n'),
      fragile: initial?.fragile ?? empty.fragile,
      notes: initial?.notes ?? empty.notes,
      status: initial?.status ?? empty.status,
    }
    return s
  }, [initial])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const label = String(form.get('label') || '').trim()
    const contentsText = String(form.get('contents') || '')
    const contents = contentsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
    if (!label && contents.length === 0) {
      alert('Inserisci almeno un nome o un contenuto')
      return
    }
    onSubmit({
      label: label || '(senza nome)',
      handler: (form.get('handler') as Handler) || 'io',
      room: String(form.get('room') || 'Altro'),
      contents,
      fragile: form.get('fragile') === 'on',
      notes: String(form.get('notes') || '').trim(),
      status: (form.get('status') as 'da_fare' | 'fatto') || 'da_fare',
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Nome / etichetta pacco</label>
        <input
          name="label"
          defaultValue={state.label}
          autoFocus
          placeholder="Es. Scatola cucina 1"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
        />
      </div>

      {/* chi trasporta */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Chi lo trasporta?</label>
        <div className="grid grid-cols-2 gap-2">
          {(['io', 'ditta'] as Handler[]).map((h) => (
            <label key={h} className="cursor-pointer">
              <input
                type="radio"
                name="handler"
                value={h}
                defaultChecked={state.handler === h}
                className="peer sr-only"
              />
              <div
                className={`rounded-xl border-2 px-4 py-3 text-center font-semibold transition ${
                  h === 'io'
                    ? 'peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-700'
                    : 'peer-checked:border-brand-500 peer-checked:bg-brand-50 peer-checked:text-brand-700'
                } border-slate-200 bg-white text-slate-500`}
              >
                {h === 'io' ? '🚗 Io' : '🚚 Ditta'}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* stanza */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Stanza di destinazione</label>
        <select
          name="room"
          defaultValue={state.room}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
        >
          {ROOMS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* contenuto */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">
          Contenuto <span className="font-normal text-slate-400">(un articolo per riga)</span>
        </label>
        <textarea
          name="contents"
          defaultValue={state.contentsText}
          rows={5}
          placeholder={'Tazze\nPiatti\nBicchieri'}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
        />
      </div>

      {/* fragile + stato */}
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            name="fragile"
            defaultChecked={state.fragile}
            className="h-5 w-5 rounded accent-rose-500"
          />
          Fragile
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          Già pronto:
          <select
            name="status"
            defaultValue={state.status}
            className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
          >
            <option value="da_fare">Da fare</option>
            <option value="fatto">Fatto ✓</option>
          </select>
        </label>
      </div>

      {/* note */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Note</label>
        <textarea
          name="notes"
          defaultValue={state.notes}
          rows={2}
          placeholder="Note extra, priorità, attenzione"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
        />
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3.5 font-semibold text-white shadow-sm transition active:scale-[0.99] hover:bg-brand-700"
        >
          <Icons.PlusIcon className="h-5 w-5" />
          {submitLabel ?? 'Aggiungi pacco'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3.5 font-semibold text-slate-600 active:scale-[0.99]"
          >
            Annulla
          </button>
        )}
      </div>
    </form>
  )
}