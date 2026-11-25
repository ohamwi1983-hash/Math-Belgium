/* ================================================================
 * Outils partagés par les ateliers du chapitre « Statistique à deux
 * variables » (5e, ch. 6) : calculs d'une série (moyennes, variances et
 * écarts-types divisés par n, covariance, droite des moindres carrés
 * y = ax + b, coefficient de corrélation r et son interprétation selon
 * le tableau du cours), droite de Mayer (tri, groupes d'effectifs égaux
 * à une unité près : le PREMIER groupe a ⌊n/2⌋ points), somme des carrés
 * des écarts verticaux ; repère statistique à fenêtre FIXE (échelles
 * indépendantes en x et en y, graduations écrites dans les marges, donc
 * jamais rognées ni cachées par un point) ; nuage éditable à la souris
 * et au doigt (ajouter, déplacer, retirer des points, valeurs aimantées
 * sur un pas) ; écritures à la belge (virgule, « − »).
 * KaTeX par `katex-shadow.js`, curseurs − / + par
 * `variables-aleatoires-commun.js`, styles des tracés par
 * `lieux-geometriques-commun.js` (CSS_LIEUX).
 * ================================================================ */
import { texNombre } from './katex-shadow.js'

var SVGNS = 'http://www.w3.org/2000/svg'

/** Élément SVG avec attributs, ajouté à `parent` s'il est donné. */
export function el(tag, attrs, parent) {
  var e = document.createElementNS(SVGNS, tag)
  for (var k in attrs) e.setAttribute(k, attrs[k])
  if (parent) parent.appendChild(e)
  return e
}

/** Texte SVG. */
export function texte(parent, x, y, contenu, cls, ancre) {
  var t = el('text', { x: (+x).toFixed(1), y: (+y).toFixed(1), class: cls || 'et', 'text-anchor': ancre || 'middle' }, parent)
  t.textContent = contenu
  return t
}

/* ---------------- Nombres ---------------- */

/** Arrondi à d décimales (demi vers l'extérieur, sans l'erreur de 1,005 × 100). */
export function arr(x, d) {
  var f = Math.pow(10, d)
  return Math.round(x * f + (x >= 0 ? 1e-9 : -1e-9)) / f
}

/** Valeur décimale exacte à `d` décimales (sinon on écrit « ≈ »). */
export function exact(x, d) {
  var f = Math.pow(10, d === undefined ? 4 : d)
  return Math.abs(Math.round(x * f) - x * f) < 1e-6
}

/** Texte courant : virgule, « − », au plus d décimales (zéros finaux retirés). */
export function txt(x, d) {
  var v = arr(x, d === undefined ? 2 : d)
  if (v === 0) v = 0
  var s = v.toFixed(d === undefined ? 2 : d)
  if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '')
  return s.replace('.', ',').replace('-', '−')
}

/** LaTeX : virgule « {,} », au plus d décimales. */
export function tn(x, d) { return texNombre(arr(x, d === undefined ? 2 : d), d === undefined ? 2 : d) }

/** « =3{,}5 » si la valeur est exacte à 4 décimales, sinon « \approx 3{,}57 » (d décimales). */
export function egal(x, d) {
  return exact(x, 4) ? '=' + tn(x, 4) : '\\approx ' + tn(x, d === undefined ? 2 : d)
}

/** Couple « (3,5 ; 11) » en texte courant (espaces insécables). */
export function couple(x, y, d) { return '(' + txt(x, d) + ' ; ' + txt(y, d) + ')' }

/** Équation « y = 0{,}6x + 2{,}2 » en LaTeX (a et b au plus d décimales). */
export function texEquation(a, b, d) {
  d = d === undefined ? 2 : d
  var av = arr(a, d), bv = arr(b, d)
  var s = 'y='
  if (av === 0) return s + tn(bv, d)
  s += av === 1 ? 'x' : av === -1 ? '-x' : tn(av, d) + 'x'
  if (bv !== 0) s += (bv < 0 ? '-' : '+') + tn(Math.abs(bv), d)
  return s
}

