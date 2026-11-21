/* ================================================================
 * <aussi-pres-que-tu-veux-widget> — atelier « aussi près que tu veux »
 * (5e, ch. 4, § 1). Une marge ε autour d'une valeur candidate L (bande
 * horizontale) et une bande δ autour de a = 2 (bande verticale) : les points
 * de la courbe dont l'abscisse est dans la bande δ, SAUF x = a, sont verts
 * s'ils restent dans la marge, rouges sinon. Deux fonctions : le point vide
 * (x² − 5x + 6)/(x − 2), de limite −1 en 2 (f(2) n'existe pas), et le saut
 * de l'exemple du cours (x + 3 si x ≤ 2, x − 3 si x > 2) : pour ε < 3,
 * aucun L ni aucun δ ne marche. Fenêtre fixe. Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, texNombre, svgEl } from './katex-shadow.js'
import { CSS_LIMITES, repere, courbe, point, texte, curseur, choix } from './limites-commun.js'

var A = 2
var FONCTIONS = {
  vide: { f: function (x) { return x === A ? NaN : x - 3 }, defautL: -1 },
  saut: { f: function (x) { return x <= A ? x + 3 : x - 3 }, defautL: 5 },
}

var T = document.createElement('template')
T.innerHTML =
  '<style>' + CSS_LIMITES +
  '.bande-eps{fill:var(--accent,#b65c1f);opacity:0.16;}' +
  '.bande-delta{fill:var(--sky,#2f6fb0);opacity:0.16;}' +
  '.bord-eps{stroke:var(--accent,#b65c1f);stroke-width:1.2;stroke-dasharray:4 3;}' +
  '.bord-delta{stroke:var(--sky,#2f6fb0);stroke-width:1.2;stroke-dasharray:4 3;}' +
  '.legende i.le{border-top:9px solid var(--accent,#b65c1f);opacity:0.35;}' +
  '.legende i.ld{border-top:9px solid var(--sky,#2f6fb0);opacity:0.35;}' +
  '</style>' +
  '<div id="choix"></div>' +
  '<div class="figure"><svg id="svg" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Courbe, marge autour de L et bande autour de a"></svg></div>' +
  '<div class="legende"><span><i class="le"></i>marge ε autour de L</span><span><i class="ld"></i>bande δ autour de a</span>' +
  '<span><i class="lok"></i>point dans la marge</span><span><i class="lko"></i>point hors de la marge</span></div>' +
  '<div class="reglages" id="reg"></div>' +
  '<div class="panneau" id="pan"></div>'

class AussiPresWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(T.content.cloneNode(true))
    this._sh = sh
    this._mode = 'vide'
    this._L = -1
    this._eps = 1
    this._delta = 0.5
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh, reg = sh.getElementById('reg')
    choix(sh.getElementById('choix'), [
      { id: 'vide', html: 'Point vide ' + tex('\\dfrac{x^2-5x+6}{x-2}') },
      { id: 'saut', html: 'Saut (exemple du cours)' },
    ], 'vide', function (id) {
      self._mode = id
      self._L = FONCTIONS[id].defautL
      self._cL.fixer(self._L)
      self._rendre()
    }, 'Fonction étudiée')
    this._cL = curseur(reg, { min: -3, max: 6, pas: 0.5, valeur: this._L, aria: 'Valeur candidate L', largeurNom: '74px',
      nom: function (v) { return tex('L=' + texNombre(v, 1)) }, changer: function (v) { self._L = v; self._rendre() } })
    curseur(reg, { min: 0.1, max: 3, pas: 0.1, valeur: this._eps, aria: 'Marge epsilon', largeurNom: '74px',
      nom: function (v) { return tex('\\varepsilon=' + texNombre(v, 1)) }, changer: function (v) { self._eps = v; self._rendre() } })
    curseur(reg, { min: 0.05, max: 2, pas: 0.05, valeur: this._delta, aria: 'Demi-largeur delta', largeurNom: '74px',
      nom: function (v) { return tex('\\delta=' + texNombre(v, 2)) }, changer: function (v) { self._delta = v; self._rendre() } })
    this._rendre()
  }

  // Tous les x de ]a − δ ; a[ ∪ ]a ; a + δ[ (échantillonnés) restent-ils dans la marge ?
  _teste(delta) {
    var f = FONCTIONS[this._mode].f, L = this._L, eps = this._eps
    for (var i = 1; i <= 400; i++) {
      var h = (delta * i) / 400
      if (i === 400) h = delta * 0.9999
      if (Math.abs(f(A - h) - L) >= eps || Math.abs(f(A + h) - L) >= eps) return false
    }
    return true
  }

  _rendre() {
    var sh = this._sh, f = FONCTIONS[this._mode].f, L = this._L, eps = this._eps, d = this._delta
    var R = repere(sh.getElementById('svg'), {
      x0: -1, x1: 5, y0: -5, y1: 7, gx: [-1, 1, 2, 3, 4, 5], gy: [-4, -2, 2, 4, 6],
    })
    var z = R.zone
    z.appendChild(svgEl('rect', { x: R.px(R.x0), y: R.py(L + eps), width: R.px(R.x1) - R.px(R.x0), height: R.py(L - eps) - R.py(L + eps), class: 'bande-eps' }))
    z.appendChild(svgEl('rect', { x: R.px(A - d), y: R.py(R.y1), width: R.px(A + d) - R.px(A - d), height: R.py(R.y0) - R.py(R.y1), class: 'bande-delta' }))
    ;[L - eps, L + eps].forEach(function (y) { z.appendChild(svgEl('line', { x1: R.px(R.x0), x2: R.px(R.x1), y1: R.py(y), y2: R.py(y), class: 'bord-eps' })) })
    ;[A - d, A + d].forEach(function (x) { z.appendChild(svgEl('line', { x1: R.px(x), x2: R.px(x), y1: R.py(R.y0), y2: R.py(R.y1), class: 'bord-delta' })) })
    courbe(R, f, -1, 5, 'courbe', [A])
    // Points de la bande δ (x ≠ a) : vert dans la marge, rouge hors de la marge.
    for (var i = 1; i <= 9; i++) {
      var h = (d * i) / 10
      ;[A - h, A + h].forEach(function (x) {
        var y = f(x)
        if (y >= R.y0 && y <= R.y1) point(R, x, y, Math.abs(y - L) < eps ? 'pt-ok' : 'pt-ko', 3.6)
      })
    }
    if (this._mode === 'vide') point(R, A, -1, 'pt-creux', 5)
    else { point(R, A, 5, 'pt', 5); point(R, A, -1, 'pt-creux', 5) }
    texte(R.svg, R.px(R.x1) - 2, R.py(L) - 5, 'L', 'etiq etiq-acc', 'end')
    texte(R.svg, R.px(A) + 4, R.py(R.y1) + 12, 'a = 2', 'etiq', 'start')

    var ok = this._teste(d)
    var h2 = '<p>Marge ' + tex('\\varepsilon=' + texNombre(eps, 1)) + ' autour de ' + tex('L=' + texNombre(L, 1)) +
      ' ; bande ' + tex('\\delta=' + texNombre(d, 2)) + ' autour de ' + tex('a=2') + ' (le point ' + tex('x=2') + ' lui-même est exclu).</p>'
    if (ok) h2 += '<p class="ok">Tous les points de la bande verticale restent dans la marge : ce δ convient.</p>'
    else h2 += '<p class="ko">Des points de la bande verticale sortent de la marge (en rouge) : ce δ ne convient pas.</p>'
    // Existe-t-il un δ qui marche pour cette marge ?
    var existe = this._teste(0.01)
    if (this._mode === 'vide') {
      if (Math.abs(L + 1) < 1e-9) h2 += '<p>Ici ' + tex('|f(x)-(-1)|=|x-2|') + ' : il suffit de prendre ' + tex('\\delta\\le\\varepsilon') +
        '. Quelle que soit la marge, un δ existe : ' + tex('\\displaystyle\\lim_{x\\to 2}f(x)=-1') + ', alors que ' + tex('f(2)') + ' n’existe même pas.</p>'
      else h2 += '<p>' + (existe ? 'Pour cette marge, un petit δ marche encore, mais ' : 'Aucun δ ne marche : ') +
        'dès que ' + tex('\\varepsilon\\le|L+1|=' + texNombre(Math.abs(L + 1), 1)) + ', plus aucun δ ne convient. La limite n’est pas ' + tex(texNombre(L, 1)) + ', c’est ' + tex('-1') + '.</p>'
    } else {
      h2 += '<p>' + (existe ? 'Pour cette marge, un δ assez petit marche encore. Réduis ε : ' : 'Aucun δ ne marche, si petit soit-il : ') +
        'à gauche, ' + tex('f(x)') + ' se rapproche de ' + tex('5') + ' ; à droite, de ' + tex('-1') + '. Une marge ' + tex('\\varepsilon<3') +
        ' ne peut pas contenir les deux : ' + tex('\\displaystyle\\lim_{x\\to 2}f(x)') + ' n’existe pas, même si ' + tex('f(2)=5') + '.</p>'
    }
    sh.getElementById('pan').innerHTML = h2
  }
}

if (!customElements.get('aussi-pres-que-tu-veux-widget')) customElements.define('aussi-pres-que-tu-veux-widget', AussiPresWidget)
