import { createContext, Fragment, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { ChapterContent } from '../../content/types'
import type { Diapo as DonneesDiapo } from '../../lib/projection/diapos'
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from '../../entrainement/export/genererFeuilleExercices'
import { decouperLigneCalcul, estLignePiege } from '../../entrainement/export/corrigeTableau'
import { estGenerateurMigre } from '../../lib/generatorLink'
import { chargerRegistre, decouperCorrige, exerciceEnCache, libelleType, nouvellePageExercice, pageDuPas, registreSiCharge, texteFragments, tirerCode, variantesProposees } from '../../lib/projection/exerciceTableau'
import type { ExerciceProjete, PageExercice } from '../../lib/projection/exerciceTableau'
import { insecablesFr, MathInline } from '../Math'
import { formatDuree, useResteMinuteur } from './BarreOutils'
import type { Projection } from './useProjection'
import './exercice-tableau.css'

/**
 * « Projeter un exercice » (P1, maquette validée du 28/11/2026). Un exercice du générateur de la diapo
 * « S'entraîner » s'ouvre PAR-DESSUS la diapo, comme une page blanche (pas de nouvelle diapo dans la liste) :
 * énoncé en très grand, puis corrigé « comme au tableau » révélé une ligne à la fois (→, Espace, clic), « Un autre
 * du même type » sur une page vierge, les traits du stylo gardés par page (`x:<id>`, `x:<id>:<k>`) et exportés
 * juste après la diapo. Commandes dans une petite barre en haut à gauche (même place et même style que celle de
 * l'écran blanc, masquée avec la barre du bas) ; rien n'est ajouté à la barre du bas.
 *
 * Seulement pour les générateurs de CE site qui ont un adaptateur papier (décision du professeur) : le bouton
 * n'apparaît pas pour un générateur resté chez plateforme-maths. La réponse n'est montrée au tableau qu'après
 * « Montrer la réponse » ; en deux écrans, la vue du professeur la voit dès le tirage (« Pour toi seul »).
 */

type Adaptateurs = NonNullable<ReturnType<typeof registreSiCharge>>

// ---------- contexte : bouton de la diapo « S'entraîner » ----------

interface ContexteProjeter {
  peut: (gen: string) => boolean
  projeter: (gen: string) => void
}

export const ContexteExerciceTableau = createContext<ContexteProjeter | null>(null)

/** Bouton « Projeter un exercice », à côté de « Ouvrir le générateur ↗ » (diapo « S'entraîner », mode direct). */
export function BoutonProjeterExercice({ generatorId }: { generatorId: string }) {
  const ctx = useContext(ContexteExerciceTableau)
  if (!ctx || !ctx.peut(generatorId)) return null
  return (
    <button
      type="button"
      className="diapo-entrainement-projeter projection-interactif"
      title="Tirer un exercice de ce générateur et le projeter en grand, par-dessus la diapo (Échap pour revenir)"
      onClick={(e) => {
        e.stopPropagation()
        ctx.projeter(generatorId)
      }}
    >
      <IconeExercice /> Projeter un exercice
    </button>
  )
}

function IconeExercice() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  )
}

// ---------- état : registre, exercice affiché, actions ----------

/** Pagination du corrigé mesurée dans cette fenêtre (même mesure partout : px logiques), par `gen|code`. */
const decoupages = new Map<string, number[]>()

/**
 * Exercices de la projection : charge le registre des adaptateurs À LA DEMANDE (diapo « S'entraîner » d'un
 * générateur de ce site affichée, ou page d'exercice à montrer), construit l'exercice affiché et fournit les
 * actions (ligne suivante / précédente, réponse, autre du même type, type, minuteur « Laisser chercher »).
 */
