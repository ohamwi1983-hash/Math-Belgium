import type { AdaptateurFeuilleExercices, ProfilInstance, BaremeExercice, EnoncePapier, BlocCorrection, CritereBareme, EtapeCorrection, FragmentConsigne, PrecisionRegroupement, RegroupementInstance, SectionExercice } from '../entrainement/export/genererFeuilleExercices'
import { texte } from '../entrainement/export/fragmentsDocx'
import {
  genererEvaluationBlanche,
  genererEvaluationHtml,
  genererFeuilleExercicesComplete,
  genererVersionAmenagee,
  partiesDuDocument,
  type AnnexeDocument,
  type EnteteEvaluation as EnteteEvaluationSerie,
  type ExamenDocument,
  type ItemEvaluation,
  type LigneGroupe,
} from '../entrainement/export/assemblerEvaluationHtml'
import { horaireExamen, lignesConsignes, mettreAEchelle, sessionParDefaut, titreCourtChapitre, type ChapitreExamen } from '../entrainement/export/examen'
import { annexeFormulaire } from '../entrainement/export/annexesPapier'
import { niveauEtDuree, type NiveauDifficulte } from '../entrainement/export/niveauDifficulte'
import { findChapter } from '../content/chaptersIndex'
import { encoderCode, genererAvecCode, tirerGraine } from '../entrainement/export/codeExercice'
import { ENTRAINEMENT_REGISTRY } from '../entrainement/registry'
import { EVALUATION_ADAPTER_REGISTRY } from './evaluationAdapterRegistry'
import { groupeVerdict } from '../entrainement/export/groupesVerdict'
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
  /** `ligne` : ligne de sélection d'origine (indice de l'item du panneau ; remédiation : « r<n° de
   * question> ») — les exercices regroupés a), b), c) viennent toujours de la même ligne. Absent
   * (plans d'avant) : regroupement par générateur et processus. */
  | (ElementBase & { type: 'exercice'; generatorId: string; instances: InstancePlan[]; ligne?: number | string })
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
  /** Feuille de remédiation (`evaluationRemediation.ts`) : évaluation d'origine et questions
   * retravaillées. Un tel plan se recharge tel quel, sans toucher à la sélection du panneau (ses
   * `lignes` sont celles de l'évaluation d'origine). Absent pour une évaluation / feuille normale. */
  remediation?: {
    titreSource: string
    questions: number[]
    exercicesParQuestion: number
    /** Questions pour lesquelles le générateur n'avait plus assez d'énoncés inédits (variante à très
     * peu d'énoncés, déjà tous dans l'évaluation) : moins d'exercices que demandé, jamais de répétition. */
    incompletes?: number[]
  }
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

/** Les figures SVG portent souvent des identifiants tirés d'un compteur global (`id="ri12"`,
 * `url(#ri12-clip)`) : deux énoncés identiques auraient alors des empreintes différentes et le
 * contrôle anti-doublon ne verrait rien. Ces identifiants sont neutralisés avant le hachage. */
