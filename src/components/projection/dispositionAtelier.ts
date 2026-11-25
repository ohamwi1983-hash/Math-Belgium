/**
 * Mise en page d'un atelier (Web Component, Shadow DOM) sur une diapo du mode projection — retour du
 * professeur du 25/11/2026 : « une petite cadre au milieu de la diapo ». Les ateliers sont des colonnes
 * étroites et hautes (≈ 420–560 × 700–930 px : réglages, figure, calcul, curseurs empilés), posées sur
 * une diapo large (≈ 1 200 × 600 px logiques) : mis à l'échelle tels quels, ils tiennent rarement au-delà
 * de ×0,8. Aucun widget n'est modifié ; trois dispositions sont MESURÉES et la meilleure est gardée :
 *
 * - `pile` : l'atelier tel quel, son contenu réel (union des textes, figures et contrôles, pas la largeur
 *   de 760 px de l'hôte) tenu en largeur ET en hauteur, centré, zoom jusqu'à ×3 ;
 * - `cote` : la figure à gauche, le reste à droite. Même repérage que l'épinglage de la page
 *   (`InteractiveWidget`, `epinglerFigure`) : plus grande `<svg>`/`<canvas>`, remontée jusqu'à son plus
 *   grand ancêtre sans contrôle (le « bloc figure ») ; son parent devient une grille (feuille adoptée dans
 *   le Shadow DOM + attributs `data-proj-*`, rien d'autre) : bloc figure en colonne 1 sur toute la hauteur,
 *   les autres enfants dans l'ordre en colonne 2. Refusée si la grille ne prend pas (contrôle mal placé) ;
 * - `defile` : en dernier recours (atelier très haut sans disposition côte à côte possible), zoom calé
 *   pour que tout ce qui va jusqu'au bas de la figure tienne, le reste défile doucement dessous.
 *
 * Critère : la plus grande figure affichée (aire de la figure × zoom²) ; `defile` n'est retenue que si sa
 * figure est nettement plus grande (×1,6 en aire) que la meilleure disposition sans défilement.
 * `zoom` (et non `transform`) : texte net, et les widgets mesurent leurs pointeurs correctement.
 */

export type ModeDisposition = 'pile' | 'cote' | 'defile'

export interface Disposition {
  mode: ModeDisposition
  zoom: number
  /** Taille de la plus grande figure à l'écran, en px logiques de diapo. */
  figure: [number, number]
}

interface Mesure {
  /** Union du contenu visible, relative à l'hôte, en px CSS de l'atelier (non zoomés). */
  x: number
  y: number
  l: number
  h: number
  /** Plus grande figure (largeur, hauteur) et bas du bloc figure (relatif à l'hôte). */
  fig: [number, number]
  figBas: number
}

const LARGEUR_HOTE = 760
const ZOOM_MAX = 3
const MARGE = 6
const ATTR_COTE = 'data-proj-cote'
const ATTR_FIG = 'data-proj-fig'
const ATTR_LARGE = 'data-proj-large'
const CONTROLES = 'input,button,select,textarea'
const FEUILLE = `
[${ATTR_COTE}], :host([${ATTR_COTE}]) {
  display: grid !important; grid-template-columns: var(--proj-fig) var(--proj-col) !important;
  grid-template-rows: var(--proj-rangs) !important; column-gap: 28px !important; row-gap: var(--proj-gap, 8px) !important;
  align-items: start !important; justify-content: start !important; width: max-content !important; max-width: none !important;
}
[${ATTR_COTE}] > *, :host([${ATTR_COTE}]) > * { grid-column: 2 !important; min-width: 0 !important; max-width: 100% !important; margin-left: 0 !important; margin-right: 0 !important; }
[${ATTR_COTE}] > [${ATTR_FIG}], :host([${ATTR_COTE}]) > [${ATTR_FIG}] { grid-column: 1 !important; grid-row: 1 / -1 !important; width: var(--proj-fig) !important; max-width: none !important; }
[${ATTR_LARGE}] { max-width: none !important; }
`

const deuxImages = () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())))

function fondVisible(st: CSSStyleDeclaration): boolean {
  const bg = st.backgroundColor
  if (!bg || bg === 'transparent' || /rgba\([^)]*,\s*0\)$/.test(bg)) return false
  return !/^rgba?\(255,\s*255,\s*255(,\s*1)?\)$/.test(bg)
}