export function useExercicesProjection(chapter: ChapterContent, diapos: DonneesDiapo[], projection: Projection) {
  const { etat } = projection
  const d = diapos[etat.index]
  const page = projection.pageExercice()
  const [reg, setReg] = useState<Adaptateurs | null>(() => registreSiCharge())
  const [erreur, setErreur] = useState<string | null>(null)
  const besoin = !!page || (d?.type === 'entrainement' && estGenerateurMigre(chapter.levelSlug, d.generatorId))
  useEffect(() => {
    if (!besoin || reg) return
    let vivant = true
    chargerRegistre()
      .then((r) => vivant && setReg(r))
      .catch(() => vivant && setErreur('Les exercices n’ont pas pu être chargés. Vérifie la connexion, puis réessaie.'))
    return () => {
      vivant = false
    }
  }, [besoin, reg])

  const ex = useMemo<ExerciceProjete | Error | null>(() => {
    if (!page || !reg) return null
    try {
      return exerciceEnCache(reg, page.gen, page.code)
    } catch (e) {
      return e instanceof Error ? e : new Error(String(e))
    }
  }, [page, reg])
  const exercice = ex instanceof Error ? null : ex
  const total = exercice?.lignes.length ?? 0

  const peut = useCallback((gen: string) => !!reg?.[gen] && estGenerateurMigre(chapter.levelSlug, gen), [reg, chapter.levelSlug])
  const projeter = useCallback(
    (gen: string, varianteId?: string | null) => {
      if (!reg?.[gen]) return
      const n = projection.pagesExercice().length + 1
      projection.ouvrirExercice(nouvellePageExercice(gen, tirerCode(reg[gen], varianteId), n))
    },
    [reg, projection],
  )
  const decoupage = page ? (decoupages.get(`${page.gen}|${page.code}`) ?? [0]) : [0]
  const allerLigne = useCallback(
    (delta: number) =>
      projection.majExercice((p) => {
        const pas = Math.max(0, Math.min(total, p.pas + delta))
        if (pas === p.pas) return p
        return { ...p, pas, page: pageDuPas(decoupages.get(`${p.gen}|${p.code}`) ?? [0], pas) }
      }),
    [projection, total],
  )
  const actions = {
    suivante: () => allerLigne(1),
    precedente: () => allerLigne(-1),
    reponse: () => projection.majExercice((p) => ({ ...p, reponse: !p.reponse })),
    autre: () => page && projeter(page.gen, exercice?.variante?.id ?? null),
    type: (varianteId: string) => page && projeter(page.gen, varianteId),
    chercher: (minutes: number | null) => projection.majExercice((p) => ({ ...p, chercher: minutes === null ? null : Date.now() + minutes * 60000 })),
    fermer: () => projection.afficherExercice(null),
    aller: (delta: number) => {
      const liste = projection.pagesExercice()
      const i = liste.findIndex((p) => p.id === page?.id) + delta
      if (page && i >= 0 && i < liste.length) projection.afficherExercice(liste[i].id)
    },
  }
  return { page, liste: projection.pagesExercice(), exercice, erreur: ex instanceof Error ? ex.message : erreur, reg, total, decoupage, peut, projeter, actions, contexte: { peut, projeter: (gen: string) => projeter(gen) } }
}

export type ExercicesProjection = ReturnType<typeof useExercicesProjection>

// ---------- rendu des fragments ----------

function Fragments({ fragments }: { fragments: FragmentConsigne[] }) {
  return (
    <>
      {fragments.map((f, i) =>
        f.type === 'texte' ? (
          <Fragment key={i}>{insecablesFr(f.valeur)}</Fragment>
        ) : (
          <span key={i} className="exo-formule">
            <MathInline tex={f.valeur} />
          </span>
        ),
      )}
    </>
  )
}

function Calcul({ lignes }: { lignes: LigneCalcul[] }) {
  return (
    <div className="exo-calcul">
      {lignes.map((l, i) => {
        const { gauche, droite } = decouperLigneCalcul(l.latex)
        const j = l.justification === undefined ? null : typeof l.justification === 'string' ? [{ type: 'texte' as const, valeur: l.justification }] : l.justification
        return (
          <Fragment key={i}>
            {droite === null ? (
              <span className="exo-c-seule">
                <MathInline tex={gauche} />
              </span>
            ) : (
              <>
                <span className="exo-c-g">{gauche ? <MathInline tex={gauche} /> : null}</span>
                <span className="exo-c-d">
                  <MathInline tex={`{}${droite}`} />
                </span>
              </>
            )}
            <span className="exo-c-j">{j ? <Fragments fragments={j} /> : null}</span>
          </Fragment>
        )
      })}
    </div>
  )
}

