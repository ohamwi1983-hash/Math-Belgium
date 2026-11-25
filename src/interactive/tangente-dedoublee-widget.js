/* ================================================================
 * <tangente-dedoublee-widget> — atelier « Tangente et forme dédoublée »
 * (6e, ch. 10, § 5). Trois coniques du cours : l'ellipse
 * x²/25 + y²/16 = 1, l'hyperbole x²/9 − y²/16 = 1, la parabole y² = 4x
 * (y² = 2px avec p = 2). Un point P se déplace sur la conique (glissé,
 * ou curseur ; « Autre branche » pour l'hyperbole) ; il est AIMANTÉ aux
 * points à coordonnées rationnelles simples (P(3 ; 16/5), P(5 ; 16/3),
 * P(4 ; 4), sommets…), où tout s'écrit en valeurs exactes ; ailleurs,
 * valeurs approchées (« ≈ »). En direct : l'équation dédoublée
 * (x² → x·x_P, y² → y·y_P, x → (x + x_P)/2), avec les nombres, puis sa
 * forme entière ; la même tangente par la dérivée de la fonction dont
 * le graphique contient P (demi-courbe surlignée), pente et équation
 * y − y_P = m(x − x_P) ; aux sommets de l'axe focal, pas de pente : la
 * tangente est verticale, et la forme dédoublée la donne quand même.
 * Repère orthonormé à fenêtre FIXE par conique. Web Component.
 * ================================================================ */
import './geo-analytique-commun.js'
import { styleKatex, tex, texEgalites, CSS_BASE } from './katex-shadow.js'
import { curseurHTML, majCurseur, borner } from './variables-aleatoires-commun.js'
import { texN, CSS_LIEUX, placeurEtiquettes, pgcd } from './lieux-geometriques-commun.js'
import { Q, qAdd, qMul, qDiv, qNum, qNeg, texQ, racineRationnelle, cheminPts, groupeCadre, ptsEllipse, ptsHyperbole, ptsParabole, plusProche, CSS_CONIQUES } from './coniques-commun.js'

var G = window.GeoAnaCommun
var SH = Math.asinh(5.6 / 4) // course de P
var SH_TRACE = Math.asinh(6.6 / 4) // la courbe sort du cadre
var AIMANT = 0.16

function rq(q) { // √q pour un rationnel carré parfait
  return Q(Math.round(Math.sqrt(q.n)), Math.round(Math.sqrt(q.d)))
}