function sansIdentifiantsSvg(texte: string): string {
  return texte
    .replace(/\bid=\\?"[^"\\]*\\?"/g, 'id')
    .replace(/url\(#[^)]*\)/g, 'url()')
    .replace(/href=\\?"#[^"\\]*\\?"/g, 'href')
}

export function empreinteSection(generatorId: string, section: SectionExercice): string {
  return `${generatorId}:${hacher(sansIdentifiantsSvg(JSON.stringify([section.enteteFragments ?? [], section.questions.map((q) => q.consigne), section.enteteHtml ?? ''])))}`
}

/* ----------------------------------------------------------------------------------------------
 * Tirage des instances
 * -------------------------------------------------------------------------------------------- */

export type Adaptateur = AdaptateurFeuilleExercices<never>

function indexVariante(adaptateur: Adaptateur, varianteId: string): number | null {
  if (!adaptateur.catalogueVariantes || !adaptateur.genererInstanceAvecVariante) return null
  const i = adaptateur.catalogueVariantes.findIndex((v) => v.id === varianteId)
  return i >= 0 ? i : null
}

/** Instance reproductible — EXACTEMENT le tirage que fait l'appli interactive à partir du code
 * (`genererAvecCode`), pour que le QR code rouvre le même exercice. */
export function tirerInstance(adaptateur: Adaptateur, varianteId: string, graine: number): never {
  // Un plan porte toujours la variante RÉELLE ; un id de groupe « à verdict » n'arrive ici que pour
  // une sonde (`varianteAdmetCasParticulier`) : membre choisi par la graine, reproductible.
  const groupe = groupeVerdict(adaptateur, varianteId)
  if (groupe) varianteId = groupe.variantes[graine % groupe.variantes.length]!
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

/** Contrainte de TIRAGE ÉQUILIBRÉ d'une instance d'évaluation (décisions de l'utilisateur) :
 * - `parametresExclus` (générateur à `parametresAuChoix`) : ensemble EXACT des paramètres absents
 *   (cases décochées) — les paramètres non applicables à l'instance (`parametresNonApplicables`)
 *   sont ignorés ;
 * - `cas` (autres caractéristiques du profil) : `'complet'` (défaut) = aucune ; `'particulier'` = un
 *   cas particulier simple (case « inclure un cas particulier ») ; autre chaîne = CE cas précis
 *   (même question d'une série à l'autre) ;
 * - `forme` : même type de question que la série A (`ProfilInstance.forme`) ;
 * - `calculatrice` : interdite → jamais d'instance qui exige la calculatrice ; autorisée →
 *   seulement des instances qui l'exigent (pas d'angles ni de valeurs remarquables).
 * Sans `profilInstance` dans l'adaptateur, aucune contrainte (comportement historique). */
export interface ContrainteTirage {
  cas: 'complet' | 'particulier' | string
  idsParametres: string[]
  parametresExclus: string[] | null
  forme?: string
  calculatrice?: 'interdite' | 'autorisee'
}

/** Caractéristiques du profil qui ne sont PAS des paramètres au choix (cas particuliers), jointes par « + ». */
export function autresCaracteristiques(profil: ProfilInstance, idsParametres: string[]): string | null {
  const autres = (profil.casParticulier ? profil.casParticulier.split('+') : []).filter((c) => !idsParametres.includes(c))
  return autres.length === 0 ? null : autres.join('+')
}

function casRespecte(autres: string | null, cas: ContrainteTirage['cas']): boolean {
  if (cas === 'complet') return autres === null
  if (cas === 'particulier') return autres !== null && !autres.includes('+')
  return autres === cas
}

function parametresRespectes(profil: ProfilInstance, contrainte: ContrainteTirage): boolean {
  if (!contrainte.parametresExclus) return true
  const nonApplicables = profil.parametresNonApplicables ?? []
  const absents = (profil.casParticulier ? profil.casParticulier.split('+') : []).filter((c) => contrainte.idsParametres.includes(c) && !nonApplicables.includes(c))
  const voulus = contrainte.parametresExclus.filter((c) => !nonApplicables.includes(c))
  return absents.length === voulus.length && voulus.every((c) => absents.includes(c))
}

export function respecteContrainte(profil: ProfilInstance, contrainte: ContrainteTirage, avecCalcul: boolean): boolean {
  if (!parametresRespectes(profil, contrainte)) return false
  if (!casRespecte(autresCaracteristiques(profil, contrainte.idsParametres), contrainte.cas)) return false
  if (contrainte.forme !== undefined && profil.forme !== contrainte.forme) return false
  if (avecCalcul && contrainte.calculatrice === 'interdite' && profil.calcul === 'calculatrice') return false
  if (avecCalcul && contrainte.calculatrice === 'autorisee' && profil.calcul === 'exacte') return false
  return true
}

/** Réponses déjà calculées par `varianteAdmetCasParticulier` (« générateur::variante »). */
const CAS_PARTICULIER_POSSIBLE = new Map<string, boolean>()

/** La variante peut-elle recevoir un cas particulier (case « Inclure un cas particulier ») ? Même
 * tirage et même budget de temps que `graineInedite` : la réponse est donc celle du moteur — une
 * variante où il ne trouverait jamais de cas (gen42 « deux points » : le cas « droite parallèle à un
 * axe » n'existe qu'en « angle ») n'affiche pas la case, qui y serait sans effet. Mis en cache. */
export function varianteAdmetCasParticulier(generatorId: string, varianteId: string): boolean {
  const cle = `${generatorId}::${varianteId}`
  const connu = CAS_PARTICULIER_POSSIBLE.get(cle)
  if (connu !== undefined) return connu
  const adaptateur = EVALUATION_ADAPTER_REGISTRY[generatorId] as Adaptateur | undefined
  if (!adaptateur?.profilInstance || !adaptateur.libelleCasParticulier) return false
  const idsParametres = (adaptateur.parametresAuChoix ?? []).map((p) => p.id)
  let trouve = false
  const fin = Date.now() + 200
  for (let essai = 0; essai < 20000 && Date.now() < fin && !trouve; essai++) {
    try {
      const autres = autresCaracteristiques(adaptateur.profilInstance(tirerInstance(adaptateur, varianteId, tirerGraine())), idsParametres)
      trouve = casRespecte(autres, 'particulier')
    } catch {
      break
    }
  }
  CAS_PARTICULIER_POSSIBLE.set(cle, trouve)
  return trouve
}

/** Graine dont la PREMIÈRE instance (celle que rouvre le QR code, `tirerInstance`) respecte la
 * contrainte et n'a pas encore été imprimée. Recherche par paliers : contrainte complète, puis (cas
 * particulier introuvable) un exercice complet, puis sans la calculatrice (une variante sans aucun cas « à la calculatrice » ne bloque pas la génération),
 * puis sans contrainte. Renvoie aussi le cas particulier obtenu, pour l'imposer aux autres séries. */
/** `vuesSerie` (facultatif) : empreintes déjà tirées dans la MÊME série. Quand toutes les instances
 * possibles ont déjà servi (générateur à peu d'énoncés, ex. gen122 : 13 énoncés complets), le repli
 * prend en priorité une instance absente de la série — jamais deux questions identiques dans une
 * série tant que c'est possible (audit 4e ch. 5, lot D). */
export function graineInedite(generatorId: string, adaptateur: Adaptateur, varianteId: string, dejaVues: Set<string>, contrainte?: ContrainteTirage, strict = false, vuesSerie?: Set<string>): { graine: number; casParticulier: string | null } {
  const profilDe = adaptateur.profilInstance
  const paliers: { essais: number; filtre: ((p: ProfilInstance) => boolean) | null }[] =
    profilDe && contrainte
      ? [
          // Combinaison précise de paramètres (jusqu'à ~1 tirage sur 2 500) : recherche plus longue,
          // un tirage coûte quelques microsecondes.
          { essais: 20000, filtre: (p) => respecteContrainte(p, contrainte, true) },
          // Cas particulier introuvable (générateur sans ce cas) : exercice complet, calculatrice respectée.
          ...(contrainte.cas !== 'complet' ? [{ essais: 20000, filtre: (p: ProfilInstance) => respecteContrainte(p, { ...contrainte, cas: 'complet' }, true) }] : []),
          { essais: 20000, filtre: (p) => respecteContrainte(p, contrainte, false) },
          { essais: 8, filtre: null },
        ]
      : [{ essais: 8, filtre: null }]
  // `strict` : seulement le premier palier (recherche d'un cas particulier sur une question précise —
  // échec = on essaie la question précédente de la ligne, pas de repli coûteux).
  if (strict) paliers.splice(1)
  let repli: { graine: number; casParticulier: string | null } | null = null
  let repliHorsSerie: { graine: number; casParticulier: string | null; empreinte: string } | null = null
  for (const palier of paliers) {
    // Budget de temps par palier (un tirage coûte de quelques µs à ~1 ms selon le générateur) : les
    // cas rares (σ entier, combinaison précise de paramètres) sont trouvés sans bloquer le panneau.
    const fin = Date.now() + (palier.filtre ? 200 : 50)
    for (let essai = 0; essai < palier.essais && (essai < 8 || Date.now() < fin); essai++) {
      const graine = tirerGraine()
      let instance: never
      try {
        instance = tirerInstance(adaptateur, varianteId, graine)
      } catch {
        return { graine, casParticulier: null }
      }
      const profil = profilDe ? profilDe(instance) : null
      if (palier.filtre && profil && !palier.filtre(profil)) continue
      const resultat = { graine, casParticulier: profil ? autresCaracteristiques(profil, contrainte?.idsParametres ?? []) : null }
      repli ??= resultat
      let empreinte: string
      try {
        empreinte = empreinteSection(generatorId, adaptateur.construireEnonce(instance))
      } catch {
        return resultat
      }
      if (!dejaVues.has(empreinte)) {
        dejaVues.add(empreinte)
        vuesSerie?.add(empreinte)
        return resultat
      }
      if (vuesSerie && !repliHorsSerie && !vuesSerie.has(empreinte)) repliHorsSerie = { ...resultat, empreinte }
    }
    if (repliHorsSerie) {
      vuesSerie?.add(repliHorsSerie.empreinte)
      return { graine: repliHorsSerie.graine, casParticulier: repliHorsSerie.casParticulier }
    }
    if (repli) return repli
  }
  return repli ?? { graine: tirerGraine(), casParticulier: null }
}

function melanger<T>(liste: T[]): T[] {
  const copie = [...liste]
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copie[i], copie[j]] = [copie[j], copie[i]]
  }
  return copie
}

export function piocherIndices(total: number, nombre: number, eviter: Set<number>): number[] {
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
  /** Structure de chaque question de la série A (cas particulier, type de question), reproduite
   * question par question dans les autres séries — mêmes questions, autres nombres. */
  const structureParItem = new Map<number, { varianteId: string; cas: string | null; forme?: string }[]>()
  /** Groupes « à verdict » (`groupesVerdict`, décision de l'utilisateur) : un paquet mélangé des
   * variantes membres par (item, groupe), distribué question après question, série A puis B… —
   * verdicts équilibrés sur l'ensemble des séries et différents d'une série à l'autre ; paquet
   * re-mélangé quand il est vide. */
  const paquets = new Map<string, string[]>()
  const verdictSuivant = (cle: string, membres: string[]): string => {
    let paquet = paquets.get(cle)
    if (!paquet || paquet.length === 0) paquets.set(cle, (paquet = melanger([...membres])))
    return paquet.shift()!
  }

  for (let s = 0; s < nombreSeries; s++) {
    const elements: ElementPlan[] = []
    /** Empreintes de la série en cours (jamais deux questions identiques dans une série). */
    const vuesSerie = new Set<string>()
    for (const item of items) {
      const base: ElementBase = { processus: item.processus, titreSection: item.titreSection, section: item.section }
      if (item.exercice) {
        const adaptateur = EVALUATION_ADAPTER_REGISTRY[item.exercice.generatorId]
        if (!adaptateur) continue
        const generatorId = item.exercice.generatorId
        // Tirage équilibré (évaluation seulement ; une feuille d'exercices garde toute la variété) :
        // instances complètes, paramètres décochés absents, un cas particulier si la case est cochée ;
        // la série A fixe la structure de chaque question, les autres séries la reproduisent.
        const equilibre = entete.mode !== 'exercice'
        const idsParametres = (adaptateur.parametresAuChoix ?? []).map((p) => p.id)
        // Réglages PAR VARIANTE (décision de l'utilisateur) : chaque entrée (variante, éventuellement
        // dupliquée) a ses paramètres décochés et sa case « cas particulier » ; l'ancien réglage de
        // ligne (plans enregistrés) s'applique encore aux entrées qui n'ont pas les leurs.
        const entrees = item.exercice.parVariante.filter((v) => v.nombre > 0)
        const exclusDe = (e: (typeof entrees)[number]): string[] | null =>
          adaptateur.parametresAuChoix ? (e.parametresExclus ?? item.exercice!.parametresExclus ?? []).filter((id) => idsParametres.includes(id)) : null
        const casDe = (e: (typeof entrees)[number], i: number): boolean =>
          e.inclureCasParticulier ?? (!!item.exercice!.inclureCasParticulier && i === entrees.length - 1)
        const contrainteDe = (cas: ContrainteTirage['cas'], parametresExclus: string[] | null, forme?: string): ContrainteTirage | undefined =>
          equilibre ? { cas, idsParametres, parametresExclus, forme, calculatrice: entete.calculatrice } : undefined
        const indexItem = items.indexOf(item)
        const structureA = structureParItem.get(indexItem)
        // Une question par instance, avec l'indice de son entrée (pour ses réglages).
        const questions = entrees.flatMap((e, indexEntree) =>
          Array.from({ length: e.nombre }, () => {
            const groupe = groupeVerdict(adaptateur as Adaptateur, e.varianteId)
            const varianteId = groupe ? verdictSuivant(`${indexItem}:${groupe.id}`, groupe.variantes) : e.varianteId
            return { varianteId, points: e.points, indexEntree, exclus: exclusDe(e), formeCommune: !!groupe?.formeCommune }
          }),
        )
        let instances: InstancePlan[]
        if (equilibre && structureA && structureA.length === questions.length) {
          instances = questions.map(({ varianteId, points, exclus, formeCommune }, k) => {
            // Groupe « à verdict » : la variante peut différer de la série A — on garde alors le cas
            // particulier (oui / non) mais pas la forme, propre à la variante (sauf groupe à
            // `formeCommune` : structure visible partagée par tous les membres, 5gen24).
            const meme = structureA[k].varianteId === varianteId || formeCommune
            const cas = meme ? (structureA[k].cas ?? 'complet') : structureA[k].cas ? 'particulier' : 'complet'
            return { varianteId, points, graine: graineInedite(generatorId, adaptateur, varianteId, dejaVues, contrainteDe(cas, exclus, meme ? structureA[k].forme : undefined), false, vuesSerie).graine }
          })
        } else {
          instances = questions.map(({ varianteId, points, exclus }) => ({ varianteId, points, graine: graineInedite(generatorId, adaptateur, varianteId, dejaVues, contrainteDe('complet', exclus), false, vuesSerie).graine }))
          // « Inclure un cas particulier » (par variante) : la DERNIÈRE question de CETTE variante qui
          // peut en recevoir un.
          if (equilibre && adaptateur.libelleCasParticulier) {
            entrees.forEach((e, indexEntree) => {
              if (!casDe(e, indexEntree)) return
              for (let k = questions.length - 1; k >= 0; k--) {
                if (questions[k].indexEntree !== indexEntree) continue
                const essai = graineInedite(generatorId, adaptateur, instances[k].varianteId, dejaVues, contrainteDe('particulier', questions[k].exclus), true, vuesSerie)
                if (essai.casParticulier && casRespecte(essai.casParticulier, 'particulier')) {
                  instances[k] = { ...instances[k], graine: essai.graine }
                  break
                }
              }
            })
          }
          if (equilibre && adaptateur.profilInstance) {
            structureParItem.set(
              indexItem,
              instances.map((inst) => {
                const profil = adaptateur.profilInstance!(tirerInstance(adaptateur, inst.varianteId, inst.graine))
                return { varianteId: inst.varianteId, cas: autresCaracteristiques(profil, idsParametres), forme: profil.forme }
              }),
            )
          }
        }
        if (instances.length === 0) continue
        // Un élément par instance : le regroupement a), b), c) se fait à l'impression
        // (`questionsDeSerie`), d'après la ligne d'origine.
        for (const instance of instances) elements.push({ ...base, type: 'exercice', generatorId, instances: [instance], ligne: indexItem })
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
        for (const question of ouvertes) elements.push({ ...base, type: 'ouverte', points: question.points ?? item.points, question })
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

/** Niveau (1–7) et palier affichés pour un exercice — grille commune (`niveauDifficulte.ts`), ou
 * conversion provisoire des étoiles d'un chapitre pas encore noté. Plusieurs instances regroupées :
 * le plus haut niveau. */
function niveauItem(niveaux: (NiveauDifficulte | undefined)[]): Pick<ItemEvaluation, 'niveau' | 'palier'> {
  const n = niveaux.filter((v): v is NiveauDifficulte => v !== undefined)
  if (n.length === 0) return {}
  const max = n.reduce((a, b) => (b.niveau > a.niveau ? b : a))
  return { niveau: max.niveau, palier: max.palier }
}

/** Durée d'un item = somme des durées par exercice (indéfinie si l'adaptateur n'en donne aucune). */
function dureeItem(niveaux: (NiveauDifficulte | undefined)[], dureeConstante: number | undefined, nombre: number): number | undefined {
  const d = niveaux.map((v) => v?.dureeMinutes)
  if (d.every((x): x is number => x !== undefined)) return d.reduce((t, x) => t + x, 0)
  return dureeConstante !== undefined ? dureeConstante * nombre : undefined
}

function champsCommuns(el: ElementBase): Pick<ItemEvaluation, 'processus' | 'titreSection' | 'notion' | 'sectionCours' | 'chapitres'> {
  return {
    chapitres: el.section ? [el.section.chapitreSlug] : [],
    processus: el.processus,
    titreSection: el.titreSection,
    notion: el.section?.titre,
    sectionCours: el.section ? { numero: el.section.numero, titre: el.section.titre } : undefined,
  }
}

/** Le corrigé et la grille numérotent déjà « Étape n » : un préfixe « Étape n (libellé) — » porté
 * par la consigne elle-même ne doit pas apparaître deux fois (« Étape n (libellé) : » d'un critère
 * devient « libellé : »). */
function sansPrefixeEtape(consigne: FragmentConsigne[]): FragmentConsigne[] {
  const [premier, ...suite] = consigne
  if (!premier || premier.type !== 'texte') return consigne
  const reste = premier.valeur
    .replace(/^Étape \d+(?: \([^)]*\))? — /, '')
    .replace(/^Étape \d+ \(([^)]*)\) : /, '$1 : ')
  return reste === premier.valeur ? consigne : [{ ...premier, valeur: reste }, ...suite]
}

/** Énoncé papier (`AdaptateurFeuilleExercices.enoncePapier`) : l'énoncé imprimé ne garde que
 * l'énoncé et la consigne globale (et les vraies questions d'un problème) ; les sous-questions de
 * `construireEnonce` — les étapes d'apprentissage du générateur — deviennent les étapes du corrigé
 * (« Étape n — consigne », puis leur résolution). Les lettres d'étape du corrigé et du barème sont
 * converties : numéro d'étape, et lettre de la question papier qui couvre l'étape s'il y en a
 * plusieurs. La version aménagée imprime ce même énoncé papier. */
function appliquerEnoncePapier(item: ItemEvaluation, papier: EnoncePapier): ItemEvaluation {
  const etapes = item.section.questions
  const numeroEtape = (lettre?: string) => {
    if (!lettre) return undefined
    const i = LETTRES.indexOf(lettre.toLowerCase().replace(/\)$/, ''))
    return i >= 0 && i < etapes.length ? i + 1 : undefined
  }
  const plusieursQuestions = papier.section.questions.length > 1
  const questionDeLEtape = new Map<string, string>()
  papier.etapesParQuestion?.forEach((lettresEtapes, q) => {
    for (const l of lettresEtapes) questionDeLEtape.set(l, LETTRES[q] ?? String(q + 1))
  })
  const questionPapier = (lettre?: string) => (plusieursQuestions && lettre ? questionDeLEtape.get(lettre.toLowerCase().replace(/\)$/, '')) : undefined)
  // Renvois en clair (« 0 pt sur a) et b) », « en b) ») : vers la question papier si elle existe,
  // sinon vers le numéro d'étape du corrigé.
  const renvoi = (l: string) => questionPapier(l) ?? numeroEtape(l)
  const reecrireRenvois = (t: string) =>
    etapes.length < 2
      ? t
      : t.replace(/\b(sur|en) ([a-z])\)(?: et ([a-z])\))?/g, (tout, prep: string, l1: string, l2?: string) => {
          const r1 = renvoi(l1)
          const r2 = l2 ? renvoi(l2) : undefined
          if (r1 === undefined || (l2 && r2 === undefined)) return tout
          const q = typeof r1 === 'string'
          if (r2 === undefined) return q ? `${prep} ${r1})` : `${prep === 'sur' ? 'sur' : 'à'} l'étape ${r1}`
          return q ? `${prep} ${r1}) et ${r2})` : `${prep === 'sur' ? 'sur les' : 'aux'} étapes ${r1} et ${r2}`
        })
  const fragmentsPapier = (fr: FragmentConsigne[]) => fr.map((f) => (f.type === 'texte' ? { ...f, valeur: reecrireRenvois(f.valeur) } : f))
  return {
    ...item,
    section: papier.section,
    reponseBreve: papier.reponseBreve ?? item.reponseBreve,
    etapesCorrige: etapes.length > 1 ? etapes.map((q, i) => ({ consigne: sansPrefixeEtape(q.consigne), question: questionPapier(LETTRES[i]) })) : undefined,
    correctionDetaillee: item.correctionDetaillee?.map((e) => ({
      ...e,
      fragments: fragmentsPapier(e.fragments),
      sousQuestion: questionPapier(e.sousQuestion),
      etape: etapes.length > 1 ? numeroEtape(e.sousQuestion) : undefined,
    })),
    bareme: item.bareme && {
      ...item.bareme,
      criteres: item.bareme.criteres.map((c) => ({
        ...c,
        critere: fragmentsPapier(etapes.length > 1 ? sansPrefixeEtape(c.critere) : c.critere),
        sousQuestion: questionPapier(c.sousQuestion),
        etape: etapes.length > 1 ? numeroEtape(c.sousQuestion) : undefined,
      })),
      erreursFrequentes: item.bareme.erreursFrequentes?.map((e) => ({ description: fragmentsPapier(e.description), cout: e.cout && reecrireRenvois(e.cout) })),
      reponsesAcceptees: item.bareme.reponsesAcceptees?.map(fragmentsPapier),
    },
  }
}