function Ligne({ e, etat }: { e: EtapeCorrection; etat: 'passee' | 'courante' | 'future' | 'tout' }) {
  const piege = estLignePiege(e)
  return (
    <div className={`exo-ligne exo-ligne--${etat}${e.type === 'resultat' ? ' exo-ligne--resultat' : ''}${piege ? ' exo-ligne--piege' : ''}`}>
      <span className="exo-lbl">{piege ? 'Piège' : e.label}</span>
      <div className="exo-contenu">
        {e.fragments.length > 0 && (
          <div className="exo-texte">
            <Fragments fragments={e.fragments} />
          </div>
        )}
        {e.calcul && e.calcul.length > 0 && <Calcul lignes={e.calcul} />}
        {e.figureHtml && <div className="exo-figure-ligne" dangerouslySetInnerHTML={{ __html: e.figureHtml }} />}
      </div>
      {etat === 'future' && <span className="exo-a-venir" aria-hidden="true" />}
    </div>
  )
}

/** Énoncé « court » (un texte, une formule, un texte) : formule affichée seule, en très grand (maquette : 72 px). */
function enonceCourt(ex: ExerciceProjete): { avant: FragmentConsigne[]; formule: string; apres: FragmentConsigne[] } | null {
  const f = ex.enonce.enteteFragments ?? []
  if (ex.enonce.enteteHtml || ex.enonce.questions.length > 0) return null
  const formules = f.filter((x) => x.type === 'latex')
  if (formules.length !== 1) return null
  const texte = f.filter((x) => x.type === 'texte').map((x) => x.valeur).join('')
  if (texte.length > 170 || formules[0].valeur.length > 90) return null
  const i = f.indexOf(formules[0])
  return { avant: f.slice(0, i), formule: formules[0].valeur, apres: f.slice(i + 1) }
}

function EnonceComplet({ ex }: { ex: ExerciceProjete }) {
  const s = ex.enonce
  return (
    <>
      {s.enteteFragments && s.enteteFragments.length > 0 && (
        <p className="exo-enonce-texte">
          <Fragments fragments={s.enteteFragments} />
        </p>
      )}
      {s.enteteHtml && <div className="exo-figure" dangerouslySetInnerHTML={{ __html: s.enteteHtml }} />}
      {s.questions.length > 0 && (
        <ol className={`exo-questions${s.questions.length === 1 ? ' seule' : ''}`}>
          {s.questions.map((q, i) => (
            <li key={i}>
              <Fragments fragments={q.consigne} />
            </li>
          ))}
        </ol>
      )}
    </>
  )
}

/** Ajuste la taille du texte (`--k`, de 1 à `min`) pour que le contenu tienne dans sa boîte (hauteur fixe). */
function useAjuste(dependances: unknown[], min = 0.5) {
  const boite = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const el = boite.current
    if (!el) return
    let vivant = true
    const ajuster = () => {
      if (!vivant) return
      let k = 1
      el.style.setProperty('--k', '1')
      for (let essai = 0; essai < 14 && el.scrollHeight > el.clientHeight + 1 && k > min; essai++) {
        k = Math.max(min, k - 0.06)
        el.style.setProperty('--k', String(k))
      }
    }
    ajuster()
    void document.fonts?.ready.then(ajuster)
    return () => {
      vivant = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependances)
  return boite
}

function Surtitre({ ex, page, suite }: { ex: ExerciceProjete; page: PageExercice; suite?: boolean }) {
  return (
    <p className="exo-surtitre">
      Exercice au tableau · {ex.gen} · {ex.titre}
      {suite ? ` · exercice n° ${page.n} · corrigé (suite)` : ''}
    </p>
  )
}

/** Hauteurs disponibles pour les lignes du corrigé (px logiques) : sous l'énoncé rappelé (page 1), sous le surtitre ensuite. */
const BAS_LIGNES = 590
const HAUT_PREMIERE = 108
const HAUT_SUITE = 120
/** Écart entre le rappel de l'énoncé et les lignes, et entre deux lignes (même valeur que la feuille de style). */
const ECART_LIGNES = 12

