/* ================================================================
 * <fractales-widget> — atelier « Flocon de von Koch et triangle de
 * Sierpinski » (5e (6h), suites, étape « sommes infinies »). Triangle
 * équilatéral de départ de côté 1 (aire A₀ = √3/4), étape n de 0 à 6.
 * Von Koch : chaque côté est remplacé par 4 côtés trois fois plus
 * courts ; cₙ = 3·4ⁿ côtés de longueur 1/3ⁿ, périmètre 3·(4/3)ⁿ → +∞ ;
 * l'étape k ajoute 3·4ᵏ⁻¹ triangles d'aire A₀/9ᵏ, d'où
 * Aₙ = A₀(1 + 3/5·(1 − (4/9)ⁿ)) → 8A₀/5 = 2√3/5 (somme géométrique de
 * raison 4/9). Sierpinski : chaque triangle plein est remplacé par 3
 * triangles de côté moitié ; 3ⁿ triangles, aire A₀(3/4)ⁿ → 0, périmètre
 * total 3·(3/2)ⁿ → +∞. Figure à cadre FIXE pour chaque fractale.
 * Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, texEgalites, CSS_BASE } from './katex-shadow.js'
import { curseurHTML, majCurseur, borner } from './variables-aleatoires-commun.js'
import { CSS_LIEUX } from './lieux-geometriques-commun.js'
import { CSS_STAT, el } from './statistique-deux-variables-commun.js'
import { CSS_RS, nb, nbFixe } from './nombres-reels-suites-commun.js'

var NMAX = 6, L = 400, H = 400, COTE = 300
var A0 = Math.sqrt(3) / 4
var HT = COTE * Math.sqrt(3) / 2

/** Sommets du triangle de départ (sens des aiguilles d'une montre à l'écran : les bosses de von Koch sortent). */
function triangle(yBase) { return [[50, yBase], [200, yBase - HT], [350, yBase]] }

/** Points du flocon à l'étape n. */
function koch(n) {
  var pts = triangle(290)
  pts.push(pts[0])
  for (var e = 0; e < n; e++) {
    var nv = [pts[0]]
    for (var i = 0; i < pts.length - 1; i++) {
      var p = pts[i], q = pts[i + 1], dx = (q[0] - p[0]) / 3, dy = (q[1] - p[1]) / 3
      var a = [p[0] + dx, p[1] + dy], b = [p[0] + 2 * dx, p[1] + 2 * dy]
      // pointe : (b − a) tourné de −60° autour de a (vers l'extérieur pour ce sens de parcours)
      var c = [a[0] + dx * 0.5 + dy * Math.sqrt(3) / 2, a[1] + dy * 0.5 - dx * Math.sqrt(3) / 2]
      nv.push(a, c, b, q)
    }
    pts = nv
  }
  return pts
}
/** Triangles pleins de Sierpinski à l'étape n (sommets). */
function sierpinski(n) {
  var t = [triangle(333)]
  for (var e = 0; e < n; e++) {
    var nv = []
    t.forEach(function (T) {
      var m01 = mil(T[0], T[1]), m12 = mil(T[1], T[2]), m02 = mil(T[0], T[2])
      nv.push([T[0], m01, m02], [m01, T[1], m12], [m02, m12, T[2]])
    })
    t = nv
  }
  return t
}
function mil(p, q) { return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2] }
function chemin(pts) { return 'M' + pts.map(function (p) { return p[0].toFixed(2) + ',' + p[1].toFixed(2) }).join(' L') + ' Z' }

