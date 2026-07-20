import type { VercelRequest, VercelResponse } from '@vercel/node'

// Endpoint di diagnostica: mostra quali variabili d'ambiente legate a KV/Upstash
// sono presenti. NON mostra i valori (solo i primi 6 caratteri) per evitare
// di leakare il token nei log.
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  const keys = [
    'KV_REST_API_URL',
    'KV_REST_API_TOKEN',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
  ] as const

  type Diag = {
    key: string
    set: boolean
    preview?: string
  }

  const result: Diag[] = keys.map((k) => {
    const v = process.env[k]
    if (!v) return { key: k, set: false }
    const preview = v.length > 6 ? v.slice(0, 6) + '…' : '***'
    return { key: k, set: true, preview }
  })

  const allKeys = Object.keys(process.env).sort()
  const matching = allKeys.filter((k) =>
    /KV|UPSTASH|REDIS/i.test(k),
  )

  // Prova anche a istanziare @vercel/kv per vedere se l'errore e' chiaro.
  let clientError: string | null = null
  try {
    const { kv, createClient } = await import('@vercel/kv')
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      await kv.ping()
    } else if (
      process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN
    ) {
      await createClient({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      }).ping()
    } else {
      clientError =
        'Nessuna variabile KV_REST_API_URL/TOKEN o UPSTASH_REDIS_REST_URL/TOKEN trovata.'
    }
  } catch (e) {
    clientError = e instanceof Error ? e.message : String(e)
  }

  return res.status(200).json({
    vars: result,
    matchingEnvKeys: matching,
    clientError,
    timestamp: Date.now(),
  })
}