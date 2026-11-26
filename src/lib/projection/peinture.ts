/**
 * Peinture des annotations sur canvas (mode projection), commune au tableau en direct (`Tableau.tsx`) et
 * à l'export annoté (`exportPptx.tsx`) : même rendu à l'écran, dans le PowerPoint et dans le PDF.
 * `k` = pixels du canvas par pixel logique de la diapo (1 280 × 720).
 */
import type { Arc, Courbe, ElementAnnotation, PageBlanche, Trait } from './annotations'
import { traceMemorise } from './traceur'

/**
 * Traits et arcs d'une page : surligneur sur `xf` (le canvas est posé en `multiply` sur la diapo), stylo et
 * arcs du compas sur `xs` ; la gomme (`destination-out`) efface les deux. Épingles et courbes : ailleurs.
 */
export function peindreTraits(xf: CanvasRenderingContext2D, xs: CanvasRenderingContext2D, elements: ElementAnnotation[], k: number) {
  for (const x of [xf, xs]) {
    x.setTransform(1, 0, 0, 1, 0, 0)
    x.clearRect(0, 0, x.canvas.width, x.canvas.height)
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
  for (const el of elements) {
    if (el.genre === 'epingle' || el.genre === 'courbe') continue
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
}

/** Courbes du traceur (page « repère ») : épaisseur du stylo, coupées aux discontinuités, rien hors du cadre. */
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
    const { polylignes } = traceMemorise(c.saisie, page.angle, page)
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
