import { useCallback, useEffect, useRef, useState } from 'react'
import { MathInline } from '../Math'
import type { Role } from '../../lib/projection/diapos'
import { Calculatrice } from './Calculatrice'
import { useInstrument } from './instruments'
import type { EtatCompas, EtatEquerre, MagasinInstruments } from './instruments'
import { EPAISSEURS } from './BarreOutils'
import type { OutilsLocaux } from './BarreOutils'
import { Pictogramme } from './Pictogrammes'
import { HAUTEUR, LARGEUR } from './Scene'
import type { Arc, ElementAnnotation, Epingle, FondBlanc, MessageProjection, Projection, Trait } from './useProjection'

/** Unité commune du quadrillage, des graduations de l'équerre et du rayon du compas : 1 carreau = 40 px logiques
 * (32 carreaux sur la largeur de la diapo, 18 sur la hauteur). */
export const CARREAU = 40
/** Demi-hypoténuse de l'équerre (6,5 carreaux) : l'équerre fait 13 carreaux de long, 6,5 de haut. */
const DEMI = 260
/** Distance (px logiques) sous laquelle un glisser commencé près d'un bord de l'équerre trace le long de ce bord
 * (souris, stylet) ; au doigt : `AIMANT_DOIGT`. Jamais moins de 10 px (souris) / 22 px (doigt) RÉELS à l'écran (vue
 * réduite du professeur), sans dépasser `AIMANT_MAX`. */
const AIMANT = 12
const AIMANT_DOIGT = 20
const AIMANT_MAX = 30
/** Graduations de l'hypoténuse : demi-carreaux ; une extrémité de segment s'y accroche à moins de 4 px. */
const DEMI_CARREAU = 20
const CRAN_GRADUATION = 4
const POIGNEE: P = [0, -DEMI + 52]
const DEG = Math.PI / 180
/** Clé des annotations de l'écran blanc (les diapos sont numérotées à partir de 0). */
const PAGE_BLANCHE = -1

type P = [number, number]

