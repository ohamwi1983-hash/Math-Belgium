/* ================================================================
 * <droite-conique-widget> — atelier « Droite et conique » (6e, ch. 10,
 * § 4). Quatre coniques fixes, centrées ou de sommet O : l'ellipse
 * x² + 4y² = 8 et la parabole y² = 2x (exemples du cours), l'hyperbole
 * 4x² − y² = 4 (x² − y²/4 = 1, asymptotes y = ±2x) et l'hyperbole
 * d'axe vertical y² − 4x² = 4. La droite y = mx + k (m et k au pas de
 * 1/4, glissés par deux poignées ou réglés aux curseurs) ou x = h. La
 * substitution est écrite en valeurs EXACTES : équation à coefficients
 * entiers, discriminant Δ, points d'intersection (fractions ou racines
 * simplifiées). Verdict : sécante (Δ > 0), tangente (Δ = 0, point
 * double), extérieure (Δ < 0) — et le cas oublié : coefficient de x²
 * nul (droite parallèle à une asymptote ou à l'axe de la parabole),
 * équation du premier degré, UN point sans tangence ; ou aucun point
 * (l'asymptote elle-même). Bouton « Garder la droite tangente » : k est
 * alors calculé par la condition Δ = 0 (racine exacte), et la droite
 * roule le long de la conique quand on change m. Repère orthonormé à
 * fenêtre FIXE. Web Component (Shadow DOM).
 * ================================================================ */
import './geo-analytique-commun.js'
import { styleKatex, tex, texEgalites, CSS_BASE } from './katex-shadow.js'
import { curseurHTML, majCurseur, borner } from './variables-aleatoires-commun.js'
import { texN, CSS_LIEUX, placeurEtiquettes, pgcd } from './lieux-geometriques-commun.js'
import { Q, qAdd, qSub, qMul, qDiv, qNeg, qNum, texQ, cheminPts, groupeCadre, ptsEllipse, ptsHyperbole, ptsParabole, CSS_CONIQUES } from './coniques-commun.js'

var G = window.GeoAnaCommun
var FEN = { xMin: -5, xMax: 5, yMin: -4, yMax: 4 }
var R = G.repere(FEN, 40, 14)
var MMAX = 16 // m = M/4 dans [−4 ; 4]
var KMAX = 16 // k = K/4 dans [−4 ; 4]
var HMAX = 20 // h = H/4 dans [−5 ; 5]

/* ---------------- Nombres p + q√r (p, q rationnels, r entier sans facteur carré) ---------------- */

function S(p, q, r) { return { p: p, q: q || Q(0), r: r || 1 } }
function sRat(s) { return s.q.n === 0 || s.r === 1 }
function sVal(s) { return qNum(s.p) + qNum(s.q) * Math.sqrt(s.r) }
function sQ(s) { return s.r === 1 ? qAdd(s.p, s.q) : s.p } // valeur rationnelle (si sRat)
function sAdd(a, b) { var r = a.q.n === 0 ? b.r : a.r; return S(qAdd(a.p, b.p), qAdd(a.q, b.q), r) }
function sMulQ(a, c) { return S(qMul(a.p, c), qMul(a.q, c), a.r) }
/** Carré de p + q√r quand p·q = 0 (seul cas utile ici) : rationnel. */
function sCarre(a) { return qAdd(qMul(a.p, a.p), qMul(Q(a.r), qMul(a.q, a.q))) }
/** √x pour un rationnel x ≥ 0 : 0 + (k/d)√m. */
function sRacine(x) {
  if (x.n === 0) return S(Q(0))
  var p = x.n * x.d, k = 1, m = p
  for (var f = 2; f * f <= m; f++) { while (m % (f * f) === 0) { m /= f * f; k *= f } }
  return m === 1 ? S(Q(k, x.d)) : S(Q(0), Q(k, x.d), m)
}
function lcm(a, b) { return a / pgcd(a, b) * b }
/** LaTeX de p + q√r : « \frac{-3+\sqrt{5}}{2} », « 2\sqrt{2} », « -\frac{5}{4} ». */
function texS(s) {
  if (sRat(s)) return texQ(sQ(s))
  var L = lcm(s.p.d, s.q.d), P = s.p.n * (L / s.p.d), K = s.q.n * (L / s.q.d)
  var g = pgcd(pgcd(P, K), L); P /= g; K /= g; L /= g
  var rad = (Math.abs(K) === 1 ? '' : Math.abs(K)) + '\\sqrt{' + s.r + '}'
  var num = P === 0 ? (K < 0 ? '-' : '') + rad : P + (K < 0 ? '-' : '+') + rad
  if (L === 1) return num
  if (P === 0 && K < 0) return '-\\frac{' + rad + '}{' + L + '}'
  return '\\frac{' + num + '}{' + L + '}'
}

