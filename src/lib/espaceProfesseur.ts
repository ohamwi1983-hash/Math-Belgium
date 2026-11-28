/**
 * Espace professeur réorganisé (27/11/2026) : ce que montrent le tableau de bord (`/espace`) et la vue
 * d'ensemble de « Mes classes » (`/carnet`). PUR sauf `chargerDonneesEspace` (lecture Supabase, client
 * injecté) : tout se déduit des données EXISTANTES du carnet (classes, séances, horaire, agenda) —
 * aucune donnée inventée, aucune migration. Les mêmes règles que le carnet : chapitre « en cours » =
 * celui de la dernière séance de la classe (`chapitreEnCours`), progression par `progressionClasse`,
 * créneaux du jour et heures supprimées par `lignesDuJour` (horaire 0003 + agenda 0006).
 */
import { nomEvaluation } from './evaluationAnnoncee'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { ChapterContent } from '../content/types'
import { findChapter } from '../content/chaptersIndex'
import { titreCourtChapitre } from '../entrainement/export/examen'
import { progressionClasse, texteBrut, type ChapitreProgression, type Classe, type SectionProgression, type Seance } from './carnet'
import { ajouterJours, type EtatJour } from './calendrierFwb'
import { chargerHoraire, chargerSeances, ErreurCarnet, listerClasses, type DonneesHoraire } from './carnetDonnees'
import { AGENDA_INACTIF, chargerAgenda, type DonneesAgenda } from './agendaDonnees'
import { dateCourteJour, dateJourLong, evenementsEntre, predicatSuppression, quiTexte, titreEvenement, type ClasseAgenda, type CreneauSupprime, type Evenement, type PeriodeBulletin } from './agendaEvenements'
import { devoirsEntre, resumeDevoir, prochainsCours } from './carnetDevoirs'
import { creneauxDuJour, creneauxOublies, depuisParDefaut, seanceDuCreneau, type Creneau } from './horaire'
import { lignesDuJour } from '../components/carnet/journeeCarnet'

/* ------------------------------------------------------------------------------- lecture */

export interface DonneesEspace {
  /** 0002 pas appliqué : pas de carnet (le tableau de bord le dit simplement). */
  carnetAbsent: boolean
  classes: Classe[]
  seances: Seance[]
  horaire: DonneesHoraire
  agenda: DonneesAgenda
}

const HORAIRE_VIDE: DonneesHoraire = { actif: false, heureZero: false, grilles: [], cases: [] }

/** Mêmes lectures que le carnet (`CarnetPage.charger`), sans ce dont le tableau de bord n'a pas besoin. */
export async function chargerDonneesEspace(c: SupabaseClient): Promise<DonneesEspace> {
  try {
    const [classes, horaire, agenda] = await Promise.all([listerClasses(c), chargerHoraire(c), chargerAgenda(c).catch(() => AGENDA_INACTIF)])
    const { seances } = await chargerSeances(c, horaire.actif)
    return { carnetAbsent: false, classes, seances, horaire, agenda }
  } catch (ex) {
    if (ex instanceof ErreurCarnet && ex.tableAbsente) return { carnetAbsent: true, classes: [], seances: [], horaire: HORAIRE_VIDE, agenda: AGENDA_INACTIF }
    throw ex
  }
}

/* ------------------------------------------------------------------------------- une classe */

function triees(seances: Seance[]): Seance[] {
  return [...seances].sort((a, b) => (a.date_seance < b.date_seance ? 1 : a.date_seance > b.date_seance ? -1 : a.cree_le < b.cree_le ? 1 : -1))
}

/**
 * Étape « en cours » d'un chapitre pour une classe : la dernière étape touchée si elle n'est pas finie,
 * sinon la suivante (la prochaine à voir) ; rien de vu : `null`. Sert au « En cours : …, étape n » et au
 * bouton Projeter (« à l'étape suivante si connue »).
 */
