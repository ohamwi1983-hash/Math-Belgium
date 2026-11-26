/**
 * Peinture des annotations sur canvas (mode projection), commune au tableau en direct (`Tableau.tsx`) et
 * à l'export annoté (`exportPptx.tsx`) : même rendu à l'écran, dans le PowerPoint et dans le PDF.
 * `k` = pixels du canvas par pixel logique de la diapo (1 280 × 720).
 */
import type { Arc, Courbe, ElementAnnotation, PageBlanche, Trait } from './annotations'
import { traceMemorise } from './traceur'
import { IDENTITE, repereVue } from './vue'
import type { Transfo } from './vue'

/** Droite (p, q) coupée aux bords de l'écran (1 280 × 720). */
function droiteEcran(p: [number, number], q: [number, number]): [number, number][] {
  const [dx, dy] = [q[0] - p[0], q[1] - p[1]]
  let t0 = -Infinity
  let t1 = Infinity
  for (const [d, v, max] of [
    [dx, p[0], 1280],
    [dy, p[1], 720],
  ] as const) {
    if (Math.abs(d) < 1e-9) continue
    const [a, b] = [-v / d, (max - v) / d]
    t0 = Math.max(t0, Math.min(a, b))
    t1 = Math.min(t1, Math.max(a, b))
  }
  if (!Number.isFinite(t0) || !Number.isFinite(t1) || t1 < t0) return [p, q]
  return [
    [p[0] + t0 * dx, p[1] + t0 * dy],
    [p[0] + t1 * dx, p[1] + t1 * dy],
  ]
}

/**
 * Traits et arcs d'une page : surligneur sur `xf` (le canvas est posé en `multiply` sur la diapo), stylo et
 * arcs du compas sur `xs` ; la gomme (`destination-out`) efface les deux. Épingles et courbes : ailleurs.
 * `t` : transformation page → écran (page « repère » zoomée, `vue.ts`) — les points suivent le graphique, les
 * épaisseurs suivent le zoom (`t.s`), une droite tracée à l'équerre reste prolongée jusqu'aux bords.
 */
export function peindreTraits(xf: CanvasRenderingContext2D, xs: CanvasRenderingContext2D, elements: ElementAnnotation[], k: number, t: Transfo = IDENTITE) {
  for (const x of [xf, xs]) {
    x.setTransform(1, 0, 0, 1, 0, 0)
    x.clearRect(0, 0, x.canvas.width, x.canvas.height)
    x.setTransform(k, 0, 0, k, 0, 0)
    x.lineJoin = 'round'
  }
  const ecran = ([px, py]: [number, number]): [number, number] => [px * t.zx + t.tx, py * t.zy + t.ty]
  const tracer = (x: CanvasRenderingContext2D, el: Trait | Arc) => {
    x.beginPath()
    if (el.genre === 'arc') {
      const [cx, cy] = ecran([el.cx, el.cy])
      const rx = el.r * t.zx
      const ry = (el.ry ?? el.r) * t.zy
      const tour = Math.abs(el.a1 - el.a0) >= 2 * Math.PI
      if (Math.abs(rx - ry) < 1e-6) {
        if (tour) x.arc(cx, cy, rx, 0, 2 * Math.PI)
        else x.arc(cx, cy, rx, el.a0, el.a1, el.a1 < el.a0)
      } else if (tour) x.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI)
      else x.ellipse(cx, cy, rx, ry, 0, el.a0, el.a1, el.a1 < el.a0)
    } else {
      let pts = el.points.map(ecran)
      if (el.droite && pts.length === 2) pts = droiteEcran(pts[0], pts[1])
      pts.forEach(([px, py], i) => (i === 0 ? x.moveTo(px, py) : x.lineTo(px, py)))
      if (pts.length === 1) x.lineTo(pts[0][0] + 0.1, pts[0][1])
    }
    x.stroke()
  }
  for (const el of elements) {
    if (el.genre === 'epingle' || el.genre === 'courbe') continue
    if (el.genre !== 'arc' && el.gomme) {
      for (const x of [xf, xs]) {
        x.globalCompositeOperation = 'destination-out'
        x.strokeStyle = '#000'
        x.lineCap = 'round'
        x.lineWidth = (el.epaisseur ?? 44) * t.s
        tracer(x, el)
      }
    } else if (el.genre !== 'arc' && el.fluo) {
      xf.globalCompositeOperation = 'multiply'
      xf.strokeStyle = el.couleur
      xf.lineCap = 'butt'
      xf.lineWidth = (el.epaisseur ?? 22) * t.s
      tracer(xf, el)
    } else {
      xs.globalCompositeOperation = 'source-over'
      xs.strokeStyle = el.couleur
      xs.lineCap = 'round'
      xs.lineWidth = (el.epaisseur ?? 5) * t.s
      tracer(xs, el)
    }
  }
  xf.globalCompositeOperation = 'source-over'
  xs.globalCompositeOperation = 'source-over'
}

/** Courbes du traceur (page « repère ») : recalculées pour la vue (nettes à tout zoom), épaisseur du stylo, coupées aux
 * discontinuités, rien hors du cadre. */
export function peindreCourbes(x: CanvasRenderingContext2D, courbes: Courbe[], page: PageBlanche | null, k: number) {
  x.setTransform(1, 0, 0, 1, 0, 0)
  x.clearRect(0, 0, x.canvas.width, x.canvas.height)
  if (!page || page.fond !== 'repere') return
  x.setTransform(k, 0, 0, k, 0, 0)
  x.save()
  x.beginPath()
  x.rect(0, 0, 1280, 720)
  x.clip()
  x.lineJoin = 'round'
  x.lineCap = 'round'
  for (const c of courbes) {
    const { polylignes } = traceMemorise(c.saisie, page.angle, repereVue(page))
    x.strokeStyle = c.couleur
    x.lineWidth = c.epaisseur
    for (const l of polylignes) {
      x.beginPath()
      l.forEach(([px, py], i) => (i === 0 ? x.moveTo(px, py) : x.lineTo(px, py)))
      x.stroke()
    }
  }
  x.restore()
}
