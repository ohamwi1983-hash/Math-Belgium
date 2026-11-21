/* ================================================================
 * <point-vide-ou-asymptote-widget> — atelier « nid-de-poule ou gouffre ? »
 * (5e, ch. 4, § 1). f(x) = (x − r₁)(x − r₂)/(x + 3), deux curseurs de racines.
 * Si l'une vaut −3 : forme 0/0, f se simplifie en une droite et la courbe a
 * un point vide (rond creux) dont la valeur est affichée. Sinon : N(−3) ≠ 0,
 * vraie asymptote verticale x = −3, avec les limites à gauche et à droite et
 * leur signe (N(−3)/0⁻, N(−3)/0⁺), plus l'asymptote oblique y = x − (r₁+r₂+3)
 * (le reste de la division vaut N(−3)). Fenêtre FIXE. Défaut r₁ = −3, r₂ = 3 :
 * l'exemple (x² − 9)/(x + 3), limite −6. Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, texNombre } from './katex-shadow.js'
import { CSS_LIMITES, repere, courbe, verticale, droite, point, texte, curseur } from './limites-commun.js'

var A = -3

var T = document.createElement('template')
T.innerHTML =
  '<style>' + CSS_LIMITES + '</style>' +
  '<div class="figure"><svg id="svg" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Point vide ou asymptote verticale en x = −3"></svg></div>' +
  '<div class="legende" id="leg"></div>' +
  '<div class="reglages" id="reg"></div>' +
  '<div class="panneau" id="pan"></div>'

function facteur(r) { return r === 0 ? 'x' : '(x' + (r > 0 ? '-' + r : '+' + -r) + ')' }
function lin(c) { return 'x' + (c === 0 ? '' : c > 0 ? '+' + c : String(c)) }

class PointVideWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(T.content.cloneNode(true))
    this._sh = sh
    this._r1 = -3
    this._r2 = 3
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, reg = this._sh.getElementById('reg')
    curseur(reg, { min: -6, max: 6, pas: 1, valeur: -3, aria: 'Première racine du numérateur', largeurNom: '74px',
      nom: function (v) { return tex('r_1=' + v) }, changer: function (v) { self._r1 = v; self._rendre() } })
    curseur(reg, { min: -6, max: 6, pas: 1, valeur: 3, aria: 'Seconde racine du numérateur', largeurNom: '74px',
      nom: function (v) { return tex('r_2=' + v) }, changer: function (v) { self._r2 = v; self._rendre() } })
    this._rendre()
  }

  _rendre() {
    var sh = this._sh, r1 = this._r1, r2 = this._r2
    var f = function (x) { return ((x - r1) * (x - r2)) / (x - A) }
    var R = repere(sh.getElementById('svg'), { x0: -10, x1: 6, y0: -15, y1: 15, gx: [-8, -6, -4, -2, 2, 4, 6], gy: [-10, -5, 5, 10] })
    var NT = facteur(r1) + facteur(r2)
    var N3 = (A - r1) * (A - r2)
    var h = '<p>' + tex('f(x)=\\dfrac{' + NT + '}{x+3}') + ' ; en ' + tex('x=-3') + ', le numérateur vaut ' +
      tex('(-3' + (r1 > 0 ? '-' + r1 : '+' + -r1) + ')(-3' + (r2 > 0 ? '-' + r2 : '+' + -r2) + ')=' + N3) + '.</p>'
    var leg = '<span><i></i>courbe de f</span>'
    if (N3 === 0) {
      var autre = r1 === A ? r2 : r1
      var L = A - autre
      courbe(R, function (x) { return x - autre }, -10, 6, 'courbe', [A])
      point(R, A, L, 'pt-creux', 5.5)
      texte(R.svg, R.px(A) - 8, R.py(L) - 8, '(−3 ; ' + String(L).replace('-', '−') + ')', 'etiq etiq-ok', 'end')
      leg += '<span><i class="lok"></i>point vide</span>'
      h += '<p class="ok">Forme ' + tex('\\dfrac{0}{0}') + ' : on simplifie par ' + tex('x+3') + '. Pour ' + tex('x\\neq-3') + ', ' + tex('f(x)=' + lin(-autre)) +
        ', donc ' + tex('\\displaystyle\\lim_{x\\to-3}f(x)=' + L) + '. Un point vide ' + tex('(-3\\,;' + L + ')') + ' : un nid-de-poule, pas une asymptote.</p>'
    } else {
      var s = r1 + r2 + 3
      verticale(R, A)
      droite(R, 1, -s, 'courbe-faible')
      courbe(R, f, -10, 6, 'courbe', [A])
      texte(R.svg, R.px(A) + 4, R.py(R.y1) + 12, 'x = −3', 'etiq etiq-plan', 'start')
      leg += '<span><i class="la"></i>asymptote verticale</span><span><i class="lf"></i>asymptote oblique</span>'
      var g = N3 > 0 ? '-\\infty' : '+\\infty', d = N3 > 0 ? '+\\infty' : '-\\infty'
      h += '<p class="ko">Le numérateur ne s’annule pas : forme ' + tex('\\dfrac{' + N3 + '}{0}') + ', vraie asymptote verticale ' + tex('x=-3') + ' — un gouffre.</p>' +
        '<p>' + tex('\\displaystyle\\lim_{x\\to-3^-}f(x)=\\dfrac{' + N3 + '}{0^-}=' + g) + ' et ' +
        tex('\\displaystyle\\lim_{x\\to-3^+}f(x)=\\dfrac{' + N3 + '}{0^+}=' + d) + '.</p>' +
        '<p>Division euclidienne : ' + tex('f(x)=' + lin(-s) + '+\\dfrac{' + N3 + '}{x+3}') + ', asymptote oblique ' + tex('y=' + lin(-s)) +
        ' (le reste est justement ' + tex('N(-3)=' + texNombre(N3, 0)) + ').</p>'
    }
    sh.getElementById('leg').innerHTML = leg
    sh.getElementById('pan').innerHTML = h
  }
}

if (!customElements.get('point-vide-ou-asymptote-widget')) customElements.define('point-vide-ou-asymptote-widget', PointVideWidget)
