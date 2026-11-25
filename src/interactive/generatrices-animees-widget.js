/* ================================================================
 * <generatrices-animees-widget> — atelier « Génératrices animées »
 * (6e, ch. 9, § 5). Curseur α (et lecture automatique « Lancer ») : les
 * deux génératrices bougent, leur point d'intersection P laisse une
 * trace. Quatre configurations :
 *  - rectangle du cours A(0;0), B(4;0), C(4;6), D(0;6), Z(0;α) ∈ ]AD[,
 *    Y(4;α) ∈ ]BC[ : (AY) ∩ (BZ) = (2;α/2), segment ouvert ;
 *    α = 0 : génératrices confondues (morceau singulier y = 0) ;
 *  - céviennes A(0;4), B(0;0), C(6;0), parallèle à (BC) à hauteur α :
 *    (BE) ∩ (CD) sur la médiane 4x + 3y − 12 = 0, ]M ; A[ ;
 *  - perpendiculaires A(3;0), B(−2;0), C(0;α) : x = 1, y = −6/α, le
 *    point (1;0) n'est jamais atteint (il faudrait α infini) ; α = 0 :
 *    deux perpendiculaires parallèles ;
 *  - angles α et 2α : droite par O d'angle α, droite par A(2;0)
 *    d'angle 2α ; P = (2 + 2cos 2α ; 2 sin 2α), cercle de centre A et
 *    de rayon 2 privé de (4;0) ; O est atteint pour α = 90°.
 * « Montrer le lieu » : équation brute factorisée, statut de chaque
 * morceau (singulier, propre), restriction et points exclus (ronds
 * vides). Fenêtre FIXE par configuration, repère orthonormé.
 * Web Component (Shadow DOM).
 * ================================================================ */
import './geo-analytique-commun.js'
import { styleKatex, tex, CSS_BASE } from './katex-shadow.js'
import { curseurHTML, majCurseur, arrondi, borner } from './variables-aleatoires-commun.js'
import { texN, texDroite, lecteur, CSS_LIEUX } from './lieux-geometriques-commun.js'

var G = window.GeoAnaCommun
var LOIN = 60
var D2R = Math.PI / 180

function ptTex(nom, x, y) { return tex(nom + '\\left(' + texN(x, 2) + '\\,;' + texN(y, 2) + '\\right)') }
function estEntier2(v) { return Math.abs(v * 100 - Math.round(v * 100)) < 1e-6 }
function coordTex(nom, x, y) {
  var ex = estEntier2(x) && estEntier2(y)
  return tex(nom + (ex ? '' : '\\approx') + '\\left(' + texN(x, 2) + '\\,;' + texN(y, 2) + '\\right)')
}

/* Chaque configuration : fenêtre, α, points fixes, points mobiles, génératrices (a, b, c),
 * intersection ou message, lieu (dessin + explication). */
