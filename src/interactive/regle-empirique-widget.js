/* ================================================================
 * <regle-empirique-widget> — atelier « Règle empirique » (6e, ch. 8,
 * § 6, loi normale). Curseurs μ, σ et k (boutons k = 1, 2, 3) : la bande
 * [μ − kσ ; μ + kσ] est tracée sous la cloche de 𝒩(μ ; σ) ; on teinte
 * la bande, ce qui est hors de la bande (2 côtés) ou un seul côté.
 * Pourcentages EXACTS (Φ en double précision, arrondis au centième de
 * pour cent : 68,27 / 95,45 / 99,73 %, un côté 15,87 / 2,28 / 0,13 %,
 * comme le tableau du cours) ; ils ne dépendent que de k, jamais de μ ni
 * de σ (P(μ − kσ ≤ X ≤ μ + kσ) = P(−k ≤ Z ≤ k) = 2Φ(k) − 1). Un côté =
 * 1 − Φ(k), calculé sur la valeur précise (jamais la moitié d'un arrondi).
 * Option « Comparer avec Tchebychev » : minimum garanti 1 − 1/k² pour
 * n'importe quelle loi (rien pour k ≤ 1), en barres. Fenêtre FIXE
 * (x de 0 à 100, ordonnées de 0 à 0,07 : σ de 6 à 20).
 * Couleurs : cloche = encre ; zone teintée et pourcentage choisi =
 * accent ; bornes μ ± kσ = bleu ; Tchebychev = violet.
 * Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, texEgalites, CSS_BASE, svgEl, defsFleche } from './katex-shadow.js'
import { phi, densite, arrondi, texCourt, txtFixe, txtCourt, estExact, curseurHTML, lierCurseur, majCurseur, borner } from './variables-aleatoires-commun.js'

var W = 400, H = 204, GX = 14, DX = 14, HY = 30, BY = 34
var X0 = 0, X1 = 100, YMAX = 0.07
var K_MIN = 0.25, K_MAX = 3.5
function sx(x) { return GX + ((x - X0) / (X1 - X0)) * (W - GX - DX) }
function sy(y) { return H - BY - (y / YMAX) * (H - BY - HY) }
function pct(x) { return txtFixe(100 * x, 2) + ' %' }
function pctTex(x) { return txtFixe(100 * x, 2).replace(',', '{,}') + '\\,\\%' }

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE +
  ':host{text-align:left;}[hidden]{display:none !important;}' +
  '.figure svg{max-width:460px;}' +
  '.cloche{fill:none;stroke:var(--ink,#182430);stroke-width:2;}' +
  '.aire{fill:var(--accent,#b65c1f);opacity:0.32;}' +
  '.borne{stroke:var(--sky,#2f6fb0);stroke-width:2;}' +
  '.moy{stroke:var(--ink-soft,#51626f);stroke-width:1.2;stroke-dasharray:3 3;}' +
  '.et{font-size:11px;font-weight:700;font-family:var(--sans,sans-serif);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3px;}' +
  '.et-b{fill:var(--sky-ink,#1f4e7d);}.et-p{fill:var(--accent-ink,#7a3c11);font-size:12px;}.et-q{fill:var(--ink-soft,#51626f);}' +
  '.reglages{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:0 18px;}' +
  '.curseur .nom{min-width:84px;}' +
  '.zones .btn,.ks .btn{font-size:0.86rem;}' +
  '.calc p{line-height:2;}' +
  '.t-p{color:var(--accent-ink,#7a3c11);font-weight:700;}.t-b{color:var(--sky-ink,#1f4e7d);font-weight:700;}.t-t{color:var(--plan-ink,#443a80);font-weight:700;}' +
  '.barres{margin:4px 0 2px;}' +
  '.barre-l{display:flex;align-items:center;gap:8px;margin:0 0 6px;font-size:0.86rem;}' +
  '.barre-l .nomb{flex:0 0 112px;}' +
  '.piste{flex:1 1 auto;height:16px;background:var(--surface-2,#f7f9fb);border:1px solid var(--line,#ccd8e0);border-radius:2px;position:relative;min-width:60px;}' +
  '.rempli{position:absolute;left:0;top:0;bottom:0;}' +
  '.rempli.n{background:var(--accent,#b65c1f);opacity:0.75;}.rempli.t{background:var(--plan,#5b4ea3);opacity:0.75;}' +
  '.barre-l .v{flex:0 0 68px;text-align:right;font-variant-numeric:tabular-nums;font-weight:700;}' +
  '</style>' +
  '<div class="rangee zones" role="group" aria-label="Zone teintée">' +
  '<button class="btn" data-z="dans">Dans la bande</button><button class="btn" data-z="hors">Hors de la bande</button><button class="btn" data-z="un">D’un seul côté</button></div>' +
  '<div class="figure"><svg id="svg" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cloche de la loi normale, bande de μ − kσ à μ + kσ et pourcentages"></svg></div>' +
  '<div class="panneau calc" id="calc" aria-live="polite"></div>' +
  '<div class="rangee ks" role="group" aria-label="Valeur de k">' +
  '<button class="btn" data-k="1"></button><button class="btn" data-k="2"></button><button class="btn" data-k="3"></button>' +
  '<button class="btn" id="tcheb" aria-pressed="false">Comparer avec Tchebychev</button></div>' +
  '<div class="reglages">' +
  curseurHTML('k', 'Nombre k d’écarts-types', K_MIN, K_MAX, 0.05) +
  curseurHTML('mu', 'Espérance mu', 30, 70, 1) +
  curseurHTML('sigma', 'Écart-type sigma', 6, 20, 0.5) +
  '</div>' +
  '<div class="rangee"><button class="btn" id="cours">Exemple du cours : 𝒩(50 ; 10), k = 2</button></div>'

class RegleEmpiriqueWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._mu = 50; this._sigma = 10; this._k = 2; this._z = 'dans'; this._tcheb = false
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    sh.querySelectorAll('[data-k]').forEach(function (b) {
      b.innerHTML = tex('k=' + b.getAttribute('data-k'))
      b.addEventListener('click', function () { self._k = +b.getAttribute('data-k'); self._rendre() })
    })
    sh.querySelectorAll('[data-z]').forEach(function (b) {
      b.addEventListener('click', function () { self._z = b.getAttribute('data-z'); self._rendre() })
    })
    sh.getElementById('tcheb').addEventListener('click', function () { self._tcheb = !self._tcheb; self._rendre() })
    sh.getElementById('cours').addEventListener('click', function () { self._mu = 50; self._sigma = 10; self._k = 2; self._rendre() })
    lierCurseur(sh, 'k', function () { return self._k }, function (v) { self._k = arrondi(borner(v, K_MIN, K_MAX), 2); self._rendre() }, 0.05)
    lierCurseur(sh, 'mu', function () { return self._mu }, function (v) { self._mu = Math.round(borner(v, 30, 70)); self._rendre() }, 1)
    lierCurseur(sh, 'sigma', function () { return self._sigma }, function (v) { self._sigma = arrondi(borner(v, 6, 20), 1); self._rendre() }, 0.5)
    this._rendre()
  }

  _rendre() {
    var sh = this._sh, mu = this._mu, s = this._sigma, k = this._k, zone = this._z
    majCurseur(sh, 'k', k, 'k=' + texCourt(k, 2))
    majCurseur(sh, 'mu', mu, '\\mu=' + mu)
    majCurseur(sh, 'sigma', s, '\\sigma=' + texCourt(s, 1))
    sh.querySelectorAll('[data-k]').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-k') === k)) })
    sh.querySelectorAll('[data-z]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-z') === zone)) })
    sh.getElementById('tcheb').setAttribute('aria-pressed', String(this._tcheb))
    sh.getElementById('cours').setAttribute('aria-pressed', String(mu === 50 && s === 10 && k === 2))

    var phiK = phi(k), dans = 2 * phiK - 1, hors = 2 * (1 - phiK), un = 1 - phiK
    var a = arrondi(mu - k * s, 4), b = arrondi(mu + k * s, 4)
    var kT = texCourt(k, 2), sT = texCourt(s, 1), aT = texCourt(a, 3), bT = texCourt(b, 3)
    var entier = k === 1 || k === 2 || k === 3

    // ---------- Calculs ----------
    var h = '<p><span class="t-b">Bande</span> ' + texEgalites(['[\\mu-k\\sigma\\,;\\mu+k\\sigma]',
      '[' + mu + '-' + kT + '\\times ' + sT + '\\,;' + mu + '+' + kT + '\\times ' + sT + ']', '[' + aT + '\\,;' + bT + ']']) + '</p>'
    var ligne = function (z, txt, formule) { return '<p>' + (zone === z ? '<span class="t-p">' + txt + '</span>' : txt) + ' : ' + formule + '</p>' }
    h += ligne('dans', 'Dans la bande', texEgalites(['P(' + aT + '\\leq X\\leq ' + bT + ')', 'P(-' + kT + '\\leq Z\\leq ' + kT + ')', '2\\Phi(' + kT + ')-1']) + ' ' + tex('\\approx ' + pctTex(dans)))
    h += ligne('hors', 'Hors de la bande (2 côtés)', texEgalites(['1-\\bigl(2\\Phi(' + kT + ')-1\\bigr)']) + ' ' + tex('\\approx ' + pctTex(hors)))
    h += ligne('un', 'D’un seul côté', texEgalites(['P(X\\geq ' + bT + ')', '1-\\Phi(' + kT + ')']) + ' ' + tex('\\approx ' + pctTex(un)) +
      ', et autant sous ' + tex(aT) + ' (symétrie) : la moitié du « hors de la bande », calculée sur la valeur précise.')
    h += '<p>Ces pourcentages ne dépendent que de ' + tex('k') + ' : change ' + tex('\\mu') + ' ou ' + tex('\\sigma') + ', ils ne bougent pas.' +
      (entier ? ' On retient ' + tex(['68{,}3', '95{,}4', '99{,}7'][k - 1] + '\\,\\%') + ' pour ' + tex('k=' + k) + '.' : '') + '</p>'
    if (this._tcheb) {
      var g = k > 1 ? 1 - 1 / (k * k) : 0
      var gTxt = k > 1 ? (estExact(100 * g, 2) ? '' : '≈ ') + pct(g) : '0 %'
      h += '<div class="barres">' +
        '<div class="barre-l"><span class="nomb">Loi normale</span><span class="piste"><span class="rempli n" style="width:' + (100 * dans).toFixed(2) + '%"></span></span><span class="v">' + pct(dans) + '</span></div>' +
        '<div class="barre-l"><span class="nomb t-t">Tchebychev (au moins)</span><span class="piste"><span class="rempli t" style="width:' + (100 * g).toFixed(2) + '%"></span></span><span class="v">' + gTxt + '</span></div></div>'
      h += '<p><span class="t-t">Tchebychev</span> : pour <strong>n’importe quelle</strong> loi, au moins ' +
        (k > 1 ? texEgalites(['1-\\dfrac{1}{k^2}', '1-\\dfrac{1}{' + texCourt(k * k, 4) + '}']) + ' ' + tex((estExact(100 * g, 2) ? '=' : '\\approx ') + pctTex(g)) + ' des valeurs sont dans la bande. C’est un minimum garanti : la loi normale fait toujours mieux.'
          : tex('1-\\dfrac{1}{k^2}') + ' des valeurs sont dans la bande ; pour ' + tex('k\\leq 1') + ', cela ne garantit rien.') + '</p>'
    }
    sh.getElementById('calc').innerHTML = h

    // ---------- Figure ----------
    var svg = sh.getElementById('svg')
    svg.innerHTML = ''
    defsFleche(svg)
    var clip = svgEl('clipPath', { id: 'cadre' })
    clip.appendChild(svgEl('rect', { x: GX, y: 0, width: W - GX - DX, height: H - BY }))
    svg.querySelector('defs').appendChild(clip)
    var aire = function (lo, hi) {
      lo = Math.max(lo, X0); hi = Math.min(hi, X1)
      if (hi <= lo) return
      var d = 'M' + sx(lo).toFixed(1) + ',' + sy(0).toFixed(1)
      for (var i = 0; i <= 140; i++) { var x = lo + (hi - lo) * i / 140; d += ' L' + sx(x).toFixed(1) + ',' + sy(densite(x, mu, s)).toFixed(1) }
      d += ' L' + sx(hi).toFixed(1) + ',' + sy(0).toFixed(1) + ' Z'
      svg.appendChild(svgEl('path', { d: d, class: 'aire' }))
    }
    if (zone === 'dans') aire(a, b)
    else if (zone === 'hors') { aire(X0, a); aire(b, X1) } else aire(b, X1)
    var dc = ''
    for (var i = 0; i <= 260; i++) { var x = X0 + (X1 - X0) * i / 260; dc += (i ? ' L' : 'M') + sx(x).toFixed(1) + ',' + sy(densite(x, mu, s)).toFixed(1) }
    svg.appendChild(svgEl('path', { d: dc, class: 'cloche', 'clip-path': 'url(#cadre)' }))
    // μ et bornes
    var hautMu = sy(densite(mu, mu, s))
    svg.appendChild(svgEl('line', { x1: sx(mu), x2: sx(mu), y1: sy(0), y2: hautMu, class: 'moy' }))
    var haut = HY - 4
    ;[a, b].forEach(function (v) {
      if (v < X0 || v > X1) return
      svg.appendChild(svgEl('line', { x1: sx(v), x2: sx(v), y1: sy(0), y2: haut + 8, class: 'borne' }))
    })
    var etiquette = function (x, y, txt, cls, anc) {
      var e = svgEl('text', { x: x, y: y, 'text-anchor': anc || 'middle', class: 'et ' + cls })
      e.textContent = txt
      svg.appendChild(e)
      return e
    }
    // Étiquettes des bornes (hors fenêtre : collées au bord, avec une flèche)
    var xa = Math.max(GX, sx(a)), xb = Math.min(W - DX, sx(b))
    var serre = xb - xa < 112
    etiquette(xa, haut + (serre ? -10 : 2), (a < X0 ? '← ' : '') + 'μ − kσ = ' + txtCourt(a, 3), 'et-b', xa < GX + 60 ? 'start' : serre ? 'end' : 'middle')
    etiquette(xb, haut + 2, 'μ + kσ = ' + txtCourt(b, 3) + (b > X1 ? ' →' : ''), 'et-b', xb > W - DX - 60 ? 'end' : serre ? 'start' : 'middle')
    // Pourcentages
    var yMid = Math.max(HY + 30, Math.min(sy(0) - 14, (sy(0) + hautMu) / 2 + 6))
    etiquette(sx(mu), yMid, pct(dans), zone === 'dans' ? 'et-p' : 'et-q')
    var queue = zone === 'dans' ? 'et-q' : 'et-p'
    var xd = Math.min(W - DX - 4, sx(b) + 30), xg = Math.max(GX + 4, sx(a) - 30)
    if (b < X1 - 2) etiquette(xd, sy(0) - 8, pct(un), queue, xd > W - DX - 40 ? 'end' : 'start')
    if (a > X0 + 2 && zone !== 'un') etiquette(xg, sy(0) - 8, pct(un), queue, xg < GX + 40 ? 'start' : 'end')
    // Axe
    svg.appendChild(svgEl('line', { x1: GX, x2: W - DX + 2, y1: sy(0), y2: sy(0), class: 'axe', 'marker-end': 'url(#fleche)' }))
    for (var v = 0; v <= 100; v += 10) {
      svg.appendChild(svgEl('line', { x1: sx(v), x2: sx(v), y1: sy(0), y2: sy(0) + 4, class: 'tick' }))
      var tl = svgEl('text', { x: sx(v), y: sy(0) + 15, 'text-anchor': v === 0 ? 'start' : v === 100 ? 'end' : 'middle', class: 'tick-label' })
      tl.textContent = String(v)
      svg.appendChild(tl)
    }
    var nx = svgEl('text', { x: W - DX - 2, y: sy(0) + 28, 'text-anchor': 'end', class: 'nom-axe' })
    nx.textContent = 'x'
    svg.appendChild(nx)
    var nm = svgEl('text', { x: sx(mu), y: sy(0) + 28, 'text-anchor': 'middle', class: 'et et-q' })
    nm.textContent = 'μ = ' + mu
    svg.appendChild(nm)
  }
}

if (!customElements.get('regle-empirique-widget')) customElements.define('regle-empirique-widget', RegleEmpiriqueWidget)
