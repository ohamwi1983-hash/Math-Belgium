/**
 * Mise en page de l'horaire pour les vues « Aujourd'hui » (les heures d'un jour, pauses comprises)
 * et « Ma semaine » (grille jours × heures). PUR : ne fait que réarranger ce que calcule
 * `lib/horaire.ts` (créneaux, heures doubles, congés FWB).
 */
import { ajouterJours, jourIso, type EtatJour } from '../../lib/calendrierFwb'
import { creneauxDuJour, heureDe, journee, type CaseHoraire, type Creneau, type GrilleHoraire, type HeureCalculee, type PauseCalculee } from '../../lib/horaire'
import { journeeAgenda, type ContexteAgenda, type CreneauSupprime } from '../../lib/agendaEvenements'

export type LigneJour =
  | { type: 'creneau'; c: Creneau }
  | { type: 'supprime'; s: CreneauSupprime }
  | { type: 'libre'; de: HeureCalculee; a: HeureCalculee }
  | { type: 'pause'; p: PauseCalculee }

/** Créneaux d'une date : sans agenda, comme avant ; avec l'agenda (0006), les heures supprimées par
 * un événement sont retirées des créneaux et rendues à part. */
function creneauxEtSupprimes(date: string, grilles: GrilleHoraire[], cases: CaseHoraire[], agenda?: Omit<ContexteAgenda, 'grilles' | 'cases'>) {
  if (!agenda) return { ...creneauxDuJour(date, grilles, cases), supprimes: [] as CreneauSupprime[] }
  const j = journeeAgenda(date, { ...agenda, grilles, cases })
  return { etat: j.etat, creneaux: j.creneaux, supprimes: j.supprimes }
}

/** Grilles qui ont au moins une case dans l'horaire. */
export function grillesActives(grilles: GrilleHoraire[], cases: CaseHoraire[]): GrilleHoraire[] {
  return grilles.filter((g) => cases.some((c) => c.ecole_id === g.ecole_id))
}

/**
 * Les lignes d'un jour : chaque heure de la journée de l'école (H0 comprise), les créneaux (heure
 * double = une ligne), les heures libres regroupées (« H6–H7 · libre ») et les pauses (récréation,
 * midi) à leur place. Professeur dans plusieurs écoles le même jour : les créneaux seulement, dans
 * l'ordre de l'heure.
 */
export function lignesDuJour(
  date: string,
  grilles: GrilleHoraire[],
  cases: CaseHoraire[],
  agenda?: Omit<ContexteAgenda, 'grilles' | 'cases'>,
): { etat: EtatJour; creneaux: Creneau[]; supprimes: CreneauSupprime[]; lignes: LigneJour[] } {
  const { etat, creneaux, supprimes } = creneauxEtSupprimes(date, grilles, cases, agenda)
  const ecoles = [...new Set([...creneaux, ...supprimes].map((c) => c.ecole_id))]
  const enVrac = (): LigneJour[] =>
    [...creneaux.map((c): LigneJour => ({ type: 'creneau', c })), ...supprimes.map((x): LigneJour => ({ type: 'supprime', s: x }))].sort((a, b) => {
      const da = a.type === 'creneau' ? a.c.debut : a.type === 'supprime' ? a.s.debut : 0
      const db = b.type === 'creneau' ? b.c.debut : b.type === 'supprime' ? b.s.debut : 0
      return da - db
    })
  if (creneaux.length === 0 && supprimes.length === 0) return { etat, creneaux, supprimes, lignes: [] }
  if (ecoles.length > 1) return { etat, creneaux, supprimes, lignes: enVrac() }
  const g = grilles.find((x) => x.ecole_id === ecoles[0])
  if (!g) return { etat, creneaux, supprimes, lignes: enVrac() }
  const j = journee(g, jourIso(date))
  const lignes: LigneJour[] = []
  let libres: HeureCalculee[] = []
  const vider = () => {
    if (libres.length > 0) lignes.push({ type: 'libre', de: libres[0], a: libres[libres.length - 1] })
    libres = []
  }
  for (let k = 0; k < j.heures.length; k++) {
    const h = j.heures[k]
    let derniere = h.numero
    const c = creneaux.find((x) => x.heureDebut === h.numero)
    const sup = c ? undefined : supprimes.find((x) => x.heureDebut === h.numero)
    if (c) {
      vider()
      lignes.push({ type: 'creneau', c })
      while (k + 1 < j.heures.length && j.heures[k + 1].numero <= c.heureFin) k++
      derniere = c.heureFin
    } else if (sup) {
      vider()
      lignes.push({ type: 'supprime', s: sup })
      while (k + 1 < j.heures.length && j.heures[k + 1].numero <= sup.heureFin) k++
      derniere = sup.heureFin
    } else {
      libres.push(h)
    }
    const p = j.pauses.find((x) => x.apres === derniere)
    if (p) {
      vider()
      lignes.push({ type: 'pause', p })
    }
  }
  vider()
  return { etat, creneaux, supprimes, lignes }
}

export type RangeeSemaine = { type: 'heure'; numero: number; debut: number; fin: number } | { type: 'pause'; p: PauseCalculee }