export function etapeEnCours(p: ChapitreProgression): SectionProgression | null {
  let derniere = -1
  p.sections.forEach((s, i) => {
    if (s.vues > 0) derniere = i
  })
  if (derniere < 0) return null
  const s = p.sections[derniere]
  if (s.vues < s.total) return s
  return p.sections[derniere + 1] ?? s
}

export interface ResumeClasse {
  classe: Classe
  /** Chapitre de la dernière séance (`null` : aucune séance encore). */
  chapitre: ChapterContent | null
  titreCourt: string
  progression: ChapitreProgression | null
  etape: SectionProgression | null
  /** Étapes touchées (au moins une sous-partie vue) sur le nombre d'étapes du chapitre. */
  etapesVues: number
  etapesTotal: number
  derniereSeance: Seance | null
}

export function resumeClasse(classe: Classe, seances: Seance[]): ResumeClasse {
  const siennes = seances.filter((s) => s.classe_id === classe.id)
  // Une séance d'annonce (évaluation ou devoir, sans matière vue) ne dit pas le chapitre en cours.
  const avecMatiere = siennes.filter((s) => s.parties.length > 0 || s.generateurs.length > 0)
  const derniere = triees(avecMatiere.length > 0 ? avecMatiere : siennes).find((s) => findChapter(s.niveau, s.chapitre)) ?? null
  const chapitre = derniere ? (findChapter(derniere.niveau, derniere.chapitre) ?? null) : null
  if (!chapitre) return { classe, chapitre: null, titreCourt: '', progression: null, etape: null, etapesVues: 0, etapesTotal: 0, derniereSeance: null }
  const progression = progressionClasse(siennes, [chapitre])[0] ?? null
  return {
    classe,
    chapitre,
    titreCourt: titreCourtChapitre(chapitre.slug, texteBrut(chapitre.title)),
    progression,
    etape: progression ? etapeEnCours(progression) : null,
    etapesVues: progression ? progression.sections.filter((s) => s.vues > 0).length : 0,
    etapesTotal: progression ? progression.sections.length : 0,
    derniereSeance: derniere,
  }
}

/** Lanceur de projection du chapitre (vue `#projeter`), sur l'étape donnée si elle est connue. */
export function lienProjection(chapitre: Pick<ChapterContent, 'levelSlug' | 'slug'>, etapeId?: string | null): string {
  return `/${chapitre.levelSlug}/${chapitre.slug}${etapeId ? `?etape=${encodeURIComponent(etapeId)}` : ''}#projeter`
}

/** « Interro » / « Contrôle-bilan » : intitulé d'une interrogation de l'agenda. */
function nomInterro(e: Evenement): string {
  return nomEvaluation(e.intitule)
}

/** Titre court du chapitre d'une interrogation (« niveau/slug »), ou `''`. */
export function chapitreDeLInterro(e: Pick<Evenement, 'chapitre'>): string {
  if (!e.chapitre) return ''
  const [niveau, slug] = e.chapitre.split('/')
  const c = niveau && slug ? findChapter(niveau, slug) : undefined
  return c ? titreCourtChapitre(c.slug, texteBrut(c.title)) : ''
}

/** Prochaine interrogation de la classe à partir d'aujourd'hui (0006), ou `null`. */
export function prochaineInterro(classeId: string, evenements: Evenement[], aujourdhui: string): Evenement | null {
  return evenements.filter((e) => e.type === 'interrogation' && e.classe_id === classeId && e.du >= aujourdhui).sort((a, b) => (a.du < b.du ? -1 : a.du > b.du ? 1 : 0))[0] ?? null
}

/** Prochain cours de la classe APRÈS aujourd'hui (horaire + agenda), ou `null`. */
export function prochainCours(classeId: string, d: Pick<DonneesEspace, 'horaire' | 'agenda' | 'classes'>, aujourdhui: string): { date: string; creneau: Creneau } | null {
  if (!d.horaire.actif) return null
  return (
    prochainsCours({
      classeId,
      apres: aujourdhui,
      grilles: d.horaire.grilles,
      cases: d.horaire.cases,
      evenements: d.agenda.actif ? d.agenda.evenements : [],
      classes: d.classes,
      n: 1,
    })[0] ?? null
  )
}

