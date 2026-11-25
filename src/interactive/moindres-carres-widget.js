/* ================================================================
 * <moindres-carres-widget> — atelier « Ta droite contre celle des
 * moindres carrés » (5e, ch. 6, § 4). Repère ORTHONORMÉ FIXE (x de 0
 * à 7, y de 0 à 7) : l'écart vertical eᵢ = yᵢ − (axᵢ + b) de chaque
 * point est le côté d'un VRAI carré (dessiné à droite du point), dont
 * l'aire est eᵢ². L'élève règle sa droite y = ax + b (curseurs, pas de
 * 0,05) ou la fait glisser : la poignée du milieu (x = 3) la translate,
 * celle du bout (x = 6) la fait tourner autour de la première. La somme
 * des carrés S est écrite terme à terme, avec le plus petit S atteint.
 * « Montrer la meilleure droite » : la droite des moindres carrés
 * (a = Cov/V(x), b = ȳ − a·x̄), ses carrés en pointillés et son S
 * minimal ; « Droite de Mayer » pour comparer (série du cours :
 * S = 2,4 contre environ 2,44). « Autre nuage » : 5 ou 6 points entiers
 * tirés au hasard. Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, texEgalites, CSS_BASE } from './katex-shadow.js'
import { curseurHTML, majCurseur, borner } from './variables-aleatoires-commun.js'
import { CSS_LIEUX } from './lieux-geometriques-commun.js'
import {
  CSS_STAT, el, repereStat, pointNuage, marquePointMoyen, statistiques, mayer, sommeCarres,
  arr, txt, tn, egal, texEquation, txtEquation, alea, exact,
} from './statistique-deux-variables-commun.js'

var R = repereStat({ xMin: 0, xMax: 7, yMin: 0, yMax: 7, ux: 44, uy: 44, pasX: 1, pasY: 1, nomX: 'x', nomY: 'y', mg: 30, mb: 40 })
var COURS = [[1, 2], [2, 4], [3, 5], [4, 4], [5, 5]]
var XM = 3, XB = 6
var A_MIN = -2, A_MAX = 3, B_MIN = -4, B_MAX = 8

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE + CSS_LIEUX + CSS_STAT + '</style>' +
  '<div class="rangee presets" role="group" aria-label="Nuage">' +
  '<button class="btn" id="p-cours" aria-pressed="true">Série du cours</button><button class="btn" id="p-autre" aria-pressed="false">Autre nuage</button></div>' +
  '<p class="consigne">Fais glisser les poignées de ta droite (milieu : translation, bout : rotation) ou règle a et b. Rends la somme des aires des carrés la plus petite possible.</p>' +
  '<div class="figure"><svg id="svg" class="glisser" viewBox="0 0 ' + R.L.toFixed(0) + ' ' + R.H.toFixed(0) + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Nuage, ta droite et les carrés des écarts verticaux"></svg></div>' +
  '<p class="verdict neutre" id="verdict" aria-live="polite"></p>' +
  '<div class="reglages">' + curseurHTML('a', 'Pente a de ta droite', A_MIN, A_MAX, 0.05) + curseurHTML('b', 'Ordonnée à l’origine b de ta droite', B_MIN, B_MAX, 0.05) + '</div>' +
  '<div class="rangee" role="group" aria-label="Comparer">' +
  '<button class="btn" id="v-meilleure" aria-pressed="false">Montrer la meilleure droite</button><button class="btn" id="v-mayer" aria-pressed="false">Droite de Mayer</button></div>' +
  '<div class="panneau" id="somme" aria-live="polite"></div>' +
  '<div class="panneau" id="meilleure"></div>'

class MoindresCarresWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._pts = COURS.map(function (p) { return p.slice() })
    this._cours = true
    this._a = 1
    this._b = 1
    this._record = null
    this._voirMeilleure = false
    this._voirMayer = false
    this._graine = 7
    this._ecouteurs = []
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh, svg = sh.getElementById('svg')
    sh.getElementById('p-cours').addEventListener('click', function () { self._charger(COURS, true) })
    sh.getElementById('p-autre').addEventListener('click', function () { self._charger(self._tirer(), false) })
    sh.getElementById('a').addEventListener('input', function (e) { self._regler(parseFloat(e.target.value), self._b) })
    sh.getElementById('b').addEventListener('input', function (e) { self._regler(self._a, parseFloat(e.target.value)) })
    sh.getElementById('a-moins').addEventListener('click', function () { self._regler(self._a - 0.05, self._b) })
    sh.getElementById('a-plus').addEventListener('click', function () { self._regler(self._a + 0.05, self._b) })
    sh.getElementById('b-moins').addEventListener('click', function () { self._regler(self._a, self._b - 0.05) })
    sh.getElementById('b-plus').addEventListener('click', function () { self._regler(self._a, self._b + 0.05) })
    sh.getElementById('v-meilleure').addEventListener('click', function () { self._voirMeilleure = !self._voirMeilleure; self._rendre() })
    sh.getElementById('v-mayer').addEventListener('click', function () { self._voirMayer = !self._voirMayer; self._rendre() })
    // poignées : « m » (x = 3) translate, « r » (x = 6) tourne autour de la poignée du milieu
    var prise = null
    function ecoute(c, t, f) { c.addEventListener(t, f); self._ecouteurs.push([c, t, f]) }
    ecoute(svg, 'pointerdown', function (e) {
      var n = e.target && e.target.getAttribute && e.target.getAttribute('data-poignee')
      if (!n) return
      e.preventDefault()
      prise = n
      try { svg.setPointerCapture(e.pointerId) } catch (err) { /* rien */ }
      self._rendre()
    })
    ecoute(svg, 'pointermove', function (e) {
      if (!prise) return
      e.preventDefault()
      var m = R.monde(svg, e.clientX, e.clientY)
      if (!m) return
      var ym = self._a * XM + self._b
      if (prise === 'm') {
        var y = Math.round(m.y * 20) / 20
        self._regler(self._a, y - XM * self._a)
      } else {
        var a = Math.round(((m.y - ym) / (XB - XM)) * 20) / 20
        a = borner(a, A_MIN, A_MAX)
        self._regler(a, ym - XM * a)
      }
    })
    function fin(e) { if (!prise) return; prise = null; try { svg.releasePointerCapture(e.pointerId) } catch (err) { /* rien */ } self._rendre() }
    ecoute(svg, 'pointerup', fin)
    ecoute(svg, 'pointercancel', fin)
    this._prise = function () { return prise }
    this._rendre()
  }

  /** 5 ou 6 points d'abscisses distinctes 1…6, ordonnées entières de 1 à 6, |r| ≥ 0,5. */
  _tirer() {
    var rnd = alea(this._graine++ * 2654435761)
    for (var essai = 0; essai < 200; essai++) {
      var n = 5 + Math.floor(rnd() * 2), xs = [1, 2, 3, 4, 5, 6]
      if (n === 5) xs.splice(Math.floor(rnd() * 6), 1)
      var sens = rnd() < 0.65 ? 1 : -1, pts = xs.map(function (x) {
        var base = sens > 0 ? 1 + 0.75 * (x - 1) : 6 - 0.75 * (x - 1)
        return [x, Math.max(1, Math.min(6, Math.round(base + (rnd() - 0.5) * 3)))]
      })
      var S = statistiques(pts)
      if (S.r !== null && Math.abs(S.r) >= 0.5 && Math.abs(S.r) < 0.97) return pts
    }
    return COURS.map(function (p) { return p.slice() })
  }

  _charger(L, cours) {
    this._pts = L.map(function (p) { return p.slice() })
    this._cours = cours
    this._a = 1; this._b = 1
    this._record = null
    this._voirMeilleure = false
    this._rendre()
  }

  _regler(a, b) {
    this._a = arr(borner(Math.round(a * 20) / 20, A_MIN, A_MAX), 2)
    this._b = arr(borner(Math.round(b * 20) / 20, B_MIN, B_MAX), 2)
    this._rendre()
  }

  _rendre() {
    var sh = this._sh, pts = this._pts, a = this._a, b = this._b
    var S = statistiques(pts), M = mayer(pts)
    var Smin = sommeCarres(pts, S.a, S.b), Sm = M.a === null ? null : sommeCarres(pts, M.a, M.b)
    var Sv = sommeCarres(pts, a, b)
    if (this._record === null || Sv < this._record - 1e-12) this._record = Sv
    majCurseur(sh, 'a', a, 'a=' + tn(a, 2))
    majCurseur(sh, 'b', b, 'b=' + tn(b, 2))
    sh.getElementById('p-cours').setAttribute('aria-pressed', String(this._cours))
    sh.getElementById('p-autre').setAttribute('aria-pressed', String(!this._cours))
    sh.getElementById('v-meilleure').setAttribute('aria-pressed', String(this._voirMeilleure))
    sh.getElementById('v-mayer').setAttribute('aria-pressed', String(this._voirMayer))

    // ---------- Verdict ----------
    var v = sh.getElementById('verdict'), ecart = Sv - Smin
    if (ecart < 1e-9) { v.className = 'verdict ok'; v.textContent = 'Bravo : c’est exactement la droite des moindres carrés. Personne ne peut faire une somme plus petite.' }
    else if (ecart <= 0.05 * Math.max(1, Smin)) { v.className = 'verdict ok'; v.textContent = 'Tout près du minimum ! La meilleure droite fait à peine mieux.' }
    else if (Math.abs(a * S.mx + b - S.my) < 0.05) { v.className = 'verdict neutre'; v.textContent = 'Ta droite passe par G (presque) : il ne reste qu’à régler la pente.' }
    else { v.className = 'verdict neutre'; v.textContent = 'Les carrés rouges ont pour côté l’écart vertical entre chaque point et ta droite. Fais-les rétrécir.' }

    // ---------- Somme ----------
    var ecarts = pts.map(function (p) { return arr(p[1] - (a * p[0] + b), 6) })
    var h = '<p class="titre-panneau">Ta droite</p>'
    h += '<p class="formule">' + tex(texEquation(a, b, 2)) + '</p>'
    h += '<p class="ligne">Écarts verticaux ' + tex('e_i=y_i-(ax_i+b)') + ' : ' + ecarts.map(function (e) { return tex(tn(e, 4)) }).join('\u00a0; ') + '</p>'
    h += '<p class="ligne">' + tex('S=\\sum e_i^2') + ' : ' + ecarts.map(function (e) { return tex(tn(e * e, 4)) }).join(' + ') + ' ' + tex('=' + tn(Sv, 4)) + '</p>'
    h += '<p class="note">Plus petite somme que tu as atteinte : ' + tex(tn(this._record, 4)) + '.</p>'
    sh.getElementById('somme').innerHTML = h

    // ---------- Meilleure droite ----------
    var k = '<p class="titre-panneau">La droite des moindres carrés</p>'
    if (this._voirMeilleure) {
      k += '<p class="ligne">' + tex('G(\\bar{x}\\,;\\bar{y})') + ' avec ' + tex('\\bar{x}' + egal(S.mx, 2)) + ', ' + tex('\\bar{y}' + egal(S.my, 2)) + '</p>'
      k += '<p class="ligne">' + texEgalites(['a=\\frac{\\operatorname{Cov}(x,y)}{V(x)}', (exact(S.cov, 4) && exact(S.vx, 4) ? '' : '\\approx ') + '\\frac{' + tn(S.cov, 4) + '}{' + tn(S.vx, 4) + '}']) + ' ' + tex(egal(S.a, 3)) + ' ; ' +
        tex('b=\\bar{y}-a\\,\\bar{x}') + ' ' + tex(egal(S.b, 3)) + '</p>'
      k += '<p class="formule">' + tex(texEquation(S.a, S.b, 3)) + ' : ' + tex('S' + egal(Smin, 3)) + ' (le minimum)</p>'
    } else k += '<p class="note">Cherche d’abord toi-même, puis touche « Montrer la meilleure droite ».</p>'
    if (this._voirMayer && M.a !== null) {
      k += '<p class="ligne"><span class="c-plan">Droite de Mayer</span> ' + tex(texEquation(M.a, M.b, 3)) + ' : ' + tex('S' + egal(Sm, 3)) +
        (Sm - Smin > 1e-9 ? ' — un peu plus que la droite des moindres carrés.' : ' — ici aussi petite que le minimum.') + '</p>'
    }
    sh.getElementById('meilleure').innerHTML = k

    // ---------- Figure ----------
    var svg = sh.getElementById('svg')
    svg.innerHTML = ''
    R.fond(svg, 'cadre-mc')
    var g = R.groupe(svg, 'cadre-mc')
    function carres(aa, bb, cls) {
      pts.forEach(function (p) {
        var yh = aa * p[0] + bb, e = p[1] - yh
        if (Math.abs(e) < 1e-9) return
        var hautY = Math.max(p[1], yh), c1 = R.px(p[0], hautY), cote = Math.abs(e) * R.o.ux
        el('rect', { x: c1[0].toFixed(1), y: c1[1].toFixed(1), width: cote.toFixed(1), height: cote.toFixed(1), class: cls }, g)
      })
    }
    if (this._voirMeilleure) carres(S.a, S.b, 'carre-bon')
    carres(a, b, 'carre')
    if (this._voirMayer && M.a !== null) R.droite(g, M.a, M.b, 'trait-plan pointille')
    if (this._voirMeilleure) R.droite(g, S.a, S.b, 'trait-good')
    R.droite(g, a, b, 'trait-acc')
    pts.forEach(function (p) {
      var q = R.px(p[0], p[1]), r = R.px(p[0], a * p[0] + b)
      el('line', { x1: q[0].toFixed(1), y1: q[1].toFixed(1), x2: r[0].toFixed(1), y2: r[1].toFixed(1), class: 'trait-bad fin' }, g)
    })
    pts.forEach(function (p) { pointNuage(svg, R, p[0], p[1], null, 'pt') })
    if (this._voirMeilleure) marquePointMoyen(svg, R, S.mx, S.my, '')
    var prise = this._prise ? this._prise() : null
    ;[['m', XM], ['r', XB]].forEach(function (h2) {
      var y = a * h2[1] + b
      if (y < R.o.yMin || y > R.o.yMax) return
      var q = R.px(h2[1], y)
      el('circle', { cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: 6.5, class: h2[0] === 'm' ? 'pt-acc' : 'pt-ouvert trait-acc' }, svg)
      el('circle', { cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: 20, class: 'poignee' + (prise === h2[0] ? ' poignee-active' : ''), 'data-poignee': h2[0] }, svg)
    })
    svg.setAttribute('aria-label', 'Nuage de ' + pts.length + ' points, ta droite ' + txtEquation(a, b, 2) + ', somme des carrés ' + txt(Sv, 4))
  }
}

if (!customElements.get('moindres-carres-widget')) customElements.define('moindres-carres-widget', MoindresCarresWidget)
