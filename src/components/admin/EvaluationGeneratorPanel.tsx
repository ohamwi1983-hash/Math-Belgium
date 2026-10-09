import { Fragment, useMemo, useState } from 'react'
import { LEVELS } from '../../content/chaptersIndex'
import type { ChapterContent } from '../../content/types'
import { declencherTelechargement } from '../../entrainement/export/telechargerBlob'
import { genererEvaluationLocalement, peutGenererLocalement } from '../../lib/evaluationLocal'
import {
  CHAPITRE_FONCTIONNEL_SLUG,
  HEURES_PAR_NIVEAU,
  HEURES_SEMAINE_DEFAUT,
  NIVEAU_NUMERO,
  buildEvaluationUrl,
  catalogueVariantesExercice,
  construireItemsPayload,
  deriveQuestionsComprehension,
  deriveQuestionsOuvertes,
  estChapitreFonctionnel,
  generateursPourSection,
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
  demonstration: 'Questions ouvertes — formules / démonstrations',
  comprehension: 'Questions ouvertes — compréhension',
  vraiFaux: 'Vrai / Faux (avec justification)',
  exercice: 'Exercice généré',
}

const POINTS_DEFAUT: Record<TypeQuestionEvaluation, number> = { demonstration: 3, comprehension: 2, vraiFaux: 1, exercice: 4 }
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

/** Résumé flottant (position fixe, toujours visible) du nombre total de questions/exercices
 * sélectionnés — et, en mode évaluation, du total de points — pour que l'admin/l'élève garde ce
 * compte sous les yeux en parcourant un long tableau, sans devoir défiler jusqu'à la barre du bas. */
function CompteurFlottant({ nombre, points }: { nombre: number; points?: number }) {
  return (
    <div className="admin-eval-compteur" aria-live="polite">
      <strong>{nombre}</strong> question{nombre > 1 ? 's' : ''}/exercice{nombre > 1 ? 's' : ''}
      {points !== undefined && (
        <>
          {' '}
          · <strong>{points}</strong> point{points > 1 ? 's' : ''}
        </>
      )}
    </div>
  )
}

/** Compteur +/- partagé par toutes les lignes du tableau (démonstration/compréhension/vrai-faux/
 * exercice) — remplace l'ancien `<input type="number">` brut, plus confortable au doigt. */
