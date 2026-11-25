/* ================================================================
 * Outils partagés par les ateliers du chapitre « Les coniques »
 * (6e, ch. 10) : rationnels exacts (réduction par translation),
 * échantillonnage des coniques (ellipse, hyperbole, parabole, dans un
 * repère quelconque : centre ou sommet + direction de l'axe focal),
 * chemins SVG découpés au cadre, réflexion d'un rayon sur une tangente,
 * arcs d'angle. Les repères viennent de `window.GeoAnaCommun` (4e,
 * ch. 7 : fenêtre FIXE, axes fléchés, poignées) ; les écritures LaTeX
 * de `lieux-geometriques-commun.js` ; les curseurs − / + de
 * `variables-aleatoires-commun.js`.
 * ================================================================ */
import { pgcd } from './lieux-geometriques-commun.js'

/* ---------------- Rationnels {n, d} (d > 0, réduits) ---------------- */

export function Q(n, d) {
  if (d === undefined) d = 1
  if (d < 0) { n = -n; d = -d }
  var g = pgcd(n, d)
  return { n: n / g + 0, d: d / g }
}
export function qAdd(a, b) { return Q(a.n * b.d + b.n * a.d, a.d * b.d) }
export function qSub(a, b) { return Q(a.n * b.d - b.n * a.d, a.d * b.d) }
export function qMul(a, b) { return Q(a.n * b.n, a.d * b.d) }
export function qDiv(a, b) { return Q(a.n * b.d, a.d * b.n) }
export function qNeg(a) { return Q(-a.n, a.d) }
export function qNum(a) { return a.n / a.d }
export function qSigne(a) { return a.n > 0 ? 1 : a.n < 0 ? -1 : 0 }
export function qEgal(a, b) { return a.n === b.n && a.d === b.d }
/** LaTeX d'un rationnel : « \frac{7}{3} », « -\frac{1}{4} », « 5 ». */
export function texQ(a) {
  if (a.n === 0) return '0'
  if (a.d === 1) return String(a.n)
  return (a.n < 0 ? '-' : '') + '\\frac{' + Math.abs(a.n) + '}{' + a.d + '}'
}
/** Terme « + 3 » / « - \frac{1}{2} » à accoler (signe compris), vide si nul. */
export function texQSigne(a) {
  if (a.n === 0) return ''
  return (a.n < 0 ? '-' : '+') + texQ(Q(Math.abs(a.n), a.d))
}
/** √(a) pour un rationnel a ≥ 0 : LaTeX exact simplifié (√(p/q) = √(pq)/q). */
export function texRacineQ(a) {
  if (a.n === 0) return '0'
  var p = a.n * a.d, k = 1, m = p
  for (var f = 2; f * f <= m; f++) { while (m % (f * f) === 0) { m /= f * f; k *= f } }
  // √(p) / d = k√m / d
  var g = pgcd(k, a.d), num = k / g, den = a.d / g
  var corps = m === 1 ? String(num) : (num === 1 ? '' : num) + '\\sqrt{' + m + '}'
  return den === 1 ? corps : '\\frac{' + corps + '}{' + den + '}'
}
/** √a est-il rationnel ? */
export function racineRationnelle(a) {
  if (a.n < 0) return false
  var rn = Math.round(Math.sqrt(a.n)), rd = Math.round(Math.sqrt(a.d))
  return rn * rn === a.n && rd * rd === a.d
}

/* ---------------- Échantillonnage des coniques ---------------- */

/**
 * Ellipse de centre (cx ; cy), demi-axes a (le long de u = (ux ; uy), unitaire) et b (le long de
 * v, u tourné de +90°). Liste fermée de points [x, y].
 */
export function ptsEllipse(cx, cy, a, b, ux, uy, n) {
  n = n || 240
  var vx = -uy, vy = ux, pts = []
  for (var i = 0; i <= n; i++) {
    var t = 2 * Math.PI * i / n, c = Math.cos(t), s = Math.sin(t)
    pts.push([cx + a * c * ux + b * s * vx, cy + a * c * uy + b * s * vy])
  }
  return pts
}

/**
 * Hyperbole de centre (cx ; cy), axe focal u (unitaire), demi-axes a et b : deux branches
 * [[x, y], …], paramètre ch / sh jusqu'à sMax (assez grand pour sortir du cadre).
 */
export function ptsHyperbole(cx, cy, a, b, ux, uy, sMax, n) {
  n = n || 160; sMax = sMax || 4
  var vx = -uy, vy = ux, br = [[], []]
  for (var k = 0; k < 2; k++) {
    var sg = k === 0 ? 1 : -1
    for (var i = 0; i <= n; i++) {
      var s = -sMax + 2 * sMax * i / n, ch = Math.cosh(s), sh = Math.sinh(s)
      br[k].push([cx + sg * a * ch * ux + b * sh * vx, cy + sg * a * ch * uy + b * sh * vy])
    }
  }
  return br
}

/**
 * Parabole de sommet (sx ; sy), d'axe orienté u (vers l'ouverture), Y² = 2pX dans le repère
 * (S ; u, v) : points S + (t²/(2p))·u + t·v, t de −tMax à tMax.
 */
