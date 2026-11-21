import type { ChapterContent } from '../content/types'
import { LEVELS } from '../content/chaptersIndex'
import { EVALUATION_ADAPTER_REGISTRY } from './evaluationAdapterRegistry'
import {
  HEURES_SEMAINE_DEFAUT,
  NIVEAU_NUMERO,
  catalogueVariantesExercice,
  construireItemsPayload,
  generateursPourSection,
  resoudreNiveauHeures,
  themesPourSection,
  type EnTeteEvaluation,
  type IdGenerateurPilote,
  type LigneSelection,
  type Processus,
} from './evaluationPayload'
import { construirePlan, elementsAPlat, empreinteSection, questionsDeSerie, respecteContrainte, tirerInstance, type Adaptateur, type ContrainteTirage, type ElementPlan, type PlanDocument } from './evaluationLocal'
import { chapitreAUneBanqueVraiFauxLocale, chargerThemeVraiFaux } from './banquesVraiFaux'
import { pointsDepuisDuree } from './pointsAutomatiques'
import { niveauEtDuree } from '../entrainement/export/niveauDifficulte'
import { mettreAEchelle, mettreAEchelleParGroupes } from '../entrainement/export/examen'
import { tirerGraine } from '../entrainement/export/codeExercice'

/**
 * Parcours ÉLÈVE — composition automatique d'une feuille d'exercices ou d'une ÉVALUATION BLANCHE
 * (assistant « Préparer mon évaluation », `components/eleve/AssistantEleve.tsx`).
 *
 * L'élève choisit des notions (sections du chapitre qui ont au moins un générateur), une durée
 * (20 / 30 / 50 min) et un niveau (Base 1–2, Intermédiaire 3–4, Avancé 5–7, ou « comme une vraie
 * évaluation » : 15 % / 60 % / 25 % des points en Connaître / Appliquer / Transférer, niveaux
 * mélangés). Ce module en fait une SÉLECTION du panneau (`LigneSelection[]`, une ligne par
 * générateur, `parVariante`) puis passe par le pipeline EXISTANT — `construireItemsPayload` →
 * `construirePlan` → `genererDocumentsDepuisPlan` — jamais un second moteur. Seules retouches du
 * plan figé : les graines d'un exercice dont le niveau réel sort du palier demandé (ou qui ferait
 * dépasser la durée) sont retirées (mêmes fonctions : `tirerInstance`, `niveauEtDuree`,
 * `respecteContrainte`), et les points indicatifs sont posés (durée → `pointsDepuisDuree`, total
 * ramené à 20 par `mettreAEchelle`).
 *
 * Aucune donnée d'élève : rien n'est enregistré (ni coffre, ni historique anti-doublon — l'historique
 * est seulement LU par `construirePlan`).
 */

export type TypeEleve = 'feuille' | 'blanche'
export type NiveauEleve = 'base' | 'intermediaire' | 'avance' | 'reel'

export const DUREES_ELEVE = [20, 30, 50] as const
export const TOTAL_POINTS_BLANCHE = 20
/** Dépassement toléré de la durée visée (décision : jamais plus de ~10 %). */
export const TOLERANCE_DEPASSEMENT = 0.1
/** Répartition des points « comme une vraie évaluation » (Connaître / Appliquer / Transférer). */
export const REPARTITION_REELLE: Record<Processus, number> = { 1: 0.15, 2: 0.6, 3: 0.25 }

const PLAGES: Record<Exclude<NiveauEleve, 'reel'>, [number, number]> = { base: [1, 2], intermediaire: [3, 4], avance: [5, 7] }
/** Paliers voisins, pris seulement si le palier demandé ne suffit pas à remplir la durée. */
const VOISINS: Record<Exclude<NiveauEleve, 'reel'>, Exclude<NiveauEleve, 'reel'>[]> = { base: ['intermediaire'], intermediaire: ['base', 'avance'], avance: ['intermediaire'] }
/** Vrai/faux : 2 min et 1 pt par affirmation (`itemVraiFauxRegroupe`), niveau 2 (Base). */
const DUREE_VRAI_FAUX = 2
const NIVEAU_VRAI_FAUX = 2
/** Durée par défaut d'un exercice d'un générateur sans durée (ni critères ni constante). */
const DUREE_PAR_DEFAUT = 5
/** Part maximale du temps en vrai/faux hors « vraie évaluation » (niveau Base seulement). */
const PART_MAX_VRAI_FAUX = 0.25