/** Équation « y = 0,6x + 2,2 » en texte courant (pour les aria-label). */
export function txtEquation(a, b, d) {
  return texEquation(a, b, d).replace(/\{,\}/g, ',').replace(/-/g, ' − ').replace(/\+/g, ' + ').replace('y=', 'y = ').replace('=  − ', '= −')
}

/* ---------------- Calculs d'une série ---------------- */

/**
 * Série de couples [[x, y], …] : n, moyennes, variances et écarts-types (division par n),
 * covariance, droite des moindres carrés (a, b ; null si tous les x sont égaux), r (null si
 * tous les x ou tous les y sont égaux).
 */
export function statistiques(pts) {
  var n = pts.length
  if (!n) return null
  var sx = 0, sy = 0, i
  for (i = 0; i < n; i++) { sx += pts[i][0]; sy += pts[i][1] }
  var mx = sx / n, my = sy / n, vx = 0, vy = 0, c = 0
  for (i = 0; i < n; i++) {
    var dx = pts[i][0] - mx, dy = pts[i][1] - my
    vx += dx * dx; vy += dy * dy; c += dx * dy
  }
  vx /= n; vy /= n; c /= n
  var ex = 1e-12 * (1 + mx * mx), ey = 1e-12 * (1 + my * my)
  var a = vx > ex ? c / vx : null
  var r = vx > ex && vy > ey ? Math.max(-1, Math.min(1, c / Math.sqrt(vx * vy))) : null
  return { n: n, mx: mx, my: my, vx: vx, vy: vy, sx: Math.sqrt(vx), sy: Math.sqrt(vy), cov: c, a: a, b: a === null ? null : my - a * mx, r: r, sommeX: sx, sommeY: sy }
}

/**
 * Droite de Mayer : couples triés selon x (puis y), premier groupe de ⌊n/2⌋ points, second du
 * reste ; G₁, G₂, pente a et ordonnée à l'origine b (a = null si G₁ et G₂ ont la même abscisse).
 */
export function mayer(pts) {
  var n = pts.length
  if (n < 2) return null
  var tries = pts.map(function (p, i) { return [p[0], p[1], i] }).sort(function (p, q) { return p[0] - q[0] || p[1] - q[1] || p[2] - q[2] })
  var n1 = Math.floor(n / 2)
  function moy(L) {
    var x = 0, y = 0
    L.forEach(function (p) { x += p[0]; y += p[1] })
    return { x: x / L.length, y: y / L.length, sx: x, sy: y }
  }
  var g1 = tries.slice(0, n1), g2 = tries.slice(n1)
  var G1 = moy(g1), G2 = moy(g2)
  var a = Math.abs(G2.x - G1.x) < 1e-12 ? null : (G2.y - G1.y) / (G2.x - G1.x)
  return { tries: tries, n1: n1, n2: n - n1, groupe1: g1, groupe2: g2, G1: G1, G2: G2, a: a, b: a === null ? null : G1.y - a * G1.x }
}

/** Somme des carrés des écarts verticaux yᵢ − (axᵢ + b). */
export function sommeCarres(pts, a, b) {
  var s = 0
  for (var i = 0; i < pts.length; i++) { var e = pts[i][1] - (a * pts[i][0] + b); s += e * e }
  return s
}

/* ---------------- Coefficient de corrélation ---------------- */

/**
 * r écrit à 3 décimales (« r ≈ 0{,}912 ») ; s'il s'arrondit à ±1 sans être égal à ±1, on
 * ajoute des décimales (« r ≈ 0{,}9996 ») : « 1 » est réservé aux points alignés.
 */
export function texR(r) {
  if (Math.abs(Math.abs(r) - 1) < 1e-9) return (r < 0 ? '=-1' : '=1')
  for (var d = 3; d < 8; d++) { if (Math.abs(arr(r, d)) < 1) return egal(r, d) }
  return egal(r, 8)
}
/** r en texte courant, relation comprise : « = 0,5 », « ≈ 0,912 », « = −1 ». */
export function txtR(r) {
  if (r === null || r === undefined) return 'non défini'
  if (Math.abs(Math.abs(r) - 1) < 1e-9) return r < 0 ? '= −1' : '= 1'
  for (var d = 3; d < 8; d++) { if (Math.abs(arr(r, d)) < 1) return (exact(r, 4) ? '= ' : '≈ ') + txt(r, d) }
  return '≈ ' + txt(r, 8)
}

