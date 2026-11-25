/* ================================================================
 * <courbe-parametree-widget> — atelier « Courbe paramétrée » (6e, ch. 9,
 * § 6). Curseur t (et lecture automatique) : le point P(x(t) ; y(t)) se
 * déplace et trace sa courbe (orange), superposée à la courbe
 * cartésienne COMPLÈTE obtenue en éliminant t (gris, pointillé) — pour
 * voir « lieu complet » contre « partie ». Cinq représentations :
 *  - astroïde x = cos³t, y = sin³t (courbe entière, t ∈ [0 ; 2π[) ;
 *  - cercle x = 1 + 2cos t, y = −1 + 2sin t (entier ; option
 *    t ∈ [0 ; π] : demi-cercle y ≥ −1) ;
 *  - x = cos t, y = cos 2t : arc de la parabole y = 2x² − 1, x ∈ [−1 ; 1],
 *    parcouru en aller-retour ;
 *  - x = t², y = t⁴ : demi-parabole y = x², x ≥ 0, parcourue deux fois ;
 *  - x = t + 1, y = t² − 3 : parabole entière (t = x − 1).
 * Le panneau donne l'identité qui élimine t, l'équation cartésienne et
 * la partie décrite (verdict). t trigonométrique au pas de π/48, écrit
 * en fraction de π. Fenêtre FIXE par courbe, repère orthonormé.
 * Web Component (Shadow DOM).
 * ================================================================ */
import './geo-analytique-commun.js'
import { styleKatex, tex, texEgalites, CSS_BASE } from './katex-shadow.js'
import { curseurHTML, majCurseur, arrondi, borner } from './variables-aleatoires-commun.js'
import { pgcd, texN, lecteur, CSS_LIEUX } from './lieux-geometriques-commun.js'

var G = window.GeoAnaCommun
var PI = Math.PI

/** t = k·π/48 → LaTeX exact : « 0 », « \frac{\pi}{2} », « \frac{7\pi}{48} », « \pi ». */
function tPi(k) {
  if (k === 0) return '0'
  var g = pgcd(k, 48), n = k / g, d = 48 / g
  var num = (n < 0 ? '-' : '') + (Math.abs(n) === 1 ? '' : Math.abs(n)) + '\\pi'
  return d === 1 ? num : (n < 0 ? '-' : '') + '\\frac{' + (Math.abs(n) === 1 ? '' : Math.abs(n)) + '\\pi}{' + d + '}'
}
function exact2(v) { return Math.abs(v * 100 - Math.round(v * 100)) < 1e-7 }

