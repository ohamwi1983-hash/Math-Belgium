/**
 * Agenda du carnet (`supabase/migrations/0006_agenda.sql`) — logique PURE, sans React ni
 * supabase-js, testée seule (esbuild + node). Voir `.claude/rules/comptes.md`, sous-section
 * « Événements et bulletin ».
 *
 * Événements : sortie, voyage scolaire, journée pédagogique, conseil de classe, absence du professeur,
 * session d'examens, interrogation, autre. Un événement est rattaché à une école ; il concerne toutes les classes de
 * cette école ou certaines ; il dure du … au …, toute la journée ou de la n-ième à la m-ième heure
 * (numéros de l'horaire de l'école). Pendant l'événement, les classes concernées n'ont pas cours :
 * leurs heures sont SUPPRIMÉES (rien à noter, pas d'oubli, pas comptées dans les heures effectives).
 * « J'accompagne » : les heures du professeur avec ses AUTRES classes pendant l'événement le sont
 * aussi (même école : par numéro d'heure ; autre école : par recouvrement des horaires ; journée
 * entière : toute la journée). Une INTERROGATION ne supprime rien (c'est une heure de cours) : une
 * classe, une date, heure et chapitre facultatifs. Une ABSENCE DU PROFESSEUR concerne toujours TOUTES
 * ses classes de l'école de l'événement (`toutes_classes` vrai, jamais « J'accompagne ») : leurs heures
 * sont supprimées ; une absence d'une journée entière ne compte pas comme jour de classe.
 *
 * Périodes du bulletin : par école et par année scolaire, la date de remise des points de chaque
 * période. Jours de classe = jours ouvrables hors congés FWB (`calendrierFwb.ts`) et hors événements
 * « journée entière, toutes les classes » de l'école (journée pédagogique…). Une interro compte pour
 * la période dont la remise est le premier jour ≥ sa date ; « jours pour corriger » = jours de classe
 * APRÈS l'interro jusqu'à la remise INCLUSE (interro mer. 9/12, remise ven. 11/12 → 2 : jeu., ven.).
 */
import { ajouterJours, anneeScolaireDe, CALENDRIER_FWB, estJourDeClasse, etatJour, jourIso } from './calendrierFwb'
import { creneauxDuJour, creneauxSemaine, journee, type CaseHoraire, type Creneau, type GrilleHoraire, type HeureDeCours, type HeureSupprimee } from './horaire'

/* ------------------------------------------------------------------------------- types */

export type TypeEvenement = 'sortie' | 'voyage' | 'journee_pedagogique' | 'conseil_classe' | 'absence_professeur' | 'session_examens' | 'interrogation' | 'autre'

/** Ordre des puces du formulaire. */
export const TYPES_EVENEMENT: TypeEvenement[] = ['sortie', 'voyage', 'journee_pedagogique', 'conseil_classe', 'absence_professeur', 'session_examens', 'interrogation', 'autre']

export const LIBELLE_TYPE: Record<TypeEvenement, string> = {
  sortie: 'Sortie',
  voyage: 'Voyage scolaire',
  journee_pedagogique: 'Journée pédagogique',
  conseil_classe: 'Conseil de classe',
  absence_professeur: 'Absence du professeur',
  session_examens: 'Session d’examens',
  interrogation: 'Interrogation',
  autre: 'Autre',
}

export const INTITULE_MAX = 120
export const SEUIL_DEFAUT = 3
export const SEUIL_MIN = 0
export const SEUIL_MAX = 15
export const PERIODES_MAX = 8
export const HEURE_EVENEMENT_MAX = 15

export interface Evenement {
  id: string
  ecole_id: string
  type: TypeEvenement
  intitule: string
  /** `AAAA-MM-JJ`, inclus. */
  du: string
  au: string
  journee_entiere: boolean
  heure_debut: number | null
  heure_fin: number | null
  toutes_classes: boolean
  accompagne: boolean
  /** Interrogation : sa classe. */
  classe_id: string | null
  /** Interrogation : « niveau/chapitre » facultatif. */
  chapitre: string | null
  /** « Certaines classes » : les classes liées (`evenements_classes`). */
  classes: string[]
  cree_le: string
}

/** Ce que le formulaire envoie. */
export type SaisieEvenement = Omit<Evenement, 'id' | 'cree_le'>

export interface PeriodeBulletin {
  id: string
  ecole_id: string
  /** « 2026-2027 ». */
  annee_scolaire: string
  numero: number
  /** Date de remise des points, `AAAA-MM-JJ`. */
  remise: string
}

export interface ClasseAgenda {
  id: string
  ecole_id: string
  nom: string
}

/** Tout ce qu'il faut pour savoir quelles heures ont lieu. */
export interface ContexteAgenda {
  grilles: GrilleHoraire[]
  cases: CaseHoraire[]
  evenements: Evenement[]
  classes: ClasseAgenda[]
}

/* ------------------------------------------------------------------------------- textes */

const JOURS_COURTS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.']
const JOURS_LONGS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']