/**
 * Intensité selon le tableau du cours (seuils du document du professeur) : |r| = 1 parfaite ;
 * 0,98 ≤ |r| < 1 très forte ; 0,80 ≤ |r| < 0,98 forte ; 0,60 ≤ |r| < 0,80 moyenne ;
 * 0,35 ≤ |r| < 0,60 faible ; |r| < 0,35 nulle. Le classement suit la valeur AFFICHÉE (3 décimales),
 * pour qu'un r écrit « 0,800 » ne soit jamais dit « moyen ».
 */
export function intensiteR(r) {
  var v = Math.abs(r)
  if (Math.abs(v - 1) < 1e-9) return 'parfaite'
  var v3 = arr(v, 3)
  if (v3 >= 0.98) return 'très forte'
  if (v3 >= 0.8) return 'forte'
  if (v3 >= 0.6) return 'moyenne'
  if (v3 >= 0.35) return 'faible'
  return 'nulle'
}

/** Phrase d'interprétation : « corrélation positive forte », « corrélation nulle »… */
export function phraseR(r) {
  if (r === null || r === undefined) return 'r n’est pas défini (tous les x, ou tous les y, sont égaux)'
  var i = intensiteR(r)
  if (i === 'nulle') return 'corrélation linéaire nulle'
  if (i === 'parfaite') return 'corrélation ' + (r > 0 ? 'positive' : 'négative') + ' parfaite (points alignés)'
  return 'corrélation ' + (r > 0 ? 'positive' : 'négative') + ' ' + i
}

/* ---------------- Repère statistique à fenêtre fixe ---------------- */

/**
 * o = { xMin, xMax, yMin, yMax, ux, uy (px par unité), pasX, pasY (graduations), grilleX, grilleY
 * (quadrillage, défaut = pas), nomX, nomY, etiqX(v), etiqY(v) (texte d'une graduation),
 * mg, md, mh, mb (marges px) }. Graduations dans les marges : jamais rognées.
 */
