/**
 * Page « Mon coffre » (`/coffre`) — logique PURE (aucune dépendance à React ni à supabase-js) :
 * résumé d'un enregistrement lu dans son `PlanDocument` tel que stocké (chapitres, questions,
 * points, séries…), recherche insensible aux accents, lien remédiation ↔ évaluation d'origine,
 * rangement par niveau puis chapitre.
 *
 * AUCUN générateur n'est relancé : tout vient des champs stockés (`series`, `lignes`,
 * `chapitresSlugs`, `entete`, `remediation`) et des titres de `chaptersIndex.ts` (chapitres, cartes
 * « S'entraîner »). Conséquences assumées :
 * - pas de durée estimée (elle demande de retirer chaque instance : `niveauEtDuree`) ;
 * - les « questions » listées sont celles de la série A, rangées par processus comme la copie,
 *   avec TOUS les vrai/faux en une question et les exercices d'une même ligne de sélection (même
 *   générateur, même processus) en une question — la règle d'impression (`questionsDeSerie`)
 *   regroupe en plus selon la consigne de chaque instance, ce qui demande le générateur : une ligne
 *   dont les instances ont des consignes différentes est imprimée en plusieurs questions.
 */
import { findChapter, LEVELS } from '../content/chaptersIndex'
import type { Block } from '../content/types'
import { titreCourtChapitre } from '../entrainement/export/examen'
import type { ElementPlan, PlanDocument } from './evaluationLocal'
import type { TypePlan } from './compteValidation'

/** Champs d'un enregistrement du coffre utiles ici (`compteDonnees.ts::PlanCoffre`). */
export interface PlanResumable {
  id: string
  type: TypePlan
  titre: string
  contenu: PlanDocument
  cree_le: string
  modifie_le: string
}

export const ORDRE_TYPES: TypePlan[] = ['exercice', 'evaluation', 'examen', 'remediation']

/** Libellés d'un type : singulier (« Évaluation »), pluriel, forme courte (téléphone) et minuscule
 * pour un compte (« 2 évaluations »). */
export const TYPES: Record<TypePlan, { singulier: string; pluriel: string; court: string; un: string; plusieurs: string }> = {
  exercice: { singulier: "Feuille d'exercices", pluriel: "Feuilles d'exercices", court: 'Feuilles', un: "feuille d'exercices", plusieurs: "feuilles d'exercices" },
  evaluation: { singulier: 'Évaluation', pluriel: 'Évaluations', court: 'Évaluations', un: 'évaluation', plusieurs: 'évaluations' },
  examen: { singulier: 'Examen', pluriel: 'Examens', court: 'Examens', un: 'examen', plusieurs: 'examens' },
  remediation: { singulier: 'Remédiation', pluriel: 'Remédiations', court: 'Remédiations', un: 'remédiation', plusieurs: 'remédiations' },
}

/** « 1 évaluation », « 2 feuilles d'exercices ». */
export function compteType(type: TypePlan, n: number): string {
  return `${n} ${n > 1 ? TYPES[type].plusieurs : TYPES[type].un}`
}

/** « 1 enregistrement », « 6 enregistrements ». */
export function pluriel(n: number, singulier: string, plurielTexte = `${singulier}s`): string {
  return `${n} ${n > 1 ? plurielTexte : singulier}`
}

export const NOMS_PROCESSUS = { 1: 'Connaître', 2: 'Appliquer', 3: 'Transférer' } as const

/* ------------------------------------------------------------------------------ niveaux, chapitres */

/** « 5e-4h » → « 5e ». */
export function niveauCourt(levelSlug: string): string {
  return levelSlug.split('-')[0] || levelSlug
}

/** « 5e-4h » → « 5e année ». */
export function libelleNiveau(levelSlug: string): string {
  return `${niveauCourt(levelSlug)} année`
}

/** Rang d'un niveau dans `LEVELS` (inconnu : à la fin). */
export function rangNiveau(levelSlug: string): number {
  const i = LEVELS.findIndex((l) => l.slug === levelSlug)
  return i < 0 ? LEVELS.length : i
}

export interface ChapitrePlan {
  slug: string
  numero: number | null
  titre: string
  court: string
}

export function chapitresDuPlan(plan: PlanDocument): ChapitrePlan[] {
  return (plan.chapitresSlugs ?? []).map((slug) => {
    const c = findChapter(plan.levelSlug, slug)
    return c ? { slug, numero: c.chapterNumber, titre: c.title, court: titreCourtChapitre(slug, c.title) } : { slug, numero: null, titre: slug, court: slug }
  })
}

