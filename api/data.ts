import type { VercelRequest, VercelResponse } from '@vercel/node'
import { kv } from '@vercel/kv'

// Serverless function: archivia/apprende lo snapshot dei dati sincronizzati
// per "codice di sincronizzazione". Il codice funge da namespace isolato:
// chiunque conosca il codice puo' leggere/scrivere quello stesso dataset.
//
// Endpoint:
//   GET  /api/data?code=XXX      -> { data: AppData | null }
//   POST /api/data?code=XXX      (body: AppData) -> { ok: true }

const DATA_PREFIX = 'data:'

function isValidCode(code: string | undefined | null): code is string {
  if (!code) return false
  const c = code.trim()
  return c.length >= 4 && c.length <= 64 && /^[A-Za-z0-9_-]+$/.test(c)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS: l'API e' servita dallo stesso dominio Vercel, ma mettiamo header
  // permissivi per eventuali preview su altri domini Vercel.
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(204).end()

  const code = (req.query.code as string | undefined)?.trim()
  if (!isValidCode(code)) {
    return res.status(400).json({ error: 'Codice non valido (min 4, max 64 caratteri alfanumerici)' })
  }
  const key = DATA_PREFIX + code

  try {
    if (req.method === 'GET') {
      const data = await kv.get(key)
      return res.status(200).json({ data })
    }

    if (req.method === 'POST') {
      // Vercel parser gia' popola req.body per JSON con content-type corretto.
      const body = req.body
      if (!body || typeof body !== 'object' || !Array.isArray(body.boxes)) {
        return res.status(400).json({ error: 'Payload non valido' })
      }
      await kv.set(key, body)
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'Metodo non supportato' })
  } catch (err) {
    console.error('KV error', err)
    return res.status(500).json({ error: 'Errore di archiviazione (KV non configurato?)' })
  }
}