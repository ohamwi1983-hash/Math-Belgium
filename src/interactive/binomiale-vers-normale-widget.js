/* ================================================================
 * <binomiale-vers-normale-widget> — atelier « Binomiale vers normale »
 * (6e, ch. 8, § 7, approximation d'une loi binomiale par une loi
 * normale). Curseurs n (5 à 200), p (0,05 à 0,95) et k ; type
 * X ≤ k, X ≥ k ou X = k. L'histogramme de 𝓑(n ; p) (barres de largeur 1
 * centrées sur les entiers) se superpose à la cloche de 𝒩(μ ; σ) avec
 * μ = np et σ = √(np(1 − p)). Trois valeurs : P exacte (somme des
 * barres), approchée SANS correction (borne k) et AVEC correction de
 * continuité (borne k ± 0,5 : la barre k va de k − 0,5 à k + 0,5).
 * Φ est lu dans la table (z arrondi au centième, 4 décimales), comme au
 * cours. Conditions du cours (n > 30 ; 0,3 < p < 0,7) en vert ou rouge.
 * Fenêtre : abscisses de −0,5 à n + 0,5 et ordonnées FIXES pour un n
 * donné (indépendantes de p et de k : l'axe ne bouge pas quand on
 * règle p). Couleurs : barres et valeur exacte = bleu ; cloche, aire
 * et valeur corrigée = accent ; borne sans correction = rouge.
 * « Loupe autour de k » : abscisses de k − 8,5 à k + 8,5 (barres larges,
 * bornes k et k ± 0,5 bien séparées). Toucher la figure choisit k.
 * Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, texEgalites, CSS_BASE, svgEl, defsFleche } from './katex-shadow.js'
import { densite, arrondi, phiTableSigne, loiBinomiale, texFixe, texCourt, txtCourt, pasJoli, curseurHTML, lierCurseur, majCurseur, borner } from './variables-aleatoires-commun.js'

var W = 400, H = 232, GX = 40, DX = 14, HY = 14, BY = 30
var N_MIN = 5, N_MAX = 200
var EXEMPLES = [
  { n: 100, p: 0.5, k: 55, t: 'le', nom: 'Exemple du cours', sous: 'n = 100, p = 0,5' },
  { n: 12, p: 0.5, k: 7, t: 'le', nom: 'n petit', sous: 'n = 12, p = 0,5' },
  { n: 50, p: 0.08, k: 3, t: 'le', nom: 'p proche de 0', sous: 'n = 50, p = 0,08' },
  { n: 200, p: 0.2, k: 45, t: 'ge', nom: 'Hors convention', sous: 'n = 200, p = 0,2' },
]
// Ordonnée maximale pour un n : plus haute barre possible (p de 0,05 à 0,95), +12 %.
var YMAX_CACHE = {}
function yMax(n) {
  if (YMAX_CACHE[n]) return YMAX_CACHE[n]
  var m = 0
  for (var i = 5; i <= 95; i++) { var l = loiBinomiale(n, i / 100); for (var k = 0; k <= n; k++) if (l[k] > m) m = l[k] }
  return (YMAX_CACHE[n] = m * 1.12)
}

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE +
  ':host{text-align:left;}[hidden]{display:none !important;}' +
  '.figure svg{max-width:470px;touch-action:none;}' +
  '.barre{fill:var(--sky-soft,#dde9f5);stroke:var(--sky,#2f6fb0);stroke-width:0.8;}' +
  '.barre.ev{fill:var(--sky,#2f6fb0);fill-opacity:0.55;}' +
  '.cloche{fill:none;stroke:var(--accent,#b65c1f);stroke-width:2.2;}' +
  '.aire{fill:var(--accent,#b65c1f);opacity:0.22;}' +
  '.b-sans{stroke:var(--bad,#b23a3a);stroke-width:1.8;stroke-dasharray:5 3;}' +
  '.b-avec{stroke:var(--accent,#b65c1f);stroke-width:2;}' +
  '.et{font-size:11px;font-weight:700;font-family:var(--sans,sans-serif);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3px;}' +
  '.et-sans{fill:var(--bad,#b23a3a);}.et-avec{fill:var(--accent-ink,#7a3c11);}' +
  '.legende{display:flex;flex-wrap:wrap;gap:4px 14px;justify-content:center;font-size:0.84rem;margin:0 0 6px;}' +
  '.legende span{display:inline-flex;align-items:center;gap:6px;}' +
  '.legende i{display:inline-block;width:16px;height:11px;border-radius:2px;}' +
  '.l-bin{background:var(--sky-soft,#dde9f5);border:1.4px solid var(--sky,#2f6fb0);}.l-nor{height:3px !important;background:var(--accent,#b65c1f);}' +
  '.l-sans{height:0 !important;border-top:2px dashed var(--bad,#b23a3a);}' +
  '.reglages{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:0 18px;}' +
  '.curseur .nom{min-width:84px;}' +
  '.types .btn,.exemples .btn{font-size:0.86rem;}' +
  '.exemples .btn small{display:block;font-weight:400;font-size:0.72rem;color:var(--ink-soft,#51626f);}' +
  '.conds{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:0 0 10px;}' +
  '.cond{border-radius:999px;padding:4px 12px;font-size:0.88rem;font-weight:700;border:1.5px solid;}' +
  '.cond.oui{color:var(--good,#2f7a4f);border-color:var(--good,#2f7a4f);background:var(--good-soft,#dcefe2);}' +
  '.cond.non{color:var(--bad,#b23a3a);border-color:var(--bad,#b23a3a);background:var(--bad-soft,#f6dddd);}' +
  '.val{margin:0 0 8px;}' +
  '.val dt{font-weight:700;font-size:0.88rem;margin:6px 0 0;}' +
  '.val dd{margin:0;line-height:2;}' +
  '.t-ex{color:var(--sky-ink,#1f4e7d);}.t-sans{color:var(--bad,#b23a3a);}.t-avec{color:var(--accent-ink,#7a3c11);}' +
  '.ecart{font-size:0.86rem;color:var(--ink-soft,#51626f);font-weight:400;}' +
  '.meilleur{font-weight:700;}' +
  '</style>' +
  '<div class="legende"><span><i class="l-bin"></i>loi binomiale</span><span><i class="l-nor"></i>loi normale</span><span><i class="l-sans"></i>borne sans correction</span></div>' +
  '<div class="figure"><svg id="svg" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Histogramme de la loi binomiale et cloche de la loi normale"></svg></div>' +
  '<div class="conds" id="conds"></div>' +
  '<div class="panneau" id="valeurs" aria-live="polite"></div>' +
  '<div class="rangee types" role="group" aria-label="Événement">' +
  '<button class="btn" data-t="le"></button><button class="btn" data-t="ge"></button><button class="btn" data-t="eq"></button>' +
  '<button class="btn" id="loupe" aria-pressed="false">Loupe autour de k</button></div>' +
  '<div class="reglages">' +
  curseurHTML('n', 'Nombre d’épreuves n', N_MIN, N_MAX, 1) +
  curseurHTML('p', 'Probabilité de succès p', 0.05, 0.95, 0.01) +
  curseurHTML('k', 'Borne k', 0, N_MAX, 1) +
  '</div>' +
  '<div class="rangee exemples" role="group" aria-label="Exemples">' +
  EXEMPLES.map(function (x, i) { return '<button class="btn" data-i="' + i + '">' + x.nom + '<small>' + x.sous + '</small></button>' }).join('') +
  '</div>'

class BinomialeVersNormaleWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._n = 100; this._p = 0.5; this._k = 55; this._t = 'le'; this._loupe = false
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    sh.querySelector('[data-t="le"]').innerHTML = tex('X\\leq k')
    sh.querySelector('[data-t="ge"]').innerHTML = tex('X\\geq k')
    sh.querySelector('[data-t="eq"]').innerHTML = tex('X=k')
    sh.querySelectorAll('[data-t]').forEach(function (b) {
      b.addEventListener('click', function () { self._t = b.getAttribute('data-t'); self._rendre() })
    })
    lierCurseur(sh, 'n', function () { return self._n }, function (v) {
      var ancien = self._n
      self._n = Math.round(borner(v, N_MIN, N_MAX))
      // k suit la même position relative quand n change.
      self._k = Math.round(borner(self._k * self._n / ancien, 0, self._n))
      self._rendre()
    }, 1)
    lierCurseur(sh, 'p', function () { return self._p }, function (v) { self._p = arrondi(borner(v, 0.05, 0.95), 2); self._rendre() }, 0.01)
    lierCurseur(sh, 'k', function () { return self._k }, function (v) { self._k = Math.round(borner(v, 0, self._n)); self._rendre() }, 1)
    sh.querySelectorAll('.exemples .btn').forEach(function (b) {
      b.addEventListener('click', function () {
        var x = EXEMPLES[+b.getAttribute('data-i')]
        self._n = x.n; self._p = x.p; self._k = x.k; self._t = x.t
        self._rendre()
      })
    })
    sh.getElementById('loupe').addEventListener('click', function () { self._loupe = !self._loupe; self._rendre() })
    var svg = sh.getElementById('svg'), appui = false
    var choisir = function (ev) {
      var m = svg.getScreenCTM()
      if (!m) return
      var x = (ev.clientX - m.e) / m.a
      var k = Math.round(self._xl + (x - GX) / (W - GX - DX) * (self._xr - self._xl))
      k = borner(k, 0, self._n)
      if (k !== self._k) { self._k = k; self._rendre() }
    }
    // Pendant un glissement, la fenêtre de la loupe reste figée (sinon elle suivrait k sous le doigt).
    svg.addEventListener('pointerdown', function (ev) { appui = true; self._gel = [self._xl, self._xr]; svg.setPointerCapture(ev.pointerId); choisir(ev) })
    svg.addEventListener('pointermove', function (ev) { if (appui) choisir(ev) })
    var lacher = function () { if (!appui) return; appui = false; self._gel = null; self._rendre() }
    svg.addEventListener('pointerup', lacher)
    svg.addEventListener('pointercancel', lacher)
    this._rendre()
  }

  _rendre() {
    var sh = this._sh, n = this._n, p = this._p, k = this._k, t = this._t
    sh.getElementById('k').max = String(n)
    majCurseur(sh, 'n', n, 'n=' + n)
    majCurseur(sh, 'p', p, 'p=' + texCourt(p, 2))
    majCurseur(sh, 'k', k, 'k=' + k)
    sh.querySelectorAll('[data-t]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-t') === t)) })
    sh.querySelectorAll('.exemples .btn').forEach(function (b) {
      var x = EXEMPLES[+b.getAttribute('data-i')]
      b.setAttribute('aria-pressed', String(x.n === n && x.p === p && x.k === k && x.t === t))
    })

    var loi = loiBinomiale(n, p), mu = n * p, s2 = n * p * (1 - p), sigma = Math.sqrt(s2)
    var dans = function (j) { return t === 'le' ? j <= k : t === 'ge' ? j >= k : j === k }
    var exacte = 0
    for (var j = 0; j <= n; j++) if (dans(j)) exacte += loi[j]

    // ---------- Approximations (table de Φ, z au centième) ----------
    var z = function (x) { return arrondi((x - mu) / sigma, 2) }
    var muTex = texCourt(mu, 2), sigTex = texCourt(sigma, 4), sigEx = Math.abs(sigma - arrondi(sigma, 4)) < 1e-9
    var phiZ = function (x) { return phiTableSigne(z(x)) }
    var zTex = function (x, aff) { return '\\dfrac{' + aff + '-' + muTex + '}{' + sigTex + '}' }
    var sans, avec, sansL, avecL, borneSans, borneAvec
    var P = t === 'le' ? 'P(X\\leq ' + k + ')' : t === 'ge' ? 'P(X\\geq ' + k + ')' : 'P(X=' + k + ')'
    if (t === 'le') {
      sans = phiZ(k); avec = phiZ(k + 0.5)
      sansL = [P, '\\Phi\\!\\left(' + zTex(k, String(k)) + '\\right)', '\\Phi(' + texFixe(z(k), 2) + ')', texFixe(sans, 4)]
      avecL = [P, '\\Phi\\!\\left(' + zTex(k + 0.5, texCourt(k + 0.5, 1)) + '\\right)', '\\Phi(' + texFixe(z(k + 0.5), 2) + ')', texFixe(avec, 4)]
      borneSans = [k]; borneAvec = [k + 0.5]
    } else if (t === 'ge') {
      sans = arrondi(1 - phiZ(k), 4); avec = arrondi(1 - phiZ(k - 0.5), 4)
      sansL = [P, '1-\\Phi\\!\\left(' + zTex(k, String(k)) + '\\right)', '1-\\Phi(' + texFixe(z(k), 2) + ')', texFixe(sans, 4)]
      avecL = [P, '1-\\Phi\\!\\left(' + zTex(k - 0.5, texCourt(k - 0.5, 1)) + '\\right)', '1-\\Phi(' + texFixe(z(k - 0.5), 2) + ')', texFixe(avec, 4)]
      borneSans = [k]; borneAvec = [k - 0.5]
    } else {
      sans = 0; avec = arrondi(phiZ(k + 0.5) - phiZ(k - 0.5), 4)
      sansL = null
      avecL = [P, '\\Phi(' + texFixe(z(k + 0.5), 2) + ')-\\Phi(' + texFixe(z(k - 0.5), 2) + ')', texFixe(avec, 4)]
      borneSans = [k]; borneAvec = [k - 0.5, k + 0.5]
    }
    var eS = Math.abs(sans - exacte), eA = Math.abs(avec - exacte)
    var ecart = function (e) { return '<span class="ecart">(écart ' + tex(texFixe(e, 4)) + ')</span>' }
    var h = '<p>' + tex('\\mu=np=' + n + '\\times' + texCourt(p, 2) + '=' + muTex) + ' ; ' +
      tex('\\sigma=\\sqrt{np(1-p)}' + (sigEx ? '=' : '\\approx ') + sigTex) + '</p><dl class="val">' +
      '<dt class="t-ex">Valeur exacte (somme des barres bleues foncées)</dt><dd>' + tex(P + (estExact4(exacte) ? '=' : '\\approx ') + texFixe(exacte, 4)) + '</dd>' +
      '<dt class="t-sans' + (eS < eA - 1e-9 ? ' meilleur' : '') + '">Sans correction</dt><dd>' +
      (sansL ? texEgalites(sansL.slice(0, 3)) + ' ' + tex('\\approx ' + sansL[3]) + ' ' + ecart(eS)
        : tex(P + '\\approx 0') + ' : une loi continue donne une probabilité nulle à une valeur isolée. ' + ecart(eS)) + '</dd>' +
      '<dt class="t-avec' + (eA < eS - 1e-9 ? ' meilleur' : '') + '">Avec correction de continuité</dt><dd>' +
      texEgalites(avecL.slice(0, avecL.length - 1)) + ' ' + tex('\\approx ' + avecL[avecL.length - 1]) + ' ' + ecart(eA) + '</dd></dl>'
    var verdict
    if (eA < eS - 1e-9) verdict = 'La correction rapproche de la valeur exacte : la barre ' + k + ' va de ' + txtCourt(k - 0.5, 1) + ' à ' + txtCourt(k + 0.5, 1) + '.'
    else if (eS < eA - 1e-9) verdict = 'Ici, l’approximation sans correction tombe plus près (cela arrive, mais rarement).'
    else verdict = 'Les deux approximations sont aussi proches l’une que l’autre.'
    if (Math.max(eA, eS) < 0.0001) verdict = 'À 4 décimales, les trois valeurs coïncident presque : n est grand.'
    h += '<p>' + verdict + '</p>'
    sh.getElementById('valeurs').innerHTML = h
    var c1 = n > 30, c2 = p > 0.3 && p < 0.7
    sh.getElementById('conds').innerHTML =
      '<span class="cond ' + (c1 ? 'oui' : 'non') + '">' + tex('n=' + n + (c1 ? '>' : '\\leq ') + '30') + ' ' + (c1 ? '✓' : '✗') + '</span>' +
      '<span class="cond ' + (c2 ? 'oui' : 'non') + '">' + tex(c2 ? '0{,}3<p<0{,}7' : 'p=' + texCourt(p, 2) + '\\notin\\,]0{,}3\\,;0{,}7[') + ' ' + (c2 ? '✓' : '✗') + '</span>' +
      '<span class="cond-txt" style="flex-basis:100%;text-align:center;font-size:0.84rem;color:var(--ink-soft,#51626f)">' +
      (c1 && c2 ? 'Conditions du cours réunies : l’approximation est fiable.' : 'Conditions du cours non réunies : compare quand même les valeurs, la convention est prudente.') + '</span>'

    // ---------- Figure ----------
    var svg = sh.getElementById('svg')
    svg.innerHTML = ''
    defsFleche(svg)
    var YM = yMax(n)
    var XL = -0.5, XR = n + 0.5
    if (this._gel) { XL = this._gel[0]; XR = this._gel[1] } else if (this._loupe) { XL = Math.max(-0.5, k - 8.5); XR = Math.min(n + 0.5, XL + 17); XL = Math.max(-0.5, XR - 17) }
    this._xl = XL; this._xr = XR
    sh.getElementById('loupe').setAttribute('aria-pressed', String(this._loupe))
    var sx = function (x) { return GX + ((x - XL) / (XR - XL)) * (W - GX - DX) }
    var sy = function (y) { return H - BY - (Math.min(y, YM) / YM) * (H - BY - HY) }
    var clip = svgEl('clipPath', { id: 'cadre' })
    clip.appendChild(svgEl('rect', { x: GX, y: HY - 2, width: W - GX - DX, height: H - BY - HY + 2 }))
    svg.querySelector('defs').appendChild(clip)
    // Graduations
    var py = pasJoli(YM, 4), dec = py < 0.01 ? 3 : 2
    for (var y = py; y < YM; y += py) {
      svg.appendChild(svgEl('line', { x1: GX, x2: W - DX, y1: sy(y), y2: sy(y), class: 'grille' }))
      var ty = svgEl('text', { x: GX - 5, y: sy(y) + 3.5, 'text-anchor': 'end', class: 'tick-label' })
      ty.textContent = txtCourt(y, dec)
      svg.appendChild(ty)
    }
    // Aire sous la cloche (avec correction)
    var lo = t === 'ge' || t === 'eq' ? k - 0.5 : -0.5, hi = t === 'le' || t === 'eq' ? k + 0.5 : n + 0.5
    lo = Math.max(lo, XL); hi = Math.min(hi, XR)
    if (hi > lo) {
      var d = 'M' + sx(lo).toFixed(1) + ',' + sy(0).toFixed(1)
      for (var i = 0; i <= 160; i++) { var xx = lo + (hi - lo) * i / 160; d += ' L' + sx(xx).toFixed(1) + ',' + sy(densite(xx, mu, sigma)).toFixed(1) }
      d += ' L' + sx(hi).toFixed(1) + ',' + sy(0).toFixed(1) + ' Z'
      svg.appendChild(svgEl('path', { d: d, class: 'aire', 'clip-path': 'url(#cadre)' }))
    }
    var lb = (W - GX - DX) / (XR - XL)
    for (j = 0; j <= n; j++) {
      if (loi[j] * (H - BY - HY) / YM < 0.15 || j < XL || j > XR) continue
      svg.appendChild(svgEl('rect', { x: sx(j - 0.5), y: sy(loi[j]), width: lb, height: sy(0) - sy(loi[j]), class: 'barre' + (dans(j) ? ' ev' : ''), 'stroke-width': lb < 3 ? 0 : 0.8, 'clip-path': 'url(#cadre)' }))
    }
    var dc = ''
    for (i = 0; i <= 300; i++) { var x2 = XL + (XR - XL) * i / 300; dc += (i ? ' L' : 'M') + sx(x2).toFixed(1) + ',' + sy(densite(x2, mu, sigma)).toFixed(1) }
    svg.appendChild(svgEl('path', { d: dc, class: 'cloche', 'clip-path': 'url(#cadre)' }))
    // Bornes
    var hautL = HY + 4
    var etiq = function (x, cls, txt, yy) {
      var X = sx(x), anc = X < GX + 34 ? 'start' : X > W - DX - 34 ? 'end' : 'middle'
      var e = svgEl('text', { x: X, y: yy, 'text-anchor': anc, class: 'et et-' + cls })
      e.textContent = txt
      svg.appendChild(e)
    }
    borneSans.forEach(function (b) { svg.appendChild(svgEl('line', { x1: sx(b), x2: sx(b), y1: sy(0), y2: hautL + 14, class: 'b-sans' })) })
    borneAvec.forEach(function (b) { svg.appendChild(svgEl('line', { x1: sx(b), x2: sx(b), y1: sy(0), y2: hautL + 14, class: 'b-avec' })) })
    if (t === 'eq') {
      etiq(k, 'avec', txtCourt(k - 0.5, 1) + ' à ' + txtCourt(k + 0.5, 1), hautL + 8)
    } else {
      var bA = borneAvec[0], aGauche = bA < k
      etiq(k, 'sans', String(k), hautL + 8)
      var e2 = svgEl('text', { x: sx(bA) + (aGauche ? -4 : 4), y: hautL + 22, 'text-anchor': aGauche ? 'end' : 'start', class: 'et et-avec' })
      e2.textContent = txtCourt(bA, 1)
      svg.appendChild(e2)
    }
    // Axe des abscisses
    svg.appendChild(svgEl('line', { x1: GX, x2: W - DX + 2, y1: sy(0), y2: sy(0), class: 'axe', 'marker-end': 'url(#fleche)' }))
    svg.appendChild(svgEl('line', { x1: GX, x2: GX, y1: H - BY, y2: HY - 4, class: 'axe', 'marker-end': 'url(#fleche)' }))
    var px = Math.max(1, pasJoli(XR - XL, 8))
    for (var v = Math.ceil(XL / px) * px; v <= XR; v += px) {
      svg.appendChild(svgEl('line', { x1: sx(v), x2: sx(v), y1: sy(0), y2: sy(0) + 4, class: 'tick' }))
      var tx = svgEl('text', { x: sx(v), y: sy(0) + 15, 'text-anchor': 'middle', class: 'tick-label' })
      tx.textContent = String(v)
      svg.appendChild(tx)
    }
    var nk = svgEl('text', { x: W - DX - 2, y: sy(0) + 26, 'text-anchor': 'end', class: 'nom-axe' })
    nk.textContent = 'k'
    svg.appendChild(nk)
  }
}

function estExact4(x) { return Math.abs(Math.round(x * 1e4) - x * 1e4) < 1e-7 }

if (!customElements.get('binomiale-vers-normale-widget')) customElements.define('binomiale-vers-normale-widget', BinomialeVersNormaleWidget)
