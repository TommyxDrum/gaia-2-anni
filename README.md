# Gaia · 2 — invito digitale

File del progetto:

- `index.html` — il sito completo. HTML, CSS, JavaScript **e le foto** sono in un unico file:
  per pubblicarlo basta caricare questo e `og-image.jpg`.
- `og-image.jpg` — immagine di anteprima per WhatsApp (1200×630)
- `gaia.webp` / `gaia-wide.webp` — i due ritagli della foto, già incorporati in `index.html`.
  Servono solo se preferisci tenerli come file esterni (vedi sotto).
- `api/rsvp.js` — esempio di endpoint serverless con validazione lato server

## Pubblicazione

Carica `index.html` e `og-image.jpg` nella stessa cartella su qualsiasi hosting statico
(Netlify, Vercel, GitHub Pages, Cloudflare Pages, o un normale spazio FTP), poi condividi il link.

Se l'anteprima su WhatsApp non appare subito, è la cache: aggiungi `?v=2` alla fine del link.

## Modificare i dati dell'evento

Tutto è in un solo oggetto, nello script in fondo a `index.html`:

```js
const EVENT = {
  name, age, date, time, weekday,
  venue, street, city, cityShort,
  mapsUrl,
  contact: { name, email, phone },
  photo: { src, srcWide, alt, caption }
};
```

Data, giorno della settimana, mese, footer e testo della hero si ricalcolano da qui.
Nessuna informazione è ripetuta altrove.

## La foto

Sono presenti due ritagli della stessa immagine:

- `src` — verticale 4:5, usato sugli smartphone (inquadra il viso)
- `srcWide` — panoramico, usato dai 760px in su (comprende il gesto della mano)

Sono incorporati come data URI, quindi il sito resta un unico file. Per usarli come file
esterni (più leggero il primo caricamento) sostituisci i due valori con i nomi dei file:

```js
photo: { src: "gaia.webp", srcWide: "gaia-wide.webp", alt: "…", caption: "Gaia, due anni" }
```

e carica i due `.webp` accanto a `index.html`. Con `photo: null` l'intera sezione sparisce
e il sito resta perfettamente equilibrato.

## Salvare le risposte RSVP

Di default `RSVP_CONFIG.driver` è `"local"`: le risposte restano nel browser di chi compila
(utile per provare, **non** per raccogliere davvero le conferme). Per salvarle sul serio
cambia il driver.

### Supabase

```sql
create table rsvp (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  nome text not null,
  cognome text not null,
  presenza text not null,
  partecipanti int default 0,
  allergie text,
  allergie_dettaglio text,
  note text,
  consenso boolean not null,
  evento text
);

alter table rsvp enable row level security;
create policy "solo inserimento" on rsvp for insert to anon with check (true);
```

```js
const RSVP_CONFIG = {
  driver: "supabase",
  supabase: { url: "https://xxxx.supabase.co", anonKey: "…", table: "rsvp" }
};
```

Con RLS in sola scrittura la chiave anon esposta nel frontend non permette di leggere gli
altri nominativi: le risposte le leggi tu dalla dashboard.

### API REST propria

```js
const RSVP_CONFIG = { driver: "rest", rest: { endpoint: "/api/rsvp" } };
```

L'endpoint riceve un JSON con `nome, cognome, presenza, partecipanti, allergie,
allergieDettaglio, note, consenso, evento, createdAt`.
Vedi `api/rsvp.js`: ripete lato server la stessa validazione del client.

### Firebase

```js
const RSVP_CONFIG = { driver: "firebase", firebase: { projectId: "…", collection: "rsvp" } };
```

Usa Firestore via REST, senza SDK. Imposta regole di sicurezza in sola scrittura.

## Tipografia

- **Fraunces** per i titoli — serif contemporanea dai terminali morbidi (asse `SOFT`),
  più leggibile e più dolce di una didone classica.
- **Manrope** per testi, etichette e pulsanti.

Entrambe da Google Fonts, caricate con `display=swap` e `preconnect`.

## Privacy

Vengono raccolti nome, cognome ed eventuali informazioni su allergie o intolleranze
(dato particolare). Il consenso è obbligatorio e bloccante. Cancella i dati dopo la festa.

## Accessibilità e performance

Nessuna libreria esterna. Decori floreali e palloncini sono SVG inline (pochi byte).
Il sito rispetta `prefers-reduced-motion`, ha label reali su ogni campo, focus visibili,
target touch da 54px e contrasto conforme AA.
