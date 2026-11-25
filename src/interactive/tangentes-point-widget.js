/* ================================================================
 * <tangentes-point-widget> — atelier « Tangentes depuis un point »
 * (6e, ch. 9, § 2). Cercle x² + y² = 25 (centre O, r = 5) ; P à
 * coordonnées entières, glissé au doigt (ou réglé aux curseurs).
 * OP < r : aucune tangente ; OP = r : une seule, perpendiculaire à
 * [OP] ; OP > r : deux. Méthode du cours : droite a(x − x_P) +
 * b(y − y_P) = 0, dist(O ; d) = r ⟺ (x_P² − 25)a² + 2x_P·y_P·ab +
 * (y_P² − 25)b² = 0 ; b = 0 (droite VERTICALE x = x_P) est solution ⟺
 * x_P² = 25, mise en évidence (y = mx + p l'aurait perdue). Équations
 * exactes (entières) quand PT = √(OP² − 25) est entier ou qu'une
 * tangente est verticale ; sinon coefficients arrondis au centième.
 * Points de contact (pieds des perpendiculaires menées de O), rayons
 * [OT] avec marque d'angle droit, PT = √(OP² − r²). Exemples du cours :
 * P(0 ; 13) et P(5 ; 3). Repère orthonormé à fenêtre FIXE.
 * Web Component (Shadow DOM).
 * ================================================================ */
import './geo-analytique-commun.js'
import { styleKatex, tex, texEgalites, CSS_BASE } from './katex-shadow.js'
import { curseurHTML, majCurseur, borner } from './variables-aleatoires-commun.js'
import { texFrac, texRacine, texN, texDroite, CSS_LIEUX, racineEntiere, placeurEtiquettes, marqueAngleDroit, texPolynome } from './lieux-geometriques-commun.js'

var G = window.GeoAnaCommun
var FEN = { xMin: -10, xMax: 10, yMin: -7.5, yMax: 14 }
var R = G.repere(FEN, 18, 14)
var RAYON = 5, R2 = 25
var BORNES = { xMin: -9, xMax: 9, yMin: -7, yMax: 13 }
var PRESETS = { p1: { nom: 'P(0 ; 13)', P: [0, 13] }, p2: { nom: 'P(5 ; 3)', P: [5, 3] }, p3: { nom: 'P(3 ; 4)', P: [3, 4] }, p4: { nom: 'P(1 ; 2)', P: [1, 2] } }

/** Équation entière ax + by + c = 0 (déjà réduite) ; verticale écrite x = k. */
function texEqEntiere(a, b, c) {
  if (b === 0) return 'x=' + texFrac(-c, a)
  if (a === 0) return 'y=' + texFrac(-c, b)
  return texDroite(a, b, c, 0)
}

/**
 * Tangentes menées de P(X ; Y) au cercle x² + y² = 25 (OP² > 25) : liste de
 * { a, b, c (ax + by + c = 0), exact, tex, T: [x, y], tT (LaTeX du point de contact), verticale }.
 */