/** Instance tirée d'un élément (une instance), mise en cache le temps d'une série : la clé de
 * regroupement et l'item la tirent tous deux. */
type CacheInstances = Map<string, unknown>
function instanceDe(adaptateur: Adaptateur, inst: InstancePlan, cache?: CacheInstances): never {
  const cle = `${inst.varianteId}|${inst.graine}`
  if (cache?.has(cle)) return cache.get(cle) as never
  const instance = tirerInstance(adaptateur, inst.varianteId, inst.graine)
  cache?.set(cle, instance)
  return instance
}

/** Item d'UN exercice (une instance) : énoncé papier, corrigé, barème, niveau, code. */
function itemExercice(el: Extract<ElementPlan, { type: 'exercice' }>, cache?: CacheInstances): ItemEvaluation | null {
  const adaptateur = EVALUATION_ADAPTER_REGISTRY[el.generatorId]
  if (!adaptateur) return null
  const inst = el.instances[0]
  if (!inst) return null
  const instance = instanceDe(adaptateur, inst, cache)
  const niveau = niveauEtDuree(adaptateur, instance)
  const item: ItemEvaluation = {
    ...champsCommuns(el),
    nature: 'exercice',
    points: inst.points,
    section: adaptateur.construireEnonce(instance),
    correction: adaptateur.construireCorrection(instance),
    ...niveauItem([niveau]),
    reponseBreve: adaptateur.reponseBreve?.(instance),
    correctionDetaillee: adaptateur.correctionDetaillee?.(instance),
    bareme: adaptateur.bareme?.(instance),
    dureeMinutes: dureeItem([niveau], adaptateur.dureeMinutes, 1),
    code: codeInstance(el.generatorId, adaptateur, inst.varianteId, inst.graine),
  }
  return adaptateur.enoncePapier ? appliquerEnoncePapier(item, adaptateur.enoncePapier(instance)) : item
}

