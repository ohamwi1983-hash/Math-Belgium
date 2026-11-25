/* ================================================================
 * <mots-binome-widget> — atelier « Les 2ⁿ mots de (a + b)ⁿ » (6e,
 * ch. 7, § 3, démonstration de la formule du binôme). n de 1 à 6.
 * Développer (a + b)ⁿ sans réduire donne 2ⁿ mots de n lettres (a ou b),
 * un par façon de choisir un terme dans chaque facteur : ils sont
 * affichés en grille. « Regrouper par nombre de b » fait glisser les
 * tuiles en n + 1 colonnes de hauteurs Cₙ⁰, Cₙ¹, …, Cₙⁿ : la ligne n
 * du triangle de Pascal (mini-triangle affiché). Dans chaque colonne,
 * les mots qui finissent par a sont au-dessus du trait, ceux qui
 * finissent par b dessous : Cₙᵏ = Cₙ₋₁ᵏ + Cₙ₋₁ᵏ⁻¹ (relation de Pascal).
 * Toucher un mot : facteurs qui fournissent b, monôme obtenu, terme du
 * développement encadré. viewBox FIXE pour un n donné (la grille et
 * les colonnes partagent le même cadre : regrouper ne change pas
 * l'échelle). Défaut n = 4 (comme la démonstration du cours).
 * Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, CSS_BASE, svgEl } from './katex-shadow.js'

var N_MIN = 1, N_MAX = 6
var COULEURS = ['accent', 'sky', 'good', 'plan', 'rose', 'tip', 'attn']
var SUP = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶']
var SUB = ['₀', '₁', '₂', '₃', '₄', '₅', '₆']
var TH = 20, GAP = 5, MARGE = 8, HAUT_TITRE = 0, HAUT_PIED = 40

function comb(n, k) { if (k < 0 || k > n) return 0; var r = 1; for (var i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r) }
function nbB(m) { var c = 0; for (var i = 0; i < m.length; i++) if (m[i] === 'b') c++; return c }
function tousLesMots(n) {
  var res = []
  for (var x = 0; x < 1 << n; x++) {
    var m = ''
    for (var i = n - 1; i >= 0; i--) m += (x >> i) & 1 ? 'b' : 'a'
    res.push(m)
  }
  return res
}
/** Monôme en Unicode : 6a²b², a⁴, b… (coefficient omis s'il vaut 1). */
function monomeTxt(n, k, avecCoef) {
  var c = comb(n, k), s = avecCoef && c > 1 ? String(c) : ''
  if (n - k > 0) s += 'a' + (n - k > 1 ? SUP[n - k] : '')
  if (k > 0) s += 'b' + (k > 1 ? SUP[k] : '')
  return s || '1'
}
function monomeTex(n, k, avecCoef) {
  var c = comb(n, k), s = avecCoef && c > 1 ? String(c) : ''
  if (n - k > 0) s += 'a' + (n - k > 1 ? '^{' + (n - k) + '}' : '')
  if (k > 0) s += 'b' + (k > 1 ? '^{' + k + '}' : '')
  return s || '1'
}
function listeFr(xs) { return xs.length <= 1 ? xs.join('') : xs.slice(0, -1).join(', ') + ' et ' + xs[xs.length - 1] }

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE +
  ':host{text-align:left;}' +
  '.figure svg{max-width:560px;user-select:none;-webkit-user-select:none;}' +
  '.tuile{cursor:pointer;outline:none;transition:transform .6s ease-in-out,opacity .3s;}' +
  '.tuile rect{fill:var(--surface,#fff);stroke-width:1.6;}' +
  '.tuile text{font-family:var(--mono,ui-monospace,monospace);font-size:12.5px;text-anchor:middle;dominant-baseline:central;pointer-events:none;}' +
  '.tuile .la{fill:var(--ink-faint,#8a97a1);}' +
  '.tuile .lb{fill:var(--ink,#182430);font-weight:700;}' +
  '.tuile.pale{opacity:0.28;}' +
  '.tuile.choisie rect{stroke-width:3.2;fill:var(--accent-soft,#f4e3d1);}' +
  '.tuile:focus-visible rect{stroke-width:3.2;}' +
  '.s-accent{stroke:var(--accent,#b65c1f);}.s-sky{stroke:var(--sky,#2f6fb0);}.s-good{stroke:var(--good,#2f7a4f);}' +
  '.s-plan{stroke:var(--plan,#5b4ea3);}.s-rose{stroke:var(--rose,#b23a7a);}.s-tip{stroke:var(--tip,#8a7200);}.s-attn{stroke:var(--attn,#a3471b);}' +
  '.f-accent{fill:var(--accent,#b65c1f);}.f-sky{fill:var(--sky,#2f6fb0);}.f-good{fill:var(--good,#2f7a4f);}' +
  '.f-plan{fill:var(--plan,#5b4ea3);}.f-rose{fill:var(--rose,#b23a7a);}.f-tip{fill:var(--tip,#8a7200);}.f-attn{fill:var(--attn,#a3471b);}' +
  '.b-accent{border-color:var(--accent,#b65c1f)!important;}.b-sky{border-color:var(--sky,#2f6fb0)!important;}.b-good{border-color:var(--good,#2f7a4f)!important;}' +
  '.b-plan{border-color:var(--plan,#5b4ea3)!important;}.b-rose{border-color:var(--rose,#b23a7a)!important;}.b-tip{border-color:var(--tip,#8a7200)!important;}' +
  '.b-attn{border-color:var(--attn,#a3471b)!important;}' +
  '.etiq{transition:opacity .4s;}' +
  '.etiq text{font-family:var(--sans,sans-serif);text-anchor:middle;}' +
  '.etiq .haut-col{font-size:11px;font-weight:700;}' +
  '.etiq .mono{font-size:11.5px;fill:var(--ink-soft,#51626f);}' +
  '.etiq line{stroke:var(--ink-soft,#51626f);stroke-width:1.2;stroke-dasharray:3 2;}' +
  '.cache{opacity:0;pointer-events:none;}' +
  '.consigne{text-align:center;margin:0 0 8px;font-size:0.95rem;}' +
  '.titre-prop{font-weight:700;color:var(--ink-soft,#51626f);font-size:0.85rem;display:block;}' +
  '.dev{line-height:2.1;}' +
  '.terme{display:inline-block;padding:0 3px;border-bottom:3px solid transparent;border-radius:2px;}' +
  '.terme.vise{background:var(--accent-soft,#f4e3d1);outline:1.5px solid var(--accent,#b65c1f);}' +
  '.triangle{display:flex;flex-direction:column;align-items:center;gap:2px;margin:4px 0 8px;font-variant-numeric:tabular-nums;font-size:0.85rem;}' +
  '.triangle div{display:flex;gap:4px;}' +
  '.triangle span{min-width:24px;text-align:center;padding:1px 2px;border-radius:3px;color:var(--ink-soft,#51626f);}' +
  '.triangle .ligne-n span{color:var(--ink,#182430);font-weight:700;border:2px solid;}' +
  '</style>' +
  '<p class="consigne" id="consigne"></p>' +
  '<div class="figure"><svg id="svg" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="Les mots du développement"></svg></div>' +
  '<div class="rangee">' +
  '<button class="btn" id="regrouper" aria-pressed="false">Regrouper par nombre de b</button>' +
  '</div>' +
  '<div class="curseur"><span class="nom" id="nom-n"></span>' +
  '<button class="btn" id="moins" aria-label="Un facteur de moins">−</button>' +
  '<input type="range" id="n" min="' + N_MIN + '" max="' + N_MAX + '" step="1" aria-label="Exposant n">' +
  '<button class="btn" id="plus" aria-label="Un facteur de plus">+</button></div>' +
  '<div class="panneau" id="mot" aria-live="polite"></div>' +
  '<div class="panneau" id="dev"></div>'

class MotsBinomeWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._n = 4
    this._groupe = false
    this._sel = 'abba'
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    var input = sh.getElementById('n')
    var fixerN = function (v) {
      var n = Math.max(N_MIN, Math.min(N_MAX, Math.round(v)))
      if (n === self._n) { input.value = String(n); return }
      self._n = n
      // Le mot choisi garde ses premières lettres (complété par des a).
      self._sel = (self._sel + 'aaaaaa').slice(0, n)
      self._construire()
    }
    input.addEventListener('input', function () { fixerN(parseFloat(input.value)) })
    sh.getElementById('moins').addEventListener('click', function () { fixerN(self._n - 1) })
    sh.getElementById('plus').addEventListener('click', function () { fixerN(self._n + 1) })
    sh.getElementById('regrouper').addEventListener('click', function () { self._groupe = !self._groupe; self._placer(); self._panneaux() })
    var svg = sh.getElementById('svg')
    var choisir = function (cible) {
      var g = cible && cible.closest ? cible.closest('.tuile') : null
      if (!g) return
      var m = g.getAttribute('data-mot')
      self._sel = self._sel === m ? null : m
      self._surligner()
      self._panneaux()
    }
    svg.addEventListener('click', function (ev) { choisir(ev.target) })
    svg.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); choisir(ev.target) }
    })
    this._construire()
  }

  _geo() {
    var n = this._n, tw = Math.max(44, n * 8 + 12), cols = n + 1
    var maxC = comb(n, Math.floor(n / 2))
    // Grille : autant de rangées que la plus haute colonne (le cadre est rempli), centrée.
    var colsGrille = Math.ceil((1 << n) / maxC)
    var W = 2 * MARGE + cols * tw + (cols - 1) * GAP
    var H = 2 * MARGE + HAUT_TITRE + maxC * (TH + GAP) + 6 + HAUT_PIED
    var xGrille = (W - colsGrille * tw - (colsGrille - 1) * GAP) / 2
    return { tw: tw, cols: cols, W: W, H: H, maxC: maxC, colsGrille: colsGrille, xGrille: xGrille }
  }

  /** Positions des mots : grille (ordre du développement) ou colonnes par nombre de b. */
  _positions() {
    var n = this._n, g = this._geo(), mots = tousLesMots(n), pos = {}
    var x0 = function (c) { return MARGE + c * (g.tw + GAP) }
    if (!this._groupe) {
      mots.forEach(function (m, i) {
        pos[m] = { x: g.xGrille + (i % g.colsGrille) * (g.tw + GAP), y: MARGE + HAUT_TITRE + Math.floor(i / g.colsGrille) * (TH + GAP) }
      })
    } else {
      for (var k = 0; k <= n; k++) {
        // Finissant par a d'abord, puis par b (relation de Pascal).
        var col = mots.filter(function (m) { return nbB(m) === k })
        col = col.filter(function (m) { return m[n - 1] === 'a' }).concat(col.filter(function (m) { return m[n - 1] === 'b' }))
        col.forEach(function (m, j) {
          pos[m] = { x: x0(k), y: MARGE + HAUT_TITRE + (g.maxC - col.length) * (TH + GAP) + j * (TH + GAP) }
        })
      }
    }
    return pos
  }

  _construire() {
    var sh = this._sh, n = this._n, g = this._geo(), self = this
    sh.getElementById('n').value = String(n)
    sh.getElementById('nom-n').innerHTML = tex('n=' + n)
    sh.getElementById('moins').disabled = n <= N_MIN
    sh.getElementById('plus').disabled = n >= N_MAX
    var svg = sh.getElementById('svg')
    svg.setAttribute('viewBox', '0 0 ' + g.W + ' ' + g.H)
    svg.style.maxWidth = Math.round(g.W * 1.3) + 'px'
    svg.innerHTML = ''
    var mots = tousLesMots(n)
    // Étiquettes des colonnes (visibles une fois regroupé) : trait a / b, hauteur Cₙᵏ, monôme.
    var etiq = svgEl('g', { class: 'etiq cache', id: 'etiq' })
    var basCol = MARGE + HAUT_TITRE + g.maxC * (TH + GAP)
    for (var k = 0; k <= n; k++) {
      var xc = MARGE + k * (g.tw + GAP) + g.tw / 2, h = comb(n, k)
      var finA = comb(n - 1, k)
      if (n >= 2 && finA > 0 && finA < h) {
        var ys = basCol - (h - finA) * (TH + GAP) - GAP / 2
        etiq.appendChild(svgEl('line', { x1: xc - g.tw / 2 - 2, x2: xc + g.tw / 2 + 2, y1: ys, y2: ys }))
      }
      var t1 = svgEl('text', { x: xc, y: basCol + 14, class: 'haut-col f-' + COULEURS[k] })
      t1.textContent = 'C' + SUB[n] + SUP[k] + ' = ' + h
      etiq.appendChild(t1)
      var t2 = svgEl('text', { x: xc, y: basCol + 30, class: 'mono' })
      t2.textContent = monomeTxt(n, k, true)
      etiq.appendChild(t2)
    }
    svg.appendChild(etiq)
    mots.forEach(function (m) {
      var k = nbB(m)
      var t = svgEl('g', { class: 'tuile', 'data-mot': m, tabindex: '0', role: 'button', 'aria-label': 'mot ' + m.split('').join(' ') })
      t.appendChild(svgEl('rect', { x: 0, y: 0, width: g.tw, height: TH, rx: 4, class: 's-' + COULEURS[k] }))
      var tx = svgEl('text', { x: g.tw / 2, y: TH / 2 + 0.5 })
      m.split('').forEach(function (c) {
        var s = svgEl('tspan', { class: c === 'a' ? 'la' : 'lb' })
        s.textContent = c
        tx.appendChild(s)
      })
      t.appendChild(tx)
      svg.appendChild(t)
    })
    this._placer(true)
    this._surligner()
    this._panneaux()
  }

  _placer(sansTransition) {
    var sh = this._sh, pos = this._positions()
    var reduit = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    sh.querySelectorAll('.tuile').forEach(function (t) {
      var p = pos[t.getAttribute('data-mot')]
      if (sansTransition || reduit) t.style.transition = 'none'
      t.style.transform = 'translate(' + p.x + 'px,' + p.y + 'px)'
      if (sansTransition || reduit) { void t.getBoundingClientRect(); t.style.transition = '' }
    })
    sh.getElementById('etiq').setAttribute('class', 'etiq' + (this._groupe ? '' : ' cache'))
    var b = sh.getElementById('regrouper')
    b.setAttribute('aria-pressed', String(this._groupe))
    b.textContent = this._groupe ? 'Remettre en grille' : 'Regrouper par nombre de b'
    var n = this._n, N = 1 << n
    sh.getElementById('consigne').innerHTML = this._groupe
      ? 'Les ' + N + ' mots rangés par nombre de lettres b : les hauteurs des colonnes sont les ' + tex('C_{' + n + '}^{k}') + '.'
      : 'Les ' + tex('2^{' + n + '}=' + N) + ' mots obtenus en choisissant ' + tex('a') + ' ou ' + tex('b') + ' dans chacun des ' + n +
        (n > 1 ? ' facteurs ' : ' facteur ') + tex('(a+b)') + '. Touche un mot.'
  }

  _surligner() {
    var sel = this._sel, kSel = sel ? nbB(sel) : -1
    this._sh.querySelectorAll('.tuile').forEach(function (t) {
      var m = t.getAttribute('data-mot')
      t.classList.toggle('choisie', m === sel)
      t.classList.toggle('pale', kSel >= 0 && nbB(m) !== kSel)
    })
  }

  _panneaux() {
    var sh = this._sh, n = this._n, sel = this._sel, N = 1 << n
    var kSel = sel ? nbB(sel) : -1
    // Mot choisi.
    var h = ''
    if (sel) {
      var fb = [], fa = []
      for (var i = 0; i < n; i++) (sel[i] === 'b' ? fb : fa).push(String(i + 1))
      var c = comb(n, kSel)
      h = '<span class="titre-prop">Le mot ' + sel + '</span><p>'
      if (kSel === 0) h += 'On prend ' + tex('a') + ' dans ' + (n > 1 ? 'tous les facteurs' : 'le facteur') + ' : le mot donne ' + tex(monomeTex(n, 0, false)) + '. '
      else if (kSel === n) h += 'On prend ' + tex('b') + ' dans ' + (n > 1 ? 'tous les facteurs' : 'le facteur') + ' : le mot donne ' + tex(monomeTex(n, n, false)) + '. '
      else {
        h += 'On prend ' + tex('b') + ' dans ' + (fb.length > 1 ? 'les facteurs n° ' : 'le facteur n° ') + listeFr(fb) + ', et ' + tex('a') + ' dans ' +
          (fa.length > 1 ? 'les facteurs n° ' : 'le facteur n° ') + listeFr(fa) + ' : le mot donne ' + tex(monomeTex(n, kSel, false)) + '. '
      }
      h += 'Choisir ' + (kSel > 1 ? 'les ' + kSel + ' facteurs' : kSel === 1 ? 'le facteur' : 'aucun facteur') + ' qui ' + (kSel > 1 ? 'fournissent' : 'fournit') + ' ' + tex('b') +
        ' parmi ' + n + ' : ' + tex('C_{' + n + '}^{' + kSel + '}=' + c) + (c > 1 ? ' façons' : ' façon') + ', donc ' + c + (c > 1 ? ' mots' : ' mot') +
        ' en ' + tex(monomeTex(n, kSel, false)) + ' et le coefficient ' + c + ' dans le développement.</p>'
    } else {
      h = '<p>Touche un mot pour voir de quels facteurs viennent ses lettres ' + tex('b') + '.</p>'
    }
    sh.getElementById('mot').innerHTML = h

    // Développement + lien avec le triangle de Pascal.
    var termes = []
    for (var k = 0; k <= n; k++) {
      termes.push('<span class="terme b-' + COULEURS[k] + (k === kSel ? ' vise' : '') + '">' + tex((k ? '{}+' : '') + monomeTex(n, k, true)) + '</span>')
    }
    var hauteurs = []
    for (var j = 0; j <= n; j++) hauteurs.push(comb(n, j))
    var d = '<span class="titre-prop">Développement réduit</span><p class="dev">' + tex('(a+b)^{' + n + '}=') + ' ' + termes.join(' ') + '</p>'
    d += '<p>Hauteurs des colonnes : ' + hauteurs.join(', ') + '. C’est la ligne ' + n + ' du triangle de Pascal, et leur somme vaut ' +
      tex(hauteurs.join('+') + '=2^{' + n + '}=' + N) + ' : tous les mots sont comptés une fois.</p>'
    var tri = '<div class="triangle" aria-label="Triangle de Pascal jusqu’à la ligne ' + n + '">'
    for (var r = 0; r <= n; r++) {
      tri += '<div' + (r === n ? ' class="ligne-n"' : '') + '>'
      for (var q = 0; q <= r; q++) tri += '<span' + (r === n ? ' class="b-' + COULEURS[q] + '"' : '') + '>' + comb(r, q) + '</span>'
      tri += '</div>'
    }
    d += tri + '</div>'
    if (this._groupe && n >= 2) {
      var kx = kSel > 0 && kSel < n ? kSel : Math.floor(n / 2)
      d += '<p>Dans chaque colonne, le trait pointillé sépare les mots qui finissent par ' + tex('a') + ' (au-dessus) de ceux qui finissent par ' + tex('b') + ' (dessous). ' +
        'Exemple, colonne ' + tex('k=' + kx) + ' : ' + tex('C_{' + n + '}^{' + kx + '}=C_{' + (n - 1) + '}^{' + kx + '}+C_{' + (n - 1) + '}^{' + (kx - 1) + '}') + ', soit ' +
        tex(comb(n, kx) + '=' + comb(n - 1, kx) + '+' + comb(n - 1, kx - 1)) + ' : c’est la relation de Pascal.</p>'
    } else if (!this._groupe) {
      d += '<p>Regroupe les mots pour faire apparaître ces colonnes.</p>'
    }
    sh.getElementById('dev').innerHTML = d
  }
}

if (!customElements.get('mots-binome-widget')) customElements.define('mots-binome-widget', MotsBinomeWidget)
