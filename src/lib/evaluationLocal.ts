import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CritereBareme, EtapeCorrection, FragmentConsigne, QuestionExercice, SectionExercice } from '../entrainement/export/genererFeuilleExercices'
import { texte } from '../entrainement/export/fragmentsDocx'
import {
  genererEvaluationHtml,
  genererFeuilleExercicesComplete,
  genererVersionAmenagee,
  type EnteteEvaluation as EnteteEvaluationSerie,
  type ItemEvaluation,
} from '../entrainement/export/assemblerEvaluationHtml'
import { encoderCode, genererAvecCode, tirerGraine } from '../entrainement/export/codeExercice'
import { ENTRAINEMENT_REGISTRY } from '../entrainement/registry'
import { EVALUATION_ADAPTER_REGISTRY } from './evaluationAdapterRegistry'
import { chapitreAUneBanqueVraiFauxLocale, chargerThemeVraiFaux } from './banquesVraiFaux'
import { LEVELSLUG_FONCTIONNEL_4E, LEVELSLUG_FONCTIONNEL_5E, LEVELSLUG_FONCTIONNEL_6E, type EnTeteEvaluation, type ItemPayload, type LigneSelection, type QuestionOuverte } from './evaluationPayload'

/**
 * Génération locale (SANS passer par plateforme-maths) des documents d'une évaluation / feuille
 * d'exercices, à partir des `ItemPayload[]` construits par `construireItemsPayload`.
 *
 * Deux temps :
 * 1. `construirePlan` fige TOUT le hasard dans un plan sérialisable (`PlanDocument`) : pour chaque
 *    exercice, sa variante et sa GRAINE (l'instance est tirée sous `avecGraine`, voir
 *    `codeExercice.ts`), pour chaque vrai/faux les indices des affirmations, pour chaque question
 *    ouverte son texte. Le plan s'enregistre (localStorage / JSON) et se recharge à l'identique :
 *    mêmes graines → mêmes exercices, et le code imprimé à côté d'un exercice rouvre exactement
 *    cette instance dans le générateur interactif.
 * 2. `genererDocumentsDepuisPlan` rend les documents HTML (`assemblerEvaluationHtml.ts`).
 *
 * Séries anti-triche ÉQUIVALENTES : la série B (C…) reprend, question par question, la même
 * variante que la série A avec une autre graine (autres nombres, même difficulté), et mélange
 * l'ordre des questions à l'intérieur de chaque processus. Limite : un générateur sans catalogue
 * de variantes (entrée unique « Tirage aléatoire ») ne peut pas garantir la même famille d'une
 * série à l'autre — son tirage reste libre.
 *
 * Historique : les empreintes (générateur + texte de l'énoncé) des exercices déjà imprimés sont
 * gardées en localStorage ; un nouveau tirage qui retombe sur un exercice déjà vu est retenté
 * (jusqu'à 8 fois) pour ne pas redonner deux fois le même exercice.
 *
 * Portée : générateurs présents dans `EVALUATION_ADAPTER_REGISTRY` ; vrai/faux dès que la banque du
 * chapitre existe localement (`banquesVraiFaux.ts` — tous les chapitres sauf « Fonctions
 * réciproques et cyclométriques »). Hors portée → l'appelant retombe sur `buildEvaluationUrl`.
 */

const LEVELSLUGS_GENERATION_LOCALE = new Set([LEVELSLUG_FONCTIONNEL_4E, LEVELSLUG_FONCTIONNEL_5E, LEVELSLUG_FONCTIONNEL_6E])
const URL_SITE = 'https://math-belgium.vercel.app'
const LETTRES_SERIE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LETTRES = 'abcdefghijklmnopqrstuvwxyz'
const CONSIGNE_VRAI_FAUX = 'Vrai ou faux ? Justifie chaque réponse.'

/** `true` si TOUS les items peuvent être construits localement — sinon l'appelant
 * (`EvaluationGeneratorPanel.tsx`) retombe sur `buildEvaluationUrl`, jamais un sous-ensemble en
 * silence. */
export function peutGenererLocalement(levelSlug: string, items: ItemPayload[]): boolean {
  if (!LEVELSLUGS_GENERATION_LOCALE.has(levelSlug)) return false
  if (items.length === 0) return false
  return items.every((item) => {
    if (item.vraiFaux) return !!item.section && chapitreAUneBanqueVraiFauxLocale(item.section.chapitreSlug)
    if (item.exercice) return item.exercice.generatorId in EVALUATION_ADAPTER_REGISTRY
    return true
  })
}