function jourDeLaSemaine(iso: string): number {
  const j = jourIso(iso)
  return j === 7 ? 0 : j
}

/** « 3/12 » ; avec l'année, date complète « 03/12/2026 » (maquette des réglages). */
export function jourMoisCourt(iso: string, avecAnnee = false): string {
  const r = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!r) return iso
  return avecAnnee ? `${r[3]}/${r[2]}/${r[1]}` : `${Number(r[3])}/${r[2]}`
}

/** « jeu. 3/12 ». */
export function dateCourteJour(iso: string, avecAnnee = false): string {
  return `${JOURS_COURTS[jourDeLaSemaine(iso)]} ${jourMoisCourt(iso, avecAnnee)}`
}

/** « vendredi 11/12 ». */
export function dateJourLong(iso: string): string {
  return `${JOURS_LONGS[jourDeLaSemaine(iso)]} ${jourMoisCourt(iso)}`
}

/** « 1re », « 3e » ; 0 : « heure zéro » n'a pas d'ordinal (« H0 »). */
export function ordinal(n: number): string {
  return n === 0 ? 'H0' : `${n}${n === 1 ? 're' : 'e'}`
}

/** « 3e h », « 3e, 4e h », « H0 ». */
export function numerosTexte(numeros: number[]): string {
  const tri = [...new Set(numeros)].sort((a, b) => a - b)
  if (tri.length === 0) return ''
  if (tri.length === 1 && tri[0] === 0) return 'H0'
  return `${tri.map(ordinal).join(', ')} h`
}

/** « (3e à 5e heure) », « (2e heure) », « (heure zéro à 2e heure) », « » pour la journée entière. */
export function heuresTexte(e: Pick<Evenement, 'journee_entiere' | 'heure_debut' | 'heure_fin'>): string {
  if (e.journee_entiere || e.heure_debut === null || e.heure_fin === null) return ''
  const nom = (n: number) => (n === 0 ? 'heure zéro' : `${ordinal(n)} heure`)
  if (e.heure_fin === e.heure_debut) return nom(e.heure_debut)
  return `${e.heure_debut === 0 ? 'heure zéro' : ordinal(e.heure_debut)} à ${ordinal(e.heure_fin)} heure`
}

/** Minuscule initiale, sauf sigle (« Formation » → « formation », « IFC » reste « IFC »). */
function minusculeInitiale(t: string): string {
  return t.length > 1 && t.charAt(1) !== t.charAt(1).toLowerCase() ? t : t.charAt(0).toLowerCase() + t.slice(1)
}

/** Absence du professeur : l'intitulé facultatif (« Formation ») en précision, jamais à la place du
 * type — « Absence du professeur (formation) ». */
function precisionAbsence(e: Pick<Evenement, 'type' | 'intitule'>): string {
  const t = e.intitule.trim()
  return !t || t.toLowerCase() === LIBELLE_TYPE.absence_professeur.toLowerCase() ? '' : ` (${minusculeInitiale(t)})`
}

export function titreEvenement(e: Pick<Evenement, 'type' | 'intitule'>): string {
  if (e.type === 'absence_professeur') return `${LIBELLE_TYPE.absence_professeur}${precisionAbsence(e)}`
  return e.intitule.trim() || LIBELLE_TYPE[e.type]
}

/** « théâtre « Antigone » », « absence du professeur (formation) » : minuscule initiale, pour
 * « Pas cours — … ». */
export function motifCourt(e: Pick<Evenement, 'type' | 'intitule'>): string {
  const t = titreEvenement(e)
  return t.charAt(0).toLowerCase() + t.slice(1)
}

/** Qui est concerné, en toutes lettres : « 5e B », « toutes les classes », « toutes tes classes »
 * (absence du professeur ; « … de l'école » s'il a des classes dans une autre école). */
export function quiTexte(e: Evenement, classes: ClasseAgenda[]): string {
  const noms = (ids: string[]) => ids.map((id) => classes.find((c) => c.id === id)?.nom ?? '?').join(', ')
  if (e.type === 'interrogation') return noms(classesConcernees(e, classes))
  if (e.type === 'absence_professeur') return classes.some((c) => c.ecole_id !== e.ecole_id) ? 'toutes tes classes de l’école' : 'toutes tes classes'
  if (e.toutes_classes) return 'toutes les classes'
  const concernees = classesConcernees(e, classes)
  return concernees.length > 0 ? noms(concernees) : 'aucune classe'
}

/** « du jeu. 3/12 au ven. 4/12 », « jeu. 3/12 ». */
export function datesTexte(e: Pick<Evenement, 'du' | 'au'>): string {
  return e.du === e.au ? dateCourteJour(e.du) : `du ${dateCourteJour(e.du)} au ${dateCourteJour(e.au)}`
}

/* ------------------------------------------------------------------------------- classes concernées */

/** Classes directement concernées : la classe de l'interro, toutes celles de l'école, ou celles
 * liées (encore existantes, de l'école). */
