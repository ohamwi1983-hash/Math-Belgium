import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { ChapterContent } from '../../content/types'
import { findChapter } from '../../content/chaptersIndex'
import { usePageNonIndexee } from '../../lib/useDocumentMeta'
import { titreCourt } from '../../lib/parcoursChapitre'
import type { ChoixProjection, Diapo as DonneesDiapo, Role } from '../../lib/projection/diapos'
import { choixDepuisUrl, construireDiapos, texteBrut } from '../../lib/projection/diapos'
import { fenetreDiapos, ouvrirFenetreDiapos } from '../../lib/projection/fenetre'
import { RichText } from '../Math'
import { SiteHeader } from '../SiteHeader'
import { Diapo } from './Diapo'
import { Paginateur } from './Paginateur'
import { Scene } from './Scene'
import { Annotations, FondBlancTableau } from './Tableau'
import { BarreOutils, basculerCompas, basculerFluo, basculerStylo, BoutonsInstruments, COULEURS_FLUO, COULEURS_STYLO, DUREES_MINUTEUR, formatDuree, useResteMinuteur } from './BarreOutils'
import { useMagasinInstruments } from './instruments'
import { OutilsBlanc, OutilsDessin } from './Pastilles'
import type { OutilsLocaux } from './BarreOutils'
import { GardeProfesseur } from './GardeProfesseur'
import { Pictogramme } from './Pictogrammes'
import { clePageCourante, useProjection } from './useProjection'
import type { Projection } from './useProjection'
import { lireAnnotations, aDesAnnotations } from '../../lib/projection/annotations'
import type { DonneesAnnotations } from '../../lib/projection/annotations'
import { useConservation, useMagasinAnnotations } from './magasinAnnotations'
import { DialogueQuitter, PaletteExport, useExportAnnote, useResume } from './ExportAnnote'
import { DialogueFinProjection, useMatiereProjection } from './MatiereFinProjection'
import type { PropositionMatiere } from '../../lib/projection/matiereProjetee'
import { BoutonPoints, PanneauPoints, ParticipationProjetee, ReglagesParticipationDialogue, useParticipation } from './Participation'
import { BoutonEnregistrer, DialogueEnregistrer, DialogueVideoPrete, RappelEnregistrement, useEnregistrement, useEnregistrementDistant } from './Enregistrement'
import { ChercherAffiche, ContexteExerciceTableau, ErreurExercice, OutilsExercice, PanneauExerciceProf, ScenePageExercice, useExercicesProjection } from './ExerciceTableau'
import { basculerCopier, BoutonCopier, usePagesEcrites } from './Copier'
import '../carnet/matiere-projetee.css'
import './projection.css'

/**
 * Route `/{niveau}/{chapitre}/projeter` (chargée à la demande, jamais pré-rendue, `noindex`, réservée
 * au professeur connecté). Paramètres : `etapes` (ids de sections), `inclure`, `role` (`diapos` =
 * fenêtre projetée du mode deux écrans, `prof` = vue du professeur ; absent = un seul écran), `repli`
 * (fenêtre des diapos bloquée par le navigateur).
 */
export function ProjectionPage() {
  const { levelSlug, chapterSlug } = useParams<{ levelSlug: string; chapterSlug: string }>()
  const chapter = levelSlug && chapterSlug ? findChapter(levelSlug, chapterSlug) : undefined
  const location = useLocation()
  // Fenêtre des diapos : titre distinct, à choisir dans la fenêtre de partage du navigateur (« ● Enregistrer » en deux écrans).
  const fenetreDesDiapos = new URLSearchParams(location.search).get('role') === 'diapos'
  usePageNonIndexee(chapter ? `${fenetreDesDiapos ? 'Diapos' : 'Projection'} — ${chapter.title}` : 'Projection')
  if (!chapter) return <Navigate to="/" replace />
  return (
    <GardeOuPage chapter={chapter} retour={location.pathname + location.search}>
      <Projection chapter={chapter} />
    </GardeOuPage>
  )
}

function GardeOuPage({ chapter, retour, children }: { chapter: ChapterContent; retour: string; children: React.ReactNode }) {
  return (
    <GardeProfesseurAvecCadre chapter={chapter} retour={retour}>
      {children}
    </GardeProfesseurAvecCadre>
  )
}

/** Sans session : en-tête du site + message de la garde ; avec session : la projection plein cadre. */
function GardeProfesseurAvecCadre({ chapter, retour, children }: { chapter: ChapterContent; retour: string; children: React.ReactNode }) {
  return (
    <GardeProfesseur
      retour={retour}
      cadre={(message) => (
        <>
          <SiteHeader breadcrumb={[{ label: chapter.level, to: '/' }, { label: chapter.title, to: `/${chapter.levelSlug}/${chapter.slug}` }, { label: 'Projeter' }]} />
          <main className="page projection-garde-page">{message}</main>
        </>
      )}
    >
      {children}
    </GardeProfesseur>
  )
}

function Projection({ chapter }: { chapter: ChapterContent }) {
  const [params] = useSearchParams()
  const { choix, role } = useMemo(() => choixDepuisUrl(chapter, params), [chapter, params])
  const repli = params.get('repli') === '1'
  const brutes = useMemo(() => construireDiapos(chapter, choix), [chapter, choix])
  const [diapos, setDiapos] = useState<DonneesDiapo[] | null>(null)
  const surFini = useCallback((d: DonneesDiapo[]) => setDiapos(d), [])
  // Annotations gardées dans ce navigateur pour ce chapitre (lues pendant le découpage des diapos).
  const [gardees, setGardees] = useState<DonneesAnnotations | null | undefined>(undefined)
  useEffect(() => {
    let vivant = true
    void lireAnnotations(chapter).then((d) => vivant && setGardees(d))
    return () => {
      vivant = false
    }
  }, [chapter])

  if (brutes.length === 0) {
    return (
      <div className="projection-garde" role="status">
        <h1>Projeter en classe</h1>
        <p>Aucune diapo avec ces réglages : choisis au moins un point.</p>
      </div>
    )
  }
  if (!diapos || gardees === undefined) {
    return (
      <div className="projection projection--chargement theme-clair">
        <p className="projection-preparation" role="status">
          Préparation des diapos…
        </p>
        {!diapos && <Paginateur diapos={brutes} chapter={chapter} onFini={surFini} />}
      </div>
    )
  }
  return role === 'prof' ? (
    <VuePresentateur chapter={chapter} diapos={diapos} choix={choix} gardees={gardees} />
  ) : (
    <VueDiapos chapter={chapter} diapos={diapos} role={role} repli={repli} choix={choix} gardees={gardees} />
  )
}

