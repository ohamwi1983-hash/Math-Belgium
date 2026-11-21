/**
 * Horaire de la semaine du carnet (`supabase/migrations/0003_horaire.sql`) — logique PURE, sans
 * React ni supabase-js, testée seule (esbuild + node). Voir `.claude/rules/comptes.md`, sous-section
 * « Horaire de la semaine ».
 *
 * Grille d'une école (une seule source : table `horaires_ecoles`) : début des cours, durée d'une
 * heure, nombre d'heures, pauses (« après H2 : récréation, 20 min »), heures du mercredi, heures
 * corrigées à la main. Les heures de début des pauses et la fin des cours ne sont JAMAIS saisies :
 * elles sont calculées (aucun réglage contradictoire possible).
 *
 * Règle de calcul : H1 commence au début des cours ; chaque heure dure `duree_heure` ; l'heure
 * suivante commence à la fin de la précédente, plus la pause placée « après » elle s'il y en a une.
 * Une heure corrigée à la main garde ses heures de début et de fin, et les suivantes repartent de sa
 * fin. Mercredi : seulement les `heures_mercredi` premières heures (par défaut, les heures avant
 * midi ; toutes s'il n'y a pas de pause de midi).
 *
 * Heures doubles : deux heures de numéros consécutifs de la MÊME classe, dans la même école et le
 * même jour, forment UN créneau (« H1–H2 (08h45 → 10h25) ») et une seule séance, même si une
 * récréation (ou une autre pause courte) les sépare — mais PAS à travers la pause de midi (matin
 * et après-midi restent deux séances). Une heure double compte pour 2 heures de cours, 1 séance.
 */
import { heureTexte } from '../entrainement/export/examen'
import { ajouterJours, estJourDeClasse, etatJour, jourIso, type EtatJour } from './calendrierFwb'

export const HEURES_MAX = 15
export const PAUSES_MAX = 6
export const DUREE_HEURE_MIN = 20
export const DUREE_HEURE_MAX = 240
export const DUREE_PAUSE_MIN = 5
export const DUREE_PAUSE_MAX = 180
/** Début des cours accepté (minutes depuis minuit) : 06h00 → 20h00. */
export const DEBUT_MIN = 6 * 60
export const DEBUT_MAX = 20 * 60
export const JOURS_SEMAINE = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'] as const

export type TypePause = 'recreation' | 'midi' | 'autre'
export const LIBELLE_PAUSE: Record<TypePause, string> = { recreation: 'Récréation', midi: 'Midi', autre: 'Pause' }

export interface Pause {
  /** Numéro de l'heure APRÈS laquelle la pause a lieu (1 … nombre_heures − 1). */
  apres: number
  duree: number
  type: TypePause
}

export interface ExceptionHeure {
  heure: number
  /** `HH:MM`. */
  debut: string
  fin: string
}

export interface GrilleHoraire {
  ecole_id: string
  /** `HH:MM` ou `HH:MM:SS` (colonne `time`). */
  debut: string
  duree_heure: number
  nombre_heures: number
  pauses: Pause[]
  /** `null` : les heures avant midi (toutes s'il n'y a pas de midi). 0 : pas de cours. */
  heures_mercredi: number | null
  exceptions: ExceptionHeure[]
}

export type SaisieGrille = Omit<GrilleHoraire, 'ecole_id'>

export interface CaseHoraire {
  id: string
  ecole_id: string
  /** 1 = lundi … 5 = vendredi. */
  jour: number
  heure: number
  classe_id: string
  /** Semaine A / B : prévu pour plus tard, toujours `null` (= chaque semaine). */
  semaine: string | null
  cree_le: string
}

/** Grille d'exemple proposée à la création (école de l'utilisateur) : 08h45, heures de 50 min,
 * 7 heures, récréation de 20 min après H2, midi de 60 min après H4 ; mercredi = le matin. */
