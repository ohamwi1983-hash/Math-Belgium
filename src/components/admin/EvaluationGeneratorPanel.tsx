import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { CartoucheEcole } from '../../entrainement/export/cartouche'
import { estConnecteActif, useCompte } from '../../lib/compteContexte'
import { enregistrerPlanCoffre, importerPlansLocaux, lirePlanCoffre, listerPlans, supprimerPlanCoffre, type PlanCoffre } from '../../lib/compteDonnees'
import { cartoucheDepuisCompte, ecoleParDefaut, messageErreur, plansLocauxAImporter } from '../../lib/compteValidation'
import { LEVELS } from '../../content/chaptersIndex'
import type { ChapterContent } from '../../content/types'
import { declencherTelechargement } from '../../entrainement/export/telechargerBlob'
import { RichText } from '../Math'
import { EVALUATION_ADAPTER_REGISTRY } from '../../lib/evaluationAdapterRegistry'
import { dureeEstimeeVariante, type OptionsEstimation } from '../../entrainement/export/niveauDifficulte'
import { RepereNiveauDuree } from './RepereNiveauDuree'
import {
  codesDuPlan,
  construirePlan,
  effacerHistorique,
  enregistrerDansHistorique,
  enregistrerPlan,
  genererDocumentsDepuisPlan,
  genererDocxDepuisPlan,
  lireHistorique,
  lirePlanDepuisJson,
  lirePlansEnregistres,
  peutGenererLocalement,
  respecteContrainte,
  supprimerPlanEnregistre,
  varianteAdmetCasParticulier,
  type Adaptateur,
  type ContrainteTirage,
  type DocumentGenere,
  type PlanDocument,
  type PlanEnregistre,
  type TypeDocx,
} from '../../lib/evaluationLocal'
import { construirePlanRemediation, questionsRemediables, titreSansPrefixe } from '../../lib/evaluationRemediation'
import { normaliserSigneMoins } from '../../lib/normaliserSaisie'
import { decoderMatiere } from '../../lib/carnetMatiere'
import {
  horaireExamen,
  lireDuree,
  lireHeure,
  lireTotal,
  mettreAEchelle,
  partiesExamen,
  sessionParDefaut,
  titreCourtChapitre,
  type OrganisationExamen,
  type TotalExamen,
} from '../../entrainement/export/examen'
import {
  CHAPITRE_FONCTIONNEL_SLUG,
  HEURES_PAR_NIVEAU,
  HEURES_SEMAINE_DEFAUT,
  NIVEAU_NUMERO,
  buildEvaluationUrl,
  catalogueVariantesExercice,
  libelleCasParticulier,
  parametresAuChoix,
  reglagesVariante,
  varianteDeCle,
  calculatriceIndispensable,
  varianteExigeCalculatrice,
  nomGenerateur,
  construireItemsPayload,
  deriveQuestionsComprehension,
  deriveQuestionsFormules,
  deriveQuestionsOuvertes,
  estChapitreFonctionnel,
  generateursPourSection,
  libelleGenerateurPanneau,
  resoudreLevelSlug,
  resoudreNiveauHeures,
  sommeParVariante,
  themesPourSection,
  type ChapitreAvecSections,
  type EnTeteEvaluation,
  type IdGenerateurPilote,
  type LigneSelection,
  type NiveauCode,
  type Processus,
  type QuestionOuverte,
  type TypeQuestionEvaluation,
} from '../../lib/evaluationPayload'

/** Clé composite (chapitre, section) — `sectionId` seul n'est pas unique entre 2 chapitres
 * (voir `LigneSelection.chapitreSlug`), toute table `Map` indexée par section DOIT donc en passer
 * par cette clé plutôt que `sectionId` seul. */
function cleSection(chapitreSlug: string, sectionId: string): string {
  return `${chapitreSlug}::${sectionId}`
}

const NIVEAUX: NiveauCode[] = ['4e', '5e', '6e']

const LABEL_PROCESSUS: Record<Processus, string> = { 1: 'Connaître', 2: 'Appliquer', 3: 'Transférer' }

const LABEL_TYPE: Record<TypeQuestionEvaluation, string> = {
  formule: 'Formule',
  demonstration: 'Formule + démonstration',
  comprehension: 'Questions ouvertes — compréhension',
  vraiFaux: 'Vrai / Faux (avec justification)',
  exercice: 'Exercice généré',
}

const POINTS_DEFAUT: Record<TypeQuestionEvaluation, number> = { formule: 1, demonstration: 3, comprehension: 2, vraiFaux: 1, exercice: 4 }
const MAX_VRAI_FAUX = 35
const MAX_EXERCICE = 10

/** Les questions ouvertes (démonstration/compréhension) embarquent leur énoncé ET leur corrigé en
 * TEXTE COMPLET dans l'URL générée (`buildEvaluationUrl` — contrairement à un exercice généré,
 * qui ne transmet qu'un identifiant + un nombre, plateforme-maths n'a aucune connaissance du
 * contenu de ce dépôt). Sélectionner des questions ouvertes sur un chapitre bien fourni peut donc
 * produire une URL de plusieurs dizaines de milliers de caractères — observé en pratique : 57 000
 * caractères pour les 22 questions ouvertes de "Fonctions exponentielles" toutes sélectionnées, et
 * même une sélection « raisonnable » d'une seule question par section dépasse déjà 14 Ko dans la
 * majorité des tirages (mesuré : médiane ~18 000, 81 % des tirages > 14 000 sur 100 essais) tant les
 * questions individuelles de ce chapitre sont longues. Ce n'est donc pas un cas limite rare : au-delà
 * de 2-3 sections avec question ouverte sur un chapitre dense, le dépassement devient la norme plutôt
 * que l'exception. 14 Ko est la limite documentée de Vercel (https://vercel.com/docs/errors/url_too_long),
 * jamais atteinte par les URL des autres types de lignes (exercice/vraiFaux), bien plus compactes.
 * Seuil choisi avec une marge confortable sous cette limite (et sous celle, plus basse, de certains
 * navigateurs/proxys) — mieux vaut un message clair invitant à répartir sur plusieurs feuilles que ce
 * lien cassé silencieusement chez l'hébergeur. */
const LONGUEUR_URL_MAX = 12_000

/** Une ligne `exercice`/`vraiFaux` PAR générateur/thème réellement câblé pour la section (voir
 * `generateursPourSection`/`themesPourSection`) — une section sans générateur/thème câblé (ex.
 * chapitre 1 de 4e, sections « Utiliser »/« Révision », hors périmètre pour l'instant) n'en reçoit
 * simplement aucune, plutôt qu'une ligne qui échouerait silencieusement à la génération.
 *
 * Prend UN OU PLUSIEURS chapitres (sélection multi-chapitres, voir `chapitresSlugs`) — chaque ligne
 * produite porte son `chapitreSlug` d'origine, jamais déduit implicitement d'un chapitre unique. */
function lignesInitiales(chapitres: ChapterContent[]): LigneSelection[] {
  const lignes: LigneSelection[] = []
  for (const chapitre of chapitres) {
    for (const section of chapitre.sections) {
      lignes.push({ chapitreSlug: chapitre.slug, sectionId: section.id, processus: 1, type: 'formule', nombre: 0, points: POINTS_DEFAUT.formule })
      lignes.push({ chapitreSlug: chapitre.slug, sectionId: section.id, processus: 1, type: 'demonstration', nombre: 0, points: POINTS_DEFAUT.demonstration })
      lignes.push({ chapitreSlug: chapitre.slug, sectionId: section.id, processus: 1, type: 'comprehension', nombre: 0, points: POINTS_DEFAUT.comprehension })
      for (const theme of themesPourSection(chapitre.slug, section.id)) {
        lignes.push({ chapitreSlug: chapitre.slug, sectionId: section.id, processus: 1, type: 'vraiFaux', cle: theme.quizTheme, nombre: 0, points: POINTS_DEFAUT.vraiFaux })
      }
      for (const generateur of generateursPourSection(chapitre.slug, section.id)) {
        lignes.push({
          chapitreSlug: chapitre.slug,
          sectionId: section.id,
          processus: generateur.processus ?? 2,
          type: 'exercice',
          cle: generateur.generatorId,
          nombre: 0,
          parVariante: {},
          points: POINTS_DEFAUT.exercice,
        })
      }
    }
  }
  return lignes
}