/* ------------------------------------------------------------------------------- aujourd'hui */

export interface CoursDuJour {
  cle: string
  debut: number
  creneau: Creneau | null
  supprime: CreneauSupprime | null
  classe: Classe | null
  resume: ResumeClasse | null
  /** Séance déjà notée pour ce créneau. */
  seance: Seance | null
  /** Créneau commencé (ou fini) et pas encore noté. */
  aNoter: boolean
  interros: Evenement[]
  devoirs: Seance[]
}

/**
 * Les cours du jour (créneaux de l'horaire, heures supprimées par l'agenda comprises), dans l'ordre de
 * l'heure, avec ce qu'il faut pour proposer « Projeter » (chapitre et étape en cours de la classe) ou
 * « Noter la matière vue » (créneau commencé sans séance) — mêmes calculs qu'« Aujourd'hui » du carnet.
 */
export function coursDuJour(d: DonneesEspace, aujourdhui: string, minutes: number): { sansHoraire: boolean; etat: EtatJour | null; cours: CoursDuJour[] } {
  if (!d.horaire.actif || !d.horaire.grilles.some((g) => d.horaire.cases.some((c) => c.ecole_id === g.ecole_id))) return { sansHoraire: true, etat: null, cours: [] }
  const ctx = d.agenda.actif ? { evenements: d.agenda.evenements, classes: d.classes as ClasseAgenda[] } : undefined
  const j = lignesDuJour(aujourdhui, d.horaire.grilles, d.horaire.cases, ctx)
  const interrosDuJour = d.agenda.actif ? d.agenda.evenements.filter((e) => e.type === 'interrogation' && e.du <= aujourdhui && e.au >= aujourdhui) : []
  const prochaines = d.agenda.actif ? d.agenda.evenements.filter((e) => e.type === 'interrogation' && e.du > aujourdhui && e.du <= ajouterJours(aujourdhui, 14)) : []
  const aRendre = devoirsEntre(d.seances, aujourdhui, aujourdhui)
  const cours: CoursDuJour[] = []
  for (const c of j.creneaux) {
    const classe = d.classes.find((k) => k.id === c.classe_id) ?? null
    const seance = seanceDuCreneau(c, d.seances)
    cours.push({
      cle: `${c.ecole_id}-${c.heureDebut}-${c.classe_id}`,
      debut: c.debut,
      creneau: c,
      supprime: null,
      classe,
      resume: classe ? resumeClasse(classe, d.seances) : null,
      seance,
      aNoter: c.debut <= minutes && !seance,
      interros: [...interrosDuJour, ...prochaines].filter((e) => e.classe_id === c.classe_id),
      devoirs: aRendre.filter((s) => s.classe_id === c.classe_id),
    })
  }
  for (const s of j.supprimes) {
    const classe = d.classes.find((k) => k.id === s.classe_id) ?? null
    cours.push({ cle: `x-${s.ecole_id}-${s.heureDebut}-${s.classe_id}`, debut: s.debut, creneau: null, supprime: s, classe, resume: null, seance: null, aNoter: false, interros: [], devoirs: [] })
  }
  cours.sort((a, b) => a.debut - b.debut)
  return { sansHoraire: false, etat: j.etat, cours }
}

/* ------------------------------------------------------------------------------- à venir */

export interface AVenir {
  cle: string
  date: string
  dateTexte: string
  sorte: 'evaluation' | 'devoir' | 'evenement' | 'bulletin'
  texte: string
  /** Page du carnet à ouvrir (classe, agenda). */
  lien: string
  /** Évaluation : rappel J−7 / J−2 (« Annoncer une évaluation »), sinon absent. */
  rappel?: string
}