export const GRILLE_EXEMPLE: SaisieGrille = {
  debut: '08:45',
  duree_heure: 50,
  nombre_heures: 7,
  pauses: [
    { apres: 2, duree: 20, type: 'recreation' },
    { apres: 4, duree: 60, type: 'midi' },
  ],
  heures_mercredi: null,
  exceptions: [],
}

/* ------------------------------------------------------------------------------- outils */

/** « 08:45 » / « 08:45:00 » → minutes ; `null` si illisible. */
export function minutes(h: string | null | undefined): number | null {
  const r = /^(\d{1,2}):(\d{2})/.exec(h ?? '')
  if (!r || Number(r[1]) > 23 || Number(r[2]) > 59) return null
  return Number(r[1]) * 60 + Number(r[2])
}

/** Minutes → « 08:45 » (valeur d'un champ `type="time"`). */
export function champHeure(m: number): string {
  const v = ((Math.round(m) % 1440) + 1440) % 1440
  return `${String(Math.floor(v / 60)).padStart(2, '0')}:${String(v % 60).padStart(2, '0')}`
}

/** « 08h45 → 09h35 ». */
export function plage(debut: number, fin: number): string {
  return `${heureTexte(debut)} → ${heureTexte(fin)}`
}

/** Durée saisie en texte, lue avec tolérance : « 50 », « 50 min », « 50min », « 1 h », « 1h30 »,
 * « 1 h 30 ». `null` si illisible. */
export function lireDuree(texte: string): number | null {
  const t = texte.trim().toLowerCase().replace(/\s+/g, ' ')
  let r = /^(\d{1,3}) ?(?:m|min|mn|minutes?)?\.?$/.exec(t)
  if (r) return Number(r[1])
  r = /^(\d{1,2}) ?h(?:eures?)? ?(\d{1,2})? ?(?:min)?$/.exec(t)
  if (r) return Number(r[1]) * 60 + Number(r[2] ?? 0)
  return null
}

/* --------------------------------------------------------------------------- journée calculée */

export interface HeureCalculee {
  numero: number
  debut: number
  fin: number
  corrigee: boolean
}

export interface PauseCalculee {
  apres: number
  type: TypePause
  debut: number
  fin: number
}

export interface Journee {
  heures: HeureCalculee[]
  pauses: PauseCalculee[]
  /** Fin de la dernière heure (minutes), ou début des cours s'il n'y en a aucune. */
  fin: number
}

/** Nombre d'heures du mercredi : réglage, sinon heures avant midi, sinon toutes. */
export function heuresDuMercredi(g: Pick<GrilleHoraire, 'nombre_heures' | 'pauses' | 'heures_mercredi'>): number {
  if (g.heures_mercredi !== null && g.heures_mercredi !== undefined) return Math.max(0, Math.min(g.heures_mercredi, g.nombre_heures))
  const midi = g.pauses.find((p) => p.type === 'midi')
  return midi ? Math.min(midi.apres, g.nombre_heures) : g.nombre_heures
}

/** Journée calculée d'une grille pour un jour (1 = lundi … 5 = vendredi ; 3 = mercredi écourté). */
export function journee(g: SaisieGrille, jour = 1): Journee {
  const n = jour === 3 ? heuresDuMercredi(g) : g.nombre_heures
  let t = minutes(g.debut) ?? 0
  const heures: HeureCalculee[] = []
  const pauses: PauseCalculee[] = []
  for (let i = 1; i <= n; i++) {
    const ex = g.exceptions.find((e) => e.heure === i)
    const exDebut = ex ? minutes(ex.debut) : null
    const exFin = ex ? minutes(ex.fin) : null
    const debut = exDebut ?? t
    const fin = exFin !== null && exFin > debut ? exFin : debut + g.duree_heure
    heures.push({ numero: i, debut, fin, corrigee: exDebut !== null || exFin !== null })
    t = fin
    const pause = i < n ? g.pauses.find((p) => p.apres === i) : undefined
    if (pause) {
      pauses.push({ apres: i, type: pause.type, debut: t, fin: t + pause.duree })
      t += pause.duree
    }
  }
  return { heures, pauses, fin: heures.length > 0 ? heures[heures.length - 1].fin : (minutes(g.debut) ?? 0) }
}

