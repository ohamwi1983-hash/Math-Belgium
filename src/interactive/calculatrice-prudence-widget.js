/* ================================================================
 * <calculatrice-prudence-widget> — atelier « Calculatrice… prudence ! »
 * (5e (6h), suites, étape « définir une suite »). La suite définie par
 * u₁ = 1/7 et uₙ₊₁ = 29uₙ − 4 est constante (1/7 est son point fixe :
 * 29 · 1/7 − 4 = 1/7). L'élève tape u₁ arrondi à k décimales
 * (k de 1 à 15) : l'écart eₙ = ũₙ − 1/7 est multiplié par 29 à chaque
 * pas (eₙ₊₁ = 29eₙ), et les termes calculés finissent par s'envoler.
 * Calcul EXACT en entiers (BigInt) : ũₙ = Mₙ / 10ᵏ avec M₁ = arrondi de
 * 10ᵏ/7 et Mₙ₊₁ = 29Mₙ − 4·10ᵏ (ce que ferait une machine sans autre
 * arrondi) — un calcul en virgule flottante ajouterait sa propre
 * erreur, elle aussi multipliée par 29. Graphique à fenêtre FIXE
 * (n de 0 à 20, u de −0,4 à 0,7) ; un terme hors fenêtre est marqué
 * par une flèche au bord. Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, texEgalites, CSS_BASE } from './katex-shadow.js'
import { curseurHTML, majCurseur, borner } from './variables-aleatoires-commun.js'
import { CSS_LIEUX } from './lieux-geometriques-commun.js'
import { CSS_STAT, el, texte, repereStat } from './statistique-deux-variables-commun.js'
import { CSS_RS, nb, texSci, txtSci, indice } from './nombres-reels-suites-commun.js'

var NMAX = 20
var R = repereStat({ xMin: 0, xMax: NMAX + 0.6, yMin: -0.4, yMax: 0.7, ux: 20, uy: 280, pasX: 2, pasY: 0.1, grilleX: 1, nomX: 'n', nomY: 'ũₙ', mg: 40, mb: 40, md: 14, etiqX: function (v) { return v > NMAX ? '' : nb(v, 0) }, etiqY: function (v) { return nb(v, 1) } })
var SEPT = 7n, VINGTNEUF = 29n

/** Puissance de 10 en BigInt. */
function p10(k) { var r = 1n; for (var i = 0; i < k; i++) r *= 10n; return r }
/** Termes M₁…M_N (BigInt) : ũₙ = Mₙ / 10ᵏ. */
function termes(k, N) {
  var d = p10(k), M = [(d + 3n) / SEPT] // arrondi de 10ᵏ/7 (le reste n'est jamais 3,5)
  for (var i = 1; i < N; i++) M.push(VINGTNEUF * M[i - 1] - 4n * d)
  return M
}
/** Écriture décimale exacte de M / 10ᵏ (texte courant, virgule, « − »), ou null si trop longue. */
function decimalExact(M, k) {
  var neg = M < 0n, a = neg ? -M : M, s = a.toString()
  while (s.length <= k) s = '0' + s
  var ent = s.slice(0, s.length - k), dec = s.slice(s.length - k)
  if (ent.length > 7) return null
  if (ent.length > 3) ent = ent.replace(/\B(?=(\d{3})+$)/g, ' ')
  return (neg ? '−' : '') + ent + (k ? ',' + dec : '')
}
/** Valeur approchée (Number) de M / 10ᵏ, sans perte pour l'ordre de grandeur. */
function approx(M, k) { return Number(M) / Math.pow(10, k) }

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE + CSS_LIEUX + CSS_STAT + CSS_RS +
  '.cible{stroke:var(--good,#2f7a4f);stroke-width:1.8;stroke-dasharray:6 4;}' +
  '.pt-proche{fill:var(--good,#2f7a4f);}.pt-loin{fill:var(--bad,#b23a3a);}' +
  '.sortie{fill:var(--bad,#b23a3a);}' +
  '.tableau td.d{white-space:nowrap;}' +
  '</style>' +
  '<p class="consigne">On tape u₁ = 1⁄7 arrondi à k décimales, puis on calcule uₙ₊₁ = 29uₙ − 4. Avec la valeur exacte, tous les termes vaudraient 1⁄7.</p>' +
  '<div class="figure"><svg id="svg" viewBox="0 0 ' + R.L.toFixed(0) + ' ' + R.H.toFixed(0) + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Termes calculés de la suite"></svg></div>' +
  '<p class="verdict neutre" id="verdict" aria-live="polite"></p>' +
  '<div class="reglages">' + curseurHTML('k', 'Nombre de décimales de u₁', 1, 15, 1) + curseurHTML('N', 'Nombre de termes calculés', 1, NMAX, 1) + '</div>' +
  '<div class="panneau" id="infos" aria-live="polite"></div>'

class CalculatricePrudenceWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._k = 6
    this._N = 8
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    function lier(id, cle, min, max) {
      function regler(v) { self[cle] = borner(Math.round(v), min, max); self._rendre() }
      sh.getElementById(id).addEventListener('input', function (e) { regler(parseFloat(e.target.value)) })
      sh.getElementById(id + '-moins').addEventListener('click', function () { regler(self[cle] - 1) })
      sh.getElementById(id + '-plus').addEventListener('click', function () { regler(self[cle] + 1) })
    }
    lier('k', '_k', 1, 15)
    lier('N', '_N', 1, NMAX)
    this._rendre()
  }

  _rendre() {
    var sh = this._sh, k = this._k, N = this._N
    majCurseur(sh, 'k', k, 'k=' + k)
    majCurseur(sh, 'N', N, 'n\\leq ' + N)
    var M = termes(k, NMAX), d = p10(k)
    // écart eₙ = (7Mₙ − 10ᵏ) / (7·10ᵏ) = 29ⁿ⁻¹ e₁, en Number pour l'ordre de grandeur
    var e1num = SEPT * M[0] - d
    function ecart(i) { return Number(e1num) * Math.pow(29, i) / (7 * Math.pow(10, k)) }
    var premierLoin = -1
    for (var i = 0; i < NMAX; i++) if (Math.abs(ecart(i)) > 0.01) { premierLoin = i + 1; break }

    // ---------- Figure ----------
    var svg = sh.getElementById('svg')
    svg.innerHTML = ''
    R.fond(svg, 'cadre-prud')
    var g = R.groupe(svg, 'cadre-prud')
    var y7 = R.px(0, 1 / 7)[1]
    el('line', { x1: R.x0, y1: y7.toFixed(1), x2: R.x1, y2: y7.toFixed(1), class: 'cible' }, g)
    texte(svg, R.x1 - 4, y7 - 7, 'point fixe 1⁄7', 'et et-good et-petit', 'end')
    for (i = 0; i < N; i++) {
      var u = approx(M[i], k), x = R.px(i + 1, 0)[0], loin = Math.abs(ecart(i)) > 0.01
      if (u > R.o.yMax) el('path', { d: 'M' + x.toFixed(1) + ',' + (R.y0 + 1) + ' l-6,11 h12 z', class: 'sortie' }, svg)
      else if (u < R.o.yMin) el('path', { d: 'M' + x.toFixed(1) + ',' + (R.y1 - 1) + ' l-6,-11 h12 z', class: 'sortie' }, svg)
      else el('circle', { cx: x.toFixed(1), cy: R.px(0, u)[1].toFixed(1), r: 4.5, class: loin ? 'pt-loin' : 'pt-proche' }, svg)
    }
    svg.setAttribute('aria-label', N + ' termes calculés avec u₁ arrondi à ' + k + ' décimales' + (premierLoin > 0 && premierLoin <= N ? ' ; à partir du terme ' + premierLoin + ', ils s’écartent de 1⁄7 de plus de 0,01' : ''))

    // ---------- Verdict ----------
    var v = sh.getElementById('verdict')
    if (premierLoin > 0 && premierLoin <= N) {
      v.className = 'verdict ko'
      v.textContent = 'À partir de u' + indice(premierLoin) + ', les termes calculés s’écartent de 1⁄7 de plus de 0,01 ; ũ' + indice(N) + ' ≈ ' + txtSci(approx(M[N - 1], k), 2, 4) + '.'
    } else {
      v.className = 'verdict ok'
      v.textContent = premierLoin > 0
        ? 'Jusqu’à u' + indice(N) + ', les termes calculés restent proches de 1⁄7… mais l’écart grandit : à partir de u' + indice(premierLoin) + ', il dépassera 0,01.'
        : 'Les ' + N + ' termes restent proches de 1⁄7.'
    }

    // ---------- Panneau ----------
    var h = '<p class="titre-panneau">Le point fixe et l’écart</p>'
    h += '<p class="ligne">' + texEgalites(['29\\cdot\\dfrac{1}{7}-4', '\\dfrac{29-28}{7}', '\\dfrac{1}{7}']) + ' : avec ' + tex('u_1=\\dfrac{1}{7}') + ' exactement, la suite est constante.</p>'
    h += '<p class="ligne">Avec ' + tex('\\tilde u_1=' + decimalExact(M[0], k).replace(',', '{,}')) + ', l’écart vaut ' + tex('e_1=\\tilde u_1-\\dfrac{1}{7}\\approx ' + texSci(ecart(0), 2)) + '.</p>'
    h += '<p class="ligne">' + texEgalites(['e_{n+1}=\\tilde u_{n+1}-\\dfrac{1}{7}', '(29\\tilde u_n-4)-\\left(29\\cdot\\dfrac{1}{7}-4\\right)', '29\\,e_n']) + ' : l’écart est multiplié par ' + tex('29') + ' à chaque pas, ' + tex('e_n=29^{n-1}e_1') + '.</p>'
    h += '<div class="defile"><table class="tableau"><thead><tr><th>n</th><th>ũₙ calculé</th><th>écart ' + tex('e_n') + '</th></tr></thead><tbody>'
    for (i = 0; i < N; i++) {
      var ex = decimalExact(M[i], k), ap = approx(M[i], k)
      var cell = ex !== null && Math.abs(ap) < 10 ? ex : Math.abs(ap) < 1e6 ? '≈ ' + nb(ap, 4) : '≈ ' + txtSci(ap, 3)
      h += '<tr' + (premierLoin === i + 1 ? ' class="actif"' : '') + '><td>' + (i + 1) + '</td><td class="d">' + cell + '</td><td class="d">' + tex('\\approx ' + texSci(ecart(i), 2, 4)) + '</td></tr>'
    }
    h += '</tbody></table></div>'
    h += '<p class="note">Une calculatrice garde une quinzaine de chiffres : même si on tape la fraction, elle travaille avec 1⁄7 arrondi, comme ici avec k = 15. Avec 15 décimales, l’écart de départ vaut environ 1,4 · 10⁻¹⁶, mais 29¹⁰ ≈ 4,2 · 10¹⁴ : vers le onzième terme, il devient visible.</p>'
    sh.getElementById('infos').innerHTML = h
  }
}


if (!customElements.get('calculatrice-prudence-widget')) customElements.define('calculatrice-prudence-widget', CalculatricePrudenceWidget)
