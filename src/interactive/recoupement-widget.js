/* ================================================================
 * <recoupement-widget> — atelier « où la courbe recoupe-t-elle son
 * asymptote ? » (5e, ch. 4, § 5). f(x) = (x² + px + q)/(x² + 1) : asymptote
 * horizontale y = 1 quels que soient p et q ; division euclidienne
 * f(x) = 1 + (px + q − 1)/(x² + 1) ; recoupement ⟺ reste nul ⟺
 * x = (1 − q)/p. p = 0 : jamais (sauf q = 1, f ≡ 1). Position : au-dessus
 * là où px + q − 1 > 0. Sans score. Fenêtre FIXE (valeurs extrêmes de f :
 * −3,5 et 3,8). Défaut p = 1, q = 0 : l'exemple du cours. Web Component.
 * ================================================================ */
import { styleKatex, tex, texNombre } from './katex-shadow.js'
import { CSS_LIMITES, repere, courbe, droite, point, texte, curseur, texPoly, rel } from './limites-commun.js'

var T = document.createElement('template')
T.innerHTML =
  '<style>' + CSS_LIMITES + '</style>' +
  '<div class="figure"><svg id="svg" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Courbe et asymptote horizontale y = 1"></svg></div>' +
  '<div class="legende"><span><i></i>courbe de f</span><span><i class="la"></i>asymptote y = 1</span><span><i class="lok"></i>point de recoupement</span></div>' +
  '<div class="reglages" id="reg"></div>' +
  '<div class="panneau" id="pan"></div>'

function n(v) { return texNombre(v, 2) }

class RecoupementWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(T.content.cloneNode(true))
    this._sh = sh
    this._p = 1
    this._q = 0
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, reg = this._sh.getElementById('reg')
    curseur(reg, { min: -3, max: 3, pas: 0.5, valeur: 1, aria: 'Coefficient p', largeurNom: '74px',
      nom: function (v) { return tex('p=' + n(v)) }, changer: function (v) { self._p = v; self._rendre() } })
    curseur(reg, { min: -3, max: 3, pas: 0.5, valeur: 0, aria: 'Coefficient q', largeurNom: '74px',
      nom: function (v) { return tex('q=' + n(v)) }, changer: function (v) { self._q = v; self._rendre() } })
    this._rendre()
  }

  _rendre() {
    var sh = this._sh, p = this._p, q = this._q
    var f = function (x) { return (x * x + p * x + q) / (x * x + 1) }
    var R = repere(sh.getElementById('svg'), { x0: -8, x1: 8, y0: -4, y1: 4.5, gx: [-8, -6, -4, -2, 2, 4, 6, 8], gy: [-4, -3, -2, -1, 1, 2, 3, 4] })
    droite(R, 0, 1, 'asym')
    courbe(R, f, -8, 8, 'courbe')
    texte(R.svg, R.px(7.9), R.py(1) - 6, 'y = 1', 'etiq etiq-plan', 'end')
    var N = texPoly([q, p, 1]), reste = texPoly([q - 1, p])
    var h = '<p>' + tex('f(x)=\\dfrac{' + N + '}{x^2+1}=1+\\dfrac{' + reste + '}{x^2+1}') + ' : degrés égaux, asymptote horizontale ' + tex('y=1') + '.</p>'
    if (p !== 0) {
      var x0 = (1 - q) / p
      if (x0 >= R.x0 && x0 <= R.x1) point(R, x0, 1, 'pt-ok', 5.5)
      h += '<p>Recoupement : ' + tex(reste + '=0\\iff x=\\dfrac{1-q}{p}=\\dfrac{' + n(1 - q) + '}{' + n(p) + '}' + rel(x0, 2) + n(x0)) +
        (Math.abs(x0) > 8 ? ' (hors du cadre)' : '') + ', et ' + tex(rel(x0, 2) === '=' ? 'f(' + n(x0) + ')=1' : 'f(x)=1') + ' en ce point.</p>' +
        '<p>La courbe est au-dessus de ' + tex('y=1') + ' quand le reste est positif, soit pour ' + tex(rel(x0, 2) === '=' ? (p > 0 ? 'x>' : 'x<') + n(x0) : (p > 0 ? 'x>' : 'x<') + '\\dfrac{' + n(1 - q) + '}{' + n(p) + '}') +
        ', en dessous de l’autre côté — et elle s’en rapproche quand même aux deux extrémités.</p>'
    } else if (q === 1) {
      h += '<p class="ok">Avec ' + tex('p=0') + ' et ' + tex('q=1') + ', le reste est nul partout : ' + tex('f(x)=1') + ' pour tout ' + tex('x') +
        ', la courbe est la droite elle-même.</p>'
    } else {
      h += '<p class="ko">Avec ' + tex('p=0') + ', le reste vaut ' + tex('\\dfrac{' + n(q - 1) + '}{x^2+1}') + ', jamais nul : la courbe ne recoupe jamais ' +
        tex('y=1') + ' ; elle reste ' + (q > 1 ? 'au-dessus' : 'en dessous') + '.</p>'
    }
    sh.getElementById('pan').innerHTML = h
  }
}

if (!customElements.get('recoupement-widget')) customElements.define('recoupement-widget', RecoupementWidget)