var COURBES = {
  astroide: {
    nom: 'Astroïde',
    xTex: 'x=\\cos^3 t', yTex: 'y=\\sin^3 t',
    trig: true, kMin: 0, kMax: 96, kDef: 8,
    fen: { xMin: -1.5, xMax: 1.5, yMin: -1.5, yMax: 1.5 }, unite: 120, pasGrad: 1,
    x: function (t) { return Math.pow(Math.cos(t), 3) }, y: function (t) { return Math.pow(Math.sin(t), 3) },
    complete: function (pts) { for (var i = 0; i <= 240; i++) { var t = 2 * PI * i / 240; pts.push([Math.pow(Math.cos(t), 3), Math.pow(Math.sin(t), 3)]) } },
    bilan: function () {
      return '<p class="ligne">On isole ' + tex('\\cos t=\\sqrt[3]{x}') + ' et ' + tex('\\sin t=\\sqrt[3]{y}') + ', puis l’identité ' + tex('\\cos^2 t+\\sin^2 t=1') + ' :</p>' +
        '<p class="formule">' + tex('x^{2/3}+y^{2/3}=1') + ' <span class="note">(' + tex('x^{2/3}=\\sqrt[3]{x^2}') + ')</span></p>' +
        '<p><span class="c-good">Courbe entière.</span> Quand t parcourt ' + tex('[0\\,;2\\pi[') + ', P fait le tour complet une seule fois : quatre arcs et quatre pointes ' + tex('(\\pm1\\,;0)') + ', ' + tex('(0\\,;\\pm1)') + '.</p>'
    },
  },
  cercle: {
    nom: 'Cercle',
    xTex: 'x=1+2\\cos t', yTex: 'y=-1+2\\sin t',
    trig: true, kMin: 0, kMax: 96, kDef: 8, option: 'Seulement t ∈ [0 ; π]',
    fen: { xMin: -2.5, xMax: 4.5, yMin: -4, yMax: 2 }, unite: 50, pasGrad: 1,
    x: function (t) { return 1 + 2 * Math.cos(t) }, y: function (t) { return -1 + 2 * Math.sin(t) },
    complete: function (pts) { for (var i = 0; i <= 160; i++) { var t = 2 * PI * i / 160; pts.push([1 + 2 * Math.cos(t), -1 + 2 * Math.sin(t)]) } },
    bilan: function (opt) {
      var h = '<p class="ligne">On isole ' + tex('\\cos t=\\frac{x-1}{2}') + ' et ' + tex('\\sin t=\\frac{y+1}{2}') + ', puis ' + tex('\\cos^2 t+\\sin^2 t=1') + ' :</p>' +
        '<p class="formule">' + tex('(x-1)^2+(y+1)^2=4') + '</p><p>Cercle de centre ' + tex('(1\\,;-1)') + ' et de rayon 2.</p>'
      if (opt) h += '<p><span class="c-attn">Partie seulement : un demi-cercle.</span> Pour ' + tex('t\\in[0\\,;\\pi]') + ', ' + tex('\\sin t\\geq 0') + ', donc ' + tex('y\\geq -1') + ' : seul le demi-cercle du haut est décrit. L’équation seule ne suffit pas : il faut la restriction ' + tex('y\\geq -1') + '.</p>'
      else h += '<p><span class="c-good">Courbe entière.</span> Pour ' + tex('t\\in[0\\,;2\\pi[') + ', P fait le tour complet une fois.</p>'
      return h
    },
  },
  cos2t: {
    nom: 'cos t et cos 2t',
    xTex: 'x=\\cos t', yTex: 'y=\\cos 2t',
    trig: true, kMin: 0, kMax: 96, kDef: 8,
    fen: { xMin: -2.5, xMax: 2.5, yMin: -1.5, yMax: 3.5 }, unite: 72, pasGrad: 1,
    x: function (t) { return Math.cos(t) }, y: function (t) { return Math.cos(2 * t) },
    complete: function (pts) { for (var i = 0; i <= 160; i++) { var x = -1.65 + 3.3 * i / 160; pts.push([x, 2 * x * x - 1]) } },
    bilan: function () {
      return '<p class="ligne">Identité : ' + texEgalites(['\\cos 2t', '2\\cos^2 t-1'], '=') + ', et ' + tex('\\cos t=x') + ' :</p>' +
        '<p class="formule">' + tex('y=2x^2-1') + '</p>' +
        '<p><span class="c-attn">Partie seulement : un arc de parabole.</span> Comme ' + tex('x=\\cos t') + ', ' + tex('-1\\leq x\\leq 1') + ' : seul l’arc entre ' + tex('(-1\\,;1)') + ' et ' + tex('(1\\,;1)') + ' est décrit, en aller-retour (de droite à gauche pour ' + tex('t\\in[0\\,;\\pi]') + ', puis retour). Les branches grises ne sont jamais atteintes.</p>'
    },
  },
  t2t4: {
    nom: 't² et t⁴',
    xTex: 'x=t^2', yTex: 'y=t^4',
    trig: false, tMin: -1.4, tMax: 1.4, pas: 0.02, tDef: -1.2,
    fen: { xMin: -2.5, xMax: 2.5, yMin: -0.8, yMax: 4.2 }, unite: 72, pasGrad: 1,
    x: function (t) { return t * t }, y: function (t) { return t * t * t * t },
    complete: function (pts) { for (var i = 0; i <= 160; i++) { var x = -2.1 + 4.2 * i / 160; pts.push([x, x * x]) } },
    bilan: function () {
      return '<p class="ligne">Identité : ' + texEgalites(['t^4', '(t^2)^2'], '=') + ', et ' + tex('t^2=x') + ' :</p>' +
        '<p class="formule">' + tex('y=x^2') + '</p>' +
        '<p><span class="c-attn">Partie seulement : une demi-parabole.</span> Comme ' + tex('x=t^2\\geq 0') + ', seule la branche ' + tex('x\\geq 0') + ' est décrite. Elle est même parcourue deux fois : P descend vers O pour ' + tex('t<0') + ', puis remonte par le même chemin pour ' + tex('t>0') + ' (t et −t donnent le même point).</p>'
    },
  },
  affine: {
    nom: 't + 1 et t² − 3',
    xTex: 'x=t+1', yTex: 'y=t^2-3',
    trig: false, tMin: -2.5, tMax: 2.5, pas: 0.05, tDef: -2,
    fen: { xMin: -2.5, xMax: 4.5, yMin: -3.5, yMax: 3.5 }, unite: 52, pasGrad: 1,
    x: function (t) { return t + 1 }, y: function (t) { return t * t - 3 },
    complete: function (pts) { for (var i = 0; i <= 160; i++) { var x = -2.4 + 6.8 * i / 160; pts.push([x, (x - 1) * (x - 1) - 3]) } },
    bilan: function () {
      return '<p class="ligne">Pas d’identité ici : on isole ' + tex('t=x-1') + ' et on remplace :</p>' +
        '<p class="formule">' + tex('y=(x-1)^2-3') + '</p>' +
        '<p><span class="c-good">Courbe entière.</span> Pour t réel, ' + tex('x=t+1') + ' prend toutes les valeurs réelles, une seule fois chacune : toute la parabole est décrite (le curseur ne montre que ' + tex('t\\in[-2{,}5\\,;2{,}5]') + ', la partie visible dans le cadre).</p>'
    },
  },
}
function repereDe(c) { if (!c._R) c._R = G.repere(c.fen, c.unite, 14); return c._R }

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE + CSS_LIEUX +
  '.complete{fill:none;stroke:var(--ink-faint,#8a97a1);stroke-width:2;stroke-dasharray:5 4;}' +
  '.decrite{fill:none;stroke:var(--accent,#b65c1f);stroke-width:3.2;stroke-linejoin:round;stroke-linecap:round;}' +
  '.p-mob{fill:var(--rose,#b23a7a);stroke:var(--surface,#fff);stroke-width:2;}' +
  '.proj{stroke:var(--rose,#b23a7a);stroke-width:1;stroke-dasharray:3 3;}' +
  '.formules{text-align:center;font-size:1.06rem;margin:0 0 8px;line-height:1.8;}' +
  '.courbes .btn{font-size:0.86rem;}' +
  '#lancer{min-width:112px;}' +
  '.legende{display:flex;flex-wrap:wrap;gap:4px 16px;justify-content:center;font-size:0.84rem;color:var(--ink-soft,#51626f);margin:0 0 8px;}' +
  '.legende span::before{content:"";display:inline-block;width:22px;height:0;vertical-align:middle;margin-right:6px;}' +
  '.leg-c::before{border-top:2px dashed var(--ink-faint,#8a97a1);}' +
  '.leg-d::before{border-top:3px solid var(--accent,#b65c1f);}' +
  '</style>' +
  '<div class="rangee courbes" role="group" aria-label="Courbe">' +
  Object.keys(COURBES).map(function (k) { return '<button class="btn" data-c="' + k + '">' + COURBES[k].nom + '</button>' }).join('') + '</div>' +
  '<p class="formules" id="formules"></p>' +
  '<div class="figure"><svg id="svg" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Courbe paramétrée et courbe cartésienne complète"></svg></div>' +
  '<p class="legende"><span class="leg-d">décrite par P jusqu’ici</span><span class="leg-c">courbe cartésienne complète</span></p>' +
  '<div class="panneau" id="etat" aria-live="polite"></div>' +
  '<div class="reglages">' + curseurHTML('t', 'Paramètre t', 0, 1, 1) + '</div>' +
  '<div class="rangee"><button class="btn" id="lancer" aria-pressed="false">▶ Lancer</button><button class="btn" id="tout">Tout tracer</button><button class="btn" id="option" aria-pressed="false"></button></div>' +
  '<div class="panneau" id="bilan"></div>'

class CourbeParametreeWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._c = 'astroide'
    this._i = 0 // indice du pas courant
    this._opt = false
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    sh.querySelectorAll('[data-c]').forEach(function (b) {
      b.addEventListener('click', function () { self._lect.arreter(); self._c = b.getAttribute('data-c'); self._opt = false; self._init(); self._rendre() })
    })
    function regler(i) { self._i = borner(Math.round(i), 0, self._nMax()); self._rendre() }
    sh.getElementById('t').addEventListener('input', function (e) { regler(parseFloat(e.target.value)) })
    sh.getElementById('t-moins').addEventListener('click', function () { regler(self._i - 1) })
    sh.getElementById('t-plus').addEventListener('click', function () { regler(self._i + 1) })
    sh.getElementById('tout').addEventListener('click', function () { self._lect.arreter(); self._i = self._nMax(); self._rendre() })
    sh.getElementById('option').addEventListener('click', function () { self._opt = !self._opt; self._lect.arreter(); self._init(); self._rendre() })
    var btn = sh.getElementById('lancer')
    this._lect = lecteur(16, function () {
      if (self._i >= self._nMax()) self._i = 0
      else self._i += 1
      self._rendre()
    }, function (enCours) { btn.setAttribute('aria-pressed', String(enCours)); btn.textContent = enCours ? '❚❚ Pause' : '▶ Lancer' })
    btn.addEventListener('click', function () { if (!self._lect.enCours() && self._i >= self._nMax()) self._i = 0; self._lect.basculer() })
    this._init()
    this._rendre()
  }

  disconnectedCallback() { if (this._lect) this._lect.arreter() }

  /** Nombre de pas de la plage courante (trig : π/48 ; option du cercle : [0 ; π]). */
  _nMax() { var c = COURBES[this._c]; return c.trig ? (this._opt ? 48 : c.kMax) : Math.round((c.tMax - c.tMin) / c.pas) }
  _t(i) { var c = COURBES[this._c]; return c.trig ? i * PI / 48 : arrondi(c.tMin + i * c.pas, 4) }
  _init() {
    var c = COURBES[this._c], inp = this._sh.getElementById('t')
    inp.min = '0'; inp.max = String(this._nMax()); inp.step = '1'
    this._i = c.trig ? Math.min(c.kDef, this._nMax()) : Math.round((c.tDef - c.tMin) / c.pas)
  }

  _rendre() {
    var sh = this._sh, c = COURBES[this._c], self = this, R = repereDe(c)
    var i = this._i, t = this._t(i)
    sh.querySelectorAll('[data-c]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-c') === self._c)) })
    sh.getElementById('formules').innerHTML = tex(c.xTex) + ' ; ' + tex(c.yTex)
    var tTex = c.trig ? tPi(i) + (i ? '\\approx ' + texN(t, 2) : '') : texN(t, 2)
    majCurseur(sh, 't', i, 't=' + tTex)
    var opt = sh.getElementById('option')
    opt.style.display = c.option ? '' : 'none'
    if (c.option) { opt.textContent = c.option; opt.setAttribute('aria-pressed', String(this._opt)) }

    var x = c.x(t), y = c.y(t)
    var xs = Math.abs(x) < 1e-12 ? 0 : x, ys = Math.abs(y) < 1e-12 ? 0 : y
    var ex = exact2(xs) && exact2(ys)
    var h = '<p class="ligne">Pour ' + tex('t=' + (c.trig ? tPi(i) : texN(t, 2))) + ' : ' + tex('P' + (ex ? '' : '\\approx') + '\\left(' + texN(xs, 2) + '\\,;' + texN(ys, 2) + '\\right)') + '.</p>'
    var hors = xs < c.fen.xMin || xs > c.fen.xMax || ys < c.fen.yMin || ys > c.fen.yMax
    if (hors) h += '<p class="note">P est hors du cadre.</p>'
    sh.getElementById('etat').innerHTML = h
    sh.getElementById('bilan').innerHTML = '<p class="titre-panneau">Éliminer t</p>' + c.bilan(this._opt)

    // ---------- Figure ----------
    var svg = sh.getElementById('svg')
    svg.setAttribute('viewBox', '0 0 ' + R.L + ' ' + R.H)
    svg.innerHTML = ''
    R.fond(svg, c.pasGrad)
    var clip = G.el('clipPath', { id: 'cadre' }, svg.querySelector('defs'))
    G.el('rect', { x: R.marge, y: R.marge, width: R.L - 2 * R.marge, height: R.H - 2 * R.marge }, clip)
    var g = G.el('g', { 'clip-path': 'url(#cadre)' }, svg)
    function chemin(pts, cls) {
      var d = pts.map(function (q, k) { var p = R.px(q[0], q[1]); return (k ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1) }).join(' ')
      G.el('path', { d: d, class: cls }, g)
    }
    var comp = []; c.complete(comp); chemin(comp, 'complete')
    // Courbe décrite de t_min à t, échantillonnée finement (8 sous-pas par pas)
    var dec = []
    for (var k = 0; k <= i * 8; k++) { var tt = c.trig ? k * PI / 384 : c.tMin + k * c.pas / 8; dec.push([c.x(tt), c.y(tt)]) }
    if (dec.length > 1) chemin(dec, 'decrite')
    if (!hors) {
      var p = R.px(xs, ys), o = R.px(0, 0)
      G.el('line', { x1: p[0].toFixed(1), y1: p[1].toFixed(1), x2: p[0].toFixed(1), y2: o[1].toFixed(1), class: 'proj' }, g)
      G.el('line', { x1: p[0].toFixed(1), y1: p[1].toFixed(1), x2: o[0].toFixed(1), y2: p[1].toFixed(1), class: 'proj' }, g)
      G.el('circle', { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: 6.5, class: 'p-mob' }, svg)
      var droite = p[0] > R.L - 40, haut = p[1] < 30
      var e = G.el('text', { x: (p[0] + (droite ? -12 : 12)).toFixed(1), y: (p[1] + (haut ? 20 : -10)).toFixed(1), 'text-anchor': droite ? 'end' : 'start', class: 'et et-rose' }, svg)
      e.textContent = 'P'
    }
  }
}

if (!customElements.get('courbe-parametree-widget')) customElements.define('courbe-parametree-widget', CourbeParametreeWidget)
