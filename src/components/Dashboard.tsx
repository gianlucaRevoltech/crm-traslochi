import type { Box, Handler } from '../types'
import * as Icons from './icons'

interface Props {
  boxes: Box[]
}

function Stat({
  label,
  value,
  color,
  emoji,
}: {
  label: string
  value: number | string
  color: string
  emoji: string
}) {
  return (
    <div className={`rounded-2xl p-4 ${color}`}>
      <div className="text-2xl">{emoji}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      <div className="text-xs font-medium opacity-80">{label}</div>
    </div>
  )
}

export default function Dashboard({ boxes }: Props) {
  // Ignora i tombstone (soft-deleted) in tutti i conteggi.
  const active = boxes.filter((b) => !b.deleted)
  const total = active.length
  const byHandler = (h: Handler) => active.filter((b) => b.handler === h)
  const io = byHandler('io')
  const ditta = byHandler('ditta')
  const done = active.filter((b) => b.status === 'fatto').length
  const fragile = active.filter((b) => b.fragile).length

  // per stanza
  const perRoom = active.reduce<Record<string, number>>((acc, b) => {
    acc[b.room] = (acc[b.room] ?? 0) + 1
    return acc
  }, {})
  const rooms = Object.entries(perRoom).sort((a, b) => b[1] - a[1])

  // conta contenuti
  const itemTot = active.reduce((acc, b) => acc + b.contents.length, 0)

  const progress = total === 0 ? 0 : Math.round((done / total) * 100)

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Pacchi totali" value={total} color="bg-slate-100 text-slate-700" emoji="📦" />
        <Stat
          label="Pronti"
          value={`${done}/${total}`}
          color="bg-emerald-100 text-emerald-700"
          emoji="✅"
        />
        <Stat
          label="Trasporto io"
          value={io.length}
          color="bg-blue-100 text-blue-700"
          emoji="🚗"
        />
        <Stat
          label="Trasporta ditta"
          value={ditta.length}
          color="bg-brand-100 text-brand-700"
          emoji="🚚"
        />
      </div>

      {/* barra progresso */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-1 flex justify-between text-sm font-medium text-slate-600">
          <span>Avanzamento</span>
          <span>{progress}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* fragile badge */}
      {fragile > 0 && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-rose-700">
          <Icons.GiftIcon className="h-5 w-5" />
          <span className="text-sm font-medium">
            {fragile} pacco{fragile > 1 ? 'i' : ''} fragile — attenzione!
          </span>
        </div>
      )}

      {/* per stanza */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-bold text-slate-700">Distribuzione per stanza</h3>
        {rooms.length === 0 ? (
          <p className="text-sm text-slate-400">Nessun pacco registrato ancora.</p>
        ) : (
          <div className="space-y-2">
            {rooms.map(([room, count]) => {
              const pct = total === 0 ? 0 : (count / total) * 100
              return (
                <div key={room}>
                  <div className="mb-1 flex justify-between text-xs font-medium text-slate-600">
                    <span>{room}</span>
                    <span>{count}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <p className="text-center text-xs text-slate-400">
        {itemTot} articoli totali registrati in {total} pacchi
      </p>
    </div>
  )
}