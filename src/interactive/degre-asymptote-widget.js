/* ================================================================
 * <degre-asymptote-widget> — atelier « les 4 cas du degré » (5e, ch. 4,
 * § 2). Dénominateur au choix, x − 1 ou x² + 1 (5gen21 : degré 1 ou 2), et
 * degré du numérateur de 0 à 4. La division euclidienne N = D·Q + R est
 * calculée (coefficients exacts) et affichée, puis f = Q + R/D : Q constant
 * → asymptote horizontale y = Q (y = 0 si deg N < deg D) ; Q du premier
 * degré → oblique y = Q ; Q de degré ≥ 2 → aucune asymptote de cette forme
 * (le quotient, parabole ou cubique, est tracé en gris). x − 1 et degré 2 :
 * l'exemple (x² − 3x + 5)/(x − 1) ; x² + 1 et degré 3 : (2x³ + x² − 1)/(x² + 1).
 * Fenêtre FIXE. Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex } from './katex-shadow.js'
import { CSS_LIMITES, repere, courbe, verticale, droite, choix, texPoly } from './limites-commun.js'

// Coefficients du terme constant au terme dominant.
var DENOMINATEURS = {
  lin: { c: [-1, 1], av: 1 },
  quad: { c: [1, 0, 1], av: null },
}
var NUMERATEURS = {
  lin: [[5], [2, 3], [5, -3, 1], [5, -3, 0, 1], [-5, 0, 0, 0, 1]],
  quad: [[5], [2, 3], [-1, 1, 2], [-1, 0, 1, 2], [0, 0, 0, 0, 1]],
}

function evalPoly(c, x) { var s = 0; for (var i = c.length - 1; i >= 0; i--) s = s * x + c[i]; return s }
function degre(c) { for (var i = c.length - 1; i >= 0; i--) if (Math.abs(c[i]) > 1e-12) return i; return -1 }
// Division euclidienne de N par D (D unitaire ou non) : { q, r }.
function diviser(N, D) {
  var r = N.slice(), dD = degre(D), q = []
  for (var i = 0; i <= Math.max(0, degre(N) - dD); i++) q.push(0)
  while (degre(r) >= dD && degre(r) >= 0) {
    var k = degre(r) - dD, a = r[degre(r)] / D[dD]
    q[k] = a
    for (var j = 0; j <= dD; j++) r[j + k] -= a * D[j]
    r[k + dD] = 0 // terme dominant éliminé (exactement)
  }
  return { q: q, r: r.slice(0, Math.max(1, dD)) }
}

var T = document.createElement('template')
T.innerHTML =
  '<style>' + CSS_LIMITES + '</style>' +
  '<div id="c-den"></div><div id="c-deg"></div>' +
  '<div class="figure"><svg id="svg" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Courbe et éventuelle asymptote horizontale ou oblique"></svg></div>' +
  '<div class="legende" id="leg"></div>' +
  '<div class="panneau" id="pan"></div>'

class DegreAsymptoteWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(T.content.cloneNode(true))
    this._sh = sh
    this._den = 'lin'
    this._deg = 2
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    choix(sh.getElementById('c-den'), [
      { id: 'lin', html: 'Dénominateur ' + tex('x-1') }, { id: 'quad', html: 'Dénominateur ' + tex('x^2+1') },
    ], 'lin', function (id) { self._den = id; self._rendre() }, 'Dénominateur')
    choix(sh.getElementById('c-deg'), [0, 1, 2, 3, 4].map(function (d) { return { id: String(d), html: 'deg N = ' + d } }), '2',
      function (id) { self._deg = +id; self._rendre() }, 'Degré du numérateur')
    this._rendre()
  }

  _rendre() {
    var sh = this._sh, D = DENOMINATEURS[this._den], N = NUMERATEURS[this._den][this._deg]
    var dv = diviser(N, D.c), Q = dv.q, Rr = dv.r, dQ = degre(Q)
    var f = function (x) { return evalPoly(N, x) / evalPoly(D.c, x) }
    var R = repere(sh.getElementById('svg'), { x0: -6, x1: 8, y0: -12, y1: 12, gx: [-4, -2, 2, 4, 6, 8], gy: [-8, -4, 4, 8] })
    if (D.av !== null) verticale(R, D.av)
    var leg = '<span><i></i>courbe de f</span>'
    if (dQ <= 1) {
      droite(R, Q[1] || 0, Q[0] || 0, 'asym')
      leg += '<span><i class="la"></i>asymptote ' + tex('y=' + texPoly(Q)) + '</span>'
    } else {
      courbe(R, function (x) { return evalPoly(Q, x) }, -6, 8, 'courbe-faible')
      leg += '<span><i class="lf"></i>quotient ' + tex('y=' + texPoly(Q)) + ' (pas une droite)</span>'
    }
    courbe(R, f, -6, 8, 'courbe', D.av !== null ? [D.av] : [])
    sh.getElementById('leg').innerHTML = leg
    var tN = texPoly(N), tD = texPoly(D.c), tQ = texPoly(Q), tR = texPoly(Rr), dN = this._deg, dD = degre(D.c)
    var div = dN < dD
      ? tex(tN + '=(' + tD + ')\\cdot 0+' + (tR.charAt(0) === '-' ? '(' + tR + ')' : tR))
      : tex(tN + '=(' + tD + ')(' + tQ + ')' + (tR === '0' ? '' : tR.charAt(0) === '-' ? tR : '+' + tR))
    var h = '<p>' + tex('f(x)=\\dfrac{' + tN + '}{' + tD + '}') + ' : ' + tex('\\deg N=' + dN) + ', ' + tex('\\deg D=' + dD) + '.</p>' +
      '<p>Division euclidienne : ' + div + ', donc ' + tex('f(x)=' + (dN < dD ? '' : tQ + '+') + '\\dfrac{' + tR + '}{' + tD + '}') +
      ' ; la fraction tend vers ' + tex('0') + ' en ' + tex('\\pm\\infty') + '.</p>'
    if (dN < dD) h += '<p class="ok">' + tex('\\deg N<\\deg D') + ' : le quotient est nul, asymptote horizontale ' + tex('y=0') + '.</p>'
    else if (dQ === 0) h += '<p class="ok">' + tex('\\deg N=\\deg D') + ' : le quotient est un nombre, asymptote horizontale ' + tex('y=' + tQ) + ' (rapport des coefficients dominants).</p>'
    else if (dQ === 1) h += '<p class="ok">' + tex('\\deg N=\\deg D+1') + ' : le quotient est du premier degré, asymptote oblique ' + tex('y=' + tQ) + '.</p>'
    else h += '<p class="ko">' + tex('\\deg N\\geq\\deg D+2') + ' : le quotient ' + tex(tQ) + ' n’est pas une droite, aucune asymptote de cette forme.</p>'
    if (D.av !== null) h += '<p>' + tex('x-1') + ' s’annule en ' + tex('1') + ' et le numérateur y vaut ' + tex(String(evalPoly(N, 1))) + ' : asymptote verticale ' + tex('x=1') + '.</p>'
    else h += '<p>' + tex('x^2+1>0') + ' : aucune asymptote verticale.</p>'
    sh.getElementById('pan').innerHTML = h
  }
}

if (!customElements.get('degre-asymptote-widget')) customElements.define('degre-asymptote-widget', DegreAsymptoteWidget)
