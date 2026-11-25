/* ================================================================
 * <loran-widget> — atelier « LORAN » (6e, ch. 10, § 6). Deux paires de
 * stations (A₁, B₁) et (A₂, B₂), glissées sur les nœuds du quadrillage
 * (1 carreau = 100 km). Pour chaque paire, la différence des distances
 * d = |MA| − |MB| (réglée au curseur, ou lue sur le navire N qu'on fait
 * glisser) : c'est v·Δt, avec v ≈ 300 000 km/s (Δt affiché en µs). Les
 * points M qui réalisent cette différence forment UNE branche
 * d'hyperbole de foyers A et B (2a = |d|, 2c = |AB|) — celle du côté de
 * B quand d > 0 — ou la médiatrice de [AB] quand d = 0. La seconde
 * paire donne une seconde branche ; leurs points communs (calculés par
 * dichotomie le long de la première branche) sont les positions
 * possibles : aucune, une seule, ou DEUX (l'ambiguïté du LORAN, levée
 * par une troisième station ou la position estimée). Repère orthonormé
 * à fenêtre FIXE. Web Component (Shadow DOM).
 * ================================================================ */
import './geo-analytique-commun.js'
import { styleKatex, tex, texEgalites, CSS_BASE } from './katex-shadow.js'
import { curseurHTML, majCurseur, borner } from './variables-aleatoires-commun.js'
import { texN, CSS_LIEUX, placeurEtiquettes } from './lieux-geometriques-commun.js'
import { cheminPts, groupeCadre, CSS_CONIQUES } from './coniques-commun.js'

var G = window.GeoAnaCommun
var FEN = { xMin: -7, xMax: 7, yMin: -6, yMax: 6 }
var R = G.repere(FEN, 28, 14)
var LOIN = 40 // les branches sont suivies jusqu'à 40 carreaux (intersections hors du cadre comprises)

var PRESETS = {
  cours: { st: [[-5, 0], [5, 0], [0, -5], [0, 5]], N: [12 / Math.sqrt(7), 12 / Math.sqrt(7)] },
  deux: { st: [[-5, 0], [5, 0], [-3, -3], [2, -2]], N: [1.5, 3] },
  zero: { st: [[-5, 0], [5, 0], [0, -5], [0, 5]], N: [0, 2.5] },
}

function dist(P, Q) { return Math.hypot(P[0] - Q[0], P[1] - Q[1]) }

/** Branche de la paire (A, B) pour la différence d : point M(s) (s réel), ou null si |d| ≥ |AB|. */
function branche(A, B, d) {
  var L = dist(A, B), c = L / 2, a = Math.abs(d) / 2
  if (a >= c) return null
  var O = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], u = [(B[0] - A[0]) / L, (B[1] - A[1]) / L], v = [-u[1], u[0]]
  var b = Math.sqrt(c * c - a * a), sg = d > 0 ? 1 : -1
  if (Math.abs(d) < 1e-12) return { M: function (s) { return [O[0] + s * v[0], O[1] + s * v[1]] }, S: LOIN, a: 0, b: b, c: c }
  return {
    M: function (s) { var ch = Math.cosh(s), sh = Math.sinh(s); return [O[0] + sg * a * ch * u[0] + b * sh * v[0], O[1] + sg * a * ch * u[1] + b * sh * v[1]] },
    S: Math.asinh(LOIN / b), a: a, b: b, c: c,
  }
}

/** Points communs à la branche 1 et à la branche 2 (|MA₂| − |MB₂| = d₂). */
function intersections(b1, A2, B2, d2) {
  var n = 6000, res = [], S = b1.S
  function g(s) { var M = b1.M(s); return dist(M, A2) - dist(M, B2) - d2 }
  var s0 = -S, g0 = g(s0)
  for (var i = 1; i <= n; i++) {
    var s1 = -S + 2 * S * i / n, g1 = g(s1)
    if (g0 === 0 || g0 * g1 < 0) {
      var lo = s0, hi = s1, glo = g0
      for (var k = 0; k < 60; k++) { var mi = (lo + hi) / 2, gm = g(mi); if (glo * gm <= 0) hi = mi; else { lo = mi; glo = gm } }
      var M = b1.M((lo + hi) / 2)
      if (!res.some(function (q) { return dist(q, M) < 1e-6 })) res.push(M)
    }
    s0 = s1; g0 = g1
  }
  return res
}

