/* ================================================================
 * <approximation-binome-widget> — atelier « (1 + ε)ⁿ ≈ 1 + nε »
 * (6e, ch. 7, § 3, approximation via le binôme). Curseurs n (1 à 100)
 * et ε (−0,1 à 0,1, au millième), exemples du cours (1,01⁴ ; 1,01¹⁰⁰,
 * l'échec ; 0,99¹⁰ ; 1,05²⁰). Valeur exacte, approximation 1 + nε,
 * erreur et erreur relative, calculées EXACTEMENT (BigInt : ε a au plus
 * 3 décimales, (1 + ε)ⁿ = (1000 + 1000ε)ⁿ ÷ 1000ⁿ) puis arrondies ;
 * les premiers termes du développement Cₙᵏεᵏ (k ≤ 4, valeurs exactes)
 * montrent ce qui est négligé. Verdict selon l'erreur relative (et nε).
 * Graphique à fenêtre FIXE : abscisse nε de −2 à 3, ordonnée de −1 à 5 ;
 * points (nε ; (1 + ε)ⁿ) pour n = 0 à 100, droite y = 1 + nε, point du
 * n choisi et segment d'erreur ; hors du cadre, un message le dit.
 * Couleurs : exacte = accent, approximation = bleu, erreur = rouge
 * (mêmes couleurs dans le texte). Défaut n = 4, ε = 0,01 (cours).
 * Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, texEgalites, CSS_BASE, svgEl, defsFleche } from './katex-shadow.js'

var N_MAX = 100, E_MAX = 100 // ε en millièmes : −100 à 100
var W = 360, H = 262, GX = 34, DX = 14, HY = 14, BY = 30
var XMIN = -2, XMAX = 3, YMIN = -1, YMAX = 5
var EXEMPLES = [
  { n: 4, e: 10, nom: '1,01⁴', titre: 'exemple du cours' },
  { n: 100, e: 10, nom: '1,01¹⁰⁰', titre: 'l’approximation échoue' },
  { n: 10, e: -10, nom: '0,99¹⁰', titre: 'ε négatif' },
  { n: 20, e: 50, nom: '1,05²⁰', titre: 'nε = 1' },
]

function pow10(d) { return 10n ** BigInt(d) }
function absB(x) { return x < 0n ? -x : x }
function comb(n, k) { var r = 1n; for (var i = 1; i <= k; i++) r = (r * BigInt(n - k + i)) / BigInt(i); return r }
/** num ÷ 10^d en écriture décimale (virgule) : exacte (zéros finaux retirés). */
function decExact(num, d) {
  var neg = num < 0n, a = absB(num), ent = a / pow10(d), fr = (a % pow10(d)).toString().padStart(d, '0').replace(/0+$/, '')
  return { ent: (neg && a !== 0n ? '-' : '') + ent.toString(), fr: fr }
}
/** num ÷ 10^d arrondi à r décimales (demi vers le haut, en valeur absolue). */
function decArrondi(num, d, r) {
  var neg = num < 0n, a = absB(num), q
  if (d <= r) q = a * pow10(r - d)
  else q = (a * pow10(r) + pow10(d) / 2n) / pow10(d)
  var ent = q / pow10(r), fr = (q % pow10(r)).toString().padStart(r, '0')
  return { ent: (neg && q !== 0n ? '-' : '') + ent.toString(), fr: fr }
}
function milliersEnt(s) { return s.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') }
function enTex(o) { return milliersEnt(o.ent) + (o.fr ? '{,}' + o.fr : '') }
function enTxt(o) { return (o.ent.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (o.fr ? ',' + o.fr : '')).replace('-', '−') }
/** Valeur exacte si au plus `max` décimales, sinon arrondie à `r` décimales (avec ≈). */
function affiche(num, d, max, r) {
  var ex = decExact(num, d)
  if (ex.fr.length <= max) return { exact: true, o: ex }
  return { exact: false, o: decArrondi(num, d, r) }
}
function epsTex(e) { return enTex(decExact(BigInt(e), 3)) }
function epsTxt(e) { return enTxt(decExact(BigInt(e), 3)) }
function pct(x) {
  var a = Math.abs(x), s
  if (a >= 10) s = a.toFixed(0)
  else if (a >= 1) s = a.toFixed(1)
  else if (a >= 0.01) s = a.toPrecision(2)
  else s = a.toExponential(1)
  if (s.indexOf('e') >= 0) {
    var m = s.split('e')
    return m[0].replace('.', ',') + ' × 10' + m[1].replace('-', '⁻').replace(/\d/g, function (c) { return '⁰¹²³⁴⁵⁶⁷⁸⁹'[+c] }) + ' %'
  }
  return s.replace('.', ',') + ' %'
}
function sx(x) { return GX + ((x - XMIN) / (XMAX - XMIN)) * (W - GX - DX) }
function sy(y) { return H - BY - ((y - YMIN) / (YMAX - YMIN)) * (H - BY - HY) }

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE +
  ':host{text-align:left;}' +
  '.figure svg{max-width:460px;}' +
  '.courbe{fill:none;stroke:var(--accent,#b65c1f);stroke-width:2;}' +
  '.pt{fill:var(--accent,#b65c1f);}' +
  '.droite{stroke:var(--sky,#2f6fb0);stroke-width:2;}' +
  '.pt-approx{fill:var(--surface,#fff);stroke:var(--sky,#2f6fb0);stroke-width:2.2;}' +
  '.pt-exact{fill:var(--accent,#b65c1f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
  '.erreur{stroke:var(--bad,#b23a3a);stroke-width:3;stroke-linecap:round;}' +
  '.zone-petit{fill:var(--good,#2f7a4f);opacity:0.2;}' +
  '.leg{font-size:11px;font-family:var(--sans,sans-serif);}' +
  '.leg-e{fill:var(--accent,#b65c1f);font-weight:700;}.leg-a{fill:var(--sky,#2f6fb0);font-weight:700;}' +
  '.t-exact{color:var(--accent,#b65c1f);}.t-approx{color:var(--sky,#2f6fb0);}.t-err{color:var(--bad,#b23a3a);}' +
  '.reglages{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:0 18px;}' +
  '.curseur .nom{min-width:92px;}' +
  '.exemples .btn{font-size:0.85rem;}' +
  '.exemples .btn small{display:block;font-weight:400;font-size:0.72rem;color:var(--ink-soft,#51626f);}' +
  '.valeurs{margin:0 0 8px;}' +
  '.valeurs dt{font-weight:600;font-size:0.88rem;margin:4px 0 0;}' +
  '.valeurs dd{margin:0 0 2px;line-height:1.9;}' +
  '.verdict{font-weight:700;margin:0 0 6px;}' +
  '.v-bon{color:var(--good,#2f7a4f);}.v-moyen{color:var(--attn,#a3471b);}.v-echec{color:var(--bad,#b23a3a);}' +
  '.termes{width:100%;border-collapse:collapse;font-size:0.88rem;}' +
  '.defile{overflow-x:auto;margin:0 0 6px;}' +
  '.termes th,.termes td{border:1px solid var(--line,#ccd8e0);padding:3px 6px;text-align:center;white-space:nowrap;}' +
  '.termes th{background:var(--surface-2,#f7f9fb);color:var(--ink-soft,#51626f);font-weight:600;}' +
  '.termes tr.neglige td{color:var(--ink-faint,#8a97a1);}' +
  '.hors{color:var(--ink-soft,#51626f);font-size:0.88rem;text-align:center;margin:0 0 8px;min-height:1.3em;}' +
  '.hors.dehors{color:var(--attn,#a3471b);font-weight:600;}' +
  '.titre-prop{font-weight:700;color:var(--ink-soft,#51626f);font-size:0.85rem;display:block;}' +
  '</style>' +
  '<div class="figure"><svg id="svg" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Valeur exacte et approximation en fonction de n fois epsilon"></svg></div>' +
  '<p class="hors" id="hors" aria-live="polite"></p>' +
  '<div class="reglages">' +
  '<div class="curseur"><span class="nom" id="nom-n"></span><button class="btn" id="n-moins" aria-label="n diminue de 1">−</button>' +
  '<input type="range" id="n" min="1" max="' + N_MAX + '" step="1" aria-label="Exposant n"><button class="btn" id="n-plus" aria-label="n augmente de 1">+</button></div>' +
  '<div class="curseur"><span class="nom" id="nom-e"></span><button class="btn" id="e-moins" aria-label="epsilon diminue d’un millième">−</button>' +
  '<input type="range" id="e" min="-' + E_MAX + '" max="' + E_MAX + '" step="1" aria-label="Epsilon, en millièmes"><button class="btn" id="e-plus" aria-label="epsilon augmente d’un millième">+</button></div>' +
  '</div>' +
  '<div class="rangee exemples" role="group" aria-label="Exemples">' +
  EXEMPLES.map(function (x, i) { return '<button class="btn" data-i="' + i + '">' + x.nom + '<small>' + x.titre + '</small></button>' }).join('') +
  '</div>' +
  '<div class="panneau" id="valeurs" aria-live="polite"></div>' +
  '<div class="panneau" id="termes"></div>'

class ApproximationBinomeWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._n = 4
    this._e = 10
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    var regler = function (cle, v) {
      var min = cle === 'n' ? 1 : -E_MAX, max = cle === 'n' ? N_MAX : E_MAX
      var nv = Math.max(min, Math.min(max, Math.round(v)))
      self['_' + cle] = nv
      self._rendre()
    }
    ;['n', 'e'].forEach(function (cle) {
      var input = sh.getElementById(cle)
      input.addEventListener('input', function () { regler(cle, parseFloat(input.value)) })
      sh.getElementById(cle + '-moins').addEventListener('click', function () { regler(cle, self['_' + cle] - 1) })
      sh.getElementById(cle + '-plus').addEventListener('click', function () { regler(cle, self['_' + cle] + 1) })
    })
    sh.querySelectorAll('.exemples .btn').forEach(function (b) {
      b.addEventListener('click', function () {
        var x = EXEMPLES[+b.getAttribute('data-i')]
        self._n = x.n
        self._e = x.e
        self._rendre()
      })
    })
    this._dessinerFond()
    this._rendre()
  }

  _dessinerFond() {
    var svg = this._sh.getElementById('svg')
    svg.innerHTML = ''
    defsFleche(svg)
    var clip = svgEl('clipPath', { id: 'cadre' })
    clip.appendChild(svgEl('rect', { x: GX, y: HY, width: W - GX - DX, height: H - BY - HY }))
    svg.querySelector('defs').appendChild(clip)
    // Bande « nε petit » (|nε| ≤ 0,1).
    svg.appendChild(svgEl('rect', { x: sx(-0.1), y: HY, width: sx(0.1) - sx(-0.1), height: H - BY - HY, class: 'zone-petit' }))
    var x, y, t
    for (x = XMIN; x <= XMAX; x++) {
      svg.appendChild(svgEl('line', { x1: sx(x), x2: sx(x), y1: HY, y2: H - BY, class: 'grille' }))
      if (x !== 0) {
        t = svgEl('text', { x: sx(x), y: sy(0) + 14, 'text-anchor': 'middle', class: 'tick-label' })
        t.textContent = String(x).replace('-', '−')
        svg.appendChild(t)
      }
    }
    for (y = YMIN; y <= YMAX; y++) {
      svg.appendChild(svgEl('line', { x1: GX, x2: W - DX, y1: sy(y), y2: sy(y), class: 'grille' }))
      if (y !== 0) {
        t = svgEl('text', { x: sx(0) - 8, y: sy(y) + 3.5, 'text-anchor': 'end', class: 'tick-label' })
        t.textContent = String(y).replace('-', '−')
        svg.appendChild(t)
      }
    }
    t = svgEl('text', { x: sx(0) - 5, y: sy(0) + 14, 'text-anchor': 'end', class: 'tick-label' })
    t.textContent = '0'
    svg.appendChild(t)
    svg.appendChild(svgEl('line', { x1: GX, x2: W - DX + 2, y1: sy(0), y2: sy(0), class: 'axe', 'marker-end': 'url(#fleche)' }))
    svg.appendChild(svgEl('line', { x1: sx(0), x2: sx(0), y1: H - BY, y2: HY - 4, class: 'axe', 'marker-end': 'url(#fleche)' }))
    t = svgEl('text', { x: W - DX - 2, y: sy(0) - 6, 'text-anchor': 'end', class: 'nom-axe' })
    t.textContent = 'nε'
    svg.appendChild(t)
    // Droite y = 1 + nε (fixe : elle ne dépend que de nε).
    svg.appendChild(svgEl('line', { x1: sx(XMIN), y1: sy(1 + XMIN), x2: sx(YMAX - 1), y2: sy(YMAX), class: 'droite', 'clip-path': 'url(#cadre)' }))
    var l1 = svgEl('text', { x: sx(1.2), y: sy(1.2), class: 'leg leg-a', 'text-anchor': 'start' })
    l1.textContent = 'y = 1 + nε'
    svg.appendChild(l1)
    svg.appendChild(svgEl('g', { id: 'variable' }))
  }

  _rendre() {
    var sh = this._sh, n = this._n, e = this._e
    sh.getElementById('n').value = String(n)
    sh.getElementById('e').value = String(e)
    sh.getElementById('nom-n').innerHTML = tex('n=' + n)
    sh.getElementById('nom-e').innerHTML = tex('\\varepsilon=' + epsTex(e))
    sh.getElementById('n-moins').disabled = n <= 1
    sh.getElementById('n-plus').disabled = n >= N_MAX
    sh.getElementById('e-moins').disabled = e <= -E_MAX
    sh.getElementById('e-plus').disabled = e >= E_MAX
    sh.querySelectorAll('.exemples .btn').forEach(function (b) {
      var x = EXEMPLES[+b.getAttribute('data-i')]
      b.setAttribute('aria-pressed', String(x.n === n && x.e === e))
    })

    // ---------- Calculs exacts ----------
    var base = 1000n + BigInt(e), d = 3 * n
    var exactNum = base ** BigInt(n)
    var approxNum = 1000n + BigInt(n * e) // ÷ 10³
    var errNum = exactNum - approxNum * pow10(d - 3) // ÷ 10^(3n)
    var vEx = affiche(exactNum, d, 10, 6)
    var vAp = decExact(approxNum, 3)
    var vEr = affiche(errNum, d, 10, 6)
    var exactF = Number(exactNum * 1000000000n / pow10(d)) / 1e9
    var errF = Number(errNum * 1000000000n / pow10(d)) / 1e9
    var rel = exactF !== 0 ? (errF / exactF) * 100 : 0
    var ne = decExact(BigInt(n * e), 3)
    var neF = (n * e) / 1000

    var baseTex = enTex(decExact(base, 3))
    var h = '<dl class="valeurs">' +
      '<dt class="t-exact">Valeur exacte</dt><dd>' + texEgalites(['(1' + (e < 0 ? '' : '+') + epsTex(e) + ')^{' + n + '}', baseTex + '^{' + n + '}', (vEx.exact ? '' : '\\approx ') + enTex(vEx.o)]) + '</dd>' +
      '<dt class="t-approx">Approximation</dt><dd>' + texEgalites(['1+n\\varepsilon', '1+' + n + '\\times' + (e < 0 ? '(' + epsTex(e) + ')' : epsTex(e)), enTex(vAp)]) + '</dd>' +
      '<dt class="t-err">Erreur</dt><dd>' + texEgalites(['(1+\\varepsilon)^{n}-(1+n\\varepsilon)', (vEr.exact ? '' : '\\approx ') + enTex(vEr.o)]) + '</dd>' +
      '</dl>'
    var verdict, cls
    if (e === 0) {
      verdict = 'Avec ε = 0, les deux valent exactement 1 : rien à approcher.'
      cls = 'v-bon'
    } else {
      var relTxt = 'erreur relative ' + pct(rel)
      var neTxt = 'nε = ' + enTxt(ne)
      if (Math.abs(rel) < 1) { verdict = 'Très bonne approximation (' + relTxt + ') : ' + neTxt + ' est petit.'; cls = 'v-bon' }
      else if (Math.abs(rel) < 10) { verdict = 'Approximation grossière (' + relTxt + ') : ' + neTxt + ' n’est plus vraiment petit.'; cls = 'v-moyen' }
      else { verdict = 'L’approximation échoue (' + relTxt + ') : ' + neTxt + ' n’est pas petit.'; cls = 'v-echec' }
    }
    h += '<p class="verdict ' + cls + '">' + verdict + '</p>'
    if (e !== 0 && Math.abs(rel) >= 1) {
      h += '<p>Les termes en ' + tex('\\varepsilon^{2}') + ', ' + tex('\\varepsilon^{3}') + '… ne sont plus négligeables : le tableau ci-dessous le montre.</p>'
    } else if (e !== 0) {
      h += '<p>Les termes en ' + tex('\\varepsilon^{2}') + ', ' + tex('\\varepsilon^{3}') + '… sont minuscules, mais pas nuls : 1 + nε reste une valeur <strong>approchée</strong>.</p>'
    }
    sh.getElementById('valeurs').innerHTML = h

    // ---------- Termes du développement ----------
    var lignes = '', kmax = Math.min(4, n), somme = 0n
    for (var k = 0; k <= kmax; k++) {
      var c = comb(n, k), num = c * (BigInt(e) ** BigInt(k)) // ÷ 10^(3k)
      somme += num * pow10(3 * (kmax - k))
      var expr = k === 0 ? '1' : k === 1 ? n + '\\times' + (e < 0 ? '(' + epsTex(e) + ')' : epsTex(e))
        : 'C_{' + n + '}^{' + k + '}\\times' + (e < 0 ? '(' + epsTex(e) + ')' : epsTex(e)) + '^{' + k + '}'
      var val = enTex(decExact(num, 3 * k))
      var neglige = k >= 2 && Math.abs(Number(num) / Math.pow(10, 3 * k)) < 0.0005
      lignes += '<tr' + (neglige ? ' class="neglige"' : '') + '><td>' + tex('k=' + k) + '</td><td>' + tex(expr) + '</td><td>' + tex(val) + '</td></tr>'
    }
    var reste = exactNum * pow10(3 * kmax) - somme * pow10(d) // ÷ 10^(3n + 3 kmax)
    var t = '<span class="titre-prop">Les premiers termes de ' + tex('(1+\\varepsilon)^{n}=\\sum C_n^k\\,\\varepsilon^k') + '</span>' +
      '<div class="defile"><table class="termes"><thead><tr><th>rang</th><th>terme</th><th>valeur</th></tr></thead><tbody>' + lignes + '</tbody></table></div>'
    if (n > kmax) {
      var vr = affiche(reste, d + 3 * kmax, 10, 6)
      t += '<p>Tous les termes suivants (' + tex('k\\geq ' + (kmax + 1)) + ') valent ensemble ' + tex((vr.exact ? '' : '\\approx ') + enTex(vr.o)) + '.</p>'
    } else {
      t += '<p>Avec ' + tex('n=' + n) + ', le développement s’arrête là : la somme des termes est exactement la valeur exacte.</p>'
    }
    t += '<p>L’approximation garde seulement les rangs 0 et 1. En gris, les termes qui comptent pour moins de 0,0005.</p>'
    sh.getElementById('termes').innerHTML = t

    // ---------- Graphique ----------
    var g = sh.getElementById('variable')
    g.innerHTML = ''
    if (e !== 0) {
      var pts = [], v = 1, eps = e / 1000
      for (var i = 0; i <= N_MAX; i++) {
        var X = i * eps, Y = v
        pts.push(sx(X).toFixed(1) + ',' + sy(Math.max(YMIN - 2, Math.min(YMAX + 2, Y))).toFixed(1))
        v *= 1 + eps
        if (X > XMAX + 1 || X < XMIN - 1) break
      }
      g.appendChild(svgEl('polyline', { points: pts.join(' '), class: 'courbe', 'clip-path': 'url(#cadre)' }))
    }
    var xa = neF, ya = 1 + neF, ye = exactF
    var dedans = function (X, Y) { return X >= XMIN && X <= XMAX && Y >= YMIN && Y <= YMAX }
    if (e !== 0) g.appendChild(svgEl('line', { x1: sx(xa), x2: sx(xa), y1: sy(ya), y2: sy(ye), class: 'erreur', 'clip-path': 'url(#cadre)' }))
    if (dedans(xa, ya)) g.appendChild(svgEl('circle', { cx: sx(xa), cy: sy(ya), r: 4.5, class: 'pt-approx' }))
    if (dedans(xa, ye)) g.appendChild(svgEl('circle', { cx: sx(xa), cy: sy(ye), r: 4.5, class: 'pt-exact' }))
    var l2 = svgEl('text', { x: sx(-1.9), y: sy(4.55), class: 'leg leg-e', 'text-anchor': 'start' })
    l2.textContent = 'y = (1 + ε)ⁿ'
    g.appendChild(l2)
    var hors = sh.getElementById('hors')
    if (!dedans(xa, ye) || !dedans(xa, ya)) {
      hors.textContent = 'Avec nε = ' + enTxt(ne) + ', ' + (dedans(xa, ye) ? 'l’approximation sort' : dedans(xa, ya) ? 'la valeur exacte sort' : 'le point sort') +
        ' du cadre (nε de −2 à 3, y de −1 à 5) : l’écart est énorme.'
      hors.className = 'hors dehors'
    } else {
      hors.textContent = 'En abscisse nε ; la courbe relie les points de n = 0 à 100. Près de 0 (bande verte, |nε| ≤ 0,1), elle colle à la droite.'
      hors.className = 'hors'
    }
  }
}

if (!customElements.get('approximation-binome-widget')) customElements.define('approximation-binome-widget', ApproximationBinomeWidget)
