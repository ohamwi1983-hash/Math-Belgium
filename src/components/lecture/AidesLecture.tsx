import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import type { HauteurBande, SuivreLigne } from '../../lib/reglagesLecture'
import { animationsReduites } from '../../lib/reglagesLecture'
import { dire, seTaire, voixDisponible } from '../../lib/voixLecture'
import './aidesLecture.css'

/**
 * Aides de lecture de l'onglet « Aides » du panneau « Aa » (planches 07 et 09, démo validée
 * `lecture-guidee.html`), chargées à la demande par `HoteAidesLecture` dès qu'une est active :
 *
 * - `RegleLecture` : règle (bande claire) ou masque (le reste assombri) sur les pages de lecture
 *   (cours et générateurs), qui suit la souris ; au doigt, toucher la place et glisser la déplace sans
 *   jamais bloquer le défilement (écouteurs passifs) ; ↑ ↓ au clavier quand le contenu a le focus ;
 *   boutons ↑ ↓ discrets au doigt. Calque `pointer-events: none` : la page et les widgets (Shadow DOM)
 *   restent manipulables à travers.
 * - `UnBlocALaFois` : dans une étape du cours, le bloc en cours net et entouré, les autres effacés (jamais
 *   cachés) ; bouton flottant « Bloc suivant 2 / 24 » (et précédent) sous le pouce ; toucher un bloc le
 *   choisit, le focus clavier aussi.
 * - `Loupe` : une formule touchée (ou Entrée sur une formule focalisée) s'ouvre en grand dans un
 *   `<dialog>` modal (focus piégé, Échap, retour du focus) avec « Se lit : … » et « Écouter ».
 *
 * Rien de tout cela n'existe au pré-rendu ni sans réglage ; l'impression ne voit rien (`@media screen`,
 * calques hors de `.page`) ; la projection (`.projection`) est laissée de côté.
 */
export default function AidesLecture({ ligne, bande, unbloc, loupe }: { ligne: SuivreLigne; bande: HauteurBande; unbloc: boolean; loupe: boolean }) {
  const zone = useZoneLecture()
  if (!zone) return null
  return (
    <>
      {ligne !== 'aucune' && <RegleLecture mode={ligne} lignes={Number(bande)} zone={zone} />}
      {unbloc && <UnBlocALaFois zone={zone} />}
      {loupe && <Loupe zone={zone} />}
    </>
  )
}

// ---------- zone de lecture ----------

const SELECTEUR_ZONE = '.chapter-layout.parcours, .entrainement'

/** Racine de la page de lecture affichée (cours ou générateur), retrouvée à chaque navigation et quand
 * une page chargée à la demande arrive. `null` ailleurs (accueil, comptes…) et en projection. */
function useZoneLecture(): HTMLElement | null {
  const { pathname, hash } = useLocation()
  const [zone, setZone] = useState<HTMLElement | null>(null)
  useEffect(() => {
    let attente = 0
    const chercher = () => {
      attente = 0
      const z = document.querySelector<HTMLElement>(SELECTEUR_ZONE)
      setZone(z && !document.querySelector('.projection') ? z : null)
    }
    chercher()
    const obs = new MutationObserver(() => {
      if (!attente) attente = requestAnimationFrame(chercher)
    })
    const racine = document.getElementById('root') ?? document.body
    obs.observe(racine, { childList: true, subtree: true })
    return () => {
      obs.disconnect()
      if (attente) cancelAnimationFrame(attente)
    }
  }, [pathname, hash])
  return zone
}

/** Le clavier appartient-il au contenu (et pas à un champ, un curseur, des onglets, un widget…) ? */
function contenuAuFocus(zone: HTMLElement): boolean {
  const a = document.activeElement
  if (!a || a === document.body || a === document.documentElement) return true
  if (a.closest('dialog, input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="slider"], [role="tab"], [role="tablist"], [role="listbox"], [role="option"], [role="menu"], [role="menuitem"], [role="grid"], [role="gridcell"], [role="radiogroup"], [role="radio"], [role="spinbutton"], [role="combobox"], [role="tree"]')) return false
  if (a.tagName.includes('-')) return false // widget (Web Component) : il garde ses flèches
  return zone.contains(a)
}

