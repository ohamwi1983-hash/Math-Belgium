/* ================================================================
 * Outils partagés par les ateliers du chapitre « Lieux géométriques »
 * (6e, ch. 9) : écritures LaTeX exactes (fractions, racines
 * simplifiées, équations de droites), distances d'un point à un
 * segment ou à une demi-droite, lecture automatique (bouton « Lancer »),
 * styles des repères tracés avec `window.GeoAnaCommun` (4e, ch. 7 :
 * repère à fenêtre FIXE, axes fléchés, poignées à glisser).
 * Les curseurs − / + viennent de `variables-aleatoires-commun.js`.
 * ================================================================ */
import { texNombre } from './katex-shadow.js'

export function pgcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t } return a || 1 }

/** Rationnel p/q (entiers) → LaTeX : « \frac{7}{3} », « -\frac{1}{4} », « 5 ». */
export function texFrac(p, q) {
  if (q < 0) { p = -p; q = -q }
  var g = pgcd(p, q); p /= g; q /= g
  if (p === 0) return '0'
  if (q === 1) return String(p)
  return (p < 0 ? '-' : '') + '\\frac{' + Math.abs(p) + '}{' + q + '}'
}

/** √n = k√m (n entier ≥ 0, m sans facteur carré). */
export function simplifieRacine(n) {
  var k = 1, m = n
  for (var d = 2; d * d <= m; d++) { while (m % (d * d) === 0) { m /= d * d; k *= d } }
  return [k, m]
}

/** a√n / q (entiers, a ≥ 0, q > 0) → LaTeX simplifié : « 3 », « 2\sqrt{2} », « \frac{8\sqrt{5}}{3} ». */
export function texRacine(a, n, q) {
  if (a === 0 || n === 0) return '0'
  var s = simplifieRacine(n), k = a * s[0], m = s[1], g = pgcd(k, q)
  k /= g; q /= g
  var num = m === 1 ? String(k) : (k === 1 ? '' : k) + '\\sqrt{' + m + '}'
  return q === 1 ? num : '\\frac{' + num + '}{' + q + '}'
}

/** Nombre décimal en LaTeX (virgule, au plus `dec` décimales) — alias lisible. */
export function texN(x, dec) { return texNombre(x, dec === undefined ? 2 : dec) }

/** Équation ax + by + c = 0 en LaTeX, coefficients décimaux (au plus `dec` décimales). */
export function texDroite(a, b, c, dec) {
  var d = dec === undefined ? 2 : dec
  var s = ''
  function terme(coef, lettre) {
    var v = Number(texNombre(coef, d).replace('{,}', '.'))
    if (v === 0) return
    var abs = Math.abs(coef)
    var corps = lettre ? (Math.abs(v) === 1 ? lettre : texNombre(abs, d) + lettre) : texNombre(abs, d)
    if (!s) s = (coef < 0 ? '-' : '') + corps
    else s += (coef < 0 ? '-' : '+') + corps
  }
  terme(a, 'x'); terme(b, 'y'); terme(c, '')
  return (s || '0') + '=0'
}

/** Distance du point (px, py) au segment [AB]. */
export function distSegment(px, py, ax, ay, bx, by) {
  var dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy
  var t = L2 ? ((px - ax) * dx + (py - ay) * dy) / L2 : 0
  t = Math.max(0, Math.min(1, t))
  return Math.hypot(px - ax - t * dx, py - ay - t * dy)
}

/** Distance du point (px, py) à la demi-droite d'origine O et de direction (ux, uy). */
export function distDemiDroite(px, py, ox, oy, ux, uy) {
  var L = Math.hypot(ux, uy), vx = ux / L, vy = uy / L
  var t = Math.max(0, (px - ox) * vx + (py - oy) * vy)
  return Math.hypot(px - ox - t * vx, py - oy - t * vy)
}

/** Distance du point au bord d'un polygone fermé [[x, y], …]. */
export function distPolygone(px, py, pts) {
  var m = Infinity
  for (var i = 0; i < pts.length; i++) {
    var a = pts[i], b = pts[(i + 1) % pts.length]
    m = Math.min(m, distSegment(px, py, a[0], a[1], b[0], b[1]))
  }
  return m
}

/**
 * Lecture automatique : `pas()` est appelé environ `parSeconde` fois par seconde tant que la
 * lecture tourne ; il renvoie false pour s'arrêter. `surEtat(enCours)` met le bouton à jour.
 */
export function lecteur(parSeconde, pas, surEtat) {
  var id = 0, dernier = 0, enCours = false
  function boucle(t) {
    if (!enCours) return
    if (!dernier) dernier = t
    var n = Math.floor((t - dernier) * parSeconde / 1000)
    if (n > 0) {
      dernier += n * 1000 / parSeconde
      for (var i = 0; i < Math.min(n, 4); i++) { if (pas() === false) { arreter(); return } }
    }
    id = requestAnimationFrame(boucle)
  }
  function lancer() { if (enCours) return; enCours = true; dernier = 0; surEtat(true); id = requestAnimationFrame(boucle) }
  function arreter() { if (!enCours) return; enCours = false; cancelAnimationFrame(id); surEtat(false) }
  return { lancer: lancer, arreter: arreter, basculer: function () { if (enCours) arreter(); else lancer() }, enCours: function () { return enCours } }
}