var CONFIGS = {
  rectangle: {
    nom: 'Rectangle',
    fen: { xMin: -1.5, xMax: 5.5, yMin: -1.5, yMax: 7.5 }, unite: 38,
    alpha: { min: 0, max: 6, pas: 0.05, def: 2, dec: 2, vitesse: 1 },
    enonce: 'A(0 ; 0), B(4 ; 0), C(4 ; 6), D(0 ; 6) ; Z(0 ; α) sur ]AD[ et Y(4 ; α) sur ]BC[. Lieu de P, intersection de (AY) et (BZ).',
    fixes: [['A', 0, 0, 'haut-g'], ['B', 4, 0, 'haut-d'], ['C', 4, 6, 'haut-d'], ['D', 0, 6, 'haut-g']],
    contour: [[0, 0], [4, 0], [4, 6], [0, 6]],
    mobiles: function (a) { return [['Z', 0, a, 'g'], ['Y', 4, a, 'd']] },
    gens: function (a) { return [{ nom: '(AY)', l: [a, -4, 0], par: [0, 0], vers: [4, a] }, { nom: '(BZ)', l: [a, 4, -4 * a], par: [4, 0], vers: [0, a] }] },
    inter: function (a) {
      if (Math.abs(a) < 1e-9) return { etat: 'singulier', msg: 'α = 0 : Z = A et Y = B. Les deux génératrices sont confondues (la droite y = 0) : il n’y a pas <strong>un</strong> point d’intersection. C’est le morceau singulier y = 0.' }
      if (Math.abs(a - 6) < 1e-9) return { etat: 'exclu', x: 2, y: 3, msg: 'α = 6 : Z = D et Y = C, exclus par l’énoncé (Z ∈ ]AD[). Le point (2 ; 3), centre du rectangle, est l’extrémité ouverte du lieu.' }
      return { etat: 'ok', x: 2, y: a / 2 }
    },
    lieu: {
      brute: 'y(2x-4)=0',
      morceaux: [['y=0', 'singulier', 'les deux génératrices coïncident pour α = 0'], ['x=2', 'propre', 'P = (2 ; α/2) est bien atteint']],
      restriction: 'Pour α ∈ ]0 ; 6[, P = (2 ; α/2) : le segment <strong>ouvert</strong> d’extrémités (2 ; 0) et (2 ; 3). x = 2 ne dépend pas de la hauteur 6 ; seule la restriction en dépend.',
      dessin: function (g, ctx) { ctx.ligne(g, 2, 0, 2, 3, 'lieu'); ctx.ligne(g, -1.5, 0, 5.5, 0, 'trait-soft pointille'); ctx.ouvert(g, 2, 0); ctx.ouvert(g, 2, 3) },
      exclus: [[2, 0], [2, 3]],
    },
  },
  ceviennes: {
    nom: 'Céviennes',
    fen: { xMin: -1.5, xMax: 7.5, yMin: -1.5, yMax: 5.5 }, unite: 38,
    alpha: { min: 0, max: 4, pas: 0.05, def: 2, dec: 2, vitesse: 0.7 },
    enonce: 'A(0 ; 4), B(0 ; 0), C(6 ; 0) ; la parallèle à (BC) à la hauteur α coupe [AB] en D et [AC] en E. Lieu de P, intersection de (BE) et (CD).',
    fixes: [['A', 0, 4, 'haut-g'], ['B', 0, 0, 'haut-g'], ['C', 6, 0, 'haut-d']],
    contour: [[0, 4], [0, 0], [6, 0]],
    mobiles: function (a) { return [['D', 0, a, 'g'], ['E', 6 - 1.5 * a, a, 'd']] },
    gens: function (a) { return [{ nom: '(BE)', l: [a, -(6 - 1.5 * a), 0], par: [0, 0], vers: [6 - 1.5 * a, a] }, { nom: '(CD)', l: [a, 6, -6 * a], par: [6, 0], vers: [0, a] }] },
    parallele: true,
    inter: function (a) {
      if (Math.abs(a) < 1e-9) return { etat: 'singulier', msg: 'α = 0 : D = B et E = C. Les deux génératrices sont toutes deux la droite (BC) : morceau singulier y = 0.' }
      if (Math.abs(a - 4) < 1e-9) return { etat: 'exclu', x: 0, y: 4, msg: 'α = 4 : D = E = A, la parallèle ne coupe plus le triangle qu’en A. Les céviennes deviennent (BA) et (CA), qui se coupent en A. Avec D et E strictement entre les sommets (α ∈ ]0 ; 4[), A n’est pas atteint.' }
      return { etat: 'ok', x: (24 - 6 * a) / (8 - a), y: 4 * a / (8 - a) }
    },
    lieu: {
      brute: 'y(4x+3y-12)=0',
      morceaux: [['y=0', 'singulier', 'les deux génératrices coïncident pour α = 0'], ['4x+3y-12=0', 'propre', 'la médiane issue de A : elle passe par A(0 ; 4) et par M(3 ; 0), milieu de [BC]']],
      restriction: 'Pour α ∈ ]0 ; 4[, P décrit le segment <strong>ouvert</strong> ]M ; A[ de la médiane : la médiane apparaît comme un lieu, sans avoir été supposée.',
      dessin: function (g, ctx) { ctx.ligne(g, 3, 0, 0, 4, 'lieu'); ctx.ligne(g, -1.5, 0, 7.5, 0, 'trait-soft pointille'); ctx.ouvert(g, 3, 0); ctx.ouvert(g, 0, 4); ctx.nom(g, 'M', 3, 0, 11, -8, 'et-good') },
      exclus: [[3, 0], [0, 4]],
    },
  },
  perpendiculaires: {
    nom: 'Perpendiculaires',
    fen: { xMin: -3.5, xMax: 4.5, yMin: -5.5, yMax: 5.5 }, unite: 32,
    alpha: { min: -20, max: 20, pas: 0.1, def: 2, dec: 1, vitesse: 5 },
    enonce: 'A(3 ; 0), B(−2 ; 0), C(0 ; α) sur l’axe des ordonnées. Lieu de P, intersection de la perpendiculaire à (AC) en A et de la perpendiculaire à (BC) en B.',
    fixes: [['A', 3, 0, 'haut-d'], ['B', -2, 0, 'haut-g']],
    contour: null,
    mobiles: function (a) { return [['C', 0, a, 'g']] },
    gens: function (a) { return [{ nom: 'perpendiculaire à (AC) en A', court: 'p_A', l: [3, -a, -9], par: [3, 0] }, { nom: 'perpendiculaire à (BC) en B', court: 'p_B', l: [2, a, 4], par: [-2, 0] }] },
    segmentsC: true,
    inter: function (a) {
      if (Math.abs(a) < 1e-9) return { etat: 'paralleles', msg: 'α = 0 : C = O. Les deux perpendiculaires sont x = 3 et x = −2 : parallèles, aucun point d’intersection.' }
      var y = -6 / a
      return { etat: 'ok', x: 1, y: y, hors: Math.abs(y) > 5.5 }
    },
    lieu: {
      brute: 'x=1',
      morceaux: [['x=1', 'propre', 'en additionnant les deux équations, α disparaît : 5x − 5 = 0']],
      restriction: 'P = (1 ; −6/α) : y ne vaut jamais 0. Le lieu est la droite x = 1 <strong>privée</strong> du point (1 ; 0), qu’il faudrait un α infini pour atteindre — un point jamais atteint, même quand l’équation n’a qu’un seul morceau.',
      dessin: function (g, ctx) { ctx.ligne(g, 1, -5.5, 1, 5.5, 'lieu'); ctx.ouvert(g, 1, 0) },
      exclus: [[1, 0]],
    },
  },
  double: {
    nom: 'Angles α et 2α',
    fen: { xMin: -1.5, xMax: 5.5, yMin: -3.5, yMax: 3.5 }, unite: 46,
    alpha: { min: 0, max: 180, pas: 1, def: 30, dec: 0, vitesse: 30, degres: true },
    enonce: 'O(0 ; 0) et A(2 ; 0). La droite d₁ passe par O et fait l’angle α avec l’axe des x ; la droite d₂ passe par A et fait l’angle 2α. Lieu de P, intersection de d₁ et d₂.',
    fixes: [['O', 0, 0, 'haut-g'], ['A', 2, 0, 'haut-d']],
    contour: null,
    mobiles: function () { return [] },
    gens: function (a) {
      var t = a * D2R
      return [{ nom: 'd₁', l: [Math.sin(t), -Math.cos(t), 0], par: [0, 0] }, { nom: 'd₂', l: [Math.sin(2 * t), -Math.cos(2 * t), -2 * Math.sin(2 * t)], par: [2, 0] }]
    },
    inter: function (a) {
      if (a < 1e-9 || Math.abs(a - 180) < 1e-9) return { etat: 'singulier', msg: 'α = ' + (a < 1 ? '0°' : '180°') + ' : d₁ et d₂ sont toutes deux l’axe des x. Génératrices confondues : morceau singulier y = 0.' }
      var t = 2 * a * D2R
      var r = { etat: 'ok', x: 2 + 2 * Math.cos(t), y: 2 * Math.sin(t) }
      if (Math.abs(a - 90) < 1e-9) r.msg = 'α = 90° : d₁ est l’axe des y et d₂ (angle 180°) l’axe des x : P = O. Le point O est bien atteint.'
      else if (Math.abs(a - 45) < 1e-9) r.msg = 'α = 45° : d₂ fait un angle de 90°, elle est verticale (x = 2) ; tan 2α n’existe pas, mais P existe.'
      return r
    },
    lieu: {
      brute: 'y\\,(x^2+y^2-4x)=0',
      morceaux: [['y=0', 'singulier', 'd₁ et d₂ coïncident pour α = 0'], ['(x-2)^2+y^2=4', 'propre', 'le triangle OAP est isocèle en A (angle α en O, angle extérieur 2α en A, donc angle α en P) : AP = AO = 2']],
      restriction: 'Quand α parcourt ]0° ; 180°[, 2α parcourt ]0° ; 360°[ : P = (2 + 2cos 2α ; 2sin 2α) fait tout le tour du cercle de centre A et de rayon 2, <strong>sauf</strong> le point (4 ; 0), jamais atteint. Élimination : tan α = y/x et tan 2α = y/(x − 2), reliés par la formule de tan 2α.',
      dessin: function (g, ctx) { ctx.cercle(g, 2, 0, 2, 'lieu'); ctx.ligne(g, -1.5, 0, 5.5, 0, 'trait-soft pointille'); ctx.ouvert(g, 4, 0) },
      exclus: [[4, 0]],
    },
  },
}