/** Aperçu d'une ligne : « H1 08h45 → 09h35 · H2 09h35 → 10h25 · Récréation 10h25 → 10h45 · … ». */
export function texteJournee(j: Journee): string {
  const morceaux: string[] = []
  for (const h of j.heures) {
    morceaux.push(`H${h.numero} ${plage(h.debut, h.fin)}`)
    const p = j.pauses.find((x) => x.apres === h.numero)
    if (p) morceaux.push(`${LIBELLE_PAUSE[p.type]} ${plage(p.debut, p.fin)}`)
  }
  return morceaux.join(' · ')
}

export interface ErreursGrille {
  debut?: string
  duree?: string
  nombre?: string
  pauses?: string
  mercredi?: string
  exceptions?: string
}

export function erreursGrille(g: SaisieGrille): ErreursGrille {
  const e: ErreursGrille = {}
  const d = minutes(g.debut)
  if (d === null) e.debut = 'Heure de début illisible : écris par exemple 08:45.'
  else if (d < DEBUT_MIN || d > DEBUT_MAX) e.debut = 'Début des cours : entre 06h00 et 20h00.'
  if (!Number.isInteger(g.duree_heure) || g.duree_heure < DUREE_HEURE_MIN || g.duree_heure > DUREE_HEURE_MAX) e.duree = `Durée d’une heure : de ${DUREE_HEURE_MIN} à ${DUREE_HEURE_MAX} min.`
  if (!Number.isInteger(g.nombre_heures) || g.nombre_heures < 1 || g.nombre_heures > HEURES_MAX) e.nombre = `Nombre d’heures : de 1 à ${HEURES_MAX}.`
  if (g.pauses.length > PAUSES_MAX) e.pauses = `${PAUSES_MAX} pauses au maximum.`
  else if (g.pauses.some((p) => p.apres < 1 || p.apres >= g.nombre_heures)) e.pauses = `Une pause se place entre deux heures : après H1 … H${Math.max(1, g.nombre_heures - 1)}.`
  else if (new Set(g.pauses.map((p) => p.apres)).size !== g.pauses.length) e.pauses = 'Deux pauses au même endroit : regroupe-les en une seule.'
  else if (g.pauses.some((p) => p.duree < DUREE_PAUSE_MIN || p.duree > DUREE_PAUSE_MAX)) e.pauses = `Durée d’une pause : de ${DUREE_PAUSE_MIN} à ${DUREE_PAUSE_MAX} min.`
  else if (g.pauses.filter((p) => p.type === 'midi').length > 1) e.pauses = 'Une seule pause de midi.'
  if (g.heures_mercredi !== null && (g.heures_mercredi < 0 || g.heures_mercredi > g.nombre_heures)) e.mercredi = `Mercredi : de 0 à ${g.nombre_heures} heures.`
  if (g.exceptions.length > HEURES_MAX || new Set(g.exceptions.map((x) => x.heure)).size !== g.exceptions.length) e.exceptions = 'Corrections d’heures en double.'
  else {
    for (const x of g.exceptions) {
      const a = minutes(x.debut)
      const b = minutes(x.fin)
      if (x.heure < 1 || x.heure > g.nombre_heures) {
        e.exceptions = `Correction de H${x.heure} : cette heure n’existe plus (H1 … H${g.nombre_heures}).`
        break
      }
      if (a === null || b === null) {
        e.exceptions = `H${x.heure} corrigée : heures illisibles.`
        break
      }
      if (b <= a) {
        e.exceptions = `H${x.heure} corrigée : la fin doit suivre le début.`
        break
      }
    }
  }
  if (!e.debut && !e.duree && !e.nombre && !e.pauses && !e.exceptions) {
    const j = journee(g)
    for (let i = 1; i < j.heures.length; i++) {
      const avant = j.heures[i - 1]
      const pause = j.pauses.find((p) => p.apres === avant.numero)
      if (j.heures[i].debut < (pause ? pause.fin : avant.fin)) {
        e.exceptions = `H${j.heures[i].numero} commencerait avant la fin de ${pause ? `la pause (${heureTexte(pause.fin)})` : `H${avant.numero} (${heureTexte(avant.fin)})`}.`
        break
      }
    }
    if (!e.exceptions && j.fin > 23 * 60 + 59) e.nombre = 'La journée finirait après minuit : moins d’heures ou des heures plus courtes.'
  }
  return e
}