export interface ReglagesEleve {
  levelSlug: string
  chapitreSlug: string
  /** Sections retenues (ids) — toutes les notions si vide. */
  sections: string[]
  duree: number
  niveau: NiveauEleve
  type: TypeEleve
  amenagee: boolean
}

export interface NotionEleve {
  sectionId: string
  numero: number
  titre: string
}

/** Notions proposées : sections du chapitre qui ont au moins un générateur réellement câblé. */
export function notionsDuChapitre(chapter: ChapterContent): NotionEleve[] {
  return chapter.sections
    .filter((s) => generateursPourSection(chapter.slug, s.id).some((g) => g.generatorId in EVALUATION_ADAPTER_REGISTRY))
    .map((s) => ({ sectionId: s.id, numero: s.number, titre: s.title }))
}

/* ----------------------------------------------------------------------------------------------
 * Candidats (variantes et thèmes vrai/faux) avec leur niveau et leur durée estimés
 * -------------------------------------------------------------------------------------------- */

interface CandidatBase {
  cle: string
  sectionId: string
  processus: Processus
  /** Durée estimée d'UN exercice (min) — vrai/faux : d'une affirmation. */
  duree: number
  /** Niveaux des tirages d'estimation (vide : générateur sans niveau). */
  niveaux: number[]
}
export interface CandidatExercice extends CandidatBase {
  sorte: 'exercice'
  generatorId: IdGenerateurPilote
  varianteId: string
}
export interface CandidatVraiFaux extends CandidatBase {
  sorte: 'vraiFaux'
  theme: string
  /** Affirmations disponibles dans la banque du thème. */
  disponibles: number
}
export type Candidat = CandidatExercice | CandidatVraiFaux

const TIRAGES_ESTIMATION = 8
const ESSAIS_FILTRE = 400
const BUDGET_FILTRE_MS = 60

/** Contrainte d'une évaluation (blanche) : exercice COMPLET (tous les paramètres présents, aucun cas
 * particulier) — celle que `construirePlan` impose en mode `evaluation` ; la calculatrice n'est pas
 * contrainte (autorisée pour l'élève, toutes les instances possibles). `null` pour une feuille. */
function contrainteEleve(adaptateur: Adaptateur, type: TypeEleve): ContrainteTirage | null {
  if (type !== 'blanche' || !adaptateur.profilInstance) return null
  const idsParametres = (adaptateur.parametresAuChoix ?? []).map((p) => p.id)
  return { cas: 'complet', idsParametres, parametresExclus: adaptateur.parametresAuChoix ? [] : null }
}

function respecte(adaptateur: Adaptateur, contrainte: ContrainteTirage | null, instance: never): boolean {
  if (!contrainte || !adaptateur.profilInstance) return true
  try {
    return respecteContrainte(adaptateur.profilInstance(instance), contrainte, false)
  } catch {
    return false
  }
}

/** Durée d'une instance : grille commune si l'adaptateur est noté, sinon sa constante. */
function dureeDe(adaptateur: Adaptateur, instance: never): { niveau: number | null; duree: number } {
  let n: ReturnType<typeof niveauEtDuree>
  try {
    n = niveauEtDuree(adaptateur, instance)
  } catch {
    n = undefined
  }
  const duree = (adaptateur.criteresDifficulte ? n?.dureeMinutes : adaptateur.dureeMinutes) ?? n?.dureeMinutes ?? DUREE_PAR_DEFAUT
  return { niveau: n?.niveau ?? null, duree }
}

const cacheProfils = new Map<string, { niveaux: number[]; duree: number } | null>()

/** Niveaux et durée moyenne d'une variante sur quelques tirages (contrainte de l'évaluation
 * respectée pour une évaluation blanche), en cache. `null` : aucun tirage possible. */
export function profilVariante(generatorId: string, varianteId: string, type: TypeEleve): { niveaux: number[]; duree: number } | null {
  const cle = `${type}|${generatorId}|${varianteId}`
  if (cacheProfils.has(cle)) return cacheProfils.get(cle)!
  const adaptateur = EVALUATION_ADAPTER_REGISTRY[generatorId] as Adaptateur | undefined
  if (!adaptateur) return null
  const contrainte = contrainteEleve(adaptateur, type)
  const retenues: never[] = []
  const fin = Date.now() + BUDGET_FILTRE_MS
  for (let essai = 0; essai < ESSAIS_FILTRE && retenues.length < TIRAGES_ESTIMATION && (essai < TIRAGES_ESTIMATION * 2 || Date.now() < fin); essai++) {
    let instance: never
    try {
      instance = tirerInstance(adaptateur, varianteId, tirerGraine())
    } catch {
      break
    }
    if (respecte(adaptateur, contrainte, instance)) retenues.push(instance)
  }
  // Aucun exercice complet trouvé : tirages libres (le moteur fera de même, palier de repli).
  if (retenues.length === 0) {
    for (let i = 0; i < TIRAGES_ESTIMATION; i++) {
      try {
        retenues.push(tirerInstance(adaptateur, varianteId, tirerGraine()))
      } catch {
        /* tirage impossible */
      }
    }
  }
  if (retenues.length === 0) {
    cacheProfils.set(cle, null)
    return null
  }
  const mesures = retenues.map((inst) => dureeDe(adaptateur, inst))
  const valeur = { niveaux: mesures.flatMap((m) => (m.niveau === null ? [] : [m.niveau])), duree: mesures.reduce((t, m) => t + m.duree, 0) / mesures.length }
  cacheProfils.set(cle, valeur)
  return valeur
}