export function classesConcernees(e: Evenement, classes: ClasseAgenda[]): string[] {
  if (e.type === 'interrogation') return e.classe_id && classes.some((c) => c.id === e.classe_id) ? [e.classe_id] : []
  const deLEcole = classes.filter((c) => c.ecole_id === e.ecole_id)
  if (e.toutes_classes) return deLEcole.map((c) => c.id)
  return deLEcole.filter((c) => e.classes.includes(c.id)).map((c) => c.id)
}

/** L'événement concerne-t-il cette classe (directement) ? */
export function concerne(e: Evenement, classe: ClasseAgenda): boolean {
  if (e.type === 'interrogation') return e.classe_id === classe.id
  if (e.ecole_id !== classe.ecole_id) return false
  return e.toutes_classes || e.classes.includes(classe.id)
}

export function dansLEvenement(e: Pick<Evenement, 'du' | 'au'>, date: string): boolean {
  return e.du <= date && date <= e.au
}

/** Journée sans cours pour TOUTE l'école (journée pédagogique…) : ne compte pas comme jour de classe. */
export function journeeSansCours(e: Evenement, ecoleId: string, date: string): boolean {
  return e.type !== 'interrogation' && e.ecole_id === ecoleId && e.journee_entiere && e.toutes_classes && dansLEvenement(e, date)
}

function ordreCreation(a: Evenement, b: Evenement): number {
  return a.cree_le < b.cree_le ? -1 : a.cree_le > b.cree_le ? 1 : a.id < b.id ? -1 : 1
}

/* ------------------------------------------------------------------------------- heures supprimées */

export interface Suppression {
  evenement: Evenement
  /** Vrai : l'heure n'est pas d'une classe concernée, le professeur accompagne. */
  accompagne: boolean
}

/** Plage horaire (minutes) de l'événement ce jour-là, d'après la grille de SON école. */
function plageEvenement(e: Evenement, date: string, grilles: GrilleHoraire[]): { debut: number; fin: number } | null {
  if (e.journee_entiere || e.heure_debut === null || e.heure_fin === null) return null
  const g = grilles.find((x) => x.ecole_id === e.ecole_id)
  if (!g) return null
  const j = journee(g, jourIso(date))
  const heures = j.heures.filter((h) => h.numero >= (e.heure_debut as number) && h.numero <= (e.heure_fin as number))
  if (heures.length === 0) return null
  return { debut: heures[0].debut, fin: heures[heures.length - 1].fin }
}

/**
 * Pourquoi cette heure de cours n'a PAS lieu ce jour-là (ou `null`) : un événement qui concerne sa
 * classe et couvre l'heure (prioritaire), sinon un événement « J'accompagne » d'une autre classe qui
 * tombe sur elle. À égalité, le plus ancien créé. Une interrogation ne supprime jamais rien ; un
 * événement « certaines classes » sans aucune classe restante est ignoré.
 */
export function raisonSuppression(date: string, h: HeureDeCours, ctx: Pick<ContexteAgenda, 'evenements' | 'classes' | 'grilles'>): Suppression | null {
  const candidats = ctx.evenements.filter((e) => e.type !== 'interrogation' && dansLEvenement(e, date)).sort(ordreCreation)
  const classe = ctx.classes.find((c) => c.id === h.classe_id) ?? { id: h.classe_id, ecole_id: h.ecole_id, nom: '' }
  const couvreParNumero = (e: Evenement) => e.journee_entiere || (e.heure_debut !== null && e.heure_fin !== null && h.heure >= e.heure_debut && h.heure <= e.heure_fin)
  for (const e of candidats) if (concerne(e, classe) && couvreParNumero(e)) return { evenement: e, accompagne: false }
  for (const e of candidats) {
    if (!e.accompagne || concerne(e, classe)) continue
    if (classesConcernees(e, ctx.classes).length === 0) continue
    if (e.journee_entiere) return { evenement: e, accompagne: true }
    if (h.ecole_id === e.ecole_id) {
      if (couvreParNumero(e)) return { evenement: e, accompagne: true }
      continue
    }
    const p = plageEvenement(e, date, ctx.grilles)
    if (p && h.debut < p.fin && p.debut < h.fin) return { evenement: e, accompagne: true }
  }
  return null
}

/** Prédicat pour `lib/horaire.ts` (`creneauxDuJour`, `creneauxOublies`, `heuresRestantes`). */
export function predicatSuppression(ctx: Pick<ContexteAgenda, 'evenements' | 'classes' | 'grilles'>): HeureSupprimee | undefined {
  if (!ctx.evenements.some((e) => e.type !== 'interrogation')) return undefined
  return (date, h) => raisonSuppression(date, h, ctx) !== null
}

/** Créneau supprimé (heures consécutives de la même classe, même événement, regroupées). */
export interface CreneauSupprime extends Creneau, Suppression {}

