/* ================================================================
 * <poisson-ou-binomiale-widget> — atelier « Poisson ou binomiale ? »
 * (6e, ch. 8, § 8, approximation d'une loi binomiale par une loi de
 * Poisson). Curseurs n (5 à 200), p (0,01 à 0,50) et k ; événement
 * X = k, X ≤ k ou X ≥ k. Pour chaque valeur j, deux barres côte à côte :
 * 𝓑(n ; p) à gauche (bleu), loi de Poisson de paramètre λ = np à droite
 * (accent). L'écart maximal entre deux barres de même j est marqué sur
 * la figure et chiffré. Les trois conditions du cours (n ≥ 30 ; p ≤ 0,1 ;
 * np ≤ 15) s'allument en vert ou en rouge. Valeurs exactes (somme des
 * barres), arrondies à 4 décimales. Fenêtre : valeurs de j autour de λ
 * (λ ± 4√λ, bornes arrondies à 5), ordonnées arrondies à un pas « joli »
 * (la fenêtre ne saute pas à chaque cran de p). Toucher ou glisser sur
 * la figure choisit k. Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, CSS_BASE, svgEl, defsFleche } from './katex-shadow.js'
import { arrondi, loiBinomiale, texFixe, texCourt, txtCourt, txtFixe, estExact, pasJoli, curseurHTML, lierCurseur, majCurseur, borner } from './variables-aleatoires-commun.js'

var W = 400, H = 236, GX = 42, DX = 14, HY = 18, BY = 30
var N_MIN = 5, N_MAX = 200, P_MIN = 0.01, P_MAX = 0.5
var EXEMPLES = [
  { n: 50, p: 0.08, k: 1, t: 'le', nom: 'Exemple du cours', sous: 'n = 50, p = 0,08' },
  { n: 200, p: 0.02, k: 5, t: 'le', nom: 'Contrôle qualité', sous: 'n = 200, p = 0,02' },
  { n: 50, p: 0.3, k: 15, t: 'eq', nom: 'p trop grand', sous: 'n = 50, p = 0,3' },
  { n: 10, p: 0.2, k: 2, t: 'eq', nom: 'n trop petit', sous: 'n = 10, p = 0,2' },
]

/** Loi de Poisson de paramètre λ : P(X = j) pour j = 0…jmax (de proche en proche, × λ/j). */
function loiPoisson(lambda, jmax) {
  var r = [Math.exp(-lambda)]
  for (var j = 1; j <= jmax; j++) r.push(r[j - 1] * lambda / j)
  return r
}
function egal4(x) { return (estExact(x, 4) ? '=' : '\\approx ') + texFixe(x, 4) }

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE +
  ':host{text-align:left;}[hidden]{display:none !important;}' +
  '.figure svg{max-width:470px;touch-action:none;}' +
  '.b-bin{fill:var(--sky-soft,#dde9f5);stroke:var(--sky,#2f6fb0);}' +
  '.b-bin.ev{fill:var(--sky,#2f6fb0);fill-opacity:0.6;}' +
  '.b-poi{fill:var(--accent-soft,#f4e3d1);stroke:var(--accent,#b65c1f);}' +
  '.b-poi.ev{fill:var(--accent,#b65c1f);fill-opacity:0.6;}' +
  '.ecart-max{stroke:var(--bad,#b23a3a);stroke-width:2;}' +
  '.et{font-size:11px;font-weight:700;font-family:var(--sans,sans-serif);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3px;}' +
  '.et-ecart{fill:var(--bad,#b23a3a);}' +
  '.marque-k{stroke:var(--ink-soft,#51626f);stroke-width:1.2;stroke-dasharray:3 3;}' +
  '.legende{display:flex;flex-wrap:wrap;gap:4px 14px;justify-content:center;font-size:0.84rem;margin:0 0 6px;}' +
  '.legende span{display:inline-flex;align-items:center;gap:6px;}' +
  '.legende i{display:inline-block;width:16px;height:11px;border-radius:2px;}' +
  '.l-bin{background:var(--sky-soft,#dde9f5);border:1.4px solid var(--sky,#2f6fb0);}' +
  '.l-poi{background:var(--accent-soft,#f4e3d1);border:1.4px solid var(--accent,#b65c1f);}' +
  '.l-ecart{height:0 !important;width:12px !important;border-top:2px solid var(--bad,#b23a3a);}' +
  '.reglages{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:0 18px;}' +
  '.curseur .nom{min-width:84px;}' +
  '.types .btn,.exemples .btn{font-size:0.86rem;}' +
  '.exemples .btn small{display:block;font-weight:400;font-size:0.72rem;color:var(--ink-soft,#51626f);}' +
  '.conds{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:0 0 10px;}' +
  '.cond{border-radius:999px;padding:4px 12px;font-size:0.88rem;font-weight:700;border:1.5px solid;}' +
  '.cond.oui{color:var(--good,#2f7a4f);border-color:var(--good,#2f7a4f);background:var(--good-soft,#dcefe2);}' +
  '.cond.non{color:var(--bad,#b23a3a);border-color:var(--bad,#b23a3a);background:var(--bad-soft,#f6dddd);}' +
  '.cond-txt{flex-basis:100%;text-align:center;font-size:0.84rem;color:var(--ink-soft,#51626f);}' +
  '.val{margin:0 0 8px;}' +
  '.val dt{font-weight:700;font-size:0.88rem;margin:6px 0 0;}' +
  '.val dd{margin:0;line-height:2;}' +
  '.t-bin{color:var(--sky-ink,#1f4e7d);}.t-poi{color:var(--accent-ink,#7a3c11);}.t-ecart{color:var(--bad,#b23a3a);font-weight:700;}' +
  '.ecart{font-size:0.86rem;color:var(--ink-soft,#51626f);}' +
  '</style>' +
  '<div class="legende"><span><i class="l-bin"></i>loi binomiale</span><span><i class="l-poi"></i>loi de Poisson</span><span><i class="l-ecart"></i>écart maximal</span></div>' +
  '<div class="figure"><svg id="svg" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Barres de la loi binomiale et de la loi de Poisson côte à côte"></svg></div>' +
  '<div class="conds" id="conds"></div>' +
  '<div class="panneau" id="valeurs" aria-live="polite"></div>' +
  '<div class="rangee types" role="group" aria-label="Événement">' +
  '<button class="btn" data-t="eq"></button><button class="btn" data-t="le"></button><button class="btn" data-t="ge"></button></div>' +
  '<div class="reglages">' +
  curseurHTML('n', 'Nombre d’épreuves n', N_MIN, N_MAX, 1) +
  curseurHTML('p', 'Probabilité de succès p', P_MIN, P_MAX, 0.01) +
  curseurHTML('k', 'Valeur k', 0, 150, 1) +
  '</div>' +
  '<div class="rangee exemples" role="group" aria-label="Exemples">' +
  EXEMPLES.map(function (x, i) { return '<button class="btn" data-i="' + i + '">' + x.nom + '<small>' + x.sous + '</small></button>' }).join('') +
  '</div>'

class PoissonOuBinomialeWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._n = 50; this._p = 0.08; this._k = 1; this._t = 'le'
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    sh.querySelector('[data-t="eq"]').innerHTML = tex('X=k')
    sh.querySelector('[data-t="le"]').innerHTML = tex('X\\leq k')
    sh.querySelector('[data-t="ge"]').innerHTML = tex('X\\geq k')
    sh.querySelectorAll('[data-t]').forEach(function (b) {
      b.addEventListener('click', function () { self._t = b.getAttribute('data-t'); self._rendre() })
    })
    lierCurseur(sh, 'n', function () { return self._n }, function (v) { self._n = Math.round(borner(v, N_MIN, N_MAX)); self._rendre() }, 1)
    lierCurseur(sh, 'p', function () { return self._p }, function (v) { self._p = arrondi(borner(v, P_MIN, P_MAX), 2); self._rendre() }, 0.01)
    lierCurseur(sh, 'k', function () { return self._k }, function (v) { self._k = Math.round(borner(v, self._jl, self._jr)); self._rendre() }, 1)
    sh.querySelectorAll('.exemples .btn').forEach(function (b) {
      b.addEventListener('click', function () {
        var x = EXEMPLES[+b.getAttribute('data-i')]
        self._n = x.n; self._p = x.p; self._k = x.k; self._t = x.t
        self._rendre()
      })
    })
    var svg = sh.getElementById('svg'), appui = false
    var choisir = function (ev) {
      var m = svg.getScreenCTM()
      if (!m) return
      var x = (ev.clientX - m.e) / m.a
      var k = Math.round(self._jl + (x - GX) / (W - GX - DX) * (self._jr - self._jl + 1) - 0.5)
      k = borner(k, self._jl, self._jr)
      if (k !== self._k) { self._k = k; self._rendre() }
    }
    svg.addEventListener('pointerdown', function (ev) { appui = true; svg.setPointerCapture(ev.pointerId); choisir(ev) })
    svg.addEventListener('pointermove', function (ev) { if (appui) choisir(ev) })
    svg.addEventListener('pointerup', function () { appui = false })
    svg.addEventListener('pointercancel', function () { appui = false })
    this._rendre()
  }

  _rendre() {
    var sh = this._sh, n = this._n, p = this._p, t = this._t
    var lambda = arrondi(n * p, 2)
    // ---------- Fenêtre : j autour de λ ----------
    var et = Math.sqrt(lambda)
    var jl = Math.max(0, Math.floor((lambda - 4 * et) / 5) * 5)
    var jr = Math.max(jl + 9, Math.ceil((lambda + 4 * et + 1) / 5) * 5)
    this._jl = jl; this._jr = jr
    var k = this._k = Math.round(borner(this._k, jl, jr))
    var kInput = sh.getElementById('k')
    kInput.min = String(jl); kInput.max = String(jr)
    majCurseur(sh, 'n', n, 'n=' + n)
    majCurseur(sh, 'p', p, 'p=' + texCourt(p, 2))
    majCurseur(sh, 'k', k, 'k=' + k)
    sh.querySelectorAll('[data-t]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-t') === t)) })
    sh.querySelectorAll('.exemples .btn').forEach(function (b) {
      var x = EXEMPLES[+b.getAttribute('data-i')]
      b.setAttribute('aria-pressed', String(x.n === n && x.p === p && x.k === k && x.t === t))
    })

    // ---------- Lois ----------
    var jmax = Math.max(n, jr) + 40
    var bin = loiBinomiale(n, p), poi = loiPoisson(lambda, jmax)
    var b = function (j) { return j <= n ? bin[j] : 0 }
    var dans = function (j) { return t === 'le' ? j <= k : t === 'ge' ? j >= k : j === k }
    var pB = 0, pP = 0, j
    if (t === 'ge') {
      // complément exact : 1 − P(X ≤ k − 1) (la loi de Poisson n'a pas de valeur maximale)
      var cB = 0, cP = 0
      for (j = 0; j < k; j++) { cB += b(j); cP += poi[j] }
      pB = 1 - cB; pP = 1 - cP
    } else {
      for (j = 0; j <= Math.min(k, jmax); j++) if (dans(j)) { pB += b(j); pP += poi[j] }
    }
    var eMax = 0, jMax = 0
    for (j = 0; j <= jmax; j++) { var d = Math.abs(b(j) - poi[j]); if (d > eMax + 1e-15) { eMax = d; jMax = j } }

    // ---------- Valeurs ----------
    var P = t === 'le' ? 'P(X\\leq ' + k + ')' : t === 'ge' ? 'P(X\\geq ' + k + ')' : 'P(X=' + k + ')'
    var lamTex = texCourt(lambda, 2), pTex = texCourt(p, 2), qTex = texCourt(arrondi(1 - p, 2), 2)
    var formB, formP
    if (t === 'eq') {
      formB = k > n ? tex(P + '=0') + ' (au plus ' + n + ' succès en ' + n + ' épreuves)'
        : tex(P + '=C_{' + n + '}^{' + k + '}\\times ' + pTex + '^{' + k + '}\\times ' + qTex + '^{' + (n - k) + '}') + ' ' + tex(egal4(pB))
      formP = tex(P + '=e^{-' + lamTex + '}\\times\\dfrac{' + lamTex + '^{' + k + '}}{' + k + '!}') + ' ' + tex(egal4(pP))
    } else if (t === 'le') {
      formB = (k === 0 ? '' : tex(P + '=' + (k === 1 ? 'P(X=0)+P(X=1)' : 'P(X=0)+\\dots+P(X=' + k + ')')) + ' ') + tex((k === 0 ? P : '') + egal4(pB))
      formP = tex(P + egal4(pP))
    } else {
      formB = tex(P + '=1-P(X\\leq ' + (k - 1) + ')') + ' ' + tex(egal4(pB))
      formP = tex(P + '=1-P(X\\leq ' + (k - 1) + ')') + ' ' + tex(egal4(pP))
    }
    if (t === 'ge' && k === 0) { formB = tex(P + '=1'); formP = tex(P + '=1') }
    var ec = Math.abs(pB - pP)
    var h = '<p>' + tex('\\lambda=n\\times p=' + n + '\\times ' + pTex + '=' + lamTex) + ' : la loi de Poisson a la même espérance que la loi binomiale.</p>' +
      '<dl class="val">' +
      '<dt class="t-bin">Loi binomiale ' + tex('\\mathcal{B}(' + n + '\\,;' + pTex + ')') + '</dt><dd>' + formB + '</dd>' +
      '<dt class="t-poi">Loi de Poisson de paramètre ' + tex('\\lambda=' + lamTex) + '</dt><dd>' + formP + '</dd>' +
      '<dt>Écart pour cet événement</dt><dd>' + tex(texFixe(ec, 4)) + ' <span class="ecart">(' + (ec < 0.00005 ? 'invisible à 4 décimales' : 'soit ' + txtCourt(arrondi(ec * 100, 2), 2) + ' point' + (ec * 100 >= 2 ? 's' : '') + ' de pourcentage') + ')</span></dd>' +
      '</dl>' +
      '<p><span class="t-ecart">Écart maximal</span> entre deux barres : ' + tex(texFixe(eMax, 4)) + ', en ' + tex('k=' + jMax) + ' ' +
      '<span class="ecart">(' + tex(texFixe(b(jMax), 4)) + ' contre ' + tex(texFixe(poi[jMax], 4)) + ').</span></p>'
    sh.getElementById('valeurs').innerHTML = h

    var c1 = n >= 30, c2 = p <= 0.1 + 1e-9, c3 = lambda <= 15 + 1e-9
    var pastille = function (ok, s) { return '<span class="cond ' + (ok ? 'oui' : 'non') + '">' + tex(s) + ' ' + (ok ? '✓' : '✗') + '</span>' }
    var phrase
    if (c1 && c2 && c3) phrase = 'Les 3 conditions du cours sont réunies : on peut approcher la loi binomiale par la loi de Poisson.'
    else phrase = 'Au moins une condition manque : dans ce cours, on n’approche pas. Regarde l’écart maximal.'
    sh.getElementById('conds').innerHTML =
      pastille(c1, 'n=' + n + (c1 ? '\\geq ' : '<') + '30') +
      pastille(c2, 'p=' + pTex + (c2 ? '\\leq ' : '>') + '0{,}1') +
      pastille(c3, 'np=' + lamTex + (c3 ? '\\leq ' : '>') + '15') +
      '<span class="cond-txt">' + phrase + '</span>'

    // ---------- Figure ----------
    var svg = sh.getElementById('svg')
    svg.innerHTML = ''
    defsFleche(svg)
    var m = 0
    for (j = jl; j <= jr; j++) m = Math.max(m, b(j), poi[j])
    var py = pasJoli(m * 1.12, 4), YM = Math.ceil(m * 1.12 / py) * py
    var nb = jr - jl + 1, lc = (W - GX - DX) / nb
    var sx = function (x) { return GX + (x - jl + 0.5) * lc }
    var sy = function (y) { return H - BY - (y / YM) * (H - BY - HY) }
    var dec = py < 0.01 ? 3 : py < 0.1 ? 2 : 1
    for (var y = py; y < YM + 1e-9; y += py) {
      svg.appendChild(svgEl('line', { x1: GX, x2: W - DX, y1: sy(y), y2: sy(y), class: 'grille' }))
      var ty = svgEl('text', { x: GX - 5, y: sy(y) + 3.5, 'text-anchor': 'end', class: 'tick-label' })
      ty.textContent = txtFixe(y, dec)
      svg.appendChild(ty)
    }
    var lb = Math.max(1, lc * 0.42), sw = lb < 4 ? 0 : 0.8
    for (j = jl; j <= jr; j++) {
      var cx = sx(j)
      if (b(j) > 0) svg.appendChild(svgEl('rect', { x: cx - lb, y: sy(b(j)), width: lb, height: sy(0) - sy(b(j)), class: 'b-bin' + (dans(j) ? ' ev' : ''), 'stroke-width': sw }))
      svg.appendChild(svgEl('rect', { x: cx, y: sy(poi[j]), width: lb, height: sy(0) - sy(poi[j]), class: 'b-poi' + (dans(j) ? ' ev' : ''), 'stroke-width': sw }))
    }
    // Écart maximal : trait vertical entre les deux sommets
    if (jMax >= jl && jMax <= jr && eMax > 0) {
      var xm = sx(jMax), y1 = sy(b(jMax)), y2 = sy(poi[jMax])
      svg.appendChild(svgEl('line', { x1: xm, x2: xm, y1: Math.min(y1, y2) - 1, y2: Math.max(y1, y2) + 1, class: 'ecart-max' }))
      svg.appendChild(svgEl('line', { x1: xm - 5, x2: xm + 5, y1: Math.min(y1, y2) - 1, y2: Math.min(y1, y2) - 1, class: 'ecart-max' }))
      svg.appendChild(svgEl('line', { x1: xm - 5, x2: xm + 5, y1: Math.max(y1, y2) + 1, y2: Math.max(y1, y2) + 1, class: 'ecart-max' }))
      var anc = xm > W - DX - 70 ? 'end' : 'start'
      var et2 = svgEl('text', { x: xm + (anc === 'start' ? 8 : -8), y: Math.max(HY + 9, Math.min(y1, y2) - 4), 'text-anchor': anc, class: 'et et-ecart' })
      et2.textContent = 'écart max ' + txtFixe(eMax, 4)
      svg.appendChild(et2)
    }
    // Repère de k
    svg.appendChild(svgEl('line', { x1: sx(k), x2: sx(k), y1: sy(0), y2: HY, class: 'marque-k' }))
    // Axes
    svg.appendChild(svgEl('line', { x1: GX, x2: W - DX + 2, y1: sy(0), y2: sy(0), class: 'axe', 'marker-end': 'url(#fleche)' }))
    svg.appendChild(svgEl('line', { x1: GX, x2: GX, y1: H - BY, y2: HY - 6, class: 'axe', 'marker-end': 'url(#fleche)' }))
    var px = Math.max(1, pasJoli(nb, 10))
    for (var v = Math.ceil(jl / px) * px; v <= jr; v += px) {
      svg.appendChild(svgEl('line', { x1: sx(v), x2: sx(v), y1: sy(0), y2: sy(0) + 4, class: 'tick' }))
      var tx = svgEl('text', { x: sx(v), y: sy(0) + 15, 'text-anchor': 'middle', class: 'tick-label' + (v === k ? ' et' : '') })
      tx.textContent = String(v)
      svg.appendChild(tx)
    }
    var nk = svgEl('text', { x: W - DX - 2, y: sy(0) + 26, 'text-anchor': 'end', class: 'nom-axe' })
    nk.textContent = 'k'
    svg.appendChild(nk)
  }
}

if (!customElements.get('poisson-ou-binomiale-widget')) customElements.define('poisson-ou-binomiale-widget', PoissonOuBinomialeWidget)
