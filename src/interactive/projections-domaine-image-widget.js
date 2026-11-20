/* ================================================================
 * <projections-domaine-image-widget> — atelier « Projections : domaine et
 * image » (5e, ch. 1, intro et § 1). Une courbe sur une grille d'une unité ;
 * on déplace ses deux extrémités (glisser sur la figure, ou boutons ◀ ▶) et
 * on bascule chacune entre « pleine » et « creuse ». Le domaine est projeté
 * sur l'axe des x (bande verte), l'image sur l'axe des y (bande orange), et
 * les deux sont écrits en intervalles avec les bons crochets, en KaTeX.
 *
 * Valeurs lues sur les lignes de la grille : chaque courbe passe par des
 * nœuds entiers (x et y entiers) et est interpolée par une cubique
 * MONOTONE (Fritsch–Carlson) — aucun dépassement entre deux nœuds, donc
 * les extremums sont toujours des nœuds, et les bornes de l'image sont
 * entières. Les extrémités ne se posent que sur des abscisses entières.
 * Une borne de l'image est ouverte seulement si sa valeur n'est atteinte
 * qu'en une extrémité creuse (sinon le crochet reste fermé, et le widget
 * le dit). Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, texNombre, texIntervalle, CSS_BASE, svgEl, defsFleche } from './katex-shadow.js'

var X0 = -5, X1 = 5, Y0 = -4, Y1 = 5
var COURBES = [
  { nom: 'Colline', y: [-4, -3, -1, 1, 3, 4, 3, 1, -1, -3, -4], g: -4, d: 3 },
  { nom: 'Vallée', y: [4, 2, 0, -1, -2, -3, -2, -1, 1, 3, 5], g: -3, d: 4 },
  { nom: 'Vague', y: [-3, -1, 1, 2, 1, 0, -1, -2, -1, 1, 3], g: -4, d: 4 },
]

// Tangentes de Fritsch–Carlson (pas de 1) : nulles aux extremums locaux, moyenne harmonique sinon.
function tangentes(ys) {
  var n = ys.length, d = [], m = []
  for (var k = 0; k < n - 1; k++) d.push(ys[k + 1] - ys[k])
  m[0] = d[0]
  m[n - 1] = d[n - 2]
  for (var i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : 2 / (1 / d[i - 1] + 1 / d[i])
  return m
}
function evaluer(ys, m, x) {
  var k = Math.min(ys.length - 2, Math.max(0, Math.floor(x - X0)))
  var t = x - X0 - k, t2 = t * t, t3 = t2 * t
  return (2 * t3 - 3 * t2 + 1) * ys[k] + (t3 - 2 * t2 + t) * m[k] + (-2 * t3 + 3 * t2) * ys[k + 1] + (t3 - t2) * m[k + 1]
}

var ML = 30, MR = 18, MT = 16, MB = 26, U = 34
var LARG = ML + MR + (X1 - X0 + 1) * U, HAUT = MT + MB + (Y1 - Y0 + 1) * U
function px(x) { return ML + (x - X0 + 0.5) * U }
function py(y) { return MT + (Y1 + 0.5 - y) * U }

function texNb(n) { return texNombre(n, 0) }
function texPoint(x, y) { return '(' + texNb(x) + '\\,;\\,' + texNb(y) + ')' }

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE +
  '.figure svg{max-width:440px;touch-action:pan-y;user-select:none;-webkit-user-select:none;cursor:ew-resize;}' +
  '.courbe{fill:none;stroke:var(--sky,#2f6fb0);stroke-width:2.8;stroke-linecap:round;}' +
  '.ext-plein{fill:var(--sky,#2f6fb0);stroke:var(--sky,#2f6fb0);stroke-width:2;}' +
  '.ext-creux{fill:var(--surface-2,#f7f9fb);stroke:var(--sky,#2f6fb0);stroke-width:2.4;}' +
  '.prise{fill:transparent;}' +
  '.proj-dom{stroke:var(--good,#2f7a4f);stroke-width:7;opacity:0.8;}' +
  '.proj-im{stroke:var(--accent,#b65c1f);stroke-width:7;opacity:0.8;}' +
  '.b-dom-plein{fill:var(--good,#2f7a4f);}.b-dom-creux{fill:var(--surface-2,#f7f9fb);stroke:var(--good,#2f7a4f);stroke-width:2.2;}' +
  '.b-im-plein{fill:var(--accent,#b65c1f);}.b-im-creux{fill:var(--surface-2,#f7f9fb);stroke:var(--accent,#b65c1f);stroke-width:2.2;}' +
  '.rappel-dom{stroke:var(--good,#2f7a4f);stroke-width:1.2;stroke-dasharray:4 3;}' +
  '.rappel-im{stroke:var(--accent,#b65c1f);stroke-width:1.2;stroke-dasharray:4 3;}' +
  '.reglages{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,270px),1fr));gap:4px;margin:0 0 10px;}' +
  '.reglage{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:6px;}' +
  '.reglage .etiquette{min-width:56px;text-align:right;}' +
  '.ensemble{text-align:center;font-size:1.05rem;margin:0 0 6px;line-height:2;}' +
  '.c-dom{color:var(--good,#2f7a4f);}.c-im{color:var(--accent-ink,#7a3c11);}' +
  '.ensemble .sep{display:inline-block;width:22px;}' +
  '.panneau ul{margin:0;padding-left:18px;}.panneau li{margin:0 0 4px;}' +
  '</style>' +
  '<div class="rangee" id="formes" role="group" aria-label="Choix de la courbe"></div>' +
  '<div class="figure"><svg id="svg" viewBox="0 0 ' + LARG + ' ' + HAUT + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Courbe, domaine projeté sur l’axe des x et image projetée sur l’axe des y"></svg></div>' +
  '<p class="ensemble" id="ensembles"></p>' +
  '<div class="reglages">' +
  '<div class="reglage"><span class="etiquette">Gauche</span>' +
  '<button class="btn" id="g-moins" aria-label="Extrémité gauche vers la gauche">◀</button>' +
  '<button class="btn" id="g-plus" aria-label="Extrémité gauche vers la droite">▶</button>' +
  '<button class="btn" id="g-type"></button></div>' +
  '<div class="reglage"><span class="etiquette">Droite</span>' +
  '<button class="btn" id="d-moins" aria-label="Extrémité droite vers la gauche">◀</button>' +
  '<button class="btn" id="d-plus" aria-label="Extrémité droite vers la droite">▶</button>' +
  '<button class="btn" id="d-type"></button></div>' +
  '</div>' +
  '<div class="panneau" id="lecture"></div>'

class ProjectionsDomaineImageWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._forme = 0
    this._g = COURBES[0].g
    this._d = COURBES[0].d
    this._gPlein = true
    this._dPlein = false
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    var zf = sh.getElementById('formes')
    COURBES.forEach(function (c, i) {
      var b = document.createElement('button')
      b.className = 'btn'
      b.textContent = c.nom
      b.addEventListener('click', function () {
        self._forme = i
        self._g = c.g
        self._d = c.d
        self._rendre()
      })
      zf.appendChild(b)
    })
    var bouger = function (cote, delta) {
      if (cote === 'g') self._g = Math.max(X0, Math.min(self._d - 1, self._g + delta))
      else self._d = Math.min(X1, Math.max(self._g + 1, self._d + delta))
      self._rendre()
    }
    sh.getElementById('g-moins').addEventListener('click', function () { bouger('g', -1) })
    sh.getElementById('g-plus').addEventListener('click', function () { bouger('g', 1) })
    sh.getElementById('d-moins').addEventListener('click', function () { bouger('d', -1) })
    sh.getElementById('d-plus').addEventListener('click', function () { bouger('d', 1) })
    sh.getElementById('g-type').addEventListener('click', function () { self._gPlein = !self._gPlein; self._rendre() })
    sh.getElementById('d-type').addEventListener('click', function () { self._dPlein = !self._dPlein; self._rendre() })

    // Glisser sur la figure : l'extrémité la plus proche suit le doigt, posée sur une abscisse entière.
    var svg = sh.getElementById('svg')
    var cote = null
    var xDepuis = function (ev) {
      var r = svg.getBoundingClientRect()
      var xv = (ev.clientX - r.left) / r.width * LARG
      return Math.round((xv - ML) / U - 0.5 + X0)
    }
    var poser = function (x) {
      x = Math.max(X0, Math.min(X1, x))
      if (cote === 'g') x = Math.min(x, self._d - 1)
      else x = Math.max(x, self._g + 1)
      if (cote === 'g' && x !== self._g) { self._g = x; self._rendre() }
      if (cote === 'd' && x !== self._d) { self._d = x; self._rendre() }
    }
    svg.addEventListener('pointerdown', function (ev) {
      var x = xDepuis(ev)
      cote = Math.abs(x - self._g) <= Math.abs(x - self._d) ? 'g' : 'd'
      if (x < self._g) cote = 'g'
      if (x > self._d) cote = 'd'
      try { svg.setPointerCapture(ev.pointerId) } catch (e) { /* capture impossible : sans conséquence */ }
      if (ev.pointerType === 'mouse') ev.preventDefault()
      poser(x)
    })
    svg.addEventListener('pointermove', function (ev) { if (cote) poser(xDepuis(ev)) })
    var fin = function () { cote = null }
    svg.addEventListener('pointerup', fin)
    svg.addEventListener('pointercancel', fin)
    this._rendre()
  }

  // Bornes de l'image sur [g ; d] : extremums aux nœuds ; ouverte si atteinte seulement en une extrémité creuse.
  _image() {
    var ys = COURBES[this._forme].y, g = this._g, d = this._d, self = this
    var inclus = function (x) { return (x > g && x < d) || (x === g && self._gPlein) || (x === d && self._dPlein) }
    var borne = function (signe) {
      var v = Infinity * signe
      for (var x = g; x <= d; x++) { var y = ys[x - X0]; if (signe * y < signe * v) v = y }
      var atteinte = [], extremites = []
      for (var x2 = g; x2 <= d; x2++) {
        if (ys[x2 - X0] !== v) continue
        if (inclus(x2)) atteinte.push(x2)
        else extremites.push(x2)
      }
      // Palier : deux nœuds voisins à la même valeur → atteinte entre eux (points intérieurs).
      for (var x3 = g; x3 < d; x3++) if (ys[x3 - X0] === v && ys[x3 + 1 - X0] === v && atteinte.indexOf(x3) < 0) atteinte.push(x3)
      return { v: v, ouverte: atteinte.length === 0, atteinte: atteinte, creux: extremites }
    }
    return { min: borne(1), max: borne(-1) }
  }

  _rendre() {
    var sh = this._sh, self = this, c = COURBES[this._forme], ys = c.y, g = this._g, d = this._d
    sh.querySelectorAll('#formes .btn').forEach(function (b, i) { b.setAttribute('aria-pressed', String(i === self._forme)) })
    sh.getElementById('g-type').textContent = this._gPlein ? '● pleine' : '○ creuse'
    sh.getElementById('d-type').textContent = this._dPlein ? '● pleine' : '○ creuse'
    sh.getElementById('g-type').setAttribute('aria-label', 'Extrémité gauche : ' + (this._gPlein ? 'pleine' : 'creuse') + ', changer')
    sh.getElementById('d-type').setAttribute('aria-label', 'Extrémité droite : ' + (this._dPlein ? 'pleine' : 'creuse') + ', changer')
    sh.getElementById('g-moins').disabled = g <= X0
    sh.getElementById('g-plus').disabled = g >= d - 1
    sh.getElementById('d-moins').disabled = d <= g + 1
    sh.getElementById('d-plus').disabled = d >= X1

    var im = this._image()
    var domTex = texIntervalle(texNb(g), texNb(d), !this._gPlein, !this._dPlein)
    var imTex = texIntervalle(texNb(im.min.v), texNb(im.max.v), im.min.ouverte, im.max.ouverte)
    sh.getElementById('ensembles').innerHTML =
      '<span class="c-dom">' + tex('\\operatorname{dom} f=' + domTex) + '</span><span class="sep"></span>' +
      '<span class="c-im">' + tex('\\operatorname{Im} f=' + imTex) + '</span>'

    // Lecture commentée.
    var l = '<ul>'
    l += '<li>Extrémité gauche ' + tex(texPoint(g, ys[g - X0])) + ' ' + (this._gPlein ? 'pleine' : 'creuse') + ' : ' + tex(texNb(g)) +
      (this._gPlein ? ' est dans le domaine, crochet fermé.' : ' n’est pas dans le domaine, crochet ouvert.') + '</li>'
    l += '<li>Extrémité droite ' + tex(texPoint(d, ys[d - X0])) + ' ' + (this._dPlein ? 'pleine' : 'creuse') + ' : ' + tex(texNb(d)) +
      (this._dPlein ? ' est dans le domaine, crochet fermé.' : ' n’est pas dans le domaine, crochet ouvert.') + '</li>'
    l += this._ligneBorne(im.max, 'La plus grande valeur') + this._ligneBorne(im.min, 'La plus petite valeur')
    l += '</ul>'
    sh.getElementById('lecture').innerHTML = l
    this._dessiner(im)
  }

  _ligneBorne(b, quoi) {
    var vT = tex(texNb(b.v))
    if (b.ouverte) {
      return '<li>' + quoi + ', ' + vT + ', n’est atteinte qu’en un point creux ' + tex(texPoint(b.creux[0], b.v)) +
        ' : elle n’est pas dans l’image, crochet ouvert.</li>'
    }
    var x = b.atteinte[0]
    var phrase = '<li>' + quoi + ', ' + vT + ', est atteinte en ' + tex('x=' + texNb(x)) + ' : crochet fermé.'
    if (b.creux.length) phrase += ' Le point ' + tex(texPoint(b.creux[0], b.v)) + ' est creux, mais cette valeur est atteinte ailleurs : le crochet reste fermé.'
    return phrase + '</li>'
  }

  _dessiner(im) {
    var svg = this._sh.getElementById('svg'), c = COURBES[this._forme], ys = c.y, g = this._g, d = this._d
    svg.innerHTML = ''
    defsFleche(svg)
    // Grille d'une unité.
    for (var x = X0; x <= X1; x++) svg.appendChild(svgEl('line', { x1: px(x), x2: px(x), y1: py(Y0 - 0.5), y2: py(Y1 + 0.5), class: 'grille' }))
    for (var y = Y0; y <= Y1; y++) svg.appendChild(svgEl('line', { x1: px(X0 - 0.5), x2: px(X1 + 0.5), y1: py(y), y2: py(y), class: 'grille' }))
    // Axes et graduations.
    svg.appendChild(svgEl('line', { x1: px(X0 - 0.5), x2: px(X1 + 0.5) + 6, y1: py(0), y2: py(0), class: 'axe', 'marker-end': 'url(#fleche)' }))
    svg.appendChild(svgEl('line', { x1: px(0), x2: px(0), y1: py(Y0 - 0.5), y2: py(Y1 + 0.5) - 6, class: 'axe', 'marker-end': 'url(#fleche)' }))
    var lx = svgEl('text', { x: px(X1 + 0.5) + 2, y: py(0) - 8, class: 'nom-axe', 'text-anchor': 'end' })
    lx.textContent = 'x'
    svg.appendChild(lx)
    var ly = svgEl('text', { x: px(0) + 9, y: py(Y1 + 0.5) + 4, class: 'nom-axe' })
    ly.textContent = 'y'
    svg.appendChild(ly)
    // Rappels pointillés : extrémités vers l'axe des x, extremums vers l'axe des y.
    var yg = ys[g - X0], yd = ys[d - X0]
    svg.appendChild(svgEl('line', { x1: px(g), x2: px(g), y1: py(yg), y2: py(0), class: 'rappel-dom' }))
    svg.appendChild(svgEl('line', { x1: px(d), x2: px(d), y1: py(yd), y2: py(0), class: 'rappel-dom' }))
    var xMax = im.max.atteinte.length ? im.max.atteinte[0] : im.max.creux[0]
    var xMin = im.min.atteinte.length ? im.min.atteinte[0] : im.min.creux[0]
    svg.appendChild(svgEl('line', { x1: px(xMax), x2: px(0), y1: py(im.max.v), y2: py(im.max.v), class: 'rappel-im' }))
    svg.appendChild(svgEl('line', { x1: px(xMin), x2: px(0), y1: py(im.min.v), y2: py(im.min.v), class: 'rappel-im' }))

    // Projections posées sur les axes.
    svg.appendChild(svgEl('line', { x1: px(g), x2: px(d), y1: py(0), y2: py(0), class: 'proj-dom' }))
    svg.appendChild(svgEl('circle', { cx: px(g), cy: py(0), r: 4.5, class: this._gPlein ? 'b-dom-plein' : 'b-dom-creux' }))
    svg.appendChild(svgEl('circle', { cx: px(d), cy: py(0), r: 4.5, class: this._dPlein ? 'b-dom-plein' : 'b-dom-creux' }))
    svg.appendChild(svgEl('line', { x1: px(0), x2: px(0), y1: py(im.min.v), y2: py(im.max.v), class: 'proj-im' }))
    svg.appendChild(svgEl('circle', { cx: px(0), cy: py(im.min.v), r: 4.5, class: im.min.ouverte ? 'b-im-creux' : 'b-im-plein' }))
    svg.appendChild(svgEl('circle', { cx: px(0), cy: py(im.max.v), r: 4.5, class: im.max.ouverte ? 'b-im-creux' : 'b-im-plein' }))

    // Graduations par-dessus les rappels et les projections (halo du fond).
    for (var tx = X0; tx <= X1; tx++) {
      if (tx === 0) continue
      var t = svgEl('text', { x: px(tx), y: py(0) + 15, 'text-anchor': 'middle', class: 'tick-label' })
      t.textContent = String(tx).replace('-', '−')
      svg.appendChild(t)
    }
    for (var ty = Y0; ty <= Y1; ty++) {
      if (ty === 0) continue
      var t2 = svgEl('text', { x: px(0) - 6, y: py(ty) + 3.5, 'text-anchor': 'end', class: 'tick-label' })
      t2.textContent = String(ty).replace('-', '−')
      svg.appendChild(t2)
    }
    var t0 = svgEl('text', { x: px(0) - 6, y: py(0) + 15, 'text-anchor': 'end', class: 'tick-label' })
    t0.textContent = '0'
    svg.appendChild(t0)

    // La courbe, entre ses deux extrémités.
    var m = tangentes(ys), pts = []
    for (var i = 0; i <= (d - g) * 24; i++) {
      var xx = g + i / 24
      pts.push(px(xx).toFixed(2) + ',' + py(evaluer(ys, m, xx)).toFixed(2))
    }
    svg.appendChild(svgEl('polyline', { points: pts.join(' '), class: 'courbe' }))
    svg.appendChild(svgEl('circle', { cx: px(g), cy: py(yg), r: 6, class: this._gPlein ? 'ext-plein' : 'ext-creux' }))
    svg.appendChild(svgEl('circle', { cx: px(d), cy: py(yd), r: 6, class: this._dPlein ? 'ext-plein' : 'ext-creux' }))
    svg.appendChild(svgEl('circle', { cx: px(g), cy: py(yg), r: 26, class: 'prise' }))
    svg.appendChild(svgEl('circle', { cx: px(d), cy: py(yd), r: 26, class: 'prise' }))
  }
}

if (!customElements.get('projections-domaine-image-widget')) {
  customElements.define('projections-domaine-image-widget', ProjectionsDomaineImageWidget)
}