function aujourdhui(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Titre affiché dans le formulaire de remédiation : celui de l'évaluation, sans « Évaluation — ». */
function titreRemediation(e: PlanEnregistre): string {
  return titreSansPrefixe(e.plan)
}

/** « 32,5 » (virgule décimale). */
function nombreFrPanneau(x: number): string {
  return String(Math.round(x * 100) / 100).replace('.', ',')
}

function slugFichier(texte: string): string {
  return texte.replace(/[\\/:*?"<>|]/g, '-').trim()
}

/** Résumé flottant (position fixe, toujours visible) du nombre total de questions/exercices
 * sélectionnés — et, en mode évaluation, du total de points — et de la durée estimée cumulée (même
 * calcul que « Durée estimée » au-dessus du tableau), pour que l'admin/l'élève garde ce compte sous
 * les yeux en parcourant un long tableau. `masque` : la barre du bas (qui redonne le total) ou ce qui
 * la suit est à l'écran — le badge n'y recouvre plus les documents ni le formulaire de remédiation. */
function CompteurFlottant({ nombre, points, duree, masque }: { nombre: number; points?: number; duree?: number; masque?: boolean }) {
  return (
    <div className="admin-eval-compteur" aria-live="polite" data-masque={masque ? 'oui' : undefined} aria-hidden={masque || undefined}>
      {/* Un groupe par donnée : l'écart du conteneur (flex `gap`) ne sépare que les groupes. */}
      <span>
        <strong>{nombre}</strong> question{nombre > 1 ? 's' : ''}
        <span className="admin-eval-compteur-long">/exercice{nombre > 1 ? 's' : ''}</span>
      </span>
      {points !== undefined && (
        <span>
          · <strong>{nombreFrPanneau(points)}</strong> point{points > 1 ? "s" : ""}
        </span>
      )}
      {duree !== undefined && (
        <span>
          · ≈ <strong>{duree}</strong> min
        </span>
      )}
    </div>
  )
}

/** Compteur +/- partagé par toutes les lignes du tableau (démonstration/compréhension/vrai-faux/
 * exercice) — remplace l'ancien `<input type="number">` brut, plus confortable au doigt. */
function Stepper({
  valeur,
  max,
  min = 0,
  disabled,
  onChange,
}: {
  valeur: number
  max: number
  min?: number
  disabled?: boolean
  onChange: (prochaineValeur: number) => void
}) {
  return (
    <span className="admin-eval-stepper">
      <button
        type="button"
        className="admin-eval-stepper-btn"
        disabled={disabled || valeur <= min}
        onClick={() => onChange(Math.max(min, valeur - 1))}
        aria-label="Diminuer"
      >
        −
      </button>
      <span className="admin-eval-stepper-valeur">{valeur}</span>
      <button
        type="button"
        className="admin-eval-stepper-btn"
        disabled={disabled || valeur >= max}
        onClick={() => onChange(Math.min(max, valeur + 1))}
        aria-label="Augmenter"
      >
        +
      </button>
    </span>
  )
}

/** `mode==='exercice'` : page `/exercice` (publique, accessible aux élèves) — feuille d'exercices
 * sans numéro, calculatrice, ni séries anti-triche (voir `EnTeteEvaluation.mode`). `'evaluation'`
 * (défaut) = page `/admin` historique.
 *
 * `verrouille` : réservé à `ChapterExercicePage.tsx` (page `/{levelSlug}/{chapterSlug}/exercices`,
 * lien « Générer une feuille d'exercices » en bas de chaque page de chapitre) — pré-sélectionne
 * niveau/heures/chapitre d'après l'URL de la page de chapitre et REMPLACE les 3 sélecteurs
 * Niveau/Nombre d'heures/Chapitre par un simple rappel en lecture seule (un élève arrivant depuis
 * un chapitre précis n'a pas à en choisir un autre). */
export function EvaluationGeneratorPanel({
  mode = 'evaluation',
  verrouille,
}: {
  mode?: 'evaluation' | 'exercice'
  verrouille?: { levelSlug: string; chapitreSlug: string }
}) {
  const estExercice = mode === 'exercice'
  const niveauHeuresVerrouille = verrouille ? resoudreNiveauHeures(verrouille.levelSlug) : null
  const [numero, setNumero] = useState('1')
  const [date, setDate] = useState(aujourdhui)
  const [niveau, setNiveau] = useState<NiveauCode>(niveauHeuresVerrouille?.niveau ?? '6e')
  const [heures, setHeures] = useState(niveauHeuresVerrouille?.heures ?? '6H')
  /** Sélection multi-chapitres (même niveau/heures — un seul chantier plateforme-maths par envoi,
   * voir `EVALUATION_BASE_URL_PAR_LEVELSLUG`) : coché via `.admin-eval-chapitre-chip`, jamais un
   * `<select>` simple dès que `!verrouille`. En mode `verrouille`, reste figé à `[verrouille.chapitreSlug]`. */
  const [chapitresSlugs, setChapitresSlugs] = useState<string[]>(verrouille ? [verrouille.chapitreSlug] : [CHAPITRE_FONCTIONNEL_SLUG])
  const [titre, setTitre] = useState('')
  const [heuresSemaine, setHeuresSemaine] = useState(HEURES_SEMAINE_DEFAUT[niveauHeuresVerrouille?.niveau ?? '6e'])
  const [calculatrice, setCalculatrice] = useState<'interdite' | 'autorisee'>('interdite')
  const [nombreSeries, setNombreSeries] = useState(1)
  const nombreSeriesEffectif = estExercice ? 1 : nombreSeries
  const [afficherTitresSection, setAfficherTitresSection] = useState(false)
  const [versionAmenagee, setVersionAmenagee] = useState(false)
  // Durée estimée imprimée sur l'évaluation : seulement si le professeur le décide (décoché par défaut).
  const [afficherDuree, setAfficherDuree] = useState(false)
  // Annexe « Formulaire du chapitre » et économie de papier (deux colonnes) : décochés par défaut ;
  // un plan enregistré sans ces champs se recharge avec « non ».
  const [joindreFormulaire, setJoindreFormulaire] = useState(false)
  const [deuxColonnes, setDeuxColonnes] = useState(false)
  /** Type de document d'évaluation (décision de l'utilisateur, maquette X3) : évaluation ou EXAMEN —
   * bandeau « Examen · session », tableau des points par partie, parties par chapitre ou par
   * processus (`entrainement/export/examen.ts`). Réglages d'examen : saisies LIBRES (texte), lues
   * sans jamais bloquer la frappe ; une saisie illisible est signalée sous son champ, jamais effacée. */
  const [typeDocument, setTypeDocument] = useState<'evaluation' | 'examen'>('evaluation')
  const estExamen = !estExercice && typeDocument === 'examen'
  const [organisationExamen, setOrganisationExamen] = useState<OrganisationExamen>('chapitre')
  const [modeTotalExamen, setModeTotalExamen] = useState<'libre' | 'fixe'>('libre')
  /** Totaux saisis par partie (clé = `PartieExamen.cle`), texte tel que tapé. */
  const [totauxSaisis, setTotauxSaisis] = useState<Record<string, string>>({})
  const [heureDepart, setHeureDepart] = useState('')
  const [dureeExamen, setDureeExamen] = useState('')
  /** Vide = session déduite de la date (« Session de juin 2027 »). */
  const [session, setSession] = useState('')
  const [consignesSupplementaires, setConsignesSupplementaires] = useState('')
  /** Dernière génération locale : plan figé (graines) + documents produits. */
  const [planCourant, setPlanCourant] = useState<PlanDocument | null>(null)
  const [documents, setDocuments] = useState<DocumentGenere[]>([])
  const [enregistrees, setEnregistrees] = useState<PlanEnregistre[]>(() => lirePlansEnregistres())
  const [nombreHistorique, setNombreHistorique] = useState(() => lireHistorique().length)
  const [message, setMessage] = useState<string | null>(null)
  const urlsDocuments = useRef<string[]>([])
  const blocDocuments = useRef<HTMLDivElement>(null)
  /** Feuille de remédiation (`evaluationRemediation.ts`) : enregistrement dont le formulaire est
   * ouvert, questions cochées (numéros de la copie de la série A, aucune par défaut), exercices par
   * question, version aménagée. */
  const [remediationId, setRemediationId] = useState<string | null>(null)
  const [remediationCochees, setRemediationCochees] = useState<Set<number>>(() => new Set())
  const [remediationNombre, setRemediationNombre] = useState(2)
  const [remediationAmenagee, setRemediationAmenagee] = useState(false)
  const entreeImport = useRef<HTMLInputElement>(null)
  /** Sélection exclusive (groupe de type radio) : un seul processus affiché à la fois, jamais 2 ou 3
   * simultanément — voir `.admin-eval-processus-bar`. */
  const [processusActif, setProcessusActif] = useState<Processus>(1)
  /** Lignes « Formule » / « Formule + démonstration » dont la liste de choix est dépliée. */
  const [choixOuverts, setChoixOuverts] = useState<Set<string>>(() => new Set())
  const [erreur, setErreur] = useState<string | null>(null)
  const [urlGeneree, setUrlGeneree] = useState<string | null>(null)
  const [genereEnCours, setGenereEnCours] = useState(false)
  /** Nombre de fichiers téléchargés par la dernière génération LOCALE (4e, voir
   * `peutGenererLocalement`) — `null` tant qu'aucune génération locale n'a réussi. Distinct de
   * `urlGeneree` : la génération locale ne produit aucune URL/redirection, juste des téléchargements
   * directs dans l'onglet courant. */
  const [genereLocalementCompte, setGenereLocalementCompte] = useState<number | null>(null)

  /** Comptes professeurs : session, profil, écoles (`lib/compteContexte.tsx`). Connecté : école
   * choisie (par défaut celle du profil) + nom du professeur → cartouche des copies ; coffre du
   * compte au lieu du stockage du navigateur. Sans session (Supabase non configuré, `/admin`
   * historique) : cartouche historique et stockage local, comme avant. */
  const compte = useCompte()
  const connecte = estConnecteActif(compte)
  const [ecoleId, setEcoleId] = useState<string | null>(null)
  const ecoleChoisie = connecte ? (compte.ecoles.find((e) => e.id === ecoleId) ?? ecoleParDefaut(compte.ecoles)) : null
  const cartouche: CartoucheEcole | undefined = connecte ? cartoucheDepuisCompte(compte.profil, ecoleChoisie) : undefined
  const [coffre, setCoffre] = useState<PlanCoffre[] | null>(null)
  const [params, setParams] = useSearchParams()

  const levelSlug = resoudreLevelSlug(niveau, heures)
  const niveauEntry = levelSlug ? LEVELS.find((l) => l.slug === levelSlug) : undefined

  /** Chapitres fonctionnels parmi ceux cochés — `.admin-eval-chapitre-chip` désactive déjà toute
   * sélection d'un chapitre non câblé (voir plus bas), donc en pratique `chapitres` est toujours
   * entièrement fonctionnel ; le filtre reste une garantie défensive si `levelSlug` change sous les
   * pieds d'une sélection déjà faite. */
  const chapitres = (niveauEntry?.chapters.filter((c) => chapitresSlugs.includes(c.slug)) ?? []).filter((c) => estChapitreFonctionnel(levelSlug, c.slug))

  const [lignes, setLignes] = useState<LigneSelection[]>(() => lignesInitiales(chapitres))

  const apercusDemonstration = useMemo(() => {
    const map = new Map<string, QuestionOuverte[]>()
    for (const chapitre of chapitres) {
      for (const section of chapitre.sections) map.set(cleSection(chapitre.slug, section.id), deriveQuestionsOuvertes(chapitre.slug, section))
    }
    return map
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `chapitresSlugs.join('|')` + `levelSlug` identifient la sélection réelle (clés primitives stables), `chapitres` lui-même change de référence à chaque rendu.
  }, [chapitresSlugs.join('|'), levelSlug])

  const apercusFormule = useMemo(() => {
    const map = new Map<string, QuestionOuverte[]>()
    for (const chapitre of chapitres) {
      for (const section of chapitre.sections) map.set(cleSection(chapitre.slug, section.id), deriveQuestionsFormules(chapitre, section.id))
    }
    return map
    // eslint-disable-next-line react-hooks/exhaustive-deps -- voir apercusDemonstration ci-dessus.
  }, [chapitresSlugs.join('|'), levelSlug])

  const apercusComprehension = useMemo(() => {
    const map = new Map<string, number>()
    for (const chapitre of chapitres) {
      for (const section of chapitre.sections) map.set(cleSection(chapitre.slug, section.id), deriveQuestionsComprehension(chapitre.slug, section.id).length)
    }
    return map
    // eslint-disable-next-line react-hooks/exhaustive-deps -- voir apercusDemonstration ci-dessus.
  }, [chapitresSlugs.join('|'), levelSlug])

  function reglerNiveauHeures(prochainNiveau: NiveauCode, prochainesHeures: string) {
    setNiveau(prochainNiveau)
    setHeures(prochainesHeures)
    setHeuresSemaine(HEURES_SEMAINE_DEFAUT[prochainNiveau])
    const prochainLevelSlug = resoudreLevelSlug(prochainNiveau, prochainesHeures)
    const prochainNiveauEntry = prochainLevelSlug ? LEVELS.find((l) => l.slug === prochainLevelSlug) : undefined
    const prochainChapitre = prochainNiveauEntry?.chapters[0]
    setChapitresSlugs(prochainChapitre ? [prochainChapitre.slug] : [])
    setLignes(lignesInitiales(prochainChapitre ? [prochainChapitre] : []))
    setUrlGeneree(null)
    setGenereLocalementCompte(null)
  }

  function changerNiveau(prochain: NiveauCode) {
    reglerNiveauHeures(prochain, HEURES_PAR_NIVEAU[prochain][0] ?? '')
  }

  /** Coche/décoche UN chapitre dans la sélection multi-chapitres — `setLignes` AJOUTE (nouvelles
   * lignes à zéro, `lignesInitiales`) ou RETIRE (toutes les lignes de ce chapitre) sans jamais
   * toucher aux lignes des autres chapitres déjà cochés : les comptages déjà saisis ailleurs
   * survivent au basculement d'un chapitre voisin. */
  function basculerChapitre(slug: string) {
    const etaitCoche = chapitresSlugs.includes(slug)
    setChapitresSlugs((prev) => (etaitCoche ? prev.filter((s) => s !== slug) : [...prev, slug]))
    setLignes((prev) => {
      if (etaitCoche) return prev.filter((l) => l.chapitreSlug !== slug)
      const chapitreObj = niveauEntry?.chapters.find((c) => c.slug === slug)
      return chapitreObj ? [...prev, ...lignesInitiales([chapitreObj])] : prev
    })
    setUrlGeneree(null)
    setGenereLocalementCompte(null)
  }

  function selectionnerProcessus(processus: Processus) {
    setProcessusActif(processus)
  }

  function mettreAJourLigne(chapitreSlug: string, sectionId: string, type: TypeQuestionEvaluation, cle: string | undefined, patch: Partial<LigneSelection>) {
    setLignes((prev) =>
      prev.map((l) => (l.chapitreSlug === chapitreSlug && l.sectionId === sectionId && l.type === type && l.cle === cle ? { ...l, ...patch } : l)),
    )
    setUrlGeneree(null)
    setGenereLocalementCompte(null)
  }

  /** Met à jour le nombre d'exercices d'UNE famille/variante précise, pour UN générateur précis
   * (ligne `type==='exercice'`, `cle===generatorId`) — `nombre` de la ligne reste toujours la
   * somme de `parVariante` (voir `sommeParVariante`), jamais éditable directement pour ce type. */
  function mettreAJourVariante(chapitreSlug: string, sectionId: string, generatorId: string, varianteId: string, nombre: number) {
    setLignes((prev) =>
      prev.map((l) => {
        if (l.chapitreSlug !== chapitreSlug || l.sectionId !== sectionId || l.type !== 'exercice' || l.cle !== generatorId) return l
        const parVariante = { ...l.parVariante, [varianteId]: nombre }
        return { ...l, parVariante, nombre: sommeParVariante(parVariante) }
      }),
    )
    setUrlGeneree(null)
    setGenereLocalementCompte(null)
  }

  /** Applique une transformation à LA ligne `type==='exercice'` d'un générateur. */
  function modifierLigneExercice(chapitreSlug: string, sectionId: string, generatorId: string, f: (l: LigneSelection) => LigneSelection) {
    setLignes((prev) => prev.map((l) => (l.chapitreSlug === chapitreSlug && l.sectionId === sectionId && l.type === 'exercice' && l.cle === generatorId ? f(l) : l)))
    setUrlGeneree(null)
    setGenereLocalementCompte(null)
  }

  /** Case « inclure un cas particulier » d'UNE variante (clé de `parVariante`, éventuellement dupliquée). */
  function mettreAJourCasParticulier(chapitreSlug: string, sectionId: string, generatorId: string, cle: string, inclure: boolean) {
    modifierLigneExercice(chapitreSlug, sectionId, generatorId, (l) => ({ ...l, casParticulierParVariante: { ...l.casParticulierParVariante, [cle]: inclure } }))
  }

  /** Case d'un paramètre au choix (amplitude, déphasage…) d'UNE variante : décochée = paramètre absent
   * des questions de cette variante (`LigneSelection.parametresExclusParVariante`). */
  function basculerParametre(chapitreSlug: string, sectionId: string, generatorId: string, cle: string, parametreId: string, inclure: boolean) {
    modifierLigneExercice(chapitreSlug, sectionId, generatorId, (l) => {
      const exclus = new Set(reglagesVariante(l, cle).parametresExclus)
      if (inclure) exclus.delete(parametreId)
      else exclus.add(parametreId)
      return { ...l, parametresExclusParVariante: { ...l.parametresExclusParVariante, [cle]: [...exclus] } }
    })
  }

  /** Duplique une variante pour lui donner d'AUTRES réglages (ex. un graphe avec translation
   * horizontale et un autre sans, dans la même famille) : nouvelle clé « id~n », 1 question,
   * mêmes points et mêmes réglages de départ que la variante d'origine. */
  function dupliquerVariante(chapitreSlug: string, sectionId: string, generatorId: string, cle: string) {
    modifierLigneExercice(chapitreSlug, sectionId, generatorId, (l) => {
      const id = varianteDeCle(cle)
      const existants = Object.keys(l.parVariante ?? {}).filter((k) => varianteDeCle(k) === id)
      let n = 2
      while (existants.includes(`${id}~${n}`)) n++
      const nouvelle = `${id}~${n}`
      const reglages = reglagesVariante(l, cle)
      const parVariante = { ...l.parVariante, [nouvelle]: 1 }
      return {
        ...l,
        parVariante,
        nombre: sommeParVariante(parVariante),
        pointsParVariante: { ...l.pointsParVariante, [nouvelle]: l.pointsParVariante?.[cle] ?? l.points },
        parametresExclusParVariante: { ...l.parametresExclusParVariante, [nouvelle]: reglages.parametresExclus },
        casParticulierParVariante: { ...l.casParticulierParVariante, [nouvelle]: false },
      }
    })
  }

  /** Retire une variante DUPLIQUÉE (et ses réglages). */
  function retirerVarianteDupliquee(chapitreSlug: string, sectionId: string, generatorId: string, cle: string) {
    modifierLigneExercice(chapitreSlug, sectionId, generatorId, (l) => {
      const sans = <T,>(r: Record<string, T> | undefined) => Object.fromEntries(Object.entries(r ?? {}).filter(([k]) => k !== cle)) as Record<string, T>
      const parVariante = sans(l.parVariante)
      return {
        ...l,
        parVariante,
        nombre: sommeParVariante(parVariante),
        pointsParVariante: sans(l.pointsParVariante),
        parametresExclusParVariante: sans(l.parametresExclusParVariante),
        casParticulierParVariante: sans(l.casParticulierParVariante),
      }
    })
  }

  /** Met à jour le barème d'UNE famille/variante précise, pour UN générateur précis (ligne
   * `type==='exercice'`, `cle===generatorId`) — chaque variante peut valoir un nombre de points
   * différent, voir `LigneSelection.pointsParVariante`. */
  function mettreAJourPointsVariante(chapitreSlug: string, sectionId: string, generatorId: string, varianteId: string, points: number) {
    setLignes((prev) =>
      prev.map((l) => {
        if (l.chapitreSlug !== chapitreSlug || l.sectionId !== sectionId || l.type !== 'exercice' || l.cle !== generatorId) return l
        return { ...l, pointsParVariante: { ...l.pointsParVariante, [varianteId]: points } }
      }),
    )
    setUrlGeneree(null)
    setGenereLocalementCompte(null)
  }

  /** Décision de l'utilisateur : en évaluation « calculatrice interdite », une variante qui exige
   * toujours la calculatrice (`calculatriceIndispensable` en liste) est exclue — rangée grisée, ni
   * comptée ni tirée (`construireItemsPayload` la retire aussi). */
  function varianteExclue(generatorId: string, cle: string): boolean {
    return !estExercice && calculatrice === 'interdite' && varianteExigeCalculatrice(generatorId, varianteDeCle(cle))
  }

  function nombreLigne(ligne: LigneSelection): number {
    if (ligne.type !== 'exercice') return ligne.nombre
    return Object.entries(ligne.parVariante ?? {}).reduce((total, [cle, n]) => total + (varianteExclue(ligne.cle ?? '', cle) ? 0 : n), 0)
  }

  /** Points totaux d'une ligne — pour `type==='exercice'`, somme par variante (`pointsParVariante`,
   * replié sur `points` tant qu'une variante n'a pas encore son propre barème édité) ; pour les
   * autres types, simple produit `points × nombre` (pas de notion de variante). */
  function pointsLigne(ligne: LigneSelection): number {
    if (ligne.type === 'exercice') {
      return Object.entries(ligne.parVariante ?? {}).filter(([cle]) => !varianteExclue(ligne.cle ?? '', cle)).reduce(
        (total, [varianteId, nombre]) => total + (ligne.pointsParVariante?.[varianteId] ?? ligne.points) * nombre,
        0,
      )
    }
    if (ligne.choix?.length) return ligne.choix.reduce((total, id) => total + (ligne.pointsParChoix?.[id] ?? ligne.points), 0)
    return ligne.points * ligne.nombre
  }

  /** Identifiant de variante pour l'estimation : `null` (tirage libre) si l'adaptateur n'a pas cette
   * variante dans son catalogue (entrée par défaut « Tirage aléatoire ») — comme `tirerInstance`. */
  function varianteEstimation(adaptateur: Adaptateur, cle: string): string | null {
    const id = varianteDeCle(cle)
    // Groupe « à verdict » : l'estimation tire un membre au hasard à chaque tirage (`niveauDifficulte.ts`).
    return adaptateur.catalogueVariantes?.some((v) => v.id === id) || adaptateur.groupesVerdict?.some((g) => g.id === id) ? id : null
  }

  /** Réglages d'estimation d'une rangée de variante (repère « niv. · ≈ min » ET durée de l'en-tête,
   * même cache) : en évaluation, seulement les instances que le moteur peut tirer pour cette rangée
   * (`respecteContrainte` : exercice complet, paramètres décochés absents, calculatrice) ; en feuille
   * d'exercices, tirages libres de la variante (le moteur n'y impose rien). Le cas particulier coché
   * (une seule question de la variante) n'est pas compté à part. */
  function optionsEstimation(ligne: LigneSelection, cle: string): OptionsEstimation<never> | undefined {
    if (estExercice) return undefined
    const adaptateur = EVALUATION_ADAPTER_REGISTRY[ligne.cle ?? ''] as Adaptateur | undefined
    const profilDe = adaptateur?.profilInstance
    if (!adaptateur || !profilDe) return undefined
    const idsParametres = (adaptateur.parametresAuChoix ?? []).map((p) => p.id)
    const parametresExclus = adaptateur.parametresAuChoix ? reglagesVariante(ligne, cle).parametresExclus.filter((id) => idsParametres.includes(id)) : null
    const contrainte: ContrainteTirage = { cas: 'complet', idsParametres, parametresExclus, calculatrice }
    return {
      filtre: (instance) => {
        try {
          return respecteContrainte(profilDe(instance), contrainte, true)
        } catch {
          return false
        }
      },
      cleFiltre: `evaluation|${calculatrice}|${parametresExclus ? [...parametresExclus].sort().join(',') : '-'}`,
    }
  }

  /** Phrase de l'infobulle du repère : quels réglages de la rangée l'estimation respecte. */
  function texteReglagesEstimation(ligne: LigneSelection, cle: string): string {
    if (estExercice) return 'Feuille d’exercices : tirages libres de la variante, comme la feuille.'
    if (!optionsEstimation(ligne, cle)) return 'Tirages libres de la variante (générateur sans tirage équilibré).'
    const reglages = reglagesVariante(ligne, cle)
    return `Évaluation : exercices complets${reglages.parametresExclus.length > 0 ? ', paramètres décochés absents' : ''}, calculatrice ${calculatrice === 'interdite' ? 'interdite' : 'autorisée'}${reglages.inclureCasParticulier ? ' ; le cas particulier coché n’est pas compté à part' : ''}.`
  }

  /** Durée indicative d'une ligne, en minutes — exercice : durée par exercice de la grille commune,
   * ESTIMÉE par variante avant tout tirage (`dureeEstimeeVariante`, mêmes réglages et même cache que
   * le repère de la rangée) × nombre, variantes exclues non comptées ; chapitre pas encore noté :
   * constante `dureeMinutes` de l'adaptateur ; vrai/faux : 2 min par affirmation ; sinon ≈ 2,5 min
   * par point (même règle que la durée imprimée sur la copie). */
  function dureeLigne(ligne: LigneSelection, points: number): number {
    const adaptateur = ligne.type === 'exercice' ? EVALUATION_ADAPTER_REGISTRY[ligne.cle ?? ''] : undefined
    if (adaptateur) {
      const parVariante = Object.entries(ligne.parVariante ?? {}).filter(([cle, n]) => n > 0 && !varianteExclue(ligne.cle ?? '', cle))
      const durees = parVariante.map(([cle, n]) => {
        const d = dureeEstimeeVariante(adaptateur, varianteEstimation(adaptateur, cle), optionsEstimation(ligne, cle))
        return d === undefined ? undefined : d * n
      })
      if (parVariante.length > 0 && durees.every((d): d is number => d !== undefined)) return durees.reduce((t, d) => t + d, 0)
      const d = dureeEstimeeVariante(adaptateur, null)
      if (d !== undefined) return d * nombreLigne(ligne)
    }
    if (ligne.type === 'vraiFaux') return 2 * ligne.nombre
    return points * 2.5
  }

  const totalNombre = lignes.reduce((total, l) => total + nombreLigne(l), 0)
  const totalPoints = lignes.reduce((total, l) => total + pointsLigne(l), 0)
  const pointsParProcessus = ([1, 2, 3] as const).map((p) => lignes.filter((l) => l.processus === p).reduce((t, l) => t + pointsLigne(l), 0))
  /** Lignes choisies dont le générateur exige toujours une calculatrice (avertissement si interdite). */
  const generateursACalculatrice = lignes
    .filter(
      (l) =>
        l.type === 'exercice' &&
        l.nombre > 0 &&
        l.cle &&
        calculatriceIndispensable(
          l.cle as IdGenerateurPilote,
          Object.entries(l.parVariante ?? {}).filter(([v, n]) => n > 0 && !varianteExclue(l.cle ?? '', v)).map(([v]) => varianteDeCle(v)),
        ),
    )
    .map((l) => `« ${nomGenerateur(l.cle as IdGenerateurPilote)} »`)
  const dureesParProcessus = ([1, 2, 3] as const).map((p) =>
    lignes.filter((l) => l.processus === p && nombreLigne(l) > 0).reduce((t, l) => t + dureeLigne(l, pointsLigne(l)), 0),
  )
  const dureeEstimee = Math.max(5, Math.ceil(dureesParProcessus.reduce((t, d) => t + d, 0) / 5) * 5)

  /** Examen : parties de la sélection, avec la MÊME fonction que les documents (`partiesExamen`) —
   * une ligne active = un élément (ses questions et ses points), tous les vrai/faux = UNE question
   * (comme `itemVraiFauxRegroupe`, au rang du premier). Totaux en direct : libre → somme des points ;
   * fixé → total saisi (lisible et possible : au moins 0,5 pt par question), sinon la somme. */
  const chapitresDuPanneau = chapitres.map((c) => ({ slug: c.slug, titre: c.title, titreCourt: titreCourtChapitre(c.slug, c.title) }))
  const partiesPanneau = (() => {
    if (!estExamen) return []
    type El = { processus: Processus; chapitres: string[]; points: number; questions: number }
    const elements: El[] = []
    let vraiFaux: El | null = null
    for (const l of lignes) {
      if (nombreLigne(l) === 0) continue
      if (l.type === 'vraiFaux') {
        if (!vraiFaux) elements.push((vraiFaux = { processus: l.processus, chapitres: [], points: 0, questions: 1 }))
        if (!vraiFaux.chapitres.includes(l.chapitreSlug)) vraiFaux.chapitres.push(l.chapitreSlug)
        vraiFaux.points += pointsLigne(l)
        continue
      }
      // Exercices regroupés a), b), c) : le total fixé se répartit LIGNE par ligne (0,5 pt au moins
      // chacune, `itemsDuDocument`) — chaque instance compte donc ici, regroupée ou non.
      elements.push({ processus: l.processus, chapitres: [l.chapitreSlug], points: pointsLigne(l), questions: nombreLigne(l) })
    }
    return partiesExamen(elements, (e) => e, organisationExamen, chapitresDuPanneau).map((p) => {
      const somme = p.questions.reduce((t, q) => t + q.element.points, 0)
      const nombreQuestions = p.questions.reduce((t, q) => t + q.element.questions, 0)
      const saisie = totauxSaisis[p.cle] ?? ''
      const lecture = lireTotal(saisie)
      let message: string | null = null
      let total = somme
      if (modeTotalExamen === 'fixe') {
        if (lecture.etat === 'illisible') message = `${lecture.message} Points de la partie gardés tels quels.`
        else if (lecture.etat === 'ok') {
          // Même contrôle que le pipeline : chaque question garde au moins 0,5 pt.
          if (mettreAEchelle(Array.from({ length: nombreQuestions }, () => 1), lecture.valeur) === null)
            message = `Trop peu de points : ${nombreQuestions} question${nombreQuestions > 1 ? 's' : ''} demandent au moins ${String(nombreQuestions * 0.5).replace('.', ',')} pts (0,5 pt chacune). Points gardés tels quels.`
          else total = lecture.valeur
        }
      }
      return { cle: p.cle, romain: p.romain, titre: p.titre, somme, total, message, saisie, valeurFixee: modeTotalExamen === 'fixe' && lecture.etat === 'ok' && !message ? lecture.valeur : null }
    })
  })()
  const totalExamen = partiesPanneau.reduce((t, p) => t + p.total, 0)
  /** Total affiché (badge flottant, barre du bas) : celui de l'examen (mis à l'échelle si fixé). */
  const totalAffiche = estExamen ? totalExamen : totalPoints
  const lectureHeure = lireHeure(heureDepart)
  const lectureDuree = lireDuree(dureeExamen)
  const apercuHoraire = horaireExamen(heureDepart, dureeExamen)
  const sessionDefaut = sessionParDefaut(date)

  /** Bouton « Aller au réglage » des variantes exclues faute de calculatrice : fait défiler jusqu'au
   * sélecteur « Calculatrice », lui donne le focus et le surligne un instant. Choix : on ne bascule PAS
   * le réglage d'office — il vaut pour toute l'évaluation (« autorisée » ne tire plus que des cas qui
   * exigent la calculatrice, dans TOUS les générateurs) ; le professeur décide en connaissance de cause. */
  const selectCalculatrice = useRef<HTMLSelectElement>(null)
  const [calculatriceSurlignee, setCalculatriceSurlignee] = useState(false)
  function allerAuReglageCalculatrice() {
    const el = selectCalculatrice.current
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.focus({ preventScroll: true })
    setCalculatriceSurlignee(true)
    window.setTimeout(() => setCalculatriceSurlignee(false), 2600)
  }

  /** Badge flottant masqué dès que la barre du bas (qui redonne le total) est à l'écran ou dépassée :
   * il ne recouvre plus les documents générés ni le formulaire de remédiation. */
  const barreDuBas = useRef<HTMLDivElement>(null)
  const [compteurMasque, setCompteurMasque] = useState(false)
  const avecTableau = chapitres.length > 0
  useEffect(() => {
    const el = barreDuBas.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const obs = new IntersectionObserver(([e]) => setCompteurMasque(e.isIntersecting || e.boundingClientRect.top < 0))
    obs.observe(el)
    return () => obs.disconnect()
  }, [avecTableau])

  function nomBase(plan: PlanDocument): string {
    return slugFichier(plan.entete.titre)
  }

  function nomFichier(plan: PlanDocument, doc: DocumentGenere): string {
    return `${nomBase(plan)} — ${doc.suffixe}.html`
  }

  function urlDocument(doc: DocumentGenere): string {
    const url = URL.createObjectURL(doc.blob)
    urlsDocuments.current.push(url)
    return url
  }

  function ouvrirDocument(doc: DocumentGenere, imprimer: boolean) {
    window.open(urlDocument(doc) + (imprimer ? '#imprimer' : ''), '_blank')
  }

  function toutTelecharger(plan: PlanDocument, docs: DocumentGenere[]) {
    for (const doc of docs) declencherTelechargement(doc.blob, nomFichier(plan, doc))
  }

  async function rendrePlan(planBrut: PlanDocument, nouveau: boolean, cartoucheForce?: CartoucheEcole) {
    // Connecté : le cartouche (école choisie, nom du profil) est celui du panneau, même pour un plan
    // rechargé (mêmes exercices, école du moment). Sans session : plan tel quel.
    const cartoucheRendu = cartoucheForce ?? cartouche
    const plan: PlanDocument = cartoucheRendu ? { ...planBrut, entete: { ...planBrut.entete, cartouche: cartoucheRendu } } : planBrut
    setErreur(null)
    setMessage(null)
    setUrlGeneree(null)
    setGenereEnCours(true)
    try {
      for (const u of urlsDocuments.current) URL.revokeObjectURL(u)
      urlsDocuments.current = []
      const docs = await genererDocumentsDepuisPlan(plan)
      setPlanCourant(plan)
      setDocuments(docs)
      setGenereLocalementCompte(docs.length)
      if (nouveau) {
        enregistrerDansHistorique(plan)
        setNombreHistorique(lireHistorique().length)
      }
    } catch (e) {
      console.error(e)
      setErreur('Erreur pendant la génération — réessaie.')
    } finally {
      setGenereEnCours(false)
    }
  }

  async function telechargerWord(lettre: string, type: TypeDocx = 'copie') {
    if (!planCourant) return
    setGenereEnCours(true)
    try {
      const blob = await genererDocxDepuisPlan(planCourant, lettre, type)
      if (blob) declencherTelechargement(blob, `${nomBase(planCourant)} — serie-${lettre}-${type}.docx`)
    } catch (e) {
      console.error(e)
      setErreur('Erreur pendant la génération du fichier Word.')
    } finally {
      setGenereEnCours(false)
    }
  }

  function ouvrirRemediation(e: PlanEnregistre) {
    if (remediationId === e.id) {
      setRemediationId(null)
      return
    }
    setRemediationId(e.id)
    setRemediationCochees(new Set())
    setRemediationNombre(2)
    setRemediationAmenagee(!!e.plan.entete.versionAmenagee)
  }

  async function creerRemediation(e: PlanEnregistre) {
    if (remediationCochees.size === 0) return
    setGenereEnCours(true)
    let plan: PlanDocument | null = null
    try {
      plan = await construirePlanRemediation(e.plan, [...remediationCochees], remediationNombre, remediationAmenagee)
    } catch (err) {
      console.error(err)
      setErreur('Erreur pendant la création de la feuille de remédiation — réessaie.')
      setGenereEnCours(false)
      return
    }
    await rendrePlan(plan, true)
    const incompletes = plan.remediation?.incompletes ?? []
    setMessage(
      `Feuille de remédiation créée (${remediationCochees.size} question${remediationCochees.size > 1 ? 's' : ''}) — documents ci-dessus.` +
        (incompletes.length > 0
          ? ` ${incompletes.length > 1 ? 'Questions' : 'Question'} ${incompletes.join(', ')} : moins d'exercices que demandé — le générateur n'a pas d'autre énoncé que ceux déjà donnés (jamais de répétition).`
          : ''),
    )
    requestAnimationFrame(() => blocDocuments.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  /** Recharge un plan enregistré : la sélection du panneau ET les graines (mêmes exercices). */
  function chargerPlan(plan: PlanDocument) {
    // Connecté : l'école enregistrée dans le plan est resélectionnée si elle est toujours dans le profil.
    let cartoucheCharge: CartoucheEcole | undefined
    if (connecte) {
      const c = plan.entete.cartouche
      const ecole = c ? compte.ecoles.find((e) => e.nom.trim() === c.ecoleNom && e.adresse.trim() === c.ecoleAdresse) : undefined
      if (ecole) setEcoleId(ecole.id)
      cartoucheCharge = cartoucheDepuisCompte(compte.profil, ecole ?? ecoleChoisie)
    }
    // Feuille de remédiation : ses `lignes` sont celles de l'évaluation d'origine — on rend les
    // documents sans toucher à la sélection du panneau.
    if (plan.remediation) {
      void rendrePlan(plan, false, cartoucheCharge)
      return
    }
    const nh = resoudreNiveauHeures(plan.levelSlug)
    if (verrouille && plan.levelSlug !== verrouille.levelSlug) {
      setErreur('Ce fichier concerne un autre niveau que cette page.')
      return
    }
    if (nh) {
      setNiveau(nh.niveau)
      setHeures(nh.heures)
    }
    if (!verrouille) setChapitresSlugs(plan.chapitresSlugs)
    // Un plan enregistré avant l'ajout d'un type de ligne (ex. « Formule ») n'a pas cette ligne :
    // on repart des lignes initiales des chapitres du plan, en y reprenant chaque ligne enregistrée.
    const chapitresPlan = LEVELS.find((l) => l.slug === plan.levelSlug)?.chapters.filter((c) => plan.chapitresSlugs.includes(c.slug)) ?? []
    const memeLigne = (a: LigneSelection, b: LigneSelection) =>
      a.chapitreSlug === b.chapitreSlug && a.sectionId === b.sectionId && a.type === b.type && (a.cle ?? '') === (b.cle ?? '')
    const base = lignesInitiales(chapitresPlan)
    setLignes([...base.map((b) => plan.lignes.find((l) => memeLigne(l, b)) ?? b), ...plan.lignes.filter((l) => !base.some((b) => memeLigne(l, b)))])
    setTitre(plan.entete.titre)
    setDate(plan.entete.date)
    if (plan.entete.numero !== undefined) setNumero(plan.entete.numero)
    setHeuresSemaine(plan.entete.heuresSemaine)
    if (plan.entete.calculatrice) setCalculatrice(plan.entete.calculatrice)
    setNombreSeries(plan.series.length)
    setAfficherTitresSection(plan.entete.afficherTitresSection)
    setVersionAmenagee(!!plan.entete.versionAmenagee)
    setAfficherDuree(!!plan.entete.afficherDuree)
    setJoindreFormulaire(!!plan.entete.joindreFormulaire)
    setDeuxColonnes(!!plan.entete.deuxColonnes)
    // Examen : un plan enregistré sans ces champs se recharge comme une évaluation.
    const ex = plan.entete
    setTypeDocument(ex.typeDocument === 'examen' ? 'examen' : 'evaluation')
    setOrganisationExamen(ex.organisationExamen ?? 'chapitre')
    setModeTotalExamen(ex.totalExamen?.mode === 'fixe' ? 'fixe' : 'libre')
    setTotauxSaisis(ex.totalExamen?.mode === 'fixe' ? Object.fromEntries(Object.entries(ex.totalExamen.parPartie).map(([k, v]) => [k, String(v).replace('.', ',')])) : {})
    setHeureDepart(ex.heureDepart ?? '')
    setDureeExamen(ex.dureeExamen ?? '')
    setSession(ex.session ?? '')
    setConsignesSupplementaires(ex.consignesSupplementaires ?? '')
    void rendrePlan(plan, false, cartoucheCharge)
  }

  // Coffre du compte : chargé dès la connexion.
  const clientCoffre = connecte ? compte.client : null
  useEffect(() => {
    if (!clientCoffre) return
    let annule = false
    listerPlans(clientCoffre)
      .then((liste) => !annule && setCoffre(liste))
      .catch((e) => !annule && setErreur(messageErreur(e)))
    return () => {
      annule = true
    }
  }, [clientCoffre])

  // « Charger dans le panneau » depuis /coffre : `?plan=<id>`, lu une fois connecté.
  const planDemande = params.get('plan')
  const planDemandeTraite = useRef<string | null>(null)
  useEffect(() => {
    if (!clientCoffre || !planDemande || planDemandeTraite.current === planDemande) return
    planDemandeTraite.current = planDemande
    lirePlanCoffre(clientCoffre, planDemande)
      .then((p) => {
        if (!p) {
          setErreur('Enregistrement introuvable dans ton coffre.')
          return
        }
        chargerPlan(p.contenu)
        setMessage(`« ${p.titre} » chargé depuis ton coffre.`)
        const suivant = new URLSearchParams(params)
        suivant.delete('plan')
        setParams(suivant, { replace: true })
      })
      .catch((e) => setErreur(messageErreur(e)))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- une seule fois par plan demandé (garde `planDemandeTraite`).
  }, [clientCoffre, planDemande])

  // « Créer une évaluation sur la matière vue » depuis le carnet (`/carnet`) : `?matiere=…`
  // (`lib/carnetMatiere.ts`) coche les chapitres et met UN exercice (première variante disponible)
  // sur chaque générateur des sections vues ; le professeur ajuste ensuite. Sans ce paramètre :
  // comportement inchangé. Ignoré sur une page verrouillée (`/…/exercices`).
  const matiereDemandee = verrouille ? null : params.get('matiere')
  const matiereTraitee = useRef<string | null>(null)
  const [bandeauCarnet, setBandeauCarnet] = useState<string | null>(null)
  useEffect(() => {
    if (!matiereDemandee || matiereTraitee.current === matiereDemandee) return
    matiereTraitee.current = matiereDemandee
    const m = decoderMatiere(matiereDemandee)
    const nh = m ? resoudreNiveauHeures(m.levelSlug) : null
    const niveauCarnet = m ? LEVELS.find((l) => l.slug === m.levelSlug) : undefined
    const chapitresCarnet = m && niveauCarnet ? niveauCarnet.chapters.filter((c) => m.chapitres.some((x) => x.slug === c.slug) && estChapitreFonctionnel(m.levelSlug, c.slug)) : []
    const suivant = new URLSearchParams(params)
    const depuis = /^\d{4}-\d{2}-\d{2}$/.test(suivant.get('depuis') ?? '') ? (suivant.get('depuis') as string).split('-').reverse().join('/') : ''
    const classe = (suivant.get('classe') ?? '').trim().slice(0, 40)
    ;['matiere', 'depuis', 'classe'].forEach((k) => suivant.delete(k))
    setParams(suivant, { replace: true })
    if (!m || !nh || chapitresCarnet.length === 0) {
      setErreur('Matière du carnet illisible : choisis les chapitres à la main.')
      return
    }
    const lignesCarnet: LigneSelection[] = []
    const processusChoisis: Processus[] = []
    for (const l of lignesInitiales(chapitresCarnet)) {
      const vue = l.type === 'exercice' && m.chapitres.find((x) => x.slug === l.chapitreSlug)?.sections.includes(l.sectionId)
      const variante = vue ? catalogueVariantesExercice(l.cle as IdGenerateurPilote, 'evaluation', []).find((v) => !varianteExclue(l.cle ?? '', v.id)) : undefined
      if (variante) processusChoisis.push(l.processus)
      lignesCarnet.push(variante ? { ...l, parVariante: { [variante.id]: 1 }, nombre: 1 } : l)
    }
    const generateurs = processusChoisis.length
    setNiveau(nh.niveau)
    setHeures(nh.heures)
    setHeuresSemaine(HEURES_SEMAINE_DEFAUT[nh.niveau])
    setChapitresSlugs(chapitresCarnet.map((c) => c.slug))
    setLignes(lignesCarnet)
    setProcessusActif(processusChoisis[0] ?? 1)
    setUrlGeneree(null)
    setGenereLocalementCompte(null)
    const sections = m.chapitres.reduce((t, c) => t + c.sections.length, 0)
    setBandeauCarnet(
      `Matière vue${classe ? ` en ${classe}` : ''}${depuis ? ` depuis le ${depuis}` : ''} : ${sections} section${sections > 1 ? 's' : ''}, ` +
        (generateurs > 0
          ? `${generateurs} générateur${generateurs > 1 ? 's' : ''} pré-sélectionné${generateurs > 1 ? 's' : ''} (un exercice chacun). Ajuste les nombres et ajoute d'autres questions si besoin.`
          : 'aucun générateur dans ces sections : choisis les questions à la main.'),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- une seule fois par matière demandée (garde `matiereTraitee`).
  }, [matiereDemandee])

  function choisirEcole(id: string) {
    setEcoleId(id)
    const ecole = compte.ecoles.find((e) => e.id === id) ?? null
    // Documents déjà générés : re-rendus avec la nouvelle école (mêmes exercices, mêmes graines).
    if (planCourant && connecte) void rendrePlan(planCourant, false, cartoucheDepuisCompte(compte.profil, ecole))
  }

  /** Liste « Enregistrements » : coffre du compte (connecté) ou stockage du navigateur. */
  const listeEnregistrements: PlanEnregistre[] = connecte
    ? (coffre ?? []).map((p) => ({ id: p.id, nom: p.titre, enregistreLe: p.modifie_le, plan: p.contenu }))
    : enregistrees
  const locauxAImporter = connecte && coffre ? plansLocauxAImporter(enregistrees, coffre) : []

  async function importerLocaux() {
    if (!connecte || !coffre) return
    try {
      const r = await importerPlansLocaux(compte.client, enregistrees, coffre)
      setCoffre(await listerPlans(compte.client))
      setMessage(`${r.importes} enregistrement${r.importes > 1 ? 's importés' : ' importé'} dans ton coffre.`)
    } catch (e) {
      setErreur(messageErreur(e))
    }
  }

  async function supprimerEnregistrement(id: string) {
    if (!connecte) {
      setEnregistrees(supprimerPlanEnregistre(id))
      return
    }
    try {
      await supprimerPlanCoffre(compte.client, id)
      setCoffre(await listerPlans(compte.client))
    } catch (e) {
      setErreur(messageErreur(e))
    }
  }

  function enregistrerPlanCourant() {
    if (!planCourant) return
    const nom = window.prompt('Nom de cet enregistrement :', planCourant.entete.titre)
    if (!nom) return
    if (connecte) {
      const client = compte.client
      void enregistrerPlanCoffre(client, nom, planCourant)
        .then(async () => {
          setCoffre(await listerPlans(client))
          setMessage(`« ${nom} » enregistré dans ton coffre.`)
        })
        .catch((e) => setErreur(messageErreur(e)))
      return
    }
    try {
      setEnregistrees(enregistrerPlan(nom, planCourant))
      setMessage(`« ${nom} » enregistré dans ce navigateur.`)
    } catch (e) {
      setErreur((e as Error).message)
    }
  }

  function exporterPlanJson() {
    if (!planCourant) return
    declencherTelechargement(new Blob([JSON.stringify(planCourant, null, 1)], { type: 'application/json' }), `${nomBase(planCourant)} — configuration.json`)
  }

  async function importerPlanJson(fichier: File) {
    const plan = lirePlanDepuisJson(await fichier.text())
    if (!plan) {
      setErreur('Fichier non reconnu : choisis un fichier « configuration.json » exporté depuis ce panneau.')
      return
    }
    chargerPlan(plan)
  }

  async function genererEvaluation() {
    if (chapitres.length === 0 || !levelSlug) return
    const titreFinal =
      titre ||
      (estExamen ? `Examen — ${session.trim() || sessionDefaut}` : '') ||
      (chapitres.length === 1
        ? `${estExercice ? "Feuille d'exercices" : 'Évaluation'} — ${chapitres[0].title}`
        : `${estExercice ? "Feuille d'exercices" : 'Évaluation'} — ${chapitres.length} chapitres`)
    const niveauLabel = niveauEntry?.label ?? niveau
    const entete: EnTeteEvaluation = {
      numero: estExercice ? undefined : numero,
      date,
      titre: titreFinal,
      niveauLabel,
      niveauNumero: NIVEAU_NUMERO[niveau],
      heuresSemaine,
      calculatrice: estExercice ? undefined : calculatrice,
      nombreSeries: nombreSeriesEffectif,
      afficherTitresSection,
      mode,
      versionAmenagee,
      afficherDuree: estExercice ? false : afficherDuree,
      joindreFormulaire,
      deuxColonnes,
      surtitre: chapitres.length === 1 ? `${niveauLabel} · Chapitre ${chapitres[0].chapterNumber}` : niveauLabel,
      // Comptes : école choisie + nom du profil (absent sans session : cartouche historique).
      ...(cartouche ? { cartouche } : {}),
      titreChapitre: chapitres.length === 1 ? chapitres[0].title : undefined,
      urlChapitre: chapitres.length === 1 ? `https://math-belgium.vercel.app/${levelSlug}/${chapitres[0].slug}` : undefined,
      // Examen seulement (une évaluation garde exactement son en-tête d'avant) : textes tels que
      // saisis, lus à l'impression ; totaux fixés = ceux qui sont lisibles et possibles.
      ...(estExamen
        ? {
            typeDocument: 'examen' as const,
            numero: undefined,
            organisationExamen,
            totalExamen: (modeTotalExamen === 'fixe'
              ? { mode: 'fixe', parPartie: Object.fromEntries(partiesPanneau.filter((p) => p.valeurFixee !== null).map((p) => [p.cle, p.valeurFixee!])) }
              : { mode: 'libre' }) satisfies TotalExamen,
            heureDepart: heureDepart.trim() || undefined,
            dureeExamen: dureeExamen.trim() || undefined,
            session: session.trim() || undefined,
            consignesSupplementaires: consignesSupplementaires.trim() ? consignesSupplementaires : undefined,
          }
        : {}),
    }
    const chapitresPayload: ChapitreAvecSections[] = chapitres.map((c) => ({ chapitreSlug: c.slug, chapterNumber: c.chapterNumber, title: c.title, sections: c.sections, formulaire: c.formulaire }))
    const items = construireItemsPayload(entete, lignes, chapitresPayload)
    if (items.length === 0) {
      setErreur('Coche au moins une question (nombre > 0) avant de générer.')
      setUrlGeneree(null)
      setGenereLocalementCompte(null)
      return
    }

    // Génération 100 % locale (voir `evaluationLocal.ts` pour la portée exacte) : plan figé
    // (graines) puis documents. Une banque vrai/faux manquante fait échouer le plan → repli URL.
    if (peutGenererLocalement(levelSlug, items)) {
      setGenereLocalementCompte(null)
      let plan: PlanDocument | null = null
      try {
        plan = await construirePlan(levelSlug, entete, items, lignes, chapitres.map((c) => c.slug))
      } catch (e) {
        console.warn('Génération locale impossible, repli sur plateforme-maths :', e)
      }
      if (plan) {
        await rendrePlan(plan, true)
        return
      }
    }

    const url = buildEvaluationUrl(levelSlug, entete, lignes, chapitresPayload)
    if (!url) {
      setErreur('Coche au moins une question (nombre > 0) avant de générer.')
      setUrlGeneree(null)
      setGenereLocalementCompte(null)
      return
    }
    if (url.length > LONGUEUR_URL_MAX) {
      setErreur(
        'Trop de contenu sélectionné pour un seul lien (surtout les questions ouvertes, qui transmettent leur texte complet) — réduis le nombre de questions ouvertes, ou génère-les en plusieurs feuilles séparées.',
      )
      setUrlGeneree(null)
      setGenereLocalementCompte(null)
      return
    }
    setErreur(null)
    setGenereLocalementCompte(null)
    setUrlGeneree(url)
    window.open(url, '_blank', 'noopener')
  }

  return (
    <div className="admin-eval">
      {bandeauCarnet && (
        <p className="admin-eval-carnet" role="status">
          {bandeauCarnet}
        </p>
      )}
      {!verrouille && (
        <p className="admin-eval-intro">
          Sont fonctionnels : tous les chapitres de 4e, de 5e (4h) et de 6e (6h). Pour ces trois niveaux, la génération se fait désormais
          directement ici (aucune redirection), vrai/faux compris — sauf « Fonctions réciproques et cyclométriques » dont la banque vrai/faux reste sur plateforme-maths.
        </p>
      )}

      {verrouille && (
        <p className="admin-eval-chapitre-verrouille">
          {niveauEntry?.label ?? niveau} — Chapitre{' '}
          {(() => {
            const c = niveauEntry?.chapters.find((c) => c.slug === verrouille.chapitreSlug)
            return c ? `${c.chapterNumber}. ${c.title}` : verrouille.chapitreSlug
          })()}
        </p>
      )}

      <div className="admin-eval-toolbar">
        {!verrouille && (
          <>
            <div className="admin-eval-tf">
              <label htmlFor="eval-niveau">Niveau</label>
              <select id="eval-niveau" value={niveau} onChange={(e) => changerNiveau(e.target.value as NiveauCode)}>
                {NIVEAUX.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-eval-tf">
              <label htmlFor="eval-heures">Heures</label>
              <select
                id="eval-heures"
                value={heures}
                onChange={(e) => reglerNiveauHeures(niveau, e.target.value)}
                disabled={HEURES_PAR_NIVEAU[niveau].length === 0}
              >
                {HEURES_PAR_NIVEAU[niveau].length === 0 ? (
                  <option value="">— (non applicable)</option>
                ) : (
                  HEURES_PAR_NIVEAU[niveau].map((h) => (
                    <option key={h} value={h} disabled={resoudreLevelSlug(niveau, h) === null}>
                      {h}
                      {resoudreLevelSlug(niveau, h) === null ? ' (bientôt)' : ''}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="admin-eval-tf admin-eval-tf-chapitre">
              <label id="eval-chapitres-label">Chapitres (plusieurs possibles)</label>
              {!niveauEntry ? (
                <p className="admin-eval-indisponible">Aucun chapitre disponible pour l'instant.</p>
              ) : (
                <div className="admin-eval-chapitres-chips" role="group" aria-labelledby="eval-chapitres-label">
                  {niveauEntry.chapters.map((c) => {
                    const fonctionnel = estChapitreFonctionnel(levelSlug, c.slug)
                    return (
                      <button
                        key={c.slug}
                        type="button"
                        className="admin-eval-chapitre-chip"
                        aria-pressed={chapitresSlugs.includes(c.slug)}
                        disabled={!fonctionnel}
                        onClick={() => basculerChapitre(c.slug)}
                      >
                        {c.chapterNumber}. {c.title}
                        {fonctionnel ? '' : ' (bientôt)'}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
            <span className="admin-eval-divider" />
          </>
        )}

        {!estExercice && (
          <div className="admin-eval-tf">
            <span className="admin-eval-tf-label" id="eval-type-document-label">
              Document
            </span>
            <div className="admin-eval-segments" role="radiogroup" aria-labelledby="eval-type-document-label">
              {(['evaluation', 'examen'] as const).map((t) => (
                <button key={t} type="button" role="radio" aria-checked={typeDocument === t} className="admin-eval-segment" onClick={() => setTypeDocument(t)}>
                  {t === 'evaluation' ? 'Évaluation' : 'Examen'}
                </button>
              ))}
            </div>
          </div>
        )}
        {!estExercice && !estExamen && (
          <div className="admin-eval-tf" style={{ width: '4.5em' }}>
            <label htmlFor="eval-numero">N°</label>
            <input id="eval-numero" type="text" value={numero} onChange={(e) => setNumero(e.target.value)} />
          </div>
        )}
        <div className="admin-eval-tf">
          <label htmlFor="eval-date">Date</label>
          <input id="eval-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="admin-eval-tf" style={{ flex: '1 1 220px', minWidth: '180px' }}>
          <label htmlFor="eval-titre">{estExamen ? "Nom de l'examen (fichiers)" : `Titre ${estExercice ? "de la feuille d'exercices" : "de l'évaluation"}`}</label>
          <input
            id="eval-titre"
            type="text"
            placeholder={
              estExamen
                ? `Examen — ${session.trim() || sessionDefaut}`
                : chapitres.length === 1
                ? `${estExercice ? "Feuille d'exercices" : 'Évaluation'} — ${chapitres[0].title}`
                : chapitres.length > 1
                  ? `${estExercice ? "Feuille d'exercices" : 'Évaluation'} — ${chapitres.length} chapitres`
                  : 'Titre'
            }
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
          />
        </div>
        <span className="admin-eval-divider" />

        {connecte && (
          <div className="admin-eval-tf admin-eval-tf-ecole">
            {compte.ecoles.length > 1 ? (
              <>
                <label htmlFor="eval-ecole">École</label>
                <select id="eval-ecole" value={ecoleChoisie?.id ?? ''} onChange={(e) => choisirEcole(e.target.value)}>
                  {compte.ecoles.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nom}
                      {e.par_defaut ? ' (par défaut)' : ''}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <>
                <span className="admin-eval-tf-label">École</span>
                {ecoleChoisie ? (
                  <span className="admin-eval-ecole-unique">{ecoleChoisie.nom}</span>
                ) : (
                  <Link className="admin-eval-ecole-unique" to="/profil">
                    Ajouter mon école
                  </Link>
                )}
              </>
            )}
          </div>
        )}
        <div className="admin-eval-tf" style={{ width: '4.5em' }}>
          <label htmlFor="eval-heures-semaine">Vol./sem</label>
          <input
            id="eval-heures-semaine"
            type="text"
            value={heuresSemaine}
            onChange={(e) => setHeuresSemaine(e.target.value)}
            disabled={estExercice}
          />
        </div>
        {!estExercice && (
          <>
            <div className={`admin-eval-tf${calculatriceSurlignee ? ' admin-eval-surligne' : ''}`}>
              <label htmlFor="eval-calculatrice">Calculatrice</label>
              <select id="eval-calculatrice" ref={selectCalculatrice} value={calculatrice} onChange={(e) => setCalculatrice(e.target.value as 'interdite' | 'autorisee')}>
                <option value="interdite">Interdite</option>
                <option value="autorisee">Autorisée</option>
              </select>
            </div>
            <div className="admin-eval-tf" style={{ width: '4em' }}>
              <label htmlFor="eval-series">Séries</label>
              <input
                id="eval-series"
                type="number"
                min={1}
                max={26}
                value={nombreSeries}
                onChange={(e) => setNombreSeries(Math.min(26, Math.max(1, Number(e.target.value) || 1)))}
              />
            </div>
          </>
        )}
        <span className="admin-eval-divider" />

        <label className="admin-eval-checkbox-field" htmlFor="eval-titres-section">
          <input id="eval-titres-section" type="checkbox" checked={afficherTitresSection} onChange={(e) => setAfficherTitresSection(e.target.checked)} />
          Afficher les titres de section
        </label>
        <label className="admin-eval-checkbox-field" htmlFor="eval-amenagee" title="Même énoncé, police très lisible, grand interligne, une question par page — même barème.">
          <input id="eval-amenagee" type="checkbox" checked={versionAmenagee} onChange={(e) => setVersionAmenagee(e.target.checked)} />
          Version aménagée en plus
        </label>
        <label
          className="admin-eval-checkbox-field"
          htmlFor="eval-joindre-formulaire"
          title="Ajoute une page « Annexe — Formulaire » (le formulaire de fin de chapitre) à la fin de la copie, de la version aménagée et de la feuille d'exercices — jamais au corrigé ni à la grille."
        >
          <input id="eval-joindre-formulaire" type="checkbox" checked={joindreFormulaire} onChange={(e) => setJoindreFormulaire(e.target.checked)} />
          Joindre le formulaire du chapitre en annexe
        </label>
        <label
          className="admin-eval-checkbox-field"
          htmlFor="eval-deux-colonnes"
          title="Marges réduites et énoncés en deux colonnes (copie et feuille d'exercices). Le corrigé, la grille, la page « Je vérifie » et la version aménagée gardent leur mise en page."
        >
          <input id="eval-deux-colonnes" type="checkbox" checked={deuxColonnes} onChange={(e) => setDeuxColonnes(e.target.checked)} />
          Économie de papier (deux colonnes)
        </label>
        {!estExercice && calculatrice === 'interdite' && generateursACalculatrice.length > 0 && (
          <p className="admin-eval-avertissement" role="note">
            Calculatrice interdite, mais ces exercices demandent une calculatrice par nature (valeurs décimales) : {generateursACalculatrice.join(' ; ')}.
          </p>
        )}
        {!estExercice && (
          <label className="admin-eval-checkbox-field" htmlFor="eval-afficher-duree" title={`Imprime « ≈ ${dureeEstimee} minutes » dans l'en-tête de l'évaluation.`}>
            <input id="eval-afficher-duree" type="checkbox" checked={afficherDuree} onChange={(e) => setAfficherDuree(e.target.checked)} />
            Afficher la durée estimée sur {estExamen ? "l'examen (sans durée saisie)" : "l'évaluation"}
          </label>
        )}
      </div>

      {estExamen && (
        <fieldset className="admin-eval-examen">
          <legend>Réglages de l'examen</legend>
          <div className="admin-eval-examen-ligne">
            <div className="admin-eval-tf">
              <span className="admin-eval-tf-label" id="eval-organisation-label">
                Parties
              </span>
              <div className="admin-eval-segments" role="radiogroup" aria-labelledby="eval-organisation-label">
                {(['chapitre', 'processus'] as const).map((o) => (
                  <button key={o} type="button" role="radio" aria-checked={organisationExamen === o} className="admin-eval-segment" onClick={() => setOrganisationExamen(o)}>
                    {o === 'chapitre' ? 'Par chapitre' : 'Par processus'}
                  </button>
                ))}
              </div>
            </div>
            <div className="admin-eval-tf admin-eval-examen-session">
              <label htmlFor="eval-session">Session</label>
              <input id="eval-session" type="text" value={session} placeholder={sessionDefaut} onChange={(e) => setSession(e.target.value)} />
            </div>
            <div className="admin-eval-tf admin-eval-examen-court">
              <label htmlFor="eval-heure">Heure de départ</label>
              <input id="eval-heure" type="text" value={heureDepart} placeholder="08h50" autoComplete="off" onChange={(e) => setHeureDepart(normaliserSigneMoins(e.target.value))} aria-describedby="eval-heure-aide" />
              <span id="eval-heure-aide" className={`admin-eval-aide${lectureHeure.etat === 'illisible' ? ' admin-eval-aide-erreur' : ''}`} role={lectureHeure.etat === 'illisible' ? 'alert' : undefined}>
                {lectureHeure.etat === 'illisible' ? lectureHeure.message : 'Facultative'}
              </span>
            </div>
            <div className="admin-eval-tf admin-eval-examen-court">
              <label htmlFor="eval-duree">Durée</label>
              <input id="eval-duree" type="text" value={dureeExamen} placeholder="1h30" autoComplete="off" onChange={(e) => setDureeExamen(normaliserSigneMoins(e.target.value))} aria-describedby="eval-duree-aide" />
              <span id="eval-duree-aide" className={`admin-eval-aide${lectureDuree.etat === 'illisible' ? ' admin-eval-aide-erreur' : ''}`} role={lectureDuree.etat === 'illisible' ? 'alert' : undefined}>
                {lectureDuree.etat === 'illisible' ? lectureDuree.message : apercuHoraire.horaire ? `Imprimé : ${apercuHoraire.horaire}` : apercuHoraire.duree ? `Imprimé : Durée : ${apercuHoraire.duree}` : '60, 1h, 1h30…'}
              </span>
            </div>
          </div>

          <div className="admin-eval-tf">
            <span className="admin-eval-tf-label" id="eval-total-label">
              Total des points
            </span>
            <div className="admin-eval-segments" role="radiogroup" aria-labelledby="eval-total-label">
              {(['libre', 'fixe'] as const).map((m) => (
                <button key={m} type="button" role="radio" aria-checked={modeTotalExamen === m} className="admin-eval-segment" onClick={() => setModeTotalExamen(m)}>
                  {m === 'libre' ? 'Total libre' : 'Total fixé par partie'}
                </button>
              ))}
            </div>
          </div>
          {partiesPanneau.length === 0 ? (
            <p className="admin-eval-variante-label">Les parties apparaissent dès qu'une question est choisie dans le tableau.</p>
          ) : (
            <ul className="admin-eval-parties">
              {partiesPanneau.map((p) => (
                <li key={p.cle}>
                  <span className="admin-eval-partie-nom">
                    Partie {p.romain} · {p.titre}
                  </span>
                  {modeTotalExamen === 'fixe' ? (
                    <span className="admin-eval-partie-total">
                      <input
                        type="text"
                        aria-label={`Total voulu pour la partie ${p.romain}`}
                        value={p.saisie}
                        placeholder={nombreFrPanneau(p.somme)}
                        autoComplete="off"
                        onChange={(e) => {
                          const v = normaliserSigneMoins(e.target.value)
                          setTotauxSaisis((prev) => ({ ...prev, [p.cle]: v }))
                        }}
                      />{' '}
                      pts <span className="admin-eval-variante-label">(questions : {nombreFrPanneau(p.somme)} pts)</span>
                    </span>
                  ) : (
                    <span className="admin-eval-partie-total">
                      <strong>{nombreFrPanneau(p.total)}</strong> pts
                    </span>
                  )}
                  {p.message && (
                    <span className="admin-eval-aide admin-eval-aide-erreur" role="alert">
                      {p.message}
                    </span>
                  )}
                </li>
              ))}
              <li className="admin-eval-parties-total">
                <span className="admin-eval-partie-nom">Total de l'examen</span>
                <span className="admin-eval-partie-total">
                  <strong>{nombreFrPanneau(totalExamen)}</strong> pts
                </span>
              </li>
            </ul>
          )}
          {modeTotalExamen === 'fixe' && partiesPanneau.length > 0 && (
            <p className="admin-eval-variante-label">
              Points des questions de chaque partie mis à l'échelle (demi-points, jamais 0 pt, somme exacte) ; barème, grille et corrigé suivent. Champ vide : points tels quels.
            </p>
          )}

          <div className="admin-eval-tf">
            <label htmlFor="eval-consignes">Consignes supplémentaires (une par ligne)</label>
            <textarea
              id="eval-consignes"
              rows={3}
              value={consignesSupplementaires}
              placeholder={'Commence chaque partie sur une nouvelle feuille.\nFormules en $…$ : $\\sqrt{2}$'}
              onChange={(e) => setConsignesSupplementaires(e.target.value)}
            />
          </div>
        </fieldset>
      )}
      {!estExercice && nombreSeries > 1 && (
        <p className="admin-eval-indisponible">
          {nombreSeries} versions anti-triche (A à {String.fromCharCode(64 + nombreSeries)}) seront générées — mêmes questions, exercices/vrai-faux/questions
          ouvertes indépendamment randomisés par série quand c'est possible.
        </p>
      )}

      {chapitres.length === 0 && (
        <p className="admin-eval-indisponible">
          {verrouille
            ? "Ce chapitre n'a pas encore de feuille d'exercices disponible — reviens bientôt."
            : chapitresSlugs.length === 0
              ? 'Coche au moins un chapitre ci-dessus.'
              : "Aucun des chapitres cochés n'est encore câblé côté plateforme-maths — reviens sur le chapitre pilote ci-dessus."}
        </p>
      )}

      {chapitres.length > 0 && (
        <>
          <div className="admin-eval-processus-bar" role="radiogroup" aria-label="Processus">
            {([1, 2, 3] as const).map((processus) => (
              <button
                key={processus}
                type="button"
                role="radio"
                className="admin-eval-processus-btn"
                aria-checked={processusActif === processus}
                onClick={() => selectionnerProcessus(processus)}
              >
                {processus === 1 ? '①' : processus === 2 ? '②' : '③'} {LABEL_PROCESSUS[processus]}
              </button>
            ))}
          </div>

          <CompteurFlottant nombre={totalNombre} points={estExercice ? undefined : totalAffiche} duree={totalNombre > 0 ? dureeEstimee : undefined} masque={compteurMasque} />

          {totalNombre > 0 && (
            <div className="admin-eval-repartition" aria-live="polite">
              {!estExercice &&
                ([1, 2, 3] as const).map((p) => (
                  <span key={p} className="admin-eval-repartition-item">
                    <span className="admin-eval-repartition-barre" style={{ width: `${totalPoints > 0 ? Math.round((pointsParProcessus[p - 1] / totalPoints) * 100) : 0}%` }} />
                    {LABEL_PROCESSUS[p]} : {pointsParProcessus[p - 1]} pt{pointsParProcessus[p - 1] > 1 ? 's' : ''} ({totalPoints > 0 ? Math.round((pointsParProcessus[p - 1] / totalPoints) * 100) : 0} %)
                    {dureesParProcessus[p - 1] > 0 && ` · ≈ ${Math.max(1, Math.round(dureesParProcessus[p - 1]))} min`}
                  </span>
                ))}
              <span className="admin-eval-repartition-item">Durée estimée : ≈ {dureeEstimee} min</span>
            </div>
          )}

          {[processusActif].map((processus) => {
            const lignesProcessus = lignes.filter((l) => l.processus === processus)
            if (lignesProcessus.length === 0) {
              return (
                <p className="admin-eval-indisponible" key={processus}>
                  Aucun exercice de ce type dans {chapitres.length > 1 ? 'ces chapitres' : 'ce chapitre'} pour l'instant.
                </p>
              )
            }
            return (
              <div className="admin-eval-table-wrap" key={processus}>
                <table className="admin-eval-table">
                  <thead>
                    <tr>
                      <th>
                        Processus {processus} — {LABEL_PROCESSUS[processus]}
                      </th>
                      <th>Disponible</th>
                      <th className="admin-eval-col-nombre">Nombre</th>
                      {!estExercice && <th>Points</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {chapitres.map((chapitreCourant) => {
                      const lignesChapitre = lignes.filter((l) => l.chapitreSlug === chapitreCourant.slug && l.processus === processus)
                      if (lignesChapitre.length === 0) return null
                      return (
                        <Fragment key={chapitreCourant.slug}>
                          {chapitres.length > 1 && (
                            <tr className="admin-eval-chapitre-row">
                              <td colSpan={estExercice ? 3 : 4}>
                                {chapitreCourant.chapterNumber}. {chapitreCourant.title}
                              </td>
                            </tr>
                          )}
                          {chapitreCourant.sections.map((section) => {
                            const lignesSection = lignesChapitre.filter((l) => l.sectionId === section.id)
                            if (lignesSection.length === 0) return null
                            return (
                              <Fragment key={chapitreCourant.slug + section.id}>
                                <tr className="admin-eval-section-row">
                                  <td colSpan={estExercice ? 3 : 4}>
                                    {section.number}. {section.title}
                                  </td>
                                </tr>
                                {lignesSection.flatMap((ligne) => {
                                  if (ligne.type === 'exercice') {
                                    const catalogue = catalogueVariantesExercice(
                                      ligne.cle as IdGenerateurPilote,
                                      estExercice ? 'exercice' : 'evaluation',
                                      Object.entries(ligne.parVariante ?? {}).filter(([, n]) => n > 0).map(([c]) => varianteDeCle(c)),
                                    )
                                    // Tirage équilibré : seulement des exercices complets, sauf si le professeur
                                    // coche « inclure un cas particulier » (évaluation, générateur doté d'un profil).
                                    const libelleCas = estExercice ? null : libelleCasParticulier(ligne.cle as IdGenerateurPilote)
                                    const parametres = estExercice ? [] : parametresAuChoix(ligne.cle as IdGenerateurPilote)
                                    // Une ligne par variante du catalogue, plus ses copies (« id~n ») ; sous chaque
                                    // variante choisie, SES réglages (paramètres à inclure, cas particulier).
                                    const lignesVariantes = catalogue.flatMap((variante) => {
                                      const copies = Object.keys(ligne.parVariante ?? {})
                                        .filter((k) => k !== variante.id && varianteDeCle(k) === variante.id)
                                        .sort((x, y) => Number(x.split('~')[1]) - Number(y.split('~')[1]))
                                      return [variante.id, ...copies].map((cle) => ({ cle, variante, copie: cle !== variante.id }))
                                    })
                                    const adaptateurLigne = EVALUATION_ADAPTER_REGISTRY[ligne.cle ?? ''] as Adaptateur | undefined
                                    // Calculatrice interdite et TOUTES les variantes l'exigent : dit UNE fois, au
                                    // niveau du générateur (rangée de tête), au lieu de répéter la note par variante.
                                    const toutesExclues = catalogue.length > 0 && catalogue.every((v) => varianteExclue(ligne.cle ?? '', v.id))
                                    const rangeesGenerateur = lignesVariantes.flatMap(({ cle, variante, copie }) => {
                                      const exclue = varianteExclue(ligne.cle ?? '', cle)
                                      const nombreVariante = exclue ? 0 : (ligne.parVariante?.[cle] ?? 0)
                                      const reglages = reglagesVariante(ligne, cle)
                                      // Case « cas particulier » seulement si CETTE variante peut en recevoir un
                                      // (calculé seulement quand la sous-rangée s'affiche, puis mis en cache).
                                      const afficherReglages = !exclue && (nombreVariante > 0 || copie)
                                      const libelleCasVariante =
                                        libelleCas && afficherReglages && varianteAdmetCasParticulier(ligne.cle ?? '', variante.id) ? libelleCas : null
                                      const aDesReglages = parametres.length > 0 || !!libelleCasVariante
                                      const rangees = [
                                        <tr className="admin-eval-row" key={(ligne.cle ?? '') + cle}>
                                          <td>
                                            {libelleGenerateurPanneau(section, ligne.cle ?? '')} —{' '}
                                            <span className="admin-eval-variante-label">
                                              {variante.label}
                                              {copie ? ` (${cle.split('~')[1]})` : ''}
                                            </span>
                                            {!exclue && adaptateurLigne && (
                                              <>
                                                {' '}
                                                <RepereNiveauDuree
                                                  adaptateur={adaptateurLigne}
                                                  varianteId={varianteEstimation(adaptateurLigne, cle) ?? ''}
                                                  options={optionsEstimation(ligne, cle)}
                                                  reglages={texteReglagesEstimation(ligne, cle)}
                                                />
                                              </>
                                            )}
                                            {exclue && toutesExclues && <span className="admin-eval-variante-exclue"> — demande une calculatrice</span>}
                                            {exclue && !toutesExclues && (
                                              <span className="admin-eval-calculatrice-note admin-eval-calculatrice-note-variante" role="note">
                                                <span>
                                                  <b>Demande une calculatrice</b> : passe la calculatrice à « Autorisée » (en haut) pour l’utiliser.
                                                </span>
                                                <button type="button" className="admin-eval-lien-bouton" onClick={allerAuReglageCalculatrice}>
                                                  Aller au réglage
                                                </button>
                                              </span>
                                            )}
                                          </td>
                                          <td>—</td>
                                          <td className="admin-eval-col-nombre">
                                            <Stepper
                                              valeur={nombreVariante}
                                              max={MAX_EXERCICE}
                                              disabled={exclue}
                                              onChange={(v) => mettreAJourVariante(chapitreCourant.slug, section.id, ligne.cle ?? '', cle, v)}
                                            />
                                          </td>
                                          {!estExercice && (
                                            <td>
                                              <input
                                                type="number"
                                                min={1}
                                                className="admin-eval-points-input"
                                                value={ligne.pointsParVariante?.[cle] ?? ligne.points}
                                                onChange={(e) =>
                                                  mettreAJourPointsVariante(chapitreCourant.slug, section.id, ligne.cle ?? '', cle, Number(e.target.value) || 1)
                                                }
                                                title={`Points / question pour la variante « ${variante.label} »`}
                                              />
                                            </td>
                                          )}
                                        </tr>,
                                      ]
                                      if (aDesReglages && afficherReglages) {
                                        rangees.push(
                                          <tr className="admin-eval-row admin-eval-row-cas" key={(ligne.cle ?? '') + cle + '-reglages'}>
                                            <td colSpan={4}>
                                              <div className="admin-eval-cas-contenu">
                                                {parametres.length > 0 && <span className="admin-eval-parametres-titre">Paramètres à inclure :</span>}
                                                {parametres.map((p) => (
                                                  <label className="admin-eval-checkbox-field admin-eval-parametre" key={p.id}>
                                                    <input
                                                      type="checkbox"
                                                      checked={!reglages.parametresExclus.includes(p.id)}
                                                      onChange={(e) => basculerParametre(chapitreCourant.slug, section.id, ligne.cle ?? '', cle, p.id, e.target.checked)}
                                                    />
                                                    {p.label}
                                                  </label>
                                                ))}
                                                {libelleCasVariante && (
                                                  <label className="admin-eval-checkbox-field">
                                                    <input
                                                      type="checkbox"
                                                      checked={reglages.inclureCasParticulier}
                                                      onChange={(e) => mettreAJourCasParticulier(chapitreCourant.slug, section.id, ligne.cle ?? '', cle, e.target.checked)}
                                                    />
                                                    {libelleCasVariante}
                                                  </label>
                                                )}
                                                <button
                                                  type="button"
                                                  className="admin-eval-lien-bouton"
                                                  onClick={() => dupliquerVariante(chapitreCourant.slug, section.id, ligne.cle ?? '', cle)}
                                                  title="Ajoute la même variante avec d'autres réglages (par exemple avec et sans un paramètre)"
                                                >
                                                  + Même variante, autres réglages
                                                </button>
                                                {copie && (
                                                  <button
                                                    type="button"
                                                    className="admin-eval-lien-bouton"
                                                    onClick={() => retirerVarianteDupliquee(chapitreCourant.slug, section.id, ligne.cle ?? '', cle)}
                                                  >
                                                    Retirer cette copie
                                                  </button>
                                                )}
                                              </div>
                                            </td>
                                          </tr>,
                                        )
                                      }
                                      return rangees
                                    })
                                    const enTete = toutesExclues
                                      ? [
                                          <tr className="admin-eval-row admin-eval-row-calculatrice" key={(ligne.cle ?? '') + '-calculatrice'}>
                                            <td colSpan={4}>
                                              <div className="admin-eval-calculatrice-note" role="note">
                                                <span>
                                                  <b>{libelleGenerateurPanneau(section, ligne.cle ?? '')}</b> : toutes ses variantes demandent une calculatrice.
                                                  Pour l’utiliser, passe la calculatrice à « Autorisée » (en haut) — ce réglage vaut pour toute l’évaluation.
                                                </span>
                                                <button type="button" className="admin-eval-lien-bouton" onClick={allerAuReglageCalculatrice}>
                                                  Aller au réglage « Calculatrice »
                                                </button>
                                              </div>
                                            </td>
                                          </tr>,
                                        ]
                                      : []
                                    // Sous-total du générateur (toutes ses variantes choisies) : nombre, durée
                                    // estimée (même calcul que l'en-tête) et, en évaluation, points.
                                    const nombreGenerateur = nombreLigne(ligne)
                                    const sousTotal =
                                      nombreGenerateur > 0
                                        ? [
                                            <tr className="admin-eval-row admin-eval-row-soustotal" key={(ligne.cle ?? '') + '-soustotal'}>
                                              <td colSpan={estExercice ? 3 : 4}>
                                                Sous-total : {nombreGenerateur} exercice{nombreGenerateur > 1 ? 's' : ''} · ≈ {Math.max(1, Math.round(dureeLigne(ligne, pointsLigne(ligne))))} min
                                                {!estExercice && ` · ${pointsLigne(ligne)} pt${pointsLigne(ligne) > 1 ? 's' : ''}`}
                                              </td>
                                            </tr>,
                                          ]
                                        : []
                                    return [...enTete, ...rangeesGenerateur, ...sousTotal]
                                  }

                                  const estBanqueFixe = ligne.type === 'formule' || ligne.type === 'demonstration' || ligne.type === 'comprehension'
                                  const banqueChoix =
                                    ligne.type === 'formule' || ligne.type === 'demonstration'
                                      ? ((ligne.type === 'formule' ? apercusFormule : apercusDemonstration).get(cleSection(chapitreCourant.slug, section.id)) ?? [])
                                      : null
                                  const disponibles = banqueChoix
                                    ? banqueChoix.length
                                    : estBanqueFixe
                                      ? apercusComprehension.get(cleSection(chapitreCourant.slug, section.id)) ?? 0
                                      : MAX_VRAI_FAUX
                                  const choix = (ligne.choix ?? []).filter((id) => banqueChoix?.some((q) => q.id === id))
                                  const cleChoix = `${chapitreCourant.slug}|${section.id}|${ligne.type}`
                                  const choixOuvert = choixOuverts.has(cleChoix)
                                  const basculerChoix = (id: string, coche: boolean) => {
                                    const suivant = coche ? [...choix, id] : choix.filter((c) => c !== id)
                                    // Ordre du cours (pas l'ordre des clics) : la feuille suit l'ordre des sections.
                                    const ordonne = (banqueChoix ?? []).map((q) => q.id ?? '').filter((qid) => suivant.includes(qid))
                                    mettreAJourLigne(chapitreCourant.slug, section.id, ligne.type, ligne.cle, { choix: ordonne, nombre: ordonne.length })
                                  }
                                  const indisponible = estBanqueFixe && disponibles === 0
                                  const theme =
                                    ligne.type === 'vraiFaux'
                                      ? themesPourSection(chapitreCourant.slug, section.id).find((t) => t.quizTheme === ligne.cle)
                                      : undefined
                                  const rangeeChoix =
                                    banqueChoix && banqueChoix.length > 0 && choixOuvert ? (
                                      <tr className="admin-eval-row admin-eval-row-choix" key={ligne.type + '-choix'}>
                                        <td colSpan={estExercice ? 3 : 4}>
                                          <fieldset className="admin-eval-choix">
                                            <legend>
                                              {ligne.type === 'demonstration' ? 'Démonstrations à donner' : 'Formules à donner'} — les mêmes dans toutes les séries.
                                              {' '}Aucune cochée : tirage au hasard.
                                            </legend>
                                            {banqueChoix.map((q) => (
                                              <label className="admin-eval-choix-item" key={q.id}>
                                                <input type="checkbox" checked={choix.includes(q.id ?? '')} onChange={(e) => basculerChoix(q.id ?? '', e.target.checked)} />
                                                <span className="admin-eval-choix-texte">
                                                  {ligne.type === 'demonstration' && (
                                                    <span className="admin-eval-choix-titre">
                                                      <RichText text={q.titre ?? ''} />
                                                    </span>
                                                  )}
                                                  <span className="admin-eval-choix-enonce">
                                                    <RichText text={q.apercu ?? ''} />
                                                  </span>
                                                  {ligne.type === 'demonstration' && (
                                                    <span className="admin-eval-choix-longueur">
                                                      Corrigé : {q.corrige.length} étape{q.corrige.length > 1 ? 's' : ''}
                                                    </span>
                                                  )}
                                                </span>
                                                {!estExercice && choix.includes(q.id ?? '') && (
                                                  <span className="admin-eval-choix-points">
                                                    <input
                                                      type="number"
                                                      min={0.5}
                                                      step={0.5}
                                                      className="admin-eval-points-input"
                                                      aria-label={`Points — ${q.titre ?? 'question'}`}
                                                      value={ligne.pointsParChoix?.[q.id ?? ''] ?? ligne.points}
                                                      onChange={(e) =>
                                                        mettreAJourLigne(chapitreCourant.slug, section.id, ligne.type, ligne.cle, {
                                                          pointsParChoix: { ...ligne.pointsParChoix, [q.id ?? '']: Number(e.target.value) || 0.5 },
                                                        })
                                                      }
                                                    />
                                                    pt
                                                  </span>
                                                )}
                                              </label>
                                            ))}
                                          </fieldset>
                                        </td>
                                      </tr>
                                    ) : null
                                  return [
                                    <tr className="admin-eval-row" key={ligne.type + (ligne.cle ?? '')}>
                                      <td>
                                        {LABEL_TYPE[ligne.type]}
                                        {theme?.label && ` — ${theme.label}`}
                                        {banqueChoix && banqueChoix.length > 0 && (
                                          <button
                                            type="button"
                                            className="admin-eval-choix-bouton"
                                            aria-expanded={choixOuvert}
                                            onClick={() =>
                                              setChoixOuverts((prev) => {
                                                const n = new Set(prev)
                                                if (n.has(cleChoix)) n.delete(cleChoix)
                                                else n.add(cleChoix)
                                                return n
                                              })
                                            }
                                          >
                                            {choix.length > 0 ? `${choix.length} choisie${choix.length > 1 ? 's' : ''}` : 'Choisir'}
                                          </button>
                                        )}
                                        {indisponible &&
                                          (ligne.type === 'demonstration'
                                            ? ' — aucune démonstration pour ce point'
                                            : ligne.type === 'formule'
                                              ? ' — aucune formule pour ce point'
                                              : ' — aucune question pour ce point')}
                                      </td>
                                      <td>{estBanqueFixe ? disponibles : '—'}</td>
                                      <td className="admin-eval-col-nombre">
                                        <Stepper
                                          valeur={choix.length > 0 ? choix.length : ligne.nombre}
                                          max={disponibles}
                                          disabled={indisponible || choix.length > 0}
                                          onChange={(v) => mettreAJourLigne(chapitreCourant.slug, section.id, ligne.type, ligne.cle, { nombre: v })}
                                        />
                                      </td>
                                      {!estExercice && choix.length > 0 && (
                                        <td className="admin-eval-points-somme" title="Points fixés question par question dans la liste « Choisir »">
                                          {pointsLigne(ligne)} pt{pointsLigne(ligne) > 1 ? 's' : ''}
                                        </td>
                                      )}
                                      {!estExercice && choix.length === 0 && (
                                        <td>
                                          <input
                                            type="number"
                                            min={1}
                                            className="admin-eval-points-input"
                                            value={ligne.points}
                                            disabled={indisponible}
                                            onChange={(e) =>
                                              mettreAJourLigne(chapitreCourant.slug, section.id, ligne.type, ligne.cle, {
                                                points: Number(e.target.value) || 1,
                                              })
                                            }
                                          />
                                        </td>
                                      )}
                                    </tr>,
                                    rangeeChoix,
                                  ]
                                })}
                              </Fragment>
                            )
                          })}
                        </Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )
          })}

          <div className="admin-eval-bottombar" ref={barreDuBas}>
            {!estExercice && (
              <p className="admin-eval-total">
                {estExamen ? "Total de l'examen" : 'Total'} : {nombreFrPanneau(totalAffiche)} point{totalAffiche > 1 ? 's' : ''}
              </p>
            )}
            <button type="button" className="admin-gate-submit" onClick={genererEvaluation} disabled={genereEnCours}>
              {genereEnCours
                ? 'Génération en cours…'
                : estExercice
                  ? 'Générer la feuille d’exercices'
                  : nombreSeries > 1
                    ? `Générer les ${nombreSeries} séries`
                    : estExamen
                      ? "Générer l'examen"
                      : "Générer l'évaluation"}
            </button>
          </div>
          {erreur && <p className="admin-gate-error">{erreur}</p>}
          {urlGeneree && (
            <p className="admin-eval-lien">
              Ouvert dans un nouvel onglet.{' '}
              <a href={urlGeneree} target="_blank" rel="noopener noreferrer">
                Rouvrir le lien
              </a>
              .
            </p>
          )}
          {message && <p className="admin-eval-lien">{message}</p>}
          {planCourant && documents.length > 0 && genereLocalementCompte !== null && (
            <div className="admin-eval-documents" ref={blocDocuments}>
              <h3>{planCourant.remediation ? planCourant.entete.titre : 'Documents générés'}</h3>
              <ul>
                {documents.map((doc) => (
                  <li key={doc.suffixe}>
                    <span className="admin-eval-documents-nom">{doc.libelle}</span>
                    <span className="admin-eval-documents-actions">
                      <button type="button" onClick={() => ouvrirDocument(doc, false)}>
                        Ouvrir
                      </button>
                      <button type="button" onClick={() => declencherTelechargement(doc.blob, nomFichier(planCourant, doc))}>
                        Télécharger
                      </button>
                      <button type="button" onClick={() => ouvrirDocument(doc, true)}>
                        Imprimer / PDF
                      </button>
                      {(doc.type === 'enonce' || doc.type === 'corrige' || doc.type === 'grille') && doc.serieLettre && (
                        <button
                          type="button"
                          onClick={() => void telechargerWord(doc.serieLettre!, doc.type === 'enonce' ? 'copie' : doc.type === 'corrige' ? 'corrige' : 'grille')}
                          disabled={genereEnCours}
                        >
                          Word
                        </button>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="admin-eval-documents-pied">
                <button type="button" onClick={() => toutTelecharger(planCourant, documents)}>
                  Tout télécharger
                </button>
                <button type="button" onClick={enregistrerPlanCourant}>
                  {connecte ? 'Enregistrer dans mon coffre' : 'Enregistrer dans ce navigateur'}
                </button>
                <button type="button" onClick={exporterPlanJson}>
                  Exporter la configuration (JSON)
                </button>
              </p>
              {codesDuPlan(planCourant).length > 0 && (
                <p className="admin-eval-codes">
                  Codes des exercices :{' '}
                  {codesDuPlan(planCourant)
                    .map((c) => `${planCourant.series.length > 1 ? `${c.serie} ` : ''}${c.generatorId} ${c.code}`)
                    .join(' · ')}
                </p>
              )}
            </div>
          )}

          <details className="admin-eval-enregistrees">
            <summary>
              Enregistrements, import et historique ({listeEnregistrements.length} enregistrement{listeEnregistrements.length > 1 ? 's' : ''}
              {connecte ? ' dans ton coffre' : ''})
            </summary>
            {connecte && locauxAImporter.length > 0 && (
              <p className="admin-eval-documents-pied">
                <button type="button" onClick={() => void importerLocaux()}>
                  Importer dans mon coffre les {locauxAImporter.length} enregistrement{locauxAImporter.length > 1 ? 's' : ''} de ce navigateur
                </button>
              </p>
            )}
            {listeEnregistrements.length > 0 ? (
              <ul>
                {listeEnregistrements.map((e) => (
                  <li key={e.id} className={remediationId === e.id ? 'admin-eval-enregistree-ouverte' : undefined}>
                    <span>
                      {e.nom}{' '}
                      <span className="admin-eval-variante-label">
                        — {new Date(e.enregistreLe).toLocaleDateString('fr-BE')}
                        {e.plan.remediation ? ' · remédiation' : e.plan.series.length > 1 ? ` · séries ${e.plan.series.map((s) => s.lettre).join(', ')}` : ''}
                      </span>
                    </span>
                    <span className="admin-eval-documents-actions">
                      <button type="button" onClick={() => chargerPlan(e.plan)}>
                        Recharger (mêmes exercices)
                      </button>
                      {!e.plan.remediation && (
                        <button
                          type="button"
                          className={remediationId === e.id ? 'admin-eval-bouton-actif' : undefined}
                          aria-expanded={remediationId === e.id}
                          onClick={() => ouvrirRemediation(e)}
                        >
                          Feuille de remédiation
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (!connecte || window.confirm(`Supprimer « ${e.nom} » de ton coffre ?`)) void supprimerEnregistrement(e.id)
                        }}
                      >
                        Supprimer
                      </button>
                    </span>
                    {remediationId === e.id && (
                      <div className="admin-eval-remediation">
                        <h4>Feuille de remédiation — {titreRemediation(e)}</h4>
                        <p className="admin-eval-variante-label">
                          Coche les questions à retravailler (numéros de la copie de la série A) : chaque exercice revient avec d'autres nombres, même type et mêmes réglages ; le corrigé est en fin de feuille et un QR code renvoie au générateur avec les aides.
                        </p>
                        <fieldset className="admin-eval-choix">
                          <legend>Questions de l'évaluation</legend>
                          {questionsRemediables(e.plan).map((q) => (
                            <label className="admin-eval-choix-item" key={q.numero}>
                              <input
                                type="checkbox"
                                checked={remediationCochees.has(q.numero)}
                                onChange={(ev) => {
                                  const suivant = new Set(remediationCochees)
                                  if (ev.target.checked) suivant.add(q.numero)
                                  else suivant.delete(q.numero)
                                  setRemediationCochees(suivant)
                                }}
                              />
                              <span className="admin-eval-choix-texte">
                                <span className="admin-eval-choix-titre">
                                  Question {q.numero} — <RichText text={q.titre} /> ({q.nomProcessus})
                                </span>
                                <span className="admin-eval-choix-enonce">
                                  <RichText text={q.detail} />
                                </span>
                                {q.memeQuestion && <span className="admin-eval-choix-longueur">Même question reprise une fois (pas d'autre tirage possible)</span>}
                              </span>
                            </label>
                          ))}
                        </fieldset>
                        <div className="admin-eval-remediation-options">
                          <span className="admin-eval-remediation-nombre">
                            Exercices par question
                            <Stepper valeur={remediationNombre} min={1} max={6} onChange={setRemediationNombre} />
                          </span>
                          <label>
                            <input type="checkbox" checked={remediationAmenagee} onChange={(ev) => setRemediationAmenagee(ev.target.checked)} /> Version aménagée en plus
                          </label>
                        </div>
                        <button type="button" className="admin-gate-submit" disabled={genereEnCours || remediationCochees.size === 0} onClick={() => void creerRemediation(e)}>
                          {genereEnCours ? 'Création en cours…' : 'Créer la feuille'}
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="admin-eval-variante-label">{connecte ? (coffre === null ? 'Chargement du coffre…' : 'Aucun enregistrement dans ton coffre.') : 'Aucun enregistrement dans ce navigateur.'}</p>
            )}
            <p className="admin-eval-documents-pied">
              <button type="button" onClick={() => entreeImport.current?.click()}>
                Importer une configuration (JSON)
              </button>
              <input
                ref={entreeImport}
                type="file"
                accept="application/json,.json"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) void importerPlanJson(f)
                  e.target.value = ''
                }}
              />
              <button
                type="button"
                onClick={() => {
                  effacerHistorique()
                  setNombreHistorique(0)
                }}
              >
                Effacer l'historique ({nombreHistorique} exercice{nombreHistorique > 1 ? 's' : ''} déjà tiré{nombreHistorique > 1 ? 's' : ''})
              </button>
            </p>
            <p className="admin-eval-variante-label">
              L'historique évite de redonner un exercice déjà imprimé depuis ce navigateur : un tirage identique est automatiquement retiré.
              {connecte && (
                <>
                  {' '}
                  Gérer le coffre (renommer, dupliquer) : <Link to="/coffre">mon coffre</Link>.
                </>
              )}
            </p>
          </details>
        </>
      )}
    </div>
  )
}