// ---------- outils communs ----------

function useMessage(): [string | null, (m: string) => void] {
  const [message, setMessage] = useState<string | null>(null)
  const t = useRef<number | undefined>(undefined)
  const afficher = useCallback((m: string) => {
    setMessage(m)
    window.clearTimeout(t.current)
    t.current = window.setTimeout(() => setMessage(null), 7000)
  }, [])
  useEffect(() => () => window.clearTimeout(t.current), [])
  return [message, afficher]
}

function usePleinEcran(signaler: (m: string) => void) {
  const [plein, setPlein] = useState(() => typeof document !== 'undefined' && !!document.fullscreenElement)
  useEffect(() => {
    const maj = () => setPlein(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', maj)
    return () => document.removeEventListener('fullscreenchange', maj)
  }, [])
  const basculer = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen?.().catch(() => undefined)
      return
    }
    const el = document.documentElement
    if (!document.fullscreenEnabled || !el.requestFullscreen) {
      signaler('Plein écran indisponible dans ce navigateur : utilise la touche F11 (ou le menu du navigateur).')
      return
    }
    el.requestFullscreen().catch(() => signaler('Le navigateur a refusé le plein écran : clique dans la page puis réessaie, ou utilise F11.'))
  }, [signaler])
  return { plein, basculer }
}

/**
 * Plein écran d'une diapo d'atelier (état PARTAGÉ `atelierPlein` : l'écran de la classe suit). Dans la
 * fenêtre où l'on clique, l'API Fullscreen est demandée si la page n'est pas déjà en plein écran (sinon le
 * calque plein cadre de la projection suffit) et quittée en sortant ; sortir du plein écran du navigateur
 * (Échap, F11) fait aussi sortir l'atelier.
 */
function useAtelierPlein(projection: Projection) {
  const { etat, basculerAtelierPlein } = projection
  const parNous = useRef(false)
  const plein = etat.atelierPlein
  const basculer = useCallback(() => {
    if (!plein && !document.fullscreenElement && document.fullscreenEnabled && document.documentElement.requestFullscreen) {
      parNous.current = true
      document.documentElement.requestFullscreen().catch(() => {
        parNous.current = false
      })
    }
    basculerAtelierPlein(!plein)
  }, [plein, basculerAtelierPlein])
  // Sortie (bouton, Échap, diapo suivante, autre fenêtre) : on rend le plein écran du navigateur si c'est nous qui l'avions pris.
  useEffect(() => {
    if (!plein && parNous.current) {
      parNous.current = false
      if (document.fullscreenElement) void document.exitFullscreen?.().catch(() => undefined)
    }
  }, [plein])
  useEffect(() => {
    const surChangement = () => {
      if (!document.fullscreenElement && parNous.current) {
        parNous.current = false
        basculerAtelierPlein(false)
      }
    }
    document.addEventListener('fullscreenchange', surChangement)
    return () => document.removeEventListener('fullscreenchange', surChangement)
  }, [basculerAtelierPlein])
  return { plein, basculer, sortir: () => basculerAtelierPlein(false) }
}

/** Atelier en plein écran : la barre ne revient que si le pointeur approche du bas de l'écran (on manipule
 * l'atelier à la souris : la barre ne doit pas couvrir ses réglages à chaque mouvement). */
function usePresDuBas(actif: boolean): boolean {
  const [pres, setPres] = useState(false)
  useEffect(() => {
    if (!actif) {
      setPres(false)
      return
    }
    let t: number | undefined
    const surPointeur = (e: PointerEvent) => {
      const bas = e.clientY > window.innerHeight - 96
      if (bas) {
        window.clearTimeout(t)
        setPres(true)
      } else {
        window.clearTimeout(t)
        t = window.setTimeout(() => setPres(false), 1200)
      }
    }
    window.addEventListener('pointermove', surPointeur)
    window.addEventListener('pointerdown', surPointeur)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('pointermove', surPointeur)
      window.removeEventListener('pointerdown', surPointeur)
    }
  }, [actif])
  return pres
}

/** Raccourcis clavier — UNIQUEMENT pendant la projection (écouteur posé par cette page). Une touche
 * frappée dans un champ, un curseur ou un bouton d'atelier (Shadow DOM compris) lui revient ; sur un
 * bouton (palette, calculatrice), seules les lettres restent des raccourcis (elles n'y font rien d'autre). */
function useClavier(actions: Record<string, (() => void) | undefined>) {
  const ref = useRef(actions)
  ref.current = actions
  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const chemin = e.composedPath() as HTMLElement[]
      const dansChamp = chemin.some((n) => n instanceof HTMLElement && (n.matches?.('input, textarea, select, [contenteditable="true"]') || (n.matches?.('button, a[href]') && e.key !== 'Escape' && !/^[a-z.]$/i.test(e.key) && !n.classList.contains('projection-outil'))))
      const dansAtelier = chemin.some((n) => n instanceof HTMLElement && n.classList?.contains('diapo-atelier'))
      if (dansChamp || (dansAtelier && e.key !== 'Escape' && e.key !== 'PageDown' && e.key !== 'PageUp')) return
      const a = ref.current
      const touche = e.key.length === 1 ? e.key.toLowerCase() : e.key
      const action =
        touche === 'PageDown' && a.pageSuivante
          ? a.pageSuivante
          : touche === 'PageUp' && a.pagePrecedente
            ? a.pagePrecedente
            : touche === 'ArrowRight' || touche === 'ArrowDown' || touche === 'PageDown' || touche === ' ' || touche === 'Enter' || touche === 'n'
          ? a.suivant
          : touche === 'ArrowLeft' || touche === 'ArrowUp' || touche === 'PageUp' || touche === 'Backspace' || touche === 'p'
            ? a.precedent
            : touche === 'Home'
              ? a.debut
              : touche === 'End'
                ? a.fin
                : touche === 'b' || touche === '.'
                  ? a.blanc
                  : touche === 'g'
                    ? a.ensemble
                    : touche === 'Escape'
                      ? a.echap
                      : touche === 'f' || touche === 'F5'
                        ? a.pleinEcran
                        : touche === 's'
                          ? a.stylo
                          : touche === 'h'
                            ? a.fluo
                            : touche === 'q'
                              ? a.equerre
                              : touche === 'c'
                                ? a.compas
                                : touche === 'k'
                                  ? a.calc
                                  : touche === 'x'
                                    ? a.copier
                                    : undefined
      if (!action) return
      e.preventDefault()
      action()
    }
    window.addEventListener('keydown', surTouche)
    return () => window.removeEventListener('keydown', surTouche)
  }, [])
}

