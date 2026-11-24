/* ================================================================
 * <rectangle-produit-widget> — atelier « Le rectangle qui grandit » (5e,
 * ch. 5, § 3, règle du produit). Un rectangle de côtés u(x) et v(x) :
 * quand x avance de h, son aire u·v gagne trois morceaux — la bande
 * v·Δu (verte), la bande u·Δv (violette) et le coin Δu·Δv (rouge).
 * Le panneau divise par h : v·Δu/h + u·Δv/h + Δu·Δv/h. Quand h → 0,
 * les deux bandes donnent u′v + uv′ et le coin disparaît ; u′·v′ n'est
 * jamais la dérivée. Deux couples (u, v) ; fenêtre FIXE par couple
 * (jamais recalculée depuis un curseur). Figure seule dans son conteneur
 * (épinglage). Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, texNombre, svgEl } from './katex-shadow.js'
import { CSS_LIMITES, repere, texte, curseur, choix } from './limites-commun.js'

var COUPLES = {
  xcarre: {
    bouton: 'u=x,\\ v=x^2', u: function (x) { return x }, v: function (x) { return x * x },
    up: function () { return 1 }, vp: function (x) { return 2 * x },
    texU: 'u(x)=x', texV: 'v(x)=x^2', texUp: "u'(x)=1", texVp: "v'(x)=2x", texF: "(x^3)'=3x^2",
    vue: { x0: -0.15, x1: 2.25, y0: -0.3, y1: 4.4, gx: [1, 2], gy: [1, 2, 3, 4] },
  },
  affines: {
    bouton: 'u=x+1,\\ v=2x', u: function (x) { return x + 1 }, v: function (x) { return 2 * x },
    up: function () { return 1 }, vp: function () { return 2 },
    texU: 'u(x)=x+1', texV: 'v(x)=2x', texUp: "u'(x)=1", texVp: "v'(x)=2", texF: "(2x^2+2x)'=4x+2",
    vue: { x0: -0.2, x1: 3.3, y0: -0.3, y1: 4.4, gx: [1, 2, 3], gy: [1, 2, 3, 4] },
  },
}
var PAS_H = [0.5, 0.3, 0.2, 0.1, 0.05, 0.02, 0.01]

var T = document.createElement('template')
T.innerHTML =
  '<style>' + CSS_LIMITES +
  '.rect-uv{fill:var(--accent-soft,#f4e3d1);stroke:var(--accent,#b65c1f);stroke-width:1.6;}' +
  '.bande-du{fill:var(--good,#2f7a4f);fill-opacity:0.32;stroke:var(--good,#2f7a4f);stroke-width:1.2;}' +
  '.bande-dv{fill:var(--plan,#6b4fa0);fill-opacity:0.3;stroke:var(--plan,#6b4fa0);stroke-width:1.2;}' +
  '.coin{fill:var(--bad,#b23a3a);fill-opacity:0.55;stroke:var(--bad,#b23a3a);stroke-width:1.2;}' +
  '.legende i.lu{border-top-color:var(--good,#2f7a4f);}.legende i.lv{border-top-color:var(--plan,#6b4fa0);}' +
  '</style>' +
  '<div id="c-uv"></div>' +
  '<div class="legende"><span><i></i>aire ' + '<span id="aire"></span></span><span><i class="lu"></i>v·Δu</span>' +
  '<span><i class="lv"></i>u·Δv</span><span><i class="lko"></i>coin Δu·Δv</span></div>' +
  '<div class="figure"><svg id="svg" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Rectangle de côtés u et v qui grandit"></svg></div>' +
  '<div class="reglages"><div id="r-x"></div><div id="r-h"></div></div>' +
  '<div class="panneau" id="pan"></div>'

class RectangleProduitWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(T.content.cloneNode(true))
    this._sh = sh
    this._cle = 'xcarre'
    this._x = 1.2
    this._i = 0
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    sh.getElementById('aire').innerHTML = tex('u\\cdot v')
    choix(sh.getElementById('c-uv'), Object.keys(COUPLES).map(function (k) { return { id: k, html: tex(COUPLES[k].bouton) } }),
      this._cle, function (id) { self._cle = id; self._rendre() }, 'Côtés du rectangle')
    curseur(sh.getElementById('r-x'), { min: 0.5, max: 1.5, pas: 0.1, valeur: this._x, aria: 'Valeur de x', largeurNom: '70px',
      nom: function (v) { return tex('x=' + texNombre(v, 1)) }, changer: function (v) { self._x = v; self._rendre() } })
    curseur(sh.getElementById('r-h'), { min: 0, max: PAS_H.length - 1, pas: 1, valeur: this._i, aria: 'Écart h', largeurNom: '70px',
      nom: function (i) { return tex('h=' + texNombre(PAS_H[i], 2)) }, changer: function (i) { self._i = i; self._rendre() } })
    this._rendre()
  }

  _rendre() {
    var sh = this._sh, C = COUPLES[this._cle], x = this._x, h = PAS_H[this._i], v = C.vue
    var u0 = C.u(x), v0 = C.v(x), du = C.u(x + h) - u0, dv = C.v(x + h) - v0
    var R = repere(sh.getElementById('svg'), { x0: v.x0, x1: v.x1, y0: v.y0, y1: v.y1, gx: v.gx, gy: v.gy, nomX: 'u', nomY: 'v', grille: false })
    function rect(xa, ya, xb, yb, cls) {
      R.zone.appendChild(svgEl('rect', { x: R.px(xa), y: R.py(yb), width: Math.max(R.px(xb) - R.px(xa), 0.5), height: Math.max(R.py(ya) - R.py(yb), 0.5), class: cls }))
    }
    rect(0, 0, u0, v0, 'rect-uv')
    rect(u0, 0, u0 + du, v0, 'bande-du')
    rect(0, v0, u0, v0 + dv, 'bande-dv')
    rect(u0, v0, u0 + du, v0 + dv, 'coin')
    texte(R.svg, R.px(u0 / 2), R.py(v0 / 2) + 4, 'u·v', 'etiq etiq-acc', 'middle')
    texte(R.svg, R.px(u0) - 4, R.py(0) - 6, 'u(x)', 'etiq etiq-acc', 'end')
    texte(R.svg, R.px(0) + 4, R.py(v0) + 13, 'v(x)', 'etiq etiq-acc', 'start')
    if (R.px(u0 + du) - R.px(u0) > 26) texte(R.svg, R.px(u0 + du / 2), R.py(v0 / 2) + 4, 'v·Δu', 'etiq etiq-ok', 'middle')
    if (R.py(v0) - R.py(v0 + dv) > 16) texte(R.svg, R.px(u0 / 2), R.py(v0 + dv / 2) + 4, 'u·Δv', 'etiq etiq-plan', 'middle')

    var b1 = v0 * du / h, b2 = u0 * dv / h, b3 = du * dv / h
    var derivee = C.up(x) * v0 + u0 * C.vp(x), faux = C.up(x) * C.vp(x)
    sh.getElementById('pan').innerHTML =
      '<p>' + tex(C.texU) + ', ' + tex(C.texV) + ' ; en ' + tex('x=' + texNombre(x, 1)) + ' : ' + tex('u=' + texNombre(u0, 2)) + ', ' +
      tex('v=' + texNombre(v0, 2)) + ', ' + tex('\\Delta u=' + texNombre(du, 4)) + ', ' + tex('\\Delta v=' + texNombre(dv, 4)) + '.</p>' +
      '<p class="formule">' + tex('\\dfrac{\\Delta(uv)}{h}=v\\dfrac{\\Delta u}{h}+u\\dfrac{\\Delta v}{h}+\\dfrac{\\Delta u\\,\\Delta v}{h}') + '</p>' +
      '<p class="formule">' + tex('=' + texNombre(b1, 4) + '+' + texNombre(b2, 4) + '+' + texNombre(b3, 4) + '=' + texNombre(b1 + b2 + b3, 4)) + '</p>' +
      '<p>Quand ' + tex('h\\to0') + ', les deux bandes donnent ' + tex("v\\,u'+u\\,v'=" + texNombre(derivee, 4)) +
      ' (règle du produit : ' + tex(C.texF) + ' en ' + tex('x=' + texNombre(x, 1)) + ') et le <span class="ko">coin</span> ' +
      tex('\\dfrac{\\Delta u\\,\\Delta v}{h}') + ' disparaît.</p>' +
      '<p>Le raccourci ' + tex("u'\\cdot v'=" + texNombre(faux, 4)) + ' <span class="ko">n’est pas la dérivée</span> : il oublie les deux bandes.</p>'
  }
}

if (!customElements.get('rectangle-produit-widget')) customElements.define('rectangle-produit-widget', RectangleProduitWidget)
