import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { dureeEstimeeVariante, estimationEnCache, type OptionsEstimation } from '../../entrainement/export/niveauDifficulte'
import { RepereNiveauDuree } from './RepereNiveauDuree'
import { ChampPoints } from './ChampPoints'
import { ApercuDocument } from './conception/ApercuDocument'
import { cleSectionComposer, composer, processusComposables, processusDeLignes, type ContexteComposition, type FaconComposer } from './conception/composer'
import { ordreImpression, type EntreeImpression, type LigneActive } from './conception/ordreImpression'
import { pointsDemonstration, pointsDemonstrationMoyens, pointsDepuisDuree } from '../../lib/pointsAutomatiques'
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
import { fractionsRepartition, texteCompetences, texteRepartition } from '../../lib/repartitionProcessus'
import { noteCarteRepartition, ReglageRepartition, useRepartitionProfesseur } from './conception/ReglageRepartition'
import {
  fractionsCompetences,
  noteCarteCompetences,
  REGLAGE_COMPETENCES_DEFAUT,
  ReglageCompetences,
  texteReglageCompetences,
  type ReglageCompetencesDocument,
} from './conception/ReglageCompetences'
import { decoderMatiere } from '../../lib/carnetMatiere'
import { AvertissementEvaluation } from '../carnet/AvertissementEvaluation'
import {
  horaireExamen,
  lireDuree,
  lireHeure,
  lireTotal,
  mettreAEchelle,
  mettreAEchelleParGroupes,
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

/** Compteur +/- partagé par toutes les lignes du tableau (démonstration/compréhension/vrai-faux/
 * exercice) — remplace l'ancien `<input type="number">` brut, plus confortable au doigt. */
function Stepper({
  valeur,
  max,
  min = 0,
  disabled,
  nom,
  onChange,
}: {
  valeur: number
  max: number
  min?: number
  disabled?: boolean
  /** Ce que le compteur compte (noms accessibles « Diminuer — … » / « Augmenter — … »). */
  nom?: string
  onChange: (prochaineValeur: number) => void
}) {
  return (
    <span className="admin-eval-stepper">
      <button
        type="button"
        className="admin-eval-stepper-btn"
        disabled={disabled || valeur <= min}
        onClick={() => onChange(Math.max(min, valeur - 1))}
        aria-label={nom ? `Diminuer — ${nom}` : 'Diminuer'}
      >
        −
      </button>
      <span className="admin-eval-stepper-valeur" aria-live="polite">
        {valeur}
      </span>
      <button
        type="button"
        className="admin-eval-stepper-btn"
        disabled={disabled || valeur >= max}
        onClick={() => onChange(Math.min(max, valeur + 1))}
        aria-label={nom ? `Augmenter — ${nom}` : 'Augmenter'}
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
 * un chapitre précis n'a pas à en choisir un autre).
 *
 * `onResume` (facultatif, pages « Mon espace » du professeur connecté) : reçoit l'école choisie, le
 * niveau et le nombre de questions imprimées, pour les pastilles du bandeau — lecture seule, le
 * panneau ne change pas. */
export function EvaluationGeneratorPanel({
  mode = 'evaluation',
  verrouille,
  onResume,
}: {
  mode?: 'evaluation' | 'exercice'
  verrouille?: { levelSlug: string; chapitreSlug: string }
  onResume?: (r: { ecole: string | null; niveau: string | null; nombre: number; unite: string }) => void
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
  /** Catalogue : filtre par processus (Tout / 1 / 2 / 3, remplace les anciens onglets), recherche
   * (notion ou générateur), sections dépliées (accordéon, toutes repliées au départ). */
  const [filtreProcessus, setFiltreProcessus] = useState<Processus | 'tout'>('tout')
  const [recherche, setRecherche] = useState('')
  const [sectionsOuvertes, setSectionsOuvertes] = useState<Set<string>>(() => new Set())
  /** Panneau de droite : options du document dépliées ; sur téléphone, panneau ouvert (feuille du bas). */
  const [optionsOuvertes, setOptionsOuvertes] = useState(false)
  const [panneauMobile, setPanneauMobile] = useState(false)
  /** « Façons de composer » (proposition B) : bloc déplié, façon choisie, notions cochées, dernier
   * remplissage (avec la sélection d'avant, pour « Annuler »). */
  const [faconsOuvertes, setFaconsOuvertes] = useState(true)
  const [faconActive, setFaconActive] = useState<FaconComposer | 'mesure' | null>(null)
  const [notionsCochees, setNotionsCochees] = useState<Set<string>>(() => new Set())
  const [composition, setComposition] = useState<{ texte: string; avant: LigneSelection[] } | null>(null)
  /** Réglage de la carte « Préparer l'évaluation / l'examen » ouvert : compétences du document
   * (évaluation, feuille) ou répartition d'examen mémorisée (examen). */
  const [reglageRepartitionOuvert, setReglageRepartitionOuvert] = useState(false)
  /** Évaluation / feuille : compétences cochées et parts du DOCUMENT (jamais mémorisées). */
  const [reglageCompetences, setReglageCompetences] = useState<ReglageCompetencesDocument>(REGLAGE_COMPETENCES_DEFAUT)
  // Évaluation ↔ examen : le réglage ouvert n'est plus le même (compétences / répartition d'examen).
  useEffect(() => setReglageRepartitionOuvert(false), [estExamen])
  const boutonModifierRepartition = useRef<HTMLButtonElement>(null)
  const champRecherche = useRef<HTMLInputElement>(null)
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
  /** Répartition d'EXAMEN Connaître / Appliquer / Transférer de « Préparer l'examen » : celle du
   * profil (0005), sinon 25 / 50 / 25 ; réglable pour la session dans tous les cas. Les évaluations et
   * feuilles n'en ont pas (`reglageCompetences`, parts égales). */
  const repartitionProf = useRepartitionProfesseur(compte)
  const repartition = repartitionProf.valeur

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
        // Même état de points que la variante copiée (automatique, verrouillé ou ajusté).
        ...(l.modePoints?.[cle] ? { modePoints: { ...l.modePoints, [nouvelle]: l.modePoints[cle] } } : {}),
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
        ...(l.modePoints ? { modePoints: sans(l.modePoints) } : {}),
        parametresExclusParVariante: sans(l.parametresExclusParVariante),
        casParticulierParVariante: sans(l.casParticulierParVariante),
      }
    })
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
  function pointsLigne(ligneSaisie: LigneSelection): number {
    // Points EFFECTIFS (automatiques, verrouillés ou ajustés) : badge, totaux, parties de l'examen.
    const ligne = materialiser(ligneSaisie)
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

  /* --------------------------------------------------------------------------------------------
   * Points pré-remplis (`lib/pointsAutomatiques.ts`, décision de l'utilisateur). Une UNITÉ de points
   * = une variante (clé de `parVariante`), « ligne » (`points`) ou « choix:<id> » (`pointsParChoix`).
   * Sans `modePoints[unité]`, ses points sont AUTOMATIQUES (durée estimée ÷ 2 pour un exercice — même
   * estimation et même cache que le repère « ≈ m min » —, 1 pt par affirmation, longueur d'une
   * démonstration…) ; tant que la durée n'est pas calculée, la valeur enregistrée reste affichée.
   * « verrouille » (saisie à la main, plan rechargé) et « ajuste » (« Ajuster au total ») : la valeur
   * enregistrée, jamais écrasée par la règle automatique.
   * ------------------------------------------------------------------------------------------ */

  function pointsStockes(ligne: LigneSelection, unite: string): number {
    if (unite === 'ligne') return ligne.points
    if (unite.startsWith('choix:')) return ligne.pointsParChoix?.[unite.slice(6)] ?? ligne.points
    return ligne.pointsParVariante?.[unite] ?? ligne.points
  }

  /** Points automatiques d'une unité (`undefined` : pas encore connus — durée pas calculée). `calculer`
   * : faute d'estimation en cache, la calculer (rangée choisie, comme la durée de l'en-tête) ; sinon
   * lire le cache seulement (rangée pas encore choisie : calcul paresseux du repère). */
  function pointsAutomatiques(ligne: LigneSelection, unite: string, calculer: boolean): number | undefined {
    if (ligne.type === 'exercice') {
      const adaptateur = EVALUATION_ADAPTER_REGISTRY[ligne.cle ?? ''] as Adaptateur | undefined
      if (!adaptateur || unite === 'ligne' || unite.startsWith('choix:')) return undefined
      const varianteId = varianteEstimation(adaptateur, unite)
      const options = optionsEstimation(ligne, unite)
      let duree: number | undefined
      if (!adaptateur.criteresDifficulte) duree = adaptateur.dureeMinutes
      else if (calculer) duree = dureeEstimeeVariante(adaptateur, varianteId, options)
      else duree = estimationEnCache(adaptateur, varianteId, options?.filtre ? options.cleFiltre : undefined)?.dureeMinutes
      return duree === undefined ? undefined : pointsDepuisDuree(duree)
    }
    if (ligne.type === 'vraiFaux' || ligne.type === 'formule') return 1
    if (ligne.type === 'comprehension') return POINTS_DEFAUT.comprehension
    const banque = apercusDemonstration.get(cleSection(ligne.chapitreSlug, ligne.sectionId)) ?? []
    if (unite.startsWith('choix:')) {
      const q = banque.find((x) => x.id === unite.slice(6))
      return q ? pointsDemonstration(q.corrige.length) : undefined
    }
    return pointsDemonstrationMoyens(banque.map((q) => q.corrige.length))
  }

  /** Points EFFECTIFS d'une unité : enregistrés si verrouillés / ajustés, sinon automatiques. */
  function pointsUnite(ligne: LigneSelection, unite: string, calculer = true): number {
    if (ligne.modePoints?.[unite]) return pointsStockes(ligne, unite)
    return pointsAutomatiques(ligne, unite, calculer) ?? pointsStockes(ligne, unite)
  }

  /** La ligne avec ses points EFFECTIFS écrits dans `points` / `pointsParVariante` / `pointsParChoix`
   * (payload, plan enregistré, totaux), sans `modePoints` (propre au panneau). */
  function materialiser(ligne: LigneSelection): LigneSelection {
    const { modePoints: _modes, ...reste } = ligne
    void _modes
    if (ligne.type === 'exercice') {
      const cles = Object.keys(ligne.parVariante ?? {})
      if (cles.length === 0) return reste
      return { ...reste, pointsParVariante: { ...ligne.pointsParVariante, ...Object.fromEntries(cles.map((c) => [c, pointsUnite(ligne, c, (ligne.parVariante?.[c] ?? 0) > 0)])) } }
    }
    const res: LigneSelection = { ...reste, points: pointsUnite(ligne, 'ligne', ligne.nombre > 0) }
    if (ligne.choix?.length) res.pointsParChoix = { ...ligne.pointsParChoix, ...Object.fromEntries(ligne.choix.map((id) => [id, pointsUnite(ligne, `choix:${id}`)])) }
    return res
  }

  /** Identité d'une ligne (chapitre, section, type, clé). */
  const memeIdentite = (a: LigneSelection, b: LigneSelection) => a.chapitreSlug === b.chapitreSlug && a.sectionId === b.sectionId && a.type === b.type && (a.cle ?? '') === (b.cle ?? '')

  /** Points saisis à la main : gardés et VERROUILLÉS (jamais écrasés par la règle ni l'ajustement). */
  function saisirPoints(cible: LigneSelection, unite: string, points: number) {
    setLignes((prev) =>
      prev.map((l) => {
        if (!memeIdentite(l, cible)) return l
        const modePoints = { ...l.modePoints, [unite]: 'verrouille' as const }
        if (unite === 'ligne') return { ...l, points, modePoints }
        if (unite.startsWith('choix:')) return { ...l, pointsParChoix: { ...l.pointsParChoix, [unite.slice(6)]: points }, modePoints }
        return { ...l, pointsParVariante: { ...l.pointsParVariante, [unite]: points }, modePoints }
      }),
    )
    setUrlGeneree(null)
    setGenereLocalementCompte(null)
  }

  /** Cadenas : verrouiller la valeur affichée, ou déverrouiller (la règle automatique reprend). */
  function basculerVerrouPoints(cible: LigneSelection, unite: string, verrouiller: boolean) {
    if (verrouiller) {
      saisirPoints(cible, unite, pointsUnite(cible, unite))
      return
    }
    setLignes((prev) =>
      prev.map((l) => {
        if (!memeIdentite(l, cible) || !l.modePoints) return l
        const modePoints = { ...l.modePoints }
        delete modePoints[unite]
        return { ...l, modePoints }
      }),
    )
    setUrlGeneree(null)
    setGenereLocalementCompte(null)
  }

  /** Unités de points des questions choisies (variantes exclues non comptées), avec leur nombre de
   * questions et leurs points effectifs — « Ajuster au total ». */
  function unitesDePoints(): { ligne: LigneSelection; unite: string; nombre: number; points: number; verrouille: boolean }[] {
    const res: { ligne: LigneSelection; unite: string; nombre: number; points: number; verrouille: boolean }[] = []
    for (const l of lignes) {
      if (nombreLigne(l) === 0) continue
      const ajouter = (unite: string, nombre: number) => res.push({ ligne: l, unite, nombre, points: pointsUnite(l, unite), verrouille: l.modePoints?.[unite] === 'verrouille' })
      if (l.type === 'exercice') {
        for (const [cle, n] of Object.entries(l.parVariante ?? {})) if (n > 0 && !varianteExclue(l.cle ?? '', cle)) ajouter(cle, n)
      } else if (l.choix?.length) {
        for (const id of l.choix) ajouter(`choix:${id}`, 1)
      } else ajouter('ligne', l.nombre)
    }
    return res
  }

  const [totalVoulu, setTotalVoulu] = useState('')
  const [messageAjustement, setMessageAjustement] = useState<{ texte: string; erreur: boolean } | null>(null)

  /** « Ajuster au total » : les questions NON verrouillées sont mises à l'échelle proportionnellement
   * (demi-points, jamais 0 pt, somme exacte — `mettreAEchelleParGroupes`, généralisation de
   * `mettreAEchelle` de l'examen) pour que le total des points vaille le total saisi. */
  function ajusterAuTotal() {
    const lecture = lireTotal(normaliserSigneMoins(totalVoulu))
    if (lecture.etat !== 'ok') {
      setMessageAjustement({ texte: lecture.etat === 'vide' ? 'Écris le total voulu, par exemple 20 ou 40.' : lecture.message, erreur: true })
      return
    }
    const unites = unitesDePoints()
    const libres = unites.filter((u) => !u.verrouille)
    const fixe = unites.filter((u) => u.verrouille).reduce((t, u) => t + u.points * u.nombre, 0)
    if (libres.length === 0) {
      setMessageAjustement({ texte: unites.length === 0 ? 'Choisis d’abord des questions.' : 'Toutes les questions sont verrouillées : déverrouille-en (cadenas) pour les ajuster.', erreur: true })
      return
    }
    const cible = lecture.valeur - fixe
    const questionsLibres = libres.reduce((t, u) => t + u.nombre, 0)
    const res = cible >= questionsLibres * 0.5 ? mettreAEchelleParGroupes(libres.map((u) => u.points), libres.map((u) => u.nombre), cible) : null
    if (!res) {
      const minimum = fixe + questionsLibres * 0.5
      setMessageAjustement({
        texte:
          cible < questionsLibres * 0.5
            ? `Total trop petit : ${nombreFrPanneau(minimum)} pts au moins (${questionsLibres} question${questionsLibres > 1 ? 's' : ''} non verrouillée${questionsLibres > 1 ? 's' : ''} à 0,5 pt${fixe > 0 ? `, plus ${nombreFrPanneau(fixe)} pts verrouillés` : ''}).`
            : `Somme exacte impossible avec ces nombres de questions (une même variante ou un même vrai/faux vaut le même nombre de points pour chacune de ses questions) : essaie ${nombreFrPanneau(lecture.valeur + 0.5)} ou ${nombreFrPanneau(lecture.valeur - 0.5)}.`,
        erreur: true,
      })
      return
    }
    setLignes((prev) =>
      prev.map((l) => {
        const siennes = libres.map((u, k) => ({ u, p: res[k] })).filter(({ u }) => memeIdentite(u.ligne, l))
        if (siennes.length === 0) return l
        let n: LigneSelection = { ...l, modePoints: { ...l.modePoints } }
        for (const { u, p } of siennes) {
          n.modePoints![u.unite] = 'ajuste'
          if (u.unite === 'ligne') n = { ...n, points: p }
          else if (u.unite.startsWith('choix:')) n = { ...n, pointsParChoix: { ...n.pointsParChoix, [u.unite.slice(6)]: p } }
          else n = { ...n, pointsParVariante: { ...n.pointsParVariante, [u.unite]: p } }
        }
        return n
      }),
    )
    setUrlGeneree(null)
    setGenereLocalementCompte(null)
    setMessageAjustement({ texte: `Points ajustés : total ${nombreFrPanneau(lecture.valeur)} pts${fixe > 0 ? ` (dont ${nombreFrPanneau(fixe)} pts verrouillés, inchangés)` : ''}.`, erreur: false })
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

  /** Plan avec le cartouche du panneau (connecté : école choisie, nom du profil ; sinon tel quel). */
  function avecCartouche(planBrut: PlanDocument, cartoucheForce?: CartoucheEcole): PlanDocument {
    const cartoucheRendu = cartoucheForce ?? cartouche
    return cartoucheRendu ? { ...planBrut, entete: { ...planBrut.entete, cartouche: cartoucheRendu } } : planBrut
  }

  /** Documents d'un plan rendus : ils deviennent les « Documents générés » (et, pour une nouvelle
   * génération, leurs exercices vont dans l'historique). Partagé par « Générer » et « Garder ce
   * tirage » de l'aperçu. */
  function adopterDocuments(plan: PlanDocument, docs: DocumentGenere[], nouveau: boolean) {
    for (const u of urlsDocuments.current) URL.revokeObjectURL(u)
    urlsDocuments.current = []
    setPlanCourant(plan)
    setDocuments(docs)
    setGenereLocalementCompte(docs.length)
    if (nouveau) {
      enregistrerDansHistorique(plan)
      setNombreHistorique(lireHistorique().length)
    }
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
      const docs = await genererDocumentsDepuisPlan(plan)
      adopterDocuments(plan, docs, nouveau)
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
    // Points du plan gardés EXACTEMENT : toutes ses questions sont verrouillées (aucun recalcul par la
    // règle automatique) ; les lignes sans question du plan restent automatiques.
    const verrouillee = (l: LigneSelection): LigneSelection => {
      const unites =
        l.type === 'exercice'
          ? Object.entries(l.parVariante ?? {}).filter(([, n]) => n > 0).map(([c]) => c)
          : l.choix?.length
            ? l.choix.map((id) => `choix:${id}`)
            : l.nombre > 0
              ? ['ligne']
              : []
      return unites.length ? { ...l, modePoints: Object.fromEntries(unites.map((u) => [u, 'verrouille' as const])) } : { ...l, modePoints: undefined }
    }
    setLignes([...base.map((b) => plan.lignes.find((l) => memeLigne(l, b)) ?? b), ...plan.lignes.filter((l) => !base.some((b) => memeLigne(l, b)))].map(verrouillee))
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
  // Classe du carnet (`?cid=`) : avertissement « date limite du bulletin » d'après la date de l'en-tête.
  const [classeCarnetId, setClasseCarnetId] = useState<string | null>(null)
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
    const cid = suivant.get('cid') ?? ''
    if (/^[0-9a-f-]{36}$/i.test(cid)) setClasseCarnetId(cid)
    ;['matiere', 'depuis', 'classe', 'cid'].forEach((k) => suivant.delete(k))
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
    setFiltreProcessus('tout')
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

  /** En-tête, lignes (points effectifs) et items de la sélection — commun à « Générer » et à
   * « Aperçu » ; `null` si aucune question n'est choisie. */
  function preparerGeneration(): { levelSlug: string; entete: EnTeteEvaluation; lignesPoints: LigneSelection[]; chapitresPayload: ChapitreAvecSections[]; items: ReturnType<typeof construireItemsPayload> } | null {
    if (chapitres.length === 0 || !levelSlug) return null
    const titreFinal =
      titre ||
      (estExamen ? `Examen — ${session.trim() || sessionDefaut}` : '') ||
      (chapitres.length === 1
        ? `${estExercice ? "Feuille d'exercices" : 'Évaluation'} — ${chapitres[0].title}`
        : `${estExercice ? "Feuille d'exercices" : 'Évaluation'} — ${chapitres.length} chapitres`)
    const niveauLabel = niveauEntry?.label ?? niveau
    // Points EFFECTIFS écrits dans les lignes (automatiques, verrouillés ou ajustés) ; feuille
    // d'exercices : sans points, lignes telles quelles (sans l'état propre au panneau).
    const lignesPoints = estExercice ? lignes.map(({ modePoints: _m, ...l }) => (void _m, l)) : lignes.map(materialiser)
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
        : // Évaluation : consignes supplémentaires seulement si saisies (sinon en-tête identique à avant).
          !estExercice && consignesSupplementaires.trim()
          ? { consignesSupplementaires }
          : {}),
    }
    const chapitresPayload: ChapitreAvecSections[] = chapitres.map((c) => ({ chapitreSlug: c.slug, chapterNumber: c.chapterNumber, title: c.title, sections: c.sections, formulaire: c.formulaire }))
    const items = construireItemsPayload(entete, lignesPoints, chapitresPayload)
    if (items.length === 0) return null
    return { levelSlug, entete, lignesPoints, chapitresPayload, items }
  }

  async function genererEvaluation() {
    if (chapitres.length === 0 || !levelSlug) return
    const prep = preparerGeneration()
    if (!prep) {
      setErreur('Coche au moins une question (nombre > 0) avant de générer.')
      setUrlGeneree(null)
      setGenereLocalementCompte(null)
      return
    }
    const { entete, lignesPoints, chapitresPayload, items } = prep
    setPanneauMobile(false)

    // Génération 100 % locale (voir `evaluationLocal.ts` pour la portée exacte) : plan figé
    // (graines) puis documents. Une banque vrai/faux manquante fait échouer le plan → repli URL.
    if (peutGenererLocalement(levelSlug, items)) {
      setGenereLocalementCompte(null)
      let plan: PlanDocument | null = null
      try {
        plan = await construirePlan(levelSlug, entete, items, lignesPoints, chapitres.map((c) => c.slug))
      } catch (e) {
        console.warn('Génération locale impossible, repli sur plateforme-maths :', e)
      }
      if (plan) {
        await rendrePlan(plan, true)
        requestAnimationFrame(() => blocDocuments.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
        return
      }
    }

    const url = buildEvaluationUrl(levelSlug, entete, lignesPoints, chapitresPayload)
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

  /** « Consignes supplémentaires » (une par ligne, textes tels que saisis — tirets typographiques
   * gardés, `$…$` en KaTeX) : examen ET évaluation, jamais en feuille d'exercices. */
  const champConsignesSupplementaires = (exemple: string) => (
    <div className="admin-eval-tf">
      <label htmlFor="eval-consignes">Consignes supplémentaires (une par ligne)</label>
      <textarea
        id="eval-consignes"
        rows={3}
        value={consignesSupplementaires}
        placeholder={`${exemple}\nFormules en $…$ : $\\sqrt{2}$`}
        onChange={(e) => setConsignesSupplementaires(e.target.value)}
      />
    </div>
  )

  /* --------------------------------------------------------------------------------------------
   * Page de conception (proposition A validée le 21/11/2026) : catalogue à gauche (façons de
   * composer, recherche, filtre par processus, sections en accordéon), « Ma feuille » / « Mon
   * évaluation » / « Mon examen » à droite, collant (sticky) ; sur téléphone, barre fixée en bas qui
   * ouvre ce panneau. Toutes les fonctions d'avant restent (variantes, paramètres, cas particulier,
   * copies, Choisir, points et verrous, Ajuster au total, examen, options, coffre, historique…).
   * ------------------------------------------------------------------------------------------ */

  const nomPanier = estExercice ? 'Ma feuille' : estExamen ? 'Mon examen' : 'Mon évaluation'

  /** Questions disponibles d'une ligne qui n'est pas un exercice (0 = ligne vide, masquée). */
  function disponiblesLigne(l: LigneSelection): number {
    const cle = cleSection(l.chapitreSlug, l.sectionId)
    if (l.type === 'formule') return apercusFormule.get(cle)?.length ?? 0
    if (l.type === 'demonstration') return apercusDemonstration.get(cle)?.length ?? 0
    if (l.type === 'comprehension') return apercusComprehension.get(cle) ?? 0
    if (l.type === 'vraiFaux') return MAX_VRAI_FAUX
    return MAX_EXERCICE
  }
  const ligneUtilisable = (l: LigneSelection) => l.type === 'exercice' || disponiblesLigne(l) > 0

  /** Nom d'une ligne dans le catalogue et dans la liste du panneau. */
  function nomLigne(l: LigneSelection, section: ChapterContent['sections'][number] | undefined): string {
    if (l.type === 'exercice') return section ? libelleGenerateurPanneau(section, l.cle ?? '') : (l.cle ?? '')
    if (l.type === 'vraiFaux') {
      const theme = themesPourSection(l.chapitreSlug, l.sectionId).find((t) => t.quizTheme === l.cle)
      return `${LABEL_TYPE.vraiFaux}${theme?.label ? ` — ${theme.label}` : ''}`
    }
    return LABEL_TYPE[l.type]
  }
  const sectionDe = (l: LigneSelection) => chapitres.find((c) => c.slug === l.chapitreSlug)?.sections.find((s) => s.id === l.sectionId)

  /** Recherche sans accents ni majuscules (« chasles » trouve « Relation de Chasles »). */
  const normaliser = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const termes = normaliser(recherche).split(/\s+/).filter(Boolean)
  const correspond = (texte: string) => termes.every((t) => normaliser(texte).includes(t))
  function texteLigne(l: LigneSelection): string {
    const section = sectionDe(l)
    const variantes = l.type === 'exercice' ? catalogueVariantesExercice(l.cle as IdGenerateurPilote, estExercice ? 'exercice' : 'evaluation', []).map((v) => v.label).join(' ') : ''
    return `${nomLigne(l, section)} ${variantes} ${l.cle ?? ''}`
  }

  /* Liste dans l'ordre d'impression (numérotation des documents, regroupements compris). */
  const cacheInstances = useRef(new Map<string, unknown>())
  const actives: LigneActive[] = lignes.flatMap((l, index) => {
    if (nombreLigne(l) === 0) return []
    const m = materialiser(l)
    if (l.type === 'exercice') {
      const variantes = Object.entries(l.parVariante ?? {})
        .filter(([cle, n]) => n > 0 && !varianteExclue(l.cle ?? '', cle))
        .map(([cle, nombre]) => ({ cle, nombre, points: m.pointsParVariante?.[cle] ?? m.points }))
      return [{ ligne: l, index, variantes, nombre: nombreLigne(l), points: m.points }]
    }
    if (l.choix?.length) return l.choix.map((id) => ({ ligne: l, index, nombre: 1, points: m.pointsParChoix?.[id] ?? m.points }))
    return [{ ligne: l, index, nombre: l.nombre, points: m.points }]
  })
  const signatureActives = JSON.stringify([actives.map((a) => [a.index, a.ligne.processus, a.variantes, a.nombre, a.points]), estExamen ? organisationExamen : '', chapitresSlugs])
  const entrees: EntreeImpression[] = useMemo(
    () => ordreImpression(actives, cacheInstances.current, estExamen ? { organisation: organisationExamen, chapitres: chapitresDuPanneau } : undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `signatureActives` résume la sélection active (clés primitives stables).
    [signatureActives],
  )
  const nombreImprime = entrees.length > 0 ? entrees[entrees.length - 1].dernier : 0
  const lettre = (i: number) => String.fromCharCode(96 + Math.min(26, Math.max(1, i)))

  function titreEntree(e: EntreeImpression): { titre: string; detail: string | null } {
    const l = lignes[e.retraits[0].index]
    const section = sectionDe(l)
    const detail = e.lettres > 1 ? `a)–${lettre(e.lettres)})` : e.lettres === 1 ? 'a)' : e.repetitions > 1 ? `×${e.repetitions}` : null
    if (e.nature === 'vraiFaux') return { titre: 'Vrai ou faux', detail }
    if (e.nature === 'ouverte') return { titre: `${LABEL_TYPE[l.type].replace('Questions ouvertes — ', 'Question de ')}${section ? ` (§ ${section.number})` : ''}`, detail }
    const nom = (section ? libelleGenerateurPanneau(section, l.cle ?? '') : (l.cle ?? '')).replace(/\s*\((?:\d+)?gen\d+\)$/, '')
    const catalogue = catalogueVariantesExercice(l.cle as IdGenerateurPilote, estExercice ? 'exercice' : 'evaluation', (e.retraits[0].cles ?? []).map(varianteDeCle))
    const variantes = [...new Set((e.retraits[0].cles ?? []).map((c) => catalogue.find((v) => v.id === varianteDeCle(c))?.label).filter((x): x is string => !!x && x !== 'Tirage aléatoire'))]
    const texteVariantes = variantes.join(', ')
    return { titre: variantes.length === 0 ? nom : texteVariantes.length <= 48 ? `${nom} — ${texteVariantes}` : `${nom} — ${variantes.length} variantes`, detail }
  }

  /** × d'une entrée : ses exercices (variantes) ou ses questions sont remis à zéro. */
  function retirerEntree(e: EntreeImpression) {
    setLignes((prev) =>
      prev.map((l, i) => {
        const r = e.retraits.find((x) => x.index === i)
        if (!r) return l
        if (l.type === 'exercice') {
          const parVariante = { ...l.parVariante, ...Object.fromEntries((r.cles ?? Object.keys(l.parVariante ?? {})).map((c) => [c, 0])) }
          return { ...l, parVariante, nombre: sommeParVariante(parVariante) }
        }
        return { ...l, nombre: 0, choix: undefined }
      }),
    )
    setUrlGeneree(null)
    setGenereLocalementCompte(null)
  }

  /** Plage de niveaux des exercices choisis (estimations déjà en cache : celles de la durée). */
  const plageNiveaux = (() => {
    let min = Infinity
    let max = -Infinity
    for (const l of lignes) {
      if (l.type !== 'exercice' || nombreLigne(l) === 0) continue
      const adaptateur = EVALUATION_ADAPTER_REGISTRY[l.cle ?? ''] as Adaptateur | undefined
      if (!adaptateur) continue
      for (const [cle, n] of Object.entries(l.parVariante ?? {})) {
        if (n <= 0 || varianteExclue(l.cle ?? '', cle)) continue
        const options = optionsEstimation(l, cle)
        const e = estimationEnCache(adaptateur, varianteEstimation(adaptateur, cle), options?.filtre ? options.cleFiltre : undefined)
        if (e?.niveauMin !== undefined && e.niveauMax !== undefined) {
          min = Math.min(min, e.niveauMin)
          max = Math.max(max, e.niveauMax)
        }
      }
    }
    return min === Infinity ? null : { min, max }
  })()
  const textePlage = plageNiveaux ? (plageNiveaux.min === plageNiveaux.max ? `${plageNiveaux.min}` : `${plageNiveaux.min}–${plageNiveaux.max}`) : null
  const questionsParProcessus = ([1, 2, 3] as const).map((p) => entrees.filter((e) => e.processus === p).reduce((t, e) => t + e.dernier - e.premier + 1, 0))
  /** Durée de référence de la jauge : la période (50 min) pour une évaluation, la durée saisie pour
   * un examen (si elle est lisible). */
  const dureeReference = estExamen ? (lectureDuree.etat === 'ok' ? lectureDuree.valeur : null) : estExercice ? null : 50

  /* Façons de composer : elles REMPLISSENT la sélection (rien n'est tiré ici). */
  const dureeCibleComposer = estExamen ? (lectureDuree.etat === 'ok' ? lectureDuree.valeur : Math.min(150, 50 * Math.max(1, chapitres.length))) : 50
  function contexteComposer(): ContexteComposition {
    return {
      lignes: lignesInitiales(chapitres),
      mode: estExercice ? 'exercice' : 'evaluation',
      calculatriceInterdite: calculatrice === 'interdite',
      disponibles: disponiblesLigne,
      dureeVariante: (l, varianteId) => {
        const adaptateur = EVALUATION_ADAPTER_REGISTRY[l.cle ?? ''] as Adaptateur | undefined
        return adaptateur ? dureeEstimeeVariante(adaptateur, varianteEstimation(adaptateur, varianteId), optionsEstimation(l, varianteId)) : undefined
      },
      dureeCible: dureeCibleComposer,
      // Examen : répartition d'examen du professeur ; évaluation / feuille : compétences cochées, parts
      // égales (ou ajustées pour ce document), jamais une compétence non cochée.
      repartition: estExamen ? fractionsRepartition(repartition) : fractionsCompetences(reglageCompetences),
      cession: estExamen ? 'examen' : 'cochees',
      sections: notionsCochees,
    }
  }
  function appliquerFacon(facon: FaconComposer) {
    const avant = lignes
    const res = composer(facon, contexteComposer())
    if (res.questions === 0) {
      setComposition({
        texte:
          facon === 'evaluation' && !estExamen
            ? `Rien à proposer pour ${texteCompetences(reglageCompetences.cochees)} avec ces réglages (chapitres, calculatrice).`
            : 'Rien à proposer avec ces réglages (notions cochées, calculatrice).',
        avant,
      })
      return
    }
    setLignes(res.lignes)
    setUrlGeneree(null)
    setGenereLocalementCompte(null)
    setSectionsOuvertes(new Set())
    // Compté comme à l'impression : les affirmations vrai/faux forment UNE question.
    const nombre = res.lignes.reduce((t, l) => t + (l.type === 'exercice' ? sommeParVariante(l.parVariante ?? {}) : l.type === 'vraiFaux' ? 0 : l.nombre), 0) + (res.lignes.some((l) => l.type === 'vraiFaux' && l.nombre > 0) ? 1 : 0)
    setComposition({
      texte: `${nombre} question${nombre > 1 ? 's' : ''} proposée${nombre > 1 ? 's' : ''} sur ${res.notions} notion${res.notions > 1 ? 's' : ''} : la sélection est à droite, modifiable comme tu veux.${
        res.cedees.length > 0
          ? ` ${texteCompetences(res.cedees)} : aucun exercice dans ces chapitres — ${res.cedees.length > 1 ? 'leur' : 'son'} temps va à ${texteCompetences(reglageCompetences.cochees.filter((p) => !res.cedees.includes(p)))}.`
          : ''
      }`,
      avant,
    })
  }

  /* Aperçu : le vrai document, sans rien enregistrer dans l'historique. */
  const [apercu, setApercu] = useState<{ plan: PlanDocument | null; docs: DocumentGenere[]; enCours: boolean; erreur: string | null } | null>(null)
  async function lancerApercu() {
    const prep = preparerGeneration()
    if (!prep) {
      setErreur('Coche au moins une question (nombre > 0) avant l’aperçu.')
      return
    }
    if (!peutGenererLocalement(prep.levelSlug, prep.items)) {
      setErreur('Aperçu indisponible pour cette sélection (génération par lien vers plateforme-maths) : utilise « Générer ».')
      return
    }
    setErreur(null)
    setPanneauMobile(false)
    setApercu({ plan: null, docs: [], enCours: true, erreur: null })
    try {
      const plan = avecCartouche(await construirePlan(prep.levelSlug, prep.entete, prep.items, prep.lignesPoints, chapitres.map((c) => c.slug)))
      const docs = await genererDocumentsDepuisPlan(plan)
      setApercu({ plan, docs, enCours: false, erreur: null })
    } catch (e) {
      console.error(e)
      setApercu({ plan: null, docs: [], enCours: false, erreur: 'Aperçu impossible — réessaie.' })
    }
  }
  const fermerApercu = useCallback(() => setApercu(null), [])
  function garderApercu() {
    if (!apercu?.plan) return
    setErreur(null)
    setMessage(null)
    setUrlGeneree(null)
    adopterDocuments(apercu.plan, apercu.docs, true)
    setApercu(null)
    requestAnimationFrame(() => blocDocuments.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  /** Résumé des options du document (une ligne, « Modifier » ouvre le détail). */
  const resumeOptions: string[] = [
    ...(estExercice ? ['corrigé en fin de feuille'] : [`copie, corrigé, grille`]),
    ...(versionAmenagee ? ['version aménagée'] : []),
    ...(deuxColonnes ? ['deux colonnes'] : []),
    ...(joindreFormulaire ? ['formulaire en annexe'] : []),
    ...(afficherTitresSection ? ['titres de section'] : []),
    ...(!estExercice && afficherDuree ? ['durée affichée'] : []),
  ]
  const lignesConsignes = consignesSupplementaires.split('\n').filter((t) => t.trim()).length
  const libelleGenerer = genereEnCours
    ? 'Génération en cours…'
    : estExercice
      ? 'Générer la feuille d’exercices'
      : nombreSeries > 1
        ? `Générer les ${nombreSeries} séries`
        : estExamen
          ? "Générer l'examen"
          : "Générer l'évaluation"

  const pastille = (p: Processus, petite = false) => (
    <span className={`conc-pc conc-pc-${p}${petite ? ' conc-pc-petite' : ''}`} title={LABEL_PROCESSUS[p]} aria-hidden="true">
      {p}
    </span>
  )

  /** Rangée d'un générateur : variantes en puces (repère niveau/durée dans chaque puce), puis une
   * rangée par variante choisie (nombre, points, réglages, copies). */
  function renduGenerateur(ligne: LigneSelection, chapitreCourant: ChapterContent, section: ChapterContent['sections'][number]) {
    const catalogue = catalogueVariantesExercice(
      ligne.cle as IdGenerateurPilote,
      estExercice ? 'exercice' : 'evaluation',
      Object.entries(ligne.parVariante ?? {}).filter(([, n]) => n > 0).map(([c]) => varianteDeCle(c)),
    )
    const nom = libelleGenerateurPanneau(section, ligne.cle ?? '')
    // Tirage équilibré : seulement des exercices complets, sauf si le professeur coche « inclure un
    // cas particulier » (évaluation, générateur doté d'un profil).
    const libelleCas = estExercice ? null : libelleCasParticulier(ligne.cle as IdGenerateurPilote)
    const parametres = estExercice ? [] : parametresAuChoix(ligne.cle as IdGenerateurPilote)
    const adaptateurLigne = EVALUATION_ADAPTER_REGISTRY[ligne.cle ?? ''] as Adaptateur | undefined
    const toutesExclues = catalogue.length > 0 && catalogue.every((v) => varianteExclue(ligne.cle ?? '', v.id))
    const exclues = catalogue.filter((v) => varianteExclue(ligne.cle ?? '', v.id))
    // Variantes choisies et leurs copies (« id~n ») : une rangée chacune, avec SES réglages.
    const choisies = catalogue.flatMap((variante) => {
      const copies = Object.keys(ligne.parVariante ?? {})
        .filter((k) => k !== variante.id && varianteDeCle(k) === variante.id)
        .sort((x, y) => Number(x.split('~')[1]) - Number(y.split('~')[1]))
      return [variante.id, ...copies]
        .map((cle) => ({ cle, variante, copie: cle !== variante.id }))
        .filter(({ cle, copie }) => !varianteExclue(ligne.cle ?? '', cle) && ((ligne.parVariante?.[cle] ?? 0) > 0 || copie))
    })
    const nombreGenerateur = nombreLigne(ligne)
    return (
      <div className="conc-gen" key={`ex-${ligne.cle}`}>
        <div className="conc-gen-tete">
          {pastille(ligne.processus)}
          <span className="conc-gen-nom">{nom}</span>
        </div>
        {toutesExclues && (
          <div className="admin-eval-calculatrice-note" role="note">
            <span>
              <b>{nom}</b> : toutes ses variantes demandent une calculatrice. Pour l’utiliser, passe la calculatrice à « Autorisée » (en haut) — ce réglage vaut pour toute
              l’évaluation.
            </span>
            <button type="button" className="admin-eval-lien-bouton" onClick={allerAuReglageCalculatrice}>
              Aller au réglage « Calculatrice »
            </button>
          </div>
        )}
        <div className="conc-variantes" role="group" aria-label={`Variantes — ${nom}`}>
          {catalogue.map((variante) => {
            const exclue = varianteExclue(ligne.cle ?? '', variante.id)
            const n = exclue ? 0 : (ligne.parVariante?.[variante.id] ?? 0)
            return (
              <button
                key={variante.id}
                type="button"
                className="conc-var"
                aria-pressed={n > 0}
                disabled={exclue}
                title={exclue ? 'Demande une calculatrice' : n > 0 ? 'Retirer cette variante' : 'Ajouter un exercice de cette variante'}
                onClick={() => mettreAJourVariante(chapitreCourant.slug, section.id, ligne.cle ?? '', variante.id, n > 0 ? 0 : 1)}
              >
                <span className="conc-var-nom">
                  {variante.label}
                  {n > 0 && <span className="conc-var-n"> ×{n}</span>}
                </span>
                {exclue ? (
                  <span className="admin-eval-variante-exclue">{toutesExclues ? 'demande une calculatrice' : 'calculatrice'}</span>
                ) : (
                  adaptateurLigne && (
                    <RepereNiveauDuree
                      adaptateur={adaptateurLigne}
                      varianteId={varianteEstimation(adaptateurLigne, variante.id) ?? ''}
                      options={optionsEstimation(ligne, variante.id)}
                      reglages={texteReglagesEstimation(ligne, variante.id)}
                    />
                  )
                )}
              </button>
            )
          })}
        </div>
        {exclues.length > 0 && !toutesExclues && (
          <div className="admin-eval-calculatrice-note admin-eval-calculatrice-note-variante" role="note">
            <span>
              <b>Demande une calculatrice</b> ({exclues.map((v) => `« ${v.label} »`).join(', ')}) : passe la calculatrice à « Autorisée » (en haut) pour l’utiliser.
            </span>
            <button type="button" className="admin-eval-lien-bouton" onClick={allerAuReglageCalculatrice}>
              Aller au réglage
            </button>
          </div>
        )}
        {choisies.map(({ cle, variante, copie }) => {
          const nombreVariante = ligne.parVariante?.[cle] ?? 0
          const reglages = reglagesVariante(ligne, cle)
          // Case « cas particulier » seulement si CETTE variante peut en recevoir un (mis en cache).
          const libelleCasVariante = libelleCas && varianteAdmetCasParticulier(ligne.cle ?? '', variante.id) ? libelleCas : null
          const aDesReglages = parametres.length > 0 || !!libelleCasVariante
          const nomVariante = `${variante.label}${copie ? ` (${cle.split('~')[1]})` : ''}`
          return (
            <div className="conc-choisie" key={cle}>
              <div className="conc-choisie-ligne">
                <span className="conc-choisie-nom">
                  {nomVariante}
                  {copie && adaptateurLigne && (
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
                </span>
                <span className="conc-reglage-nombre">
                  <Stepper valeur={nombreVariante} max={MAX_EXERCICE} nom={`exercices « ${nomVariante} »`} onChange={(v) => mettreAJourVariante(chapitreCourant.slug, section.id, ligne.cle ?? '', cle, v)} />
                  {!estExercice && (
                    <span className="conc-points">
                      <ChampPoints
                        valeur={() => pointsUnite(ligne, cle, nombreVariante > 0)}
                        verrouille={ligne.modePoints?.[cle] === 'verrouille'}
                        ajuste={ligne.modePoints?.[cle] === 'ajuste'}
                        libelle={`Points / question pour la variante « ${variante.label} »`}
                        onSaisie={(p) => saisirPoints(ligne, cle, p)}
                        onVerrou={(v) => basculerVerrouPoints(ligne, cle, v)}
                      />
                      <span className="conc-points-unite">pts</span>
                    </span>
                  )}
                </span>
              </div>
              {aDesReglages && (
                <div className="admin-eval-cas-contenu conc-reglages">
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
                      <input type="checkbox" checked={reglages.inclureCasParticulier} onChange={(e) => mettreAJourCasParticulier(chapitreCourant.slug, section.id, ligne.cle ?? '', cle, e.target.checked)} />
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
                    <button type="button" className="admin-eval-lien-bouton" onClick={() => retirerVarianteDupliquee(chapitreCourant.slug, section.id, ligne.cle ?? '', cle)}>
                      Retirer cette copie
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
        {nombreGenerateur > 0 && (
          <p className="conc-soustotal">
            Sous-total : {nombreGenerateur} exercice{nombreGenerateur > 1 ? 's' : ''} · ≈ {Math.max(1, Math.round(dureeLigne(ligne, pointsLigne(ligne))))} min
            {!estExercice && ` · ${nombreFrPanneau(pointsLigne(ligne))} pt${pointsLigne(ligne) > 1 ? 's' : ''}`}
          </p>
        )}
      </div>
    )
  }

  /** Rangée d'une question du processus 1 (formule, démonstration, compréhension, vrai/faux). */
  function renduAutre(ligne: LigneSelection, chapitreCourant: ChapterContent, section: ChapterContent['sections'][number]) {
    const banqueChoix =
      ligne.type === 'formule' || ligne.type === 'demonstration'
        ? ((ligne.type === 'formule' ? apercusFormule : apercusDemonstration).get(cleSection(chapitreCourant.slug, section.id)) ?? [])
        : null
    const disponibles = disponiblesLigne(ligne)
    const choix = (ligne.choix ?? []).filter((id) => banqueChoix?.some((q) => q.id === id))
    const cleChoix = `${chapitreCourant.slug}|${section.id}|${ligne.type}`
    const choixOuvert = choixOuverts.has(cleChoix)
    const basculerChoix = (id: string, coche: boolean) => {
      const suivant = coche ? [...choix, id] : choix.filter((c) => c !== id)
      // Ordre du cours (pas l'ordre des clics) : la feuille suit l'ordre des sections.
      const ordonne = (banqueChoix ?? []).map((q) => q.id ?? '').filter((qid) => suivant.includes(qid))
      mettreAJourLigne(chapitreCourant.slug, section.id, ligne.type, ligne.cle, { choix: ordonne, nombre: ordonne.length })
    }
    const nom = nomLigne(ligne, section)
    const idChoix = `choix-${cleChoix.replace(/[^a-z0-9]/gi, '-')}`
    return (
      <div className="conc-autre" key={`${ligne.type}-${ligne.cle ?? ''}`}>
        <div className="conc-autre-ligne">
          {pastille(ligne.processus)}
          <span className="conc-autre-nom">
            <span className="conc-gen-nom">{nom}</span>
            <span className="conc-niv">{ligne.type === 'vraiFaux' ? 'banque du chapitre' : `${disponibles} disponible${disponibles > 1 ? 's' : ''}`}</span>
            {banqueChoix && banqueChoix.length > 0 && (
              <button
                type="button"
                className="admin-eval-choix-bouton"
                aria-expanded={choixOuvert}
                aria-controls={idChoix}
                onClick={() =>
                  setChoixOuverts((prev) => {
                    const n = new Set(prev)
                    if (n.has(cleChoix)) n.delete(cleChoix)
                    else n.add(cleChoix)
                    return n
                  })
                }
              >
                {choix.length > 0 ? `${choix.length} choisie${choix.length > 1 ? 's' : ''}` : 'Voir et choisir'}
              </button>
            )}
          </span>
          <span className="conc-reglage-nombre">
            <Stepper
              valeur={choix.length > 0 ? choix.length : ligne.nombre}
              max={disponibles}
              disabled={choix.length > 0}
              nom={nom}
              onChange={(v) => mettreAJourLigne(chapitreCourant.slug, section.id, ligne.type, ligne.cle, { nombre: v })}
            />
            {!estExercice &&
              (choix.length > 0 ? (
                <span className="conc-points admin-eval-points-somme" title="Points fixés question par question dans la liste « Choisir »">
                  {nombreFrPanneau(pointsLigne(ligne))} pt{pointsLigne(ligne) > 1 ? 's' : ''}
                </span>
              ) : (
                <span className="conc-points">
                  <ChampPoints
                    valeur={() => pointsUnite(ligne, 'ligne', ligne.nombre > 0)}
                    verrouille={ligne.modePoints?.ligne === 'verrouille'}
                    ajuste={ligne.modePoints?.ligne === 'ajuste'}
                    libelle={`Points / question — ${LABEL_TYPE[ligne.type]}`}
                    onSaisie={(p) => saisirPoints(ligne, 'ligne', p)}
                    onVerrou={(v) => basculerVerrouPoints(ligne, 'ligne', v)}
                  />
                  <span className="conc-points-unite">pts</span>
                </span>
              ))}
          </span>
        </div>
        {banqueChoix && banqueChoix.length > 0 && choixOuvert && (
          <fieldset className="admin-eval-choix" id={idChoix}>
            <legend>
              {ligne.type === 'demonstration' ? 'Démonstrations à donner' : 'Formules à donner'} — les mêmes dans toutes les séries. Aucune cochée : tirage au hasard.
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
                    <ChampPoints
                      valeur={() => pointsUnite(ligne, `choix:${q.id ?? ''}`)}
                      verrouille={ligne.modePoints?.[`choix:${q.id ?? ''}`] === 'verrouille'}
                      ajuste={ligne.modePoints?.[`choix:${q.id ?? ''}`] === 'ajuste'}
                      libelle={`Points — ${q.titre ?? 'question'}`}
                      onSaisie={(p) => saisirPoints(ligne, `choix:${q.id ?? ''}`, p)}
                      onVerrou={(v) => basculerVerrouPoints(ligne, `choix:${q.id ?? ''}`, v)}
                    />
                    pt
                  </span>
                )}
              </label>
            ))}
          </fieldset>
        )}
      </div>
    )
  }

  /** Une section du catalogue : en-tête d'accordéon (pastilles des processus qu'elle contient,
   * « n choisis · x pts »), puis ses rangées visibles ; les lignes vides sont masquées. */
  function renduSection(chapitreCourant: ChapterContent, section: ChapterContent['sections'][number]) {
    const lignesSection = lignes.filter((l) => l.chapitreSlug === chapitreCourant.slug && l.sectionId === section.id)
    const utilisables = lignesSection.filter(ligneUtilisable)
    if (utilisables.length === 0) return null
    const titreSection = `${section.number}. ${section.title}`
    const titreCorrespond = correspond(titreSection)
    const filtrees = utilisables.filter((l) => (filtreProcessus === 'tout' || l.processus === filtreProcessus) && (titreCorrespond || correspond(texteLigne(l))))
    if (filtrees.length === 0) return null
    const masquees = lignesSection.filter((l) => !ligneUtilisable(l) && (filtreProcessus === 'tout' || l.processus === filtreProcessus))
    const cle = cleSection(chapitreCourant.slug, section.id)
    const ouverte = termes.length > 0 || sectionsOuvertes.has(cle)
    const nombre = lignesSection.reduce((t, l) => t + nombreLigne(l), 0)
    const points = lignesSection.reduce((t, l) => t + (nombreLigne(l) > 0 ? pointsLigne(l) : 0), 0)
    const processus = processusDeLignes(lignesSection, ligneUtilisable)
    const idCorps = `section-${cle.replace(/[^a-z0-9]/gi, '-')}`
    return (
      <article className="conc-section" key={cle} data-ouverte={ouverte || undefined}>
        <h4 className="conc-section-h">
          <button
            type="button"
            className="conc-section-tete"
            aria-expanded={ouverte}
            aria-controls={idCorps}
            onClick={() =>
              setSectionsOuvertes((prev) => {
                const n = new Set(prev)
                if (n.has(cle)) n.delete(cle)
                else n.add(cle)
                return n
              })
            }
          >
            <span className="conc-section-titre">{titreSection}</span>
            <span className="conc-section-meta">
              <span className="conc-pastilles">
                {processus.map((p) => (
                  <Fragment key={p}>{pastille(p, true)}</Fragment>
                ))}
                <span className="sr-only">Processus : {processus.map((p) => LABEL_PROCESSUS[p]).join(', ')}.</span>
              </span>
              <span className={`conc-section-compte${nombre > 0 ? ' conc-ok' : ''}`}>
                {nombre > 0 ? `${nombre} choisi${nombre > 1 ? 's' : ''}${estExercice ? '' : ` · ${nombreFrPanneau(points)} pts`}` : '—'}
              </span>
              <span className="conc-chevron" aria-hidden="true">
                ▸
              </span>
            </span>
          </button>
        </h4>
        {ouverte && (
          <div className="conc-section-corps" id={idCorps}>
            {filtrees.map((l) => (l.type === 'exercice' ? renduGenerateur(l, chapitreCourant, section) : renduAutre(l, chapitreCourant, section)))}
            {masquees.length > 0 && (
              <p className="conc-masque">
                Masqué : {masquees.map((l) => `« ${LABEL_TYPE[l.type]} »`).join(', ')} (aucune question pour ce point).
              </p>
            )}
          </div>
        )}
      </article>
    )
  }

  /** Options du document (tout ce que la barre d'outils contenait) : mise en page, consignes,
   * réglages de l'examen. */
  const blocOptions = (
    <div className="conc-options" id="conc-options">
      <fieldset className="conc-groupe">
        <legend>Mise en page</legend>
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
        {!estExercice && (
          <label className="admin-eval-checkbox-field" htmlFor="eval-afficher-duree" title={`Imprime « ≈ ${dureeEstimee} minutes » dans l'en-tête de l'évaluation.`}>
            <input id="eval-afficher-duree" type="checkbox" checked={afficherDuree} onChange={(e) => setAfficherDuree(e.target.checked)} />
            Afficher la durée estimée sur {estExamen ? "l'examen (sans durée saisie)" : "l'évaluation"}
          </label>
        )}
      </fieldset>

      {estExamen && (
        <fieldset className="admin-eval-examen">
          <legend>Réglages de l'examen</legend>
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
          <div className="admin-eval-examen-ligne">
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
          {modeTotalExamen === 'fixe' &&
            (partiesPanneau.length === 0 ? (
              <p className="admin-eval-variante-label">Les parties apparaissent dès qu'une question est choisie.</p>
            ) : (
              <>
                <ul className="admin-eval-parties">
                  {partiesPanneau.map((p) => (
                    <li key={p.cle}>
                      <span className="admin-eval-partie-nom">
                        Partie {p.romain} · {p.titre}
                      </span>
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
                    </li>
                  ))}
                </ul>
                <p className="admin-eval-variante-label">
                  Points des questions de chaque partie mis à l'échelle (demi-points, jamais 0 pt, somme exacte) ; barème, grille et corrigé suivent. Champ vide : points tels quels.
                </p>
              </>
            ))}
          {champConsignesSupplementaires('Commence chaque partie sur une nouvelle feuille.')}
        </fieldset>
      )}
      {/* Évaluation : même champ (le texte saisi est gardé en passant d'Examen à Évaluation). */}
      {!estExercice && !estExamen && (
        <fieldset className="admin-eval-examen">
          <legend>Consignes de l'évaluation</legend>
          {champConsignesSupplementaires('Écris au stylo bleu ou noir.')}
        </fieldset>
      )}
    </div>
  )

  const unite = estExercice ? 'exercice' : 'question'
  const nomEcoleChoisie = ecoleChoisie?.nom ?? null
  const libelleNiveau = niveauEntry?.label ?? null
  useEffect(() => {
    onResume?.({ ecole: nomEcoleChoisie, niveau: libelleNiveau, nombre: nombreImprime, unite })
  }, [onResume, nomEcoleChoisie, libelleNiveau, nombreImprime, unite])
  const pct = (x: number, total: number) => (total > 0 ? Math.round((x / total) * 100) : 0)

  return (
    <div className={`admin-eval conc${panneauMobile ? ' conc-panier-ouvert' : ''}`}>
      {bandeauCarnet && (
        <p className="admin-eval-carnet" role="status">
          {bandeauCarnet}
        </p>
      )}
      {classeCarnetId && connecte && compte.client && !estExercice && <AvertissementEvaluation client={compte.client} classeId={classeCarnetId} date={date} />}

      {/* ---------- En-tête compact : chapitres, puis le document ---------- */}
      <section className="conc-entete" aria-label="Document">
        {verrouille ? (
          <p className="admin-eval-chapitre-verrouille">
            {niveauEntry?.label ?? niveau} — Chapitre{' '}
            {(() => {
              const c = niveauEntry?.chapters.find((c) => c.slug === verrouille.chapitreSlug)
              return c ? `${c.chapterNumber}. ${c.title}` : verrouille.chapitreSlug
            })()}
          </p>
        ) : (
          <div className="conc-entete-chapitres">
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
              <select id="eval-heures" value={heures} onChange={(e) => reglerNiveauHeures(niveau, e.target.value)} disabled={HEURES_PAR_NIVEAU[niveau].length === 0}>
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
              <span className="admin-eval-tf-label" id="eval-chapitres-label">
                Chapitres (plusieurs possibles)
              </span>
              {!niveauEntry ? (
                <p className="admin-eval-indisponible">Aucun chapitre disponible pour l'instant.</p>
              ) : (
                <div className="admin-eval-chapitres-chips" role="group" aria-labelledby="eval-chapitres-label">
                  {niveauEntry.chapters.map((c) => {
                    const fonctionnel = estChapitreFonctionnel(levelSlug, c.slug)
                    return (
                      <button key={c.slug} type="button" className="admin-eval-chapitre-chip" aria-pressed={chapitresSlugs.includes(c.slug)} disabled={!fonctionnel} onClick={() => basculerChapitre(c.slug)}>
                        {c.chapterNumber}. {c.title}
                        {fonctionnel ? '' : ' (bientôt)'}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="conc-entete-champs">
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
          <div className="admin-eval-tf conc-champ-titre">
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
          <div className="admin-eval-tf">
            <label htmlFor="eval-date">Date</label>
            <input id="eval-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          {!estExercice && !estExamen && (
            <div className="admin-eval-tf conc-champ-court">
              <label htmlFor="eval-numero">N°</label>
              <input id="eval-numero" type="text" value={numero} onChange={(e) => setNumero(e.target.value)} />
            </div>
          )}
          {!estExercice && (
            <>
              <div className="admin-eval-tf conc-champ-court">
                <label htmlFor="eval-heures-semaine">Vol./sem.</label>
                <input id="eval-heures-semaine" type="text" value={heuresSemaine} onChange={(e) => setHeuresSemaine(e.target.value)} />
              </div>
              <div className="admin-eval-tf">
                <span className="admin-eval-tf-label" id="eval-series-label">
                  Séries
                </span>
                <span role="group" aria-labelledby="eval-series-label" className="conc-series">
                  <Stepper valeur={nombreSeries} min={1} max={26} nom="séries" onChange={setNombreSeries} />
                </span>
              </div>
              <div className={`admin-eval-tf${calculatriceSurlignee ? ' admin-eval-surligne' : ''}`}>
                <label htmlFor="eval-calculatrice">Calculatrice</label>
                <select id="eval-calculatrice" ref={selectCalculatrice} value={calculatrice} onChange={(e) => setCalculatrice(e.target.value as 'interdite' | 'autorisee')}>
                  <option value="interdite">Interdite</option>
                  <option value="autorisee">Autorisée</option>
                </select>
              </div>
            </>
          )}
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
        </div>
        {!estExercice && calculatrice === 'interdite' && generateursACalculatrice.length > 0 && (
          <p className="admin-eval-avertissement" role="note">
            Calculatrice interdite, mais ces exercices demandent une calculatrice par nature (valeurs décimales) : {generateursACalculatrice.join(' ; ')}.
          </p>
        )}
      </section>
      {!verrouille && (
        <p className="admin-eval-intro">
          Sont fonctionnels : tous les chapitres de 4e, de 5e (4h) et de 6e (6h). Pour ces trois niveaux, la génération se fait désormais directement ici (aucune redirection), vrai/faux
          compris — sauf « Fonctions réciproques et cyclométriques » dont la banque vrai/faux reste sur plateforme-maths.
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
          <div className="conc-grille">
            {/* ---------- Catalogue ---------- */}
            <section className="conc-catalogue" aria-label="Catalogue">
              <div className="conc-facons">
                <button type="button" className="conc-facons-tete" aria-expanded={faconsOuvertes} aria-controls="conc-facons-corps" onClick={() => setFaconsOuvertes((v) => !v)}>
                  <span>
                    <span className="conc-facons-titre">Façons de composer</span>
                    <span className="conc-facons-sous">Pas le temps de tout choisir ? L’outil remplit {estExercice ? 'la feuille' : estExamen ? "l'examen" : "l'évaluation"}, tu ajustes ensuite.</span>
                  </span>
                  <span className="conc-chevron" aria-hidden="true">
                    ▸
                  </span>
                </button>
                {faconsOuvertes && (
                  <div className="conc-facons-corps" id="conc-facons-corps">
                    <div className="conc-recettes">
                      {(
                        [
                          ['equilibree', estExercice ? 'Feuille équilibrée' : estExamen ? 'Examen équilibré' : 'Évaluation équilibrée', '≈ 6 exercices tirés sur tout le chapitre, des trois processus.'],
                          ['notions', 'Sur quelques notions', 'Tu coches les notions, l’outil propose les exercices.'],
                          [
                            'evaluation',
                            estExamen ? 'Préparer l’examen' : 'Préparer l’évaluation',
                            estExamen
                              ? `Ta répartition d’examen : ${texteRepartition(false, repartition)} de ${dureeCibleComposer}\u00a0min.`
                              : `Tu choisis les compétences ; le temps est partagé entre elles (≈\u00a0${dureeCibleComposer}\u00a0min).`,
                          ],
                          ['mesure', 'Sur mesure', 'Le catalogue complet, exercice par exercice.'],
                        ] as const
                      ).map(([id, titreFacon, texte]) => {
                        const carte = (
                          <button
                            key={id}
                            type="button"
                            className="conc-recette"
                            aria-pressed={faconActive === id}
                            onClick={() => {
                              setFaconActive(id)
                              if (id === 'mesure') {
                                setComposition(null)
                                champRecherche.current?.focus()
                              } else if (id !== 'notions') appliquerFacon(id)
                            }}
                          >
                            <span className="conc-recette-titre">{titreFacon}</span>
                            <span className="conc-recette-texte">{texte}</span>
                          </button>
                        )
                        if (id !== 'evaluation') return carte
                        const note = estExamen ? noteCarteRepartition(repartitionProf) : noteCarteCompetences(reglageCompetences)
                        return (
                          <div key={id} className="conc-recette-groupe">
                            {carte}
                            <button
                              type="button"
                              ref={boutonModifierRepartition}
                              className="conc-recette-modifier"
                              aria-expanded={reglageRepartitionOuvert}
                              aria-controls={estExamen ? 'conc-rep' : 'conc-comp'}
                              aria-label={estExamen ? `Modifier ta répartition d’examen (${texteRepartition(false, repartition)})` : `Choisir les compétences (${texteReglageCompetences(reglageCompetences)})`}
                              onClick={() => setReglageRepartitionOuvert((v) => !v)}
                            >
                              <span>
                                <span aria-hidden="true">⚙</span> {estExamen ? 'Modifier' : 'Compétences'}
                              </span>
                              {note ? <span className="conc-recette-note">{note}</span> : null}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                    {reglageRepartitionOuvert && !estExamen && (
                      <ReglageCompetences
                        reglage={reglageCompetences}
                        onChange={setReglageCompetences}
                        feuille={estExercice}
                        dureeCible={dureeCibleComposer}
                        presentes={processusComposables(contexteComposer())}
                        onPreparer={() => {
                          setFaconActive('evaluation')
                          appliquerFacon('evaluation')
                        }}
                        onFermer={() => {
                          setReglageRepartitionOuvert(false)
                          boutonModifierRepartition.current?.focus()
                        }}
                      />
                    )}
                    {reglageRepartitionOuvert && estExamen && (
                      <ReglageRepartition
                        rp={repartitionProf}
                        connecte={connecte}
                        dureeCible={dureeCibleComposer}
                        onPreparer={() => {
                          setFaconActive('evaluation')
                          appliquerFacon('evaluation')
                        }}
                        onFermer={() => {
                          setReglageRepartitionOuvert(false)
                          boutonModifierRepartition.current?.focus()
                        }}
                      />
                    )}
                    {faconActive === 'notions' && (
                      <div className="conc-notions">
                        <p className="conc-notions-titre">
                          Choisis les notions <span>({notionsCochees.size} cochée{notionsCochees.size > 1 ? 's' : ''})</span>
                        </p>
                        <div className="conc-notions-grille" role="group" aria-label="Notions">
                          {chapitres.flatMap((c) =>
                            c.sections.map((s) => {
                              const lignesS = lignes.filter((l) => l.chapitreSlug === c.slug && l.sectionId === s.id)
                              const ps = processusDeLignes(lignesS, ligneUtilisable)
                              if (ps.length === 0) return null
                              const cle = cleSectionComposer(c.slug, s.id)
                              const cochee = notionsCochees.has(cle)
                              return (
                                <button
                                  key={cle}
                                  type="button"
                                  className="conc-notion"
                                  aria-pressed={cochee}
                                  onClick={() =>
                                    setNotionsCochees((prev) => {
                                      const n = new Set(prev)
                                      if (n.has(cle)) n.delete(cle)
                                      else n.add(cle)
                                      return n
                                    })
                                  }
                                >
                                  <span className="conc-notion-titre">
                                    {chapitres.length > 1 ? `${c.chapterNumber}.` : ''}
                                    {s.number}. {s.title}
                                  </span>
                                  <span className="conc-pastilles">{ps.map((p) => <Fragment key={p}>{pastille(p, true)}</Fragment>)}</span>
                                </button>
                              )
                            }),
                          )}
                        </div>
                        <button type="button" className="conc-bouton conc-bouton-principal" disabled={notionsCochees.size === 0} onClick={() => appliquerFacon('notions')}>
                          Proposer des exercices sur {notionsCochees.size > 1 ? `ces ${notionsCochees.size} notions` : 'cette notion'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {composition && (
                  <p className="conc-composition" role="status">
                    <span>{composition.texte}</span>
                    <button
                      type="button"
                      className="admin-eval-lien-bouton"
                      onClick={() => {
                        setLignes(composition.avant)
                        setComposition(null)
                      }}
                    >
                      Annuler
                    </button>
                  </p>
                )}
              </div>

              <div className="conc-filtres">
                <label className="sr-only" htmlFor="conc-recherche">
                  Chercher une notion ou un générateur
                </label>
                <input
                  id="conc-recherche"
                  ref={champRecherche}
                  type="search"
                  className="conc-recherche"
                  placeholder="Notion ou générateur (ex. Chasles)"
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                />
                <div className="conc-processus" role="group" aria-label="Processus">
                  {(['tout', 1, 2, 3] as const).map((p) => (
                    <button key={p} type="button" className="conc-puce" aria-pressed={filtreProcessus === p} onClick={() => setFiltreProcessus(p)}>
                      {p === 'tout' ? (
                        'Tout'
                      ) : (
                        <>
                          {pastille(p, true)}
                          {LABEL_PROCESSUS[p]}
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {chapitres.map((chapitreCourant) => {
                const sectionsRendues = chapitreCourant.sections.map((s) => renduSection(chapitreCourant, s))
                const vides = chapitreCourant.sections.filter((s) => !lignes.some((l) => l.chapitreSlug === chapitreCourant.slug && l.sectionId === s.id && ligneUtilisable(l)))
                const aucune = sectionsRendues.every((x) => x === null)
                return (
                  <div className="conc-chapitre" key={chapitreCourant.slug}>
                    {chapitres.length > 1 && (
                      <h3 className="conc-chapitre-titre">
                        {chapitreCourant.chapterNumber}. {chapitreCourant.title}
                      </h3>
                    )}
                    {sectionsRendues}
                    {aucune && <p className="conc-masque">{termes.length > 0 ? 'Aucune notion ni aucun générateur ne correspond à la recherche.' : 'Rien pour ce processus dans ce chapitre pour l’instant.'}</p>}
                    {vides.length > 0 && termes.length === 0 && (
                      <p className="conc-masque">Sans question pour l’instant : {vides.map((s) => `${s.number}. ${s.title}`).join(' · ')}.</p>
                    )}
                  </div>
                )
              })}
              <p className="conc-masque">Les pastilles disent ce qu’on trouve dans chaque section : 1 Connaître, 2 Appliquer, 3 Transférer.</p>
            </section>

            {/* ---------- Ma feuille / Mon évaluation / Mon examen ---------- */}
            <aside className="conc-panier" id="conc-panier" aria-label={nomPanier}>
              <div className="conc-panier-tete">
                <h2>{nomPanier}</h2>
                <button type="button" className="conc-bouton conc-bouton-discret conc-panier-fermer" onClick={() => setPanneauMobile(false)}>
                  Fermer
                </button>
              </div>
              <div className="conc-chiffres">
                <div>
                  <b>{nombreImprime}</b>
                  <span>
                    {unite}
                    {nombreImprime > 1 ? 's' : ''}
                  </span>
                </div>
                <div>
                  <b>{totalNombre > 0 ? `≈ ${dureeEstimee}` : '—'}</b>
                  <span>minutes</span>
                </div>
                {textePlage && (
                  <div>
                    <b>{textePlage}</b>
                    <span>niveaux</span>
                  </div>
                )}
                {!estExercice && (
                  <div>
                    <b>{nombreFrPanneau(totalAffiche)}</b>
                    <span>points</span>
                  </div>
                )}
              </div>

              {estExercice ? (
                nombreImprime > 0 && (
                  <div className="conc-jauge-bloc">
                    <div className="conc-barre" aria-hidden="true">
                      {([1, 2, 3] as const).map((p) => questionsParProcessus[p - 1] > 0 && <span key={p} className={`conc-barre-p${p}`} style={{ flex: questionsParProcessus[p - 1] }} />)}
                    </div>
                    <p className="conc-legende">
                      {([1, 2, 3] as const).map((p) => (
                        <span key={p} className={`conc-legende-p${p}`}>
                          ● {LABEL_PROCESSUS[p]} {questionsParProcessus[p - 1]}
                        </span>
                      ))}
                    </p>
                  </div>
                )
              ) : (
                <>
                  {totalNombre > 0 && (
                    <div className="conc-jauge-bloc">
                      <p className="conc-jauge-titre">
                        <span>Durée estimée</span>
                        <b>
                          ≈ {dureeEstimee}
                          {dureeReference ? ` / ${dureeReference}` : ''} min
                        </b>
                      </p>
                      {dureeReference && (
                        <div className="conc-jauge" aria-hidden="true">
                          <span className={dureeEstimee > dureeReference ? 'conc-jauge-trop' : ''} style={{ width: `${Math.min(100, pct(dureeEstimee, dureeReference))}%` }} />
                        </div>
                      )}
                      {dureeReference && (
                        <p className="conc-legende">{estExamen ? 'Durée de l’examen saisie dans les options.' : 'Une période de 50 minutes.'}</p>
                      )}
                    </div>
                  )}
                  {totalNombre > 0 && (
                    <div className="conc-jauge-bloc">
                      <p className="conc-jauge-titre">
                        <span>{estExamen && modeTotalExamen === 'fixe' && totalExamen !== totalPoints ? 'Points des questions (avant mise à l’échelle)' : 'Points par processus'}</span>
                        <b>{nombreFrPanneau(totalPoints)} pts</b>
                      </p>
                      <div className="conc-barre" aria-hidden="true">
                        {([1, 2, 3] as const).map((p) => pointsParProcessus[p - 1] > 0 && <span key={p} className={`conc-barre-p${p}`} style={{ flex: pointsParProcessus[p - 1] }} />)}
                      </div>
                      <p className="conc-legende">
                        {([1, 2, 3] as const).map((p) => (
                          <span key={p} className={`conc-legende-p${p}`}>
                            ● {LABEL_PROCESSUS[p]} : {nombreFrPanneau(pointsParProcessus[p - 1])} pt{pointsParProcessus[p - 1] > 1 ? 's' : ''} ({pct(pointsParProcessus[p - 1], totalPoints)} %)
                            {dureesParProcessus[p - 1] > 0 && ` · ≈ ${Math.max(1, Math.round(dureesParProcessus[p - 1]))} min`}
                          </span>
                        ))}
                      </p>
                    </div>
                  )}
                  <div className="admin-eval-ajuster conc-ajuster">
                    {!(estExamen && modeTotalExamen === 'fixe') && (
                      <span className="admin-eval-ajuster-ligne">
                        <label htmlFor="eval-total-voulu">Total voulu</label>
                        <input
                          id="eval-total-voulu"
                          type="text"
                          autoComplete="off"
                          className="admin-eval-points-input"
                          value={totalVoulu}
                          placeholder="20"
                          disabled={estExamen && modeTotalExamen === 'fixe'}
                          aria-describedby="eval-ajuster-aide"
                          onChange={(e) => {
                            setTotalVoulu(normaliserSigneMoins(e.target.value))
                            setMessageAjustement(null)
                          }}
                        />
                        <button type="button" className="conc-bouton" onClick={ajusterAuTotal} disabled={estExamen && modeTotalExamen === 'fixe'}>
                          Ajuster au total{lireTotal(normaliserSigneMoins(totalVoulu)).etat === 'ok' ? ` (${totalVoulu} pts)` : ''}
                        </button>
                      </span>
                    )}
                    <span id="eval-ajuster-aide" className={`admin-eval-aide${messageAjustement?.erreur ? ' admin-eval-aide-erreur' : ''}`} role={messageAjustement?.erreur ? 'alert' : 'status'}>
                      {estExamen && modeTotalExamen === 'fixe'
                        ? 'Total fixé par partie : les points sont déjà mis à l’échelle partie par partie à l’impression.'
                        : (messageAjustement?.texte ?? 'Questions non verrouillées mises à l’échelle (demi-points) ; cadenas fermé = points gardés.')}
                    </span>
                  </div>
                  {estExamen && partiesPanneau.length > 0 && (
                    <div className="conc-jauge-bloc">
                      <p className="conc-jauge-titre">
                        <span>Parties ({organisationExamen === 'chapitre' ? 'par chapitre' : 'par processus'})</span>
                        <b>{nombreFrPanneau(totalExamen)} pts</b>
                      </p>
                      <ul className="conc-parties">
                        {partiesPanneau.map((p) => (
                          <li key={p.cle}>
                            <span className="conc-partie-nom">
                              Partie {p.romain} · {p.titre}
                            </span>
                            <b>
                              {nombreFrPanneau(p.total)} pts{p.valeurFixee !== null && p.total !== p.somme ? <span className="conc-partie-somme"> (questions : {nombreFrPanneau(p.somme)})</span> : null}
                            </b>
                            <span className="conc-jauge" aria-hidden="true">
                              <span style={{ width: `${pct(p.total, totalExamen)}%` }} />
                            </span>
                            {p.message && (
                              <span className="admin-eval-aide admin-eval-aide-erreur" role="alert">
                                {p.message}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}

              {entrees.length === 0 ? (
                <p className="conc-vide">Rien pour l’instant : choisis une façon de composer, ou des exercices dans le catalogue.</p>
              ) : (
                <ol className="conc-liste" aria-label="Questions, dans l’ordre d’impression">
                  {entrees.map((e) => {
                    const { titre: t, detail } = titreEntree(e)
                    const numero = estExercice ? `Ex. ${e.premier}${e.dernier > e.premier ? `–${e.dernier}` : ''}` : `Q${e.premier}${e.dernier > e.premier ? `–${e.dernier}` : ''}`
                    return (
                      <Fragment key={e.cle}>
                        {e.partie && (
                          <li className="conc-liste-partie" aria-hidden="true">
                            Partie {e.partie.romain} · {e.partie.titre}
                          </li>
                        )}
                        <li className="conc-liste-item">
                          {pastille(e.processus)}
                          <span className="conc-liste-texte">
                            <b>{numero}</b> · {t}
                            {detail && <span className="conc-niv">{detail}</span>}
                          </span>
                          {!estExercice && <span className="conc-liste-points">{nombreFrPanneau(e.points)}</span>}
                          <button type="button" className="conc-retirer" aria-label={`Retirer ${estExercice ? "l'exercice" : 'la question'} ${e.premier} (${t})`} title="Retirer" onClick={() => retirerEntree(e)}>
                            ×
                          </button>
                        </li>
                      </Fragment>
                    )
                  })}
                </ol>
              )}

              <div className="conc-options-resume">
                <p>
                  <b>{estExercice ? 'Options' : 'Documents'} :</b> {resumeOptions.join(' · ')}
                  {!estExercice && lignesConsignes > 0 && (
                    <>
                      <br />
                      <b>Consignes en plus :</b> {lignesConsignes} ligne{lignesConsignes > 1 ? 's' : ''}
                    </>
                  )}
                  {estExamen && (
                    <>
                      <br />
                      <b>Examen :</b> parties {organisationExamen === 'chapitre' ? 'par chapitre' : 'par processus'} · total {modeTotalExamen === 'fixe' ? 'fixé par partie' : 'libre'}
                      {apercuHoraire.horaire ? ` · ${apercuHoraire.horaire}` : apercuHoraire.duree ? ` · ${apercuHoraire.duree}` : ''}
                    </>
                  )}
                </p>
                <button type="button" className="conc-lien" aria-expanded={optionsOuvertes} aria-controls="conc-options" onClick={() => setOptionsOuvertes((v) => !v)}>
                  {optionsOuvertes ? 'Fermer les options' : 'Modifier'}
                </button>
              </div>
              {optionsOuvertes && blocOptions}

              {!estExercice && nombreSeries > 1 && (
                <p className="conc-note">
                  {nombreSeries} versions anti-triche (A à {String.fromCharCode(64 + nombreSeries)}) — mêmes questions, exercices, vrai/faux et questions ouvertes indépendamment randomisés par série
                  quand c'est possible.
                </p>
              )}
              <div className="conc-actions">
                <button type="button" className="conc-bouton conc-bouton-principal conc-generer" onClick={genererEvaluation} disabled={genereEnCours}>
                  {libelleGenerer}
                </button>
                <span className="conc-actions-secondaires">
                  <button type="button" className="conc-bouton" onClick={() => void lancerApercu()} disabled={genereEnCours || totalNombre === 0}>
                    Aperçu
                  </button>
                  <button
                    type="button"
                    className="conc-bouton"
                    onClick={enregistrerPlanCourant}
                    disabled={!planCourant}
                    title={planCourant ? 'Enregistre le dernier tirage (mêmes exercices au rechargement)' : 'Génère la feuille (ou garde un aperçu) d’abord : on enregistre un tirage précis.'}
                  >
                    {connecte ? 'Enregistrer dans le coffre' : 'Enregistrer dans ce navigateur'}
                  </button>
                </span>
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
              </div>
            </aside>
          </div>

          {/* Téléphone : barre fixée en bas, qui ouvre le panneau. */}
          <div className="conc-barre-mobile">
            <button type="button" className="conc-barre-ouvrir" aria-expanded={panneauMobile} aria-controls="conc-panier" onClick={() => setPanneauMobile((v) => !v)}>
              <span className="conc-barre-titre">
                {nomPanier} · {nombreImprime} {unite}
                {nombreImprime > 1 ? 's' : ''} <span aria-hidden="true">{panneauMobile ? '▾' : '▴'}</span>
              </span>
              <span className="conc-barre-detail">
                {totalNombre > 0 ? `≈ ${dureeEstimee} min` : 'rien de choisi'}
                {textePlage ? ` · niveaux ${textePlage.replace('–', ' à ')}` : ''}
                {!estExercice && totalNombre > 0 ? ` · ${nombreFrPanneau(totalAffiche)} pts` : ''}
              </span>
            </button>
            <button type="button" className="conc-bouton conc-bouton-principal" onClick={genererEvaluation} disabled={genereEnCours}>
              {genereEnCours ? '…' : 'Générer'}
            </button>
          </div>
          {panneauMobile && <div className="conc-voile" onClick={() => setPanneauMobile(false)} aria-hidden="true" />}

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
        </>
      )}

      {/* Enregistrements, import et historique (avec la feuille de remédiation). */}
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
                    <button type="button" className={remediationId === e.id ? 'admin-eval-bouton-actif' : undefined} aria-expanded={remediationId === e.id} onClick={() => ouvrirRemediation(e)}>
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
                      Coche les questions à retravailler (numéros de la copie de la série A) : chaque exercice revient avec d'autres nombres, même type et mêmes réglages ; le corrigé est en fin
                      de feuille et un QR code renvoie au générateur avec les aides.
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
                        <Stepper valeur={remediationNombre} min={1} max={6} nom="exercices par question" onChange={setRemediationNombre} />
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

      {apercu && (
        <ApercuDocument
          titre={titre || (estExercice ? "Feuille d'exercices" : estExamen ? 'Examen' : 'Évaluation')}
          documents={apercu.docs}
          enCours={apercu.enCours}
          erreur={apercu.erreur}
          onFermer={fermerApercu}
          onAutreTirage={() => void lancerApercu()}
          onGarder={garderApercu}
        />
      )}
    </div>
  )
}