/* ----------------------------------------------------------------------------------------------
 * Regroupement a), b), c) (décision de l'utilisateur, `AdaptateurFeuilleExercices.regroupement`)
 *
 * Purement une MISE EN FORME après tirage : le plan garde un élément par instance (graine, variante,
 * points, `?code=` inchangés) ; à l'impression, les instances d'un même générateur, de la même ligne
 * de sélection (`ElementPlan.ligne`), du même processus, qui ont la même consigne générale forment
 * UNE question, placée au rang de la première (comme le vrai/faux). Une seule instance → exercice
 * ordinaire, rendu exactement comme avant. `questionsDeSerie` est la SEULE règle de numérotation :
 * documents (`itemsDepuisSerie`) et remédiation (`questionsRemediables`) l'appellent tous deux.
 * -------------------------------------------------------------------------------------------- */

/** Une question imprimée d'une série : indices des éléments qu'elle couvre (un exercice, une question
 * ouverte, TOUS les vrai/faux, ou un groupe a), b), c)). */
export interface QuestionSerie {
  nature: 'exercice' | 'ouverte' | 'vraiFaux'
  indices: number[]
  /** Regroupement a), b), c) de plusieurs exercices. */
  regroupe: boolean
}

/** Éléments « à plat » : un ancien plan peut porter plusieurs instances dans un élément (ancien
 * `regroupable`) — chacune redevient un élément, regroupé ensuite par la règle commune. */