const arrondi = (v: number) => Math.round(v * 10) / 10
const nouvelId = (id: string) => `${id}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
const borne = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

/** Coordonnées dans le repère de l'équerre (origine au 0 de l'hypoténuse, sommet vers −y). */
function versEquerre(eq: EtatEquerre, [x, y]: P): P {
  const t = -eq.angle * DEG
  const dx = x - eq.x
  const dy = y - eq.y
  return [dx * Math.cos(t) - dy * Math.sin(t), dx * Math.sin(t) + dy * Math.cos(t)]
}
function depuisEquerre(eq: EtatEquerre, [u, v]: P): P {
  const t = eq.angle * DEG
  return [arrondi(eq.x + u * Math.cos(t) - v * Math.sin(t)), arrondi(eq.y + u * Math.sin(t) + v * Math.cos(t))]
}
const BORDS: [P, P][] = [
  [[-DEMI, 0], [DEMI, 0]],
  [[-DEMI, 0], [0, -DEMI]],
  [[DEMI, 0], [0, -DEMI]],
]
function projeter(p: P, a: P, b: P): { q: P; d: number } {
  const [ux, uy] = [b[0] - a[0], b[1] - a[1]]
  const t = borne(((p[0] - a[0]) * ux + (p[1] - a[1]) * uy) / (ux * ux + uy * uy), 0, 1)
  const q: P = [a[0] + t * ux, a[1] + t * uy]
  return { q, d: Math.hypot(p[0] - q[0], p[1] - q[1]) }
}
const dansEquerre = ([u, v]: P) => v <= 0 && v >= -DEMI && Math.abs(u) <= DEMI + v
/** Bord le plus proche (indice dans `BORDS` : 0 = hypoténuse, 1 et 2 = côtés de l'angle droit) et sa distance. */
function bordLePlusProche(l: P): { i: number; d: number } {
  let meilleur = { i: 0, d: Infinity }
  BORDS.forEach(([a, b], i) => {
    const { d } = projeter(l, a, b)
    if (d < meilleur.d) meilleur = { i, d }
  })
  return meilleur
}
/** Seuil « près d'un bord » en px logiques, selon le pointeur et l'échelle d'affichage. */
function seuilBord(pointeur: string, echelle: number): number {
  const k = echelle > 0 ? echelle : 1
  return pointeur === 'touch' ? Math.min(AIMANT_MAX, Math.max(AIMANT_DOIGT, 22 / k)) : Math.min(AIMANT_MAX, Math.max(AIMANT, 10 / k))
}
/** Droite passant par p et q, coupée aux bords de la diapo (Liang–Barsky sur une droite infinie). */
function droiteDansDiapo(p: P, q: P): P[] {
  const [dx, dy] = [q[0] - p[0], q[1] - p[1]]
  let t0 = -Infinity
  let t1 = Infinity
  for (const [d, v, max] of [
    [dx, p[0], LARGEUR],
    [dy, p[1], HAUTEUR],
  ] as const) {
    if (Math.abs(d) < 1e-9) continue
    const [a, b] = [-v / d, (max - v) / d]
    t0 = Math.max(t0, Math.min(a, b))
    t1 = Math.min(t1, Math.max(a, b))
  }
  return [
    [arrondi(p[0] + t0 * dx), arrondi(p[1] + t0 * dy)],
    [arrondi(p[0] + t1 * dx), arrondi(p[1] + t1 * dy)],
  ]
}
/** Abscisse sur l'hypoténuse, accrochée à la graduation (demi-carreau) la plus proche à moins de 4 px. */
function surGraduation(u: number): number {
  const g = Math.round(u / DEMI_CARREAU) * DEMI_CARREAU
  return Math.abs(u - g) <= CRAN_GRADUATION ? g : u
}

/** Angle affiché (sens mathématique, ]−180 ; 180]) avec cran sur 0°, 30°, 45°, 60°, 90° et leurs multiples. */
function angleAffiche(rotation: number): number {
  let a = -rotation
  a = ((((a + 180) % 360) + 360) % 360) - 180
  return a === -180 ? 180 : a
}
function cranRotation(rotation: number): number {
  const a = angleAffiche(rotation)
  for (let c = -180; c <= 180; c += 15) {
    if ((c % 30 === 0 || c % 45 === 0) && Math.abs(a - c) <= 3) return -c
  }
  return -Math.round(a * 10) / 10
}
const texteNombre = (v: number) => String(Math.round(v * 10) / 10).replace('.', ',').replace('-', '−')

/** Longueur dans l'unité commune (compas, graduation de l'équerre) : « 6 carreaux » sur quadrillage / repère, sinon « 6 u ». */
function texteLongueur(px: number, grille: boolean) {
  const u = px / CARREAU
  return `${texteNombre(u)} ${grille ? (Math.round(u * 10) / 10 <= 1 ? 'carreau' : 'carreaux') : 'u'}`
}
const texteRayon = (r: number, grille: boolean) => `r = ${texteLongueur(r, grille)}`

type Geste =
  | { g: 'trait'; trait: Trait }
  /** Tracé le long d'un bord de l'équerre (repère de l'équerre figé au départ ; `ajoute` après 4 px réels de mouvement). */
  | { g: 'regle'; trait: Trait; eq: EtatEquerre; a: P; b: P; depart: P; p0: P; hyp: boolean; droite: boolean; ajoute: boolean }
  | { g: 'rayon' }
  | { g: 'arc'; arc: Arc; dernier: number; ajoute: boolean }
  | { g: 'deplacer'; dx: number; dy: number }
  | { g: 'tourner' }
  | { g: 'epingle'; el: Epingle; dx: number; dy: number }

/**
 * Tableau du mode projection, par-dessus la diapo, en coordonnées de la diapo (1 280 × 720) :
 * - deux canvas : surligneur (dessous, `mix-blend-mode: multiply` — le texte reste lisible) et stylo
 *   (traits, arcs du compas) ; la gomme efface les deux ;
 * - annotations GARDÉES PAR DIAPO (en mémoire de la page seulement : rien n'est enregistré ni envoyé hors
 *   du navigateur), retrouvées en revenant sur la diapo ; l'écran blanc a sa propre page ; annuler (bouton, Ctrl/Cmd+Z) retire le dernier
 *   élément de la diapo courante ; « Tout effacer » vaut pour la diapo courante ;
 * - équerre Aristo : glisser près d'un bord = tracer le long de ce bord (segment ou droite, couleur et épaisseur
 *   du stylo, sans l'activer ; repère et longueur sur l'hypoténuse graduée), ailleurs = déplacer ; poignée =
 *   tourner (cran), sauf rotation verrouillée ; compas, calculatrice, résultats épinglés ;
 * - tout est envoyé à l'autre fenêtre (deux écrans) : ce qui est fait d'un côté apparaît de l'autre.
 */
export function Annotations({
  projection,
  magasin,
  outils,
  echelle,
  role,
  grille,
}: {
  projection: Projection
  magasin: MagasinInstruments
  outils: OutilsLocaux
  echelle: number
  role: Role
  grille: boolean
}) {
  const canvasFluo = useRef<HTMLCanvasElement>(null)
  const canvasStylo = useRef<HTMLCanvasElement>(null)
  const racine = useRef<HTMLDivElement>(null)
  const parDiapo = useRef(new Map<number, ElementAnnotation[]>())
  const [, setVersion] = useState(0)
  const { etat, envoyer, ecouter, id } = projection
  // L'écran blanc est une page à part (clé −1) : ce qu'on y écrit ne salit pas la diapo, et inversement.
  const index = etat.blanc ? PAGE_BLANCHE : etat.index
  const indexRef = useRef(index)
  indexRef.current = index
  const outilsRef = useRef(outils)
  outilsRef.current = outils
  const grilleRef = useRef(grille)
  grilleRef.current = grille
  const echelleRef = useRef(echelle)
  echelleRef.current = echelle
  const geste = useRef<Geste | null>(null)
  const [tourne, setTourne] = useState(false)
  const equerre = useInstrument(magasin, (e) => e.equerre)
  const compas = useInstrument(magasin, (e) => e.compas)
  const actif = outils.stylo

  const liste = useCallback((i = indexRef.current) => {
    let l = parDiapo.current.get(i)
    if (!l) {
      l = []
      parDiapo.current.set(i, l)
    }
    return l
  }, [])

  const dessiner = useCallback(() => {
    const cf = canvasFluo.current
    const cs = canvasStylo.current
    const xf = cf?.getContext('2d')
    const xs = cs?.getContext('2d')
    if (!cf || !cs || !xf || !xs) return
    const k = cs.width / LARGEUR
    for (const [c, x] of [
      [cf, xf],
      [cs, xs],
    ] as const) {
      x.setTransform(1, 0, 0, 1, 0, 0)
      x.clearRect(0, 0, c.width, c.height)
      x.setTransform(k, 0, 0, k, 0, 0)
      x.lineJoin = 'round'
    }
    const tracer = (x: CanvasRenderingContext2D, el: Trait | Arc) => {
      x.beginPath()
      if (el.genre === 'arc') {
        if (Math.abs(el.a1 - el.a0) >= 2 * Math.PI) x.arc(el.cx, el.cy, el.r, 0, 2 * Math.PI)
        else x.arc(el.cx, el.cy, el.r, el.a0, el.a1, el.a1 < el.a0)
      } else {
        el.points.forEach(([px, py], i) => (i === 0 ? x.moveTo(px, py) : x.lineTo(px, py)))
        if (el.points.length === 1) x.lineTo(el.points[0][0] + 0.1, el.points[0][1])
      }
      x.stroke()
    }
    for (const el of liste()) {
      if (el.genre === 'epingle') continue
      if (el.genre !== 'arc' && el.gomme) {
        for (const x of [xf, xs]) {
          x.globalCompositeOperation = 'destination-out'
          x.strokeStyle = '#000'
          x.lineCap = 'round'
          x.lineWidth = el.epaisseur ?? 44
          tracer(x, el)
        }
      } else if (el.genre !== 'arc' && el.fluo) {
        xf.globalCompositeOperation = 'multiply'
        xf.strokeStyle = el.couleur
        xf.lineCap = 'butt'
        xf.lineWidth = el.epaisseur ?? 22
        tracer(xf, el)
      } else {
        xs.globalCompositeOperation = 'source-over'
        xs.strokeStyle = el.couleur
        xs.lineCap = 'round'
        xs.lineWidth = el.epaisseur ?? 5
        tracer(xs, el)
      }
    }
    xf.globalCompositeOperation = 'source-over'
    xs.globalCompositeOperation = 'source-over'
  }, [liste])

  const rafraichir = useCallback(
    (i: number, epingles: boolean) => {
      if (i !== indexRef.current) return
      dessiner()
      if (epingles) setVersion((v) => v + 1)
    },
    [dessiner],
  )

  // Résolution des canvas = taille réelle à l'écran (net à toute échelle).
  useEffect(() => {
    if (!echelle) return
    const dpr = window.devicePixelRatio || 1
    for (const c of [canvasFluo.current, canvasStylo.current]) {
      if (!c) continue
      c.width = Math.round(LARGEUR * echelle * dpr)
      c.height = Math.round(HAUTEUR * echelle * dpr)
    }
    dessiner()
  }, [echelle, dessiner])

  // Changement de diapo : on montre les annotations de la nouvelle diapo (gardées en mémoire).
  useEffect(() => {
    geste.current = null
    dessiner()
    setVersion((v) => v + 1)
  }, [index, dessiner])

  // ---------- actions locales (appliquées puis envoyées à l'autre fenêtre) ----------
  const ajouter = useCallback(
    (el: ElementAnnotation) => {
      liste().push(el)
      envoyer({ type: 'element', de: id, index: indexRef.current, element: el })
      rafraichir(indexRef.current, el.genre === 'epingle')
    },
    [liste, envoyer, id, rafraichir],
  )
  const remplacer = useCallback(
    (el: ElementAnnotation) => {
      const l = liste()
      const i = l.findIndex((x) => x.id === el.id)
      if (i >= 0) l[i] = el
      else l.push(el)
      envoyer({ type: 'element', de: id, index: indexRef.current, element: el })
      rafraichir(indexRef.current, el.genre === 'epingle')
    },
    [liste, envoyer, id, rafraichir],
  )
  const retirer = useCallback(
    (idEl: string) => {
      const l = liste()
      const i = l.findIndex((x) => x.id === idEl)
      if (i < 0) return
      l.splice(i, 1)
      envoyer({ type: 'retirer', de: id, index: indexRef.current, id: idEl })
      rafraichir(indexRef.current, true)
    },
    [liste, envoyer, id, rafraichir],
  )

  useEffect(() => {
    const annuler = () => {
      const l = liste()
      if (l.length) retirer(l[l.length - 1].id)
    }
    const effacer = () => {
      liste().length = 0
      envoyer({ type: 'effacer', de: id, index: indexRef.current })
      rafraichir(indexRef.current, true)
    }
    const surTouche = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.shiftKey || e.altKey || e.key.toLowerCase() !== 'z') return
      const chemin = e.composedPath() as HTMLElement[]
      if (chemin.some((n) => n instanceof HTMLElement && n.matches?.('input, textarea, select, [contenteditable="true"]'))) return
      e.preventDefault()
      annuler()
    }
    window.addEventListener('projection:annuler', annuler)
    window.addEventListener('projection:effacer', effacer)
    window.addEventListener('keydown', surTouche)
    return () => {
      window.removeEventListener('projection:annuler', annuler)
      window.removeEventListener('projection:effacer', effacer)
      window.removeEventListener('keydown', surTouche)
    }
  }, [liste, retirer, envoyer, id, rafraichir])

  // ---------- messages de l'autre fenêtre ----------
  useEffect(
    () =>
      ecouter((m: MessageProjection) => {
        switch (m.type) {
          case 'demande': {
            const toutes = [...parDiapo.current].filter(([, l]) => l.length > 0)
            if (toutes.length) envoyer({ type: 'annotations', de: id, toutes })
            return
          }
          case 'annotations':
            parDiapo.current = new Map(m.toutes.map(([i, l]) => [i, l.map((el) => (el.genre === undefined || el.genre === 'trait' ? { ...el, points: [...el.points] } : { ...el }))]))
            rafraichir(indexRef.current, true)
            return
          case 'trait':
            liste(m.index).push({ ...m.trait, points: [...m.trait.points] })
            rafraichir(m.index, false)
            return
          case 'point': {
            const t = liste(m.index).find((x) => x.id === m.id)
            if (t && (t.genre === undefined || t.genre === 'trait')) t.points.push([m.x, m.y])
            rafraichir(m.index, false)
            return
          }
          case 'effacer':
            liste(m.index).length = 0
            rafraichir(m.index, true)
            return
          case 'element': {
            const l = liste(m.index)
            const i = l.findIndex((x) => x.id === m.element.id)
            if (i >= 0) l[i] = m.element
            else l.push(m.element)
            rafraichir(m.index, m.element.genre === 'epingle')
            return
          }
          case 'retirer': {
            const l = liste(m.index)
            const i = l.findIndex((x) => x.id === m.id)
            if (i >= 0) l.splice(i, 1)
            rafraichir(m.index, true)
            return
          }
        }
      }),
    [ecouter, envoyer, id, liste, rafraichir],
  )

  // Compas quitté ici (autre outil, stylo rangé) : il disparaît aussi de l'autre écran.
  const compasActif = actif && outils.outil === 'compas'
  const compasAvant = useRef(compasActif)
  useEffect(() => {
    if (compasAvant.current && !compasActif) magasin.compas(null)
    compasAvant.current = compasActif
  }, [compasActif, magasin])

  // ---------- gestes au pointeur (souris, doigt, stylet : pointer events) ----------
  const versDiapo = useCallback((cx: number, cy: number): P => {
    const r = racine.current!.getBoundingClientRect()
    return [arrondi(((cx - r.left) / r.width) * LARGEUR), arrondi(((cy - r.top) / r.height) * HAUTEUR)]
  }, [])

  const continuer = (p: P) => {
    const g = geste.current
    if (!g) return
    const o = outilsRef.current
    switch (g.g) {
      case 'trait':
        g.trait.points.push(p)
        envoyer({ type: 'point', de: id, index: indexRef.current, id: g.trait.id, x: p[0], y: p[1] })
        dessiner()
        return
      case 'regle': {
        if (!g.ajoute && Math.hypot(p[0] - g.p0[0], p[1] - g.p0[1]) * Math.max(echelleRef.current, 0.01) < 4) return
        let { q } = projeter(versEquerre(g.eq, p), g.a, g.b)
        if (g.hyp && !g.droite) q = [surGraduation(q[0]), 0]
        const points: P[] = g.droite
          ? droiteDansDiapo(depuisEquerre(g.eq, g.a), depuisEquerre(g.eq, g.b))
          : [depuisEquerre(g.eq, g.depart), depuisEquerre(g.eq, q)]
        g.trait = { ...g.trait, points }
        if (!g.ajoute) {
          g.ajoute = true
          ajouter(g.trait)
        } else remplacer(g.trait)
        if (g.hyp && !g.droite) magasin.equerre({ mesure: { u0: g.depart[0], u1: q[0], couleur: g.trait.couleur } })
        return
      }
      case 'rayon': {
        const c = magasin.lire().compas
        if (!c) return
        const d = Math.hypot(p[0] - c.cx, p[1] - c.cy)
        let r = d
        if (grilleRef.current) {
          const demi = Math.round((d / CARREAU) * 2) / 2
          if (Math.abs(d - demi * CARREAU) <= 4) r = demi * CARREAU
        }
        magasin.compas({ ...c, r: arrondi(r), angle: d > 0.5 ? Math.atan2(p[1] - c.cy, p[0] - c.cx) : c.angle })
        return
      }
      case 'arc': {
        const c = magasin.lire().compas
        if (!c) return
        const a = Math.atan2(p[1] - c.cy, p[0] - c.cx)
        let delta = a - g.dernier
        if (delta > Math.PI) delta -= 2 * Math.PI
        if (delta < -Math.PI) delta += 2 * Math.PI
        g.dernier = a
        g.arc = { ...g.arc, a1: g.arc.a1 + delta, couleur: o.couleur }
        if (!g.ajoute && Math.abs(g.arc.a1 - g.arc.a0) > 0.01) {
          g.ajoute = true
          ajouter(g.arc)
        } else if (g.ajoute) remplacer(g.arc)
        magasin.compas({ ...c, angle: a })
        return
      }
      case 'deplacer':
        magasin.equerre({ x: arrondi(borne(p[0] - g.dx, 0, LARGEUR)), y: arrondi(borne(p[1] - g.dy, 0, HAUTEUR)) })
        return
      case 'tourner': {
        const eq = magasin.lire().equerre
        const brut = (Math.atan2(p[1] - eq.y, p[0] - eq.x) / DEG + 90) % 360
        magasin.equerre({ angle: cranRotation(brut) })
        return
      }
      case 'epingle':
        g.el = { ...g.el, x: arrondi(borne(p[0] - g.dx, 0, LARGEUR - 40)), y: arrondi(borne(p[1] - g.dy, 0, HAUTEUR - 30)) }
        remplacer(g.el)
        return
    }
  }

  const terminer = () => {
    const g = geste.current
    geste.current = null
    if (!g) return
    if (g.g === 'rayon') {
      const c = magasin.lire().compas
      if (c) magasin.compas(c.r < 8 ? null : { ...c, phase: 'arc' })
    }
    if (g.g === 'tourner') setTourne(false)
    if (g.g === 'regle' && g.ajoute) {
      if (g.hyp && !g.droite) magasin.equerre({ mesure: null })
      const [[x0, y0], [x1, y1]] = g.trait.points
      // Glisser perpendiculaire au bord : point isolé, retiré (un simple appui ne laisse rien non plus).
      if (Math.hypot(x1 - x0, y1 - y0) < 1) retirer(g.trait.id)
    }
  }

  const commencer = (e: React.PointerEvent, g: Geste) => {
    e.preventDefault()
    e.stopPropagation()
    geste.current = g
    const pid = e.pointerId
    const bouger = (ev: PointerEvent) => {
      if (ev.pointerId !== pid) return
      ev.preventDefault()
      continuer(versDiapo(ev.clientX, ev.clientY))
    }
    const fin = (ev: PointerEvent) => {
      if (ev.pointerId !== pid) return
      window.removeEventListener('pointermove', bouger)
      window.removeEventListener('pointerup', fin)
      window.removeEventListener('pointercancel', fin)
      terminer()
      // Le clic qui suit le relâchement (souvent hors de l'instrument : sur la diapo) n'est pas « diapo suivante ».
      const avaler = (c: MouseEvent) => c.stopPropagation()
      window.addEventListener('click', avaler, { capture: true, once: true })
      window.setTimeout(() => window.removeEventListener('click', avaler, true), 0)
    }
    window.addEventListener('pointermove', bouger, { passive: false })
    window.addEventListener('pointerup', fin)
    window.addEventListener('pointercancel', fin)
  }

  const couleurTrait = (o: OutilsLocaux) => (o.outil === 'fluo' ? o.fluo : o.couleur)
  const epaisseur = (o: OutilsLocaux) => (o.outil === 'fluo' ? 22 : o.outil === 'gomme' ? 44 : EPAISSEURS[o.epaisseur])

  const debutCompas = (e: React.PointerEvent, p: P) => {
    const o = outilsRef.current
    const c = magasin.lire().compas
    if (c && c.phase === 'arc' && Math.hypot(p[0] - c.cx, p[1] - c.cy) > Math.max(24, 0.35 * c.r)) {
      const a = Math.atan2(p[1] - c.cy, p[0] - c.cx)
      const arc: Arc = { genre: 'arc', id: nouvelId(id), couleur: o.couleur, epaisseur: EPAISSEURS[o.epaisseur], cx: c.cx, cy: c.cy, r: c.r, a0: a, a1: a }
      magasin.compas({ ...c, angle: a })
      commencer(e, { g: 'arc', arc, dernier: a, ajoute: false })
      return
    }
    // Nouveau centre (aimanté sur un nœud du quadrillage à moins de 10 px).
    let centre = p
    if (grilleRef.current) {
      const n: P = [Math.round(p[0] / CARREAU) * CARREAU, Math.round(p[1] / CARREAU) * CARREAU]
      if (Math.hypot(n[0] - p[0], n[1] - p[1]) <= 10) centre = n
    }
    magasin.compas({ cx: centre[0], cy: centre[1], r: 0, angle: -Math.PI / 4, phase: 'rayon' })
    commencer(e, { g: 'rayon' })
  }

  /** Outil actif (stylo, fluo, gomme, compas) au point p : trait libre, gomme ou compas. */
  const debutOutil = (e: React.PointerEvent, p: P) => {
    const o = outilsRef.current
    if (o.outil === 'compas') return debutCompas(e, p)
    const trait: Trait = { id: nouvelId(id), couleur: couleurTrait(o), gomme: o.outil === 'gomme', fluo: o.outil === 'fluo', epaisseur: epaisseur(o), points: [p] }
    commencer(e, { g: 'trait', trait })
    liste().push(trait)
    envoyer({ type: 'trait', de: id, index: indexRef.current, trait })
    dessiner()
  }

  const surCanvas = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!actif) return
    debutOutil(e, versDiapo(e.clientX, e.clientY))
  }

  /**
   * Appui sur l'équerre (ou juste autour). Règle : près d'un bord (`seuilBord`) = tracer le long de ce bord avec
   * le stylo courant, même stylo rangé (gomme / compas actifs : ils gardent la main) ; ailleurs dans l'équerre =
   * la déplacer ; juste autour mais pas assez près = l'outil actif s'il y en a un, sinon rien.
   */
  const surEquerre = (e: React.PointerEvent) => {
    const p = versDiapo(e.clientX, e.clientY)
    const o = outilsRef.current
    const eq = magasin.lire().equerre
    const l = versEquerre(eq, p)
    const { i, d } = bordLePlusProche(l)
    const outilPropre = o.stylo && (o.outil === 'gomme' || o.outil === 'compas')
    if (d <= seuilBord(e.pointerType, echelleRef.current) && !outilPropre) {
      const [a, b] = BORDS[i]
      const hyp = i === 0
      const droite = eq.trace === 'droite'
      let depart = projeter(l, a, b).q
      if (hyp && !droite) depart = [surGraduation(depart[0]), 0]
      const fluo = o.stylo && o.outil === 'fluo'
      const trait: Trait = { id: nouvelId(id), couleur: fluo ? o.fluo : o.couleur, gomme: false, fluo, epaisseur: fluo ? 22 : EPAISSEURS[o.epaisseur], points: [] }
      commencer(e, { g: 'regle', trait, eq, a, b, depart, p0: p, hyp, droite, ajoute: false })
      return
    }
    if (dansEquerre(l)) return commencer(e, { g: 'deplacer', dx: p[0] - eq.x, dy: p[1] - eq.y })
    if (o.stylo) return debutOutil(e, p)
    e.preventDefault()
    e.stopPropagation()
  }

  /** Survol à la souris : curseur « tracer » près d'un bord, « déplacer » ailleurs dans l'équerre. */
  const survolEquerre = (e: React.PointerEvent<SVGElement>) => {
    if (geste.current || e.pointerType === 'touch') return
    const o = outilsRef.current
    const l = versEquerre(magasin.lire().equerre, versDiapo(e.clientX, e.clientY))
    const pres = bordLePlusProche(l).d <= seuilBord(e.pointerType, echelleRef.current) && !(o.stylo && (o.outil === 'gomme' || o.outil === 'compas'))
    const curseur = pres ? 'crosshair' : dansEquerre(l) ? 'move' : o.stylo ? (o.outil === 'gomme' ? 'cell' : 'crosshair') : 'default'
    if (e.currentTarget.style.cursor !== curseur) e.currentTarget.style.cursor = curseur
    e.currentTarget.dataset.bord = pres ? 'oui' : 'non'
  }

  const epingles = (parDiapo.current.get(index) ?? []).filter((el): el is Epingle => el.genre === 'epingle')
  const gomme = actif && outils.outil === 'gomme'

  return (
    <div ref={racine} className="projection-tableau">
      <canvas ref={canvasFluo} className="projection-annotations projection-annotations--fluo" aria-hidden="true" />
      <canvas
        ref={canvasStylo}
        className={`projection-annotations${actif ? ' actif' : ''}${gomme ? ' gomme' : ''}`}
        aria-hidden="true"
        onPointerDown={surCanvas}
        onClick={(e) => actif && e.stopPropagation()}
      />
      {epingles.map((el) => (
        <div
          key={el.id}
          className="projection-epingle projection-interactif"
          style={{ left: el.x, top: el.y }}
          onPointerDown={(e) => {
            if ((e.target as HTMLElement).closest('button')) return
            const p = versDiapo(e.clientX, e.clientY)
            commencer(e, { g: 'epingle', el, dx: p[0] - el.x, dy: p[1] - el.y })
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <MathInline tex={el.latex} />
          {gomme && (
            <button type="button" className="projection-epingle-retirer" aria-label="Retirer ce résultat" onClick={() => retirer(el.id)}>
              <Pictogramme nom="fermer" taille={16} />
            </button>
          )}
        </div>
      ))}
      {compas && <DessinCompas compas={compas} grille={grille} />}
      {equerre.visible && (
        <DessinEquerre
          equerre={equerre}
          tourne={tourne}
          grille={grille}
          zone={seuilBord('touch', echelle)}
          surCorps={surEquerre}
          survol={survolEquerre}
          surPoignee={(e) => {
            if (magasin.lire().equerre.verrou) return surEquerre(e)
            setTourne(true)
            commencer(e, { g: 'tourner' })
          }}
        />
      )}
      <Calculatrice
        magasin={magasin}
        role={role}
        echelle={echelle}
        versDiapo={versDiapo}
        epingler={(latex) => {
          const c = magasin.lire().calc
          // En bas à gauche de la zone de contenu (hors de la calculatrice, au-dessus de la barre) : à déplacer ensuite.
          ajouter({ genre: 'epingle', id: nouvelId(id), x: c.x < 560 ? 680 : 96, y: 560, latex })
        }}
      />
    </div>
  )
}

/**
 * Équerre Aristo transparente : hypoténuse graduée (0 au milieu), rapporteur, axe médian,
 * poignée de rotation (cadenas si la rotation est verrouillée). Une zone invisible déborde du triangle de `zone`
 * px logiques : elle reçoit les appuis (tracer près d'un bord, déplacer ailleurs). Pendant un tracé le long de
 * l'hypoténuse : petits traits aux extrémités et longueur (même unité que le compas).
 */
function DessinEquerre({
  equerre,
  tourne,
  grille,
  zone,
  surCorps,
  survol,
  surPoignee,
}: {
  equerre: EtatEquerre
  tourne: boolean
  grille: boolean
  zone: number
  surCorps: (e: React.PointerEvent) => void
  survol: (e: React.PointerEvent<SVGElement>) => void
  surPoignee: (e: React.PointerEvent) => void
}) {
  const graduations = []
  for (let n = -13; n <= 13; n++) {
    const x = (n * CARREAU) / 2
    const entier = n % 2 === 0
    graduations.push(<line key={`g${n}`} x1={x} y1={0} x2={x} y2={entier ? -16 : -9} />)
    if (entier && n !== 0 && Math.abs(n) <= 12)
      graduations.push(
        <text key={`t${n}`} x={x} y={-22} className="eq-nombre">
          {Math.abs(n / 2)}
        </text>,
      )
  }
  const R = 170
  const rapporteur = []
  for (let d = 5; d < 180; d += 5) {
    const t = -d * DEG
    const long = d % 10 === 0
    const [c, s] = [Math.cos(t), Math.sin(t)]
    rapporteur.push(<line key={`r${d}`} x1={R * c} y1={R * s} x2={(R - (long ? 12 : 7)) * c} y2={(R - (long ? 12 : 7)) * s} />)
  }
  const etiquettes = [30, 45, 60, 120, 135, 150].map((d) => {
    const t = -d * DEG
    return (
      <text key={`e${d}`} x={(R - 26) * Math.cos(t)} y={(R - 26) * Math.sin(t)} className="eq-degre" transform={`rotate(${90 - d} ${(R - 26) * Math.cos(t)} ${(R - 26) * Math.sin(t)})`}>
        {Math.min(d, 180 - d)}°
      </text>
    )
  })
  const angle = angleAffiche(equerre.angle)
  const t = equerre.angle * DEG
  // Étiquette de l'angle, à l'endroit, au-dessus de la poignée.
  const [px, py] = [equerre.x + POIGNEE[0] * Math.cos(t) - (POIGNEE[1] - 44) * Math.sin(t), equerre.y + POIGNEE[0] * Math.sin(t) + (POIGNEE[1] - 44) * Math.cos(t)]
  const { mesure, verrou } = equerre
  // Longueur mesurée : sous l'hypoténuse (hors de l'équerre), toujours à l'endroit.
  const [mx, my] = mesure ? depuisEquerre(equerre, [(mesure.u0 + mesure.u1) / 2, 42]) : [0, 0]
  const longueur = mesure ? texteLongueur(Math.abs(mesure.u1 - mesure.u0), grille) : ''
  const largeurEtiquette = longueur.length * 11 + 28
  return (
    <svg className="projection-instrument projection-equerre" width={LARGEUR} height={HAUTEUR} viewBox={`0 0 ${LARGEUR} ${HAUTEUR}`} aria-label={`Équerre, angle ${texteNombre(angle)}°`} role="img">
      <g transform={`translate(${equerre.x} ${equerre.y}) rotate(${equerre.angle})`}>
        <polygon className="eq-corps" points={`${-DEMI},0 ${DEMI},0 0,${-DEMI}`} />
        <path className="eq-rapporteur" d={`M ${-R} 0 A ${R} ${R} 0 0 1 ${R} 0`} />
        <g className="eq-traits">{rapporteur}</g>
        {etiquettes}
        <line className="eq-axe" x1={0} y1={0} x2={0} y2={-DEMI + 8} />
        <g className="eq-traits eq-graduations">{graduations}</g>
        <text x={0} y={-22} className="eq-nombre eq-zero">
          0
        </text>
        {mesure && (
          <g className="eq-mesure" style={{ stroke: mesure.couleur }}>
            <line x1={mesure.u0} y1={-14} x2={mesure.u0} y2={14} />
            <line x1={mesure.u1} y1={-14} x2={mesure.u1} y2={14} />
          </g>
        )}
        <polygon
          className="eq-zone projection-interactif"
          points={`${-DEMI},0 ${DEMI},0 0,${-DEMI}`}
          style={{ strokeWidth: 2 * zone }}
          onPointerDown={surCorps}
          onPointerMove={survol}
          onClick={(e) => e.stopPropagation()}
        >
          <title>{`Glisser le long d'un bord : tracer (${equerre.trace === 'droite' ? 'droite' : 'segment'}) · ailleurs : déplacer`}</title>
        </polygon>
        <circle className={`eq-poignee projection-interactif${verrou ? ' verrou' : ''}`} cx={POIGNEE[0]} cy={POIGNEE[1]} r={16} onPointerDown={surPoignee} onClick={(e) => e.stopPropagation()}>
          <title>{verrou ? 'Rotation verrouillée (glisser : déplacer)' : "Tourner l'équerre"}</title>
        </circle>
        {verrou ? (
          <g className="eq-poignee-fleche" transform={`translate(${POIGNEE[0]} ${POIGNEE[1]}) rotate(${-equerre.angle})`}>
            <rect x={-6} y={-1} width={12} height={9} rx={1.5} />
            <path d="M -3.5 -1 v -3 a 3.5 3.5 0 0 1 7 0 v 3" />
          </g>
        ) : (
          <path className="eq-poignee-fleche" d={`M ${POIGNEE[0] - 7} ${POIGNEE[1] + 3} a 7.5 7.5 0 1 1 7 4.5 M ${POIGNEE[0] - 7} ${POIGNEE[1] + 3} l -1 -5 M ${POIGNEE[0] - 7} ${POIGNEE[1] + 3} l 5 -1`} />
        )}
      </g>
      {mesure && Math.abs(mesure.u1 - mesure.u0) > 0.5 && (
        <g className="eq-longueur" transform={`translate(${mx} ${my})`}>
          <rect x={-largeurEtiquette / 2} y={-17} width={largeurEtiquette} height={34} rx={6} style={{ stroke: mesure.couleur }} />
          <text x={0} y={7}>
            {longueur}
          </text>
        </g>
      )}
      <g className={`eq-angle${tourne ? ' tourne' : ''}`} transform={`translate(${px} ${py})`}>
        <rect x={tourne ? -46 : -34} y={tourne ? -22 : -16} width={tourne ? 92 : 68} height={tourne ? 44 : 32} rx={8} />
        <text x={0} y={tourne ? 9 : 6}>
          {texteNombre(angle)}°
        </text>
      </g>
    </svg>
  )
}