/* ----------------------------------------------------------------------------------------------
 * Plan sérialisable
 * -------------------------------------------------------------------------------------------- */

type SectionRef = NonNullable<ItemPayload['section']>

interface ElementBase {
  processus: 1 | 2 | 3
  titreSection: string
  section?: SectionRef
}

export interface InstancePlan {
  varianteId: string
  graine: number
  points: number
}

export type ElementPlan =
  | (ElementBase & { type: 'exercice'; generatorId: string; instances: InstancePlan[] })
  | (ElementBase & { type: 'ouverte'; points: number; question: QuestionOuverte })
  | (ElementBase & { type: 'vraiFaux'; pointsParAffirmation: number; chapitreSlug: string; theme: string; indices: number[] })

export interface PlanSerie {
  lettre: string
  elements: ElementPlan[]
}

export interface PlanDocument {
  version: 1
  creeLe: string
  levelSlug: string
  entete: EnTeteEvaluation
  /** Sélection du panneau, pour la recharger telle quelle. */
  lignes: LigneSelection[]
  chapitresSlugs: string[]
  series: PlanSerie[]
}

/* ----------------------------------------------------------------------------------------------
 * Historique (empreintes d'exercices déjà imprimés)
 * -------------------------------------------------------------------------------------------- */

const CLE_HISTORIQUE = 'math-belgium-historique-exercices'
const MAX_HISTORIQUE = 4000

export interface EntreeHistorique {
  empreinte: string
  code?: string
  date: string
}

export function lireHistorique(): EntreeHistorique[] {
  try {
    const brut = localStorage.getItem(CLE_HISTORIQUE)
    const liste = brut ? (JSON.parse(brut) as EntreeHistorique[]) : []
    return Array.isArray(liste) ? liste : []
  } catch {
    return []
  }
}

function ecrireHistorique(liste: EntreeHistorique[]): void {
  try {
    localStorage.setItem(CLE_HISTORIQUE, JSON.stringify(liste.slice(-MAX_HISTORIQUE)))
  } catch {
    /* stockage indisponible : l'historique est une commodité, jamais bloquant */
  }
}

export function effacerHistorique(): void {
  try {
    localStorage.removeItem(CLE_HISTORIQUE)
  } catch {
    /* idem */
  }
}

function hacher(texteSource: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < texteSource.length; i++) {
    h ^= texteSource.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(36)
}

function empreinteSection(generatorId: string, section: SectionExercice): string {
  return `${generatorId}:${hacher(JSON.stringify([section.enteteFragments ?? [], section.questions.map((q) => q.consigne), section.enteteHtml ?? '']))}`
}

/* ----------------------------------------------------------------------------------------------
 * Tirage des instances
 * -------------------------------------------------------------------------------------------- */

type Adaptateur = AdaptateurFeuilleExercices<never>

function indexVariante(adaptateur: Adaptateur, varianteId: string): number | null {
  if (!adaptateur.catalogueVariantes || !adaptateur.genererInstanceAvecVariante) return null
  const i = adaptateur.catalogueVariantes.findIndex((v) => v.id === varianteId)
  return i >= 0 ? i : null
}

/** Instance reproductible — EXACTEMENT le tirage que fait l'appli interactive à partir du code
 * (`genererAvecCode`), pour que le QR code rouvre le même exercice. */
function tirerInstance(adaptateur: Adaptateur, varianteId: string, graine: number): never {
  const varianteIndex = indexVariante(adaptateur, varianteId)
  return genererAvecCode(
    { graine, varianteIndex },
    adaptateur.catalogueVariantes,
    () => adaptateur.genererInstance(),
    adaptateur.genererInstanceAvecVariante ? (id) => adaptateur.genererInstanceAvecVariante!(id) : undefined,
  )
}

function codeInstance(generatorId: string, adaptateur: Adaptateur, varianteId: string, graine: number): { code: string; url: string } | undefined {
  const entree = ENTRAINEMENT_REGISTRY[generatorId]
  if (!entree) return undefined
  const code = encoderCode(graine, indexVariante(adaptateur, varianteId))
  return { code, url: `${URL_SITE}/entrainement/${entree.chantier}/${generatorId}?code=${code}` }
}