export function repereStat(o) {
  var mg = o.mg === undefined ? 40 : o.mg, md = o.md === undefined ? 12 : o.md
  var mh = o.mh === undefined ? 22 : o.mh, mb = o.mb === undefined ? 38 : o.mb
  var Lp = (o.xMax - o.xMin) * o.ux, Hp = (o.yMax - o.yMin) * o.uy
  var R = {
    o: o, mg: mg, md: md, mh: mh, mb: mb, L: Lp + mg + md, H: Hp + mh + mb,
    x0: mg, x1: mg + Lp, y0: mh, y1: mh + Hp,
    px: function (x, y) { return [mg + (x - o.xMin) * o.ux, mh + (o.yMax - y) * o.uy] },
    monde: function (svg, cx, cy) {
      var ctm = svg.getScreenCTM()
      if (!ctm) return null
      var pt = svg.createSVGPoint()
      pt.x = cx; pt.y = cy
      var q = pt.matrixTransform(ctm.inverse())
      return { x: o.xMin + (q.x - mg) / o.ux, y: o.yMax - (q.y - mh) / o.uy, dansCadre: q.x >= mg - 2 && q.x <= mg + Lp + 2 && q.y >= mh - 2 && q.y <= mh + Hp + 2 }
    },
    dans: function (x, y) { return x >= o.xMin - 1e-9 && x <= o.xMax + 1e-9 && y >= o.yMin - 1e-9 && y <= o.yMax + 1e-9 },
  }
  /** Quadrillage, axes (en x = 0 / y = 0 s'ils sont dans la fenêtre, sinon au bord), graduations. */
  R.fond = function (svg, idClip) {
    var defs = el('defs', {}, svg)
    var mk = el('marker', { id: 'fl-stat', markerWidth: '8', markerHeight: '8', refX: '6', refY: '4', orient: 'auto' }, defs)
    el('path', { d: 'M0,0 L8,4 L0,8 Z', class: 'fleche-axe' }, mk)
    var clip = el('clipPath', { id: idClip || 'cadre-stat' }, defs)
    el('rect', { x: mg, y: mh, width: Lp, height: Hp }, clip)
    el('rect', { x: mg, y: mh, width: Lp, height: Hp, class: 'fond-cadre' }, svg)
    var gx = o.grilleX || o.pasX, gy = o.grilleY || o.pasY, v, p
    for (v = Math.ceil(o.xMin / gx - 1e-9) * gx; v <= o.xMax + 1e-9; v += gx) { p = R.px(v, 0)[0]; el('line', { x1: p.toFixed(1), y1: mh, x2: p.toFixed(1), y2: mh + Hp, class: 'grille' }, svg) }
    for (v = Math.ceil(o.yMin / gy - 1e-9) * gy; v <= o.yMax + 1e-9; v += gy) { p = R.px(0, v)[1]; el('line', { x1: mg, y1: p.toFixed(1), x2: mg + Lp, y2: p.toFixed(1), class: 'grille' }, svg) }
    var ax = o.yMin <= 0 && o.yMax >= 0 ? R.px(0, 0)[1] : mh + Hp
    var ay = o.xMin <= 0 && o.xMax >= 0 ? R.px(0, 0)[0] : mg
    el('line', { x1: mg, y1: ax.toFixed(1), x2: (mg + Lp + 8).toFixed(1), y2: ax.toFixed(1), class: 'axe', 'marker-end': 'url(#fl-stat)' }, svg)
    el('line', { x1: ay.toFixed(1), y1: mh + Hp, x2: ay.toFixed(1), y2: (mh - 8).toFixed(1), class: 'axe', 'marker-end': 'url(#fl-stat)' }, svg)
    var ex = o.etiqX || function (t) { return txt(t, 2) }, ey = o.etiqY || function (t) { return txt(t, 2) }
    for (v = Math.ceil(o.xMin / o.pasX - 1e-9) * o.pasX; v <= o.xMax + 1e-9; v += o.pasX) {
      p = R.px(v, 0)[0]
      el('line', { x1: p.toFixed(1), y1: mh + Hp, x2: p.toFixed(1), y2: mh + Hp + 4, class: 'tick' }, svg)
      var lab = ex(arr(v, 6)), demi = lab.length * 3.9 + 1
      texte(svg, Math.max(demi, Math.min(R.L - demi, p)), mh + Hp + 16, lab, 'graduation')
    }
    for (v = Math.ceil(o.yMin / o.pasY - 1e-9) * o.pasY; v <= o.yMax + 1e-9; v += o.pasY) {
      p = R.px(0, v)[1]
      el('line', { x1: mg - 4, y1: p.toFixed(1), x2: mg, y2: p.toFixed(1), class: 'tick' }, svg)
      texte(svg, mg - 6, p + 4, ey(arr(v, 6)), 'graduation', 'end')
    }
    if (o.nomX) texte(svg, mg + Lp, mh + Hp + 32, o.nomX, 'nom-axe', 'end')
    if (o.nomY) texte(svg, Math.max(4, ay - 6), mh - 8, o.nomY, 'nom-axe', ay - 6 < 60 ? 'start' : 'end')
  }
  /** Groupe découpé au cadre. */
  R.groupe = function (svg, idClip) { return el('g', { 'clip-path': 'url(#' + (idClip || 'cadre-stat') + ')' }, svg) }
  /** Droite y = ax + b dans la fenêtre (segment entre xMin et xMax, découpé par le groupe). */
  R.droite = function (g, a, b, cls) {
    var p = R.px(o.xMin, a * o.xMin + b), q = R.px(o.xMax, a * o.xMax + b)
    return el('line', { x1: p[0].toFixed(1), y1: p[1].toFixed(1), x2: q[0].toFixed(1), y2: q[1].toFixed(1), class: cls }, g)
  }
  /** Ramène (x, y) dans la fenêtre et sur la grille de pas (px, py). */
  R.aimanter = function (x, y, pasX, pasY) {
    var nx = Math.round(x / pasX) * pasX, ny = Math.round(y / pasY) * pasY
    nx = Math.max(Math.ceil(o.xMin / pasX - 1e-9) * pasX, Math.min(Math.floor(o.xMax / pasX + 1e-9) * pasX, nx))
    ny = Math.max(Math.ceil(o.yMin / pasY - 1e-9) * pasY, Math.min(Math.floor(o.yMax / pasY + 1e-9) * pasY, ny))
    return [arr(nx, 6), arr(ny, 6)]
  }
  return R
}

