/* ================================================================
 * <points-remarquables-widget> — atelier « Triangle déformable et points
 * remarquables » (6e, ch. 9, § 1). A, B, C à coordonnées entières, à
 * glisser (ou : choisir un sommet, puis curseurs x et y). Familles à
 * afficher : médianes (G), hauteurs (H), médiatrices (O et cercle
 * circonscrit), bissectrices (I et cercle inscrit), droite d'Euler,
 * cercle des neuf points (centre N, milieu de [OH], rayon R/2, et ses
 * neuf points : milieux des côtés, pieds des hauteurs, milieux de [AH],
 * [BH], [CH]). G, O, H, N en valeurs EXACTES (fractions) ; I approché
 * (sauf s'il est rationnel). Relation d'Euler en direct :
 * OH→ = 3·OG→, GH = 2·OG. Préréglages : quelconque, isocèle,
 * rectangle, obtus, équilatéral (sommets non entiers, valeurs
 * approchées). Fenêtre FIXE x de −7 à 7, y de −5 à 6 ; un triangle
 * aplati est refusé (le sommet garde sa dernière position).
 * Couleurs : médianes / G orange, hauteurs / H violet, médiatrices / O
 * bleu, bissectrices / I vert, droite d'Euler rose, neuf points ocre.
 * Web Component (Shadow DOM).
 * ================================================================ */
import './geo-analytique-commun.js'
import { styleKatex, tex, texEgalites, CSS_BASE } from './katex-shadow.js'
import { curseurHTML, lierCurseur, majCurseur, borner } from './variables-aleatoires-commun.js'
import { texFrac, texN, CSS_LIEUX } from './lieux-geometriques-commun.js'

var G = window.GeoAnaCommun
var FEN = { xMin: -7, xMax: 7, yMin: -5, yMax: 6 }
var R = G.repere(FEN, 26, 14)
var BORNE = { xMin: -6, xMax: 6, yMin: -4, yMax: 5 }
var ANGLE_MIN = 6 // degrés : en dessous, triangle refusé
var LOIN = 60
var NOMS = ['A', 'B', 'C']
var PRESETS = {
  quelconque: { nom: 'Quelconque', s: [[-4, -2], [4, -2], [1, 4]] },
  isocele: { nom: 'Isocèle', s: [[-3, -2], [3, -2], [0, 4]] },
  rectangle: { nom: 'Rectangle', s: [[-3, -2], [4, -2], [-3, 3]] },
  obtus: { nom: 'Obtus', s: [[-4, -2], [4, -2], [-2, 1]] },
  equilateral: { nom: 'Équilatéral', s: [[-3, -2], [3, -2], [0, -2 + 3 * Math.sqrt(3)]] },
}
var FAMILLES = [
  ['med', 'Médianes', 'acc'], ['hau', 'Hauteurs', 'plan'], ['mtr', 'Médiatrices', 'sky'],
  ['bis', 'Bissectrices', 'good'], ['eul', 'Droite d’Euler', 'rose'], ['neuf', 'Cercle des neuf points', 'attn'],
]

/* ---------- Rationnels ---------- */
function Q(p, q) { if (q < 0) { p = -p; q = -q } var g = G.pgcd(p, q); return { p: p / g, q: q / g } }
function qTex(a) { return texFrac(a.p, a.q) }
/** Écriture d'un nombre : fraction exacte si possible, sinon décimale (≈). */
function nTex(v, exact) { return exact ? qTex(exact) : texN(v, 2) }
function rationnelProche(v) {
  for (var q = 1; q <= 12; q++) { var p = Math.round(v * q); if (Math.abs(p / q - v) < 1e-9) return Q(p, q) }
  return null
}