const pause = () => new Promise<void>((resolve) => setTimeout(resolve, 0))
const cacheCandidats = new Map<string, Promise<Candidat[]>>()

/** Tous les candidats d'un chapitre (toutes ses notions), calculés une variante à la fois en rendant
 * la main au navigateur entre deux (l'interface ne gèle pas), mis en cache par chapitre et par type. */
export function preparerCandidats(chapter: ChapterContent, type: TypeEleve, progression?: (fait: number, total: number) => void): Promise<Candidat[]> {
  const cle = `${type}|${chapter.levelSlug}|${chapter.slug}`
  let promesse = cacheCandidats.get(cle)
  if (!promesse) {
    promesse = calculerCandidats(chapter, type, progression)
    cacheCandidats.set(cle, promesse)
    promesse.catch(() => cacheCandidats.delete(cle))
  }
  return promesse
}

async function calculerCandidats(chapter: ChapterContent, type: TypeEleve, progression?: (fait: number, total: number) => void): Promise<Candidat[]> {
  const mode = type === 'blanche' ? 'evaluation' : 'exercice'
  const taches: { sectionId: string; generatorId: IdGenerateurPilote; varianteId: string; processus: Processus }[] = []
  for (const notion of notionsDuChapitre(chapter)) {
    for (const g of generateursPourSection(chapter.slug, notion.sectionId)) {
      if (!(g.generatorId in EVALUATION_ADAPTER_REGISTRY)) continue
      for (const v of catalogueVariantesExercice(g.generatorId, mode)) taches.push({ sectionId: notion.sectionId, generatorId: g.generatorId, varianteId: v.id, processus: g.processus ?? 2 })
    }
  }
  const candidats: Candidat[] = []
  let fait = 0
  for (const t of taches) {
    await pause()
    const profil = profilVariante(t.generatorId, t.varianteId, type)
    fait++
    progression?.(fait, taches.length)
    if (!profil) continue
    candidats.push({ sorte: 'exercice', cle: `${t.sectionId}|${t.generatorId}|${t.varianteId}`, ...t, duree: profil.duree, niveaux: profil.niveaux })
  }
  if (chapitreAUneBanqueVraiFauxLocale(chapter.slug)) {
    for (const notion of notionsDuChapitre(chapter)) {
      for (const theme of themesPourSection(chapter.slug, notion.sectionId)) {
        const banque = await chargerThemeVraiFaux(chapter.slug, theme.quizTheme).catch(() => null)
        if (!banque || banque.length === 0) continue
        candidats.push({ sorte: 'vraiFaux', cle: `${notion.sectionId}|vf|${theme.quizTheme}`, sectionId: notion.sectionId, processus: 1, theme: theme.quizTheme, disponibles: banque.length, duree: DUREE_VRAI_FAUX, niveaux: [NIVEAU_VRAI_FAUX] })
      }
    }
  }
  return candidats
}

/* ----------------------------------------------------------------------------------------------
 * Composition (choix des variantes, jusqu'à la durée visée)
 * -------------------------------------------------------------------------------------------- */

export interface UniteComposee {
  candidat: Candidat
  /** Exercices de cette variante, ou affirmations de ce thème. */
  nombre: number
}

export interface Composition {
  unites: UniteComposee[]
  /** Somme des durées ESTIMÉES (min). */
  dureeEstimee: number
  /** Le palier demandé ne suffisait pas : des exercices d'un palier voisin complètent. */
  elargi: boolean
}

function plageDe(niveau: Exclude<NiveauEleve, 'reel'>): [number, number] {
  return PLAGES[niveau]
}