/** Styles des repères (classes posées par GeoAnaCommun.repere().fond) et des tracés communs. */
export var CSS_LIEUX =
  ':host{text-align:left;}' +
  '.figure svg{max-width:440px;border:1px solid var(--line,#ccd8e0);}' +
  '.figure svg.glisser{touch-action:none;user-select:none;}' +
  '.grille{stroke:var(--line,#ccd8e0);stroke-width:0.7;}' +
  '.fleche-axe{fill:var(--ink-soft,#51626f);}' +
  '.graduation{font-size:11px;fill:var(--ink-soft,#51626f);font-family:var(--sans,sans-serif);font-variant-numeric:tabular-nums;' +
  'paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3px;stroke-linejoin:round;}' +
  '.axe-nom{font-size:13px;font-style:italic;font-family:var(--serif,serif);}' +
  '.et{font-size:13px;font-weight:700;font-family:var(--sans,sans-serif);fill:var(--ink,#182430);' +
  'paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
  '.et-petit{font-size:11px;font-weight:600;}' +
  '.et-acc{fill:var(--accent-ink,#7a3c11);}.et-good{fill:var(--good,#2f7a4f);}.et-bad{fill:var(--bad,#b23a3a);}' +
  '.et-plan{fill:var(--plan-ink,#443a80);}.et-sky{fill:var(--sky-ink,#1f4e7d);}.et-rose{fill:var(--rose,#b23a7a);}' +
  '.et-attn{fill:var(--attn,#96650c);}.et-soft{fill:var(--ink-soft,#51626f);font-weight:600;}' +
  '.pt{fill:var(--ink,#182430);}.pt-acc{fill:var(--accent,#b65c1f);}.pt-good{fill:var(--good,#2f7a4f);}.pt-bad{fill:var(--bad,#b23a3a);}' +
  '.pt-plan{fill:var(--plan,#5b4ea3);}.pt-sky{fill:var(--sky,#2f6fb0);}.pt-rose{fill:var(--rose,#b23a7a);}.pt-attn{fill:var(--attn,#96650c);}' +
  '.pt-ouvert{fill:var(--surface-2,#f7f9fb);stroke-width:2;}' +
  '.trait{fill:none;stroke:var(--ink,#182430);stroke-width:2;}' +
  '.trait-soft{fill:none;stroke:var(--ink-soft,#51626f);stroke-width:1.4;}' +
  '.trait-acc{fill:none;stroke:var(--accent,#b65c1f);stroke-width:2.2;}' +
  '.trait-good{fill:none;stroke:var(--good,#2f7a4f);stroke-width:2.2;}' +
  '.trait-bad{fill:none;stroke:var(--bad,#b23a3a);stroke-width:2;}' +
  '.trait-plan{fill:none;stroke:var(--plan,#5b4ea3);stroke-width:2;}' +
  '.trait-sky{fill:none;stroke:var(--sky,#2f6fb0);stroke-width:2;}' +
  '.trait-rose{fill:none;stroke:var(--rose,#b23a7a);stroke-width:2.6;}' +
  '.trait-attn{fill:none;stroke:var(--attn,#96650c);stroke-width:2;}' +
  '.pointille{stroke-dasharray:6 4;}' +
  '.fin{stroke-width:1.2;}' +
  '.poignee{fill:transparent;cursor:grab;touch-action:none;}' +
  '.poignee-active{fill:var(--accent,#b65c1f);fill-opacity:0.16;}' +
  '.c-acc{color:var(--accent-ink,#7a3c11);font-weight:700;}.c-good{color:var(--good,#2f7a4f);font-weight:700;}' +
  '.c-bad{color:var(--bad,#b23a3a);font-weight:700;}.c-plan{color:var(--plan-ink,#443a80);font-weight:700;}' +
  '.c-sky{color:var(--sky-ink,#1f4e7d);font-weight:700;}.c-rose{color:var(--rose,#b23a7a);font-weight:700;}' +
  '.c-attn{color:var(--attn,#96650c);font-weight:700;}' +
  '.note{font-size:0.86rem;color:var(--ink-soft,#51626f);}' +
  '.consigne{font-size:0.86rem;color:var(--ink-soft,#51626f);margin:0 0 8px;text-align:center;}' +
  '.verdict{font-weight:700;padding:8px 12px;border-radius:var(--radius,3px);margin:0 0 10px;font-size:0.92rem;line-height:1.5;}' +
  '.verdict.ok{color:var(--good,#2f7a4f);background:var(--good-soft,#dcefe2);}' +
  '.verdict.ko{color:var(--bad,#b23a3a);background:var(--bad-soft,#f6dede);}' +
  '.verdict.neutre{color:var(--ink,#182430);background:var(--surface-2,#f7f9fb);border:1px solid var(--line,#ccd8e0);}' +
  'select{min-height:44px;padding:6px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);background:var(--surface,#fff);' +
  'color:var(--ink,#182430);font:inherit;font-size:0.92rem;max-width:100%;}' +
  '.reglages{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:0 18px;}' +
  '.titre-panneau{font-weight:700;font-size:0.82rem;color:var(--ink-soft,#51626f);margin:0 0 4px;}' +
  '.panneau .ligne{line-height:2;}'