/** Barre visible tant que la souris bouge ; masquée (et le curseur aussi) après 3 s d'inactivité. */
function useInactivite(gele: boolean): [boolean, () => void] {
  const [visible, setVisible] = useState(true)
  const t = useRef<number | undefined>(undefined)
  const reveiller = useCallback(() => {
    setVisible(true)
    window.clearTimeout(t.current)
    const masquer = () => {
      // Champ de la barre en cours de saisie (traceur f(x)) : la barre reste.
      if (document.activeElement?.closest('.projection-barre, .projection-palettes, .projection-blanc-outils, .projection-nuancier') && document.activeElement.matches('input, textarea')) {
        t.current = window.setTimeout(masquer, 3000)
        return
      }
      setVisible(false)
    }
    t.current = window.setTimeout(masquer, 3000)
  }, [])
  useEffect(() => {
    reveiller()
    const surMouvement = () => reveiller()
    window.addEventListener('mousemove', surMouvement)
    window.addEventListener('pointerdown', surMouvement)
    window.addEventListener('touchstart', surMouvement, { passive: true })
    return () => {
      window.clearTimeout(t.current)
      window.removeEventListener('mousemove', surMouvement)
      window.removeEventListener('pointerdown', surMouvement)
      window.removeEventListener('touchstart', surMouvement)
    }
  }, [reveiller])
  return [visible || gele, reveiller]
}

function fil(chapter: ChapterContent, d: DonneesDiapo | undefined) {
  return d ? `${chapter.title} · point ${d.section.number} · ${titreCourt(d.section)}` : chapter.title
}

/** Minuteur de la barre, affiché en haut à droite de l'écran projeté (visible de la classe). */
function MinuteurAffiche({ projection }: { projection: Projection }) {
  const reste = useResteMinuteur(projection.etat.minuteur.fin)
  if (reste === null) return null
  return (
    <button
      type="button"
      className={`projection-minuteur${reste === 0 ? ' fini' : ''}`}
      onClick={(e) => {
        e.stopPropagation()
        if (reste === 0) projection.arreterMinuteur()
      }}
      aria-label={reste === 0 ? 'Temps écoulé : fermer le minuteur' : `Minuteur : ${formatDuree(reste)}`}
    >
      <Pictogramme nom="minuteur" taille={22} />
      {reste === 0 ? 'Temps écoulé' : formatDuree(reste)}
    </button>
  )
}

