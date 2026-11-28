import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { ChapterContent } from '../../content/types'
import type { Diapo as DonneesDiapo } from '../../lib/projection/diapos'
import { MathInline } from '../Math'
import { normaliserSigneMoins } from '../../lib/normaliserSaisie'
import { clePageBlanche } from '../../lib/projection/annotations'
import type { ElementAnnotation, PageBlanche } from '../../lib/projection/annotations'
import {
  ajouterColonne,
  ajouterLigne,
  disposer,
  lireBorne,
  lireIntervalles,
  lireReglages,
  NOMS_GABARITS,
  NOMS_LIGNES_STAT,
  LIGNES_STAT,
  nouveauGabarit,
  peutAjouterColonne,
  peutAjouterLigne,
  reglagesComplets,
  retenirReglages,
  saisieVersLatex,
  texteCase,
  texteNombre,
  TYPES_GABARITS,
} from '../../lib/projection/gabarits'
import type { CaseGabarit, Disposition, Forme, Gabarit, IntervalleDroite, ReglagesGabarit, TypeGabarit } from '../../lib/projection/gabarits'
import type { Morceau } from '../../lib/projection/morceaux'
import { abonnerCopie, lireCopie, placerMorceau } from '../../lib/projection/morceaux'
import { transfoPage, versEcran, versPage } from '../../lib/projection/vue'
import type { Transfo } from '../../lib/projection/vue'
import { Diapo } from './Diapo'
import type { OutilsLocaux } from './BarreOutils'
import type { MagasinAnnotations } from './magasinAnnotations'
import { Pictogramme } from './Pictogrammes'
import { PictoBlanc } from './PictosEcranBlanc'
import type { Projection } from './useProjection'
import './ecran-blanc.css'

/**
 * Objets POSÉS sur une page blanche (planches P2 et P4 du 28/11/2026) : gabarits (tableau de signes, de variations,
 * arbre, Venn, droite graduée, tableau statistique, tableau de valeurs) et morceaux de diapo collés. Chacun est un
 * élément d'annotation de la page (données, jamais une image) : place, échelle, contenu des cases.
 * - Toucher un objet le sélectionne : cadre pointillé bleu, quatre poignées (agrandir, proportions gardées), petite
 *   barre au-dessus (Déplacer, + colonne, + ligne, retirer) ; le glisser le déplace ; toucher ailleurs le désélectionne.
 * - Toucher une case d'un gabarit = la remplir au petit clavier (ou au clavier de l'ordinateur) ; rendu KaTeX au fil de
 *   la frappe ; saisie jamais refusée ni effacée. Le stylo écrit par-dessus (canvas au-dessus de ce calque).
 * - La sélection et le clavier sont LOCAUX à la fenêtre ; le contenu est partagé (deux écrans), annulable, exporté.
 */

type SetOutils = (f: (o: OutilsLocaux) => OutilsLocaux) => void
type P = [number, number]

