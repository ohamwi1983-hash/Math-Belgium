/* ================================================================
 * <triangle-focal-widget> — atelier « Triangle focal » (6e, ch. 10,
 * § 3). Ellipse x²/a² + y²/b² = 1 (a et b entiers, b < a), foyers
 * F(c ; 0) et F′(−c ; 0), c = √(a² − b²), e = c/a. P se déplace sur
 * l'ellipse (glissé ou curseur). En direct : rayons focaux par la
 * formule du cours |PF| = a − e·x_P et |PF′| = a + e·x_P, comparés aux
 * longueurs MESURÉES sur la figure ; leur somme 2a ; l'encadrement
 * a − c ≤ |PF| ≤ a + c ; l'angle θ = F′PF (mesuré) ; l'aire du triangle
 * FPF′ calculée de trois façons (½·|PF|·|PF′|·sin θ, ½·|FF′|·|y_P|, et
 * la formule b²·tan(θ/2)). Mode « Angle imposé » : on choisit θ, les
 * points P qui le réalisent sont construits (rayons focaux racines de
 * t² − 2at + 2b²/(1 + cos θ) = 0) — ou il n'y en a aucun quand θ
 * dépasse l'angle maximal, atteint aux sommets (0 ; ±b), où
 * sin(θ_max/2) = e. Préréglage : l'exemple du cours, |PF| = 2·|PF′|.
 * Repère orthonormé à fenêtre FIXE. Web Component (Shadow DOM).
 * ================================================================ */
import './geo-analytique-commun.js'
import { styleKatex, tex, texEgalites, CSS_BASE } from './katex-shadow.js'
import { curseurHTML, majCurseur, borner } from './variables-aleatoires-commun.js'
import { texN, texRacine, CSS_LIEUX, placeurEtiquettes } from './lieux-geometriques-commun.js'
import { cheminPts, groupeCadre, ptsEllipse, arcAngle, CSS_CONIQUES } from './coniques-commun.js'

var G = window.GeoAnaCommun
var FEN = { xMin: -7, xMax: 7, yMin: -6, yMax: 6 }
var R = G.repere(FEN, 28, 14)
var DEG = 180 / Math.PI

function deg(x) { return texN(x, 1) + '^\\circ' }

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE + CSS_LIEUX + CSS_CONIQUES +
  '[hidden]{display:none !important;}' +
  '.tri{fill:var(--accent,#b65c1f);fill-opacity:0.12;stroke:none;}' +
  '.base{stroke:var(--ink,#182430);stroke-width:1.6;}' +
  '.arc-th{fill:none;stroke:var(--attn,#96650c);stroke-width:2.2;}' +
  '.cand{fill:var(--surface-2,#f7f9fb);stroke:var(--accent,#b65c1f);stroke-width:2;}' +
  '.hauteur{stroke:var(--ink-soft,#51626f);stroke-width:1.3;stroke-dasharray:4 4;}' +
  '</style>' +
  '<div class="rangee presets" role="group" aria-label="Exemples">' +
  '<button class="btn" id="cours">Exemple du cours : |PF| = 2 |PF′|</button>' +
  '<button class="btn" data-ab="5,3">a = 5, b = 3</button><button class="btn" data-ab="6,2">a = 6, b = 2</button></div>' +
  '<div class="rangee" role="group" aria-label="Mode"><button class="btn" id="libre">P libre</button><button class="btn" id="angle">Angle imposé</button></div>' +
  '<p class="consigne" id="consigne"></p>' +
  '<div class="figure"><svg id="svg" class="glisser" viewBox="0 0 ' + R.L + ' ' + R.H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="L’ellipse, ses foyers F et F′, le point P et le triangle FPF′"></svg></div>' +
  '<p class="verdict" id="verdict" aria-live="polite"></p>' +
  '<div class="reglages">' + curseurHTML('a', 'Demi-grand axe a', 2, 6, 1) + curseurHTML('b', 'Demi-petit axe b', 1, 5, 1) + '</div>' +
  '<div class="reglages" id="r-libre">' + curseurHTML('u', 'Position de P sur l’ellipse', -1, 1, 0.005) + '</div>' +
  '<div class="reglages" id="r-angle" hidden>' + curseurHTML('th', 'Angle imposé θ (en degrés)', 1, 179, 1) + '</div>' +
  '<div class="rangee" id="r-autre" hidden><button class="btn" id="autre">Autre point</button></div>' +
  '<div class="panneau" id="rayons" aria-live="polite"></div>' +
  '<div class="panneau" id="aire"></div>'

class TriangleFocalWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._a = 5; this._b = 4
    this._mode = 'libre'
    this._th = 60; this._q = 0
    this._ecouteurs = []
    this._coursP()
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh, svg = sh.getElementById('svg')
    sh.getElementById('cours').addEventListener('click', function () { self._a = 5; self._b = 4; self._mode = 'libre'; self._coursP(); self._rendre() })
    sh.querySelectorAll('[data-ab]').forEach(function (bt) {
      bt.addEventListener('click', function () { var v = bt.getAttribute('data-ab').split(','); self._a = +v[0]; self._b = +v[1]; self._cours = false; self._rendre() })
    })
    sh.getElementById('libre').addEventListener('click', function () { self._mode = 'libre'; self._rendre() })
    sh.getElementById('angle').addEventListener('click', function () { self._mode = 'angle'; self._cours = false; self._rendre() })
    function lier(id, regle, get, pas) {
      sh.getElementById(id).addEventListener('input', function (e) { regle(parseFloat(e.target.value)) })
      sh.getElementById(id + '-moins').addEventListener('click', function () { regle(get() - pas) })
      sh.getElementById(id + '-plus').addEventListener('click', function () { regle(get() + pas) })
    }
    lier('a', function (v) { self._a = borner(Math.round(v), 2, 6); self._b = Math.min(self._b, self._a - 1); self._cours = false; self._rendre() }, function () { return self._a }, 1)
    lier('b', function (v) { self._b = borner(Math.round(v), 1, self._a - 1); self._cours = false; self._rendre() }, function () { return self._b }, 1)
    lier('u', function (v) { self._u = borner(Math.round(v * 200) / 200, -1, 1); self._cours = false; self._rendre() }, function () { return self._u }, 0.01)
    lier('th', function (v) { self._th = borner(Math.round(v), 1, 179); self._rendre() }, function () { return self._th }, 1)
    sh.getElementById('autre').addEventListener('click', function () { self._q = (self._q + 1) % 4; self._rendre() })
    G.glisser(this, svg, R, function () {}, function (n, x, y) {
      if (self._mode !== 'libre') return
      self._u = Math.round(Math.atan2(y / self._b, x / self._a) / Math.PI * 200) / 200
      self._cours = false
      self._rendre()
    })
    this._rendre()
  }

  /** P de l'exemple du cours (a = 5, b = 4) : x = −25/9, y = 8√14/9. */
  _coursP() {
    this._cours = true
    this._u = Math.atan2((8 * Math.sqrt(14) / 9) / 4, (-25 / 9) / 5) / Math.PI
  }

  _rendre() {
    var sh = this._sh, self = this, a = this._a, b = this._b
    var c2 = a * a - b * b, c = Math.sqrt(c2), e = c / a
    var thMax = 2 * Math.asin(e) * DEG
    sh.getElementById('cours').setAttribute('aria-pressed', String(!!this._cours))
    sh.querySelectorAll('[data-ab]').forEach(function (bt) { bt.setAttribute('aria-pressed', String(!self._cours && bt.getAttribute('data-ab') === a + ',' + b)) })
    sh.getElementById('libre').setAttribute('aria-pressed', String(this._mode === 'libre'))
    sh.getElementById('angle').setAttribute('aria-pressed', String(this._mode === 'angle'))
    sh.getElementById('r-libre').hidden = this._mode !== 'libre'
    sh.getElementById('r-angle').hidden = this._mode !== 'angle'
    sh.getElementById('consigne').textContent = this._mode === 'libre'
      ? 'Fais glisser P sur l’ellipse, ou règle a et b.'
      : 'Choisis l’angle θ = F′PF : les points P qui le réalisent sont construits (s’il y en a).'
    majCurseur(sh, 'a', a, 'a=' + a)
    majCurseur(sh, 'b', b, 'b=' + b)
    sh.getElementById('b-plus').disabled = b >= a - 1
    majCurseur(sh, 'u', this._u, 'P')
    majCurseur(sh, 'th', this._th, '\\theta=' + this._th + '^\\circ')

    // ---------- Point P ----------
    var P = null, cands = [], existe = true
    if (this._mode === 'libre') {
      var t = Math.PI * this._u
      P = this._cours && a === 5 && b === 4 ? [-25 / 9, 8 * Math.sqrt(14) / 9] : [a * Math.cos(t), b * Math.sin(t)]
    } else {
      var ct = Math.cos(this._th / DEG), prod = 2 * b * b / (1 + ct), disc = a * a - prod
      if (disc < -1e-12) existe = false
      else {
        var X = Math.sqrt(Math.max(0, disc)) / e
        var Y = b * Math.sqrt(Math.max(0, 1 - X * X / (a * a)))
        cands = [[X, Y], [-X, Y], [-X, -Y], [X, -Y]]
        P = cands[this._q]
      }
    }
    sh.getElementById('r-autre').hidden = !(this._mode === 'angle' && existe)

    var cTex = texRacine(1, c2, 1), eTex = texRacine(1, c2, a)
    var vd = sh.getElementById('verdict')
    var h = '<p class="titre-panneau">Les rayons focaux</p>', k = '<p class="titre-panneau">L’angle et l’aire</p>'
    h += '<p class="ligne">' + tex('c=\\sqrt{a^2-b^2}=' + cTex) + ', ' + tex('e=\\frac{c}{a}=' + eTex) + (Number.isInteger(c) ? '' : ' ' + tex('\\approx' + texN(e, 3))) + '</p>'
    if (!P) {
      vd.className = 'verdict ko'
      vd.textContent = 'Aucun point P : θ = ' + this._th + '° dépasse l’angle maximal ≈ ' + texN(thMax, 1).replace('{,}', ',') + '°, atteint aux sommets (0 ; ±' + b + ').'
      h += '<p class="ligne">Il faudrait ' + tex('|PF|\\cdot|PF\'|=\\frac{2b^2}{1+\\cos\\theta}\\approx' + texN(2 * b * b / (1 + Math.cos(this._th / DEG)), 2)) + ', plus que ' + tex('a^2=' + a * a) + ' : aucun couple de rayons de somme ' + tex('2a=' + 2 * a) + ' n’a un produit aussi grand.</p>'
      k += '<p class="ligne">' + tex('\\sin\\frac{\\theta_{max}}{2}=e') + ', donc ' + tex('\\theta_{max}\\approx' + deg(thMax)) + '.</p>'
      sh.getElementById('rayons').innerHTML = h
      sh.getElementById('aire').innerHTML = k
      this._dessiner(null, cands, a, b, c, thMax)
      return
    }
    var x = P[0], y = P[1]
    var rF = Math.hypot(x - c, y), rF2 = Math.hypot(x + c, y)
    var fF = a - e * x, fF2 = a + e * x
    var ux = c - x, uy = -y, vx = -c - x, vy = -y
    var cosT = rF * rF2 > 1e-12 ? (ux * vx + uy * vy) / (rF * rF2) : 1
    var th = Math.acos(borner(cosT, -1, 1)) * DEG
    var aire1 = 0.5 * rF * rF2 * Math.sin(th / DEG), aire2 = c * Math.abs(y), aire3 = b * b * Math.tan(th / 2 / DEG)
    var plat = Math.abs(y) < 1e-9

    if (this._mode === 'angle') { vd.className = 'verdict ok'; vd.textContent = 'θ = ' + this._th + '° ≤ θ max ≈ ' + texN(thMax, 1).replace('{,}', ',') + '° : quatre points conviennent, symétriques par rapport aux axes.' }
    else if (plat) { vd.className = 'verdict neutre'; vd.textContent = 'P est sur l’axe focal : le triangle est aplati, θ = 0° et l’aire est nulle.' }
    else { vd.className = 'verdict ok'; vd.textContent = 'Les rayons focaux de la formule sont ceux qu’on mesure, et les trois calculs de l’aire donnent le même nombre.' }

    h += '<p class="ligne">' + tex('P\\left(' + texN(x, 2) + '\\,;' + texN(y, 2) + '\\right)') + ' <span class="note">(valeurs approchées)</span></p>'
    h += '<p class="ligne"><span class="c-good">' + texEgalites(['|PF|=a-e\\,x_P', a + '-' + texN(e, 3) + '\\times' + (x < 0 ? '(' + texN(x, 2) + ')' : texN(x, 2)), '\\approx' + texN(fF, 2)], '=') + '</span> ; mesuré : ' + tex('\\approx' + texN(rF, 2)) + '</p>'
    h += '<p class="ligne"><span class="c-plan">' + texEgalites(["|PF'|=a+e\\,x_P", '\\approx' + texN(fF2, 2)], '=') + '</span> ; mesuré : ' + tex('\\approx' + texN(rF2, 2)) + '</p>'
    h += '<p class="ligne">Somme : ' + tex("|PF|+|PF'|=2a=" + 2 * a) + ' ✓</p>'
    var amc = Number.isInteger(c) ? String(a - c) : a + '-' + cTex, apc = Number.isInteger(c) ? String(a + c) : a + '+' + cTex
    h += '<p class="note">Encadrement : ' + tex('a-c\\le|PF|\\le a+c') + ', ici ' + tex(amc + '\\le|PF|\\le ' + apc) + ' (minimum en ' + tex('(' + a + '\\,;0)') + ', maximum en ' + tex('(-' + a + '\\,;0)') + ').</p>'
    if (this._cours && a === 5 && b === 4) h += '<p class="ligne c-acc">Exemple du cours : ' + tex("|PF'|=\\frac{10}{3}") + ', ' + tex('|PF|=\\frac{20}{3}=2\\,|PF\'|') + ', ' + tex('x_P=-\\frac{25}{9}') + '.</p>'
    sh.getElementById('rayons').innerHTML = h

    k += '<p class="ligne">' + tex("\\theta=\\widehat{F'PF}\\approx" + deg(th)) + ' <span class="note">(mesuré)</span> ; maximum ' + tex('\\theta_{max}\\approx' + deg(thMax)) + ' aux sommets ' + tex('(0\\,;\\pm' + b + ')') + ', où ' + tex('\\sin\\frac{\\theta_{max}}{2}=e') + '.</p>'
    k += '<p class="ligne">' + texEgalites(["\\tfrac{1}{2}\\,|PF|\\cdot|PF'|\\cdot\\sin\\theta", '\\approx' + texN(aire1, 2)], '=') + '</p>'
    k += '<p class="ligne">' + texEgalites(["\\tfrac{1}{2}\\,|FF'|\\cdot|y_P|=c\\,|y_P|", '\\approx' + texN(aire2, 2)], '=') + ' <span class="note">(base et hauteur)</span></p>'
    k += '<p class="ligne c-attn">' + texEgalites(['b^2\\tan\\frac{\\theta}{2}', b * b + '\\tan\\frac{' + texN(th, 1) + '^\\circ}{2}', '\\approx' + texN(aire3, 2)], '=') + '</p>'
    if (this._cours && a === 5 && b === 4) k += '<p class="ligne c-acc">' + tex('\\cos\\theta=\\frac{11}{25}') + ' et aire ' + tex('=\\frac{8\\sqrt{14}}{3}\\approx9{,}98') + '.</p>'
    sh.getElementById('aire').innerHTML = k
    this._dessiner(P, cands, a, b, c, thMax, th)
  }

  _dessiner(P, cands, a, b, c, thMax, th) {
    var sh = this._sh, svg = sh.getElementById('svg')
    svg.innerHTML = ''
    R.fond(svg, 1)
    var g = groupeCadre(G, svg, R, 'cadre-tf')
    function ligne(A, B, cls) { var p = R.px(A[0], A[1]), q = R.px(B[0], B[1]); G.el('line', { x1: p[0].toFixed(1), y1: p[1].toFixed(1), x2: q[0].toFixed(1), y2: q[1].toFixed(1), class: cls }, g) }
    var F = [c, 0], F2 = [-c, 0]
    if (P) {
      var pts = [P, F, F2].map(function (q) { var r = R.px(q[0], q[1]); return r[0].toFixed(1) + ',' + r[1].toFixed(1) })
      G.el('polygon', { points: pts.join(' '), class: 'tri' }, g)
    }
    G.el('path', { d: cheminPts(R, ptsEllipse(0, 0, a, b, 1, 0)), class: 'conique' }, g)
    ligne(F2, F, 'base')
    if (P) {
      if (Math.abs(P[1]) > 1e-9) ligne(P, [P[0], 0], 'hauteur')
      ligne(P, F, 'seg-f'); ligne(P, F2, 'seg-f2')
    }
    var pl = placeurEtiquettes(R.L, R.H)
    var pF = R.px(c, 0), pF2 = R.px(-c, 0), pB = R.px(0, b), pB2 = R.px(0, -b)
    ;[pF, pF2, pB, pB2].forEach(function (q) { pl.point(q[0], q[1], 7) })
    var pP = P ? R.px(P[0], P[1]) : null
    if (pP) {
      pl.point(pP[0], pP[1], 9)
      if (th > 0.5) {
        var d1 = [pF2[0] - pP[0], pF2[1] - pP[1]], d2 = [pF[0] - pP[0], pF[1] - pP[1]]
        var m = arcAngle(g, pP, d1, d2, 20, 'arc-th')
        pl.point(m[0], m[1], 4)
      }
    }
    cands.forEach(function (q) { if (q === P) return; var r = R.px(q[0], q[1]); G.el('circle', { cx: r[0].toFixed(1), cy: r[1].toFixed(1), r: 4.5, class: 'cand' }, svg); pl.point(r[0], r[1], 6) })
    G.el('circle', { cx: pB[0].toFixed(1), cy: pB[1].toFixed(1), r: 3, class: 'pt' }, svg)
    G.el('circle', { cx: pB2[0].toFixed(1), cy: pB2[1].toFixed(1), r: 3, class: 'pt' }, svg)
    G.el('circle', { cx: pF[0].toFixed(1), cy: pF[1].toFixed(1), r: 4.5, class: 'pt-good' }, svg)
    G.el('circle', { cx: pF2[0].toFixed(1), cy: pF2[1].toFixed(1), r: 4.5, class: 'pt-plan' }, svg)
    if (pP) G.el('circle', { cx: pP[0].toFixed(1), cy: pP[1].toFixed(1), r: 6.5, class: 'pt-acc' }, svg)
    pl.poser(svg, pF[0], pF[1], 'F', 'et-good', [2, 3])
    pl.poser(svg, pF2[0], pF2[1], 'F′', 'et-plan', [3, 5, 2, 1])
    pl.poser(svg, pB[0], pB[1], 'B', 'et-soft', [4, 0, 1])
    if (pP) {
      pl.poser(svg, pP[0], pP[1], 'P', 'et-acc', P[1] >= 0 ? [4, 0, 1] : [5, 2, 3])
      if (th > 0.5) {
        var dd1 = [pF2[0] - pP[0], pF2[1] - pP[1]], dd2 = [pF[0] - pP[0], pF[1] - pP[1]]
        var a1 = Math.atan2(dd1[1], dd1[0]), a2 = Math.atan2(dd2[1], dd2[0]), da = a2 - a1
        while (da > Math.PI) da -= 2 * Math.PI
        while (da < -Math.PI) da += 2 * Math.PI
        var am = a1 + da / 2
        pl.poser(svg, pP[0] + 34 * Math.cos(am), pP[1] + 34 * Math.sin(am) + 4, 'θ', 'et-attn', [4])
      }
      if (this._mode === 'libre') G.poignee(svg, R, P[0], P[1], 'P', false)
    }
    void thMax
  }
}

if (!customElements.get('triangle-focal-widget')) customElements.define('triangle-focal-widget', TriangleFocalWidget)
