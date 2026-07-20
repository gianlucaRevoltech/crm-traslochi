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

- I dati sono salvati **solo nel browser** in cui li inserisci (per dominio).
- Svuotare la cache / dati sito → i pacchi spariscono. => usa **Export JSON**
  regolarmente come backup.
- Per usare gli stessi dati su un altro telefono: esporta su questo, importa
  sull'altro (nessuna sincronizzazione automatica).

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