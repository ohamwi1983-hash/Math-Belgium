/* ================================================================
 * <trois-miroirs-widget> — atelier « Trois miroirs » (6e, ch. 10, § 6).
 * Trois miroirs : parabole y² = 4x (p = 2, F(1 ; 0)), ellipse
 * x²/25 + y²/16 = 1 (F(3 ; 0), F′(−3 ; 0)), hyperbole x²/9 − y²/16 = 1
 * (F(5 ; 0), F′(−5 ; 0) ; seule la branche de droite est un miroir).
 * Sources : faisceau parallèle à l'axe, ou source à un foyer, ou (pour
 * l'hyperbole) rayons qui visent F (montage de Cassegrain). Le point
 * d'impact P se déplace (glissé ou curseur) : tangente (pointillés),
 * normale, rayon incident (orange) et réfléchi (vert) calculés par la
 * loi de la réflexion (angles égaux avec la tangente), et l'angle entre
 * la tangente et la droite qui va au foyer, mesuré à part : la propriété
 * du cours se lit sur les nombres. Hyperbole, source en F : le rayon
 * réfléchi s'éloigne, c'est son PROLONGEMENT (pointillés) qui passe par
 * F′ — il semble venir de F′. Faisceau parallèle sur l'ellipse ou
 * l'hyperbole : les rayons réfléchis ne passent par aucun point commun
 * (abscisses de leurs passages sur l'axe affichées). Fenêtre FIXE et
 * repère orthonormé par miroir. Web Component (Shadow DOM).
 * ================================================================ */
import './geo-analytique-commun.js'
import { styleKatex, tex, CSS_BASE } from './katex-shadow.js'
import { curseurHTML, majCurseur, borner } from './variables-aleatoires-commun.js'
import { texN, CSS_LIEUX, placeurEtiquettes } from './lieux-geometriques-commun.js'
import { cheminPts, groupeCadre, ptsEllipse, ptsHyperbole, ptsParabole, reflechir, angleAigu, arcAngle, plusProche, CSS_CONIQUES } from './coniques-commun.js'

var G = window.GeoAnaCommun
var ASH = Math.asinh(4.6 / 4)

/**
 * Chaque miroir : fenêtre, équation A x² + B y² + D x = C (pour les intersections), point P(w),
 * tangente en P, foyers, modes.
 */
var MIROIRS = {
  parabole: {
    nom: 'Parabolique', FEN: { xMin: -1.5, xMax: 8, yMin: -4.5, yMax: 4.5 }, unite: 32,
    q: [0, 1, -4, 0], // y² − 4x = 0
    P: function (w) { var y = 4.2 * w; return [y * y / 4, y] },
    T: function (P) { return [P[1] / 2, 1] }, // dérivée : 2y·y′ = 4 → direction (y/2 ; 1)
    F: [1, 0], F2: null,
    modes: { parallele: 'Faisceau parallèle à l’axe', foyer: 'Source au foyer F' },
    faisceau: [-0.86, -0.57, -0.29, 0.29, 0.57, 0.86],
    tex: 'y^2=4x',
  },
  ellipse: {
    nom: 'Elliptique', FEN: { xMin: -6, xMax: 6, yMin: -4.75, yMax: 4.75 }, unite: 28,
    q: [1 / 25, 1 / 16, 0, 1],
    P: function (w, mode) { var t = mode === 'parallele' ? 0.47 * Math.PI * w : Math.PI * w; return [5 * Math.cos(t), 4 * Math.sin(t)] },
    T: function (P) { return [-P[1] / 16, P[0] / 25] },
    F: [3, 0], F2: [-3, 0],
    modes: { foyer: 'Source au foyer F′', parallele: 'Faisceau parallèle à l’axe' },
    faisceau: [-0.8, -0.55, -0.3, 0.3, 0.55, 0.8],
    tex: '\\frac{x^2}{25}+\\frac{y^2}{16}=1',
  },
  hyperbole: {
    nom: 'Hyperbolique', FEN: { xMin: -6, xMax: 8, yMin: -5, yMax: 5 }, unite: 25,
    q: [1 / 9, -1 / 16, 0, 1],
    P: function (w) { var s = ASH * w; return [3 * Math.cosh(s), 4 * Math.sinh(s)] },
    T: function (P) { return [P[1] / 16, P[0] / 9] },
    F: [5, 0], F2: [-5, 0],
    modes: { foyer: 'Source au foyer F', visant: 'Rayons qui visent F', parallele: 'Faisceau parallèle à l’axe' },
    faisceau: [-0.85, -0.55, -0.25, 0.25, 0.55, 0.85],
    tex: '\\frac{x^2}{9}-\\frac{y^2}{16}=1',
  },
}
Object.keys(MIROIRS).forEach(function (k) { var M = MIROIRS[k]; M.R = G.repere(M.FEN, M.unite, 14) })