var CONIQUES = {
  ellipse: {
    nom: 'Ellipse', FEN: { xMin: -6.5, xMax: 6.5, yMin: -5.5, yMax: 5.5 }, unite: 30,
    tex: '\\frac{x^2}{25}+\\frac{y^2}{16}=1', ded: '\\frac{x\\cdot x_P}{25}+\\frac{y\\cdot y_P}{16}=1',
    regle: 'on remplace x² par x · x_P et y² par y · y_P',
    P: function (u) { var t = Math.PI * u; return [5 * Math.cos(t), 4 * Math.sin(t)] },
    u: function (x, y) { return Math.atan2(y / 4, x / 5) / Math.PI },
    /** coefficients (a, b, c) de la tangente ax + by = c */
    ligne: function (x, y, Qs) { return Qs ? [qDiv(x, Q(25)), qDiv(y, Q(16)), Q(1)] : [x / 25, y / 16, 1] },
    surConique: function (x, y) { return [qDiv(qMul(x, x), Q(25)), qDiv(qMul(y, y), Q(16))] },
    texSur: function (x, y, v) { return '\\frac{' + par(x) + '^2}{25}+\\frac{' + par(y) + '^2}{16}=' + v[0] + '+' + v[1] + '=1' },
    texDed: function (x, y) { return '\\frac{x\\cdot' + x + '}{25}+\\frac{y\\cdot' + y + '}{16}=1' },
    f: function (s) { return (s > 0 ? '' : '-') + '\\frac{4}{5}\\sqrt{25-x^2}' },
    pente: '-\\frac{b^2x_P}{a^2y_P}=-\\frac{16x_P}{25y_P}', penteQ: function (x, y) { return qNeg(qDiv(qMul(Q(16), x), qMul(Q(25), y))) },
    penteN: function (x, y) { return -16 * x / (25 * y) },
    sommets: 'Aux sommets (±5 ; 0)', foyers: [[3, 0], [-3, 0]],
    tracer: function () { return [ptsEllipse(0, 0, 5, 4, 1, 0)] },
    demi: function (s) { var p = []; for (var i = 0; i <= 120; i++) { var t = Math.PI * i / 120; p.push([5 * Math.cos(t), s * 4 * Math.sin(t)]) } return [p] },
    presets: [['Cours : P(3 ; 16/5)', 3, 1, 16, 5], ['Sommet (5 ; 0)', 5, 1, 0, 1], ['P(−4 ; −12/5)', -4, 1, -12, 5]],
  },
  hyperbole: {
    nom: 'Hyperbole', FEN: { xMin: -7, xMax: 7, yMin: -6, yMax: 6 }, unite: 28,
    tex: '\\frac{x^2}{9}-\\frac{y^2}{16}=1', ded: '\\frac{x\\cdot x_P}{9}-\\frac{y\\cdot y_P}{16}=1',
    regle: 'on remplace x² par x · x_P et y² par y · y_P',
    P: function (u, br) { var s = SH * u; return [br * 3 * Math.cosh(s), 4 * Math.sinh(s)] },
    u: function (x, y) { return Math.asinh(y / 4) / SH },
    ligne: function (x, y, Qs) { return Qs ? [qDiv(x, Q(9)), qNeg(qDiv(y, Q(16))), Q(1)] : [x / 9, -y / 16, 1] },
    surConique: function (x, y) { return [qDiv(qMul(x, x), Q(9)), qDiv(qMul(y, y), Q(16))] },
    texSur: function (x, y, v) { return '\\frac{' + par(x) + '^2}{9}-\\frac{' + par(y) + '^2}{16}=' + v[0] + '-' + v[1] + '=1' },
    texDed: function (x, y) { return '\\frac{x\\cdot' + x + '}{9}-\\frac{y\\cdot' + y + '}{16}=1' },
    f: function (s) { return (s > 0 ? '' : '-') + '\\frac{4}{3}\\sqrt{x^2-9}' },
    pente: '\\frac{b^2x_P}{a^2y_P}=\\frac{16x_P}{9y_P}', penteQ: function (x, y) { return qDiv(qMul(Q(16), x), qMul(Q(9), y)) },
    penteN: function (x, y) { return 16 * x / (9 * y) },
    sommets: 'Aux sommets (±3 ; 0)', foyers: [[5, 0], [-5, 0]], asymptotes: true,
    tracer: function () { return ptsHyperbole(0, 0, 3, 4, 1, 0, SH_TRACE) },
    demi: function (s) {
      return [1, -1].map(function (br) { var p = []; for (var i = 0; i <= 80; i++) { var t = SH_TRACE * i / 80; p.push([br * 3 * Math.cosh(t), s * 4 * Math.sinh(t)]) } return p })
    },
    presets: [['Cours : P(5 ; 16/3)', 5, 1, 16, 3], ['Sommet (3 ; 0)', 3, 1, 0, 1], ['P(−15/4 ; −3)', -15, 4, -3, 1]],
  },
  parabole: {
    nom: 'Parabole', FEN: { xMin: -2.5, xMax: 8.5, yMin: -5.5, yMax: 5.5 }, unite: 32,
    tex: 'y^2=4x', ded: 'y\\cdot y_P=2(x+x_P)',
    regle: 'on remplace y² par y · y_P et x par (x + x_P)/2 : y · y_P = 4 · (x + x_P)/2',
    P: function (u) { var y = 5.2 * u; return [y * y / 4, y] },
    u: function (x, y) { return y / 5.2 },
    ligne: function (x, y, Qs) { return Qs ? [Q(-2), y, qMul(Q(2), x)] : [-2, y, 2 * x] }, // −2x + y_P y = 2x_P
    surConique: function (x, y) { return [qMul(y, y), qMul(Q(4), x)] },
    texSur: function (x, y, v) { return par(y) + '^2=' + v[0] + '=4\\cdot' + par(x) },
    texDed: function (x, y) { return 'y\\cdot' + y + '=2\\left(x+' + x + '\\right)' },
    f: function (s) { return (s > 0 ? '' : '-') + '2\\sqrt{x}' },
    pente: '\\frac{p}{y_P}=\\frac{2}{y_P}', penteQ: function (x, y) { return qDiv(Q(2), y) },
    penteN: function (x, y) { return 2 / y },
    sommets: 'Au sommet O(0 ; 0)', foyers: [[1, 0]],
    tracer: function () { return [ptsParabole(0, 0, 2, 1, 0, 6)] },
    demi: function (s) { var p = []; for (var i = 0; i <= 120; i++) { var y = 6 * i / 120; p.push([y * y / 4, s * y]) } return [p] },
    presets: [['Cours : P(4 ; 4)', 4, 1, 4, 1], ['Sommet O', 0, 1, 0, 1], ['P(1 ; −2)', 1, 1, -2, 1]],
  },
}
Object.keys(CONIQUES).forEach(function (k) { var C = CONIQUES[k]; C.R = G.repere(C.FEN, C.unite, 14); C.exacts = pointsExacts(k) })

