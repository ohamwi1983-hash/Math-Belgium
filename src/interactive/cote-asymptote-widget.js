/* ================================================================
 * <cote-asymptote-widget> — atelier « de quel côté ça part ? » (5e, ch. 4,
 * § 3). f(x) = k/(x − 1)ⁿ, n ∈ {1 ; 2}, k = 2 ou −2. Une sonde s'approche de
 * x = 1 par la gauche ou par la droite (distance h de 1 à 0,001) : signes du
 * numérateur, de x − 1, de (x − 1)ⁿ et du quotient en direct, valeur de f(x)
 * (point rogné au bord du cadre, avec sa valeur, quand il en sort). Racine
 * simple : sens opposés ; racine double : même sens. Fenêtre fixe. Web
 * Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, texNombre } from './katex-shadow.js'
import { CSS_LIMITES, repere, courbe, verticale, point, texte, curseur, choix, texGrand } from './limites-commun.js'

var DISTANCES = [1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01, 0.005, 0.002, 0.001]

var T = document.createElement('template')
T.innerHTML =
  '<style>' + CSS_LIMITES +
  '.signe-p{color:var(--good,#2f7a4f);font-weight:700;}.signe-m{color:var(--bad,#b23a3a);font-weight:700;}' +
  '</style>' +
  '<div id="c-n"></div><div id="c-k"></div><div id="c-cote"></div>' +
  '<div class="figure"><svg id="svg" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Courbe près de son asymptote verticale"></svg></div>' +
  '<div id="reg"></div>' +
  '<div class="tab-zone" id="tab"></div>' +
  '<div class="panneau" id="pan"></div>'

function signe(v) { return v > 0 ? '<span class="signe-p">+</span>' : '<span class="signe-m">−</span>' }

class CoteAsymptoteWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(T.content.cloneNode(true))
    this._sh = sh
    this._n = 1
    this._k = 2
    this._cote = -1
    this._i = 3
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    choix(sh.getElementById('c-n'), [
      { id: '1', html: 'Racine simple ' + tex('(x-1)') }, { id: '2', html: 'Racine double ' + tex('(x-1)^2') },
    ], '1', function (id) { self._n = +id; self._rendre() }, 'Racine du dénominateur')
    choix(sh.getElementById('c-k'), [
      { id: '2', html: 'Numérateur ' + tex('k=2') }, { id: '-2', html: 'Numérateur ' + tex('k=-2') },
    ], '2', function (id) { self._k = +id; self._rendre() }, 'Signe du numérateur')
    choix(sh.getElementById('c-cote'), [
      { id: '-1', html: 'Approcher par la gauche' }, { id: '1', html: 'Approcher par la droite' },
    ], '-1', function (id) { self._cote = +id; self._rendre() }, 'Côté d’approche')
    curseur(sh.getElementById('reg'), { min: 0, max: DISTANCES.length - 1, pas: 1, valeur: this._i, aria: 'Distance de x à 1', largeurNom: '96px',
      nom: function (i) { return tex('h=' + texNombre(DISTANCES[i], 3)) }, changer: function (i) { self._i = i; self._rendre() } })
    this._rendre()
  }

  _rendre() {
    var sh = this._sh, n = this._n, k = this._k, cote = this._cote, h = DISTANCES[this._i]
    var f = function (x) { return k / Math.pow(x - 1, n) }
    var R = repere(sh.getElementById('svg'), { x0: -3, x1: 5, y0: -10, y1: 10, gx: [-2, -1, 1, 2, 3, 4], gy: [-8, -4, 4, 8] })
    verticale(R, 1)
    courbe(R, f, -3, 5, 'courbe', [1])
    var x = 1 + cote * h, y = f(x)
    var yc = Math.max(R.y0 + 0.3, Math.min(R.y1 - 0.3, y))
    point(R, x, yc, 'pt', 5)
    var lab = 'f(x) = ' + (y < 0 ? '−' : '') + (Math.abs(y) >= 1000
      ? String(Math.round(Math.abs(y))).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
      : String(Math.round(Math.abs(y) * 100) / 100).replace('.', ','))
    texte(R.svg, R.px(x) + (cote < 0 ? -8 : 8), R.py(yc) + (yc > 0 ? 16 : -8), (y === yc ? '' : (y > 0 ? '↑ ' : '↓ ')) + lab, 'etiq', cote < 0 ? 'end' : 'start')
    texte(R.svg, R.px(1) + 4, R.py(R.y1) + 12, 'x = 1', 'etiq etiq-plan', 'start')

    var d = x - 1, dn = Math.pow(d, n)
    var texD = (d < 0 ? '-' : '') + texNombre(Math.abs(d), 3)
    sh.getElementById('tab').innerHTML =
      '<table class="tab"><thead><tr><th></th><th>valeur</th><th>signe</th></tr></thead><tbody>' +
      '<tr><td>numérateur ' + tex('k') + '</td><td>' + tex(String(k)) + '</td><td>' + signe(k) + '</td></tr>' +
      '<tr><td>' + tex('x-1') + '</td><td>' + tex(texD) + '</td><td>' + signe(d) + '</td></tr>' +
      (n === 2 ? '<tr><td>' + tex('(x-1)^2') + '</td><td>' + tex(texNombre(dn, 6)) + '</td><td>' + signe(dn) + '</td></tr>' : '') +
      '<tr><td>' + tex('f(x)') + '</td><td>' + tex(texGrand(y, 2)) + '</td><td>' + signe(y) + '</td></tr></tbody></table>'

    var fT = n === 1 ? '\\dfrac{' + k + '}{x-1}' : '\\dfrac{' + k + '}{(x-1)^2}'
    var limG = (n === 1 ? -k : k) > 0 ? '+\\infty' : '-\\infty'
    var limD = k > 0 ? '+\\infty' : '-\\infty'
    var denG = n === 1 ? '0^-' : '0^+'
    sh.getElementById('pan').innerHTML =
      '<p>' + (cote < 0
        ? tex('\\displaystyle\\lim_{x\\to1^-}' + fT + '=\\dfrac{' + k + '}{' + denG + '}=' + limG)
        : tex('\\displaystyle\\lim_{x\\to1^+}' + fT + '=\\dfrac{' + k + '}{0^+}=' + limD)) + '</p>' +
      '<p>Des deux côtés : à gauche ' + tex(limG) + ', à droite ' + tex(limD) + '. ' +
      (n === 1
        ? 'Racine simple : ' + tex('x-1') + ' change de signe en 1, la courbe part dans des sens <strong>opposés</strong>.'
        : 'Racine double : ' + tex('(x-1)^2>0') + ' des deux côtés, la courbe part dans le <strong>même</strong> sens.') + '</p>'
  }
}

if (!customElements.get('cote-asymptote-widget')) customElements.define('cote-asymptote-widget', CoteAsymptoteWidget)