/** Vue d'ensemble : grille de toutes les diapos (touche G ou Échap), clic = aller à la diapo. */
function VueEnsemble({ chapter, diapos, projection, fermer }: { chapter: ChapterContent; diapos: DonneesDiapo[]; projection: Projection; fermer: () => void }) {
  const courante = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    courante.current?.focus()
    courante.current?.scrollIntoView({ block: 'center' })
  }, [])
  return (
    <div className="projection-ensemble" role="dialog" aria-modal="true" aria-label="Vue d'ensemble des diapos" onClick={(e) => e.stopPropagation()}>
      <div className="projection-ensemble-tete">
        <h2>Vue d'ensemble · {diapos.length} diapos</h2>
        <button type="button" className="projection-outil" aria-label="Fermer la vue d'ensemble" title="Fermer (Échap)" onClick={fermer}>
          <Pictogramme nom="fermer" />
        </button>
      </div>
      <ol className="projection-ensemble-grille">
        {diapos.map((d, i) => (
          <li key={d.cle}>
            <button
              ref={i === projection.etat.index ? courante : undefined}
              type="button"
              className={`projection-vignette${i === projection.etat.index ? ' courante' : ''}`}
              aria-current={i === projection.etat.index ? 'true' : undefined}
              aria-label={`Diapo ${i + 1} : ${texteBrut(etiquette(d))}`}
              onClick={() => {
                projection.aller(i)
                fermer()
              }}
            >
              <span className="projection-vignette-cadre">
                <span className="projection-vignette-diapo">
                  <Diapo diapo={d} chapter={chapter} pas={d.pas} mode="vignette" />
                </span>
              </span>
              <span className="projection-vignette-num">
                {i + 1}
                <span>{texteBrut(etiquette(d))}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}

function etiquette(d: DonneesDiapo): string {
  switch (d.type) {
    case 'titre':
      return `Point ${d.section.number}`
    case 'essentiel':
      return 'L’essentiel'
    case 'figure':
      return 'Figure'
    case 'exemple':
      return d.debut > 0 ? 'Exemple (suite)' : 'Exemple résolu'
    case 'libre':
      return d.demo ? 'Démonstration' : 'Exemple résolu'
    case 'teste':
      return 'Teste-toi'
    case 'atelier':
      return 'Atelier'
    case 'entrainement':
      return 'S’entraîner'
    case 'video':
      return 'Vidéo'
  }
}

const OUTILS_DEPART: OutilsLocaux = {
  stylo: false,
  outil: 'stylo',
  couleur: COULEURS_STYLO[0].valeur,
  fluo: COULEURS_FLUO[0].valeur,
  epaisseur: 'moyen',
  ensemble: false,
  menuMinuteur: false,
  menuExport: false,
  // Replié au départ (rien sur l'écran de la classe) ; déplié quand on choisit le fond « repère » ou au bouton f(x).
  traceur: false,
  pleinEcran: false,
  palette: false,
  nuancier: false,
  menuFond: false,
}

/** Palettes repliées dès qu'on écrit sur la diapo (colonne du dessin, nuancier, traceur, menu du fond). */
const replierPalettes = (o: OutilsLocaux): OutilsLocaux => (o.palette || o.nuancier || o.traceur || o.menuFond || o.menuGabarit ? { ...o, palette: false, nuancier: false, traceur: false, menuFond: false, menuGabarit: false } : o)
/** Échap : d'abord ce qui est déplié (nuancier, puis colonne / menu / traceur) ; null s'il n'y a rien. */
const echapPalettes = (o: OutilsLocaux): OutilsLocaux | null => (o.nuancier ? { ...o, nuancier: false } : o.palette || o.menuFond || o.menuGabarit ? { ...o, palette: false, menuFond: false, menuGabarit: false } : null)

/**
 * Annotations de la page de projection : magasin (toutes les pages), conservation dans le navigateur, page
 * affichée (diapo ou page blanche), export annoté, « Nouvelle séance », résumé.
 */
function useAnnotationsProjection(chapter: ChapterContent, diapos: DonneesDiapo[], choix: Pick<ChoixProjection, 'etapes' | 'inclure'>, projection: Projection, gardees: DonneesAnnotations | null) {
  const annotations = useMagasinAnnotations(projection, gardees?.pages)
  const sauver = useConservation(chapter, annotations, projection.etat)
  const exp = useExportAnnote(chapter, choix, diapos, annotations, projection.etat)
  const resume = useResume(annotations, projection.etat)
  const page = clePageCourante(projection.etat, diapos)
  const blanche = projection.pageBlanche()
  const nouvelleSeance = useCallback(() => {
    annotations.toutEffacer()
    projection.oublierPagesBlanches()
    projection.oublierExercices()
    window.setTimeout(sauver, 0)
  }, [annotations, projection, sauver])
  return { annotations, exp, resume, page, blanche, nouvelleSeance }
}

/** Fond de l'écran blanc : celui de la page blanche affichée (échelle du repère comprise). */
function FondPage({ projection }: { projection: Projection }) {
  const p = projection.pageBlanche()
  if (!projection.etat.blanc) return null
  return <FondBlancTableau fond={p?.fond ?? projection.etat.fond} ex={p?.ex} ey={p?.ey} vue={p?.vue} />
}

/** Sélecteur des éléments qui gardent leurs clics (jamais « diapo suivante »). */
const INTERACTIFS = 'button, a, input, select, textarea, .diapo-atelier, .projection-barre, .projection-interactif'

// ---------- un écran / fenêtre des diapos ----------

function VueDiapos({
  chapter,
  diapos,
  role,
  repli,
  choix,
  gardees,
}: {
  chapter: ChapterContent
  diapos: DonneesDiapo[]
  role: Role
  repli: boolean
  choix: Pick<ChoixProjection, 'etapes' | 'inclure'>
  gardees: DonneesAnnotations | null
}) {
  const navigate = useNavigate()
  const projection = useProjection(chapter, diapos, role, gardees ?? undefined)
  const magasin = useMagasinInstruments(projection)
  const ann = useAnnotationsProjection(chapter, diapos, choix, projection, gardees)
  const [demandeQuitter, setDemandeQuitter] = useState(false)
  const { etat, suivant, precedent, aller, basculerBlanc } = projection
  // Matière vue proposée en fin de projection (vue qui pilote seulement, jamais l'écran de la classe).
  const matiere = useMatiereProjection(chapter, diapos, etat.index, role)
  const [proposition, setProposition] = useState<PropositionMatiere | null>(null)
  const [message, signaler] = useMessage()
  const { plein, basculer } = usePleinEcran(signaler)
  const [outils, setOutils] = useState<OutilsLocaux>(OUTILS_DEPART)
  const [accueil, setAccueil] = useState(role === 'diapos')
  // P5 : enregistrer la projection en vidéo (un écran : la diapo de cet onglet) ; la fenêtre des diapos suit l'enregistrement de la vue du professeur.
  const rec = useEnregistrement({ chapter, diapos, index: etat.index, role, cible: () => document.querySelector<HTMLElement>('.projection-scene--principale .projection-scene-cadre') })
  const enregistreAilleurs = useEnregistrementDistant(chapter, role !== 'diapos')
  const dialogueRec = rec.phase === 'reglages' || rec.phase === 'fini'
  // P6 : points de participation (projeté hors du cadre filmé ; un écran : panneau replié chez le professeur).
  const part = useParticipation(chapter, role)
  const [tiroirPoints, setTiroirPoints] = useState(false)
  const [reglagesPoints, setReglagesPoints] = useState(false)
  // La barre se masque après 3 s même stylo en main (la pastille, elle, reste) ; pas tant qu'une palette est dépliée.
  const [barreActive] = useInactivite(outils.palette || outils.nuancier || outils.menuFond || !!outils.menuGabarit || outils.menuMinuteur || outils.menuExport || outils.ensemble || demandeQuitter || dialogueRec || tiroirPoints || reglagesPoints)
  const pagesEcrites = usePagesEcrites(projection, ann.annotations)
  const surEcrire = useCallback(() => setOutils(replierPalettes), [])
  const atelierPlein = useAtelierPlein(projection)
  const pleinIci = atelierPlein.plein && diapos[etat.index]?.type === 'atelier'
  const presDuBas = usePresDuBas(pleinIci)
  const barreVisible = pleinIci ? presDuBas || outils.stylo || outils.menuMinuteur || outils.menuExport || outils.ensemble : barreActive
  const glisse = useRef<{ x: number; y: number } | null>(null)
  const d = diapos[etat.index]
  // P1 : exercice projeté par-dessus la diapo — → / Espace / clic = ligne suivante du corrigé.
  const exo = useExercicesProjection(chapter, diapos, projection)
  const avancer = exo.page ? exo.actions.suivante : suivant
  const reculer = exo.page ? exo.actions.precedente : precedent

  useEffect(() => {
    if (repli) signaler('La fenêtre des diapos a été bloquée par le navigateur : projection sur un seul écran. Autorise les fenêtres surgissantes de ce site pour utiliser deux écrans.')
  }, [repli, signaler])

  const quitterVraiment = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen?.().catch(() => undefined)
    if (role !== 'diapos') matiere.terminer()
    if (role === 'diapos') {
      window.close()
      return
    }
    navigate(`/${chapter.levelSlug}/${chapter.slug}#projeter`)
  }, [navigate, chapter, role, matiere])
  // Quitter avec des annotations : proposer de les télécharger (pas sur l'écran de la classe en deux écrans) ;
  // pendant une heure de cours de l'horaire : proposer aussi de noter la matière vue.
  const quitter = useCallback(() => {
    const p = matiere.proposition()
    setProposition(p)
    if (role !== 'diapos' && (p || aDesAnnotations({ pages: ann.annotations.instantane(), blanches: projection.etat.blanches, exercices: projection.etat.exercices }))) setDemandeQuitter(true)
    else quitterVraiment()
  }, [role, ann.annotations, projection.etat.blanches, projection.etat.exercices, quitterVraiment, matiere])

  useClavier({
    suivant: () => !outils.ensemble && !demandeQuitter && !dialogueRec && !reglagesPoints && avancer(),
    precedent: () => !outils.ensemble && !demandeQuitter && !dialogueRec && !reglagesPoints && reculer(),
    // Écran blanc affiché : Page préc. / Page suiv. passent d'une page blanche à l'autre.
    pageSuivante: etat.blanc ? () => projection.allerPage(1) : undefined,
    pagePrecedente: etat.blanc ? () => projection.allerPage(-1) : undefined,
    debut: () => aller(0),
    fin: () => aller(diapos.length - 1),
    blanc: basculerBlanc,
    ensemble: () => setOutils((o) => ({ ...o, ensemble: !o.ensemble })),
    stylo: () => setOutils(basculerStylo),
    fluo: () => setOutils(basculerFluo),
    compas: () => setOutils(basculerCompas),
    equerre: () => magasin.equerre({ visible: !magasin.lire().equerre.visible }),
    calc: () => magasin.calc({ visible: !magasin.lire().calc.visible }),
    copier: () => {
      if (!outils.copier && etat.blanc) basculerBlanc()
      setOutils(basculerCopier)
    },
    pleinEcran: basculer,
    echap: () => {
      if (accueil) setAccueil(false)
      else if (rec.phase === 'reglages') rec.fermerReglages()
      else if (reglagesPoints) setReglagesPoints(false)
      else if (tiroirPoints) setTiroirPoints(false)
      else if (pleinIci) atelierPlein.sortir()
      else if (outils.ensemble) setOutils((o) => ({ ...o, ensemble: false }))
      else if (echapPalettes(outils)) setOutils((o) => echapPalettes(o) ?? o)
      else if (outils.stylo || outils.menuMinuteur || outils.menuExport) setOutils((o) => ({ ...o, stylo: false, menuMinuteur: false, menuExport: false }))
      else if (exo.page) exo.actions.fermer()
      else setOutils((o) => ({ ...o, ensemble: true }))
    },
  })

  return (
    <div
      className={`projection projection--diapos${barreActive ? '' : ' inactive'}${pleinIci ? ' atelier-plein' : ''}${role === 'diapos' && enregistreAilleurs ? ' en-enregistrement' : ''}`}
      onClick={(e) => {
        if (outils.stylo || outils.menuMinuteur || outils.menuExport) {
          if (outils.menuMinuteur || outils.menuExport) setOutils((o) => ({ ...o, menuMinuteur: false, menuExport: false }))
          return
        }
        const cible = e.target as HTMLElement
        if (cible.closest(INTERACTIFS)) return
        avancer()
      }}
      onPointerDown={(e) => {
        if (e.pointerType !== 'mouse') glisse.current = { x: e.clientX, y: e.clientY }
      }}
      onPointerUp={(e) => {
        const g = glisse.current
        glisse.current = null
        if (!g || outils.stylo || (e.target as HTMLElement).closest('.diapo-atelier, .projection-interactif')) return
        const dx = e.clientX - g.x
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(e.clientY - g.y) * 1.5) (dx < 0 ? avancer : reculer)()
      }}
    >
      <ContexteExerciceTableau.Provider value={exo.contexte}>
      <Scene className="projection-scene--principale">
        {(echelle) => (
          <>
            {d && <Diapo key={d.cle} diapo={d} chapter={chapter} pas={etat.pas} mode="direct" debut={etat.debut} atelier={{ plein: atelierPlein.plein, basculerPlein: atelierPlein.basculer }} />}
            <FondPage projection={projection} />
            {exo.page && exo.exercice && <ScenePageExercice ex={exo.exercice} page={exo.page} />}
            <Annotations projection={projection} magasin={magasin} annotations={ann.annotations} page={ann.page} blanche={ann.blanche} outils={outils} echelle={echelle} role={role} surEcrire={surEcrire} setOutils={setOutils} />
          </>
        )}
      </Scene>
      </ContexteExerciceTableau.Provider>
      <MinuteurAffiche projection={projection} />
      {etat.blanc && <OutilsBlanc projection={projection} annotations={ann.annotations} outils={outils} setOutils={setOutils} visible={barreVisible} />}
      <OutilsExercice exo={exo} visible={barreVisible} />
      <ChercherAffiche page={exo.page} onArreter={() => exo.actions.chercher(null)} />
      <ErreurExercice exo={exo} />
      <OutilsDessin outils={outils} setOutils={setOutils} />
      {pleinIci && (
        <button
          type="button"
          className={`projection-sortir-plein${barreActive ? '' : ' masque'}`}
          onClick={(e) => {
            e.stopPropagation()
            atelierPlein.sortir()
          }}
          title="Quitter le plein écran de l'atelier (Échap)"
        >
          <Pictogramme nom="quitter-plein-ecran" /> Quitter le plein écran
        </button>
      )}
      <BarreOutils
        projection={projection}
        total={diapos.length}
        fil={fil(chapter, d)}
        outils={{ ...outils, pleinEcran: plein }}
        setOutils={setOutils}
        visible={barreVisible}
        basculerPleinEcran={basculer}
        quitter={quitter}
        magasin={magasin}
        paletteExport={role === 'diapos' ? undefined : <PaletteExport exp={ann.exp} resume={ann.resume} nouvelleSeance={ann.nouvelleSeance} />}
        outilsO={
          role === 'diapos' ? (
            part.affiche.actif ? <BoutonPoints part={part} actif={part.affiche.visible} onClick={() => part.majAffiche((a) => ({ ...a, visible: !a.visible }))} /> : undefined
          ) : (
            <>
              <BoutonEnregistrer rec={rec} />
              <BoutonPoints part={part} actif={tiroirPoints} onClick={() => (part.reglages ? setTiroirPoints((t) => !t) : setReglagesPoints(true))} />
            </>
          )
        }
        boutonCopier={<BoutonCopier projection={projection} outils={outils} setOutils={setOutils} />}
        pagesEcrites={pagesEcrites}
      />
      <ParticipationProjetee part={part} masquer={rec.enCours && rec.mode === 'region'} />
      {tiroirPoints && role !== 'diapos' && (
        <div className="part-tiroir" onClick={(e) => e.stopPropagation()}>
          <PanneauPoints part={part} prive={false} onReglages={() => setReglagesPoints(true)} onFermer={() => setTiroirPoints(false)} />
        </div>
      )}
      {reglagesPoints && <ReglagesParticipationDialogue part={part} fermer={() => setReglagesPoints(false)} />}
      <RappelEnregistrement rec={rec} visible={!barreVisible} />
      <DialogueEnregistrer rec={rec} chapter={chapter} />
      <DialogueVideoPrete rec={rec} chapter={chapter} />
      {outils.ensemble && <VueEnsemble chapter={chapter} diapos={diapos} projection={projection} fermer={() => setOutils((o) => ({ ...o, ensemble: false }))} />}
      {demandeQuitter &&
        (proposition ? (
          <DialogueFinProjection proposition={proposition} matiere={matiere} exp={ann.exp} resume={ann.resume} annotations={aDesAnnotations({ pages: ann.annotations.instantane(), blanches: etat.blanches, exercices: etat.exercices })} quitter={quitterVraiment} fermer={() => setDemandeQuitter(false)} />
        ) : (
          <DialogueQuitter exp={ann.exp} resume={ann.resume} quitter={quitterVraiment} fermer={() => setDemandeQuitter(false)} />
        ))}
      {accueil && (
        <div className="projection-accueil" role="dialog" aria-modal="true" aria-labelledby="projection-accueil-titre" onClick={(e) => e.stopPropagation()}>
          <div>
            <h2 id="projection-accueil-titre">Fenêtre des diapos</h2>
            <p>Place cette fenêtre sur l'écran projeté, puis passe-la en plein écran. Tu la pilotes depuis la fenêtre du professeur (ou ici, au clavier).</p>
            <div className="projection-accueil-actions">
              <button
                type="button"
                className="projection-bouton-plein"
                autoFocus
                onClick={() => {
                  setAccueil(false)
                  basculer()
                }}
              >
                <Pictogramme nom="plein-ecran" /> Plein écran
              </button>
              <button type="button" className="projection-bouton" onClick={() => setAccueil(false)}>
                Continuer sans
              </button>
            </div>
            {!projection.synchro && <p className="projection-avertissement">Ce navigateur ne permet pas de synchroniser deux fenêtres : pilote les diapos depuis cette fenêtre.</p>}
          </div>
        </div>
      )}
      {message && (
        <p className="projection-message" role="status">
          {message}
        </p>
      )}
    </div>
  )
}