function graineInedite(generatorId: string, adaptateur: Adaptateur, varianteId: string, dejaVues: Set<string>): number {
  let graine = tirerGraine()
  for (let essai = 0; essai < 8; essai++) {
    let empreinte: string
    try {
      empreinte = empreinteSection(generatorId, adaptateur.construireEnonce(tirerInstance(adaptateur, varianteId, graine)))
    } catch {
      return graine
    }
    if (!dejaVues.has(empreinte)) {
      dejaVues.add(empreinte)
      return graine
    }
    graine = tirerGraine()
  }
  return graine
}

function melanger<T>(liste: T[]): T[] {
  const copie = [...liste]
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copie[i], copie[j]] = [copie[j], copie[i]]
  }
  return copie
}

function piocherIndices(total: number, nombre: number, eviter: Set<number>): number[] {
  const tous = melanger(Array.from({ length: total }, (_, i) => i))
  const inedits = tous.filter((i) => !eviter.has(i))
  const deja = tous.filter((i) => eviter.has(i))
  return [...inedits, ...deja].slice(0, Math.min(nombre, total)).sort((a, b) => a - b)
}

/** Fige le hasard d'une génération (voir en-tête). Lève une erreur si une banque vrai/faux ou un
 * thème manque localement — l'appelant retombe alors sur plateforme-maths. */
export async function construirePlan(levelSlug: string, entete: EnTeteEvaluation, items: ItemPayload[], lignes: LigneSelection[], chapitresSlugs: string[]): Promise<PlanDocument> {
  const nombreSeries = entete.mode === 'exercice' ? 1 : Math.max(1, entete.nombreSeries)
  const dejaVues = new Set(lireHistorique().map((h) => h.empreinte))
  const series: PlanSerie[] = []

  for (let s = 0; s < nombreSeries; s++) {
    const elements: ElementPlan[] = []
    for (const item of items) {
      const base: ElementBase = { processus: item.processus, titreSection: item.titreSection, section: item.section }
      if (item.exercice) {
        const adaptateur = EVALUATION_ADAPTER_REGISTRY[item.exercice.generatorId]
        if (!adaptateur) continue
        const generatorId = item.exercice.generatorId
        const instances: InstancePlan[] = item.exercice.parVariante.flatMap(({ varianteId, nombre, points }) =>
          Array.from({ length: nombre }, () => ({ varianteId, points, graine: graineInedite(generatorId, adaptateur, varianteId, dejaVues) })),
        )
        if (instances.length === 0) continue
        if (adaptateur.regroupable && instances.length > 1) elements.push({ ...base, type: 'exercice', generatorId, instances })
        else for (const instance of instances) elements.push({ ...base, type: 'exercice', generatorId, instances: [instance] })
      } else if (item.vraiFaux) {
        const chapitreSlug = item.section?.chapitreSlug
        const banque = chapitreSlug ? await chargerThemeVraiFaux(chapitreSlug, item.vraiFaux.theme) : null
        if (!chapitreSlug || !banque) throw new Error(`Banque vrai/faux locale introuvable : ${chapitreSlug ?? '?'} / ${item.vraiFaux.theme}`)
        const prefixe = `vf:${chapitreSlug}:${item.vraiFaux.theme}:`
        const vus = new Set([...dejaVues].filter((e) => e.startsWith(prefixe)).map((e) => Number(e.slice(prefixe.length))))
        const indices = piocherIndices(banque.length, item.vraiFaux.nombre, vus)
        indices.forEach((i) => dejaVues.add(`${prefixe}${i}`))
        elements.push({ ...base, type: 'vraiFaux', pointsParAffirmation: item.points, chapitreSlug, theme: item.vraiFaux.theme, indices })
      } else if (item.ouvertesParSerie) {
        const ouvertes = item.ouvertesParSerie[s] ?? item.ouvertesParSerie[0] ?? []
        for (const question of ouvertes) elements.push({ ...base, type: 'ouverte', points: item.points, question })
      }
    }
    series.push({ lettre: LETTRES_SERIE[s] ?? String(s + 1), elements: s === 0 ? elements : melangerParProcessus(elements) })
  }

  // Séries B, C… : même variante que la série A, question par question (seules les graines
  // diffèrent), ce que garantit déjà la boucle ci-dessus (mêmes `parVariante`), puis ordre mélangé
  // à l'intérieur de chaque processus.
  return { version: 1, creeLe: new Date().toISOString(), levelSlug, entete, lignes, chapitresSlugs, series }
}

