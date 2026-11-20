/* ================================================================
 * <commutent-affines-widget> — atelier « f∘g = g∘f ? » (5e, ch. 1, § 2).
 * Deux fonctions affines f(x) = ax + b et g(x) = cx + d, coefficients
 * entiers réglés au curseur. Les droites de f∘g et de g∘f sont tracées sur
 * une grille d'une unité et leurs expressions affichées en KaTeX, avec la
 * substitution. Elles ont toujours la même pente ac : parallèles, ou
 * confondues exactement quand ad + b = cb + d (message affiché). Quatre
 * préréglages : cas général, deux translations, deux fonctions linéaires,
 * même point fixe. Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, texEgalites, CSS_BASE, svgEl, defsFleche } from './katex-shadow.js'

var X0 = -5, X1 = 5, Y0 = -5, Y1 = 5
var U = 34, ML = 26, MR = 18, MT = 14, MB = 24
var LARG = ML + MR + (X1 - X0 + 1) * U, HAUT = MT + MB + (Y1 - Y0 + 1) * U
function px(x) { return ML + (x - X0 + 0.5) * U }
function py(y) { return MT + (Y1 + 0.5 - y) * U }

var PARAMS = [
  { cle: 'a', min: -3, max: 3 },
  { cle: 'b', min: -4, max: 4 },
  { cle: 'c', min: -3, max: 3 },
  { cle: 'd', min: -4, max: 4 },
]
var PRESETS = [
  { nom: 'Cas général', v: { a: 2, b: 1, c: 1, d: -3 } },
  { nom: 'Deux translations', v: { a: 1, b: 2, c: 1, d: -3 } },
  { nom: 'Deux linéaires', v: { a: 2, b: 0, c: -1, d: 0 } },
  { nom: 'Même point fixe', v: { a: 2, b: 1, c: 3, d: 2 } },
]

function n(v) { return String(v) } // entier, KaTeX affiche « − »
function texFraction(p, q) {
  var g = Math.abs(p), h = Math.abs(q)
  while (h) { var t = g % h; g = h; h = t }
  g = g || 1
  p /= g; q /= g
  if (q < 0) { p = -p; q = -q }
  return q === 1 ? n(p) : (p < 0 ? '-' : '') + '\\frac{' + Math.abs(p) + '}{' + q + '}'
}
function par(v) { return v < 0 ? '(' + v + ')' : n(v) }
// Expression affine m x + p, écrite proprement (x, −x, pas de « + 0 », « + − »).
function texAffine(m, p) {
  var s
  if (m === 0) return n(p)
  s = m === 1 ? 'x' : m === -1 ? '-x' : n(m) + 'x'
  if (p > 0) s += '+' + p
  else if (p < 0) s += p
  return s
}
// k·(expr) + p, sans simplifier : la substitution telle qu'on l'écrit.
function texSubstitution(k, expr, p) {
  var s
  if (k === 0) s = '0\\cdot(' + expr + ')'
  else if (k === 1) s = '(' + expr + ')'
  else if (k === -1) s = '-(' + expr + ')'
  else s = n(k) + '(' + expr + ')'
  if (p > 0) s += '+' + p
  else if (p < 0) s += p
  return s
}

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE +
  '.droite-fg{stroke:var(--accent,#b65c1f);stroke-width:3;fill:none;}' +
  '.droite-gf{stroke:var(--sky,#2f6fb0);stroke-width:2.6;stroke-dasharray:9 6;fill:none;}' +
  '.pt-fg{fill:var(--accent,#b65c1f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
  '.pt-gf{fill:var(--sky,#2f6fb0);stroke:var(--surface,#fff);stroke-width:1.5;}' +
  '.expr{text-align:center;line-height:2.1;margin:0 0 8px;}' +
  '.c-fg{color:var(--accent-ink,#7a3c11);}.c-gf{color:var(--sky-ink,#1f4e7d);}' +
  '.c-fg i,.c-gf i{display:inline-block;width:22px;height:0;border-top:3px solid var(--accent,#b65c1f);vertical-align:middle;margin-right:6px;}' +
  '.c-gf i{border-top:3px dashed var(--sky,#2f6fb0);}' +
  '.groupes{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:4px 18px;margin:0 0 6px;}' +
  '.groupe-titre{text-align:center;margin:0 0 2px;}' +
  '.verdict-oui{border-left:4px solid var(--good,#2f7a4f);}' +
  '.verdict-non{border-left:4px solid var(--ink-faint,#8a97a1);}' +
  '</style>' +
  '<div class="rangee" id="presets" role="group" aria-label="Préréglages"></div>' +
  '<div class="figure"><svg id="svg" viewBox="0 0 ' + LARG + ' ' + HAUT + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Droites de f rond g et de g rond f"></svg></div>' +
  '<div class="expr" id="expr"></div>' +
  '<div class="groupes">' +
  '<div><p class="groupe-titre" id="titre-f"></p><div id="curseurs-f"></div></div>' +
  '<div><p class="groupe-titre" id="titre-g"></p><div id="curseurs-g"></div></div>' +
  '</div>' +
  '<div class="panneau" id="verdict"></div>'

class CommutentAffinesWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._v = { a: 2, b: 1, c: 1, d: -3 }
    this._ctrl = {}
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    var zp = sh.getElementById('presets')
    PRESETS.forEach(function (p) {
      var b = document.createElement('button')
      b.className = 'btn'
      b.textContent = p.nom
      b.addEventListener('click', function () {
        Object.keys(p.v).forEach(function (k) { self._v[k] = p.v[k] })
        self._rendre()
      })
      zp.appendChild(b)
    })
    PARAMS.forEach(function (p) {
      var ligne = document.createElement('div')
      ligne.className = 'curseur'
      ligne.innerHTML =
        '<span class="nom"></span><button class="btn moins" aria-label="Diminuer ' + p.cle + '">−</button>' +
        '<input type="range" min="' + p.min + '" max="' + p.max + '" step="1" aria-label="Coefficient ' + p.cle + '">' +
        '<button class="btn plus" aria-label="Augmenter ' + p.cle + '">+</button>'
      var input = ligne.querySelector('input')
      var fixer = function (v) {
        self._v[p.cle] = Math.max(p.min, Math.min(p.max, Math.round(v)))
        self._rendre()
      }
      input.addEventListener('input', function () { fixer(parseFloat(input.value)) })
      ligne.querySelector('.moins').addEventListener('click', function () { fixer(self._v[p.cle] - 1) })
      ligne.querySelector('.plus').addEventListener('click', function () { fixer(self._v[p.cle] + 1) })
      sh.getElementById(p.cle === 'a' || p.cle === 'b' ? 'curseurs-f' : 'curseurs-g').appendChild(ligne)
      self._ctrl[p.cle] = { input: input, nom: ligne.querySelector('.nom'), moins: ligne.querySelector('.moins'), plus: ligne.querySelector('.plus'), p: p }
    })
    this._rendre()
  }

  _rendre() {
    var sh = this._sh, v = this._v, self = this
    var a = v.a, b = v.b, c = v.c, d = v.d
    PARAMS.forEach(function (p) {
      var k = self._ctrl[p.cle]
      k.input.value = String(v[p.cle])
      k.nom.innerHTML = tex(p.cle + '=' + n(v[p.cle]))
      k.moins.disabled = v[p.cle] <= p.min
      k.plus.disabled = v[p.cle] >= p.max
    })
    sh.querySelectorAll('#presets .btn').forEach(function (bt, i) {
      var pv = PRESETS[i].v
      bt.setAttribute('aria-pressed', String(pv.a === a && pv.b === b && pv.c === c && pv.d === d))
    })
    var fT = texAffine(a, b), gT = texAffine(c, d)
    sh.getElementById('titre-f').innerHTML = tex('f(x)=ax+b=' + fT)
    sh.getElementById('titre-g').innerHTML = tex('g(x)=cx+d=' + gT)

    var pFG = a * d + b, pGF = c * b + d, m = a * c
    sh.getElementById('expr').innerHTML =
      '<div class="c-fg"><i></i>' + texEgalites(['(f\\circ g)(x)', 'f(' + gT + ')', texSubstitution(a, gT, b), texAffine(m, pFG)]) + '</div>' +
      '<div class="c-gf"><i></i>' + texEgalites(['(g\\circ f)(x)', 'g(' + fT + ')', texSubstitution(c, fT, d), texAffine(m, pGF)]) + '</div>'

    var cond = texEgalites(['ad+b', par(a) + '\\cdot' + par(d) + (b < 0 ? b : '+' + b), n(pFG)]) + ' et ' +
      texEgalites(['cb+d', par(c) + '\\cdot' + par(b) + (d < 0 ? d : '+' + d), n(pGF)])
    var verdict = sh.getElementById('verdict')
    var h = '<p>Même pente pour les deux : ' + texEgalites(['ac', par(a) + '\\cdot' + par(c), n(m)]) +
      '. Les deux droites sont donc toujours parallèles… ou confondues.</p><p>' + cond + '</p>'
    if (pFG === pGF) {
      verdict.className = 'panneau verdict-oui'
      h += '<p class="ok">Les deux droites sont confondues : ' + tex('f\\circ g=g\\circ f') + ', car ' + tex('ad+b=cb+d') + '.</p>'
      if (a === 1 && c === 1) h += '<p>Deux translations : l’ordre ne compte pas, on décale de ' + tex(n(b + d)) + ' dans les deux cas.</p>'
      else if (b === 0 && d === 0) h += '<p>Deux fonctions linéaires : multiplier par ' + tex('a') + ' puis par ' + tex('c') + ', ou par ' + tex('c') + ' puis par ' + tex('a') + ', revient au même.</p>'
      else if (a === c && b === d) h += '<p>Normal : ' + tex('f') + ' et ' + tex('g') + ' sont la même fonction.</p>'
      else if (a !== 1 && c !== 1) {
        h += '<p>' + tex('f') + ' et ' + tex('g') + ' ont le même point fixe : ' + tex('f(x)=x') + ' et ' + tex('g(x)=x') +
          ' pour ' + tex('x=' + texFraction(b, 1 - a)) + '.</p>'
      } else h += '<p>L’une des deux fonctions est ' + tex('x\\mapsto x') + ' : elle ne change rien, l’ordre est sans effet.</p>'
    } else {
      verdict.className = 'panneau verdict-non'
      h += '<p class="ko">Ordonnées à l’origine différentes (' + tex(n(pFG)) + ' et ' + tex(n(pGF)) + ') : deux droites parallèles distinctes, ' +
        tex('f\\circ g\\ne g\\circ f') + '.</p>'
    }
    verdict.innerHTML = h
    this._dessiner(m, pFG, pGF)
  }

  _droite(svg, m, p, cls) {
    // Segment visible de y = m x + p dans le cadre [X0−0,5 ; X1+0,5] × [Y0−0,5 ; Y1+0,5].
    var xa = X0 - 0.5, xb = X1 + 0.5, ya = Y0 - 0.5, yb = Y1 + 0.5
    var x1 = xa, x2 = xb
    if (m !== 0) {
      var u = (ya - p) / m, w = (yb - p) / m
      x1 = Math.max(xa, Math.min(u, w))
      x2 = Math.min(xb, Math.max(u, w))
    } else if (p < ya || p > yb) return
    if (x1 >= x2) return
    svg.appendChild(svgEl('line', { x1: px(x1), y1: py(m * x1 + p), x2: px(x2), y2: py(m * x2 + p), class: cls }))
  }

  _dessiner(m, pFG, pGF) {
    var svg = this._sh.getElementById('svg')
    svg.innerHTML = ''
    defsFleche(svg)
    for (var x = X0; x <= X1; x++) svg.appendChild(svgEl('line', { x1: px(x), x2: px(x), y1: py(Y0 - 0.5), y2: py(Y1 + 0.5), class: 'grille' }))
    for (var y = Y0; y <= Y1; y++) svg.appendChild(svgEl('line', { x1: px(X0 - 0.5), x2: px(X1 + 0.5), y1: py(y), y2: py(y), class: 'grille' }))
    svg.appendChild(svgEl('line', { x1: px(X0 - 0.5), x2: px(X1 + 0.5) + 6, y1: py(0), y2: py(0), class: 'axe', 'marker-end': 'url(#fleche)' }))
    svg.appendChild(svgEl('line', { x1: px(0), x2: px(0), y1: py(Y0 - 0.5), y2: py(Y1 + 0.5) - 6, class: 'axe', 'marker-end': 'url(#fleche)' }))
    var lx = svgEl('text', { x: px(X1 + 0.5) + 2, y: py(0) - 8, class: 'nom-axe', 'text-anchor': 'end' })
    lx.textContent = 'x'
    svg.appendChild(lx)
    var ly = svgEl('text', { x: px(0) + 9, y: py(Y1 + 0.5) + 4, class: 'nom-axe' })
    ly.textContent = 'y'
    svg.appendChild(ly)
    for (var t = X0; t <= X1; t++) {
      if (t === 0) continue
      var e = svgEl('text', { x: px(t), y: py(0) + 15, 'text-anchor': 'middle', class: 'tick-label' })
      e.textContent = String(t).replace('-', '−')
      svg.appendChild(e)
      var e2 = svgEl('text', { x: px(0) - 6, y: py(t) + 3.5, 'text-anchor': 'end', class: 'tick-label' })
      e2.textContent = String(t).replace('-', '−')
      svg.appendChild(e2)
    }
    var z = svgEl('text', { x: px(0) - 6, y: py(0) + 15, 'text-anchor': 'end', class: 'tick-label' })
    z.textContent = '0'
    svg.appendChild(z)
    this._droite(svg, m, pFG, 'droite-fg')
    this._droite(svg, m, pGF, 'droite-gf')
    // Ordonnées à l'origine, sur les lignes de la grille (entières).
    if (pFG >= Y0 && pFG <= Y1) svg.appendChild(svgEl('circle', { cx: px(0), cy: py(pFG), r: 5, class: 'pt-fg' }))
    if (pGF >= Y0 && pGF <= Y1) svg.appendChild(svgEl('circle', { cx: px(0), cy: py(pGF), r: pFG === pGF ? 3 : 5, class: 'pt-gf' }))
  }
}

if (!customElements.get('commutent-affines-widget')) {
  customElements.define('commutent-affines-widget', CommutentAffinesWidget)
}