/* ---------------------------------------------------------------------------------- créneaux */

export interface Creneau {
  ecole_id: string
  classe_id: string
  /** `AAAA-MM-JJ` (vide pour un créneau « de la semaine » sans date). */
  date: string
  jour: number
  heureDebut: number
  heureFin: number
  debut: number
  fin: number
  /** Heures de cours couvertes (2 pour une heure double). */
  nbHeures: number
}

/** « H2 (09h35 → 10h25) », « H1–H2 (08h45 → 10h25) ». */
export function libelleCreneau(c: Pick<Creneau, 'heureDebut' | 'heureFin' | 'debut' | 'fin'>): string {
  return `${numerosCreneau(c)} (${plage(c.debut, c.fin)})`
}

/** « H2 », « H1–H2 ». */
export function numerosCreneau(c: Pick<Creneau, 'heureDebut' | 'heureFin'>): string {
  return c.heureFin > c.heureDebut ? `H${c.heureDebut}–H${c.heureFin}` : `H${c.heureDebut}`
}

/** Créneaux d'un jour de la semaine (1–5), toutes écoles, triés par heure de début. `fusion` :
 * heures doubles regroupées. `dateLimite` : n'utilise que les cases créées au plus tard ce jour-là
 * (une case ajoutée aujourd'hui ne crée pas d'« oubli » pour les semaines passées). */
export function creneauxSemaine(jour: number, grilles: GrilleHoraire[], cases: CaseHoraire[], options: { fusion?: boolean; dateLimite?: string } = {}): Creneau[] {
  const fusion = options.fusion ?? true
  const resultat: Creneau[] = []
  if (jour < 1 || jour > 5) return resultat
  for (const g of grilles) {
    const j = journee(g, jour)
    const duJour = cases
      .filter((c) => c.ecole_id === g.ecole_id && c.jour === jour && c.semaine === null && c.heure <= j.heures.length)
      .filter((c) => !options.dateLimite || !c.cree_le || c.cree_le.slice(0, 10) <= options.dateLimite)
      .sort((a, b) => a.heure - b.heure)
    for (const c of duJour) {
      const h = j.heures[c.heure - 1]
      const precedent = resultat[resultat.length - 1]
      const pauseEntre = j.pauses.find((p) => p.apres === c.heure - 1)
      if (
        fusion &&
        precedent &&
        precedent.ecole_id === g.ecole_id &&
        precedent.classe_id === c.classe_id &&
        precedent.heureFin === c.heure - 1 &&
        pauseEntre?.type !== 'midi'
      ) {
        precedent.heureFin = c.heure
        precedent.fin = h.fin
        precedent.nbHeures += 1
      } else {
        resultat.push({ ecole_id: g.ecole_id, classe_id: c.classe_id, date: '', jour, heureDebut: c.heure, heureFin: c.heure, debut: h.debut, fin: h.fin, nbHeures: 1 })
      }
    }
  }
  return resultat.sort((a, b) => a.debut - b.debut || a.heureDebut - b.heureDebut)
}

export interface JourneeDeClasse {
  etat: EtatJour
  /** Vide si congé, week-end ou vacances. */
  creneaux: Creneau[]
}

/** Créneaux d'une DATE : rien les week-ends, congés et vacances FWB ; une année au calendrier
 * inconnu garde ses créneaux (« à confirmer »). */
