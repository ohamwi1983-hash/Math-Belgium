/* ================================================================
 * <densite-repartition-widget> — atelier « Densité et fonction de
 * répartition » (6e, ch. 8, § 3). Trois densités sur [0 ; 6] : uniforme
 * (f = 1/6), triangulaire (sommet en 3) et la parabole de la figure du
 * cours f(t) = (t − 3)²/36 + 1/12. On déplace a et b (au dixième) :
 * en haut, l'aire sous f entre a et b ; en bas, la courbe de
 * F(x) = P(X ≤ x), avec le segment vertical F(b) − F(a) de même couleur
 * que l'aire : P(a ≤ X ≤ b) = F(b) − F(a). Tangente à F en b, de pente
 * f(b) (F′ = f). Quand a = b, l'aire est nulle : P(X = a) = 0.
 * F est définie sur ℝ (0 avant u, 1 après v) : fenêtre FIXE x de −1 à 7,
 * f de 0 à 0,4, F de 0 à 1,1, quelles que soient la densité et les bornes.
 * Couleurs : aire et F(b) − F(a) = accent ; tangente = violet ;
 * courbes = encre. Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, texEgalites, CSS_BASE, svgEl, defsFleche } from './katex-shadow.js'
import { arrondi, texFixe, texCourt, txtCourt, estExact, curseurHTML, lierCurseur, majCurseur, borner } from './variables-aleatoires-commun.js'

var W = 380, GX = 34, DX = 14
var HF = 170, HG = 200 // hauteurs des deux panneaux
var XMIN = -1, XMAX = 7, YF = 0.4, YG = 1.1
var DENSITES = {
  para: {
    nom: 'Parabole du cours',
    fTex: 'f(t)=\\dfrac{(t-3)^2}{36}+\\dfrac{1}{12}',
    f: function (t) { return (t - 3) * (t - 3) / 36 + 1 / 12 },
    F: function (x) { return ((x - 3) * (x - 3) * (x - 3) + 27) / 108 + x / 12 },
  },
  tri: {
    nom: 'Triangulaire',
    fTex: 'f(t)=\\dfrac{t}{9}\\ \\text{sur}\\ [0\\,;3],\\ \\dfrac{6-t}{9}\\ \\text{sur}\\ [3\\,;6]',
    f: function (t) { return t <= 3 ? t / 9 : (6 - t) / 9 },
    F: function (x) { return x <= 3 ? x * x / 18 : 1 - (6 - x) * (6 - x) / 18 },
  },
  uni: {
    nom: 'Uniforme',
    fTex: 'f(t)=\\dfrac{1}{6}',
    f: function () { return 1 / 6 },
    F: function (x) { return x / 6 },
  },
}
function fDe(d, t) { return t < 0 || t > 6 ? 0 : d.f(t) }
function FDe(d, x) { return x <= 0 ? 0 : x >= 6 ? 1 : d.F(x) }
function sx(x) { return GX + ((x - XMIN) / (XMAX - XMIN)) * (W - GX - DX) }
function syF(y) { return 10 + (1 - y / YF) * (HF - 10 - 26) }
function syG(y) { return HF + 12 + (1 - y / YG) * (HG - 12 - 28) }
function nb(x) { return (estExact(x) ? '=' : '\\approx ') + texFixe(x, 4).replace(/0+$/, '').replace(/\{,\}$/, '') }

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE +
  ':host{text-align:left;}' +
  '.figure svg{max-width:440px;}' +
  '.courbe{fill:none;stroke:var(--ink,#182430);stroke-width:2;}' +
  '.aire{fill:var(--accent,#b65c1f);opacity:0.35;}' +
  '.seg{stroke:var(--accent,#b65c1f);stroke-width:5;stroke-linecap:round;opacity:0.85;}' +
  '.guide{stroke:var(--ink-soft,#51626f);stroke-width:1;stroke-dasharray:3 3;}' +
  '.tan{stroke:var(--plan,#6a4fa3);stroke-width:2;}' +
  '.pt{fill:var(--ink,#182430);}.pt-t{fill:var(--plan,#6a4fa3);}' +
  '.et{font-size:11px;font-weight:700;font-family:var(--sans,sans-serif);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3px;}' +
  '.et-a{fill:var(--accent-ink,#7a3c11);}.et-t{fill:var(--plan-ink,#4b347f);}.et-i{fill:var(--ink-soft,#51626f);font-weight:600;}' +
  '.t-a{color:var(--accent-ink,#7a3c11);font-weight:700;}.t-t{color:var(--plan-ink,#4b347f);font-weight:700;}' +
  '.reglages{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:0 18px;}' +
  '.curseur .nom{min-width:70px;}' +
  '.densites .btn{font-size:0.86rem;}' +
  '.formule-f{text-align:center;margin:0 0 8px;min-height:2.6em;}' +
  '.calc p{line-height:2;}' +
  '.nul{color:var(--attn,#a3471b);font-weight:700;}' +
  '</style>' +
  '<div class="rangee densites" role="group" aria-label="Densité">' +
  Object.keys(DENSITES).map(function (c) { return '<button class="btn" data-d="' + c + '">' + DENSITES[c].nom + '</button>' }).join('') + '</div>' +
  '<div class="formule-f" id="formule"></div>' +
  '<div class="figure"><svg id="svg" viewBox="0 0 ' + W + ' ' + (HF + HG) + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="En haut la densité et l’aire entre a et b ; en bas la fonction de répartition"></svg></div>' +
  '<div class="reglages">' +
  curseurHTML('a', 'Borne a', 0, 6, 0.1) +
  curseurHTML('b', 'Borne b', 0, 6, 0.1) +
  '</div>' +
  '<div class="rangee"><button class="btn" id="egaux">Faire a = b</button><button class="btn" id="tout">Tout l’intervalle [0 ; 6]</button></div>' +
  '<div class="panneau calc" id="calc" aria-live="polite"></div>'

class DensiteRepartitionWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._d = 'para'; this._a = 2; this._b = 4
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    sh.querySelectorAll('[data-d]').forEach(function (btn) {
      btn.addEventListener('click', function () { self._d = btn.getAttribute('data-d'); self._rendre() })
    })
    lierCurseur(sh, 'a', function () { return self._a }, function (v) {
      self._a = arrondi(borner(v, 0, 6), 1)
      if (self._b < self._a) self._b = self._a
      self._rendre()
    }, 0.1)
    lierCurseur(sh, 'b', function () { return self._b }, function (v) {
      self._b = arrondi(borner(v, 0, 6), 1)
      if (self._a > self._b) self._a = self._b
      self._rendre()
    }, 0.1)
    sh.getElementById('egaux').addEventListener('click', function () { self._b = self._a; self._rendre() })
    sh.getElementById('tout').addEventListener('click', function () { self._a = 0; self._b = 6; self._rendre() })
    this._rendre()
  }

  _rendre() {
    var sh = this._sh, d = DENSITES[this._d], a = this._a, b = this._b, dc = this._d
    sh.querySelectorAll('[data-d]').forEach(function (btn) { btn.setAttribute('aria-pressed', String(btn.getAttribute('data-d') === dc)) })
    majCurseur(sh, 'a', a, 'a=' + texCourt(a, 1))
    majCurseur(sh, 'b', b, 'b=' + texCourt(b, 1))
    sh.getElementById('formule').innerHTML = tex(d.fTex) + ' ' + tex('\\text{ sur }[0\\,;6]')
    var Fa = FDe(d, a), Fb = FDe(d, b), P = Fb - Fa, fb = fDe(d, b)

    // ---------- Calcul ----------
    var h = ''
    var aT = texCourt(a, 1), bT = texCourt(b, 1)
    if (Math.abs(b - a) < 1e-9) {
      h += '<p><span class="nul">a = b :</span> la bande est réduite à un trait, son aire est nulle. ' +
        texEgalites(['P(X=' + aT + ')', 'F(' + aT + ')-F(' + aT + ')', '0']) + '.</p>' +
        '<p>Pour une variable continue, la probabilité de prendre exactement une valeur donnée est nulle : seule la probabilité d’un intervalle a un sens.</p>'
    } else {
      h += '<p><span class="t-a">Aire teintée</span> ' + texEgalites(['P(' + aT + '\\leq X\\leq ' + bT + ')', '\\int_{' + aT + '}^{' + bT + '}f(t)\\,dt', 'F(' + bT + ')-F(' + aT + ')']) + '</p>' +
        '<p>' + tex('F(' + bT + ')' + nb(Fb)) + ' et ' + tex('F(' + aT + ')' + nb(Fa)) + ', donc ' + tex('P(' + aT + '\\leq X\\leq ' + bT + ')' + nb(P)) + ' : <span class="t-a">la longueur du segment</span> sur le graphique de F.</p>' +
        '<p>Bornes strictes ou larges : même valeur, ' + tex('P(' + aT + '<X<' + bT + ')=P(' + aT + '\\leq X\\leq ' + bT + ')') + '.</p>'
    }
    h += '<p><span class="t-t">Tangente à F en b</span> : sa pente vaut ' + texEgalites(['F\'(' + bT + ')', 'f(' + bT + ')']) + ' ' + tex(nb(fb)) + ' (la densité est la dérivée de F).</p>'
    if (a === 0 && b === 6) h += '<p>Sur tout l’intervalle, l’aire vaut 1 : ' + tex('F(6)-F(0)=1-0=1') + '.</p>'
    sh.getElementById('calc').innerHTML = h

    // ---------- Figure ----------
    var svg = sh.getElementById('svg')
    svg.innerHTML = ''
    defsFleche(svg)
    var clip = svgEl('clipPath', { id: 'cadreG' })
    clip.appendChild(svgEl('rect', { x: GX, y: HF + 4, width: W - GX - DX, height: HG - 28 }))
    svg.querySelector('defs').appendChild(clip)
    var t, i, x
    // Panneau du haut : densité
    for (x = 0; x <= 6; x += 1) svg.appendChild(svgEl('line', { x1: sx(x), x2: sx(x), y1: syF(0), y2: syF(YF), class: 'grille' }))
    ;[0.1, 0.2, 0.3].forEach(function (y) {
      svg.appendChild(svgEl('line', { x1: GX, x2: W - DX, y1: syF(y), y2: syF(y), class: 'grille' }))
      var ty = svgEl('text', { x: GX - 5, y: syF(y) + 3.5, 'text-anchor': 'end', class: 'tick-label' })
      ty.textContent = txtCourt(y, 1)
      svg.appendChild(ty)
    })
    if (b > a) {
      var dA = 'M' + sx(a).toFixed(1) + ',' + syF(0).toFixed(1)
      for (i = 0; i <= 80; i++) { t = a + (b - a) * i / 80; dA += ' L' + sx(t).toFixed(1) + ',' + syF(fDe(d, t)).toFixed(1) }
      dA += ' L' + sx(b).toFixed(1) + ',' + syF(0).toFixed(1) + ' Z'
      svg.appendChild(svgEl('path', { d: dA, class: 'aire' }))
    }
    // f : 0 avant 0 et après 6 (sauts dessinés en pointillé)
    var dF = 'M' + sx(XMIN) + ',' + syF(0) + ' L' + sx(0) + ',' + syF(0)
    svg.appendChild(svgEl('path', { d: dF, class: 'courbe' }))
    var dF2 = ''
    for (i = 0; i <= 120; i++) { t = 6 * i / 120; dF2 += (i ? ' L' : 'M') + sx(t).toFixed(1) + ',' + syF(d.f(t)).toFixed(1) }
    svg.appendChild(svgEl('path', { d: dF2, class: 'courbe' }))
    svg.appendChild(svgEl('path', { d: 'M' + sx(6) + ',' + syF(0) + ' L' + sx(XMAX - 0.15) + ',' + syF(0), class: 'courbe' }))
    ;[0, 6].forEach(function (u) { if (d.f(u) > 0.001) svg.appendChild(svgEl('line', { x1: sx(u), x2: sx(u), y1: syF(0), y2: syF(d.f(u)), class: 'guide' })) })
    svg.appendChild(svgEl('line', { x1: GX, x2: W - DX + 2, y1: syF(0), y2: syF(0), class: 'axe', 'marker-end': 'url(#fleche)' }))
    svg.appendChild(svgEl('line', { x1: sx(0), x2: sx(0), y1: syF(0), y2: 4, class: 'axe', 'marker-end': 'url(#fleche)' }))
    var nf = svgEl('text', { x: sx(0) + 6, y: 14, class: 'nom-axe' }); nf.textContent = 'f(t)'; svg.appendChild(nf)
    var nt = svgEl('text', { x: W - DX - 2, y: syF(0) - 6, 'text-anchor': 'end', class: 'nom-axe' }); nt.textContent = 't'; svg.appendChild(nt)
    // Repères a et b sous l'axe du haut
    var etiq = function (xx, yy, txt, cls, anc) { var e = svgEl('text', { x: xx, y: yy, 'text-anchor': anc || 'middle', class: 'et ' + cls }); e.textContent = txt; svg.appendChild(e) }
    if (Math.abs(sx(b) - sx(a)) < 26) {
      etiq(sx(a), syF(0) + 15, a === b ? 'a = b' : 'a', 'et-a', a === b ? 'middle' : 'end')
      if (a !== b) etiq(sx(b) + 2, syF(0) + 15, 'b', 'et-a', 'start')
    } else { etiq(sx(a), syF(0) + 15, 'a', 'et-a'); etiq(sx(b), syF(0) + 15, 'b', 'et-a') }
    // Panneau du bas : F
    for (x = -1; x <= 7; x += 1) {
      svg.appendChild(svgEl('line', { x1: sx(x), x2: sx(x), y1: syG(0), y2: syG(YG), class: 'grille' }))
      if (x !== 0 && x < 7) { var tx = svgEl('text', { x: sx(x), y: syG(0) + 14, 'text-anchor': 'middle', class: 'tick-label' }); tx.textContent = String(x).replace('-', '−'); svg.appendChild(tx) }
    }
    ;[0.5, 1].forEach(function (y) {
      svg.appendChild(svgEl('line', { x1: GX, x2: W - DX, y1: syG(y), y2: syG(y), class: 'grille' }))
      var ty = svgEl('text', { x: GX - 5, y: syG(y) + 3.5, 'text-anchor': 'end', class: 'tick-label' })
      ty.textContent = txtCourt(y, 1)
      svg.appendChild(ty)
    })
    var t0 = svgEl('text', { x: sx(0) - 5, y: syG(0) + 14, 'text-anchor': 'end', class: 'tick-label' }); t0.textContent = '0'; svg.appendChild(t0)
    var dG = ''
    for (i = 0; i <= 160; i++) { x = XMIN + (XMAX - 0.15 - XMIN) * i / 160; dG += (i ? ' L' : 'M') + sx(x).toFixed(1) + ',' + syG(FDe(d, x)).toFixed(1) }
    svg.appendChild(svgEl('path', { d: dG, class: 'courbe' }))
    svg.appendChild(svgEl('line', { x1: GX, x2: W - DX + 2, y1: syG(0), y2: syG(0), class: 'axe', 'marker-end': 'url(#fleche)' }))
    svg.appendChild(svgEl('line', { x1: sx(0), x2: sx(0), y1: syG(0), y2: HF + 4, class: 'axe', 'marker-end': 'url(#fleche)' }))
    var nF = svgEl('text', { x: sx(0) + 6, y: HF + 16, class: 'nom-axe' }); nF.textContent = 'F(x)'; svg.appendChild(nF)
    var nx = svgEl('text', { x: W - DX - 2, y: syG(0) - 6, 'text-anchor': 'end', class: 'nom-axe' }); nx.textContent = 'x'; svg.appendChild(nx)
    // Guides F(a), F(b) et segment F(b) − F(a)
    ;[[a, Fa], [b, Fb]].forEach(function (q) {
      svg.appendChild(svgEl('line', { x1: sx(q[0]), x2: sx(q[0]), y1: syG(0), y2: syG(q[1]), class: 'guide' }))
      svg.appendChild(svgEl('line', { x1: sx(0), x2: sx(q[0]), y1: syG(q[1]), y2: syG(q[1]), class: 'guide' }))
    })
    var xs = Math.min(W - DX - 8, sx(b) + 12)
    if (b > a) svg.appendChild(svgEl('line', { x1: xs, x2: xs, y1: syG(Fa), y2: syG(Fb), class: 'seg' }))
    // Tangente en b, pente f(b)
    var x1 = b - 1.6, x2 = b + 1.6
    svg.appendChild(svgEl('line', { x1: sx(x1), y1: syG(Fb + fb * (x1 - b)), x2: sx(x2), y2: syG(Fb + fb * (x2 - b)), class: 'tan', 'clip-path': 'url(#cadreG)' }))
    svg.appendChild(svgEl('circle', { cx: sx(a), cy: syG(Fa), r: 3.5, class: 'pt' }))
    svg.appendChild(svgEl('circle', { cx: sx(b), cy: syG(Fb), r: 4, class: 'pt-t' }))
    // Légende du segment (à droite si la place le permet)
    if (b > a && syG(Fa) - syG(Fb) > 16) {
      var droite = xs + 6 < W - DX - 70
      etiq(droite ? xs + 6 : xs - 8, (syG(Fa) + syG(Fb)) / 2 + 4, 'F(b) − F(a)', 'et-a', droite ? 'start' : 'end')
    }
  }
}

if (!customElements.get('densite-repartition-widget')) customElements.define('densite-repartition-widget', DensiteRepartitionWidget)