/**
 * Page d'exercice DANS la scène (1 280 × 720 logiques, filmée par l'enregistrement, photographiée par l'export) :
 * énoncé (page 0) ou une page du corrigé. Les lignes à venir gardent leur place (traits gris) : la mise en page ne
 * bouge pas d'une ligne à l'autre, les annotations restent à leur place.
 */
export function ScenePageExercice({ ex, page, tout = false }: { ex: ExerciceProjete; page: PageExercice; tout?: boolean }) {
  const cle = `${page.gen}|${page.code}`
  const [debuts, setDebuts] = useState<number[] | null>(() => decoupages.get(cle) ?? null)
  const mesure = useRef<HTMLDivElement>(null)
  // Pagination du corrigé : mesurée une fois (hors écran, toutes les lignes, même largeur), polices chargées.
  useLayoutEffect(() => {
    const el = mesure.current
    if (!el) return
    let vivant = true
    const calculer = () => {
      if (!vivant) return
      const tete = el.querySelector<HTMLElement>('.exo-rappel')
      const lignes = Array.from(el.querySelectorAll<HTMLElement>('.exo-lignes > .exo-ligne'))
      const hauteurs = lignes.map((l) => l.offsetHeight + ECART_LIGNES)
      const hautPremiere = HAUT_PREMIERE + (tete?.offsetHeight ?? 0) + ECART_LIGNES
      const d = decouperCorrige(hauteurs, BAS_LIGNES - hautPremiere, BAS_LIGNES - HAUT_SUITE)
      decoupages.set(cle, d)
      setDebuts(d)
    }
    calculer()
    void document.fonts?.ready.then(calculer)
    return () => {
      vivant = false
    }
  }, [cle])
  const d = debuts ?? [0]
  const k = page.page > 0 ? Math.min(page.page, d.length) : 0
  const premiere = k > 0 ? d[k - 1] : 0
  const fin = k > 0 ? (d[k] ?? ex.lignes.length) : 0
  return (
    <div className="exo-page" data-page-exercice={page.id}>
      {k === 0 ? <PageEnonce ex={ex} page={page} /> : <PageCorrige ex={ex} page={page} k={k} premiere={premiere} fin={fin} tout={tout} />}
      {page.reponse && ex.reponse && (
        <div className="exo-reponse" role="status">
          <span className="exo-reponse-lbl">Réponse</span>
          <span className="exo-reponse-texte">
            <Fragments fragments={ex.reponse} />
          </span>
        </div>
      )}
      {/* Mesure de la pagination du corrigé (invisible, hors du flux). */}
      <div className="exo-mesure" ref={mesure} aria-hidden="true">
        <div className="exo-rappel">
          <RappelEnonce ex={ex} />
        </div>
        <div className="exo-lignes">
          {ex.lignes.map((e, i) => (
            <Ligne key={i} e={e} etat="tout" />
          ))}
        </div>
      </div>
    </div>
  )
}

function PageEnonce({ ex, page }: { ex: ExerciceProjete; page: PageExercice }) {
  const court = enonceCourt(ex)
  const boite = useAjuste([ex, court !== null], 0.55)
  return (
    <>
      <Surtitre ex={ex} page={page} />
      <div className={`exo-enonce${court ? ' exo-enonce--court' : ''}`} ref={boite}>
        {court ? (
          <>
            {court.avant.length > 0 && (
              <p className="exo-enonce-titre">
                <Fragments fragments={court.avant} />
              </p>
            )}
            <div className="exo-enonce-formule">
              <MathInline tex={court.formule} />
            </div>
            {court.apres.some((f) => f.valeur.trim()) && (
              <p className="exo-enonce-apres">
                <Fragments fragments={court.apres} />
              </p>
            )}
          </>
        ) : (
          <EnonceComplet ex={ex} />
        )}
      </div>
      <p className="exo-pied">
        Exercice {page.n} · {ex.variante ? `type ${libelleType(ex.variante)}` : 'tirage libre'}
      </p>
    </>
  )
}