export function elementsAPlat(serie: PlanSerie): ElementPlan[] {
  return serie.elements.flatMap((el) => (el.type === 'exercice' && el.instances.length > 1 ? el.instances.map((inst) => ({ ...el, instances: [inst] })) : [el]))
}

function normaliserFragments(fr: FragmentConsigne[]): string {
  return JSON.stringify(fr.map((f) => (f.type === 'texte' ? { t: f.valeur.replace(/\s+/g, ' ').trim() } : { l: f.valeur.replace(/\s+/g, '') })))
}

/** Ligne de regroupement d'un élément (consigne commune, données…) et sa clé de groupe, ou `null`
 * (générateur sans `regroupement`, énoncé non reconnu, instance non reproductible). */
function regroupementDe(el: ElementPlan, cache?: CacheInstances): { cle: string; reg: RegroupementInstance } | null {
  if (el.type !== 'exercice' || el.instances.length !== 1) return null
  const adaptateur = EVALUATION_ADAPTER_REGISTRY[el.generatorId]
  if (!adaptateur?.regroupement) return null
  try {
    const reg = adaptateur.regroupement(instanceDe(adaptateur, el.instances[0], cache))
    if (!reg) return null
    return { cle: `${el.ligne ?? ''}|${el.generatorId}|${el.processus}|${normaliserFragments(reg.consigne)}`, reg }
  } catch {
    return null
  }
}

/** Questions d'une série, dans l'ordre de la série (avant le rangement par processus), avec les
 * regroupements : tous les vrai/faux = UNE question au rang du premier ; les exercices de même clé
 * de regroupement = UNE question au rang du premier. */
export function questionsDeSerie(elements: ElementPlan[], cache?: CacheInstances): QuestionSerie[] {
  const questions: QuestionSerie[] = []
  let vraiFaux: QuestionSerie | null = null
  const parCle = new Map<string, QuestionSerie>()
  elements.forEach((el, i) => {
    if (el.type === 'vraiFaux') {
      if (!vraiFaux) questions.push((vraiFaux = { nature: 'vraiFaux', indices: [], regroupe: false }))
      vraiFaux.indices.push(i)
      return
    }
    if (el.type === 'ouverte') {
      questions.push({ nature: 'ouverte', indices: [i], regroupe: false })
      return
    }
    const r = regroupementDe(el, cache)
    const existante = r ? parCle.get(r.cle) : undefined
    if (existante) {
      existante.indices.push(i)
      existante.regroupe = true
      return
    }
    const q: QuestionSerie = { nature: 'exercice', indices: [i], regroupe: false }
    if (r) parCle.set(r.cle, q)
    questions.push(q)
  })
  return questions
}

/** Précisions des lignes réunies (ordre de première apparition), au pluriel quand il est fourni. */
function consigneDuGroupe(regs: RegroupementInstance[]): FragmentConsigne[] {
  const vues = new Map<string, PrecisionRegroupement>()
  for (const r of regs) for (const p of r.precisions ?? []) if (!vues.has(p.id)) vues.set(p.id, p)
  return [...regs[0].consigne, ...[...vues.values()].flatMap((p) => [texte(' '), ...(p.pluriel ?? p.fragments)])]
}

const CRITERE_PAR_DEFAUT = 'Réponse correcte et justifiée'

/** Barème du groupe : les critères de chaque ligne (étapes comprises), rattachés à la lettre de la
 * ligne, leurs poids ramenés aux points de la ligne — `pointsCriteres` redonne alors exactement les
 * points de chaque ligne (colonne de droite de la copie, grille). */
function baremeDuGroupe(lignes: LigneGroupe[]): BaremeExercice {
  const lettre = (i: number) => LETTRES[i] ?? String(i + 1)
  const criteres: CritereBareme[] = lignes.flatMap((l, i) => {
    const propres = l.item.bareme?.criteres ?? []
    const somme = propres.reduce((t, c) => t + Math.max(0, c.points), 0)
    if (propres.length === 0 || somme <= 0) return [{ sousQuestion: lettre(i), critere: [texte(CRITERE_PAR_DEFAUT)], points: l.item.points }]
    return propres.map((c) => ({ ...c, sousQuestion: lettre(i), points: (Math.max(0, c.points) / somme) * l.item.points }))
  })
  const erreurs = new Map<string, NonNullable<BaremeExercice['erreursFrequentes']>[number]>()
  for (const l of lignes) for (const e of l.item.bareme?.erreursFrequentes ?? []) erreurs.set(JSON.stringify(e), e)
  return {
    reponseFinale: joindreAvecLettres(lignes.map((l) => l.item.bareme?.reponseFinale ?? l.item.reponseBreve ?? [])),
    criteres,
    erreursFrequentes: erreurs.size > 0 ? [...erreurs.values()] : undefined,
    reponsesAcceptees: reponsesAccepteesDuGroupe(lignes),
  }
}

/** Réponses acceptées du groupe : une écriture commune à toutes les lignes est dite une fois ;
 * propre à certaines lignes, elle est précédée de leurs lettres (« b) », « a), c) »). */