/* ---------------- Coniques : α x² + β y² + γ x = δ (entiers) ---------------- */

var CONIQUES = {
  ellipse: {
    nom: 'Ellipse', c: [1, 4, 0, 8], tex: 'x^2+4y^2=8', reduite: '\\frac{x^2}{8}+\\frac{y^2}{2}=1',
    subst: function (y) { return 'x^2+4' + y + '^2=8' }, substV: function (x) { return x + '^2+4y^2=8' },
    signeDelta: function () { return '8m^2+2-k^2' }, condTex: 'k^2=8m^2+2', tangK2: function (m) { return qAdd(qMul(Q(8), qMul(m, m)), Q(2)) },
    tangV: Q(8), tracer: function () { return [ptsEllipse(0, 0, Math.sqrt(8), Math.sqrt(2), 1, 0)] },
    presets: [['Cours : y = x/2 + 1', 2, 4], ['y = x/2 + 2', 2, 8], ['y = x/2 + 3', 2, 12]],
    noteTang: 'Pour toute pente m, il y a donc deux tangentes, symétriques par rapport à O.',
  },
  hyperbole: {
    nom: 'Hyperbole', c: [4, -1, 0, 4], tex: '4x^2-y^2=4', reduite: 'x^2-\\frac{y^2}{4}=1',
    subst: function (y) { return '4x^2-' + y + '^2=4' }, substV: function (x) { return '4' + x + '^2-y^2=4' },
    signeDelta: function () { return 'k^2+4-m^2' }, condTex: 'k^2=m^2-4', tangK2: function (m) { return qSub(qMul(m, m), Q(4)) },
    tangV: Q(1), asymptotes: true, tracer: function () { return ptsHyperbole(0, 0, 1, 2, 1, 0, 2.6) },
    presets: [['Cours : y = 2x + 1', 8, 4], ['L’asymptote y = 2x', 8, 0], ['y = 5x/2 + 3/2', 10, 6]],
    noteTang: 'Une tangente de pente m n’existe que si |m| > 2 (plus raide que les asymptotes).',
  },
  hyperboleV: {
    nom: 'Hyperbole d’axe vertical', c: [-4, 1, 0, 4], tex: 'y^2-4x^2=4', reduite: '\\frac{y^2}{4}-x^2=1',
    subst: function (y) { return y + '^2-4x^2=4' }, substV: function (x) { return 'y^2-4' + x + '^2=4' },
    signeDelta: function () { return 'k^2+m^2-4' }, condTex: 'k^2=4-m^2', tangK2: function (m) { return qSub(Q(4), qMul(m, m)) },
    tangV: null, asymptotes: true, tracer: function () { return ptsHyperbole(0, 0, 2, 1, 0, 1, 2.6) },
    presets: [['Tangente y = 2', 0, 8], ['y = 2x + 1', 8, 4], ['y = 3x − 1', 12, -4]],
    noteTang: 'Ici, une tangente de pente m n’existe que si |m| < 2 (plus plate que les asymptotes) : l’inverse de l’autre hyperbole.',
  },
  parabole: {
    nom: 'Parabole', c: [0, 1, -2, 0], tex: 'y^2=2x', reduite: 'y^2=2x',
    subst: function (y) { return y + '^2=2x' }, substV: function (x) { return 'y^2=2' + x },
    signeDelta: function () { return '1-2mk' }, tangK2: null, // tangente : k = 1/(2m)
    tangV: Q(0), tracer: function () { return [ptsParabole(0, 0, 1, 1, 0, 4.5)] },
    presets: [['Cours : y = 3', 0, 12], ['y = x/2 + 1', 2, 4], ['y = x − 1', 4, -4]],
    noteTang: 'Pour toute pente m non nulle, une seule tangente : k = 1/(2m). Une droite horizontale n’est jamais tangente.',
  },
}

