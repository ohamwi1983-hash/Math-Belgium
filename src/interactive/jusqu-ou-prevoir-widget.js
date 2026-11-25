/* ================================================================
 * <jusqu-ou-prevoir-widget> — atelier « Jusqu'où prévoir ? » (5e,
 * ch. 6, § 2 et § 6). Une droite d'ajustement (moindres carrés,
 * recalculée sur les données) et une abscisse de prévision x₀ que
 * l'élève fait glisser (au doigt sur la figure, ou curseur − / +).
 * La bande des données est verte (« on interpole »), le reste ocre
 * (« on extrapole ») ; la prévision est lue sur la droite.
 * Deux séries :
 * — mortalité infantile (décès pour 1 000 naissances) par périodes de
 *   cinq ans, 1 = 1946-1950 … 6 = 1971-1975 (valeurs d'exemple dans
 *   l'esprit de l'exercice 9 du document) : la droite y ≈ −8,38x + 64,09
 *   devient NÉGATIVE dès la période 8 (1981-1985) : prévision impossible ;
 * — espérance de vie à la naissance en Belgique, 2000 à 2014 (Banque
 *   mondiale, valeurs du document) : au-delà de 2206, la droite prévoit
 *   plus que le record humain (122 ans).
 * Repère FIXE par série. Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, texEgalites, CSS_BASE } from './katex-shadow.js'
import { curseurHTML, majCurseur, borner } from './variables-aleatoires-commun.js'
import { CSS_LIEUX } from './lieux-geometriques-commun.js'
import {
  CSS_STAT, el, texte, repereStat, pointNuage, statistiques,
  arr, txt, tn, texEquation, texR, phraseR,
} from './statistique-deux-variables-commun.js'

function periode(k) { return (1941 + 5 * k) + '-' + (1945 + 5 * k) }

var SERIES = {
  mortalite: {
    nom: 'Mortalité infantile',
    pts: [[1, 61.3], [2, 45.6], [3, 34.2], [4, 27.1], [5, 22.4], [6, 18.0]],
    o: { xMin: 0, xMax: 14, yMin: -50, yMax: 70, ux: 26, uy: 2.3, pasX: 1, pasY: 10, nomX: 'période (1 = 1946-1950)', nomY: 'décès pour 1 000 naissances', mg: 36, mb: 38, mh: 24 },
    xMin: 0, xMax: 14, pas: 1, x0: 3,
    etiquette: function (x) { return 'période ' + x + ' (' + periode(x) + ')' },
    unite: ' décès pour 1 000 naissances',
    dec: 1,
  },
  esperance: {
    nom: 'Espérance de vie',
    pts: [[2000, 77.72], [2002, 78.08], [2004, 78.88], [2006, 79.38], [2008, 79.68], [2010, 80.18], [2012, 80.39], [2014, 80.59]],
    o: { xMin: 1990, xMax: 2230, yMin: 70, yMax: 140, ux: 364 / 240, uy: 276 / 70, pasX: 40, pasY: 10, grilleX: 20, grilleY: 5, nomX: 'année', nomY: 'espérance de vie (ans)', mg: 36, mb: 38, mh: 24, etiqX: function (t) { return String(t) } },
    xMin: 1990, xMax: 2230, pas: 5, x0: 2010,
    etiquette: function (x) { return 'année ' + x },
    unite: ' ans',
    dec: 1,
  },
}
// repères construits une fois (fenêtres FIXES)
Object.keys(SERIES).forEach(function (k) { SERIES[k].R = repereStat(SERIES[k].o); SERIES[k].S = statistiques(SERIES[k].pts) })
var LARG = Math.max(SERIES.mortalite.R.L, SERIES.esperance.R.L), HAUT = Math.max(SERIES.mortalite.R.H, SERIES.esperance.R.H)

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE + CSS_LIEUX + CSS_STAT + '.zone-txt{font-size:11.5px;font-weight:700;font-family:var(--sans,sans-serif);paint-order:stroke;stroke:var(--surface,#fff);stroke-width:3px;}' +
  '.z-int{fill:var(--good,#2f7a4f);}.z-ext{fill:var(--attn,#96650c);}.z-imp{fill:var(--bad,#b23a3a);}</style>' +
  '<div class="rangee presets" role="group" aria-label="Série">' +
  '<button class="btn" data-s="mortalite">Mortalité infantile</button><button class="btn" data-s="esperance">Espérance de vie</button></div>' +
  '<p class="consigne" id="consigne"></p>' +
  '<div class="figure"><svg id="svg" class="glisser" viewBox="0 0 ' + LARG.toFixed(0) + ' ' + HAUT.toFixed(0) + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Données, droite d’ajustement et prévision"></svg></div>' +
  '<p class="verdict neutre" id="verdict" aria-live="polite"></p>' +
  '<div class="reglages">' + curseurHTML('x0', 'Abscisse de la prévision', 0, 14, 1) + '</div>' +
  '<div class="panneau" id="infos" aria-live="polite"></div>'

class JusquOuPrevoirWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._serie = 'mortalite'
    this._x0 = { mortalite: SERIES.mortalite.x0, esperance: SERIES.esperance.x0 }
    this._prise = false
    this._ecouteurs = []
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh, svg = sh.getElementById('svg')
    sh.querySelectorAll('[data-s]').forEach(function (b) { b.addEventListener('click', function () { self._serie = b.getAttribute('data-s'); self._rendre() }) })
    var inp = sh.getElementById('x0')
    inp.addEventListener('input', function () { self._regler(parseFloat(inp.value)) })
    sh.getElementById('x0-moins').addEventListener('click', function () { self._regler(self._x0[self._serie] - SERIES[self._serie].pas) })
    sh.getElementById('x0-plus').addEventListener('click', function () { self._regler(self._x0[self._serie] + SERIES[self._serie].pas) })
    function ecoute(c, t, f) { c.addEventListener(t, f); self._ecouteurs.push([c, t, f]) }
    function versPointeur(e) {
      var D = SERIES[self._serie], m = D.R.monde(svg, e.clientX, e.clientY)
      if (m) self._regler(m.x)
    }
    ecoute(svg, 'pointerdown', function (e) {
      var D = SERIES[self._serie], m = D.R.monde(svg, e.clientX, e.clientY)
      if (!m || !m.dansCadre) return
      e.preventDefault()
      self._prise = true
      try { svg.setPointerCapture(e.pointerId) } catch (err) { /* rien */ }
      versPointeur(e)
    })
    ecoute(svg, 'pointermove', function (e) { if (!self._prise) return; e.preventDefault(); versPointeur(e) })
    function fin(e) { if (!self._prise) return; self._prise = false; try { svg.releasePointerCapture(e.pointerId) } catch (err) { /* rien */ } self._rendre() }
    ecoute(svg, 'pointerup', fin)
    ecoute(svg, 'pointercancel', fin)
    this._rendre()
  }

  _regler(x) {
    var D = SERIES[this._serie]
    var v = arr(borner(Math.round(x / D.pas) * D.pas, D.xMin, D.xMax), 6)
    if (v === this._x0[this._serie]) return
    this._x0[this._serie] = v
    this._rendre()
  }

  _rendre() {
    var sh = this._sh, k = this._serie, D = SERIES[k], R = D.R, S = D.S, x0 = this._x0[k]
    var xs = D.pts.map(function (p) { return p[0] }), xa = Math.min.apply(null, xs), xb = Math.max.apply(null, xs)
    var y0 = S.a * x0 + S.b, inter = x0 >= xa && x0 <= xb
    var impossible = k === 'mortalite' ? y0 < 0 : y0 > 122
    sh.querySelectorAll('[data-s]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-s') === k)) })
    var inp = sh.getElementById('x0')
    inp.min = String(D.xMin); inp.max = String(D.xMax); inp.step = String(D.pas)
    majCurseur(sh, 'x0', x0, 'x_0=' + (k === 'esperance' ? String(x0) : tn(x0, 0)))
    sh.getElementById('consigne').textContent = 'Fais glisser la ligne verticale (ou règle x₀) au-delà des données.'

    // ---------- Verdict ----------
    var v = sh.getElementById('verdict'), dist = inter ? 0 : (x0 < xa ? xa - x0 : x0 - xb)
    if (inter) { v.className = 'verdict ok'; v.textContent = 'On interpole : x₀ est dans l’intervalle des données [' + txt(xa, 0) + ' ; ' + txt(xb, 0) + ']. La prévision est raisonnable.' }
    else if (impossible) {
      v.className = 'verdict ko'
      v.textContent = k === 'mortalite'
        ? 'On extrapole… et la droite donne un taux NÉGATIF : c’est impossible. La droite n’est plus un modèle valable aussi loin des données.'
        : 'On extrapole… et la droite donne plus que le record humain (122 ans) : absurde. La tendance de 2000-2014 ne peut pas durer indéfiniment.'
    } else {
      v.className = 'verdict neutre'
      v.textContent = 'On extrapole : x₀ est à ' + (k === 'esperance' ? dist + ' ans' : dist + ' période' + (dist > 1 ? 's' : '')) + ' des données. Plus on s’éloigne, moins la prévision est sûre.'
    }

    // ---------- Infos ----------
    var h = '<p class="titre-panneau">' + D.nom + ' : la droite d’ajustement (moindres carrés)</p>'
    h += '<p class="formule">' + tex(texEquation(S.a, S.b, k === 'esperance' ? 4 : 2)) + '</p>'
    h += '<p class="ligne">' + tex('r' + texR(S.r)) + ' : ' + phraseR(S.r) + '. Le modèle colle bien aux données…</p>'
    // calcul écrit avec des coefficients assez précis pour que l'arrondi affiché soit le bon
    var calc = k === 'esperance'
      ? tn(S.my, 4) + '+' + tn(S.a, 5) + '\\times(' + x0 + '-' + S.mx + ')'
      : tn(S.a, 4) + '\\times' + tn(x0, 0) + '+' + tn(S.b, 4)
    h += '<p class="ligne">Pour ' + D.etiquette(x0) + ' : ' + texEgalites([k === 'esperance' ? 'y=\\bar{y}+a(x_0-\\bar{x})' : 'y=ax_0+b', '\\approx ' + calc, '\\approx' + tn(y0, D.dec)]) + D.unite + '.</p>'
    if (k === 'mortalite') h += '<p class="note">La droite s’annule vers x ≈ ' + txt(-S.b / S.a, 2) + ', au cours de la période 8 (1981-1985). Les vrais taux, eux, ont continué à baisser de moins en moins vite : les points dessinent une courbe, pas une droite.</p>'
    else h += '<p class="note">La droite atteint 122 ans vers ' + txt((122 - S.b) / S.a, 0) + '. Les données couvrent seulement 14 ans : prévoir à 2 ou 3 ans est raisonnable, à un siècle beaucoup moins.</p>'
    h += '<p class="note">' + (k === 'mortalite' ? 'Valeurs d’exemple, proches de celles du manuel.' : 'Données de la Banque mondiale (Belgique), reprises du document.') + ' Les coefficients sont calculés avec toutes leurs décimales.</p>'
    sh.getElementById('infos').innerHTML = h

    // ---------- Figure ----------
    var svg = sh.getElementById('svg')
    svg.innerHTML = ''
    R.fond(svg, 'cadre-prev')
    var g = R.groupe(svg, 'cadre-prev')
    var pa = R.px(xa, 0)[0], pb = R.px(xb, 0)[0]
    el('rect', { x: R.x0, y: R.y0, width: (pa - R.x0).toFixed(1), height: R.y1 - R.y0, class: 'bande-ext' }, g)
    el('rect', { x: pb.toFixed(1), y: R.y0, width: (R.x1 - pb).toFixed(1), height: R.y1 - R.y0, class: 'bande-ext' }, g)
    el('rect', { x: pa.toFixed(1), y: R.y0, width: (pb - pa).toFixed(1), height: R.y1 - R.y0, class: 'bande-int' }, g)
    // zone impossible (y < 0 ou y > 122)
    var lim = k === 'mortalite' ? 0 : 122, pl = R.px(0, lim)[1]
    if (k === 'mortalite') el('rect', { x: R.x0, y: pl.toFixed(1), width: R.x1 - R.x0, height: (R.y1 - pl).toFixed(1), class: 'bande-imp' }, g)
    else el('rect', { x: R.x0, y: R.y0, width: R.x1 - R.x0, height: (pl - R.y0).toFixed(1), class: 'bande-imp' }, g)
    el('line', { x1: R.x0, y1: pl.toFixed(1), x2: R.x1, y2: pl.toFixed(1), class: 'trait-bad pointille fin' }, g)
    R.droite(g, S.a, S.b, 'trait-acc')
    // étiquettes des zones : bande étroite → texte vertical dans la bande ; « impossible » à gauche
    if (pb - pa >= 80) texte(svg, (pa + pb) / 2, R.y0 + 14, 'on interpole', 'zone-txt z-int')
    else {
      var tv = texte(svg, (pa + pb) / 2 + 4, (R.y0 + R.y1) / 2, 'on interpole', 'zone-txt z-int')
      tv.setAttribute('transform', 'rotate(-90 ' + ((pa + pb) / 2 + 4).toFixed(1) + ' ' + ((R.y0 + R.y1) / 2).toFixed(1) + ')')
    }
    if (k === 'mortalite') texte(svg, Math.min(R.x1 - 44, Math.max(pb + 44, (pb + R.x1) / 2)), R.y0 + 30, 'on extrapole', 'zone-txt z-ext')
    else texte(svg, R.x1 - 6, R.y1 - 8, 'on extrapole', 'zone-txt z-ext', 'end')
    texte(svg, k === 'mortalite' ? R.x0 + 6 : pb + 8, k === 'mortalite' ? R.y1 - 8 : pl - 8, k === 'mortalite' ? 'taux négatif : impossible' : 'au-delà du record (122 ans)', 'zone-txt z-imp', 'start')
    D.pts.forEach(function (p) { pointNuage(svg, R, p[0], p[1], null, 'pt', k === 'esperance' ? 3.6 : 5) })
    // prévision
    var px0 = R.px(x0, 0)[0], py = R.px(x0, Math.max(R.o.yMin, Math.min(R.o.yMax, y0)))
    el('line', { x1: px0.toFixed(1), y1: R.y0, x2: px0.toFixed(1), y2: R.y1, class: (inter ? 'trait-good' : impossible ? 'trait-bad' : 'trait-attn') + ' fin' }, svg)
    if (R.dans(x0, y0)) {
      el('line', { x1: R.x0, y1: py[1].toFixed(1), x2: px0.toFixed(1), y2: py[1].toFixed(1), class: 'trait-soft pointille fin' }, svg)
      el('circle', { cx: px0.toFixed(1), cy: py[1].toFixed(1), r: 6.5, class: inter ? 'pt-good' : impossible ? 'pt-bad' : 'pt-attn' }, svg)
    }
    var lab = '≈ ' + txt(y0, D.dec), lx = Math.max(R.x0 + 30, Math.min(R.x1 - 30, px0 + (px0 > R.x1 - 80 ? -42 : 42)))
    var ly = Math.max(R.y0 + 50, Math.min(R.y1 - 22, py[1] - 12))
    texte(svg, lx, ly, lab, 'et ' + (inter ? 'et-good' : impossible ? 'et-bad' : 'et-attn'))
    el('rect', { x: (px0 - 18).toFixed(1), y: R.y0, width: 36, height: R.y1 - R.y0, class: 'poignee' + (this._prise ? ' poignee-active' : ''), 'data-poignee': 'x0' }, svg)
    svg.setAttribute('aria-label', D.nom + ' : droite d’ajustement, prévision pour ' + D.etiquette(x0) + ' environ ' + txt(y0, D.dec) + D.unite + (inter ? ' (interpolation)' : ' (extrapolation)'))
  }
}

if (!customElements.get('jusqu-ou-prevoir-widget')) customElements.define('jusqu-ou-prevoir-widget', JusquOuPrevoirWidget)
