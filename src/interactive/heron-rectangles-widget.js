/* ================================================================
 * <heron-rectangles-widget> — atelier « Les rectangles de Héron »
 * (5e (6h), nombres réels, étape « approcher et densité »). Tous les
 * rectangles ont la même aire A ; le premier mesure a₁ sur A/a₁. Le
 * suivant a pour longueur la moyenne des deux côtés :
 * aₙ₊₁ = ½(aₙ + A/aₙ), et pour largeur A/aₙ₊₁. Les rectangles se
 * rapprochent du carré de côté √A (pointillés), et chaque rectangle
 * ENCADRE √A : largeur ≤ √A ≤ longueur. Le tableau écrit les bornes à
 * 10⁻⁹ près (borne inférieure arrondie par défaut, supérieure par
 * excès, pour que l'encadrement affiché reste vrai) et met en vert les
 * chiffres communs aux deux bornes, donc sûrs. Repère FIXE (0 à 14 sur
 * les deux axes) : A de 2 à 60, a₁ de 0,5 à 14 (au pas de 0,5), avec
 * A/a₁ ≤ 14 pour que le premier rectangle tienne dans le cadre.
 * Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, texEgalites, CSS_BASE } from './katex-shadow.js'
import { curseurHTML, majCurseur, borner } from './variables-aleatoires-commun.js'
import { CSS_LIEUX } from './lieux-geometriques-commun.js'
import { CSS_STAT, el, texte, repereStat } from './statistique-deux-variables-commun.js'
import { CSS_RS, nb, texNb, indice } from './nombres-reels-suites-commun.js'

var LMAX = 12, HMAX = 8
var R = repereStat({ xMin: 0, xMax: LMAX, yMin: 0, yMax: HMAX, ux: 34, uy: 34, pasX: 2, pasY: 2, grilleX: 1, grilleY: 1, nomX: 'longueur', nomY: 'largeur', mg: 34, mb: 40, md: 18 })
var NMAX = 8
var D = 9 // décimales des bornes affichées

/** Borne inférieure (par défaut) ou supérieure (par excès) à 10⁻ᴰ près, en chaîne « 4.242640687 ». */
function borne(x, parExces) {
  var f = Math.pow(10, D), v = x * f
  var r = Math.abs(v - Math.round(v)) < 1e-6 ? Math.round(v) : parExces ? Math.ceil(v) : Math.floor(v)
  var ch = (r / f).toFixed(D)
  // valeur exacte à 10⁻ᴰ près : zéros finaux inutiles retirés (« 2 », « 5,5 »)
  if (Math.abs(v - Math.round(v)) < 1e-6) ch = ch.replace(/0+$/, '').replace(/\.$/, '')
  return ch
}
/** Chaîne « 4.242640687 » → « 4,242640687 » avec les `k` premiers caractères en vert. */
function chiffres(s, k) {
  var html = ''
  for (var i = 0; i < s.length; i++) {
    var c = s.charAt(i) === '.' ? ',' : s.charAt(i)
    html += i < k ? '<span class="chiffres-ok">' + c + '</span>' : c
  }
  return html
}
function prefixeCommun(a, b) { var k = 0; while (k < a.length && a.charAt(k) === b.charAt(k)) k++; return k }

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE + CSS_LIEUX + CSS_STAT + CSS_RS +
  '.rect-ancien{fill:none;stroke:var(--ink-soft,#51626f);stroke-width:1.2;stroke-opacity:0.55;}' +
  '.rect-courant{fill:var(--accent,#b65c1f);fill-opacity:0.14;stroke:var(--accent,#b65c1f);stroke-width:2.4;}' +
  '.carre-cible{fill:none;stroke:var(--good,#2f7a4f);stroke-width:2;stroke-dasharray:6 4;}' +
  '</style>' +
  '<p class="consigne">Tous les rectangles ont la même aire A. Touche « Rectangle suivant » : la nouvelle longueur est la moyenne des deux côtés.</p>' +
  '<div class="figure"><svg id="svg" viewBox="0 0 ' + R.L.toFixed(0) + ' ' + R.H.toFixed(0) + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Rectangles d’aire A et carré de côté racine de A"></svg></div>' +
  '<div class="rangee" role="group" aria-label="Étapes">' +
  '<button class="btn" id="suivant">Rectangle suivant</button><button class="btn" id="precedent">Retirer le dernier</button><button class="btn" id="recommencer">Recommencer</button></div>' +
  '<p class="verdict neutre" id="verdict" aria-live="polite"></p>' +
  '<div class="reglages">' + curseurHTML('A', 'Aire A', 2, 60, 1) + curseurHTML('a1', 'Longueur a₁ du premier rectangle', 0.5, LMAX, 0.5) + '</div>' +
  '<div class="panneau" id="infos" aria-live="polite"></div>'

class HeronRectanglesWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._A = 18
    this._a1 = 9
    this._n = 1
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    sh.getElementById('suivant').addEventListener('click', function () { if (self._n < NMAX) { self._n++; self._rendre() } })
    sh.getElementById('precedent').addEventListener('click', function () { if (self._n > 1) { self._n--; self._rendre() } })
    sh.getElementById('recommencer').addEventListener('click', function () { self._n = 1; self._rendre() })
    function regA(v) { self._A = borner(Math.round(v), 2, 60); self._a1 = Math.max(self._a1, self._a1Min()); self._n = 1; self._rendre() }
    function regA1(v) { self._a1 = borner(Math.round(v * 2) / 2, self._a1Min(), LMAX); self._n = 1; self._rendre() }
    sh.getElementById('A').addEventListener('input', function (e) { regA(parseFloat(e.target.value)) })
    sh.getElementById('A-moins').addEventListener('click', function () { regA(self._A - 1) })
    sh.getElementById('A-plus').addEventListener('click', function () { regA(self._A + 1) })
    sh.getElementById('a1').addEventListener('input', function (e) { regA1(parseFloat(e.target.value)) })
    sh.getElementById('a1-moins').addEventListener('click', function () { regA1(self._a1 - 0.5) })
    sh.getElementById('a1-plus').addEventListener('click', function () { regA1(self._a1 + 0.5) })
    this._rendre()
  }

  /** Plus petite longueur a₁ (au pas de 0,5) pour que la largeur A/a₁ tienne dans le cadre. */
  _a1Min() { return Math.max(0.5, Math.ceil((this._A / HMAX) * 2 - 1e-9) / 2) }

  _suite() {
    var t = [this._a1]
    for (var k = 1; k < this._n; k++) { var a = t[k - 1]; t.push((a + this._A / a) / 2) }
    return t
  }

  _rendre() {
    var sh = this._sh, A = this._A, n = this._n, suite = this._suite(), rac = Math.sqrt(A)
    var inA1 = sh.getElementById('a1')
    inA1.min = String(this._a1Min())
    majCurseur(sh, 'A', A, 'A=' + A)
    majCurseur(sh, 'a1', this._a1, 'a_1=' + texNb(this._a1, 1))
    sh.getElementById('suivant').disabled = n >= NMAX
    sh.getElementById('precedent').disabled = n <= 1
    var entier = Math.abs(Math.round(rac) * Math.round(rac) - A) < 1e-9

    // ---------- Figure ----------
    var svg = sh.getElementById('svg')
    svg.innerHTML = ''
    R.fond(svg, 'cadre-heron')
    var g = R.groupe(svg, 'cadre-heron')
    function rect(L, l, cls) {
      var p = R.px(0, l), q = R.px(L, 0)
      el('rect', { x: p[0].toFixed(1), y: p[1].toFixed(1), width: (q[0] - p[0]).toFixed(1), height: (q[1] - p[1]).toFixed(1), class: cls }, g)
    }
    var c = R.px(rac, rac)
    el('rect', { x: R.x0, y: c[1].toFixed(1), width: (c[0] - R.x0).toFixed(1), height: (R.y1 - c[1]).toFixed(1), class: 'carre-cible' }, g)
    for (var k = 0; k < n - 1; k++) rect(suite[k], A / suite[k], 'rect-ancien')
    var an = suite[n - 1], ln = A / an
    rect(an, ln, 'rect-courant')
    // étiquettes du rectangle courant : longueur au-dessus du coin haut droit, largeur à droite du côté droit
    var coin = R.px(an, ln)
    texte(svg, coin[0] - 4, Math.max(R.y0 + 13, coin[1] - 6), nb(an, 3), 'et et-acc', 'end')
    var cote = R.px(an, ln / 2), aDroite = cote[0] + 6 + 44 < R.x1 + R.md
    texte(svg, aDroite ? cote[0] + 6 : cote[0] - 6, Math.max(coin[1] + 14, cote[1] + 4), nb(ln, 3), 'et et-acc', aDroite ? 'start' : 'end')
    texte(svg, c[0] + 4, Math.max(R.y0 + 13, c[1] - 6), '√' + A, 'et et-good', 'start')
    svg.setAttribute('aria-label', 'Rectangle ' + n + ' : ' + nb(an, 4) + ' sur ' + nb(ln, 4) + ', aire ' + A + ' ; carré de côté racine de ' + A + ', environ ' + nb(rac, 4))

    // ---------- Verdict : encadrement courant ----------
    var bas = Math.min(an, ln), haut = Math.max(an, ln)
    var sBas = borne(bas, false), sHaut = borne(haut, true)
    var v = sh.getElementById('verdict')
    var egaux = Math.abs(haut - bas) < 1e-12
    if (egaux) {
      v.className = 'verdict ok'
      v.textContent = n === 1
        ? 'Le premier rectangle est déjà un carré : √' + A + ' = ' + nb(an, 9) + ' exactement.'
        : 'Rectangle ' + n + ' : les deux côtés ne diffèrent plus qu’au-delà de la douzième décimale, à la limite de la précision de l’ordinateur (ils ne sont jamais exactement égaux : la longueur reste au-dessus de √' + A + '). √' + A + (entier ? ' = ' + Math.round(rac) : ' ≈ ' + nb(an, 9)) + '.'
    } else {
      v.className = 'verdict ' + (n === 1 ? 'neutre' : 'ok')
      v.innerHTML = 'Rectangle ' + n + ' : ' + chiffres(sBas, 0) + ' &lt; √' + A + ' &lt; ' + chiffres(sHaut, 0) +
        ' (écart entre les côtés ' + (haut - bas >= 1e-6 ? '≈ ' + nb(haut - bas, 6) : '< 0,000 001') + ')'
    }

    // ---------- Tableau des rectangles ----------
    var h = '<p class="titre-panneau">Rectangles d’aire ' + A + ' (bornes à 10⁻⁹ près, chiffres sûrs en vert)</p>'
    h += '<div class="defile"><table class="tableau"><thead><tr><th>n</th><th>longueur ' + tex('a_n') + '</th><th>largeur ' + tex('\\dfrac{' + A + '}{a_n}') + '</th></tr></thead><tbody>'
    for (k = 0; k < n; k++) {
      var a = suite[k], l = A / a, lo = Math.min(a, l), hi = Math.max(a, l)
      var s1 = borne(lo, false), s2 = borne(hi, true), kc = prefixeCommun(s1, s2)
      var sa = a === lo ? s1 : s2, sl = a === lo ? s2 : s1
      h += '<tr' + (k === n - 1 ? ' class="actif"' : '') + '><td>' + (k + 1) + '</td><td class="d">' + chiffres(sa, kc) + '</td><td class="d">' + chiffres(sl, kc) + '</td></tr>'
    }
    h += '</tbody></table></div>'
    if (n >= 2) {
      var ap = suite[n - 2]
      var exA = Math.abs(ap * 1e6 - Math.round(ap * 1e6)) < 1e-6
      h += '<p class="ligne">' + texEgalites(['a_' + n + '=\\dfrac{1}{2}\\left(a_' + (n - 1) + '+\\dfrac{' + A + '}{a_' + (n - 1) + '}\\right)', (exA ? '' : '\\approx ') + '\\dfrac{1}{2}\\left(' + texNb(ap, 6) + '+\\dfrac{' + A + '}{' + texNb(ap, 6) + '}\\right)', '\\approx ' + texNb(an, 6)]) + '</p>'
    } else {
      h += '<p class="ligne">Premier rectangle : ' + tex(texNb(this._a1, 1) + '\\times\\dfrac{' + A + '}{' + texNb(this._a1, 1) + '}') + (this._a1 < rac ? ', la longueur choisie est plus petite que √' + A + ' : c’est la largeur qui dépasse.' : '.') + '</p>'
    }
    h += '<p class="note">Dès le deuxième rectangle, la longueur dépasse √' + A + ' et la largeur reste en dessous : chaque rectangle encadre √' + A + '. Le nombre de chiffres sûrs double à peu près à chaque étape.</p>'
    h += '<p class="note">' + (entier ? 'Ici A est un carré parfait : √' + A + ' = ' + Math.round(rac) + '.' : 'Pour comparer, à 10⁻¹⁰ près : √' + A + ' ≈ ' + nb(rac, 10) + '.') + '</p>'
    sh.getElementById('infos').innerHTML = h
  }
}

if (!customElements.get('heron-rectangles-widget')) customElements.define('heron-rectangles-widget', HeronRectanglesWidget)