/** Δt tombe-t-il juste en microsecondes ? */
function microExact(d) { var us = Math.abs(d) * 1e8 / 300000; return Math.abs(us - Math.round(us)) < 1e-6 }
/** Microsecondes avec espace des milliers : « 2 000 ». */
function texMicro(d) {
  var us = Math.round(Math.abs(d) * 100 / 300000 * 1e6)
  return String(us).replace(/\B(?=(\d{3})+(?!\d))/g, '\\,')
}

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE + CSS_LIEUX + CSS_CONIQUES +
  '[hidden]{display:none !important;}' +
  '.br1{fill:none;stroke:var(--accent,#b65c1f);stroke-width:2.8;}' +
  '.br2{fill:none;stroke:var(--good,#2f7a4f);stroke-width:2.8;}' +
  '.ray1{stroke:var(--accent,#b65c1f);stroke-width:1.4;}' +
  '.ray2{stroke:var(--good,#2f7a4f);stroke-width:1.4;}' +
  '.st1{fill:var(--accent,#b65c1f);}.st2{fill:var(--good,#2f7a4f);}' +
  '.nav2{fill:var(--surface-2,#f7f9fb);stroke:var(--bad,#b23a3a);stroke-width:2.6;}' +
  '.verdict.attn{color:var(--attn,#96650c);background:var(--attn-soft,#f7ecd6);}' +
  '</style>' +
  '<div class="rangee presets" role="group" aria-label="Exemples">' +
  '<button class="btn" data-pr="cours">Exemple du cours</button><button class="btn" data-pr="deux">Deux positions possibles</button><button class="btn" data-pr="zero">Δt = 0</button></div>' +
  '<p class="consigne">Fais glisser le navire N, ou les stations. 1 carreau = 100 km, ondes à 300 000 km/s.</p>' +
  '<div class="figure"><svg id="svg" class="glisser" viewBox="0 0 ' + R.L + ' ' + R.H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Deux paires de stations, les branches d’hyperbole correspondant aux mesures et les positions possibles du navire"></svg></div>' +
  '<p class="verdict" id="verdict" aria-live="polite"></p>' +
  '<div class="reglages">' + curseurHTML('d1', 'Différence de distances de la paire 1', -140, 140, 1) + '<div id="r-d2">' + curseurHTML('d2', 'Différence de distances de la paire 2', -140, 140, 1) + '</div></div>' +
  '<div class="rangee"><button class="btn" id="paire2" aria-pressed="true">Seconde paire de stations</button></div>' +
  '<div class="panneau" id="mesures" aria-live="polite"></div>' +
  '<div class="panneau" id="positions"></div>'

class LoranWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._deux = true
    this._ecouteurs = []
    this._preset('cours')
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh, svg = sh.getElementById('svg')
    sh.querySelectorAll('[data-pr]').forEach(function (b) { b.addEventListener('click', function () { self._preset(b.getAttribute('data-pr')); self._deux = true; self._rendre() }) })
    function lier(i) {
      var id = 'd' + (i + 1)
      function regle(v) { var m = self._dMax(i); self._d[i] = borner(Math.round(v), -m, m) / 10; self._pr = null; self._rendre() }
      sh.getElementById(id).addEventListener('input', function (e) { regle(parseFloat(e.target.value)) })
      sh.getElementById(id + '-moins').addEventListener('click', function () { regle(Math.round(self._d[i] * 10) - 1) })
      sh.getElementById(id + '-plus').addEventListener('click', function () { regle(Math.round(self._d[i] * 10) + 1) })
    }
    lier(0); lier(1)
    sh.getElementById('paire2').addEventListener('click', function () { self._deux = !self._deux; self._rendre() })
    G.glisser(this, svg, R, function () {}, function (n, x, y) {
      self._pr = null
      if (n === 'N') { self._N = [borner(x, FEN.xMin, FEN.xMax), borner(y, FEN.yMin, FEN.yMax)]; self._mesurer() }
      else {
        var i = +n, p = [borner(Math.round(x), Math.ceil(FEN.xMin), Math.floor(FEN.xMax)), borner(Math.round(y), Math.ceil(FEN.yMin), Math.floor(FEN.yMax))]
        var autre = self._st[i ^ 1]
        if (dist(p, autre) < 2 || self._st.some(function (q, j) { return j !== i && dist(q, p) < 1e-9 })) return
        self._st[i] = p
        self._d[i >> 1] = borner(self._d[i >> 1], -self._dMax(i >> 1) / 10, self._dMax(i >> 1) / 10)
      }
      self._rendre()
    })
    this._rendre()
  }

  _preset(nom) {
    var p = PRESETS[nom]
    this._pr = nom
    this._st = p.st.map(function (q) { return q.slice() })
    this._N = p.N.slice()
    this._d = [0, 0]
    this._mesurer()
  }

  /** Plus grande différence permise (en dixièmes) : strictement moins que |AB|. */
  _dMax(i) { return Math.ceil(dist(this._st[2 * i], this._st[2 * i + 1]) * 10 - 1e-9) - 1 }

  /** Différences lues sur le navire N (bornées : N ne peut pas être sur l'axe au-delà d'une station). */
  _mesurer() {
    for (var i = 0; i < 2; i++) {
      var A = this._st[2 * i], B = this._st[2 * i + 1], d = dist(this._N, A) - dist(this._N, B), m = dist(A, B) - 0.02
      this._d[i] = borner(d, -m, m)
    }
  }

  _rendre() {
    var sh = this._sh, self = this, st = this._st, d = this._d
    sh.querySelectorAll('[data-pr]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-pr') === self._pr)) })
    sh.getElementById('paire2').setAttribute('aria-pressed', String(this._deux))
    sh.getElementById('r-d2').hidden = !this._deux
    for (var i = 0; i < 2; i++) {
      var id = 'd' + (i + 1), m = this._dMax(i), inp = sh.getElementById(id)
      inp.min = String(-m); inp.max = String(m)
      majCurseur(sh, id, Math.round(d[i] * 10), 'd_' + (i + 1) + (Math.abs(d[i] * 10 - Math.round(d[i] * 10)) < 1e-6 ? '=' : '\\approx') + texN(d[i], 2))
    }
    var b1 = branche(st[0], st[1], d[0]), b2 = this._deux ? branche(st[2], st[3], d[1]) : null
    var inter = b1 && b2 ? intersections(b1, st[2], st[3], d[1]) : []
    // N = position commune la plus proche du navire précédent
    var self2 = this
    inter.sort(function (P, Q) { return dist(P, self2._N) - dist(Q, self2._N) })
    if (inter.length) this._N = inter[0].slice()

    // ---------- Verdict ----------
    var vd = sh.getElementById('verdict')
    if (!this._deux) {
      vd.className = 'verdict neutre'
      vd.textContent = Math.abs(d[0]) < 1e-9 ? 'Une seule paire, Δt = 0 : le navire est à égale distance de A₁ et de B₁, quelque part sur la médiatrice.' : 'Une seule paire : le navire est quelque part sur cette branche d’hyperbole (du côté de ' + (d[0] > 0 ? 'B₁' : 'A₁') + ', la station la plus proche). Il faut une seconde mesure.'
    } else if (!inter.length) { vd.className = 'verdict ko'; vd.textContent = 'Les deux branches n’ont aucun point commun : aucun navire ne donnerait ces deux mesures.' }
    else if (inter.length === 1) { vd.className = 'verdict ok'; vd.textContent = 'Une seule position possible : N, à l’intersection des deux branches.' }
    else { vd.className = 'verdict attn'; vd.textContent = 'Deux positions possibles, N et N′ : les deux mesures ne suffisent pas. Une troisième station, ou la position estimée du navire, permet de choisir.' }

    // ---------- Mesures ----------
    var h = '<p class="titre-panneau">Les mesures</p>'
    ;[0, 1].forEach(function (i) {
      if (i === 1 && !self._deux) return
      var A = st[2 * i], B = st[2 * i + 1], n = i + 1, br = i === 0 ? b1 : b2, L = dist(A, B)
      var dt = texN(d[i], 2)
      h += '<p class="ligne"><span class="' + (i ? 'c-good' : 'c-acc') + '">Paire ' + n + '</span> : ' +
        tex('|MA_' + n + '|-|MB_' + n + '|' + (Math.abs(d[i] * 100 - Math.round(d[i] * 100)) < 1e-6 ? '=' : '\\approx') + dt) + (Math.abs(d[i]) < 2 ? ' carreau' : ' carreaux') + ', soit ' + tex(texN(Math.abs(d[i]) * 100, 0) + '\\text{ km}') +
        ' ; ' + tex('\\Delta t' + (Math.abs(d[i]) < 1e-9 ? '=0' : (microExact(d[i]) ? '=' : '\\approx') + texMicro(d[i]) + '\\text{ µs}')) + '.</p>'
      if (Math.abs(d[i]) < 1e-9) h += '<p class="note">Différence nulle : la médiatrice de ' + tex('[A_' + n + 'B_' + n + ']') + ' (le cas limite « a = 0 »).</p>'
      else h += '<p class="note">Branche d’hyperbole de foyers ' + tex('A_' + n) + ' et ' + tex('B_' + n) + ', du côté de ' + tex((d[i] > 0 ? 'B_' : 'A_') + n) + ' : ' +
        tex('2c=|A_' + n + 'B_' + n + '|' + (Math.abs(L - Math.round(L)) < 1e-9 ? '=' : '\\approx') + texN(L, 2)) + ', ' + tex('2a=|d_' + n + '|' + (Math.abs(d[i] * 100 - Math.round(d[i] * 100)) < 1e-6 ? '=' : '\\approx') + texN(Math.abs(d[i]), 2)) + ', ' +
        tex('b=\\sqrt{c^2-a^2}' + (Math.abs(br.b - Math.round(br.b)) < 1e-9 ? '=' : '\\approx') + texN(br.b, 2)) + '.</p>'
    })
    h += '<p class="note">' + tex('|d|<|AB|') + ' toujours : dans un triangle MAB, ' + tex('\\big||MA|-|MB|\\big|<|AB|') + '.</p>'
    sh.getElementById('mesures').innerHTML = h

    var k = '<p class="titre-panneau">Les positions possibles</p>'
    if (!this._deux) k += '<p class="ligne">Toute la branche ' + (Math.abs(d[0]) < 1e-9 ? '(ici la médiatrice) ' : '') + 'est compatible avec la mesure de la paire 1.</p>'
    else if (!inter.length) k += '<p class="ligne">Aucune (jusqu’à ' + LOIN * 100 + ' km des stations).</p>'
    else inter.forEach(function (P, j) {
      var nom = j === 0 ? 'N' : j === 1 ? "N'" : 'N_' + (j + 1)
      k += '<p class="ligne">' + tex(nom + '\\left(' + texN(P[0], 2) + '\\,;' + texN(P[1], 2) + '\\right)') + (R.dansFenetre(P[0], P[1]) ? '' : ' <span class="note">(hors du cadre)</span>') + ' : ' +
        texEgalites(['|' + nom + 'A_1|-|' + nom + 'B_1|\\approx' + texN(dist(P, st[0]) - dist(P, st[1]), 2)], '=') + ' et ' + tex('|' + nom + 'A_2|-|' + nom + 'B_2|\\approx' + texN(dist(P, st[2]) - dist(P, st[3]), 2)) + ' ✓</p>'
    })
    sh.getElementById('positions').innerHTML = k

    // ---------- Figure ----------
    var svg = sh.getElementById('svg')
    svg.innerHTML = ''
    R.fond(svg, 1)
    var g = groupeCadre(G, svg, R, 'cadre-lo')
    function tracer(br, cls) {
      if (!br) return
      var pts = [], n = 900
      for (var j = 0; j <= n; j++) { var s = -br.S + 2 * br.S * j / n; pts.push(br.M(s)) }
      G.el('path', { d: cheminPts(R, pts), class: cls }, g)
    }
    function ligne(A, B, cls) { var p = R.px(A[0], A[1]), q = R.px(B[0], B[1]); G.el('line', { x1: p[0].toFixed(1), y1: p[1].toFixed(1), x2: q[0].toFixed(1), y2: q[1].toFixed(1), class: cls }, g) }
    tracer(b1, 'br1')
    tracer(b2, 'br2')
    var N = (this._deux ? inter.length > 0 : true) ? this._N : null
    if (!this._deux) {
      // une seule paire : N reste sur la branche (point le plus proche)
      if (b1) {
        var best = null
        for (var j = 0; j <= 4000; j++) { var s = -b1.S + 2 * b1.S * j / 4000, M = b1.M(s), dd = dist(M, this._N); if (!best || dd < best[0]) best = [dd, M] }
        N = best[1]; this._N = N.slice()
      }
    }
    var montrerN = N && R.dansFenetre(N[0], N[1])
    if (montrerN) {
      ligne(N, st[0], 'ray1 pointille'); ligne(N, st[1], 'ray1')
      if (this._deux) { ligne(N, st[2], 'ray2 pointille'); ligne(N, st[3], 'ray2') }
    }
    var pl = placeurEtiquettes(R.L, R.H)
    var noms = ['A₁', 'B₁', 'A₂', 'B₂']
    var visibles = st.map(function (q, i) { return i < 2 || self._deux })
    st.forEach(function (q, i) { if (!visibles[i]) return; var p = R.px(q[0], q[1]); pl.point(p[0], p[1], 7) })
    var autres = this._deux ? inter.slice(1).filter(function (P) { return R.dansFenetre(P[0], P[1]) }) : []
    if (montrerN) { var pn = R.px(N[0], N[1]); pl.point(pn[0], pn[1], 8) }
    autres.forEach(function (P) { var p = R.px(P[0], P[1]); pl.point(p[0], p[1], 8) })
    st.forEach(function (q, i) {
      if (!visibles[i]) return
      var p = R.px(q[0], q[1])
      G.el('rect', { x: (p[0] - 5.5).toFixed(1), y: (p[1] - 5.5).toFixed(1), width: 11, height: 11, class: i < 2 ? 'st1' : 'st2' }, svg)
    })
    autres.forEach(function (P) { var p = R.px(P[0], P[1]); G.el('circle', { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: 6, class: 'nav2' }, svg) })
    if (montrerN) { var q0 = R.px(N[0], N[1]); G.el('circle', { cx: q0[0].toFixed(1), cy: q0[1].toFixed(1), r: 6.5, class: 'pt-bad' }, svg) }
    st.forEach(function (q, i) { if (!visibles[i]) return; var p = R.px(q[0], q[1]); pl.poser(svg, p[0], p[1], noms[i], i < 2 ? 'et-acc' : 'et-good', [2, 3, 0, 1]) })
    if (montrerN) { var q1 = R.px(N[0], N[1]); pl.poser(svg, q1[0], q1[1], 'N', 'et-bad', [0, 1, 2, 3]) }
    autres.forEach(function (P, j) { var p = R.px(P[0], P[1]); pl.poser(svg, p[0], p[1], j === 0 ? 'N′' : 'N' + (j + 2), 'et-bad', [0, 1, 2, 3]) })
    st.forEach(function (q, i) { if (visibles[i]) G.poignee(svg, R, q[0], q[1], String(i), false) })
    if (montrerN) G.poignee(svg, R, N[0], N[1], 'N', false)
  }
}

if (!customElements.get('loran-widget')) customElements.define('loran-widget', LoranWidget)