function reponsesAccepteesDuGroupe(lignes: LigneGroupe[]): FragmentConsigne[][] | undefined {
  const parTexte = new Map<string, { r: FragmentConsigne[]; lignes: number[] }>()
  lignes.forEach((l, i) => {
    for (const r of l.item.bareme?.reponsesAcceptees ?? []) {
      const cle = normaliserFragments(r)
      const e = parTexte.get(cle) ?? { r, lignes: [] }
      if (!e.lignes.includes(i)) e.lignes.push(i)
      parTexte.set(cle, e)
    }
  })
  if (parTexte.size === 0) return undefined
  return [...parTexte.values()].map(({ r, lignes: ls }) => (ls.length === lignes.length ? r : [texte(`${ls.map((i) => `${LETTRES[i] ?? i + 1})`).join(', ')} `), ...r]))
}

/** Item d'un groupe a), b), c) à partir de ses lignes (items d'une instance, déjà en énoncé papier).
 * Aussi appelé après une mise à l'échelle des points (examen à total fixé) : chaque ligne garde SES
 * points, le total du groupe est leur somme. */
export function assemblerGroupe(base: ItemEvaluation, consigne: FragmentConsigne[], lignes: LigneGroupe[], figureCommune?: string): ItemEvaluation {
  const plusHaut = lignes.reduce<ItemEvaluation | undefined>((m, l) => (l.item.niveau !== undefined && (m?.niveau === undefined || l.item.niveau > m.niveau) ? l.item : m), undefined)
  const durees = lignes.map((l) => l.item.dureeMinutes)
  const breves = lignes.map((l) => l.item.reponseBreve)
  return {
    processus: base.processus,
    titreSection: base.titreSection,
    notion: base.notion,
    sectionCours: base.sectionCours,
    chapitres: base.chapitres,
    nature: 'exercice',
    points: lignes.reduce((t, l) => t + l.item.points, 0),
    section: { enteteFragments: consigne, ...(figureCommune ? { enteteHtml: figureCommune } : {}), questions: lignes.map((l) => ({ consigne: l.enonce })), disposeEnTableau: true },
    correction: lignes.flatMap((l, i) => prefixerLettreBlocs(l.item.correction, LETTRES[i] ?? String(i + 1))),
    niveau: plusHaut?.niveau,
    palier: plusHaut?.palier,
    reponseBreve: breves.every((b): b is FragmentConsigne[] => !!b && b.length > 0) ? joindreAvecLettres(breves) : undefined,
    bareme: baremeDuGroupe(lignes),
    dureeMinutes: durees.every((d): d is number => d !== undefined) ? durees.reduce((t, d) => t + d, 0) : undefined,
    groupe: lignes,
  }
}

/** Item d'une question regroupée : une ligne par instance (données, item complet de l'instance). */
function itemGroupe(elements: Extract<ElementPlan, { type: 'exercice' }>[], cache: CacheInstances): ItemEvaluation | null {
  const membres = elements.flatMap((el) => {
    const r = regroupementDe(el, cache)
    const item = itemExercice(el, cache)
    return r && item ? [{ reg: r.reg, item }] : []
  })
  if (membres.length === 0) return null
  if (membres.length === 1) return membres[0].item
  // Même figure pour toutes les lignes (gen27 : le même hexagone) : imprimée une seule fois, sous la
  // consigne, au lieu d'être répétée à chaque ligne.
  const figures = membres.map((m) => m.reg.figureHtml)
  const commune = figures.every((f): f is string => !!f && empreinteFigure(f) === empreinteFigure(figures[0]!)) ? figures[0] : undefined
  if (commune) {
    const lignes: LigneGroupe[] = membres.map(({ reg, item }) => ({ enonce: reg.figureCommune?.ligne ?? reg.ligne, item }))
    const regs = membres.map((m) => (m.reg.figureCommune ? { ...m.reg, consigne: m.reg.figureCommune.consigne } : m.reg))
    return assemblerGroupe(membres[0].item, consigneDuGroupe(regs), lignes, commune)
  }
  const lignes: LigneGroupe[] = membres.map(({ reg, item }) => ({ enonce: reg.ligne, ...(reg.figureHtml ? { figureHtml: reg.figureHtml } : {}), item }))
  return assemblerGroupe(membres[0].item, consigneDuGroupe(membres.map((m) => m.reg)), lignes)
}

/** Figure comparée sans ses identifiants internes (dégradés, marqueurs : uniques par instance). */
function empreinteFigure(html: string): string {
  return html.replace(/\s(?:id|href|xlink:href)="[^"]*"/g, '').replace(/url\(#[^)]*\)/g, 'url()').replace(/\s+/g, ' ')
}
const RE_ETIQUETTE = /^\s*([^:]{1,32}?)\s:\s/

function itemOuverte(el: Extract<ElementPlan, { type: 'ouverte' }>): ItemEvaluation {
  const correction: BlocCorrection[] = el.question.corrige.map((paragraphe) => ({ type: 'paragraphe', fragments: paragraphe }))
  // Paragraphes « Étiquette : texte » (étapes d'un exemple résolu) → grille étiquette | texte.
  const etiquetees = el.question.corrige.map((paragraphe): EtapeCorrection => {
    const [premier, ...reste] = paragraphe
    const m = premier?.type === 'texte' ? RE_ETIQUETTE.exec(premier.valeur) : null
    if (!m || !premier) return { label: '', fragments: paragraphe }
    const suite = premier.valeur.slice(m[0].length)
    return { label: m[1], fragments: [...(suite ? [texte(suite)] : []), ...reste] }
  })
  // Une démonstration rédigée en prose (exempleLibre) n'a qu'une étiquette çà et là (« Conséquence
  // importante : … ») : la grille étiquette | texte y laisserait une colonne presque vide. Sous la
  // moitié de paragraphes étiquetés, on garde des paragraphes libres, un bloc par paragraphe.
  const majoriteEtiquetee = etiquetees.filter((e) => e.label).length * 2 >= etiquetees.length
  const correctionDetaillee: EtapeCorrection[] = majoriteEtiquetee ? etiquetees : el.question.corrige.map((paragraphe) => ({ label: '', fragments: paragraphe }))
  return {
    ...champsCommuns(el),
    nature: 'ouverte',
    points: el.points,
    section: { questions: [{ consigne: el.question.enonce }] },
    correction,
    correctionDetaillee,
  }
}

type ElementVraiFaux = Extract<ElementPlan, { type: 'vraiFaux' }>

/** TOUS les vrai/faux d'une série forment UNE seule question (demande de l'utilisateur), même
 * s'ils viennent de sections, voire de chapitres différents : « Question n : Vrai ou faux ? Justifie
 * chaque réponse. a) … b) … ». Lettres continues sur l'ensemble des affirmations ; chaque
 * affirmation garde ses propres points (`pointsParAffirmation` de sa ligne). */