// ---------- vue du professeur (deux écrans) ----------

function VuePresentateur({ chapter, diapos, choix, gardees }: { chapter: ChapterContent; diapos: DonneesDiapo[]; choix: Pick<ChoixProjection, 'etapes' | 'inclure'>; gardees: DonneesAnnotations | null }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const projection = useProjection(chapter, diapos, 'prof', gardees ?? undefined)
  const magasin = useMagasinInstruments(projection)
  const ann = useAnnotationsProjection(chapter, diapos, choix, projection, gardees)
  const [demandeQuitter, setDemandeQuitter] = useState(false)
  const { etat, suivant, precedent, aller, basculerBlanc, lancerMinuteur, arreterMinuteur, basculerAtelierPlein } = projection
  const matiere = useMatiereProjection(chapter, diapos, etat.index, 'prof')
  const [proposition, setProposition] = useState<PropositionMatiere | null>(null)
  const [message, signaler] = useMessage()
  const { plein, basculer } = usePleinEcran(signaler)
  const [outils, setOutils] = useState<OutilsLocaux>(OUTILS_DEPART)
  const surEcrire = useCallback(() => setOutils(replierPalettes), [])
  const pagesEcrites = usePagesEcrites(projection, ann.annotations)
  const [fenetreOuverte, setFenetreOuverte] = useState(() => !!fenetreDiapos() && !fenetreDiapos()!.closed)
  const [depart] = useState(() => Date.now())
  const [maintenant, setMaintenant] = useState(() => Date.now())
  const reste = useResteMinuteur(etat.minuteur.fin)
  const d = diapos[etat.index]
  // P1 : exercice projeté ; « Pour toi seul » remplace la colonne Suivante / Notes.
  const exo = useExercicesProjection(chapter, diapos, projection)
  const avancer = exo.page ? exo.actions.suivante : suivant
  const reculer = exo.page ? exo.actions.precedente : precedent
  // P5 : en deux écrans, on filme la fenêtre des diapos (choisie dans la fenêtre de partage du navigateur).
  const rec = useEnregistrement({ chapter, diapos, index: etat.index, role: 'prof', cible: () => null })
  const dialogueRec = rec.phase === 'reglages' || rec.phase === 'fini'
  // P6 : la grille des élèves remplace la colonne « Suivante / Notes » (bouton « Points » ; « ✕ » pour revenir).
  const part = useParticipation(chapter, 'prof')
  const [colonnePoints, setColonnePoints] = useState(false)
  const [reglagesPoints, setReglagesPoints] = useState(false)
  const prochaine: { diapo: DonneesDiapo; pas: number; texte: string } | null = d
    ? etat.pas < d.pas
      ? { diapo: d, pas: etat.pas + 1, texte: 'Prochain clic : étape suivante de cette diapo' }
      : diapos[etat.index + 1]
        ? { diapo: diapos[etat.index + 1], pas: 0, texte: `Diapo suivante (${etat.index + 2} / ${diapos.length})` }
        : null
    : null

  useEffect(() => {
    const t = window.setInterval(() => {
      setMaintenant(Date.now())
      const f = fenetreDiapos()
      setFenetreOuverte(!!f && !f.closed)
    }, 1000)
    return () => window.clearInterval(t)
  }, [])

  const rouvrir = () => {
    const url = location.pathname + '?' + new URLSearchParams({ ...Object.fromEntries(params), role: 'diapos' }).toString()
    const f = ouvrirFenetreDiapos(url)
    if (!f) signaler('Le navigateur a bloqué la fenêtre des diapos : autorise les fenêtres surgissantes de ce site, puis réessaie.')
    setFenetreOuverte(!!f)
  }

  const quitterVraiment = () => {
    if (document.fullscreenElement) void document.exitFullscreen?.().catch(() => undefined)
    matiere.terminer()
    const f = fenetreDiapos()
    if (f && !f.closed) f.close()
    navigate(`/${chapter.levelSlug}/${chapter.slug}#projeter`)
  }
  const quitter = () => {
    const p = matiere.proposition()
    setProposition(p)
    if (p || aDesAnnotations({ pages: ann.annotations.instantane(), blanches: etat.blanches, exercices: etat.exercices })) setDemandeQuitter(true)
    else quitterVraiment()
  }

  useClavier({
    suivant: () => !outils.ensemble && !demandeQuitter && !dialogueRec && avancer(),
    precedent: () => !outils.ensemble && !demandeQuitter && !dialogueRec && reculer(),
    pageSuivante: etat.blanc ? () => projection.allerPage(1) : undefined,
    pagePrecedente: etat.blanc ? () => projection.allerPage(-1) : undefined,
    debut: () => aller(0),
    fin: () => aller(diapos.length - 1),
    blanc: basculerBlanc,
    ensemble: () => setOutils((o) => ({ ...o, ensemble: !o.ensemble })),
    stylo: () => setOutils(basculerStylo),
    fluo: () => setOutils(basculerFluo),
    compas: () => setOutils(basculerCompas),
    equerre: () => magasin.equerre({ visible: !magasin.lire().equerre.visible }),
    calc: () => magasin.calc({ visible: !magasin.lire().calc.visible }),
    copier: () => {
      if (!outils.copier && etat.blanc) basculerBlanc()
      setOutils(basculerCopier)
    },
    pleinEcran: basculer,
    echap: () => {
      if (rec.phase === 'reglages') rec.fermerReglages()
      else if (reglagesPoints) setReglagesPoints(false)
      else if (etat.atelierPlein) basculerAtelierPlein(false)
      else if (outils.menuExport) setOutils((o) => ({ ...o, menuExport: false }))
      else if (!outils.ensemble && echapPalettes(outils)) setOutils((o) => echapPalettes(o) ?? o)
      else if (exo.page && !outils.ensemble && !outils.stylo) exo.actions.fermer()
      else setOutils((o) => (o.ensemble ? { ...o, ensemble: false } : o.stylo ? { ...o, stylo: false, palette: false, nuancier: false } : { ...o, ensemble: true }))
    },
  })

  return (
    <div className="projection projection--prof">
      <header className="prof-tete">
        <div className="prof-titre">
          <p className="prof-surtitre">Vue du professeur · deux écrans</p>
          <h1>{chapter.title}</h1>
        </div>
        <div className="prof-chiffres">
          <span title="Temps écoulé depuis le début">
            <small>Écoulé</small>
            {formatDuree((maintenant - depart) / 1000)}
          </span>
          <span>
            <small>Diapo</small>
            {etat.index + 1} / {diapos.length}
          </span>
        </div>
        <div className="prof-actions">
          {!fenetreOuverte && (
            <button type="button" className="projection-bouton-plein" onClick={rouvrir}>
              <Pictogramme nom="deux-ecrans" /> Ouvrir la fenêtre des diapos
            </button>
          )}
          <BoutonEnregistrer rec={rec} compacte />
          <BoutonPoints part={part} actif={colonnePoints} compacte onClick={() => (part.reglages ? setColonnePoints((c) => !c) : setReglagesPoints(true))} />
          <button type="button" className="projection-bouton" aria-pressed={etat.blanc} onClick={basculerBlanc} title="Écran blanc (B)">
            <Pictogramme nom="ecran-blanc" /> {etat.blanc ? 'Rallumer' : 'Écran blanc'}
            {pagesEcrites > 0 && (
              <span className="projection-outil-pastille" aria-label={`${pagesEcrites} page${pagesEcrites > 1 ? 's' : ''} blanche${pagesEcrites > 1 ? 's' : ''}`}>
                {pagesEcrites}
              </span>
            )}
          </button>
          <button type="button" className="projection-bouton" aria-pressed={outils.ensemble} onClick={() => setOutils((o) => ({ ...o, ensemble: !o.ensemble }))} title="Vue d'ensemble (G)">
            <Pictogramme nom="grille" /> Vue d'ensemble
          </button>
          <button
            type="button"
            className="projection-bouton"
            aria-expanded={outils.menuExport}
            title="Télécharger le PowerPoint ou le PDF annoté · Nouvelle séance"
            onClick={() => setOutils((o) => ({ ...o, menuExport: !o.menuExport }))}
          >
            <Pictogramme nom="telecharger" /> Télécharger
          </button>
          <button type="button" className="projection-bouton" onClick={basculer} title="Plein écran (F)">
            <Pictogramme nom={plein ? 'quitter-plein-ecran' : 'plein-ecran'} />
            <span className="sr-only">{plein ? 'Quitter le plein écran' : 'Plein écran'}</span>
          </button>
          <button type="button" className="projection-bouton" onClick={quitter}>
            <Pictogramme nom="fermer" /> Quitter
          </button>
        </div>
      </header>

      {outils.menuExport && (
        <div className="prof-export">
          <PaletteExport exp={ann.exp} resume={ann.resume} nouvelleSeance={ann.nouvelleSeance} compacte />
        </div>
      )}
      <div className="prof-corps">
        <section className="prof-courante" aria-label="Diapo projetée">
          <div className="prof-etiquette">
            <span>Au tableau</span>
            {d && d.pas > 0 && (
              <span className="prof-pas">
                étape {Math.min(etat.pas, d.pas)} / {d.pas}
              </span>
            )}
            {d?.type === 'atelier' && (
              <button
                type="button"
                className={`projection-bouton prof-atelier-plein${etat.atelierPlein ? ' actif' : ''}`}
                aria-pressed={etat.atelierPlein}
                title="L'atelier seul sur tout l'écran de la classe (Échap pour revenir)"
                onClick={() => basculerAtelierPlein()}
              >
                <Pictogramme nom={etat.atelierPlein ? 'quitter-plein-ecran' : 'plein-ecran'} /> {etat.atelierPlein ? 'Atelier : quitter le plein écran' : 'Atelier en plein écran'}
              </button>
            )}
            <span className="prof-stylo" role="toolbar" aria-label="Outils (écrivent aussi au tableau)">
              <button
                type="button"
                className={`projection-outil${outils.stylo && outils.outil !== 'compas' ? ' actif' : ''}`}
                aria-pressed={outils.stylo && outils.outil !== 'compas'}
                aria-label="Stylo d'annotation (écrit aussi au tableau)"
                title="Stylo (S ; surligneur : H) — écrit aussi au tableau"
                onClick={() => setOutils(basculerStylo)}
              >
                <Pictogramme nom="crayon" />
              </button>
              <BoutonsInstruments outils={outils} setOutils={setOutils} magasin={magasin} />
              <BoutonCopier projection={projection} outils={outils} setOutils={setOutils} />
            </span>
          </div>
          {/* Même principe qu'à l'écran de la classe : pastille + colonne à gauche, petite barre de l'écran blanc en haut à
              gauche, posées sur la diapo projetée (rien au-dessus ni en dessous : elle garde toute la place). */}
          <div className="prof-scene-zone">
            <ContexteExerciceTableau.Provider value={exo.contexte}>
            <Scene className="prof-scene">
              {(echelle) => (
                <>
                  {d && (d.type === 'atelier' ? <DiapoAtelierProf diapo={d} chapter={chapter} /> : <Diapo key={d.cle} diapo={d} chapter={chapter} pas={etat.pas} mode="direct" debut={etat.debut} />)}
                  <FondPage projection={projection} />
                  {exo.page && exo.exercice && <ScenePageExercice ex={exo.exercice} page={exo.page} />}
                  <Annotations projection={projection} magasin={magasin} annotations={ann.annotations} page={ann.page} blanche={ann.blanche} outils={outils} echelle={echelle} role="prof" surEcrire={surEcrire} setOutils={setOutils} />
                </>
              )}
            </Scene>
            </ContexteExerciceTableau.Provider>
            {etat.blanc && <OutilsBlanc projection={projection} annotations={ann.annotations} outils={outils} setOutils={setOutils} />}
            <OutilsExercice exo={exo} visible />
            <ChercherAffiche page={exo.page} onArreter={() => exo.actions.chercher(null)} />
            <OutilsDessin outils={outils} setOutils={setOutils} />
          </div>
          {exo.page ? (
            <div className="prof-navigation">
              <button type="button" className="projection-bouton prof-nav" onClick={reculer} disabled={exo.page.pas === 0}>
                <Pictogramme nom="precedent" /> Ligne précédente
              </button>
              <button type="button" className="projection-bouton-plein prof-nav" onClick={avancer} disabled={!exo.exercice || exo.page.pas >= exo.total}>
                {exo.page.pas >= exo.total ? 'Corrigé terminé' : `Ligne suivante (${exo.page.pas + 1} / ${exo.total})`} <Pictogramme nom="suivant" />
              </button>
            </div>
          ) : (
          <div className="prof-navigation">
            <button type="button" className="projection-bouton prof-nav" onClick={precedent} disabled={etat.index === 0 && etat.pas === 0}>
              <Pictogramme nom="precedent" /> Précédent
            </button>
            <button type="button" className="projection-bouton-plein prof-nav" onClick={suivant} disabled={etat.index === diapos.length - 1 && (!d || etat.pas >= d.pas)}>
              Suivant <Pictogramme nom="suivant" />
            </button>
          </div>
          )}
        </section>

        <aside className="prof-cote">
          {colonnePoints ? (
            <section className="prof-points" aria-label="Points de participation">
              <PanneauPoints part={part} prive onReglages={() => setReglagesPoints(true)} onFermer={() => setColonnePoints(false)} />
            </section>
          ) : exo.page ? (
            <PanneauExerciceProf exo={exo} />
          ) : (
          <>
          <section className="prof-suivante" aria-label="Suivante">
            <p className="prof-etiquette">{prochaine ? prochaine.texte : 'Fin de la projection'}</p>
            {prochaine && (
              <Scene className="prof-scene-mini">
                {() => <Diapo key={`${prochaine.diapo.cle}-${prochaine.pas}`} diapo={prochaine.diapo} chapter={chapter} pas={prochaine.pas} mode="vignette" />}
              </Scene>
            )}
          </section>
          <section className="prof-notes" aria-label="Notes">
            <p className="prof-etiquette">Notes{d?.type === 'exemple' ? ' · corrigé' : d?.type === 'teste' ? ' · réponse' : ''}</p>
            {d && d.notes.length > 0 ? (
              <ul>
                {d.notes.map((n, i) => (
                  <li key={i}>
                    <RichText text={n} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="prof-vide">Pas de note pour cette diapo.</p>
            )}
          </section>
          <section className="prof-minuteur" aria-label="Minuteur">
            <p className="prof-etiquette">Minuteur{reste !== null ? ` · ${reste === 0 ? 'temps écoulé' : formatDuree(reste)}` : ''}</p>
            <div className="prof-durees">
              {DUREES_MINUTEUR.map((m) => (
                <button key={m} type="button" className="projection-duree" onClick={() => lancerMinuteur(m * 60)}>
                  {m} min
                </button>
              ))}
              {etat.minuteur.fin !== null && (
                <button type="button" className="projection-duree projection-duree--stop" onClick={arreterMinuteur}>
                  Arrêter
                </button>
              )}
            </div>
          </section>
          </>
          )}
          {!projection.synchro && <p className="projection-avertissement">Ce navigateur ne synchronise pas deux fenêtres : pilote les diapos depuis la fenêtre projetée.</p>}
        </aside>
      </div>
      {outils.ensemble && <VueEnsemble chapter={chapter} diapos={diapos} projection={projection} fermer={() => setOutils((o) => ({ ...o, ensemble: false }))} />}
      {demandeQuitter &&
        (proposition ? (
          <DialogueFinProjection proposition={proposition} matiere={matiere} exp={ann.exp} resume={ann.resume} annotations={aDesAnnotations({ pages: ann.annotations.instantane(), blanches: etat.blanches, exercices: etat.exercices })} quitter={quitterVraiment} fermer={() => setDemandeQuitter(false)} />
        ) : (
          <DialogueQuitter exp={ann.exp} resume={ann.resume} quitter={quitterVraiment} fermer={() => setDemandeQuitter(false)} />
        ))}
      <DialogueEnregistrer rec={rec} chapter={chapter} />
      <DialogueVideoPrete rec={rec} chapter={chapter} />
      {reglagesPoints && (
        <ReglagesParticipationDialogue
          part={part}
          fermer={() => {
            setReglagesPoints(false)
            // Vue du professeur : après les réglages, la grille des élèves (à la place de Suivante / Notes).
            setColonnePoints(true)
          }}
        />
      )}
      {message && (
        <p className="projection-message" role="status">
          {message}
        </p>
      )}
    </div>
  )
}

/** Atelier sur l'écran du professeur : il se manipule sur l'écran projeté (un seul exemplaire monté). */
function DiapoAtelierProf({ diapo, chapter }: { diapo: DonneesDiapo; chapter: ChapterContent }) {
  return <Diapo diapo={diapo} chapter={chapter} pas={0} mode="vignette" />
}