function geometrie(s) {
  var A = s[0], B = s[1], C = s[2]
  var entiers = s.every(function (p) { return Number.isInteger(p[0]) && Number.isInteger(p[1]) })
  var ax = A[0], ay = A[1], bx = B[0], by = B[1], cx = C[0], cy = C[1]
  var D = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by))
  var a2 = ax * ax + ay * ay, b2 = bx * bx + by * by, c2 = cx * cx + cy * cy
  var oxN = a2 * (by - cy) + b2 * (cy - ay) + c2 * (ay - by)
  var oyN = a2 * (cx - bx) + b2 * (ax - cx) + c2 * (bx - ax)
  var sx = ax + bx + cx, sy = ay + by + cy
  var g = { x: sx / 3, y: sy / 3 }, o = { x: oxN / D, y: oyN / D }
  var h = { x: sx - 2 * o.x, y: sy - 2 * o.y }
  var n = { x: (o.x + h.x) / 2, y: (o.y + h.y) / 2 }
  var la = Math.hypot(bx - cx, by - cy), lb = Math.hypot(ax - cx, ay - cy), lc = Math.hypot(ax - bx, ay - by)
  var per = la + lb + lc
  var i = { x: (la * ax + lb * bx + lc * cx) / per, y: (la * ay + lb * by + lc * cy) / per }
  var aire = Math.abs(D) / 4
  var res = { A: A, B: B, C: C, G: g, O: o, H: h, N: n, I: i, R: Math.hypot(ax - o.x, ay - o.y), r: aire / (per / 2), la: la, lb: lb, lc: lc, entiers: entiers }
  if (entiers) {
    res.ex = {
      G: [Q(sx, 3), Q(sy, 3)], O: [Q(oxN, D), Q(oyN, D)],
      H: [Q(sx * D - 2 * oxN, D), Q(sy * D - 2 * oyN, D)], N: [Q(sx * D - oxN, 2 * D), Q(sy * D - oyN, 2 * D)],
    }
  }
  var ri = [rationnelProche(i.x), rationnelProche(i.y)]
  res.exI = ri[0] && ri[1] && entiers ? ri : null
  // Angles (degrés) et nature
  function angle(P, U, V) { var ux = U[0] - P[0], uy = U[1] - P[1], vx = V[0] - P[0], vy = V[1] - P[1]; return Math.acos(Math.max(-1, Math.min(1, (ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy))))) * 180 / Math.PI }
  res.angles = [angle(A, B, C), angle(B, C, A), angle(C, A, B)]
  var prodScal = [(bx - ax) * (cx - ax) + (by - ay) * (cy - ay), (cx - bx) * (ax - bx) + (cy - by) * (ay - by), (ax - cx) * (bx - cx) + (ay - cy) * (by - cy)]
  res.droit = -1; res.obtus = -1
  prodScal.forEach(function (ps, k) { if (Math.abs(ps) < 1e-9) res.droit = k; else if (ps < 0) res.obtus = k })
  var eq = function (u, v) { return Math.abs(u - v) < 1e-9 }
  res.equilateral = eq(la, lb) && eq(lb, lc)
  res.isocele = res.equilateral ? -1 : eq(lb, lc) ? 0 : eq(la, lc) ? 1 : eq(la, lb) ? 2 : -1
  return res
}

function aplati(s) {
  var A = s[0], B = s[1], C = s[2]
  var D = (B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0])
  if (Math.abs(D) < 1e-9) return true
  var gm = geometrie(s)
  return Math.min.apply(null, gm.angles) < ANGLE_MIN
}