/* ---------------- Ajouts des ateliers 6 à 9 (cercles par 2 points, tangentes, arc capable,
 * repère affine) ---------------- */

/** Racine entière de n si n est un carré parfait (n ≥ 0), sinon −1. */
export function racineEntiere(n) {
  if (n < 0) return -1
  var s = Math.round(Math.sqrt(n))
  return s * s === n ? s : -1
}

/**
 * Placeur d'étiquettes dans une `<svg>` de L × H px : chaque étiquette prend la première place
 * libre parmi huit autour de son point (ni sur une autre étiquette, ni sur un point déclaré), puis
 * est décalée pour rester ENTIÈREMENT dans le cadre (jamais rognée).
 */
export function placeurEtiquettes(L, H) {
  var boites = [], points = []
  var OFFS = [[13, -9], [-13, -9], [13, 17], [-13, 17], [0, -13], [0, 22], [17, 5], [-17, 5]]
  function chevauche(b) {
    for (var i = 0; i < boites.length; i++) {
      var c = boites[i]
      if (b[0] < c[2] && b[2] > c[0] && b[1] < c[3] && b[3] > c[1]) return true
    }
    for (var j = 0; j < points.length; j++) {
      var p = points[j]
      if (p[0] + p[2] > b[0] && p[0] - p[2] < b[2] && p[1] + p[2] > b[1] && p[1] - p[2] < b[3]) return true
    }
    return false
  }
  function boite(cx, by, w) {
    var x0 = cx - w / 2, x1 = cx + w / 2, y0 = by - 12, y1 = by + 3
    if (x0 < 2) { x1 += 2 - x0; x0 = 2 }
    if (x1 > L - 2) { x0 -= x1 - (L - 2); x1 = L - 2 }
    if (y0 < 2) { y1 += 2 - y0; y0 = 2 }
    if (y1 > H - 2) { y0 -= y1 - (H - 2); y1 = H - 2 }
    return [x0, y0, x1, y1]
  }
  return {
    /** Déclare un point (px) que les étiquettes doivent éviter. */
    point: function (px, py, r) { points.push([px, py, r || 6]) },
    /** Pose le texte `txt` près du point (px, py) ; `prefs` : indices de OFFS à essayer d'abord. */
    poser: function (svg, px, py, txt, cls, prefs) {
      var w = txt.length * 8 + 2, ordre = (prefs || []).concat([0, 1, 2, 3, 4, 5, 6, 7]), choix = null
      for (var i = 0; i < ordre.length; i++) {
        var o = OFFS[ordre[i]], b = boite(px + o[0], py + o[1], w)
        if (!chevauche(b)) { choix = b; break }
      }
      if (!choix) { var o0 = OFFS[ordre[0]]; choix = boite(px + o0[0], py + o0[1], w) }
      boites.push(choix)
      var t = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      t.setAttribute('x', ((choix[0] + choix[2]) / 2).toFixed(1))
      t.setAttribute('y', (choix[3] - 3).toFixed(1))
      t.setAttribute('text-anchor', 'middle')
      t.setAttribute('class', 'et ' + (cls || ''))
      t.textContent = txt
      svg.appendChild(t)
      return t
    },
  }
}

/** Marque d'angle droit (carré de `taille` px) au sommet T (px), entre les directions vers U et V (px). */
export function marqueAngleDroit(svg, T, U, V, taille, cls) {
  var s = taille || 9
  var ux = U[0] - T[0], uy = U[1] - T[1], lu = Math.hypot(ux, uy)
  var vx = V[0] - T[0], vy = V[1] - T[1], lv = Math.hypot(vx, vy)
  if (lu < 1 || lv < 1) return
  ux *= s / lu; uy *= s / lu; vx *= s / lv; vy *= s / lv
  var d = 'M' + (T[0] + ux).toFixed(1) + ',' + (T[1] + uy).toFixed(1) +
    ' L' + (T[0] + ux + vx).toFixed(1) + ',' + (T[1] + uy + vy).toFixed(1) +
    ' L' + (T[0] + vx).toFixed(1) + ',' + (T[1] + vy).toFixed(1)
  var p = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  p.setAttribute('d', d); p.setAttribute('class', cls || 'trait-soft fin')
  svg.appendChild(p)
}

/** Polynôme en LaTeX à partir de [coefficient entier, monôme] : [[3,'a^2'],[-2,'ab']] → « 3a^2-2ab ». */
export function texPolynome(termes) {
  var s = ''
  termes.forEach(function (t) {
    var c = t[0], m = t[1]
    if (c === 0) return
    var abs = Math.abs(c), corps = m ? (abs === 1 ? m : abs + m) : String(abs)
    s += (s ? (c < 0 ? '-' : '+') : (c < 0 ? '-' : '')) + corps
  })
  return s || '0'
}
