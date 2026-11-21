/* ================================================================
 * <terme-dominant-widget> — atelier « le terme dominant écrase les autres »
 * (5e, ch. 4, § 1). x = 10^k, k de 0 à 6 (échelle logarithmique) : barres
 * du poids de chaque terme de 3x² − 5x + 1 (part de |3x²|, |5x|, |1| dans
 * la somme de leurs tailles) et de x² + 2, sur une échelle FIXE de 0 à
 * 100 %. Valeurs exactes de chaque terme, du quotient f(x) et de l'écart
 * |f(x) − 3| = (5x + 5)/(x² + 2), calculé sans soustraction (aucune perte
 * de précision). Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, texNombre, svgEl, txtNombre } from './katex-shadow.js'
import { CSS_LIMITES, texte, curseur, texGrand, texPetit } from './limites-commun.js'

var L = 420, H = 250, MG = 62, MD = 58, HB = 24, ESP = 9
var BARRES = [
  { nom: '3x²', groupe: 0, val: function (x) { return 3 * x * x } },
  { nom: '−5x', groupe: 0, val: function (x) { return 5 * x } },
  { nom: '1', groupe: 0, val: function () { return 1 } },
  { nom: 'x²', groupe: 1, val: function (x) { return x * x } },
  { nom: '2', groupe: 1, val: function () { return 2 } },
]

var T = document.createElement('template')
T.innerHTML =
  '<style>' + CSS_LIMITES +
  '.barre{fill:var(--ink-faint,#8a97a1);}.barre-dom{fill:var(--accent,#b65c1f);}' +
  '.titre-groupe{font-size:12px;font-weight:600;fill:var(--ink-soft,#51626f);font-family:var(--sans,sans-serif);}' +
  '</style>' +
  '<div class="figure"><svg id="svg" viewBox="0 0 ' + L + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Poids de chaque terme"></svg></div>' +
  '<div id="reg"></div>' +
  '<div class="panneau" id="pan"></div>'

class TermeDominantWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(T.content.cloneNode(true))
    this._sh = sh
    this._k = 1
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this
    curseur(this._sh.getElementById('reg'), {
      min: 0, max: 6, pas: 0.25, valeur: this._k, aria: 'Exposant k, avec x égal à 10 puissance k', largeurNom: '120px',
      nom: function (v) { return tex('x=10^{' + texNombre(v, 2) + '}') },
      changer: function (v) { self._k = v; self._rendre() },
    })
    this._rendre()
  }

  _rendre() {
    var sh = this._sh, x = Math.pow(10, this._k), svg = sh.getElementById('svg')
    svg.innerHTML = ''
    var larg = L - MG - MD
    function bx(p) { return MG + (p / 100) * larg }
    var y = 18
    var sommes = [3 * x * x + 5 * x + 1, x * x + 2]
    var titres = ['numérateur 3x² − 5x + 1', 'dénominateur x² + 2']
    ;[0, 1].forEach(function (g) {
      texte(svg, MG, y, titres[g], 'titre-groupe', 'start')
      y += 8
      BARRES.filter(function (b) { return b.groupe === g }).forEach(function (b, i) {
        var part = (100 * b.val(x)) / sommes[g]
        svg.appendChild(svgEl('rect', { x: bx(0), y: y, width: Math.max(0.6, bx(part) - bx(0)), height: HB, class: i === 0 ? 'barre-dom' : 'barre' }))
        texte(svg, MG - 8, y + HB / 2 + 4, b.nom, 'etiq', 'end')
        texte(svg, Math.min(bx(part) + 5, L - MD + 4), y + HB / 2 + 4, txtNombre(part, part > 99.9 ? 4 : 1) + ' %', 'etiq', 'start')
        y += HB + ESP
      })
      y += 10
    })
    // Échelle fixe 0–100 %.
    var ya = H - 18
    svg.appendChild(svgEl('line', { x1: bx(0), x2: bx(100) + 8, y1: ya, y2: ya, class: 'axe', 'marker-end': 'url(#fleche)' }))
    var defs = svgEl('defs', {}), m = svgEl('marker', { id: 'fleche', markerWidth: '8', markerHeight: '8', refX: '6', refY: '4', orient: 'auto' })
    m.appendChild(svgEl('path', { d: 'M0,0 L8,4 L0,8 Z', class: 'fleche' }))
    defs.appendChild(m)
    svg.insertBefore(defs, svg.firstChild)
    ;[0, 50, 100].forEach(function (p) {
      svg.appendChild(svgEl('line', { x1: bx(p), x2: bx(p), y1: ya - 3, y2: ya + 3, class: 'tick' }))
      texte(svg, bx(p), ya + 14, p + ' %', 'tick-label', 'middle')
    })

    var f = (3 * x * x - 5 * x + 1) / (x * x + 2)
    var ecart = (5 * x + 5) / (x * x + 2) // |f(x) − 3| = |−5x − 5|/(x² + 2), x > 0
    var xT = texGrand(x, 2)
    sh.getElementById('pan').innerHTML =
      '<p>' + tex('x=' + xT) + ' : ' + tex('3x^2=' + texGrand(3 * x * x, 2)) + ', ' + tex('5x=' + texGrand(5 * x, 2)) +
      ' et ' + tex('1') + '. Au dénominateur : ' + tex('x^2=' + texGrand(x * x, 2)) + ' et ' + tex('2') + '.</p>' +
      '<p>' + tex('f(x)=\\dfrac{3x^2-5x+1}{x^2+2}\\approx ' + texNombre(f, 6)) + ' ; écart au rapport des termes dominants : ' +
      tex('|f(x)-3|=\\dfrac{5x+5}{x^2+2}\\approx ' + texPetit(ecart)) + '.</p>' +
      (this._k < 1
        ? '<p>Pour un petit ' + tex('x') + ', le terme ' + tex('-5x') + ' pèse encore lourd : la mise en évidence ne sert qu’à l’infini.</p>'
        : '<p class="ok">Plus ' + tex('x') + ' grandit, plus ' + tex('3x^2') + ' et ' + tex('x^2') + ' pèsent tout : ' +
          tex('f(x)') + ' se comporte comme ' + tex('\\dfrac{3x^2}{x^2}=3') + '.</p>')
  }
}

if (!customElements.get('terme-dominant-widget')) customElements.define('terme-dominant-widget', TermeDominantWidget)
