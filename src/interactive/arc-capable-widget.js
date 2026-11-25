/* ================================================================
 * <arc-capable-widget> — atelier « Arc capable » (6e, ch. 9, § 5 : la
 * figure des radars rendue manipulable). Radars A(−3 ; 0) et B(3 ; 0),
 * angle θ de 40° à 150° (pas de 5°, 45° comme la figure du cours).
 * « ▶ Lancer les radars » : le faisceau de A fait l'angle α avec (AB),
 * celui de B l'angle α + θ ; ils tournent au même rythme, leur écart
 * reste θ, leur croisement P (angle APB = θ) trace l'arc. P se glisse
 * aussi librement : l'angle APB est mesuré, P devient vert sur le lieu
 * (distance au lieu ≤ 0,12) et laisse une trace. « Montrer le lieu » :
 * deux arcs symétriques par rapport à (AB), centres (0 ; ±3/tan θ),
 * rayon 3/sin θ (angle au centre AΩB = 2θ), A et B exclus (ronds
 * vides), reste du cercle en pointillés (on y voit [AB] sous 180° − θ).
 * Valeurs exactes pour 45°, 60°, 90° (cercle de diamètre [AB], § 4),
 * 120°, 135°, 150°. Repère orthonormé à fenêtre FIXE.
 * Web Component (Shadow DOM).
 * ================================================================ */
import './geo-analytique-commun.js'
import { styleKatex, tex, texEgalites, CSS_BASE } from './katex-shadow.js'
import { curseurHTML, majCurseur, borner, arrondi } from './variables-aleatoires-commun.js'
import { texN, lecteur, CSS_LIEUX, placeurEtiquettes } from './lieux-geometriques-commun.js'

var G = window.GeoAnaCommun
var FEN = { xMin: -7, xMax: 7, yMin: -4.5, yMax: 9.5 }
var R = G.repere(FEN, 24, 14)
var A = [-3, 0], B = [3, 0]
var T_MIN = 40, T_MAX = 150, T_PAS = 5, T_DEF = 45
var D2R = Math.PI / 180
var TOL = 0.12
var EXACT = { 45: ['3', '3\\sqrt{2}'], 60: ['\\sqrt{3}', '2\\sqrt{3}'], 90: ['0', '3'], 120: ['-\\sqrt{3}', '2\\sqrt{3}'], 135: ['-3', '3\\sqrt{2}'], 150: ['-3\\sqrt{3}', '6'] }