const nouvelId = (id: string) => `${id}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
const borne = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
const zoomDe = (t: Transfo) => Math.sqrt(t.zx * t.zy)
const estObjet = (e: ElementAnnotation): e is Gabarit | Morceau => e.genre === 'gabarit' || e.genre === 'morceau'

/** Demande de sélection d'un objet qui vient d'être posé (menu Gabarit, Coller) : écoutée par le calque de la page. */
export function selectionnerObjet(id: string) {
  window.setTimeout(() => window.dispatchEvent(new CustomEvent('projection:selectionner', { detail: id })), 0)
}

/** Suivi d'un glisser au pointeur (fenêtre entière) ; le clic qui suit le relâchement n'est pas « diapo suivante ». */
export function suivrePointeur(e: React.PointerEvent, bouger: (ev: PointerEvent) => void, fin: (ev: PointerEvent) => void) {
  const pid = e.pointerId
  const surBouger = (ev: PointerEvent) => {
    if (ev.pointerId !== pid) return
    ev.preventDefault()
    bouger(ev)
  }
  const surFin = (ev: PointerEvent) => {
    if (ev.pointerId !== pid) return
    window.removeEventListener('pointermove', surBouger)
    window.removeEventListener('pointerup', surFin)
    window.removeEventListener('pointercancel', surFin)
    fin(ev)
    const avaler = (c: MouseEvent) => c.stopPropagation()
    window.addEventListener('click', avaler, { capture: true, once: true })
    window.setTimeout(() => window.removeEventListener('click', avaler, true), 0)
  }
  window.addEventListener('pointermove', surBouger, { passive: false })
  window.addEventListener('pointerup', surFin)
  window.addEventListener('pointercancel', surFin)
}

// ---------- dessin d'un gabarit (écran et export) ----------

function DessinForme({ f }: { f: Forme }) {
  switch (f.f) {
    case 'ligne':
      return <line x1={f.x1} y1={f.y1} x2={f.x2} y2={f.y2} stroke={f.couleur ?? '#33434f'} strokeWidth={f.ep ?? 2} strokeDasharray={f.pointille ? '6 5' : undefined} strokeLinecap="square" />
    case 'rect':
      return <rect x={f.x} y={f.y} width={f.w} height={f.h} rx={f.rx} fill={f.fond ?? 'none'} fillOpacity={f.opacite} stroke={f.bord ?? 'none'} strokeWidth={f.ep} />
    case 'cercle':
      return <circle cx={f.cx} cy={f.cy} r={f.r} fill={f.fond ?? 'none'} stroke={f.bord} strokeWidth={f.ep ?? 2} />
    case 'chemin':
      return <path d={f.d} fill={f.fond ?? 'none'} stroke={f.bord ?? 'none'} strokeWidth={f.ep} strokeLinejoin="miter" />
    case 'texte':
      return (
        <text x={f.x} y={f.y} fontSize={f.taille} fill={f.couleur ?? '#33434f'} fontWeight={f.gras ? 700 : 400} textAnchor={f.ancre ?? 'start'} className={f.police === 'mono' ? 'gabarit-mono' : f.police === 'sans' ? 'gabarit-sans' : 'gabarit-serif'}>
          {f.t}
        </text>
      )
  }
}

/** Gabarit dessiné à l'échelle 1 (traits en SVG, cases en KaTeX). `exporter` : sans hachures ni case active. */
export function DessinGabarit({ g, d, active, exporter = false }: { g: Gabarit; d: Disposition; active?: string | null; exporter?: boolean }) {
  return (
    <div className={`gabarit gabarit--${g.type}`} style={{ width: d.w, height: d.h }} data-export={exporter ? '' : undefined}>
      <svg width={d.w} height={d.h} viewBox={`0 0 ${d.w} ${d.h}`} className="gabarit-svg" aria-hidden="true">
        {d.formes.map((f, i) => (
          <DessinForme key={i} f={f} />
        ))}
      </svg>
      {d.cases.map((c) => {
        const texte = texteCase(g, c)
        const latex = saisieVersLatex(texte)
        const vide = !latex
        const classes = ['gabarit-case', vide ? 'vide' : '', !exporter && vide && c.hachuree ? 'hachuree' : '', vide && c.pointillee ? 'pointillee' : '', !vide && c.fond ? 'fond' : '', !exporter && active === c.id ? 'active' : ''].filter(Boolean).join(' ')
        return (
          <div key={c.id} className={classes} data-case={c.id} style={{ left: c.x, top: c.y, width: c.w, height: c.h, fontSize: c.taille ?? 30, color: c.couleur }} title={exporter ? undefined : c.nom}>
            {latex && <MathInline tex={latex} />}
          </div>
        )
      })}
    </div>
  )
}

/** Morceau de diapo redessiné depuis sa diapo d'origine (net à tout agrandissement), découpé au cadre ou au lasso. */
export function DessinMorceau({ m, diapos, chapter }: { m: Morceau; diapos: DonneesDiapo[]; chapter: ChapterContent }) {
  const d = diapos.find((x) => x.cle === m.source)
  const { x, y, w, h } = m.cadre
  const clip = m.lasso && m.lasso.length > 2 ? `polygon(${m.lasso.map(([a, b]) => `${a}px ${b}px`).join(', ')})` : undefined
  return (
    <div className="morceau" style={{ width: w, height: h, clipPath: clip }}>
      {d ? (
        <div className="morceau-diapo" style={{ left: -x, top: -y }}>
          <Diapo diapo={d} chapter={chapter} pas={m.pas} mode="vignette" />
        </div>
      ) : (
        <p className="morceau-absent">Morceau d’une diapo absente de cette projection</p>
      )}
    </div>
  )
}

/** Objets d'une page blanche pour l'export (fond de la page : sous le surligneur et le stylo). */
export function ObjetsExport({ elements, page, diapos, chapter }: { elements: ElementAnnotation[]; page: PageBlanche; diapos: DonneesDiapo[]; chapter: ChapterContent }) {
  const t = transfoPage(page)
  const z = zoomDe(t)
  return (
    <>
      {elements.filter(estObjet).map((o) => {
        const [sx, sy] = versEcran(t, [o.x, o.y])
        const kz = o.k * z
        if (o.genre === 'gabarit') {
          const g = { ...o, r: reglagesComplets(o.r) }
          const d = disposer(g)
          return (
            <div key={o.id} className="objet-pose" style={{ left: sx, top: sy, width: d.w * kz, height: d.h * kz }}>
              <div className="objet-contenu" style={{ width: d.w, height: d.h, transform: `scale(${kz})` }}>
                <DessinGabarit g={g} d={d} exporter />
              </div>
            </div>
          )
        }
        return (
          <div key={o.id} className="objet-pose" style={{ left: sx, top: sy, width: o.cadre.w * kz, height: o.cadre.h * kz }}>
            <div className="objet-contenu" style={{ width: o.cadre.w, height: o.cadre.h, transform: `scale(${kz})` }}>
              <DessinMorceau m={o} diapos={diapos} chapter={chapter} />
            </div>
          </div>
        )
      })}
    </>
  )
}

export const aDesObjets = (elements: ElementAnnotation[]) => elements.some(estObjet)

// ---------- calque interactif de la page blanche ----------

const TOUCHES: { t: string; latex?: string; action?: 'insere' | 'remplace' | 'efface' | 'precedente' | 'suivante' | 'ok'; signe?: boolean; large?: boolean; nom: string }[] = [
  { t: '7', nom: '7' },
  { t: '8', nom: '8' },
  { t: '9', nom: '9' },
  { t: 'x', latex: 'x', nom: 'x' },
  { t: '/', latex: '\\tfrac{a}{b}', nom: 'fraction' },
  { t: '⌫', action: 'efface', nom: 'effacer le caractère' },
  { t: '4', nom: '4' },
  { t: '5', nom: '5' },
  { t: '6', nom: '6' },
  { t: ',', nom: 'virgule' },
  { t: '−', nom: 'moins' },
  { t: '+', nom: 'plus' },
  { t: '1', nom: '1' },
  { t: '2', nom: '2' },
  { t: '3', nom: '3' },
  { t: '0', nom: '0' },
  { t: '+∞', latex: '+\\infty', action: 'remplace', nom: 'plus l’infini' },
  { t: '−∞', latex: '-\\infty', action: 'remplace', nom: 'moins l’infini' },
  { t: '+', latex: '+', action: 'remplace', signe: true, nom: 'signe plus' },
  { t: '−', latex: '-', action: 'remplace', signe: true, nom: 'signe moins' },
  { t: '0', latex: '0', action: 'remplace', signe: true, nom: 'zéro' },
  { t: '‖', latex: '\\|', action: 'remplace', signe: true, nom: 'double barre (valeur interdite)' },
  { t: '↗', latex: '\\nearrow', action: 'remplace', signe: true, nom: 'croissante' },
  { t: '↘', latex: '\\searrow', action: 'remplace', signe: true, nom: 'décroissante' },
  { t: '← case', action: 'precedente', large: true, nom: 'case précédente' },
  { t: 'case →', action: 'suivante', large: true, nom: 'case suivante' },
  { t: 'OK ⏎', action: 'ok', large: true, nom: 'valider' },
]

/** Petit clavier d'une case : aperçu (champ libre jamais bloqué, seul `normaliserSigneMoins`), touches, case suivante. */
function ClavierCase({
  c,
  valeur,
  saisir,
  aller,
  fermer,
  focus,
  cible,
  pos,
}: {
  c: CaseGabarit
  valeur: string
  saisir: (t: string) => void
  aller: (delta: number) => void
  fermer: () => void
  focus: boolean
  cible: number
  pos: P
}) {
  const champ = useRef<HTMLInputElement>(null)
  const idChamp = useId()
  useEffect(() => {
    if (focus && document.hasFocus()) champ.current?.focus({ preventScroll: true })
  }, [focus, c.id])
  const caret = (n: number) =>
    window.requestAnimationFrame(() => {
      const el = champ.current
      if (el && document.activeElement === el) el.setSelectionRange(n, n)
    })
  const appui = (k: (typeof TOUCHES)[number]) => {
    const el = champ.current
    const a = el && document.activeElement === el ? (el.selectionStart ?? valeur.length) : valeur.length
    const b = el && document.activeElement === el ? (el.selectionEnd ?? valeur.length) : valeur.length
    switch (k.action) {
      case 'remplace':
        saisir(k.t)
        caret(k.t.length)
        return
      case 'efface': {
        if (a !== b) {
          saisir(valeur.slice(0, a) + valeur.slice(b))
          caret(a)
        } else if (a > 0) {
          saisir(valeur.slice(0, a - 1) + valeur.slice(a))
          caret(a - 1)
        }
        return
      }
      case 'precedente':
        return aller(-1)
      case 'suivante':
        return aller(1)
      case 'ok':
        return fermer()
      default: {
        const t = k.t === '−' ? '-' : k.t
        saisir(valeur.slice(0, a) + t + valeur.slice(b))
        caret(a + t.length)
      }
    }
  }
  return (
    <div
      className="gabarit-clavier projection-interactif"
      data-objet=""
      role="group"
      aria-label={`Petit clavier : ${c.nom}`}
      style={{ left: pos[0], top: pos[1], ['--cible' as string]: `${cible}px` }}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="clavier-apercu">
        <label className="sr-only" htmlFor={idChamp}>
          {c.nom}
        </label>
        <input
          ref={champ}
          id={idChamp}
          className="clavier-champ"
          type="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          value={valeur}
          onChange={(e) => saisir(normaliserSigneMoins(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              fermer()
            } else if (e.key === 'Escape') {
              e.preventDefault()
              e.stopPropagation()
              fermer()
            } else if (e.key === 'Tab') {
              e.preventDefault()
              aller(e.shiftKey ? -1 : 1)
            }
          }}
        />
        <span className="clavier-case" aria-hidden="true">
          {c.nom}
        </span>
      </div>
      <div className="clavier-touches">
        {TOUCHES.map((k, i) => (
          <button
            key={i}
            type="button"
            className={`clavier-touche${k.signe ? ' signe' : ''}${k.large ? ' large' : ''}${k.action === 'ok' ? ' ok' : ''}`}
            aria-label={k.nom}
            title={k.nom}
            // Garder le focus (et le curseur) dans le champ : la touche n'est qu'un raccourci de frappe.
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => appui(k)}
          >
            {k.latex ? <MathInline tex={k.latex} /> : k.t}
          </button>
        ))}
      </div>
    </div>
  )
}

/** Éditeur de la droite graduée (sous le gabarit sélectionné) : intervalles, crochets, réunion / intersection, bornes. */
function EditeurDroite({ g, modifier, pos, cible }: { g: Gabarit; modifier: (g: Gabarit) => void; pos: P; cible: number }) {
  const intervalles = g.intervalles ?? []
  const { erreur } = lireIntervalles(intervalles)
  const [graduation, setGraduation] = useState(false)
  const [textes, setTextes] = useState({ de: texteNombre(g.r.de), a: texteNombre(g.r.a), pas: texteNombre(g.r.pas) })
  const [erreurGrad, setErreurGrad] = useState<string | null>(null)
  const maj = (i: number, p: Partial<IntervalleDroite>) => modifier({ ...g, intervalles: intervalles.map((x, j) => (j === i ? { ...x, ...p } : x)) })
  const appliquerGraduation = (t = textes) => {
    const de = lireBorne(t.de)
    const a = lireBorne(t.a)
    const pas = lireBorne(t.pas)
    if (de === null || a === null || pas === null || !Number.isFinite(de) || !Number.isFinite(a) || !Number.isFinite(pas)) return setErreurGrad('Écris trois nombres.')
    if (a <= de) return setErreurGrad('« à » doit être plus grand que « de ».')
    if (pas <= 0) return setErreurGrad('Le pas doit être positif.')
    if ((a - de) / pas > 40) return setErreurGrad('Au plus 40 graduations : prends un pas plus grand.')
    setErreurGrad(null)
    const r = reglagesComplets({ ...g.r, de, a, pas })
    modifier({ ...g, r })
    const actuels = lireReglages()
    retenirReglages(actuels.type, { ...actuels.r, de, a, pas })
  }
  const champ = (valeur: string, changer: (v: string) => void, nom: string, valider?: () => void) => (
    <input
      type="text"
      className="droite-champ"
      aria-label={nom}
      autoComplete="off"
      spellCheck={false}
      value={valeur}
      onChange={(e) => changer(normaliserSigneMoins(e.target.value))}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          valider?.()
        }
      }}
      onBlur={valider}
    />
  )
  return (
    <div
      className="droite-editeur projection-interactif"
      data-objet=""
      role="group"
      aria-label="Intervalles de la droite graduée"
      style={{ left: pos[0], top: pos[1], ['--cible' as string]: `${cible}px` }}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="droite-rangee">
        <span className="droite-titre">Intervalle{intervalles.length > 1 ? 's' : ''}</span>
        {intervalles.map((it, i) => {
          const gInf = lireBorne(it.g) === -Infinity
          const dInf = lireBorne(it.d) === Infinity
          return (
            <span key={i} className="droite-intervalle">
              {i > 0 && <span className="droite-operateur">{g.combinaison === 'intersection' ? '∩' : '∪'}</span>}
              <button
                type="button"
                className="droite-crochet"
                disabled={gInf}
                aria-label={it.gOuvert || gInf ? 'Borne de gauche exclue : toucher pour la comprendre' : 'Borne de gauche comprise : toucher pour l’exclure'}
                title={it.gOuvert || gInf ? 'Exclue (crochet tourné vers l’extérieur)' : 'Comprise (crochet tourné vers l’intérieur)'}
                onClick={() => maj(i, { gOuvert: !it.gOuvert })}
              >
                {it.gOuvert || gInf ? ']' : '['}
              </button>
              {champ(it.g, (v) => maj(i, { g: v }), `Borne de gauche de l’intervalle ${i + 1}`)}
              <span className="droite-pv">;</span>
              {champ(it.d, (v) => maj(i, { d: v }), `Borne de droite de l’intervalle ${i + 1}`)}
              <button
                type="button"
                className="droite-crochet"
                disabled={dInf}
                aria-label={it.dOuvert || dInf ? 'Borne de droite exclue : toucher pour la comprendre' : 'Borne de droite comprise : toucher pour l’exclure'}
                title={it.dOuvert || dInf ? 'Exclue (crochet tourné vers l’extérieur)' : 'Comprise (crochet tourné vers l’intérieur)'}
                onClick={() => maj(i, { dOuvert: !it.dOuvert })}
              >
                {it.dOuvert || dInf ? '[' : ']'}
              </button>
              {intervalles.length > 1 && (
                <button type="button" className="droite-bouton droite-retirer" aria-label={`Retirer l’intervalle ${i + 1}`} title="Retirer cet intervalle" onClick={() => modifier({ ...g, intervalles: intervalles.filter((_, j) => j !== i) })}>
                  <Pictogramme nom="fermer" taille={16} />
                </button>
              )}
            </span>
          )
        })}
      </div>
      <div className="droite-rangee">
        {intervalles.length < 3 && (
          <button type="button" className="droite-bouton" onClick={() => modifier({ ...g, intervalles: [...intervalles, { g: '4', d: '+∞', gOuvert: false, dOuvert: true }] })}>
            + intervalle
          </button>
        )}
        {intervalles.length > 1 && (
          <span className="droite-choix" role="group" aria-label="Combiner les intervalles">
            {(
              [
                ['reunion', 'Réunion ∪'],
                ['intersection', 'Intersection ∩'],
              ] as const
            ).map(([v, l]) => (
              <button key={v} type="button" className="droite-bouton" aria-pressed={(g.combinaison ?? 'reunion') === v} onClick={() => modifier({ ...g, combinaison: v })}>
                {l}
              </button>
            ))}
          </span>
        )}
        <button type="button" className="droite-bouton" aria-expanded={graduation} onClick={() => setGraduation((x) => !x)}>
          de {texteNombre(g.r.de)} à {texteNombre(g.r.a)}, pas {texteNombre(g.r.pas)}
        </button>
      </div>
      {graduation && (
        <div className="droite-rangee">
          <span className="droite-titre">de</span>
          {champ(textes.de, (v) => setTextes((t) => ({ ...t, de: v })), 'Première graduation', () => appliquerGraduation())}
          <span className="droite-titre">à</span>
          {champ(textes.a, (v) => setTextes((t) => ({ ...t, a: v })), 'Dernière graduation', () => appliquerGraduation())}
          <span className="droite-titre">pas</span>
          {champ(textes.pas, (v) => setTextes((t) => ({ ...t, pas: v })), 'Pas des graduations', () => appliquerGraduation())}
        </div>
      )}
      {(erreur || erreurGrad) && (
        <p className="droite-erreur" role="alert">
          {erreur ?? erreurGrad}
        </p>
      )}
    </div>
  )
}

/**
 * Calque des objets posés sur la page blanche affichée (gabarits, morceaux collés), SOUS les courbes, le surligneur et
 * le stylo (on écrit par-dessus) : le canvas du stylo, quand un outil est pris, reçoit les appuis à sa place.
 */
export function CalqueObjets({
  projection,
  annotations,
  page,
  blanche,
  outils,
  echelle,
  versDiapo,
}: {
  projection: Projection
  annotations: MagasinAnnotations
  page: string
  blanche: PageBlanche
  outils: OutilsLocaux
  echelle: number
  versDiapo: (cx: number, cy: number) => P
}) {
  const elements = annotations.pages.get(page) ?? []
  const objets = elements.filter(estObjet)
  const [sel, setSel] = useState<string | null>(null)
  const [caseActive, setCaseActive] = useState<string | null>(null)
  const [focusClavier, setFocusClavier] = useState(true)
  const t = transfoPage(blanche)
  const z = zoomDe(t)
  const cible = Math.max(44, echelle > 0 ? 44 / echelle : 44)
  const pageRef = useRef(page)
  pageRef.current = page
  // État avant les modifications en cours de l'objet sélectionné (« Annuler » le remettra).
  const avant = useRef<ElementAnnotation | null>(null)
  const lire = useCallback((id: string | null) => (id ? (annotations.liste(pageRef.current).find((e) => e.id === id) ?? null) : null), [annotations])

  /** Les modifications en cours deviennent une étape d'annulation (une seule pour une saisie, un glisser…). */
  const engager = useCallback(() => {
    const a = avant.current
    if (!a) return
    const maintenant = lire(a.id)
    if (maintenant && JSON.stringify(maintenant) !== JSON.stringify(a)) annotations.noterModif(pageRef.current, a)
    avant.current = maintenant ? (JSON.parse(JSON.stringify(maintenant)) as ElementAnnotation) : null
  }, [annotations, lire])

  const choisir = useCallback(
    (id: string | null) => {
      engager()
      setSel(id)
      setCaseActive(null)
      const el = lire(id)
      avant.current = el ? (JSON.parse(JSON.stringify(el)) as ElementAnnotation) : null
    },
    [engager, lire],
  )

  // Objet tout juste posé (menu Gabarit, Coller) : sélectionné.
  useEffect(() => {
    const f = (e: Event) => choisir((e as CustomEvent<string>).detail)
    window.addEventListener('projection:selectionner', f)
    return () => window.removeEventListener('projection:selectionner', f)
  }, [choisir])
  // Changement de page, stylo pris : plus rien de sélectionné.
  useEffect(() => () => engager(), [page, engager])
  useEffect(() => {
    setSel(null)
    setCaseActive(null)
    avant.current = null
  }, [page])
  useEffect(() => {
    if (outils.stylo && sel) choisir(null)
  }, [outils.stylo, sel, choisir])
  // Toucher ailleurs : désélectionne (il redevient un simple tableau).
  useEffect(() => {
    if (!sel) return
    const ailleurs = (e: PointerEvent) => {
      const cible = e.target as Element | null
      if (cible?.closest?.('[data-objet], .projection-barre, .projection-blanc-outils')) return
      choisir(null)
    }
    window.addEventListener('pointerdown', ailleurs, true)
    return () => window.removeEventListener('pointerdown', ailleurs, true)
  }, [sel, choisir])
  // Objet retiré (annuler, autre fenêtre) : la sélection tombe.
  const choisi = objets.find((o) => o.id === sel) ?? null
  useEffect(() => {
    if (sel && !choisi) {
      setSel(null)
      setCaseActive(null)
      avant.current = null
    }
  }, [sel, choisi])
  // Échap : ferme le clavier, puis désélectionne (avant les raccourcis de la projection).
  useEffect(() => {
    if (!sel) return
    const f = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      e.preventDefault()
      if (caseActive) {
        engager()
        setCaseActive(null)
      } else choisir(null)
    }
    window.addEventListener('keydown', f, true)
    return () => window.removeEventListener('keydown', f, true)
  }, [sel, caseActive, engager, choisir])

  const modifier = (el: Gabarit | Morceau) => annotations.remplacer(pageRef.current, el)

  const surObjet = (e: React.PointerEvent, o: Gabarit | Morceau, sx: number, sy: number) => {
    if (outils.stylo || (e.pointerType === 'mouse' && e.button !== 0)) return
    e.stopPropagation()
    e.preventDefault()
    const idCase = (e.target as Element).closest?.('[data-case]')?.getAttribute('data-case') ?? null
    if (sel !== o.id) choisir(o.id)
    else engager()
    const depart = versDiapo(e.clientX, e.clientY)
    let bouge = false
    suivrePointeur(
      e,
      (ev) => {
        const p = versDiapo(ev.clientX, ev.clientY)
        if (!bouge && Math.hypot(p[0] - depart[0], p[1] - depart[1]) * Math.max(echelle, 0.01) < 5) return
        if (!bouge) setCaseActive(null)
        bouge = true
        const [x, y] = versPage(t, [Math.round(sx + p[0] - depart[0]), Math.round(sy + p[1] - depart[1])])
        modifier({ ...o, x, y })
      },
      () => {
        if (bouge) return engager()
        if (o.genre === 'gabarit' && o.type !== 'droite' && idCase) {
          setFocusClavier(e.pointerType !== 'touch')
          setCaseActive(idCase)
        }
      },
    )
  }

  const surPoignee = (e: React.PointerEvent, o: Gabarit | Morceau, coin: P, boite: [number, number, number, number], w: number, h: number) => {
    e.stopPropagation()
    e.preventDefault()
    engager()
    const [bx, by, bw, bh] = boite
    // Coin opposé fixe ; l'objet grandit vers le coin tiré, proportions gardées.
    const ancre: P = [coin[0] ? bx : bx + bw, coin[1] ? by : by + bh]
    suivrePointeur(
      e,
      (ev) => {
        const p = versDiapo(ev.clientX, ev.clientY)
        const kz = borne(Math.max(Math.abs(p[0] - ancre[0]) / w, Math.abs(p[1] - ancre[1]) / h), 0.25, 4)
        const coinHG: P = [coin[0] ? ancre[0] : ancre[0] - w * kz, coin[1] ? ancre[1] : ancre[1] - h * kz]
        const [x, y] = versPage(t, [Math.round(coinHG[0]), Math.round(coinHG[1])])
        modifier({ ...o, x, y, k: Math.round((kz / z) * 1000) / 1000 })
      },
      () => engager(),
    )
  }

  const surDeplacer = (e: React.PointerEvent, o: Gabarit | Morceau, sx: number, sy: number) => {
    e.stopPropagation()
    e.preventDefault()
    engager()
    setCaseActive(null)
    const depart = versDiapo(e.clientX, e.clientY)
    suivrePointeur(
      e,
      (ev) => {
        const p = versDiapo(ev.clientX, ev.clientY)
        const [x, y] = versPage(t, [Math.round(sx + p[0] - depart[0]), Math.round(sy + p[1] - depart[1])])
        modifier({ ...o, x, y })
      },
      () => engager(),
    )
  }

  return (
    <div className="calque-objets" data-stylo={outils.stylo ? '' : undefined}>
      {objets.map((o) => {
        const [sx, sy] = versEcran(t, [o.x, o.y])
        const kz = o.k * z
        const g = o.genre === 'gabarit' ? { ...o, r: reglagesComplets(o.r) } : null
        const d = g ? disposer(g) : null
        const w = d ? d.w : (o as Morceau).cadre.w
        const h = d ? d.h : (o as Morceau).cadre.h
        return (
          <div
            key={o.id}
            className={`objet-pose projection-interactif${sel === o.id ? ' choisi' : ''}`}
            data-objet=""
            style={{ left: sx, top: sy, width: w * kz, height: h * kz }}
            aria-label={g ? `${NOMS_GABARITS[g.type]} (toucher une case pour la remplir)` : 'Morceau de diapo collé'}
            onPointerDown={(e) => surObjet(e, o, sx, sy)}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="objet-contenu" style={{ width: w, height: h, transform: `scale(${kz})` }}>
              {g && d ? <DessinGabarit g={g} d={d} active={sel === o.id ? caseActive : null} /> : <DessinMorceau m={o as Morceau} diapos={projection.diapos} chapter={projection.chapter} />}
            </div>
          </div>
        )
      })}
      {/* Appel direct (pas un composant défini ici : il serait remonté à chaque rendu et le champ perdrait le focus). */}
      {choisi && chromeObjet(choisi)}
    </div>
  )

  function chromeObjet(o: Gabarit | Morceau) {
    const [sx, sy] = versEcran(t, [o.x, o.y])
    const kz = o.k * z
    const g = o.genre === 'gabarit' ? { ...o, r: reglagesComplets(o.r) } : null
    const d = g ? disposer(g) : null
    const w = d ? d.w : (o as Morceau).cadre.w
    const h = d ? d.h : (o as Morceau).cadre.h
    const boite: [number, number, number, number] = [sx, sy, w * kz, h * kz]
    const marge = 12
    const barreH = cible + 8
    const barreY = sy - marge - barreH - 6 >= 4 ? sy - marge - barreH - 6 : sy + h * kz + marge + 6
    const c = g && d && caseActive ? d.cases.find((x) => x.id === caseActive) : null
    // Clavier : à droite de l'objet s'il y a la place, sinon à gauche, sinon dessous / dessus ; toujours dans la diapo.
    const wc = 6 * cible + 5 * 5 + 18
    const hc = 5 * cible + 4 * 5 + 18 + cible + 30
    let pc: P = [sx + w * kz + 24, sy]
    if (pc[0] + wc > 1276) pc = [sx - wc - 24, sy]
    if (pc[0] < 4) pc = [borne(sx, 4, 1276 - wc), sy + h * kz + 24 + hc <= 716 ? sy + h * kz + 24 : sy - hc - 24]
    pc = [borne(pc[0], 4, 1276 - wc), borne(pc[1], 4, 716 - hc)]
    const ordre = d ? d.cases.map((x) => x.id) : []
    const aller = (delta: number) => {
      if (!caseActive) return
      engager()
      const i = ordre.indexOf(caseActive)
      setCaseActive(ordre[(i + delta + ordre.length) % ordre.length])
    }
    return (
      <>
        <div className="objet-cadre" style={{ left: sx - marge, top: sy - marge, width: w * kz + 2 * marge, height: h * kz + 2 * marge, ['--cible' as string]: `${cible}px` }}>
          {(
            [
              [0, 0],
              [1, 0],
              [0, 1],
              [1, 1],
            ] as P[]
          ).map((coin) => (
            <span
              key={coin.join('')}
              className="objet-poignee projection-interactif"
              data-objet=""
              data-coin={coin.join('')}
              role="slider"
              aria-label="Agrandir ou réduire (proportions gardées)"
              aria-valuenow={Math.round(kz * 100)}
              title="Agrandir ou réduire"
              style={{ left: coin[0] ? '100%' : 0, top: coin[1] ? '100%' : 0, cursor: coin[0] === coin[1] ? 'nwse-resize' : 'nesw-resize' }}
              onPointerDown={(e) => surPoignee(e, o, [coin[0] ? 0 : 1, coin[1] ? 0 : 1] as P, boite, w, h)}
              onClick={(e) => e.stopPropagation()}
            />
          ))}
        </div>
        <div
          className="objet-barre projection-interactif"
          data-objet=""
          role="toolbar"
          aria-label={g ? NOMS_GABARITS[g.type] : 'Morceau collé'}
          style={{ left: borne(sx - marge, 4, 1000), top: barreY, ['--cible' as string]: `${cible}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <button type="button" className="objet-bouton objet-deplacer" title="Glisser pour déplacer" aria-label="Déplacer (glisser)" onPointerDown={(e) => surDeplacer(e, o, sx, sy)}>
            <PictoBlanc nom="deplacer" taille={Math.round(cible * 0.42)} /> Déplacer
          </button>
          {g && (g.type === 'signes' || g.type === 'variations' || g.type === 'statistique' || g.type === 'valeurs') && (
            <button
              type="button"
              className="objet-bouton"
              disabled={!peutAjouterColonne(g)}
              onClick={() => {
                const n = ajouterColonne(g)
                if (!n) return
                engager()
                modifier(n)
                engager()
              }}
            >
              + colonne
            </button>
          )}
          {g && (g.type === 'signes' || g.type === 'valeurs' || g.type === 'variations') && (
            <button
              type="button"
              className="objet-bouton"
              disabled={!peutAjouterLigne(g)}
              onClick={() => {
                const n = ajouterLigne(g)
                if (!n) return
                engager()
                modifier(n)
                engager()
              }}
            >
              + ligne
            </button>
          )}
          <button
            type="button"
            className="objet-bouton objet-retirer"
            aria-label={g ? `Retirer le ${NOMS_GABARITS[g.type].toLowerCase()}` : 'Retirer le morceau collé'}
            title="Retirer (Ctrl+Z pour le remettre)"
            onClick={() => {
              engager()
              avant.current = null
              setSel(null)
              setCaseActive(null)
              annotations.retirerEpingle(pageRef.current, o)
            }}
          >
            <Pictogramme nom="fermer" taille={Math.round(cible * 0.4)} />
          </button>
        </div>
        {g && c && (
          <ClavierCase
            c={c}
            valeur={texteCase(g, c)}
            saisir={(texte) => modifier({ ...(o as Gabarit), cases: { ...(o as Gabarit).cases, [c.id]: texte } })}
            aller={aller}
            fermer={() => {
              engager()
              setCaseActive(null)
            }}
            focus={focusClavier}
            cible={cible}
            pos={pc}
          />
        )}
        {g && g.type === 'droite' && <EditeurDroite key={o.id} g={o as Gabarit} modifier={(n) => modifier(n)} cible={cible} pos={[borne(sx, 4, 640), borne(sy + h * kz + marge + 10, 4, 716 - 2 * cible - 30)]} />}
      </>
    )
  }
}

