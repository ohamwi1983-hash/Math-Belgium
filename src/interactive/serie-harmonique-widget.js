/* ================================================================
 * <serie-harmonique-widget> — atelier « La série harmonique diverge »
 * (5e (6h), suites, étape « sommes infinies »). Sommes partielles
 * Hₙ = 1 + 1/2 + … + 1/n. Groupement d'Oresme : le paquet k (k ≥ 1)
 * réunit les 2ᵏ⁻¹ termes de 1/(2ᵏ⁻¹ + 1) à 1/2ᵏ ; chacun vaut au moins
 * 1/2ᵏ, donc le paquet vaut au moins 2ᵏ⁻¹ · 1/2ᵏ = 1/2, et
 * H(2ᴷ) ≥ 1 + K/2 : les sommes partielles dépassent tout nombre.
 * Vue « Paquets » : une colonne par paquet, ses termes empilés, la
 * ligne 1/2 en pointillés (repère FIXE : colonnes 0 à 10, hauteur 0 à
 * 1,1). Vue « Sommes partielles » : Hₙ pour n de 1 à 2ᴷ et les paliers
 * 1 + k/2 en n = 2ᵏ (repère FIXE : n de 0 à 1 024, H de 0 à 8).
 * Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, texEgalites, CSS_BASE } from './katex-shadow.js'
import { curseurHTML, majCurseur, borner } from './variables-aleatoires-commun.js'
import { CSS_LIEUX } from './lieux-geometriques-commun.js'
import { CSS_STAT, el, texte, repereStat } from './statistique-deux-variables-commun.js'
import { CSS_RS, nb, texNb, indice } from './nombres-reels-suites-commun.js'

var KMAX = 10
var RP = repereStat({ xMin: 0, xMax: KMAX + 1, yMin: 0, yMax: 1.1, ux: 34, uy: 250, pasX: 100, pasY: 0.1, grilleX: 100, nomX: '', nomY: '', mg: 58, mb: 44, md: 10, mh: 26, etiqY: function (v) { return nb(v, 1) }, etiqX: function () { return '' } })
var RS = repereStat({ xMin: 0, xMax: 1024, yMin: 0, yMax: 8, ux: 0.39, uy: 34, pasX: 128, pasY: 1, grilleX: 128, nomX: 'n', nomY: 'Hₙ', mg: 34, mb: 40, md: 22, mh: 26, etiqX: function (v) { return nb(v, 0) }, etiqY: function (v) { return nb(v, 0) } })
/** H[n] = 1 + 1/2 + … + 1/n (H[0] = 0). */
var H = [0]
for (var j = 1; j <= 1 << KMAX; j++) H.push(H[j - 1] + 1 / j)
function paquet(k) { return k === 0 ? 1 : H[1 << k] - H[1 << (k - 1)] }

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE + CSS_LIEUX + CSS_STAT + CSS_RS +
  '.terme{fill:var(--sky,#2f6fb0);fill-opacity:0.28;stroke:var(--sky,#2f6fb0);stroke-width:0.8;}' +
  '.terme-plein{fill:var(--sky,#2f6fb0);fill-opacity:0.28;stroke:none;}' +
  '.contour{fill:none;stroke:var(--sky,#2f6fb0);stroke-width:1.6;}' +
  '.demi{stroke:var(--good,#2f7a4f);stroke-width:2;stroke-dasharray:6 4;}' +
  '.courbe-h{fill:none;stroke:var(--sky,#2f6fb0);stroke-width:2;}' +
  '.palier{fill:var(--accent,#b65c1f);}' +
  '.marche{fill:none;stroke:var(--accent,#b65c1f);stroke-width:1.4;stroke-dasharray:4 3;}' +
  '</style>' +
  '<div class="rangee" role="group" aria-label="Vue"><button class="btn" data-v="paquets">Paquets</button><button class="btn" data-v="sommes">Sommes partielles</button></div>' +
  '<p class="consigne" id="consigne"></p>' +
  '<div class="figure"><svg id="svg" viewBox="0 0 ' + RP.L.toFixed(0) + ' ' + RP.H.toFixed(0) + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Série harmonique"></svg></div>' +
  '<p class="verdict ok" id="verdict" aria-live="polite"></p>' +
  '<div class="reglages">' + curseurHTML('K', 'Nombre de paquets', 1, KMAX, 1) + '</div>' +
  '<div class="panneau" id="infos" aria-live="polite"></div>'

class SerieHarmoniqueWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._K = 3
    this._vue = 'paquets'
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    sh.querySelectorAll('[data-v]').forEach(function (b) { b.addEventListener('click', function () { self._vue = b.getAttribute('data-v'); self._rendre() }) })
    function regler(v) { self._K = borner(Math.round(v), 1, KMAX); self._rendre() }
    sh.getElementById('K').addEventListener('input', function (e) { regler(parseFloat(e.target.value)) })
    sh.getElementById('K-moins').addEventListener('click', function () { regler(self._K - 1) })
    sh.getElementById('K-plus').addEventListener('click', function () { regler(self._K + 1) })
    this._rendre()
  }

  _rendre() {
    var sh = this._sh, K = this._K, vue = this._vue, N = 1 << K
    sh.querySelectorAll('[data-v]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-v') === vue)) })
    majCurseur(sh, 'K', K, 'K=' + K)
    var svg = sh.getElementById('svg')
    svg.innerHTML = ''
    if (vue === 'paquets') this._paquets(svg, K)
    else this._sommes(svg, K)
    sh.getElementById('consigne').textContent = vue === 'paquets'
      ? 'Chaque colonne est un paquet : 1, puis 1⁄2, puis 1⁄3 + 1⁄4, puis de 1⁄5 à 1⁄8… Chaque paquet atteint ou dépasse la ligne pointillée verte, à la hauteur 1⁄2.'
      : 'Les sommes partielles Hₙ (en bleu) restent au-dessus des paliers 1 + k⁄2 atteints en n = 2ᵏ (en orange).'

    var v = sh.getElementById('verdict')
    v.textContent = 'H' + indice(N) + (K === 1 ? ' = ' : ' ≈ ') + nb(H[N], 4) + ' ≥ 1 + ' + K + ' × 1⁄2 = ' + nb(1 + K / 2, 1) + ' (' + nb(N, 0) + ' termes).'

    // ---------- Panneau ----------
    var h = '<p class="titre-panneau">Le groupement d’Oresme</p>'
    // morceaux KaTeX séparés : la ligne peut se couper entre deux paquets sur téléphone
    var morceaux = ['H_{' + N + '}=1+\\dfrac{1}{2}']
    if (K >= 2) morceaux.push('+\\left(\\dfrac{1}{3}+\\dfrac{1}{4}\\right)')
    if (K >= 3) morceaux.push('+\\left(\\dfrac{1}{5}+\\ldots+\\dfrac{1}{8}\\right)')
    if (K >= 5) morceaux.push('+\\ldots')
    if (K >= 4) morceaux.push('+\\left(\\dfrac{1}{' + ((N >> 1) + 1) + '}+\\ldots+\\dfrac{1}{' + N + '}\\right)')
    morceaux.push('\\geq 1+' + K + '\\cdot\\dfrac{1}{2}', '=' + texNb(1 + K / 2, 1))
    h += '<p class="ligne">' + morceaux.map(function (m) { return tex(m) }).join(' ') + '</p>'
    h += '<p class="ligne">Dans le paquet ' + tex('k') + ', les ' + tex('2^{k-1}') + ' termes valent au moins le dernier, ' + tex('\\dfrac{1}{2^k}') + ' : le paquet vaut au moins ' + tex('2^{k-1}\\cdot\\dfrac{1}{2^k}=\\dfrac{1}{2}') + '.</p>'
    h += '<div class="defile"><table class="tableau"><thead><tr><th>paquet</th><th>termes</th><th>nombre</th><th>somme</th></tr></thead><tbody>'
    h += '<tr><td>0</td><td>' + tex('1') + '</td><td>1</td><td class="d">1</td></tr>'
    for (var k = 1; k <= K; k++) {
      var a = (1 << (k - 1)) + 1, b = 1 << k
      var termes = a === b ? tex('\\frac{1}{' + b + '}') : tex('\\frac{1}{' + a + '}') + ' à ' + tex('\\frac{1}{' + b + '}')
      h += '<tr' + (k === K ? ' class="actif"' : '') + '><td>' + k + '</td><td>' + termes + '</td><td>' + nb(1 << (k - 1), 0) + '</td><td class="d">' + (k === 1 ? '0,5' : '≈ ' + nb(paquet(k), 4)) + '</td></tr>'
    }
    h += '</tbody></table></div>'
    h += '<p class="note">Pour dépasser un nombre M, il suffit de 2(M − 1) paquets : les sommes partielles tendent vers +∞, alors que les termes 1⁄n tendent vers 0. Mais lentement : il faut 4 termes pour dépasser 2, 31 pour dépasser 4, 12 367 pour dépasser 10.</p>'
    sh.getElementById('infos').innerHTML = h
  }

  _paquets(svg, K) {
    var R = RP
    svg.setAttribute('viewBox', '0 0 ' + R.L.toFixed(0) + ' ' + R.H.toFixed(0))
    R.fond(svg, 'cadre-harm')
    var y12 = R.px(0, 0.5)[1]
    var demiL = 0.36
    for (var k = 0; k <= K; k++) {
      var x0 = R.px(k + 0.5 - demiL, 0)[0], x1 = R.px(k + 0.5 + demiL, 0)[0]
      var debut = k === 0 ? 1 : (1 << (k - 1)) + 1, fin = k === 0 ? 1 : 1 << k
      var bas = 0
      for (var j2 = debut; j2 <= fin; j2++) {
        var p = R.px(0, bas + 1 / j2)[1], q = R.px(0, bas)[1]
        el('rect', { x: x0.toFixed(1), y: p.toFixed(2), width: (x1 - x0).toFixed(1), height: (q - p).toFixed(2), class: q - p > 3 ? 'terme' : 'terme-plein' }, svg)
        bas += 1 / j2
      }
      var haut = R.px(0, bas)[1]
      el('rect', { x: x0.toFixed(1), y: haut.toFixed(1), width: (x1 - x0).toFixed(1), height: (R.y1 - haut).toFixed(1), class: 'contour' }, svg)
      texte(svg, (x0 + x1) / 2, haut - 5, k === 0 ? '1' : nb(bas, 2), 'et et-petit et-sky')
      // sous l'axe : numéro du paquet et nombre de termes
      texte(svg, (x0 + x1) / 2, R.y1 + 15, String(k), 'graduation')
      texte(svg, (x0 + x1) / 2, R.y1 + 30, k === 0 ? '1' : nb(1 << (k - 1), 0), 'et et-petit et-soft')
    }
    el('line', { x1: R.x0, y1: y12.toFixed(1), x2: R.x1, y2: y12.toFixed(1), class: 'demi' }, svg)
    texte(svg, R.x0 - 6, R.y1 + 15, 'paquet', 'et et-petit et-soft', 'end')
    texte(svg, R.x0 - 6, R.y1 + 30, 'termes', 'et et-petit et-soft', 'end')
    svg.setAttribute('aria-label', (K + 1) + ' paquets : le premier vaut 1, les suivants valent chacun au moins un demi ; dernier paquet environ ' + nb(paquet(K), 3))
  }

  _sommes(svg, K) {
    var R = RS, N = 1 << K
    svg.setAttribute('viewBox', '0 0 ' + R.L.toFixed(0) + ' ' + R.H.toFixed(0))
    R.fond(svg, 'cadre-hs')
    var g = R.groupe(svg, 'cadre-hs')
    // paliers 1 + k/2 en n = 2ᵏ (escalier en pointillés)
    var d = ''
    for (var k = 0; k <= K; k++) {
      var p = R.px(1 << k, 1 + k / 2), suiv = k < K ? R.px(1 << (k + 1), 1 + k / 2) : null
      d += (k === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1)
      if (suiv) d += ' L' + suiv[0].toFixed(1) + ',' + suiv[1].toFixed(1) + ' '
    }
    el('path', { d: d, class: 'marche' }, g)
    // Hₙ : ligne brisée par les points (n ; Hₙ)
    var pts = []
    for (var n = 1; n <= N; n++) { var q = R.px(n, H[n]); pts.push(q[0].toFixed(1) + ',' + q[1].toFixed(1)) }
    el('polyline', { points: pts.join(' '), class: 'courbe-h' }, g)
    for (k = 0; k <= K; k++) {
      var c = R.px(1 << k, 1 + k / 2)
      el('circle', { cx: c[0].toFixed(1), cy: c[1].toFixed(1), r: 3.5, class: 'palier' }, svg)
    }
    var fin = R.px(N, H[N])
    texte(svg, Math.min(R.x1 - 2, fin[0] + 4), fin[1] - 8, 'H' + indice(N) + ' ≈ ' + nb(H[N], 2), 'et et-petit et-sky', fin[0] > R.x1 - 80 ? 'end' : 'start')
    svg.setAttribute('aria-label', 'Sommes partielles de 1 à ' + N + ' termes, au-dessus des paliers 1 + k demis')
  }
}


if (!customElements.get('serie-harmonique-widget')) customElements.define('serie-harmonique-widget', SerieHarmoniqueWidget)