/** Hauteur des barres collantes du haut (en-tête d'étape, en-tête du site) : un bloc ou la bande ne
 * doivent pas se cacher dessous. */
function hautLibre(): number {
  let bas = 0
  for (const el of document.querySelectorAll<HTMLElement>('.etape-entete, .site-header, .gen-barre')) {
    const pos = getComputedStyle(el).position
    if (pos !== 'sticky' && pos !== 'fixed') continue
    const r = el.getBoundingClientRect()
    if (r.height > 0 && r.top <= 1 && r.bottom > bas && r.bottom < window.innerHeight / 2) bas = r.bottom
  }
  return bas
}

/** Hauteur de la barre fixe du bas (barre de l'étape sur téléphone). */
function basLibre(): number {
  const nav = document.querySelector<HTMLElement>('.etape-nav')
  if (!nav || getComputedStyle(nav).position !== 'fixed') return 0
  return Math.max(0, window.innerHeight - nav.getBoundingClientRect().top)
}

// ---------- règle / masque ----------

function RegleLecture({ mode, lignes, zone }: { mode: 'regle' | 'masque'; lignes: number; zone: HTMLElement }) {
  const calque = useRef<HTMLDivElement>(null)
  const bandeEl = useRef<HTMLDivElement>(null)
  const voileHaut = useRef<HTMLDivElement>(null)
  const voileBas = useRef<HTMLDivElement>(null)
  /** Centre de la bande, en coordonnées de l'ÉCRAN : la bande reste où l'élève l'a posée pendant que le
   * texte défile dessous (comme une règle posée sur la page), puis se recale sur la ligne arrivée sous elle. */
  const centre = useRef<number | null>(null)
  const ligneH = useRef(27)

  const mesurerLigne = useCallback(() => {
    const p = zone.querySelector<HTMLElement>('.etape-active .section-body > p:not(.section-kicker), .etape-active p, .card p, .consigne, p')
    const cs = p ? getComputedStyle(p) : null
    const lh = cs ? parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.5 : 27
    ligneH.current = Math.max(18, Math.min(80, lh))
  }, [zone])

  const dessiner = useCallback(() => {
    const b = bandeEl.current
    if (!b) return
    const h = ligneH.current * lignes + 8
    const vh = window.innerHeight
    if (centre.current === null) centre.current = vh * 0.38
    // Toujours à l'écran (jamais tout l'écran assombri).
    const haut = Math.min(Math.max(0, vh - h), Math.max(0, centre.current - h / 2))
    centre.current = haut + h / 2
    b.style.height = `${h}px`
    b.style.transform = `translateY(${haut}px)`
    if (voileHaut.current) voileHaut.current.style.height = `${haut}px`
    if (voileBas.current) voileBas.current.style.top = `${haut + h}px`
  }, [lignes])

  /** Centre de la bande (écran) pour un point visé : calé sur la ligne de texte qui s'y trouve (la bande
   * couvre cette ligne, et la suivante quand elle fait 2 lignes), sinon le point lui-même. */
  const aligner = useCallback(
    (y: number, x?: number) => {
      const lh = ligneH.current
      const colonne = zone.querySelector<HTMLElement>('.etape-active .section-body, .card, .section-body') ?? zone
      const cx = x ?? colonne.getBoundingClientRect().left + 24
      const d = document as Document & {
        caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null
        caretRangeFromPoint?: (x: number, y: number) => Range | null
      }
      let noeud: Node | undefined
      let decalage = 0
      try {
        if (d.caretPositionFromPoint) {
          const p = d.caretPositionFromPoint(cx, y)
          noeud = p?.offsetNode
          decalage = p?.offset ?? 0
        } else if (d.caretRangeFromPoint) {
          const r = d.caretRangeFromPoint(cx, y)
          noeud = r?.startContainer
          decalage = r?.startOffset ?? 0
        }
      } catch {
        noeud = undefined
      }
      const texte = noeud?.nodeType === Node.TEXT_NODE ? (noeud.textContent ?? '') : ''
      if (!noeud || !texte.trim() || !zone.contains(noeud)) return y
      const plage = document.createRange()
      const o = Math.max(0, Math.min(decalage, texte.length - 1))
      plage.setStart(noeud, o)
      plage.setEnd(noeud, o + 1)
      const r = plage.getBoundingClientRect()
      const milieu = (r.top + r.bottom) / 2
      // Hauteur de ligne du texte visé (paragraphe, encadré, légende… n'ont pas tous la même).
      const parent = noeud.parentElement
      const lhIci = parent ? parseFloat(getComputedStyle(parent).lineHeight) : NaN
      const ligne = lhIci >= 16 && lhIci <= 90 ? lhIci : lh
      if (!r.height || r.height > ligne * 1.6 || Math.abs(milieu - y) > ligne) return y
      if (ligne !== ligneH.current) ligneH.current = ligne
      return milieu + (lignes === 2 ? ligne / 2 : 0)
    },
    [zone, lignes],
  )

  /** Ligne visée par la bande (son haut pour 2 lignes, son milieu sinon). */
  const ligneVisee = useCallback(() => (centre.current ?? window.innerHeight * 0.38) - (lignes === 2 ? ligneH.current / 2 : 0), [lignes])

  const deplacer = useCallback(
    (sens: 1 | -1) => {
      const h = ligneH.current * lignes + 8
      const avant = centre.current ?? window.innerHeight * 0.38
      const vise = ligneVisee() + sens * ligneH.current
      const cale = aligner(vise)
      // Calage sur une ligne qui ne fait pas avancer (formule haute…) : on avance d'une ligne quand même.
      let c = Math.abs(cale - avant) < 4 ? avant + sens * ligneH.current : cale
      // Près d'une barre fixe : c'est la page qui défile d'une ligne, la bande reste lisible.
      const limiteHaut = hautLibre() + 8
      const limiteBas = window.innerHeight - basLibre() - 8
      if (sens > 0 && c + h / 2 > limiteBas) {
        const dy = c + h / 2 - limiteBas
        window.scrollBy({ top: dy, behavior: 'instant' as ScrollBehavior })
        c -= dy
      } else if (sens < 0 && c - h / 2 < limiteHaut) {
        const dy = c - h / 2 - limiteHaut
        window.scrollBy({ top: dy, behavior: 'instant' as ScrollBehavior })
        c -= dy
      }
      centre.current = c
      dessiner()
    },
    [dessiner, lignes, aligner, ligneVisee],
  )

  useLayoutEffect(() => {
    mesurerLigne()
    centre.current = aligner(window.innerHeight * 0.38)
    dessiner()
  }, [mesurerLigne, dessiner, aligner, mode])

  useEffect(() => {
    let image = 0
    let repos = 0
    let point: { x: number; y: number } | null = null
    // Un seul calcul par image, même si le doigt ou la souris envoient plus d'événements.
    const planifier = () => {
      if (!image) image = requestAnimationFrame(() => {
        image = 0
        if (point) {
          centre.current = aligner(point.y, point.x)
          point = null
        }
        dessiner()
      })
    }
    const horsAide = (t: EventTarget | null) => t instanceof Element && !!t.closest('dialog, .regle-fleches, .bloc-flottant')
    const souris = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      point = { x: e.clientX, y: e.clientY }
      planifier()
    }
    const doigt = (e: TouchEvent) => {
      if (horsAide(e.target) || e.touches.length !== 1) return
      point = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      planifier()
    }
    const defilement = () => {
      // Le texte défile sous la bande ; une fois la page arrêtée, la bande se recale sur la ligne.
      clearTimeout(repos)
      repos = window.setTimeout(() => {
        centre.current = aligner(ligneVisee())
        dessiner()
      }, 140)
    }
    const clavier = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
      if (!contenuAuFocus(zone)) return
      e.preventDefault()
      deplacer(e.key === 'ArrowDown' ? 1 : -1)
    }
    const redim = () => {
      mesurerLigne()
      planifier()
    }
    document.addEventListener('pointermove', souris, { passive: true })
    // Écouteurs PASSIFS : toucher place la bande, glisser la déplace, la page défile comme d'habitude.
    document.addEventListener('touchstart', doigt, { passive: true })
    document.addEventListener('touchmove', doigt, { passive: true })
    window.addEventListener('scroll', defilement, { passive: true })
    window.addEventListener('resize', redim)
    document.addEventListener('keydown', clavier)
    document.fonts?.ready.then(redim).catch(() => undefined)
    return () => {
      document.removeEventListener('pointermove', souris)
      document.removeEventListener('touchstart', doigt)
      document.removeEventListener('touchmove', doigt)
      window.removeEventListener('scroll', defilement)
      window.removeEventListener('resize', redim)
      document.removeEventListener('keydown', clavier)
      if (image) cancelAnimationFrame(image)
      clearTimeout(repos)
    }
  }, [zone, dessiner, deplacer, mesurerLigne, aligner, ligneVisee])

  return createPortal(
    <>
      <div ref={calque} className={`regle-calque regle-${mode}`} aria-hidden="true">
        {mode === 'masque' && <div ref={voileHaut} className="regle-voile regle-voile-haut" />}
        <div ref={bandeEl} className="regle-bande" />
        {mode === 'masque' && <div ref={voileBas} className="regle-voile regle-voile-bas" />}
      </div>
      <div className="regle-fleches" role="group" aria-label={mode === 'masque' ? 'Masque de lecture' : 'Règle de lecture'}>
        <button type="button" aria-label="Monter la bande d’une ligne" onClick={() => deplacer(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 15l6-6 6 6" />
          </svg>
        </button>
        <button type="button" aria-label="Descendre la bande d’une ligne" onClick={() => deplacer(1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
    </>,
    document.body,
  )
}

// ---------- un bloc à la fois ----------

interface Groupe {
  /** Élément entouré (paragraphe, encadré, tiroir d'exemple, carte…). */
  principal: HTMLElement
  /** Sous-titre ou sous-titre d'étape qui l'annonce : net avec lui, mais pas entouré. */
  annonces: HTMLElement[]
}

const ANNONCE = 'h3.sub-title, .section-kicker'

/** Blocs de l'étape affichée, dans l'ordre de lecture : enfants du corps de l'étape (les annexes
 * dépliées en cartes et tiroirs), puis la colonne de droite (ordinateur large). Un sous-titre s'attache au
 * bloc qui le suit. Seuls les éléments affichés comptent (les exemples « en-tiroir » d'impression non). */
function trouverGroupes(zone: HTMLElement): Groupe[] {
  const etape = zone.querySelector<HTMLElement>('.chapter-section.etape-active')
  if (!etape || zone.getAttribute('data-vue') !== 'etape') return []
  const elements: HTMLElement[] = []
  const visible = (el: HTMLElement) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden'
  const ajouter = (el: HTMLElement) => {
    if (!visible(el)) return
    if (el.matches('.etape-annexes, .tiroirs')) {
      for (const enfant of el.children) if (enfant instanceof HTMLElement) ajouter(enfant)
      return
    }
    elements.push(el)
  }
  const corps = etape.querySelector<HTMLElement>(':scope > .section-body')
  corps?.childNodes.forEach((n) => n instanceof HTMLElement && ajouter(n))
  const droite = zone.querySelector<HTMLElement>('.parcours-droite')
  if (droite && visible(droite)) for (const enfant of droite.children) if (enfant instanceof HTMLElement) ajouter(enfant)

  const groupes: Groupe[] = []
  let annonces: HTMLElement[] = []
  for (const el of elements) {
    if (el.matches(ANNONCE)) {
      annonces.push(el)
      continue
    }
    groupes.push({ principal: el, annonces })
    annonces = []
  }
  if (annonces.length) groupes.push({ principal: annonces.pop()!, annonces })
  return groupes
}

function UnBlocALaFois({ zone }: { zone: HTMLElement }) {
  const { hash } = useLocation()
  const [groupes, setGroupes] = useState<Groupe[]>([])
  const [index, setIndex] = useState(0)
  const courantRef = useRef<HTMLElement | null>(null)
  const [annonce, setAnnonce] = useState('')

  // (Re)trouver les blocs : changement d'étape, tiroir ouvert, contenu chargé…
  useEffect(() => {
    let attente = 0
    let premiere = true
    const scanner = () => {
      attente = 0
      const g = trouverGroupes(zone)
      setGroupes(g)
      setIndex(() => {
        const garde = courantRef.current ? g.findIndex((x) => x.principal === courantRef.current) : -1
        if (garde >= 0 && !premiere) return garde
        premiere = false
        // Premier bloc visible sous les barres du haut.
        const haut = hautLibre() + 12
        const i = g.findIndex((x) => x.principal.getBoundingClientRect().bottom > haut + 24)
        return Math.max(0, i)
      })
    }
    scanner()
    const obs = new MutationObserver((liste) => {
      // Nos propres marques (`data-lb…`) ne déclenchent rien.
      if (liste.every((m) => m.type === 'attributes' && m.attributeName?.startsWith('data-lb'))) return
      if (!attente) attente = window.setTimeout(scanner, 120)
    })
    obs.observe(zone, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'class', 'data-vue'] })
    return () => {
      obs.disconnect()
      if (attente) clearTimeout(attente)
    }
  }, [zone, hash])

  // Marques sur les blocs (attributs : React ne les touche pas).
  useLayoutEffect(() => {
    const g = groupes[index]
    courantRef.current = g?.principal ?? null
    for (const x of groupes) {
      x.principal.setAttribute('data-lb', '')
      x.annonces.forEach((a) => a.setAttribute('data-lb', ''))
    }
    zone.querySelectorAll('[data-lb-courant]').forEach((el) => el.removeAttribute('data-lb-courant'))
    if (g) {
      g.principal.setAttribute('data-lb-courant', 'cadre')
      g.annonces.forEach((a) => a.setAttribute('data-lb-courant', ''))
    }
  }, [groupes, index, zone])

  useEffect(
    () => () => {
      document.querySelectorAll('[data-lb], [data-lb-courant]').forEach((el) => {
        el.removeAttribute('data-lb')
        el.removeAttribute('data-lb-courant')
      })
    },
    [],
  )

  // Toucher (ou atteindre au clavier) un bloc le choisit.
  useEffect(() => {
    const choisirDepuis = (t: EventTarget | null) => {
      if (!(t instanceof Element)) return
      const el = t.closest<HTMLElement>('[data-lb]')
      if (!el) return
      const i = groupes.findIndex((g) => g.principal === el || g.annonces.includes(el))
      if (i >= 0) setIndex(i)
    }
    const clic = (e: MouseEvent) => choisirDepuis(e.target)
    const focus = (e: FocusEvent) => choisirDepuis(e.target)
    zone.addEventListener('click', clic)
    zone.addEventListener('focusin', focus)
    return () => {
      zone.removeEventListener('click', clic)
      zone.removeEventListener('focusin', focus)
    }
  }, [groupes, zone])

  const aller = (i: number) => {
    const j = Math.max(0, Math.min(groupes.length - 1, i))
    setIndex(j)
    setAnnonce(`Bloc ${j + 1} sur ${groupes.length}`)
    const g = groupes[j]
    if (!g) return
    const premier = g.annonces[0] ?? g.principal
    const r = premier.getBoundingClientRect()
    const haut = hautLibre() + 16
    const bas = window.innerHeight - basLibre() - 72
    if (r.top < haut || r.top > Math.min(bas, window.innerHeight * 0.55)) {
      window.scrollTo({ top: window.scrollY + r.top - haut, behavior: animationsReduites() ? 'auto' : 'smooth' })
    }
  }

  if (groupes.length === 0) return null
  const dernier = index >= groupes.length - 1
  return createPortal(
    <div className="bloc-flottant" role="group" aria-label="Un bloc à la fois">
      <button type="button" className="bloc-prec" aria-label="Bloc précédent" disabled={index === 0} onClick={() => aller(index - 1)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 15l6-6 6 6" />
        </svg>
      </button>
      <button type="button" className="bloc-suiv" disabled={dernier} onClick={() => aller(index + 1)} aria-label={dernier ? `Dernier bloc, ${index + 1} sur ${groupes.length}` : `Bloc suivant, ${index + 2} sur ${groupes.length}`}>
        <span aria-hidden="true">{dernier ? 'Dernier bloc' : 'Bloc suivant'}</span>
        <span className="bloc-compte" aria-hidden="true">
          {index + 1}&nbsp;/&nbsp;{groupes.length}
        </span>
        {!dernier && (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 5v14M6 13l6 6 6-6" />
          </svg>
        )}
      </button>
      <span className="sr-only" aria-live="polite">
        {annonce}
      </span>
    </div>,
    document.body,
  )
}

// ---------- loupe ----------

/** Conteneurs de formule : cours (`Math.tsx`), générateurs (`KatexAccessible.tsx`), HTML construit en
 * chaîne (`katexAccessible.ts` : la racine `.katex` porte la lecture). */
const SELECTEUR_FORMULE = '.math-inline, [data-testid="react-katex"], .katex-display, .katex'

function conteneurFormule(t: Element, zone: HTMLElement): HTMLElement | null {
  let f = t.closest<HTMLElement>(SELECTEUR_FORMULE)
  if (!f || !zone.contains(f)) return null
  // Le conteneur le plus large (le `.katex` intérieur d'un `.math-inline` → le `.math-inline`).
  for (let p = f.parentElement?.closest<HTMLElement>(SELECTEUR_FORMULE); p && zone.contains(p); p = p.parentElement?.closest<HTMLElement>(SELECTEUR_FORMULE)) f = p
  return f
}

/** Formule dans un élément qu'on touche pour AGIR (bouton, choix d'un QCM, lien, carte cliquable…) :
 * la loupe ne s'en mêle pas. Repère générique : un ancêtre interactif ou au curseur « main ». */
function dansInteractif(f: HTMLElement, zone: HTMLElement): boolean {
  for (let p: HTMLElement | null = f.parentElement; p && p !== zone; p = p.parentElement) {
    if (p.matches('button, a[href], label, summary, input, select, textarea, [role="button"], [role="option"], [role="radio"], [role="checkbox"], [role="switch"], [role="tab"], [role="link"], [contenteditable]')) return true
    if (p.hasAttribute('tabindex') && !p.hasAttribute('data-loupe-tab')) return true
    if (getComputedStyle(p).cursor === 'pointer') return true
  }
  return false
}

function Loupe({ zone }: { zone: HTMLElement }) {
  const { hash } = useLocation()
  const [ouverte, setOuverte] = useState<HTMLElement | null>(null)

  // Formules atteignables au clavier (Tab) : `tabindex="0"` posé et retiré par la loupe seulement.
  useEffect(() => {
    let attente = 0
    const marquer = () => {
      attente = 0
      zone.querySelectorAll<HTMLElement>(SELECTEUR_FORMULE).forEach((el) => {
        // Seulement les formules affichées (étape ouverte, tiroir déplié…) : on repasse à chaque changement.
        if (el.hasAttribute('data-loupe-tab') || el.hasAttribute('tabindex') || el.getClientRects().length === 0) return
        if (conteneurFormule(el, zone) !== el || dansInteractif(el, zone)) return
        el.setAttribute('tabindex', '0')
        el.setAttribute('data-loupe-tab', '')
      })
    }
    marquer()
    const obs = new MutationObserver(() => {
      if (!attente) attente = window.setTimeout(marquer, 200)
    })
    obs.observe(zone, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'class', 'data-vue'] })
    return () => {
      obs.disconnect()
      if (attente) clearTimeout(attente)
      document.querySelectorAll('[data-loupe-tab]').forEach((el) => {
        el.removeAttribute('tabindex')
        el.removeAttribute('data-loupe-tab')
      })
    }
  }, [zone, hash])

  useEffect(() => {
    const clic = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || !(e.target instanceof Element)) return
      if (String(window.getSelection?.() ?? '').trim()) return // l'élève sélectionne du texte
      const f = conteneurFormule(e.target, zone)
      if (!f || dansInteractif(f, zone)) return
      setOuverte(f)
    }
    const clavier = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.defaultPrevented || !(e.target instanceof HTMLElement) || !e.target.hasAttribute('data-loupe-tab')) return
      e.preventDefault()
      setOuverte(e.target)
    }
    zone.addEventListener('click', clic)
    zone.addEventListener('keydown', clavier)
    return () => {
      zone.removeEventListener('click', clic)
      zone.removeEventListener('keydown', clavier)
    }
  }, [zone])

  if (!ouverte) return null
  return <LoupeDialogue formule={ouverte} fermer={() => setOuverte(null)} />
}