/** Prochaine intersection (λ > ε) de la demi-droite P + λd avec la conique q = [A, B, D, C]. */
function prochaine(q, P, d) {
  var A = q[0], B = q[1], D = q[2], C = q[3]
  var a2 = A * d[0] * d[0] + B * d[1] * d[1]
  var a1 = 2 * A * P[0] * d[0] + 2 * B * P[1] * d[1] + D * d[0]
  var a0 = A * P[0] * P[0] + B * P[1] * P[1] + D * P[0] - C
  var rac = []
  if (Math.abs(a2) < 1e-12) { if (Math.abs(a1) > 1e-12) rac.push(-a0 / a1) }
  else { var De = a1 * a1 - 4 * a2 * a0; if (De >= 0) { var r = Math.sqrt(De); rac.push((-a1 - r) / (2 * a2), (-a1 + r) / (2 * a2)) } }
  var best = Infinity
  rac.forEach(function (l) { if (l > 1e-6 && l < best) best = l })
  return best
}

/** Longueur jusqu'au bord de la fenêtre le long de P + λd. */
function jusquAuBord(FEN, P, d) {
  var l = Infinity
  if (d[0] > 1e-12) l = Math.min(l, (FEN.xMax - P[0]) / d[0])
  if (d[0] < -1e-12) l = Math.min(l, (FEN.xMin - P[0]) / d[0])
  if (d[1] > 1e-12) l = Math.min(l, (FEN.yMax - P[1]) / d[1])
  if (d[1] < -1e-12) l = Math.min(l, (FEN.yMin - P[1]) / d[1])
  return Math.max(0, l)
}

function unit(v) { var L = Math.hypot(v[0], v[1]); return [v[0] / L, v[1] / L] }

/**
 * Trajet d'un rayon qui frappe le miroir en P : { S (départ), P, din, dout (unitaires), fin (bout du
 * réfléchi), prol (point où commence le prolongement en arrière, ou null), avant (bout du trajet
 * prévu sans miroir, ou null) }.
 */
function trajet(M, mode, P) {
  var FEN = M.FEN, din, S, avant = null
  if (mode === 'parallele') {
    if (M === MIROIRS.ellipse) { din = [1, 0]; S = [-P[0], P[1]] }
    else { din = [-1, 0]; S = [FEN.xMax, P[1]] }
  } else if (mode === 'foyer') {
    S = M === MIROIRS.ellipse ? M.F2 : M.F
    din = unit([P[0] - S[0], P[1] - S[1]])
  } else { // visant F : arrive de l'extérieur de la branche, dans la direction de F
    din = unit([M.F[0] - P[0], M.F[1] - P[1]])
    var l = jusquAuBord(FEN, P, [-din[0], -din[1]])
    S = [P[0] - din[0] * l, P[1] - din[1] * l]
    avant = M.F
  }
  var t = M.T(P), dout = unit(reflechir(din[0], din[1], t[0], t[1]))
  var lfin = prochaine(M.q, P, dout)
  if (M === MIROIRS.hyperbole) lfin = Infinity // une seule branche-miroir : on ne rebondit pas sur l'autre
  lfin = Math.min(lfin, jusquAuBord(FEN, P, dout))
  return { S: S, P: P, din: din, dout: dout, t: t, fin: [P[0] + dout[0] * lfin, P[1] + dout[1] * lfin], avant: avant }
}

