import * as Icons from './icons'
import type { Box } from '../types'

interface Props {
  box: Box
  onEdit: (box: Box) => void
  onDelete: (id: string) => void
  onToggle: (id: string) => void
}

export default function BoxCard({ box, onEdit, onDelete, onToggle }: Props) {
  const done = box.status === 'fatto'
  return (
    <div
      className={`rounded-2xl border bg-white p-4 shadow-sm transition ${
        done ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                box.handler === 'io'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-brand-100 text-brand-700'
              }`}
            >
              {box.number}
            </span>
            <h3 className="truncate font-semibold text-slate-800">{box.label}</h3>
            {box.fragile && (
              <span
                title="Fragile"
                className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700"
              >
                <Icons.GiftIcon className="h-3.5 w-3.5" /> Fragile
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap gap-1.5 text-xs text-slate-500">
            <span
              className={`rounded-full px-2 py-0.5 font-medium ${
                box.handler === 'io'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-brand-100 text-brand-700'
              }`}
            >
              {box.handler === 'io' ? '🚗 Io' : '🚚 Ditta'}
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
              📦 {box.room}
            </span>
          </div>
        </div>

        <button
          onClick={() => onToggle(box.id)}
          title={done ? 'Segna da fare' : 'Segna fatto'}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition ${
            done
              ? 'border-emerald-500 bg-emerald-500 text-white'
              : 'border-slate-300 text-slate-400 hover:border-emerald-400'
          }`}
        >
          <Icons.CheckIcon className="h-5 w-5" />
        </button>
      </div>

      {box.contents.length > 0 && (
        <ul className="mt-3 space-y-0.5 text-sm text-slate-600">
          {box.contents.map((c, i) => (
            <li key={i} className="flex gap-1.5">
              <span className="text-slate-300">•</span>
              <span className="truncate">{c}</span>
            </li>
          ))}
        </ul>
      )}

      {box.notes && (
        <p className="mt-2 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800">
          📝 {box.notes}
        </p>
      )}

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onEdit(box)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-2 text-sm font-medium text-slate-600 active:scale-[0.99] hover:bg-slate-50"
        >
          <Icons.PencilIcon className="h-4 w-4" /> Modifica
        </button>
        <button
          onClick={() => {
            if (confirm(`Eliminare il pacco "${box.label}"?`)) onDelete(box.id)
          }}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-600 active:scale-[0.99] hover:bg-rose-50"
        >
          <Icons.TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}