/**
 * Rappel d'une évaluation annoncée (« Dans mon agenda (avertissement J−7 et J−2) », maquette « annonce » du
 * 27/11/2026) : de J−7 à J−3 « J−n : à préparer », J−2 et J−1 « J−n : copies prêtes ? », le jour même
 * « aujourd'hui » ; plus tôt : rien. Jours du calendrier (le rappel ne dépend pas de l'horaire).
 */
export function rappelEvaluation(date: string, aujourdhui: string): string | null {
  const n = Math.round((Date.parse(`${date}T12:00:00Z`) - Date.parse(`${aujourdhui}T12:00:00Z`)) / 864e5)
  if (Number.isNaN(n) || n < 0 || n > 7) return null
  if (n === 0) return 'aujourd’hui'
  return n <= 2 ? `J−${n} : copies prêtes ?` : `J−${n} : à préparer`
}

/**
 * Ce qui arrive dans les `jours` prochains jours (aujourd'hui compris) : interrogations et autres
 * événements de l'agenda (0006), devoirs à rendre (0007), remises des points du bulletin (périodes de
 * 0006) — dans l'ordre des dates, `max` au plus.
 */
export function aVenir(
  d: Pick<DonneesEspace, 'classes' | 'seances' | 'agenda'>,
  aujourdhui: string,
  options: { jours?: number; max?: number; ecoles?: { id: string; nom: string }[] } = {},
): AVenir[] {
  const fin = ajouterJours(aujourdhui, (options.jours ?? 21) - 1)
  const nomClasse = (id: string | null) => d.classes.find((c) => c.id === id)?.nom ?? ''
  const items: AVenir[] = []
  if (d.agenda.actif) {
    for (const e of evenementsEntre(d.agenda.evenements, aujourdhui, fin)) {
      const date = e.du < aujourdhui ? aujourdhui : e.du
      if (e.type === 'interrogation') {
        const chap = chapitreDeLInterro(e)
        const rappel = rappelEvaluation(e.du, aujourdhui)
        items.push({ cle: `e-${e.id}`, date, dateTexte: dateCourteJour(date), sorte: 'evaluation', texte: `${nomInterro(e)} ${nomClasse(e.classe_id)}${chap ? ` — ${chap}` : ''}`.replace(/\s+/g, ' ').trim(), lien: e.classe_id ? `/carnet/classe/${e.classe_id}?fiche=${e.id}` : '/carnet/agenda', ...(rappel ? { rappel } : {}) })
      } else {
        items.push({ cle: `e-${e.id}`, date, dateTexte: dateCourteJour(date), sorte: 'evenement', texte: `${titreEvenement(e)} — ${quiTexte(e, d.classes)}`, lien: '/carnet/semaine' })
      }
    }
    const plusieursEcoles = new Set(d.agenda.periodes.map((p) => p.ecole_id)).size > 1
    for (const p of d.agenda.periodes as PeriodeBulletin[]) {
      if (p.remise < aujourdhui || p.remise > fin) continue
      const ecole = plusieursEcoles ? options.ecoles?.find((x) => x.id === p.ecole_id)?.nom : undefined
      items.push({ cle: `p-${p.id}`, date: p.remise, dateTexte: dateCourteJour(p.remise), sorte: 'bulletin', texte: `Bulletin — remise des points P${p.numero}${ecole ? ` (${ecole})` : ''}`, lien: '/carnet/reglages' })
    }
  }
  for (const s of devoirsEntre(d.seances, aujourdhui, fin)) {
    if (!s.devoir_pour) continue
    const c = findChapter(s.niveau, s.chapitre)
    const quoi = c ? titreCourtChapitre(c.slug, texteBrut(c.title)) : resumeDevoir(s, 50)
    items.push({ cle: `d-${s.id}`, date: s.devoir_pour, dateTexte: dateCourteJour(s.devoir_pour), sorte: 'devoir', texte: `Devoir ${nomClasse(s.classe_id)}${quoi ? ` — ${quoi}` : ''}`, lien: `/carnet/classe/${s.classe_id}?devoir=${s.id}` })
  }
  items.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
  return items.slice(0, options.max ?? 6)
}

