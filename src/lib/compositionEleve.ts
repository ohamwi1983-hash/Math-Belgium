import type { ChapterContent } from '../content/types'
import { LEVELS } from '../content/chaptersIndex'
import { EVALUATION_ADAPTER_REGISTRY } from './evaluationAdapterRegistry'
import {
  HEURES_SEMAINE_DEFAUT,
  NIVEAU_NUMERO,
  catalogueVariantesExercice,
  construireItemsPayload,
  deriveQuestionsComprehension,
  deriveQuestionsFormules,
  deriveQuestionsOuvertes,
  generateursPourSection,
  resoudreNiveauHeures,
  themesPourSection,
  varianteExigeCalculatrice,
  type EnTeteEvaluation,
  type IdGenerateurPilote,
  type LigneSelection,
  type Processus,
  type QuestionOuverte,
} from './evaluationPayload'
import { construirePlan, elementsAPlat, empreinteSection, questionsDeSerie, respecteContrainte, tirerInstance, type Adaptateur, type ContrainteTirage, type ElementPlan, type PlanDocument } from './evaluationLocal'
import { chapitreAUneBanqueVraiFauxLocale, chargerThemeVraiFaux } from './banquesVraiFaux'
import { pointsDemonstration, pointsDepuisDuree } from './pointsAutomatiques'
import { CATEGORIES_NIVEAU, LIBELLE_CATEGORIE, categorieDuNiveau, niveauEtDuree, rangCategorie, type CategorieNiveau } from '../entrainement/export/niveauDifficulte'
import { aleatoireDepuisGraine, fractionsRepartition, partageEgal, partsAuProrata, pourcentsEntiers, texteParts, tirerPartsHasard, type RepartitionPourcents } from './repartitionProcessus'
import { mettreAEchelle, mettreAEchelleParGroupes } from '../entrainement/export/examen'
import { tirerGraine } from '../entrainement/export/codeExercice'
import { DEPASSEMENT_MAX } from '../components/admin/conception/composer'

/**
 * Parcours ÉLÈVE — composition automatique d'une feuille d'exercices ou d'une ÉVALUATION BLANCHE
 * (assistant « Me préparer à l'évaluation », `components/eleve/AssistantEleve.tsx`).
 *
 * L'élève choisit des notions (sections du chapitre qui ont au moins un générateur), les compétences
 * annoncées (Connaître / Appliquer / Transférer, une à trois), une durée (20 / 30 / 50 min) et un ou
 * plusieurs niveaux (catégories de `niveauDifficulte.ts` : très facile 1, facile 2, moyen 3, difficile
 * 4, très difficile 5–7 ; par défaut tous, niveaux mélangés). Le temps (et les points de l'évaluation
 * blanche) est partagé à parts égales entre les compétences cochées (`partageEgal`, décision de
 * l'utilisateur du 22/11/2026 : la répartition 25 / 50 / 25 ne vaut que pour l'examen) ; jamais une
 * compétence non cochée. Ce module en fait une SÉLECTION du panneau (`LigneSelection[]`, une ligne par
 * générateur, `parVariante`) puis passe par le pipeline EXISTANT — `construireItemsPayload` →
 * `construirePlan` → `genererDocumentsDepuisPlan` — jamais un second moteur. Seules retouches du
 * plan figé : les graines d'un exercice dont le niveau réel sort des niveaux demandés (ou qui ferait
 * dépasser la durée) sont retirées (mêmes fonctions : `tirerInstance`, `niveauEtDuree`,
 * `respecteContrainte`), et les points indicatifs sont posés (durée → `pointsDepuisDuree`, total
 * ramené à 20 par `mettreAEchelle`).
 *
 * FEUILLE d'exercices (décision de l'utilisateur du 22/11/2026 : « pas de limite de temps ou de
 * longueur […] rien à voir avec une évaluation ») : ni durée ni points ni parts de temps — un NOMBRE
 * d'exercices, global (1 à 30, réparti à parts égales entre compétences puis notions cochées) ou
 * choisi type par type (`ReglagesEleve.exercices`, `composerFeuille`) ; la retouche n'y corrige que le
 * niveau réel. Connaître y reprend aussi les questions ouvertes du panneau du professeur (décision du
 * 22/11/2026) : « Formule » et compréhension par notion, démonstrations cochées par l'élève — sans
 * niveau, une question = un exercice, jamais répétée dans la feuille.
 * ÉVALUATION BLANCHE : au plus `MAX_VRAI_FAUX_BLANCHE` (5) affirmations vrai/faux au total.
 *
 * CALCULATRICE (décision de l'utilisateur, 23/11/2026 : « le choix avec / sans calculatrice, comme chez
 * le professeur ») : case « Avec calculatrice » de l'assistant, décochée par défaut. Décochée
 * (`ReglagesEleve.calculatrice: 'interdite'`) = comme une évaluation « calculatrice interdite » du
 * professeur : les variantes qui exigent toujours la calculatrice (`exigeCalculatrice`) ne sont pas
 * candidates, les autres ne tirent que des instances sans calculatrice (`respecteContrainte`, mêmes
 * paliers de repli que le moteur), niveaux et durées estimés sur ces instances-là. Cochée
 * (`'autorisee'`) = EXACTEMENT la règle du professeur (décision de l'utilisateur, 24/11/2026 : « la
 * valeur de cos(210°) […] n'a de sens que si elle ne se fait pas à la calculatrice ») : seulement des
 * instances qui ne sont pas profilées `calcul: 'exacte'` (générateurs sans `calcul` compris, comme
 * `respecteContrainte`) ; une variante dont aucun tirage n'en donne (`sansCalculatrice`) n'est pas
 * candidate. Absente : aucune contrainte (composition d'avant, outils de non-régression).
 *
 * Aucune donnée d'élève : rien n'est enregistré (ni coffre, ni historique anti-doublon — l'historique
 * est seulement LU par `construirePlan`).
 */

export type TypeEleve = 'feuille' | 'blanche'

export const DUREES_ELEVE = [20, 30, 50] as const
export const TOTAL_POINTS_BLANCHE = 20
/** Dépassement toléré de la durée visée (décision : jamais plus de ~10 %). */
export const TOLERANCE_DEPASSEMENT = 0.1
/** Compétences proposées à l'élève (les processus, sans le mot). */
export const COMPETENCES_ELEVE: readonly { id: Processus; libelle: string }[] = [
  { id: 1, libelle: 'Connaître' },
  { id: 2, libelle: 'Appliquer' },
  { id: 3, libelle: 'Transférer' },
]
export const LIBELLE_COMPETENCE: Record<Processus, string> = { 1: 'Connaître', 2: 'Appliquer', 3: 'Transférer' }

/** Durée remplie en dessous de laquelle des niveaux voisins complètent (part de la durée visée). */
const SEUIL_ELARGIR = 0.85
/** Vrai/faux : 2 min et 1 pt par affirmation (`itemVraiFauxRegroupe`), niveau 2 (facile). */
const DUREE_VRAI_FAUX = 2
const NIVEAU_VRAI_FAUX = 2
/** Durée par défaut d'un exercice d'un générateur sans durée (ni critères ni constante). */
const DUREE_PAR_DEFAUT = 5
/** Questions ouvertes de la feuille : « Formule » 1 pt, « compréhension » 2 pts au panneau (durée
 * = 2 × points, comme `pointsDepuisDuree`) — seulement pour le total estimé, la feuille n'a ni durée
 * ni points. */
const DUREE_FORMULE = 2
const DUREE_COMPREHENSION = 4
/** Évaluation blanche (décision de l'utilisateur, 22/11/2026 : « pour la compétence connaître, limiter
 * le nombre de vrai ou faux générés à maximum 5 ») : au plus 5 affirmations au total, tous thèmes
 * confondus, quelles que soient la durée et la part de Connaître. La feuille d'exercices n'a pas ce
 * plafond (l'élève choisit son nombre). */
export const MAX_VRAI_FAUX_BLANCHE = 5

export interface ReglagesEleve {
  levelSlug: string
  chapitreSlug: string
  /** Sections retenues (ids) — toutes les notions si vide. */
  sections: string[]
  duree: number
  /** Niveaux cochés (au moins un) ; les cinq = niveaux mélangés, générateurs sans niveau compris. */
  niveaux: CategorieNiveau[]
  /** Compétences cochées (au moins une) : jamais un exercice d'une autre compétence. */
  competences: Processus[]
  type: TypeEleve
  amenagee: boolean
  /** ÉVALUATION BLANCHE seulement (décision de l'utilisateur, 22/11/2026, choix c) : parts du temps et
   * des points entre les compétences cochées — tirées AU HASARD (`graine` : mêmes réglages, même
   * graine → mêmes parts et même composition) ou RÉGLÉES par l'élève (`pourcents`, `null` = parts
   * égales). Absent (feuille d'exercices) : parts égales, composition d'avant inchangée. */
  parts?: PartsEleve
  /** Démonstrations cochées par l'élève (clés `cleDemonstration`) — évaluation blanche : celles que le
   * professeur a ANNONCÉES ; feuille : celles qu'il veut travailler. Seules celles-là peuvent être
   * tirées ; aucune → aucune démonstration. */
  demonstrations?: string[]
  /** FEUILLE d'exercices (décision de l'utilisateur, 22/11/2026 : « pas de limite de temps ou de
   * longueur […] rien à voir avec une évaluation ») : un NOMBRE d'exercices au lieu d'une durée —
   * global, réparti à parts égales (`composerFeuille`), ou choisi type par type. `duree` est alors
   * ignorée. Absent : composition d'avant (durée), inchangée. */
  exercices?: ExercicesFeuille
  /** Case « Avec calculatrice » (décisions de l'utilisateur, 23 et 24/11/2026) : `'interdite'` (case
   * décochée, défaut de l'assistant) = variantes `exigeCalculatrice` exclues et instances sans
   * calculatrice seulement ; `'autorisee'` (cochée) = règle du professeur : variantes
   * `sansCalculatrice` exclues, jamais une instance `calcul: 'exacte'` (feuille ET blanche, mêmes
   * paliers de repli) ; absent = aucune contrainte de calcul (composition d'avant). Imprimée sur
   * l'évaluation blanche (encadré « Mon score ») ; la feuille n'imprime rien. */
  calculatrice?: CalculatriceEleve
}

