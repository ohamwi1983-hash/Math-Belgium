/* ================================================================
 * <infini-moins-infini-widget> — atelier « ∞ − ∞ ne vaut rien d'avance »
 * (5e, ch. 4, § 1). Quatre couples (u ; v) qui tendent tous deux vers +∞ :
 * (x² ; x), (x + 3 ; x), (√(x² + 1) ; x), (x ; x²). Les deux fonctions et
 * leur différence d = u − v sont tracées dans une fenêtre FIXE ; un curseur
 * x lit les trois valeurs, et un tableau donne u, v, u − v en x = 10, 100,
 * 1 000 et 10⁶ (√(x² + 1) − x calculé par 1/(√(x² + 1) + x), sans perte de
 * précision). Limites : +∞, 3, 0, −∞. Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, texNombre, svgEl } from './katex-shadow.js'
import { CSS_LIMITES, repere, courbe, point, texte, curseur, choix, texGrand, texPetit } from './limites-commun.js'

var COUPLES = [
  { id: 'carre', u: function (x) { return x * x }, v: function (x) { return x }, d: function (x) { return x * x - x },
    tu: 'x^2', tv: 'x', lim: '+\\infty' },
  { id: 'trois', u: function (x) { return x + 3 }, v: function (x) { return x }, d: function () { return 3 },
    tu: 'x+3', tv: 'x', lim: '3' },
  { id: 'racine', u: function (x) { return Math.sqrt(x * x + 1) }, v: function (x) { return x }, d: function (x) { return 1 / (Math.sqrt(x * x + 1) + x) },
    tu: '\\sqrt{x^2+1}', tv: 'x', lim: '0' },
  { id: 'inverse', u: function (x) { return x }, v: function (x) { return x * x }, d: function (x) { return x - x * x },
    tu: 'x', tv: 'x^2', lim: '-\\infty' },
]
var EXPLICATION = {
  carre: function () { return 'Les deux partent vers ' + tex('+\\infty') + ', mais ' + tex('x^2') + ' beaucoup plus vite : ' + tex('x^2-x=x(x-1)\\to+\\infty') + '.' },
  trois: function () { return 'Les deux grandissent au même rythme : l’écart reste ' + tex('(x+3)-x=3') + ' pour tout ' + tex('x') + '.' },
  racine: function () { return 'Les deux se collent de plus en plus : ' + tex('\\sqrt{x^2+1}-x=\\dfrac{1}{\\sqrt{x^2+1}+x}\\to 0') + '.' },
  inverse: function () { return 'Cette fois, c’est ' + tex('v(x)=x^2') + ' qui l’emporte : ' + tex('x-x^2=x(1-x)\\to-\\infty') + '.' },
}

var T = document.createElement('template')
T.innerHTML =
  '<style>' + CSS_LIMITES + '.guide{stroke:var(--ink-faint,#8a97a1);stroke-width:1;stroke-dasharray:3 3;}.pt-f{fill:var(--ink-faint,#8a97a1);stroke:var(--surface,#fff);stroke-width:1.5;}.pt-2{fill:var(--sky,#2f6fb0);stroke:var(--surface,#fff);stroke-width:1.5;}</style>' +
  '<div id="choix"></div>' +
  '<div class="figure"><svg id="svg" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Deux fonctions et leur différence"></svg></div>' +
  '<div class="legende" id="leg"></div>' +
  '<div id="reg"></div>' +
  '<div class="panneau" id="pan"></div>' +
  '<div class="tab-zone" id="tab"></div>'

class InfiniMoinsInfiniWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(T.content.cloneNode(true))
    this._sh = sh
    this._c = 0
    this._x = 4
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this
    choix(this._sh.getElementById('choix'), COUPLES.map(function (c, i) {
      return { id: String(i), html: tex(c.tu) + ' et ' + tex(c.tv), aria: 'Couple ' + (i + 1) }
    }), '0', function (id) { self._c = +id; self._rendre() }, 'Couple de fonctions')
    curseur(this._sh.getElementById('reg'), { min: 0.5, max: 10, pas: 0.1, valeur: this._x, aria: 'Valeur de x', largeurNom: '74px',
      nom: function (v) { return tex('x=' + texNombre(v, 1)) }, changer: function (v) { self._x = v; self._rendre() } })
    this._rendre()
  }

  _rendre() {
    var sh = this._sh, c = COUPLES[this._c], x = this._x
    var R = repere(sh.getElementById('svg'), { x0: 0, x1: 10, y0: -8, y1: 14, gx: [2, 4, 6, 8, 10], gy: [-6, -3, 3, 6, 9, 12] })
    courbe(R, c.u, 0, 10, 'courbe-faible')
    courbe(R, c.v, 0, 10, 'courbe-2')
    courbe(R, c.d, 0, 10, 'courbe')
    R.zone.appendChild(svgEl('line', { x1: R.px(x), x2: R.px(x), y1: R.py(R.y0), y2: R.py(R.y1), class: 'guide' }))
    ;[[c.u(x), 'pt-f'], [c.v(x), 'pt-2'], [c.d(x), 'pt']].forEach(function (p) {
      if (p[0] >= R.y0 && p[0] <= R.y1) point(R, x, p[0], p[1], 4.5)
    })
    texte(R.svg, R.px(9.8), R.py(Math.max(R.y0 + 0.6, Math.min(R.y1 - 0.6, c.d(9.8)))) - 6, 'u − v', 'etiq etiq-acc', 'end')
    sh.getElementById('leg').innerHTML =
      '<span><i class="lf"></i>' + tex('u(x)=' + c.tu) + '</span><span><i class="l2"></i>' + tex('v(x)=' + c.tv) +
      '</span><span><i></i>' + tex('u(x)-v(x)') + '</span>'
    sh.getElementById('pan').innerHTML =
      '<p>En ' + tex('x=' + texNombre(x, 1)) + ' : ' + tex('u=' + texNombre(c.u(x), 3)) + ', ' + tex('v=' + texNombre(c.v(x), 3)) +
      ' et ' + tex('u-v=' + texNombre(c.d(x), 3)) + '.</p>' +
      '<p>' + EXPLICATION[c.id]() + ' Forme ' + tex('\\infty-\\infty') + ', et pourtant ' +
      tex('\\displaystyle\\lim_{x\\to+\\infty}\\big[u(x)-v(x)\\big]=' + c.lim) + '.</p>'
    var xs = [10, 100, 1000, 1e6]
    var h = '<table class="tab"><thead><tr><th>' + tex('x') + '</th><th>' + tex('u(x)') + '</th><th>' + tex('v(x)') + '</th><th>' + tex('u(x)-v(x)') + '</th></tr></thead><tbody>'
    xs.forEach(function (t) {
      var d = c.d(t)
      h += '<tr><td>' + tex(texGrand(t, 0)) + '</td><td>' + tex((c.id === 'racine' ? '\\approx ' : '') + texGrand(c.u(t), c.id === 'racine' ? 4 : 0)) +
        '</td><td>' + tex(texGrand(c.v(t), 0)) + '</td><td>' + tex(Math.abs(d) < 1 && d !== 0 ? '\\approx ' + texPetit(d) : texGrand(d, 0)) + '</td></tr>'
    })
    sh.getElementById('tab').innerHTML = h + '</tbody></table>'
  }
}

if (!customElements.get('infini-moins-infini-widget')) customElements.define('infini-moins-infini-widget', InfiniMoinsInfiniWidget)