// ---------- menu « Gabarit ▾ » de la petite barre de l'écran blanc ----------

function MiniGabarit({ type }: { type: TypeGabarit }) {
  const contenu = {
    signes: (
      <>
        <rect x="4" y="5" width="58" height="32" />
        <line x1="20" y1="5" x2="20" y2="37" />
        <line x1="4" y1="13" x2="62" y2="13" />
        <line x1="4" y1="21" x2="62" y2="21" />
        <line x1="4" y1="29" x2="62" y2="29" />
        <line x1="41" y1="13" x2="41" y2="37" strokeDasharray="2 2" />
      </>
    ),
    variations: (
      <>
        <rect x="4" y="5" width="58" height="32" />
        <line x1="20" y1="5" x2="20" y2="37" />
        <line x1="4" y1="14" x2="62" y2="14" />
        <path d="M25 32 L38 20 L52 32" />
      </>
    ),
    arbre: <path d="M6 21 L28 10 M6 21 L28 32 M30 10 L58 5 M30 10 L58 15 M30 32 L58 27 M30 32 L58 37" />,
    venn: (
      <>
        <rect x="4" y="4" width="58" height="34" />
        <circle cx="27" cy="21" r="11" />
        <circle cx="39" cy="21" r="11" />
      </>
    ),
    droite: (
      <>
        <line x1="5" y1="24" x2="61" y2="24" />
        <path d="M12 21v6M22 21v6M32 21v6M42 21v6M52 21v6" />
        <path d="M24 16 h-3 v16 h3 M46 16 h-3 v16 h3" stroke="#b65c1f" />
      </>
    ),
    statistique: (
      <>
        <rect x="4" y="6" width="58" height="30" />
        <line x1="4" y1="13.5" x2="62" y2="13.5" />
        <line x1="4" y1="21" x2="62" y2="21" />
        <line x1="4" y1="28.5" x2="62" y2="28.5" />
        <line x1="18" y1="6" x2="18" y2="36" />
        <line x1="29" y1="6" x2="29" y2="36" />
        <line x1="40" y1="6" x2="40" y2="36" />
        <line x1="51" y1="6" x2="51" y2="36" />
      </>
    ),
    valeurs: (
      <>
        <rect x="4" y="11" width="58" height="20" />
        <line x1="4" y1="21" x2="62" y2="21" />
        <line x1="16" y1="11" x2="16" y2="31" />
        <line x1="28" y1="11" x2="28" y2="31" />
        <line x1="40" y1="11" x2="40" y2="31" />
        <line x1="52" y1="11" x2="52" y2="31" />
      </>
    ),
  }[type]
  return (
    <svg className="gabarit-mini" viewBox="0 0 66 42" aria-hidden="true">
      {contenu}
    </svg>
  )
}