export function ptsParabole(sx, sy, p, ux, uy, tMax, n) {
  n = n || 200; tMax = tMax || 12
  var vx = -uy, vy = ux, pts = []
  for (var i = 0; i <= n; i++) {
    var t = -tMax + 2 * tMax * i / n, X = t * t / (2 * p)
    pts.push([sx + X * ux + t * vx, sy + X * uy + t * vy])
  }
  return pts
}

/** Chemin SVG « M … L … » d'une liste de points du monde (repère R de GeoAnaCommun). */
export function cheminPts(R, pts) {
  var d = ''
  for (var i = 0; i < pts.length; i++) {
    var q = pts[i]
    if (!q) continue
    var p = R.px(q[0], q[1])
    d += (d && pts[i - 1] ? ' L' : ' M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)
  }
  return d.trim()
}

/** Groupe découpé au cadre du repère (clipPath posé dans les <defs> créées par R.fond). */
export function groupeCadre(G, svg, R, id) {
  var defs = svg.querySelector('defs') || G.el('defs', {}, svg)
  var clip = G.el('clipPath', { id: id }, defs)
  G.el('rect', { x: R.marge, y: R.marge, width: R.L - 2 * R.marge, height: R.H - 2 * R.marge }, clip)
  return G.el('g', { 'clip-path': 'url(#' + id + ')' }, svg)
}

/* ---------------- Rayons ---------------- */

/** Réflexion de la direction (dx ; dy) sur une droite de direction (tx ; ty) : 2(d·t)t − d. */
export function reflechir(dx, dy, tx, ty) {
  var L = Math.hypot(tx, ty); tx /= L; ty /= L
  var s = dx * tx + dy * ty
  return [2 * s * tx - dx, 2 * s * ty - dy]
}

/** Angle aigu (en degrés) entre deux directions. */
export function angleAigu(ax, ay, bx, by) {
  var c = Math.abs(ax * bx + ay * by) / (Math.hypot(ax, ay) * Math.hypot(bx, by))
  return Math.acos(Math.min(1, c)) * 180 / Math.PI
}

/** Arc d'angle de centre P (px) entre les directions (écran) d1 et d2, rayon r px (petit arc). */
export function arcAngle(svg, P, d1, d2, r, cls) {
  var a1 = Math.atan2(d1[1], d1[0]), a2 = Math.atan2(d2[1], d2[0])
  var da = a2 - a1
  while (da > Math.PI) da -= 2 * Math.PI
  while (da < -Math.PI) da += 2 * Math.PI
  var x1 = P[0] + r * Math.cos(a1), y1 = P[1] + r * Math.sin(a1)
  var x2 = P[0] + r * Math.cos(a1 + da), y2 = P[1] + r * Math.sin(a1 + da)
  var e = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  e.setAttribute('d', 'M' + x1.toFixed(1) + ',' + y1.toFixed(1) + ' A' + r + ',' + r + ' 0 0 ' + (da > 0 ? 1 : 0) + ' ' + x2.toFixed(1) + ',' + y2.toFixed(1))
  e.setAttribute('class', cls || 'trait-soft')
  svg.appendChild(e)
  return [P[0] + (r + 11) * Math.cos(a1 + da / 2), P[1] + (r + 11) * Math.sin(a1 + da / 2)]
}

/** Point de la liste le plus proche de (x ; y) : indice. */
export function plusProche(pts, x, y) {
  var best = -1, dm = Infinity
  for (var i = 0; i < pts.length; i++) {
    var q = pts[i]
    if (!q) continue
    var d = (q[0] - x) * (q[0] - x) + (q[1] - y) * (q[1] - y)
    if (d < dm) { dm = d; best = i }
  }
  return best
}

/** Styles propres aux ateliers des coniques (en plus de CSS_BASE et CSS_LIEUX). */
export var CSS_CONIQUES =
  '.conique{fill:none;stroke:var(--accent,#b65c1f);stroke-width:2.6;stroke-linejoin:round;}' +
  '.conique-faible{fill:none;stroke:var(--accent,#b65c1f);stroke-width:1.6;stroke-dasharray:6 5;opacity:0.7;}' +
  '.directrice{stroke:var(--ink,#182430);stroke-width:1.8;stroke-dasharray:7 5;}' +
  '.directrice2{stroke:var(--ink-soft,#51626f);stroke-width:1.4;stroke-dasharray:4 4;}' +
  '.axe-trans{stroke:var(--plan,#5b4ea3);stroke-width:1.4;stroke-dasharray:6 4;}' +
  '.asymptote{stroke:var(--ink-soft,#51626f);stroke-width:1.3;stroke-dasharray:5 4;}' +
  '.seg-f{stroke:var(--good,#2f7a4f);stroke-width:2.4;}' +
  '.seg-f2{stroke:var(--plan,#5b4ea3);stroke-width:2.4;}' +
  '.seg-d{stroke:var(--sky,#2f6fb0);stroke-width:2.4;}' +
  '.trace{fill:none;stroke:var(--rose,#b23a7a);stroke-width:3;stroke-linecap:round;stroke-linejoin:round;}' +
  '.presets .btn{font-size:0.86rem;}'