/** Abscisse du passage de la droite (P, d) sur l'axe des abscisses, ou null. */
function surAxe(P, d) { return Math.abs(d[1]) < 1e-9 ? null : P[0] - P[1] * d[0] / d[1] }

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE + CSS_LIEUX + CSS_CONIQUES +
  '.ray-in{stroke:var(--attn,#96650c);stroke-width:2.4;}' +
  '.ray-out{stroke:var(--good,#2f7a4f);stroke-width:2.4;}' +
  '.ray-pr{stroke:var(--good,#2f7a4f);stroke-width:1.7;stroke-dasharray:6 4;}' +
  '.ray-av{stroke:var(--attn,#96650c);stroke-width:1.5;stroke-dasharray:4 4;opacity:0.8;}' +
  '.faible{opacity:0.38;}' +
  '.tete-in{fill:var(--attn,#96650c);}.tete-out{fill:var(--good,#2f7a4f);}' +
  '.tangente{stroke:var(--ink,#182430);stroke-width:1.5;stroke-dasharray:6 4;}' +
  '.normale{stroke:var(--ink-soft,#51626f);stroke-width:1;stroke-dasharray:2 3;}' +
  '.arc-in{fill:none;stroke:var(--attn,#96650c);stroke-width:2;}' +
  '.arc-out{fill:none;stroke:var(--good,#2f7a4f);stroke-width:2;}' +
  '.croix{stroke:var(--bad,#b23a3a);stroke-width:2;}' +
  '</style>' +
  '<div class="rangee" role="group" aria-label="Miroir">' +
  Object.keys(MIROIRS).map(function (k) { return '<button class="btn" data-m="' + k + '">' + MIROIRS[k].nom + '</button>' }).join('') + '</div>' +
  '<div class="rangee" id="modes" role="group" aria-label="Rayons"></div>' +
  '<p class="consigne" id="consigne"></p>' +
  '<div class="figure"><svg id="svg" class="glisser" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Le miroir, la tangente au point d’impact P, le rayon incident et le rayon réfléchi"></svg></div>' +
  '<p class="verdict" id="verdict" aria-live="polite"></p>' +
  '<div class="reglages">' + curseurHTML('w', 'Point d’impact P', -1, 1, 0.01) + '</div>' +
  '<div class="rangee"><button class="btn" id="faisceau" aria-pressed="true">Faisceau entier</button></div>' +
  '<div class="panneau" id="mesures" aria-live="polite"></div>'

class TroisMiroirsWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._m = 'parabole'
    this._mode = 'parallele'
    this._w = 0.55
    this._faisceau = true
    this._ecouteurs = []
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh, svg = sh.getElementById('svg')
    sh.querySelectorAll('[data-m]').forEach(function (b) {
      b.addEventListener('click', function () {
        self._m = b.getAttribute('data-m')
        self._mode = Object.keys(MIROIRS[self._m].modes)[0]
        self._w = 0.55
        self._rendre()
      })
    })
    sh.getElementById('modes').addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-mode]')
      if (!b) return
      self._mode = b.getAttribute('data-mode'); self._rendre()
    })
    function regle(v) { self._w = borner(Math.round(v * 100) / 100, -1, 1); self._rendre() }
    sh.getElementById('w').addEventListener('input', function (e) { regle(parseFloat(e.target.value)) })
    sh.getElementById('w-moins').addEventListener('click', function () { regle(self._w - 0.05) })
    sh.getElementById('w-plus').addEventListener('click', function () { regle(self._w + 0.05) })
    sh.getElementById('faisceau').addEventListener('click', function () { self._faisceau = !self._faisceau; self._rendre() })
    this._echant = {}
    var R0 = { monde: function (s, x, y) { return self._R().monde(s, x, y) } }
    G.glisser(this, svg, R0, function () {}, function (n, x, y) {
      var M = MIROIRS[self._m], cle = self._m + self._mode
      if (!self._echant[cle]) { var a = []; for (var i = 0; i <= 400; i++) a.push(M.P(-1 + i / 200, self._mode)); self._echant[cle] = a }
      var j = plusProche(self._echant[cle], x, y)
      if (j >= 0) regle(-1 + j / 200)
    })
    this._rendre()
  }

  _R() { return MIROIRS[this._m].R }

  _rendre() {
    var sh = this._sh, M = MIROIRS[this._m], R = M.R, FEN = M.FEN, mode = this._mode, self = this
    sh.querySelectorAll('[data-m]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-m') === self._m)) })
    sh.getElementById('modes').innerHTML = Object.keys(M.modes).map(function (k) {
      return '<button class="btn" data-mode="' + k + '" aria-pressed="' + (k === mode) + '">' + M.modes[k] + '</button>'
    }).join('')
    sh.getElementById('faisceau').setAttribute('aria-pressed', String(this._faisceau))
    majCurseur(sh, 'w', this._w, 'P')
    sh.getElementById('consigne').textContent = 'Miroir ' + (this._m === 'parabole' ? 'y² = 4x' : this._m === 'ellipse' ? 'x²/25 + y²/16 = 1' : 'x²/9 − y²/16 = 1 (seule la branche de droite est un miroir)') + '. Fais glisser le point d’impact P.'

    var P = M.P(this._w, mode), tr = trajet(M, mode, P)
    var t = unit(tr.t)

    // ---------- Mesures et verdict ----------
    var ai = angleAigu(tr.din[0], tr.din[1], t[0], t[1]), ao = angleAigu(tr.dout[0], tr.dout[1], t[0], t[1])
    var h = '<p class="titre-panneau">Au point d’impact ' + tex('P\\left(' + texN(P[0], 2) + '\\,;' + texN(P[1], 2) + '\\right)') + '</p>'
    h += '<p class="ligne">Loi de la réflexion : <span class="c-attn">angle (rayon incident ; tangente) ≈ ' + texDeg(ai) + '</span> = <span class="c-good">angle (rayon réfléchi ; tangente) ≈ ' + texDeg(ao) + '</span>.</p>'
    var v = sh.getElementById('verdict'), cls = 'verdict ok', msg
    function angF(Fo) { return angleAigu(Fo[0] - P[0], Fo[1] - P[1], t[0], t[1]) }
    var lis = []
    if (this._faisceau && mode === 'parallele' && this._m !== 'parabole') {
      M.faisceau.concat([this._w]).forEach(function (w) {
        var Q = M.P(w, mode), tq = trajet(M, mode, Q), x = surAxe(Q, tq.dout)
        if (x !== null && Math.abs(Q[1]) > 1e-6) lis.push(x)
      })
    }
    if (this._m === 'parabole' && mode === 'parallele') {
      h += '<p class="ligne">Mesuré à part : angle (tangente ; droite PF) ≈ ' + texDeg(angF(M.F)) + ' — le même : le rayon réfléchi va vers F.</p>'
      msg = 'Tout rayon parallèle à l’axe est réfléchi vers le foyer F, quel que soit P : le faisceau converge en F.'
    } else if (this._m === 'parabole') {
      h += '<p class="ligne">Mesuré à part : angle (tangente ; parallèle à l’axe) ≈ ' + texDeg(angleAigu(1, 0, t[0], t[1])) + ' — le même : le rayon repart parallèlement à l’axe.</p>'
      msg = 'Tout rayon issu du foyer F repart parallèlement à l’axe : le principe du phare.'
    } else if (this._m === 'ellipse' && mode === 'foyer') {
      h += '<p class="ligne">Angle (tangente ; droite PF′) ≈ ' + texDeg(angF(M.F2)) + ' et angle (tangente ; droite PF) ≈ ' + texDeg(angF(M.F)) + ' : égaux, le rayon réfléchi passe par F.</p>'
      h += '<p class="note">Trajet ' + tex("|F'P|+|PF|=2a=10") + ' pour tout P : toutes les ondes parties de F′ arrivent en F en même temps.</p>'
      msg = 'Tout rayon issu de F′ est réfléchi vers l’autre foyer F.'
    } else if (this._m === 'hyperbole' && mode === 'foyer') {
      h += '<p class="ligne">Angle (tangente ; droite PF) ≈ ' + texDeg(angF(M.F)) + ' et angle (tangente ; droite PF′) ≈ ' + texDeg(angF(M.F2)) + ' : égaux.</p>'
      h += '<p class="note">Le rayon réfléchi s’éloigne des deux foyers : c’est son prolongement en arrière (pointillés) qui passe par F′.</p>'
      msg = 'Tout rayon issu de F repart comme s’il venait de l’autre foyer F′ (il ne passe pas par F′).'
    } else if (this._m === 'hyperbole' && mode === 'visant') {
      h += '<p class="ligne">Angle (tangente ; droite PF) ≈ ' + texDeg(angF(M.F)) + ' et angle (tangente ; droite PF′) ≈ ' + texDeg(angF(M.F2)) + ' : égaux, le rayon réfléchi passe par F′.</p>'
      h += '<p class="note">Télescope de Cassegrain : les rayons qui convergeaient vers F (pointillés) sont renvoyés vers F′, derrière le miroir principal percé.</p>'
      msg = 'Un rayon qui vise le foyer F est réfléchi vers l’autre foyer F′.'
    } else {
      cls = 'verdict ko'
      msg = this._m === 'ellipse' ? 'Piège : un faisceau parallèle sur un miroir elliptique ne converge en AUCUN point.' : 'Un faisceau parallèle sur un miroir hyperbolique ne converge en aucun point non plus.'
      var xP = surAxe(P, tr.dout)
      h += '<p class="ligne">Le rayon réfléchi ' + (this._m === 'hyperbole' ? '(ou son prolongement) ' : '') + 'coupe l’axe en ' + (xP === null || Math.abs(P[1]) < 1e-6 ? 'aucun point précis (P sur l’axe)' : tex('x\\approx' + texN(xP, 2))) + '.</p>'
      if (lis.length > 1) h += '<p class="ligne">Faisceau entier : passages sur l’axe entre ' + tex('x\\approx' + texN(Math.min.apply(null, lis), 2)) + ' et ' + tex('x\\approx' + texN(Math.max.apply(null, lis), 2)) + ' — pas de point commun.</p>'
      else h += '<p class="note">Allume « Faisceau entier » pour comparer plusieurs rayons.</p>'
    }
    v.className = cls; v.textContent = msg
    sh.getElementById('mesures').innerHTML = h

    // ---------- Figure ----------
    var svg = sh.getElementById('svg')
    svg.setAttribute('viewBox', '0 0 ' + R.L + ' ' + R.H)
    svg.innerHTML = ''
    R.fond(svg, this._m === 'parabole' ? 1 : 2)
    var g = groupeCadre(G, svg, R, 'cadre-mir')
    function ligne(A, B, cls) { var p = R.px(A[0], A[1]), q = R.px(B[0], B[1]); return G.el('line', { x1: p[0].toFixed(1), y1: p[1].toFixed(1), x2: q[0].toFixed(1), y2: q[1].toFixed(1), class: cls }, g) }
    function tete(A, B, cls) { // tête de flèche au milieu de [AB]
      var p = R.px(A[0], A[1]), q = R.px(B[0], B[1]), dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy)
      if (L < 30) return
      var ux = dx / L, uy = dy / L, mx = p[0] + dx * 0.55, my = p[1] + dy * 0.55
      G.el('path', { d: 'M' + (mx + ux * 6).toFixed(1) + ',' + (my + uy * 6).toFixed(1) + ' L' + (mx - ux * 6 - uy * 5).toFixed(1) + ',' + (my - uy * 6 + ux * 5).toFixed(1) + ' L' + (mx - ux * 6 + uy * 5).toFixed(1) + ',' + (my - uy * 6 - ux * 5).toFixed(1) + ' Z', class: cls }, g)
    }
    // miroir
    if (this._m === 'parabole') G.el('path', { d: cheminPts(R, ptsParabole(0, 0, 2, 1, 0, 6)), class: 'conique' }, g)
    else if (this._m === 'ellipse') G.el('path', { d: cheminPts(R, ptsEllipse(0, 0, 5, 4, 1, 0)), class: 'conique' }, g)
    else {
      var br = ptsHyperbole(0, 0, 3, 4, 1, 0, 2.2)
      G.el('path', { d: cheminPts(R, br[0]), class: 'conique' }, g)
      G.el('path', { d: cheminPts(R, br[1]), class: 'conique-faible' }, g)
    }
    function dessinerRayon(tr2, faible) {
      var f = faible ? ' faible' : ''
      ligne(tr2.S, tr2.P, 'ray-in' + f); tete(tr2.S, tr2.P, 'tete-in' + f)
      ligne(tr2.P, tr2.fin, 'ray-out' + f); tete(tr2.P, tr2.fin, 'tete-out' + f)
      if (self._m === 'hyperbole' && mode === 'foyer') ligne(tr2.P, M.F2, 'ray-pr' + f)
      if (self._m === 'hyperbole' && mode === 'parallele') {
        var l = jusquAuBord(FEN, tr2.P, [-tr2.dout[0], -tr2.dout[1]])
        ligne(tr2.P, [tr2.P[0] - tr2.dout[0] * l, tr2.P[1] - tr2.dout[1] * l], 'ray-pr' + f)
      }
      if (tr2.avant) ligne(tr2.P, tr2.avant, 'ray-av' + f)
    }
    if (this._faisceau) M.faisceau.forEach(function (w) { dessinerRayon(trajet(M, mode, M.P(w, mode)), true) })
    // tangente et normale en P
    var Lt = 30
    ligne([P[0] - t[0] * Lt, P[1] - t[1] * Lt], [P[0] + t[0] * Lt, P[1] + t[1] * Lt], 'tangente')
    ligne([P[0] - t[1] * 1.6, P[1] + t[0] * 1.6], [P[0] + t[1] * 1.6, P[1] - t[0] * 1.6], 'normale')
    dessinerRayon(tr, false)
    // passages sur l'axe (faisceau parallèle, ellipse et hyperbole)
    if (this._faisceau && mode === 'parallele' && this._m !== 'parabole') {
      M.faisceau.concat([this._w]).forEach(function (w) {
        var Q = M.P(w, mode), x = surAxe(Q, trajet(M, mode, Q).dout)
        if (x === null || Math.abs(Q[1]) < 1e-6 || x < FEN.xMin || x > FEN.xMax) return
        var c = R.px(x, 0)
        G.el('path', { d: 'M' + (c[0] - 4) + ',' + (c[1] - 4) + ' L' + (c[0] + 4) + ',' + (c[1] + 4) + ' M' + (c[0] - 4) + ',' + (c[1] + 4) + ' L' + (c[0] + 4) + ',' + (c[1] - 4), class: 'croix' }, g)
      })
    }
    // arcs d'angle (directions à l'écran : y vers le bas)
    var pP = R.px(P[0], P[1])
    var back = [-tr.din[0], tr.din[1]], out = [tr.dout[0], -tr.dout[1]], te = [t[0], -t[1]]
    function cote(d) { return d[0] * te[0] + d[1] * te[1] >= 0 ? te : [-te[0], -te[1]] }
    arcAngle(g, pP, back, cote(back), 22, 'arc-in')
    arcAngle(g, pP, out, cote(out), 30, 'arc-out')
    // points
    var pl = placeurEtiquettes(R.L, R.H)
    var foyers = [[M.F, 'F', 'pt-good', 'et-good']]
    if (M.F2) foyers.push([M.F2, 'F′', 'pt-plan', 'et-plan'])
    foyers.forEach(function (f) { var q = R.px(f[0][0], f[0][1]); pl.point(q[0], q[1], 7) })
    pl.point(pP[0], pP[1], 9)
    foyers.forEach(function (f) { var q = R.px(f[0][0], f[0][1]); G.el('circle', { cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: 5, class: f[2] }, svg) })
    G.el('circle', { cx: pP[0].toFixed(1), cy: pP[1].toFixed(1), r: 6.5, class: 'pt-acc' }, svg)
    foyers.forEach(function (f) { var q = R.px(f[0][0], f[0][1]); pl.poser(svg, q[0], q[1], f[1], f[3], [2, 3]) })
    pl.poser(svg, pP[0], pP[1], 'P', 'et-acc', P[0] < 0 ? [1, 3] : [0, 2])
    G.poignee(svg, R, P[0], P[1], 'P', false)
  }
}

function texDeg(a) { return a.toFixed(1).replace('.', ',') + '°' }

if (!customElements.get('trois-miroirs-widget')) customElements.define('trois-miroirs-widget', TroisMiroirsWidget)