function Pas({ nom, valeur, min, max, changer, texte }: { nom: string; valeur: number; min: number; max: number; changer: (v: number) => void; texte?: string }) {
  return (
    <div className="gabarit-pas" role="group" aria-label={nom}>
      <span>{nom}</span>
      <span className="gabarit-pas-ctl">
        <button type="button" aria-label={`${nom} : un de moins`} disabled={valeur <= min} onClick={() => changer(valeur - 1)}>
          −
        </button>
        <b aria-live="polite">{texte ?? valeur}</b>
        <button type="button" aria-label={`${nom} : un de plus`} disabled={valeur >= max} onClick={() => changer(valeur + 1)}>
          +
        </button>
      </span>
    </div>
  )
}

function Interrupteur({ nom, actif, changer }: { nom: string; actif: boolean; changer: (v: boolean) => void }) {
  return (
    <label className="gabarit-interrupteur">
      <span>{nom}</span>
      <input type="checkbox" role="switch" checked={actif} onChange={(e) => changer(e.target.checked)} />
    </label>
  )
}

/** Réglages de taille du type choisi (le dernier choix est retenu). */
function ReglagesType({ type, r, changer }: { type: TypeGabarit; r: ReglagesGabarit; changer: (p: Partial<ReglagesGabarit>) => void }) {
  switch (type) {
    case 'signes':
      return (
        <>
          <Pas nom="Facteurs" valeur={r.facteurs} min={1} max={4} changer={(v) => changer({ facteurs: v })} />
          <Pas nom="Valeurs qui annulent" valeur={r.valeurs} min={1} max={4} changer={(v) => changer({ valeurs: v })} />
          <Interrupteur nom="Ligne du produit" actif={r.produit} changer={(v) => changer({ produit: v })} />
        </>
      )
    case 'variations':
      return (
        <>
          <Pas nom="Intervalles" valeur={r.intervalles} min={1} max={4} changer={(v) => changer({ intervalles: v })} />
          <Interrupteur nom="Ligne du signe de f′" actif={r.derivee} changer={(v) => changer({ derivee: v })} />
        </>
      )
    case 'arbre':
      return (
        <>
          <Pas nom="Niveaux" valeur={r.niveaux} min={2} max={3} changer={(v) => changer({ niveaux: v, branches: v === 3 ? 2 : r.branches })} />
          <Pas nom="Branches" valeur={r.branches} min={2} max={r.niveaux === 3 ? 2 : 3} changer={(v) => changer({ branches: v })} />
          {r.niveaux === 3 && <p className="gabarit-aide">3 niveaux : 2 branches par nœud (8 feuilles).</p>}
        </>
      )
    case 'venn':
      return <Pas nom="Ensembles" valeur={r.ensembles} min={2} max={3} changer={(v) => changer({ ensembles: v })} />
    case 'droite':
      return (
        <>
          <Pas nom="De" valeur={r.de} min={-1000} max={r.a - r.pas} changer={(v) => changer({ de: v })} texte={texteNombre(r.de)} />
          <Pas nom="À" valeur={r.a} min={r.de + r.pas} max={1000} changer={(v) => changer({ a: v })} texte={texteNombre(r.a)} />
          <p className="gabarit-aide">Pas, bornes et intervalles : réglables ensuite sous la droite.</p>
        </>
      )
    case 'statistique':
      return (
        <>
          <Pas nom="Colonnes" valeur={r.colonnes} min={2} max={10} changer={(v) => changer({ colonnes: v })} />
          <div className="gabarit-lignes" role="group" aria-label="Lignes du tableau">
            {LIGNES_STAT.map((k) => (
              <label key={k} className="gabarit-coche">
                <input type="checkbox" checked={r.lignesStat[k]} onChange={(e) => changer({ lignesStat: { ...r.lignesStat, [k]: e.target.checked } })} />
                {NOMS_LIGNES_STAT[k]}
              </label>
            ))}
            <label className="gabarit-coche">
              <input type="checkbox" checked={r.total} onChange={(e) => changer({ total: e.target.checked })} />
              Colonne « Total »
            </label>
          </div>
        </>
      )
    case 'valeurs':
      return (
        <>
          <Pas nom="Colonnes" valeur={r.colonnes} min={2} max={10} changer={(v) => changer({ colonnes: v })} />
          <Pas nom="Lignes" valeur={r.lignesValeurs} min={2} max={3} changer={(v) => changer({ lignesValeurs: v })} texte={r.lignesValeurs === 3 ? '3 (x, f, g)' : '2 (x, f)'} />
        </>
      )
  }
}

