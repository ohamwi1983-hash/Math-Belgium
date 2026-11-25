/* ================================================================
 * <hypergeometrique-binomiale-widget> — atelier « Avec ou sans remise :
 * hypergéométrique contre binomiale » (6e, ch. 7, § 5, après l'astuce
 * « Hypergéométrique (sans remise) contre binomiale »).
 * Curseurs N (population, de 10 à 1 000), K (succès dans la
 * population), n (tirages, de 1 à 10). Diagramme en barres jumelées :
 * loi hypergéométrique (sans remise) et loi binomiale de paramètre
 * p = K/N (avec remise). Quand N change, K suit la proportion K/N
 * choisie : seule la taille de la population change, et l'écart entre
 * les deux lois se referme quand N grandit devant n (bouton « Faire
 * grandir N »). FENÊTRE FIXE : abscisses 0 à 10 et ordonnées 0 à 1,
 * quels que soient les réglages. Valeurs exactes à 4 décimales dans
 * un tableau (une ligne par k), calcul détaillé pour le k choisi
 * (clic sur une barre ou une ligne). Défaut N = 20, K = 6, n = 5 :
 * le tableau du cours. Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, texNombre, CSS_BASE, svgEl, defsFleche } from './katex-shadow.js'

var LISTE_N = [10, 12, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200, 300, 500, 1000]
var PETIT_N_MAX = 10
var LARG = 440, HAUT = 250, MG = 44, MD = 14, MH = 16, MB = 40
var X_SLOTS = PETIT_N_MAX + 1

// ln(k!) exact jusqu'à 1 000.
var LNF = [0]
for (var i = 1; i <= 1000; i++) LNF.push(LNF[i - 1] + Math.log(i))
function lnC(n, k) { return k < 0 || k > n ? -Infinity : LNF[n] - LNF[k] - LNF[n - k] }
function hyper(N, K, n, k) {
  var l = lnC(K, k) + lnC(N - K, n - k) - lnC(N, n)
  return l === -Infinity ? 0 : Math.exp(l)
}
function binom(n, p, k) {
  if (p <= 0) return k === 0 ? 1 : 0
  if (p >= 1) return k === n ? 1 : 0
  return Math.exp(lnC(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p))
}
// Coefficient binomial exact (BigInt) pour l'affichage.
function cExact(n, k) {
  if (k < 0 || k > n) return 0n
  k = Math.min(k, n - k)
  var r = 1n
  for (var j = 1; j <= k; j++) r = (r * BigInt(n - k + j)) / BigInt(j)
  return r
}
function texEntier(b) { return String(b).replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') }
function dec4(x) { return texNombre(x, 4) }
function txt4(x) {
  var s = x.toFixed(4)
  return s.replace('.', ',')
}
function cnk(n, k) { return 'C_{' + n + '}^{' + k + '}' }
// p = K/N écrit exactement : décimal s'il tombe juste en 4 décimales au plus, sinon fraction réduite.
function texP(K, N, puiss) {
  var g = K, h = N
  while (h) { var t = g % h; g = h; h = t }
  var a = K / g, b = N / g, x = K / N
  var exact = Math.abs(Math.round(x * 1e4) - x * 1e4) < 1e-9
  var base = exact ? texNombre(x, 4) : '\\tfrac{' + a + '}{' + b + '}'
  if (puiss === undefined) return base
  return (exact ? base : '\\left(' + base + '\\right)') + '^{' + puiss + '}'
}

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE +
  ':host{text-align:left;}' +
  '.figure svg{max-width:460px;}' +
  '.b-hyp{fill:var(--accent,#b65c1f);}' +
  '.b-bin{fill:var(--sky-soft,#dde9f5);stroke:var(--sky,#2f6fb0);stroke-width:1.6;}' +
  '.b-choix{stroke:var(--ink,#182430);stroke-width:2;}' +
  '.zone-k{fill:transparent;cursor:pointer;}' +
  '.zone-k.choisi{fill:var(--attn-soft,#f7ecd6);}' +
  '.val{font-size:10px;font-family:var(--sans,sans-serif);font-variant-numeric:tabular-nums;text-anchor:middle;' +
  'paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3px;}' +
  '.val-hyp{fill:var(--accent-ink,#7a3c11);font-weight:700;}.val-bin{fill:var(--sky-ink,#1f4e7d);font-weight:700;}' +
  '.legende{display:flex;flex-wrap:wrap;gap:4px 16px;justify-content:center;font-size:0.86rem;margin:0 0 8px;}' +
  '.legende span{display:inline-flex;align-items:center;gap:6px;}' +
  '.legende i{display:inline-block;width:16px;height:12px;border-radius:2px;}' +
  '.l-hyp{background:var(--accent,#b65c1f);}.l-bin{background:var(--sky-soft,#dde9f5);border:1.6px solid var(--sky,#2f6fb0);}' +
  '.reglages{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:0 18px;}' +
  '.curseur .nom{min-width:78px;}' +
  '.jauge{height:12px;border-radius:6px;background:var(--surface-2,#f7f9fb);border:1px solid var(--line,#ccd8e0);overflow:hidden;margin:4px 0 6px;}' +
  '.jauge b{display:block;height:100%;background:var(--attn,#96650c);transition:width .25s;}' +
  '.defile{overflow-x:auto;margin:0 0 10px;}' +
  'table{border-collapse:collapse;font-size:0.86rem;font-variant-numeric:tabular-nums;margin:0 auto;}' +
  'th,td{border:1px solid var(--line,#ccd8e0);padding:4px 8px;text-align:right;}' +
  'th{background:var(--surface-2,#f7f9fb);color:var(--ink-soft,#51626f);font-weight:600;text-align:center;}' +
  'td:first-child{text-align:center;}' +
  'tbody tr{cursor:pointer;}' +
  'tr.choisi td{background:var(--attn-soft,#f7ecd6);font-weight:700;}' +
  '.c-hyp{color:var(--accent-ink,#7a3c11);}.c-bin{color:var(--sky-ink,#1f4e7d);}' +
  '.calc{line-height:2.1;margin:0 0 6px;}' +
  '</style>' +
  '<div class="legende"><span><i class="l-hyp"></i>hypergéométrique (sans remise)</span><span><i class="l-bin"></i>binomiale, p = K⁄N (avec remise)</span></div>' +
  '<div class="figure"><svg id="svg" viewBox="0 0 ' + LARG + ' ' + HAUT + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Les deux lois en barres jumelées"></svg></div>' +
  '<div class="reglages">' +
  '<div class="curseur"><span class="nom" id="nom-N"></span><button class="btn" id="N-moins" aria-label="Population plus petite">−</button>' +
  '<input type="range" id="N" min="0" max="' + (LISTE_N.length - 1) + '" step="1" aria-label="Taille de la population N"><button class="btn" id="N-plus" aria-label="Population plus grande">+</button></div>' +
  '<div class="curseur"><span class="nom" id="nom-K"></span><button class="btn" id="K-moins" aria-label="Un succès de moins">−</button>' +
  '<input type="range" id="K" min="1" step="1" aria-label="Nombre de succès K dans la population"><button class="btn" id="K-plus" aria-label="Un succès de plus">+</button></div>' +
  '<div class="curseur"><span class="nom" id="nom-n"></span><button class="btn" id="n-moins" aria-label="Un tirage de moins">−</button>' +
  '<input type="range" id="n" min="1" max="' + PETIT_N_MAX + '" step="1" aria-label="Nombre de tirages n"><button class="btn" id="n-plus" aria-label="Un tirage de plus">+</button></div>' +
  '</div>' +
  '<div class="rangee"><button class="btn" id="grandir">Faire grandir N</button><button class="btn" id="cours">Exemple du cours</button></div>' +
  '<div class="panneau" id="ecart" aria-live="polite"></div>' +
  '<div class="defile"><table><thead><tr><th>k</th><th>sans remise</th><th>avec remise</th><th>écart</th></tr></thead><tbody id="tab"></tbody></table></div>' +
  '<div class="panneau" id="calc"></div>'

class HypergeometriqueBinomialeWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._iN = LISTE_N.indexOf(20)
    this._K = 6
    this._pCible = 0.3
    this._n = 5
    this._k = 2
    this._minuterie = 0
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    var regN = function (i) {
      i = Math.max(0, Math.min(LISTE_N.length - 1, Math.round(i)))
      self._iN = i
      var N = LISTE_N[i]
      self._K = Math.max(1, Math.min(N - 1, Math.round(self._pCible * N)))
      self._rendre()
    }
    var regK = function (v) {
      var N = LISTE_N[self._iN]
      self._K = Math.max(1, Math.min(N - 1, Math.round(v)))
      self._pCible = self._K / N
      self._rendre()
    }
    var regn = function (v) {
      self._n = Math.max(1, Math.min(PETIT_N_MAX, Math.round(v)))
      self._k = Math.min(self._k, self._n)
      self._rendre()
    }
    var lier = function (id, fn, get) {
      var input = sh.getElementById(id)
      input.addEventListener('input', function () { self._stop(); fn(parseFloat(input.value)) })
      sh.getElementById(id + '-moins').addEventListener('click', function () { self._stop(); fn(get() - 1) })
      sh.getElementById(id + '-plus').addEventListener('click', function () { self._stop(); fn(get() + 1) })
    }
    lier('N', regN, function () { return self._iN })
    lier('K', regK, function () { return self._K })
    lier('n', regn, function () { return self._n })
    sh.getElementById('grandir').addEventListener('click', function () {
      if (self._minuterie) { self._stop(); return }
      if (self._iN >= LISTE_N.length - 1) regN(0)
      var bouton = sh.getElementById('grandir')
      bouton.textContent = 'Arrêter'
      bouton.setAttribute('aria-pressed', 'true')
      self._minuterie = window.setInterval(function () {
        if (self._iN >= LISTE_N.length - 1) { self._stop(); return }
        regN(self._iN + 1)
      }, 700)
    })
    sh.getElementById('cours').addEventListener('click', function () {
      self._stop()
      self._iN = LISTE_N.indexOf(20); self._K = 6; self._pCible = 0.3; self._n = 5; self._k = 2
      self._rendre()
    })
    var choisirK = function (ev) {
      var el = ev.target.closest && ev.target.closest('[data-k]')
      if (!el) return
      var k = +el.getAttribute('data-k')
      if (k > self._n) return
      self._k = k
      self._rendre()
    }
    sh.getElementById('svg').addEventListener('click', choisirK)
    sh.getElementById('tab').addEventListener('click', choisirK)
    this._rendre()
  }

  disconnectedCallback() { this._stop() }

  _stop() {
    if (!this._minuterie) return
    window.clearInterval(this._minuterie)
    this._minuterie = 0
    var b = this._sh.getElementById('grandir')
    b.textContent = 'Faire grandir N'
    b.setAttribute('aria-pressed', 'false')
  }

  _rendre() {
    var sh = this._sh, N = LISTE_N[this._iN], K = this._K, n = this._n, k = this._k, p = K / N
    var inK = sh.getElementById('K')
    inK.max = String(N - 1)
    inK.value = String(K)
    sh.getElementById('N').value = String(this._iN)
    sh.getElementById('n').value = String(n)
    sh.getElementById('nom-N').innerHTML = tex('N=' + texEntier(N))
    sh.getElementById('nom-K').innerHTML = tex('K=' + texEntier(K))
    sh.getElementById('nom-n').innerHTML = tex('n=' + n)
    sh.getElementById('N-moins').disabled = this._iN <= 0
    sh.getElementById('N-plus').disabled = this._iN >= LISTE_N.length - 1
    sh.getElementById('K-moins').disabled = K <= 1
    sh.getElementById('K-plus').disabled = K >= N - 1
    sh.getElementById('n-moins').disabled = n <= 1
    sh.getElementById('n-plus').disabled = n >= PETIT_N_MAX

    var H = [], B = [], ecartMax = 0, kMax = 0
    for (var j = 0; j <= n; j++) {
      H.push(hyper(N, K, n, j))
      B.push(binom(n, p, j))
      var e = Math.abs(H[j] - B[j])
      if (e > ecartMax) { ecartMax = e; kMax = j }
    }
    this._dessiner(H, B, n, k)

    // Tableau.
    var lignes = ''
    for (j = 0; j <= n; j++) {
      lignes += '<tr data-k="' + j + '"' + (j === k ? ' class="choisi"' : '') + '><td>' + j + '</td><td class="c-hyp">' + txt4(H[j]) +
        '</td><td class="c-bin">' + txt4(B[j]) + '</td><td>' + txt4(Math.abs(H[j] - B[j])) + '</td></tr>'
    }
    sh.getElementById('tab').innerHTML = lignes

    // Écart.
    var rapport = N / n
    var txtRapport = Number.isInteger(rapport) ? String(rapport) : rapport.toFixed(1).replace('.', ',')
    var h = '<p>' + tex('p=\\dfrac{K}{N}=\\dfrac{' + texEntier(K) + '}{' + texEntier(N) + '}' + (texP(K, N).indexOf('frac') >= 0 ? '\\approx ' + dec4(p) : '=' + texP(K, N))) +
      (N === n ? ' ; on tire toute la population : sans remise, on obtient forcément les ' + K + ' succès, alors qu’avec remise tout reste possible.</p>'
        : ' ; la population est ' + txtRapport + ' fois plus grande que le nombre de tirages.</p>') +
      '<p>Plus grand écart entre les deux lois : <strong>' + txt4(ecartMax).replace('.', ',') + '</strong>' + (ecartMax > 0 ? ' (en ' + tex('k=' + kMax) + ')' : '') + '.</p>' +
      '<div class="jauge" aria-hidden="true"><b style="width:' + Math.min(100, ecartMax / 0.1 * 100).toFixed(1) + '%"></b></div>'
    if (ecartMax < 0.005) h += '<p>Moins d’un demi-centième d’écart : tirer sans remise ne change presque plus rien, chaque tirage modifie à peine une population aussi grande.</p>'
    else if (ecartMax < 0.02) h += '<p>Les barres se confondent presque : l’écart ne se voit plus qu’au deuxième chiffre après la virgule.</p>'
    else h += '<p>Écart bien visible : chaque tirage sans remise modifie nettement la composition de la population. Fais grandir ' + tex('N') + ' (même proportion ' + tex('\\tfrac{K}{N}') + ') et regarde l’écart se refermer.</p>'
    sh.getElementById('ecart').innerHTML = h

    // Calcul détaillé pour k.
    var c = '<p class="calc"><strong class="c-hyp">Sans remise</strong> : ' + tex('P(X=' + k + ')=\\dfrac{' + cnk(K, k) + '\\cdot ' + cnk(N - K, n - k) + '}{' + cnk(N, n) + '}')
    var a = cExact(K, k), b = cExact(N - K, n - k), d = cExact(N, n)
    if (a === 0n || b === 0n) {
      c += ' ' + tex('=0') + ' : impossible, ' + (a === 0n ? 'il n’y a que ' + K + ' succès' + ' dans la population' : 'il n’y a que ' + (N - K) + ' échecs dans la population') + '.'
    } else if (String(d).length <= 13) {
      c += ' ' + tex('=\\dfrac{' + texEntier(a) + '\\cdot ' + texEntier(b) + '}{' + texEntier(d) + '}') + ' ' + tex('\\approx ' + dec4(H[k]))
    } else {
      c += ' ' + tex('\\approx ' + dec4(H[k])) + ' (le dénominateur ' + tex(cnk(N, n)) + ' a ' + String(d).length + ' chiffres)'
    }
    c += '</p><p class="calc"><strong class="c-bin">Avec remise</strong> : ' +
      tex('P(X=' + k + ')=' + cnk(n, k) + '\\cdot ' + texP(K, N, k) + '\\cdot ' + texP(N - K, N, n - k)) + ' ' + tex('\\approx ' + dec4(B[k])) + '</p>'
    sh.getElementById('calc').innerHTML = c
  }

  _dessiner(H, B, n, k) {
    var svg = this._sh.getElementById('svg')
    svg.innerHTML = ''
    defsFleche(svg)
    var x0 = MG, x1 = LARG - MD, y0 = HAUT - MB, y1 = MH
    var slot = (x1 - x0) / X_SLOTS
    var py = function (v) { return y0 - v * (y0 - y1 - 6) }
    // Graduations fixes 0 à 1.
    for (var g = 0; g <= 5; g++) {
      var v = g / 5, y = py(v)
      svg.appendChild(svgEl('line', { x1: x0, x2: x1, y1: y, y2: y, class: 'grille' }))
      var t = svgEl('text', { x: x0 - 6, y: y + 3.5, 'text-anchor': 'end', class: 'tick-label' })
      t.textContent = g === 0 ? '0' : g === 5 ? '1' : '0,' + (2 * g)
      svg.appendChild(t)
    }
    for (var j = 0; j < X_SLOTS; j++) {
      var cx = x0 + (j + 0.5) * slot
      if (j <= n) {
        var zone = svgEl('rect', { x: x0 + j * slot + 1, y: y1, width: slot - 2, height: y0 - y1, class: 'zone-k' + (j === k ? ' choisi' : ''), 'data-k': j })
        svg.appendChild(zone)
      }
      var tl = svgEl('text', { x: cx, y: y0 + 15, 'text-anchor': 'middle', class: 'tick-label' })
      tl.textContent = String(j)
      svg.appendChild(tl)
      svg.appendChild(svgEl('line', { x1: cx, x2: cx, y1: y0, y2: y0 + 4, class: 'tick' }))
      if (j > n) continue
      var lb = slot * 0.36
      var hy = py(H[j]), by = py(B[j])
      svg.appendChild(svgEl('rect', { x: cx - lb - 1, y: hy, width: lb, height: Math.max(0, y0 - hy), class: 'b-hyp' + (j === k ? ' b-choix' : ''), 'data-k': j }))
      svg.appendChild(svgEl('rect', { x: cx + 1, y: by, width: lb, height: Math.max(0, y0 - by), class: 'b-bin' + (j === k ? ' b-choix' : ''), 'data-k': j }))
    }
    // Axes avec flèches.
    svg.appendChild(svgEl('line', { x1: x0, y1: y0, x2: x1 + 2, y2: y0, class: 'axe', 'marker-end': 'url(#fleche)' }))
    svg.appendChild(svgEl('line', { x1: x0, y1: y0, x2: x0, y2: y1 - 6, class: 'axe', 'marker-end': 'url(#fleche)' }))
    var nk = svgEl('text', { x: x1 - 2, y: y0 + 32, 'text-anchor': 'end', class: 'nom-axe' })
    nk.textContent = 'k (nombre de succès)'
    svg.appendChild(nk)
    // Valeurs du k choisi, au-dessus de ses deux barres.
    var cxk = x0 + (k + 0.5) * slot
    var haut = Math.min(py(H[k]), py(B[k]))
    var yv = Math.max(y1 + 22, haut - 18)
    var vh = svgEl('text', { x: cxk, y: yv, class: 'val val-hyp' })
    vh.textContent = txt4(H[k])
    var vb = svgEl('text', { x: cxk, y: yv + 11, class: 'val val-bin' })
    vb.textContent = txt4(B[k])
    // Étiquettes gardées dans le cadre (jamais rognées aux bords).
    var demi = 17
    var xv = Math.max(x0 + demi, Math.min(x1 - demi, cxk))
    vh.setAttribute('x', xv)
    vb.setAttribute('x', xv)
    svg.appendChild(vh)
    svg.appendChild(vb)
  }
}

if (!customElements.get('hypergeometrique-binomiale-widget')) customElements.define('hypergeometrique-binomiale-widget', HypergeometriqueBinomialeWidget)
