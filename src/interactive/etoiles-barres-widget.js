/* ================================================================
 * <etoiles-barres-widget> — atelier « Étoiles et barres » (6e, ch. 7,
 * § 1, combinaison avec répétitions). p boules de glace (étoiles)
 * réparties entre n parfums par n − 1 barres. On GLISSE les barres
 * (souris ou doigt, Pointer Events ; flèches du clavier sur une barre
 * sélectionnée) : la répartition se lit en direct (« 2 vanille,
 * 0 fraise, 1 chocolat »). Les p + n − 1 places sont fixes ; choisir
 * les p places des étoiles suffit : Γₙᵖ = Cₙ₊ₚ₋₁ᵖ. Compteur des
 * répartitions déjà construites et liste complète quand elle est
 * courte. Mode « au moins un de chaque » : ni barre au bord, ni deux
 * barres collées ; il reste Cₚ₋₁ⁿ⁻¹ répartitions (= Γₙᵖ⁻ⁿ).
 * Pas fixe de 40 unités par place, figure centrée. Défaut n = 3,
 * p = 3, répartition 2 / 0 / 1. Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, CSS_BASE, svgEl } from './katex-shadow.js'

var PARFUMS = ['vanille', 'fraise', 'chocolat', 'pistache', 'citron']
var COULEURS = ['tip', 'rose', 'accent', 'good', 'sky']
var N_MIN = 2, N_MAX = 5, P_MAX = 8
var PAS = 40, LARG_MIN = 300, HAUT = 118, Y_LIGNE = 52

function fact(k) { var f = 1; for (var i = 2; i <= k; i++) f *= i; return f }
function comb(n, k) { if (k < 0 || k > n) return 0; return Math.round(fact(n) / (fact(k) * fact(n - k))) }
function cnk(n, k) { return 'C_{' + n + '}^{' + k + '}' }

function etoile(cx, cy, R, r) {
  var pts = []
  for (var i = 0; i < 10; i++) {
    var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R
    pts.push((cx + rr * Math.cos(a)).toFixed(2) + ',' + (cy + rr * Math.sin(a)).toFixed(2))
  }
  return pts.join(' ')
}

// Toutes les suites de p étoiles (e) et n − 1 barres (b), ordre lexicographique « b » < « e ».
function toutes(n, p) {
  var res = []
  ;(function f(pref, e, b) {
    if (e === 0 && b === 0) { res.push(pref); return }
    if (b > 0) f(pref + 'b', e, b - 1)
    if (e > 0) f(pref + 'e', e - 1, b)
  })('', p, n - 1)
  return res
}
function comptes(motif, n) {
  var c = [], cur = 0
  for (var i = 0; i < motif.length; i++) {
    if (motif[i] === 'e') cur++
    else { c.push(cur); cur = 0 }
  }
  c.push(cur)
  while (c.length < n) c.push(0)
  return c
}
function valide(motif) { return motif[0] !== 'b' && motif[motif.length - 1] !== 'b' && motif.indexOf('bb') < 0 }

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE +
  ':host{text-align:left;}' +
  '.figure svg{max-width:520px;touch-action:none;user-select:none;-webkit-user-select:none;}' +
  '.place{fill:none;stroke:var(--line,#ccd8e0);stroke-width:1;stroke-dasharray:3 3;}' +
  '.objet{transition:transform .16s ease-out;}' +
  '.objet.tenu{transition:none;}' +
  '.barre-trait{fill:var(--ink,#182430);}' +
  '.barre{cursor:grab;outline:none;}' +
  '.barre.tenu{cursor:grabbing;}' +
  '.barre:focus-visible .barre-trait,.barre.choisie .barre-trait{fill:var(--accent,#b65c1f);}' +
  '.barre-prise{fill:transparent;}' +
  '.poignee{fill:var(--surface,#fff);stroke:var(--ink,#182430);stroke-width:1.5;}' +
  '.barre:focus-visible .poignee,.barre.choisie .poignee{stroke:var(--accent,#b65c1f);}' +
  '.barre.collee .barre-trait{fill:var(--bad,#b23a3a);}' +
  '.nb{font-size:13px;font-weight:700;font-family:var(--sans,sans-serif);text-anchor:middle;}' +
  '.nb.vide{fill:var(--bad,#b23a3a);}' +
  '.s-tip{fill:var(--tip,#8a7200);}.s-rose{fill:var(--rose,#b23a7a);}.s-accent{fill:var(--accent,#b65c1f);}' +
  '.s-good{fill:var(--good,#2f7a4f);}.s-sky{fill:var(--sky,#2f6fb0);}' +
  '.t-tip{color:var(--tip,#8a7200);}.t-rose{color:var(--rose,#b23a7a);}.t-accent{color:var(--accent,#b65c1f);}' +
  '.t-good{color:var(--good,#2f7a4f);}.t-sky{color:var(--sky,#2f6fb0);}' +
  '.lecture{text-align:center;font-size:1.02rem;margin:0 0 10px;line-height:1.7;}' +
  '.lecture b{font-variant-numeric:tabular-nums;}' +
  '.reglages{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:0 18px;}' +
  '.liste{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 0;}' +
  '.motif{font-family:var(--sans,sans-serif);font-size:0.92rem;letter-spacing:1px;padding:3px 6px;border-radius:4px;' +
  'border:1px solid var(--line,#ccd8e0);background:var(--surface,#fff);color:var(--ink-faint,#8a97a1);min-height:30px;cursor:pointer;}' +
  '.motif.vu{color:var(--ink,#182430);border-color:var(--good,#2f7a4f);}' +
  '.motif.actuel{background:var(--accent-soft,#f4e3d1);border-color:var(--accent,#b65c1f);color:var(--ink,#182430);font-weight:700;}' +
  '</style>' +
  '<p class="lecture" id="consigne">Glisse les barres entre les boules : chaque barre sépare deux parfums.</p>' +
  '<div class="figure"><svg id="svg" viewBox="0 0 ' + LARG_MIN + ' ' + HAUT + '" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="Étoiles et barres"></svg></div>' +
  '<p class="lecture" id="lecture" aria-live="polite"></p>' +
  '<div class="reglages">' +
  '<div class="curseur"><span class="nom" id="nom-n"></span><button class="btn" id="n-moins" aria-label="Un parfum de moins">−</button>' +
  '<input type="range" id="n" min="' + N_MIN + '" max="' + N_MAX + '" step="1" aria-label="Nombre de parfums n"><button class="btn" id="n-plus" aria-label="Un parfum de plus">+</button></div>' +
  '<div class="curseur"><span class="nom" id="nom-p"></span><button class="btn" id="p-moins" aria-label="Une boule de moins">−</button>' +
  '<input type="range" id="p" min="1" max="' + P_MAX + '" step="1" aria-label="Nombre de boules p"><button class="btn" id="p-plus" aria-label="Une boule de plus">+</button></div>' +
  '</div>' +
  '<div class="rangee">' +
  '<button class="btn" id="mode" aria-pressed="false">Au moins un de chaque</button>' +
  '<button class="btn" id="hasard">Au hasard</button>' +
  '<button class="btn" id="voir" aria-pressed="false">Voir toutes les répartitions</button>' +
  '</div>' +
  '<div class="panneau" id="panneau"></div>'

class EtoilesBarresWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._n = 3
    this._p = 3
    this._auMoins = false
    this._voir = false
    this._seq = null // identifiants dans l'ordre : 'e0', 'b1'…
    this._vus = {}
    this._choisie = null
    this._drag = null
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    var regler = function (cle, v) {
      var min = cle === 'n' ? N_MIN : (self._auMoins ? self._n : 1)
      var max = cle === 'n' ? (self._auMoins ? Math.min(N_MAX, self._p) : N_MAX) : P_MAX
      var nv = Math.max(min, Math.min(max, Math.round(v)))
      if (nv === self['_' + cle]) { self._majReglages(); return }
      self['_' + cle] = nv
      self._nouvelleConfig(null)
    }
    ;['n', 'p'].forEach(function (cle) {
      var input = sh.getElementById(cle)
      input.addEventListener('input', function () { regler(cle, parseFloat(input.value)) })
      sh.getElementById(cle + '-moins').addEventListener('click', function () { regler(cle, self['_' + cle] - 1) })
      sh.getElementById(cle + '-plus').addEventListener('click', function () { regler(cle, self['_' + cle] + 1) })
    })
    sh.getElementById('mode').addEventListener('click', function () {
      self._auMoins = !self._auMoins
      if (self._auMoins && self._p < self._n) { self._p = self._n; self._nouvelleConfig(null); return }
      if (self._auMoins && !valide(self._motif())) self._fixerMotif(self._premierValide())
      self._maj()
    })
    sh.getElementById('hasard').addEventListener('click', function () {
      var liste = toutes(self._n, self._p).filter(function (m) { return !self._auMoins || valide(m) })
      self._fixerMotif(liste[Math.floor(Math.random() * liste.length)])
      self._maj()
    })
    sh.getElementById('voir').addEventListener('click', function () { self._voir = !self._voir; self._maj() })
    sh.getElementById('panneau').addEventListener('click', function (ev) {
      var b = ev.target.closest && ev.target.closest('[data-motif]')
      if (!b) return
      self._fixerMotif(b.getAttribute('data-motif'))
      self._maj()
    })
    this._nouvelleConfig('eebbe')
  }

  _motif() { return this._seq.map(function (id) { return id[0] }).join('') }

  _premierValide() {
    var n = this._n, p = this._p, m = ''
    // Répartition la plus équilibrée : une boule de chaque, le reste au début.
    var c = []
    for (var i = 0; i < n; i++) c.push(1 + (i < (p - n) % n ? 1 : 0) + Math.floor((p - n) / n))
    c.forEach(function (q, j) { m += 'e'.repeat(q) + (j < n - 1 ? 'b' : '') })
    return m
  }

  // Réordonne les objets existants pour suivre un motif « eebbe ».
  _fixerMotif(motif) {
    var es = this._seq.filter(function (id) { return id[0] === 'e' }), bs = this._seq.filter(function (id) { return id[0] === 'b' })
    var ie = 0, ib = 0
    this._seq = motif.split('').map(function (c) { return c === 'e' ? es[ie++] : bs[ib++] })
  }

  _nouvelleConfig(motif) {
    var n = this._n, p = this._p
    this._vus = {}
    this._choisie = null
    var seq = [], ie = 0, ib = 0
    var m = motif
    if (!m) {
      m = ''
      if (this._auMoins) m = this._premierValide()
      else {
        // Répartition par défaut : boules partagées le plus également possible.
        for (var i = 0; i < n; i++) m += 'e'.repeat(Math.floor(p / n) + (i < p % n ? 1 : 0)) + (i < n - 1 ? 'b' : '')
      }
    }
    m.split('').forEach(function (c) { seq.push(c === 'e' ? 'e' + ie++ : 'b' + ib++) })
    this._seq = seq
    this._construire()
    this._maj()
  }

  // Largeur de la figure : toutes les places, plus une marge d'une demi-place de chaque côté
  // (les effectifs des compartiments vides du bord s'y écrivent).
  _larg() { return Math.max(LARG_MIN, (this._seq.length + 1) * PAS) }

  _x(i) {
    var S = this._seq.length
    return this._larg() / 2 + (i - (S - 1) / 2) * PAS
  }

  _construire() {
    var self = this, svg = this._sh.getElementById('svg')
    svg.innerHTML = ''
    svg.setAttribute('viewBox', '0 0 ' + this._larg() + ' ' + HAUT)
    var S = this._seq.length
    for (var i = 0; i < S; i++) {
      svg.appendChild(svgEl('rect', { x: this._x(i) - PAS / 2 + 2, y: Y_LIGNE - 22, width: PAS - 4, height: 44, rx: 4, class: 'place' }))
    }
    this._gNb = svgEl('g', {})
    svg.appendChild(this._gNb)
    this._objets = {}
    var S1 = String(S - 1)
    this._seq.forEach(function (id) {
      var g
      if (id[0] === 'e') {
        g = svgEl('g', { class: 'objet' })
        g.appendChild(svgEl('polygon', { points: etoile(0, 0, 13, 5.6), class: 'corps' }))
      } else {
        g = svgEl('g', { class: 'objet barre', tabindex: '0', role: 'slider', 'aria-label': 'Barre ' + (+id.slice(1) + 1) + ', déplace-la avec les flèches', 'aria-valuemin': '0', 'aria-valuemax': S1 })
        g.appendChild(svgEl('rect', { x: -PAS / 2, y: -40, width: PAS, height: 84, class: 'barre-prise' }))
        g.appendChild(svgEl('rect', { x: -2.5, y: -26, width: 5, height: 52, rx: 2, class: 'barre-trait' }))
        g.appendChild(svgEl('circle', { cx: 0, cy: 34, r: 7, class: 'poignee' }))
        self._ecouterBarre(g, id)
      }
      g.setAttribute('data-id', id)
      self._objets[id] = g
      svg.appendChild(g)
    })
  }

  _ecouterBarre(g, id) {
    var self = this, svg = this._sh.getElementById('svg')
    var xSvg = function (ev) {
      var pt = svg.createSVGPoint()
      pt.x = ev.clientX
      pt.y = ev.clientY
      var m = svg.getScreenCTM()
      return m ? pt.matrixTransform(m.inverse()).x : 0
    }
    g.addEventListener('pointerdown', function (ev) {
      if (ev.button !== undefined && ev.button > 0) return
      ev.preventDefault()
      try { g.setPointerCapture(ev.pointerId) } catch { /* rien */ }
      self._choisie = id
      self._drag = { id: id, pointeur: ev.pointerId }
      g.classList.add('tenu')
      try { g.focus({ preventScroll: true }) } catch { /* rien */ }
      self._maj()
    })
    g.addEventListener('pointermove', function (ev) {
      var d = self._drag
      if (!d || d.id !== id || d.pointeur !== ev.pointerId) return
      var x = xSvg(ev), S = self._seq.length
      var j = Math.max(0, Math.min(S - 1, Math.round((x - self._x(0)) / PAS)))
      var i = self._seq.indexOf(id)
      if (j !== i) {
        self._seq.splice(i, 1)
        self._seq.splice(j, 0, id)
        self._maj()
      }
      // La barre tenue suit le doigt, bornée à la rangée.
      var xb = Math.max(self._x(0), Math.min(self._x(S - 1), x))
      g.style.transform = 'translate(' + xb + 'px,' + Y_LIGNE + 'px)'
    })
    var lacher = function (ev) {
      var d = self._drag
      if (!d || d.id !== id || (ev && d.pointeur !== ev.pointerId)) return
      self._drag = null
      g.classList.remove('tenu')
      self._maj()
    }
    g.addEventListener('pointerup', lacher)
    g.addEventListener('pointercancel', lacher)
    g.addEventListener('lostpointercapture', lacher)
    g.addEventListener('keydown', function (ev) {
      var dir = ev.key === 'ArrowLeft' || ev.key === 'ArrowDown' ? -1 : ev.key === 'ArrowRight' || ev.key === 'ArrowUp' ? 1 : 0
      if (!dir) return
      ev.preventDefault()
      var i = self._seq.indexOf(id), j = i + dir
      if (j < 0 || j >= self._seq.length) return
      self._seq.splice(i, 1)
      self._seq.splice(j, 0, id)
      self._choisie = id
      self._maj()
    })
    g.addEventListener('focus', function () { self._choisie = id; self._majClasses() })
  }

  _majReglages() {
    var sh = this._sh, n = this._n, p = this._p
    sh.getElementById('n').value = String(n)
    sh.getElementById('p').value = String(p)
    sh.getElementById('nom-n').innerHTML = tex('n=' + n)
    sh.getElementById('nom-p').innerHTML = tex('p=' + p)
    sh.getElementById('n-moins').disabled = n <= N_MIN
    sh.getElementById('n-plus').disabled = n >= (this._auMoins ? Math.min(N_MAX, p) : N_MAX)
    sh.getElementById('p-moins').disabled = p <= (this._auMoins ? n : 1)
    sh.getElementById('p-plus').disabled = p >= P_MAX
    sh.getElementById('mode').setAttribute('aria-pressed', String(this._auMoins))
  }

  _majClasses() {
    var self = this
    this._seq.forEach(function (id) {
      if (id[0] !== 'b') return
      self._objets[id].classList.toggle('choisie', id === self._choisie)
    })
  }

  _maj() {
    var self = this, n = this._n, p = this._p, seq = this._seq
    this._majReglages()
    var motif = this._motif(), c = comptes(motif, n), ok = valide(motif)
    if (!this._auMoins || ok) this._vus[motif] = true

    // Positions et couleurs : les étoiles prennent la couleur de leur parfum.
    var parfum = 0
    seq.forEach(function (id, i) {
      var g = self._objets[id]
      if (id[0] === 'b') {
        parfum++
        var collee = self._auMoins && (i === 0 || i === seq.length - 1 || seq[i - 1][0] === 'b' || seq[i + 1][0] === 'b')
        g.classList.toggle('collee', collee)
        if (!(self._drag && self._drag.id === id)) g.style.transform = 'translate(' + self._x(i) + 'px,' + Y_LIGNE + 'px)'
        g.setAttribute('aria-valuenow', String(i))
        g.setAttribute('aria-valuetext', 'place ' + (i + 1) + ' sur ' + seq.length)
      } else {
        g.style.transform = 'translate(' + self._x(i) + 'px,' + Y_LIGNE + 'px)'
        g.firstChild.setAttribute('class', 'corps s-' + COULEURS[parfum])
      }
    })
    this._majClasses()

    // Effectif de chaque parfum, sous son compartiment.
    this._gNb.innerHTML = ''
    var debut = 0
    for (var t = 0; t < n; t++) {
      var fin = debut
      while (fin < seq.length && seq[fin][0] === 'e') fin++
      // compartiment = places debut..fin−1 ; vide : entre deux barres (ou au bord).
      var xc = fin > debut ? (this._x(debut) + this._x(fin - 1)) / 2 : (debut === 0 ? this._x(0) - PAS / 2 : debut >= seq.length ? this._x(seq.length - 1) + PAS / 2 : (this._x(debut - 1) + this._x(debut)) / 2)
      var tx = svgEl('text', { x: xc, y: HAUT - 6, class: 'nb t-' + COULEURS[t] + (c[t] === 0 && this._auMoins ? ' vide' : '') })
      tx.setAttribute('style', 'fill:currentColor')
      tx.textContent = String(c[t])
      this._gNb.appendChild(tx)
      debut = fin + 1
    }

    // Lecture.
    this._sh.getElementById('lecture').innerHTML = c.map(function (q, i) {
      return '<span class="t-' + COULEURS[i] + '"><b>' + q + '</b> ' + PARFUMS[i] + '</span>'
    }).join(', ')

    // Panneau.
    var total = comb(n + p - 1, p), totalAuMoins = comb(p - 1, n - 1)
    var nbVus = Object.keys(this._vus).length
    var h = ''
    if (!this._auMoins) {
      h += '<p>' + p + (p > 1 ? ' boules' : ' boule') + ' et ' + (n - 1) + (n > 2 ? ' barres' : ' barre') + ' : ' + tex(p + '+' + (n - 1) + '=' + (n + p - 1)) +
        ' places. Placer les ' + p + (p > 1 ? ' étoiles' : ' étoile') + ' revient à choisir ' + p + (p > 1 ? ' places' : ' place') + ' parmi ' + (n + p - 1) +
        ' (les barres prennent les autres) :</p>' +
        '<p class="formule">' + tex('\\Gamma_{' + n + '}^{' + p + '}=' + cnk(n + p - 1, p) + '=' + total) + '</p>' +
        '<p>Une barre peut aller au bord ou contre une autre barre : un parfum peut avoir 0 boule.</p>'
    } else {
      h += '<p>Au moins une boule de chaque parfum : une barre ne va jamais au bord, et jamais deux barres côte à côte. Les ' + (n - 1) + (n > 2 ? ' barres vont' : ' barre va') +
        ' dans les ' + (p - 1) + (p > 2 ? ' espaces' : ' espace') + ' entre deux étoiles, au plus une par espace :</p>' +
        '<p class="formule">' + tex(cnk(p - 1, n - 1) + '=' + totalAuMoins) + '</p>' +
        '<p>Autre façon de voir : on donne d’abord une boule de chaque parfum, puis on répartit librement les ' + (p - n) + ' restantes : ' +
        tex('\\Gamma_{' + n + '}^{' + (p - n) + '}=' + cnk(p - 1, p - n) + '=' + totalAuMoins) + '.</p>'
      if (!ok) {
        var vides = c.map(function (q, i) { return q === 0 ? PARFUMS[i] : null }).filter(Boolean)
        h += '<p class="ko">Pas permis dans ce mode : ' + (vides.length > 1 ? 'les parfums ' + vides.join(', ') + ' n’ont' : 'le parfum ' + vides[0] + ' n’a') + ' aucune boule.</p>'
      }
    }
    var tot = this._auMoins ? totalAuMoins : total
    h += '<p>Répartitions différentes déjà construites : <strong>' + nbVus + '</strong> sur ' + tot + (nbVus >= tot ? ' <span class="ok">— toutes !</span>' : '') + '.' +
      (tot > 84 ? ' La liste complète serait trop longue pour être affichée.' : '') + '</p>'
    var voir = this._sh.getElementById('voir')
    voir.disabled = tot > 84
    voir.title = tot > 84 ? 'Liste trop longue pour être affichée' : ''
    voir.setAttribute('aria-pressed', String(this._voir && tot <= 84))
    if (this._voir && tot <= 84) {
      var liste = toutes(n, p).filter(function (m) { return !self._auMoins || valide(m) })
      h += '<div class="liste">' + liste.map(function (m) {
        var cls = 'motif' + (self._vus[m] ? ' vu' : '') + (m === motif ? ' actuel' : '')
        return '<button class="' + cls + '" data-motif="' + m + '" aria-label="' + comptes(m, n).join(', ') + '">' +
          m.replace(/e/g, '★').replace(/b/g, '│') + '</button>'
      }).join('') + '</div>'
    }
    this._sh.getElementById('panneau').innerHTML = h
  }
}

if (!customElements.get('etoiles-barres-widget')) customElements.define('etoiles-barres-widget', EtoilesBarresWidget)
