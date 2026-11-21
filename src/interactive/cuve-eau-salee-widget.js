/* ================================================================
 * <cuve-eau-salee-widget> — atelier « la cuve d'eau salée » (5e, ch. 4,
 * § 4). Une cuve de V₀ litres d'eau pure reçoit r L/min d'eau salée à c g/L :
 * C(t) = c·r·t/(V₀ + r·t) = c − c·V₀/(V₀ + r·t). Le plafond y = c ne dépend
 * que de c ; V₀ et r ne changent que la vitesse — 90 % du plafond est
 * atteint en t₉₀ = 9V₀/r (r·t = 9V₀). Fenêtre FIXE (t de 0 à 200 min, C de
 * 0 à 55 g/L). Réglages par défaut = exemple du cours (100 L, 5 L/min,
 * 30 g/L). Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, texNombre, svgEl } from './katex-shadow.js'
import { CSS_LIMITES, repere, courbe, droite, point, texte, curseur, rel } from './limites-commun.js'

var T = document.createElement('template')
T.innerHTML =
  '<style>' + CSS_LIMITES + '.repere90{stroke:var(--good,#2f7a4f);stroke-width:1.4;stroke-dasharray:4 4;}</style>' +
  '<div class="figure"><svg id="svg" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Concentration du mélange en fonction du temps"></svg></div>' +
  '<div class="legende"><span><i></i>concentration ' + '<span id="lc"></span></span><span><i class="la"></i>plafond</span><span><i class="lok"></i>90 % du plafond</span></div>' +
  '<div class="reglages" id="reg"></div>' +
  '<div class="panneau" id="pan"></div>'

class CuveEauSaleeWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(T.content.cloneNode(true))
    this._sh = sh
    this._v = { V: 100, r: 5, c: 30, t: 40 }
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, reg = this._sh.getElementById('reg'), v = this._v
    function c(cle, min, max, pas, aria, nom) {
      curseur(reg, { min: min, max: max, pas: pas, valeur: v[cle], aria: aria, largeurNom: '96px', nom: nom, changer: function (x) { v[cle] = x; self._rendre() } })
    }
    c('V', 20, 200, 10, 'Volume de départ en litres', function (x) { return tex('V_0=' + x) + ' L' })
    c('r', 1, 20, 1, 'Débit en litres par minute', function (x) { return tex('r=' + x) + ' L/min' })
    c('c', 10, 50, 5, 'Concentration ajoutée en grammes par litre', function (x) { return tex('c=' + x) + ' g/L' })
    c('t', 0, 200, 1, 'Temps en minutes', function (x) { return tex('t=' + x) + ' min' })
    this._rendre()
  }

  _rendre() {
    var sh = this._sh, v = this._v
    var C = function (t) { return (v.c * v.r * t) / (v.V + v.r * t) }
    var R = repere(sh.getElementById('svg'), { x0: 0, x1: 200, y0: 0, y1: 55, mg: 38, gx: [50, 100, 150, 200], gy: [10, 20, 30, 40, 50], nomX: 't', nomY: 'C' })
    droite(R, 0, v.c, 'asym')
    texte(R.svg, R.px(198), R.py(v.c) - 6, 'y = ' + v.c, 'etiq etiq-plan', 'end')
    var t90 = (9 * v.V) / v.r
    if (t90 <= 200) {
      R.zone.appendChild(svgEl('line', { x1: R.px(t90), x2: R.px(t90), y1: R.py(0), y2: R.py(0.9 * v.c), class: 'repere90' }))
      point(R, t90, 0.9 * v.c, 'pt-ok', 4.5)
    }
    courbe(R, C, 0, 200, 'courbe')
    point(R, v.t, C(v.t), 'pt', 5)
    sh.getElementById('lc').innerHTML = tex('C(t)')
    var Ct = C(v.t)
    sh.getElementById('pan').innerHTML =
      '<p>' + tex('C(t)=\\dfrac{' + v.c + '\\cdot ' + v.r + 't}{' + v.V + '+' + v.r + 't}=' + v.c + '-\\dfrac{' + v.c + '\\cdot ' + v.V + '}{' + v.V + '+' + v.r + 't}') + '</p>' +
      '<p>' + tex('\\displaystyle\\lim_{t\\to+\\infty}C(t)=' + v.c) + ' g/L : le plafond est la concentration de l’eau ajoutée, ni ' +
      tex('V_0') + ' ni ' + tex('r') + ' n’y interviennent. Il n’est jamais atteint : le terme soustrait reste positif.</p>' +
      '<p>En ' + tex('t=' + v.t) + ' min : ' + tex('C' + rel(Ct, 2) + texNombre(Ct, 2)) + ' g/L, soit ' + tex((rel((100 * Ct) / v.c, 1) === '=' ? '' : '\\approx ') + texNombre((100 * Ct) / v.c, 1) + '\\,\\%') + ' du plafond.</p>' +
      '<p>90 % du plafond quand ' + tex('rt=9V_0') + ', soit ' + tex('t_{90}=\\dfrac{9\\cdot ' + v.V + '}{' + v.r + '}' + rel(t90, 1) + texNombre(t90, 1)) + ' min' +
      (t90 > 200 ? ' (hors du cadre)' : '') + ' : doubler le débit divise ce temps par deux, mais ne change pas le plafond.</p>'
  }
}

if (!customElements.get('cuve-eau-salee-widget')) customElements.define('cuve-eau-salee-widget', CuveEauSaleeWidget)
