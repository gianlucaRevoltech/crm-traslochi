# 📦 CRM Traslochi

App web mobile-friendly per tenere traccia dei pacchi durante un trasloco: chi li
trasporta (io o la ditta), contenuto, numero, stanza, note, fragilità e stato.

I dati restano **salvati nel browser** (localStorage) — niente database, niente
account, niente costi. Pensata per uso singolo-utente during il trasloco.

## ✨ Funzionalità

- **Dashboard** con totale pacchi, breakdown Io vs Ditta, conteggio fragili e
  avanzamento imballaggio (da fare / fatto).
- **Lista pacchi** con ricerca testuale (nome, stanza, contenuto, note) e filtro
  per responsabile (Tutti / Io / Ditta).
- **Aggiungi / modifica / elimina** pacco, toggle rapido stato fatto.
- **Modello pacco**: numero, etichetta, responsabile, stanza destinazione,
  contenuti multipli, fragile, note, stato.
- **Impostazioni**: nome del trasloco personalizzabile.
- **Export / Import JSON**: backup dei dati o trasferimento su un altro
  dispositivo (i dati localStorage non si sincronizzano tra device).
- **UI mobile-first** con navigazione inferiore, responsive desktop,
  tema chiaro, icone SVG inline.

## 🧱 Stack

- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) (build statico)
- [TailwindCSS](https://tailwindcss.com/)
- Persistenza: `localStorage` (hook `useAppData` in `src/storage.ts`)

Nessun backend né runtime server: l'output è un sito statico in `dist/`.

## 🚀 Avvio in locale

```bash
npm install
npm run dev      # http://localhost:5173
```

Build di produzione:

```bash
npm run build    # genera dist/
npm run preview  # anteprima del build
```

## 🔐 Persistenza e limitazioni

Doppia modalità:

- **Locale (default)**: i dati sono salvati in `localStorage` del browser.
  Svuotare la cache li cancella → usa **Export JSON** come backup.
- **Sincronizzata (facoltativa)**: attivandola nelle Impostazioni, i pacchi
  vengono salvati anche su **Vercel KV** e condivisi tra tutti i dispositivi che
  usano lo stesso **codice di sincronizzazione**.

### Setup sincronizzazione (per il deploy)

Nella dashboard Vercel del progetto:

1. **Storage → Create Database → KV** (Upstash). Dai un nome, es. `crm-traslochi-kv`.
2. Nella scheda del database appena creato: **Connect to Project** → seleziona
   il progetto `crm-traslochi`. Vercel inietta automaticamente le variabili
   `KV_REST_API_URL` e `KV_REST_API_TOKEN` (lette da `@vercel/kv`).
   *Non serve copiarle a mano.*
3. Ridéploya il progetto (push di un commit o "Redeploy" da Vercel).

> L'API route `/api/data` funziona solo sull'ambiente Vercel dove è collegato KV.
> In `npm run dev` locale la sync va in errore (è normale) ma l'app resta usabile
> in modalità locale.

### Uso della sync (utente finale)

1. Su un dispositivo → Impostazioni → attiva "Sincronizzazione dispositivi".
   Viene **generato un codice** (es. `a1b2-c3d4-e5f6`).
2. Sugli altri dispositivi → stessa opzione → **inserisci lo stesso codice**.
3. Tocca "Sincronizza ora" per il primo allineamento; da quel momento le
   modifiche vengono inviate automaticamente (con qualche secondo di debouncing),
   e all'apertura dell'app viene scaricata la versione più recente.

> ⚠️ Il codice è una "chiave": **chiunque lo abbia può leggere/modificare i
> dati**. Usalo come una password, non condividerlo pubblicamente.

#### Come funziona la risoluzione dei conflitti

Merge **per-pacco last-write-wins** usando `updatedAt` di ogni Box: se modifichi
su due dispositivi offline e poi risincronizzi, vince per ogni pacco la versione
con timestamp più recente. Pacchi presenti solo da una parte vengono mantenuti.
Il nome del trasloco segue il dataset più recente overall.

## ☁️ Deploy su Vercel

1. Crea una repo su GitHub e pusha il progetto.
2. Vai su <https://vercel.com> → **Add New → Project**.
3. Importa la repo GitHub. Vercel rileva automaticamente Vite grazie a
   `vercel.json` (build: `npm run build`, output: `dist`, framework: vite).
4. **Deploy**. Ottieni un URL `*.vercel.app` gratuito.

Non servono variabili d'ambiente: tutto client-side.

## 📁 Struttura

```
src/
  App.tsx              Shell: tab navigation, settings, filtri, ricerca
  main.tsx             Entry point
  index.css            Tailwind + stili base
  types.ts             Tipo Box e Handler
  storage.ts           Hook useAppData + export/import JSON + CRUD localStorage
  components/
    Dashboard.tsx      Riepilogo conteggi e progressi
    BoxCard.tsx        Card pacco (stato, edit, delete, toggle)
    BoxForm.tsx        Form add/edit
    icons.tsx          Icone SVG inline
vercel.json            Config deploy statico
index.html            HTML root
```

## 📝 Licenza

Progetto personale. Sentiti libero di adattarlo al tuo trasloco.