/** « 1 à 4 », « 1, 3 et 5 ». */
function numerosTexte(numeros: number[]): string {
  const n = [...new Set(numeros)].sort((a, b) => a - b)
  if (n.length === 0) return ''
  if (n.length === 1) return String(n[0])
  const consecutifs = n.every((x, i) => i === 0 || x === n[i - 1] + 1)
  if (consecutifs) return `${n[0]} à ${n[n.length - 1]}`
  return `${n.slice(0, -1).join(', ')} et ${n[n.length - 1]}`
}

/** « Ch. 6 Vecteurs », « Ch. 1 à 4 ». `avecTitre` faux : « Ch. 6 ». */
export function chapitresTexte(chapitres: ChapitrePlan[], avecTitre = true): string {
  if (chapitres.length === 0) return ''
  if (chapitres.length === 1) {
    const c = chapitres[0]
    return c.numero === null ? c.court : avecTitre ? `Ch. ${c.numero} ${c.court}` : `Ch. ${c.numero}`
  }
  const numeros = chapitres.map((c) => c.numero).filter((n): n is number => n !== null)
  return numeros.length === chapitres.length ? `Ch. ${numerosTexte(numeros)}` : 'Plusieurs chapitres'
}

/* ------------------------------------------------------------------------------ titres lisibles */

let titresGenerateurs: Map<string, string> | null = null

/** Titre de la carte « S'entraîner » d'un générateur (`gen23` → « Construction graphique de
 * vecteurs »), tous chapitres confondus ; `undefined` s'il n'en a pas. */
export function titreGenerateur(generatorId: string): string | undefined {
  if (!titresGenerateurs) {
    titresGenerateurs = new Map()
    const ajouter = (blocs: Block[] | undefined) => {
      for (const b of blocs ?? []) if (b.kind === 'entrainement' && !titresGenerateurs!.has(b.generatorId)) titresGenerateurs!.set(b.generatorId, b.title)
    }
    for (const niveau of LEVELS)
      for (const c of niveau.chapters) {
        ajouter(c.intro?.blocks)
        for (const s of c.sections) ajouter(s.blocks)
        if (c.recap.entrainement) ajouter([c.recap.entrainement])
      }
  }
  return titresGenerateurs.get(generatorId)
}

const TYPES_OUVERTS: Record<string, string> = { formule: 'Formule', demonstration: 'Démonstration', comprehension: 'Compréhension' }

/** « 3. Relation de Chasles » → « Relation de Chasles » (repli : titre de section stocké). */
function sansNumero(titre: string): string {
  return titre.replace(/^.*—\s*/, '').replace(/^\d+\.\s*/, '').trim()
}

function titreSectionElement(el: ElementPlan): string {
  return el.section?.titre ?? sansNumero(el.titreSection ?? '')
}

/** Nature d'une question ouverte (formule, démonstration, compréhension) : type de la ligne de
 * sélection de sa section (section retrouvée par son numéro dans le chapitre). */
function natureOuverte(plan: PlanDocument, el: ElementPlan): string {
  const sec = el.section
  if (sec) {
    const chapitre = findChapter(plan.levelSlug, sec.chapitreSlug)
    const sectionId = chapitre?.sections.find((s) => s.number === sec.numero)?.id
    const ligne = (plan.lignes ?? []).find((l) => l.chapitreSlug === sec.chapitreSlug && l.sectionId === sectionId && l.type in TYPES_OUVERTS && l.nombre > 0)
    if (ligne) return TYPES_OUVERTS[ligne.type]
  }
  return 'Question ouverte'
}

/* ------------------------------------------------------------------------------ résumé */

export interface QuestionResume {
  processus: 1 | 2 | 3
  titre: string
  /** Exercices (ou affirmations de vrai/faux) couverts. */
  nombre: number
  nature: 'exercice' | 'vraiFaux' | 'ouverte'
  points: number
}

export interface ResumePlan {
  niveau: string
  chapitres: ChapitrePlan[]
  questions: QuestionResume[]
  /** Exercices tirés + affirmations + questions ouvertes de la série A. */
  exercices: number
  /** Somme des points stockés de la série A. */
  points: number
  /** Examen à total fixé par partie : total imprimé (points mis à l'échelle à l'impression). */
  totalFixe: number | null
  parProcessus: [number, number, number]
  series: string[]
  calculatrice: 'interdite' | 'autorisee' | null
  /** Feuille d'exercices ou remédiation : le document n'imprime pas de points. */
  sansPoints: boolean
}