/** Part des tirages d'estimation dans la plage (générateur sans niveau : 0, sauf « vraie évaluation »). */
function adequation(c: Candidat, niveau: Exclude<NiveauEleve, 'reel'>): number {
  if (c.niveaux.length === 0) return 0
  const [a, b] = plageDe(niveau)
  return c.niveaux.filter((n) => n >= a && n <= b).length / c.niveaux.length
}

interface EtatComposition {
  unites: Map<string, UniteComposee>
  parSection: Map<string, number>
  parGenerateur: Map<string, number>
  duree: number
  dureeVraiFaux: number
}

function nombreDe(etat: EtatComposition, c: Candidat): number {
  return etat.unites.get(c.cle)?.nombre ?? 0
}

function ajouter(etat: EtatComposition, c: Candidat): void {
  const u = etat.unites.get(c.cle)
  if (u) u.nombre++
  else etat.unites.set(c.cle, { candidat: c, nombre: 1 })
  etat.parSection.set(c.sectionId, (etat.parSection.get(c.sectionId) ?? 0) + 1)
  const g = c.sorte === 'exercice' ? c.generatorId : `vf:${c.theme}`
  etat.parGenerateur.set(g, (etat.parGenerateur.get(g) ?? 0) + 1)
  etat.duree += c.duree
  if (c.sorte === 'vraiFaux') etat.dureeVraiFaux += c.duree
}

interface Bassin {
  candidats: Candidat[]
  /** Priorité (0 = palier demandé, 1 = palier voisin). */
  rang: Map<string, number>
}

/**
 * Remplit `etat` avec des candidats du bassin jusqu'à `budget` minutes de plus (sans dépasser
 * `plafond` au total). Variété : la notion la moins servie d'abord, puis le générateur le moins servi,
 * jamais deux fois la même variante tant qu'une autre convient (au plus deux fois ensuite).
 */
function remplir(etat: EtatComposition, bassin: Bassin, budget: number, plafond: number, plafondVraiFaux: number, aleatoire: () => number): void {
  const objectif = etat.duree + budget
  for (let garde = 0; garde < 200; garde++) {
    const restant = objectif - etat.duree
    if (restant < 1.5) return
    const convient = (c: Candidat, maxRepetitions: number) => {
      if (etat.duree + c.duree > plafond + 1e-9) return false
      if (c.duree > restant + Math.max(2, budget * 0.25)) return false
      if (c.sorte === 'vraiFaux') return nombreDe(etat, c) < c.disponibles && etat.dureeVraiFaux + c.duree <= plafondVraiFaux + 1e-9
      return nombreDe(etat, c) < maxRepetitions
    }
    let possibles = bassin.candidats.filter((c) => convient(c, 1))
    if (possibles.length === 0) possibles = bassin.candidats.filter((c) => convient(c, 2))
    if (possibles.length === 0) return
    const score = (c: Candidat) => {
      const g = c.sorte === 'exercice' ? c.generatorId : `vf:${c.theme}`
      return (bassin.rang.get(c.cle) ?? 0) * 100 + (etat.parSection.get(c.sectionId) ?? 0) * 10 + (etat.parGenerateur.get(g) ?? 0) * 4 + nombreDe(etat, c) * 6 + aleatoire() * 3
    }
    let meilleur = possibles[0]
    let s = score(meilleur)
    for (const c of possibles.slice(1)) {
      const sc = score(c)
      if (sc < s) {
        meilleur = c
        s = sc
      }
    }
    ajouter(etat, meilleur)
  }
}

/** Bassin du palier demandé (vrai/faux : niveau 2, donc seulement au niveau Base) et, à part, celui
 * des paliers voisins — pris seulement si le palier demandé ne remplit pas la durée. */
function bassinsPourNiveau(candidats: Candidat[], niveau: NiveauEleve): { bassin: Bassin; voisins: Bassin } {
  if (niveau === 'reel') return { bassin: { candidats, rang: new Map() }, voisins: { candidats: [], rang: new Map() } }
  const rang = new Map<string, number>()
  const retenus = candidats.filter((c) => adequation(c, niveau) >= 0.5)
  retenus.forEach((c) => rang.set(c.cle, 0))
  const voisins = candidats.filter((c) => !rang.has(c.cle) && VOISINS[niveau].some((v) => adequation(c, v) >= 0.5))
  return { bassin: { candidats: retenus, rang }, voisins: { candidats: voisins, rang: new Map(voisins.map((c) => [c.cle, 1])) } }
}