/** Partie « mx + k » d'une droite en LaTeX. */
function texMxK(m, k) {
  var s = ''
  if (m.n !== 0) s = (m.n === m.d ? '' : m.n === -m.d ? '-' : texQ(m)) + 'x'
  var tk = texS(k)
  if (sRat(k) && sQ(k).n === 0) return s || '0'
  if (!s) return tk
  return s + (tk.charAt(0) === '-' ? tk : '+' + tk)
}

/** a·x² + b·x + c (a, c rationnels, b = p + q√r) ramené à des coefficients entiers premiers entre eux,
 * le premier positif. */
function entiers(a, b, c) {
  var L = lcm(lcm(a.d, c.d), lcm(b.p.d, b.q.d))
  var A = a.n * (L / a.d), C = c.n * (L / c.d), Bp = b.p.n * (L / b.p.d), Bq = b.q.n * (L / b.q.d)
  var g = pgcd(pgcd(A, C), pgcd(Bp, Bq))
  if (g === 0) g = 1
  if (A < 0 || (A === 0 && (Bp < 0 || Bq < 0))) g = -g // premier coefficient positif, comme au cours
  return { A: A / g + 0, Bp: Bp / g + 0, Bq: Bq / g + 0, r: b.r, C: C / g + 0 }
}

/** LaTeX de A v² + B v + C = 0 (B = Bp + Bq√r, Bp·Bq = 0). */
function texTrinome(t, v) {
  var s = ''
  function terme(corps, signe) { s += s ? (signe < 0 ? '-' : '+') + corps : (signe < 0 ? '-' : '') + corps }
  if (t.A) terme((Math.abs(t.A) === 1 ? '' : Math.abs(t.A)) + v + '^2', t.A)
  if (t.Bq) terme((Math.abs(t.Bq) === 1 ? '' : Math.abs(t.Bq)) + '\\sqrt{' + t.r + '}\\,' + v, t.Bq)
  else if (t.Bp) terme((Math.abs(t.Bp) === 1 ? '' : Math.abs(t.Bp)) + v, t.Bp)
  if (t.C) terme(String(Math.abs(t.C)), t.C)
  return (s || '0') + '=0'
}
function par(n) { return n < 0 ? '(' + n + ')' : String(n) }

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE + CSS_LIEUX + CSS_CONIQUES +
  '[hidden]{display:none !important;}' +
  '.dr-sec{stroke:var(--good,#2f7a4f);stroke-width:2.6;}' +
  '.dr-tg{stroke:var(--plan,#5b4ea3);stroke-width:2.6;}' +
  '.dr-ext{stroke:var(--bad,#b23a3a);stroke-width:2.6;}' +
  '.dr-un{stroke:var(--attn,#96650c);stroke-width:2.6;}' +
  '.pt-i{fill:var(--surface,#fff);stroke:var(--ink,#182430);stroke-width:2.6;}' +
  '.verdict.attn{color:var(--attn,#96650c);background:var(--attn-soft,#f7ecd6);}' +
  '.verdict.plan{color:var(--plan-ink,#443a80);background:var(--plan-soft,#e7e4f4);}' +
  '</style>' +
  '<div class="rangee" role="group" aria-label="Conique">' +
  Object.keys(CONIQUES).map(function (k) { return '<button class="btn" data-c="' + k + '">' + CONIQUES[k].nom + '</button>' }).join('') + '</div>' +
  '<div class="rangee presets" id="presets" role="group" aria-label="Exemples"></div>' +
  '<p class="consigne" id="consigne"></p>' +
  '<div class="figure"><svg id="svg" class="glisser" viewBox="0 0 ' + R.L + ' ' + R.H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="La conique, la droite et leurs points communs"></svg></div>' +
  '<p class="verdict" id="verdict" aria-live="polite"></p>' +
  '<div class="rangee" role="group" aria-label="Type de droite"><button class="btn" id="oblique">y = mx + k</button><button class="btn" id="verticale">x = h (verticale)</button></div>' +
  '<div class="reglages" id="reglages-mk">' + curseurHTML('m', 'Pente m', -MMAX, MMAX, 1) + curseurHTML('k', 'Ordonnée à l’origine k', -KMAX, KMAX, 1) + '</div>' +
  '<div class="reglages" id="reglages-h" hidden>' + curseurHTML('h', 'Abscisse h', -HMAX, HMAX, 1) + '</div>' +
  '<div class="rangee"><button class="btn" id="tangente" aria-pressed="false">Garder la droite tangente</button><button class="btn" id="signe" hidden>Autre tangente</button></div>' +
  '<div class="panneau" id="calcul" aria-live="polite"></div>' +
  '<div class="panneau" id="tangence"></div>'

class DroiteConiqueWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._c = 'ellipse'
    this._vert = false
    this._M = 2; this._K = 4; this._H = 4
    this._tang = false; this._signe = 1
    this._ecouteurs = []
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh, svg = sh.getElementById('svg')
    sh.querySelectorAll('[data-c]').forEach(function (b) {
      b.addEventListener('click', function () {
        self._c = b.getAttribute('data-c'); self._tang = false; self._vert = false
        var p = CONIQUES[self._c].presets[0]; self._M = p[1]; self._K = p[2]
        self._rendre()
      })
    })
    sh.getElementById('presets').addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-p]')
      if (!b) return
      var p = CONIQUES[self._c].presets[+b.getAttribute('data-p')]
      self._vert = false; self._tang = false; self._M = p[1]; self._K = p[2]; self._rendre()
    })
    sh.getElementById('oblique').addEventListener('click', function () { self._vert = false; self._rendre() })
    sh.getElementById('verticale').addEventListener('click', function () { self._vert = true; self._rendre() })
    function lier(id, cle, max, avant) {
      function regle(v) { if (avant) avant(); self[cle] = borner(Math.round(v), -max, max); self._rendre() }
      sh.getElementById(id).addEventListener('input', function (e) { regle(parseFloat(e.target.value)) })
      sh.getElementById(id + '-moins').addEventListener('click', function () { regle(self[cle] - 1) })
      sh.getElementById(id + '-plus').addEventListener('click', function () { regle(self[cle] + 1) })
    }
    lier('m', '_M', MMAX)
    lier('k', '_K', KMAX, function () { self._tang = false })
    lier('h', '_H', HMAX, function () { self._tang = false })
    sh.getElementById('tangente').addEventListener('click', function () { self._tang = !self._tang; self._rendre() })
    sh.getElementById('signe').addEventListener('click', function () { self._signe = -self._signe; self._rendre() })
    G.glisser(this, svg, R, function (n) {
      if (n !== 'pente') self._tang = false
    }, function (n, x, y) {
      if (n === 'h') { self._H = borner(Math.round(x * 4), -HMAX, HMAX) }
      else if (n === 'k') { self._K = borner(Math.round(y * 4), -KMAX, KMAX) }
      else if (n === 'pente') {
        var k0 = self._kVal()
        if (Math.abs(x) < 0.4) return
        self._M = borner(Math.round((y - k0) / x * 4), -MMAX, MMAX)
      }
      self._rendre()
    })
    this._rendre()
  }

  /** k exact : sur la grille (K/4), ou donné par la condition de tangence quand elle existe
   * (k² > 0 strictement : pour m = ±2, k² = 0 donne l'asymptote, pas une tangente). */
  _k() {
    var C = CONIQUES[this._c], m = Q(this._M, 4)
    if (this._tang && !this._vert) {
      if (this._c === 'parabole') { if (m.n !== 0) return { k: S(qDiv(Q(1), qMul(Q(2), m))), tg: true } }
      else { var k2 = C.tangK2(m); if (k2.n > 0) { var r = sRacine(k2); return { k: this._signe < 0 ? sMulQ(r, Q(-1)) : r, tg: true } } }
    }
    return { k: S(Q(this._K, 4)), tg: false }
  }
  _kVal() { return sVal(this._k().k) }
  _h() {
    var C = CONIQUES[this._c]
    if (this._tang && this._vert && C.tangV) { var r = sRacine(C.tangV); return { h: this._signe < 0 ? sMulQ(r, Q(-1)) : r, tg: true } }
    return { h: S(Q(this._H, 4)), tg: false }
  }

  _rendre() {
    var sh = this._sh, self = this, C = CONIQUES[this._c]
    var al = Q(C.c[0]), be = Q(C.c[1]), ga = Q(C.c[2]), de = Q(C.c[3])
    sh.querySelectorAll('[data-c]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-c') === self._c)) })
    sh.getElementById('presets').innerHTML = C.presets.map(function (p, i) {
      return '<button class="btn" data-p="' + i + '" aria-pressed="' + (!self._vert && !self._tang && self._M === p[1] && self._K === p[2]) + '">' + p[0] + '</button>'
    }).join('')
    sh.getElementById('oblique').setAttribute('aria-pressed', String(!this._vert))
    sh.getElementById('verticale').setAttribute('aria-pressed', String(this._vert))
    sh.getElementById('reglages-mk').hidden = this._vert
    sh.getElementById('reglages-h').hidden = !this._vert
    var tb = sh.getElementById('tangente')
    tb.setAttribute('aria-pressed', String(this._tang))
    tb.disabled = this._vert && !C.tangV
    if (this._vert && !C.tangV && this._tang) this._tang = false
    sh.getElementById('consigne').textContent = this._vert
      ? 'Fais glisser la poignée de la droite verticale, ou règle h.'
      : 'Fais glisser la droite par ses poignées (bleue : ordonnée à l’origine k ; blanche : pente m), ou règle m et k.'

    var m = Q(this._M, 4), kk = this._k(), hh = this._h()
    var k = kk.k, h = hh.h
    majCurseur(sh, 'm', this._M, 'm=' + texQ(m))
    majCurseur(sh, 'k', this._K, 'k=' + (kk.tg ? texS(k) : texQ(Q(this._K, 4))))
    sh.getElementById('k').disabled = kk.tg
    majCurseur(sh, 'h', this._H, 'h=' + (hh.tg ? texS(h) : texQ(Q(this._H, 4))))
    var sb = sh.getElementById('signe')
    sb.hidden = !(this._tang && ((kk.tg && this._c !== 'parabole') || (hh.tg && C.tangV && C.tangV.n !== 0)))

    // ---------- Substitution exacte ----------
    var t, v, eqDroite, ligneSubst, pts = [], delta = null, cas
    if (!this._vert) {
      eqDroite = 'y=' + texMxK(m, k)
      ligneSubst = C.subst('\\left(' + texMxK(m, k) + '\\right)')
      var A = qAdd(al, qMul(be, qMul(m, m)))
      var B = sAdd(sMulQ(k, qMul(Q(2), qMul(be, m))), S(ga))
      var Cc = qSub(qMul(be, sCarre(k)), de)
      t = entiers(A, B, Cc); v = 'x'
    } else {
      eqDroite = 'x=' + texS(h)
      ligneSubst = C.substV('\\left(' + texS(h) + '\\right)')
      var Cv = qSub(qAdd(qMul(al, sCarre(h)), qMul(ga, sQ(h))), de)
      t = entiers(be, S(Q(0)), Cv); v = 'y'
    }
    var B2 = t.Bp * t.Bp + t.Bq * t.Bq * t.r
    if (t.A !== 0) {
      delta = B2 - 4 * t.A * t.C
      cas = delta > 0 ? 'secante' : delta === 0 ? 'tangente' : 'exterieure'
      var D = 2 * t.A
      if (delta === 0) pts.push(S(Q(-t.Bp, D), Q(-t.Bq, D), t.r))
      else if (delta > 0) { // Bq = 0 ici (racine irrationnelle de k seulement quand Δ = 0)
        var rd = sRacine(Q(delta))
        pts.push(S(qAdd(Q(-t.Bp, D), qDiv(rd.p, Q(D))), qDiv(rd.q, Q(D)), rd.r))
        pts.push(S(qSub(Q(-t.Bp, D), qDiv(rd.p, Q(D))), qNeg(qDiv(rd.q, Q(D))), rd.r))
      }
    } else if (t.Bp !== 0 || t.Bq !== 0) { cas = 'un'; pts.push(S(Q(-t.C, t.Bp))) }
    else cas = t.C === 0 ? 'tout' : 'aucun'
    // coordonnées des points
    var points = pts.map(function (s) {
      if (!self._vert) return { x: s, y: sAdd(sMulQ(s, m), k) }
      return { x: h, y: s }
    })

    // ---------- Verdict ----------
    var vd = sh.getElementById('verdict'), cl, msg, clsDr
    var parallele = this._c === 'parabole' ? 'parallèle à l’axe de la parabole' : 'parallèle à une asymptote'
    if (cas === 'secante') { cl = 'ok'; clsDr = 'dr-sec'; msg = 'Δ > 0 : deux points communs, la droite est sécante.' }
    else if (cas === 'tangente') { cl = 'plan'; clsDr = 'dr-tg'; msg = 'Δ = 0 : un seul point, double — la droite est tangente.' }
    else if (cas === 'exterieure') { cl = 'ko'; clsDr = 'dr-ext'; msg = 'Δ < 0 : aucun point commun, la droite est extérieure.' }
    else if (cas === 'un') { cl = 'attn'; clsDr = 'dr-un'; msg = 'Le coefficient de x² est nul (droite ' + parallele + ') : l’équation est du premier degré. Un seul point, mais la droite n’est pas tangente : elle traverse la courbe.' }
    else { cl = 'ko'; clsDr = 'dr-ext'; msg = 'Les coefficients de x² et de x sont nuls : il reste une égalité fausse. Aucun point : c’est l’asymptote elle-même, que la courbe approche sans jamais l’atteindre.' }
    vd.className = 'verdict ' + cl; vd.textContent = msg

    // ---------- Panneau du calcul ----------
    var hc = '<p class="titre-panneau">Le système</p>'
    hc += '<p class="ligne">Conique ' + tex(C.tex) + (C.reduite !== C.tex ? ' (' + tex(C.reduite) + ')' : '') + ', droite ' + tex(eqDroite) + '.</p>'
    hc += '<p class="ligne">On remplace ' + (this._vert ? tex('x') : tex('y')) + ' : ' + tex(ligneSubst) + '</p>'
    hc += '<p class="ligne">En développant (coefficients entiers) : ' + tex(texTrinome(t, v)) + '</p>'
    if (t.A !== 0) {
      var tB = t.Bq ? (Math.abs(t.Bq) === 1 ? '' : Math.abs(t.Bq)) + '\\sqrt{' + t.r + '}' : String(t.Bp)
      var sB = t.Bq ? '(' + tB + ')^2' : par(t.Bp) + '^2'
      hc += '<p class="ligne">' + texEgalites(['\\Delta', sB + '-4\\cdot' + par(t.A) + '\\cdot' + par(t.C), String(delta)], '=') + '</p>'
      if (!this._vert) hc += '<p class="note">Pour toute droite ' + tex('y=mx+k') + ', ' + tex('\\Delta') + ' a le signe de ' + tex(C.signeDelta()) + (this._c === 'parabole' ? ' (quand m ≠ 0)' : '') + '.</p>'
    } else {
      hc += '<p class="ligne"><span class="c-attn">Pas de terme en ' + tex('x^2') + '</span> : pas de discriminant, l’équation est du premier degré' + (cas === 'un' ? '.' : ', et même sans terme en ' + tex('x') + '.') + '</p>'
    }
    if (points.length) {
      var noms = points.length === 2 ? ['I', 'J'] : [cas === 'tangente' ? 'T' : 'I']
      points.forEach(function (P, i) {
        var xv = sVal(P.x), yv = sVal(P.y), exact = sRat(P.x) && sRat(P.y)
        hc += '<p class="ligne">' + tex(noms[i] + '\\left(' + texS(P.x) + '\\,;' + texS(P.y) + '\\right)') +
          (exact ? '' : ' ' + tex('\\approx\\left(' + texN(xv, 2) + '\\,;' + texN(yv, 2) + '\\right)')) +
          (R.dansFenetre(xv, yv) ? '' : ' <span class="note">(hors du cadre)</span>') + '</p>'
      })
    } else hc += '<p class="ligne">Aucun point commun.</p>'
    sh.getElementById('calcul').innerHTML = hc

    // ---------- Condition de tangence ----------
    var ht = '<p class="titre-panneau">Quand la droite est-elle tangente ?</p>'
    if (!this._vert) {
      if (this._c === 'parabole') ht += '<p class="ligne">' + tex('\\Delta=0') + ' ⟺ ' + tex('2mk=1') + ', avec ' + tex('m\\neq0') + '.</p>'
      else {
        var k2 = C.tangK2(m)
        ht += '<p class="ligne">' + tex('\\Delta=0') + ' ⟺ ' + tex(C.condTex) + ' ; ici ' + tex('m=' + texQ(m)) + ' donne ' + tex('k^2=' + texQ(k2)) +
          (k2.n < 0 ? ' : impossible.' : k2.n === 0 ? ', soit ' + tex('k=0') + ' : mais cette droite est l’asymptote (coefficient de ' + tex('x^2') + ' nul), elle ne touche pas la courbe.' : ', soit ' + tex('k=\\pm' + texS(sRacine(k2))) + '.') + '</p>'
      }
      ht += '<p class="note">' + C.noteTang + '</p>'
      if (this._tang && !kk.tg) ht += '<p class="ligne c-bad">Aucune tangente de pente ' + tex('m=' + texQ(m)) + ' : la droite garde son ordonnée k.</p>'
    } else {
      ht += '<p class="ligne">' + (C.tangV ? 'Tangentes verticales : ' + tex('x=' + (C.tangV.n === 0 ? '0' : '\\pm' + texS(sRacine(C.tangV)))) + ' (aux sommets de l’axe focal).' : 'Aucune tangente verticale : toute verticale coupe cette hyperbole en deux points.') + '</p>'
    }
    sh.getElementById('tangence').innerHTML = ht

    // ---------- Figure ----------
    var svg = sh.getElementById('svg')
    svg.innerHTML = ''
    R.fond(svg, 1)
    var g = groupeCadre(G, svg, R, 'cadre-dc')
    if (C.asymptotes) { R.traceDroite(g, 2, -1, 0, 'asymptote'); R.traceDroite(g, -2, -1, 0, 'asymptote') }
    C.tracer().forEach(function (br) { G.el('path', { d: cheminPts(R, br), class: 'conique' }, g) })
    var kv = sVal(k), hv = sVal(h), mv = qNum(m)
    if (this._vert) R.traceDroite(g, 1, 0, -hv, clsDr)
    else R.traceDroite(g, mv, -1, kv, clsDr)
    var pl = placeurEtiquettes(R.L, R.H)
    var poignees = []
    if (this._vert) {
      if (hv >= FEN.xMin && hv <= FEN.xMax) poignees.push(['h', hv, FEN.yMin + 0.6, 'pt-sky'])
    } else {
      poignees.push(['k', 0, kv, 'pt-sky'])
      var ux = 1 / Math.hypot(1, mv), uy = mv * ux, L = 2.6, sx = L * ux, sy = L * uy
      if (!R.dansFenetre(sx, kv + sy)) { sx = -sx; sy = -sy }
      if (R.dansFenetre(sx, kv + sy)) poignees.push(['pente', sx, kv + sy, 'pt-ouvert'])
    }
    var visibles = []
    points.forEach(function (P, i) {
      var x = sVal(P.x), y = sVal(P.y)
      if (!R.dansFenetre(x, y)) return
      var q = R.px(x, y); pl.point(q[0], q[1], 8); visibles.push([q, points.length === 2 ? ['I', 'J'][i] : cas === 'tangente' ? 'T' : 'I'])
    })
    poignees.forEach(function (p) { var q = R.px(p[1], p[2]); pl.point(q[0], q[1], 7) })
    visibles.forEach(function (v) { G.el('circle', { cx: v[0][0].toFixed(1), cy: v[0][1].toFixed(1), r: 5.5, class: cas === 'tangente' ? 'pt-plan' : cas === 'un' ? 'pt-attn' : 'pt' }, svg) })
    poignees.forEach(function (p) {
      var q = R.px(p[1], p[2])
      G.el('circle', { cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: 5.5, class: p[3] + (p[3] === 'pt-ouvert' ? ' trait-plan' : '') }, svg)
    })
    visibles.forEach(function (v) { pl.poser(svg, v[0][0], v[0][1], v[1], cas === 'tangente' ? 'et-plan' : cas === 'un' ? 'et-attn' : '', [0, 1, 2, 3]) })
    poignees.forEach(function (p) { G.poignee(svg, R, p[1], p[2], p[0], false) })
  }
}

if (!customElements.get('droite-conique-widget')) customElements.define('droite-conique-widget', DroiteConiqueWidget)