/** Menu « Gabarit ▾ » : sept gabarits (petit aperçu), à droite la taille avant de poser, puis « Poser sur la page ». */
export function MenuGabarit({ projection, annotations, page, setOutils, id }: { projection: Projection; annotations: MagasinAnnotations; page: PageBlanche; setOutils: SetOutils; id: string }) {
  const [choix, setChoix] = useState(() => lireReglages())
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const ailleurs = (e: PointerEvent) => {
      const t = e.target as Element
      if (ref.current?.contains(t) || t.closest?.('[data-bouton-gabarit]')) return
      setOutils((o) => ({ ...o, menuGabarit: false }))
    }
    window.addEventListener('pointerdown', ailleurs, true)
    return () => window.removeEventListener('pointerdown', ailleurs, true)
  }, [setOutils])
  const changer = (p: Partial<ReglagesGabarit>) =>
    setChoix((c) => {
      const n = { type: c.type, r: reglagesComplets({ ...c.r, ...p }) }
      retenirReglages(n.type, n.r)
      return n
    })
  const apercu = useMemo(() => {
    const g = nouveauGabarit(choix.type, choix.r, 'apercu')
    return { g, d: disposer(g) }
  }, [choix])
  const poser = () => {
    const g = nouveauGabarit(choix.type, choix.r, nouvelId(projection.id))
    const t = transfoPage(page)
    const [x, y] = versPage(t, [g.x, g.y])
    const pose = { ...g, x, y, k: Math.round((g.k / zoomDe(t)) * 1000) / 1000 }
    annotations.ajouter(clePageBlanche(page.id), pose)
    setOutils((o) => ({ ...o, menuGabarit: false, stylo: false, palette: false }))
    selectionnerObjet(pose.id)
  }
  const ka = Math.min(296 / apercu.d.w, 128 / apercu.d.h)
  return (
    <div ref={ref} id={id} className="menu-gabarit projection-interactif" role="dialog" aria-label="Poser un gabarit sur la page" onClick={(e) => e.stopPropagation()}>
      <div className="gabarit-liste" role="radiogroup" aria-label="Gabarit">
        {TYPES_GABARITS.map((type) => (
          <button
            key={type}
            type="button"
            role="radio"
            aria-checked={choix.type === type}
            className="gabarit-item"
            onClick={() =>
              setChoix((c) => {
                retenirReglages(type, c.r)
                return { type, r: c.r }
              })
            }
          >
            <MiniGabarit type={type} />
            {NOMS_GABARITS[type]}
          </button>
        ))}
      </div>
      <div className="gabarit-reglages">
        <p className="gabarit-titre">{NOMS_GABARITS[choix.type]}</p>
        <ReglagesType type={choix.type} r={choix.r} changer={changer} />
        <div className="gabarit-apercu" aria-hidden="true">
          <div style={{ width: apercu.d.w * ka, height: apercu.d.h * ka }}>
            <div style={{ width: apercu.d.w, height: apercu.d.h, transform: `scale(${ka})`, transformOrigin: '0 0' }}>
              <DessinGabarit g={apercu.g} d={apercu.d} exporter />
            </div>
          </div>
        </div>
        <button type="button" className="gabarit-poser" onClick={poser}>
          Poser sur la page
        </button>
      </div>
    </div>
  )
}

