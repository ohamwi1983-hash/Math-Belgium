/* ================================================================
 * <plancher-plafond-widget> — atelier « plancher ou plafond, jamais
 * atteint » (5e, ch. 4, § 4). Mode plancher : coût unitaire Cᵤ(x) = v + F/x
 * (F = 240, v = 8 : l'exemple du cours) ; mode plafond : f(x) = b + a/(x + p)
 * avec a < 0 (b = 5, a = −3, p = 2 : une population qui remonte vers 5
 * milliers, P(x) = (5x + 7)/(x + 2)). Un point x déplaçable : l'écart à
 * l'asymptote (segment vert) reste toujours strictement positif. Une
 * fenêtre FIXE par mode (le mode est un choix, jamais un curseur). Web
 * Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, texNombre, svgEl } from './katex-shadow.js'
import { CSS_LIMITES, repere, courbe, droite, point, texte, curseur, choix, rel } from './limites-commun.js'

var MODES = {
  plancher: {
    fenetre: { x0: 0, x1: 150, y0: 0, y1: 60, gx: [25, 50, 75, 100, 125, 150], gy: [10, 20, 30, 40, 50], nomX: 'x', nomY: 'Cᵤ' },
    params: [
      { cle: 'F', min: 50, max: 400, pas: 10, def: 240, aria: 'Coût fixe F en euros', nom: function (v) { return tex('F=' + v) + ' €' } },
      { cle: 'v', min: 2, max: 15, pas: 1, def: 8, aria: 'Coût variable v en euros par unité', nom: function (v) { return tex('v=' + v) + ' €' } },
      { cle: 'x', min: 5, max: 150, pas: 1, def: 20, aria: 'Nombre d’unités x', nom: function (v) { return tex('x=' + v) } },
    ],
  },
  plafond: {
    fenetre: { x0: 0, x1: 30, y0: -4, y1: 12, gx: [5, 10, 15, 20, 25, 30], gy: [-4, -2, 2, 4, 6, 8, 10], nomX: 'x', nomY: 'P' },
    params: [
      { cle: 'b', min: 2, max: 10, pas: 0.5, def: 5, aria: 'Valeur à long terme b', nom: function (v) { return tex('b=' + texNombre(v, 1)) } },
      { cle: 'a', min: -20, max: -1, pas: 1, def: -3, aria: 'Coefficient a, négatif', nom: function (v) { return tex('a=' + v) } },
      { cle: 'p', min: 1, max: 10, pas: 1, def: 2, aria: 'Décalage p', nom: function (v) { return tex('p=' + v) } },
      { cle: 'x', min: 0, max: 30, pas: 0.5, def: 5, aria: 'Années x', nom: function (v) { return tex('x=' + texNombre(v, 1)) } },
    ],
  },
}

var T = document.createElement('template')
T.innerHTML =
  '<style>' + CSS_LIMITES + '.ecart{stroke:var(--good,#2f7a4f);stroke-width:3;}</style>' +
  '<div id="choix"></div>' +
  '<div class="figure"><svg id="svg" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Courbe et son asymptote horizontale"></svg></div>' +
  '<div class="legende"><span><i></i>courbe</span><span><i class="la"></i>asymptote horizontale</span><span><i class="lok"></i>écart à l’asymptote</span></div>' +
  '<div class="reglages" id="reg"></div>' +
  '<div class="panneau" id="pan"></div>'

class PlancherPlafondWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(T.content.cloneNode(true))
    this._sh = sh
    this._mode = 'plancher'
    this._v = {}
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this
    choix(this._sh.getElementById('choix'), [
      { id: 'plancher', html: 'Plancher : coût unitaire' }, { id: 'plafond', html: 'Plafond : population' },
    ], 'plancher', function (id) { self._mode = id; self._controles(); self._rendre() }, 'Mode')
    this._controles()
    this._rendre()
  }

  _controles() {
    var self = this, reg = this._sh.getElementById('reg'), v = this._v
    reg.innerHTML = ''
    MODES[this._mode].params.forEach(function (p) {
      v[p.cle] = p.def
      curseur(reg, { min: p.min, max: p.max, pas: p.pas, valeur: p.def, aria: p.aria, largeurNom: '84px', nom: p.nom,
        changer: function (x) { v[p.cle] = x; self._rendre() } })
    })
  }

  _rendre() {
    var sh = this._sh, v = this._v, M = MODES[this._mode]
    var R = repere(sh.getElementById('svg'), M.fenetre)
    var f, b, x = v.x, h
    if (this._mode === 'plancher') {
      b = v.v
      f = function (t) { return v.v + v.F / t }
      courbe(R, f, 1, 150, 'courbe')
    } else {
      b = v.b
      f = function (t) { return v.b + v.a / (t + v.p) }
      courbe(R, f, 0, 30, 'courbe')
    }
    droite(R, 0, b, 'asym')
    texte(R.svg, R.px(R.x1) - 2, R.py(b) - 6, 'y = ' + String(b).replace('.', ','), 'etiq etiq-plan', 'end')
    var y = f(x)
    R.zone.appendChild(svgEl('line', { x1: R.px(x), x2: R.px(x), y1: R.py(b), y2: R.py(y), class: 'ecart' }))
    point(R, x, y, 'pt', 5)
    if (this._mode === 'plancher') {
      h = '<p>' + tex('C_u(x)=' + v.v + '+\\dfrac{' + v.F + '}{x}') + ' ; en ' + tex('x=' + x) + ' : ' + tex('C_u(' + x + ')' + rel(y, 2) + texNombre(y, 2)) + ' €.</p>' +
        '<p>Écart au plancher : ' + tex('C_u(x)-' + v.v + '=\\dfrac{' + v.F + '}{' + x + '}' + rel(v.F / x, 3) + texNombre(v.F / x, 3)) + ' €, strictement positif. ' +
        tex('\\displaystyle\\lim_{x\\to+\\infty}C_u(x)=' + v.v) + ' : un plancher, jamais atteint (' + tex('\\dfrac{F}{x}>0') + ' pour tout ' + tex('x\\geq 1') + ').</p>'
    } else {
      var q = v.b * v.p + v.a // P(x) = (b·x + b·p + a)/(x + p)
      h = '<p>' + tex('P(x)=' + texNombre(v.b, 1) + '-\\dfrac{' + -v.a + '}{x+' + v.p + '}') + ' ' +
        tex('=\\dfrac{' + texNombre(v.b, 1) + 'x' + (q >= 0 ? '+' : '') + texNombre(q, 1) + '}{x+' + v.p + '}') + ' (milliers d’habitants, ' + tex('x') + ' en années).</p>' +
        '<p>' + tex('P(0)=' + texNombre(v.b, 1) + '+\\dfrac{' + v.a + '}{' + v.p + '}' + rel(v.b + v.a / v.p, 2) + texNombre(v.b + v.a / v.p, 2)) + ' : ' + tex('a<0') +
        ', la population part sous ' + tex(texNombre(v.b, 1)) + ' et monte vers elle.</p>' +
        '<p>En ' + tex('x=' + texNombre(x, 1)) + ', écart au plafond : ' + tex(texNombre(v.b, 1) + '-P(x)=\\dfrac{' + -v.a + '}{x+' + v.p + '}' + rel(-v.a / (x + v.p), 3) + texNombre(-v.a / (x + v.p), 3)) +
        ', strictement positif : ' + tex('y=' + texNombre(v.b, 1)) + ' est un plafond, jamais atteint.</p>'
    }
    sh.getElementById('pan').innerHTML = h
  }
}

if (!customElements.get('plancher-plafond-widget')) customElements.define('plancher-plafond-widget', PlancherPlafondWidget)