/* ------------------------------------------------------------------------------- carte d'une classe */

const JOURS_LONGS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']

function jourLong(iso: string): string {
  const [a, m, j] = iso.split('-').map(Number)
  return JOURS_LONGS[new Date(a, m - 1, j).getDay()]
}

function heureTexte(m: number): string {
  return `${String(Math.floor(m / 60)).padStart(2, '0')}h${String(m % 60).padStart(2, '0')}`
}

function jourMois(iso: string): string {
  const [, m, j] = iso.split('-').map(Number)
  return `${j}/${String(m).padStart(2, '0')}`
}

export interface RepereClasse {
  /** « prochain cours jeudi 4/12 à 08h25 » / « prochain cours aujourd'hui à 13h15 ». */
  prochainCours: string | null
  /** « évaluation mardi 2/12 · Coniques ». */
  evaluation: string | null
  /** « matière vue de jeudi 26/11 à noter » / « 3 séances à noter ». */
  aNoter: string | null
  /** Rappel J−7 / J−2 de la prochaine évaluation (`rappelEvaluation`), sinon `null`. */
  rappel?: string | null
  /** Identifiant de la prochaine évaluation (pour ouvrir sa fiche). */
  evaluationId?: string | null
}

/** Repères de la carte d'une classe (vue d'ensemble de « Mes classes ») : mêmes calculs que le carnet
 * (prochaine interro de l'agenda, prochain cours effectif, séances oubliées des 14 derniers jours de classe). */
export function reperesClasse(classeId: string, d: Pick<DonneesEspace, 'horaire' | 'agenda' | 'classes' | 'seances'>, aujourdhui: string, minutes: number): RepereClasse {
  const interro = d.agenda.actif ? prochaineInterro(classeId, d.agenda.evenements, aujourdhui) : null
  const chap = interro ? chapitreDeLInterro(interro) : ''
  const evaluation = interro ? `${nomEvaluation(interro.intitule)} ${interro.du === aujourdhui ? "aujourd'hui" : dateJourLong(interro.du)}${chap ? ` · ${chap}` : ''}` : null
  const rappel = interro ? rappelEvaluation(interro.du, aujourdhui) : null
  const evaluationId = interro?.id ?? null
  if (!d.horaire.actif) return { prochainCours: null, evaluation, evaluationId, aNoter: null, rappel }
  const cases = d.horaire.cases.filter((c) => c.classe_id === classeId)
  const supprimee = d.agenda.actif && d.agenda.evenements.length > 0 ? predicatSuppression({ evenements: d.agenda.evenements, classes: d.classes, grilles: d.horaire.grilles }) : undefined
  const plusTard = creneauxDuJour(aujourdhui, d.horaire.grilles, cases, { supprimee })
    .creneaux.filter((c) => c.classe_id === classeId && c.debut > minutes)
    .sort((a, b) => a.debut - b.debut)[0]
  const suivant = plusTard ? null : prochainCours(classeId, d, aujourdhui)
  const prochain = plusTard
    ? `prochain cours aujourd'hui à ${heureTexte(plusTard.debut)}`
    : suivant
      ? `prochain cours ${jourLong(suivant.date)} ${jourMois(suivant.date)} à ${heureTexte(suivant.creneau.debut)}`
      : null
  const oublies =
    cases.length === 0
      ? []
      : creneauxOublies({ grilles: d.horaire.grilles, cases, seances: d.seances.filter((s) => s.classe_id === classeId), depuis: depuisParDefaut(aujourdhui), aujourdhui, maintenant: minutes, supprimee })
  const aNoter =
    oublies.length === 0
      ? null
      : oublies.length === 1
        ? `matière vue ${oublies[0].date === aujourdhui ? "d'aujourd'hui" : `de ${jourLong(oublies[0].date)} ${jourMois(oublies[0].date)}`} à noter`
        : `${oublies.length} séances à noter`
  return { prochainCours: prochain, evaluation, evaluationId, aNoter, rappel }
}