function aPlat(elements: ElementPlan[]): ElementPlan[] {
  return elements.flatMap((el) => (el.type === 'exercice' && el.instances.length > 1 ? el.instances.map((inst) => ({ ...el, instances: [inst] })) : [el]))
}

function pointsElement(el: ElementPlan): number {
  if (el.type === 'exercice') return el.instances.reduce((t, i) => t + (Number(i.points) || 0), 0)
  if (el.type === 'ouverte') return Number(el.points) || 0
  return (Number(el.pointsParAffirmation) || 0) * el.indices.length
}

/** Total imprimé d'un examen « total fixé par partie » (mêmes clés que `partiesExamen` :
 * `processus:<n>`, `chapitre:<slug>`, `vraiFaux`) ; une partie sans total saisi garde ses points. */
function totalExamenFixe(plan: PlanDocument, elements: ElementPlan[]): number | null {
  const total = plan.entete.totalExamen
  if (plan.entete.typeDocument !== 'examen' || plan.entete.mode === 'exercice' || total?.mode !== 'fixe') return null
  const parties = new Map<string, number>()
  const ajouter = (cle: string, pts: number) => parties.set(cle, (parties.get(cle) ?? 0) + pts)
  const vf = elements.filter((e) => e.type === 'vraiFaux')
  const vfMulti = new Set(vf.map((e) => (e.type === 'vraiFaux' ? e.chapitreSlug : ''))).size > 1
  for (const el of elements) {
    if (plan.entete.organisationExamen === 'processus') ajouter(`processus:${el.processus}`, pointsElement(el))
    else if (el.type === 'vraiFaux' && vfMulti) ajouter('vraiFaux', pointsElement(el))
    else ajouter(`chapitre:${el.type === 'vraiFaux' ? el.chapitreSlug : (el.section?.chapitreSlug ?? '')}`, pointsElement(el))
  }
  let somme = 0
  for (const [cle, brut] of parties) {
    const fixe = Number(total.parPartie?.[cle])
    somme += Number.isFinite(fixe) && fixe > 0 ? fixe : brut
  }
  return somme
}

export function resumerPlan(plan: PlanDocument, type: TypePlan): ResumePlan {
  const serieA = plan.series?.[0]
  const elements = serieA ? aPlat(serieA.elements ?? []) : []
  const questions: QuestionResume[] = []
  let vraiFaux: QuestionResume | null = null
  const parLigne = new Map<string, QuestionResume>()
  let exercices = 0
  for (const el of elements) {
    const pts = pointsElement(el)
    if (el.type === 'vraiFaux') {
      exercices += el.indices.length
      if (!vraiFaux) questions.push((vraiFaux = { processus: el.processus, titre: 'Vrai ou faux', nombre: 0, nature: 'vraiFaux', points: 0 }))
      vraiFaux.nombre += el.indices.length
      vraiFaux.points += pts
    } else if (el.type === 'ouverte') {
      exercices += 1
      questions.push({ processus: el.processus, titre: `${natureOuverte(plan, el)} — ${titreSectionElement(el)}`, nombre: 1, nature: 'ouverte', points: pts })
    } else {
      exercices += el.instances.length
      const cle = `${el.ligne ?? ''}|${el.generatorId}|${el.processus}`
      const existante = parLigne.get(cle)
      if (existante) {
        existante.nombre += el.instances.length
        existante.points += pts
      } else {
        const q: QuestionResume = { processus: el.processus, titre: titreGenerateur(el.generatorId) || titreSectionElement(el) || el.generatorId, nombre: el.instances.length, nature: 'exercice', points: pts }
        parLigne.set(cle, q)
        questions.push(q)
      }
    }
  }
  // Rangées par processus (tri stable), comme la copie.
  const ranges = ([1, 2, 3] as const).flatMap((p) => questions.filter((q) => q.processus === p))
  const parProcessus: [number, number, number] = [1, 2, 3].map((p) => ranges.filter((q) => q.processus === p).length) as [number, number, number]
  const sansPoints = type === 'exercice' || type === 'remediation' || plan.entete.mode === 'exercice'
  return {
    niveau: niveauCourt(plan.levelSlug),
    chapitres: chapitresDuPlan(plan),
    questions: ranges,
    exercices,
    points: Math.round(ranges.reduce((t, q) => t + q.points, 0) * 100) / 100,
    totalFixe: sansPoints ? null : totalExamenFixe(plan, elements),
    parProcessus,
    series: (plan.series ?? []).map((s) => s.lettre),
    calculatrice: sansPoints ? null : (plan.entete.calculatrice ?? null),
    sansPoints,
  }
}