/** Grandeurs à l'étape n (côté de départ 1). */
function grandeurs(f, n) {
  if (f === 'koch') return { nombre: 3 * Math.pow(4, n), cote: Math.pow(1 / 3, n), perimetre: 3 * Math.pow(4 / 3, n), aire: A0 * (1 + 0.6 * (1 - Math.pow(4 / 9, n))) }
  return { nombre: Math.pow(3, n), cote: Math.pow(1 / 2, n), perimetre: 3 * Math.pow(3 / 2, n), aire: A0 * Math.pow(3 / 4, n) }
}
/** Rationnel exact « a/b » si les deux tiennent (pour le périmètre et le côté). */
function texFrac(num, den) { return den === 1 ? String(num) : '\\dfrac{' + String(num).replace(/\B(?=(\d{3})+$)/g, '\\,') + '}{' + String(den).replace(/\B(?=(\d{3})+$)/g, '\\,') + '}' }

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE + CSS_LIEUX + CSS_STAT + CSS_RS +
  '.figure svg{max-width:340px;}' +
  '.flocon{fill:var(--sky,#2f6fb0);fill-opacity:0.22;stroke:var(--sky,#2f6fb0);stroke-width:1.3;stroke-linejoin:round;}' +
  '.depart{fill:none;stroke:var(--ink-soft,#51626f);stroke-width:1;stroke-dasharray:5 4;}' +
  '.plein{fill:var(--plan,#5b4ea3);fill-opacity:0.75;stroke:var(--plan,#5b4ea3);stroke-width:0.4;}' +
  '</style>' +
  '<div class="rangee" role="group" aria-label="Fractale"><button class="btn" data-f="koch">Flocon de von Koch</button><button class="btn" data-f="sierpinski">Triangle de Sierpinski</button></div>' +
  '<p class="consigne" id="consigne"></p>' +
  '<div class="figure"><svg id="svg" viewBox="0 0 ' + L + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Fractale"></svg></div>' +
  '<p class="verdict neutre" id="verdict" aria-live="polite"></p>' +
  '<div class="reglages">' + curseurHTML('n', 'Étape', 0, NMAX, 1) + '</div>' +
  '<div class="panneau" id="infos" aria-live="polite"></div>'

class FractalesWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._f = 'koch'
    this._n = 2
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    sh.querySelectorAll('[data-f]').forEach(function (b) { b.addEventListener('click', function () { self._f = b.getAttribute('data-f'); self._rendre() }) })
    function regler(v) { self._n = borner(Math.round(v), 0, NMAX); self._rendre() }
    sh.getElementById('n').addEventListener('input', function (e) { regler(parseFloat(e.target.value)) })
    sh.getElementById('n-moins').addEventListener('click', function () { regler(self._n - 1) })
    sh.getElementById('n-plus').addEventListener('click', function () { regler(self._n + 1) })
    this._rendre()
  }

  _rendre() {
    var sh = this._sh, f = this._f, n = this._n, G = grandeurs(f, n)
    sh.querySelectorAll('[data-f]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-f') === f)) })
    majCurseur(sh, 'n', n, 'n=' + n)
    var koch_ = f === 'koch'
    sh.getElementById('consigne').textContent = koch_
      ? 'À chaque étape, le tiers central de chaque côté est remplacé par deux côtés d’un petit triangle équilatéral tourné vers l’extérieur.'
      : 'À chaque étape, chaque triangle plein est partagé en quatre par les milieux de ses côtés, et on retire celui du centre.'

    // ---------- Figure ----------
    var svg = sh.getElementById('svg')
    svg.innerHTML = ''
    if (koch_) {
      el('path', { d: chemin(triangle(290)), class: 'depart' }, svg)
      el('path', { d: chemin(koch(n).slice(0, -1)), class: 'flocon' }, svg)
    } else {
      el('path', { d: chemin(triangle(333)), class: 'depart' }, svg)
      el('path', { d: sierpinski(n).map(chemin).join(' '), class: 'plein' }, svg)
    }
    svg.setAttribute('aria-label', (koch_ ? 'Flocon de von Koch' : 'Triangle de Sierpinski') + ', étape ' + n + ' : ' + nb(G.nombre, 0) + (koch_ ? ' côtés' : ' triangles') + ', périmètre environ ' + nb(G.perimetre, 3) + ', aire environ ' + nb(G.aire, 4))

    // ---------- Verdict ----------
    var v = sh.getElementById('verdict')
    v.textContent = 'Étape ' + n + ' : ' + nb(G.nombre, 0) + (koch_ ? ' côtés' : (G.nombre > 1 ? ' triangles pleins' : ' triangle plein')) + ', périmètre ' + (exactDec(G.perimetre) ? '= ' : '≈ ') + nb(G.perimetre, 4) + ', aire ≈ ' + nbFixe(G.aire, 4) + '.'

    // ---------- Panneau ----------
    var h = '<p class="titre-panneau">' + (koch_ ? 'Flocon de von Koch' : 'Triangle de Sierpinski') + ' (côté de départ 1, ' + tex('A_0=\\dfrac{\\sqrt{3}}{4}\\approx 0{,}4330') + ')</p>'
    h += '<div class="defile"><table class="tableau"><thead><tr><th>n</th><th>' + (koch_ ? 'côtés' : 'triangles') + '</th><th>côté</th><th>périmètre</th><th>aire</th></tr></thead><tbody>'
    for (var k = 0; k <= n; k++) {
      var g = grandeurs(f, k), den = koch_ ? Math.pow(3, k) : Math.pow(2, k), pnum = koch_ ? 3 * Math.pow(4, k) : 3 * Math.pow(3, k)
      h += '<tr' + (k === n ? ' class="actif"' : '') + '><td>' + k + '</td><td class="d">' + nb(g.nombre, 0) + '</td><td>' + tex(texFrac(1, den)) + '</td><td>' + tex(texFrac(pnum, den)) + '</td><td class="d">' + '≈ ' + nbFixe(g.aire, 4) + '</td></tr>'
    }
    h += '</tbody></table></div>'
    if (koch_) {
      h += '<p class="ligne">Périmètre : ' + texEgalites(['P_n=3\\cdot 4^n\\cdot\\dfrac{1}{3^n}', '3\\cdot\\left(\\dfrac{4}{3}\\right)^n']) + ', suite géométrique de raison ' + tex('\\dfrac{4}{3}>1') + ' : ' + tex('P_n\\to+\\infty') + '.</p>'
      h += '<p class="ligne">Aire : l’étape ' + tex('k') + ' ajoute ' + tex('3\\cdot 4^{k-1}') + ' triangles d’aire ' + tex('\\dfrac{A_0}{9^k}') + ', soit ' + tex('\\dfrac{A_0}{3}\\left(\\dfrac{4}{9}\\right)^{k-1}') + '.</p>'
      h += '<p class="ligne">' + texEgalites(['A_n=A_0+\\dfrac{A_0}{3}\\left(1+\\dfrac{4}{9}+\\ldots+\\left(\\dfrac{4}{9}\\right)^{n-1}\\right)', 'A_0\\left(1+\\dfrac{3}{5}\\left(1-\\left(\\dfrac{4}{9}\\right)^n\\right)\\right)']) + '</p>'
      h += '<p class="ligne">' + tex('A_n\\to A_0\\left(1+\\dfrac{3}{5}\\right)=\\dfrac{8}{5}\\cdot\\dfrac{\\sqrt{3}}{4}=\\dfrac{2\\sqrt{3}}{5}\\approx 0{,}6928') + ' : une aire finie entourée d’un périmètre infini.</p>'
    } else {
      h += '<p class="ligne">Aire : ' + texEgalites(['A_n=A_0\\cdot\\left(\\dfrac{3}{4}\\right)^n']) + ', suite géométrique de raison ' + tex('\\dfrac{3}{4}') + ' comprise entre 0 et 1 : ' + tex('A_n\\to 0') + '.</p>'
      h += '<p class="ligne">Périmètre total des triangles pleins : ' + texEgalites(['P_n=3^n\\cdot 3\\cdot\\dfrac{1}{2^n}', '3\\cdot\\left(\\dfrac{3}{2}\\right)^n']) + ', de raison ' + tex('\\dfrac{3}{2}>1') + ' : ' + tex('P_n\\to+\\infty') + '.</p>'
      h += '<p class="note">L’aire retirée en tout vaut ' + tex('A_0') + ' : ' + tex('\\dfrac{A_0}{4}\\left(1+\\dfrac{3}{4}+\\left(\\dfrac{3}{4}\\right)^2+\\ldots\\right)=\\dfrac{A_0}{4}\\cdot\\dfrac{1}{1-\\frac{3}{4}}=A_0') + '.</p>'
    }
    sh.getElementById('infos').innerHTML = h
  }
}

function exactDec(x) { return Math.abs(x * 1e4 - Math.round(x * 1e4)) < 1e-6 }

if (!customElements.get('fractales-widget')) customElements.define('fractales-widget', FractalesWidget)