function bordVisible(st: CSSStyleDeclaration): boolean {
  return ['Top', 'Right', 'Bottom', 'Left'].some((c) => parseFloat(st.getPropertyValue(`border-${c.toLowerCase()}-width`)) > 0 && st.getPropertyValue(`border-${c.toLowerCase()}-style`) !== 'none')
}

/** Plus grande figure (svg / canvas ; à défaut, le plus grand tableau : atelier « tableau à double
 * entrée ») du Shadow DOM et son bloc (plus grand ancêtre sans contrôle). */
function trouverFigure(sr: ShadowRoot): { svg: Element; bloc: Element } | null {
  const assezGrand = (s: Element) => {
    const r = s.getBoundingClientRect()
    return r.width > 60 && r.height > 40
  }
  let figures = [...sr.querySelectorAll('svg, canvas')].filter((s) => !s.parentElement?.closest('svg') && assezGrand(s))
  if (!figures.length) figures = [...sr.querySelectorAll('table')].filter((t) => !t.parentElement?.closest('table') && !t.querySelector(CONTROLES) && assezGrand(t))
  if (!figures.length) return null
  figures.sort((a, b) => {
    const ra = a.getBoundingClientRect()
    const rb = b.getBoundingClientRect()
    return rb.width * rb.height - ra.width * ra.height
  })
  let bloc: Element = figures[0]
  for (;;) {
    const parent: Element | null = bloc.parentElement
    if (!parent || parent.querySelector(CONTROLES)) break
    bloc = parent
  }
  return { svg: figures[0], bloc }
}

/** Union du contenu VISIBLE (textes au plus près, figures, contrôles, encadrés colorés) d'un sous-arbre. */
function union(racine: ParentNode, ref: DOMRect, k: number): { x: number; y: number; l: number; h: number } | null {
  let x0 = Infinity
  let y0 = Infinity
  let x1 = -Infinity
  let y1 = -Infinity
  const ajouter = (r: DOMRect) => {
    if (r.width < 0.5 || r.height < 0.5) return
    x0 = Math.min(x0, r.left)
    y0 = Math.min(y0, r.top)
    x1 = Math.max(x1, r.right)
    y1 = Math.max(y1, r.bottom)
  }
  const plage = document.createRange()
  const parcourir = (n: ParentNode) => {
    for (const enfant of Array.from(n.childNodes)) {
      if (enfant.nodeType === Node.TEXT_NODE) {
        if (!enfant.textContent?.trim()) continue
        plage.selectNodeContents(enfant)
        ajouter(plage.getBoundingClientRect())
        continue
      }
      if (!(enfant instanceof Element)) continue
      const tag = enfant.tagName.toLowerCase()
      if (tag === 'style' || tag === 'script' || tag === 'template') continue
      const st = getComputedStyle(enfant)
      if (st.display === 'none' || st.visibility === 'hidden') continue
      if (/^(svg|canvas|img|video|input|select|button|textarea)$/.test(tag)) {
        ajouter(enfant.getBoundingClientRect())
        continue
      }
      if (fondVisible(st) || bordVisible(st)) ajouter(enfant.getBoundingClientRect())
      parcourir(enfant)
      if (enfant.shadowRoot) parcourir(enfant.shadowRoot)
    }
  }
  parcourir(racine)
  if (!Number.isFinite(x0)) return null
  return { x: (x0 - ref.left) / k, y: (y0 - ref.top) / k, l: (x1 - x0) / k, h: (y1 - y0) / k }
}

function enfantsDisposes(pile: ParentNode): Element[] {
  return Array.from(pile.children).filter((c) => !/^(STYLE|SCRIPT|TEMPLATE)$/.test(c.tagName) && getComputedStyle(c).display !== 'none')
}

/**
 * Pose la meilleure disposition et la tient à jour (atelier qui change de taille, diapo passée en plein
 * écran). `zone` : `.diapo-atelier` (position relative) ; `place` : enveloppe positionnée (non zoomée) ;
 * `hote` : élément zoomé qui contient le widget. `surChoix` : disposition retenue (mesures, tests).
 */