function melangerParProcessus(elements: ElementPlan[]): ElementPlan[] {
  return ([1, 2, 3] as const).flatMap((p) => melanger(elements.filter((e) => e.processus === p)))
}

/** Ajoute les empreintes des exercices d'un plan à l'historique (à appeler une fois les documents
 * générés). */
export function enregistrerDansHistorique(plan: PlanDocument): void {
  const date = new Date().toISOString()
  const nouvelles: EntreeHistorique[] = []
  for (const serie of plan.series) {
    for (const el of serie.elements) {
      if (el.type === 'exercice') {
        const adaptateur = EVALUATION_ADAPTER_REGISTRY[el.generatorId]
        if (!adaptateur) continue
        for (const inst of el.instances) {
          try {
            const section = adaptateur.construireEnonce(tirerInstance(adaptateur, inst.varianteId, inst.graine))
            nouvelles.push({ empreinte: empreinteSection(el.generatorId, section), code: codeInstance(el.generatorId, adaptateur, inst.varianteId, inst.graine)?.code, date })
          } catch {
            /* instance non reproductible : ignorée */
          }
        }
      } else if (el.type === 'vraiFaux') {
        for (const i of el.indices) nouvelles.push({ empreinte: `vf:${el.chapitreSlug}:${el.theme}:${i}`, date })
      }
    }
  }
  const existantes = new Set(lireHistorique().map((h) => h.empreinte))
  ecrireHistorique([...lireHistorique(), ...nouvelles.filter((n) => !existantes.has(n.empreinte))])
}

/* ----------------------------------------------------------------------------------------------
 * Plan → items rendus
 * -------------------------------------------------------------------------------------------- */

function prefixerLettreBlocs(blocs: BlocCorrection[], lettre: string): BlocCorrection[] {
  const [premier, ...reste] = blocs
  if (!premier) return blocs
  if (premier.type === 'paragraphe') return [{ ...premier, fragments: [texte(`${lettre}) `), ...premier.fragments] }, ...reste]
  return [{ type: 'paragraphe', fragments: [texte(`${lettre})`)] }, premier, ...reste]
}

function joindreAvecLettres(listes: FragmentConsigne[][]): FragmentConsigne[] {
  return listes.flatMap((fr, i) => [texte(`${i > 0 ? ' · ' : ''}${LETTRES[i] ?? i + 1}) `), ...fr])
}

function difficulteMax(valeurs: (1 | 2 | 3 | undefined)[]): 1 | 2 | 3 | undefined {
  const d = valeurs.filter((v): v is 1 | 2 | 3 => v !== undefined)
  return d.length > 0 ? (Math.max(...d) as 1 | 2 | 3) : undefined
}

function champsCommuns(el: ElementBase): Pick<ItemEvaluation, 'processus' | 'titreSection' | 'notion' | 'sectionCours'> {
  return {
    processus: el.processus,
    titreSection: el.titreSection,
    notion: el.section?.titre,
    sectionCours: el.section ? { numero: el.section.numero, titre: el.section.titre } : undefined,
  }
}