function arc(th) { var t = th * D2R; return { c: 3 / Math.tan(t), r: 3 / Math.sin(t) } }
/** P pour le faisceau de A d'angle α (degrés) : AP = AB·sin(α + θ)/sin θ (loi des sinus). */
function pointRadar(al, th) { var ap = 6 * Math.sin((al + th) * D2R) / Math.sin(th * D2R); return [A[0] + ap * Math.cos(al * D2R), ap * Math.sin(al * D2R)] }
function rel(v) { return Math.abs(v * 10 - Math.round(v * 10)) < 1e-6 ? '=' : '\\approx' }
function angleAPB(P) {
  var ux = A[0] - P[0], uy = A[1] - P[1], vx = B[0] - P[0], vy = B[1] - P[1]
  var c = (ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy))
  return Math.acos(borner(c, -1, 1)) / D2R
}
/** Distance de P au lieu (deux arcs, A et B exclus). */
function distLieu(P, th) {
  var k = arc(th), best = Infinity
  ;[1, -1].forEach(function (sg) {
    var cy = sg * k.c, dx = P[0], dy = P[1] - cy, d = Math.hypot(dx, dy)
    if (d < 1e-9) { best = Math.min(best, k.r); return }
    var qy = cy + dy / d * k.r
    if (qy * sg > 0) best = Math.min(best, Math.abs(d - k.r))
    else best = Math.min(best, Math.hypot(P[0] - A[0], P[1]), Math.hypot(P[0] - B[0], P[1]))
  })
  return best
}

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE + CSS_LIEUX +
  '.lieu{fill:none;stroke:var(--accent,#b65c1f);stroke-width:2.4;}' +
  '.lieu-reste{fill:none;stroke:var(--ink-soft,#51626f);stroke-width:1.3;stroke-dasharray:5 5;}' +
  '.faisceau-a{stroke:var(--sky,#2f6fb0);stroke-width:2;}' +
  '.faisceau-b{stroke:var(--good,#2f7a4f);stroke-width:2;}' +
  '.cote{stroke:var(--ink-soft,#51626f);stroke-width:1.4;}' +
  '.seg-ab{stroke:var(--ink,#182430);stroke-width:2.2;}' +
  '.angle-p{fill:var(--rose,#b23a7a);fill-opacity:0.16;stroke:var(--rose,#b23a7a);stroke-width:1.6;}' +
  '.angle-a{fill:none;stroke:var(--sky,#2f6fb0);stroke-width:1.6;}' +
  '.angle-b{fill:none;stroke:var(--good,#2f7a4f);stroke-width:1.6;}' +
  '.angle-c{fill:none;stroke:var(--attn,#96650c);stroke-width:1.6;}' +
  '.trace{fill:var(--rose,#b23a7a);opacity:0.5;}' +
  '.p-ok{fill:var(--good,#2f7a4f);stroke:var(--surface,#fff);stroke-width:2;}' +
  '.p-ko{fill:var(--bad,#b23a3a);stroke:var(--surface,#fff);stroke-width:2;}' +
  '.ouvert{fill:var(--surface-2,#f7f9fb);stroke:var(--accent,#b65c1f);stroke-width:2.2;}' +
  '.c-sky{color:var(--sky-ink,#1f4e7d);font-weight:700;}' +
  '#lancer{min-width:150px;}' +
  '</style>' +
  '<p class="consigne">Lance les radars, ou fais glisser P : sous quel angle voit-il le segment [AB] ?</p>' +
  '<div class="figure"><svg id="svg" class="glisser" viewBox="0 0 ' + R.L + ' ' + R.H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Les radars A et B, leurs faisceaux et le point P qui voit [AB] sous l’angle thêta"></svg></div>' +
  '<p class="verdict" id="verdict" aria-live="polite"></p>' +
  '<div class="panneau" id="etat"></div>' +
  '<div class="reglages">' + curseurHTML('t', 'Angle thêta', T_MIN, T_MAX, T_PAS) + '</div>' +
  '<div class="rangee"><button class="btn" id="lancer" aria-pressed="false">▶ Lancer les radars</button><button class="btn" id="montrer" aria-pressed="false">Montrer le lieu</button><button class="btn" id="effacer">Effacer la trace</button></div>' +
  '<div class="panneau" id="lieu" aria-live="polite"></div>'

class ArcCapableWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._t = T_DEF
    this._al = 60
    this._radar = true // P donné par les faisceaux (sinon P libre)
    this._P = pointRadar(60, T_DEF)
    this._trace = []
    this._montrer = false
    this._ecouteurs = []
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh, svg = sh.getElementById('svg')
    function reglerT(v) {
      self._t = borner(Math.round(v / T_PAS) * T_PAS, T_MIN, T_MAX)
      self._trace = []
      if (self._radar) { self._al = Math.min(self._al, 180 - self._t - 2); self._P = pointRadar(self._al, self._t) }
      self._rendre(false)
    }
    sh.getElementById('t').addEventListener('input', function (e) { reglerT(parseFloat(e.target.value)) })
    sh.getElementById('t-moins').addEventListener('click', function () { reglerT(self._t - T_PAS) })
    sh.getElementById('t-plus').addEventListener('click', function () { reglerT(self._t + T_PAS) })
    sh.getElementById('montrer').addEventListener('click', function () { self._montrer = !self._montrer; self._rendre(false) })
    sh.getElementById('effacer').addEventListener('click', function () { self._trace = []; self._rendre(false) })
    var btn = sh.getElementById('lancer')
    this._lect = lecteur(24, function () {
      var fin = 180 - self._t
      var v = arrondi(self._al + fin / 96, 4)
      if (v >= fin - 1e-6) v = fin / 96
      self._al = v; self._radar = true
      self._P = pointRadar(v, self._t)
      self._rendre(true)
    }, function (enCours) {
      btn.setAttribute('aria-pressed', String(enCours)); btn.textContent = enCours ? '❚❚ Pause' : '▶ Lancer les radars'
      if (enCours && !self._radar) { self._radar = true; self._al = (180 - self._t) / 96 }
    })
    btn.addEventListener('click', function () { self._lect.basculer() })
    var glisse = false
    function depuis(e) {
      var p = R.monde(svg, e.clientX, e.clientY)
      if (!p) return
      self._radar = false
      self._P = [arrondi(borner(p.x, FEN.xMin + 0.1, FEN.xMax - 0.1), 2), arrondi(borner(p.y, FEN.yMin + 0.1, FEN.yMax - 0.1), 2)]
      self._rendre(true)
    }
    svg.addEventListener('pointerdown', function (e) { self._lect.arreter(); glisse = true; try { svg.setPointerCapture(e.pointerId) } catch { /* facultatif */ } depuis(e); e.preventDefault() })
    svg.addEventListener('pointermove', function (e) { if (glisse) { depuis(e); e.preventDefault() } })
    svg.addEventListener('pointerup', function () { glisse = false })
    svg.addEventListener('pointercancel', function () { glisse = false })
    this._rendre(false)
  }

  disconnectedCallback() { if (this._lect) this._lect.arreter() }

  _rendre(noter) {
    var sh = this._sh, th = this._t, P = this._P, k = arc(th)
    var exclu = Math.hypot(P[0] - A[0], P[1]) < 0.15 || Math.hypot(P[0] - B[0], P[1]) < 0.15
    var surAB = !exclu && Math.abs(P[1]) < 0.02 && P[0] > A[0] && P[0] < B[0]
    var ang = exclu ? null : angleAPB(P)
    // sur le lieu : près de l’arc ET angle mesuré à 1,5° près (près de A et B, l’angle varie très vite)
    var ok = !exclu && distLieu(P, th) <= TOL && Math.abs(ang - th) <= 1.5
    if (noter && ok) { this._trace.push(P.slice()); if (this._trace.length > 2500) this._trace.shift() }
    majCurseur(sh, 't', th, '\\theta=' + th + '^\\circ')
    var bm = sh.getElementById('montrer')
    bm.setAttribute('aria-pressed', String(this._montrer)); bm.textContent = this._montrer ? 'Cacher le lieu' : 'Montrer le lieu'

    // ---------- Verdict et état ----------
    var v = sh.getElementById('verdict')
    if (exclu) { v.className = 'verdict ko'; v.textContent = '✗ P est sur un radar : l’angle APB n’existe pas (A et B sont exclus du lieu).' }
    else if (ok) { v.className = 'verdict ok'; v.textContent = '✓ P voit [AB] sous l’angle θ (à quelques pixels près) : il est sur le lieu.' }
    else { v.className = 'verdict ko'; v.textContent = '✗ P ne voit pas [AB] sous l’angle θ : il n’est pas sur le lieu.' }
    var h = ''
    if (this._radar) {
      h += '<p class="ligne">Faisceau de A : <span class="c-sky">' + tex('\\alpha' + rel(this._al) + texN(this._al, 1) + '^\\circ') + '</span> avec l’axe des x ; faisceau de B : <span class="c-good">' +
        tex('\\alpha+\\theta' + rel(this._al) + texN(this._al + th, 1) + '^\\circ') + '</span>. Ils tournent du même angle dans le même temps : leur écart reste ' + tex('\\theta=' + th + '^\\circ') + '.</p>'
    }
    if (ang !== null) h += '<p>' + tex('\\widehat{APB}' + (surAB ? '=' : '\\approx') + texN(ang, 1) + '^\\circ') + ' ; ' + tex('\\theta=' + th + '^\\circ') + '.' + (surAB ? ' <span class="note">(P sur [AB] : angle plat)</span>' : '') + '</p>'
    sh.getElementById('etat').innerHTML = h

    // ---------- Le lieu ----------
    var ex = EXACT[th]
    var l = '<p class="titre-panneau">Le lieu</p>'
    if (!this._montrer) l += '<p class="note">Lance les radars ou promène P, puis « Montrer le lieu » pour comparer la trace au lieu calculé.</p>'
    else {
      l += '<p>Les points qui voient [AB] sous l’angle θ forment <span class="c-acc">deux arcs de cercle</span> passant par A et B, symétriques par rapport à (AB), <strong>privés de A et B</strong> (ronds vides) : des « arcs capables ».</p>'
      l += '<p class="ligne">Angle inscrit : l’angle au centre ' + tex('\\widehat{A\\Omega B}') + ' vaut ' + tex('2\\theta=' + 2 * th + '^\\circ') + '. Le centre est sur la médiatrice ' + tex('x=0') + ' : ' +
        tex('\\Omega' + (ex ? '' : '\\approx') + '\\left(0\\,;' + (ex ? ex[0] : texN(k.c, 2)) + '\\right)') + ', rayon ' + texEgalites(['\\frac{3}{\\sin\\theta}', ex ? ex[1] : '\\approx' + texN(k.r, 2)], '=') + ' (l’autre arc : centre symétrique).</p>'
      if (th === 90) l += '<p class="c-good">θ = 90° : c’est le cercle de diamètre [AB], privé de A et B — le lieu « angle droit » du § 4.</p>'
      else if (th > 90) l += '<p>θ > 90° : le centre est sous (AB), chaque arc est le petit arc.</p>'
      if (th !== 90) l += '<p class="note">Sur le reste de chaque cercle (pointillés), on voit [AB] sous l’angle ' + tex('180^\\circ-\\theta=' + (180 - th) + '^\\circ') + '.</p>'
    }
    sh.getElementById('lieu').innerHTML = l

    // ---------- Figure ----------
    var svg = sh.getElementById('svg')
    svg.innerHTML = ''
    R.fond(svg, 2)
    var clip = G.el('clipPath', { id: 'cadre' }, svg.querySelector('defs'))
    G.el('rect', { x: R.marge, y: R.marge, width: R.L - 2 * R.marge, height: R.H - 2 * R.marge }, clip)
    var g = G.el('g', { 'clip-path': 'url(#cadre)' }, svg)
    var pA = R.px(A[0], A[1]), pB = R.px(B[0], B[1]), pP = R.px(P[0], P[1])
    function ligne(P1, P2, cls) { var a = R.px(P1[0], P1[1]), b = R.px(P2[0], P2[1]); G.el('line', { x1: a[0].toFixed(1), y1: a[1].toFixed(1), x2: b[0].toFixed(1), y2: b[1].toFixed(1), class: cls }, g) }
    /** Arc de cercle (monde) de centre c, rayon r, de l'angle a0 à a1 (degrés, sens direct). */
    function arcPath(c, r, a0, a1) {
      var n = Math.max(8, Math.ceil(Math.abs(a1 - a0) / 3)), d = ''
      for (var i = 0; i <= n; i++) { var a = (a0 + (a1 - a0) * i / n) * D2R, p = R.px(c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)); d += (i ? ' L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1) }
      return d
    }
    if (this._montrer) {
      // centres (0 ; c) et (0 ; −c) : arc capable de B à A par le haut, et son symétrique par le bas ;
      // restes des deux cercles en pointillés, tracés AVANT les arcs (à 90°, un reste recouvre l'autre arc)
      var aB = Math.atan2(-k.c, 3) / D2R, aA = 180 - aB, aB2 = -aB, aA2 = 180 - aB2
      G.el('path', { d: arcPath([0, k.c], k.r, aA, aB + 360), class: 'lieu-reste' }, g)
      G.el('path', { d: arcPath([0, -k.c], k.r, aB2, aA2), class: 'lieu-reste' }, g)
      G.el('path', { d: arcPath([0, k.c], k.r, aB, aA), class: 'lieu' }, g)
      G.el('path', { d: arcPath([0, -k.c], k.r, aA2, aB2 + 360), class: 'lieu' }, g)
    }
    ligne(A, B, 'seg-ab')
    if (this._radar) {
      // faisceaux : demi-droites issues de A et de B, prolongées jusqu'au cadre
      var aa = this._al * D2R, ab = (this._al + th) * D2R
      ligne(A, [A[0] + 40 * Math.cos(aa), 40 * Math.sin(aa)], 'faisceau-a')
      ligne(B, [B[0] + 40 * Math.cos(ab), 40 * Math.sin(ab)], 'faisceau-b')
      G.el('path', { d: arcPath(A, 0.9, 0, this._al), class: 'angle-a' }, g)
      G.el('path', { d: arcPath(B, 0.75, 0, this._al + th), class: 'angle-b' }, g)
    } else if (!exclu) { ligne(P, A, 'cote'); ligne(P, B, 'cote') }
    this._trace.forEach(function (q) { var p = R.px(q[0], q[1]); G.el('circle', { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: 2.6, class: 'trace' }, g) })
    // angle en P
    if (!exclu && !surAB) {
      var a1 = Math.atan2(A[1] - P[1], A[0] - P[0]) / D2R, a2 = Math.atan2(B[1] - P[1], B[0] - P[0]) / D2R
      var dd = a2 - a1; while (dd > 180) dd -= 360; while (dd < -180) dd += 360
      var rr = Math.min(0.85, 0.4 * Math.min(Math.hypot(P[0] - A[0], P[1]), Math.hypot(P[0] - B[0], P[1])))
      var d = 'M' + pP[0].toFixed(1) + ',' + pP[1].toFixed(1) + ' ' + arcPath(P, rr, a1, a1 + dd).replace('M', 'L') + ' Z'
      G.el('path', { d: d, class: 'angle-p' }, g)
    }
    if (this._montrer) {
      ;[A, B].forEach(function (q) { var p = R.px(q[0], q[1]); G.el('circle', { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: 5.5, class: 'ouvert' }, svg) })
      ;[1, -1].forEach(function (sg) { var p = R.px(0, sg * k.c); if (R.dansFenetre(0, sg * k.c)) G.el('circle', { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: 3.5, class: 'pt-attn' }, svg) })
    } else {
      G.el('circle', { cx: pA[0].toFixed(1), cy: pA[1].toFixed(1), r: 5, class: 'pt' }, svg)
      G.el('circle', { cx: pB[0].toFixed(1), cy: pB[1].toFixed(1), r: 5, class: 'pt' }, svg)
    }
    G.el('circle', { cx: pP[0].toFixed(1), cy: pP[1].toFixed(1), r: 7, class: ok ? 'p-ok' : 'p-ko' }, svg)
    var pl = placeurEtiquettes(R.L, R.H)
    pl.point(pA[0], pA[1], 7); pl.point(pB[0], pB[1], 7); pl.point(pP[0], pP[1], 9)
    if (this._montrer) { var pc = R.px(0, k.c); if (R.dansFenetre(0, k.c)) pl.point(pc[0], pc[1], 5) }
    pl.poser(svg, pA[0], pA[1], 'A', '', [1, 3])
    pl.poser(svg, pB[0], pB[1], 'B', '', [0, 2])
    pl.poser(svg, pP[0], pP[1], 'P', ok ? 'et-good' : 'et-bad', P[0] >= 0 ? [0, 6] : [1, 7])
    if (this._montrer && R.dansFenetre(0, k.c)) { var pc2 = R.px(0, k.c); pl.poser(svg, pc2[0], pc2[1], 'Ω', 'et-attn et-petit', [6, 7]) }
    if (!exclu && !surAB) {
      // étiquette de l'angle en P, du côté de [AB]
      var dirx = -P[0], diry = 0 - P[1], dl = Math.hypot(dirx, diry) || 1
      var q = R.px(P[0] + dirx / dl * 1.35, P[1] + diry / dl * 1.35)
      pl.poser(svg, q[0], q[1] + 5, 'θ', 'et-rose', [4, 5])
    }
  }
}

if (!customElements.get('arc-capable-widget')) customElements.define('arc-capable-widget', ArcCapableWidget)