function parN(v) { var t = texN(v, 2); return v < 0 ? '\\left(' + t + '\\right)' : t }
function par(q) { var t = texQ(q); return q.n < 0 || q.d !== 1 ? '\\left(' + t + '\\right)' : t }

/** Points de la conique à coordonnées rationnelles simples (dénominateurs ≤ 6 pour x, ≤ 12 pour y). */
function pointsExacts(cle) {
  var L = []
  function ajoute(x, y) {
    if (y.d > 12) return
    ;[y, qNeg(y)].forEach(function (yy, i) { if (i === 1 && yy.n === 0) return; L.push({ x: x, y: yy }) })
  }
  if (cle === 'parabole') {
    for (var n = -11; n <= 11; n++) { var y = Q(n, 2); L.push({ x: qDiv(qMul(y, y), Q(4)), y: y }) }
    return L
  }
  for (var d = 1; d <= 6; d++) {
    for (var m = -7 * d; m <= 7 * d; m++) {
      if (pgcd(m, d) !== 1) continue
      var x = Q(m, d), y2
      if (cle === 'ellipse') { if (Math.abs(m) > 5 * d) continue; y2 = Q(16 * (25 * d * d - m * m), 25 * d * d) }
      else { if (Math.abs(m) < 3 * d) continue; y2 = Q(16 * (m * m - 9 * d * d), 9 * d * d) }
      if (racineRationnelle(y2)) ajoute(x, rq(y2))
    }
  }
  return L
}

/** a x + b y = c (rationnels) → entiers premiers entre eux, premier coefficient non nul positif. */
function entiers(a, b, c) {
  var L = a.d / pgcd(a.d, b.d) * b.d; L = L / pgcd(L, c.d) * c.d
  var A = a.n * L / a.d, B = b.n * L / b.d, C = c.n * L / c.d
  var g = pgcd(pgcd(A, B), C)
  A /= g; B /= g; C /= g
  if (A < 0 || (A === 0 && B < 0)) { A = -A; B = -B; C = -C }
  return [A + 0, B + 0, C + 0]
}
function texAxByC(A, B, C, fmt) {
  var s = ''
  function terme(v, lettre) {
    if (Math.abs(v) < 1e-12) return
    var abs = Math.abs(v), corps = (Math.abs(abs - 1) < 1e-12 ? '' : fmt(abs)) + lettre
    s += s ? (v < 0 ? '-' : '+') + corps : (v < 0 ? '-' : '') + corps
  }
  terme(A, 'x'); terme(B, 'y')
  return (s || '0') + '=' + (C < 0 ? '-' : '') + fmt(Math.abs(C))
}
/** Coefficient devant une parenthèse : « 1 » et « −1 » s'effacent. */
function coefMul(t) { return t === '1' ? '' : t === '-1' ? '-' : t }
/** y = m x + q en LaTeX (texte des coefficients donné). */
function texYmxq(tm, tq, nulM, nulQ) {
  if (nulM) return 'y=' + tq
  var s = 'y=' + (tm === '1' ? '' : tm === '-1' ? '-' : tm) + 'x'
  if (nulQ) return s
  return s + (tq.charAt(0) === '-' ? tq : '+' + tq)
}

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE + CSS_LIEUX + CSS_CONIQUES +
  '[hidden]{display:none !important;}' +
  '.tangente{stroke:var(--plan,#5b4ea3);stroke-width:2.6;}' +
  '.demi{fill:none;stroke:var(--sky,#2f6fb0);stroke-width:7;stroke-linecap:round;opacity:0.28;}' +
  '.foyer{fill:var(--good,#2f7a4f);opacity:0.7;}' +
  '</style>' +
  '<div class="rangee" role="group" aria-label="Conique">' +
  Object.keys(CONIQUES).map(function (k) { return '<button class="btn" data-c="' + k + '">' + CONIQUES[k].nom + '</button>' }).join('') + '</div>' +
  '<div class="rangee presets" id="presets" role="group" aria-label="Points remarquables"></div>' +
  '<p class="consigne" id="consigne"></p>' +
  '<div class="figure"><svg id="svg" class="glisser" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="La conique, le point P et la tangente en P"></svg></div>' +
  '<p class="verdict" id="verdict" aria-live="polite"></p>' +
  '<div class="reglages">' + curseurHTML('u', 'Position de P sur la conique', -1, 1, 0.01) + '</div>' +
  '<div class="rangee"><button class="btn" id="branche" hidden>Autre branche</button></div>' +
  '<div class="panneau" id="ded" aria-live="polite"></div>' +
  '<div class="panneau" id="der"></div>'

class TangenteDedoubleeWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._c = 'ellipse'
    this._br = 1
    this._ecouteurs = []
    this._fixer(3, 1, 16, 5)
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh, svg = sh.getElementById('svg')
    sh.querySelectorAll('[data-c]').forEach(function (b) {
      b.addEventListener('click', function () {
        self._c = b.getAttribute('data-c'); self._br = 1
        var p = CONIQUES[self._c].presets[0]; self._fixer(p[1], p[2], p[3], p[4]); self._rendre()
      })
    })
    sh.getElementById('presets').addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-p]')
      if (!b) return
      var p = CONIQUES[self._c].presets[+b.getAttribute('data-p')]
      self._fixer(p[1], p[2], p[3], p[4]); self._rendre()
    })
    function regle(u) { self._versU(borner(Math.round(u * 100) / 100, -1, 1)); self._rendre() }
    sh.getElementById('u').addEventListener('input', function (e) { regle(parseFloat(e.target.value)) })
    sh.getElementById('u-moins').addEventListener('click', function () { regle(self._u - 0.02) })
    sh.getElementById('u-plus').addEventListener('click', function () { regle(self._u + 0.02) })
    sh.getElementById('branche').addEventListener('click', function () { self._br = -self._br; self._versU(self._u); self._rendre() })
    var R0 = { monde: function (s, x, y) { return CONIQUES[self._c].R.monde(s, x, y) } }
    G.glisser(this, svg, R0, function () {}, function (n, x, y) {
      var C = CONIQUES[self._c]
      if (self._c === 'hyperbole') self._br = x >= 0 ? 1 : -1
      self._versU(borner(C.u(x, y), -1, 1), [x, y])
      self._rendre()
    })
    this._rendre()
  }

  /** P exact (préréglage). */
  _fixer(n1, d1, n2, d2) {
    var C = CONIQUES[this._c], x = Q(n1, d1), y = Q(n2, d2)
    this._exact = { x: x, y: y }
    this._P = [qNum(x), qNum(y)]
    if (this._c === 'hyperbole') this._br = this._P[0] >= 0 ? 1 : -1
    this._u = C.u(this._P[0], this._P[1])
  }

  /** P par le paramètre u (curseur ou doigt) ; aimanté aux points exacts proches. */
  _versU(u, cible) {
    var C = CONIQUES[this._c]
    var P = C.P(u, this._br)
    var ref = cible || P
    var j = plusProche(C.exacts.map(function (e) { return [qNum(e.x), qNum(e.y)] }), ref[0], ref[1])
    var e = j >= 0 ? C.exacts[j] : null
    if (e && Math.hypot(qNum(e.x) - P[0], qNum(e.y) - P[1]) < AIMANT && (this._c !== 'hyperbole' || qNum(e.x) * this._br > 0)) {
      this._exact = e; this._P = [qNum(e.x), qNum(e.y)]; this._u = C.u(this._P[0], this._P[1])
    } else { this._exact = null; this._P = P; this._u = u }
  }

  _rendre() {
    var sh = this._sh, self = this, C = CONIQUES[this._c], R = C.R
    sh.querySelectorAll('[data-c]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-c') === self._c)) })
    var E = this._exact, P = this._P
    sh.getElementById('presets').innerHTML = C.presets.map(function (p, i) {
      var on = !!E && E.x.n * p[2] === p[1] * E.x.d && E.y.n * p[4] === p[3] * E.y.d
      return '<button class="btn" data-p="' + i + '" aria-pressed="' + on + '">' + p[0] + '</button>'
    }).join('')
    sh.getElementById('consigne').textContent = 'Conique ' + (this._c === 'ellipse' ? 'x²/25 + y²/16 = 1' : this._c === 'hyperbole' ? 'x²/9 − y²/16 = 1' : 'y² = 4x (p = 2)') + '. Fais glisser P : il s’arrête de lui-même sur les points à coordonnées simples.'
    majCurseur(sh, 'u', Math.round(this._u * 100) / 100, 'P')
    var bb = sh.getElementById('branche'); bb.hidden = this._c !== 'hyperbole'

    var xP = P[0], yP = P[1]
    var sommet = Math.abs(yP) < 1e-9
    // tangente a x + b y = c
    var co, coN, texLigne, eqY = null
    if (E) {
      co = C.ligne(E.x, E.y, true)
      var I = entiers(co[0], co[1], co[2])
      coN = I
      texLigne = texAxByC(I[0], I[1], I[2], function (v) { return String(v) })
      if (I[1] !== 0) {
        var mq = Q(-I[0], I[1]), qq = Q(I[2], I[1])
        eqY = texYmxq(texQ(mq), texQ(qq), mq.n === 0, qq.n === 0)
      }
    } else {
      coN = C.ligne(xP, yP, false)
      var k = Math.abs(coN[2]) > 1e-9 ? coN[2] : 1
      texLigne = texAxByC(coN[0] / k * (coN[2] < 0 ? -1 : 1), coN[1] / k * (coN[2] < 0 ? -1 : 1), Math.abs(coN[2]) > 1e-9 ? 1 : 0, function (v) { return texN(v, 2) })
      if (Math.abs(coN[1]) > 1e-9) {
        var mN = -coN[0] / coN[1], qN = coN[2] / coN[1]
        eqY = texYmxq(texN(mN, 2), texN(qN, 2), Math.abs(mN) < 0.005, Math.abs(qN) < 0.005)
      }
    }

    // ---------- Verdict ----------
    var vd = sh.getElementById('verdict')
    if (sommet) { vd.className = 'verdict neutre'; vd.textContent = (this._c === 'parabole' ? 'Au sommet' : 'Sommet de l’axe focal') + ' : la tangente est verticale. La dérivée n’existe pas en ce point, mais la forme dédoublée donne la droite.' }
    else { vd.className = 'verdict ok'; vd.textContent = 'Les deux méthodes donnent la même tangente : forme dédoublée et dérivée de la fonction dont le graphique contient P.' }

    // ---------- Panneau : forme dédoublée ----------
    var coord = E ? tex('P\\left(' + texQ(E.x) + '\\,;' + texQ(E.y) + '\\right)') : tex('P\\left(' + texN(xP, 2) + '\\,;' + texN(yP, 2) + '\\right)') + ' <span class="note">(valeurs approchées)</span>'
    var h = '<p class="titre-panneau">Le point et la forme dédoublée</p>'
    h += '<p class="ligne">' + coord + '</p>'
    if (E) {
      var v = C.surConique(E.x, E.y)
      h += '<p class="ligne">Sur la conique : ' + tex(C.texSur(E.x, E.y, [texQ(v[0]), texQ(v[1])])) + ' ✓</p>'
    }
    h += '<p class="ligne">Dans ' + tex(C.tex) + ', ' + C.regle.replace(/x_P/g, 'x<sub>P</sub>').replace(/y_P/g, 'y<sub>P</sub>') + ' :</p>'
    h += '<p class="formule">' + tex(C.ded) + '</p>'
    if (E) {
      h += '<p class="ligne">Ici : ' + tex(C.texDed(par(E.x), par(E.y))) + '</p>'
      h += '<p class="ligne">' + texEgalites(['\\iff ' + texLigne].concat(eqY ? ['\\iff ' + eqY] : []), ' ') + '</p>'
    } else {
      h += '<p class="ligne">Ici : ' + tex(C.texDed(parN(xP), parN(yP))) + (eqY ? ', soit ' + tex(eqY.replace('=', '\\approx')) : '') + '</p>'
    }
    sh.getElementById('ded').innerHTML = h

    // ---------- Panneau : dérivée ----------
    var d = '<p class="titre-panneau">Par la dérivée</p>'
    if (sommet) {
      d += '<p class="ligne">' + C.sommets + ', ' + tex('y_P=0') + ' : la pente ' + tex(C.pente.split('=')[0] + '=' + C.pente.split('=').slice(1).join('=')) + ' n’a pas de sens (division par zéro), et la fonction n’y est pas dérivable.</p>'
      d += '<p class="ligne">La tangente est la verticale ' + tex('x=' + (E ? texQ(E.x) : texN(xP, 2))) + ' — exactement ce que donne la forme dédoublée.</p>'
    } else {
      var s = yP > 0 ? 1 : -1
      d += '<p class="ligne">P est sur la ' + (s > 0 ? 'moitié supérieure' : 'moitié inférieure') + ' (surlignée) : graphique de ' + tex('f(x)=' + C.f(s)) + '.</p>'
      if (E) {
        var m = C.penteQ(E.x, E.y), q = qAdd(E.y, qNeg(qMul(m, E.x)))
        d += '<p class="ligne">Pente : ' + tex("f'(x_P)=" + C.pente + '=' + texQ(m)) + '</p>'
        d += '<p class="ligne">' + texEgalites(['y-' + par(E.y) + '=' + coefMul(texQ(m)) + '\\left(x-' + par(E.x) + '\\right)', '\\iff ' + texYmxq(texQ(m), texQ(q), m.n === 0, q.n === 0)], ' ') + '</p>'
      } else {
        var mn = C.penteN(xP, yP), qn = yP - mn * xP
        d += '<p class="ligne">Pente : ' + tex("f'(x_P)=" + C.pente + '\\approx' + texN(mn, 2)) + '</p>'
        d += '<p class="ligne">' + tex('y\\approx' + texYmxq(texN(mn, 2), texN(qn, 2), Math.abs(mn) < 0.005, Math.abs(qn) < 0.005).slice(2)) + '</p>'
      }
      d += '<p class="ligne ok">Même droite que par la forme dédoublée ✓</p>'
    }
    sh.getElementById('der').innerHTML = d

    // ---------- Figure ----------
    var svg = sh.getElementById('svg')
    svg.setAttribute('viewBox', '0 0 ' + R.L + ' ' + R.H)
    svg.innerHTML = ''
    R.fond(svg, 1)
    var g = groupeCadre(G, svg, R, 'cadre-tg')
    if (C.asymptotes) { R.traceDroite(g, 4, -3, 0, 'asymptote'); R.traceDroite(g, -4, -3, 0, 'asymptote') }
    if (!sommet) C.demi(yP > 0 ? 1 : -1).forEach(function (p) { G.el('path', { d: cheminPts(R, p), class: 'demi' }, g) })
    C.tracer().forEach(function (br) { G.el('path', { d: cheminPts(R, br), class: 'conique' }, g) })
    R.traceDroite(g, coN[0], coN[1], -coN[2], 'tangente')
    var pl = placeurEtiquettes(R.L, R.H)
    var pP = R.px(xP, yP)
    C.foyers.forEach(function (f) { var q = R.px(f[0], f[1]); pl.point(q[0], q[1], 5) })
    pl.point(pP[0], pP[1], 9)
    C.foyers.forEach(function (f) { var q = R.px(f[0], f[1]); G.el('circle', { cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: 3.5, class: 'foyer' }, svg) })
    G.el('circle', { cx: pP[0].toFixed(1), cy: pP[1].toFixed(1), r: 6.5, class: 'pt-acc' }, svg)
    C.foyers.forEach(function (f, i) { var q = R.px(f[0], f[1]); pl.poser(svg, q[0], q[1], i ? 'F′' : 'F', 'et-good et-petit', [2, 3]) })
    pl.poser(svg, pP[0], pP[1], 'P', 'et-acc', xP < 0 ? [1, 3, 0, 2] : [0, 2, 1, 3])
    G.poignee(svg, R, xP, yP, 'P', false)
  }
}

if (!customElements.get('tangente-dedoublee-widget')) customElements.define('tangente-dedoublee-widget', TangenteDedoubleeWidget)
