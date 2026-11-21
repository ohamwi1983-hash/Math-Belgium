/* ================================================================
 * <zoom-arriere-asymptote-widget> — atelier « prends du recul » (5e, ch. 4,
 * § 2). Fenêtre carrée [−10Z ; 10Z]², Z ∈ {1 ; 10 ; 100 ; 1 000} : le zoom
 * EST l'effet étudié (boutons, jamais un recadrage caché derrière un
 * paramètre). Trois fonctions : (x² − 3x + 5)/(x − 1) et son asymptote
 * y = x − 2 ; (2x² + x)/(x² + 1) et y = 2 ; x³/(x − 1), dont le quotient
 * x² + x + 1 n'est pas une droite (aucune asymptote de cette forme). Écart à
 * l'asymptote (ou au quotient) lu en x = 8Z. Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex } from './katex-shadow.js'
import { CSS_LIMITES, repere, courbe, droite, verticale, choix, texGrand, texPetit } from './limites-commun.js'

var NIVEAUX = [1, 10, 100, 1000]
var FONCTIONS = [
  { id: 'oblique', f: function (x) { return (x * x - 3 * x + 5) / (x - 1) }, av: 1, tf: '\\dfrac{x^2-3x+5}{x-1}',
    asym: { m: 1, p: -2 }, ta: 'y=x-2', ecart: function (x) { return 3 / (x - 1) }, te: '\\dfrac{3}{x-1}' },
  { id: 'horizontale', f: function (x) { return (2 * x * x + x) / (x * x + 1) }, av: null, tf: '\\dfrac{2x^2+x}{x^2+1}',
    asym: { m: 0, p: 2 }, ta: 'y=2', ecart: function (x) { return (x - 2) / (x * x + 1) }, te: '\\dfrac{x-2}{x^2+1}' },
  { id: 'aucune', f: function (x) { return (x * x * x) / (x - 1) }, av: 1, tf: '\\dfrac{x^3}{x-1}',
    asym: null, quotient: function (x) { return x * x + x + 1 }, ta: 'y=x^2+x+1', ecart: function (x) { return 1 / (x - 1) }, te: '\\dfrac{1}{x-1}' },
]

function txtEntier(n) { return (n < 0 ? '−' : '') + String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') }

var T = document.createElement('template')
T.innerHTML =
  '<style>' + CSS_LIMITES + '</style>' +
  '<div id="choix"></div>' +
  '<div class="figure"><svg id="svg" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Courbe et asymptote, de près ou de loin"></svg></div>' +
  '<div class="legende" id="leg"></div>' +
  '<div class="rangee" role="group" aria-label="Zoom"><button class="btn" id="avant" type="button">Zoom avant ÷ 10</button>' +
  '<span class="etiquette" id="niveau"></span><button class="btn" id="arriere" type="button">Zoom arrière × 10</button></div>' +
  '<div class="panneau" id="pan"></div>'

class ZoomArriereWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(T.content.cloneNode(true))
    this._sh = sh
    this._f = 0
    this._z = 0
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    choix(sh.getElementById('choix'), FONCTIONS.map(function (F, i) { return { id: String(i), html: tex(F.tf) } }), '0',
      function (id) { self._f = +id; self._rendre() }, 'Fonction')
    sh.getElementById('avant').addEventListener('click', function () { self._z = Math.max(0, self._z - 1); self._rendre() })
    sh.getElementById('arriere').addEventListener('click', function () { self._z = Math.min(NIVEAUX.length - 1, self._z + 1); self._rendre() })
    this._rendre()
  }

  _rendre() {
    var sh = this._sh, F = FONCTIONS[this._f], Z = NIVEAUX[this._z]
    var g = [-5 * Z, 5 * Z]
    var R = repere(sh.getElementById('svg'), { L: 360, H: 360, mg: 46, x0: -10 * Z, x1: 10 * Z, y0: -10 * Z, y1: 10 * Z, gx: g, gy: g, fx: txtEntier, fy: txtEntier })
    if (F.av !== null) verticale(R, F.av)
    if (F.asym) droite(R, F.asym.m, F.asym.p, 'asym')
    else courbe(R, F.quotient, R.x0, R.x1, 'courbe-faible')
    courbe(R, F.f, R.x0, R.x1, 'courbe', F.av !== null ? [F.av] : [])
    sh.getElementById('avant').disabled = this._z === 0
    sh.getElementById('arriere').disabled = this._z === NIVEAUX.length - 1
    sh.getElementById('niveau').innerHTML = 'fenêtre ' + tex('[-' + texGrand(10 * Z, 0) + '\\,;\\,' + texGrand(10 * Z, 0) + ']')
    sh.getElementById('leg').innerHTML = '<span><i></i>' + tex('f(x)=' + F.tf) + '</span>' +
      (F.asym ? '<span><i class="la"></i>asymptote ' + tex(F.ta) + '</span>' : '<span><i class="lf"></i>quotient ' + tex(F.ta) + ' (pas une droite)</span>')
    var x = 8 * Z, e = F.ecart(x)
    var h = '<p>En ' + tex('x=' + texGrand(x, 0)) + ', écart ' + tex((F.asym ? 'f(x)-(' + F.ta.slice(2) + ')' : 'f(x)-(x^2+x+1)') + '=' + F.te + '\\approx ' + texPetit(e)) + '.</p>'
    if (F.id === 'aucune') {
      h += '<p>L’écart au quotient fond, mais ce quotient ' + tex('x^2+x+1') + ' est une parabole : de loin, la courbe monte de plus en plus raide, ' +
        'aucune droite ne la suit (le degré du numérateur dépasse celui du dénominateur de 2).</p>'
    } else {
      h += '<p>' + (this._z === 0 ? 'De près, on distingue bien la courbe et la droite. Dézoome !'
        : 'Plus on prend de recul, moins on distingue la courbe de la droite : c’est ce qui reste d’une fonction à grande échelle, son asymptote.') + '</p>'
    }
    sh.getElementById('pan').innerHTML = h
  }
}

if (!customElements.get('zoom-arriere-asymptote-widget')) customElements.define('zoom-arriere-asymptote-widget', ZoomArriereWidget)
