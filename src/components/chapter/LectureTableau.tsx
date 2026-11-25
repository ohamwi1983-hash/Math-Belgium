import { useCallback, useEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'
import { grilleLecture, latexVersTexte, resumeTableau, type CaseLecture, type GrilleLecture, type ModeleTableau } from '../../lib/lectureTableauSignes'
import { changerDireCases, estPrerendu, lire, useVoix, voixDisponible } from '../../lib/voixLecture'
import { resumesTableaux } from '../../lib/phrasesPage'

/**
 * Lecture « case par case » d'un tableau de signes / de variations (planche 09, démo validée
 * « lecture-guidee.html », onglet 9). Enveloppe un `<table>` déjà rendu, SANS en changer le
 * balisage ni l'aspect au repos :
 * - le tableau devient une grille (`role="grid"`, une seule case dans l'ordre de tabulation,
 *   flèches / Début / Fin, Entrée ou Espace relit la case, Échap referme) ;
 * - la lecture s'active au focus clavier, au clic sur une case ou par le petit bouton « Lire case
 *   par case » sous le tableau ; alors la case ET sa colonne sont surlignées, des boutons ← ↑ ↓ →
 *   (≥ 44 px) et « Résumé du tableau » apparaissent, avec la phrase de la case ;
 * - la phrase est annoncée par une région `aria-live` toujours présente (lecteurs d'écran) ;
 * - point d'accroche pour la voix : chaque phrase émet l'événement DOM `EVENEMENT_PHRASE_TABLEAU`
 *   (bouillonne depuis l'enveloppe) et appelle `onPhrase` ; avec « Dire chaque case » (bouton du panneau,
 *   gardé sur l'appareil), elle est aussi lue à voix haute (moteur `lib/voixLecture.ts`). « Écouter
 *   l'étape » lit le résumé du tableau (`resumesTableaux` de `lib/phrasesPage.ts`).
 *
 * Le modèle vient de `modele` (bloc `signTable` du cours) ou, à défaut, est lu dans le DOM du
 * tableau (tableaux affichés des générateurs : texte des cellules, LaTeX des formules KaTeX lu dans
 * leur annotation). Tout ce qui est propre à l'écran porte `no-export` (impression, export).
 */

export const EVENEMENT_PHRASE_TABLEAU = 'lecture-tableau:phrase'

export interface DetailPhraseTableau {
  phrase: string
  /** `case` : nouvelle case active ; `relire` : Entrée/Espace ; `resume` : « Résumé du tableau ». */
  source: 'case' | 'relire' | 'resume'
  ligne?: number
  colonne?: number
}

interface Props {
  /** Contient le `<table>` (éventuellement dans son cadre de défilement). */
  children: ReactNode
  /** Modèle du tableau ; sinon lu dans le DOM. */
  modele?: ModeleTableau
  /** Remplace des libellés de ligne du modèle lu dans le DOM (`undefined` = garder). */
  etiquettes?: (string | undefined)[]
  /** Nom accessible de la grille quand le tableau n'a pas de `<caption>`. */
  titre?: string
  /** Variante des générateurs (marges de `.grille-signes-scroll`). */
  generateur?: boolean
  onPhrase?: (detail: DetailPhraseTableau) => void
}

type Pos = { r: number; c: number }
type Dir = 'g' | 'd' | 'h' | 'b'

function texteCellule(el: Element): string {
  let out = ''
  el.childNodes.forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE) out += n.textContent ?? ''
    else if (n instanceof Element) {
      if (n.classList.contains('katex')) {
        const tex = n.querySelector('annotation[encoding="application/x-tex"]')?.textContent
        out += tex != null ? latexVersTexte(tex) : (n.querySelector('.katex-html')?.textContent ?? '')
      } else if (n.getAttribute('aria-hidden') !== 'true') out += texteCellule(n)
    }
  })
  return out.replace(/\s+/g, ' ').trim()
}

export function modeleDepuisTable(table: HTMLTableElement, etiquettes?: (string | undefined)[]): ModeleTableau {
  return {
    caption: table.caption?.textContent ?? undefined,
    rows: Array.from(table.rows).map((tr, r) => {
      const cells = Array.from(tr.cells).map(texteCellule)
      return { label: etiquettes?.[r] ?? cells[0] ?? '', cells: cells.slice(1) }
    }),
  }
}

