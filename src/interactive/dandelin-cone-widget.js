/* ================================================================
 * <dandelin-cone-widget> — atelier « Section du cône et sphères de
 * Dandelin » (6e, ch. 10, § 2). Cône de révolution à deux nappes,
 * d'axe vertical, de demi-angle α = 30° (ses génératrices font 60° avec
 * l'horizontale). Un plan, qui ne passe jamais par le sommet, tourne
 * autour d'une droite horizontale : son inclinaison θ (0° à 90°) se
 * règle. θ = 0° : cercle ; θ < 60° : ellipse ; θ = 60° (plan parallèle
 * à une génératrice) : parabole ; θ > 60° : hyperbole (le plan coupe
 * les deux nappes). Vue en perspective (projection orthogonale, parties
 * cachées en pointillés) : cône, plan, section, sphères de Dandelin
 * (centres sur l'axe, tangentes au cône et au plan, calculées
 * exactement), cercles de contact, foyers F et F′ (points de contact
 * des sphères avec le plan), génératrice passant par P et ses points
 * M, M′ sur les cercles de contact. À côté, la VRAIE forme de la section
 * dans le plan, avec les foyers et les directrices (traces des plans
 * des cercles de contact). P se déplace sur la section : |PF| = |PM|,
 * |PF′| = |PM′|, d'où |PF| + |PF′| = |MM′| (ellipse) ou
 * ||PF| − |PF′|| = |MM′| (hyperbole), et |PF| / dist(P ; d) = e
 * constant (e = sin θ / cos α). Web Component (Shadow DOM).
 * ================================================================ */
import './geo-analytique-commun.js'
import { styleKatex, tex, CSS_BASE } from './katex-shadow.js'
import { curseurHTML, majCurseur, borner } from './variables-aleatoires-commun.js'
import { texN, CSS_LIEUX, placeurEtiquettes } from './lieux-geometriques-commun.js'
import { plusProche, CSS_CONIQUES } from './coniques-commun.js'

var G = window.GeoAnaCommun
var ALPHA = 30 * Math.PI / 180, SA = Math.sin(ALPHA), CA = Math.cos(ALPHA), TA = Math.tan(ALPHA)
var X0 = [0.6, 0, 1.8] // le plan contient la droite (x = 0,6 ; z = 1,8), parallèle à Oy
var ZH = 4.6, ZB = -2.6, YP = 2.3
var PHI = 25 * Math.PI / 180, EPS = 16 * Math.PI / 180
var CPH = Math.cos(PHI), SPH = Math.sin(PHI), CEP = Math.cos(EPS), SEP = Math.sin(EPS)
var VUE = [-SPH * CEP, CPH * CEP, -SEP] // direction du regard
// panneau A (perspective) : 250 × 300
var LA = 250, HA = 300, KA = 30, CXA = 125, CYA = 148, U0 = 1.05
// panneau B (vraie forme) : fenêtre en coordonnées du plan (s le long de la pente, y)
var FENB = { xMin: -6.4, xMax: 6.4, yMin: -3.1, yMax: 3.1 }
var RB = G.repere(FENB, 27, 8)
var N = 720

function proj(X) {
  var x1 = X[0] * CPH + X[1] * SPH, y1 = -X[0] * SPH + X[1] * CPH
  var U = X[2] * CEP + y1 * SEP
  return [CXA + KA * x1, CYA - KA * (U - U0)]
}
function prof(X) { var y1 = -X[0] * SPH + X[1] * CPH; return y1 * CEP - X[2] * SEP }
function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]] }
function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] }
function nrm(a) { return Math.sqrt(dot(a, a)) }
function mul(a, k) { return [a[0] * k, a[1] * k, a[2] * k] }