/** Point du nuage : disque (classe `cls`) + zone de prise invisible (data-pt = indice). */
export function pointNuage(svg, R, x, y, i, cls, rayon) {
  var p = R.px(x, y)
  el('circle', { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: rayon || 5, class: cls || 'pt' }, svg)
  if (i !== null && i !== undefined) el('circle', { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: 17, class: 'prise', 'data-pt': String(i) }, svg)
}

/** Marque d'un point moyen : croix dans un cercle (G, G₁, G₂). */
export function marquePointMoyen(svg, R, x, y, cls) {
  var p = R.px(x, y), c = p[0].toFixed(1), d = p[1].toFixed(1)
  el('circle', { cx: c, cy: d, r: 7, class: 'pm ' + (cls || '') }, svg)
  el('path', { d: 'M' + (p[0] - 7).toFixed(1) + ',' + d + ' H' + (p[0] + 7).toFixed(1) + ' M' + c + ',' + (p[1] - 7).toFixed(1) + ' V' + (p[1] + 7).toFixed(1), class: 'pm-croix ' + (cls || '') }, svg)
}

/**
 * Nuage éditable au doigt et à la souris. o = {
 *   points: () => tableau [[x, y], …] (modifié sur place),
 *   mode: () => 'ajouter' | 'retirer',  pasX, pasY (aimant),  min, max (effectifs),
 *   fixe: (i) => true si le point i ne se déplace pas,  surChange: () => rendu,
 * }. Dans le mode « ajouter », toucher une place vide du cadre ajoute un point (qu'on peut aussitôt
 * faire glisser) et toucher un point le saisit ; dans le mode « retirer », toucher un point le retire.
 * La capture du pointeur est posée sur la <svg> (qui survit aux rendus) : le glissé continue même
 * quand le doigt sort du point, et la page ne défile pas (touch-action: none sur la figure).
 */
export function nuageEditable(widget, svg, R, o) {
  var actif = -1
  function ecoute(c, t, f, opt) { c.addEventListener(t, f, opt); (widget._ecouteurs = widget._ecouteurs || []).push([c, t, f]) }
  ecoute(svg, 'pointerdown', function (e) {
    var pts = o.points()
    var at = e.target && e.target.getAttribute && e.target.getAttribute('data-pt')
    var mode = o.mode ? o.mode() : 'ajouter'
    if (at !== null && at !== undefined && at !== '') {
      var i = +at
      e.preventDefault()
      if (mode === 'retirer') {
        if (pts.length > (o.min || 0) && !(o.fixe && o.fixe(i))) { pts.splice(i, 1); o.surChange('retrait') }
        return
      }
      if (o.fixe && o.fixe(i)) return
      actif = i
    } else {
      if (mode !== 'ajouter' || o.ajoutInterdit) return
      var m = R.monde(svg, e.clientX, e.clientY)
      if (!m || !m.dansCadre) return
      e.preventDefault()
      if (pts.length >= (o.max || 30)) { o.surChange('plein'); return }
      pts.push(R.aimanter(m.x, m.y, o.pasX, o.pasY))
      actif = pts.length - 1
      o.surChange('ajout')
    }
    try { svg.setPointerCapture(e.pointerId) } catch (err) { /* rien */ }
  })
  ecoute(svg, 'pointermove', function (e) {
    if (actif < 0) return
    e.preventDefault()
    var m = R.monde(svg, e.clientX, e.clientY)
    if (!m) return
    var pts = o.points(), q = R.aimanter(m.x, m.y, o.pasX, o.pasY)
    if (!pts[actif] || (pts[actif][0] === q[0] && pts[actif][1] === q[1])) return
    pts[actif] = q
    o.surChange('deplacement')
  })
  function fin(e) {
    if (actif < 0) return
    actif = -1
    try { svg.releasePointerCapture(e.pointerId) } catch (err) { /* rien */ }
    o.surChange('fin')
  }
  ecoute(svg, 'pointerup', fin)
  ecoute(svg, 'pointercancel', fin)
  return { actif: function () { return actif } }
}