/** Compas : pointe au centre, mine sur le cercle, rayon affiché (carreaux du quadrillage, sinon unités « u » de 40 px). */
function DessinCompas({ compas, grille }: { compas: EtatCompas; grille: boolean }) {
  const { cx, cy, r, angle, phase } = compas
  const mx = cx + r * Math.cos(angle)
  const my = cy + r * Math.sin(angle)
  // Charnière : au-dessus du milieu des deux pointes (côté haut de l'écran).
  let [nx, ny] = [-Math.sin(angle), Math.cos(angle)]
  if (ny > 0) [nx, ny] = [-nx, -ny]
  const h = borne(r * 0.55, 34, 140)
  const [hx, hy] = [(cx + mx) / 2 + nx * h, (cy + my) / 2 + ny * h]
  const [lx, ly] = [(cx + mx) / 2 - nx * 26, (cy + my) / 2 - ny * 26]
  return (
    <svg className="projection-instrument projection-compas" width={LARGEUR} height={HAUTEUR} viewBox={`0 0 ${LARGEUR} ${HAUTEUR}`} aria-hidden="true">
      {r > 0 && <line className="cp-rayon" x1={cx} y1={cy} x2={mx} y2={my} />}
      {r > 0 && (
        <>
          <line className="cp-jambe" x1={cx} y1={cy} x2={hx} y2={hy} />
          <line className="cp-jambe" x1={mx} y1={my} x2={hx} y2={hy} />
          <circle className="cp-charniere" cx={hx} cy={hy} r={8} />
          <line className="cp-tete" x1={hx} y1={hy} x2={hx + nx * 22} y2={hy + ny * 22} />
          <circle className="cp-mine" cx={mx} cy={my} r={6} />
        </>
      )}
      <circle className="cp-pointe" cx={cx} cy={cy} r={6} />
      {r > 0 && (
        <g className={`cp-etiquette${phase === 'rayon' ? ' vive' : ''}`} transform={`translate(${lx} ${ly})`}>
          <rect x={-78} y={-18} width={156} height={36} rx={6} />
          <text x={0} y={7}>
            {texteRayon(r, grille)}
          </text>
        </g>
      )}
    </svg>
  )
}