function itemExercice(el: Extract<ElementPlan, { type: 'exercice' }>): ItemEvaluation | null {
  const adaptateur = EVALUATION_ADAPTER_REGISTRY[el.generatorId]
  if (!adaptateur) return null
  const tirees = el.instances.map((inst) => ({ inst, instance: tirerInstance(adaptateur, inst.varianteId, inst.graine) }))
  const communs = champsCommuns(el)

  if (tirees.length === 1) {
    const { inst, instance } = tirees[0]
    return {
      ...communs,
      nature: 'exercice',
      points: inst.points,
      section: adaptateur.construireEnonce(instance),
      correction: adaptateur.construireCorrection(instance),
      difficulte: adaptateur.difficulte?.(instance),
      reponseBreve: adaptateur.reponseBreve?.(instance),
      correctionDetaillee: adaptateur.correctionDetaillee?.(instance),
      bareme: adaptateur.bareme?.(instance),
      enonceAmenage: adaptateur.enonceAmenage?.(instance),
      dureeMinutes: adaptateur.dureeMinutes,
      code: codeInstance(el.generatorId, adaptateur, inst.varianteId, inst.graine),
    }
  }

  // Regroupement (adaptateur `regroupable`) : une seule question, une ligne a)/b)/c) par instance.
  const consigneGroupee = adaptateur.construireEnonce(tirees[0].instance).questions[0]?.consigne ?? []
  const section: SectionExercice = {
    enteteFragments: consigneGroupee,
    questions: tirees.map(({ instance }): QuestionExercice => ({ consigne: adaptateur.construireEnonce(instance).enteteFragments ?? [] })),
    disposeEnTableau: true,
  }
  const correction = tirees.flatMap(({ instance }, i) => prefixerLettreBlocs(adaptateur.construireCorrection(instance), LETTRES[i] ?? String(i + 1)))
  const points = tirees.reduce((t, { inst }) => t + inst.points, 0)
  const reponses = adaptateur.reponseBreve ? tirees.map(({ instance }) => adaptateur.reponseBreve!(instance)) : undefined
  const correctionDetaillee = adaptateur.correctionDetaillee
    ? tirees.flatMap(({ instance }, i) => adaptateur.correctionDetaillee!(instance).map((e): EtapeCorrection => ({ ...e, sousQuestion: LETTRES[i] })))
    : undefined
  let bareme: BaremeExercice | undefined
  if (adaptateur.bareme) {
    const baremes = tirees.map(({ instance }) => adaptateur.bareme!(instance))
    const criteres: CritereBareme[] = baremes.flatMap((b, i) => {
      const somme = b.criteres.reduce((t, c) => t + c.points, 0) || 1
      // Poids ramenés aux points de l'instance, pour que chaque ligne a)/b) pèse ce qu'elle vaut.
      return b.criteres.map((c) => ({ ...c, sousQuestion: LETTRES[i], points: (c.points / somme) * tirees[i].inst.points }))
    })
    bareme = {
      reponseFinale: joindreAvecLettres(baremes.map((b) => b.reponseFinale)),
      criteres,
      erreursFrequentes: baremes[0].erreursFrequentes,
      reponsesAcceptees: baremes.flatMap((b) => b.reponsesAcceptees ?? []),
    }
  }
  const premier = tirees[0]
  return {
    ...communs,
    nature: 'exercice',
    points,
    section,
    correction,
    difficulte: difficulteMax(tirees.map(({ instance }) => adaptateur.difficulte?.(instance))),
    reponseBreve: reponses ? joindreAvecLettres(reponses) : undefined,
    correctionDetaillee,
    bareme,
    dureeMinutes: adaptateur.dureeMinutes !== undefined ? adaptateur.dureeMinutes * tirees.length : undefined,
    code: codeInstance(el.generatorId, adaptateur, premier.inst.varianteId, premier.inst.graine),
  }
}

const RE_ETIQUETTE = /^\s*([^:]{1,32}?)\s:\s/

function itemOuverte(el: Extract<ElementPlan, { type: 'ouverte' }>): ItemEvaluation {
  const correction: BlocCorrection[] = el.question.corrige.map((paragraphe) => ({ type: 'paragraphe', fragments: paragraphe }))
  // Paragraphes « Étiquette : texte » (étapes d'un exemple résolu) → grille étiquette | texte.
  const correctionDetaillee: EtapeCorrection[] = el.question.corrige.map((paragraphe) => {
    const [premier, ...reste] = paragraphe
    const m = premier?.type === 'texte' ? RE_ETIQUETTE.exec(premier.valeur) : null
    if (!m || !premier) return { label: '', fragments: paragraphe }
    const suite = premier.valeur.slice(m[0].length)
    return { label: m[1], fragments: [...(suite ? [texte(suite)] : []), ...reste] }
  })
  return {
    ...champsCommuns(el),
    nature: 'ouverte',
    points: el.points,
    section: { questions: [{ consigne: el.question.enonce }] },
    correction,
    correctionDetaillee,
  }
}

