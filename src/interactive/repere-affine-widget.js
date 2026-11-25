/* ================================================================
 * <repere-affine-widget> — atelier « Repère orthonormé ou affine »
 * (6e, ch. 9, § 1). On règle l'angle ω entre les axes (30° à 150°) et
 * le rapport k des unités (unité de l'axe des y = k × unité de l'axe
 * des x, de 0,5 à 2). Quadrillage du repère (parallélogrammes), unités
 * marquées « 1 » sur chaque axe. L'ensemble des points dont les
 * coordonnées vérifient x² + y² = 4 (vert) est un cercle de rayon 2
 * seulement si ω = 90° et k = 1 ; sinon une ellipse, comparée au vrai
 * cercle de centre O et de rayon 2 (pointillés). M parcourt cet
 * ensemble (glissé au doigt ou curseur t) : ses coordonnées se lisent
 * parallèlement aux axes ; la formule √(x² + y²) donne toujours 2, la
 * vraie longueur OM = √(x² + 2k·cos ω·xy + k²y²) (en unités de l'axe
 * des x) non. Préréglages : orthonormé, unités différentes, axes
 * obliques, quelconque. Fenêtre FIXE. Web Component (Shadow DOM).
 * ================================================================ */
import './geo-analytique-commun.js'
import { styleKatex, tex, texEgalites, CSS_BASE } from './katex-shadow.js'
import { curseurHTML, majCurseur, borner } from './variables-aleatoires-commun.js'
import { texN, CSS_LIEUX, placeurEtiquettes } from './lieux-geometriques-commun.js'

var G = window.GeoAnaCommun
var FEN = { xMin: -5, xMax: 5, yMin: -5, yMax: 5 }
var R = G.repere(FEN, 34, 14)
var D2R = Math.PI / 180
var PRESETS = {
  ortho: { nom: 'Orthonormé', w: 90, k: 1 },
  unites: { nom: 'Unités différentes', w: 90, k: 2 },
  obliques: { nom: 'Axes obliques', w: 60, k: 1 },
  quelconque: { nom: 'Quelconque', w: 120, k: 1.5 },
}

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE + CSS_LIEUX +
  '.quad{stroke:var(--line,#ccd8e0);stroke-width:0.9;}' +
  '.axe-a{stroke:var(--ink-soft,#51626f);stroke-width:1.4;}' +
  '.unite-x{stroke:var(--accent,#b65c1f);stroke-width:4;stroke-linecap:round;}' +
  '.unite-y{stroke:var(--sky,#2f6fb0);stroke-width:4;stroke-linecap:round;}' +
  '.ens{fill:var(--good,#2f7a4f);fill-opacity:0.07;stroke:var(--good,#2f7a4f);stroke-width:2.6;}' +
  '.vrai{fill:none;stroke:var(--ink-soft,#51626f);stroke-width:1.5;stroke-dasharray:6 5;}' +
  '.lecture{stroke:var(--plan,#5b4ea3);stroke-width:1.4;stroke-dasharray:4 4;}' +
  '.om{stroke:var(--rose,#b23a7a);stroke-width:2.6;}' +
  '.m{fill:var(--rose,#b23a7a);stroke:var(--surface,#fff);stroke-width:2;}' +
  '.grad{font-size:11px;fill:var(--ink-soft,#51626f);font-family:var(--sans,sans-serif);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3px;stroke-linejoin:round;}' +
  '.presets .btn{font-size:0.86rem;}' +
  '.c-sky{color:var(--sky-ink,#1f4e7d);font-weight:700;}' +
  '</style>' +
  '<div class="rangee presets" role="group" aria-label="Préréglages">' +
  Object.keys(PRESETS).map(function (k) { return '<button class="btn" data-p="' + k + '">' + PRESETS[k].nom + '</button>' }).join('') + '</div>' +
  '<p class="consigne">Règle l’angle entre les axes et le rapport des unités. Fais glisser M sur l’ensemble x² + y² = 4.</p>' +
  '<div class="figure"><svg id="svg" class="glisser" viewBox="0 0 ' + R.L + ' ' + R.H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Le repère, l’ensemble des points vérifiant x² + y² = 4 et le vrai cercle de rayon 2"></svg></div>' +
  '<p class="verdict" id="verdict" aria-live="polite"></p>' +
  '<div class="reglages">' + curseurHTML('w', 'Angle entre les axes', 30, 150, 5) + curseurHTML('k', 'Rapport des unités', 0.5, 2, 0.25) + curseurHTML('t', 'Position de M', 0, 355, 5) + '</div>' +
  '<div class="panneau" id="calcul" aria-live="polite"></div>'

class RepereAffineWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._w = 90
    this._k = 1
    this._t = 30
    this._ecouteurs = []
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh, svg = sh.getElementById('svg')
    sh.querySelectorAll('[data-p]').forEach(function (b) {
      b.addEventListener('click', function () { var p = PRESETS[b.getAttribute('data-p')]; self._w = p.w; self._k = p.k; self._rendre() })
    })
    function lier(id, pas, min, max, champ) {
      function regler(v) { self[champ] = borner(Math.round(v / pas) * pas, min, max); self._rendre() }
      sh.getElementById(id).addEventListener('input', function (e) { regler(parseFloat(e.target.value)) })
      sh.getElementById(id + '-moins').addEventListener('click', function () { regler(self[champ] - pas) })
      sh.getElementById(id + '-plus').addEventListener('click', function () { regler(self[champ] + pas) })
    }
    lier('w', 5, 30, 150, '_w')
    lier('k', 0.25, 0.5, 2, '_k')
    // t : un tour complet, 360 revient à 0
    function reglerT(v) { var t = Math.round(v / 5) * 5; self._t = ((t % 360) + 360) % 360; self._rendre() }
    sh.getElementById('t').addEventListener('input', function (e) { reglerT(parseFloat(e.target.value)) })
    sh.getElementById('t-moins').addEventListener('click', function () { reglerT(self._t - 5) })
    sh.getElementById('t-plus').addEventListener('click', function () { reglerT(self._t + 5) })
    // Glisser M : le pointeur est ramené en coordonnées du repère, puis sur l'ensemble (angle t)
    var glisse = false
    function depuis(e) {
      var p = R.monde(svg, e.clientX, e.clientY)
      if (!p) return
      var c = self._coords(p.x, p.y)
      if (Math.hypot(c[0], c[1]) < 1e-6) return
      var t = Math.atan2(c[1], c[0]) / D2R
      reglerT(t)
    }
    svg.addEventListener('pointerdown', function (e) { glisse = true; try { svg.setPointerCapture(e.pointerId) } catch { /* facultatif */ } depuis(e); e.preventDefault() })
    svg.addEventListener('pointermove', function (e) { if (glisse) { depuis(e); e.preventDefault() } })
    svg.addEventListener('pointerup', function () { glisse = false })
    svg.addEventListener('pointercancel', function () { glisse = false })
    this._rendre()
  }

  /** Vecteurs unités du repère, en coordonnées « vraies » (orthonormées de l'écran). */
  _base() { var w = this._w * D2R; return [[1, 0], [this._k * Math.cos(w), this._k * Math.sin(w)]] }
  /** Point de coordonnées (x ; y) dans le repère → position vraie. */
  _vrai(x, y) { var b = this._base(); return [x * b[0][0] + y * b[1][0], x * b[0][1] + y * b[1][1]] }
  /** Position vraie (u ; v) → coordonnées dans le repère. */
  _coords(u, v) { var b = this._base(), y = v / b[1][1]; return [u - y * b[1][0], y] }

  _rendre() {
    var sh = this._sh, self = this, w = this._w, k = this._k, t = this._t
    var ortho = w === 90 && k === 1
    var cosw = Math.cos(w * D2R); if (Math.abs(cosw) < 1e-12) cosw = 0
    var x = 2 * Math.cos(t * D2R), y = 2 * Math.sin(t * D2R)
    var M = this._vrai(x, y), om = Math.hypot(M[0], M[1])
    majCurseur(sh, 'w', w, '\\omega=' + w + '^\\circ')
    majCurseur(sh, 'k', k, 'k=' + texN(k, 2))
    majCurseur(sh, 't', t, 't=' + t + '^\\circ')
    sh.querySelectorAll('[data-p]').forEach(function (b) { var p = PRESETS[b.getAttribute('data-p')]; b.setAttribute('aria-pressed', String(p.w === w && p.k === k)) })

    // ---------- Verdict ----------
    var v = sh.getElementById('verdict')
    if (ortho) { v.className = 'verdict ok'; v.textContent = '✓ Repère orthonormé : l’ensemble x² + y² = 4 est bien le cercle de centre O et de rayon 2.' }
    else { v.className = 'verdict ko'; v.textContent = '✗ Repère seulement affine' + (w !== 90 ? ' (axes non perpendiculaires)' : ' (unités différentes)') + ' : l’ensemble x² + y² = 4 n’est pas un cercle, c’est une ellipse.' }

    // ---------- Calcul ----------
    var exactXY = Math.abs(x * 100 - Math.round(x * 100)) < 1e-6 && Math.abs(y * 100 - Math.round(y * 100)) < 1e-6
    var h = '<p class="titre-panneau">La formule de distance</p>'
    h += '<p class="ligne">' + tex('M' + (exactXY ? '' : '\\approx') + '\\left(' + texN(x, 2) + '\\,;' + texN(y, 2) + '\\right)') + ' vérifie ' + tex('x^2+y^2=4') + ' : la formule habituelle donne ' + tex('\\sqrt{x^2+y^2}=2') + '.</p>'
    var bon = Math.abs(om - 2) < 0.005
    h += '<p class="ligne">Vraie longueur <span class="c-rose">' + tex('OM' + (Math.abs(om * 100 - Math.round(om * 100)) < 1e-6 ? '=' : '\\approx') + texN(om, 2)) + '</span> (en unités de l’axe des x).'
    if (ortho) h += ' <span class="c-good">La formule est juste.</span>'
    else if (bon) h += ' <span class="c-attn">Ici la formule tombe juste par hasard : déplace M.</span>'
    else h += ' <span class="c-bad">La formule se trompe.</span>'
    h += '</p>'
    if (!ortho) {
      h += '<p class="ligne">Dans ce repère, ' + texEgalites(['OM^2', 'x^2+2k\\cos\\omega\\cdot xy+k^2y^2'], '=') + ' avec ' + tex('k=' + texN(k, 2)) + ' et ' + tex('\\cos\\omega' + (cosw === 0 || Math.abs(cosw - 0.5) < 1e-9 || Math.abs(cosw + 0.5) < 1e-9 ? '=' : '\\approx') + texN(cosw, 2)) + '. Elle ne redevient ' + tex('x^2+y^2') + ' que si ' + tex('\\omega=90^\\circ') + ' et ' + tex('k=1') + '.</p>'
    }
    h += '<p class="note">Ce qui ne dépend pas du repère : alignement, parallélisme, milieu, centre de gravité. Ce qui demande un repère orthonormé : distance, angle, équation de cercle.</p>'
    sh.getElementById('calcul').innerHTML = h

    // ---------- Figure ----------
    var svg = sh.getElementById('svg')
    svg.innerHTML = ''
    var defs = G.el('defs', {}, svg)
    var mk = G.el('marker', { id: 'fl', markerWidth: '8', markerHeight: '8', refX: '6', refY: '4', orient: 'auto' }, defs)
    G.el('path', { d: 'M0,0 L8,4 L0,8 Z', class: 'fleche-axe' }, mk)
    var clip = G.el('clipPath', { id: 'cadre' }, defs)
    G.el('rect', { x: R.marge, y: R.marge, width: R.L - 2 * R.marge, height: R.H - 2 * R.marge }, clip)
    var g = G.el('g', { 'clip-path': 'url(#cadre)' }, svg)
    function seg(P1, P2, cls, par) { var a = R.px(P1[0], P1[1]), b = R.px(P2[0], P2[1]); return G.el('line', { x1: a[0].toFixed(1), y1: a[1].toFixed(1), x2: b[0].toFixed(1), y2: b[1].toFixed(1), class: cls }, par || g) }
    // quadrillage du repère : droites x = i et y = j
    var N = 14, i
    for (i = -N; i <= N; i++) {
      seg(self._vrai(i, -N), self._vrai(i, N), 'quad')
      seg(self._vrai(-N, i), self._vrai(N, i), 'quad')
    }
    // axes fléchés : on coupe chaque axe au cadre (marge de 0,25)
    function bout(dir) {
      var tMax = Infinity
      if (Math.abs(dir[0]) > 1e-9) tMax = Math.min(tMax, (FEN.xMax - 0.25) / Math.abs(dir[0]))
      if (Math.abs(dir[1]) > 1e-9) tMax = Math.min(tMax, (FEN.yMax - 0.25) / Math.abs(dir[1]))
      return tMax
    }
    var b = this._base()
    var tx = bout(b[0]), ty = bout(b[1])
    var ax = seg([-tx * b[0][0], -tx * b[0][1]], [tx * b[0][0], tx * b[0][1]], 'axe-a', svg); ax.setAttribute('marker-end', 'url(#fl)')
    var ay = seg([-ty * b[1][0], -ty * b[1][1]], [ty * b[1][0], ty * b[1][1]], 'axe-a', svg); ay.setAttribute('marker-end', 'url(#fl)')
    // vrai cercle de rayon 2 et ensemble x² + y² = 4
    var O = R.px(0, 0)
    G.el('circle', { cx: O[0].toFixed(1), cy: O[1].toFixed(1), r: (2 * R.unite).toFixed(1), class: 'vrai' }, g)
    var d = ''
    for (i = 0; i <= 144; i++) { var a = i * 2.5 * D2R, q = self._vrai(2 * Math.cos(a), 2 * Math.sin(a)), p = R.px(q[0], q[1]); d += (i ? ' L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1) }
    G.el('path', { d: d + ' Z', class: 'ens' }, g)
    // unités : segments épais de O à (1 ; 0) et à (0 ; 1)
    seg([0, 0], b[0], 'unite-x', svg); seg([0, 0], b[1], 'unite-y', svg)
    // lecture des coordonnées de M, parallèlement aux axes
    var Px = this._vrai(x, 0), Py = this._vrai(0, y)
    seg(M, Px, 'lecture'); seg(M, Py, 'lecture')
    seg([0, 0], M, 'om', svg)
    var pM = R.px(M[0], M[1])
    G.el('circle', { cx: O[0].toFixed(1), cy: O[1].toFixed(1), r: 3.5, class: 'pt' }, svg)
    G.el('circle', { cx: pM[0].toFixed(1), cy: pM[1].toFixed(1), r: 7, class: 'm' }, svg)
    // étiquettes
    var pl = placeurEtiquettes(R.L, R.H)
    pl.point(O[0], O[1], 6); pl.point(pM[0], pM[1], 9)
    var p1 = R.px(b[0][0], b[0][1]), p2 = R.px(b[1][0], b[1][1])
    pl.point(p1[0], p1[1], 4); pl.point(p2[0], p2[1], 4)
    // graduations ±2 sur chaque axe
    ;[[2, 0], [-2, 0], [0, 2], [0, -2]].forEach(function (c) {
      var q = self._vrai(c[0], c[1]), p = R.px(q[0], q[1])
      G.el('circle', { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: 2.5, class: 'pt' }, svg)
      pl.point(p[0], p[1], 4)
    })
    pl.poser(svg, O[0], O[1], 'O', '', [3, 2])
    var e1 = R.px(b[0][0] / 2, b[0][1] / 2), e2 = R.px(b[1][0] / 2, b[1][1] / 2)
    pl.poser(svg, e1[0], e1[1], '1', 'et-acc et-petit', [5, 2])
    pl.poser(svg, e2[0], e2[1], '1', 'et-sky et-petit', [7, 1])
    ;[[2, 0, '2'], [-2, 0, '−2'], [0, 2, '2'], [0, -2, '−2']].forEach(function (c) {
      var q = self._vrai(c[0], c[1]), p = R.px(q[0], q[1])
      pl.poser(svg, p[0], p[1], c[2], 'et-soft et-petit', c[1] === 0 ? [5, 4] : [7, 6])
    })
    var fx = R.px(tx * b[0][0], tx * b[0][1]), fy = R.px(ty * b[1][0], ty * b[1][1])
    pl.poser(svg, fx[0], fx[1], 'x', 'et-soft', [1, 3])
    pl.poser(svg, fy[0], fy[1], 'y', 'et-soft', [0, 6])
    pl.poser(svg, pM[0], pM[1], 'M', 'et-rose', M[0] >= 0 ? [0, 2] : [1, 3])
  }
}

if (!customElements.get('repere-affine-widget')) customElements.define('repere-affine-widget', RepereAffineWidget)
