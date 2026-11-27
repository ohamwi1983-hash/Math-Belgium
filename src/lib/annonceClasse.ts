/**
 * « Annoncer une évaluation » / « Donner un devoir » (maquette « annonce » du 27/11/2026) — logique PURE.
 *
 * AUCUNE migration : une évaluation annoncée = l'événement « Interrogation » de l'agenda (0006 : date,
 * heure, classe, chapitre) + sa séance d'annonce (0007 : `evaluation_type`, `evaluation_parties`,
 * `evaluation_evenement` ; 0008 : `evaluation_generateurs`) ; un devoir = les colonnes de devoir d'une séance
 * (`devoir`, 0007 : `devoir_pour`, `devoir_generateurs`). C'est déjà ce que lisent la page des élèves
 * (`pageClasseContenu.ts`), le tableau de bord, l'agenda et le texte pour Smartschool.
 *
 * Séance d'annonce (`seanceSupport`) : la séance D'AUJOURD'HUI de la classe, sur le même chapitre et encore
 * libre (pas d'évaluation pour une évaluation, pas de devoir pour un devoir) — l'annonce est complétée,
 * comme si elle avait été notée avec la séance ; sinon une nouvelle séance du jour (`nouvelleSeanceSupport`),
 * sans matière vue, à l'heure du cours en cours de la classe s'il y en a un (elle EST alors la séance de ce
 * cours, que le professeur complètera), sinon à l'heure de l'annonce (hors cours : elle ne couvre aucun
 * créneau, rien ne disparaît des séances « à noter »).
 */
import { structureChapitre, unitesCouvertes, unitesSection, type SaisieSeance, type Seance } from './carnet'
import type { ChapterContent } from '../content/types'
import type { Creneau } from './horaire'

export type QuoiAnnonce = 'evaluation' | 'devoir'

/** Ce que le formulaire d'annonce envoie au carnet. */
export interface SaisieAnnonce {
  quoi: QuoiAnnonce
  classeId: string
  niveau: string
  chapitre: string
  /** Évaluation : sa date ; devoir : date de remise (vide : sans date). */
  date: string
  /** Heure de l'évaluation (numéros de la grille), `null` : journée. */
  heureDebut: number | null
  heureFin: number | null
  /** Contrôle-bilan (sinon interro). */
  bilan: boolean
  /** Ids des sections (étapes) choisies. */
  etapes: string[]
  /** Évaluation : générateurs RETENUS (vide = tous ceux des étapes, règle de 0008) ; devoir : exercices joints. */
  generateurs: string[]
  /** Devoir : consigne (texte libre). */
  consigne: string
}

/** Séance d'aujourd'hui de la classe que l'annonce peut compléter, sinon `null` (plus récente d'abord). */
export function seanceSupport<S extends Pick<Seance, 'id' | 'classe_id' | 'date_seance' | 'niveau' | 'chapitre' | 'cree_le' | 'devoir' | 'devoir_generateurs' | 'evaluation_type'>>(
  seances: S[],
  a: Pick<SaisieAnnonce, 'quoi' | 'classeId' | 'niveau' | 'chapitre'>,
  aujourdhui: string,
): S | null {
  const candidates = seances
    .filter((s) => s.classe_id === a.classeId && s.date_seance === aujourdhui && s.niveau === a.niveau && s.chapitre === a.chapitre)
    .filter((s) => (a.quoi === 'evaluation' ? !s.evaluation_type : s.devoir.trim() === '' && (s.devoir_generateurs?.length ?? 0) === 0))
    .sort((x, y) => (x.cree_le < y.cree_le ? 1 : -1))
  return candidates[0] ?? null
}

/** La séance telle qu'elle est, en saisie (pour la réécrire sans rien perdre). */
export function saisieDepuisSeance(s: Seance): SaisieSeance {
  return {
    classe_id: s.classe_id,
    date_seance: s.date_seance,
    heure_debut: s.heure_debut,
    heure_fin: s.heure_fin,
    numero_heure: s.numero_heure,
    numero_heure_fin: s.numero_heure_fin ?? null,
    niveau: s.niveau,
    chapitre: s.chapitre,
    parties: s.parties,
    generateurs: s.generateurs,
    devoir: s.devoir,
    remarque: s.remarque,
    devoir_pour: s.devoir_pour ?? null,
    devoir_generateurs: s.devoir_generateurs ?? [],
    objectif: s.objectif ?? '',
    competences: s.competences ?? [],
    evaluation_type: s.evaluation_type ?? null,
    evaluation_parties: s.evaluation_parties ?? [],
    evaluation_evenement: s.evaluation_evenement ?? null,
    evaluation_generateurs: s.evaluation_generateurs ?? [],
  }
}