/** Géométrie complète pour une inclinaison θ (radians). */
function geometrie(th) {
  var n = [Math.sin(th), 0, Math.cos(th)], u = [Math.cos(th), 0, -Math.sin(th)], k = dot(n, X0)
  var Gm = { th: th, n: n, u: u, k: k, spheres: [] }
  var den2 = Math.cos(th) - SA
  var zs = [k / (Math.cos(th) + SA)]
  if (Math.abs(den2) > 1e-9) zs.push(k / den2)
  zs.forEach(function (zc) {
    var C = [0, 0, zc], d = dot(n, C) - k
    var F = sub(C, mul(n, d)), h = zc * CA * CA
    Gm.spheres.push({ zc: zc, r: Math.abs(zc) * SA, F: F, h: h, rc: Math.abs(zc) * CA * SA })
  })
  Gm.e = Math.sin(th) / CA
  Gm.nature = th < 1e-9 ? 'cercle' : Math.abs(den2) < 1e-9 ? 'parabole' : den2 > 0 ? 'ellipse' : 'hyperbole'
  // points de la section, repérés par l'azimut ψ de la génératrice
  Gm.pts = []
  for (var i = 0; i < N; i++) {
    var ps = 2 * Math.PI * i / N, g = [SA * Math.cos(ps), SA * Math.sin(ps), CA], dn = dot(n, g)
    if (Math.abs(dn) < 1e-9) { Gm.pts.push(null); continue }
    var t = k / dn, P = mul(g, t)
    Gm.pts.push(Math.abs(t) > 60 ? null : P)
  }
  return Gm
}
function plan2(Gm, X) { var v = sub(X, X0); return [dot(v, Gm.u), v[1]] }
function dansCone(P) { return P && P[2] <= ZH + 1e-9 && P[2] >= ZB - 1e-9 }
/** Visible ? (normale extérieure du cône tournée vers l'observateur). */
function visible(P) {
  var rho = Math.hypot(P[0], P[1])
  if (rho < 1e-9) return true
  var c = P[0] / rho, s = P[1] / rho
  var nn = P[2] >= 0 ? [CA * c, CA * s, -SA] : [CA * c, CA * s, SA]
  return dot(nn, VUE) < 0
}

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE + CSS_LIEUX + CSS_CONIQUES +
  '.figure{flex-wrap:wrap;gap:8px;align-items:center;}' +
  '.figure svg#svgA{max-width:250px;}' +
  '.figure svg#svgB{max-width:360px;}' +
  '.cone{fill:none;stroke:var(--ink-soft,#51626f);stroke-width:1.5;}' +
  '.cone-cache{fill:none;stroke:var(--ink-soft,#51626f);stroke-width:1;stroke-dasharray:4 4;opacity:0.7;}' +
  '.plan{fill:var(--sky,#2f6fb0);fill-opacity:0.13;stroke:var(--sky,#2f6fb0);stroke-width:1.2;}' +
  '.sphere{fill:var(--good,#2f7a4f);fill-opacity:0.10;stroke:var(--good,#2f7a4f);stroke-width:1.5;}' +
  '.contact{fill:none;stroke:var(--good,#2f7a4f);stroke-width:1.4;}' +
  '.contact-cache{fill:none;stroke:var(--good,#2f7a4f);stroke-width:1;stroke-dasharray:3 3;}' +
  '.section{fill:none;stroke:var(--accent,#b65c1f);stroke-width:3;stroke-linejoin:round;}' +
  '.section-cache{fill:none;stroke:var(--accent,#b65c1f);stroke-width:1.6;stroke-dasharray:5 4;}' +
  '.gen{stroke:var(--rose,#b23a7a);stroke-width:1.8;}' +
  '.titre-svg{font-size:12px;font-weight:700;fill:var(--ink-soft,#51626f);font-family:var(--sans,sans-serif);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3.5px;stroke-linejoin:round;}' +
  '</style>' +
  '<div class="rangee presets" role="group" aria-label="Sections">' +
  '<button class="btn" data-t="0">Cercle</button><button class="btn" data-t="35">Ellipse</button><button class="btn" data-t="60">Parabole</button><button class="btn" data-t="75">Hyperbole</button></div>' +
  '<div class="rangee" role="group" aria-label="Vues"><button class="btn" id="voirA" aria-pressed="true">Vue en perspective</button><button class="btn" id="voirB" aria-pressed="true">Vraie forme</button></div>' +
  '<p class="consigne">Incline le plan, puis déplace P sur la section (curseur, ou glisser dans la vraie forme).</p>' +
  '<div class="figure">' +
  '<svg id="svgA" viewBox="0 0 ' + LA + ' ' + HA + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Le cône, le plan de section, la section et les sphères de Dandelin en perspective"></svg>' +
  '<svg id="svgB" class="glisser" viewBox="0 0 ' + RB.L + ' ' + RB.H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="La vraie forme de la section dans son plan, avec les foyers et les directrices"></svg>' +
  '</div>' +
  '<p class="verdict" id="verdict" aria-live="polite"></p>' +
  '<div class="reglages">' + curseurHTML('th', 'Inclinaison du plan', 0, 90, 1) + curseurHTML('w', 'Position de P sur la section', 0, 1, 0.005) + '</div>' +
  '<div class="panneau" id="mesures" aria-live="polite"></div>'

class DandelinConeWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._th = 35
    this._w = 0.3
    this._ecouteurs = []
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    // téléphone : une vue à la fois (deux vues empilées seraient réduites et illisibles)
    var etroit = this.getBoundingClientRect().width > 0 && this.getBoundingClientRect().width < 560
    this._vues = { A: true, B: !etroit }
    ;['A', 'B'].forEach(function (k) {
      sh.getElementById('voir' + k).addEventListener('click', function () {
        var autre = k === 'A' ? 'B' : 'A'
        if (etroitNow()) { self._vues[k] = true; self._vues[autre] = false }
        else { self._vues[k] = !self._vues[k]; if (!self._vues.A && !self._vues.B) self._vues[autre] = true }
        self._rendre()
      })
    })
    function etroitNow() { var w = self.getBoundingClientRect().width; return w > 0 && w < 560 }
    sh.querySelectorAll('[data-t]').forEach(function (b) { b.addEventListener('click', function () { self._th = +b.getAttribute('data-t'); self._rendre() }) })
    function regleT(v) { self._th = borner(Math.round(v), 0, 90); self._rendre() }
    sh.getElementById('th').addEventListener('input', function (e) { regleT(parseFloat(e.target.value)) })
    sh.getElementById('th-moins').addEventListener('click', function () { regleT(self._th - 1) })
    sh.getElementById('th-plus').addEventListener('click', function () { regleT(self._th + 1) })
    function regleW(v) { self._w = borner(Math.round(v * 200) / 200, 0, 1); self._rendre() }
    sh.getElementById('w').addEventListener('input', function (e) { regleW(parseFloat(e.target.value)) })
    sh.getElementById('w-moins').addEventListener('click', function () { regleW(self._w - 0.02) })
    sh.getElementById('w-plus').addEventListener('click', function () { regleW(self._w + 0.02) })
    G.glisser(this, sh.getElementById('svgB'), RB, function () {}, function (nm, x, y) {
      var L = self._visibles
      if (!L || !L.length) return
      var i = plusProche(L.map(function (q) { return q.b }), x, y)
      if (i >= 0) regleW(L.length > 1 ? i / (L.length - 1) : 0)
    })
    this._rendre()
  }

  _rendre() {
    var self = this, sh = this._sh, th = this._th * Math.PI / 180, Gm = geometrie(th)
    ;['A', 'B'].forEach(function (k) {
      sh.getElementById('voir' + k).setAttribute('aria-pressed', String(self._vues[k]))
      sh.getElementById('svg' + k).style.display = self._vues[k] ? '' : 'none'
    })
    majCurseur(sh, 'th', this._th, '\\theta=' + this._th + '^\\circ')
    majCurseur(sh, 'w', this._w, 'P')
    sh.querySelectorAll('[data-t]').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-t') === self._th)) })

    // points visibles de la section (dans la hauteur dessinée du cône), dans l'ordre de ψ, par morceaux
    var vis = []
    var debut = 0
    for (var j = 0; j < N; j++) if (!dansCone(Gm.pts[j])) { debut = j; break }
    for (var i = 0; i < N; i++) {
      var q = Gm.pts[(debut + i) % N]
      if (dansCone(q)) vis.push({ X: q, b: plan2(Gm, q) })
    }
    this._visibles = vis
    var P = vis.length ? vis[Math.round(this._w * (vis.length - 1))].X : null
    var S1 = Gm.spheres[0], S2 = Gm.spheres[1] || null

    // ---------- Verdict ----------
    var v = sh.getElementById('verdict'), nat = Gm.nature
    var txt = {
      cercle: 'θ = 0° : plan perpendiculaire à l’axe, la section est un cercle. Les deux sphères touchent le plan au même point : son centre.',
      ellipse: 'θ < 60° (le plan est moins incliné que les génératrices) : une ellipse. Deux sphères, dans la même nappe : deux foyers.',
      parabole: 'θ = 60° : le plan est parallèle à une génératrice, la section est une parabole. Une seule sphère : un foyer, une directrice.',
      hyperbole: 'θ > 60° : le plan coupe les deux nappes, la section est une hyperbole. Une sphère dans chaque nappe : deux foyers.',
    }
    v.className = 'verdict ok'; v.textContent = txt[nat]

    // ---------- Mesures ----------
    var h = '<p class="titre-panneau">Excentricité et distances (unités du dessin)</p>'
    h += '<p class="ligne">' + tex('e=\\frac{\\sin\\theta}{\\cos 30^\\circ}' + (nat === 'cercle' ? '=0' : nat === 'parabole' ? '=1' : '\\approx' + texN(Gm.e, 3))) + ' <span class="note">(' + (nat === 'cercle' ? 'cercle' : nat === 'ellipse' ? 'e < 1' : nat === 'parabole' ? 'e = 1' : 'e > 1') + ')</span></p>'
    if (P) {
      var dF = nrm(sub(P, S1.F))
      var M1 = mul(P, S1.h / P[2]), dM1 = nrm(sub(P, M1))
      h += '<p class="ligne"><span class="c-good">' + tex('|PF|\\approx' + texN(dF, 2)) + '</span> = ' + tex('|PM|\\approx' + texN(dM1, 2)) + ' <span class="note">(deux tangentes à la même sphère menées de P)</span></p>'
      if (S2 && nat !== 'cercle') {
        var dF2 = nrm(sub(P, S2.F)), M2 = mul(P, S2.h / P[2]), dM2 = nrm(sub(P, M2)), MM = nrm(sub(M1, M2))
        h += '<p class="ligne"><span class="c-plan">' + tex("|PF'|\\approx" + texN(dF2, 2)) + '</span> = ' + tex("|PM'|\\approx" + texN(dM2, 2)) + '</p>'
        if (nat === 'ellipse') h += '<p class="ligne">' + tex("|PF|+|PF'|\\approx" + texN(dF + dF2, 2)) + ' = ' + tex("|MM'|\\approx" + texN(MM, 2)) + ' : la même valeur pour tout P (M et M′ sont de part et d’autre de P).</p>'
        else h += '<p class="ligne">' + tex("\\bigl||PF|-|PF'|\\bigr|\\approx" + texN(Math.abs(dF - dF2), 2)) + ' = ' + tex("|MM'|\\approx" + texN(MM, 2)) + ' : la même valeur pour tout P (cette fois P n’est pas entre M et M′).</p>'
      }
      if (nat !== 'cercle') {
        var sP = plan2(Gm, P)[0], sd = (X0[2] - S1.h) / Math.sin(th), dd = Math.abs(sP - sd)
        h += '<p class="ligne">' + tex('\\text{dist}(P\\,;d)\\approx' + texN(dd, 2)) + ' et ' + tex('\\frac{|PF|}{\\text{dist}(P\\,;d)}\\approx' + texN(dF / dd, 3)) + ' = e, pour tout P.</p>'
      } else h += '<p class="note">Cercle : pas de directrice (les plans des cercles de contact sont parallèles au plan de section).</p>'
    }
    sh.getElementById('mesures').innerHTML = h

    this._dessinerA(Gm, P)
    this._dessinerB(Gm, P)
  }

  _dessinerA(Gm, P) {
    var svg = this._sh.getElementById('svgA')
    svg.innerHTML = ''
    function ch(pts) { return pts.map(function (q, i) { var p = proj(q); return (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1) }).join(' ') }
    var clip = G.el('clipPath', { id: 'cadreA' }, G.el('defs', {}, svg))
    G.el('rect', { x: 0, y: 0, width: LA, height: HA }, clip)
    var g = G.el('g', { 'clip-path': 'url(#cadreA)' }, svg)
    function cheminG(pts, cls) { if (pts.length > 1) G.el('path', { d: ch(pts), class: cls }, g) }
    /** Cercle horizontal (hauteur z, rayon r) découpé en parties vues / cachées selon `vu(ψ)`. */
    function cercleH(z, r, vu, clsV, clsC) {
      var cur = null, pts = []
      for (var i = 0; i <= 120; i++) {
        var ps = 2 * Math.PI * i / 120, X = [r * Math.cos(ps), r * Math.sin(ps), z], vv = vu(X)
        if (cur === null) cur = vv
        if (vv !== cur) { pts.push(X); cheminG(pts, cur ? clsV : clsC); pts = [X]; cur = vv } else pts.push(X)
      }
      cheminG(pts, cur ? clsV : clsC)
    }
    // plan (derrière tout le reste)
    var th = Gm.th, s1 = -Infinity, s2 = Infinity
    if (Math.cos(th) > 1e-9) { s1 = Math.max(s1, (-3.3 - X0[0]) / Math.cos(th)); s2 = Math.min(s2, (3.3 - X0[0]) / Math.cos(th)) }
    if (Math.sin(th) > 1e-9) { s1 = Math.max(s1, (X0[2] - (ZH + 0.25)) / Math.sin(th)); s2 = Math.min(s2, (X0[2] - (ZB - 0.25)) / Math.sin(th)) }
    var u = Gm.u
    function ptPlan(s, y) { return [X0[0] + s * u[0], y, X0[2] + s * u[2]] }
    G.el('path', { d: ch([ptPlan(s1, -YP), ptPlan(s2, -YP), ptPlan(s2, YP), ptPlan(s1, YP), ptPlan(s1, -YP)]) + ' Z', class: 'plan' }, g)
    // cône : bords, génératrices de contour
    cercleH(ZH, ZH * TA, function () { return true }, 'cone', 'cone-cache')
    cercleH(ZB, -ZB * TA, function (X) { return prof(X) < 0 }, 'cone', 'cone-cache')
    var a1 = Math.asin(-TA * Math.tan(EPS)), a2 = Math.asin(TA * Math.tan(EPS))
    ;[PHI + a1, PHI + Math.PI - a1].forEach(function (ps) { cheminG([[0, 0, 0], [ZH * TA * Math.cos(ps), ZH * TA * Math.sin(ps), ZH]], 'cone') })
    ;[PHI + a2, PHI + Math.PI - a2].forEach(function (ps) { cheminG([[0, 0, 0], [-ZB * TA * Math.cos(ps), -ZB * TA * Math.sin(ps), ZB]], 'cone') })
    cheminG([[0, 0, ZB], [0, 0, ZH]], 'cone-cache')
    // sphères et cercles de contact
    Gm.spheres.forEach(function (S) {
      if (Math.abs(S.zc) > 40) return
      var c = proj([0, 0, S.zc])
      G.el('circle', { cx: c[0].toFixed(1), cy: c[1].toFixed(1), r: (S.r * KA).toFixed(1), class: 'sphere' }, g)
      cercleH(S.h, S.rc, function (X) { return visible(X) }, 'contact', 'contact-cache')
    })
    // section
    var cur = null, pts = []
    function vide() { cheminG(pts, cur ? 'section' : 'section-cache'); pts = []; cur = null }
    for (var i = 0; i <= N; i++) {
      var q = Gm.pts[i % N]
      if (!dansCone(q)) { vide(); continue }
      var vv = visible(q)
      if (cur === null) cur = vv
      if (vv !== cur) { pts.push(q); var der = q; cheminG(pts, cur ? 'section' : 'section-cache'); pts = [der]; cur = vv } else pts.push(q)
    }
    vide()
    // génératrice par P, M et M′
    var pl = placeurEtiquettes(LA, HA), noms = []
    if (P) {
      var Ms = Gm.spheres.filter(function (S) { return Math.abs(S.zc) < 40 }).map(function (S) { return mul(P, S.h / P[2]) })
      var params = [0, 1].concat(Ms.map(function (M) { return M[2] / P[2] })), tmin = Math.min.apply(null, params), tmax = Math.max.apply(null, params)
      cheminG([mul(P, tmin - 0.08), mul(P, tmax + 0.08)], 'gen')
      Ms.forEach(function (M, k) { noms.push([M, k ? 'M′' : 'M', 'pt-rose', 'et-rose', 3.5]) })
    }
    Gm.spheres.forEach(function (S, k) { if (Math.abs(S.zc) < 40 && Gm.nature !== 'cercle') noms.push([S.F, k ? 'F′' : 'F', k ? 'pt-plan' : 'pt-good', k ? 'et-plan' : 'et-good', 4]) })
    if (Gm.nature === 'cercle') noms.push([Gm.spheres[0].F, 'F = F′', 'pt-good', 'et-good', 4])
    if (P) noms.push([P, 'P', 'pt-acc', 'et-acc', 5.5])
    noms.forEach(function (o) { var p = proj(o[0]); pl.point(p[0], p[1], 6) })
    noms.forEach(function (o) { var p = proj(o[0]); if (p[0] < 0 || p[0] > LA || p[1] < 0 || p[1] > HA) return; G.el('circle', { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: o[4], class: o[2] }, svg) })
    noms.forEach(function (o) { var p = proj(o[0]); if (p[0] < 0 || p[0] > LA || p[1] < 0 || p[1] > HA) return; pl.poser(svg, p[0], p[1], o[1], o[3]) })
    var t = G.el('text', { x: 6, y: 15, class: 'titre-svg' }, svg); t.textContent = 'Vue en perspective'
  }

  _dessinerB(Gm, P) {
    var svg = this._sh.getElementById('svgB'), R = RB
    svg.innerHTML = ''
    G.el('rect', { x: R.marge, y: R.marge, width: R.L - 2 * R.marge, height: R.H - 2 * R.marge, class: 'plan' }, svg)
    var clip = G.el('clipPath', { id: 'cadreB' }, G.el('defs', {}, svg))
    G.el('rect', { x: R.marge, y: R.marge, width: R.L - 2 * R.marge, height: R.H - 2 * R.marge }, clip)
    var g = G.el('g', { 'clip-path': 'url(#cadreB)' }, svg)
    // section entière (sans limite de hauteur), par morceaux continus
    var d = '', prec = null
    for (var i = 0; i <= N; i++) {
      var q = Gm.pts[i % N]
      if (!q) { prec = null; continue }
      var b = plan2(Gm, q), p = R.px(b[0], b[1])
      if (prec && Math.hypot(p[0] - prec[0], p[1] - prec[1]) > 80) prec = null
      d += (prec ? ' L' : ' M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)
      prec = p
    }
    G.el('path', { d: d.trim(), class: 'section' }, g)
    var th = Gm.th, pl = placeurEtiquettes(R.L, R.H), noms = []
    var Fs = []
    Gm.spheres.forEach(function (S, k) {
      if (Math.abs(S.zc) > 40) return
      var bF = plan2(Gm, S.F)
      Fs.push([bF, k])
      if (Gm.nature !== 'cercle') {
        var sd = (X0[2] - S.h) / Math.sin(th)
        if (sd > FENB.xMin && sd < FENB.xMax) {
          var a = R.px(sd, FENB.yMin), bb = R.px(sd, FENB.yMax)
          G.el('line', { x1: a[0].toFixed(1), y1: a[1].toFixed(1), x2: bb[0].toFixed(1), y2: bb[1].toFixed(1), class: k ? 'directrice2' : 'directrice' }, g)
          noms.push([[sd, FENB.yMin + 0.35], k ? 'd′' : 'd', null, k ? 'et-soft' : '', 0])
        }
      }
    })
    if (P) {
      var bP = plan2(Gm, P), pP = R.px(bP[0], bP[1])
      Fs.forEach(function (f) {
        var q = R.px(f[0][0], f[0][1])
        G.el('line', { x1: pP[0].toFixed(1), y1: pP[1].toFixed(1), x2: q[0].toFixed(1), y2: q[1].toFixed(1), class: f[1] ? 'seg-f2' : 'seg-f' }, g)
      })
      if (Gm.nature !== 'cercle') {
        var sd0 = (X0[2] - Gm.spheres[0].h) / Math.sin(th), qH = R.px(sd0, bP[1])
        G.el('line', { x1: pP[0].toFixed(1), y1: pP[1].toFixed(1), x2: qH[0].toFixed(1), y2: qH[1].toFixed(1), class: 'seg-d' }, g)
      }
    }
    Fs.forEach(function (f) {
      if (Gm.nature === 'cercle' && f[1]) return
      noms.push([f[0], Gm.nature === 'cercle' ? 'F = F′' : f[1] ? 'F′' : 'F', f[1] ? 'pt-plan' : 'pt-good', f[1] ? 'et-plan' : 'et-good', 4.5])
    })
    if (P) { var bp = plan2(Gm, P); noms.push([bp, 'P', 'pt-acc', 'et-acc', 6]) }
    noms.forEach(function (o) { if (o[4]) { var p = R.px(o[0][0], o[0][1]); pl.point(p[0], p[1], 7) } })
    noms.forEach(function (o) { if (!o[4] || !R.dansFenetre(o[0][0], o[0][1])) return; var p = R.px(o[0][0], o[0][1]); G.el('circle', { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: o[4], class: o[2] }, svg) })
    noms.forEach(function (o) { if (!R.dansFenetre(o[0][0], o[0][1])) return; var p = R.px(o[0][0], o[0][1]); pl.poser(svg, p[0], p[1], o[1], o[3], o[4] ? [0, 2] : [6, 7]) })
    var t = G.el('text', { x: R.marge + 4, y: R.marge + 14, class: 'titre-svg' }, svg); t.textContent = 'Vraie forme, dans le plan'
    if (P && R.dansFenetre(plan2(Gm, P)[0], plan2(Gm, P)[1])) { var bq = plan2(Gm, P); G.poignee(svg, R, bq[0], bq[1], 'P', false) }
  }
}

if (!customElements.get('dandelin-cone-widget')) customElements.define('dandelin-cone-widget', DandelinConeWidget)
