/* ================================================================
 * <phi-intervalles-widget> — atelier « Des intervalles emboîtés
 * autour de Φ » (5e (6h), nombres réels, étape « axiomes »). Les
 * rapports rₖ = Fₖ₊₁ / Fₖ de deux termes consécutifs de la suite de
 * Fibonacci (1, 2, 3/2, 5/3, 8/5…) sont placés un à un sur la droite :
 * en vert sous Φ, en rouge au-dessus (ils alternent). Deux rapports
 * consécutifs forment l'intervalle Iₖ = [rₖ ; rₖ₊₁] (bornes rangées),
 * qui contient Φ, est emboîté dans le précédent et a pour longueur
 * 1 / (Fₖ·Fₖ₊₁) (à recouper : rₖ₊₁ − rₖ = ±1 / (FₖFₖ₊₁)). Zoom par
 * boutons (×1 à ×10 000) : chaque niveau a sa fenêtre FIXE, centrée
 * sur Φ, jamais recalée sur le nombre de rapports. Les six derniers
 * intervalles sont empilés sous la droite.
 * Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, texIntervalle, CSS_BASE } from './katex-shadow.js'
import { CSS_LIEUX } from './lieux-geometriques-commun.js'
import { CSS_STAT, el, texte } from './statistique-deux-variables-commun.js'
import { CSS_RS, nb, texNb, indice, droiteGraduee } from './nombres-reels-suites-commun.js'

var PHI = (1 + Math.sqrt(5)) / 2
var F = [0, 1, 1]
for (var j = 3; j <= 40; j++) F.push(F[j - 1] + F[j - 2])
/** rₖ = Fₖ₊₁ / Fₖ (k ≥ 1). */
function r(k) { return F[k + 1] / F[k] }
var NMIN = 2, NMAX = 24, LIGNES = 6
var ZOOMS = [1, 10, 100, 1000, 10000]
var L = 460, X0 = 20, X1 = 426, YD = 46, Y_LIGNES = 92, PAS_LIGNE = 27
var H = Y_LIGNES + LIGNES * PAS_LIGNE + 4

/** Fenêtre du niveau de zoom z : centrée sur Φ, demi-largeur 0,7 / 10ᶻ ; graduations 10⁻¹⁻ᶻ, écrites tous les 2 pas. */
function fenetre(z) {
  var h = 0.7 / ZOOMS[z], pas = 0.1 / ZOOMS[z]
  return { min: PHI - h, max: PHI + h, pas: pas, etiqPas: 2 * pas, dec: z + 1 }
}
function fracTxt(k) { return F[k] === 1 ? String(F[k + 1]) : F[k + 1] + '⁄' + F[k] }
function fracTex(k) { return F[k] === 1 ? String(F[k + 1]) : '\\dfrac{' + F[k + 1] + '}{' + F[k] + '}' }

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE + CSS_LIEUX + CSS_STAT + CSS_RS +
  '.figure svg{max-width:520px;}' +
  '.phi{stroke:var(--good,#2f7a4f);stroke-width:1.6;stroke-dasharray:5 4;}' +
  '.bar{stroke:var(--ink-soft,#51626f);stroke-width:5;stroke-linecap:butt;stroke-opacity:0.55;}' +
  '.bar-actif{stroke:var(--accent,#b65c1f);stroke-width:7;stroke-opacity:1;}' +
  '.pt-sous{fill:var(--good,#2f7a4f);}.pt-sur{fill:var(--bad,#b23a3a);}' +
  '.borne{stroke:var(--ink-soft,#51626f);stroke-width:1.4;}' +
  '.borne-actif{stroke:var(--accent,#b65c1f);stroke-width:2;}' +
  '.zoom .btn{min-width:64px;}' +
  '.et-int{font-size:12.5px;}' +
  '</style>' +
  '<p class="consigne">Ajoute les rapports de Fibonacci un à un : deux rapports consécutifs encadrent Φ. Agrandis la droite pour suivre les intervalles.</p>' +
  '<div class="rangee" role="group" aria-label="Rapports">' +
  '<button class="btn" id="suivant">Rapport suivant</button><button class="btn" id="precedent">Retirer le dernier</button><button class="btn" id="recommencer">Recommencer</button></div>' +
  '<div class="figure"><svg id="svg" viewBox="0 0 ' + L + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Rapports de Fibonacci et intervalles emboîtés autour de phi"></svg></div>' +
  '<div class="rangee zoom" role="group" aria-label="Agrandissement de la droite"><span class="etiquette">Agrandir :</span>' +
  ZOOMS.map(function (zz, i) { return '<button class="btn" data-z="' + i + '">×' + nb(zz, 0) + '</button>' }).join('') + '</div>' +
  '<p class="verdict neutre" id="verdict" aria-live="polite"></p>' +
  '<div class="panneau" id="infos" aria-live="polite"></div>'

class PhiIntervallesWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._n = 2
    this._z = 0
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    sh.getElementById('suivant').addEventListener('click', function () { if (self._n < NMAX) { self._n++; self._rendre() } })
    sh.getElementById('precedent').addEventListener('click', function () { if (self._n > NMIN) { self._n--; self._rendre() } })
    sh.getElementById('recommencer').addEventListener('click', function () { self._n = NMIN; self._z = 0; self._rendre() })
    sh.querySelectorAll('[data-z]').forEach(function (b) { b.addEventListener('click', function () { self._z = +b.getAttribute('data-z'); self._rendre() }) })
    this._rendre()
  }

  _rendre() {
    var sh = this._sh, n = this._n, z = this._z, W = fenetre(z)
    sh.getElementById('suivant').disabled = n >= NMAX
    sh.getElementById('precedent').disabled = n <= NMIN
    sh.querySelectorAll('[data-z]').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-z') === z)) })
    function px(v) { return X0 + (v - W.min) * (X1 - X0) / (W.max - W.min) }
    function dedans(v) { return v >= W.min - 1e-15 && v <= W.max + 1e-15 }

    // ---------- Figure ----------
    var svg = sh.getElementById('svg')
    svg.innerHTML = ''
    droiteGraduee(svg, { min: W.min, max: W.max, x0: X0, x1: X1, y: YD, pas: W.pas, etiqPas: W.etiqPas, etiq: function (v) { return nb(v, W.dec) } })
    // Φ : verticale pointillée à travers toute la figure
    var pphi = px(PHI)
    el('line', { x1: pphi.toFixed(1), y1: 16, x2: pphi.toFixed(1), y2: H - 4, class: 'phi' }, svg)
    texte(svg, pphi + 5, 14, 'Φ', 'et et-good', 'start')
    // rapports sur la droite (étiquetés s'ils ne se chevauchent pas)
    var horsG = 0, horsD = 0
    for (var k = 1; k <= n; k++) {
      var v = r(k)
      if (!dedans(v)) { if (v < W.min) horsG++; else horsD++; continue }
      var p = px(v)
      el('circle', { cx: p.toFixed(1), cy: YD, r: k === n ? 5.5 : 4, class: v < PHI ? 'pt-sous' : 'pt-sur' }, svg)
    }
    // étiquette du dernier rapport (au-dessus de la droite)
    var vn = r(n)
    if (dedans(vn)) {
      var pn = px(vn), lab = 'r' + indice(n) + ' = ' + fracTxt(n)
      texte(svg, Math.max(X0 + 34, Math.min(X1 - 34, pn)), YD - 13, lab, 'et et-int ' + (vn < PHI ? 'et-good' : 'et-bad'))
    }
    if (horsG) texte(svg, X0, YD - 24, '← ' + horsG + ' hors cadre', 'et et-petit et-soft', 'start')
    if (horsD) texte(svg, X1, YD - 24, horsD + ' hors cadre →', 'et et-petit et-soft', 'end')
    // intervalles empilés (les LIGNES derniers)
    var premier = Math.max(1, n - LIGNES)
    for (k = premier; k <= n - 1; k++) {
      var ligne = k - premier, y = Y_LIGNES + ligne * PAS_LIGNE
      var lo = Math.min(r(k), r(k + 1)), hi = Math.max(r(k), r(k + 1)), actif = k === n - 1
      var kg = r(k) < r(k + 1) ? k : k + 1, kd = kg === k ? k + 1 : k
      texte(svg, X0 - 2, y, 'I' + indice(k) + ' = [' + fracTxt(kg) + ' ; ' + fracTxt(kd) + ']', 'et et-int' + (actif ? ' et-acc' : ' et-soft'), 'start')
      var g = Math.max(px(lo), X0 - 4), d = Math.min(px(hi), X1 + 4)
      var yb = y + 10
      el('line', { x1: g.toFixed(1), y1: yb, x2: Math.max(d, g + 1.2).toFixed(1), y2: yb, class: 'bar' + (actif ? ' bar-actif' : '') }, svg)
      if (dedans(lo)) el('line', { x1: px(lo).toFixed(1), y1: yb - 6, x2: px(lo).toFixed(1), y2: yb + 6, class: 'borne' + (actif ? ' borne-actif' : '') }, svg)
      if (dedans(hi)) el('line', { x1: px(hi).toFixed(1), y1: yb - 6, x2: px(hi).toFixed(1), y2: yb + 6, class: 'borne' + (actif ? ' borne-actif' : '') }, svg)
    }
    svg.setAttribute('aria-label', n + ' rapports de Fibonacci placés ; dernier intervalle I' + (n - 1) + ' de longueur 1 sur ' + nb(F[n - 1] * F[n], 0) + ', agrandissement ×' + nb(ZOOMS[z], 0))

    // ---------- Verdict ----------
    var K = n - 1, lo2 = Math.min(r(K), r(K + 1)), hi2 = Math.max(r(K), r(K + 1)), long = 1 / (F[K] * F[K + 1])
    var largPx = (hi2 - lo2) * (X1 - X0) / (W.max - W.min)
    var vd = sh.getElementById('verdict')
    vd.className = 'verdict neutre'
    var exactV = Math.abs(vn * 1e10 - Math.round(vn * 1e10)) < 1e-4
    vd.textContent = 'r' + indice(n) + ' = ' + fracTxt(n) + (F[n] === 1 ? '' : (exactV ? ' = ' : ' ≈ ') + nb(vn, 10)) + (vn < PHI ? ', sous Φ.' : ', au-dessus de Φ.') +
      (largPx < 3 ? (z < ZOOMS.length - 1 ? ' Le dernier intervalle est trop court pour être vu : agrandis la droite.' : ' Même ×10 000, le dernier intervalle est plus court qu’un pixel.') : '')

    // ---------- Panneau ----------
    var kg2 = r(K) < r(K + 1) ? K : K + 1, kd2 = kg2 === K ? K + 1 : K
    var h = '<p class="titre-panneau">Dernier intervalle</p>'
    h += '<p class="ligne">' + tex('I_{' + K + '}=\\left[' + fracTex(kg2) + '\\,;\\,' + fracTex(kd2) + '\\right]') + (F[kg2] === 1 && F[kd2] === 1 ? '' : ' ; en décimal, à 10⁻¹⁰ près : ' + tex(texIntervalle(texNb(lo2, 10), texNb(hi2, 10)))) + '</p>'
    h += '<p class="ligne">Longueur : ' + tex('\\dfrac{1}{F_{' + K + '}\\cdot F_{' + (K + 1) + '}}=\\dfrac{1}{' + F[K] + '\\cdot ' + F[K + 1] + '}=\\dfrac{1}{' + (F[K] * F[K + 1] >= 1e4 ? String(F[K] * F[K + 1]).replace(/\B(?=(\d{3})+$)/g, '\\,') : F[K] * F[K + 1]) + '}') + (K > 1 ? ' ≈ ' + nb(long, long < 1e-6 ? 12 : 8) : '') + '</p>'
    if (K >= 2) h += '<p class="ligne">' + tex('I_{' + K + '}\\subset I_{' + (K - 1) + '}') + ' : la nouvelle borne ' + tex('r_{' + n + '}') + ' remplace la borne ' + (vn < PHI ? 'gauche' : 'droite') + ' de ' + tex('I_{' + (K - 1) + '}') + '.</p>'
    h += '<p class="note">Φ ≈ 1,6180339887. Tous les intervalles contiennent Φ ; leur longueur tend vers 0. Aucun rationnel n’est dans tous : chaque rationnel finit par sortir d’un intervalle assez court, et le seul point commun, Φ, est irrationnel. L’axiome des intervalles emboîtés garantit que ce point existe dans ℝ.</p>'
    h += '<p class="note">Les intervalles I₁, I₃, I₅, I₇… sont [1 ; 2], [3⁄2 ; 5⁄3], [8⁄5 ; 13⁄8], [21⁄13 ; 34⁄21]…</p>'
    sh.getElementById('infos').innerHTML = h
  }
}

if (!customElements.get('phi-intervalles-widget')) customElements.define('phi-intervalles-widget', PhiIntervallesWidget)