async function itemVraiFaux(el: Extract<ElementPlan, { type: 'vraiFaux' }>): Promise<ItemEvaluation | null> {
  const banque = await chargerThemeVraiFaux(el.chapitreSlug, el.theme)
  if (!banque) return null
  const affirmations = el.indices.map((i) => banque[i]).filter(Boolean)
  if (affirmations.length === 0) return null
  const vf = (r: boolean) => (r ? 'Vrai' : 'Faux')
  const lettre = (i: number) => LETTRES[i] ?? String(i + 1)
  return {
    ...champsCommuns(el),
    nature: 'vraiFaux',
    points: affirmations.length * el.pointsParAffirmation,
    section: { enteteFragments: [texte(CONSIGNE_VRAI_FAUX)], questions: affirmations.map((a) => ({ consigne: a.enonce })) },
    correction: affirmations.map((a, i) => ({ type: 'paragraphe', fragments: [texte(`${lettre(i)}) ${vf(a.reponse)} — `), ...a.justification] })),
    difficulte: 1,
    reponseBreve: [texte(affirmations.map((a, i) => `${lettre(i)}) ${vf(a.reponse)}`).join(' · '))],
    correctionDetaillee: affirmations.map((a, i) => ({ label: vf(a.reponse), sousQuestion: lettre(i), fragments: a.justification })),
    bareme: {
      reponseFinale: [texte(affirmations.map((a, i) => `${lettre(i)}) ${vf(a.reponse)}`).join(' · '))],
      criteres: affirmations.map((a, i) => ({ sousQuestion: lettre(i), critere: [texte(`${vf(a.reponse)}, avec une justification correcte`)], points: 1 })),
      erreursFrequentes: [{ description: [texte('Bonne réponse sans justification, ou justification par un seul exemple numérique')], cout: 'la moitié des points de l’affirmation' }],
    },
    enonceAmenage: affirmations.map((a, i) => ({ consigne: [texte(`${lettre(i)}) `), ...a.enonce, texte(' — Vrai ou faux ? Justifie.')], points: 1 })),
    dureeMinutes: affirmations.length * 2,
  }
}

export async function itemsDepuisSerie(serie: PlanSerie): Promise<ItemEvaluation[]> {
  const items: ItemEvaluation[] = []
  for (const el of serie.elements) {
    const item = el.type === 'exercice' ? itemExercice(el) : el.type === 'ouverte' ? itemOuverte(el) : await itemVraiFaux(el)
    if (item) items.push(item)
  }
  return items
}

/* ----------------------------------------------------------------------------------------------
 * Documents
 * -------------------------------------------------------------------------------------------- */

export type TypeDocument = 'feuille' | 'enonce' | 'corrige' | 'grille' | 'amenagee'

export interface DocumentGenere {
  type: TypeDocument
  serieLettre?: string
  libelle: string
  /** Suffixe du nom de fichier (sans extension), ex. « serie-A-grille ». */
  suffixe: string
  blob: Blob
}

function enteteSerie(entete: EnTeteEvaluation, serieLettre: string): EnteteEvaluationSerie {
  return {
    numero: entete.numero,
    date: entete.date,
    titre: entete.titre,
    niveauLabel: entete.niveauLabel,
    niveauNumero: entete.niveauNumero,
    heuresSemaine: entete.heuresSemaine,
    calculatrice: entete.calculatrice,
    serieLettre,
    afficherTitresSection: entete.afficherTitresSection,
    mode: entete.mode,
    surtitre: entete.surtitre,
    titreChapitre: entete.titreChapitre,
    urlChapitre: entete.urlChapitre,
  }
}