/** Compose une sélection (aléatoire à chaque appel) pour les réglages. */
export function composer(candidatsChapitre: Candidat[], reglages: ReglagesEleve, aleatoire: () => number = Math.random): Composition {
  const sections = new Set(reglages.sections)
  const candidats = sections.size > 0 ? candidatsChapitre.filter((c) => sections.has(c.sectionId)) : candidatsChapitre
  const cible = reglages.duree
  const plafond = cible * (1 + TOLERANCE_DEPASSEMENT)
  const etat: EtatComposition = { unites: new Map(), parSection: new Map(), parGenerateur: new Map(), duree: 0, dureeVraiFaux: 0 }
  const { bassin, voisins } = bassinsPourNiveau(candidats, reglages.niveau)
  let elargi = false

  if (reglages.niveau === 'reel') {
    // Budgets par processus (15 / 60 / 25 %) ; un processus sans candidat cède son temps à Appliquer
    // (ou, faute d'Appliquer, aux autres).
    const parProcessus = (p: Processus): Bassin => ({ candidats: bassin.candidats.filter((c) => c.processus === p), rang: bassin.rang })
    const budgets: Record<Processus, number> = { 1: cible * REPARTITION_REELLE[1], 2: cible * REPARTITION_REELLE[2], 3: cible * REPARTITION_REELLE[3] }
    const presents = ([1, 2, 3] as const).filter((p) => parProcessus(p).candidats.length > 0)
    for (const p of [1, 3] as const) {
      if (!presents.includes(p)) {
        const receveur = presents.includes(2) ? 2 : presents.find((q) => q !== p)
        if (receveur) budgets[receveur] += budgets[p]
        budgets[p] = 0
      }
    }
    if (!presents.includes(2)) {
      const autres = presents.filter((q) => q !== 2)
      autres.forEach((q) => (budgets[q] += budgets[2] / autres.length))
      budgets[2] = 0
    }
    // Transférer d'abord (questions longues), puis Connaître, puis Appliquer jusqu'à la durée visée.
    if (budgets[3] > 0) remplir(etat, parProcessus(3), budgets[3], etat.duree + budgets[3] + cible * TOLERANCE_DEPASSEMENT, Infinity, aleatoire)
    if (budgets[1] > 0) remplir(etat, parProcessus(1), budgets[1], etat.duree + budgets[1] + 1, budgets[1] + 1, aleatoire)
    if (budgets[2] > 0) remplir(etat, parProcessus(2), cible - etat.duree, plafond, Infinity, aleatoire)
    // Reste du temps (bassin trop court) : n'importe quel processus.
    remplir(etat, bassin, cible - etat.duree, plafond, budgets[1] + 1, aleatoire)
  } else {
    remplir(etat, bassin, cible, plafond, cible * PART_MAX_VRAI_FAUX, aleatoire)
    // Palier demandé trop court pour la durée (peu de variantes, ou trop longues pour se combiner) :
    // un palier voisin complète, et l'élève en est averti.
    if (etat.duree < cible * 0.85 && voisins.candidats.length > 0) {
      const avant = etat.unites.size
      remplir(etat, voisins, cible - etat.duree, plafond, cible * PART_MAX_VRAI_FAUX, aleatoire)
      elargi = etat.unites.size > avant
    }
  }

  return { unites: [...etat.unites.values()], dureeEstimee: etat.duree, elargi }
}

/** Sélection du panneau correspondant à une composition : une ligne par générateur (variantes dans
 * `parVariante`) ou par thème vrai/faux, dans l'ordre des sections du chapitre. */
export function lignesDeComposition(composition: Composition, chapter: ChapterContent): LigneSelection[] {
  const ordreSection = new Map(chapter.sections.map((s, i) => [s.id, i]))
  const lignes = new Map<string, LigneSelection>()
  for (const { candidat: c, nombre } of composition.unites) {
    if (c.sorte === 'exercice') {
      const cle = `${c.sectionId}|ex|${c.generatorId}`
      const ligne = lignes.get(cle) ?? { chapitreSlug: chapter.slug, sectionId: c.sectionId, processus: c.processus, type: 'exercice' as const, cle: c.generatorId, nombre: 0, parVariante: {}, pointsParVariante: {}, points: 4 }
      ligne.parVariante![c.varianteId] = (ligne.parVariante![c.varianteId] ?? 0) + nombre
      ligne.pointsParVariante![c.varianteId] = pointsDepuisDuree(c.duree)
      ligne.nombre += nombre
      lignes.set(cle, ligne)
    } else {
      lignes.set(`${c.sectionId}|vf|${c.theme}`, { chapitreSlug: chapter.slug, sectionId: c.sectionId, processus: 1, type: 'vraiFaux', cle: c.theme, nombre, points: 1 })
    }
  }
  return [...lignes.values()].sort((a, b) => (ordreSection.get(a.sectionId) ?? 0) - (ordreSection.get(b.sectionId) ?? 0))
}

