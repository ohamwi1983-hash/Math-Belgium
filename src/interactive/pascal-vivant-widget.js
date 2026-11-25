/* ================================================================
 * <pascal-vivant-widget> — atelier « Triangle de Pascal vivant »
 * (6e, ch. 7, § 3). Curseur n de 0 à 15 (lignes 0 à n affichées).
 * Un clic (ou Entrée) sur une case Cₙᵏ montre :
 *   - ses deux parents (relation de Pascal), ou son unique parent au bord ;
 *   - sa case symétrique Cₙⁿ⁻ᵏ ;
 *   - la somme de sa ligne, 2ⁿ.
 * Bascules : « impairs » (le triangle de Sierpiński apparaît) et
 * « développement de (a + b)ⁿ » pour la ligne de la case choisie.
 * Échelle CONSTANTE (une unité SVG = un pixel) : ajouter des lignes
 * agrandit le triangle vers le bas, les cases ne changent jamais de
 * taille ni de place ; au-delà de la largeur disponible, la figure
 * défile horizontalement. En mode « impairs », cadre FIXE des 16 lignes
 * ajusté à la largeur (motif de Sierpiński entier, même sur téléphone). Défaut n = 5, case C₅² = 10 (comme le cours).
 * Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, CSS_BASE, svgEl } from './katex-shadow.js'

var N_MAX = 15
var PAS_X = 38, PAS_Y = 32, LARG_CASE = 35, HAUT_CASE = 26
var MARGE = 6, COL_N = 28

// Triangle exact jusqu'à la ligne 15 (C₁₅⁷ = 6 435 : entiers exacts).
var C = [[1]]
for (var r = 1; r <= N_MAX; r++) {
  var ligne = [1]
  for (var j = 1; j < r; j++) ligne.push(C[r - 1][j - 1] + C[r - 1][j])
  ligne.push(1)
  C.push(ligne)
}

function milliers(v) {
  return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
function texMilliers(v) {
  return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '\\,')
}
function cnk(n, k) { return 'C_{' + n + '}^{' + k + '}' }

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE +
  ':host{text-align:left;}' +
  '.defile{overflow-x:auto;overflow-y:hidden;margin:0 0 10px;background:var(--surface-2,#f7f9fb);border-radius:var(--radius,3px);' +
  '-webkit-overflow-scrolling:touch;}' +
  '.defile svg{display:block;margin:0 auto;max-width:none;}' +
  '.case rect{fill:var(--surface,#fff);stroke:var(--line,#ccd8e0);stroke-width:1;}' +
  '.case text{font-family:var(--sans,sans-serif);font-size:12px;font-variant-numeric:tabular-nums;fill:var(--ink,#182430);' +
  'text-anchor:middle;dominant-baseline:central;pointer-events:none;}' +
  '.case{cursor:pointer;outline:none;}' +
  '.case:focus-visible rect{stroke:var(--accent,#b65c1f);stroke-width:2.5;}' +
  '.case.petit text{font-size:10.5px;}' +
  '.case.pair rect{fill:var(--surface-2,#f7f9fb);stroke:var(--line-soft,#dfe7ec);}' +
  '.case.pair text{fill:var(--ink-faint,#8a97a1);}' +
  '.case.impair rect{fill:var(--tip,#8a7200);stroke:var(--tip,#8a7200);}' +
  '.case.impair text{fill:var(--surface,#fff);font-weight:700;}' +
  '.case.parent rect{fill:var(--sky-soft,#dde9f5);stroke:var(--sky,#2f6fb0);stroke-width:2;}' +
  '.case.parent text{fill:var(--sky-ink,#1f4e7d);font-weight:700;}' +
  '.case.symetrique rect{fill:var(--plan-soft,#ece9f8);stroke:var(--plan,#5b4ea3);stroke-width:2;stroke-dasharray:4 3;}' +
  '.case.symetrique text{fill:var(--plan-ink,#443a80);font-weight:700;}' +
  '.case.choisie rect{fill:var(--accent,#b65c1f);stroke:var(--accent,#b65c1f);stroke-width:2;}' +
  '.case.choisie text{fill:var(--on-accent,#fff8f0);font-weight:700;}' +
  '.bande{fill:var(--accent-soft,#f4e3d1);opacity:0.55;}' +
  '.lien{stroke:var(--sky,#2f6fb0);stroke-width:2;fill:none;}' +
  '.num-ligne{font-size:10.5px;fill:var(--ink-soft,#51626f);font-family:var(--sans,sans-serif);text-anchor:end;dominant-baseline:central;' +
  'font-variant-numeric:tabular-nums;}' +
  '.legende{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:0.85rem;color:var(--ink-soft,#51626f);margin:0 0 8px;}' +
  '.legende span{display:inline-flex;align-items:center;gap:6px;}' +
  '.legende i{display:inline-block;width:16px;height:12px;border-radius:2px;border:2px solid;}' +
  '.l-choisie{background:var(--accent,#b65c1f);border-color:var(--accent,#b65c1f)!important;}' +
  '.l-parent{background:var(--sky-soft,#dde9f5);border-color:var(--sky,#2f6fb0)!important;}' +
  '.l-sym{background:var(--plan-soft,#ece9f8);border-color:var(--plan,#5b4ea3)!important;border-style:dashed!important;}' +
  '.l-impair{background:var(--tip,#8a7200);border-color:var(--tip,#8a7200)!important;}' +
  '.panneau h4{margin:0 0 6px;font-size:1rem;}' +
  '.ligne-calc{margin:0 0 6px;line-height:2;}' +
  '.titre-prop{font-weight:700;color:var(--ink-soft,#51626f);font-size:0.85rem;display:block;}' +
  '.terme{display:inline-block;padding:0 2px;border-radius:3px;}' +
  '.terme.vise{background:var(--accent-soft,#f4e3d1);outline:1.5px solid var(--accent,#b65c1f);}' +
  '.astuce-clic{font-size:0.85rem;color:var(--ink-soft,#51626f);margin:0 0 8px;}' +
  '</style>' +
  '<div class="defile" id="defile"><svg id="svg" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="Triangle de Pascal"></svg></div>' +
  '<p class="astuce-clic">Touche une case du triangle pour voir d’où elle vient.</p>' +
  '<div class="legende" id="legende"></div>' +
  '<div class="curseur"><span class="nom" id="nom-n"></span>' +
  '<button class="btn" id="moins" aria-label="Une ligne de moins">−</button>' +
  '<input type="range" id="n" min="0" max="' + N_MAX + '" step="1" aria-label="Nombre de lignes n">' +
  '<button class="btn" id="plus" aria-label="Une ligne de plus">+</button></div>' +
  '<div class="rangee" role="group" aria-label="Affichages">' +
  '<button class="btn" id="impairs" aria-pressed="false">Colorier les impairs</button>' +
  '<button class="btn" id="dev" aria-pressed="false">Développement de (a + b)ⁿ</button>' +
  '</div>' +
  '<div class="panneau" id="panneau" aria-live="polite"></div>'

class PascalVivantWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._n = 5
    this._sel = { r: 5, k: 2 }
    this._impairs = false
    this._dev = false
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    var input = sh.getElementById('n')
    var fixerN = function (v) {
      var n = Math.max(0, Math.min(N_MAX, Math.round(v)))
      if (n === self._n) return
      self._n = n
      if (self._sel.r > n) self._sel = { r: n, k: Math.min(self._sel.k, n) }
      self._rendre(true)
    }
    input.addEventListener('input', function () { fixerN(parseFloat(input.value)) })
    sh.getElementById('moins').addEventListener('click', function () { fixerN(self._n - 1) })
    sh.getElementById('plus').addEventListener('click', function () { fixerN(self._n + 1) })
    sh.getElementById('impairs').addEventListener('click', function () { self._impairs = !self._impairs; self._rendre(true) })
    sh.getElementById('dev').addEventListener('click', function () { self._dev = !self._dev; self._rendre(false) })
    var svg = sh.getElementById('svg')
    var choisir = function (cible, parFocus) {
      var g = cible && cible.closest ? cible.closest('.case') : null
      if (!g) return
      self._sel = { r: +g.getAttribute('data-r'), k: +g.getAttribute('data-k') }
      self._rendre(false)
      // Le triangle est redessiné : on rend le focus clavier à la case choisie.
      var nv = sh.querySelector('.case[data-r="' + self._sel.r + '"][data-k="' + self._sel.k + '"]')
      if (nv && parFocus) try { nv.focus({ preventScroll: true }) } catch { /* rien */ }
    }
    svg.addEventListener('click', function (ev) { choisir(ev.target, false) })
    svg.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); choisir(ev.target, true) }
    })
    this._rendre(true)
  }

  _rendre(recentrer) {
    var sh = this._sh, n = this._n, sel = this._sel
    sh.getElementById('n').value = String(n)
    sh.getElementById('nom-n').innerHTML = tex('n=' + n)
    sh.getElementById('moins').disabled = n <= 0
    sh.getElementById('plus').disabled = n >= N_MAX
    sh.getElementById('impairs').setAttribute('aria-pressed', String(this._impairs))
    sh.getElementById('dev').setAttribute('aria-pressed', String(this._dev))

    var leg = '<span><i class="l-choisie"></i>case choisie</span>'
    if (sel.r > 0) leg += '<span><i class="l-parent"></i>' + (sel.k === 0 || sel.k === sel.r ? 'son parent' : 'ses deux parents') + '</span>'
    if (2 * sel.k !== sel.r) leg += '<span><i class="l-sym"></i>case symétrique</span>'
    if (this._impairs) leg += '<span><i class="l-impair"></i>coefficient impair</span>'
    sh.getElementById('legende').innerHTML = leg

    this._dessiner(recentrer)
    this._panneau()
  }

  _dessiner(recentrer) {
    var sh = this._sh, n = this._n, sel = this._sel
    var svg = sh.getElementById('svg')
    // Mode « impairs » : vue d'ensemble FIXE des 16 lignes, ajustée à la largeur (le motif de
    // Sierpiński se lit en entier, même sur téléphone) ; les lignes au-delà de n restent vides.
    // Sinon : une unité = un pixel, le triangle grandit vers le bas et défile s'il est trop large.
    var nCadre = this._impairs ? N_MAX : n
    var largTri = (nCadre + 1) * PAS_X
    var W = COL_N + largTri + 2 * MARGE
    var H = 2 * MARGE + nCadre * PAS_Y + HAUT_CASE
    if (this._impairs) {
      svg.removeAttribute('width')
      svg.removeAttribute('height')
      svg.style.width = '100%'
      svg.style.maxWidth = W + 'px'
    } else {
      svg.setAttribute('width', W)
      svg.setAttribute('height', H)
      svg.style.width = ''
      svg.style.maxWidth = ''
    }
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H)
    svg.innerHTML = ''
    var centre = COL_N + MARGE + largTri / 2
    var cx = function (r, k) { return centre + (k - r / 2) * PAS_X }
    var cy = function (r) { return MARGE + r * PAS_Y + HAUT_CASE / 2 }

    // Bande de la ligne choisie (sa somme vaut 2ⁿ).
    var lr = sel.r
    svg.appendChild(svgEl('rect', {
      x: cx(lr, 0) - LARG_CASE / 2 - 4, y: cy(lr) - HAUT_CASE / 2 - 3,
      width: lr * PAS_X + LARG_CASE + 8, height: HAUT_CASE + 6, rx: 6, class: 'bande',
    }))
    // Liens parents → case choisie.
    if (sel.r > 0) {
      ;[sel.k - 1, sel.k].forEach(function (kp) {
        if (kp < 0 || kp > sel.r - 1) return
        svg.appendChild(svgEl('line', {
          x1: cx(sel.r - 1, kp), y1: cy(sel.r - 1) + HAUT_CASE / 2,
          x2: cx(sel.r, sel.k) + (kp < sel.k ? -6 : 6), y2: cy(sel.r) - HAUT_CASE / 2, class: 'lien',
        }))
      })
    }
    for (var r = 0; r <= n; r++) {
      var t = svgEl('text', { x: COL_N - 2, y: cy(r), class: 'num-ligne' })
      t.textContent = String(r)
      svg.appendChild(t)
      for (var k = 0; k <= r; k++) {
        var v = C[r][k]
        var cls = 'case'
        if (String(v).length >= 4) cls += ' petit'
        if (this._impairs) cls += v % 2 ? ' impair' : ' pair'
        if (r === sel.r && k === sel.k) cls += ' choisie'
        else if (r === sel.r - 1 && (k === sel.k - 1 || k === sel.k)) cls += ' parent'
        else if (r === sel.r && k === sel.r - sel.k) cls += ' symetrique'
        var g = svgEl('g', {
          class: cls, 'data-r': r, 'data-k': k, tabindex: '0', role: 'button',
          'aria-label': 'C ' + r + ' ' + k + ' égale ' + v,
        })
        g.appendChild(svgEl('rect', { x: cx(r, k) - LARG_CASE / 2, y: cy(r) - HAUT_CASE / 2, width: LARG_CASE, height: HAUT_CASE, rx: 5 }))
        var tx = svgEl('text', { x: cx(r, k), y: cy(r) + 0.5 })
        tx.textContent = milliers(v)
        g.appendChild(tx)
        svg.appendChild(g)
      }
    }
    if (recentrer) {
      var d = sh.getElementById('defile')
      requestAnimationFrame(function () { d.scrollLeft = Math.max(0, (d.scrollWidth - d.clientWidth) / 2) })
    }
  }

  _panneau() {
    var sel = this._sel, r = sel.r, k = sel.k, v = C[r][k]
    var h = '<h4>' + tex(cnk(r, k) + '=' + texMilliers(v)) + '</h4>'

    // Relation de Pascal.
    h += '<p class="ligne-calc"><span class="titre-prop">Relation de Pascal</span>'
    if (r === 0) {
      h += 'Le sommet ' + tex(cnk(0, 0) + '=1') + ' n’a pas de parent : c’est le point de départ du triangle.'
    } else if (k === 0 || k === r) {
      h += 'Case du bord : un seul parent, ' + tex(cnk(r - 1, k === 0 ? 0 : r - 1) + '=1') +
        ' (l’autre « parent » serait hors du triangle, il compte pour 0). Les bords valent toujours 1.'
    } else {
      h += tex(cnk(r, k)) + ' ' + tex('=' + cnk(r - 1, k - 1) + '+' + cnk(r - 1, k)) + ' ' +
        tex('=' + texMilliers(C[r - 1][k - 1]) + '+' + texMilliers(C[r - 1][k])) + ' ' + tex('=' + texMilliers(v))
    }
    h += '</p>'

    // Symétrie.
    h += '<p class="ligne-calc"><span class="titre-prop">Symétrie</span>'
    if (2 * k === r) {
      h += tex(cnk(r, k)) + ' est au milieu de la ligne : elle est sa propre case symétrique, car ' + tex(r + '-' + k + '=' + k) + '.'
    } else {
      h += tex(cnk(r, k) + '=' + cnk(r, r - k) + '=' + texMilliers(v)) + ', car ' + tex(r + '-' + k + '=' + (r - k)) + '.'
    }
    h += '</p>'

    // Somme de la ligne.
    var somme = 0, termes = []
    for (var j = 0; j <= r; j++) { somme += C[r][j]; termes.push(texMilliers(C[r][j])) }
    h += '<p class="ligne-calc"><span class="titre-prop">Somme de la ligne ' + r + '</span>' +
      termes.map(function (t, i) { return tex((i ? '{}+' : '') + t) }).join(' ') + ' ' +
      tex('=' + texMilliers(somme)) + ' ' + tex('=2^{' + r + '}') + '</p>'

    if (this._impairs) {
      var nbImp = C[r].filter(function (x) { return x % 2 }).length
      h += '<p class="ligne-calc"><span class="titre-prop">Impairs</span>Ligne ' + r + ' : ' + nbImp +
        (nbImp > 1 ? ' coefficients impairs' : ' coefficient impair') + ' sur ' + (r + 1) + '. '
      if (this._n < N_MAX) h += 'Monte jusqu’à ' + tex('n=15') + ' : les cases impaires dessinent le triangle de Sierpiński, des triangles creux emboîtés. '
      else h += 'Les cases impaires dessinent le triangle de Sierpiński : chaque grand triangle contient trois copies de lui-même et un trou au centre. '
      h += 'Les lignes 1, 3, 7 et 15 sont entièrement impaires ; les lignes 2, 4 et 8 n’ont d’impairs qu’aux deux bouts.</p>'
    }

    if (this._dev && r === 0) {
      h += '<p class="ligne-calc"><span class="titre-prop">Développement</span>' + tex('(a+b)^{0}=1') + ' : la ligne 0 ne contient que ' + tex(cnk(0, 0) + '=1') + '.</p>'
    } else if (this._dev) {
      var morceaux = []
      for (var i = 0; i <= r; i++) {
        var c = C[r][i], ea = r - i, eb = i
        var s = c === 1 ? '' : texMilliers(c)
        if (ea > 0) s += 'a' + (ea > 1 ? '^{' + ea + '}' : '')
        if (eb > 0) s += 'b' + (eb > 1 ? '^{' + eb + '}' : '')
        if (s === '') s = '1'
        morceaux.push('<span class="terme' + (i === k ? ' vise' : '') + '">' + tex((i ? '{}+' : '') + s) + '</span>')
      }
      h += '<p class="ligne-calc"><span class="titre-prop">Développement</span>' + tex('(a+b)^{' + r + '}=') + ' ' + morceaux.join(' ') + '</p>' +
        '<p>Les coefficients sont ceux de la ligne ' + r + '. Le terme encadré, ' + tex(cnk(r, k) + '\\,a^{' + (r - k) + '}\\,b^{' + k + '}') +
        ', vient de la case choisie : on prend ' + tex('b') + ' dans ' + k + ' des ' + r + ' facteurs ' + tex('(a+b)') +
        ' et ' + tex('a') + ' dans les autres ; il y a ' + tex(cnk(r, k) + '=' + texMilliers(C[r][k])) + (C[r][k] > 1 ? ' façons' : ' façon') + ' de choisir ces facteurs.</p>'
    }
    this._sh.getElementById('panneau').innerHTML = h
  }
}

if (!customElements.get('pascal-vivant-widget')) customElements.define('pascal-vivant-widget', PascalVivantWidget)