export function creneauxDuJour(date: string, grilles: GrilleHoraire[], cases: CaseHoraire[], options: { dateLimite?: boolean } = {}): JourneeDeClasse {
  const etat = etatJour(date)
  if (etat.type !== 'classe' && etat.type !== 'inconnu') return { etat, creneaux: [] }
  const creneaux = creneauxSemaine(jourIso(date), grilles, cases, { dateLimite: options.dateLimite ? date : undefined }).map((c) => ({ ...c, date }))
  return { etat, creneaux }
}

/** Créneau proposé à l'ouverture du carnet : celui en cours, sinon le plus proche dans le temps
 * (à égalité, celui qui vient de finir : on note souvent après le cours). `prefere` restreint aux
 * créneaux voulus (classe du niveau d'un chapitre…) quand il y en a. */
export function creneauPropose<C extends Creneau>(creneaux: C[], maintenant: number, prefere?: (c: C) => boolean): C | null {
  const pool = prefere && creneaux.some(prefere) ? creneaux.filter(prefere) : creneaux
  let meilleur: C | null = null
  let ecart = Infinity
  for (const c of pool) {
    if (c.debut <= maintenant && maintenant < c.fin) return c
    const d = maintenant < c.debut ? c.debut - maintenant : maintenant - c.fin
    const passe = maintenant >= c.fin
    if (d < ecart || (d === ecart && passe)) {
      meilleur = c
      ecart = d
    }
  }
  return meilleur
}

/* ------------------------------------------------------------------------ séances et créneaux */

export interface SeanceHoraire {
  id: string
  classe_id: string
  date_seance: string
  heure_debut: string | null
  heure_fin: string | null
  numero_heure: number | null
  numero_heure_fin?: number | null
}

/** La séance notée pour ce créneau, s'il y en a une : même classe, même date, et numéros d'heure
 * qui se recouvrent (sinon plages horaires qui se recouvrent ; une séance sans horaire couvre tous
 * les créneaux de sa classe ce jour-là). */
export function seanceDuCreneau<S extends SeanceHoraire>(c: Creneau, seances: S[]): S | null {
  for (const s of seances) {
    if (s.classe_id !== c.classe_id || s.date_seance !== c.date) continue
    if (s.numero_heure) {
      const fin = s.numero_heure_fin ?? s.numero_heure
      if (s.numero_heure <= c.heureFin && fin >= c.heureDebut) return s
      continue
    }
    const d = minutes(s.heure_debut)
    if (d !== null) {
      const f = minutes(s.heure_fin) ?? d + 1
      if (d < c.fin && f > c.debut) return s
      continue
    }
    return s
  }
  return null
}

/** Date de départ par défaut du rappel des oubliées : `n` jours de classe en arrière, aujourd'hui
 * compris s'il en est un (congés et week-ends ne comptent pas). */
export function depuisParDefaut(aujourdhui: string, n = 14): string {
  let d = aujourdhui
  let compte = 0
  let premier = aujourdhui
  for (let i = 0; i < 400 && compte < n; i++) {
    if (estJourDeClasse(d)) {
      compte += 1
      premier = d
    }
    d = ajouterJours(d, -1)
  }
  return premier
}

/** Créneaux passés sans séance notée, de `depuis` à maintenant (congés FWB et week-ends exclus ;
 * une case ne compte qu'à partir du jour où elle a été ajoutée à l'horaire). Les plus récents
 * d'abord. */
export function creneauxOublies<S extends SeanceHoraire>(p: {
  grilles: GrilleHoraire[]
  cases: CaseHoraire[]
  seances: S[]
  depuis: string
  aujourdhui: string
  maintenant: number
}): Creneau[] {
  const oublies: Creneau[] = []
  if (p.depuis > p.aujourdhui) return oublies
  const parDate = new Map<string, S[]>()
  for (const s of p.seances) {
    if (s.date_seance < p.depuis || s.date_seance > p.aujourdhui) continue
    parDate.set(s.date_seance, [...(parDate.get(s.date_seance) ?? []), s])
  }
  for (let d = p.depuis, i = 0; d <= p.aujourdhui && i < 800; d = ajouterJours(d, 1), i++) {
    const { creneaux } = creneauxDuJour(d, p.grilles, p.cases, { dateLimite: true })
    for (const c of creneaux) {
      if (d === p.aujourdhui && c.fin > p.maintenant) continue
      if (!seanceDuCreneau(c, parDate.get(d) ?? [])) oublies.push(c)
    }
  }
  return oublies.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.debut - a.debut))
}