/** Écran blanc : uni, quadrillé (carreaux de 40 px logiques) ou repère gradué (origine au centre, 1 graduation = 1 carreau). */
export function FondBlancTableau({ fond }: { fond: FondBlanc }) {
  if (fond === 'uni') return <div className="projection-blanc" aria-label="Écran blanc" />
  const verticales = []
  const horizontales = []
  for (let x = CARREAU; x < LARGEUR; x += CARREAU) verticales.push(<line key={x} x1={x} y1={0} x2={x} y2={HAUTEUR} />)
  for (let y = CARREAU; y < HAUTEUR; y += CARREAU) horizontales.push(<line key={y} x1={0} y1={y} x2={LARGEUR} y2={y} />)
  const [ox, oy] = [LARGEUR / 2, HAUTEUR / 2]
  const graduations = []
  if (fond === 'repere') {
    for (let x = CARREAU; x < LARGEUR - CARREAU / 2; x += CARREAU) {
      const n = (x - ox) / CARREAU
      if (n === 0) continue
      graduations.push(<line key={`gx${x}`} className="rp-trait" x1={x} y1={oy - 5} x2={x} y2={oy + 5} />)
      graduations.push(
        <text key={`tx${x}`} className="rp-nombre" x={x} y={oy + 22} textAnchor="middle">
          {String(n).replace('-', '−')}
        </text>,
      )
    }
    for (let y = CARREAU; y < HAUTEUR - CARREAU / 2; y += CARREAU) {
      const n = (oy - y) / CARREAU
      if (n === 0) continue
      graduations.push(<line key={`gy${y}`} className="rp-trait" x1={ox - 5} y1={y} x2={ox + 5} y2={y} />)
      graduations.push(
        <text key={`ty${y}`} className="rp-nombre" x={ox - 10} y={y + 5} textAnchor="end">
          {String(n).replace('-', '−')}
        </text>,
      )
    }
  }
  return (
    <div className="projection-blanc" aria-label={fond === 'repere' ? 'Écran blanc avec repère' : 'Écran blanc quadrillé'}>
      <svg width={LARGEUR} height={HAUTEUR} viewBox={`0 0 ${LARGEUR} ${HAUTEUR}`} aria-hidden="true" className="projection-blanc-grille">
        <g className="rp-grille">
          {verticales}
          {horizontales}
        </g>
        {fond === 'repere' && (
          <>
            <line className="rp-axe" x1={8} y1={oy} x2={LARGEUR - 12} y2={oy} />
            <line className="rp-axe" x1={ox} y1={HAUTEUR - 8} x2={ox} y2={12} />
            <path className="rp-fleche" d={`M ${LARGEUR - 8} ${oy} l -14 -6 v 12 z`} />
            <path className="rp-fleche" d={`M ${ox} 8 l -6 14 h 12 z`} />
            {graduations}
            <text className="rp-nombre" x={ox - 10} y={oy + 22} textAnchor="end">
              0
            </text>
            <text className="rp-nom" x={LARGEUR - 14} y={oy - 14} textAnchor="end">
              x
            </text>
            <text className="rp-nom" x={ox + 14} y={24}>
              y
            </text>
          </>
        )}
      </svg>
    </div>
  )
}
