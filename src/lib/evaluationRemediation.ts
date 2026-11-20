import type { FragmentConsigne, ProfilInstance } from '../entrainement/export/genererFeuilleExercices'
import { tirerGraine } from '../entrainement/export/codeExercice'
import { partiesExamen } from '../entrainement/export/examen'
import { EVALUATION_ADAPTER_REGISTRY } from './evaluationAdapterRegistry'
import { chargerThemeVraiFaux } from './banquesVraiFaux'
import { nomGenerateur, type IdGenerateurPilote } from './evaluationPayload'
import {
  autresCaracteristiques,
  chapitresExamen,
  estExamen,
  empreinteSection,
  graineInedite,
  lireHistorique,
  piocherIndices,
  respecteContrainte,
  tirerInstance,
  type Adaptateur,
  type ContrainteTirage,
  type ElementPlan,
  type InstancePlan,
  type PlanDocument,
} from './evaluationLocal'

/**
 * Feuille de remédiation en un clic (décision de l'utilisateur, maquette C9) : depuis une
 * évaluation ou une feuille ENREGISTRÉE, le professeur coche les questions à retravailler ; on
 * produit une FEUILLE D'EXERCICES (mode `exercice` : énoncé, « Je vérifie », corrigé détaillé,
 * QR codes vers les générateurs avec les aides, aménagée en option) intitulée
 * « Remédiation — <titre de l'évaluation> ».
 *
 * - Exercice coché : `exercicesParQuestion` exercices du MÊME type — même générateur, même variante,
 *   même profil de tirage que la question d'origine (cas particulier, paramètres absents, type de
 *   question `forme`, calculatrice de l'évaluation) — avec de NOUVELLES graines : jamais un énoncé
 *   de l'évaluation (toutes séries), jamais deux fois le même énoncé dans la feuille. Une question
 *   regroupée a)/b)/c) (adaptateur `regroupable`) revient en entier, `exercicesParQuestion` fois.
 * - Vrai/faux coché (UNE question par série, `itemVraiFauxRegroupe`) : d'autres affirmations des
 *   mêmes thèmes, autant de fois plus qu'à l'évaluation — celles de l'évaluation seulement si la
 *   banque n'en a pas assez.
 * - « Formule », « Formule + démonstration », compréhension (questions ouvertes) : la même question,
 *   une fois (pas d'autre tirage possible — signalé dans le panneau).
 *
 * Numérotation = celle de la copie de la série A (`itemsDepuisSerie` + `grouperParProcessus`) :
 * items rangés par processus (1, 2, 3, ordre stable), tous les vrai/faux de la série forment une
 * seule question placée au rang du premier. Examen : ordre des PARTIES (`partiesExamen`, même
 * fonction que la copie).
 */

const NOM_PROCESSUS: Record<1 | 2 | 3, string> = { 1: 'Connaître', 2: 'Appliquer', 3: 'Transférer' }

export interface QuestionRemediable {
  /** Numéro imprimé sur la copie de la série A. */
  numero: number
  processus: 1 | 2 | 3
  nomProcessus: string
  nature: 'exercice' | 'vraiFaux' | 'ouverte'
  /** Notion (titre de la section du cours), « Vrai ou faux » pour des affirmations de sections différentes. */
  titre: string
  /** Détail en mini-syntaxe RichText (générateur, variante, cas particulier ; énoncé d'une question ouverte). */
  detail: string
  /** Question ouverte (« Formule », démonstration…) : reprise telle quelle, pas d'autre tirage. */
  memeQuestion: boolean
  /** Indices des éléments de la série A couverts par cette question. */
  indicesElements: number[]
}

function fragmentsEnRichText(fragments: FragmentConsigne[] | { type: string; valeur: string }[]): string {
  return fragments.map((f) => (f.type === 'latex' ? `$${f.valeur}$` : f.valeur)).join('')
}

function profilDe(adaptateur: Adaptateur, inst: InstancePlan): ProfilInstance | null {
  if (!adaptateur.profilInstance) return null
  try {
    return adaptateur.profilInstance(tirerInstance(adaptateur, inst.varianteId, inst.graine))
  } catch {
    return null
  }
}

