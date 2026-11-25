/* ================================================================
 * <cercles-deux-points-widget> — atelier « Cercles par deux points »
 * (6e, ch. 9, § 2). A et B à coordonnées entières (glissés au doigt,
 * ou choisis puis réglés aux curseurs), rayon r au pas de 0,5. Le
 * centre Ω d'un cercle de rayon r passant par A et B est à distance r
 * de A ET de B : c'est un point commun aux cercles de centres A et B et
 * de rayon r (pointillés), donc un point de la médiatrice de [AB].
 * 2r > AB : deux centres symétriques par rapport à (AB) ; 2r = AB : un
 * seul, le milieu M ; 2r < AB : aucun. Comparaison EXACTE ((2r)² et AB²
 * entiers), h = √(r² − (AB/2)²) en racine simplifiée, centres exacts
 * quand ils sont rationnels (sinon « ≈ »). Exemple du cours : A(0 ; 0),
 * B(6 ; 0), r = 5 → (3 ; 4) et (3 ; −4). Repère orthonormé à fenêtre
 * FIXE (cercles ronds). Web Component (Shadow DOM).
 * ================================================================ */
import './geo-analytique-commun.js'
import { styleKatex, tex, texEgalites, CSS_BASE } from './katex-shadow.js'
import { curseurHTML, majCurseur, borner } from './variables-aleatoires-commun.js'
import { texFrac, texRacine, texN, texDroite, CSS_LIEUX, racineEntiere, placeurEtiquettes } from './lieux-geometriques-commun.js'

var G = window.GeoAnaCommun
var FEN = { xMin: -6, xMax: 12, yMin: -9.5, yMax: 9.5 }
var R = G.repere(FEN, 20, 14)
var BORNES = { xMin: -5, xMax: 11, yMin: -8, yMax: 8 }
var R_MIN = 0.5, R_MAX = 8, R_PAS = 0.5
var DEPART = { A: [0, 0], B: [6, 0], r: 5 }

function coordTex(nom, x, y) { return tex(nom + '\\left(' + x + '\\,;' + y + '\\right)') }

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE + CSS_LIEUX +
  '.c-sol1{fill:none;stroke:var(--accent,#b65c1f);stroke-width:2.4;}' +
  '.c-sol2{fill:none;stroke:var(--good,#2f7a4f);stroke-width:2.4;}' +
  '.c-aide{fill:none;stroke:var(--sky,#2f6fb0);stroke-width:1.4;stroke-dasharray:5 4;}' +
  '.mediatrice{stroke:var(--plan,#5b4ea3);stroke-width:1.6;stroke-dasharray:7 5;}' +
  '.seg-ab{stroke:var(--ink,#182430);stroke-width:2.2;}' +
  '.rayon{stroke:var(--ink-soft,#51626f);stroke-width:1.3;stroke-dasharray:3 3;}' +
  '.sommets .btn{min-width:52px;font-family:var(--serif,serif);font-style:italic;}' +
  '.c-sky{color:var(--sky-ink,#1f4e7d);font-weight:700;}' +
  '</style>' +
  '<p class="consigne">Fais glisser A ou B (coordonnées entières), puis règle le rayon r.</p>' +
  '<div class="figure"><svg id="svg" class="glisser" viewBox="0 0 ' + R.L + ' ' + R.H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Les points A et B, la médiatrice de [AB] et les cercles de rayon r passant par A et B"></svg></div>' +
  '<p class="verdict" id="verdict" aria-live="polite"></p>' +
  '<div class="reglages">' + curseurHTML('r', 'Rayon r', R_MIN, R_MAX, R_PAS) + '</div>' +
  '<div class="rangee sommets" role="group" aria-label="Point à régler aux curseurs"><span class="etiquette">Point à régler :</span>' +
  '<button class="btn" data-s="A">A</button><button class="btn" data-s="B">B</button></div>' +
  '<div class="reglages">' + curseurHTML('px', 'Abscisse du point choisi', BORNES.xMin, BORNES.xMax, 1) + curseurHTML('py', 'Ordonnée du point choisi', BORNES.yMin, BORNES.yMax, 1) + '</div>' +
  '<div class="rangee"><button class="btn" id="exemple">Exemple du cours</button></div>' +
  '<div class="panneau" id="calcul" aria-live="polite"></div>'

class CerclesDeuxPointsWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._P = { A: DEPART.A.slice(), B: DEPART.B.slice() }
    this._r = DEPART.r
    this._actif = 'B'
    this._ecouteurs = []
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh, svg = sh.getElementById('svg')
    function reglerR(v) { self._r = borner(Math.round(v / R_PAS) * R_PAS, R_MIN, R_MAX); self._rendre() }
    sh.getElementById('r').addEventListener('input', function (e) { reglerR(parseFloat(e.target.value)) })
    sh.getElementById('r-moins').addEventListener('click', function () { reglerR(self._r - R_PAS) })
    sh.getElementById('r-plus').addEventListener('click', function () { reglerR(self._r + R_PAS) })
    sh.querySelectorAll('[data-s]').forEach(function (b) {
      b.addEventListener('click', function () { self._actif = b.getAttribute('data-s'); self._rendre() })
    })
    function reglerCoord(i, v) {
      var P = self._P[self._actif].slice()
      P[i] = Math.round(v)
      self._deplacer(self._actif, P[0], P[1])
    }
    sh.getElementById('px').addEventListener('input', function (e) { reglerCoord(0, parseFloat(e.target.value)) })
    sh.getElementById('px-moins').addEventListener('click', function () { reglerCoord(0, self._P[self._actif][0] - 1) })
    sh.getElementById('px-plus').addEventListener('click', function () { reglerCoord(0, self._P[self._actif][0] + 1) })
    sh.getElementById('py').addEventListener('input', function (e) { reglerCoord(1, parseFloat(e.target.value)) })
    sh.getElementById('py-moins').addEventListener('click', function () { reglerCoord(1, self._P[self._actif][1] - 1) })
    sh.getElementById('py-plus').addEventListener('click', function () { reglerCoord(1, self._P[self._actif][1] + 1) })
    sh.getElementById('exemple').addEventListener('click', function () {
      self._P = { A: DEPART.A.slice(), B: DEPART.B.slice() }; self._r = DEPART.r; self._rendre()
    })
    G.glisser(this, svg, R, function (n) { self._actif = n; self._rendre() }, function (n, x, y) { self._deplacer(n, Math.round(x), Math.round(y)) })
    this._rendre()
  }

  _deplacer(n, x, y) {
    x = borner(x, BORNES.xMin, BORNES.xMax); y = borner(y, BORNES.yMin, BORNES.yMax)
    var autre = this._P[n === 'A' ? 'B' : 'A']
    if (x === autre[0] && y === autre[1]) return // A et B distincts
    if (x === this._P[n][0] && y === this._P[n][1]) return
    this._P[n] = [x, y]
    this._rendre()
  }

  _rendre() {
    var sh = this._sh, self = this, A = this._P.A, B = this._P.B, r = this._r
    var dx = B[0] - A[0], dy = B[1] - A[1], d2 = dx * dx + dy * dy
    var n = Math.round(2 * r), n2 = n * n, ecart = n2 - d2
    var AB = Math.sqrt(d2)
    var Mx = (A[0] + B[0]) / 2, My = (A[1] + B[1]) / 2
    var med = G.reduire(2 * dx, 2 * dy, -(B[0] * B[0] + B[1] * B[1] - A[0] * A[0] - A[1] * A[1]))

    // ---------- Curseurs ----------
    majCurseur(sh, 'r', r, 'r=' + texN(r, 1))
    var P = this._P[this._actif]
    majCurseur(sh, 'px', P[0], 'x_' + this._actif + '=' + texN(P[0], 0))
    majCurseur(sh, 'py', P[1], 'y_' + this._actif + '=' + texN(P[1], 0))
    sh.querySelectorAll('[data-s]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-s') === self._actif)) })

    // ---------- Centres ----------
    var centres = []
    var texAB = texRacine(1, d2, 1), tex2r = texN(n, 0)
    if (ecart === 0) centres.push({ x: Mx, y: My, tx: texFrac(A[0] + B[0], 2), ty: texFrac(A[1] + B[1], 2), exact: true })
    else if (ecart > 0) {
      var f = Math.sqrt(ecart / d2) / 2 // Ω = M ± f·(−dy ; dx)
      var s = racineEntiere(ecart * d2)
      ;[1, -1].forEach(function (sg) {
        var c = { x: Mx - sg * f * dy, y: My + sg * f * dx }
        if (s >= 0) { c.exact = true; c.tx = texFrac((A[0] + B[0]) * d2 - sg * dy * s, 2 * d2); c.ty = texFrac((A[1] + B[1]) * d2 + sg * dx * s, 2 * d2) }
        else { c.exact = false; c.tx = texN(c.x, 2); c.ty = texN(c.y, 2) }
        centres.push(c)
      })
    }

    // ---------- Verdict ----------
    var v = sh.getElementById('verdict')
    if (ecart > 0) { v.className = 'verdict ok'; v.innerHTML = '2r > AB : deux centres, symétriques par rapport à (AB).' }
    else if (ecart === 0) { v.className = 'verdict neutre'; v.innerHTML = '2r = AB : un seul centre, le milieu M de [AB].' }
    else { v.className = 'verdict ko'; v.innerHTML = '2r < AB : aucun cercle de rayon r ne passe par A et B.' }

    // ---------- Calcul ----------
    var h = '<p class="titre-panneau">Le calcul</p>'
    h += '<p class="ligne">' + coordTex('A', texN(A[0], 0), texN(A[1], 0)) + ', ' + coordTex('B', texN(B[0], 0), texN(B[1], 0)) + ' : ' +
      texEgalites(['AB=\\sqrt{' + dx * dx + '+' + dy * dy + '}', texAB], '=') + (racineEntiere(d2) < 0 ? ' ' + tex('\\approx' + texN(AB, 2)) : '') + '.</p>'
    h += '<p class="ligne">' + tex('2r=' + tex2r) + ' ; on compare les carrés : ' + tex('(2r)^2=' + n2) + ' et ' + tex('AB^2=' + d2) + ', donc ' +
      tex('2r' + (ecart > 0 ? '>' : ecart < 0 ? '<' : '=') + 'AB') + '.</p>'
    h += '<p class="ligne">Le centre <span class="c-plan">Ω est sur la médiatrice</span> de [AB] (à égale distance de A et de B) : ' + tex(texDroite(med[0], med[1], med[2], 0)) + '.</p>'
    h += '<p>Il est à distance r de A <strong>et</strong> de B : c’est un point commun aux <span class="c-sky">cercles de centres A et B et de rayon r</span> (pointillés).</p>'
    if (ecart > 0) {
      h += '<p class="ligne">Du milieu ' + coordTex('M', texFrac(A[0] + B[0], 2), texFrac(A[1] + B[1], 2)) + ' au centre (Pythagore dans le triangle AMΩ) : ' +
        texEgalites(['h=\\sqrt{r^2-\\left(\\tfrac{AB}{2}\\right)^2}', '\\sqrt{' + texFrac(n2, 4) + '-' + texFrac(d2, 4) + '}', texRacine(1, ecart, 2)], '=') + '.</p>'
      h += '<p class="ligne">Centres : <span class="c-acc">' + coordTex('\\Omega_1' + (centres[0].exact ? '' : '\\approx'), centres[0].tx, centres[0].ty) + '</span> et <span class="c-good">' +
        coordTex('\\Omega_2' + (centres[1].exact ? '' : '\\approx'), centres[1].tx, centres[1].ty) + '</span>, de part et d’autre de M sur la médiatrice.</p>'
      h += '<p class="note">Ne donne pas un seul centre : les deux cercles passent par A et B.</p>'
    } else if (ecart === 0) {
      h += '<p class="ligne">' + tex('h=\\sqrt{r^2-\\left(\\tfrac{AB}{2}\\right)^2}=0') + ' : le seul centre est ' + coordTex('M', centres[0].tx, centres[0].ty) + ', et [AB] est un diamètre du cercle.</p>'
    } else {
      h += '<p>' + tex('r^2-\\left(\\tfrac{AB}{2}\\right)^2=' + texFrac(n2, 4) + '-' + texFrac(d2, 4) + '<0') + ' : pas de racine carrée. Les deux cercles pointillés ne se coupent pas : un cercle de rayon r ne peut pas contenir deux points plus éloignés que son diamètre 2r.</p>'
    }
    sh.getElementById('calcul').innerHTML = h

    // ---------- Figure ----------
    var svg = sh.getElementById('svg')
    svg.innerHTML = ''
    R.fond(svg, 2)
    var clip = G.el('clipPath', { id: 'cadre' }, svg.querySelector('defs'))
    G.el('rect', { x: R.marge, y: R.marge, width: R.L - 2 * R.marge, height: R.H - 2 * R.marge }, clip)
    var g = G.el('g', { 'clip-path': 'url(#cadre)' }, svg)
    var u = R.unite
    function px(x, y) { return R.px(x, y) }
    function cercle(c, rr, cls) { var p = px(c[0], c[1]); G.el('circle', { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: (rr * u).toFixed(1), class: cls }, g) }
    function ligne(P1, P2, cls, par) { var a = px(P1[0], P1[1]), b = px(P2[0], P2[1]); G.el('line', { x1: a[0].toFixed(1), y1: a[1].toFixed(1), x2: b[0].toFixed(1), y2: b[1].toFixed(1), class: cls }, par || g) }
    function pt(P1, cls, rr) { var p = px(P1[0], P1[1]); G.el('circle', { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: rr || 4.5, class: cls }, svg) }
    // médiatrice : passe par M, dirigée par (−dy ; dx)
    var L0 = 60 / Math.hypot(dx, dy)
    ligne([Mx + dy * L0, My - dx * L0], [Mx - dy * L0, My + dx * L0], 'mediatrice')
    cercle(A, r, 'c-aide'); cercle(B, r, 'c-aide')
    if (centres.length === 2) { cercle([centres[0].x, centres[0].y], r, 'c-sol1'); cercle([centres[1].x, centres[1].y], r, 'c-sol2') }
    if (centres.length === 1) cercle([Mx, My], r, 'c-sol1')
    centres.forEach(function (c) { ligne([c.x, c.y], A, 'rayon'); ligne([c.x, c.y], B, 'rayon') })
    ligne(A, B, 'seg-ab')
    // points et étiquettes
    var pl = placeurEtiquettes(R.L, R.H)
    var tous = [A, B, [Mx, My]].concat(centres.map(function (c) { return [c.x, c.y] }))
    tous.forEach(function (q) { var p = px(q[0], q[1]); pl.point(p[0], p[1], 6) })
    if (centres.length !== 1) { pt([Mx, My], 'pt-rose', 3.5) }
    centres.forEach(function (c, i) { pt([c.x, c.y], i ? 'pt-good' : 'pt-acc', 5) })
    pt(A, 'pt', 5); pt(B, 'pt', 5)
    var pA = px(A[0], A[1]), pB = px(B[0], B[1])
    pl.poser(svg, pA[0], pA[1], 'A', '', dx >= 0 ? [1, 3] : [0, 2])
    pl.poser(svg, pB[0], pB[1], 'B', '', dx >= 0 ? [0, 2] : [1, 3])
    var pM = px(Mx, My)
    if (centres.length !== 1) pl.poser(svg, pM[0], pM[1], 'M', 'et-rose et-petit', [1, 0])
    centres.forEach(function (c, i) {
      var p = px(c.x, c.y)
      pl.poser(svg, p[0], p[1], centres.length === 1 ? 'Ω = M' : (i ? 'Ω₂' : 'Ω₁'), i ? 'et-good' : 'et-acc', [6, 7])
    })
    G.poignee(svg, R, A[0], A[1], 'A', this._actif === 'A')
    G.poignee(svg, R, B[0], B[1], 'B', this._actif === 'B')
  }
}

if (!customElements.get('cercles-deux-points-widget')) customElements.define('cercles-deux-points-widget', CerclesDeuxPointsWidget)
