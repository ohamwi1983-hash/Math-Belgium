/* ================================================================
 * <aire-variable-widget> — atelier « Aire variable » (6e, ch. 9, § 1).
 * A(1 ; 1), B(5 ; 1) fixes ; C(t) = P₀ + t·u parcourt une droite d
 * (quatre droites au choix : perpendiculaire à (AB), oblique, passant
 * par A, parallèle à (AB)). En haut, le triangle ABC(t) ; en bas, le
 * graphique de l'aire en fonction de t : un V, aire = ½|K + Mt|. La
 * droite « aire = k » coupe le V en deux points t₁ et t₂ : C₁ et C₂,
 * symétriques par rapport au point I = d ∩ (AB) (milieu de [C₁C₂]) ;
 * par rapport à la droite (AB) seulement si d ⟂ (AB) — sinon le
 * symétrique C₁′ de C₁ par rapport à (AB) est dessiné hors de d.
 * k = 0 : une seule position (triangle aplati). d ∥ (AB) : aire
 * constante. C se glisse sur d (au pas de 0,125) ou par le curseur t ;
 * toucher le graphique choisit t. Fenêtres FIXES. Couleurs : triangle
 * courant orange, solutions vert, I rose, d violet.
 * Web Component (Shadow DOM).
 * ================================================================ */
import './geo-analytique-commun.js'
import { styleKatex, tex, texEgalites, CSS_BASE } from './katex-shadow.js'
import { curseurHTML, majCurseur, borner } from './variables-aleatoires-commun.js'
import { texN, CSS_LIEUX } from './lieux-geometriques-commun.js'

var G = window.GeoAnaCommun
var FEN = { xMin: -3.5, xMax: 7.5, yMin: -3.5, yMax: 5.5 }
var R = G.repere(FEN, 30, 14)
var HG = 180 // hauteur du graphique de l'aire
var GT = { min: -4, max: 7.5 }, GA = 10.5 // fenêtre du graphique : t de −4 à 7,5, aire de 0 à 10,5
var PAS_T = 0.125
var A = [1, 1], B = [5, 1]
var DROITES = {
  perp: { nom: 'd ⟂ (AB)', eq: 'x=3', P0: [3, 0], u: [0, 1], tMin: -3.5, tMax: 5.5, tDef: 2.5 },
  oblique: { nom: 'd oblique', eq: 'y=2x-3', P0: [0, -3], u: [1, 2], tMin: -0.25, tMax: 4.25, tDef: 3 },
  parA: { nom: 'd passe par A', eq: 'y=-x+2', P0: [0, 2], u: [1, -1], tMin: -3.5, tMax: 5.5, tDef: -1 },
  para: { nom: 'd ∥ (AB)', eq: 'y=3', P0: [0, 3], u: [1, 0], tMin: -3.5, tMax: 7.5, tDef: 2 },
}
function KM(d) { return [4 * (d.P0[1] - 1), 4 * d.u[1]] } // aire = ½|K + Mt| (AB = (4 ; 0))
function C(d, t) { return [d.P0[0] + t * d.u[0], d.P0[1] + t * d.u[1]] }
function aire(d, t) { var km = KM(d); return Math.abs(km[0] + km[1] * t) / 2 }
function gx(t) { return R.marge + 22 + (t - GT.min) / (GT.max - GT.min) * (R.L - 2 * R.marge - 30) }
function gy(a) { return R.H + 14 + (1 - a / GA) * (HG - 40) }
function txtN(x) { return G.nb(x, 3) }
function cTex(nom, P) { return tex(nom + '\\left(' + texN(P[0], 3) + '\\,;' + texN(P[1], 3) + '\\right)') }

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE + CSS_LIEUX +
  '.tri-c{fill:var(--accent,#b65c1f);fill-opacity:0.22;stroke:var(--accent,#b65c1f);stroke-width:2;stroke-linejoin:round;}' +
  '.tri-s{fill:var(--good,#2f7a4f);fill-opacity:0.08;stroke:var(--good,#2f7a4f);stroke-width:1.6;stroke-dasharray:5 4;}' +
  '.droite-d{stroke:var(--plan,#5b4ea3);stroke-width:2.2;}' +
  '.v{fill:none;stroke:var(--ink,#182430);stroke-width:2.2;stroke-linejoin:round;}' +
  '.k-ligne{stroke:var(--good,#2f7a4f);stroke-width:1.8;stroke-dasharray:6 4;}' +
  '.cadre-g{fill:var(--surface-2,#f7f9fb);}' +
  '.sep{stroke:var(--line,#ccd8e0);stroke-width:1;}' +
  '.pt-ombre{fill:var(--surface-2,#f7f9fb);stroke:var(--bad,#b23a3a);stroke-width:2;}' +
  '.droites .btn{font-size:0.86rem;}' +
  '.etat-c.ok{color:var(--good,#2f7a4f);font-weight:700;}' +
  '</style>' +
  '<div class="rangee droites" role="group" aria-label="Droite d">' +
  Object.keys(DROITES).map(function (k) { return '<button class="btn" data-d="' + k + '">' + DROITES[k].nom + '</button>' }).join('') + '</div>' +
  '<p class="consigne">Fais glisser C sur la droite d, ou touche le graphique de l’aire. Règle l’aire cible k.</p>' +
  '<div class="figure"><svg id="svg" class="glisser" viewBox="0 0 ' + R.L + ' ' + (R.H + HG) + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="En haut le triangle ABC, en bas l’aire en fonction de t"></svg></div>' +
  '<div class="panneau" id="etat" aria-live="polite"></div>' +
  '<div class="reglages">' + curseurHTML('t', 'Paramètre t de C', -4, 8, PAS_T) + curseurHTML('k', 'Aire cible k', 0, 8, 0.5) + '</div>' +
  '<div class="panneau" id="solutions" aria-live="polite"></div>'

class AireVariableWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._d = 'perp'
    this._t = DROITES.perp.tDef
    this._k = 6
    this._ecouteurs = []
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh, svg = sh.getElementById('svg')
    sh.querySelectorAll('[data-d]').forEach(function (b) {
      b.addEventListener('click', function () { self._d = b.getAttribute('data-d'); self._t = DROITES[self._d].tDef; self._bornes(); self._rendre() })
    })
    function reglerT(v) { var d = DROITES[self._d]; self._t = borner(Math.round(v / PAS_T) * PAS_T, d.tMin, d.tMax); self._rendre() }
    function reglerK(v) { self._k = borner(Math.round(v * 2) / 2, 0, 8); self._rendre() }
    sh.getElementById('t').addEventListener('input', function (e) { reglerT(parseFloat(e.target.value)) })
    sh.getElementById('t-moins').addEventListener('click', function () { reglerT(self._t - PAS_T) })
    sh.getElementById('t-plus').addEventListener('click', function () { reglerT(self._t + PAS_T) })
    sh.getElementById('k').addEventListener('input', function (e) { reglerK(parseFloat(e.target.value)) })
    sh.getElementById('k-moins').addEventListener('click', function () { reglerK(self._k - 0.5) })
    sh.getElementById('k-plus').addEventListener('click', function () { reglerK(self._k + 0.5) })
    // Glisser C : projection du pointeur sur d
    G.glisser(this, svg, R, function () {}, function (n, x, y) {
      var d = DROITES[self._d], u = d.u, L2 = u[0] * u[0] + u[1] * u[1]
      reglerT(((x - d.P0[0]) * u[0] + (y - d.P0[1]) * u[1]) / L2)
    })
    // Toucher / glisser le graphique : t lu en abscisse
    var surG = false
    function lireG(e) {
      var ctm = svg.getScreenCTM(); if (!ctm) return null
      var pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY
      var q = pt.matrixTransform(ctm.inverse())
      return q
    }
    svg.addEventListener('pointerdown', function (e) {
      var q = lireG(e)
      if (!q || q.y < R.H || (e.target.getAttribute && e.target.getAttribute('data-poignee'))) return
      surG = true
      try { svg.setPointerCapture(e.pointerId) } catch { /* facultatif */ }
      reglerT(GT.min + (q.x - gx(GT.min)) / (gx(GT.max) - gx(GT.min)) * (GT.max - GT.min))
      e.preventDefault()
    })
    svg.addEventListener('pointermove', function (e) {
      if (!surG) return
      var q = lireG(e); if (q) reglerT(GT.min + (q.x - gx(GT.min)) / (gx(GT.max) - gx(GT.min)) * (GT.max - GT.min))
    })
    svg.addEventListener('pointerup', function () { surG = false })
    svg.addEventListener('pointercancel', function () { surG = false })
    this._bornes()
    this._rendre()
  }

  _bornes() { var d = DROITES[this._d], inp = this._sh.getElementById('t'); inp.min = String(d.tMin); inp.max = String(d.tMax) }

  _rendre() {
    var sh = this._sh, self = this, d = DROITES[this._d], t = this._t, k = this._k
    var km = KM(d), K = km[0], M = km[1]
    sh.querySelectorAll('[data-d]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-d') === self._d)) })
    majCurseur(sh, 't', t, 't=' + texN(t, 3))
    majCurseur(sh, 'k', k, 'k=' + texN(k, 1))
    var Ct = C(d, t), at = aire(d, t)
    var sols = []
    if (M !== 0) {
      var t1 = (-2 * k - K) / M, t2 = (2 * k - K) / M
      sols = k === 0 ? [t1] : [Math.min(t1, t2), Math.max(t1, t2)]
    }
    var t0 = M !== 0 ? -K / M : null, I = t0 !== null ? C(d, t0) : null
    var surSol = M === 0 ? Math.abs(at - k) < 1e-9 : sols.some(function (s) { return Math.abs(s - t) < 1e-9 })

    // ---------- État de C ----------
    var Mt = M === 0 ? texN(K, 0) : texN(K, 0) + (M > 0 ? '+' : '-') + (Math.abs(M) === 1 ? '' : Math.abs(M)) + 't'
    function coordT(p0, u) {
      if (!u) return texN(p0, 0)
      var tt = (Math.abs(u) === 1 ? '' : Math.abs(u)) + 't'
      return p0 === 0 ? (u < 0 ? '-' : '') + tt : texN(p0, 0) + (u > 0 ? '+' : '-') + tt
    }
    var h = '<p class="ligne">' + tex('d : ' + d.eq) + ', ' + tex('C(t)=\\left(' + coordT(d.P0[0], d.u[0]) + '\\,;' + coordT(d.P0[1], d.u[1]) + '\\right)') + '.</p>'
    h += '<p class="ligne">' + texEgalites(['\\text{aire}=\\frac12\\times AB\\times d\\big(C\\,;(AB)\\big)', '\\frac12\\times4\\times|y_C-1|', '\\frac12\\left|' + Mt + '\\right|'], '=') + '</p><p class="note">Formule du cours ' + tex('\\tfrac12|K+M\\,t|') + ' avec ' + tex('K=' + texN(K, 0)) + ' et ' + tex('M=' + texN(M, 0)) + '.</p>'
    h += '<p>' + cTex('C', Ct) + ' : ' + tex('\\text{aire}=' + texN(at, 3)) + (surSol ? ' <span class="etat-c ok">= k : C est une solution.</span>' : '.') + '</p>'
    sh.getElementById('etat').innerHTML = h

    // ---------- Solutions ----------
    var s = '<p class="titre-panneau">Aire égale à k = ' + txtN(k) + '</p>'
    if (M === 0) {
      s += '<p>' + tex('M=0') + ' : d est parallèle à (AB), la hauteur ne change pas, l’aire vaut toujours ' + tex('\\frac12\\times4\\times2=4') + '. '
      s += k === 4 ? '<span class="c-good">Tous les points de d conviennent.</span>' : '<span class="c-bad">Aucun point de d ne convient.</span>'
      s += ' C’est pourquoi la méthode exclut le cas d ∥ (AB).</p>'
    } else if (k === 0) {
      s += '<p>' + tex('\\left|' + Mt + '\\right|=0') + ' : <span class="c-attn">une seule position</span>, ' + cTex('C', C(d, t0)) + ' = I, sur (AB) : le triangle est aplati.</p>'
    } else {
      var C1 = C(d, sols[0]), C2 = C(d, sols[1])
      s += '<p class="ligne">' + tex('\\left|' + Mt + '\\right|=' + texN(2 * k, 1)) + ' ⟺ ' + tex(Mt + '=' + texN(2 * k, 1)) + ' ou ' + tex(Mt + '=' + texN(-2 * k, 1)) + '</p>'
      s += '<p class="ligne">' + tex('t_1=' + texN(sols[0], 3)) + ' et ' + tex('t_2=' + texN(sols[1], 3)) + ' : ' + '<span class="c-good">' + cTex('C_1', C1) + '</span> et <span class="c-good">' + cTex('C_2', C2) + '</span>. Toujours deux solutions (valeur absolue).</p>'
      s += '<p><span class="c-rose">Symétriques par rapport au point ' + cTex('I', I) + '</span>, intersection de d et de (AB) : I est le milieu de ' + tex('[C_1C_2]') + ' (le V est symétrique autour de ' + tex('t_0=' + texN(t0, 3)) + ').</p>'
      if (d.u[0] === 0) s += '<p>Ici d ⟂ (AB) : C₁ et C₂ sont <strong>aussi</strong> symétriques par rapport à la droite (AB).</p>'
      else s += '<p>Mais <strong>pas</strong> par rapport à la droite (AB) : le symétrique ' + cTex('C_1\'', [C1[0], 2 - C1[1]]) + ' de C₁ par rapport à (AB) (rond rouge) n’est pas sur d.</p>'
      if (this._d === 'parA') s += '<p class="note">d passe par A : il y a quand même deux solutions ; seul C = A donne un triangle aplati.</p>'
    }
    sh.getElementById('solutions').innerHTML = s

    // ---------- Figure du haut ----------
    var svg = sh.getElementById('svg')
    svg.innerHTML = ''
    R.fond(svg, 2)
    var defs = svg.querySelector('defs')
    var clip = G.el('clipPath', { id: 'cadre' }, defs)
    G.el('rect', { x: R.marge, y: R.marge, width: R.L - 2 * R.marge, height: R.H - 2 * R.marge }, clip)
    var g = G.el('g', { 'clip-path': 'url(#cadre)' }, svg)
    function ligne(par, P, Q, cls) { var p = R.px(P[0], P[1]), q = R.px(Q[0], Q[1]); return G.el('line', { x1: p[0].toFixed(1), y1: p[1].toFixed(1), x2: q[0].toFixed(1), y2: q[1].toFixed(1), class: cls }, par) }
    function tri(P, cls) { G.el('polygon', { points: [A, B, P].map(function (q) { var p = R.px(q[0], q[1]); return p[0].toFixed(1) + ',' + p[1].toFixed(1) }).join(' '), class: cls }, g) }
    function pt(P, cls, r) { var p = R.px(P[0], P[1]); G.el('circle', { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: r || 4, class: cls }, svg) }
    function etiq(P, txt, cls, dx, dy) {
      var p = R.px(P[0], P[1]), w = txt.length * 8
      var tx = Math.max(4 + w / 2, Math.min(R.L - 4 - w / 2, p[0] + dx)), ty = Math.max(15, Math.min(R.H - 5, p[1] + dy))
      var e = G.el('text', { x: tx.toFixed(1), y: ty.toFixed(1), 'text-anchor': 'middle', class: 'et ' + (cls || '') }, svg)
      e.textContent = txt
    }
    ligne(g, [FEN.xMin, 1], [FEN.xMax, 1], 'trait-soft pointille fin')
    ligne(g, C(d, -40), C(d, 40), 'droite-d')
    if (M !== 0 && k > 0) {
      var S1 = C(d, sols[0]), S2 = C(d, sols[1])
      tri(S1, 'tri-s'); tri(S2, 'tri-s')
      ligne(g, S1, S2, 'trait-rose fin pointille')
    }
    tri(Ct, 'tri-c')
    ligne(g, A, B, 'trait')
    // Hauteur issue de C
    ligne(g, Ct, [Ct[0], 1], 'trait-acc fin pointille')
    pt(A, 'pt'); pt(B, 'pt')
    etiq(A, 'A', '', -10, -8); etiq(B, 'B', '', 10, -8)
    var dHaut = C(d, d.tMax - 0.4)
    etiq(dHaut, 'd', 'et-plan', 12, 4)
    if (M !== 0 && k > 0) {
      var c1 = C(d, sols[0]), c2 = C(d, sols[1])
      pt(c1, 'pt-good', 5); pt(c2, 'pt-good', 5)
      etiq(c1, 'C₁', 'et-good', 17, 5); etiq(c2, 'C₂', 'et-good', 17, 5)
      if (d.u[0] !== 0) { pt([c1[0], 2 - c1[1]], 'pt-ombre', 5); etiq([c1[0], 2 - c1[1]], 'C₁′', 'et-bad', 18, 5) }
    }
    if (I) { pt(I, 'pt-rose', 4.5); etiq(I, 'I', 'et-rose', 9, 16) }
    pt(Ct, surSol ? 'pt-good' : 'pt-acc', 6.5)
    etiq(Ct, 'C', surSol ? 'et-good' : 'et-acc', 13, -9)
    G.poignee(svg, R, Ct[0], Ct[1], 'C', false)

    // ---------- Graphique de l'aire ----------
    G.el('line', { x1: 0, x2: R.L, y1: R.H, y2: R.H, class: 'sep' }, svg)
    var ax0 = gx(0)
    for (var tt = Math.ceil(GT.min); tt <= GT.max; tt++) G.el('line', { x1: gx(tt), x2: gx(tt), y1: gy(0), y2: gy(GA), class: 'grille' }, svg)
    for (var aa = 2; aa <= 10; aa += 2) {
      G.el('line', { x1: gx(GT.min), x2: gx(GT.max), y1: gy(aa), y2: gy(aa), class: 'grille' }, svg)
      var ta = G.el('text', { x: ax0 - 5, y: gy(aa) + 4, 'text-anchor': 'end', class: 'graduation' }, svg); ta.textContent = String(aa)
    }
    for (tt = -4; tt <= 6; tt += 2) { if (!tt) continue; var tl = G.el('text', { x: gx(tt), y: gy(0) + 14, 'text-anchor': 'middle', class: 'graduation' }, svg); tl.textContent = G.moins(tt) }
    var t0l = G.el('text', { x: ax0 - 5, y: gy(0) + 14, 'text-anchor': 'end', class: 'graduation' }, svg); t0l.textContent = '0'
    G.el('line', { x1: gx(GT.min), x2: gx(GT.max) + 4, y1: gy(0), y2: gy(0), class: 'axe', 'marker-end': 'url(#fl)' }, svg)
    G.el('line', { x1: ax0, x2: ax0, y1: gy(0), y2: R.H + 6, class: 'axe', 'marker-end': 'url(#fl)' }, svg)
    var nt = G.el('text', { x: gx(GT.max), y: gy(0) - 6, 'text-anchor': 'end', class: 'graduation axe-nom' }, svg); nt.textContent = 't'
    var na = G.el('text', { x: ax0 - 7, y: R.H + 12, 'text-anchor': 'end', class: 'graduation axe-nom' }, svg); na.textContent = 'aire'
    // V (sur la plage de t de la droite), ligne aire = k
    var dV = '', n = 120
    for (var i = 0; i <= n; i++) { var tv = d.tMin + (d.tMax - d.tMin) * i / n; if (t0 !== null && i > 0) { var tp = d.tMin + (d.tMax - d.tMin) * (i - 1) / n; if (tp < t0 && tv > t0) dV += ' L' + gx(t0).toFixed(1) + ',' + gy(0).toFixed(1) } dV += (i ? ' L' : 'M') + gx(tv).toFixed(1) + ',' + gy(Math.min(GA, aire(d, tv))).toFixed(1) }
    G.el('path', { d: dV, class: 'v' }, svg)
    G.el('line', { x1: gx(GT.min), x2: gx(GT.max), y1: gy(k), y2: gy(k), class: 'k-ligne' }, svg)
    if (k > 0) { var tk = G.el('text', { x: gx(GT.max) - 2, y: gy(k) - 5, 'text-anchor': 'end', class: 'et et-petit et-good' }, svg); tk.textContent = 'aire = k' }
    if (t0 !== null) {
      G.el('line', { x1: gx(t0), x2: gx(t0), y1: gy(0), y2: gy(GA), class: 'trait-rose fin pointille' }, svg)
      var ti = G.el('text', { x: gx(t0) + 5, y: R.H + 13, 'text-anchor': 'start', class: 'et et-petit et-rose' }, svg); ti.textContent = 't₀ (I)'
    }
    sols.forEach(function (sv) { G.el('circle', { cx: gx(sv).toFixed(1), cy: gy(k).toFixed(1), r: 5, class: 'pt-good' }, svg) })
    G.el('line', { x1: gx(t), x2: gx(t), y1: gy(0), y2: gy(at), class: 'trait-acc fin' }, svg)
    G.el('circle', { cx: gx(t).toFixed(1), cy: gy(Math.min(GA, at)).toFixed(1), r: 5.5, class: surSol ? 'pt-good' : 'pt-acc' }, svg)
  }
}

if (!customElements.get('aire-variable-widget')) customElements.define('aire-variable-widget', AireVariableWidget)