function detailExercice(el: Extract<ElementPlan, { type: 'exercice' }>): string {
  const adaptateur = EVALUATION_ADAPTER_REGISTRY[el.generatorId] as Adaptateur | undefined
  const morceaux = [`${nomGenerateur(el.generatorId as IdGenerateurPilote)} (${el.generatorId})`]
  if (adaptateur?.catalogueVariantes && adaptateur.catalogueVariantes.length > 1) {
    const labels = [...new Set(el.instances.map((i) => adaptateur.catalogueVariantes!.find((v) => v.id === i.varianteId)?.label).filter(Boolean))]
    if (labels.length > 0) morceaux.push(labels.join(', '))
  }
  if (adaptateur && el.instances.some((i) => {
    const p = profilDe(adaptateur, i)
    return p !== null && autresCaracteristiques(p, (adaptateur.parametresAuChoix ?? []).map((x) => x.id)) !== null
  }))
    morceaux.push('cas particulier')
  if (el.instances.length > 1) morceaux.push(`${el.instances.length} calculs a), b)…`)
  return morceaux.join(' · ')
}

/** Questions de l'évaluation, dans l'ordre et avec la numérotation de la copie de la série A. */
export function questionsRemediables(plan: PlanDocument): QuestionRemediable[] {
  const serie = plan.series[0]
  if (!serie) return []
  type Brouillon = Omit<QuestionRemediable, 'numero'>
  const liste: Brouillon[] = []
  let vraiFaux: Brouillon | null = null
  serie.elements.forEach((el, indice) => {
    const base = { processus: el.processus, nomProcessus: NOM_PROCESSUS[el.processus], titre: el.section?.titre ?? el.titreSection }
    if (el.type === 'exercice') {
      if (!EVALUATION_ADAPTER_REGISTRY[el.generatorId]) return
      liste.push({ ...base, nature: 'exercice', detail: detailExercice(el), memeQuestion: false, indicesElements: [indice] })
    } else if (el.type === 'ouverte') {
      const detail = el.question.titre ?? fragmentsEnRichText(el.question.enonce)
      liste.push({ ...base, nature: 'ouverte', detail, memeQuestion: true, indicesElements: [indice] })
    } else {
      // Tous les vrai/faux de la série : UNE question, au rang du premier (`itemVraiFauxRegroupe`).
      if (!vraiFaux) {
        vraiFaux = { ...base, nature: 'vraiFaux', detail: '', memeQuestion: false, indicesElements: [] }
        liste.push(vraiFaux)
      }
      vraiFaux.indicesElements.push(indice)
    }
  })
  const vf = vraiFaux as Brouillon | null
  if (vf) {
    const sources = vf.indicesElements.map((i) => serie.elements[i]).filter((e): e is Extract<ElementPlan, { type: 'vraiFaux' }> => e.type === 'vraiFaux')
    const premier = sources[0]
    const memeSection = sources.every((e) => e.section && premier.section && e.section.titre === premier.section.titre && e.chapitreSlug === premier.chapitreSlug)
    if (!memeSection) vf.titre = 'Vrai ou faux'
    const total = sources.reduce((t, e) => t + e.indices.length, 0)
    vf.detail = `Vrai ou faux · ${total} affirmation${total > 1 ? 's' : ''}`
  }
  // Examen : ordre et numérotation des PARTIES de la copie (`partiesExamen`, la même fonction que
  // les documents) — chapitre(s) de chaque question tirés de ses éléments de la série A.
  if (estExamen(plan)) {
    const chapitresDe = (q: Brouillon) => [...new Set(q.indicesElements.map((i) => serie.elements[i].section?.chapitreSlug).filter((c): c is string => !!c))]
    return partiesExamen(liste, (q) => ({ processus: q.processus, chapitres: chapitresDe(q) }), plan.entete.organisationExamen ?? 'chapitre', chapitresExamen(plan))
      .flatMap((p) => p.questions)
      .map(({ element, numero }) => ({ ...element, numero }))
  }
  // Ordre d'impression : processus 1, 2, 3 (tri stable), numérotation continue.
  return ([1, 2, 3] as const).flatMap((p) => liste.filter((q) => q.processus === p)).map((q, i) => ({ ...q, numero: i + 1 }))
}