export interface JourneeAgenda {
  etat: ReturnType<typeof etatJour>
  /** Créneaux qui ont lieu (heures doubles regroupées), comme `creneauxDuJour`. */
  creneaux: Creneau[]
  /** Heures de l'horaire supprimées ce jour-là. */
  supprimes: CreneauSupprime[]
  /** Événements de ce jour (interrogations comprises), plus anciens d'abord. */
  evenements: Evenement[]
}

/** Les heures d'une date : celles qui ont lieu, celles qui sont supprimées (et pourquoi). */
export function journeeAgenda(date: string, ctx: ContexteAgenda): JourneeAgenda {
  const supprimee = predicatSuppression(ctx)
  const { etat, creneaux } = creneauxDuJour(date, ctx.grilles, ctx.cases, { supprimee })
  const evenements = ctx.evenements.filter((e) => dansLEvenement(e, date)).sort(ordreCreation)
  const supprimes: CreneauSupprime[] = []
  if ((etat.type === 'classe' || etat.type === 'inconnu') && supprimee) {
    const heures = creneauxSemaine(jourIso(date), ctx.grilles, ctx.cases, { fusion: false })
    for (const c of heures) {
      const r = raisonSuppression(date, { ecole_id: c.ecole_id, classe_id: c.classe_id, jour: c.jour, heure: c.heureDebut, debut: c.debut, fin: c.fin }, ctx)
      if (!r) continue
      const prec = supprimes[supprimes.length - 1]
      if (prec && prec.ecole_id === c.ecole_id && prec.classe_id === c.classe_id && prec.evenement.id === r.evenement.id && prec.heureFin === c.heureDebut - 1) {
        prec.heureFin = c.heureDebut
        prec.fin = c.fin
        prec.nbHeures += 1
      } else supprimes.push({ ...c, date, ...r })
    }
  }
  return { etat, creneaux, supprimes, evenements }
}

/** Interrogation(s) d'un créneau : même classe, même date, sans heure ou heure qui recouvre. */
export function interrosDuCreneau(c: Pick<Creneau, 'classe_id' | 'date' | 'heureDebut' | 'heureFin'>, evenements: Evenement[]): Evenement[] {
  return evenements.filter(
    (e) =>
      e.type === 'interrogation' &&
      e.classe_id === c.classe_id &&
      e.du === c.date &&
      (e.journee_entiere || e.heure_debut === null || e.heure_fin === null || (e.heure_debut <= c.heureFin && e.heure_fin >= c.heureDebut)),
  )
}

/**
 * Résumé « Heures supprimées : 5e B · 3e h — 6e C · 4e h (tu accompagnes) » d'un événement (même
 * pas encore enregistré) sur toute sa durée. Plusieurs jours : nombre d'heures par classe.
 * `null` : aucune heure de l'horaire touchée.
 */
export function resumeSuppressions(e: Evenement, ctx: ContexteAgenda): { texte: string; heures: number } | null {
  if (e.type === 'interrogation') return null
  const seul: ContexteAgenda = { ...ctx, evenements: [e] }
  const parClasse = new Map<string, { accompagne: boolean; numeros: number[]; dates: Set<string> }>()
  let total = 0
  for (let d = e.du, i = 0; d <= e.au && i < 400; d = ajouterJours(d, 1), i++) {
    for (const s of journeeAgenda(d, seul).supprimes) {
      const r = parClasse.get(s.classe_id) ?? { accompagne: s.accompagne, numeros: [], dates: new Set<string>() }
      for (let n = s.heureDebut; n <= s.heureFin; n++) r.numeros.push(n)
      r.dates.add(d)
      total += s.nbHeures
      parClasse.set(s.classe_id, r)
    }
  }
  if (parClasse.size === 0) return null
  const nom = (id: string) => ctx.classes.find((c) => c.id === id)?.nom ?? '?'
  const morceaux = [...parClasse.entries()]
    .sort((a, b) => Number(a[1].accompagne) - Number(b[1].accompagne) || nom(a[0]).localeCompare(nom(b[0]), 'fr'))
    .map(([id, r]) => `${nom(id)} · ${r.dates.size > 1 ? `${r.numeros.length} h` : numerosTexte(r.numeros)}${r.accompagne ? ' (tu accompagnes)' : ''}`)
  return { texte: morceaux.join(' — '), heures: total }
}

/** Classes dont au moins une heure est supprimée par cet événement (accompagnement compris). */
export function classesTouchees(e: Evenement, ctx: ContexteAgenda): Set<string> {
  const ids = new Set<string>()
  if (e.type === 'interrogation') return ids
  const seul: ContexteAgenda = { ...ctx, evenements: [e] }
  for (let d = e.du, i = 0; d <= e.au && i < 400; d = ajouterJours(d, 1), i++) for (const s of journeeAgenda(d, seul).supprimes) ids.add(s.classe_id)
  return ids
}

/** « Théâtre — 5e B (3e à 5e heure). Tu accompagnes : tes heures avec la 6e C sont aussi
 * supprimées. » — bandeau d'un événement un jour donné. */