function LoupeDialogue({ formule, fermer }: { formule: HTMLElement; fermer: () => void }) {
  const dialogue = useRef<HTMLDialogElement>(null)
  const grande = useRef<HTMLDivElement>(null)
  const boutonFermer = useRef<HTMLButtonElement>(null)
  const katexEl = formule.matches('.katex') ? formule : formule.querySelector('.katex')
  const lu = (formule.getAttribute('role') === 'img' && formule.getAttribute('aria-label')) || formule.querySelector('[role="img"][aria-label]')?.getAttribute('aria-label') || ''
  const voix = voixDisponible() && !!lu

  useLayoutEffect(() => {
    const d = dialogue.current
    const g = grande.current
    if (!d || !g) return
    // Copie du rendu KaTeX (tout en `em` : il grandit avec la taille du calque), muette pour les
    // lecteurs d'écran (la lecture en mots est écrite juste dessous).
    g.replaceChildren()
    if (katexEl) {
      const copie = katexEl.cloneNode(true) as HTMLElement
      copie.removeAttribute('role')
      copie.removeAttribute('aria-label')
      copie.removeAttribute('tabindex')
      g.appendChild(copie)
    }
    if (!d.open) d.showModal()
    boutonFermer.current?.focus({ preventScroll: true })
    // Ajuster la taille : grande (2,4 em), réduite si la formule est trop large (au moins 1,4 em ; au-delà
    // elle défile dans le calque).
    g.style.fontSize = '2.4em'
    const dispo = g.clientWidth
    const besoin = g.scrollWidth
    if (besoin > dispo && dispo > 0) g.style.fontSize = `${Math.max(1.4, (2.4 * dispo) / besoin - 0.02)}em`
    return () => {
      if (d.open) d.close()
    }
  }, [katexEl])

  const quitter = () => {
    seTaire()
    fermer()
    requestAnimationFrame(() => {
      if (formule.isConnected) formule.focus({ preventScroll: true })
    })
  }

  return createPortal(
    <dialog
      ref={dialogue}
      className="loupe-dialogue"
      aria-label="Formule agrandie"
      onCancel={(e) => {
        e.preventDefault()
        quitter()
      }}
      onKeyDown={(e) => {
        // Focus piégé : Tab tourne entre les boutons du calque (sans ressortir vers le navigateur).
        if (e.key !== 'Tab' || !dialogue.current) return
        const boutons = [...dialogue.current.querySelectorAll<HTMLElement>('button:not([disabled])')]
        const i = boutons.indexOf(document.activeElement as HTMLElement)
        if (e.shiftKey && i <= 0) {
          e.preventDefault()
          boutons[boutons.length - 1]?.focus()
        } else if (!e.shiftKey && i === boutons.length - 1) {
          e.preventDefault()
          boutons[0]?.focus()
        }
      }}
      onClick={(e) => {
        if (e.target === dialogue.current) {
          const b = dialogue.current.getBoundingClientRect()
          if (e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom) quitter()
        }
      }}
    >
      <div className="loupe-tete">
        <p className="loupe-titre">Formule agrandie</p>
        <button ref={boutonFermer} type="button" className="loupe-fermer" onClick={quitter}>
          Fermer
        </button>
      </div>
      <div ref={grande} className="loupe-grande" aria-hidden="true" />
      {lu && (
        <p className="loupe-lu">
          <b>Se lit&nbsp;:</b> «&nbsp;{lu}&nbsp;»
        </p>
      )}
      {voix && (
        <div className="loupe-actions">
          <button type="button" className="loupe-ecouter" onClick={() => dire(lu)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
            Écouter
          </button>
        </div>
      )}
    </dialog>,
    document.body,
  )
}
