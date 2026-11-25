/* ================================================================
 * <excentricite-curseur-widget> — atelier « Curseur d'excentricité »
 * (6e, ch. 10, § 2). Foyer F(1 ; 0) et directrice d ≡ x = 0 FIXES
 * (ceux de la figure du cours, p = dist(F ; d) = 1) ; un curseur e de
 * 0 à 2,5 (pas de 0,05). La conique |PF| = e·dist(P ; d), c'est-à-dire
 * (1 − e²)x² + y² − 2x + 1 = 0, se transforme en direct : e = 0, le
 * seul point F ; 0 < e < 1, ellipse (de plus en plus ronde quand e → 0 :
 * b/a = √(1 − e²) → 1, mais le cercle n'a pas de directrice) ; e = 1,
 * parabole y² = 2(x − 1/2) ; e > 1, hyperbole à deux branches. Pour une
 * conique centrée : centre, a, b, c, second foyer F′ et seconde
 * directrice d′ (pointillés), asymptotes de l'hyperbole. Un point P se
 * déplace sur la conique (glissé au doigt, ou curseur) : |PF| et
 * e·dist(P ; d) affichés, toujours égaux. Point de la conique repéré
 * depuis F (forme polaire r = e/(1 − e·cos θ), seconde branche
 * r = −e/(1 + e·cos θ)). Repère orthonormé à fenêtre FIXE.
 * Web Component (Shadow DOM).
 * ================================================================ */
import './geo-analytique-commun.js'
import { styleKatex, tex, texEgalites, CSS_BASE } from './katex-shadow.js'
import { curseurHTML, majCurseur, borner, estExact } from './variables-aleatoires-commun.js'
import { texN, CSS_LIEUX, placeurEtiquettes } from './lieux-geometriques-commun.js'
import { cheminPts, groupeCadre, CSS_CONIQUES } from './coniques-commun.js'

var G = window.GeoAnaCommun
var FEN = { xMin: -3, xMax: 4.5, yMin: -2.75, yMax: 2.75 }
var R = G.repere(FEN, 46, 14)
var RMAX = 80
var PRESETS = [0, 0.5, 1, 2]

/** « = 0,5 » si la valeur est exacte à 4 décimales, sinon « ≈ 0,58 ». */
function egal(x, d) { return estExact(x, 4) ? '=' + texN(x, 4) : '\\approx' + texN(x, d === undefined ? 2 : d) }

/** Angle polaire limite (depuis F) d'une branche : la branche existe pour |θ| > θ₀. */
function theta0(e, loin) {
  if (!loin) return e <= 1 ? (e === 1 ? 0 : -1) : Math.acos(1 / e)
  return Math.acos(-1 / e)
}

/** Point de la branche (proche de F ou lointaine) dans la direction θ depuis F, ou null. */
function pointPolaire(e, th, loin) {
  var c = Math.cos(th), r
  if (!loin) { if (1 - e * c <= 1e-12) return null; r = e / (1 - e * c) }
  else { if (1 + e * c >= -1e-12) return null; r = -e / (1 + e * c) }
  return [1 + r * Math.cos(th), r * Math.sin(th), r]
}

/** u ∈ [−1 ; 1] ↦ θ : u = 0 au sommet (θ = 180°), |u| → 1 vers la limite θ₀ de la branche. */
function thetaDeU(e, u, loin) {
  var t0 = theta0(e, loin)
  if (t0 < 0) t0 = 0
  var a = Math.PI - (Math.PI - t0) * Math.abs(u)
  return u < 0 ? -a : a
}
function uDeTheta(e, th, loin) {
  var t0 = theta0(e, loin)
  if (t0 < 0) t0 = 0
  var a = Math.abs(th)
  var u = (Math.PI - a) / (Math.PI - t0)
  return th < 0 ? -u : u
}

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE + CSS_LIEUX + CSS_CONIQUES + '</style>' +
  '<div class="rangee presets" role="group" aria-label="Valeurs de e">' +
  PRESETS.map(function (e) { return '<button class="btn" data-e="' + e + '">e = ' + String(e).replace('.', ',') + '</button>' }).join('') + '</div>' +
  '<p class="consigne">F(1 ; 0) et la directrice d (x = 0) ne bougent pas. Fais glisser e, puis P sur la courbe.</p>' +
  '<div class="figure"><svg id="svg" class="glisser" viewBox="0 0 ' + R.L + ' ' + R.H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="La conique de foyer F, de directrice d et d’excentricité e, avec un point P"></svg></div>' +
  '<p class="verdict" id="verdict" aria-live="polite"></p>' +
  '<div class="reglages">' + curseurHTML('e', 'Excentricité e', 0, 2.5, 0.05) + curseurHTML('u', 'Position de P sur la courbe', -1, 1, 0.01) + '</div>' +
  '<div class="rangee"><button class="btn" id="branche" aria-pressed="false">Autre branche</button></div>' +
  '<div class="panneau" id="mesures" aria-live="polite"></div>' +
  '<div class="panneau" id="elements"></div>'

class ExcentriciteCurseurWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._e = 0.5
    this._u = 0.45
    this._loin = false
    this._ecouteurs = []
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh, svg = sh.getElementById('svg')
    sh.querySelectorAll('[data-e]').forEach(function (b) {
      b.addEventListener('click', function () { self._regleE(parseFloat(b.getAttribute('data-e'))) })
    })
    sh.getElementById('e').addEventListener('input', function (ev) { self._regleE(parseFloat(ev.target.value)) })
    sh.getElementById('e-moins').addEventListener('click', function () { self._regleE(Math.round(self._e * 20 - 1) / 20) })
    sh.getElementById('e-plus').addEventListener('click', function () { self._regleE(Math.round(self._e * 20 + 1) / 20) })
    sh.getElementById('u').addEventListener('input', function (ev) { self._regleU(parseFloat(ev.target.value)) })
    sh.getElementById('u-moins').addEventListener('click', function () { self._regleU(Math.round(self._u * 100 - 5) / 100) })
    sh.getElementById('u-plus').addEventListener('click', function () { self._regleU(Math.round(self._u * 100 + 5) / 100) })
    sh.getElementById('branche').addEventListener('click', function () { if (self._e > 1) { self._loin = !self._loin; self._rendre() } })
    G.glisser(this, svg, R, function () {}, function (n, x, y) { self._versPointeur(x, y) })
    this._rendre()
  }

  _regleE(e) {
    e = borner(Math.round(e * 20) / 20, 0, 2.5)
    this._e = e
    if (e <= 1) this._loin = false
    this._rendre()
  }

  _uMax() { return this._e >= 1 ? 0.97 : 1 }

  _regleU(u) {
    this._u = borner(u, -this._uMax(), this._uMax())
    this._rendre()
  }

  _versPointeur(x, y) {
    var e = this._e
    if (e === 0) return
    var th = Math.atan2(y, x - 1), best = null
    ;[false, true].forEach(function (loin) {
      if (loin && e <= 1) return
      var P = pointPolaire(e, th, loin)
      if (!P) return
      var d = Math.hypot(P[0] - x, P[1] - y)
      if (!best || d < best.d) best = { d: d, loin: loin }
    })
    if (!best) return
    this._loin = best.loin
    this._u = borner(Math.round(uDeTheta(e, th, best.loin) * 100) / 100, -this._uMax(), this._uMax())
    this._rendre()
  }

  _rendre() {
    var sh = this._sh, e = this._e
    var loin = this._loin && e > 1
    var u = borner(this._u, -this._uMax(), this._uMax())
    this._u = u
    majCurseur(sh, 'e', e, 'e=' + texN(e, 2))
    majCurseur(sh, 'u', u, 'P')
    sh.getElementById('u').disabled = e === 0
    sh.getElementById('u-moins').disabled = e === 0 || u <= -this._uMax() + 1e-9
    sh.getElementById('u-plus').disabled = e === 0 || u >= this._uMax() - 1e-9
    var bb = sh.getElementById('branche')
    bb.hidden = !(e > 1)
    bb.setAttribute('aria-pressed', String(loin))
    sh.querySelectorAll('[data-e]').forEach(function (b) { b.setAttribute('aria-pressed', String(Math.abs(parseFloat(b.getAttribute('data-e')) - e) < 1e-9)) })

    var P = e === 0 ? [1, 0, 0] : pointPolaire(e, thetaDeU(e, u, loin), loin)
    var xc = e === 1 || e === 0 ? null : 1 / (1 - e * e)
    var a = xc === null ? null : e / Math.abs(1 - e * e)
    var c = a === null ? null : e * a
    var b = a === null ? null : a * Math.sqrt(Math.abs(1 - e * e))

    // ---------- Verdict ----------
    var v = sh.getElementById('verdict')
    if (e === 0) { v.className = 'verdict neutre'; v.textContent = 'e = 0 : |PF| = 0, donc P = F. Le « lieu » se réduit au point F. Le cercle n’a pas de directrice : il n’est pas obtenu ici.' }
    else if (e < 1) { v.className = 'verdict ok'; v.textContent = '0 < e < 1 : une ellipse. Plus e est proche de 0, plus elle est ronde (et petite, car F et d sont fixes).' }
    else if (e === 1) { v.className = 'verdict ok'; v.textContent = 'e = 1 : une parabole, |PF| = dist(P ; d) — la définition de la section 1.' }
    else { v.className = 'verdict ok'; v.textContent = 'e > 1 : une hyperbole, avec deux branches, de part et d’autre de d. Plus e est grand, plus elle est ouverte.' }

    // ---------- Mesures ----------
    var h = '<p class="titre-panneau">Le point P</p>'
    if (!P) h += '<p>P n’est pas défini ici.</p>'
    else {
      var dist = Math.abs(P[0])
      h += '<p class="ligne">' + tex('P\\left(' + texN(P[0], 2) + '\\,;' + texN(P[1], 2) + '\\right)') + (R.dansFenetre(P[0], P[1]) ? '' : ' <span class="note">(hors du cadre)</span>') + '</p>'
      h += '<p class="ligne"><span class="c-good">' + tex('|PF|' + egal(P[2])) + '</span> et <span class="c-sky">' + tex('\\text{dist}(P\\,;d)' + egal(dist)) + '</span></p>'
      h += '<p class="ligne">' + texEgalites(['e\\cdot\\text{dist}(P\\,;d)', texN(e, 2) + '\\times' + texN(dist, 2), (estExact(e * dist, 4) ? '' : '\\approx') + texN(e * dist, 2)], '=') +
        ' : <span class="ok">même valeur que ' + tex('|PF|') + '</span>.</p>'
    }
    sh.getElementById('mesures').innerHTML = h

    // ---------- Éléments ----------
    var k = '<p class="titre-panneau">L’équation et les éléments</p>'
    k += '<p class="ligne">' + texEgalites(['|PF|=e\\cdot\\text{dist}(P\\,;d)'], '=') + ' ⟺ ' + tex('(x-1)^2+y^2=e^2x^2') + '</p>'
    var unMoins = 1 - e * e
    var coef = Math.abs(unMoins) < 1e-12 ? '' : (Math.abs(unMoins - 1) < 1e-12 ? 'x^2' : texN(unMoins, 4) + 'x^2')
    if (e === 0) k += '<p class="ligne">' + tex('(x-1)^2+y^2=0') + ' : seul ' + tex('F(1\\,;0)') + ' convient.</p>'
    else {
      k += '<p class="ligne">Ici : ' + tex((coef ? coef + '+' : '') + 'y^2-2x+1=0') + '</p>'
      if (e === 1) {
        k += '<p class="ligne">' + tex('y^2=2x-1=2\\left(x-\\frac{1}{2}\\right)') + ' : parabole de paramètre ' + tex('p=\\text{dist}(F\\,;d)=1') + ', de sommet ' + tex('S\\left(\\frac{1}{2}\\,;0\\right)') + ', milieu de F et de son projeté sur d.</p>'
      } else {
        k += '<p class="ligne">Centre ' + tex('\\Omega\\left(' + texN(xc, 2) + '\\,;0\\right)') + ' ; ' + tex('a' + egal(a)) + ', ' + tex('b' + egal(b)) + ', ' + tex('c' + egal(c)) +
          ' et ' + tex('\\frac{c}{a}=e') + '.</p>'
        var xF2 = 2 * xc - 1, xd2 = 2 * xc
        k += '<p class="ligne">Second foyer ' + tex("F'\\left(" + texN(xF2, 2) + '\\,;0\\right)') + ', seconde directrice ' + tex("d'\\equiv x" + egal(xd2)) +
          (R.dansFenetre(xF2, 0) && xd2 > FEN.xMin && xd2 < FEN.xMax ? '' : ' <span class="note">(hors du cadre en partie)</span>') + '.</p>'
        if (e > 1) k += '<p class="ligne">Asymptotes : pentes ' + tex('\\pm\\frac{b}{a}=\\pm\\sqrt{e^2-1}' + egal(Math.sqrt(e * e - 1)).replace(/^=/, '=\\pm').replace(/^\\approx/, '\\approx\\pm')) + '.</p>'
        else k += '<p class="note">Rapport ' + tex('\\frac{b}{a}=\\sqrt{1-e^2}' + egal(Math.sqrt(1 - e * e))) + ' : il tend vers 1 (cercle) quand e tend vers 0.</p>'
      }
    }
    sh.getElementById('elements').innerHTML = k

    // ---------- Figure ----------
    var svg = sh.getElementById('svg')
    svg.innerHTML = ''
    R.fond(svg, 1)
    var g = groupeCadre(G, svg, R, 'cadre-exc')
    G.el('line', { x1: R.px(0, 0)[0], y1: R.marge, x2: R.px(0, 0)[0], y2: R.H - R.marge, class: 'directrice' }, g)
    if (e > 0) {
      ;[false, true].forEach(function (lo) {
        if (lo && e <= 1) return
        var pts = [], n = 900
        for (var i = 0; i <= n; i++) {
          var th = -Math.PI + 2 * Math.PI * i / n, Q = pointPolaire(e, th, lo)
          pts.push(Q && Q[2] < RMAX ? [Q[0], Q[1]] : null)
        }
        // la courbe d'une ellipse se referme : relier le dernier point au premier
        G.el('path', { d: cheminPts(R, pts), class: 'conique' }, g)
      })
      if (xc !== null) {
        var xF2b = 2 * xc - 1, xd2b = 2 * xc
        if (xd2b > FEN.xMin && xd2b < FEN.xMax) G.el('line', { x1: R.px(xd2b, 0)[0], y1: R.marge, x2: R.px(xd2b, 0)[0], y2: R.H - R.marge, class: 'directrice2' }, g)
        if (e > 1) {
          var m = Math.sqrt(e * e - 1)
          R.traceDroite(g, m, -1, -m * xc, 'asymptote')
          R.traceDroite(g, -m, -1, m * xc, 'asymptote')
        }
        this._F2 = R.dansFenetre(xF2b, 0) ? xF2b : null
      } else this._F2 = null
    } else this._F2 = null
    var pF = R.px(1, 0), pl = placeurEtiquettes(R.L, R.H)
    if (P && e > 0) {
      var pP = R.px(P[0], P[1]), pH = R.px(0, P[1])
      G.el('line', { x1: pP[0].toFixed(1), y1: pP[1].toFixed(1), x2: pF[0].toFixed(1), y2: pF[1].toFixed(1), class: 'seg-f' }, g)
      G.el('line', { x1: pP[0].toFixed(1), y1: pP[1].toFixed(1), x2: pH[0].toFixed(1), y2: pH[1].toFixed(1), class: 'seg-d' }, g)
      if (R.dansFenetre(0, P[1])) G.el('circle', { cx: pH[0].toFixed(1), cy: pH[1].toFixed(1), r: 3.5, class: 'pt-sky' }, svg)
    }
    pl.point(pF[0], pF[1], 7)
    G.el('circle', { cx: pF[0].toFixed(1), cy: pF[1].toFixed(1), r: 4.5, class: 'pt-good' }, svg)
    if (this._F2 !== null) {
      var pF2 = R.px(this._F2, 0)
      pl.point(pF2[0], pF2[1], 7)
      G.el('circle', { cx: pF2[0].toFixed(1), cy: pF2[1].toFixed(1), r: 4, class: 'pt-plan' }, svg)
    }
    var montrerP = P && e > 0 && R.dansFenetre(P[0], P[1])
    if (montrerP) {
      var q = R.px(P[0], P[1])
      pl.point(q[0], q[1], 8)
      G.el('circle', { cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: 6.5, class: 'pt-acc' }, svg)
    }
    pl.poser(svg, pF[0], pF[1], 'F', 'et-good', [2, 3])
    if (this._F2 !== null) { var r2 = R.px(this._F2, 0); pl.poser(svg, r2[0], r2[1], 'F′', 'et-plan', [2, 3]) }
    var dxl = R.px(0, FEN.yMin + 0.35)
    pl.poser(svg, dxl[0], dxl[1], 'd', '', [7])
    if (xc !== null && 2 * xc > FEN.xMin && 2 * xc < FEN.xMax) { var dd = R.px(2 * xc, FEN.yMax - 0.35); pl.poser(svg, dd[0], dd[1], 'd′', 'et-soft', [6, 7]) }
    if (montrerP) {
      var qq = R.px(P[0], P[1])
      pl.poser(svg, qq[0], qq[1], 'P', 'et-acc', [0, 1, 2, 3])
      if (R.dansFenetre(0, P[1])) { var hh = R.px(0, P[1]); pl.poser(svg, hh[0], hh[1], 'H', 'et-sky', [7, 1, 3]) }
      G.poignee(svg, R, P[0], P[1], 'P', false)
    }
  }
}

if (!customElements.get('excentricite-curseur-widget')) customElements.define('excentricite-curseur-widget', ExcentriciteCurseurWidget)