export function texteBandeau(e: Evenement, date: string, ctx: ContexteAgenda, titreChapitre?: (cle: string) => string): { titre: string; suite: string } {
  const noms = (ids: string[]) => ids.map((id) => ctx.classes.find((c) => c.id === id)?.nom ?? '?').join(', ')
  const heures = heuresTexte(e)
  if (e.type === 'interrogation') {
    const ch = e.chapitre ? ` · ${titreChapitre ? titreChapitre(e.chapitre) : e.chapitre}` : ''
    return { titre: `Interrogation — ${noms(classesConcernees(e, ctx.classes))}${ch}`, suite: heures ? ` (${heures}).` : '.' }
  }
  const qui = quiTexte(e, ctx.classes)
  let suite = heures ? ` (${heures}).` : e.du !== e.au ? ` (${datesTexte(e)}).` : ''
  if (e.accompagne) {
    const autres = [...new Set(journeeAgenda(date, { ...ctx, evenements: [e] }).supprimes.filter((s) => s.accompagne).map((s) => s.classe_id))]
    suite += autres.length > 0 ? ` Tu accompagnes : tes heures avec ${autres.length > 1 ? 'les' : 'la'} ${noms(autres)} sont aussi supprimées.` : ' Tu accompagnes.'
  }
  return { titre: `${titreEvenement(e)} — ${qui}`, suite: suite.trimEnd() }
}

/* ------------------------------------------------------------------------------- jours de classe */

export interface JoursDeClasse {
  jours: number
  /** Jours ouvrables de classe FWB retirés par une journée sans cours de l'école. */
  sansCours: { date: string; evenement: Evenement }[]
}

/** Jours de classe de l'école APRÈS `apres` (exclu) jusqu'à `jusqua` INCLUS. */
export function joursDeClasse(apres: string, jusqua: string, ecoleId: string, evenements: Evenement[]): JoursDeClasse {
  let jours = 0
  const sansCours: JoursDeClasse['sansCours'] = []
  for (let d = ajouterJours(apres, 1), i = 0; d <= jusqua && i < 800; d = ajouterJours(d, 1), i++) {
    if (!estJourDeClasse(d)) continue
    const e = evenements.filter((x) => journeeSansCours(x, ecoleId, d)).sort(ordreCreation)[0]
    if (e) sansCours.push({ date: d, evenement: e })
    else jours += 1
  }
  return { jours, sansCours }
}

/** Nom du type avec son article, pour « (… ne compte pas) ». */
const TYPE_AVEC_ARTICLE: Record<TypeEvenement, string> = {
  sortie: 'la sortie',
  voyage: 'le voyage scolaire',
  journee_pedagogique: 'la journée pédagogique',
  conseil_classe: 'le conseil de classe',
  absence_professeur: 'ton absence',
  session_examens: 'la session d’examens',
  interrogation: 'l’interrogation',
  autre: 'l’événement',
}

/** « (la journée pédagogique ne compte pas) », « (ton absence ne compte pas) », « (2 journées sans
 * cours ne comptent pas) ». */
export function texteSansCours(s: JoursDeClasse['sansCours']): string {
  if (s.length === 0) return ''
  if (s.length === 1) {
    const e = s[0].evenement
    const t = e.intitule.trim()
    const generique = e.type === 'absence_professeur' || !t || t.toLowerCase() === LIBELLE_TYPE[e.type].toLowerCase()
    return `(${generique ? TYPE_AVEC_ARTICLE[e.type] : `« ${t} »`} ne compte pas)`
  }
  return `(${s.length} journées sans cours ne comptent pas)`
}

/* ------------------------------------------------------------------------------- périodes du bulletin */

/** Périodes d'une école pour une année scolaire, dans l'ordre des numéros. */
export function periodesDe(periodes: PeriodeBulletin[], ecoleId: string, annee: string): PeriodeBulletin[] {
  return periodes.filter((p) => p.ecole_id === ecoleId && p.annee_scolaire === annee).sort((a, b) => a.numero - b.numero)
}

/** Période à laquelle compte une date : la première dont la remise est ≥ la date (même année
 * scolaire). Après la dernière remise : `{ numero: dernière + 1, remise: null }`. `null` : aucune
 * période pour cette école et cette année. */
export function periodeDeLaDate(date: string, ecoleId: string, periodes: PeriodeBulletin[]): { numero: number; remise: string | null; periode: PeriodeBulletin | null } | null {
  const liste = periodesDe(periodes, ecoleId, anneeScolaireDe(date))
  if (liste.length === 0) return null
  const p = liste.find((x) => x.remise >= date)
  if (p) return { numero: p.numero, remise: p.remise, periode: p }
  return { numero: liste[liste.length - 1].numero + 1, remise: null, periode: null }
}

/** Prochaine remise des points de l'école à partir de `aujourdhui` (inclus), toutes années. */
export function prochaineRemise(ecoleId: string, periodes: PeriodeBulletin[], aujourdhui: string): PeriodeBulletin | null {
  return periodes.filter((p) => p.ecole_id === ecoleId && p.remise >= aujourdhui).sort((a, b) => (a.remise < b.remise ? -1 : 1))[0] ?? null
}

