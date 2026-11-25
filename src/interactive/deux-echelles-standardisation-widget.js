/* ================================================================
 * <deux-echelles-standardisation-widget> — atelier « Deux échelles :
 * x et z » (6e, ch. 8, § 6, après la définition de la standardisation).
 * En haut : la cloche de X ∼ 𝒩(μ ; σ) sur une fenêtre FIXE (x de 0 à
 * 100), avec en pointillé la cloche de référence 𝒩(50 ; 10) pour voir
 * l'effet de μ (déplacement) et de σ (largeur, hauteur). Sous l'axe des
 * x, une seconde graduation z = (x − μ)/σ (traits en μ + kσ) : changer
 * de variable, c'est changer de graduation. Des traits relient chaque
 * μ + kσ à la valeur k de l'axe de Z ∼ 𝒩(0 ; 1), dessiné en bas
 * (fenêtre fixe z de −4 à 4). La MÊME aire est teintée sur les deux
 * cloches : P(X ≤ x₀) = P(Z ≤ z₀) (ou ≥). Φ est lu dans la table
 * (z arrondi au centième, 4 décimales), comme au cours.
 * Couleurs : x et sa cloche = accent ; z et sa cloche = bleu (texte de
 * même couleur). Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, texEgalites, CSS_BASE, svgEl, defsFleche } from './katex-shadow.js'
import { densite, arrondi, phiTableSigne, texFixe, texCourt, txtCourt, estExact, curseurHTML, lierCurseur, majCurseur, borner } from './variables-aleatoires-commun.js'

var W = 400, GX = 14, DX = 14
var X0 = 0, X1 = 100, YMAX_X = 0.105
var Z0 = -4, Z1 = 4, YMAX_Z = 0.43
var T_HAUT = 12, T_AXE = 150, Z_STRIP = 184, B_HAUT = 226, B_AXE = 336, H = 356
function sxX(x) { return GX + ((x - X0) / (X1 - X0)) * (W - GX - DX) }
function sxZ(z) { return GX + ((z - Z0) / (Z1 - Z0)) * (W - GX - DX) }
function syX(y) { return T_AXE - (y / YMAX_X) * (T_AXE - T_HAUT) }
function syZ(y) { return B_AXE - (y / YMAX_Z) * (B_AXE - B_HAUT) }

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE +
  ':host{text-align:left;}' +
  '.figure svg{max-width:440px;}' +
  '.c-x{fill:none;stroke:var(--accent,#b65c1f);stroke-width:2.2;}' +
  '.c-ref{fill:none;stroke:var(--ink-faint,#8a97a1);stroke-width:1.4;stroke-dasharray:5 4;}' +
  '.c-z{fill:none;stroke:var(--sky,#2f6fb0);stroke-width:2.2;}' +
  '.a-x{fill:var(--accent,#b65c1f);opacity:0.3;}.a-z{fill:var(--sky,#2f6fb0);opacity:0.3;}' +
  '.lien{stroke:var(--sky,#2f6fb0);stroke-width:1;stroke-dasharray:2 3;opacity:0.8;}' +
  '.axe-z{stroke:var(--sky,#2f6fb0);stroke-width:1.3;}' +
  '.tick-z{stroke:var(--sky,#2f6fb0);stroke-width:1.4;}' +
  '.lab-z{font-size:10.5px;fill:var(--sky-ink,#1f4e7d);font-family:var(--sans,sans-serif);font-weight:700;paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3px;}' +
  '.m-x{stroke:var(--accent-ink,#7a3c11);stroke-width:2;}.m-z{stroke:var(--sky-ink,#1f4e7d);stroke-width:2;}' +
  '.et{font-size:11px;font-weight:700;font-family:var(--sans,sans-serif);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3px;}' +
  '.et-x{fill:var(--accent-ink,#7a3c11);}.et-z{fill:var(--sky-ink,#1f4e7d);}.et-r{fill:var(--ink-soft,#51626f);font-weight:600;}' +
  '.t-x{color:var(--accent-ink,#7a3c11);font-weight:700;}.t-z{color:var(--sky-ink,#1f4e7d);font-weight:700;}' +
  '.reglages{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:0 18px;}' +
  '.curseur .nom{min-width:86px;}' +
  '.modes .btn{font-size:0.88rem;}' +
  '.calc p{line-height:2;}' +
  '.legende{display:flex;flex-wrap:wrap;gap:4px 14px;justify-content:center;font-size:0.84rem;margin:0 0 6px;}' +
  '.legende span{display:inline-flex;align-items:center;gap:6px;}.legende i{display:inline-block;width:18px;height:0;border-top:2.5px solid;}' +
  '.l-x{border-color:var(--accent,#b65c1f);}.l-z{border-color:var(--sky,#2f6fb0);}.l-ref{border-top:2px dashed var(--ink-faint,#8a97a1) !important;}' +
  '</style>' +
  '<div class="legende"><span><i class="l-x"></i>' + 'loi de X' + '</span><span><i class="l-ref"></i>référence 𝒩(50 ; 10)</span><span><i class="l-z"></i>loi de Z</span></div>' +
  '<div class="figure"><svg id="svg" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="En haut la loi de X avec ses deux graduations x et z, en bas la loi normale centrée réduite"></svg></div>' +
  '<div class="rangee modes" role="group" aria-label="Événement"><button class="btn" data-m="le"></button><button class="btn" data-m="ge"></button>' +
  '<button class="btn" id="cours">Exemple du cours</button></div>' +
  '<div class="reglages">' +
  curseurHTML('mu', 'Espérance mu', 25, 75, 1) +
  curseurHTML('sigma', 'Écart-type sigma', 4, 25, 0.5) +
  curseurHTML('x', 'Valeur x0', 0, 100, 0.5) +
  '</div>' +
  '<div class="panneau calc" id="calc" aria-live="polite"></div>'

class DeuxEchellesStandardisationWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._mu = 50; this._s = 10; this._x = 65; this._m = 'le'
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    sh.querySelector('[data-m="le"]').innerHTML = tex('P(X\\leq x_0)')
    sh.querySelector('[data-m="ge"]').innerHTML = tex('P(X\\geq x_0)')
    sh.querySelectorAll('[data-m]').forEach(function (b) { b.addEventListener('click', function () { self._m = b.getAttribute('data-m'); self._rendre() }) })
    sh.getElementById('cours').addEventListener('click', function () { self._mu = 50; self._s = 10; self._x = 65; self._m = 'le'; self._rendre() })
    lierCurseur(sh, 'mu', function () { return self._mu }, function (v) { self._mu = Math.round(borner(v, 25, 75)); self._rendre() }, 1)
    lierCurseur(sh, 'sigma', function () { return self._s }, function (v) { self._s = arrondi(borner(v, 4, 25), 1); self._rendre() }, 0.5)
    lierCurseur(sh, 'x', function () { return self._x }, function (v) { self._x = arrondi(borner(v, 0, 100), 1); self._rendre() }, 0.5)
    this._rendre()
  }

  _rendre() {
    var sh = this._sh, mu = this._mu, s = this._s, x0 = this._x, m = this._m
    majCurseur(sh, 'mu', mu, '\\mu=' + mu)
    majCurseur(sh, 'sigma', s, '\\sigma=' + texCourt(s, 1))
    majCurseur(sh, 'x', x0, 'x_0=' + texCourt(x0, 1))
    sh.querySelectorAll('[data-m]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-m') === m)) })
    sh.getElementById('cours').setAttribute('aria-pressed', String(mu === 50 && s === 10 && x0 === 65 && m === 'le'))
    var zEx = (x0 - mu) / s, z2 = arrondi(zEx, 2), exactZ = estExact(zEx, 2)
    var phiV = phiTableSigne(z2), P = m === 'le' ? phiV : arrondi(1 - phiV, 4)

    // ---------- Calcul ----------
    var xT = texCourt(x0, 1), sT = texCourt(s, 1), zT = texFixe(z2, 2)
    var h = '<p><span class="t-z">Standardiser</span> : ' + texEgalites(['z_0', '\\dfrac{x_0-\\mu}{\\sigma}', '\\dfrac{' + xT + '-' + mu + '}{' + sT + '}']) + ' ' + tex((exactZ ? '=' : '\\approx ') + texCourt(zEx, 2)) + '</p>'
    var lecture = z2 >= 0 ? ['\\Phi(' + zT + ')', '\\approx ' + texFixe(phiV, 4)] : ['\\Phi(' + zT + ')', '1-\\Phi(' + texFixe(-z2, 2) + ')', '\\approx ' + texFixe(phiV, 4)]
    if (m === 'le') h += '<p>' + texEgalites(['P(X\\leq ' + xT + ')', 'P(Z\\leq ' + zT + ')'].concat(lecture)) + '</p>'
    else h += '<p>' + texEgalites(['P(X\\geq ' + xT + ')', 'P(Z\\geq ' + zT + ')', '1-\\Phi(' + zT + ')', '\\approx ' + texFixe(P, 4)]) + '</p>'
    if (Math.abs(z2) > 3.99) h += '<p>' + tex('|z_0|>3{,}99') + ' : hors de la table, la probabilité vaut ' + tex(texFixe(P, 4)) + ' à 4 décimales.</p>'
    h += '<p>Les deux aires teintées sont égales : <span class="t-x">en x</span> pour ' + tex('X') + ', <span class="t-z">en z</span> pour ' + tex('Z') + '. Standardiser, c’est seulement lire l’axe avec une autre graduation.</p>'
    var hautSommet = 1 / (s * Math.sqrt(2 * Math.PI))
    h += '<p>Effet de ' + tex('\\sigma') + ' : sommet à la hauteur ' + tex('\\dfrac{1}{\\sigma\\sqrt{2\\pi}}\\approx ' + texFixe(hautSommet, 4)) + '. ' +
      (s > 10 ? 'Plus large et plus basse que la cloche de référence 𝒩(50 ; 10) en pointillé' : s < 10 ? 'Plus étroite et plus haute que la cloche de référence 𝒩(50 ; 10) en pointillé' : 'Même largeur que la cloche de référence 𝒩(50 ; 10)') + ' ; l’aire totale vaut toujours 1.</p>'
    sh.getElementById('calc').innerHTML = h

    // ---------- Figure ----------
    var svg = sh.getElementById('svg')
    svg.innerHTML = ''
    defsFleche(svg)
    var clip = svgEl('clipPath', { id: 'cadre' })
    clip.appendChild(svgEl('rect', { x: GX, y: 0, width: W - GX - DX, height: T_AXE }))
    svg.querySelector('defs').appendChild(clip)
    var i, t, k, e
    var aire = function (lo, hi, fx, fy, f, cls) {
      if (hi <= lo) return
      var p = 'M' + fx(lo).toFixed(1) + ',' + fy(0).toFixed(1)
      for (i = 0; i <= 140; i++) { t = lo + (hi - lo) * i / 140; p += ' L' + fx(t).toFixed(1) + ',' + fy(f(t)).toFixed(1) }
      p += ' L' + fx(hi).toFixed(1) + ',' + fy(0).toFixed(1) + ' Z'
      svg.appendChild(svgEl('path', { d: p, class: cls, 'clip-path': cls === 'a-x' ? 'url(#cadre)' : '' }))
    }
    var fX = function (x) { return densite(x, mu, s) }, fZ = function (z) { return densite(z, 0, 1) }
    // Aires
    var xBorne = borner(x0, X0, X1), zBorne = borner(zEx, Z0, Z1)
    if (m === 'le') { aire(X0, xBorne, sxX, syX, fX, 'a-x'); aire(Z0, zBorne, sxZ, syZ, fZ, 'a-z') } else { aire(xBorne, X1, sxX, syX, fX, 'a-x'); aire(zBorne, Z1, sxZ, syZ, fZ, 'a-z') }
    // Courbes
    var trace = function (a, b, fx, fy, f, cls, clipId) {
      var p = ''
      for (i = 0; i <= 240; i++) { t = a + (b - a) * i / 240; p += (i ? ' L' : 'M') + fx(t).toFixed(1) + ',' + fy(f(t)).toFixed(1) }
      svg.appendChild(svgEl('path', { d: p, class: cls, 'clip-path': clipId || '' }))
    }
    trace(X0, X1, sxX, syX, function (x) { return densite(x, 50, 10) }, 'c-ref', 'url(#cadre)')
    trace(X0, X1, sxX, syX, fX, 'c-x', 'url(#cadre)')
    trace(Z0, Z1, sxZ, syZ, fZ, 'c-z')
    // Axe des x et graduations
    svg.appendChild(svgEl('line', { x1: GX, x2: W - DX + 2, y1: T_AXE, y2: T_AXE, class: 'axe', 'marker-end': 'url(#fleche)' }))
    for (var v = 0; v <= 100; v += 10) {
      svg.appendChild(svgEl('line', { x1: sxX(v), x2: sxX(v), y1: T_AXE, y2: T_AXE + 4, class: 'tick' }))
      if (v % 20 === 0) { e = svgEl('text', { x: sxX(v), y: T_AXE + 15, 'text-anchor': v === 0 ? 'start' : v === 100 ? 'end' : 'middle', class: 'tick-label' }); e.textContent = String(v); svg.appendChild(e) }
    }
    e = svgEl('text', { x: W - DX - 2, y: T_AXE - 6, 'text-anchor': 'end', class: 'nom-axe' }); e.textContent = 'x'; svg.appendChild(e)
    // Seconde graduation z sous l'axe des x
    svg.appendChild(svgEl('line', { x1: GX, x2: W - DX, y1: Z_STRIP, y2: Z_STRIP, class: 'axe-z' }))
    e = svgEl('text', { x: GX, y: Z_STRIP - 5, class: 'lab-z' }); e.textContent = 'z'; svg.appendChild(e)
    for (k = -6; k <= 6; k++) {
      var xk = mu + k * s
      if (xk < X0 || xk > X1) continue
      svg.appendChild(svgEl('line', { x1: sxX(xk), x2: sxX(xk), y1: Z_STRIP - 4, y2: Z_STRIP + 4, class: 'tick-z' }))
      if (k >= -4 && k <= 4) {
        e = svgEl('text', { x: sxX(xk), y: Z_STRIP - 6, 'text-anchor': 'middle', class: 'lab-z' }); e.textContent = String(k).replace('-', '−'); svg.appendChild(e)
        svg.appendChild(svgEl('line', { x1: sxX(xk), y1: Z_STRIP + 4, x2: sxZ(k), y2: B_HAUT - 2, class: 'lien' }))
      }
    }
    // Axe de Z (bas)
    svg.appendChild(svgEl('line', { x1: GX, x2: W - DX + 2, y1: B_AXE, y2: B_AXE, class: 'axe', 'marker-end': 'url(#fleche)' }))
    for (k = -4; k <= 4; k++) {
      svg.appendChild(svgEl('line', { x1: sxZ(k), x2: sxZ(k), y1: B_AXE, y2: B_AXE + 4, class: 'tick' }))
      if (Math.abs(k) <= 3) { e = svgEl('text', { x: sxZ(k), y: B_AXE + 15, 'text-anchor': 'middle', class: 'tick-label' }); e.textContent = String(k).replace('-', '−'); svg.appendChild(e) }
    }
    e = svgEl('text', { x: W - DX - 2, y: B_AXE - 6, 'text-anchor': 'end', class: 'nom-axe' }); e.textContent = 'z'; svg.appendChild(e)
    e = svgEl('text', { x: GX, y: B_HAUT + 4, class: 'et et-z' }); e.textContent = 'Z ∼ 𝒩(0 ; 1)'; svg.appendChild(e)
    // Repères x₀ et z₀
    var repere = function (X, y1, y2, cls, txt, yT) {
      svg.appendChild(svgEl('line', { x1: X, x2: X, y1: y1, y2: y2, class: 'm-' + cls }))
      var anc = X < GX + 44 ? 'start' : X > W - DX - 44 ? 'end' : 'middle'
      var et = svgEl('text', { x: X, y: yT, 'text-anchor': anc, class: 'et et-' + cls }); et.textContent = txt; svg.appendChild(et)
    }
    if (x0 >= X0 && x0 <= X1) repere(sxX(x0), T_AXE, T_HAUT + 22, 'x', 'x₀ = ' + txtCourt(x0, 1), T_HAUT + 18)
    if (zEx >= Z0 && zEx <= Z1) repere(sxZ(zEx), B_AXE, B_HAUT + 20, 'z', 'z₀ ' + (exactZ ? '= ' : '≈ ') + txtCourt(zEx, 2), B_HAUT + 16)
    else { e = svgEl('text', { x: zEx < Z0 ? GX + 4 : W - DX - 4, y: B_HAUT + 22, 'text-anchor': zEx < Z0 ? 'start' : 'end', class: 'et et-z' }); e.textContent = 'z₀ hors du cadre'; svg.appendChild(e) }
  }
}

if (!customElements.get('deux-echelles-standardisation-widget')) customElements.define('deux-echelles-standardisation-widget', DeuxEchellesStandardisationWidget)