function repereDe(c) { if (!c._R) c._R = G.repere(c.fen, c.unite, 14); return c._R }

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE + CSS_LIEUX +
  '.lieu{fill:none;stroke:var(--good,#2f7a4f);stroke-width:2.2;}' +
  '.trace{fill:var(--rose,#b23a7a);opacity:0.5;}' +
  '.gen1{stroke:var(--accent,#b65c1f);stroke-width:2;}' +
  '.gen2{stroke:var(--sky,#2f6fb0);stroke-width:2;}' +
  '.fig-cont{fill:var(--ink,#182430);fill-opacity:0.04;stroke:var(--ink,#182430);stroke-width:1.6;}' +
  '.p-ok{fill:var(--rose,#b23a7a);stroke:var(--surface,#fff);stroke-width:2;}' +
  '.ouvert{fill:var(--surface-2,#f7f9fb);stroke:var(--good,#2f7a4f);stroke-width:2.2;}' +
  '.c1{color:var(--accent-ink,#7a3c11);font-weight:700;}.c2{color:var(--sky-ink,#1f4e7d);font-weight:700;}' +
  '.enonce{font-size:0.9rem;line-height:1.5;margin:0 0 8px;}' +
  '.statut{font-weight:700;}' +
  '#lancer{min-width:112px;}' +
  '</style>' +
  '<div class="rangee" role="group" aria-label="Configuration">' +
  Object.keys(CONFIGS).map(function (k) { return '<button class="btn" data-c="' + k + '">' + CONFIGS[k].nom + '</button>' }).join('') + '</div>' +
  '<p class="enonce" id="enonce"></p>' +
  '<div class="figure"><svg id="svg" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Les deux génératrices et leur point d’intersection"></svg></div>' +
  '<div class="panneau" id="etat" aria-live="polite"></div>' +
  '<div class="reglages">' + curseurHTML('a', 'Paramètre alpha', 0, 1, 1) + '</div>' +
  '<div class="rangee"><button class="btn" id="lancer" aria-pressed="false">▶ Lancer</button><button class="btn" id="montrer" aria-pressed="false">Montrer le lieu</button><button class="btn" id="effacer">Effacer la trace</button></div>' +
  '<div class="panneau" id="lieu" aria-live="polite"></div>'

class GeneratricesAnimeesWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._c = 'rectangle'
    this._a = CONFIGS.rectangle.alpha.def
    this._trace = []
    this._montrer = false
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh
    sh.querySelectorAll('[data-c]').forEach(function (b) {
      b.addEventListener('click', function () {
        self._lect.arreter()
        self._c = b.getAttribute('data-c')
        self._a = CONFIGS[self._c].alpha.def
        self._trace = []
        self._bornes()
        self._rendre()
      })
    })
    function regler(v) {
      var al = CONFIGS[self._c].alpha
      self._a = arrondi(borner(Math.round((v - al.min) / al.pas) * al.pas + al.min, al.min, al.max), 4)
      self._noter(); self._rendre()
    }
    sh.getElementById('a').addEventListener('input', function (e) { regler(parseFloat(e.target.value)) })
    sh.getElementById('a-moins').addEventListener('click', function () { regler(self._a - CONFIGS[self._c].alpha.pas) })
    sh.getElementById('a-plus').addEventListener('click', function () { regler(self._a + CONFIGS[self._c].alpha.pas) })
    sh.getElementById('montrer').addEventListener('click', function () { self._montrer = !self._montrer; self._rendre() })
    sh.getElementById('effacer').addEventListener('click', function () { self._trace = []; self._rendre() })
    var btn = sh.getElementById('lancer')
    this._lect = lecteur(24, function () {
      var al = CONFIGS[self._c].alpha
      // Pas de lecture : la plage est parcourue en (max − min) / vitesse secondes environ.
      var pas = Math.max(al.pas, Math.round(al.vitesse / 24 / al.pas) * al.pas)
      var v = arrondi(self._a + pas, 4)
      if (v > al.max + 1e-9) v = al.min
      self._a = v
      self._noter(); self._rendre()
    }, function (enCours) { btn.setAttribute('aria-pressed', String(enCours)); btn.textContent = enCours ? '❚❚ Pause' : '▶ Lancer' })
    btn.addEventListener('click', function () { self._lect.basculer() })
    this._bornes()
    this._noter()
    this._rendre()
  }

  disconnectedCallback() { if (this._lect) this._lect.arreter() }

  _bornes() {
    var al = CONFIGS[this._c].alpha, inp = this._sh.getElementById('a')
    inp.min = String(al.min); inp.max = String(al.max); inp.step = String(al.pas)
  }

  _noter() {
    var c = CONFIGS[this._c], it = c.inter(this._a)
    if (it.etat === 'ok' && !it.hors) { this._trace.push([it.x, it.y]); if (this._trace.length > 3000) this._trace.shift() }
  }

  _rendre() {
    var sh = this._sh, c = CONFIGS[this._c], a = this._a, self = this
    var R = repereDe(c), al = c.alpha
    sh.querySelectorAll('[data-c]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-c') === self._c)) })
    sh.getElementById('enonce').textContent = c.enonce
    var aTex = texN(a, al.dec) + (al.degres ? '^\\circ' : '')
    majCurseur(sh, 'a', a, '\\alpha=' + aTex)
    var bm = sh.getElementById('montrer')
    bm.setAttribute('aria-pressed', String(this._montrer)); bm.textContent = this._montrer ? 'Cacher le lieu' : 'Montrer le lieu'

    // ---------- État pour cet α ----------
    var gens = c.gens(a), it = c.inter(a)
    var h = '<p class="ligne"><span class="c1">' + (gens[0].court ? tex(gens[0].court) : gens[0].nom) + '</span> : ' + tex(texDroite(gens[0].l[0], gens[0].l[1], gens[0].l[2], 2)) +
      '<br><span class="c2">' + (gens[1].court ? tex(gens[1].court) : gens[1].nom) + '</span> : ' + tex(texDroite(gens[1].l[0], gens[1].l[1], gens[1].l[2], 2)) + '</p>'
    if (gens[0].court) h += '<p class="note">' + tex(gens[0].court) + ' : ' + gens[0].nom + ' ; ' + tex(gens[1].court) + ' : ' + gens[1].nom + '.</p>'
    if (al.degres) h += '<p class="note">Coefficients (sinus et cosinus) arrondis au centième.</p>'
    if (it.etat === 'ok') h += '<p>Elles se coupent en ' + coordTex('P', it.x, it.y) + '.' + (it.hors ? ' <span class="note">(hors du cadre : y = −6/α est très grand)</span>' : '') + '</p>'
    if (it.etat === 'exclu') h += '<p>Elles se coupent en ' + ptTex('', it.x, it.y) + '.</p>'
    if (it.msg) h += '<p class="' + (it.etat === 'ok' ? 'note' : 'c-bad') + '">' + it.msg + '</p>'
    sh.getElementById('etat').innerHTML = h

    // ---------- Lieu ----------
    var L = c.lieu, l = '<p class="titre-panneau">Le lieu</p>'
    if (!this._montrer) l += '<p class="note">Lance l’animation ou fais glisser α, puis « Montrer le lieu » pour comparer la trace au lieu calculé.</p>'
    else {
      l += '<p class="ligne">Élimination de α, puis factorisation : ' + tex(L.brute) + '.</p>'
      L.morceaux.forEach(function (m) { l += '<p>' + tex(m[0]) + ' : <span class="statut ' + (m[1] === 'propre' ? 'c-good' : 'c-attn') + '">' + m[1] + '</span> — ' + m[2] + '.</p>' })
      l += '<p><span class="c-good">Restriction.</span> ' + L.restriction + '</p>'
      l += '<p class="note">Ronds vides : points exclus du lieu.</p>'
    }
    sh.getElementById('lieu').innerHTML = l

    // ---------- Figure ----------
    var svg = sh.getElementById('svg')
    svg.setAttribute('viewBox', '0 0 ' + R.L + ' ' + R.H)
    svg.innerHTML = ''
    R.fond(svg, 1)
    var clip = G.el('clipPath', { id: 'cadre' }, svg.querySelector('defs'))
    G.el('rect', { x: R.marge, y: R.marge, width: R.L - 2 * R.marge, height: R.H - 2 * R.marge }, clip)
    var ctx = {
      ligne: function (g, x1, y1, x2, y2, cls) { var p = R.px(x1, y1), q = R.px(x2, y2); return G.el('line', { x1: p[0].toFixed(1), y1: p[1].toFixed(1), x2: q[0].toFixed(1), y2: q[1].toFixed(1), class: cls }, g) },
      cercle: function (g, cx, cy, r, cls) { var p = R.px(cx, cy); G.el('circle', { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: (r * R.unite).toFixed(1), class: cls }, g) },
      ouvert: function (g, x, y) { var p = R.px(x, y); G.el('circle', { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: 5, class: 'ouvert' }, g) },
      nom: function (g, t, x, y, dx, dy, cls) { etiquette(g, t, x, y, dx, dy, cls) },
    }
    function etiquette(g, t, x, y, dx, dy, cls) {
      var p = R.px(x, y), w = t.length * 8
      var tx = Math.max(4 + w / 2, Math.min(R.L - 4 - w / 2, p[0] + dx)), ty = Math.max(15, Math.min(R.H - 5, p[1] + dy))
      var e = G.el('text', { x: tx.toFixed(1), y: ty.toFixed(1), 'text-anchor': 'middle', class: 'et ' + (cls || '') }, g)
      e.textContent = t
    }
    var POS = { 'bas-g': [-10, 16], 'bas-d': [10, 16], 'haut-g': [-10, -8], 'haut-d': [10, -8], g: [-12, 5], d: [12, 5] }
    if (c.contour) G.el('polygon', { points: c.contour.map(function (q) { var p = R.px(q[0], q[1]); return p[0].toFixed(1) + ',' + p[1].toFixed(1) }).join(' '), class: 'fig-cont' }, svg)
    var g = G.el('g', { 'clip-path': 'url(#cadre)' }, svg)
    // Génératrices (droites entières, coupées au cadre)
    gens.forEach(function (ge, k) {
      var A = ge.l[0], B = ge.l[1], Lg = Math.hypot(A, B)
      if (Lg < 1e-12) return
      var ux = -B / Lg, uy = A / Lg, p0 = ge.par
      ctx.ligne(g, p0[0] - LOIN * ux, p0[1] - LOIN * uy, p0[0] + LOIN * ux, p0[1] + LOIN * uy, k ? 'gen2' : 'gen1')
    })
    if (c.parallele) ctx.ligne(g, -1.5, a, 7.5, a, 'trait-soft pointille')
    if (c.segmentsC) { ctx.ligne(g, 3, 0, 0, a, 'trait-soft pointille'); ctx.ligne(g, -2, 0, 0, a, 'trait-soft pointille') }
    this._trace.forEach(function (q) { var p = R.px(q[0], q[1]); G.el('circle', { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: 3, class: 'trace' }, g) })
    if (this._montrer) L.dessin(g, ctx)
    c.fixes.forEach(function (f) { var p = R.px(f[1], f[2]); G.el('circle', { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: 4, class: 'pt' }, svg); etiquette(svg, f[0], f[1], f[2], POS[f[3]][0], POS[f[3]][1]) })
    c.mobiles(a).forEach(function (m) {
      if (m[2] < c.fen.yMin || m[2] > c.fen.yMax) return
      var p = R.px(m[1], m[2]); G.el('circle', { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: 4, class: 'pt-plan' }, svg); etiquette(svg, m[0], m[1], m[2], POS[m[3]][0], POS[m[3]][1], 'et-plan')
    })
    if ((it.etat === 'ok' || it.etat === 'exclu') && !it.hors) {
      var pp = R.px(it.x, it.y)
      G.el('circle', { cx: pp[0].toFixed(1), cy: pp[1].toFixed(1), r: 6.5, class: it.etat === 'ok' ? 'p-ok' : 'ouvert' }, svg)
      etiquette(svg, 'P', it.x, it.y, 13, -9, 'et-rose')
    }
  }
}

if (!customElements.get('generatrices-animees-widget')) customElements.define('generatrices-animees-widget', GeneratricesAnimeesWidget)