/** « 40 », « 37,5 ». */
export function nombreTexte(n: number): string {
  return String(Math.round(n * 100) / 100).replace('.', ',')
}

/* ------------------------------------------------------------------------------ dates */

const FUSEAU = 'Europe/Brussels'

/** « 18 nov. » (année ajoutée si ce n'est pas l'année en cours). */
export function dateCourte(iso: string, maintenant = new Date()): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const memeAnnee = d.toLocaleDateString('fr-BE', { year: 'numeric', timeZone: FUSEAU }) === maintenant.toLocaleDateString('fr-BE', { year: 'numeric', timeZone: FUSEAU })
  return d.toLocaleDateString('fr-BE', { day: 'numeric', month: 'short', ...(memeAnnee ? {} : { year: 'numeric' }), timeZone: FUSEAU })
}

/** « 18 novembre 2026 » ; `sansAnnee` : « 18 novembre ». */
export function dateLongue(iso: string, sansAnnee = false): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('fr-BE', { day: 'numeric', month: 'long', ...(sansAnnee ? {} : { year: 'numeric' }), timeZone: FUSEAU })
}

/** « Modifié le 18 novembre 2026 · créé le 12 novembre » ou « Créé le 12 novembre 2026 ». */
export function datesTexte(creeLe: string, modifieLe: string): string {
  const cree = dateLongue(creeLe)
  const modifie = dateLongue(modifieLe)
  if (!modifie || cree === modifie) return `Créé le ${cree}`
  const memeAnnee = cree.slice(-4) === modifie.slice(-4)
  return `Modifié le ${modifie} · créé le ${memeAnnee ? dateLongue(creeLe, true) : cree}`
}

/* ------------------------------------------------------------------------------ recherche */