/** Période qui suit `p` (même école, même année), s'il y en a une. */
export function periodeSuivante(p: PeriodeBulletin, periodes: PeriodeBulletin[]): PeriodeBulletin | null {
  return periodesDe(periodes, p.ecole_id, p.annee_scolaire).find((x) => x.numero === p.numero + 1) ?? null
}

/** Une session d'examens de l'école commence-t-elle dans les 3 semaines après cette remise ?
 * (« examens de décembre ensuite »). */
export function examensApres(p: PeriodeBulletin, evenements: Evenement[]): Evenement | null {
  const limite = ajouterJours(p.remise, 21)
  return evenements.filter((e) => e.type === 'session_examens' && e.ecole_id === p.ecole_id && e.du > p.remise && e.du <= limite).sort((a, b) => (a.du < b.du ? -1 : 1))[0] ?? null
}

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']

/** « examens de décembre ». */
export function texteExamens(e: Pick<Evenement, 'du'>): string {
  const m = MOIS[Number(e.du.slice(5, 7)) - 1] ?? ''
  return `examens ${/^[aeiouy]/.test(m) ? 'd’' : 'de '}${m}`
}

export interface ErreursPeriode {
  remise?: string
}

/** Date de remise acceptable : dans l'année scolaire (1er août → 31 juillet), pas déjà prise. */
export function erreursPeriode(remise: string, annee: string, autres: PeriodeBulletin[]): ErreursPeriode {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(remise)) return { remise: 'Choisis une date.' }
  const debut = Number(annee.slice(0, 4))
  if (remise < `${debut}-08-01` || remise > `${debut + 1}-07-31`) return { remise: `La date doit tomber dans l’année scolaire ${annee} (du 1er août ${debut} au 31 juillet ${debut + 1}).` }
  if (autres.some((p) => p.remise === remise)) return { remise: 'Une autre période a déjà cette date de remise.' }
  return {}
}

/**
 * Renumérotation après l'ajout ou la modification d'une date : les périodes reprennent l'ordre des
 * dates (P1 = la plus tôt). Renvoie la liste des changements de numéro À APPLIQUER DANS CET ORDRE
 * sans jamais heurter l'unicité (école, année, numéro) : d'abord ceux qui montent (du plus grand au
 * plus petit), puis ceux qui descendent (du plus petit au plus grand). `null` : permutation
 * impossible sans numéro temporaire (une date déplacée au-delà d'une autre) — le site refuse alors.
 */
export function planRenumerotation(liste: { id: string; numero: number; remise: string }[]): { id: string; numero: number }[] | null {
  const cible = [...liste].sort((a, b) => (a.remise < b.remise ? -1 : 1)).map((p, i) => ({ id: p.id, de: p.numero, vers: i + 1 }))
  const montent = cible.filter((c) => c.vers > c.de).sort((a, b) => b.vers - a.vers)
  const descendent = cible.filter((c) => c.vers < c.de).sort((a, b) => a.vers - b.vers)
  const plan = [...montent, ...descendent]
  // Simulation : chaque numéro visé doit être libre au moment de l'écrire.
  const occupe = new Map(liste.map((p) => [p.numero, p.id]))
  for (const c of plan) {
    const tenant = occupe.get(c.vers)
    if (tenant && tenant !== c.id) return null
    occupe.delete(c.de)
    occupe.set(c.vers, c.id)
  }
  return plan.map((c) => ({ id: c.id, numero: c.vers }))
}

/* ------------------------------------------------------------------------------- avertissements */

export type Avertissement =
  | { type: 'apres'; periode: PeriodeBulletin; suivante: { numero: number; remise: string | null } }
  | { type: 'peu-de-temps'; periode: PeriodeBulletin; jours: number; seuil: number; sansCours: JoursDeClasse['sansCours'] }

/**
 * Avertissements d'une interro datée pour une classe (école `ecoleId`) :
 * - « apres » : la date tombe STRICTEMENT après la remise des points de la période en cours
 *   (aujourd'hui) — elle comptera pour la période suivante ;
 * - « peu-de-temps » : il reste au plus `seuil` jours de classe entre l'interro (exclue) et la
 *   remise des points de SA période (incluse).
 */
export function avertissementsInterro(p: { date: string; ecoleId: string; periodes: PeriodeBulletin[]; evenements: Evenement[]; seuil: number; aujourdhui: string }): Avertissement[] {
  const resultat: Avertissement[] = []
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.date)) return resultat
  const enCours = prochaineRemise(p.ecoleId, p.periodes, p.aujourdhui)
  const sienne = periodeDeLaDate(p.date, p.ecoleId, p.periodes)
  if (enCours && p.date > enCours.remise && anneeScolaireDe(p.date) === enCours.annee_scolaire && sienne) {
    resultat.push({ type: 'apres', periode: enCours, suivante: { numero: sienne.numero, remise: sienne.remise } })
  }
  if (sienne?.periode) {
    const j = joursDeClasse(p.date, sienne.periode.remise, p.ecoleId, p.evenements)
    if (j.jours <= p.seuil) resultat.push({ type: 'peu-de-temps', periode: sienne.periode, jours: j.jours, seuil: p.seuil, sansCours: j.sansCours })
  }
  return resultat
}