/* ----------------------------------------------------------------------------------------------
 * Plan (pipeline existant) et retouches : niveau réel, durée, points indicatifs
 * -------------------------------------------------------------------------------------------- */

export interface ResumeEleve {
  /** Questions imprimées (regroupements a), b), c) et vrai/faux compris). */
  questions: number
  /** Durée estimée totale (min) — somme des durées des exercices tirés. */
  duree: number
  /** Durée conseillée imprimée : arrondie aux 5 min. */
  dureeConseillee: number
  /** Évaluation blanche : total et points par processus. */
  points?: number
  pointsParProcessus?: Partial<Record<Processus, number>>
  /** Niveaux des exercices tirés (contrôle). */
  niveaux: number[]
  elargi: boolean
}

export interface PlanEleve {
  plan: PlanDocument
  resume: ResumeEleve
}

const ESSAIS_RETOUCHE = 40
const BUDGET_RETOUCHE_MS = 120

type ElementExercice = Extract<ElementPlan, { type: 'exercice' }>

function aujourdhui(): string {
  return new Date().toISOString().slice(0, 10)
}

/** En-tête du document élève (aucun cartouche d'école : visiteur non connecté). */
export function enteteEleve(reglages: ReglagesEleve, chapter: ChapterContent): EnTeteEvaluation {
  const nh = resoudreNiveauHeures(reglages.levelSlug)
  const niveauLabel = LEVELS.find((l) => l.slug === reglages.levelSlug)?.label ?? chapter.level
  const blanche = reglages.type === 'blanche'
  return {
    date: aujourdhui(),
    titre: `${blanche ? 'Évaluation blanche' : "Feuille d'exercices"} — ${chapter.title}`,
    niveauLabel,
    niveauNumero: nh ? NIVEAU_NUMERO[nh.niveau] : 0,
    heuresSemaine: nh ? HEURES_SEMAINE_DEFAUT[nh.niveau] : '',
    nombreSeries: 1,
    afficherTitresSection: false,
    mode: blanche ? 'evaluation' : 'exercice',
    versionAmenagee: reglages.amenagee,
    afficherDuree: false,
    surtitre: `${niveauLabel} · Chapitre ${chapter.chapterNumber}`,
    titreChapitre: chapter.title,
    urlChapitre: `https://math-belgium.vercel.app/${reglages.levelSlug}/${chapter.slug}`,
  }
}

function niveauAdmis(niveau: number | null, reglages: ReglagesEleve, elargi: boolean): boolean {
  if (reglages.niveau === 'reel' || niveau === null) return true
  const [a, b] = plageDe(reglages.niveau)
  if (niveau >= a && niveau <= b) return true
  if (!elargi) return false
  return VOISINS[reglages.niveau].some((v) => niveau >= plageDe(v)[0] && niveau <= plageDe(v)[1])
}

function niveauDansPalier(niveau: number | null, reglages: ReglagesEleve): boolean {
  return niveauAdmis(niveau, reglages, false)
}

/**
 * Retouche les graines du plan : un exercice dont le niveau RÉEL sort du palier demandé, ou dont la
 * durée ferait dépasser la durée visée de plus de 10 %, est retiré (autre graine de la MÊME variante,
 * contrainte de l'évaluation respectée, jamais un énoncé déjà dans le document) ; s'il dépasse encore,
 * les exercices les moins utiles à la durée sont retirés (au moins un exercice gardé).
 */