/** Minuscules, sans accents, ponctuation → espace (« Ch. 6 — Vecteurs » → « ch 6 vecteurs »). */
export function normaliserRecherche(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/** Texte cherché d'un enregistrement : titre, type, niveau, chapitres (« ch 6 », « chapitre 6 »,
 * titre complet et court), titre de l'évaluation d'origine d'une remédiation. */
export function texteRecherche(plan: PlanResumable): string {
  const chapitres = chapitresDuPlan(plan.contenu).flatMap((c) => [c.numero !== null ? `ch ${c.numero} chapitre ${c.numero}` : '', c.titre, c.court])
  return ` ${normaliserRecherche([plan.titre, TYPES[plan.type]?.singulier ?? '', niveauCourt(plan.contenu.levelSlug), ...chapitres, plan.contenu.remediation?.titreSource ?? ''].join(' '))} `
}

/** La recherche (normalisée) correspond-elle ? Expression entière au début d'un mot (« ch 6 » —
 * mais pas « ch 60 »), sinon chaque mot : un nombre seul doit être un mot entier (« 6 » ne trouve
 * pas « 6e »), un autre mot peut être une partie de mot. */
export function correspondRecherche(texte: string, recherche: string): boolean {
  const q = normaliserRecherche(recherche)
  if (q === '') return true
  if (texte.includes(` ${q}${/\d$/.test(q) ? ' ' : ''}`)) return true
  return q.split(' ').every((mot) => (/^\d+$/.test(mot) ? texte.includes(` ${mot} `) : texte.includes(mot)))
}

/* ------------------------------------------------------------------------------ remédiation liée */

/** Même règle que `evaluationRemediation.ts::titreSansPrefixe` (recopiée : ce module ne charge pas
 * le pipeline d'export). */
function titreSansPrefixe(titre: string): string {
  return titre.replace(/^\s*(Feuille d'exercices|Évaluation|Remédiation)\s*[—–-]\s*/i, '').trim()
}

export interface LiensRemediation {
  /** remédiation → évaluation d'origine (dans le coffre). */
  origine: Map<string, string>
  /** évaluation → ses remédiations. */
  remediations: Map<string, string[]>
}

/** Évaluation d'origine de chaque remédiation : `contenu.remediation.titreSource` = titre de
 * l'évaluation (titre du coffre, ou titre du document, sans « Évaluation — »). Plusieurs candidates :
 * même niveau d'abord, puis la plus récente créée avant la remédiation. Aucune : pas de lien. */
export function liensRemediation(plans: PlanResumable[]): LiensRemediation {
  const origine = new Map<string, string>()
  const remediations = new Map<string, string[]>()
  const sources = plans.filter((p) => p.type !== 'remediation' && !p.contenu.remediation)
  for (const r of plans) {
    const cible = r.contenu.remediation?.titreSource
    if (!cible) continue
    const n = normaliserRecherche(cible)
    const candidates = sources.filter((p) => [p.titre, titreSansPrefixe(p.titre), titreSansPrefixe(p.contenu.entete?.titre ?? '')].some((t) => t && normaliserRecherche(t) === n))
    if (candidates.length === 0) continue
    const rang = (p: PlanResumable) => [p.contenu.levelSlug === r.contenu.levelSlug ? 0 : 1, p.type === 'exercice' ? 1 : 0, p.cree_le <= r.cree_le ? 0 : 1]
    const choisie = [...candidates].sort((a, b) => {
      const ra = rang(a)
      const rb = rang(b)
      for (let i = 0; i < ra.length; i++) if (ra[i] !== rb[i]) return ra[i] - rb[i]
      return b.cree_le.localeCompare(a.cree_le)
    })[0]
    origine.set(r.id, choisie.id)
    remediations.set(choisie.id, [...(remediations.get(choisie.id) ?? []), r.id])
  }
  return { origine, remediations }
}

/* ------------------------------------------------------------------------------ rangement */

export function parDateDecroissante<T extends PlanResumable>(plans: T[]): T[] {
  return [...plans].sort((a, b) => b.modifie_le.localeCompare(a.modifie_le))
}

export interface EntreeRangee<T> {
  plan: T
  /** Remédiations rangées sous leur évaluation d'origine. */
  liees: T[]
}

export interface GroupeChapitre<T> {
  cle: string
  /** « 6 » ; `null` pour « Plusieurs chapitres ». */
  numero: number | null
  titre: string
  entrees: EntreeRangee<T>[]
}

export interface GroupeNiveau<T> {
  slug: string
  libelle: string
  nombre: number
  chapitres: GroupeChapitre<T>[]
}

/** Rangement « par chapitre » (comme le programme) : niveau → chapitre (titres de
 * `chaptersIndex.ts`, ordre des chapitres) → enregistrements du plus récent au plus ancien ; un
 * plan de plusieurs chapitres dans « Plusieurs chapitres » (fin du niveau) ; une remédiation SOUS
 * son évaluation d'origine quand celle-ci est dans la liste, sinon rangée normalement. */
export function rangerParChapitre<T extends PlanResumable>(plans: T[], liens: LiensRemediation): GroupeNiveau<T>[] {
  const presents = new Set(plans.map((p) => p.id))
  const parId = new Map(plans.map((p) => [p.id, p]))
  const niveaux = new Map<string, GroupeNiveau<T>>()
  for (const plan of parDateDecroissante(plans)) {
    const source = liens.origine.get(plan.id)
    if (source && presents.has(source)) continue
    const slug = plan.contenu.levelSlug
    let niveau = niveaux.get(slug)
    if (!niveau) niveaux.set(slug, (niveau = { slug, libelle: libelleNiveau(slug), nombre: 0, chapitres: [] }))
    const chapitres = chapitresDuPlan(plan.contenu)
    const unique = chapitres.length === 1 ? chapitres[0] : null
    const cle = unique ? `chapitre:${unique.slug}` : chapitres.length === 0 ? 'aucun' : 'plusieurs'
    let groupe = niveau.chapitres.find((g) => g.cle === cle)
    if (!groupe) {
      groupe = unique ? { cle, numero: unique.numero, titre: unique.titre, entrees: [] } : { cle, numero: null, titre: chapitres.length === 0 ? 'Sans chapitre' : 'Plusieurs chapitres', entrees: [] }
      niveau.chapitres.push(groupe)
    }
    const liees = parDateDecroissante((liens.remediations.get(plan.id) ?? []).map((id) => parId.get(id)).filter((p): p is T => !!p))
    groupe.entrees.push({ plan, liees })
    niveau.nombre += 1 + liees.length
  }
  const rangChapitre = (g: GroupeChapitre<T>) => (g.numero !== null ? g.numero : g.cle === 'plusieurs' ? 1000 : g.cle === 'aucun' ? 1001 : 999)
  return [...niveaux.values()]
    .sort((a, b) => rangNiveau(a.slug) - rangNiveau(b.slug) || a.slug.localeCompare(b.slug))
    .map((n) => ({ ...n, chapitres: [...n.chapitres].sort((a, b) => rangChapitre(a) - rangChapitre(b) || a.titre.localeCompare(b.titre)) }))
}