export type CelluleSemaine =
  | { type: 'creneau'; c: Creneau; span: number }
  | { type: 'supprime'; s: CreneauSupprime; span: number }
  | { type: 'libre'; numero: number }
  | { type: 'sans'; span: number }
  | { type: 'pause' }
  | { type: 'conge'; span: number; etat: EtatJour }

export interface JourSemaine {
  date: string
  jour: number
  etat: EtatJour
  /** Une cellule par rangée ; `null` = couverte par la cellule d'au-dessus (`rowSpan`). */
  cellules: (CelluleSemaine | null)[]
  /** Créneaux qui n'ont pas trouvé place (deux écoles à la même heure). */
  autres: Creneau[]
  creneaux: Creneau[]
  /** Heures supprimées par un événement (agenda, 0006). */
  supprimes: CreneauSupprime[]
}

/** Grille « Ma semaine » : rangées (heures de toutes les écoles actives, H0 comprise, pauses de
 * l'école principale) × 5 jours. Jour de congé : une cellule sur toute la hauteur ; heures sans
 * cours ce jour-là (mercredi après-midi) : regroupées. */
export function grilleSemaine(
  lundi: string,
  grilles: GrilleHoraire[],
  cases: CaseHoraire[],
  principale?: string,
  agenda?: Omit<ContexteAgenda, 'grilles' | 'cases'>,
): { rangees: RangeeSemaine[]; jours: JourSemaine[] } {
  const actives = grillesActives(grilles, cases).sort((a, b) => (a.ecole_id === principale ? -1 : b.ecole_id === principale ? 1 : 0))
  const numeros = new Map<number, HeureCalculee>()
  for (const g of actives) for (const h of journee(g, 1).heures) if (!numeros.has(h.numero)) numeros.set(h.numero, h)
  const pauses = actives[0] ? journee(actives[0], 1).pauses : []
  const rangees: RangeeSemaine[] = []
  for (const [numero, h] of [...numeros.entries()].sort((a, b) => a[0] - b[0])) {
    rangees.push({ type: 'heure', numero, debut: h.debut, fin: h.fin })
    const p = pauses.find((x) => x.apres === numero)
    if (p && numeros.has(numero + 1)) rangees.push({ type: 'pause', p })
  }
  const jours: JourSemaine[] = []
  for (let i = 0; i < 5; i++) {
    const date = ajouterJours(lundi, i)
    const jour = i + 1
    const { etat, creneaux, supprimes } = creneauxEtSupprimes(date, grilles, cases, agenda)
    const cellules: (CelluleSemaine | null | undefined)[] = Array.from({ length: rangees.length }, () => undefined)
    const places = new Set<Creneau>()
    const placesSupprimees = new Set<CreneauSupprime>()
    if (etat.type !== 'classe' && etat.type !== 'inconnu') {
      if (rangees.length > 0) cellules[0] = { type: 'conge', span: rangees.length, etat }
      for (let k = 1; k < rangees.length; k++) cellules[k] = null
      jours.push({ date, jour, etat, cellules: cellules as (CelluleSemaine | null)[], autres: [], creneaux, supprimes })
      continue
    }
    const journees = actives.map((g) => journee(g, jour))
    const existe = (n: number) => journees.some((j) => heureDe(j, n) !== undefined)
    const debutDe = (n: number) => creneaux.find((c) => c.heureDebut === n && !places.has(c))
    const indexHeure = (n: number) => rangees.findIndex((r) => r.type === 'heure' && r.numero === n)
    for (let k = 0; k < rangees.length; k++) {
      if (cellules[k] !== undefined) continue
      const r = rangees[k]
      if (r.type === 'pause') {
        cellules[k] = { type: 'pause' }
        continue
      }
      const c = debutDe(r.numero)
      const sup = c ? undefined : supprimes.find((x) => x.heureDebut === r.numero && !placesSupprimees.has(x))
      if (c) {
        places.add(c)
        const fin = Math.max(k, indexHeure(c.heureFin))
        cellules[k] = { type: 'creneau', c, span: fin - k + 1 }
        for (let m = k + 1; m <= fin; m++) cellules[m] = null
      } else if (sup) {
        placesSupprimees.add(sup)
        const fin = Math.max(k, indexHeure(sup.heureFin))
        cellules[k] = { type: 'supprime', s: sup, span: fin - k + 1 }
        for (let m = k + 1; m <= fin; m++) cellules[m] = null
      } else if (!existe(r.numero)) {
        let fin = k
        for (;;) {
          const suivante = rangees[fin + 1]
          if (suivante?.type === 'heure' && !existe(suivante.numero)) fin += 1
          else if (suivante?.type === 'pause' && rangees[fin + 2]?.type === 'heure' && !existe((rangees[fin + 2] as { numero: number }).numero)) fin += 2
          else break
        }
        cellules[k] = { type: 'sans', span: fin - k + 1 }
        for (let m = k + 1; m <= fin; m++) cellules[m] = null
      } else {
        cellules[k] = { type: 'libre', numero: r.numero }
      }
    }
    jours.push({ date, jour, etat, cellules: cellules as (CelluleSemaine | null)[], autres: creneaux.filter((c) => !places.has(c)), creneaux, supprimes })
  }
  return { rangees, jours }
}