function retoucher(plan: PlanDocument, reglages: ReglagesEleve, composition: Composition, estimations: Map<string, number>): Map<ElementExercice, { niveau: number | null; duree: number }> {
  const serie = plan.series[0]
  const cible = reglages.duree
  const plafond = cible * (1 + TOLERANCE_DEPASSEMENT)
  const mesures = new Map<ElementExercice, { niveau: number | null; duree: number }>()
  const empreintes = new Set<string>()
  const exercices = serie.elements.filter((e): e is ElementExercice => e.type === 'exercice')
  for (const el of exercices) {
    const adaptateur = EVALUATION_ADAPTER_REGISTRY[el.generatorId] as Adaptateur
    const inst = el.instances[0]
    try {
      const instance = tirerInstance(adaptateur, inst.varianteId, inst.graine)
      empreintes.add(empreinteSection(el.generatorId, adaptateur.construireEnonce(instance)))
      mesures.set(el, dureeDe(adaptateur, instance))
    } catch {
      mesures.set(el, { niveau: null, duree: estimations.get(`${el.generatorId}|${inst.varianteId}`) ?? DUREE_PAR_DEFAUT })
    }
  }
  const dureeAutres = serie.elements.reduce((t, e) => t + (e.type === 'vraiFaux' ? e.indices.length * DUREE_VRAI_FAUX : 0), 0)
  let cumul = dureeAutres
  exercices.forEach((el, k) => {
    const adaptateur = EVALUATION_ADAPTER_REGISTRY[el.generatorId] as Adaptateur
    const inst = el.instances[0]
    const m = mesures.get(el)!
    const resteEstime = exercices.slice(k + 1).reduce((t, e) => t + (estimations.get(`${e.generatorId}|${e.instances[0].varianteId}`) ?? mesures.get(e)!.duree), 0)
    const budget = plafond - cumul - resteEstime
    const bon = (x: { niveau: number | null; duree: number }) => niveauAdmis(x.niveau, reglages, composition.elargi) && x.duree <= Math.max(budget, 0) + 1e-9
    if (!bon(m)) {
      const contrainte = contrainteEleve(adaptateur, reglages.type)
      const fin = Date.now() + BUDGET_RETOUCHE_MS
      let ancienne: string | null = null
      try {
        ancienne = empreinteSection(el.generatorId, adaptateur.construireEnonce(tirerInstance(adaptateur, inst.varianteId, inst.graine)))
      } catch {
        /* rien */
      }
      let meilleur: { graine: number; mesure: { niveau: number | null; duree: number }; empreinte: string } | null = null
      for (let essai = 0; essai < ESSAIS_RETOUCHE && Date.now() < fin; essai++) {
        const graine = tirerGraine()
        let instance: never
        try {
          instance = tirerInstance(adaptateur, inst.varianteId, graine)
        } catch {
          break
        }
        if (!respecte(adaptateur, contrainte, instance)) continue
        let empreinte: string
        try {
          empreinte = empreinteSection(el.generatorId, adaptateur.construireEnonce(instance))
        } catch {
          continue
        }
        if (empreintes.has(empreinte)) continue
        const mesure = dureeDe(adaptateur, instance)
        if (bon(mesure)) {
          meilleur = { graine, mesure, empreinte }
          break
        }
        // Repli : niveau admis et durée la plus courte.
        if (niveauAdmis(mesure.niveau, reglages, composition.elargi) && (!meilleur || mesure.duree < meilleur.mesure.duree)) meilleur = { graine, mesure, empreinte }
      }
      const garderAncienne = !meilleur || (niveauAdmis(m.niveau, reglages, composition.elargi) && m.duree <= meilleur.mesure.duree)
      if (meilleur && !garderAncienne) {
        if (ancienne) empreintes.delete(ancienne)
        empreintes.add(meilleur.empreinte)
        el.instances = [{ ...inst, graine: meilleur.graine }]
        mesures.set(el, meilleur.mesure)
      }
    }
    cumul += mesures.get(el)!.duree
  })
  // Dépassement restant : retirer l'exercice dont le retrait rapproche le plus de la cible.
  const total = () => dureeAutres + [...mesures.values()].reduce((t, m) => t + m.duree, 0)
  while (total() > plafond + 1e-9 && mesures.size > 1) {
    let retire: ElementExercice | null = null
    let ecart = Infinity
    for (const [el, m] of mesures) {
      const e = Math.abs(total() - m.duree - cible)
      if (e < ecart) {
        ecart = e
        retire = el
      }
    }
    if (!retire) break
    mesures.delete(retire)
    serie.elements = serie.elements.filter((e) => e !== retire)
  }
  return mesures
}

/** Points indicatifs : durée de chaque exercice → `pointsDepuisDuree`, 1 pt par affirmation, puis
 * total ramené à 20 — « vraie évaluation » : 15 / 60 / 25 % du total par processus (3 / 12 / 5 pts). */