/** Abonnement au presse-papier de « Copier » (bouton « Coller » de la petite barre). */
function useCopie() {
  const [, setN] = useState(0)
  useEffect(() => abonnerCopie(() => setN((n) => n + 1)), [])
  return lireCopie()
}

/** Boutons ajoutés à la petite barre de l'écran blanc, après « fond ▾ » : « Gabarit ▾ » et « Coller » (s'il y a une copie). */
export function BoutonsGabaritColler({ projection, annotations, page, outils, setOutils, idMenu }: { projection: Projection; annotations: MagasinAnnotations; page: PageBlanche; outils: OutilsLocaux; setOutils: SetOutils; idMenu: string }) {
  const copie = useCopie()
  return (
    <>
      <button
        type="button"
        data-bouton-gabarit=""
        className={`projection-outil blanc-gabarit${outils.menuGabarit ? ' actif' : ''}`}
        aria-haspopup="dialog"
        aria-expanded={!!outils.menuGabarit}
        aria-controls={idMenu}
        title="Poser un gabarit : tableau de signes, de variations, arbre, Venn, droite graduée, tableau statistique, de valeurs"
        onClick={() => setOutils((o) => ({ ...o, menuGabarit: !o.menuGabarit, menuFond: false, traceur: false, palette: false, nuancier: false }))}
      >
        <PictoBlanc nom="gabarit" /> Gabarit
        <Pictogramme nom="chevron-bas" taille={16} />
      </button>
      {copie && (
        <button
          type="button"
          className="projection-outil blanc-coller"
          title="Coller le morceau copié sur cette page"
          onClick={() => {
            const m = placerMorceau(copie, nouvelId(projection.id))
            const t = transfoPage(page)
            const [x, y] = versPage(t, [m.x, m.y])
            const pose = { ...m, x, y, k: Math.round((m.k / zoomDe(t)) * 100) / 100 }
            annotations.ajouter(clePageBlanche(page.id), pose)
            setOutils((o) => ({ ...o, stylo: false, palette: false, menuGabarit: false, menuFond: false }))
            selectionnerObjet(pose.id)
          }}
        >
          <PictoBlanc nom="coller" /> Coller
        </button>
      )}
    </>
  )
}