function Stepper({
  valeur,
  max,
  disabled,
  onChange,
}: {
  valeur: number
  max: number
  disabled?: boolean
  onChange: (prochaineValeur: number) => void
}) {
  return (
    <span className="admin-eval-stepper">
      <button
        type="button"
        className="admin-eval-stepper-btn"
        disabled={disabled || valeur <= 0}
        onClick={() => onChange(Math.max(0, valeur - 1))}
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
  const [afficherTitresSection, setAfficherTitresSection] = useState(true)
  /** Sélection exclusive (groupe de type radio) : un seul processus affiché à la fois, jamais 2 ou 3
   * simultanément — voir `.admin-eval-processus-bar`. */
  const [processusActif, setProcessusActif] = useState<Processus>(1)
  const [erreur, setErreur] = useState<string | null>(null)
  const [urlGeneree, setUrlGeneree] = useState<string | null>(null)
  const [genereEnCours, setGenereEnCours] = useState(false)
  /** Nombre de fichiers téléchargés par la dernière génération LOCALE (4e, voir
   * `peutGenererLocalement`) — `null` tant qu'aucune génération locale n'a réussi. Distinct de
   * `urlGeneree` : la génération locale ne produit aucune URL/redirection, juste des téléchargements
   * directs dans l'onglet courant. */
  const [genereLocalementCompte, setGenereLocalementCompte] = useState<number | null>(null)

  const levelSlug = resoudreLevelSlug(niveau, heures)
  const niveauEntry = levelSlug ? LEVELS.find((l) => l.slug === levelSlug) : undefined

  /** Chapitres fonctionnels parmi ceux cochés — `.admin-eval-chapitre-chip` désactive déjà toute
   * sélection d'un chapitre non câblé (voir plus bas), donc en pratique `chapitres` est toujours
   * entièrement fonctionnel ; le filtre reste une garantie défensive si `levelSlug` change sous les
   * pieds d'une sélection déjà faite. */
  const chapitres = (niveauEntry?.chapters.filter((c) => chapitresSlugs.includes(c.slug)) ?? []).filter((c) => estChapitreFonctionnel(levelSlug, c.slug))

  const [lignes, setLignes] = useState<LigneSelection[]>(() => lignesInitiales(chapitres))

  const apercusDemonstration = useMemo(() => {
    const map = new Map<string, number>()
    for (const chapitre of chapitres) {
      for (const section of chapitre.sections) map.set(cleSection(chapitre.slug, section.id), deriveQuestionsOuvertes(chapitre.slug, section).length)
    }
    return map
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `chapitresSlugs.join('|')` + `levelSlug` identifient la sélection réelle (clés primitives stables), `chapitres` lui-même change de référence à chaque rendu.
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

  /** Points totaux d'une ligne — pour `type==='exercice'`, somme par variante (`pointsParVariante`,
   * replié sur `points` tant qu'une variante n'a pas encore son propre barème édité) ; pour les
   * autres types, simple produit `points × nombre` (pas de notion de variante). */
  function pointsLigne(ligne: LigneSelection): number {
    if (ligne.type === 'exercice') {
      return Object.entries(ligne.parVariante ?? {}).reduce(
        (total, [varianteId, nombre]) => total + (ligne.pointsParVariante?.[varianteId] ?? ligne.points) * nombre,
        0,
      )
    }
    return ligne.points * ligne.nombre
  }

  const totalNombre = lignes.reduce((total, l) => total + l.nombre, 0)
  const totalPoints = lignes.reduce((total, l) => total + pointsLigne(l), 0)

  async function genererEvaluation() {
    if (chapitres.length === 0 || !levelSlug) return
    const titreFinal =
      titre ||
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
    }
    const chapitresPayload: ChapitreAvecSections[] = chapitres.map((c) => ({ chapitreSlug: c.slug, chapterNumber: c.chapterNumber, title: c.title, sections: c.sections }))
    const items = construireItemsPayload(entete, lignes, chapitresPayload)
    if (items.length === 0) {
      setErreur('Coche au moins une question (nombre > 0) avant de générer.')
      setUrlGeneree(null)
      setGenereLocalementCompte(null)
      return
    }

    // 4e (chapitres 1 à 8) : génération 100% locale, sans passer par plateforme-maths — voir
    // `evaluationLocal.ts` pour la portée exacte (tous les générateurs sauf les questions
    // vrai/faux, dont les banques n'ont pas encore été portées).
    if (peutGenererLocalement(levelSlug, items)) {
      setErreur(null)
      setUrlGeneree(null)
      setGenereLocalementCompte(null)
      setGenereEnCours(true)
      try {
        const series = await genererEvaluationLocalement(entete, items)
        for (const { serieLettre, enonce, corrige } of series) {
          const suffixeSerie = series.length > 1 ? ` — série ${serieLettre}` : ''
          declencherTelechargement(enonce, `${titreFinal}${suffixeSerie} — énoncé.html`)
          declencherTelechargement(corrige, `${titreFinal}${suffixeSerie} — corrigé.html`)
        }
        setGenereLocalementCompte(series.length * 2)
      } catch (e) {
        console.error(e)
        setErreur('Erreur pendant la génération — réessaie.')
      } finally {
        setGenereEnCours(false)
      }
      return
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
      {!verrouille && (
        <p className="admin-eval-intro">
          Sont fonctionnels : tous les chapitres de 4e et de 5e (4h), ainsi que 3 chapitres de 6e (6h) — fonctions réciproques/cyclométriques,
          fonctions exponentielles, fonctions logarithmes. Les autres niveaux/chapitres/sections apparaissent ci-dessous mais restent désactivés
          (« bientôt ») — l'extension se fera lot par lot. Pour 4e, 5e et le chapitre « Fonctions logarithmes » de 6e, la génération se fait
          désormais directement ici (aucune redirection), sauf sélection d'une question vrai/faux.
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
          <label htmlFor="eval-titre">Titre {estExercice ? "de la feuille d'exercices" : "de l'évaluation"}</label>
          <input
            id="eval-titre"
            type="text"
            placeholder={
              chapitres.length === 1
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
            <div className="admin-eval-tf">
              <label htmlFor="eval-calculatrice">Calculatrice</label>
              <select id="eval-calculatrice" value={calculatrice} onChange={(e) => setCalculatrice(e.target.value as 'interdite' | 'autorisee')}>
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
      </div>
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

          <CompteurFlottant nombre={totalNombre} points={estExercice ? undefined : totalPoints} />

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
                                    const catalogue = catalogueVariantesExercice(ligne.cle as IdGenerateurPilote)
                                    const generateur = generateursPourSection(chapitreCourant.slug, section.id).find((g) => g.generatorId === ligne.cle)
                                    return catalogue.map((variante) => (
                                      <tr className="admin-eval-row" key={(ligne.cle ?? '') + variante.id}>
                                        <td>
                                          {generateur?.label || LABEL_TYPE.exercice} —{' '}
                                          <span className="admin-eval-variante-label">{variante.label}</span>
                                        </td>
                                        <td>—</td>
                                        <td className="admin-eval-col-nombre">
                                          <Stepper
                                            valeur={ligne.parVariante?.[variante.id] ?? 0}
                                            max={MAX_EXERCICE}
                                            onChange={(v) => mettreAJourVariante(chapitreCourant.slug, section.id, ligne.cle ?? '', variante.id, v)}
                                          />
                                        </td>
                                        {!estExercice && (
                                          <td>
                                            <input
                                              type="number"
                                              min={1}
                                              className="admin-eval-points-input"
                                              value={ligne.pointsParVariante?.[variante.id] ?? ligne.points}
                                              onChange={(e) =>
                                                mettreAJourPointsVariante(chapitreCourant.slug, section.id, ligne.cle ?? '', variante.id, Number(e.target.value) || 1)
                                              }
                                              title={`Points / question pour la variante « ${variante.label} »`}
                                            />
                                          </td>
                                        )}
                                      </tr>
                                    ))
                                  }

                                  const estBanqueFixe = ligne.type === 'demonstration' || ligne.type === 'comprehension'
                                  const disponibles = estBanqueFixe
                                    ? (ligne.type === 'demonstration' ? apercusDemonstration : apercusComprehension).get(
                                        cleSection(chapitreCourant.slug, section.id),
                                      ) ?? 0
                                    : MAX_VRAI_FAUX
                                  const indisponible = estBanqueFixe && disponibles === 0
                                  const theme =
                                    ligne.type === 'vraiFaux'
                                      ? themesPourSection(chapitreCourant.slug, section.id).find((t) => t.quizTheme === ligne.cle)
                                      : undefined
                                  return (
                                    <tr className="admin-eval-row" key={ligne.type + (ligne.cle ?? '')}>
                                      <td>
                                        {LABEL_TYPE[ligne.type]}
                                        {theme?.label && ` — ${theme.label}`}
                                        {indisponible &&
                                          (ligne.type === 'demonstration' ? ' — aucune démonstration pour ce point' : ' — aucune question pour ce point')}
                                      </td>
                                      <td>{estBanqueFixe ? disponibles : '—'}</td>
                                      <td className="admin-eval-col-nombre">
                                        <Stepper
                                          valeur={ligne.nombre}
                                          max={disponibles}
                                          disabled={indisponible}
                                          onChange={(v) => mettreAJourLigne(chapitreCourant.slug, section.id, ligne.type, ligne.cle, { nombre: v })}
                                        />
                                      </td>
                                      {!estExercice && (
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
                                    </tr>
                                  )
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

          <div className="admin-eval-bottombar">
            {!estExercice && (
              <p className="admin-eval-total">
                Total : {totalPoints} point{totalPoints > 1 ? 's' : ''}
              </p>
            )}
            <button type="button" className="admin-gate-submit" onClick={genererEvaluation} disabled={genereEnCours}>
              {genereEnCours
                ? 'Génération en cours…'
                : `${estExercice ? 'Générer la feuille' : nombreSeries > 1 ? `Générer les ${nombreSeries} séries` : "Générer l'évaluation"} (HTML A4, énoncé + corrigé)`}
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
          {genereLocalementCompte !== null && <p className="admin-eval-lien">{genereLocalementCompte} fichier(s) téléchargé(s) directement.</p>}
        </>
      )}
    </div>
  )
}