const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`

/** Nouvelle séance d'annonce, sans matière vue : à l'heure du cours en cours (`enCours`) s'il y en a un,
 * sinon à l'heure de l'annonce (`minutes`, arrondie aux 5 minutes inférieures). */
export function nouvelleSeanceSupport(a: Pick<SaisieAnnonce, 'classeId' | 'niveau' | 'chapitre'>, aujourdhui: string, minutes: number, enCours: Creneau | null): SaisieSeance {
  const horaire = enCours
    ? { heure_debut: hhmm(enCours.debut), heure_fin: hhmm(enCours.fin), numero_heure: enCours.heureDebut, numero_heure_fin: enCours.heureFin > enCours.heureDebut ? enCours.heureFin : null }
    : { heure_debut: hhmm(Math.floor(minutes / 5) * 5), heure_fin: null, numero_heure: null, numero_heure_fin: null }
  return {
    classe_id: a.classeId,
    date_seance: aujourdhui,
    ...horaire,
    niveau: a.niveau,
    chapitre: a.chapitre,
    parties: [],
    generateurs: [],
    devoir: '',
    remarque: '',
    devoir_pour: null,
    devoir_generateurs: [],
    objectif: '',
    competences: [],
    evaluation_type: null,
    evaluation_parties: [],
    evaluation_evenement: null,
    evaluation_generateurs: [],
  }
}

/** Séance finale : l'annonce posée sur la séance de départ (évaluation : type, étapes, lien, générateurs ;
 * devoir : consigne, date de remise, exercices joints). */
export function seanceAvecAnnonce(base: SaisieSeance, a: SaisieAnnonce, evenementId: string | null): SaisieSeance {
  if (a.quoi === 'evaluation')
    return { ...base, evaluation_type: a.bilan ? 'bilan' : 'annonce', evaluation_parties: a.etapes, evaluation_evenement: evenementId, evaluation_generateurs: a.generateurs }
  return { ...base, devoir: a.consigne.trim(), devoir_pour: a.date || null, devoir_generateurs: a.generateurs }
}

/** État d'une étape pour la classe : vue entièrement (date de la dernière fois), commencée (première
 * fois), ou pas encore vue — d'après les séances de la classe dans ce chapitre. */
export type EtatEtape = { etat: 'vue'; date: string } | { etat: 'commencee'; date: string } | { etat: 'pas-vue' }

export function etatsEtapes(seances: Pick<Seance, 'classe_id' | 'niveau' | 'chapitre' | 'parties' | 'date_seance'>[], classeId: string, chapitre: ChapterContent): Map<string, EtatEtape> {
  const structure = structureChapitre(chapitre)
  const premiere = new Map<string, string>()
  const derniere = new Map<string, string>()
  for (const s of seances) {
    if (s.classe_id !== classeId || s.niveau !== chapitre.levelSlug || s.chapitre !== chapitre.slug) continue
    for (const u of unitesCouvertes(s.parties, structure)) {
      if (!premiere.has(u) || s.date_seance < (premiere.get(u) as string)) premiere.set(u, s.date_seance)
      if (!derniere.has(u) || s.date_seance > (derniere.get(u) as string)) derniere.set(u, s.date_seance)
    }
  }
  const res = new Map<string, EtatEtape>()
  for (const sec of structure) {
    const unites = unitesSection(sec)
    const vues = unites.filter((u) => premiere.has(u))
    if (vues.length === unites.length) res.set(sec.id, { etat: 'vue', date: vues.map((u) => derniere.get(u) as string).sort().pop() as string })
    else if (vues.length > 0) res.set(sec.id, { etat: 'commencee', date: vues.map((u) => premiere.get(u) as string).sort()[0] })
    else res.set(sec.id, { etat: 'pas-vue' })
  }
  return res
}

/** Heure courte d'un créneau : « 3e h », « 3e–4e h », « H0 ». */
export function heureCourteCreneau(debut: number, fin?: number | null): string {
  const o = (k: number) => (k === 0 ? 'H0' : `${k}${k === 1 ? 're' : 'e'}`)
  if (fin !== null && fin !== undefined && fin > debut) return debut === 0 ? `H0–${o(fin)} h` : `${o(debut)}–${o(fin)} h`
  return debut === 0 ? 'H0' : `${o(debut)} h`
}

/** Erreurs du formulaire d'annonce (messages pour le professeur), vide si tout va bien. */
export function erreursAnnonce(a: SaisieAnnonce, aujourdhui: string): { date?: string; etapes?: string; devoir?: string } {
  const e: { date?: string; etapes?: string; devoir?: string } = {}
  const dateOk = /^\d{4}-\d{2}-\d{2}$/.test(a.date)
  if (a.quoi === 'evaluation') {
    if (!dateOk) e.date = 'Choisis le jour de l’évaluation.'
    else if (a.date <= aujourdhui) e.date = 'Une évaluation annoncée a lieu après aujourd’hui : choisis un jour qui suit.'
    if (a.etapes.length === 0) e.etapes = 'Coche au moins une étape évaluée.'
  } else {
    if (a.date && !dateOk) e.date = 'Date de remise illisible.'
    else if (a.date && a.date < aujourdhui) e.date = 'Le devoir est à rendre après aujourd’hui : choisis une date qui suit.'
    if (a.consigne.trim() === '' && a.generateurs.length === 0) e.devoir = 'Écris la consigne ou joins au moins un exercice en ligne.'
  }
  return e
}