/** Liste de couples « (1 ; 8), (2 ; 9) » en texte courant. */
export function listeCouples(pts, d) { return pts.map(function (p) { return couple(p[0], p[1], d) }).join(', ') }

/** Somme « 1+2+3{,}5 » en LaTeX (négatifs entre parenthèses). */
export function texSomme(vals, d) {
  return vals.map(function (v, i) { var s = tn(v, d); return v < 0 ? (i === 0 ? s : '(' + s + ')') : s }).join('+')
}

/** Générateur pseudo-aléatoire reproductible (mulberry32). */
export function alea(graine) {
  var a = graine >>> 0
  return function () {
    a = (a + 0x6d2b79f5) >>> 0
    var t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Styles propres aux ateliers de statistique (en plus de CSS_BASE et CSS_LIEUX). */
export var CSS_STAT =
  '.fond-cadre{fill:var(--surface,#fff);}' +
  '.figure svg{max-width:460px;}' +
  '.prise{fill:transparent;cursor:grab;touch-action:none;}' +
  '.pm{fill:var(--surface,#fff);stroke:var(--accent,#b65c1f);stroke-width:2.2;}' +
  '.pm-croix{fill:none;stroke:var(--accent,#b65c1f);stroke-width:1.8;}' +
  '.pm.g1,.pm-croix.g1{stroke:var(--sky,#2f6fb0);}' +
  '.pm.g2,.pm-croix.g2{stroke:var(--plan,#5b4ea3);}' +
  '.pt-g1{fill:var(--sky,#2f6fb0);}.pt-g2{fill:var(--plan,#5b4ea3);}' +
  '.carre{fill:var(--bad,#b23a3a);fill-opacity:0.16;stroke:var(--bad,#b23a3a);stroke-width:1.2;}' +
  '.carre-bon{fill:var(--good,#2f7a4f);fill-opacity:0.14;stroke:var(--good,#2f7a4f);stroke-width:1.2;stroke-dasharray:4 3;}' +
  '.rect-plus{fill:var(--good,#2f7a4f);fill-opacity:0.2;stroke:var(--good,#2f7a4f);stroke-width:1;}' +
  '.rect-moins{fill:var(--bad,#b23a3a);fill-opacity:0.2;stroke:var(--bad,#b23a3a);stroke-width:1;}' +
  '.bande-int{fill:var(--good,#2f7a4f);fill-opacity:0.12;}' +
  '.bande-ext{fill:var(--attn,#96650c);fill-opacity:0.10;}' +
  '.bande-imp{fill:var(--bad,#b23a3a);fill-opacity:0.10;}' +
  '.nom-axe{font-size:13px;font-style:italic;font-family:var(--sans,sans-serif);fill:var(--ink-soft,#51626f);' +
  'paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3px;stroke-linejoin:round;}' +
  '.graduation{font-size:13px;}' +
  '.tick{stroke:var(--ink-soft,#51626f);stroke-width:1.1;}' +
  '.axe{stroke:var(--ink-soft,#51626f);stroke-width:1.3;}' +
  '.mode .btn{font-size:0.88rem;}' +
  '.liste{font-variant-numeric:tabular-nums;}' +
  '.tableau{border-collapse:collapse;margin:4px auto 6px;font-size:0.88rem;font-variant-numeric:tabular-nums;}' +
  '.tableau th,.tableau td{border:1px solid var(--line,#ccd8e0);padding:3px 6px;text-align:center;}' +
  '.tableau th{background:var(--surface-2,#f7f9fb);font-weight:700;}' +
  '.defile{overflow-x:auto;max-width:100%;}' +
  '[hidden]{display:none !important;}' +
  '.c-soft{color:var(--ink-soft,#51626f);font-weight:700;}'
