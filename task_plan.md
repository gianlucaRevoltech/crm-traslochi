# Task Plan: CRM Traslochi — Track pacchi per il trasloco

## Goal
App web mobile-friendly per tenere traccia dei pacchi durante un trasloco: chi li trasporta (io o la ditta), contenuto, numero, stanza, note. Dati persistenti nel browser (no DB), deployabile su Vercel gratis.

## Current Phase
Phase 2

## Phases

### Phase 1: Requirements & Discovery
- [x] Capire intento: tracker pacchi trasloco, mobile-friendly, gratis, no DB, dati persistenti
- [x] Vincoli: deploy Vercel (statico), no database, persistenza dati
- [x] Requisiti funzionali: pacchi io vs ditta, contenuto, numero, note, ricerca, dashboard
- **Status:** complete

### Phase 2: Planning & Structure
- [x] Scelta stack: React + Vite + TailwindCSS, persistenza localStorage
- [x] Modello dati Box definito
- [ ] Scaffold progetto Vite
- [ ] Struttura componenti
- **Status:** in_progress

### Phase 3: Implementation
- [ ] Storage layer (localStorage hook)
- [ ] Dashboard (conteggi, breakdown io/ditta)
- [ ] Lista pacchi con filtri + ricerca
- [ ] Form aggiunta/modifica pacco
- [ ] Dettaglio/edit/delete
- [ ] Export/Import JSON (backup)
- [ ] UI responsive + mobile-friendly
- **Status:** pending

### Phase 4: Testing & Verification
- [ ] `npm run dev` funziona
- [ ] CRUD pacchi funzionante
- [ ] Dati persistono dopo reload
- [ ] Mobile responsive
- [ ] `npm run build` ok
- **Status:** pending

### Phase 5: Delivery
- [ ] Istruzioni deploy Vercel
- [ ] README
- [ ] Consegna a utente
- **Status:** pending

## Key Questions
1. Come persistere senza DB? → localStorage nel browser (gratis, no setup, ok per uso singolo utente)
2. Deploy gratis? → Vercel static build (npm run build → dist/)
3. Backup dati? → Export/Import JSON (localStorage si può svuotare, meglio avere backup)
4. Più dispositivi sincronizzati? → No senza backend. Export/import manuale come workaround.

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| React + Vite + TS | Stack moderno, build statico, dev veloce |
| TailwindCSS | UI responsive e bella con poco sforzo, mobile-first |
| localStorage per persistenza | No DB come richiesto, persistente nel browser, zero setup |
| Export/Import JSON | Backup/portabilità dati (localStorage non è condiviso tra device) |
| Componenti singoli, stato con context/hook | Semplicità per scope piccolo |
| No backend | Requisito "gratis, no DB" → tutto client-side |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
|       | 1       |            |

## Notes
- Dati salvati solo nel browser locale → non sincronizzati tra device (limitazione accettata)
- Export/Import JSON come workaround portabilità