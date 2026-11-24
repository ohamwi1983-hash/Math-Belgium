/* ================================================================
 * <fprime-vers-f-widget> — atelier « Du graphique de f′ à la courbe de
 * f » (5e, ch. 5, § 6). Seul le graphique de f′ est montré : une parabole
 * f′(x) = a(x − r₁)(x − r₂), réglable (sens d'ouverture, deux zéros,
 * éventuellement confondus). L'élève PRÉDIT, intervalle par intervalle, le
 * sens de variation de f (signe de f′) puis sa concavité (f′ croissante
 * ou décroissante), et clique « Afficher f » : la courbe de f apparaît
 * sous celle de f′, chaque prédiction est jugée ✓ / ✗, extremums et point
 * d'inflexion sont marqués. Fenêtres FIXES (jamais recalculées depuis un
 * curseur). Les deux graphes sont dans une seule figure, sans bouton à
 * l'intérieur (épinglage). Web Component (Shadow DOM).
 * Complète le mode « lecture inverse » de <f-fprime-fseconde-widget> (§ 4),
 * qui montre f′ puis révèle f sans prédiction ni f′ réglable.
 * ================================================================ */
import { styleKatex, tex, texNombre, texIntervalle, svgEl, defsFleche, txtNombre } from './katex-shadow.js'
import { CSS_LIMITES, curseur, choix, texte } from './limites-commun.js'

var L = 420, HP = 190, ECART = 18, MG = 34, MD = 16, MH = 12, MB = 20
var H = HP * 2 + ECART
var X0 = -3.5, X1 = 3.5
var VUE_FP = { y0: -6, y1: 8 }, VUE_F = { y0: -6, y1: 6 }

function texBorne(v) { return v === -Infinity ? '-\\infty' : v === Infinity ? '+\\infty' : texNombre(v, 2) }

var T = document.createElement('template')
T.innerHTML =
  '<style>' + CSS_LIMITES +
  '.cadre{fill:none;stroke:var(--line,#ccd8e0);stroke-width:1;}' +
  '.courbe-fp{fill:none;stroke:var(--sky,#2f6fb0);stroke-width:2.6;}' +
  '.masque{font-size:13px;font-style:italic;fill:var(--ink-soft,#51626f);font-family:var(--sans,sans-serif);}' +
  '.ligne-pred{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;margin:0 0 6px;}' +
  '.ligne-pred .txt{flex:1 1 100%;}' +
  '.verdict{min-width:22px;font-weight:700;}' +
  'h4{margin:4px 0 6px;font-size:0.92rem;}' +
  '</style>' +
  '<div class="reglages"><div id="c-a"></div><div id="r-1"></div><div id="r-2"></div></div>' +
  '<div class="figure"><svg id="svg" viewBox="0 0 ' + L + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Graphique de f′, puis courbe de f"></svg></div>' +
  '<div class="panneau" id="pred"></div>' +
  '<div class="rangee"><button class="btn" id="afficher" type="button">Afficher f</button>' +
  '<button class="btn" id="effacer" type="button">Effacer mes réponses</button></div>' +
  '<div class="panneau" id="bilan"></div>'

class FprimeVersFWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(T.content.cloneNode(true))
    this._sh = sh
    this._a = 1
    this._r1 = -1
    this._r2 = 2
    this._reset()
  }

  _reset() { this._sens = {}; this._conc = {}; this._revele = false }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    choix(sh.getElementById('c-a'), [
      { id: '1', html: 'Parabole ' + tex('\\cup') + ' ' + tex('(a>0)') }, { id: '-1', html: 'Parabole ' + tex('\\cap') + ' ' + tex('(a<0)') },
    ], '1', function (id) { self._a = +id; self._reset(); self._rendre() }, 'Sens de la parabole de f′')
    curseur(sh.getElementById('r-1'), { min: -2, max: 2, pas: 0.5, valeur: this._r1, aria: 'Premier zéro de f′', largeurNom: '70px',
      nom: function (v) { return tex('r_1=' + texNombre(v, 1)) }, changer: function (v) { self._r1 = v; self._reset(); self._rendre() } })
    curseur(sh.getElementById('r-2'), { min: -2, max: 2, pas: 0.5, valeur: this._r2, aria: 'Second zéro de f′', largeurNom: '70px',
      nom: function (v) { return tex('r_2=' + texNombre(v, 1)) }, changer: function (v) { self._r2 = v; self._reset(); self._rendre() } })
    sh.getElementById('afficher').addEventListener('click', function () { self._revele = true; self._rendre() })
    sh.getElementById('effacer').addEventListener('click', function () { self._reset(); self._rendre() })
    sh.getElementById('pred').addEventListener('click', function (e) {
      var b = e.target.closest('button')
      if (!b || self._revele) return
      if (b.dataset.sens !== undefined) self._sens[b.dataset.i] = b.dataset.sens
      if (b.dataset.conc !== undefined) self._conc[b.dataset.i] = b.dataset.conc
      self._rendre()
    })
    this._rendre()
  }

  _modele() {
    var a = this._a, p = Math.min(this._r1, this._r2), q = Math.max(this._r1, this._r2), m = (p + q) / 2
    var fp = function (x) { return a * (x - p) * (x - q) }
    var f = function (x) { return a * (x * x * x / 3 - (p + q) * x * x / 2 + p * q * x) }
    var zones = p < q
      ? [{ g: -Infinity, d: p, signe: a }, { g: p, d: q, signe: -a }, { g: q, d: Infinity, signe: a }]
      : [{ g: -Infinity, d: p, signe: a }, { g: p, d: Infinity, signe: a }]
    var concs = [{ g: -Infinity, d: m, signe: -a }, { g: m, d: Infinity, signe: a }]
    return { a: a, p: p, q: q, m: m, fp: fp, f: f, zones: zones, concs: concs }
  }

  _rendre() {
    var sh = this._sh, M = this._modele(), self = this
    var svg = sh.getElementById('svg')
    svg.innerHTML = ''
    defsFleche(svg)
    var px = function (x) { return MG + ((x - X0) / (X1 - X0)) * (L - MG - MD) }
    function panneau(i, vue, nom) {
      var oy = i * (HP + ECART)
      var py = function (y) { return oy + HP - MB - ((y - vue.y0) / (vue.y1 - vue.y0)) * (HP - MH - MB) }
      var defs = svg.querySelector('defs')
      var cp = svgEl('clipPath', { id: 'clip' + i })
      cp.appendChild(svgEl('rect', { x: px(X0), y: py(vue.y1), width: px(X1) - px(X0), height: py(vue.y0) - py(vue.y1) }))
      defs.appendChild(cp)
      svg.appendChild(svgEl('rect', { x: 1, y: oy + 1, width: L - 2, height: HP - 2, rx: 4, class: 'cadre' }))
      for (var g = -3; g <= 3; g++) {
        svg.appendChild(svgEl('line', { x1: px(g), x2: px(g), y1: py(vue.y0), y2: py(vue.y1), class: 'grille' }))
        if (g !== 0) texte(svg, px(g), py(0) + 13, txtNombre(g, 0), 'tick-label', 'middle')
      }
      svg.appendChild(svgEl('line', { x1: px(X0), x2: px(X1) + 6, y1: py(0), y2: py(0), class: 'axe', 'marker-end': 'url(#fleche)' }))
      svg.appendChild(svgEl('line', { x1: px(0), x2: px(0), y1: py(vue.y0), y2: py(vue.y1) - 6, class: 'axe', 'marker-end': 'url(#fleche)' }))
      texte(svg, px(0) + 8, py(vue.y1) + 6, nom, 'nom-axe', 'start')
      var zone = svgEl('g', { 'clip-path': 'url(#clip' + i + ')' })
      svg.appendChild(zone)
      return { py: py, zone: zone, oy: oy }
    }
    function trace(P, fn, cls) {
      var d = ''
      for (var k = 0; k <= 300; k++) {
        var x = X0 + ((X1 - X0) * k) / 300, y = Math.max(-60, Math.min(60, fn(x)))
        d += (k ? 'L' : 'M') + px(x).toFixed(1) + ',' + P.py(y).toFixed(1)
      }
      P.zone.appendChild(svgEl('path', { d: d, class: cls }))
    }
    var P1 = panneau(0, VUE_FP, 'f′(x)')
    trace(P1, M.fp, 'courbe-fp')
    ;[M.p, M.q].forEach(function (r) { P1.zone.appendChild(svgEl('circle', { cx: px(r), cy: P1.py(0), r: 4.5, class: 'pt-creux' })) })
    P1.zone.appendChild(svgEl('circle', { cx: px(M.m), cy: P1.py(M.fp(M.m)), r: 4, class: 'pt' }))

    var P2 = panneau(1, VUE_F, 'f(x)')
    if (this._revele) {
      trace(P2, M.f, 'courbe')
      M.zones.forEach(function (z, i) {
        if (i === 0) return
        var prev = M.zones[i - 1]
        if (prev.signe !== z.signe) P2.zone.appendChild(svgEl('circle', { cx: px(z.g), cy: P2.py(M.f(z.g)), r: 5, class: prev.signe > 0 ? 'pt-ok' : 'pt-ko' }))
      })
      P2.zone.appendChild(svgEl('circle', { cx: px(M.m), cy: P2.py(M.f(M.m)), r: 4.5, class: 'pt' }))
    } else {
      texte(svg, L / 2, P2.oy + HP / 2, 'Courbe de f cachée : prédis, puis « Afficher f ».', 'masque', 'middle')
    }

    var ok = 0, total = 0
    function verdict(choisi, attendu) {
      if (!self._revele) return ''
      total++
      if (choisi === attendu) { ok++; return '<span class="verdict ok" aria-label="juste">✓</span>' }
      return '<span class="verdict ko" aria-label="faux">✗</span>'
    }
    var html = '<h4>1. Sens de variation de f (lis le signe de f′)</h4>'
    M.zones.forEach(function (z, i) {
      var att = z.signe > 0 ? 'c' : 'd', ch = self._sens[i]
      html += '<div class="ligne-pred"><span class="txt">Sur ' + tex(texIntervalle(texBorne(z.g), texBorne(z.d), true, true)) + ', f est</span>' +
        '<button class="btn" type="button" data-i="' + i + '" data-sens="c" aria-pressed="' + (ch === 'c') + '">croissante ↗</button>' +
        '<button class="btn" type="button" data-i="' + i + '" data-sens="d" aria-pressed="' + (ch === 'd') + '">décroissante ↘</button>' +
        verdict(ch, att) + '</div>'
    })
    html += '<h4>2. Concavité de f (f′ monte ou descend ?)</h4>'
    M.concs.forEach(function (z, i) {
      var att = z.signe > 0 ? 'v' : 'n', ch = self._conc[i]
      html += '<div class="ligne-pred"><span class="txt">Sur ' + tex(texIntervalle(texBorne(z.g), texBorne(z.d), true, true)) + ', f est</span>' +
        '<button class="btn" type="button" data-i="' + i + '" data-conc="v" aria-pressed="' + (ch === 'v') + '">convexe ' + tex('\\cup') + '</button>' +
        '<button class="btn" type="button" data-i="' + i + '" data-conc="n" aria-pressed="' + (ch === 'n') + '">concave ' + tex('\\cap') + '</button>' +
        verdict(ch, att) + '</div>'
    })
    sh.getElementById('pred').innerHTML = html
    sh.getElementById('afficher').disabled = this._revele

    var bilan = sh.getElementById('bilan')
    if (!this._revele) {
      bilan.innerHTML = '<p>Un <strong>zéro</strong> de ' + tex("f'") + ' où elle change de signe donne un extremum de ' + tex('f') +
        ' ; un <strong>extremum</strong> de ' + tex("f'") + ' (ici son sommet) donne un point d’inflexion de ' + tex('f') + '.</p>'
    } else {
      var phr = M.p < M.q
        ? 'f′ change de signe en ' + tex(texNombre(M.p, 2)) + ' et en ' + tex(texNombre(M.q, 2)) + ' : ' +
          (M.a > 0 ? 'maximum local en ' + tex(texNombre(M.p, 2)) + ', minimum local en ' + tex(texNombre(M.q, 2)) : 'minimum local en ' + tex(texNombre(M.p, 2)) + ', maximum local en ' + tex(texNombre(M.q, 2))) + '.'
        : 'Racine double : f′ s’annule en ' + tex(texNombre(M.p, 2)) + ' <strong>sans changer de signe</strong> — aucun extremum, seulement un palier.'
      bilan.innerHTML = '<p><strong>' + ok + ' / ' + total + '</strong> prédictions justes. ' + phr + ' Le sommet de la parabole de f′, en ' +
        tex('x=' + texNombre(M.m, 2)) + ', est le point d’inflexion de f (point orange).</p>'
    }
  }
}

if (!customElements.get('fprime-vers-f-widget')) customElements.define('fprime-vers-f-widget', FprimeVersFWidget)
