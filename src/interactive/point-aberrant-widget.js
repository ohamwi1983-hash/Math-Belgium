/* ================================================================
 * <point-aberrant-widget> — atelier « Le point aberrant » (5e, ch. 6,
 * § 6). Notes sur 20 de 9 élèves à une interro de mathématique (x) et
 * de physique (y) ; huit points sont fixes, le neuvième, P (rouge), se
 * déplace au doigt ou à la souris (valeurs aimantées au demi-point).
 * Deux droites des moindres carrés : AVEC P (orange) et SANS P
 * (pointillés), leurs équations et leurs r côte à côte : P au milieu du
 * nuage ne change presque rien, P loin du nuage fait basculer la droite
 * et chuter r. « Retirer P » le met de côté. Bouton « Quartet
 * d'Anscombe » : les quatre séries publiées par F. J. Anscombe en 1973
 * (vraies données), dessinées dans la MÊME figure (2 × 2 repères), avec
 * leurs x̄, ȳ, σx, σy, r et droites recalculés (σ divisé par n) : mêmes
 * valeurs à 2 décimales, nuages complètement différents.
 * Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, CSS_BASE } from './katex-shadow.js'
import { CSS_LIEUX } from './lieux-geometriques-commun.js'
import {
  CSS_STAT, el, texte, repereStat, pointNuage, statistiques,
  txt, texEquation, txtEquation, texR, txtR, phraseR, couple,
} from './statistique-deux-variables-commun.js'

var O = { xMin: 0, xMax: 20, yMin: 0, yMax: 20, ux: 16, uy: 16, pasX: 2, pasY: 2, grilleX: 1, grilleY: 1, nomX: 'note de math (x)', nomY: 'note de physique (y)', mg: 30, mb: 38, mh: 24 }
var R = repereStat(O)
var BASE = [[6, 7], [8, 8.5], [9, 10], [11, 11], [12, 12.5], [14, 13.5], [15, 15.5], [17, 16.5]]
var P0 = [10, 10.5]

/* Quartet d'Anscombe (F. J. Anscombe, « Graphs in Statistical Analysis », The American
 * Statistician 27, 1973) — données originales. */
var AX = [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5]
var ANSCOMBE = [
  AX.map(function (x, i) { return [x, [8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68][i]] }),
  AX.map(function (x, i) { return [x, [9.14, 8.14, 8.74, 8.77, 9.26, 8.10, 6.13, 3.10, 9.13, 7.26, 4.74][i]] }),
  AX.map(function (x, i) { return [x, [7.46, 6.77, 12.74, 7.11, 7.81, 8.84, 6.08, 5.39, 8.15, 6.42, 5.73][i]] }),
  [8, 8, 8, 8, 8, 8, 8, 19, 8, 8, 8].map(function (x, i) { return [x, [6.58, 5.76, 7.71, 8.84, 8.47, 7.04, 5.25, 12.50, 5.56, 7.91, 6.89][i]] }),
]
var NOMS_A = ['I', 'II', 'III', 'IV']
/** Deux décimales FIXES (« 7{,}50 », « 3{,}00 ») : le tableau dit « arrondis au centième ». */
function tf(x) { var v = Math.round(x * 100) / 100; return (v === 0 ? 0 : v).toFixed(2).replace('.', '{,}') }

/** Quatre petits repères dans la même surface que le grand (la figure ne change pas de taille). */
function reperesAnscombe() {
  var Lt = R.L, Ht = R.H, w = (Lt - 12) / 2, h = (Ht - 12) / 2
  return [0, 1, 2, 3].map(function (k) {
    var ux = (w - 30 - 8) / 18, uy = (h - 16 - 22) / 12
    var Rk = repereStat({ xMin: 2, xMax: 20, yMin: 2, yMax: 14, ux: ux, uy: uy, pasX: 4, pasY: 4, grilleX: 2, grilleY: 2, mg: 30, md: 8, mh: 16, mb: 22 })
    Rk.dx = 6 + (k % 2) * w
    Rk.dy = 6 + Math.floor(k / 2) * h
    return Rk
  })
}

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE + CSS_LIEUX + CSS_STAT + '.titre-a{font-size:13px;font-weight:700;font-family:var(--sans,sans-serif);fill:var(--accent-ink,#7a3c11);}</style>' +
  '<div class="rangee" role="group" aria-label="Vue">' +
  '<button class="btn" id="v-notes" aria-pressed="true">Les notes et le point P</button><button class="btn" id="v-anscombe" aria-pressed="false">Quartet d’Anscombe</button></div>' +
  '<p class="consigne" id="consigne"></p>' +
  '<div class="figure"><svg id="svg" class="glisser" viewBox="0 0 ' + R.L.toFixed(0) + ' ' + R.H.toFixed(0) + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Nuage des notes, point P et droites avec et sans P"></svg></div>' +
  '<p class="verdict neutre" id="verdict" aria-live="polite"></p>' +
  '<div class="rangee" id="zone-notes"><button class="btn" id="retirer" aria-pressed="false">Retirer P</button><button class="btn" id="replacer">Remettre P dans le nuage</button><button class="btn" id="loin">P loin du nuage</button></div>' +
  '<div class="panneau" id="infos" aria-live="polite"></div>'

class PointAberrantWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._P = P0.slice()
    this._sans = false
    this._vue = 'notes'
    this._prise = false
    this._ecouteurs = []
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh, svg = sh.getElementById('svg')
    sh.getElementById('v-notes').addEventListener('click', function () { self._vue = 'notes'; self._rendre() })
    sh.getElementById('v-anscombe').addEventListener('click', function () { self._vue = 'anscombe'; self._rendre() })
    sh.getElementById('retirer').addEventListener('click', function () { self._sans = !self._sans; self._rendre() })
    sh.getElementById('replacer').addEventListener('click', function () { self._P = P0.slice(); self._sans = false; self._rendre() })
    sh.getElementById('loin').addEventListener('click', function () { self._P = [16, 2]; self._sans = false; self._rendre() })
    function ecoute(c, t, f) { c.addEventListener(t, f); self._ecouteurs.push([c, t, f]) }
    ecoute(svg, 'pointerdown', function (e) {
      if (self._vue !== 'notes' || self._sans) return
      var t = e.target && e.target.getAttribute && e.target.getAttribute('data-poignee')
      var m = R.monde(svg, e.clientX, e.clientY)
      if (!t && !(m && m.dansCadre)) return
      e.preventDefault()
      self._prise = true
      try { svg.setPointerCapture(e.pointerId) } catch (err) { /* rien */ }
      if (!t && m) self._P = R.aimanter(m.x, m.y, 0.5, 0.5)
      self._rendre()
    })
    ecoute(svg, 'pointermove', function (e) {
      if (!self._prise) return
      e.preventDefault()
      var m = R.monde(svg, e.clientX, e.clientY)
      if (!m) return
      var q = R.aimanter(m.x, m.y, 0.5, 0.5)
      if (q[0] === self._P[0] && q[1] === self._P[1]) return
      self._P = q
      self._rendre()
    })
    function fin(e) { if (!self._prise) return; self._prise = false; try { svg.releasePointerCapture(e.pointerId) } catch (err) { /* rien */ } self._rendre() }
    ecoute(svg, 'pointerup', fin)
    ecoute(svg, 'pointercancel', fin)
    this._rendre()
  }

  _rendre() {
    var sh = this._sh, notes = this._vue === 'notes'
    sh.getElementById('v-notes').setAttribute('aria-pressed', String(notes))
    sh.getElementById('v-anscombe').setAttribute('aria-pressed', String(!notes))
    sh.getElementById('zone-notes').hidden = !notes
    sh.getElementById('retirer').setAttribute('aria-pressed', String(this._sans))
    sh.getElementById('retirer').textContent = this._sans ? 'Remettre P' : 'Retirer P'
    if (notes) this._rendreNotes(); else this._rendreAnscombe()
  }

  _rendreNotes() {
    var sh = this._sh, P = this._P, sans = this._sans
    sh.getElementById('consigne').textContent = sans
      ? 'P est mis de côté : les deux droites sont confondues.'
      : 'Fais glisser le point rouge P (ou touche le cadre pour l’y amener) : loin du nuage, la droite bascule.'
    var S0 = statistiques(BASE), S1 = statistiques(BASE.concat([P]))
    var Sx = sans ? S0 : S1

    // ---------- Verdict ----------
    var v = sh.getElementById('verdict'), dr = S0.r - (S1.r === null ? 0 : S1.r), da = Math.abs(S1.a - S0.a)
    if (sans) { v.className = 'verdict neutre'; v.textContent = 'Sans P : r ' + txtR(S0.r) + ', ' + phraseR(S0.r) + '. Retirer une donnée ne se fait que si on a une raison (erreur de mesure, élève malade…), pas parce qu’elle dérange.' }
    else if (dr < 0.02 && da < 0.05) { v.className = 'verdict ok'; v.textContent = 'P suit la tendance du nuage : la droite et r ne bougent presque pas.' }
    else if (dr < 0.15) { v.className = 'verdict neutre'; v.textContent = 'P s’écarte du nuage : la droite tourne déjà un peu et r baisse.' }
    else { v.className = 'verdict ko'; v.textContent = 'P est aberrant : un seul point fait basculer la droite et chuter r de ' + txt(S0.r, 2) + ' à ' + txt(S1.r === null ? 0 : S1.r, 2) + '.' }

    // ---------- Infos ----------
    var h = '<p class="titre-panneau">Les deux droites des moindres carrés</p>'
    h += '<p class="ligne"><span class="c-acc">Avec P' + (sans ? ' (retiré)' : couple(P[0], P[1], 1)) + '</span> : ' +
      (sans ? '—' : tex(texEquation(S1.a, S1.b, 2)) + ', ' + (S1.r === null ? 'r non défini' : tex('r' + texR(S1.r))) + ' (' + phraseR(S1.r) + ')') + '</p>'
    h += '<p class="ligne"><span class="c-soft">Sans P</span> : ' + tex(texEquation(S0.a, S0.b, 2)) + ', ' + tex('r' + texR(S0.r)) + ' (' + phraseR(S0.r) + ')</p>'
    if (!sans) h += '<p class="note">Prévision pour un élève qui a 18 en math : ' + txt(S1.a * 18 + S1.b, 1) + ' avec P, ' + txt(S0.a * 18 + S0.b, 1) + ' sans P.</p>'
    sh.getElementById('infos').innerHTML = h

    // ---------- Figure ----------
    var svg = sh.getElementById('svg')
    svg.innerHTML = ''
    svg.setAttribute('viewBox', '0 0 ' + R.L.toFixed(0) + ' ' + R.H.toFixed(0))
    R.fond(svg, 'cadre-ab')
    var g = R.groupe(svg, 'cadre-ab')
    R.droite(g, S0.a, S0.b, 'trait-soft pointille')
    if (!sans) R.droite(g, S1.a, S1.b, 'trait-acc')
    BASE.forEach(function (p) { pointNuage(svg, R, p[0], p[1], null, 'pt') })
    var q = R.px(P[0], P[1])
    if (!sans) {
      el('circle', { cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: 6.5, class: 'pt-bad' }, svg)
      var tx = Math.max(R.x0 + 10, Math.min(R.x1 - 10, q[0] + 13)), ty = Math.max(R.y0 + 14, Math.min(R.y1 - 4, q[1] - 10))
      texte(svg, tx, ty, 'P', 'et et-bad')
      el('circle', { cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: 20, class: 'poignee' + (this._prise ? ' poignee-active' : ''), 'data-poignee': 'P' }, svg)
    }
    svg.setAttribute('aria-label', 'Nuage des notes' + (sans ? ' sans P' : ', P' + couple(P[0], P[1], 1)) + ', droite ' + txtEquation(Sx.a, Sx.b, 2))
  }

  _rendreAnscombe() {
    var sh = this._sh
    sh.getElementById('consigne').textContent = 'Les quatre séries de F. J. Anscombe (1973) : 11 points chacune, mêmes résumés… et pourtant !'
    var stats = ANSCOMBE.map(statistiques)
    var v = sh.getElementById('verdict')
    v.className = 'verdict ok'
    v.textContent = 'Mêmes moyennes, mêmes écarts-types, même r, même droite : seule la série I mérite vraiment un ajustement affine. Regarde toujours le nuage avant de calculer.'
    var lignes = [
      ['\\bar{x}', function (s) { return tf(s.mx) }], ['\\bar{y}', function (s) { return tf(s.my) }],
      ['\\sigma_x', function (s) { return tf(s.sx) }], ['\\sigma_y', function (s) { return tf(s.sy) }],
      ['r', function (s) { return tf(s.r) }], ['a', function (s) { return tf(s.a) }], ['b', function (s) { return tf(s.b) }],
    ]
    var h = '<p class="titre-panneau">Les résumés, arrondis au centième</p><div class="defile"><table class="tableau"><tr><th>Série</th>' +
      NOMS_A.map(function (n) { return '<th>' + n + '</th>' }).join('') + '</tr>'
    lignes.forEach(function (L) { h += '<tr><th>' + tex(L[0]) + '</th>' + stats.map(function (s) { return '<td>' + tex(L[1](s)) + '</td>' }).join('') + '</tr>' })
    h += '</table></div>'
    h += '<p class="ligne">Droite des moindres carrés de chaque série : ' + tex('y\\approx 0{,}5x+3') + '.</p>'
    h += '<p class="note">II : une courbe (un arc), pas une droite. III : alignés sauf un point aberrant. IV : un seul point tire toute la droite.</p>'
    sh.getElementById('infos').innerHTML = h

    var svg = sh.getElementById('svg')
    svg.innerHTML = ''
    var Rs = reperesAnscombe()
    Rs.forEach(function (Rk, k) {
      var g0 = el('g', { transform: 'translate(' + Rk.dx.toFixed(1) + ',' + Rk.dy.toFixed(1) + ')' }, svg)
      Rk.fond(g0, 'cadre-a' + k)
      var g = Rk.groupe(g0, 'cadre-a' + k)
      Rk.droite(g, stats[k].a, stats[k].b, 'trait-acc')
      ANSCOMBE[k].forEach(function (p) { pointNuage(g0, Rk, p[0], p[1], null, 'pt', 3.4) })
      texte(g0, Rk.x0 + 10, Rk.y0 + 14, NOMS_A[k], 'titre-a', 'start')
    })
    svg.setAttribute('aria-label', 'Quartet d’Anscombe : quatre nuages de 11 points, même droite y ≈ 0,5x + 3')
  }
}

if (!customElements.get('point-aberrant-widget')) customElements.define('point-aberrant-widget', PointAberrantWidget)