/** Titre de l'évaluation d'origine sans son préfixe « Évaluation — » / « Feuille d'exercices — ». */
export function titreSansPrefixe(plan: PlanDocument): string {
  const t = plan.entete.titre.replace(/^\s*(Feuille d'exercices|Évaluation|Remédiation)\s*[—–-]\s*/i, '').trim()
  return t || plan.entete.titreChapitre || plan.entete.titre
}

/** Nouvelle graine pour une instance de remédiation, ou `null` si la variante n'a plus aucun énoncé
 * inédit. Paliers :
 * 1. moteur habituel `graineInedite` (contrainte de la question d'origine, historique évité si
 *    possible), puis contrôle STRICT : jamais un énoncé de l'évaluation ni un énoncé déjà retenu ;
 * 2. même contrainte, recherche directe d'un énoncé inédit (≤ 200 ms) — le repli du moteur peut
 *    retomber sur un énoncé déjà vu quand la forme est rare ;
 * 3. même variante sans contrainte (≤ 200 ms) ;
 * 4. rien : la variante n'a que quelques énoncés (6gen38 « cos seul » : 4) tous déjà utilisés —
 *    l'exercice est omis plutôt que répété (« jamais deux fois le même énoncé »), et le panneau le
 *    signale. */
function graineRemediation(generatorId: string, adaptateur: Adaptateur, varianteId: string, contrainte: ContrainteTirage | undefined, vues: Set<string>, interdites: Set<string>): number | null {
  const tirage = (graine: number): { empreinte: string; profil: ProfilInstance | null } | null => {
    try {
      const instance = tirerInstance(adaptateur, varianteId, graine)
      return { empreinte: empreinteSection(generatorId, adaptateur.construireEnonce(instance)), profil: adaptateur.profilInstance ? adaptateur.profilInstance(instance) : null }
    } catch {
      return null
    }
  }
  const retenir = (graine: number, empreinte: string): number => {
    interdites.add(empreinte)
    vues.add(empreinte)
    return graine
  }
  const { graine } = graineInedite(generatorId, adaptateur, varianteId, vues, contrainte)
  const premier = tirage(graine)
  if (premier === null) return graine
  if (!interdites.has(premier.empreinte)) return retenir(graine, premier.empreinte)
  const filtres: ((p: ProfilInstance | null) => boolean)[] = [
    ...(contrainte ? [(p: ProfilInstance | null) => p === null || respecteContrainte(p, contrainte, true)] : []),
    () => true,
  ]
  for (const filtre of filtres) {
    const fin = Date.now() + 200
    for (let essai = 0; essai < 20000 && Date.now() < fin; essai++) {
      const g = tirerGraine()
      const t = tirage(g)
      if (t !== null && !interdites.has(t.empreinte) && filtre(t.profil)) return retenir(g, t.empreinte)
    }
  }
  return null
}

/** Contrainte de tirage qui reproduit le profil de l'instance d'origine (cas particulier exact,
 * ensemble exact des paramètres absents, type de question) et la calculatrice de l'évaluation. */
function contrainteDepuisOrigine(adaptateur: Adaptateur, inst: InstancePlan, calculatrice: 'interdite' | 'autorisee' | undefined): ContrainteTirage | undefined {
  const profil = profilDe(adaptateur, inst)
  if (!profil) return undefined
  const idsParametres = (adaptateur.parametresAuChoix ?? []).map((p) => p.id)
  const absents = (profil.casParticulier ? profil.casParticulier.split('+') : []).filter((c) => idsParametres.includes(c))
  return {
    cas: autresCaracteristiques(profil, idsParametres) ?? 'complet',
    idsParametres,
    parametresExclus: adaptateur.parametresAuChoix ? absents : null,
    forme: profil.forme,
    calculatrice,
  }
}

/** Plan de la feuille de remédiation (mode `exercice`, une seule série) — rendu ensuite par
 * `genererDocumentsDepuisPlan` comme n'importe quelle feuille d'exercices. Options d'en-tête
 * héritées de l'évaluation : formulaire en annexe (chapitres des questions retenues seulement),
 * deux colonnes, titres de section. */
export async function construirePlanRemediation(source: PlanDocument, numeros: number[], exercicesParQuestion: number, versionAmenagee: boolean): Promise<PlanDocument> {
  const serieA = source.series[0]
  const n = Math.max(1, Math.round(exercicesParQuestion))
  const choisies = questionsRemediables(source).filter((q) => numeros.includes(q.numero))
  if (!serieA || choisies.length === 0) throw new Error('Aucune question cochée.')

  // Énoncés de l'évaluation (TOUTES les séries) : jamais repris dans la remédiation.
  const interdites = new Set<string>()
  const vfEvaluation = new Map<string, Set<number>>()
  for (const serie of source.series) {
    for (const el of serie.elements) {
      if (el.type === 'exercice') {
        const adaptateur = EVALUATION_ADAPTER_REGISTRY[el.generatorId] as Adaptateur | undefined
        if (!adaptateur) continue
        for (const inst of el.instances) {
          try {
            interdites.add(empreinteSection(el.generatorId, adaptateur.construireEnonce(tirerInstance(adaptateur, inst.varianteId, inst.graine))))
          } catch {
            /* instance non reproductible */
          }
        }
      } else if (el.type === 'vraiFaux') {
        const cle = `${el.chapitreSlug}:${el.theme}`
        const deja = vfEvaluation.get(cle) ?? new Set<number>()
        el.indices.forEach((i) => deja.add(i))
        vfEvaluation.set(cle, deja)
      }
    }
  }
  const vues = new Set([...lireHistorique().map((h) => h.empreinte), ...interdites])
  const calculatrice = source.entete.mode === 'exercice' ? undefined : source.entete.calculatrice

  const elements: ElementPlan[] = []
  /** Questions dont la variante n'avait plus assez d'énoncés inédits (exercices omis). */
  const incomplete = new Set<number>()
  for (const q of choisies) {
    for (const indice of q.indicesElements) {
      const el = serieA.elements[indice]
      if (el.type === 'exercice') {
        const adaptateur = EVALUATION_ADAPTER_REGISTRY[el.generatorId] as Adaptateur | undefined
        if (!adaptateur) continue
        for (let k = 0; k < n; k++) {
          const instances = el.instances.flatMap((inst) => {
            const graine = graineRemediation(el.generatorId, adaptateur, inst.varianteId, contrainteDepuisOrigine(adaptateur, inst, calculatrice), vues, interdites)
            return graine === null ? [] : [{ ...inst, graine }]
          })
          if (instances.length > 0) elements.push({ ...el, instances })
          if (instances.length < el.instances.length) incomplete.add(q.numero)
        }
      } else if (el.type === 'vraiFaux') {
        const banque = await chargerThemeVraiFaux(el.chapitreSlug, el.theme)
        if (!banque) throw new Error(`Banque vrai/faux locale introuvable : ${el.chapitreSlug} / ${el.theme}`)
        const cle = `${el.chapitreSlug}:${el.theme}`
        const eviter = vfEvaluation.get(cle) ?? new Set<number>()
        // Autres affirmations des mêmes thèmes ; celles de l'évaluation seulement si la banque est
        // trop petite (`piocherIndices` les met en dernier). Jamais deux fois la même.
        const indices = piocherIndices(banque.length, el.indices.length * n, eviter)
        indices.forEach((i) => eviter.add(i))
        vfEvaluation.set(cle, eviter)
        elements.push({ ...el, indices })
      } else {
        elements.push(el)
      }
    }
  }

  const chapitresUtiles = source.chapitresSlugs.filter((slug) => elements.some((e) => e.section?.chapitreSlug === slug))
  const titreSource = titreSansPrefixe(source)
  return {
    version: 1,
    creeLe: new Date().toISOString(),
    levelSlug: source.levelSlug,
    entete: {
      ...source.entete,
      numero: undefined,
      titre: `Remédiation — ${titreSource}`,
      calculatrice: undefined,
      nombreSeries: 1,
      mode: 'exercice',
      versionAmenagee,
      afficherDuree: false,
      // Remédiation d'un examen : une feuille d'exercices ordinaire, sans réglages d'examen.
      typeDocument: undefined,
      organisationExamen: undefined,
      totalExamen: undefined,
      heureDepart: undefined,
      dureeExamen: undefined,
      session: undefined,
      consignesSupplementaires: undefined,
    },
    lignes: source.lignes,
    chapitresSlugs: chapitresUtiles.length > 0 ? chapitresUtiles : source.chapitresSlugs,
    series: [{ lettre: 'A', elements }],
    remediation: { titreSource, questions: choisies.map((q) => q.numero), exercicesParQuestion: n, ...(incomplete.size > 0 ? { incompletes: [...incomplete] } : {}) },
  }
}