function RappelEnonce({ ex }: { ex: ExerciceProjete }) {
  const s = ex.enonce
  return (
    <>
      {s.enteteFragments && s.enteteFragments.length > 0 && <Fragments fragments={s.enteteFragments} />}
      {s.questions.length > 0 && (
        <span className="exo-rappel-questions">
          {s.questions.map((q, i) => (
            <span key={i}>
              {s.questions.length > 1 ? `${String.fromCharCode(97 + i)}) ` : ' '}
              <Fragments fragments={q.consigne} />
            </span>
          ))}
        </span>
      )}
    </>
  )
}

function PageCorrige({ ex, page, k, premiere, fin, tout }: { ex: ExerciceProjete; page: PageExercice; k: number; premiere: number; fin: number; tout: boolean }) {
  return (
    <>
      <Surtitre ex={ex} page={page} suite={k > 1} />
      <div className="exo-corps" style={{ top: k === 1 ? HAUT_PREMIERE : HAUT_SUITE }}>
        {k === 1 && (
          <div className="exo-rappel">
            <RappelEnonce ex={ex} />
          </div>
        )}
        <div className="exo-lignes">
          {ex.lignes.slice(premiere, fin).map((e, j) => {
            const i = premiere + j
            const etat = tout ? 'tout' : i < page.pas - 1 ? 'passee' : i === page.pas - 1 ? 'courante' : 'future'
            return <Ligne key={i} e={e} etat={etat} />
          })}
        </div>
      </div>
    </>
  )
}

// ---------- petite barre (en haut à gauche) et minuteur « Laisser chercher » ----------

const DUREES_CHERCHER = [1, 2, 3, 5]

function Icone({ d, taille = 18 }: { d: ReactNode; taille?: number }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d}
    </svg>
  )
}
const I_RETOUR = <path d="M15 18l-6-6 6-6" />
const I_OEIL = (
  <>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </>
)
const I_LECTURE = <path d="M7 5l12 7-12 7z" />
const I_AUTRE = (
  <>
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <path d="M3 4v5h5" />
  </>
)
const I_MINUTEUR = (
  <>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2 2M9 2h6" />
  </>
)
const I_SUIV = <path d="M9 6l6 6-6 6" />

/**
 * Petite barre de l'exercice (en haut à gauche, même place et même style que celle de l'écran blanc ; masquée avec
 * la barre du bas) : Revenir à la diapo · Montrer la réponse · Corrigé ligne par ligne (« Corrigé 3 / 5 ») · Un autre
 * du même type · Type ▾ · Laisser chercher · ‹ n / N › (exercices de cette diapo).
 */