/* ---------- Dessin ---------- */
function ligne(svg, x1, y1, x2, y2, cls) {
  var p = R.px(x1, y1), q = R.px(x2, y2)
  return G.el('line', { x1: p[0].toFixed(1), y1: p[1].toFixed(1), x2: q[0].toFixed(1), y2: q[1].toFixed(1), class: cls }, svg)
}
function droite(svg, P, ux, uy, cls) { var L = Math.hypot(ux, uy); ux /= L; uy /= L; ligne(svg, P.x - LOIN * ux, P.y - LOIN * uy, P.x + LOIN * ux, P.y + LOIN * uy, cls) }
function cercle(svg, c, r, cls) { var p = R.px(c.x, c.y); G.el('circle', { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: (r * R.unite).toFixed(1), class: cls }, svg) }
function point(svg, P, cls, r) { var p = R.px(P.x, P.y); G.el('circle', { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: r || 4, class: cls }, svg) }
function dans(P) { return P.x >= FEN.xMin + 0.15 && P.x <= FEN.xMax - 0.15 && P.y >= FEN.yMin + 0.15 && P.y <= FEN.yMax - 0.15 }
function etiquette(svg, P, txt, cls, dx, dy) {
  var p = R.px(P.x, P.y), w = txt.length * 8
  var tx = Math.max(4 + w / 2, Math.min(R.L - 4 - w / 2, p[0] + dx)), ty = Math.max(15, Math.min(R.H - 5, p[1] + dy))
  var t = G.el('text', { x: tx.toFixed(1), y: ty.toFixed(1), 'text-anchor': 'middle', class: 'et ' + cls }, svg)
  t.textContent = txt
}
function pied(P, U, V) {
  var dx = V[0] - U[0], dy = V[1] - U[1], t = ((P[0] - U[0]) * dx + (P[1] - U[1]) * dy) / (dx * dx + dy * dy)
  return { x: U[0] + t * dx, y: U[1] + t * dy, t: t }
}

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE + CSS_LIEUX +
  '.tri{fill:var(--accent,#b65c1f);fill-opacity:0.06;stroke:var(--ink,#182430);stroke-width:2.2;stroke-linejoin:round;}' +
  '.btn.f-acc[aria-pressed="true"]{background:var(--accent-soft,#f4e3d1);border-color:var(--accent,#b65c1f);color:var(--accent-ink,#7a3c11);}' +
  '.btn.f-plan[aria-pressed="true"]{background:var(--plan-soft,#ece9f8);border-color:var(--plan,#5b4ea3);color:var(--plan-ink,#443a80);}' +
  '.btn.f-sky[aria-pressed="true"]{background:var(--sky-soft,#dde9f5);border-color:var(--sky,#2f6fb0);color:var(--sky-ink,#1f4e7d);}' +
  '.btn.f-good[aria-pressed="true"]{background:var(--good-soft,#dcefe2);border-color:var(--good,#2f7a4f);color:var(--good,#2f7a4f);}' +
  '.btn.f-rose[aria-pressed="true"]{background:var(--surface-2,#f7f9fb);border-color:var(--rose,#b23a7a);color:var(--rose,#b23a7a);}' +
  '.btn.f-attn[aria-pressed="true"]{background:var(--attn-soft,#f7ecd6);border-color:var(--attn,#96650c);color:var(--attn,#96650c);}' +
  '.familles .btn,.presets .btn{font-size:0.86rem;}' +
  '.sommets .btn{min-width:52px;font-family:var(--serif,serif);font-style:italic;}' +
  '.coords p{line-height:1.9;}' +
  '.cas{font-weight:700;}' +
  '</style>' +
  '<div class="rangee presets" role="group" aria-label="Préréglages">' +
  Object.keys(PRESETS).map(function (k) { return '<button class="btn" data-p="' + k + '">' + PRESETS[k].nom + '</button>' }).join('') + '</div>' +
  '<p class="consigne">Fais glisser A, B ou C (coordonnées entières). Allume les familles de droites ci-dessous.</p>' +
  '<div class="figure"><svg id="svg" class="glisser" viewBox="0 0 ' + R.L + ' ' + R.H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Triangle ABC et ses points remarquables"></svg></div>' +
  '<p class="verdict neutre" id="cas" aria-live="polite"></p>' +
  '<div class="rangee familles" role="group" aria-label="Familles de droites">' +
  FAMILLES.map(function (f) { return '<button class="btn f-' + f[2] + '" data-f="' + f[0] + '">' + f[1] + '</button>' }).join('') + '</div>' +
  '<div class="rangee sommets" role="group" aria-label="Sommet à régler au clavier"><span class="etiquette">Sommet à régler :</span>' +
  NOMS.map(function (n, i) { return '<button class="btn" data-s="' + i + '">' + n + '</button>' }).join('') + '</div>' +
  '<div class="reglages">' + curseurHTML('sx', 'Abscisse du sommet', BORNE.xMin, BORNE.xMax, 1) + curseurHTML('sy', 'Ordonnée du sommet', BORNE.yMin, BORNE.yMax, 1) + '</div>' +
  '<div class="panneau coords" id="coords" aria-live="polite"></div>' +
  '<div class="panneau" id="euler" aria-live="polite"></div>'

class PointsRemarquablesWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._s = PRESETS.quelconque.s.map(function (p) { return p.slice() })
    this._preset = 'quelconque'
    this._actif = 2
    this._f = { med: true, hau: true, mtr: true, bis: false, eul: true, neuf: false }
    this._ecouteurs = []
    this._refus = false
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh, svg = sh.getElementById('svg')
    sh.querySelectorAll('[data-p]').forEach(function (b) {
      b.addEventListener('click', function () { self._preset = b.getAttribute('data-p'); self._s = PRESETS[self._preset].s.map(function (p) { return p.slice() }); self._refus = false; self._rendre() })
    })
    sh.querySelectorAll('[data-f]').forEach(function (b) {
      b.addEventListener('click', function () { var f = b.getAttribute('data-f'); self._f[f] = !self._f[f]; self._rendre() })
    })
    sh.querySelectorAll('[data-s]').forEach(function (b) {
      b.addEventListener('click', function () { self._actif = +b.getAttribute('data-s'); self._rendre() })
    })
    lierCurseur(sh, 'sx', function () { return Math.round(self._s[self._actif][0]) }, function (v) { self._deplacer(self._actif, v, Math.round(self._s[self._actif][1])) }, 1)
    lierCurseur(sh, 'sy', function () { return Math.round(self._s[self._actif][1]) }, function (v) { self._deplacer(self._actif, Math.round(self._s[self._actif][0]), v) }, 1)
    G.glisser(this, svg, R, function (n) { self._actif = NOMS.indexOf(n); self._rendre() }, function (n, x, y) { self._deplacer(NOMS.indexOf(n), x, y) })
    this._rendre()
  }

  disconnectedCallback() { /* les écouteurs vivent avec le Shadow DOM */ }

  _deplacer(i, x, y) {
    x = borner(Math.round(x), BORNE.xMin, BORNE.xMax); y = borner(Math.round(y), BORNE.yMin, BORNE.yMax)
    var cur = this._s[i]
    if (cur[0] === x && cur[1] === y) return
    var s = this._s.map(function (p) { return p.slice() })
    s[i] = [x, y]
    if (s.some(function (p, j) { return j !== i && p[0] === x && p[1] === y }) || aplati(s)) { this._refus = true; this._rendre(); return }
    this._refus = false
    this._s = s
    this._preset = null
    this._rendre()
  }

  _rendre() {
    var sh = this._sh, s = this._s, f = this._f, self = this
    var g = geometrie(s)
    sh.querySelectorAll('[data-p]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-p') === self._preset)) })
    sh.querySelectorAll('[data-f]').forEach(function (b) { b.setAttribute('aria-pressed', String(!!f[b.getAttribute('data-f')])) })
    sh.querySelectorAll('[data-s]').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-s') === self._actif)) })
    var act = s[this._actif]
    majCurseur(sh, 'sx', Math.round(act[0]), 'x_' + NOMS[this._actif] + '=' + (Number.isInteger(act[0]) ? act[0] : '\\approx ' + texN(act[0], 2)))
    majCurseur(sh, 'sy', Math.round(act[1]), 'y_' + NOMS[this._actif] + '=' + (Number.isInteger(act[1]) ? act[1] : '\\approx ' + texN(act[1], 2)))

    // ---------- Nature du triangle ----------
    var cas = sh.getElementById('cas'), txt
    if (g.equilateral) txt = 'Triangle équilatéral : G, O, H et I sont confondus. La droite d’Euler n’est pas définie (O = H).'
    else if (g.droit >= 0) txt = 'Triangle rectangle en ' + NOMS[g.droit] + ' : H est en ' + NOMS[g.droit] + ' (deux côtés sont des hauteurs) et O est le milieu de l’hypoténuse.'
    else if (g.obtus >= 0) txt = 'Triangle obtusangle en ' + NOMS[g.obtus] + ' : O et H sont à l’extérieur du triangle, de part et d’autre.'
    else txt = 'Triangle acutangle : G, O, H et I sont à l’intérieur du triangle.'
    if (!g.equilateral && g.isocele >= 0) txt += ' Isocèle en ' + NOMS[g.isocele] + ' : la droite d’Euler est son axe de symétrie, et I est dessus.'
    if (this._refus) txt = 'Position refusée : le triangle serait aplati (un angle de moins de 6°) ou deux sommets confondus. ' + txt
    cas.textContent = txt

    // ---------- Coordonnées ----------
    var ex = g.ex || {}
    function pt(nom, P, e, cls) {
      var exact = e || (Math.abs(P.x - Math.round(P.x)) < 1e-9 && Math.abs(P.y - Math.round(P.y)) < 1e-9)
      return '<span class="' + cls + '">' + tex(nom + (exact ? '' : '\\approx') + '\\left(' + nTex(P.x, e && e[0]) + '\\,;' + nTex(P.y, e && e[1]) + '\\right)') + '</span>'
    }
    var approx = g.entiers ? '' : '<p class="note">Sommets non entiers : valeurs approchées au centième.</p>'
    var h = '<p class="titre-panneau">Les points remarquables</p>' + approx
    h += '<p>' + NOMS.map(function (n, k) { return pt(n, { x: s[k][0], y: s[k][1] }, null, '') }).join(' ; ') + '</p>'
    if (f.med) h += '<p>' + pt('G', g.G, ex.G, 'c-acc') + ' : centre de gravité, concours des médianes. ' + tex('G=\\frac{A+B+C}{3}') + ' (moyenne des sommets), aux deux tiers de chaque médiane depuis le sommet.</p>'
    if (f.mtr) h += '<p>' + pt('O', g.O, ex.O, 'c-sky') + ' : centre du cercle circonscrit, concours des médiatrices (équidistant des trois sommets), ' + tex('R' + (Number.isInteger(Math.round(g.R * 1e9) / 1e9) ? '=' : '\\approx ') + texN(g.R, 2)) + '. Ce n’est <strong>pas</strong> la moyenne des sommets.</p>'
    if (f.hau) h += '<p>' + pt('H', g.H, ex.H, 'c-plan') + ' : orthocentre, concours des hauteurs.</p>'
    if (f.bis) h += '<p>' + pt('I', g.I, g.exI, 'c-good') + ' : centre du cercle inscrit, concours des bissectrices, ' + tex('I=\\frac{aA+bB+cC}{a+b+c}') + ' (pondéré par les longueurs des côtés opposés, a = BC, b = CA, c = AB), rayon ' + tex('r=\\frac{\\text{aire}}{\\text{demi-périmètre}}\\approx ' + texN(g.r, 2)) + '.</p>'
    if (f.neuf) h += '<p>' + pt('N', g.N, ex.N, 'c-attn') + ' : centre du cercle des neuf points, milieu de [OH], rayon ' + tex('\\frac{R}{2}\\approx ' + texN(g.R / 2, 2)) + '. Il passe par les milieux des côtés, les pieds des hauteurs et les milieux de [AH], [BH], [CH].</p>'
    var hors = ['G', 'O', 'H', 'I', 'N'].filter(function (k) { return (k !== 'N' || f.neuf) && (k !== 'I' || f.bis) && !dans(g[k]) })
    if (hors.length) h += '<p class="note">Hors du cadre : ' + hors.join(', ') + '.</p>'
    sh.getElementById('coords').innerHTML = h

    // ---------- Euler ----------
    var e = '<p class="titre-panneau">La droite d’Euler</p>'
    if (g.equilateral) e += '<p>O = G = H : les trois points sont confondus, il n’y a pas de droite d’Euler.</p>'
    else {
      var og = Math.hypot(g.G.x - g.O.x, g.G.y - g.O.y), gh = Math.hypot(g.H.x - g.G.x, g.H.y - g.G.y)
      if (g.entiers) {
        var ogx = Q(ex.G[0].p * ex.O[0].q - ex.O[0].p * ex.G[0].q, ex.G[0].q * ex.O[0].q), ogy = Q(ex.G[1].p * ex.O[1].q - ex.O[1].p * ex.G[1].q, ex.G[1].q * ex.O[1].q)
        var ohx = Q(ex.H[0].p * ex.O[0].q - ex.O[0].p * ex.H[0].q, ex.H[0].q * ex.O[0].q), ohy = Q(ex.H[1].p * ex.O[1].q - ex.O[1].p * ex.H[1].q, ex.H[1].q * ex.O[1].q)
        e += '<p class="ligne">' + tex('\\overrightarrow{OG}=\\left(' + qTex(ogx) + '\\,;' + qTex(ogy) + '\\right)') + ' et ' + tex('\\overrightarrow{OH}=\\left(' + qTex(ohx) + '\\,;' + qTex(ohy) + '\\right)') + ', donc ' + tex('\\overrightarrow{OH}=3\\,\\overrightarrow{OG}') + ' : O, G et H sont alignés.</p>'
      } else e += '<p class="ligne">' + tex('\\overrightarrow{OH}=3\\,\\overrightarrow{OG}') + ' : O, G et H sont alignés.</p>'
      e += '<p class="ligne">' + texEgalites(['OG\\approx ' + texN(og, 2), 'GH\\approx ' + texN(gh, 2)], ' ;\\ ') + ' : ' + tex('GH=2\\,OG') + ' (G est entre O et H, au tiers de [OH] en partant de O).</p>'
      if (g.droit >= 0) e += '<p>Ici H = ' + NOMS[g.droit] + ' et O est le milieu de l’hypoténuse : la droite d’Euler est la médiane issue de ' + NOMS[g.droit] + '.</p>'
    }
    sh.getElementById('euler').innerHTML = e

    // ---------- Figure ----------
    var svg = sh.getElementById('svg')
    svg.innerHTML = ''
    R.fond(svg, 2)
    var clip = G.el('clipPath', { id: 'cadre' }, svg.querySelector('defs'))
    G.el('rect', { x: R.marge, y: R.marge, width: R.L - 2 * R.marge, height: R.H - 2 * R.marge }, clip)
    var gr = G.el('g', { 'clip-path': 'url(#cadre)' }, svg)
    var A = s[0], B = s[1], C = s[2]
    var P = R.px
    G.el('polygon', { points: s.map(function (q) { var p = P(q[0], q[1]); return p[0].toFixed(1) + ',' + p[1].toFixed(1) }).join(' '), class: 'tri' }, gr)
    var milieux = [[(B[0] + C[0]) / 2, (B[1] + C[1]) / 2], [(A[0] + C[0]) / 2, (A[1] + C[1]) / 2], [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2]]
    var opp = [[B, C], [C, A], [A, B]]
    if (f.mtr) {
      cercle(gr, g.O, g.R, 'trait-sky fin')
      milieux.forEach(function (m, k) { var u = opp[k]; droite(gr, { x: m[0], y: m[1] }, -(u[1][1] - u[0][1]), u[1][0] - u[0][0], 'trait-sky fin pointille') })
    }
    if (f.hau) {
      s.forEach(function (S, k) {
        var u = opp[k], pd = pied(S, u[0], u[1])
        droite(gr, { x: S[0], y: S[1] }, -(u[1][1] - u[0][1]), u[1][0] - u[0][0], 'trait-plan fin')
        // Pied hors du côté : prolongement du côté en pointillé
        if (pd.t < 0 || pd.t > 1) ligne(gr, pd.t < 0 ? u[0][0] : u[1][0], pd.t < 0 ? u[0][1] : u[1][1], pd.x, pd.y, 'trait-soft pointille fin')
        point(gr, pd, 'pt-plan', 2.5)
      })
    }
    if (f.med) s.forEach(function (S, k) { ligne(gr, S[0], S[1], milieux[k][0], milieux[k][1], 'trait-acc fin'); point(gr, { x: milieux[k][0], y: milieux[k][1] }, 'pt-acc', 2.5) })
    if (f.bis) {
      cercle(gr, g.I, g.r, 'trait-good fin')
      var cotes = [g.la, g.lb, g.lc]
      s.forEach(function (S, k) {
        var u = opp[k], b1 = cotes[(k + 2) % 3], c1 = cotes[(k + 1) % 3] // pied : divise le côté opposé dans le rapport des côtés adjacents
        var t = b1 / (b1 + c1)
        ligne(gr, S[0], S[1], u[0][0] + t * (u[1][0] - u[0][0]), u[0][1] + t * (u[1][1] - u[0][1]), 'trait-good fin')
      })
    }
    if (f.neuf) {
      cercle(gr, g.N, g.R / 2, 'trait-attn fin')
      var neuf = milieux.map(function (m) { return { x: m[0], y: m[1] } })
      s.forEach(function (S, k) { var u = opp[k]; neuf.push(pied(S, u[0], u[1])); neuf.push({ x: (S[0] + g.H.x) / 2, y: (S[1] + g.H.y) / 2 }) })
      neuf.forEach(function (q) { point(gr, q, 'pt-attn', 2.8) })
    }
    if (f.eul && !g.equilateral) droite(gr, g.O, g.H.x - g.O.x, g.H.y - g.O.y, 'trait-rose')
    // Sommets et poignées
    s.forEach(function (S, k) {
      var p = P(S[0], S[1])
      G.el('circle', { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: 5, class: 'pt' }, svg)
      var gx = g.G.x, gy = g.G.y, dx = S[0] - gx, dy = S[1] - gy, L = Math.hypot(dx, dy) || 1
      etiquette(svg, { x: S[0], y: S[1] }, NOMS[k], '', 14 * dx / L, -14 * dy / L + 5)
      G.poignee(svg, R, S[0], S[1], NOMS[k], k === self._actif)
    })
    // Points remarquables (I et N seulement si leur famille est allumée)
    var pts = []
    if (f.mtr) pts.push(['O', g.O, 'sky'])
    if (f.hau) pts.push(['H', g.H, 'plan'])
    if (f.med) pts.push(['G', g.G, 'acc'])
    if (f.bis) pts.push(['I', g.I, 'good'])
    if (f.neuf) pts.push(['N', g.N, 'attn'])
    // Étiquettes : première position libre parmi 8 (ni sur une autre étiquette, ni sur un point posé)
    var boites = [], centres = pts.filter(function (q) { return dans(q[1]) }).map(function (q) { return R.px(q[1].x, q[1].y) })
    s.forEach(function (S) { centres.push(R.px(S[0], S[1])) })
    var OFFS = [[11, -9], [11, 15], [-11, -9], [-11, 15], [0, -15], [0, 21], [18, 4], [-18, 4]]
    pts.forEach(function (q) {
      if (!dans(q[1])) return
      point(svg, q[1], 'pt-' + q[2], 4.5)
    })
    pts.forEach(function (q) {
      if (!dans(q[1])) return
      var p = R.px(q[1].x, q[1].y), choix = OFFS[0]
      for (var i = 0; i < OFFS.length; i++) {
        var bx = p[0] + OFFS[i][0] - 6, by = p[1] + OFFS[i][1] - 12, libre = true
        boites.forEach(function (b) { if (bx < b[0] + 12 && bx + 12 > b[0] && by < b[1] + 14 && by + 14 > b[1]) libre = false })
        centres.forEach(function (c) { if (c[0] > bx - 3 && c[0] < bx + 15 && c[1] > by - 3 && c[1] < by + 17) libre = false })
        if (libre) { choix = OFFS[i]; break }
      }
      boites.push([p[0] + choix[0] - 6, p[1] + choix[1] - 12])
      etiquette(svg, q[1], q[0], 'et-' + q[2], choix[0], choix[1])
    })
  }
}

if (!customElements.get('points-remarquables-widget')) customElements.define('points-remarquables-widget', PointsRemarquablesWidget)
