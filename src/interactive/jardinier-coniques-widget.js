/* ================================================================
 * <jardinier-coniques-widget> — atelier « Le jardinier : somme ou
 * différence » (6e, ch. 10, § 1). F et F′ (coordonnées entières) se
 * déplacent au doigt ; la constante 2a se règle (0 à 14, pas de 0,5) ;
 * une bascule choisit la condition |PF| + |PF′| = 2a (la ficelle du
 * jardinier) ou ||PF| − |PF′|| = 2a. P parcourt le lieu (« Faire le
 * tour », glissé, ou curseur) et laisse une trace rose ; les deux
 * « ficelles » [PF] et [PF′] sont dessinées avec leurs longueurs.
 * Somme : 2a > 2c ellipse (cercle si F = F′), 2a = 2c segment [FF′],
 * 2a < 2c vide. Différence : 2a < 2c hyperbole (une branche à la fois),
 * 2a = 2c deux demi-droites (la droite FF′ privée de ]FF′[), 2a > 2c
 * vide, 2a = 0 médiatrice de [FF′]. a, b, c affichés (c = |FF′|/2 et
 * b en racines simplifiées), avec le triangle rectangle qui donne
 * a² = b² + c² (ellipse) ou c² = a² + b² (hyperbole). Repère orthonormé
 * à fenêtre FIXE. Web Component (Shadow DOM).
 * ================================================================ */
import './geo-analytique-commun.js'
import { styleKatex, tex, texEgalites, CSS_BASE } from './katex-shadow.js'
import { curseurHTML, majCurseur, borner, estExact } from './variables-aleatoires-commun.js'
import { texN, texRacine, CSS_LIEUX, placeurEtiquettes, marqueAngleDroit, lecteur, racineEntiere } from './lieux-geometriques-commun.js'
import { cheminPts, groupeCadre, plusProche, CSS_CONIQUES } from './coniques-commun.js'

var G = window.GeoAnaCommun
var FEN = { xMin: -6, xMax: 6, yMin: -4.5, yMax: 4.5 }
var R = G.repere(FEN, 28, 14)
var BORNES = { xMin: -5, xMax: 5, yMin: -4, yMax: 4 }
var TRACE_MAX = 1200
var PRESETS = {
  ell: { nom: 'Ellipse du cours', F: [3, 0], F2: [-3, 0], k: 20, somme: true },
  hyp: { nom: 'Hyperbole du cours', F: [5, 0], F2: [-5, 0], k: 12, somme: false },
  cer: { nom: 'F = F′', F: [0, 0], F2: [0, 0], k: 16, somme: true },
  obl: { nom: 'Foyers obliques', F: [2, 2], F2: [-2, -1], k: 16, somme: true },
}

function egal(x, d) { return estExact(x, 4) ? '=' + texN(x, 4) : '\\approx' + texN(x, d === undefined ? 2 : d) }

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE + CSS_LIEUX + CSS_CONIQUES +
  '.tri{stroke:var(--attn,#96650c);stroke-width:1.8;}' +
  '.mode .btn{min-width:120px;}' +
  '</style>' +
  '<div class="rangee presets" role="group" aria-label="Exemples">' +
  Object.keys(PRESETS).map(function (k) { return '<button class="btn" data-p="' + k + '">' + PRESETS[k].nom + '</button>' }).join('') + '</div>' +
  '<div class="rangee mode" role="group" aria-label="Condition"><button class="btn" id="somme">Somme = 2a</button><button class="btn" id="diff">Différence = 2a</button></div>' +
  '<p class="consigne">Fais glisser F et F′, règle 2a, puis lance le tour (ou fais glisser P) : P laisse une trace.</p>' +
  '<div class="figure"><svg id="svg" class="glisser" viewBox="0 0 ' + R.L + ' ' + R.H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Les foyers F et F′, le point P, les deux ficelles et la trace du lieu"></svg></div>' +
  '<p class="verdict" id="verdict" aria-live="polite"></p>' +
  '<div class="rangee"><button class="btn" id="lancer" aria-pressed="false">▶ Faire le tour</button><button class="btn" id="branche" aria-pressed="false">Autre branche</button><button class="btn" id="courbe" aria-pressed="false">Montrer tout le lieu</button><button class="btn btn-reset" id="effacer">Effacer la trace</button></div>' +
  '<div class="reglages">' + curseurHTML('k', 'Constante 2a', 0, 14, 0.5) + curseurHTML('w', 'Position de P', -1, 1, 0.01) + '</div>' +
  '<div class="panneau" id="mesures" aria-live="polite"></div>' +
  '<div class="panneau" id="abc"></div>'

class JardinierConiquesWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._ecouteurs = []
    this._appliquer(PRESETS.ell)
    this._w = 0.3
    this._trace = []
  }

  _appliquer(p) {
    this._F = p.F.slice(); this._F2 = p.F2.slice(); this._k = p.k; this._somme = p.somme
    this._autre = false; this._trace = []
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh, svg = sh.getElementById('svg')
    this._lect = lecteur(50, function () {
      if (self._reste <= 0) return false
      self._reste--
      var w = self._w + 0.01
      if (w > 1 + 1e-9) { if (!self._ferme) return false; w = -0.99 }
      self._w = Math.round(w * 100) / 100
      self._rendre(true)
    }, function (en) {
      var b = sh.getElementById('lancer')
      b.setAttribute('aria-pressed', String(en)); b.textContent = en ? '❚❚ Pause' : '▶ Faire le tour'
    })
    sh.getElementById('lancer').addEventListener('click', function () {
      if (!self._lect.enCours()) {
        var L = self._lieu()
        // courbe fermée (ellipse, cercle, segment parcouru aller-retour) : un tour complet depuis P ;
        // courbe ouverte : de la position de P jusqu'au bout (depuis le début si P y est déjà)
        self._ferme = L.type === 'ellipse' || L.type === 'cercle' || L.type === 'segment' || L.type === 'point'
        if (!self._ferme && self._w >= 0.995) { self._w = -1; self._trace = [] }
        self._reste = self._ferme ? 200 : Math.round((1 - self._w) * 100)
        self._rendre(true)
      }
      self._lect.basculer()
    })
    sh.querySelectorAll('[data-p]').forEach(function (b) {
      b.addEventListener('click', function () { self._lect.arreter(); self._appliquer(PRESETS[b.getAttribute('data-p')]); self._rendre() })
    })
    sh.getElementById('somme').addEventListener('click', function () { self._changer(function () { self._somme = true }) })
    sh.getElementById('diff').addEventListener('click', function () { self._changer(function () { self._somme = false }) })
    // même lieu, autre branche : la trace est gardée
    sh.getElementById('branche').addEventListener('click', function () { self._lect.arreter(); self._autre = !self._autre; self._trace.push(null); self._rendre() })
    sh.getElementById('courbe').addEventListener('click', function () { self._courbe = !self._courbe; self._rendre() })
    sh.getElementById('effacer').addEventListener('click', function () { self._trace = []; self._rendre() })
    function regleK(v) { self._changer(function () { self._k = borner(Math.round(v * 2), 0, 28) }) }
    sh.getElementById('k').addEventListener('input', function (e) { regleK(parseFloat(e.target.value)) })
    sh.getElementById('k-moins').addEventListener('click', function () { regleK(self._k / 2 - 0.5) })
    sh.getElementById('k-plus').addEventListener('click', function () { regleK(self._k / 2 + 0.5) })
    function regleW(v) { self._lect.arreter(); self._w = borner(Math.round(v * 100) / 100, -1, 1); self._rendre(true) }
    sh.getElementById('w').addEventListener('input', function (e) { regleW(parseFloat(e.target.value)) })
    sh.getElementById('w-moins').addEventListener('click', function () { regleW(self._w - 0.05) })
    sh.getElementById('w-plus').addEventListener('click', function () { regleW(self._w + 0.05) })
    G.glisser(this, svg, R, function () { self._lect.arreter() }, function (n, x, y) {
      if (n === 'P') {
        var L = self._lieu()
        if (!L.pts) return
        var i = plusProche(L.pts, x, y)
        if (i < 0) return
        self._w = borner(Math.round((-1 + 2 * i / (L.pts.length - 1)) * 100) / 100, -1, 1)
        self._rendre(true)
        return
      }
      var X = borner(Math.round(x), BORNES.xMin, BORNES.xMax), Y = borner(Math.round(y), BORNES.yMin, BORNES.yMax)
      var cle = n === 'F' ? '_F' : '_F2'
      if (self[cle][0] === X && self[cle][1] === Y) return
      self._changer(function () { self[cle] = [X, Y] })
    })
    this._rendre()
  }

  _changer(f) { this._lect.arreter(); f(); this._trace = []; this._rendre() }

  /** Géométrie du lieu : type, a, b, c, centre, direction u, points échantillonnés (w de −1 à 1). */
  _lieu() {
    var F = this._F, F2 = this._F2, a = this._k / 4, n2 = (F[0] - F2[0]) * (F[0] - F2[0]) + (F[1] - F2[1]) * (F[1] - F2[1])
    var c = Math.sqrt(n2) / 2, M = [(F[0] + F2[0]) / 2, (F[1] + F2[1]) / 2]
    var u = n2 ? [(F[0] - F2[0]) / (2 * c), (F[1] - F2[1]) / (2 * c)] : [1, 0], v = [-u[1], u[0]]
    var L = { a: a, c: c, n2: n2, M: M, u: u, v: v, k: this._k, pts: null }
    var N = 200, i, s, sg = this._autre ? -1 : 1
    function pt(x, y) { return [M[0] + x * u[0] + y * v[0], M[1] + x * u[1] + y * v[1]] }
    L.pts = []
    // (2a)² = k²/4 et (2c)² = n2 : le signe de (2a)² − (2c)² est celui de l'entier k² − 4·n2
    var ka = this._k, cmp = ka * ka - 4 * n2
    if (this._somme) {
      if (cmp > 0) {
        L.type = n2 ? 'ellipse' : 'cercle'
        L.b = Math.sqrt(a * a - c * c)
        for (i = 0; i <= N; i++) { s = Math.PI * (-1 + 2 * i / N); L.pts.push(pt(a * Math.cos(s), L.b * Math.sin(s))) }
      } else if (cmp === 0) {
        L.type = n2 ? 'segment' : 'point'
        for (i = 0; i <= N; i++) { s = Math.PI * (-1 + 2 * i / N); L.pts.push(pt(c * Math.cos(s), 0)) }
      } else { L.type = 'vide'; L.pts = null }
    } else {
      if (!n2) { L.type = ka === 0 ? 'plan' : 'vide'; L.pts = null }
      else if (ka === 0) {
        L.type = 'mediatrice'
        for (i = 0; i <= N; i++) L.pts.push(pt(0, 7 * (-1 + 2 * i / N)))
      } else if (cmp < 0) {
        L.type = 'hyperbole'
        L.b = Math.sqrt(c * c - a * a)
        var sMax = Math.min(3.5, Math.asinh(7 / Math.max(L.b, 0.3)))
        for (i = 0; i <= N; i++) { s = sMax * (-1 + 2 * i / N); L.pts.push(pt(sg * a * Math.cosh(s), L.b * Math.sinh(s))) }
      } else if (cmp === 0) {
        L.type = 'demi-droites'
        for (i = 0; i <= N; i++) { s = 5 * i / N; L.pts.push(pt(sg * (c + s), 0)) }
      } else { L.type = 'vide'; L.pts = null }
    }
    return L
  }

  _rendre(depuisP) {
    var sh = this._sh, L = this._lieu(), F = this._F, F2 = this._F2
    var w = this._w
    majCurseur(sh, 'k', this._k / 2, '2a=' + texN(this._k / 2, 1))
    majCurseur(sh, 'w', w, 'P')
    var sansP = !L.pts
    ;['w', 'w-moins', 'w-plus', 'lancer'].forEach(function (id) { sh.getElementById(id).disabled = sansP })
    if (!sansP) { sh.getElementById('w-moins').disabled = w <= -1 + 1e-9; sh.getElementById('w-plus').disabled = w >= 1 - 1e-9 }
    sh.getElementById('somme').setAttribute('aria-pressed', String(this._somme))
    sh.getElementById('diff').setAttribute('aria-pressed', String(!this._somme))
    var bb = sh.getElementById('branche')
    bb.hidden = !(L.type === 'hyperbole' || L.type === 'demi-droites')
    bb.setAttribute('aria-pressed', String(this._autre))
    sh.getElementById('courbe').setAttribute('aria-pressed', String(!!this._courbe))
    var self = this
    sh.querySelectorAll('[data-p]').forEach(function (b) {
      var p = PRESETS[b.getAttribute('data-p')]
      b.setAttribute('aria-pressed', String(p.F[0] === F[0] && p.F[1] === F[1] && p.F2[0] === F2[0] && p.F2[1] === F2[1] && p.k === self._k && p.somme === self._somme))
    })

    var P = null
    if (L.pts) {
      var idx = Math.round((w + 1) / 2 * (L.pts.length - 1))
      P = L.pts[idx]
      if (depuisP) {
        var der = this._trace[this._trace.length - 1]
        if (!der || Math.hypot(der[0] - P[0], der[1] - P[1]) > 0.02) {
          if (der && Math.hypot(der[0] - P[0], der[1] - P[1]) > 0.8) this._trace.push(null)
          this._trace.push(P.slice())
          if (this._trace.length > TRACE_MAX) this._trace.shift()
        }
      }
    }

    // ---------- Verdict ----------
    var v = sh.getElementById('verdict'), msg, cls = 'verdict ok'
    switch (L.type) {
      case 'ellipse': msg = '2a > 2c : une ellipse de foyers F et F′ — la ficelle du jardinier.'; break
      case 'cercle': msg = 'F = F′ (c = 0) : |PF| = a, un cercle de rayon a — le cas c = 0 de l’ellipse.'; break
      case 'segment': cls = 'verdict neutre'; msg = '2a = 2c : la ficelle est tendue entre les piquets, P ne quitte pas le segment [FF′]. Pas une ellipse.'; break
      case 'point': cls = 'verdict neutre'; msg = 'F = F′ et 2a = 0 : seul le point F convient.'; break
      case 'hyperbole': msg = '2a < 2c : une hyperbole de foyers F et F′ (une branche à la fois : « Autre branche »).'; break
      case 'demi-droites': cls = 'verdict neutre'; msg = '2a = 2c : la droite FF′ privée de ]FF′[ — deux demi-droites, pas une hyperbole.'; break
      case 'mediatrice': cls = 'verdict neutre'; msg = '2a = 0 : |PF| = |PF′|, la médiatrice de [FF′]. Pas une hyperbole.'; break
      case 'plan': cls = 'verdict neutre'; msg = 'F = F′ et 2a = 0 : |PF| − |PF′| = 0 pour TOUT point P du plan.'; break
      default: cls = 'verdict ko'; msg = this._somme ? '2a < 2c : lieu vide. La somme |PF| + |PF′| vaut toujours au moins |FF′| = 2c.' : (L.n2 ? '2a > 2c : lieu vide. La différence ||PF| − |PF′|| ne dépasse jamais |FF′| = 2c.' : 'F = F′ : la différence vaut toujours 0, lieu vide pour 2a > 0.')
    }
    v.className = cls; v.textContent = msg

    // ---------- Mesures ----------
    var h = '<p class="titre-panneau">Les deux ficelles</p>'
    if (!P) h += '<p class="note">Aucun point à placer.</p>'
    else {
      var d1 = Math.hypot(P[0] - F[0], P[1] - F[1]), d2 = Math.hypot(P[0] - F2[0], P[1] - F2[1])
      h += '<p class="ligne"><span class="c-good">' + tex('|PF|' + egal(d1)) + '</span> et <span class="c-plan">' + tex("|PF'|" + egal(d2)) + '</span></p>'
      if (this._somme) h += '<p class="ligne">' + texEgalites(["|PF|+|PF'|", (estExact(d1 + d2, 4) ? '' : '\\approx') + texN(d1 + d2, 2)], '=') + ' : toujours ' + tex('2a=' + texN(this._k / 2, 1)) + '.</p>'
      else h += '<p class="ligne">' + texEgalites(["\\bigl||PF|-|PF'|\\bigr|", (estExact(Math.abs(d1 - d2), 4) ? '' : '\\approx') + texN(Math.abs(d1 - d2), 2)], '=') + ' : toujours ' + tex('2a=' + texN(this._k / 2, 1)) + '.</p>'
    }
    sh.getElementById('mesures').innerHTML = h

    // ---------- a, b, c ----------
    var k = '<p class="titre-panneau">a, b et c</p>'
    var texC = L.n2 ? texRacine(1, L.n2, 2) : '0'
    k += '<p class="ligne">' + tex('a=' + texN(L.a, 2)) + ' ; ' + tex("c=\\frac{|FF'|}{2}=" + texC) + (L.n2 && racineEntiere(L.n2) < 0 ? ' ' + tex('\\approx' + texN(L.c, 2)) : '') + '</p>'
    var b2num = Math.abs(this._k * this._k - 4 * L.n2) // b = √(b2num)/4
    if (L.type === 'ellipse' || L.type === 'cercle') {
      k += '<p class="ligne">' + texEgalites(['b=\\sqrt{a^2-c^2}', texRacine(1, b2num, 4)], '=') + (racineEntiere(b2num) < 0 ? ' ' + tex('\\approx' + texN(L.b, 2)) : '') + '</p>'
      k += '<p class="note">Le sommet B de l’axe non focal est à la distance a de chaque foyer (la ficelle est pliée en son milieu) : le triangle orange est rectangle et ' + tex('a^2=b^2+c^2') + '.</p>'
    } else if (L.type === 'hyperbole') {
      k += '<p class="ligne">' + texEgalites(['b=\\sqrt{c^2-a^2}', texRacine(1, b2num, 4)], '=') + (racineEntiere(b2num) < 0 ? ' ' + tex('\\approx' + texN(L.b, 2)) : '') + '</p>'
      k += '<p class="note">Triangle orange : ' + tex('c^2=a^2+b^2') + ' ; la diagonale du rectangle de côtés 2a et 2b porte une asymptote.</p>'
    } else k += '<p class="note">Pas de b ici : ce n’est ni une ellipse, ni une hyperbole.</p>'
    sh.getElementById('abc').innerHTML = k

    // ---------- Figure ----------
    var svg = sh.getElementById('svg')
    svg.innerHTML = ''
    R.fond(svg, 1)
    var g = groupeCadre(G, svg, R, 'cadre-jard')
    var M = L.M, u = L.u, vv = L.v
    function pt(x, y) { return [M[0] + x * u[0] + y * vv[0], M[1] + x * u[1] + y * vv[1]] }
    function seg(A, B, cls) { var p = R.px(A[0], A[1]), q = R.px(B[0], B[1]); return G.el('line', { x1: p[0].toFixed(1), y1: p[1].toFixed(1), x2: q[0].toFixed(1), y2: q[1].toFixed(1), class: cls }, g) }
    if (L.type === 'plan') G.el('rect', { x: R.marge, y: R.marge, width: R.L - 2 * R.marge, height: R.H - 2 * R.marge, class: 'conique-faible', style: 'fill:var(--accent,#b65c1f);fill-opacity:0.12;stroke:none' }, g)
    var pl = placeurEtiquettes(R.L, R.H)
    var etiq = []
    // triangle a, b, c
    if (L.type === 'ellipse') {
      var B = pt(0, L.b), Fp = pt(L.c, 0)
      seg(M, B, 'tri'); seg(M, Fp, 'tri'); seg(B, Fp, 'tri pointille')
      marqueAngleDroit(g, R.px(M[0], M[1]), R.px(B[0], B[1]), R.px(Fp[0], Fp[1]), 8, 'trait-soft fin')
      etiq.push([pt(0, L.b / 2), 'b', [6, 7]], [pt(L.c / 2, 0), 'c', [5, 4]], [pt(L.c / 2, L.b / 2), 'a', [0, 1]], [B, 'B', [4, 0, 1]])
    } else if (L.type === 'hyperbole') {
      var S = pt(L.a, 0), K = pt(L.a, L.b)
      seg(M, S, 'tri'); seg(S, K, 'tri'); seg(M, K, 'tri pointille')
      marqueAngleDroit(g, R.px(S[0], S[1]), R.px(M[0], M[1]), R.px(K[0], K[1]), 8, 'trait-soft fin')
      var as1 = pt(10 * L.a, 10 * L.b), as2 = pt(-10 * L.a, -10 * L.b), as3 = pt(10 * L.a, -10 * L.b), as4 = pt(-10 * L.a, 10 * L.b)
      seg(as1, as2, 'asymptote'); seg(as3, as4, 'asymptote')
      var r1 = pt(L.a, L.b), r2 = pt(-L.a, L.b), r3 = pt(-L.a, -L.b), r4 = pt(L.a, -L.b)
      G.el('path', { d: cheminPts(R, [r1, r2, r3, r4, r1]), class: 'trait-soft fin pointille' }, g)
      etiq.push([pt(L.a / 2, 0), 'a', [5, 4]], [pt(L.a, L.b / 2), 'b', [6, 7]], [pt(L.a / 2, L.b / 2), 'c', [1, 0]])
    }
    if (this._courbe && L.pts) {
      if (L.type === 'hyperbole' || L.type === 'demi-droites') {
        var autres = []
        L.pts.forEach(function (q) { autres.push([2 * M[0] - q[0], 2 * M[1] - q[1]]) })
        G.el('path', { d: cheminPts(R, autres), class: 'conique-faible' }, g)
      }
      G.el('path', { d: cheminPts(R, L.pts), class: 'conique-faible' }, g)
    }
    if (this._trace.length > 1) G.el('path', { d: cheminPts(R, this._trace), class: 'trace' }, g)
    else if (this._trace.length === 1) { var t0 = R.px(this._trace[0][0], this._trace[0][1]); G.el('circle', { cx: t0[0], cy: t0[1], r: 2, class: 'pt-rose' }, g) }
    if (P) { seg(P, F, 'seg-f'); seg(P, F2, 'seg-f2') }
    var pF = R.px(F[0], F[1]), pF2 = R.px(F2[0], F2[1])
    pl.point(pF[0], pF[1], 7); pl.point(pF2[0], pF2[1], 7)
    var pP = P ? R.px(P[0], P[1]) : null
    if (pP) pl.point(pP[0], pP[1], 8)
    G.el('circle', { cx: pF2[0].toFixed(1), cy: pF2[1].toFixed(1), r: 6, class: 'pt-plan' }, svg)
    G.el('circle', { cx: pF[0].toFixed(1), cy: pF[1].toFixed(1), r: 6, class: 'pt-good' }, svg)
    if (pP && R.dansFenetre(P[0], P[1])) G.el('circle', { cx: pP[0].toFixed(1), cy: pP[1].toFixed(1), r: 6.5, class: 'pt-acc' }, svg)
    var same = F[0] === F2[0] && F[1] === F2[1]
    pl.poser(svg, pF[0], pF[1], same ? 'F = F′' : 'F', 'et-good', [2, 3])
    if (!same) pl.poser(svg, pF2[0], pF2[1], 'F′', 'et-plan', [3, 2])
    if (pP && R.dansFenetre(P[0], P[1])) pl.poser(svg, pP[0], pP[1], 'P', 'et-acc', [0, 1])
    etiq.forEach(function (e) { if (!R.dansFenetre(e[0][0], e[0][1])) return; var q = R.px(e[0][0], e[0][1]); pl.poser(svg, q[0], q[1], e[1], 'et-attn', e[2]) })
    // poignées : F′, F, puis P par-dessus
    G.poignee(svg, R, F2[0], F2[1], 'F2', false)
    G.poignee(svg, R, F[0], F[1], 'F', false)
    if (P && R.dansFenetre(P[0], P[1])) G.poignee(svg, R, P[0], P[1], 'P', false)
  }

  disconnectedCallback() { if (this._lect) this._lect.arreter() }
}

if (!customElements.get('jardinier-coniques-widget')) customElements.define('jardinier-coniques-widget', JardinierConiquesWidget)