export function OutilsExercice({ exo, visible }: { exo: ExercicesProjection; visible: boolean }) {
  const { page, exercice, reg, total, actions } = exo
  const [menu, setMenu] = useState(false)
  const reste = useResteMinuteur(page?.chercher ?? null)
  if (!page) return null
  const adaptateur = reg?.[page.gen]
  const variantes = adaptateur ? variantesProposees(adaptateur) : []
  return (
    <div className={`projection-blanc-outils exo-outils${visible || menu ? '' : ' masquee'}`} onClick={(e) => e.stopPropagation()}>
      <div className="projection-blanc-barre projection-interactif exo-barre" role="toolbar" aria-label="Exercice au tableau">
        <button type="button" className="projection-outil exo-bouton" aria-label="Revenir à la diapo" title="Revenir à la diapo (Échap)" onClick={actions.fermer}>
          <Icone d={I_RETOUR} /> <span className="exo-libelle">Revenir à la diapo</span>
        </button>
        <button type="button" className={`projection-outil exo-bouton${page.reponse ? ' actif' : ''}`} aria-pressed={page.reponse} aria-label={page.reponse ? 'Cacher la réponse' : 'Montrer la réponse'} disabled={!exercice?.reponse} title={exercice?.reponse ? 'Montrer la réponse au tableau' : 'Pas de réponse brève pour cet exercice'} onClick={actions.reponse}>
          <Icone d={I_OEIL} /> <span className="exo-libelle">{page.reponse ? 'Cacher la réponse' : 'Montrer la réponse'}</span>
        </button>
        <button
          type="button"
          className={`projection-outil exo-bouton${page.pas > 0 ? ' actif' : ''}`}
          disabled={!exercice || page.pas >= total}
          aria-label={page.pas > 0 ? `Corrigé ${page.pas} sur ${total} : ligne suivante` : 'Corrigé ligne par ligne'}
          title="Montrer la ligne suivante du corrigé (→ ou Espace ; ← pour revenir)"
          onClick={actions.suivante}
        >
          <Icone d={I_LECTURE} /> <span className={page.pas > 0 ? undefined : 'exo-libelle'}>{page.pas > 0 ? `Corrigé ${page.pas} / ${total}` : 'Corrigé ligne par ligne'}</span>
        </button>
        <button type="button" className="projection-outil exo-bouton" disabled={!exercice} aria-label="Un autre du même type" title="Tirer un autre exercice du même type, sur une page vierge (celui-ci reste)" onClick={actions.autre}>
          <Icone d={I_AUTRE} /> <span className="exo-libelle">Un autre du même type</span>
        </button>
        {variantes.length > 1 && (
          <label className="exo-type">
            <span className="sr-only">Type d’exercice</span>
            <select
              value={exercice?.variante?.id ?? ''}
              onChange={(e) => e.target.value && actions.type(e.target.value)}
              title="Choisir le type d’exercice : un nouvel exercice de ce type est tiré"
            >
              {!exercice?.variante && <option value="">Tirage libre</option>}
              {variantes.map((v) => (
                <option key={v.id} value={v.id}>
                  {libelleType(v)}
                </option>
              ))}
            </select>
          </label>
        )}
        <button
          type="button"
          className={`projection-outil exo-bouton${menu || reste !== null ? ' actif' : ''}`}
          aria-expanded={menu}
          aria-label={reste !== null ? `Laisser chercher : ${formatDuree(reste)}` : 'Laisser chercher'}
          title="Laisser chercher : petit minuteur discret en haut à droite (il ne sonne pas)"
          onClick={() => setMenu((m) => !m)}
        >
          <Icone d={I_MINUTEUR} /> <span className={reste !== null ? undefined : 'exo-libelle'}>{reste !== null ? formatDuree(reste) : 'Laisser chercher'}</span>
        </button>
        <VoisinsListe exo={exo} />
      </div>
      {menu && (
        <div className="projection-palette exo-menu-chercher projection-interactif" role="group" aria-label="Laisser chercher">
          {DUREES_CHERCHER.map((m) => (
            <button
              key={m}
              type="button"
              className="projection-duree"
              onClick={() => {
                actions.chercher(m)
                setMenu(false)
              }}
            >
              {m} min
            </button>
          ))}
          {page.chercher !== null && (
            <button
              type="button"
              className="projection-duree projection-duree--stop"
              onClick={() => {
                actions.chercher(null)
                setMenu(false)
              }}
            >
              Arrêter
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function VoisinsListe({ exo }: { exo: ExercicesProjection }) {
  const { page, actions, liste } = exo
  if (!page || liste.length < 2) return null
  const rang = liste.findIndex((p) => p.id === page.id) + 1
  return (
    <>
      <span className="projection-separateur" aria-hidden="true" />
      <button type="button" className="projection-outil" aria-label="Exercice précédent de cette diapo" title="Exercice précédent (ses traits sont gardés)" disabled={rang <= 1} onClick={() => actions.aller(-1)}>
        <Icone d={I_RETOUR} />
      </button>
      <span className="pages-compteur" aria-live="polite">
        <span className="sr-only">Exercice </span>
        {rang} / {liste.length}
      </span>
      <button type="button" className="projection-outil" aria-label="Exercice suivant de cette diapo" title="Exercice suivant" disabled={rang >= liste.length} onClick={() => actions.aller(1)}>
        <Icone d={I_SUIV} />
      </button>
    </>
  )
}

/** Petit minuteur « Laisser chercher » (en haut à droite, fond à moitié transparent ; rouge clignotant à 0:00, sans son). */
export function ChercherAffiche({ page, onArreter }: { page: PageExercice | null; onArreter: () => void }) {
  const reste = useResteMinuteur(page?.chercher ?? null)
  if (!page || reste === null) return null
  return (
    <button
      type="button"
      className={`exo-chercher${reste === 0 ? ' fini' : ''}`}
      onClick={(e) => {
        e.stopPropagation()
        if (reste === 0) onArreter()
      }}
      aria-label={reste === 0 ? 'Temps de recherche écoulé : fermer le minuteur' : `Laisser chercher : ${formatDuree(reste)}`}
    >
      <Icone d={I_MINUTEUR} taille={16} />
      {formatDuree(reste)}
    </button>
  )
}

/** Message d'erreur (exercice impossible à tirer, registre non chargé). */
export function ErreurExercice({ exo }: { exo: ExercicesProjection }) {
  if (!exo.page || !exo.erreur) return null
  return (
    <p className="projection-message" role="status">
      {exo.erreur}
    </p>
  )
}

// ---------- vue du professeur : « Pour toi seul » ----------

/**
 * Vue du professeur (deux écrans) : la réponse et tout le corrigé dès le tirage, POUR LUI SEUL (cadre mauve) — la
 * fenêtre des diapos ne l'affiche jamais. Ligne au tableau marquée, lignes déjà montrées cochées ; « Laisser
 * chercher » 1, 2, 3, 5 min.
 */
export function PanneauExerciceProf({ exo }: { exo: ExercicesProjection }) {
  const { page, exercice, actions } = exo
  const reste = useResteMinuteur(page?.chercher ?? null)
  if (!page) return null
  return (
    <>
      <section className="prof-exo-seul" aria-label="Pour toi seul : réponse et corrigé">
        <p className="prof-exo-tete">
          <span>Pour toi seul</span> <span className="prof-exo-badge">pas au tableau</span>
        </p>
        {!exercice ? (
          <p className="prof-vide">{exo.erreur ?? 'Chargement de l’exercice…'}</p>
        ) : (
          <>
            <p className="prof-exo-lbl">Réponse</p>
            <div className="prof-exo-reponse">{exercice.reponse ? <Fragments fragments={exercice.reponse} /> : <span className="prof-vide">Voir la dernière ligne du corrigé.</span>}</div>
            <p className="prof-exo-lbl">Corrigé complet</p>
            <ol className="prof-exo-lignes">
              {exercice.lignes.map((e, i) => (
                <li key={i} className={i < page.pas - 1 ? 'vue' : i === page.pas - 1 ? 'courante' : ''}>
                  <span className="prof-exo-l">{estLignePiege(e) ? 'Piège' : e.label}</span>{' '}
                  {e.fragments.length > 0 ? <Fragments fragments={e.fragments} /> : null}
                  {e.calcul?.map((c, j) => (
                    <span key={j} className="prof-exo-calc">
                      <MathInline tex={c.latex} />
                    </span>
                  ))}
                  {i < page.pas - 1 && <span className="prof-exo-etat"> ✓</span>}
                  {i === page.pas - 1 && <span className="prof-exo-etat courant"> ● au tableau</span>}
                </li>
              ))}
            </ol>
          </>
        )}
      </section>
      <section className="prof-minuteur" aria-label="Laisser chercher">
        <p className="prof-etiquette">Laisser chercher{reste !== null ? ` · ${reste === 0 ? 'temps écoulé' : formatDuree(reste)}` : ''}</p>
        <div className="prof-durees">
          {DUREES_CHERCHER.map((m) => (
            <button key={m} type="button" className="projection-duree" aria-pressed={page.chercher !== null && reste !== null && Math.round((page.chercher - Date.now()) / 60000) === m ? true : undefined} onClick={() => actions.chercher(m)}>
              {m} min
            </button>
          ))}
          {page.chercher !== null && (
            <button type="button" className="projection-duree projection-duree--stop" onClick={() => actions.chercher(null)}>
              Arrêter
            </button>
          )}
        </div>
      </section>
    </>
  )
}

/** Libellé de l'exercice pour les notes et l'export (« Exercice 6gen9 n° 1 »). */
export function libelleExercice(page: PageExercice): string {
  return `Exercice ${page.gen} n° ${page.n}`
}

export { texteFragments }