/** Textes des avertissements (maquette « Interrogation et date limite »). */
export function texteAvertissement(a: Avertissement, date: string): { titre: string; texte: string; court: string } {
  if (a.type === 'apres') {
    const s = a.suivante
    return {
      titre: `Comptera pour la période ${s.numero}`,
      texte:
        `La remise des points de la période ${a.periode.numero} est le ${dateJourLong(a.periode.remise)} : une interro du ${jourMoisCourt(date)} ne peut plus y entrer. ` +
        `Elle comptera pour la période ${s.numero}${s.remise ? ` (remise des points le ${jourMoisCourt(s.remise)})` : ' (date de remise pas encore fixée dans tes réglages)'}.`,
      court: `compte pour la période ${s.numero}`,
    }
  }
  const j = `${a.jours} jour${a.jours > 1 ? 's' : ''} de classe`
  return {
    titre: 'Peu de temps pour corriger',
    texte: `Interro le ${dateJourLong(date)} : il te restera ${j} avant la remise des points du ${jourMoisCourt(a.periode.remise)} (ton seuil : ${a.seuil} jour${a.seuil > 1 ? 's' : ''}).`,
    court: `${a.jours} jour${a.jours > 1 ? 's' : ''} pour corriger`,
  }
}

/* ------------------------------------------------------------------------------- heures effectives */

export interface LigneCompteur {
  evenement: Evenement
  accompagne: boolean
  heures: number
  /** « jeu. 3/12 · 3e h ». */
  detail: string
}

export interface Compteur {
  /** Heures de l'horaire de la classe de maintenant à `jusqua` inclus, congés FWB déduits. */
  prevues: number
  lignes: LigneCompteur[]
  reste: number
  /** Années au calendrier FWB inconnu traversées (congés non déduits). */
  aConfirmer: string[]
}

/**
 * Heures de cours EFFECTIVES d'une classe : heures de son horaire d'aujourd'hui (heures déjà
 * commencées exclues) à `jusqua` inclus, congés FWB déduits (« prévues »), moins les heures
 * supprimées par un événement (ligne par ligne).
 */
export function compteurHeures(p: { classeId: string; ctx: ContexteAgenda; aujourdhui: string; maintenant: number; jusqua: string }): Compteur {
  const parEvenement = new Map<string, { evenement: Evenement; accompagne: boolean; heures: number; parDate: Map<string, number[]> }>()
  let prevues = 0
  const aConfirmer = new Set<string>()
  const casesClasse = p.ctx.cases.filter((c) => c.classe_id === p.classeId)
  for (let d = p.aujourdhui, i = 0; d <= p.jusqua && i < 800; d = ajouterJours(d, 1), i++) {
    const etat = etatJour(d)
    if (etat.type !== 'classe' && etat.type !== 'inconnu') continue
    if (!etat.verifie) aConfirmer.add(etat.annee)
    for (const c of creneauxSemaine(jourIso(d), p.ctx.grilles, casesClasse, { fusion: false })) {
      if (d === p.aujourdhui && c.debut < p.maintenant) continue
      prevues += 1
      const r = raisonSuppression(d, { ecole_id: c.ecole_id, classe_id: c.classe_id, jour: c.jour, heure: c.heureDebut, debut: c.debut, fin: c.fin }, p.ctx)
      if (!r) continue
      const cle = `${r.evenement.id}|${r.accompagne}`
      const l = parEvenement.get(cle) ?? { evenement: r.evenement, accompagne: r.accompagne, heures: 0, parDate: new Map<string, number[]>() }
      l.heures += 1
      l.parDate.set(d, [...(l.parDate.get(d) ?? []), c.heureDebut])
      parEvenement.set(cle, l)
    }
  }
  const lignes: LigneCompteur[] = [...parEvenement.values()]
    .sort((a, b) => {
      const da = [...a.parDate.keys()][0]
      const db = [...b.parDate.keys()][0]
      return da < db ? -1 : da > db ? 1 : 0
    })
    .map((l) => {
      const dates = [...l.parDate.keys()]
      const detail =
        dates.length <= 2
          ? dates.map((d) => `${dateCourteJour(d)} · ${numerosTexte(l.parDate.get(d) ?? [])}`).join(' ; ')
          : `du ${dateCourteJour(dates[0])} au ${dateCourteJour(dates[dates.length - 1])}`
      return { evenement: l.evenement, accompagne: l.accompagne, heures: l.heures, detail }
    })
  const retirees = lignes.reduce((t, l) => t + l.heures, 0)
  return { prevues, lignes, reste: prevues - retirees, aConfirmer: [...aConfirmer] }
}