async function itemVraiFauxRegroupe(elements: ElementVraiFaux[]): Promise<ItemEvaluation | null> {
  const affirmations: { enonce: FragmentConsigne[]; reponse: boolean; justification: FragmentConsigne[]; points: number }[] = []
  const sources: ElementVraiFaux[] = []
  for (const el of elements) {
    const banque = await chargerThemeVraiFaux(el.chapitreSlug, el.theme)
    if (!banque) continue
    const choisies = el.indices.map((i) => banque[i]).filter(Boolean)
    if (choisies.length === 0) continue
    sources.push(el)
    for (const a of choisies) affirmations.push({ ...a, points: el.pointsParAffirmation })
  }
  if (affirmations.length === 0) return null
  const vf = (r: boolean) => (r ? 'Vrai' : 'Faux')
  const seule = affirmations.length === 1
  const lettre = (i: number) => LETTRES[i] ?? String(i + 1)
  // Une seule affirmation : pas de lettre « a) » (même convention que les sous-questions).
  const prefixe = (i: number) => (seule ? '' : `${lettre(i)}) `)
  // Une seule section d'origine : on garde sa notion et sa référence au cours (« Je fais le point ») ;
  // plusieurs : la question est simplement « Vrai ou faux ».
  const communs = champsCommuns(sources[0])
  const memeSection = sources.every((el) => el.section && sources[0].section && el.section.titre === sources[0].section.titre && el.chapitreSlug === sources[0].chapitreSlug)
  // Chapitres de TOUTES les affirmations (parties de l'examen : plusieurs chapitres → partie « Vrai ou faux »).
  const chapitres = [...new Set(sources.map((el) => el.chapitreSlug))]
  const champs = { ...(memeSection ? communs : { ...communs, titreSection: 'Vrai ou faux', notion: 'Vrai ou faux', sectionCours: undefined }), chapitres }
  const resume = affirmations.map((a, i) => `${prefixe(i)}${vf(a.reponse)}`).join(' · ')
  return {
    ...champs,
    nature: 'vraiFaux',
    points: affirmations.reduce((t, a) => t + a.points, 0),
    section: { enteteFragments: [texte(seule ? 'Vrai ou faux ? Justifie ta réponse.' : CONSIGNE_VRAI_FAUX)], questions: affirmations.map((a) => ({ consigne: a.enonce })) },
    correction: affirmations.map((a, i) => ({ type: 'paragraphe', fragments: [texte(`${prefixe(i)}${vf(a.reponse)} — `), ...a.justification] })),
    // Vrai/faux : pas encore noté par la grille — ancien « ★ » converti (niveau 2, Base), provisoire.
    niveau: 2,
    palier: 'base',
    reponseBreve: [texte(resume)],
    correctionDetaillee: affirmations.map((a, i) => ({ label: vf(a.reponse), sousQuestion: seule ? undefined : lettre(i), fragments: a.justification })),
    bareme: {
      reponseFinale: [texte(resume)],
      criteres: affirmations.map((a, i) => ({ sousQuestion: seule ? undefined : lettre(i), critere: [texte(`${vf(a.reponse)}, avec une justification correcte`)], points: a.points })),
      erreursFrequentes: [{ description: [texte('Bonne réponse sans justification, ou justification par un seul exemple numérique')], cout: 'la moitié des points de l’affirmation' }],
    },
    dureeMinutes: affirmations.length * 2,
  }
}

/** Items d'une série, dans l'ordre de la série : une question par `questionsDeSerie` (vrai/faux
 * regroupés au rang du premier, exercices regroupés a), b), c) au rang du premier). */
export async function itemsDepuisSerie(serie: PlanSerie): Promise<ItemEvaluation[]> {
  const elements = elementsAPlat(serie)
  const cache: CacheInstances = new Map()
  const items: ItemEvaluation[] = []
  for (const q of questionsDeSerie(elements, cache)) {
    if (q.nature === 'vraiFaux') {
      const regroupe = await itemVraiFauxRegroupe(q.indices.map((i) => elements[i] as ElementVraiFaux))
      if (regroupe) items.push(regroupe)
      continue
    }
    const premier = elements[q.indices[0]]
    const item = q.regroupe
      ? itemGroupe(q.indices.map((i) => elements[i] as Extract<ElementPlan, { type: 'exercice' }>), cache)
      : premier.type === 'exercice'
        ? itemExercice(premier, cache)
        : premier.type === 'ouverte'
          ? itemOuverte(premier)
          : null
    if (item) items.push(item)
  }
  return items
}

/* ----------------------------------------------------------------------------------------------
 * Documents
 * -------------------------------------------------------------------------------------------- */

export type TypeDocument = 'feuille' | 'enonce' | 'corrige' | 'grille' | 'amenagee' | 'blanche'

export interface DocumentGenere {
  type: TypeDocument
  serieLettre?: string
  libelle: string
  /** Suffixe du nom de fichier (sans extension), ex. « serie-A-grille ». */
  suffixe: string
  blob: Blob
}

/** Le plan est-il un EXAMEN (et pas une feuille d'exercices ni une évaluation) ? */
export function estExamen(plan: PlanDocument): boolean {
  return plan.entete.mode !== 'exercice' && plan.entete.typeDocument === 'examen'
}

/** Chapitres du plan (ordre du plan) avec leurs titres — parties et étiquettes de l'examen. */
export function chapitresExamen(plan: PlanDocument): ChapitreExamen[] {
  return plan.chapitresSlugs.map((slug) => {
    const titre = findChapter(plan.levelSlug, slug)?.title ?? slug
    return { slug, titre, titreCourt: titreCourtChapitre(slug, titre) }
  })
}

/** Réglages d'examen lus et mis en forme pour les documents (`undefined` pour une évaluation). */
export function examenDuPlan(plan: PlanDocument): ExamenDocument | undefined {
  if (!estExamen(plan)) return undefined
  const e = plan.entete
  const { horaire, duree } = horaireExamen(e.heureDepart, e.dureeExamen)
  return {
    organisation: e.organisationExamen ?? 'chapitre',
    chapitres: chapitresExamen(plan),
    session: e.session?.trim() || sessionParDefaut(e.date),
    horaire,
    duree,
    consignesSupplementaires: lignesConsignes(e.consignesSupplementaires),
  }
}

/**
 * Items d'un document : ceux de la série, et pour un examen à total FIXÉ, les points de chaque
 * partie mis à l'échelle (`mettreAEchelle` : demi-points, somme exacte, jamais 0 pt). Les points
 * des critères suivent (`pointsCriteres` répartit `item.points` au prorata des poids du barème) :
 * copie, corrigé, grille et Word affichent donc tous les points mis à l'échelle. Une partie sans
 * total, au total illisible ou impossible (moins de 0,5 pt par question) garde ses points.
 */
