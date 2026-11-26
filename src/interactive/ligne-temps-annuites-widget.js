/* ================================================================
 * <ligne-temps-annuites-widget> — atelier « La ligne du temps des
 * annuités » (5e (6h), algèbre financière, étape « annuités »).
 * n versements de montant a aux dates 1 à n, taux i par période.
 * L'élève choisit la date d'évaluation : 0 (valeur actuelle V₀, une
 * période avant le premier versement), n (valeur acquise Vₙ, au moment
 * du dernier) ou n + 1 (une période après : Vₙ(1 + i)). Chaque
 * versement j est capitalisé (flèche au-dessus de la ligne, vers la
 * droite, × (1 + i)ᵈ⁻ʲ) ou actualisé (flèche sous la ligne, vers la
 * gauche, × (1 + i)⁻⁽ʲ⁻ᵈ⁾). Le tableau additionne les valeurs, sans
 * arrondi intermédiaire, et la formule du cours donne le même total
 * (Vₙ = a((1 + i)ⁿ − 1)/i ; V₀ = a(1 − (1 + i)⁻ⁿ)/i). Ligne du temps
 * FIXE : dates 0 à 11. Préréglages du cours : 1 200 € par an, 5 ans,
 * 3 % (Vₙ ≈ 6 370,96 €) ; 2 000 € par an, 4 ans, 4 % (V₀ ≈ 7 259,79 €).
 * Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, texEgalites, CSS_BASE } from './katex-shadow.js'
import { curseurHTML, majCurseur, borner } from './variables-aleatoires-commun.js'
import { CSS_LIEUX } from './lieux-geometriques-commun.js'
import { CSS_STAT, el, texte } from './statistique-deux-variables-commun.js'
import { CSS_RS, insecables, nb, euros, texNb, texEuros, texPct } from './nombres-reels-suites-commun.js'

var DMAX = 11, L = 480, H = 268, X0 = 26, X1 = 446, YL = 132
function px(d) { return X0 + d * (X1 - X0) / DMAX }

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE + CSS_LIEUX + CSS_STAT + CSS_RS +
  '.figure svg{max-width:540px;}' +
  '.capi{fill:none;stroke:var(--sky,#2f6fb0);stroke-width:1.6;}' +
  '.actu{fill:none;stroke:var(--plan,#5b4ea3);stroke-width:1.6;}' +
  '.fl-capi{fill:var(--sky,#2f6fb0);}.fl-actu{fill:var(--plan,#5b4ea3);}' +
  '.versement{fill:var(--accent,#b65c1f);}' +
  '.cible{fill:var(--good,#2f7a4f);}' +
  '.legende{display:flex;flex-wrap:wrap;gap:4px 16px;justify-content:center;font-size:0.86rem;margin:0 0 8px;}' +
  '.legende span::before{content:"";display:inline-block;width:18px;height:3px;vertical-align:middle;margin-right:6px;}' +
  '.l-capi::before{background:var(--sky,#2f6fb0);}.l-actu::before{background:var(--plan,#5b4ea3);}' +
  '</style>' +
  '<div class="rangee" role="group" aria-label="Exemples du cours"><button class="btn" data-p="placement">Placement : 1 200 € par an</button><button class="btn" data-p="emprunt">Emprunt : 2 000 € par an</button></div>' +
  '<p class="consigne">Choisis la date à laquelle on évalue tous les versements.</p>' +
  '<div class="rangee" role="group" aria-label="Date d’évaluation" id="dates"></div>' +
  '<div class="legende"><span class="l-capi">capitaliser : × (1 + i) par période</span><span class="l-actu">actualiser : × (1 + i)⁻¹ par période</span></div>' +
  '<div class="figure"><svg id="svg" viewBox="0 0 ' + L + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ligne du temps des versements"></svg></div>' +
  '<p class="verdict ok" id="verdict" aria-live="polite"></p>' +
  '<div class="reglages">' + curseurHTML('a', 'Montant a de chaque versement', 100, 3000, 100) + curseurHTML('n', 'Nombre n de versements', 1, 10, 1) + curseurHTML('i', 'Taux i par période, en pour cent', 0.5, 10, 0.5) + '</div>' +
  '<div class="panneau" id="infos" aria-live="polite"></div>'

class LigneTempsAnnuitesWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._a = 1200
    this._n = 5
    this._ip = 3
    this._cible = 'n' // '0', 'n' ou 'n+1'
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    function lier(id, cle, min, max, pas) {
      function regler(v) { self[cle] = borner(Math.round(v / pas) * pas, min, max); self._rendre() }
      sh.getElementById(id).addEventListener('input', function (e) { regler(parseFloat(e.target.value)) })
      sh.getElementById(id + '-moins').addEventListener('click', function () { regler(self[cle] - pas) })
      sh.getElementById(id + '-plus').addEventListener('click', function () { regler(self[cle] + pas) })
    }
    lier('a', '_a', 100, 3000, 100)
    lier('n', '_n', 1, 10, 1)
    lier('i', '_ip', 0.5, 10, 0.5)
    sh.getElementById('dates').addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-c]')
      if (b) { self._cible = b.getAttribute('data-c'); self._rendre() }
    })
    sh.querySelectorAll('[data-p]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.getAttribute('data-p') === 'placement') { self._a = 1200; self._n = 5; self._ip = 3; self._cible = 'n' }
        else { self._a = 2000; self._n = 4; self._ip = 4; self._cible = '0' }
        self._rendre()
      })
    })
    this._rendre()
  }

  _rendre() {
    this._dessiner()
    insecables(this._sh)
  }

  _dessiner() {
    var sh = this._sh, a = this._a, n = this._n, i = this._ip / 100, q = 1 + i, cible = this._cible
    var d = cible === '0' ? 0 : cible === 'n' ? n : n + 1
    majCurseur(sh, 'a', a, 'a=' + texNb(a, 0))
    majCurseur(sh, 'n', n, 'n=' + n)
    majCurseur(sh, 'i', this._ip, 'i=' + texPct(i, 1))
    sh.querySelectorAll('[data-p]').forEach(function (b) {
      var p = b.getAttribute('data-p')
      b.setAttribute('aria-pressed', String(p === 'placement' ? a === 1200 && n === 5 && i === 0.03 : a === 2000 && n === 4 && i === 0.04))
    })
    var dates = [['0', 'V₀ : date 0'], ['n', 'Vₙ : date ' + n], ['n+1', 'Vₙ(1 + i) : date ' + (n + 1)]]
    sh.getElementById('dates').innerHTML = dates.map(function (c) { return '<button class="btn" data-c="' + c[0] + '" aria-pressed="' + (c[0] === cible) + '">' + c[1] + '</button>' }).join('')
    var nomV = cible === '0' ? 'V₀' : cible === 'n' ? 'Vₙ' : 'Vₙ(1 + i)'

    // valeurs de chaque versement à la date d (sans arrondi)
    var vals = [], total = 0
    for (var j = 1; j <= n; j++) { var v = a * Math.pow(q, d - j); vals.push(v); total += v }
    var rel = Math.abs(total * 100 - Math.round(total * 100)) < 1e-6 ? ' = ' : ' ≈ '

    // ---------- Figure ----------
    var svg = sh.getElementById('svg')
    svg.innerHTML = ''
    var defs = el('defs', {}, svg)
    ;[['fl-axe', 'fleche-axe'], ['fl-c', 'fl-capi'], ['fl-a', 'fl-actu']].forEach(function (m) {
      var mk = el('marker', { id: m[0], markerWidth: '8', markerHeight: '8', refX: '6', refY: '4', orient: 'auto', markerUnits: 'userSpaceOnUse' }, defs)
      el('path', { d: 'M0,0 L8,4 L0,8 Z', class: m[1] }, mk)
    })
    el('line', { x1: X0 - 10, y1: YL, x2: X1 + 24, y2: YL, class: 'axe', 'marker-end': 'url(#fl-axe)' }, svg)
    for (var k = 0; k <= DMAX; k++) {
      el('line', { x1: px(k).toFixed(1), y1: YL - 4, x2: px(k).toFixed(1), y2: YL + 4, class: 'tick' }, svg)
      texte(svg, px(k), YL + 18, String(k), 'graduation')
    }
    // arcs : au-dessus pour capitaliser (j < d), en dessous pour actualiser (j > d)
    for (j = 1; j <= n; j++) {
      if (j === d) continue
      var dist = Math.abs(d - j), haut = 14 + dist * 8.5, sens = j < d ? -1 : 1
      var o0 = sens < 0 ? 6 : 24, xa = px(j), xb = px(d), ym = YL + sens * (haut + o0)
      var dd = 'M' + xa.toFixed(1) + ',' + (YL + sens * o0) + ' C' + xa.toFixed(1) + ',' + ym.toFixed(1) + ' ' + xb.toFixed(1) + ',' + ym.toFixed(1) + ' ' + (xb + (j < d ? -2 : 2)).toFixed(1) + ',' + (YL + sens * (o0 + 3))
      el('path', { d: dd, class: j < d ? 'capi' : 'actu', 'marker-end': 'url(#' + (j < d ? 'fl-c' : 'fl-a') + ')' }, svg)
    }
    for (j = 1; j <= n; j++) {
      el('circle', { cx: px(j).toFixed(1), cy: YL, r: 6, class: 'versement' }, svg)
    }
    // date d'évaluation
    el('path', { d: 'M' + px(d).toFixed(1) + ',' + (YL - 9) + ' l-7,-12 h14 z', class: 'cible' }, svg)
    var maxH = 14 + Math.max(d - 1, 0) * 8.5 + 6
    var labV = nomV + rel + euros(total), demiV = labV.length * 3.9
    texte(svg, Math.max(demiV + 2, Math.min(L - demiV - 2, px(d))), Math.max(16, YL - Math.max(maxH, 26) - 10), labV, 'et et-good')
    svg.setAttribute('aria-label', n + ' versements de ' + nb(a, 0) + ' euros aux dates 1 à ' + n + ', évalués à la date ' + d + ' : ' + nomV + ' environ ' + euros(total))

    // ---------- Verdict ----------
    sh.getElementById('verdict').textContent = nomV + rel + euros(total) + ' (valeur ' + (n === 1 ? 'du versement' : 'des ' + n + ' versements') + ' à la date ' + d + ').'

    // ---------- Panneau ----------
    var h = '<p class="titre-panneau">Somme des valeurs à la date ' + d + '</p>'
    h += '<div class="defile"><table class="tableau"><thead><tr><th>versement</th><th>date</th><th>valeur à la date ' + d + '</th></tr></thead><tbody>'
    for (j = 1; j <= n; j++) {
      var e = d - j, fac = e === 0 ? tex(texNb(a, 0)) : tex(texNb(a, 0) + '\\cdot ' + texNb(q, 3) + '^{' + e + '}')
      h += '<tr><td>' + j + '</td><td>' + j + '</td><td class="d">' + fac + ' ' + (e === 0 ? '= ' : '≈ ') + euros(vals[j - 1]) + '</td></tr>'
    }
    h += '<tr class="actif"><td colspan="2">total</td><td class="d">' + rel.trim() + ' ' + euros(total) + '</td></tr>'
    h += '</tbody></table></div>'
    var qq = texNb(q, 3), ii = texNb(i, 3)
    if (cible === 'n') {
      h += '<p class="ligne">Somme géométrique de premier terme ' + tex('a') + ' et de raison ' + tex('1+i') + ' :</p>'
      h += '<p class="ligne">' + texEgalites(['V_n=a\\cdot\\dfrac{(1+i)^n-1}{i}', texNb(a, 0) + '\\cdot\\dfrac{' + qq + '^{' + n + '}-1}{' + ii + '}', '\\approx ' + texEuros(total)]) + ' €</p>'
    } else if (cible === '0') {
      h += '<p class="ligne">' + texEgalites(['V_0=a\\cdot\\dfrac{1-(1+i)^{-n}}{i}', texNb(a, 0) + '\\cdot\\dfrac{1-' + qq + '^{-' + n + '}}{' + ii + '}', '\\approx ' + texEuros(total)]) + ' €</p>'
      var vn = a * (Math.pow(q, n) - 1) / i
      h += '<p class="ligne">On a aussi ' + texEgalites(['V_0=V_n\\cdot(1+i)^{-n}', '\\approx ' + texEuros(vn) + '\\cdot ' + qq + '^{-' + n + '}']) + ' : actualiser ' + tex('V_n') + ' de ' + tex(String(n)) + ' périodes.</p>'
      h += '<p class="note">Pour un emprunt remboursé par ces versements (le premier une période après l’emprunt), ' + tex('V_0') + ' est le montant qu’on peut emprunter.</p>'
    } else {
      h += '<p class="ligne">' + texEgalites(['V_n\\cdot(1+i)', texNb(a, 0) + '\\cdot\\dfrac{' + qq + '^{' + n + '}-1}{' + ii + '}\\cdot ' + qq, '\\approx ' + texEuros(total)]) + ' €</p>'
      h += '<p class="note">C’est aussi la valeur, au moment du dernier versement, de ' + tex(String(n)) + ' versements faits en début de période.</p>'
    }
    sh.getElementById('infos').innerHTML = h
  }
}


if (!customElements.get('ligne-temps-annuites-widget')) customElements.define('ligne-temps-annuites-widget', LigneTempsAnnuitesWidget)