export async function genererDocumentsDepuisPlan(plan: PlanDocument): Promise<DocumentGenere[]> {
  const documents: DocumentGenere[] = []
  const exercice = plan.entete.mode === 'exercice'
  for (const serie of plan.series) {
    const items = await itemsDepuisSerie(serie)
    const entete = enteteSerie(plan.entete, serie.lettre)
    if (exercice) {
      documents.push({ type: 'feuille', libelle: 'Feuille d’exercices (énoncé, je vérifie, corrigé)', suffixe: 'feuille', blob: await genererFeuilleExercicesComplete(entete, items) })
      if (plan.entete.versionAmenagee) documents.push({ type: 'amenagee', libelle: 'Version aménagée', suffixe: 'amenagee', blob: await genererVersionAmenagee(entete, items) })
      continue
    }
    const { enonce, corrige, grille } = await genererEvaluationHtml(entete, items)
    const s = `serie-${serie.lettre}`
    documents.push({ type: 'enonce', serieLettre: serie.lettre, libelle: `Série ${serie.lettre} — copie de l’élève`, suffixe: `${s}-enonce`, blob: enonce })
    documents.push({ type: 'corrige', serieLettre: serie.lettre, libelle: `Série ${serie.lettre} — corrigé`, suffixe: `${s}-corrige`, blob: corrige })
    documents.push({ type: 'grille', serieLettre: serie.lettre, libelle: `Série ${serie.lettre} — grille de correction`, suffixe: `${s}-grille`, blob: grille })
    if (plan.entete.versionAmenagee) documents.push({ type: 'amenagee', serieLettre: serie.lettre, libelle: `Série ${serie.lettre} — version aménagée`, suffixe: `${s}-amenagee`, blob: await genererVersionAmenagee(entete, items) })
  }
  return documents
}

/* ----------------------------------------------------------------------------------------------
 * Évaluations / feuilles enregistrées
 * -------------------------------------------------------------------------------------------- */

const CLE_ENREGISTREES = 'math-belgium-evaluations-enregistrees'

export interface PlanEnregistre {
  id: string
  nom: string
  enregistreLe: string
  plan: PlanDocument
}

export function lirePlansEnregistres(): PlanEnregistre[] {
  try {
    const brut = localStorage.getItem(CLE_ENREGISTREES)
    const liste = brut ? (JSON.parse(brut) as PlanEnregistre[]) : []
    return Array.isArray(liste) ? liste.filter((p) => p?.plan?.version === 1) : []
  } catch {
    return []
  }
}

export function enregistrerPlan(nom: string, plan: PlanDocument): PlanEnregistre[] {
  const entree: PlanEnregistre = { id: `${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`, nom, enregistreLe: new Date().toISOString(), plan }
  const liste = [entree, ...lirePlansEnregistres()].slice(0, 60)
  try {
    localStorage.setItem(CLE_ENREGISTREES, JSON.stringify(liste))
  } catch {
    throw new Error('Stockage local indisponible ou plein : exporte plutôt le fichier JSON.')
  }
  return liste
}

export function supprimerPlanEnregistre(id: string): PlanEnregistre[] {
  const liste = lirePlansEnregistres().filter((p) => p.id !== id)
  try {
    localStorage.setItem(CLE_ENREGISTREES, JSON.stringify(liste))
  } catch {
    /* rien */
  }
  return liste
}

/** Valide un plan importé depuis un fichier JSON (structure minimale) — `null` si invalide. */
export function lirePlanDepuisJson(texteJson: string): PlanDocument | null {
  try {
    const brut = JSON.parse(texteJson) as Partial<PlanDocument> & { plan?: PlanDocument }
    const plan = (brut.plan ?? brut) as PlanDocument
    if (plan.version !== 1 || !Array.isArray(plan.series) || !plan.entete || !Array.isArray(plan.lignes)) return null
    return plan
  } catch {
    return null
  }
}

/** Codes de tous les exercices d'un plan (affichage dans le panneau). */
export function codesDuPlan(plan: PlanDocument): { serie: string; generatorId: string; code: string }[] {
  const res: { serie: string; generatorId: string; code: string }[] = []
  for (const serie of plan.series) {
    for (const el of serie.elements) {
      if (el.type !== 'exercice') continue
      const adaptateur = EVALUATION_ADAPTER_REGISTRY[el.generatorId]
      if (!adaptateur) continue
      for (const inst of el.instances) res.push({ serie: serie.lettre, generatorId: el.generatorId, code: encoderCode(inst.graine, indexVariante(adaptateur, inst.varianteId)) })
    }
  }
  return res
}

/** Copie Word (.docx) d'une série d'évaluation — chargée à la demande (le module `docx` est lourd). */
export async function genererCopieDocxDepuisPlan(plan: PlanDocument, lettre: string): Promise<Blob | null> {
  const serie = plan.series.find((s) => s.lettre === lettre)
  if (!serie) return null
  const { genererCopieEvaluationDocx } = await import('../entrainement/export/evaluationDocx')
  return genererCopieEvaluationDocx(enteteSerie(plan.entete, lettre), await itemsDepuisSerie(serie))
}