function poserPoints(plan: PlanDocument, reglages: ReglagesEleve, mesures: Map<ElementExercice, { niveau: number | null; duree: number }>): void {
  const elements = plan.series[0].elements
  const bruts = elements.map((e) => (e.type === 'exercice' ? pointsDepuisDuree(mesures.get(e)?.duree ?? DUREE_PAR_DEFAUT) : e.type === 'vraiFaux' ? 1 : e.points))
  const nombres = elements.map((e) => (e.type === 'vraiFaux' ? Math.max(1, e.indices.length) : 1))
  const appliquer = (indices: number[], points: number[]) => {
    indices.forEach((i, k) => {
      const e = elements[i]
      if (e.type === 'exercice') e.instances = e.instances.map((inst) => ({ ...inst, points: points[k] }))
      else if (e.type === 'vraiFaux') e.pointsParAffirmation = points[k]
      else e.points = points[k]
    })
  }
  const echelle = (indices: number[], total: number) => mettreAEchelleParGroupes(indices.map((i) => bruts[i]), indices.map((i) => nombres[i]), total)
  const tous = elements.map((_, i) => i)
  if (reglages.niveau === 'reel') {
    const presents = ([1, 2, 3] as const).filter((p) => elements.some((e) => e.processus === p))
    const parts = presents.map((p) => REPARTITION_REELLE[p])
    const totaux = mettreAEchelle(parts, TOTAL_POINTS_BLANCHE)
    if (totaux) {
      const resultats = presents.map((p, k) => {
        const indices = tous.filter((i) => elements[i].processus === p)
        return { indices, points: echelle(indices, totaux[k]) }
      })
      if (resultats.every((r) => r.points)) {
        resultats.forEach((r) => appliquer(r.indices, r.points!))
        return
      }
    }
  }
  const points = echelle(tous, TOTAL_POINTS_BLANCHE)
  appliquer(tous, points ?? bruts)
}

/**
 * Plan complet d'une composition : sélection → `construireItemsPayload` → `construirePlan` (pipeline
 * du panneau), retouches (niveau réel, durée), points indicatifs (évaluation blanche), et résumé
 * exact (nombre de questions imprimées, durée, points). Lève une erreur si rien n'a pu être tiré.
 */
export async function construirePlanEleve(reglages: ReglagesEleve, chapter: ChapterContent, composition: Composition): Promise<PlanEleve> {
  const blanche = reglages.type === 'blanche'
  const entete = enteteEleve(reglages, chapter)
  const lignes = lignesDeComposition(composition, chapter)
  const items = construireItemsPayload(entete, lignes, [{ chapitreSlug: chapter.slug, chapterNumber: chapter.chapterNumber, title: chapter.title, sections: chapter.sections, formulaire: chapter.formulaire }])
  if (items.length === 0) throw new Error('Composition vide')
  const plan = await construirePlan(reglages.levelSlug, entete, items, lignes, [chapter.slug])
  const estimations = new Map<string, number>()
  for (const { candidat } of composition.unites) if (candidat.sorte === 'exercice') estimations.set(`${candidat.generatorId}|${candidat.varianteId}`, candidat.duree)
  const mesures = retoucher(plan, reglages, composition, estimations)
  if (plan.series[0].elements.length === 0) throw new Error('Plan vide')

  let pointsParProcessus: Partial<Record<Processus, number>> | undefined
  let points: number | undefined
  if (blanche) {
    poserPoints(plan, reglages, mesures)
    pointsParProcessus = {}
    for (const e of plan.series[0].elements) {
      const p = e.type === 'exercice' ? e.instances.reduce((t, i) => t + i.points, 0) : e.type === 'vraiFaux' ? e.pointsParAffirmation * e.indices.length : e.points
      pointsParProcessus[e.processus] = (pointsParProcessus[e.processus] ?? 0) + p
    }
    points = Object.values(pointsParProcessus).reduce((t, p) => t + (p ?? 0), 0)
  }

  const elements = plan.series[0].elements
  const duree = elements.reduce((t, e) => t + (e.type === 'exercice' ? (mesures.get(e)?.duree ?? DUREE_PAR_DEFAUT) : e.type === 'vraiFaux' ? e.indices.length * DUREE_VRAI_FAUX : 2), 0)
  const dureeConseillee = Math.max(5, Math.round(duree / 5) * 5)
  if (blanche) {
    // Calculatrice AUTORISÉE pour l'élève (choix : aucun chapitre ne l'interdit dans ses données) —
    // imprimée seulement : le tirage n'a pas été contraint (exercices exacts ET à la calculatrice).
    plan.entete = { ...plan.entete, calculatrice: 'autorisee', blanche: { dureeConseillee } }
  }
  const niveaux = [...mesures.values()].flatMap((m) => (m.niveau === null ? [] : [m.niveau]))
  const questions = questionsDeSerie(elementsAPlat(plan.series[0])).length
  // Averti dès qu'un exercice imprimé sort du palier demandé (palier voisin ajouté, ou variante dont
  // aucun tirage du palier n'a été trouvé dans le budget de la retouche).
  return { plan, resume: { questions, duree, dureeConseillee, points, pointsParProcessus, niveaux, elargi: niveaux.some((n) => !niveauDansPalier(n, reglages)) } }
}