export interface HeuresRestantes {
  classe_id: string
  heures: number
  seances: number
}

/** Heures de cours restantes par classe, de maintenant au `jusqua` inclus (congés FWB exclus ;
 * aujourd'hui : seulement les créneaux pas encore commencés). Une heure double = 2 heures,
 * 1 séance. `aConfirmer` : la période touche une année au calendrier inconnu. */
export function heuresRestantes(p: { grilles: GrilleHoraire[]; cases: CaseHoraire[]; aujourdhui: string; maintenant: number; jusqua: string }): {
  parClasse: Map<string, HeuresRestantes>
  aConfirmer: string[]
} {
  const parClasse = new Map<string, HeuresRestantes>()
  const aConfirmer = new Set<string>()
  for (let d = p.aujourdhui, i = 0; d <= p.jusqua && i < 800; d = ajouterJours(d, 1), i++) {
    const { etat, creneaux } = creneauxDuJour(d, p.grilles, p.cases)
    if (!etat.verifie && etat.type !== 'weekend') aConfirmer.add(etat.annee)
    for (const c of creneaux) {
      if (d === p.aujourdhui && c.debut < p.maintenant) continue
      const r = parClasse.get(c.classe_id) ?? { classe_id: c.classe_id, heures: 0, seances: 0 }
      r.heures += c.nbHeures
      r.seances += 1
      parClasse.set(c.classe_id, r)
    }
  }
  return { parClasse, aConfirmer: [...aConfirmer] }
}

/* --------------------------------------------------------------------------- chevauchements */

export interface Chevauchement {
  jour: number
  a: Creneau
  b: Creneau
}

/** Heures de deux écoles différentes qui se recouvrent le même jour (professeur dans deux écoles). */
export function chevauchements(grilles: GrilleHoraire[], cases: CaseHoraire[]): Chevauchement[] {
  const liste: Chevauchement[] = []
  for (let jour = 1; jour <= 5; jour++) {
    const heures = creneauxSemaine(jour, grilles, cases, { fusion: false })
    for (let i = 0; i < heures.length; i++)
      for (let k = i + 1; k < heures.length; k++) {
        const a = heures[i]
        const b = heures[k]
        if (a.ecole_id !== b.ecole_id && a.debut < b.fin && b.debut < a.fin) liste.push({ jour, a, b })
      }
  }
  return liste
}

/** Cases au-delà du nombre d'heures d'une grille (à retirer quand on raccourcit la journée). */
export function casesHorsGrille(g: Pick<GrilleHoraire, 'ecole_id' | 'nombre_heures' | 'pauses' | 'heures_mercredi'>, cases: CaseHoraire[]): CaseHoraire[] {
  return cases.filter((c) => c.ecole_id === g.ecole_id && c.heure > (c.jour === 3 ? heuresDuMercredi(g) : g.nombre_heures))
}

/** Normalise une grille lue en base (colonnes `time` « 08:45:00 », jsonb éventuellement absent). */
export function nettoyerGrille(g: GrilleHoraire): GrilleHoraire {
  return {
    ...g,
    debut: champHeure(minutes(g.debut) ?? 8 * 60),
    pauses: Array.isArray(g.pauses) ? g.pauses : [],
    exceptions: Array.isArray(g.exceptions) ? g.exceptions.map((x) => ({ ...x, debut: champHeure(minutes(x.debut) ?? 0), fin: champHeure(minutes(x.fin) ?? 0) })) : [],
    heures_mercredi: g.heures_mercredi ?? null,
  }
}
