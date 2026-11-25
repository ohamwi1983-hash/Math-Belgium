/* ================================================================
 * <balance-esperance-widget> — atelier « Balance de l'espérance »
 * (6e, ch. 8, § 1, après la définition de E(X)). Les valeurs possibles
 * x = −6 … 6 sont posées sur une poutre ; la loi est faite de 20 blocs de
 * 0,05 (la somme des probabilités reste TOUJOURS égale à 1). On déplace
 * un bloc d'une valeur à l'autre (glisser, ou toucher une pile puis une
 * autre valeur) : le point d'appui se place en E(X), le centre de
 * gravité, et la bande [E(X) − σ ; E(X) + σ] montre la dispersion.
 * « Garder en mémoire » fige la loi dans une bande grise sous la poutre
 * (même échelle) : on compare deux jeux de même espérance. Calculs
 * exacts (probabilités en vingtièmes) : E et V exacts, σ arrondi.
 * Fenêtre FIXE (x de −6 à 6, hauteur d'une pile pleine = 1).
 * Couleurs : blocs et appui = accent ; bande ±σ = bleu (texte de même
 * couleur) ; mémoire = gris. Web Component (Shadow DOM).
 * ================================================================ */
import { styleKatex, tex, texEgalites, CSS_BASE, svgEl, defsFleche } from './katex-shadow.js'
import { texCourt, txtCourt, estExact } from './variables-aleatoires-commun.js'

var VMIN = -6, VMAX = 6, NB = 20
var W = 400, GX = 16, DX = 16, HB = 7.2 // hauteur d'un bloc (0,05)
var Y_POUTRE = 172, Y_AXE = 212, H_BASE = 236, H_MEM = 92
var PRESETS = [
  { nom: 'Exemple du cours', sous: 'valeurs 2 à 6', loi: { 2: 3, 3: 5, 4: 6, 5: 4, 6: 2 } },
  { nom: 'Jeu du cours', sous: '−2 €, 3 €, 5 €', loi: { '-2': 8, 3: 7, 5: 5 } },
  { nom: 'Jeu prudent', sous: '±1 €', loi: { '-1': 10, 1: 10 } },
  { nom: 'Jeu risqué', sous: '±5 €', loi: { '-5': 10, 5: 10 } },
]
function sx(v) { return GX + ((v - VMIN + 0.5) / (VMAX - VMIN + 1)) * (W - GX - DX) }
var LC = (W - GX - DX) / (VMAX - VMIN + 1)
function copie(loi) { var r = {}; for (var v = VMIN; v <= VMAX; v++) r[v] = loi[v] || 0; return r }
function stats(loi) {
  var s1 = 0, s2 = 0
  for (var v = VMIN; v <= VMAX; v++) { s1 += v * loi[v]; s2 += v * v * loi[v] }
  var E = s1 / NB, E2 = s2 / NB, V = (NB * s2 - s1 * s1) / (NB * NB)
  return { E: E, E2: E2, V: V, s: Math.sqrt(V), s1: s1, s2: s2 }
}
function pTex(m) { return texCourt(m / NB, 2) }
function xTex(v) { return v < 0 ? '(' + v + ')' : String(v) }
/** Somme découpée en morceaux KaTeX (la ligne peut se couper entre deux termes). */
function somme(termes) { return termes.map(function (t, i) { return tex((i ? '+' : '') + t) }).join(' ') }
function egal(x, d) { return (estExact(x, d) ? '=' : '\\approx ') + texCourt(x, d) }

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE +
  ':host{text-align:left;}' +
  '.figure svg{max-width:460px;touch-action:none;user-select:none;-webkit-user-select:none;}' +
  '.bloc{fill:var(--accent,#b65c1f);stroke:var(--surface-2,#f7f9fb);stroke-width:1;}' +
  '.bloc.pris{fill:var(--attn,#a3471b);stroke:var(--ink,#182430);stroke-width:1.5;}' +
  '.col{fill:transparent;cursor:pointer;}' +
  '.col.choisie{fill:var(--attn-soft,#f7ecd6);}' +
  '.poutre{fill:var(--ink-soft,#51626f);}' +
  '.appui{fill:var(--accent,#b65c1f);stroke:var(--accent-ink,#7a3c11);stroke-width:1.2;}' +
  '.bande{fill:var(--sky,#2f6fb0);opacity:0.18;}' +
  '.bord-bande{stroke:var(--sky,#2f6fb0);stroke-width:2;}' +
  '.mem-bloc{fill:var(--ink-faint,#8a97a1);opacity:0.55;}' +
  '.mem-appui{fill:var(--ink-faint,#8a97a1);}' +
  '.mem-bande{fill:var(--ink-faint,#8a97a1);opacity:0.2;}' +
  '.mem-poutre{fill:var(--ink-faint,#8a97a1);}' +
  '.pv{font-size:10px;font-family:var(--sans,sans-serif);font-variant-numeric:tabular-nums;text-anchor:middle;fill:var(--accent-ink,#7a3c11);font-weight:700;' +
  'paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3px;}' +
  '.et{font-size:11px;font-weight:700;font-family:var(--sans,sans-serif);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3px;}' +
  '.et-e{fill:var(--accent-ink,#7a3c11);}.et-s{fill:var(--sky-ink,#1f4e7d);}.et-m{fill:var(--ink-soft,#51626f);}' +
  '.t-e{color:var(--accent-ink,#7a3c11);font-weight:700;}.t-s{color:var(--sky-ink,#1f4e7d);font-weight:700;}.t-m{color:var(--ink-soft,#51626f);font-weight:700;}' +
  '.presets .btn{font-size:0.85rem;}' +
  '.presets .btn small{display:block;font-weight:400;font-size:0.72rem;color:var(--ink-soft,#51626f);}' +
  '.aide{font-size:0.86rem;color:var(--ink-soft,#51626f);text-align:center;margin:0 0 8px;}' +
  '.calc p{line-height:2;}.nw{white-space:nowrap;}' +
  '</style>' +
  '<p class="aide" id="aide">Glisse un bloc d’une valeur à une autre, ou touche une pile puis une autre valeur. Chaque bloc vaut 0,05.</p>' +
  '<div class="figure"><svg id="svg" viewBox="0 0 ' + W + ' ' + H_BASE + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Probabilités posées comme des poids sur une poutre, point d’appui en E(X)"></svg></div>' +
  '<div class="panneau calc" id="calc" aria-live="polite"></div>' +
  '<div class="rangee presets" role="group" aria-label="Lois prêtes">' +
  PRESETS.map(function (x, i) { return '<button class="btn" data-i="' + i + '">' + x.nom + '<small>' + x.sous + '</small></button>' }).join('') +
  '</div>' +
  '<div class="rangee"><button class="btn" id="memo">Garder en mémoire</button><button class="btn" id="deux">Deux jeux de même E(X)</button><button class="btn" id="oubli">Effacer la mémoire</button></div>'

class BalanceEsperanceWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._loi = copie(PRESETS[0].loi)
    this._mem = null
    this._choix = null
    this._pris = null
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh, svg = sh.getElementById('svg')
    sh.querySelectorAll('.presets .btn').forEach(function (b) {
      b.addEventListener('click', function () { self._loi = copie(PRESETS[+b.getAttribute('data-i')].loi); self._choix = null; self._rendre() })
    })
    sh.getElementById('memo').addEventListener('click', function () { self._mem = copie(self._loi); self._rendre() })
    sh.getElementById('oubli').addEventListener('click', function () { self._mem = null; self._rendre() })
    sh.getElementById('deux').addEventListener('click', function () {
      self._mem = copie(PRESETS[2].loi); self._loi = copie(PRESETS[3].loi); self._choix = null; self._rendre()
    })
    var colDe = function (ev) {
      var m = svg.getScreenCTM()
      if (!m) return null
      var x = (ev.clientX - m.e) / m.a, y = (ev.clientY - m.f) / m.d
      if (y > Y_AXE + 6) return null
      var v = Math.round(VMIN - 0.5 + (x - GX) / LC)
      return v >= VMIN && v <= VMAX ? v : null
    }
    var deplacer = function (de, vers) {
      if (de === null || vers === null || de === vers || !self._loi[de]) return false
      self._loi[de]--; self._loi[vers]++
      return true
    }
    svg.addEventListener('pointerdown', function (ev) {
      var v = colDe(ev)
      if (v === null) return
      if (self._choix !== null && v !== self._choix) {
        deplacer(self._choix, v)
        if (!self._loi[self._choix]) self._choix = null
        self._rendre()
        return
      }
      if (self._choix === v) { self._choix = null; self._rendre(); return }
      if (self._loi[v]) { self._pris = v; svg.setPointerCapture(ev.pointerId); self._rendre() }
    })
    svg.addEventListener('pointerup', function (ev) {
      if (self._pris === null) return
      var v = colDe(ev), de = self._pris
      self._pris = null
      if (v !== null && v !== de) { deplacer(de, v); self._choix = null } else if (v === de) self._choix = de
      self._rendre()
    })
    svg.addEventListener('pointercancel', function () { self._pris = null; self._rendre() })
    this._rendre()
  }

  _rendre() {
    var sh = this._sh, loi = this._loi, st = stats(loi), mem = this._mem, sm = mem ? stats(mem) : null
    var choix = this._choix !== null ? this._choix : this._pris
    sh.querySelectorAll('.presets .btn').forEach(function (b) {
      var L = copie(PRESETS[+b.getAttribute('data-i')].loi), egalL = true
      for (var v = VMIN; v <= VMAX; v++) if (L[v] !== loi[v]) egalL = false
      b.setAttribute('aria-pressed', String(egalL))
    })
    sh.getElementById('oubli').disabled = !mem
    var H = H_BASE + (mem ? H_MEM : 0)
    var svg = sh.getElementById('svg')
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H)
    svg.innerHTML = ''
    defsFleche(svg)
    var v, j, e
    // Colonnes cliquables
    for (v = VMIN; v <= VMAX; v++) {
      svg.appendChild(svgEl('rect', { x: sx(v) - LC / 2, y: 4, width: LC, height: Y_AXE - 4, class: 'col' + (choix === v ? ' choisie' : ''), 'data-v': v }))
    }
    // Bande ±σ (sous la poutre)
    var gB = Math.max(VMIN - 0.5, st.E - st.s), dB = Math.min(VMAX + 0.5, st.E + st.s)
    svg.appendChild(svgEl('rect', { x: sx(gB), y: Y_POUTRE + 4, width: Math.max(0, sx(dB) - sx(gB)), height: Y_AXE - Y_POUTRE - 4, class: 'bande' }))
    ;[st.E - st.s, st.E + st.s].forEach(function (b) {
      if (b >= VMIN - 0.5 && b <= VMAX + 0.5) svg.appendChild(svgEl('line', { x1: sx(b), x2: sx(b), y1: Y_POUTRE + 4, y2: Y_AXE, class: 'bord-bande' }))
    })
    // Piles de blocs
    for (v = VMIN; v <= VMAX; v++) {
      for (j = 0; j < loi[v]; j++) {
        svg.appendChild(svgEl('rect', { x: sx(v) - LC / 2 + 3, y: Y_POUTRE - (j + 1) * HB, width: LC - 6, height: HB, class: 'bloc' + (choix === v && j === loi[v] - 1 ? ' pris' : '') }))
      }
      if (loi[v]) {
        e = svgEl('text', { x: sx(v), y: Y_POUTRE - loi[v] * HB - 4, class: 'pv' })
        e.textContent = txtCourt(loi[v] / NB, 2)
        svg.appendChild(e)
      }
    }
    // Poutre et appui
    svg.appendChild(svgEl('rect', { x: sx(VMIN) - LC / 2, y: Y_POUTRE, width: (VMAX - VMIN + 1) * LC, height: 4, class: 'poutre', rx: 1 }))
    var xe = sx(st.E)
    svg.appendChild(svgEl('path', { d: 'M' + xe + ',' + (Y_POUTRE + 4) + ' L' + (xe - 9) + ',' + (Y_POUTRE + 20) + ' L' + (xe + 9) + ',' + (Y_POUTRE + 20) + ' Z', class: 'appui' }))
    // Axe gradué
    svg.appendChild(svgEl('line', { x1: GX, x2: W - DX + 2, y1: Y_AXE, y2: Y_AXE, class: 'axe', 'marker-end': 'url(#fleche)' }))
    for (v = VMIN; v <= VMAX; v++) {
      svg.appendChild(svgEl('line', { x1: sx(v), x2: sx(v), y1: Y_AXE, y2: Y_AXE + 4, class: 'tick' }))
      e = svgEl('text', { x: sx(v), y: Y_AXE + 15, 'text-anchor': 'middle', class: 'tick-label' })
      e.textContent = String(v).replace('-', '−')
      svg.appendChild(e)
    }
    // Étiquette E(X) dans la bande (à gauche ou à droite de l'appui selon la place)
    var ancE = xe > W - DX - 80 ? 'end' : 'start'
    e = svgEl('text', { x: xe + (ancE === 'start' ? 12 : -12), y: Y_POUTRE + 17, 'text-anchor': ancE, class: 'et et-e' })
    e.textContent = 'E(X) = ' + txtCourt(st.E, 2)
    svg.appendChild(e)
    // Mémoire
    if (mem) {
      var y0 = H_BASE + 50, hm = 2.2
      for (v = VMIN; v <= VMAX; v++) if (mem[v]) svg.appendChild(svgEl('rect', { x: sx(v) - LC / 2 + 3, y: y0 - mem[v] * hm, width: LC - 6, height: mem[v] * hm, class: 'mem-bloc' }))
      var gM = Math.max(VMIN - 0.5, sm.E - sm.s), dM = Math.min(VMAX + 0.5, sm.E + sm.s)
      svg.appendChild(svgEl('rect', { x: sx(gM), y: y0 + 3, width: Math.max(0, sx(dM) - sx(gM)), height: 18, class: 'mem-bande' }))
      svg.appendChild(svgEl('rect', { x: sx(VMIN) - LC / 2, y: y0, width: (VMAX - VMIN + 1) * LC, height: 3, class: 'mem-poutre' }))
      var xm = sx(sm.E)
      svg.appendChild(svgEl('path', { d: 'M' + xm + ',' + (y0 + 3) + ' L' + (xm - 7) + ',' + (y0 + 16) + ' L' + (xm + 7) + ',' + (y0 + 16) + ' Z', class: 'mem-appui' }))
      e = svgEl('text', { x: GX, y: H_BASE - 4 + 12, class: 'et et-m' })
      e.textContent = 'En mémoire : E(X) = ' + txtCourt(sm.E, 2) + ', σ ' + (estExact(sm.s, 2) ? '= ' : '≈ ') + txtCourt(sm.s, 2)
      svg.appendChild(e)
    }

    // ---------- Calculs ----------
    var termesE = [], termesE2 = [], valeurs = []
    for (v = VMIN; v <= VMAX; v++) if (loi[v]) {
      termesE.push(xTex(v) + '\\times ' + pTex(loi[v]))
      termesE2.push(xTex(v) + '^2\\times ' + pTex(loi[v]))
      valeurs.push(v)
    }
    var h = '<p><span class="t-e">Espérance</span> ' + tex('E(X)=') + ' ' + somme(termesE) + ' ' + tex('=' + texCourt(st.E, 2)) + '</p>' +
      '<p>' + tex('E(X^2)=') + ' ' + somme(termesE2) + ' ' + tex('=' + texCourt(st.E2, 2)) + '</p>' +
      '<p>' + texEgalites(['V(X)', 'E(X^2)-[E(X)]^2', texCourt(st.E2, 2) + '-' + (st.E < 0 ? '(' + texCourt(st.E, 2) + ')' : texCourt(st.E, 2)) + '^2', texCourt(st.V, 4)]) +
      ' et <span class="t-s">' + tex('\\sigma(X)=\\sqrt{V(X)}' + egal(st.s, 4)) + '</span></p>'
    var phrase
    if (valeurs.length === 1) phrase = 'Une seule valeur possible : aucune surprise, σ = 0 et l’appui est sous la pile.'
    else phrase = 'Le point d’appui est le <strong>centre de gravité</strong> des blocs : la poutre est en équilibre en E(X). La <span class="t-s">bande bleue</span> va de E(X) − σ à E(X) + σ.'
    h += '<p>' + phrase + '</p>'
    if (mem) {
      var memeE = Math.abs(sm.E - st.E) < 1e-9
      h += '<p><span class="t-m">Comparaison</span> : ' + (memeE
        ? 'même espérance <span class="nw">(' + tex('E(X)=' + texCourt(st.E, 2)) + ')</span>, mais ' + (Math.abs(sm.s - st.s) < 1e-9 ? 'même écart-type : même risque.' : 'pas le même écart-type : le jeu ' + (st.s > sm.s ? 'actuel' : 'en mémoire') + ' est le plus risqué (' + tex('\\sigma') + ' plus grand).')
        : 'espérances différentes : ' + tex(texCourt(st.E, 2)) + ' contre ' + tex(texCourt(sm.E, 2)) + '.') + '</p>'
    }
    sh.getElementById('calc').innerHTML = h
  }
}

if (!customElements.get('balance-esperance-widget')) customElements.define('balance-esperance-widget', BalanceEsperanceWidget)