/** Choix de la calculatrice de l'élève (voir `ReglagesEleve.calculatrice`). */
export type CalculatriceEleve = 'interdite' | 'autorisee'

/** Nombre d'exercices de la feuille : global (réparti entre les notions et compétences cochées) ou
 * « à la carte » (`parType` : clé du candidat → nombre, 0 à `capaciteType`). */
export type ExercicesFeuille = { mode: 'global'; nombre: number } | { mode: 'carte'; parType: Record<string, number> }

/** Bornes du nombre global d'exercices de la feuille, et sa valeur par défaut. */
export const NOMBRE_FEUILLE_MIN = 1
export const NOMBRE_FEUILLE_MAX = 30
export const NOMBRE_FEUILLE_DEFAUT = 10
/** Au plus ce nombre d'exercices d'un même type (variante, ou affirmations d'un thème vrai/faux). */
export const MAX_PAR_TYPE = 5

export type PartsEleve = { mode: 'hasard'; graine: number } | { mode: 'reglee'; pourcents: RepartitionPourcents | null; graine?: number }

/** Les cinq niveaux cochés : niveaux mélangés (l'ancienne « vraie évaluation »). */
export function tousLesNiveaux(niveaux: readonly CategorieNiveau[]): boolean {
  return CATEGORIES_NIVEAU.every((c) => niveaux.includes(c))
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

/** Nom d'un générateur pour l'élève : son libellé du panneau sans l'identifiant final « (gen12) ». */
function titreGenerateur(label: string): string {
  return label.replace(/\s*\(\d*gen\d+\)\s*$/, '').trim() || label
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
  /** Nom affiché dans la liste « exercice par exercice » de la feuille (générateur ou thème). */
  titre?: string
  /** Variante (absente : variante unique / tirage aléatoire). */
  variante?: string
  /** Toutes ses instances exigent la calculatrice (`calculatriceIndispensable` du générateur, ou de
   * cette variante) : jamais candidate quand la calculatrice est interdite (case décochée). */
  exigeCalculatrice?: boolean
  /** Liste « calculatrice autorisée » seulement : aucun tirage de la variante ne demande la
   * calculatrice (toutes ses instances respectant la contrainte de l'élève sont `calcul: 'exacte'`) —
   * jamais candidate quand la case est cochée (règle du professeur). */
  sansCalculatrice?: boolean
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
/** Démonstration du cours (question « démonstration » de Connaître) : tirée seulement si l'élève l'a
 * cochée (évaluation blanche : annoncée par son professeur ; feuille : qu'il veut travailler). Sans
 * niveau (admise à tous les niveaux cochés). */
export interface CandidatDemonstration extends CandidatBase {
  sorte: 'demonstration'
  /** `QuestionOuverte.id` dans sa section (choix explicite de la ligne « demonstration »). */
  questionId: string
  /** Étapes du corrigé (points : `pointsDemonstration`). */
  etapes: number
  /** Énoncé imprimé (deux démonstrations d'un même résultat ont le même : une seule par document). */
  enonceCle: string
}
/** FEUILLE d'exercices (décision de l'utilisateur, 22/11/2026) : questions ouvertes « Formule » et
 * « compréhension » d'une notion — mêmes banques que les lignes du panneau du professeur
 * (`deriveQuestionsFormules`, `deriveQuestionsComprehension`), tirées par `construireItemsPayload`.
 * Sans niveau : toujours admises, quels que soient les niveaux cochés. */
export interface CandidatOuverte extends CandidatBase {
  sorte: 'formule' | 'comprehension'
  /** Questions DISTINCTES de la banque de la notion (énoncés imprimés différents). */
  disponibles: number
}
export type Candidat = CandidatExercice | CandidatVraiFaux | CandidatDemonstration | CandidatOuverte

/** Question sans niveau (démonstration, formule, compréhension) : admise à tous les niveaux cochés,
 * aucun badge de niveau. */
export function estSansNiveau(c: Candidat): c is CandidatDemonstration | CandidatOuverte {
  return c.sorte === 'demonstration' || c.sorte === 'formule' || c.sorte === 'comprehension'
}

/** Nombre d'énoncés imprimés distincts d'une banque (même règle que `sansDoublonsEnonce` du panneau). */
function enoncesDistincts(banque: QuestionOuverte[]): number {
  return new Set(banque.map((q) => JSON.stringify(q.enonce))).size
}

/** Durée d'une démonstration : celle d'un exercice qui vaudrait ses points (points = durée ÷ 2, comme
 * `pointsDepuisDuree`) — de 4 à 12 min selon la longueur du corrigé. */
export function dureeDemonstration(etapes: number): number {
  return 2 * pointsDemonstration(etapes)
}

export interface DemonstrationEleve {
  cle: string
  sectionId: string
  questionId: string
  /** Titre du bloc (RichText) — libellé de la case. */
  titre: string
  /** Énoncé (RichText). */
  apercu: string
  etapes: number
}

/** Clé stable d'une démonstration dans un chapitre (les ids ne sont uniques que par section). */
export function cleDemonstration(sectionId: string, questionId: string): string {
  return `${sectionId}|${questionId}`
}

/** Démonstrations du chapitre (toutes ses sections), titres existants des blocs « Démonstration — … ». */
export function demonstrationsDuChapitre(chapter: ChapterContent): DemonstrationEleve[] {
  return chapter.sections.flatMap((s) =>
    deriveQuestionsOuvertes(chapter.slug, s)
      .filter((q): q is QuestionOuverte & { id: string } => !!q.id)
      .map((q) => ({ cle: cleDemonstration(s.id, q.id), sectionId: s.id, questionId: q.id, titre: q.titre ?? 'Démonstration', apercu: q.apercu ?? '', etapes: q.corrige.length })),
  )
}

const TIRAGES_ESTIMATION = 8
const ESSAIS_FILTRE = 400
const BUDGET_FILTRE_MS = 60

/** Contrainte de tirage de l'élève — celle que `construirePlan` impose au même plan :
 * - évaluation blanche : exercice COMPLET (tous les paramètres présents, aucun cas particulier), plus
 *   la calculatrice choisie (interdite : jamais `calcul: 'calculatrice'` ; autorisée : jamais
 *   `calcul: 'exacte'`) ;
 * - feuille : seulement la calculatrice choisie (`cas: 'libre'` : toute la variété sinon).
 * Calculatrice absente : feuille sans contrainte, blanche « complet » seul. `null` : aucune contrainte. */
function contrainteEleve(adaptateur: Adaptateur, type: TypeEleve, calculatrice?: CalculatriceEleve): ContrainteTirage | null {
  if (!adaptateur.profilInstance) return null
  const idsParametres = (adaptateur.parametresAuChoix ?? []).map((p) => p.id)
  if (type === 'blanche') return { cas: 'complet', idsParametres, parametresExclus: adaptateur.parametresAuChoix ? [] : null, ...(calculatrice ? { calculatrice } : {}) }
  return calculatrice ? { cas: 'libre', idsParametres, parametresExclus: null, calculatrice } : null
}

function respecte(adaptateur: Adaptateur, contrainte: ContrainteTirage | null, instance: never): boolean {
  if (!contrainte || !adaptateur.profilInstance) return true
  try {
    // Calcul vérifié (sans effet quand la contrainte ne porte pas `calculatrice`).
    return respecteContrainte(adaptateur.profilInstance(instance), contrainte, true)
  } catch {
    return false
  }
}

/** La variante exige-t-elle toujours la calculatrice (générateur `calculatriceIndispensable: true`,
 * ou variante de sa liste — groupe « à verdict » : tous ses membres) ? */
export function exigeCalculatrice(generatorId: string, varianteId: string): boolean {
  return EVALUATION_ADAPTER_REGISTRY[generatorId]?.calculatriceIndispensable === true || varianteExigeCalculatrice(generatorId, varianteId)
}

/** Recherche bornée d'un tirage qui respecte la contrainte (essais, puis budget de temps). */
function trouverTirage(adaptateur: Adaptateur, varianteId: string, contrainte: ContrainteTirage | null, essais: number, budgetMs: number): boolean {
  const fin = Date.now() + budgetMs
  for (let essai = 0; essai < essais && (essai < 50 || Date.now() < fin); essai++) {
    let instance: never
    try {
      instance = tirerInstance(adaptateur, varianteId, tirerGraine())
    } catch {
      return false
    }
    if (respecte(adaptateur, contrainte, instance)) return true
  }
  return false
}

const ESSAIS_CLASSEMENT = 4000
const BUDGET_CLASSEMENT_MS = 150
const cacheSansCalculatrice = new Map<string, boolean>()

/** Calculatrice AUTORISÉE (case cochée, règle du professeur) : la variante n'a-t-elle aucun tirage qui
 * la demande — aucune instance respectant la contrainte de l'élève (exercice complet pour la blanche)
 * qui ne soit pas `calcul: 'exacte'` (4 000 essais / 150 ms au plus, en cache) ? Sans profil
 * (`profilInstance` absent : aucune notion de calcul) ou variante qui exige la calculatrice : non. */
export function varianteSansCalculatrice(generatorId: string, varianteId: string, type: TypeEleve): boolean {
  const adaptateur = EVALUATION_ADAPTER_REGISTRY[generatorId] as Adaptateur | undefined
  if (!adaptateur?.profilInstance || exigeCalculatrice(generatorId, varianteId)) return false
  const cle = `${type}|${generatorId}|${varianteId}`
  const connu = cacheSansCalculatrice.get(cle)
  if (connu !== undefined) return connu
  const sans = !trouverTirage(adaptateur, varianteId, contrainteEleve(adaptateur, type, 'autorisee'), ESSAIS_CLASSEMENT, BUDGET_CLASSEMENT_MS)
  cacheSansCalculatrice.set(cle, sans)
  return sans
}

/** Variantes d'exercice d'un chapitre (toutes ses notions), comme les candidats. */
function variantesDuChapitre(chapter: ChapterContent, type: TypeEleve): { sectionId: string; generatorId: IdGenerateurPilote; varianteId: string; processus: Processus; titre: string; variante?: string }[] {
  const mode = type === 'blanche' ? 'evaluation' : 'exercice'
  const taches: { sectionId: string; generatorId: IdGenerateurPilote; varianteId: string; processus: Processus; titre: string; variante?: string }[] = []
  for (const notion of notionsDuChapitre(chapter)) {
    for (const g of generateursPourSection(chapter.slug, notion.sectionId)) {
      if (!(g.generatorId in EVALUATION_ADAPTER_REGISTRY)) continue
      const catalogue = catalogueVariantesExercice(g.generatorId, mode)
      for (const v of catalogue)
        taches.push({ sectionId: notion.sectionId, generatorId: g.generatorId, varianteId: v.id, processus: g.processus ?? 2, titre: titreGenerateur(g.label), ...(catalogue.length > 1 && v.label ? { variante: v.label } : {}) })
    }
  }
  return taches
}

const cacheCasCalculatrice = new Map<string, Promise<boolean>>()

/** Le chapitre a-t-il au moins un exercice possible « avec calculatrice » (règle du professeur) ? Non :
 * l'assistant désactive la case (« Aucun exercice de ce chapitre ne demande la calculatrice »). S'arrête
 * à la première variante qui convient ; une variante à la fois, en rendant la main ; en cache. */
export function chapitreAvecCalculatrice(chapter: ChapterContent, type: TypeEleve): Promise<boolean> {
  const cle = `${type}|${chapter.levelSlug}|${chapter.slug}`
  let promesse = cacheCasCalculatrice.get(cle)
  if (!promesse) {
    promesse = (async () => {
      for (const t of variantesDuChapitre(chapter, type)) {
        await pause()
        if (!varianteSansCalculatrice(t.generatorId, t.varianteId, type)) return true
      }
      return false
    })()
    cacheCasCalculatrice.set(cle, promesse)
  }
  return promesse
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

/** Niveaux et durée moyenne d'une variante sur quelques tirages (contrainte de l'élève respectée :
 * exercice complet pour une évaluation blanche, calculatrice interdite ou autorisée), en cache. `null` :
 * aucun tirage possible. Aucun tirage qui respecte la calculatrice : profil sans contrainte de calcul
 * (palier de repli du moteur). */
export function profilVariante(generatorId: string, varianteId: string, type: TypeEleve, calculatrice?: CalculatriceEleve): { niveaux: number[]; duree: number } | null {
  const adaptateur = EVALUATION_ADAPTER_REGISTRY[generatorId] as Adaptateur | undefined
  if (!adaptateur) return null
  // Sans profil (aucune notion de calcul) ou variante qui exige la calculatrice (toutes ses instances
  // la demandent : « autorisée » ne change rien, « interdite » l'écarte) : profil d'avant.
  const calcul = calculatrice && adaptateur.profilInstance && !exigeCalculatrice(generatorId, varianteId) ? calculatrice : undefined
  const cle = `${type}|${calcul ? `${calcul}|` : ''}${generatorId}|${varianteId}`
  if (cacheProfils.has(cle)) return cacheProfils.get(cle)!
  const contrainte = contrainteEleve(adaptateur, type, calcul)
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
  // Aucun tirage qui respecte la calculatrice trouvé : profil sans contrainte de calcul.
  if (retenues.length === 0 && calcul) {
    const repli = profilVariante(generatorId, varianteId, type)
    cacheProfils.set(cle, repli)
    return repli
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
 * la main au navigateur entre deux (l'interface ne gèle pas), mis en cache par chapitre, type et
 * calculatrice. Calculatrice interdite : niveaux et durées estimés sur les instances sans calculatrice ;
 * les variantes qui l'exigent restent dans la liste (`exigeCalculatrice`, profil sans contrainte de
 * calcul) pour que l'assistant dise ce qu'elles offriraient — la composition les écarte. */
export function preparerCandidats(chapter: ChapterContent, type: TypeEleve, calculatrice?: CalculatriceEleve, progression?: (fait: number, total: number) => void): Promise<Candidat[]> {
  const cle = `${type}|${calculatrice ?? 'libre'}|${chapter.levelSlug}|${chapter.slug}`
  let promesse = cacheCandidats.get(cle)
  if (!promesse) {
    promesse = calculerCandidats(chapter, type, calculatrice, progression)
    cacheCandidats.set(cle, promesse)
    promesse.catch(() => cacheCandidats.delete(cle))
  }
  return promesse
}

async function calculerCandidats(chapter: ChapterContent, type: TypeEleve, calculatrice: CalculatriceEleve | undefined, progression?: (fait: number, total: number) => void): Promise<Candidat[]> {
  const taches = variantesDuChapitre(chapter, type)
  const candidats: Candidat[] = []
  let fait = 0
  for (const t of taches) {
    await pause()
    const profil = profilVariante(t.generatorId, t.varianteId, type, calculatrice)
    fait++
    progression?.(fait, taches.length)
    if (!profil) continue
    const exige = exigeCalculatrice(t.generatorId, t.varianteId)
    const sans = calculatrice === 'autorisee' && varianteSansCalculatrice(t.generatorId, t.varianteId, type)
    candidats.push({
      sorte: 'exercice',
      cle: `${t.sectionId}|${t.generatorId}|${t.varianteId}`,
      ...t,
      duree: profil.duree,
      niveaux: profil.niveaux,
      ...(exige ? { exigeCalculatrice: true } : {}),
      ...(sans ? { sansCalculatrice: true } : {}),
    })
  }
  if (chapitreAUneBanqueVraiFauxLocale(chapter.slug)) {
    for (const notion of notionsDuChapitre(chapter)) {
      for (const theme of themesPourSection(chapter.slug, notion.sectionId)) {
        const banque = await chargerThemeVraiFaux(chapter.slug, theme.quizTheme).catch(() => null)
        if (!banque || banque.length === 0) continue
        candidats.push({
          sorte: 'vraiFaux',
          cle: `${notion.sectionId}|vf|${theme.quizTheme}`,
          sectionId: notion.sectionId,
          processus: 1,
          theme: theme.quizTheme,
          disponibles: banque.length,
          duree: DUREE_VRAI_FAUX,
          niveaux: [NIVEAU_VRAI_FAUX],
          titre: theme.label ? `Vrai ou faux — ${theme.label}` : 'Vrai ou faux',
        })
      }
    }
  }
  // Démonstrations du cours (tirées seulement si l'élève les a cochées) : évaluation blanche ET feuille.
  const enonces = new Map(chapter.sections.flatMap((s) => deriveQuestionsOuvertes(chapter.slug, s).map((q) => [cleDemonstration(s.id, q.id ?? ''), JSON.stringify(q.enonce)] as const)))
  for (const d of demonstrationsDuChapitre(chapter)) {
    candidats.push({
      sorte: 'demonstration',
      cle: `${d.sectionId}|demo|${d.questionId}`,
      sectionId: d.sectionId,
      processus: 1,
      questionId: d.questionId,
      etapes: d.etapes,
      enonceCle: enonces.get(d.cle) ?? d.cle,
      duree: dureeDemonstration(d.etapes),
      niveaux: [],
      titre: `Démonstration — ${d.titre}`,
    })
  }
  // Feuille d'exercices : « Formule » et questions de compréhension, par notion (section) qui en a.
  if (type === 'feuille') {
    for (const s of chapter.sections) {
      const formules = enoncesDistincts(deriveQuestionsFormules(chapter, s.id))
      if (formules > 0) candidats.push({ sorte: 'formule', cle: `${s.id}|formule`, sectionId: s.id, processus: 1, disponibles: formules, duree: DUREE_FORMULE, niveaux: [], titre: `Formule — ${s.title}` })
      const comprehension = enoncesDistincts(deriveQuestionsComprehension(chapter.slug, s.id))
      if (comprehension > 0)
        candidats.push({ sorte: 'comprehension', cle: `${s.id}|comprehension`, sectionId: s.id, processus: 1, disponibles: comprehension, duree: DUREE_COMPREHENSION, niveaux: [], titre: `Question de compréhension — ${s.title}` })
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
  /** Les niveaux cochés ne suffisaient pas : des exercices d'un niveau voisin complètent. */
  elargi: boolean
  /** Niveaux admis à l'impression : les cochés, plus les voisins réellement utilisés. */
  niveauxAdmis: CategorieNiveau[]
  /** Évaluation blanche (`ReglagesEleve.parts`) : parts visées (fractions, somme 1) entre les
   * compétences cochées ayant des exercices — tirées au hasard ou réglées. Absent : parts égales. */
  parts?: Record<Processus, number>
  /** Feuille au nombre d'exercices (`ReglagesEleve.exercices`) : nombre demandé (global : le nombre ;
   * à la carte : la somme des compteurs) et nombre au plus possible avec ces choix (somme des
   * `capaciteType` des types retenus). */
  demandes?: number
  disponibles?: number
}

/** Part des tirages d'estimation d'un candidat dont la catégorie est dans `categories` (générateur
 * sans niveau : 0). */
export function partDansCategories(c: Candidat, categories: ReadonlySet<CategorieNiveau>): number {
  if (c.niveaux.length === 0) return 0
  return c.niveaux.filter((n) => categories.has(categorieDuNiveau(n))).length / c.niveaux.length
}

/** Un candidat est retenu pour les niveaux cochés si au moins la moitié de ses tirages d'estimation y
 * tombent ; un générateur sans niveau seulement quand les cinq niveaux sont cochés. */
export function candidatAuxNiveaux(c: Candidat, categories: ReadonlySet<CategorieNiveau>, tous: boolean): boolean {
  // Démonstration cochée, formule, compréhension : sans niveau, admises quels que soient les niveaux.
  if (estSansNiveau(c)) return true
  return c.niveaux.length === 0 ? tous : partDansCategories(c, categories) >= 0.5
}

/** Un candidat permis par le choix de la calculatrice : jamais une variante qui l'exige quand elle est
 * interdite, ni une variante sans aucun cas « calculatrice » quand elle est autorisée. */
export function permisParCalculatrice(c: Candidat, calculatrice?: CalculatriceEleve): boolean {
  if (calculatrice === 'interdite') return !c.exigeCalculatrice
  if (calculatrice === 'autorisee') return !c.sansCalculatrice
  return true
}

/** Candidats des réglages : notions retenues, compétences cochées (jamais une autre), seulement les
 * démonstrations cochées, et aucune variante écartée par le choix de la calculatrice. */
function candidatsDesReglages(candidatsChapitre: Candidat[], reglages: Pick<ReglagesEleve, 'sections' | 'competences' | 'demonstrations' | 'calculatrice'>): Candidat[] {
  const sections = new Set(reglages.sections)
  const competences = new Set(reglages.competences)
  const demos = new Set(reglages.demonstrations ?? [])
  return candidatsChapitre.filter(
    (c) =>
      (sections.size === 0 || sections.has(c.sectionId)) &&
      competences.has(c.processus) &&
      (c.sorte !== 'demonstration' || demos.has(cleDemonstration(c.sectionId, c.questionId))) &&
      permisParCalculatrice(c, reglages.calculatrice),
  )
}

/** Distance (en pas de l'échelle) d'une catégorie aux catégories cochées. */
function distanceCategorie(c: CategorieNiveau, cochees: ReadonlySet<CategorieNiveau>): number {
  const r = rangCategorie(c)
  return Math.min(...[...cochees].map((k) => Math.abs(rangCategorie(k) - r)))
}

interface EtatComposition {
  unites: Map<string, UniteComposee>
  parSection: Map<string, number>
  parGenerateur: Map<string, number>
  /** Durée estimée déjà prise par compétence. */
  parProcessus: Map<Processus, number>
  duree: number
  dureeVraiFaux: number
}

function nombreDe(etat: EtatComposition, c: Candidat): number {
  return etat.unites.get(c.cle)?.nombre ?? 0
}

function cleGenerateur(c: Candidat): string {
  return c.sorte === 'exercice' ? c.generatorId : c.sorte === 'vraiFaux' ? `vf:${c.theme}` : c.sorte
}

/** Une démonstration au plus une fois, et jamais deux démonstrations au même énoncé imprimé. */
function demonstrationPossible(etat: EtatComposition, c: CandidatDemonstration): boolean {
  if (nombreDe(etat, c) > 0) return false
  return ![...etat.unites.values()].some((u) => u.candidat.sorte === 'demonstration' && u.candidat.enonceCle === c.enonceCle)
}

function ajouter(etat: EtatComposition, c: Candidat): void {
  const u = etat.unites.get(c.cle)
  if (u) u.nombre++
  else etat.unites.set(c.cle, { candidat: c, nombre: 1 })
  etat.parSection.set(c.sectionId, (etat.parSection.get(c.sectionId) ?? 0) + 1)
  const g = cleGenerateur(c)
  etat.parGenerateur.set(g, (etat.parGenerateur.get(g) ?? 0) + 1)
  etat.duree += c.duree
  etat.parProcessus.set(c.processus, (etat.parProcessus.get(c.processus) ?? 0) + c.duree)
  if (c.sorte === 'vraiFaux') etat.dureeVraiFaux += c.duree
}

interface Bassin {
  candidats: Candidat[]
  /** Priorité (0 = niveaux cochés, d = niveaux voisins à d pas de l'échelle). */
  rang: Map<string, number>
}

/**
 * Remplit `etat` avec des candidats du bassin jusqu'à `budget` minutes de plus (sans dépasser
 * `plafond` au total). Variété : la notion la moins servie d'abord, puis le générateur le moins servi,
 * jamais deux fois la même variante tant qu'une autre convient (au plus deux fois ensuite).
 */
function remplir(etat: EtatComposition, bassin: Bassin, budget: number, plafond: number, plafondVraiFaux: number, aleatoire: () => number, admission?: (c: Candidat) => boolean): void {
  const objectif = etat.duree + budget
  for (let garde = 0; garde < 200; garde++) {
    const restant = objectif - etat.duree
    if (restant < 1.5) return
    const convient = (c: Candidat, maxRepetitions: number) => {
      if (etat.duree + c.duree > plafond + 1e-9) return false
      // Parts de l'évaluation blanche : règle de « Préparer l'évaluation » (`admisDansPart`) ; sinon
      // règle d'avant (parts égales).
      if (admission ? !admission(c) : c.duree > restant + Math.max(2, budget * 0.25)) return false
      if (c.sorte === 'vraiFaux') return nombreDe(etat, c) < c.disponibles && etat.dureeVraiFaux + c.duree <= plafondVraiFaux + 1e-9
      if (c.sorte === 'demonstration') return demonstrationPossible(etat, c)
      return nombreDe(etat, c) < maxRepetitions
    }
    let possibles = bassin.candidats.filter((c) => convient(c, 1))
    if (possibles.length === 0) possibles = bassin.candidats.filter((c) => convient(c, 2))
    if (possibles.length === 0) return
    const score = (c: Candidat) => {
      const g = cleGenerateur(c)
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

/**
 * Temps visé par compétence : parts ÉGALES entre les compétences COCHÉES (`partageEgal` ; une seule →
 * 100 %). Une compétence cochée sans exercice disponible (`presentes`) cède son temps aux autres
 * cochées présentes, à parts égales. Aucune cochée présente → rien. `bruts` : avant cette cession.
 */
export function budgetsParCompetence(cible: number, competences: readonly Processus[], presentes: readonly Processus[]): { budgets: Record<Processus, number>; bruts: Record<Processus, number> } {
  const cochees = ([1, 2, 3] as const).filter((p) => competences.includes(p))
  const egal = partageEgal(cochees)
  const bruts: Record<Processus, number> = { 1: 0, 2: 0, 3: 0 }
  for (const p of cochees) bruts[p] = cible * egal[p]
  const presents = cochees.filter((p) => presentes.includes(p))
  const budgets: Record<Processus, number> = { 1: 0, 2: 0, 3: 0 }
  if (presents.length > 0) {
    const part = partageEgal(presents)
    for (const p of presents) budgets[p] = cochees.length === 0 ? 0 : cible * part[p]
  }
  return { budgets, bruts }
}

/**
 * Parts visées de l'évaluation blanche (fractions, somme 1) entre les compétences cochées qui ont des
 * exercices aux niveaux cochés (`presentes` ; aucune → les cochées, que les niveaux voisins pourront
 * servir) : tirées au hasard parmi ELLES (jamais de part pour une compétence vide), ou réglées par
 * l'élève puis ramenées aux présentes au prorata (réglage `null` → parts égales).
 */
export function partsVisees(parts: PartsEleve, competences: readonly Processus[], presentes: readonly Processus[]): Record<Processus, number> {
  const cochees = ([1, 2, 3] as const).filter((p) => competences.includes(p))
  const servies = cochees.filter((p) => presentes.includes(p))
  const base = servies.length > 0 ? servies : cochees
  if (parts.mode === 'hasard') return fractionsRepartition(tirerPartsHasard(base, parts.graine))
  return partsAuProrata(parts.pourcents ? fractionsRepartition(parts.pourcents) : partageEgal(cochees), base)
}

/** Temps des vrai/faux au plus dans une évaluation blanche (`MAX_VRAI_FAUX_BLANCHE` affirmations). */
const PLAFOND_VRAI_FAUX_BLANCHE = MAX_VRAI_FAUX_BLANCHE * DUREE_VRAI_FAUX

/** Un ajout dans la part d'une compétence est admis s'il ne dépasse son budget ni de plus de la moitié
 * de sa durée NI de plus de `DEPASSEMENT_MAX` minutes — règle de « Préparer l'évaluation » du
 * professeur (`conception/composer.ts`), la PREMIÈRE question comprise. */
export function admisDansPart(dejaPris: number, duree: number, budget: number): boolean {
  return dejaPris + duree <= budget + Math.min(duree / 2, DEPASSEMENT_MAX) + 1e-9
}

/**
 * Composition de l'évaluation blanche selon des PARTS (hasard ou réglage) : chaque compétence cochée
 * remplit SA part (`admisDansPart`), Transférer d'abord, puis Connaître (une démonstration annoncée
 * d'abord si elle tient), puis Appliquer ; une compétence dont aucune question ne tient reçoit la plus
 * courte si elle tient dans la durée (une compétence annoncée est présente) ; jamais de temps donné à
 * une autre compétence pour « remplir » (les points suivent les parts, le document doit les respecter).
 * Niveaux voisins : seulement pour les compétences en retard sur leur part, même règle.
 */
function composerParParts(candidats: Candidat[], admis: Candidat[], reglages: ReglagesEleve, parts: PartsEleve, aleatoire: () => number): Composition {
  const cochees = new Set(reglages.niveaux)
  const tous = tousLesNiveaux(reglages.niveaux)
  const cible = reglages.duree
  const plafond = cible * (1 + TOLERANCE_DEPASSEMENT)
  const etat: EtatComposition = { unites: new Map(), parSection: new Map(), parGenerateur: new Map(), parProcessus: new Map(), duree: 0, dureeVraiFaux: 0 }
  const presentes = ([1, 2, 3] as const).filter((p) => admis.some((c) => c.processus === p))
  const fractions = partsVisees(parts, reglages.competences, presentes)
  const budgets: Record<Processus, number> = { 1: cible * fractions[1], 2: cible * fractions[2], 3: cible * fractions[3] }
  const pris = (p: Processus) => etat.parProcessus.get(p) ?? 0
  const admission = (c: Candidat) => admisDansPart(pris(c.processus), c.duree, budgets[c.processus])
  const plusCourte = (p: Processus) =>
    admis.filter((c) => c.processus === p && (c.sorte !== 'demonstration' || demonstrationPossible(etat, c))).sort((a, b) => a.duree - b.duree)[0] as Candidat | undefined
  const ordre = [3, 1, 2] as const
  /** Temps gardé pour les compétences pas encore servies (leur question la plus courte) : chacune
   * pourra être présente même si les précédentes remplissent leur part. */
  const reserve = (i: number) => ordre.slice(i + 1).reduce((t, q) => t + (budgets[q] > 0 && pris(q) === 0 ? (plusCourte(q)?.duree ?? 0) : 0), 0)
  const servir = (liste: Candidat[], p: Processus, rang: Map<string, number>, plafondP: number) => {
    const ici = liste.filter((c) => c.processus === p)
    if (budgets[p] <= 0 || ici.length === 0) return
    // Connaître : une démonstration annoncée d'abord (au hasard parmi celles qui tiennent).
    if (p === 1 && pris(1) === 0) {
      const demos = ici.filter((c): c is CandidatDemonstration => c.sorte === 'demonstration' && admission(c) && etat.duree + c.duree <= plafondP + 1e-9)
      if (demos.length > 0) ajouter(etat, demos[Math.floor(aleatoire() * demos.length)])
    }
    remplir(etat, { candidats: ici, rang }, budgets[p] - pris(p), plafondP, PLAFOND_VRAI_FAUX_BLANCHE, aleatoire, admission)
  }
  ordre.forEach((p, i) => {
    const plafondP = plafond - reserve(i)
    servir(admis, p, new Map(), plafondP)
    // Aucune question ne tient dans la part : la plus courte, si elle tient dans la durée.
    const courte = budgets[p] > 0 && pris(p) === 0 ? plusCourte(p) : undefined
    if (courte && etat.duree + courte.duree <= plafond + 1e-9) ajouter(etat, courte)
  })

  let elargi = false
  const voisinsUtilises = new Set<CategorieNiveau>()
  if (!tous) {
    const vus = new Set(admis.map((c) => c.cle))
    const etendus = new Set(cochees)
    for (let d = 1; d < CATEGORIES_NIVEAU.length && etat.duree < cible * SEUIL_ELARGIR; d++) {
      const nouvelles = CATEGORIES_NIVEAU.filter((c) => !etendus.has(c) && distanceCategorie(c, cochees) === d)
      if (nouvelles.length === 0) continue
      nouvelles.forEach((c) => etendus.add(c))
      const voisins = candidats.filter((c) => !vus.has(c.cle) && c.niveaux.length > 0 && partDansCategories(c, etendus) >= 0.5)
      voisins.forEach((c) => vus.add(c.cle))
      if (voisins.length === 0) continue
      const avant = etat.duree
      const rang = new Map(voisins.map((c) => [c.cle, d]))
      for (const p of ordre) if (budgets[p] - pris(p) >= 1.5) servir(voisins, p, rang, plafond)
      if (etat.duree > avant) {
        elargi = true
        nouvelles.forEach((c) => voisinsUtilises.add(c))
      }
    }
  }
  return { unites: [...etat.unites.values()], dureeEstimee: etat.duree, elargi, niveauxAdmis: CATEGORIES_NIVEAU.filter((c) => cochees.has(c) || voisinsUtilises.has(c)), parts: fractions }
}

/* ----------------------------------------------------------------------------------------------
 * Feuille d'exercices au NOMBRE d'exercices (ni durée ni points)
 * -------------------------------------------------------------------------------------------- */

/** Exercices au plus d'un type dans une feuille : `MAX_PAR_TYPE` (vrai/faux, formule, compréhension :
 * pas plus que de questions distinctes dans la banque — une question ouverte n'est jamais répétée ;
 * démonstration : une, c'est une question unique). */
export function capaciteType(c: Candidat): number {
  return c.sorte === 'demonstration' ? 1 : c.sorte === 'exercice' ? MAX_PAR_TYPE : Math.min(MAX_PAR_TYPE, c.disponibles)
}

/** Deux démonstrations d'un même résultat ont le même énoncé imprimé : une seule par feuille. Clé de
 * cet énoncé pour une démonstration, `null` pour tout autre type. */
export function enonceDemonstration(c: Candidat): string | null {
  return c.sorte === 'demonstration' ? c.enonceCle : null
}

/** Nombre d'exercices au plus possible avec ces types : somme des capacités, une seule démonstration
 * par énoncé imprimé. */
export function disponiblesFeuille(types: readonly Candidat[]): number {
  const enonces = new Set<string>()
  let total = 0
  for (const c of types) {
    const e = enonceDemonstration(c)
    if (e !== null) {
      if (enonces.has(e)) continue
      enonces.add(e)
    }
    total += capaciteType(c)
  }
  return total
}

/** Types d'exercices proposés à la feuille pour ces choix : candidats des notions retenues et des
 * compétences cochées (jamais une autre), aux niveaux cochés (même règle que `composer` : au moins la
 * moitié des tirages d'estimation), dans l'ordre des sections du chapitre. Questions sans niveau
 * (formule, compréhension, démonstrations COCHÉES) : toujours admises. Aucun niveau voisin : la
 * feuille ne « remplit » rien, elle dit ce qui manque. */
export function typesFeuille(candidatsChapitre: Candidat[], reglages: Pick<ReglagesEleve, 'sections' | 'competences' | 'niveaux' | 'demonstrations' | 'calculatrice'>, chapter?: ChapterContent): Candidat[] {
  const cochees = new Set(reglages.niveaux)
  const tous = tousLesNiveaux(reglages.niveaux)
  const admis = candidatsDesReglages(candidatsChapitre, reglages).filter((c) => candidatAuxNiveaux(c, cochees, tous))
  if (!chapter) return admis
  const ordre = new Map(chapter.sections.map((s, i) => [s.id, i]))
  return admis.map((c, i) => ({ c, i })).sort((a, b) => (ordre.get(a.c.sectionId) ?? 0) - (ordre.get(b.c.sectionId) ?? 0) || a.i - b.i).map((x) => x.c)
}

/** Choisit au hasard (ou par `aleatoire`) parmi les éléments de plus petite valeur. */
function auPlusPetit<T>(liste: T[], valeur: (x: T) => number, aleatoire: () => number): T {
  const min = Math.min(...liste.map(valeur))
  const ex = liste.filter((x) => valeur(x) === min)
  return ex[Math.min(ex.length - 1, Math.floor(aleatoire() * ex.length))]
}

/**
 * Composition d'une feuille au NOMBRE d'exercices (décision de l'utilisateur, 22/11/2026 : « les
 * deux » — un nombre global par défaut ET un choix exercice par exercice).
 * - À la carte : exactement les nombres demandés, type par type (bornés à `capaciteType`).
 * - Global : un exercice à la fois — la compétence cochée la moins servie (parts égales), puis dans
 *   elle la notion la moins servie, puis le type le moins servi (jamais deux fois le même type tant
 *   qu'un autre de cette notion et de cette compétence est libre), puis le générateur le moins servi,
 *   égalités au hasard ; un type plein (`capaciteType`) n'est plus proposé. Moins de types que
 *   demandé : la feuille a le maximum possible (`disponibles`), et l'élève en est averti.
 */
export function composerFeuille(candidatsChapitre: Candidat[], reglages: ReglagesEleve, aleatoire: () => number = Math.random): Composition {
  const types = typesFeuille(candidatsChapitre, reglages)
  const disponibles = disponiblesFeuille(types)
  const niveauxAdmis = CATEGORIES_NIVEAU.filter((c) => reglages.niveaux.includes(c))
  const exercices = reglages.exercices!
  const nombres = new Map<string, number>()
  let demandes: number
  if (exercices.mode === 'carte') {
    demandes = 0
    const enonces = new Set<string>()
    for (const c of types) {
      let n = Math.max(0, Math.min(capaciteType(c), Math.floor(exercices.parType[c.cle] ?? 0)))
      // Une seule démonstration par énoncé imprimé (la liste ne permet pas d'en régler deux).
      const e = enonceDemonstration(c)
      if (e !== null && n > 0) {
        if (enonces.has(e)) n = 0
        else enonces.add(e)
      }
      demandes += n
      if (n > 0) nombres.set(c.cle, n)
    }
  } else {
    demandes = Math.max(NOMBRE_FEUILLE_MIN, Math.min(NOMBRE_FEUILLE_MAX, Math.floor(exercices.nombre)))
    const parCompetence = new Map<Processus, number>()
    const parNotion = new Map<string, number>()
    const parGenerateur = new Map<string, number>()
    const n = (c: Candidat) => nombres.get(c.cle) ?? 0
    const enoncesPris = new Set<string>()
    const libre = (c: Candidat) => {
      const e = enonceDemonstration(c)
      return n(c) < capaciteType(c) && (e === null || !enoncesPris.has(e))
    }
    for (let k = 0; k < demandes; k++) {
      const libres = types.filter(libre)
      if (libres.length === 0) break
      const p = auPlusPetit([...new Set(libres.map((c) => c.processus))], (q) => parCompetence.get(q) ?? 0, aleatoire)
      const dansP = libres.filter((c) => c.processus === p)
      const s = auPlusPetit([...new Set(dansP.map((c) => c.sectionId))], (x) => parNotion.get(`${p}|${x}`) ?? 0, aleatoire)
      const ici = dansP.filter((c) => c.sectionId === s)
      const peuServi = Math.min(...ici.map(n))
      const c = auPlusPetit(ici.filter((x) => n(x) === peuServi), (x) => parGenerateur.get(`${p}|${s}|${cleGenerateur(x)}`) ?? 0, aleatoire)
      nombres.set(c.cle, n(c) + 1)
      const e = enonceDemonstration(c)
      if (e !== null) enoncesPris.add(e)
      parCompetence.set(p, (parCompetence.get(p) ?? 0) + 1)
      parNotion.set(`${p}|${s}`, (parNotion.get(`${p}|${s}`) ?? 0) + 1)
      const g = `${p}|${s}|${cleGenerateur(c)}`
      parGenerateur.set(g, (parGenerateur.get(g) ?? 0) + 1)
    }
  }
  const unites = types.filter((c) => nombres.has(c.cle)).map((c) => ({ candidat: c, nombre: nombres.get(c.cle)! }))
  return { unites, dureeEstimee: unites.reduce((t, u) => t + u.nombre * u.candidat.duree, 0), elargi: false, niveauxAdmis, demandes, disponibles }
}

/** Compose une sélection pour les réglages — aléatoire à chaque appel, sauf graine des parts
 * (évaluation blanche) : mêmes réglages, mêmes candidats, même graine → même composition. */
export function composer(candidatsChapitre: Candidat[], reglages: ReglagesEleve, aleatoire?: () => number): Composition {
  // Feuille au nombre d'exercices : ni durée ni parts de temps.
  if (reglages.exercices) return composerFeuille(candidatsChapitre, reglages, aleatoire)
  // Jamais une compétence non cochée, même pour remplir la durée. Formule / compréhension : feuille au
  // nombre d'exercices seulement (l'ancien chemin « durée » ne les tirait pas).
  const candidats = candidatsDesReglages(candidatsChapitre, reglages).filter((c) => c.sorte !== 'formule' && c.sorte !== 'comprehension')
  const cochees = new Set(reglages.niveaux)
  const tous = tousLesNiveaux(reglages.niveaux)
  const admis = candidats.filter((c) => candidatAuxNiveaux(c, cochees, tous))
  if (reglages.parts) {
    const graine = reglages.parts.graine
    return composerParParts(candidats, admis, reglages, reglages.parts, aleatoire ?? (graine !== undefined ? aleatoireDepuisGraine(graine ^ 0x5bd1e995) : Math.random))
  }
  aleatoire ??= Math.random
  const cible = reglages.duree
  // Évaluation blanche : au plus `MAX_VRAI_FAUX_BLANCHE` affirmations (la feuille n'a pas ce plafond).
  const vf = (plafond: number) => (reglages.type === 'blanche' ? Math.min(plafond, PLAFOND_VRAI_FAUX_BLANCHE) : plafond)
  const plafond = cible * (1 + TOLERANCE_DEPASSEMENT)
  const etat: EtatComposition = { unites: new Map(), parSection: new Map(), parGenerateur: new Map(), parProcessus: new Map(), duree: 0, dureeVraiFaux: 0 }
  const bassin: Bassin = { candidats: admis, rang: new Map() }
  const parProcessus = (b: Bassin, p: Processus): Bassin => ({ candidats: b.candidats.filter((c) => c.processus === p), rang: b.rang })

  // Budgets par compétence ; une compétence cochée sans exercice aux niveaux cochés cède son temps.
  const presentes = ([1, 2, 3] as const).filter((p) => admis.some((c) => c.processus === p))
  const { budgets, bruts } = budgetsParCompetence(cible, reglages.competences, presentes)
  // Transférer d'abord (questions longues), puis Connaître, puis Appliquer jusqu'à la durée visée.
  if (budgets[3] > 0) remplir(etat, parProcessus(bassin, 3), budgets[3], etat.duree + budgets[3] + cible * TOLERANCE_DEPASSEMENT, vf(Infinity), aleatoire)
  if (budgets[1] > 0) remplir(etat, parProcessus(bassin, 1), budgets[1], etat.duree + budgets[1] + 1, vf(budgets[1] + 1), aleatoire)
  if (budgets[2] > 0) remplir(etat, parProcessus(bassin, 2), cible - etat.duree, plafond, vf(Infinity), aleatoire)
  // Reste du temps (bassin trop court) : n'importe quelle compétence cochée.
  remplir(etat, bassin, cible - etat.duree, plafond, vf(budgets[1] + 1), aleatoire)

  // Niveaux cochés trop courts pour la durée : les niveaux voisins complètent, le plus proche
  // d'abord, toujours dans les compétences cochées (l'élève en est averti).
  let elargi = false
  const voisinsUtilises = new Set<CategorieNiveau>()
  if (!tous) {
    const vus = new Set(admis.map((c) => c.cle))
    const etendus = new Set(cochees)
    const parts = presentes.length > 0 ? budgets : bruts
    for (let d = 1; d < CATEGORIES_NIVEAU.length && etat.duree < cible * SEUIL_ELARGIR; d++) {
      const nouvelles = CATEGORIES_NIVEAU.filter((c) => !etendus.has(c) && distanceCategorie(c, cochees) === d)
      if (nouvelles.length === 0) continue
      nouvelles.forEach((c) => etendus.add(c))
      const voisins = candidats.filter((c) => !vus.has(c.cle) && c.niveaux.length > 0 && partDansCategories(c, etendus) >= 0.5)
      voisins.forEach((c) => vus.add(c.cle))
      if (voisins.length === 0) continue
      const avant = etat.duree
      const bv: Bassin = { candidats: voisins, rang: new Map(voisins.map((c) => [c.cle, d])) }
      // D'abord les compétences en retard sur leur part, puis n'importe laquelle des cochées.
      for (const p of [3, 1, 2] as const) {
        const manque = parts[p] - (etat.parProcessus.get(p) ?? 0)
        if (manque >= 1.5) remplir(etat, parProcessus(bv, p), manque, plafond, vf(parts[1] + 1), aleatoire)
      }
      remplir(etat, bv, cible - etat.duree, plafond, vf(parts[1] + 1), aleatoire)
      if (etat.duree > avant) {
        elargi = true
        nouvelles.forEach((c) => voisinsUtilises.add(c))
      }
    }
  }

  return { unites: [...etat.unites.values()], dureeEstimee: etat.duree, elargi, niveauxAdmis: [...CATEGORIES_NIVEAU.filter((c) => cochees.has(c) || voisinsUtilises.has(c))] }
}

/* ----------------------------------------------------------------------------------------------
 * Disponibilité EN DIRECT (assistant) : calculée sur les candidats déjà préparés
 * -------------------------------------------------------------------------------------------- */

export interface DisponibiliteCompetence {
  /** Exercices (variantes et thèmes) de cette compétence dans les notions retenues. */
  total: number
  /** Niveaux où elle a au moins un exercice (majorité de ses tirages d'estimation à ce niveau). */
  categories: CategorieNiveau[]
  /** Au moins un exercice retenu aux niveaux cochés (même règle que `composer`) — une démonstration
   * seulement si elle est cochée. */
  auxNiveauxCoches: boolean
  /** Connaître : les seules questions possibles sont des démonstrations (aucune cochée → rien). */
  demonstrationsSeules: boolean
  /** Seulement des questions SANS niveau (démonstrations, formules, compréhension) : les niveaux
   * cochés ne comptent pas pour cette compétence. */
  sansNiveauSeules: boolean
  /** Au moins une question sans niveau qui compte (formule, compréhension, démonstration cochée) :
   * toujours proposée, quels que soient les niveaux cochés. */
  questionsSansNiveau: boolean
  /** Variantes de cette compétence écartées par le choix de la calculatrice (interdite : celles qui
   * l'exigent ; autorisée : celles qui se font toujours sans), et niveaux qu'ELLES SEULES offriraient
   * (« seulement avec calculatrice » / « seulement sans calculatrice »). */
  totalEcartesCalculatrice: number
  categoriesEcarteesCalculatrice: CategorieNiveau[]
}

export interface DisponibiliteEleve {
  /** Niveau proposé : au moins un exercice des compétences cochées, dans les notions retenues. */
  niveaux: Record<CategorieNiveau, boolean>
  /** Niveau grisé que l'autre choix de calculatrice rendrait disponible. */
  niveauxEcartesCalculatrice: Record<CategorieNiveau, boolean>
  parCompetence: Record<Processus, DisponibiliteCompetence>
}

/** Ce que les candidats permettent pour ces notions, compétences et niveaux cochés : niveaux à griser
 * (aucun exercice des compétences cochées) et compétences sans exercice aux niveaux cochés. Même
 * règle d'appartenance que `composer` (au moins la moitié des tirages d'estimation) : un niveau
 * proposé, coché seul, donne au moins un exercice retenu. */
export function disponibilite(candidatsChapitre: Candidat[], reglages: Pick<ReglagesEleve, 'sections' | 'competences' | 'niveaux' | 'demonstrations' | 'calculatrice'>): DisponibiliteEleve {
  const sections = new Set(reglages.sections)
  const demos = new Set(reglages.demonstrations ?? [])
  // Une démonstration rend la compétence disponible (l'élève peut la cocher), mais ne compte pour la
  // composition que si elle est cochée. Variantes écartées par le choix de la calculatrice : elles ne
  // comptent pas (elles disent seulement ce que l'autre choix ajouterait).
  const toutesNotions = candidatsChapitre.filter((c) => sections.size === 0 || sections.has(c.sectionId))
  const dansNotions = toutesNotions.filter((c) => permisParCalculatrice(c, reglages.calculatrice))
  const categoriesDe = (liste: Candidat[]) => CATEGORIES_NIVEAU.filter((k) => liste.some((c) => partDansCategories(c, new Set([k])) >= 0.5))
  const comptee = (c: Candidat) => c.sorte !== 'demonstration' || demos.has(cleDemonstration(c.sectionId, c.questionId))
  const cochees = new Set(reglages.niveaux)
  const tous = tousLesNiveaux(reglages.niveaux)
  const parCompetence = {} as Record<Processus, DisponibiliteCompetence>
  for (const p of [1, 2, 3] as const) {
    const liste = dansNotions.filter((c) => c.processus === p)
    const ecartees = toutesNotions.filter((c) => c.processus === p && !permisParCalculatrice(c, reglages.calculatrice))
    const categories = categoriesDe(liste)
    parCompetence[p] = {
      total: liste.length,
      categories,
      totalEcartesCalculatrice: ecartees.length,
      categoriesEcarteesCalculatrice: categoriesDe(ecartees).filter((k) => !categories.includes(k)),
      auxNiveauxCoches: liste.some((c) => comptee(c) && candidatAuxNiveaux(c, cochees, tous)),
      demonstrationsSeules: liste.length > 0 && liste.every((c) => c.sorte === 'demonstration'),
      sansNiveauSeules: liste.length > 0 && liste.every(estSansNiveau),
      questionsSansNiveau: liste.some((c) => estSansNiveau(c) && comptee(c)),
    }
  }
  const niveaux = {} as Record<CategorieNiveau, boolean>
  const niveauxEcartesCalculatrice = {} as Record<CategorieNiveau, boolean>
  for (const k of CATEGORIES_NIVEAU) {
    niveaux[k] = reglages.competences.some((p) => parCompetence[p]?.categories.includes(k))
    niveauxEcartesCalculatrice[k] = !niveaux[k] && reglages.competences.some((p) => parCompetence[p]?.categoriesEcarteesCalculatrice.includes(k))
  }
  return { niveaux, niveauxEcartesCalculatrice, parCompetence }
}

/** Liste lisible de niveaux : « moyen », « très facile et facile », « facile à difficile » (au moins
 * trois niveaux qui se suivent), « tous les niveaux ». */
export function texteCategories(categories: readonly CategorieNiveau[]): string {
  const rangs = [...new Set(categories)].map(rangCategorie).sort((a, b) => a - b)
  if (rangs.length === 0) return ''
  if (rangs.length === CATEGORIES_NIVEAU.length) return 'tous les niveaux'
  const mot = (r: number) => LIBELLE_CATEGORIE[CATEGORIES_NIVEAU[r - 1]]
  if (rangs.length >= 3 && rangs[rangs.length - 1] - rangs[0] === rangs.length - 1) return `${mot(rangs[0])} à ${mot(rangs[rangs.length - 1])}`
  const mots = rangs.map(mot)
  return mots.length === 1 ? mots[0] : `${mots.slice(0, -1).join(', ')} et ${mots[mots.length - 1]}`
}

/** « seulement en très facile et facile », « seulement de facile à difficile », « à tous les niveaux ». */
export function texteSeulement(categories: readonly CategorieNiveau[]): string {
  const t = texteCategories(categories)
  if (t === 'tous les niveaux') return 'à tous les niveaux'
  return / à /.test(t) ? `seulement de ${t}` : `seulement en ${t}`
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
    } else if (c.sorte === 'demonstration') {
      // Démonstrations annoncées : ligne « demonstration » à CHOIX explicite (exactement celles-là),
      // points d'après la longueur du corrigé (`pointsDemonstration`, comme le panneau).
      const cle = `${c.sectionId}|demo`
      const ligne = lignes.get(cle) ?? { chapitreSlug: chapter.slug, sectionId: c.sectionId, processus: 1, type: 'demonstration' as const, nombre: 0, choix: [], pointsParChoix: {}, points: 4 }
      ligne.choix!.push(c.questionId)
      ligne.pointsParChoix![c.questionId] = pointsDemonstration(c.etapes)
      ligne.nombre = ligne.choix!.length
      lignes.set(cle, ligne)
    } else if (c.sorte === 'vraiFaux') {
      lignes.set(`${c.sectionId}|vf|${c.theme}`, { chapitreSlug: chapter.slug, sectionId: c.sectionId, processus: 1, type: 'vraiFaux', cle: c.theme, nombre, points: 1 })
    } else {
      // Feuille : ligne « Formule » / « compréhension » du panneau, sans choix — `construireItemsPayload`
      // tire `nombre` questions distinctes de la banque de la notion (jamais deux fois la même).
      lignes.set(`${c.sectionId}|${c.sorte}`, { chapitreSlug: chapter.slug, sectionId: c.sectionId, processus: 1, type: c.sorte, nombre, points: c.sorte === 'formule' ? 1 : 2 })
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
  /** Niveaux (catégories) et compétences réellement imprimés, vrai/faux compris (niveau 2). */
  categories: CategorieNiveau[]
  competences: Processus[]
  /** Niveaux imprimés hors des niveaux cochés (niveaux voisins qui complètent). */
  categoriesHorsChoix: CategorieNiveau[]
  elargi: boolean
  /** Évaluation blanche : parts du document (pourcentages entiers, somme 100) entre les compétences
   * RÉELLEMENT imprimées — celles des points (« Mon score ») — et leur origine. Absent : feuille. */
  parts?: RepartitionPourcents
  partsHasard?: boolean
  /** Exercices imprimés AVANT regroupement : instances, affirmations vrai/faux et questions ouvertes
   * (une feuille au nombre d'exercices en a `demandes`, ou `disponibles` s'il en manque). */
  exercices: number
  /** Feuille au nombre d'exercices : nombre demandé et nombre au plus possible (`Composition`). */
  demandes?: number
  disponibles?: number
}

export interface PlanEleve {
  plan: PlanDocument
  resume: ResumeEleve
}

const ESSAIS_RETOUCHE = 40
const BUDGET_RETOUCHE_MS = 120

type ElementExercice = Extract<ElementPlan, { type: 'exercice' }>

/** Durée d'un vrai/faux (2 min par affirmation) ou d'une question ouverte (démonstration :
 * `dureeDemonstration`, d'après la longueur de son corrigé). */
function dureeHorsExercice(e: Exclude<ElementPlan, ElementExercice>): number {
  return e.type === 'vraiFaux' ? e.indices.length * DUREE_VRAI_FAUX : dureeDemonstration(e.question.corrige.length)
}

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
    // Calculatrice choisie : contraint le tirage de `construirePlan` comme chez le professeur (feuille :
    // rien d'imprimé ; blanche : « Calculatrice interdite / autorisée » dans l'encadré « Mon score »).
    ...(reglages.calculatrice ? { calculatrice: reglages.calculatrice } : {}),
    surtitre: `${niveauLabel} · Chapitre ${chapter.chapterNumber}`,
    titreChapitre: chapter.title,
    urlChapitre: `https://math-belgium.vercel.app/${reglages.levelSlug}/${chapter.slug}`,
  }
}

/** Niveau réel admis à l'impression : un niveau coché, ou un niveau voisin réellement utilisé par la
 * composition ; tout niveau quand les cinq sont cochés (ou générateur sans niveau). */
function niveauAdmis(niveau: number | null, reglages: ReglagesEleve, composition: Composition): boolean {
  if (niveau === null || tousLesNiveaux(reglages.niveaux)) return true
  const c = categorieDuNiveau(niveau)
  if (reglages.niveaux.includes(c)) return true
  return composition.elargi && composition.niveauxAdmis.includes(c)
}

function niveauCoche(niveau: number, reglages: ReglagesEleve): boolean {
  return tousLesNiveaux(reglages.niveaux) || reglages.niveaux.includes(categorieDuNiveau(niveau))
}

/**
 * Retouche les graines du plan : un exercice dont le niveau RÉEL sort des niveaux admis, ou dont la
 * durée ferait dépasser la durée visée de plus de 10 %, est retiré (autre graine de la MÊME variante,
 * contrainte de l'évaluation respectée, jamais un énoncé déjà dans le document) ; s'il dépasse encore,
 * les exercices les moins utiles à la durée sont retirés (au moins un exercice gardé).
 */
function retoucher(plan: PlanDocument, reglages: ReglagesEleve, composition: Composition, estimations: Map<string, number>): Map<ElementExercice, { niveau: number | null; duree: number }> {
  const serie = plan.series[0]
  const cible = reglages.duree
  const plafond = cible * (1 + TOLERANCE_DEPASSEMENT)
  const feuille = !!reglages.exercices
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
  const dureeAutres = serie.elements.reduce((t, e) => t + (e.type === 'exercice' ? 0 : dureeHorsExercice(e)), 0)
  let cumul = dureeAutres
  exercices.forEach((el, k) => {
    const adaptateur = EVALUATION_ADAPTER_REGISTRY[el.generatorId] as Adaptateur
    const inst = el.instances[0]
    const m = mesures.get(el)!
    const resteEstime = exercices.slice(k + 1).reduce((t, e) => t + (estimations.get(`${e.generatorId}|${e.instances[0].varianteId}`) ?? mesures.get(e)!.duree), 0)
    const budget = plafond - cumul - resteEstime
    // Feuille au nombre d'exercices : seul le niveau compte (aucune durée visée).
    const bon = (x: { niveau: number | null; duree: number }) => niveauAdmis(x.niveau, reglages, composition) && (feuille || x.duree <= Math.max(budget, 0) + 1e-9)
    if (!bon(m)) {
      const contrainte = contrainteEleve(adaptateur, reglages.type, reglages.calculatrice)
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
        if (niveauAdmis(mesure.niveau, reglages, composition) && (!meilleur || mesure.duree < meilleur.mesure.duree)) meilleur = { graine, mesure, empreinte }
      }
      const garderAncienne = !meilleur || (niveauAdmis(m.niveau, reglages, composition) && m.duree <= meilleur.mesure.duree)
      if (meilleur && !garderAncienne) {
        if (ancienne) empreintes.delete(ancienne)
        empreintes.add(meilleur.empreinte)
        el.instances = [{ ...inst, graine: meilleur.graine }]
        mesures.set(el, meilleur.mesure)
      }
    }
    cumul += mesures.get(el)!.duree
  })
  // Dépassement restant : retirer l'exercice dont le retrait rapproche le plus de la cible (jamais
  // pour une feuille au nombre d'exercices : le nombre demandé est respecté).
  const total = () => dureeAutres + [...mesures.values()].reduce((t, m) => t + m.duree, 0)
  while (!feuille && total() > plafond + 1e-9 && mesures.size > 1) {
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

/** Points indicatifs : durée de chaque exercice → `pointsDepuisDuree`, 1 pt par affirmation, points de
 * la démonstration, puis total ramené à 20, partagé entre les compétences imprimées selon les parts
 * (`fractions`, déjà ramenées aux imprimées ; absent : parts égales ; une seule → les 20 pts). */
function poserPoints(plan: PlanDocument, mesures: Map<ElementExercice, { niveau: number | null; duree: number }>, fractions?: Record<Processus, number>): boolean {
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
  const presents = ([1, 2, 3] as const).filter((p) => elements.some((e) => e.processus === p))
  const egal = fractions ?? partageEgal(presents)
  const parts = presents.map((p) => egal[p])
  const totaux = mettreAEchelle(parts, TOTAL_POINTS_BLANCHE)
  if (totaux) {
    const resultats = presents.map((p, k) => {
      const indices = tous.filter((i) => elements[i].processus === p)
      return { indices, points: echelle(indices, totaux[k]) }
    })
    if (resultats.every((r) => r.points)) {
      resultats.forEach((r) => appliquer(r.indices, r.points!))
      return true
    }
  }
  const points = echelle(tous, TOTAL_POINTS_BLANCHE)
  appliquer(tous, points ?? bruts)
  return false
}

/** « Connaître 20 % · Appliquer 65 % · Transférer 15 % — tirées au hasard : ta vraie interro peut être
 * répartie autrement » (une seule compétence : « Appliquer 100 % », sans avertissement). */
export function texteRepartitionBlanche(parts: RepartitionPourcents, hasard: boolean): string {
  const t = texteParts(parts)
  if (Object.values(parts).filter((v) => v > 0).length < 2) return t
  return `${t} — ${hasard ? 'tirées au hasard' : 'réglées par toi'} : ta vraie interro peut être répartie autrement`
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
  let parts: RepartitionPourcents | undefined
  if (blanche) {
    // Parts du document : parts visées ramenées aux compétences réellement imprimées (au prorata).
    const imprimees = ([1, 2, 3] as const).filter((p) => plan.series[0].elements.some((e) => e.processus === p))
    const fractions = composition.parts ? partsAuProrata(composition.parts, imprimees) : undefined
    const fractionsPoints = fractions && imprimees.every((p) => fractions[p] > 0) ? fractions : undefined
    let respectees = poserPoints(plan, mesures, fractionsPoints)
    // Total impossible en demi-points avec des vrai/faux de n affirmations au même barème (ex. 15
    // affirmations pour 20 pts) : chaque affirmation devient son propre élément (même thème, même
    // section ; à l'impression, tous les vrai/faux restent UNE question), puis nouvel essai.
    const serie = plan.series[0]
    if (!respectees && serie.elements.some((e) => e.type === 'vraiFaux' && e.indices.length > 1)) {
      serie.elements = serie.elements.flatMap((e) => (e.type === 'vraiFaux' && e.indices.length > 1 ? e.indices.map((i) => ({ ...e, indices: [i] })) : [e]))
      respectees = poserPoints(plan, mesures, fractionsPoints)
    }
    pointsParProcessus = {}
    for (const e of plan.series[0].elements) {
      const p = e.type === 'exercice' ? e.instances.reduce((t, i) => t + i.points, 0) : e.type === 'vraiFaux' ? e.pointsParAffirmation * e.indices.length : e.points
      pointsParProcessus[e.processus] = (pointsParProcessus[e.processus] ?? 0) + p
    }
    points = Object.values(pointsParProcessus).reduce((t, p) => t + (p ?? 0), 0)
    if (composition.parts) {
      // Parts affichées = celles des points : les parts visées si les points les suivent, sinon (repli
      // de la mise à l'échelle, jamais observé) les parts des points réellement posés.
      const total = points
      const depuisPoints = { 1: (pointsParProcessus[1] ?? 0) / total, 2: (pointsParProcessus[2] ?? 0) / total, 3: (pointsParProcessus[3] ?? 0) / total }
      parts = pourcentsEntiers(respectees && fractions ? fractions : depuisPoints)
    }
  }

  const elements = plan.series[0].elements
  const duree = elements.reduce((t, e) => t + (e.type === 'exercice' ? (mesures.get(e)?.duree ?? DUREE_PAR_DEFAUT) : dureeHorsExercice(e)), 0)
  const dureeConseillee = Math.max(5, Math.round(duree / 5) * 5)
  if (blanche) {
    // Case « Avec calculatrice » : déjà dans l'en-tête du tirage (absente : « autorisée », sans contrainte).
    const partsHasard = reglages.parts?.mode === 'hasard'
    plan.entete = { ...plan.entete, calculatrice: reglages.calculatrice === 'interdite' ? 'interdite' : 'autorisee', blanche: { dureeConseillee, ...(parts ? { repartition: texteRepartitionBlanche(parts, partsHasard) } : {}) } }
  }
  const niveaux = [...mesures.values()].flatMap((m) => (m.niveau === null ? [] : [m.niveau]))
  const questions = questionsDeSerie(elementsAPlat(plan.series[0])).length
  const imprimes = [...niveaux, ...(elements.some((e) => e.type === 'vraiFaux') ? [NIVEAU_VRAI_FAUX] : [])]
  const categories = CATEGORIES_NIVEAU.filter((c) => imprimes.some((n) => categorieDuNiveau(n) === c))
  const competences = ([1, 2, 3] as const).filter((p) => elements.some((e) => e.processus === p))
  // Averti dès qu'un exercice imprimé sort des niveaux cochés (niveau voisin ajouté, ou variante dont
  // aucun tirage aux niveaux cochés n'a été trouvé dans le budget de la retouche).
  const categoriesHorsChoix = CATEGORIES_NIVEAU.filter((c) => imprimes.some((n) => categorieDuNiveau(n) === c && !niveauCoche(n, reglages)))
  const exercices = elements.reduce((t, e) => t + (e.type === 'exercice' ? e.instances.length : e.type === 'vraiFaux' ? e.indices.length : 1), 0)
  return {
    plan,
    resume: {
      questions,
      duree,
      dureeConseillee,
      points,
      pointsParProcessus,
      niveaux,
      categories,
      competences,
      categoriesHorsChoix,
      elargi: categoriesHorsChoix.length > 0,
      ...(parts ? { parts, partsHasard: reglages.parts?.mode === 'hasard' } : {}),
      exercices,
      ...(composition.demandes !== undefined ? { demandes: composition.demandes, disponibles: composition.disponibles } : {}),
    },
  }
}