export function itemsDuDocument(plan: PlanDocument, items: ItemEvaluation[]): ItemEvaluation[] {
  const examen = examenDuPlan(plan)
  const total = plan.entete.totalExamen
  if (!examen || !total || total.mode !== 'fixe') return items
  // Une question regroupée a), b), c) compte LIGNE par ligne (chaque ligne garde au moins 0,5 pt et
  // ses points propres ; le total du groupe est leur somme).
  const unites = (it: ItemEvaluation) => (it.groupe ? it.groupe.map((l) => l.item.points) : [it.points])
  const nouveaux = new Map<ItemEvaluation, number[]>()
  for (const partie of partiesDuDocument(examen, items)) {
    const voulu = total.parPartie[partie.cle]
    if (typeof voulu !== 'number' || !(voulu > 0)) continue
    const points = mettreAEchelle(partie.questions.flatMap((q) => unites(q.element)), voulu)
    if (!points) continue
    let k = 0
    for (const q of partie.questions) {
      const n = unites(q.element).length
      nouveaux.set(q.element, points.slice(k, k + n))
      k += n
    }
  }
  return items.map((it) => {
    const pts = nouveaux.get(it)
    if (!pts) return it
    if (!it.groupe) return { ...it, points: pts[0] }
    const lignes = it.groupe.map((l, i) => ({ ...l, item: { ...l.item, points: pts[i] } }))
    return assemblerGroupe(it, it.section.enteteFragments ?? [], lignes, it.section.enteteHtml)
  })
}

function enteteSerie(entete: EnTeteEvaluation, serieLettre: string, examen?: ExamenDocument): EnteteEvaluationSerie {
  return {
    ...(examen ? { examen } : {}),
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
    afficherDuree: entete.afficherDuree,
    surtitre: entete.surtitre,
    titreChapitre: entete.titreChapitre,
    urlChapitre: entete.urlChapitre,
    deuxColonnes: entete.deuxColonnes,
    // Évaluation blanche (parcours élève) seulement : absent sinon, en-tête identique à avant.
    ...(entete.blanche && entete.mode !== 'exercice' && !examen ? { blanche: entete.blanche } : {}),
    // Comptes professeurs : absent (pas de session / plan d'avant) = cartouche historique.
    ...(entete.cartouche ? { cartouche: entete.cartouche } : {}),
    // Évaluation (ni feuille d'exercices, ni examen — qui les porte dans `examen`) : consignes
    // supplémentaires seulement s'il y en a, sinon en-tête identique à avant.
    ...(!examen && entete.mode !== 'exercice' && lignesConsignes(entete.consignesSupplementaires).length > 0
      ? { consignesSupplementaires: lignesConsignes(entete.consignesSupplementaires) }
      : {}),
  }
}

/**
 * Annexes jointes à la copie, à l'aménagée et à la feuille d'exercices (mécanisme générique,
 * `AnnexeDocument`) — chacune UNE fois par document :
 * - formulaire du chapitre, si la case « Joindre le formulaire » est cochée (`entete.joindreFormulaire`) :
 *   une annexe par chapitre du plan qui a un formulaire, dans l'ordre du plan ;
 * - (prévu, pas encore implémenté) table de la loi normale Φ, seulement si une question des `items`
 *   en a besoin : la tester ici sur les items et ajouter `annexeTableNormale()` (`annexesPapier.ts`).
 */
export function annexesDuDocument(plan: PlanDocument, _items: ItemEvaluation[]): AnnexeDocument[] {
  const annexes: AnnexeDocument[] = []
  if (plan.entete.joindreFormulaire) {
    for (const slug of plan.chapitresSlugs) {
      const chapitre = findChapter(plan.levelSlug, slug)
      const annexe = chapitre ? annexeFormulaire(chapitre) : null
      if (annexe) annexes.push(annexe)
    }
  }
  return annexes
}

export async function genererDocumentsDepuisPlan(plan: PlanDocument): Promise<DocumentGenere[]> {
  const documents: DocumentGenere[] = []
  const exercice = plan.entete.mode === 'exercice'
  const examen = examenDuPlan(plan)
  for (const serie of plan.series) {
    const items = itemsDuDocument(plan, await itemsDepuisSerie(serie))
    const entete = enteteSerie(plan.entete, serie.lettre, examen)
    const annexes = annexesDuDocument(plan, items)
    if (exercice) {
      documents.push({ type: 'feuille', libelle: 'Feuille d’exercices (énoncé, je vérifie, corrigé)', suffixe: 'feuille', blob: await genererFeuilleExercicesComplete(entete, items, annexes) })
      if (plan.entete.versionAmenagee) documents.push({ type: 'amenagee', libelle: 'Version aménagée', suffixe: 'amenagee', blob: await genererVersionAmenagee(entete, items, annexes) })
      continue
    }
    if (entete.blanche) {
      // Évaluation blanche (parcours élève) : UN document (corrigé détaillé à la fin), plus
      // l'aménagée si demandée ; ni corrigé séparé ni grille.
      documents.push({ type: 'blanche', libelle: 'Évaluation blanche (corrigé détaillé à la fin)', suffixe: 'evaluation-blanche', blob: await genererEvaluationBlanche(entete, items, annexes) })
      if (plan.entete.versionAmenagee) documents.push({ type: 'amenagee', libelle: 'Version aménagée', suffixe: 'evaluation-blanche-amenagee', blob: await genererVersionAmenagee(entete, items, annexes) })
      continue
    }
    const { enonce, corrige, grille } = await genererEvaluationHtml(entete, items, annexes)
    const s = `serie-${serie.lettre}`
    documents.push({ type: 'enonce', serieLettre: serie.lettre, libelle: `Série ${serie.lettre} — copie de l’élève`, suffixe: `${s}-enonce`, blob: enonce })
    documents.push({ type: 'corrige', serieLettre: serie.lettre, libelle: `Série ${serie.lettre} — corrigé`, suffixe: `${s}-corrige`, blob: corrige })
    documents.push({ type: 'grille', serieLettre: serie.lettre, libelle: `Série ${serie.lettre} — grille de correction`, suffixe: `${s}-grille`, blob: grille })
    if (plan.entete.versionAmenagee) documents.push({ type: 'amenagee', serieLettre: serie.lettre, libelle: `Série ${serie.lettre} — version aménagée`, suffixe: `${s}-amenagee`, blob: await genererVersionAmenagee(entete, items, annexes) })
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

export type TypeDocx = 'copie' | 'corrige' | 'grille'

/** Copie, corrigé ou grille Word (.docx) d'une série d'évaluation — module chargé à la demande
 * (`docx` est lourd). Mêmes items que les documents HTML (même plan, mêmes graines). */
export async function genererDocxDepuisPlan(plan: PlanDocument, lettre: string, type: TypeDocx): Promise<Blob | null> {
  const serie = plan.series.find((s) => s.lettre === lettre)
  if (!serie) return null
  const docx = await import('../entrainement/export/evaluationDocx')
  const generer = type === 'copie' ? docx.genererCopieEvaluationDocx : type === 'corrige' ? docx.genererCorrigeEvaluationDocx : docx.genererGrilleEvaluationDocx
  return generer(enteteSerie(plan.entete, lettre, examenDuPlan(plan)), itemsDuDocument(plan, await itemsDepuisSerie(serie)))
}

/** Copie Word (.docx) d'une série d'évaluation. */
export function genererCopieDocxDepuisPlan(plan: PlanDocument, lettre: string): Promise<Blob | null> {
  return genererDocxDepuisPlan(plan, lettre, 'copie')
}