/** Horaire hebdomadaire d'une classe : « 5 h par semaine (lun. 2e, mar. 4e, mer. 2e, jeu. 3e, ven. 1re) ». */
export function horaireHebdo(classeId: string, grilles: GrilleHoraire[], cases: CaseHoraire[]): { heures: number; texte: string } {
  const parJour: string[] = []
  let heures = 0
  for (let jour = 1; jour <= 5; jour++) {
    const n = creneauxSemaine(jour, grilles, cases.filter((c) => c.classe_id === classeId), { fusion: false }).map((c) => c.heureDebut)
    heures += n.length
    if (n.length > 0) parJour.push(`${JOURS_COURTS[jour]} ${n.map(ordinal).join(', ')}`)
  }
  return { heures, texte: parJour.join(', ') }
}

/** Fin de l'année pour le compteur : veille du début de la session d'examens de JUIN de l'école (si
 * un tel événement concerne la classe), sinon dernier jour de classe de l'année scolaire FWB. */
export function finDAnnee(classe: ClasseAgenda, evenements: Evenement[], aujourdhui: string): { jusqua: string; session: Evenement | null } {
  const annee = anneeScolaireDe(aujourdhui)
  const juin = `${Number(annee.slice(5, 9))}-06`
  const session = evenements
    .filter((e) => e.type === 'session_examens' && e.du.startsWith(juin) && e.du > aujourdhui && concerne(e, classe))
    .sort((a, b) => (a.du < b.du ? -1 : 1))[0]
  if (session) return { jusqua: ajouterJours(session.du, -1), session }
  const entree = CALENDRIER_FWB.find((a) => a.annee === annee)
  return { jusqua: entree?.fin ?? `${annee.slice(5, 9)}-06-30`, session: null }
}

/* ------------------------------------------------------------------------------- listes */

/** Événements qui concernent la classe (directement), pas encore finis, les plus proches d'abord. */
export function aVenirPourClasse(classe: ClasseAgenda, evenements: Evenement[], aujourdhui: string): Evenement[] {
  return evenements.filter((e) => e.au >= aujourdhui && concerne(e, classe)).sort((a, b) => (a.du < b.du ? -1 : a.du > b.du ? 1 : ordreCreation(a, b)))
}

/** Événements qui touchent la période [du, au]. */
export function evenementsEntre(evenements: Evenement[], du: string, au: string): Evenement[] {
  return evenements.filter((e) => e.du <= au && e.au >= du).sort((a, b) => (a.du < b.du ? -1 : a.du > b.du ? 1 : ordreCreation(a, b)))
}

/* ------------------------------------------------------------------------------- formulaire */

export interface ErreursEvenement {
  intitule?: string
  dates?: string
  heures?: string
  classes?: string
  ecole?: string
}

/** Vérifications du formulaire (mêmes règles que les contraintes de 0006). */
export function erreursEvenement(s: SaisieEvenement): ErreursEvenement {
  const e: ErreursEvenement = {}
  if (s.intitule.trim().length > INTITULE_MAX) e.intitule = `${INTITULE_MAX} caractères au maximum.`
  const dateOk = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d)
  if (!dateOk(s.du) || !dateOk(s.au)) e.dates = 'Choisis la date (du … au …).'
  else if (s.au < s.du) e.dates = 'La date de fin doit suivre la date de début.'
  else if (Date.parse(s.au) - Date.parse(s.du) > 366 * 86_400_000) e.dates = 'Un événement dure au plus un an.'
  if (!s.journee_entiere) {
    if (s.heure_debut === null || s.heure_fin === null) e.heures = 'Choisis les heures (de la … à la …).'
    else if (s.heure_fin < s.heure_debut) e.heures = 'La dernière heure doit suivre la première.'
  }
  if (!s.ecole_id) e.ecole = 'Choisis l’école.'
  if (s.type === 'interrogation') {
    if (!s.classe_id) e.classes = 'Choisis la classe.'
  } else if (s.type !== 'absence_professeur' && !s.toutes_classes && s.classes.length === 0) e.classes = 'Choisis au moins une classe (ou « Toutes »).'
  return e
}

/** Saisie normalisée avant l'écriture (cohérente avec les contraintes de la base). Absence du
 * professeur : toutes ses classes de l'école, jamais « J'accompagne ». */
export function normaliserSaisie(s: SaisieEvenement): SaisieEvenement {
  const interro = s.type === 'interrogation'
  const absence = s.type === 'absence_professeur'
  const heures = !s.journee_entiere && s.heure_debut !== null && s.heure_fin !== null
  const toutes = interro ? false : absence ? true : s.toutes_classes
  return {
    ...s,
    intitule: s.intitule.trim(),
    au: interro ? s.du : s.au,
    journee_entiere: !heures,
    heure_debut: heures ? s.heure_debut : null,
    heure_fin: heures ? s.heure_fin : null,
    toutes_classes: toutes,
    accompagne: interro || absence ? false : s.accompagne,
    classe_id: interro ? s.classe_id : null,
    chapitre: interro ? s.chapitre || null : null,
    classes: interro || toutes ? [] : [...new Set(s.classes)],
  }
}
