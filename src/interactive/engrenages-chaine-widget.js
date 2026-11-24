/* ================================================================
 * <engrenages-chaine-widget> — atelier « Engrenages de la chaîne » (5e,
 * ch. 5, § 3, règle de la chaîne). Trois roues x → u → y : l'aiguille de
 * chaque roue tourne d'un demi-tour par unité de sa grandeur. Quand x
 * avance de h (aiguille en pointillés), u avance de Δu et y de Δy : les
 * arcs colorés montrent de combien chaque roue a tourné. Panneau KaTeX :
 * Δu/Δx · Δy/Δu = Δy/Δx, puis à la limite du/dx · dy/du = dy/dx — les
 * « vitesses » se multiplient. Deux chaînes : u = 2x − 1, y = u³ (exemple
 * du cours) et u = x² + 1, y = √u. Figure fixe, seule dans son conteneur
 * (épinglage). Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, texNombre, svgEl, txtNombre } from './katex-shadow.js'
import { CSS_LIMITES, texte, curseur, choix } from './limites-commun.js'

var CHAINES = {
  cours: {
    bouton: 'u=2x-1,\\ y=u^3', u: function (x) { return 2 * x - 1 }, g: function (u) { return u * u * u },
    up: function () { return 2 }, gp: function (u) { return 3 * u * u },
    texU: 'u=2x-1', texG: 'y=u^3', texUp: '\\dfrac{du}{dx}=2', texGp: '\\dfrac{dy}{du}=3u^2', texF: '\\dfrac{dy}{dx}=2\\cdot3(2x-1)^2',
    xMin: 0, xMax: 1.5, x0: 1, fleche1: '× 2', fleche2: '× 3u²',
  },
  racine: {
    bouton: 'u=x^2+1,\\ y=\\sqrt{u}', u: function (x) { return x * x + 1 }, g: function (u) { return Math.sqrt(u) },
    up: function (x) { return 2 * x }, gp: function (u) { return 1 / (2 * Math.sqrt(u)) },
    texU: 'u=x^2+1', texG: 'y=\\sqrt{u}', texUp: '\\dfrac{du}{dx}=2x', texGp: '\\dfrac{dy}{du}=\\dfrac{1}{2\\sqrt{u}}', texF: '\\dfrac{dy}{dx}=2x\\cdot\\dfrac{1}{2\\sqrt{x^2+1}}',
    xMin: 0, xMax: 2, x0: 1, fleche1: '× 2x', fleche2: '× 1/(2√u)',
  },
}
var PAS_H = [0.5, 0.2, 0.1, 0.05, 0.01]
var L = 420, H = 210, R0 = 46, CY = 92, CX = [70, 210, 350]
var ANGLE_PAR_UNITE = Math.PI

var T = document.createElement('template')
T.innerHTML =
  '<style>' + CSS_LIMITES +
  '.roue{fill:var(--surface,#fff);stroke:var(--ink-soft,#51626f);stroke-width:1.6;}' +
  '.dent{fill:var(--ink-soft,#51626f);}' +
  '.moyeu{fill:var(--ink-soft,#51626f);}' +
  '.aiguille{stroke:var(--ink,#182430);stroke-width:2.6;stroke-linecap:round;}' +
  '.aiguille-h{stroke:var(--ink,#182430);stroke-width:2;stroke-dasharray:4 3;stroke-linecap:round;}' +
  '.arc-x{fill:none;stroke:var(--accent,#b65c1f);stroke-width:6;stroke-opacity:0.65;}' +
  '.arc-u{fill:none;stroke:var(--good,#2f7a4f);stroke-width:6;stroke-opacity:0.65;}' +
  '.arc-y{fill:none;stroke:var(--plan,#6b4fa0);stroke-width:6;stroke-opacity:0.65;}' +
  '.lien{stroke:var(--ink-faint,#8a97a1);stroke-width:1.6;fill:none;}' +
  '.nom-roue{font-size:15px;font-style:italic;font-family:var(--serif,serif);fill:var(--ink,#182430);}' +
  '</style>' +
  '<div id="c-ch"></div>' +
  '<div class="figure"><svg id="svg" viewBox="0 0 ' + L + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Trois roues x, u et y reliées"></svg></div>' +
  '<div class="reglages"><div id="r-x"></div><div id="r-h"></div></div>' +
  '<div class="panneau" id="pan"></div>'

function arc(cx, cy, r, a0, a1) {
  // Angles mathématiques (sens direct, 0 = vers la droite) ; SVG a l'axe y vers le bas.
  var p = function (a) { return (cx + r * Math.cos(a)).toFixed(2) + ',' + (cy - r * Math.sin(a)).toFixed(2) }
  var d = a1 - a0
  if (Math.abs(d) < 1e-4) return ''
  var n = Math.max(2, Math.ceil(Math.abs(d) / 0.15)), s = 'M' + p(a0)
  for (var i = 1; i <= n; i++) s += 'L' + p(a0 + (d * i) / n)
  return s
}

class EngrenagesChaineWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(T.content.cloneNode(true))
    this._sh = sh
    this._cle = 'cours'
    this._x = 1
    this._i = 2
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    choix(sh.getElementById('c-ch'), Object.keys(CHAINES).map(function (k) { return { id: k, html: tex(CHAINES[k].bouton) } }),
      this._cle, function (id) { self._cle = id; self._x = CHAINES[id].x0; self._construireX(); self._rendre() }, 'Chaîne de fonctions')
    this._construireX()
    curseur(sh.getElementById('r-h'), { min: 0, max: PAS_H.length - 1, pas: 1, valeur: this._i, aria: 'Petit pas h donné à x', largeurNom: '74px',
      nom: function (i) { return tex('h=' + texNombre(PAS_H[i], 2)) }, changer: function (i) { self._i = i; self._rendre() } })
    this._rendre()
  }

  _construireX() {
    var self = this, C = CHAINES[this._cle], zone = this._sh.getElementById('r-x')
    zone.innerHTML = ''
    curseur(zone, { min: C.xMin, max: C.xMax, pas: 0.1, valeur: this._x, aria: 'Valeur de x', largeurNom: '74px',
      nom: function (v) { return tex('x=' + texNombre(v, 1)) }, changer: function (v) { self._x = v; self._rendre() } })
  }

  _roue(svg, i, nom, val, valH, clsArc) {
    var cx = CX[i]
    svg.appendChild(svgEl('circle', { cx: cx, cy: CY, r: R0, class: 'roue' }))
    for (var k = 0; k < 16; k++) {
      var a = (k * Math.PI) / 8
      svg.appendChild(svgEl('circle', { cx: cx + (R0 + 3) * Math.cos(a), cy: CY - (R0 + 3) * Math.sin(a), r: 3.2, class: 'dent' }))
    }
    var a0 = Math.PI / 2 - val * ANGLE_PAR_UNITE, a1 = Math.PI / 2 - valH * ANGLE_PAR_UNITE
    var d = a1 - a0, tours = Math.floor(Math.abs(d) / (2 * Math.PI))
    var dArc = Math.sign(d) * Math.min(Math.abs(d), 2 * Math.PI - 0.02)
    var chemin = arc(cx, CY, R0 * 0.72, a0, a0 + dArc)
    if (chemin) svg.appendChild(svgEl('path', { d: chemin, class: clsArc }))
    svg.appendChild(svgEl('line', { x1: cx, y1: CY, x2: cx + R0 * 0.9 * Math.cos(a0), y2: CY - R0 * 0.9 * Math.sin(a0), class: 'aiguille' }))
    svg.appendChild(svgEl('line', { x1: cx, y1: CY, x2: cx + R0 * 0.9 * Math.cos(a1), y2: CY - R0 * 0.9 * Math.sin(a1), class: 'aiguille-h' }))
    svg.appendChild(svgEl('circle', { cx: cx, cy: CY, r: 4, class: 'moyeu' }))
    texte(svg, cx, 22, nom, 'nom-roue', 'middle')
    texte(svg, cx, CY + R0 + 26, nom + ' = ' + txtNombre(val, 3), 'etiq', 'middle')
    texte(svg, cx, CY + R0 + 42, 'Δ' + nom + ' = ' + txtNombre(valH - val, 3) + (tours >= 1 ? ' (+' + tours + ' tour' + (tours > 1 ? 's' : '') + ')' : ''), 'etiq', 'middle')
  }

  _rendre() {
    var sh = this._sh, C = CHAINES[this._cle], x = this._x, h = PAS_H[this._i]
    var u = C.u(x), uh = C.u(x + h), y = C.g(u), yh = C.g(uh)
    var svg = sh.getElementById('svg')
    svg.innerHTML = ''
    svg.appendChild(svgEl('path', { d: 'M' + (CX[0] + R0 + 8) + ',' + CY + 'L' + (CX[1] - R0 - 8) + ',' + CY, class: 'lien' }))
    svg.appendChild(svgEl('path', { d: 'M' + (CX[1] + R0 + 8) + ',' + CY + 'L' + (CX[2] - R0 - 8) + ',' + CY, class: 'lien' }))
    texte(svg, (CX[0] + CX[1]) / 2, CY - 8, C.fleche1, 'etiq etiq-ok', 'middle')
    texte(svg, (CX[1] + CX[2]) / 2, CY - 8, C.fleche2, 'etiq etiq-plan', 'middle')
    this._roue(svg, 0, 'x', x, x + h, 'arc-x')
    this._roue(svg, 1, 'u', u, uh, 'arc-u')
    this._roue(svg, 2, 'y', y, yh, 'arc-y')

    var r1 = (uh - u) / h, r2 = (yh - y) / (uh - u), r = (yh - y) / h
    var d1 = C.up(x), d2 = C.gp(u)
    sh.getElementById('pan').innerHTML =
      '<p>' + tex(C.texU) + ' puis ' + tex(C.texG) + '. Quand ' + tex('x') + ' avance de ' + tex('h=' + texNombre(h, 2)) + ' :</p>' +
      '<p class="formule">' + tex('\\dfrac{\\Delta u}{\\Delta x}\\cdot\\dfrac{\\Delta y}{\\Delta u}=' + texNombre(r1, 4) + '\\cdot' + texNombre(r2, 4) + '=' + texNombre(r, 4) + '=\\dfrac{\\Delta y}{\\Delta x}') + '</p>' +
      '<p>C’est une simple simplification de fractions. À la limite, quand ' + tex('h\\to0') + ', les « vitesses » de rotation se multiplient : ' +
      tex(C.texUp + (/\d$/.test(C.texUp) ? '' : '=' + texNombre(d1, 3))) + ' et ' + tex(C.texGp + '=' + texNombre(d2, 3)) + ', donc</p>' +
      '<p class="formule">' + tex(C.texF + '=' + texNombre(d1 * d2, 3)) + '</p>' +
      '<p>C’est la règle de la chaîne, ' + tex("f'(x)=u'(x)\\cdot g'(u(x))") + '. Oublier le facteur ' + tex('\\dfrac{du}{dx}') +
      ', c’est faire comme si la roue ' + tex('u') + ' tournait aussi vite que la roue ' + tex('x') + '.</p>'
  }
}

if (!customElements.get('engrenages-chaine-widget')) customElements.define('engrenages-chaine-widget', EngrenagesChaineWidget)