function premiereCase(g: GrilleLecture): Pos | null {
  for (const r of [1, 0, ...g.keys()]) {
    const l = g[r]
    if (!l) continue
    for (let c = 2; c < l.length; c++) if (l[c]) return { r, c }
    for (let c = 0; c < l.length; c++) if (l[c]) return { r, c }
  }
  return null
}

const FLECHES: { dir: Dir; label: string; d: string }[] = [
  { dir: 'g', label: 'Case à gauche', d: 'M15 6l-6 6 6 6' },
  { dir: 'h', label: 'Case au-dessus', d: 'M6 15l6-6 6 6' },
  { dir: 'b', label: 'Case en dessous', d: 'M6 9l6 6 6-6' },
  { dir: 'd', label: 'Case à droite', d: 'M9 6l6 6-6 6' },
]

export function LectureTableau({ children, modele, etiquettes, titre, generateur, onPhrase }: Props) {
  const racine = useRef<HTMLDivElement>(null)
  const lancer = useRef<HTMLButtonElement>(null)
  const bulle = useRef<HTMLDivElement>(null)
  const grille = useRef<GrilleLecture | null>(null)
  const modeleLu = useRef<ModeleTableau | null>(null)
  const [disponible, setDisponible] = useState(false)
  const [inerte, setInerte] = useState(false)
  const [actif, setActif] = useState(false)
  const [pos, setPos] = useState<Pos | null>(null)
  const [affiche, setAffiche] = useState<CaseLecture | null>(null)
  const [annonce, setAnnonce] = useState('')
  const retourLancer = useRef(false)
  const minuterie = useRef<number | undefined>(undefined)
  /** Focus donné par le composant lui-même : `surFocus` ne doit pas relire la case une 2e fois. */
  const focusInterne = useRef(false)

  const table = () => racine.current?.querySelector('table') ?? null
  const { cases: direCases } = useVoix()
  const [voixPossible, setVoixPossible] = useState(false)
  useEffect(() => setVoixPossible(voixDisponible() && !estPrerendu()), [])

  // « Écouter l'étape » (lecture de la page) : le tableau se lit par son résumé.
  useEffect(() => {
    const el = racine.current
    if (!el) return
    resumesTableaux.set(el, () => (modeleLu.current ? resumeTableau(modeleLu.current) : null))
    return () => {
      resumesTableaux.delete(el)
    }
  }, [])

  // Après chaque rendu : (re)lire le modèle, poser les rôles de grille, la tabulation mobile et le
  // surlignage. Idempotent ; ne touche jamais au contenu ni aux classes posées par React.
  useEffect(() => {
    const el = racine.current
    const t = table()
    if (!el || !t) return
    if (el.closest('.diapo')) {
      if (!inerte) setInerte(true)
      return
    }
    const m = modele ?? modeleDepuisTable(t, etiquettes)
    const g = grilleLecture(m)
    const ok = !!g && g.length === t.rows.length && g.every((l, r) => l.length === t.rows[r].cells.length)
    grille.current = ok ? g : null
    modeleLu.current = ok ? m : null
    if (ok !== disponible) setDisponible(ok)
    if (!ok || !g) return
    t.setAttribute('role', 'grid')
    if (!t.caption && titre) t.setAttribute('aria-label', titre)
    const p = pos ?? premiereCase(g)
    Array.from(t.rows).forEach((tr, r) => {
      tr.setAttribute('role', 'row')
      Array.from(tr.cells).forEach((td, c) => {
        td.setAttribute('role', 'gridcell')
        if (g[r][c]) td.tabIndex = p && p.r === r && p.c === c ? 0 : -1
        else td.removeAttribute('tabindex')
        td.classList.toggle('lt-case', actif && !!p && p.r === r && p.c === c)
        td.classList.toggle('lt-colonne', actif && !!p && p.c === c && c > 0)
      })
    })
  })

  useEffect(() => {
    if (!actif && retourLancer.current) {
      retourLancer.current = false
      lancer.current?.focus()
    }
  }, [actif])

  useEffect(() => () => window.clearTimeout(minuterie.current), [])

  // La phrase doit rester lisible : si elle passe sous le bas de l'écran (ou sous la barre fixe de
  // l'étape, voir `scroll-margin-bottom`), on la ramène, sans animation.
  useEffect(() => {
    const b = bulle.current
    if (!b) return
    const r = b.getBoundingClientRect()
    if (r.bottom > window.innerHeight - 96 || r.top < 0) b.scrollIntoView?.({ block: 'nearest' })
  }, [affiche])

  const emettre = useCallback(
    (detail: DetailPhraseTableau) => {
      racine.current?.dispatchEvent(new CustomEvent<DetailPhraseTableau>(EVENEMENT_PHRASE_TABLEAU, { detail, bubbles: true }))
      onPhrase?.(detail)
      if (direCases && voixPossible) lire([{ texte: detail.phrase }], { source: 'tableau', titre: 'Tableau de signes', sansBarre: true })
    },
    [onPhrase, direCases, voixPossible],
  )

  const annoncer = useCallback(
    (detail: DetailPhraseTableau) => {
      window.clearTimeout(minuterie.current)
      if (detail.source === 'relire') {
        // Même texte deux fois de suite : la région live ne le redirait pas sans ce passage à vide.
        setAnnonce('')
        minuterie.current = window.setTimeout(() => setAnnonce(detail.phrase), 120)
      } else setAnnonce(detail.phrase)
      emettre(detail)
    },
    [emettre],
  )

  const cellule = (p: Pos) => table()?.rows[p.r]?.cells[p.c] ?? null

  const aller = useCallback(
    (p: Pos, focus: boolean) => {
      const g = grille.current
      const cas = g?.[p.r]?.[p.c]
      if (!cas) return
      setActif(true)
      setPos(p)
      setAffiche(cas)
      annoncer({ phrase: cas.phrase, source: 'case', ligne: p.r, colonne: p.c })
      const td = cellule(p)
      if (td) {
        if (focus && document.activeElement !== td) {
          focusInterne.current = true
          td.focus({ preventScroll: true })
          focusInterne.current = false
        }
        td.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
      }
    },
    [annoncer],
  )

  const depart = (): Pos | null => pos ?? (grille.current ? premiereCase(grille.current) : null)

  const bouger = (dir: Dir, focus: boolean) => {
    const g = grille.current
    const p = depart()
    if (!g || !p) return
    if (!actif) return aller(p, focus)
    let { r, c } = p
    for (let pas = 0; pas < 40; pas++) {
      if (dir === 'g') c--
      if (dir === 'd') c++
      if (dir === 'h') r--
      if (dir === 'b') r++
      if (r < 0 || r >= g.length || c < 0 || c >= g[r].length) return
      if (g[r][c]) return aller({ r, c }, focus)
    }
  }

  const desactiver = (versLancer: boolean) => {
    window.clearTimeout(minuterie.current)
    retourLancer.current = versLancer
    setActif(false)
    setAffiche(null)
  }

  const positionDe = (target: EventTarget | null): Pos | null => {
    const t = table()
    if (!(target instanceof HTMLTableCellElement) || !t || target.closest('table') !== t) return null
    const tr = target.parentElement as HTMLTableRowElement
    return { r: tr.rowIndex, c: target.cellIndex }
  }

  const surFocus = (e: FocusEvent) => {
    if (focusInterne.current) return
    const p = positionDe(e.target)
    if (!p || !grille.current?.[p.r]?.[p.c]) return
    if (!actif || !pos || pos.r !== p.r || pos.c !== p.c) aller(p, false)
  }

  const surClic = (e: MouseEvent) => {
    const td = (e.target as Element).closest?.('td, th')
    const p = positionDe(td)
    // Le focus (mousedown) a déjà activé cette case : ne pas la relire une seconde fois.
    if (!p || !grille.current?.[p.r]?.[p.c] || (actif && pos && pos.r === p.r && pos.c === p.c)) return
    aller(p, true)
  }

  const surTouche = (e: KeyboardEvent) => {
    const p = positionDe(e.target)
    const g = grille.current
    if (!p || !g) return
    const dir = ({ ArrowLeft: 'g', ArrowRight: 'd', ArrowUp: 'h', ArrowDown: 'b' } as Record<string, Dir>)[e.key]
    if (dir) {
      e.preventDefault()
      bouger(dir, true)
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault()
      const l = g[p.r]
      const cols = l.map((x, c) => (x ? c : -1)).filter((c) => c >= 0)
      if (cols.length) aller({ r: p.r, c: e.key === 'Home' ? cols[0] : cols[cols.length - 1] }, true)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      const cas = g[p.r][p.c]
      if (!cas) return
      if (!actif) return aller(p, true)
      setAffiche(cas)
      annoncer({ phrase: cas.phrase, source: 'relire', ligne: p.r, colonne: p.c })
    } else if (e.key === 'Escape' && actif) {
      e.preventDefault()
      desactiver(false)
    }
  }

  const surSortie = (e: FocusEvent) => {
    // Clavier (Tab) ou clic sur un autre élément focalisable : la lecture se referme. Un toucher
    // sur iOS ne donne pas de `relatedTarget` (les boutons n'y prennent pas le focus) : on ne
    // referme pas, le bouton « Fermer » reste là.
    const vers = e.relatedTarget as Node | null
    if (actif && vers && racine.current && !racine.current.contains(vers)) desactiver(false)
  }

  const resume = () => {
    const m = modeleLu.current
    if (!m) return
    const phrase = resumeTableau(m)
    setAffiche({ phrase, position: 'Résumé du tableau' })
    annoncer({ phrase: `Résumé du tableau\u00a0: ${phrase}`, source: 'resume' })
  }

  const montrer = disponible && !inerte

  return (
    <div
      ref={racine}
      className={`lecture-tableau${generateur ? ' lecture-tableau--generateur' : ''}${actif ? ' est-active' : ''}`}
      onFocus={montrer ? surFocus : undefined}
      onClick={montrer ? surClic : undefined}
      onKeyDown={montrer ? surTouche : undefined}
      onBlur={montrer ? surSortie : undefined}
    >
      {children}
      {montrer && !actif && (
        <button
          ref={lancer}
          type="button"
          className="lt-lancer no-export"
          onClick={() => {
            const p = depart()
            if (p) aller(p, true)
          }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
            <rect x="3.5" y="5" width="17" height="14" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M3.5 10h17M10 5v14" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <rect x="10.8" y="10.8" width="8.9" height="7.4" fill="currentColor" opacity=".28" />
          </svg>
          Lire case par case
        </button>
      )}
      {montrer && actif && (
        <div className="lt-panneau no-export">
          <div className="lt-boutons">
            <div className="lt-fleches">
              {FLECHES.map((f) => (
                <button key={f.dir} type="button" className="lt-btn lt-fleche" tabIndex={-1} aria-label={f.label} onClick={() => bouger(f.dir, false)}>
                  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
                    <path d={f.d} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ))}
            </div>
            <button type="button" className="lt-btn" onClick={resume}>
              Résumé du tableau
            </button>
            {voixPossible && (
              <button
                type="button"
                className="lt-btn lt-voix"
                aria-pressed={direCases}
                onClick={() => {
                  const oui = !direCases
                  changerDireCases(oui)
                  if (oui && affiche) lire([{ texte: affiche.phrase }], { source: 'tableau', titre: 'Tableau de signes', sansBarre: true })
                }}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 5 6 9H2v6h4l5 4V5z" />
                  <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                </svg>
                Dire chaque case
              </button>
            )}
            <button type="button" className="lt-btn lt-fermer" onClick={() => desactiver(true)}>
              Fermer
            </button>
          </div>
          {affiche && (
            <div ref={bulle} className="lt-bulle" aria-hidden="true">
              <span className="lt-pos">{affiche.position}</span>
              <span className="lt-phrase">{affiche.phrase}</span>
            </div>
          )}
        </div>
      )}
      <p className="sr-only no-export" aria-live="polite" aria-atomic="true">
        {annonce}
      </p>
    </div>
  )
}