function tangentes(X, Y) {
  var A0 = X * X - R2, B0 = 2 * X * Y, m = X * X + Y * Y - R2, s = racineEntiere(m)
  var dirs = [] // (a ; b) entiers si exact, sinon décimaux
  if (A0 === 0) { dirs.push({ a: 1, b: 0, exact: true }); dirs.push({ a: -(Y * Y - R2), b: B0, exact: true }) }
  else if (s >= 0) { dirs.push({ a: -X * Y + 5 * s, b: A0, exact: true }); dirs.push({ a: -X * Y - 5 * s, b: A0, exact: true }) }
  else { var rm = Math.sqrt(m); dirs.push({ a: -X * Y + 5 * rm, b: A0, exact: false }); dirs.push({ a: -X * Y - 5 * rm, b: A0, exact: false }) }
  return dirs.map(function (d) {
    var a = d.a, b = d.b, c = -(a * X + b * Y), t = { exact: d.exact }
    if (d.exact) {
      var r = G.reduire(a, b, c); a = r[0]; b = r[1]; c = r[2]
      var n2 = a * a + b * b
      t.T = [-c * a / n2, -c * b / n2]
      t.tT = '\\left(' + texFrac(-c * a, n2) + '\\,;' + texFrac(-c * b, n2) + '\\right)'
      t.tex = texEqEntiere(a, b, c)
    } else {
      // normalisation b = 1 (b ≠ 0 ici : A0 ≠ 0), coefficients arrondis au centième
      a /= b; c /= b; b = 1
      var n2d = a * a + 1
      t.T = [-c * a / n2d, -c / n2d]
      t.tT = '\\left(' + texN(t.T[0], 2) + '\\,;' + texN(t.T[1], 2) + '\\right)'
      t.tex = texDroite(a, b, c, 2)
    }
    t.a = a; t.b = b; t.c = c; t.verticale = b === 0
    return t
  })
}

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE + CSS_LIEUX +
  '.cercle{fill:var(--sky,#2f6fb0);fill-opacity:0.06;stroke:var(--sky,#2f6fb0);stroke-width:2.2;}' +
  '.t1{stroke:var(--good,#2f7a4f);stroke-width:2.2;}' +
  '.t2{stroke:var(--plan,#5b4ea3);stroke-width:2.2;}' +
  '.t-vert{stroke:var(--attn,#96650c);stroke-width:3.2;}' +
  '.seg-pt{stroke:var(--rose,#b23a7a);stroke-width:4;stroke-linecap:round;opacity:0.55;}' +
  '.seg-op{stroke:var(--ink-soft,#51626f);stroke-width:1.3;stroke-dasharray:3 4;}' +
  '.rayon{stroke:var(--ink-soft,#51626f);stroke-width:1.5;stroke-dasharray:5 4;}' +
  '.presets .btn{font-size:0.86rem;}' +
  '.methode p{line-height:1.9;}' +
  '</style>' +
  '<div class="rangee presets" role="group" aria-label="Exemples">' +
  Object.keys(PRESETS).map(function (k) { return '<button class="btn" data-p="' + k + '">' + PRESETS[k].nom + '</button>' }).join('') + '</div>' +
  '<p class="consigne">Fais glisser P (coordonnées entières) : dedans, sur le cercle, dehors. Cercle x² + y² = 25.</p>' +
  '<div class="figure"><svg id="svg" class="glisser" viewBox="0 0 ' + R.L + ' ' + R.H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Le cercle de centre O et de rayon 5, le point P et les tangentes menées par P"></svg></div>' +
  '<p class="verdict" id="verdict" aria-live="polite"></p>' +
  '<div class="reglages">' + curseurHTML('px', 'Abscisse de P', BORNES.xMin, BORNES.xMax, 1) + curseurHTML('py', 'Ordonnée de P', BORNES.yMin, BORNES.yMax, 1) + '</div>' +
  '<div class="panneau methode" id="calcul" aria-live="polite"></div>'

class TangentesPointWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._P = PRESETS.p1.P.slice()
    this._ecouteurs = []
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh, svg = sh.getElementById('svg')
    sh.querySelectorAll('[data-p]').forEach(function (b) {
      b.addEventListener('click', function () { self._P = PRESETS[b.getAttribute('data-p')].P.slice(); self._rendre() })
    })
    function regler(i, v) { var P = self._P.slice(); P[i] = Math.round(v); self._deplacer(P[0], P[1]) }
    sh.getElementById('px').addEventListener('input', function (e) { regler(0, parseFloat(e.target.value)) })
    sh.getElementById('px-moins').addEventListener('click', function () { regler(0, self._P[0] - 1) })
    sh.getElementById('px-plus').addEventListener('click', function () { regler(0, self._P[0] + 1) })
    sh.getElementById('py').addEventListener('input', function (e) { regler(1, parseFloat(e.target.value)) })
    sh.getElementById('py-moins').addEventListener('click', function () { regler(1, self._P[1] - 1) })
    sh.getElementById('py-plus').addEventListener('click', function () { regler(1, self._P[1] + 1) })
    G.glisser(this, svg, R, function () {}, function (n, x, y) { self._deplacer(Math.round(x), Math.round(y)) })
    this._rendre()
  }

  _deplacer(x, y) {
    x = borner(x, BORNES.xMin, BORNES.xMax); y = borner(y, BORNES.yMin, BORNES.yMax)
    if (x === this._P[0] && y === this._P[1]) return
    this._P = [x, y]
    this._rendre()
  }

  _rendre() {
    var sh = this._sh, X = this._P[0], Y = this._P[1]
    var OP2 = X * X + Y * Y, m = OP2 - R2
    var A0 = X * X - R2, B0 = 2 * X * Y, C0 = Y * Y - R2
    var ts = m > 0 ? tangentes(X, Y) : []
    var unique = null
    if (m === 0) { var r = G.reduire(X, Y, -R2); unique = { a: r[0], b: r[1], c: r[2], tex: texEqEntiere(r[0], r[1], r[2]), verticale: r[1] === 0 } }
    majCurseur(sh, 'px', X, 'x_P=' + texN(X, 0))
    majCurseur(sh, 'py', Y, 'y_P=' + texN(Y, 0))
    sh.querySelectorAll('[data-p]').forEach(function (b) { var q = PRESETS[b.getAttribute('data-p')].P; b.setAttribute('aria-pressed', String(q[0] === X && q[1] === Y)) })

    // ---------- Verdict ----------
    var v = sh.getElementById('verdict')
    if (m < 0) { v.className = 'verdict ko'; v.textContent = 'OP < r : P est à l’intérieur du cercle, aucune tangente (toute droite par P coupe le cercle en deux points).' }
    else if (m === 0) { v.className = 'verdict neutre'; v.textContent = 'OP = r : P est sur le cercle, une seule tangente, perpendiculaire au rayon [OP].' }
    else { v.className = 'verdict ok'; v.textContent = 'OP > r : P est à l’extérieur du cercle, deux tangentes, de même longueur PT.' }

    // ---------- Calcul ----------
    var h = '<p class="titre-panneau">Le calcul</p>'
    h += '<p>' + tex('OP^2=' + texN(X, 0).replace(/^-/, '(-') + (X < 0 ? ')' : '') + '^2+' + texN(Y, 0).replace(/^-/, '(-') + (Y < 0 ? ')' : '') + '^2=' + OP2) + ' et ' + tex('r^2=25') + ' : ' +
      tex('OP' + (m > 0 ? '>' : m < 0 ? '<' : '=') + 'r') + '.</p>'
    if (m === 0) {
      h += '<p class="ligne">Tangente en P, de normale ' + tex('\\overrightarrow{OP}=\\left(' + texN(X, 0) + '\\,;' + texN(Y, 0) + '\\right)') + ' : ' + tex(unique.tex) + '. Ici ' + tex('PT=0') + '.</p>'
    } else if (m > 0) {
      var droiteP = (X === 0 ? 'ax' : 'a(x' + (X > 0 ? '-' : '+') + Math.abs(X) + ')') + '+' + (Y === 0 ? 'by' : 'b(y' + (Y > 0 ? '-' : '+') + Math.abs(Y) + ')') + '=0'
      h += '<p class="ligne">Droite par P : ' + tex(droiteP) + ' ; on impose ' + tex('\\mathrm{dist}(O\\,;d)=5') + ' :</p>'
      h += '<p class="ligne">' + texEgalites(['(' + texPolynome([[X, 'a'], [Y, 'b']]) + ')^2=25(a^2+b^2)'], '=') + ' ⟺ ' + tex(texPolynome([[A0, 'a^2'], [B0, 'ab'], [C0, 'b^2']]) + '=0') + '.</p>'
      if (A0 === 0) h += '<p class="c-attn">Ici ' + tex('x_P^2=25') + ' : le terme en ' + tex('a^2') + ' disparaît et ' + tex('b=0') + ' est solution — la droite VERTICALE ' + tex('x=' + X) + ' est tangente. Avec ' + tex('y=mx+p') + ', on l’aurait perdue.</p>'
      else h += '<p class="note">' + tex('b=0') + ' (droite verticale ' + tex('x=' + X) + ') n’est pas solution, car ' + tex('x_P^2\\neq25') + ' : pas de tangente verticale ici.</p>'
      h += '<p class="ligne">Tangentes : <span class="c-good">' + tex(ts[0].tex) + '</span> et <span class="c-plan">' + tex(ts[1].tex) + '</span>' + (ts[0].exact ? '' : ' <span class="note">(coefficients arrondis au centième)</span>') + '.</p>'
      h += '<p class="ligne">Points de contact (pieds des perpendiculaires menées de O) : ' + tex('T_1' + (ts[0].exact ? '' : '\\approx') + ts[0].tT) + ' et ' + tex('T_2' + (ts[1].exact ? '' : '\\approx') + ts[1].tT) + '.</p>'
      h += '<p class="ligne">Longueur : ' + texEgalites(['PT=\\sqrt{OP^2-r^2}', '\\sqrt{' + OP2 + '-25}', texRacine(1, m, 1)], '=') + (racineEntiere(m) < 0 ? ' ' + tex('\\approx' + texN(Math.sqrt(m), 2)) : '') + ' <span class="note">(Pythagore dans le triangle OTP rectangle en T)</span>.</p>'
    } else {
      h += '<p>Toute droite passant par P est à une distance de O au plus égale à ' + tex('OP<5') + ' : elle coupe le cercle en deux points, aucune n’est tangente.</p>'
    }
    sh.getElementById('calcul').innerHTML = h

    // ---------- Figure ----------
    var svg = sh.getElementById('svg')
    svg.innerHTML = ''
    R.fond(svg, 2)
    var clip = G.el('clipPath', { id: 'cadre' }, svg.querySelector('defs'))
    G.el('rect', { x: R.marge, y: R.marge, width: R.L - 2 * R.marge, height: R.H - 2 * R.marge }, clip)
    var g = G.el('g', { 'clip-path': 'url(#cadre)' }, svg)
    var O = R.px(0, 0), pP = R.px(X, Y)
    G.el('circle', { cx: O[0].toFixed(1), cy: O[1].toFixed(1), r: (RAYON * R.unite).toFixed(1), class: 'cercle' }, g)
    function ligne(P1, P2, cls) { var a = R.px(P1[0], P1[1]), b = R.px(P2[0], P2[1]); G.el('line', { x1: a[0].toFixed(1), y1: a[1].toFixed(1), x2: b[0].toFixed(1), y2: b[1].toFixed(1), class: cls }, g) }
    function droite(t, cls) { var L = 60 / Math.hypot(t.a, t.b); ligne([X + t.b * L, Y - t.a * L], [X - t.b * L, Y + t.a * L], t.verticale ? 't-vert' : cls) }
    ligne([0, 0], [X, Y], 'seg-op')
    ts.forEach(function (t, i) {
      droite(t, i ? 't2' : 't1')
      ligne([X, Y], t.T, 'seg-pt')
      ligne([0, 0], t.T, 'rayon')
      var pT = R.px(t.T[0], t.T[1])
      marqueAngleDroit(g, pT, O, pP, 9, 'trait-soft fin')
    })
    if (unique) { droite(unique, 't1'); ligne([0, 0], [X, Y], 'rayon'); marqueAngleDroit(g, pP, O, R.px(X - unique.b, Y + unique.a), 9, 'trait-soft fin') }
    var pl = placeurEtiquettes(R.L, R.H)
    pl.point(O[0], O[1], 6); pl.point(pP[0], pP[1], 8)
    ts.forEach(function (t) { var p = R.px(t.T[0], t.T[1]); pl.point(p[0], p[1], 6) })
    G.el('circle', { cx: O[0].toFixed(1), cy: O[1].toFixed(1), r: 4, class: 'pt' }, svg)
    ts.forEach(function (t, i) { var p = R.px(t.T[0], t.T[1]); G.el('circle', { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: 4.5, class: i ? 'pt-plan' : 'pt-good' }, svg) })
    G.el('circle', { cx: pP[0].toFixed(1), cy: pP[1].toFixed(1), r: 6.5, class: m < 0 ? 'pt-bad' : 'pt-acc' }, svg)
    pl.poser(svg, O[0], O[1], 'O', '', [3, 2])
    pl.poser(svg, pP[0], pP[1], 'P', m < 0 ? 'et-bad' : 'et-acc', [6, 7, 2, 3])
    ts.forEach(function (t, i) {
      var p = R.px(t.T[0], t.T[1])
      // étiquette du côté opposé à O
      var pref = (p[0] >= O[0] ? (p[1] <= O[1] ? [0, 6] : [2, 6]) : (p[1] <= O[1] ? [1, 7] : [3, 7]))
      pl.poser(svg, p[0], p[1], i ? 'T₂' : 'T₁', i ? 'et-plan' : 'et-good', pref)
    })
    ts.concat(unique ? [unique] : []).forEach(function (t) {
      if (!t.verticale) return
      var p = R.px(X, Y > 3 ? FEN.yMin + 1.2 : FEN.yMax - 1.6)
      pl.poser(svg, p[0], p[1], 'x = ' + G.moins(X), 'et-attn et-petit', [6, 7])
    })
    G.poignee(svg, R, X, Y, 'P', false)
  }
}

if (!customElements.get('tangentes-point-widget')) customElements.define('tangentes-point-widget', TangentesPointWidget)