export function disposerAtelier(zone: HTMLElement, place: HTMLElement, hote: HTMLElement, surChoix?: (d: Disposition) => void): () => void {
  let vivant = true
  let choix: { mode: ModeDisposition; colonne: number; zoom: number; mesure: Mesure } | null = null
  let enCours = false
  let relancer = false
  let raf = 0
  let feuillePosee: ShadowRoot | null = null
  const nettoyages: (() => void)[] = []

  const widget = () => hote.querySelector('.widget-host > *') as HTMLElement | null
  const echelleScene = () => {
    const r = zone.getBoundingClientRect()
    return zone.offsetWidth ? r.width / zone.offsetWidth : 1
  }
  const zoomActuel = () => parseFloat(hote.style.zoom || '1') || 1

  const poserFeuille = (sr: ShadowRoot) => {
    if (feuillePosee === sr) return
    feuillePosee = sr
    if ('adoptedStyleSheets' in sr && typeof CSSStyleSheet !== 'undefined' && 'replaceSync' in CSSStyleSheet.prototype) {
      const f = new CSSStyleSheet()
      f.replaceSync(FEUILLE)
      sr.adoptedStyleSheets = [...sr.adoptedStyleSheets, f]
    } else {
      const s = document.createElement('style')
      s.textContent = FEUILLE
      sr.appendChild(s)
    }
  }

  const retirerCote = (el: HTMLElement) => {
    const sr = el.shadowRoot
    const noeuds: Element[] = [el, ...(sr ? Array.from(sr.querySelectorAll(`[${ATTR_COTE}], [${ATTR_FIG}], [${ATTR_LARGE}]`)) : [])]
    for (const n of noeuds) {
      n.removeAttribute(ATTR_COTE)
      n.removeAttribute(ATTR_FIG)
      n.removeAttribute(ATTR_LARGE)
      for (const p of ['--proj-fig', '--proj-col', '--proj-rangs', '--proj-gap']) (n as HTMLElement).style?.removeProperty(p)
    }
  }

  /** Pose la grille « figure à gauche » ; faux si la structure ne s'y prête pas. */
  const poserCote = (el: HTMLElement, colonne: number, largeurFigure?: number): boolean => {
    const sr = el.shadowRoot
    if (!sr) return false
    const f = trouverFigure(sr)
    if (!f) return false
    const pile: Element = f.bloc.parentElement ?? el
    if (pile !== el && f.bloc.parentNode !== pile) return false
    if (getComputedStyle(pile).display === 'contents') return false
    const autres = enfantsDisposes(pile === el ? sr : pile).filter((c) => c !== f.bloc)
    if (autres.length === 0) return false
    const st = getComputedStyle(pile)
    const ecart = /flex|grid/.test(st.display) ? parseFloat(st.rowGap) || 0 : 0
    const ref = hote.getBoundingClientRect()
    const k = echelleScene() * zoomActuel()
    const uf = union(f.bloc, ref, k)
    // Largeur de la colonne de la figure : son contenu réel (pas la largeur d'un bloc étiré à 760 px),
    // plus les marges intérieures et bordures du bloc (sinon, en `border-box`, la figure serait rognée).
    const sb = getComputedStyle(f.bloc)
    const cadre = ['padding-left', 'padding-right', 'border-left-width', 'border-right-width'].reduce((n, p) => n + (parseFloat(sb.getPropertyValue(p)) || 0), 0)
    const lf = largeurFigure ?? Math.ceil(Math.max(uf?.l ?? 0, f.svg.getBoundingClientRect().width / k) + cadre + 2)
    poserFeuille(sr)
    pile.setAttribute(ATTR_COTE, '')
    f.bloc.setAttribute(ATTR_FIG, '')
    const ps = (pile as HTMLElement).style
    ps.setProperty('--proj-fig', `${lf}px`)
    ps.setProperty('--proj-col', `${colonne}px`)
    ps.setProperty('--proj-rangs', `repeat(${autres.length}, auto) 1fr`)
    ps.setProperty('--proj-gap', `${Math.max(ecart, 8)}px`)
    if (pile !== el) for (let a = pile.parentElement; a; a = a.parentElement) a.setAttribute(ATTR_LARGE, '')
    return true
  }

  const mesurer = (el: HTMLElement): Mesure | null => {
    const sr = el.shadowRoot
    if (!sr) return null
    const ref = hote.getBoundingClientRect()
    const k = echelleScene() * zoomActuel()
    const u = union(sr, ref, k)
    if (!u) return null
    const f = trouverFigure(sr)
    let fig: [number, number] = [0, 0]
    let figBas = u.y + u.h
    if (f) {
      const r = f.svg.getBoundingClientRect()
      fig = [r.width / k, r.height / k]
      // Bas du bloc figure… et du premier réglage qui la suit (le curseur placé sous la figure doit rester
      // visible avec elle en disposition `defile`) : on remonte du contrôle jusqu'à l'enfant de la pile.
      let bas = f.bloc.getBoundingClientRect().bottom
      const suivant = [...sr.querySelectorAll(CONTROLES)].find((c) => f.bloc.compareDocumentPosition(c) & Node.DOCUMENT_POSITION_FOLLOWING)
      if (suivant) {
        let ligne: Element = suivant
        while (ligne.parentElement && ligne.parentElement !== f.bloc.parentElement && !ligne.parentElement.contains(f.bloc)) ligne = ligne.parentElement
        bas = Math.max(bas, ligne.getBoundingClientRect().bottom)
      }
      figBas = (bas - ref.top) / k
    }
    return { ...u, fig, figBas }
  }

  /** La grille a-t-elle pris : bloc figure à gauche, tous les autres enfants à sa droite ? */
  const coteValide = (el: HTMLElement): boolean => {
    const sr = el.shadowRoot
    const bloc = sr?.querySelector(`[${ATTR_FIG}]`)
    if (!sr || !bloc) return false
    const pile = el.hasAttribute(ATTR_COTE) ? sr : bloc.parentElement
    if (!pile) return false
    const rf = bloc.getBoundingClientRect()
    return enfantsDisposes(pile)
      .filter((c) => c !== bloc)
      .every((c) => {
        const r = c.getBoundingClientRect()
        return r.width < 1 || r.left >= rf.right - 2
      })
  }

  const zoomPour = (m: Mesure, mode: ModeDisposition) => {
    const lz = zone.clientWidth - 2 * MARGE
    const hz = zone.clientHeight - 2 * MARGE
    if (mode === 'defile') return Math.min(ZOOM_MAX, lz / m.l, hz / Math.max(1, m.figBas - m.y + 8))
    return Math.min(ZOOM_MAX, lz / m.l, hz / m.h)
  }

  const placer = () => {
    if (!choix) return
    const { mesure: m, zoom: z, mode } = choix
    const lz = zone.clientWidth
    const hz = zone.clientHeight
    const tient = m.h * z <= hz - 2 * MARGE + 1
    hote.style.zoom = String(z)
    place.style.left = `${Math.round((lz - m.l * z) / 2 - m.x * z)}px`
    place.style.top = `${Math.round((tient ? (hz - m.h * z) / 2 : MARGE) - m.y * z)}px`
    zone.dataset.disposition = mode
    zone.dataset.zoom = z.toFixed(2)
    zone.classList.toggle('defile', !tient)
    if (tient) zone.scrollTop = 0
    marquerFin()
    place.style.opacity = ''
  }

  /** `data-fin` : la zone qui défile est arrivée en bas (l'indicateur « la suite » disparaît). */
  const marquerFin = () => {
    const fin = !zone.classList.contains('defile') || zone.scrollTop + zone.clientHeight >= zone.scrollHeight - 4
    if (fin) zone.dataset.fin = ''
    else delete zone.dataset.fin
  }

  const choisir = async () => {
    const el = widget()
    if (!el?.shadowRoot || !zone.clientWidth || !zone.clientHeight) return
    if (enCours) {
      relancer = true
      return
    }
    enCours = true
    try {
      place.style.opacity = '0'
      retirerCote(el)
      hote.style.zoom = '1'
      hote.style.width = `${LARGEUR_HOTE}px`
      await deuxImages()
      if (!vivant) return
      const pile = mesurer(el)
      if (!pile) return
      const candidats: { mode: ModeDisposition; colonne: number; zoom: number; mesure: Mesure; score: number }[] = []
      const zp = zoomPour(pile, 'pile')
      candidats.push({ mode: 'pile', colonne: 0, zoom: zp, mesure: pile, score: pile.fig[0] * pile.fig[1] * zp * zp })
      for (const colonne of [340, 440, 560]) {
        if (!poserCote(el, colonne)) break
        hote.style.width = '2400px'
        await deuxImages()
        if (!vivant) return
        const m = mesurer(el)
        if (m && coteValide(el) && m.h < pile.h * 0.92) {
          const z = zoomPour(m, 'cote')
          candidats.push({ mode: 'cote', colonne, zoom: z, mesure: m, score: m.fig[0] * m.fig[1] * z * z })
        }
        retirerCote(el)
        hote.style.width = `${LARGEUR_HOTE}px`
      }
      // La figure à côté n'est retenue que si elle gagne vraiment (≥ 15 % d'aire) : sinon l'atelier reste tel quel.
      let meilleur = candidats.reduce((a, c) => (c.score > a.score * (c.mode === 'cote' && a.mode === 'pile' ? 1.15 : 1.02) ? c : a))
      const zd = zoomPour(pile, 'defile')
      const scoreDefile = pile.fig[0] * pile.fig[1] * zd * zd
      if (pile.h * zd > zone.clientHeight && scoreDefile > meilleur.score * 1.6 && pile.figBas > pile.y) {
        meilleur = { mode: 'defile', colonne: 0, zoom: zd, mesure: pile, score: scoreDefile }
      }
      if (meilleur.mode === 'cote') {
        poserCote(el, meilleur.colonne)
        hote.style.width = '2400px'
        await deuxImages()
        if (!vivant) return
        meilleur.mesure = mesurer(el) ?? meilleur.mesure
        meilleur.zoom = zoomPour(meilleur.mesure, 'cote')
      }
      choix = { mode: meilleur.mode, colonne: meilleur.colonne, zoom: Math.round(meilleur.zoom * 100) / 100, mesure: meilleur.mesure }
      placer()
      surChoix?.({ mode: choix.mode, zoom: choix.zoom, figure: [Math.round(choix.mesure.fig[0] * choix.zoom), Math.round(choix.mesure.fig[1] * choix.zoom)] })
    } finally {
      enCours = false
      place.style.opacity = ''
      if (relancer && vivant) {
        relancer = false
        void choisir()
      }
    }
  }

  /** L'atelier a changé de taille (panneau ouvert, DOM reconstruit) : même disposition, zoom recalculé. */
  const reajuster = () => {
    raf = 0
    const el = widget()
    if (!choix || !el || enCours) return
    if (choix.mode === 'cote' && !el.shadowRoot?.querySelector(`[${ATTR_FIG}]`) && !poserCote(el, choix.colonne)) {
      void choisir()
      return
    }
    const m = mesurer(el)
    if (!m) return
    const a = choix.mesure
    if (Math.abs(m.l - a.l) < 3 && Math.abs(m.h - a.h) < 3 && Math.abs(m.x - a.x) < 3 && Math.abs(m.y - a.y) < 3) return
    choix = { ...choix, mesure: m, zoom: Math.round(zoomPour(m, choix.mode) * 100) / 100 }
    placer()
  }
  const planifier = () => {
    if (!raf) raf = requestAnimationFrame(reajuster)
  }

  // Démarrage : attendre le Shadow DOM du widget (module chargé à la demande) et son premier rendu.
  let essais = 0
  const demarrer = async () => {
    if (!vivant) return
    const el = widget()
    const sr = el?.shadowRoot
    if (!el || !sr || !sr.querySelector('*:not(style)')) {
      if (essais++ < 100) window.setTimeout(() => void demarrer(), 50)
      return
    }
    await document.fonts?.ready
    if (!vivant) return
    await choisir()
    // Zone redimensionnée (plein écran de l'atelier) : nouvelle disposition. Le premier rappel (immédiat) est ignoré.
    let premier = true
    const roZone = new ResizeObserver(() => {
      if (premier) {
        premier = false
        return
      }
      void choisir()
    })
    roZone.observe(zone)
    const roWidget = new ResizeObserver(planifier)
    roWidget.observe(el)
    const mo = new MutationObserver(planifier)
    mo.observe(sr, { childList: true, subtree: true })
    zone.addEventListener('scroll', marquerFin, { passive: true })
    nettoyages.push(() => {
      roZone.disconnect()
      roWidget.disconnect()
      mo.disconnect()
      zone.removeEventListener('scroll', marquerFin)
    })
  }
  place.style.opacity = '0'
  void demarrer()

  return () => {
    vivant = false
    if (raf) cancelAnimationFrame(raf)
    for (const n of nettoyages) n()
  }
}
