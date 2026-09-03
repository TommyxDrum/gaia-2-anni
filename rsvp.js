/**
 * Endpoint RSVP — esempio per Vercel / Netlify Functions (Node runtime).
 * Ripete lato server la stessa validazione del client: il frontend non è mai
 * l'unica difesa. Sostituisci `persist()` con il tuo database.
 */

const LIMITS = { nomeMin: 2, partecipantiMax: 20, notaMax: 500 };

function validate(data) {
  const e = {};
  const str = v => (typeof v === "string" ? v.trim() : "");

  if (str(data.nome).length < LIMITS.nomeMin) e.nome = "Nome mancante o troppo corto.";
  if (str(data.cognome).length < LIMITS.nomeMin) e.cognome = "Cognome mancante o troppo corto.";
  if (!["si", "no"].includes(data.presenza)) e.presenza = "Valore di presenza non valido.";

  if (data.presenza === "si") {
    const n = Number(data.partecipanti);
    if (!Number.isInteger(n) || n < 1 || n > LIMITS.partecipantiMax)
      e.partecipanti = `Il numero di partecipanti deve essere tra 1 e ${LIMITS.partecipantiMax}.`;
    if (!["si", "no"].includes(data.allergie)) e.allergie = "Valore allergie non valido.";
    if (data.allergie === "si" && str(data.allergieDettaglio).length < 3)
      e.allergieDettaglio = "Dettaglio allergie mancante.";
  }

  if (data.consenso !== true) e.consenso = "Consenso al trattamento dei dati mancante.";
  if (str(data.note).length > LIMITS.notaMax) e.note = "Nota troppo lunga.";

  return e;
}

function sanitize(data) {
  const clean = v => (typeof v === "string" ? v.trim().slice(0, LIMITS.notaMax) : "");
  return {
    nome: clean(data.nome),
    cognome: clean(data.cognome),
    presenza: data.presenza,
    partecipanti: data.presenza === "si" ? Number(data.partecipanti) : 0,
    allergie: data.presenza === "si" ? data.allergie : "no",
    allergieDettaglio: data.allergie === "si" ? clean(data.allergieDettaglio) : "",
    note: clean(data.note),
    consenso: true,
    evento: clean(data.evento),
    createdAt: new Date().toISOString()
  };
}

async function persist(record) {
  // TODO: scrivi su database (Postgres, Supabase, Firestore, Google Sheet…).
  console.log("RSVP", record);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Metodo non consentito." });
  }

  const data = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  const errors = validate(data);

  if (Object.keys(errors).length) {
    return res.status(422).json({ errors });
  }

  try {
    await persist(sanitize(data));
    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Salvataggio non riuscito." });
  }
}
