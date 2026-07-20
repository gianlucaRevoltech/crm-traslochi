# Findings & Decisions

## Requirements
<!-- Catturati dalla richiesta utente -->
- App per gestire trasloco: pacchi da trasportare
- Tracciare chi trasporta: io vs ditta di traslochi
- Per ogni pacco: contenuto, numero, (stanza, fragilità, note)
- UI bella, intuitiva, semplice
- Mobile-friendly (usabile da telefono)
- Deploy su piattaforme gratuite (Vercel)
- NO database
- MA possibilità di salvare sempre i dati (persistenza)

## Research Findings
- localStorage: API browser per persistenza chiave-valore, ~5-10MB, sync, semplice
- Vite: bundler dev server veloce, output statico in dist/, perfetto per Vercel
- Vercel: carica dist/ come static site, gratis per progetti personali, build auto via "vite build"
- React + TailwindCSS: combo standard per UI responsive veloce, mobile-first facile
- Limitazione localStorage: dati legati a singolo browser/ dispositivo → serve export/import per backup/portabilità

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| localStorage (non IndexedDB) | Scope piccolo, dati semplici, sync API più facile |
| React + Vite + TypeScript | Type safety, build statico, DX buona |
| TailwindCSS via PostCSS | Mobile-first utilities, no CSS custom da scrivere |
| Single page app con tab/navigation | Semplice, niente router pesante |
| JSON export/import | Backup dati + workaround no-sync tra device |

## Modello dati Box
```
Box {
  id: string (uuid)
  number: number        // numero progressivo pacco (es. 1,2,3...)
  label: string         // nome/etichetta breve (es. "Cucina - scatola 1")
  handler: 'io' | 'ditta'  // chi lo trasporta
  room: string          // stanza destinazione (es. Cucina, Sala, Camera)
  contents: string[]   // lista contenuti
  fragile: boolean     // se fragile
  notes: string        // note libere
  status: 'da_fare' | 'fatto'  // stato imballaggio/trasporto
  createdAt: number
  updatedAt: number
}
```

## Issues Encountered
| Issue | Resolution |
|-------|------------|
|       |            |

## Resources
- Vite docs: https://vitejs.dev
- TailwindCSS: https://tailwindcss.com
- Vercel static deploy: https://vercel.com/docs

## Visual/Browser Findings
- (nessuna navigazione browser ancora)

---
*Aggiornare dopo ogni 2 operazioni view/browser/search*