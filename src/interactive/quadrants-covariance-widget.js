/* ================================================================
 * <quadrants-covariance-widget> — atelier « Les quatre quadrants de la
 * covariance » (5e, ch. 6, § 5). Repère FIXE (0 à 10 sur chaque axe),
 * valeurs aimantées au demi. Deux axes passent par G(x̄ ; ȳ) ; chaque
 * point dessine le rectangle qui le relie à G, d'aire |(xᵢ − x̄)(yᵢ − ȳ)| :
 * vert en haut à droite et en bas à gauche (produit positif), rouge dans
 * les deux autres quadrants (produit négatif). Le panneau fait le bilan :
 * somme des produits = aires vertes − aires rouges, Cov(x, y) = somme / n,
 * σx, σy, r = Cov / (σx σy) et son interprétation. Points ajoutés,
 * déplacés, retirés au doigt ; G et tous les rectangles suivent.
 * Préréglages : liaison croissante, décroissante, sans liaison, en arc
 * (parabole symétrique : Cov = 0 alors que les points sont liés).
 * Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, texEgalites, CSS_BASE } from './katex-shadow.js'
import { CSS_LIEUX } from './lieux-geometriques-commun.js'
import {
  CSS_STAT, el, texte, repereStat, pointNuage, marquePointMoyen, nuageEditable, statistiques,
  txt, tn, egal, couple, texR, phraseR, exact,
} from './statistique-deux-variables-commun.js'

var R = repereStat({ xMin: 0, xMax: 10, yMin: 0, yMax: 10, ux: 34, uy: 34, pasX: 1, pasY: 1, nomX: 'x', nomY: 'y', mg: 30, mb: 40 })
var PRESETS = {
  croissante: [[1, 2], [2, 3.5], [3, 3], [4.5, 5], [5.5, 4.5], [6.5, 7], [8, 7.5], [9, 9]],
  decroissante: [[1, 8.5], [2.5, 8], [3, 6.5], [4.5, 6], [6, 4], [7, 4.5], [8, 2.5], [9, 1.5]],
  aucune: [[1.5, 3], [2, 7.5], [3.5, 5], [4.5, 2], [5, 8.5], [6.5, 4], [7.5, 6.5], [8.5, 2.5], [8.5, 8]],
  arc: [[1, 9], [3, 3], [5, 1], [7, 3], [9, 9]],
}
var NOMS = { croissante: 'Liaison croissante', decroissante: 'Liaison décroissante', aucune: 'Sans liaison', arc: 'En arc' }
var MAX = 14

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE + CSS_LIEUX + CSS_STAT + '.q-signe{font-size:15px;font-weight:700;}.q-plus{fill:var(--good,#2f7a4f);}.q-moins{fill:var(--bad,#b23a3a);}</style>' +
  '<div class="rangee presets" role="group" aria-label="Nuages prêts">' +
  Object.keys(PRESETS).map(function (k) { return '<button class="btn" data-p="' + k + '">' + NOMS[k] + '</button>' }).join('') + '</div>' +
  '<div class="rangee mode" role="group" aria-label="Que fait un toucher sur la figure ?">' +
  '<button class="btn" id="m-ajouter" aria-pressed="true">Ajouter / déplacer</button><button class="btn" id="m-retirer" aria-pressed="false">Retirer un point</button></div>' +
  '<p class="consigne">Déplace les points autour de G : regarde les rectangles changer de couleur et la covariance suivre.</p>' +
  '<div class="figure"><svg id="svg" class="glisser" viewBox="0 0 ' + R.L.toFixed(0) + ' ' + R.H.toFixed(0) + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Nuage, axes passant par G et rectangles signés"></svg></div>' +
  '<p class="verdict neutre" id="verdict" aria-live="polite"></p>' +
  '<div class="panneau" id="bilan" aria-live="polite"></div>' +
  '<div class="panneau" id="produits"></div>'

class QuadrantsCovarianceWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._pts = PRESETS.croissante.map(function (p) { return p.slice() })
    this._preset = 'croissante'
    this._mode = 'ajouter'
    this._message = ''
    this._ecouteurs = []
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    sh.querySelectorAll('[data-p]').forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-p')
        self._pts = PRESETS[k].map(function (p) { return p.slice() })
        self._preset = k; self._message = ''
        self._rendre()
      })
    })
    sh.getElementById('m-ajouter').addEventListener('click', function () { self._mode = 'ajouter'; self._rendre() })
    sh.getElementById('m-retirer').addEventListener('click', function () { self._mode = 'retirer'; self._rendre() })
    nuageEditable(this, sh.getElementById('svg'), R, {
      points: function () { return self._pts },
      mode: function () { return self._mode },
      pasX: 0.5, pasY: 0.5, min: 2, max: MAX,
      surChange: function (quoi) {
        self._message = quoi === 'plein' ? 'Au plus ' + MAX + ' points.' : ''
        if (quoi !== 'fin') self._preset = null
        self._rendre()
      },
    })
    this._rendre()
  }

  _rendre() {
    var sh = this._sh, pts = this._pts, n = pts.length, preset = this._preset
    sh.getElementById('m-ajouter').setAttribute('aria-pressed', String(this._mode === 'ajouter'))
    sh.getElementById('m-retirer').setAttribute('aria-pressed', String(this._mode === 'retirer'))
    sh.querySelectorAll('[data-p]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-p') === preset)) })
    var S = statistiques(pts)
    var prods = pts.map(function (p) { return (p[0] - S.mx) * (p[1] - S.my) })
    var vert = 0, rouge = 0
    prods.forEach(function (q) { if (q > 0) vert += q; else rouge -= q })
    var somme = vert - rouge

    // ---------- Verdict ----------
    var v = sh.getElementById('verdict')
    if (this._message) { v.className = 'verdict ko'; v.textContent = this._message }
    else if (Math.abs(S.cov) < 1e-9) {
      v.className = 'verdict neutre'
      v.textContent = preset === 'arc'
        ? 'Cov = 0 : le vert et le rouge s’équilibrent exactement. Pourtant les points sont parfaitement liés (une parabole) : r = 0 veut dire « pas de lien LINÉAIRE », pas « aucun lien ».'
        : 'Cov = 0 : les aires vertes et rouges s’équilibrent exactement. Aucune tendance linéaire.'
    } else if (S.cov > 0) { v.className = 'verdict ok'; v.textContent = 'Le vert l’emporte : Cov > 0, les deux variables varient dans le même sens.' }
    else { v.className = 'verdict ko'; v.textContent = 'Le rouge l’emporte : Cov < 0, quand x augmente, y a tendance à diminuer.' }

    // ---------- Bilan ----------
    var h = '<p class="titre-panneau">Le bilan des rectangles</p>'
    h += '<p class="ligne">' + tex('G') + couple(S.mx, S.my) + ' : ' + tex('\\bar{x}' + egal(S.mx, 2)) + ', ' + tex('\\bar{y}' + egal(S.my, 2)) + ' (n = ' + n + ')</p>'
    h += '<p class="ligne">' + tex('\\sum (x_i-\\bar{x})(y_i-\\bar{y})') + ' : <span class="c-good">' + tex(tn(vert, 2)) + '</span> (vert) − <span class="c-bad">' + tex(tn(rouge, 2)) + '</span> (rouge) ' +
      tex((exact(somme, 2) && exact(vert, 2) && exact(rouge, 2) ? '=' : '\\approx') + tn(somme, 2)) + '</p>'
    h += '<p class="ligne">' + texEgalites(['\\operatorname{Cov}(x,y)=\\frac{1}{n}\\sum (x_i-\\bar{x})(y_i-\\bar{y})', (exact(somme, 4) ? '' : '\\approx ') + '\\frac{' + tn(somme, 4) + '}{' + n + '}']) + ' ' + tex(egal(S.cov, 3)) + '</p>'
    h += '<p class="ligne">' + tex('\\sigma_x' + egal(S.sx, 3)) + ', ' + tex('\\sigma_y' + egal(S.sy, 3)) + '</p>'
    if (S.r === null) h += '<p class="ligne">' + phraseR(null) + '.</p>'
    else h += '<p class="ligne">' + tex('r=\\frac{\\operatorname{Cov}(x,y)}{\\sigma_x\\,\\sigma_y}') + ' ' + tex(texR(S.r)) + ' : ' + phraseR(S.r) + '.</p>'
    sh.getElementById('bilan').innerHTML = h

    // ---------- Produits ----------
    var k = '<p class="titre-panneau">Le produit de chaque point (l’aire signée de son rectangle)</p><p class="liste">'
    k += pts.map(function (p, i) {
      var q = prods[i], cls = q > 1e-9 ? 'c-good' : q < -1e-9 ? 'c-bad' : ''
      return couple(p[0], p[1], 1) + ' : <span class="' + cls + '">' + (Math.abs(q) < 1e-9 ? '0' : txt(q, 2)) + '</span>'
    }).join(' ; ') + '</p>'
    k += '<p class="note">Un point sur un des axes passant par G donne un produit nul : il ne compte pas.</p>'
    sh.getElementById('produits').innerHTML = k

    // ---------- Figure ----------
    var svg = sh.getElementById('svg')
    svg.innerHTML = ''
    R.fond(svg, 'cadre-cov')
    var g = R.groupe(svg, 'cadre-cov'), pG = R.px(S.mx, S.my)
    pts.forEach(function (p, i) {
      var q = prods[i]
      if (Math.abs(q) < 1e-9) return
      var a = R.px(Math.min(p[0], S.mx), Math.max(p[1], S.my)), b = R.px(Math.max(p[0], S.mx), Math.min(p[1], S.my))
      el('rect', { x: a[0].toFixed(1), y: a[1].toFixed(1), width: (b[0] - a[0]).toFixed(1), height: (b[1] - a[1]).toFixed(1), class: q > 0 ? 'rect-plus' : 'rect-moins' }, g)
    })
    el('line', { x1: pG[0].toFixed(1), y1: R.y0, x2: pG[0].toFixed(1), y2: R.y1, class: 'trait-acc pointille fin' }, g)
    el('line', { x1: R.x0, y1: pG[1].toFixed(1), x2: R.x1, y2: pG[1].toFixed(1), class: 'trait-acc pointille fin' }, g)
    // signes des quadrants (dans les coins, côté G)
    var coins = [[1, 1, '+', 'q-plus'], [-1, 1, '−', 'q-moins'], [-1, -1, '+', 'q-plus'], [1, -1, '−', 'q-moins']]
    coins.forEach(function (c) {
      var x = c[0] > 0 ? R.x1 - 12 : R.x0 + 12, y = c[1] > 0 ? R.y0 + 18 : R.y1 - 8
      if ((c[0] > 0 && pG[0] > R.x1 - 24) || (c[0] < 0 && pG[0] < R.x0 + 24) || (c[1] > 0 && pG[1] < R.y0 + 26) || (c[1] < 0 && pG[1] > R.y1 - 20)) return
      texte(svg, x, y, c[2], 'q-signe ' + c[3])
    })
    pts.forEach(function (p, i) { pointNuage(svg, R, p[0], p[1], null, prods[i] > 1e-9 ? 'pt-good' : prods[i] < -1e-9 ? 'pt-bad' : 'pt') })
    marquePointMoyen(svg, R, S.mx, S.my, '')
    var ex = Math.max(R.x0 + 10, Math.min(R.x1 - 10, pG[0] + 13)), ey = Math.max(R.y0 + 14, Math.min(R.y1 - 4, pG[1] - 10))
    texte(svg, ex, ey, 'G', 'et et-acc')
    pts.forEach(function (p, i) {
      var q = R.px(p[0], p[1])
      el('circle', { cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: 17, class: 'prise', 'data-pt': String(i) }, svg)
    })
    svg.setAttribute('aria-label', 'Nuage de ' + n + ' points, G' + couple(S.mx, S.my) + ', covariance ' + txt(S.cov, 3))
  }
}

if (!customElements.get('quadrants-covariance-widget')) customElements.define('quadrants-covariance-widget', QuadrantsCovarianceWidget)
