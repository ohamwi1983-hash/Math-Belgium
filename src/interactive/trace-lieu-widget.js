/* ================================================================
 * <trace-lieu-widget> — atelier « Trace le lieu » (6e, ch. 9, § 4).
 * On choisit une condition, on promène M (glisser au doigt ou à la
 * souris, ou curseurs x et y) : M devient vert quand il vérifie la
 * condition (à 0,13 unité près, la distance de M au lieu étant calculée
 * exactement) et chaque position valide laisse un point vert. On fait
 * glisser k : les régimes défilent (cercle → point → vide ; bande
 * pleine → deux droites ; carré plein → octogone ; Apollonius k = 1 →
 * médiatrice ; somme ou différence de valeurs absolues). « Montrer le
 * lieu » le trace en entier, points exclus marqués (Thalès : A et B).
 * Conditions : MA² + MB² = k, MA² = k·MB², MA² − MB² = k,
 * |x − 2| + |y + 1| = k, |x − 2| − |y + 1| = k, somme des distances à
 * deux parallèles, somme des distances aux côtés d'un carré, angle AMB
 * droit. Fenêtre FIXE x de −6,5 à 6,5, y de −5 à 5, repère orthonormé.
 * Web Component (Shadow DOM).
 * ================================================================ */
import './geo-analytique-commun.js'
import { styleKatex, tex, texEgalites, CSS_BASE } from './katex-shadow.js'
import { curseurHTML, lierCurseur, majCurseur, arrondi, borner } from './variables-aleatoires-commun.js'
import { texFrac, texRacine, texN, distDemiDroite, distPolygone, CSS_LIEUX } from './lieux-geometriques-commun.js'

var G = window.GeoAnaCommun
var FEN = { xMin: -6.5, xMax: 6.5, yMin: -5, yMax: 5 }
var R = G.repere(FEN, 28, 14)
var TOL = 0.13
var TRACE_MAX = 1500
var LOIN = 40

function nb(x, d) { return G.nb(x, d === undefined ? 2 : d) }
function approx(x, d) { return Math.abs(x - arrondi(x, d)) < 1e-9 ? '=' + texN(x, d) : '\\approx ' + texN(x, d) }
function ligne(svg, x1, y1, x2, y2, cls) {
  var p = R.px(x1, y1), q = R.px(x2, y2)
  return G.el('line', { x1: p[0].toFixed(1), y1: p[1].toFixed(1), x2: q[0].toFixed(1), y2: q[1].toFixed(1), class: cls }, svg)
}
function cercle(svg, cx, cy, r, cls) {
  var p = R.px(cx, cy)
  return G.el('circle', { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: (r * R.unite).toFixed(1), class: cls }, svg)
}
function polygone(svg, pts, cls) {
  return G.el('polygon', { points: pts.map(function (q) { var p = R.px(q[0], q[1]); return p[0].toFixed(1) + ',' + p[1].toFixed(1) }).join(' '), class: cls }, svg)
}
/** Étiquette gardée dans le cadre (largeur estimée à 7 px par caractère). */
function etiquette(svg, x, y, txt, cls, dx, dy, ancre) {
  var p = R.px(x, y), w = txt.length * 7, a = ancre || 'middle'
  var tx = p[0] + (dx || 0), ty = p[1] + (dy || 0)
  var gauche = a === 'start' ? tx : a === 'end' ? tx - w : tx - w / 2
  if (gauche < 4) tx += 4 - gauche
  if (gauche + w > R.L - 4) tx -= gauche + w - R.L + 4
  ty = Math.max(14, Math.min(R.H - 5, ty))
  var t = G.el('text', { x: tx.toFixed(1), y: ty.toFixed(1), 'text-anchor': a, class: 'et ' + (cls || '') }, svg)
  t.textContent = txt
  return t
}
function point(svg, x, y, cls, r) { var p = R.px(x, y); return G.el('circle', { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: r || 4, class: cls }, svg) }
function demiDroite(svg, ox, oy, ux, uy, cls) { ligne(svg, ox, oy, ox + LOIN * ux, oy + LOIN * uy, cls) }

/* ---------- Les conditions ---------- */
var A2 = { x: -2, y: 0 }, B2 = { x: 2, y: 0 }
function deuxPoints(svg) {
  point(svg, A2.x, A2.y, 'pt'); point(svg, B2.x, B2.y, 'pt')
  etiquette(svg, A2.x, A2.y, 'A(−2 ; 0)', '', -6, -10, 'end')
  etiquette(svg, B2.x, B2.y, 'B(2 ; 0)', '', 6, -10, 'start')
}
function liaisonsAB(svg, m) { ligne(svg, A2.x, A2.y, m.x, m.y, 'trait-soft pointille'); ligne(svg, B2.x, B2.y, m.x, m.y, 'trait-soft pointille') }
function d2(m, p) { return (m.x - p.x) * (m.x - p.x) + (m.y - p.y) * (m.y - p.y) }
function regimeVide(texte) { return { nature: 'vide', html: texte, dist: function () { return Infinity }, dessin: function () {} } }

var CONDITIONS = {
  mediane: {
    option: 'MA² + MB² = k (théorème de la médiane)',
    k: { min: 0, max: 58, pas: 2, def: 26, dec: 0 },
    m0: { x: -4, y: 3 },
    texCond: function (k) { return 'MA^2+MB^2=' + k },
    fixes: deuxPoints,
    liaisons: liaisonsAB,
    mesure: function (m, k) {
      var a = d2(m, A2), b = d2(m, B2)
      return tex('MA^2' + approx(a, 2)) + ' ; ' + tex('MB^2' + approx(b, 2)) + ' : ' + tex('MA^2+MB^2' + approx(a + b, 2)) + ' (il faut ' + tex(String(k)) + ').'
    },
    regime: function (k) {
      var s = (k - 8) / 2
      var html = '<p class="ligne">' + texEgalites(['MA^2+MB^2=k', '(x+2)^2+y^2+(x-2)^2+y^2=k', '2x^2+2y^2+8=k', 'x^2+y^2=\\dfrac{k-8}{2}'], '\\iff ') + '</p>' +
        '<p>Seuil : ' + tex('\\dfrac{AB^2}{2}=\\dfrac{16}{2}=8') + ' (théorème de la médiane : ' + tex('MA^2+MB^2=2MI^2+\\dfrac{AB^2}{2}') + ', I milieu de [AB]).</p>'
      if (s < 0) return regimeVide(html + '<p><span class="c-bad">k = ' + k + ' < 8 : lieu vide.</span> ' + tex('x^2+y^2=' + texN(s, 0)) + ' n’a aucune solution : ' + tex('MA^2+MB^2') + ' vaut au moins 8 (minimum atteint en I).</p>')
      if (s === 0) return { nature: 'point', html: html + '<p><span class="c-acc">k = 8 : le point I(0 ; 0) seul.</span> ' + tex('x^2+y^2=0') + ' impose x = y = 0 : un cercle de rayon nul, pas un « petit cercle ».</p>',
        dist: function (x, y) { return Math.hypot(x, y) }, dessin: function (g) { point(g, 0, 0, 'pt-plan', 6); etiquette(g, 0, 0, 'I', 'et-plan', 10, -8, 'start') } }
      var r = Math.sqrt(s), rTex = texRacine(1, s, 1)
      return { nature: 'cercle', html: html + '<p><span class="c-plan">k = ' + k + ' > 8 : cercle</span> ' + tex('x^2+y^2=' + s) + ', de centre I(0 ; 0), milieu de [AB], et de rayon ' +
        tex('\\sqrt{' + s + '}' + (rTex.indexOf('sqrt{' + s + '}') >= 0 ? '' : '=' + rTex) + (Number.isInteger(r) ? '' : '\\approx ' + texN(r, 2))) + '.</p>',
        dist: function (x, y) { return Math.abs(Math.hypot(x, y) - r) }, dessin: function (g) { cercle(g, 0, 0, r, 'lieu'); point(g, 0, 0, 'pt-plan', 3); etiquette(g, 0, 0, 'I', 'et-plan', 8, -8, 'start') } }
    },
  },
  apollonius: {
    option: 'MA² = k · MB² (cercle d’Apollonius)',
    k: { min: 0.25, max: 9, pas: 0.25, def: 4, dec: 2 },
    m0: { x: -3, y: 3 },
    texCond: function (k) { return 'MA^2=' + texN(k, 2) + '\\,MB^2' },
    fixes: deuxPoints,
    liaisons: liaisonsAB,
    mesure: function (m, k) {
      var a = d2(m, A2), b = d2(m, B2)
      return tex('MA^2' + approx(a, 2)) + ' ; ' + tex(texN(k, 2) + '\\,MB^2' + approx(k * b, 2)) + (b > 1e-6 ? ' — rapport ' + tex('\\dfrac{MA^2}{MB^2}' + approx(a / b, 2)) : '') + '.'
    },
    regime: function (k) {
      var n = Math.round(4 * k)
      var html = '<p class="ligne">' + tex('(x+2)^2+y^2=k\\left((x-2)^2+y^2\\right)') + '</p><p class="ligne">' + tex('\\iff (1-k)(x^2+y^2)') + ' ' + tex('{}+4(1+k)\\,x') + ' ' + tex('{}+4(1-k)=0') + '</p>'
      if (n === 4) return { nature: 'droite', html: html + '<p><span class="c-plan">k = 1 : la médiatrice de [AB].</span> Les termes en x² et y² disparaissent : ' + tex('8x=0') + ', soit ' + tex('x=0') + '. C’est un cas à part : on ne peut pas diviser par 1 − k.</p>',
        dist: function (x) { return Math.abs(x) }, dessin: function (g) { ligne(g, 0, FEN.yMin, 0, FEN.yMax, 'lieu') } }
      var x0 = 2 * (n + 4) / (n - 4), r = 8 * Math.sqrt(n) / Math.abs(n - 4)
      var x0Tex = texFrac(2 * (n + 4), n - 4), xm = x0 > 0 ? 'x-' + x0Tex : 'x+' + x0Tex.slice(1)
      var dedans = n > 4 ? 'B' : 'A'
      var cx = texFrac(4 * (n + 4), 4 - n)
      var html2 = html + '<p class="ligne">On divise par ' + tex('1-k\\neq 0') + ' : ' + tex('x^2+y^2' + (cx.charAt(0) === '-' ? cx : '+' + cx) + 'x+4=0') + '.</p><p><span class="c-plan">k = ' + texN(k, 2).replace('{,}', ',') + ' ≠ 1 : cercle</span> ' + tex('\\left(' + xm + '\\right)^2+y^2=' + texFrac(64 * n, (n - 4) * (n - 4))) + ', de centre ' +
        tex('C\\left(' + x0Tex + '\\,;0\\right)') + ' (sur la droite (AB)) et de rayon ' + tex('r=' + texRacine(8, n, Math.abs(n - 4)) + (Number.isInteger(arrondi(r, 9)) ? '' : '\\approx ' + texN(r, 2))) + '. Il entoure ' + dedans + '.</p>'
      if (n >= 3 && n <= 6) html2 += '<p class="note">k est proche de 1 : le centre s’éloigne et le cercle ressemble de plus en plus à la médiatrice.</p>'
      if (Math.abs(x0) > 6.5) html2 += '<p class="note">Le centre est hors du cadre.</p>'
      return { nature: 'cercle', html: html2,
        dist: function (x, y) { return Math.abs(Math.hypot(x - x0, y) - r) },
        dessin: function (g) { cercle(g, x0, 0, r, 'lieu'); if (Math.abs(x0) < 6.3) { point(g, x0, 0, 'pt-plan', 3); etiquette(g, x0, 0, 'C', 'et-plan', 0, -8) } } }
    },
  },
  difference: {
    option: 'MA² − MB² = k',
    k: { min: -48, max: 48, pas: 4, def: 24, dec: 0 },
    m0: { x: -3, y: 3 },
    texCond: function (k) { return 'MA^2-MB^2=' + k },
    fixes: deuxPoints,
    liaisons: liaisonsAB,
    mesure: function (m, k) {
      var a = d2(m, A2), b = d2(m, B2)
      return tex('MA^2' + approx(a, 2)) + ' ; ' + tex('MB^2' + approx(b, 2)) + ' : ' + tex('MA^2-MB^2' + approx(a - b, 2)) + ' (il faut ' + tex(String(k)) + ').'
    },
    regime: function (k) {
      var x0 = k / 8
      var html = '<p class="ligne">' + texEgalites(['MA^2-MB^2=k', '(x+2)^2-(x-2)^2=k', '8x=k'], '\\iff ') + '</p>' +
        '<p><span class="c-plan">Une droite perpendiculaire à (AB)</span>, ' + tex('x=' + texFrac(k, 8)) + ', quelle que soit la valeur de k : pas de seuil, jamais de lieu vide.' +
        (k === 0 ? ' Pour k = 0, c’est la médiatrice de [AB].' : k === 16 ? ' Pour k = 16, elle passe par B.' : k === -16 ? ' Pour k = −16, elle passe par A.' : '') + '</p>'
      return { nature: 'droite', html: html, dist: function (x) { return Math.abs(x - x0) }, dessin: function (g) { ligne(g, x0, FEN.yMin, x0, FEN.yMax, 'lieu') } }
    },
  },
  sommeAbs: {
    option: '|x − 2| + |y + 1| = k (somme)',
    k: { min: -2, max: 3.5, pas: 0.5, def: 3, dec: 1 },
    m0: { x: -3, y: 3 },
    texCond: function (k) { return '|x-2|+|y+1|=' + texN(k, 1) },
    fixes: function (svg) { ligne(svg, 2, FEN.yMin, 2, FEN.yMax, 'trait-soft pointille fin'); ligne(svg, FEN.xMin, -1, FEN.xMax, -1, 'trait-soft pointille fin'); point(svg, 2, -1, 'pt'); etiquette(svg, 2, -1, 'Ω(2 ; −1)', '', 6, 16, 'start') },
    liaisons: function (svg, m) { ligne(svg, m.x, m.y, 2, m.y, 'trait-acc fin'); ligne(svg, m.x, m.y, m.x, -1, 'trait-sky fin') },
    mesure: function (m, k) {
      var a = Math.abs(m.x - 2), b = Math.abs(m.y + 1)
      return '<span class="c-acc">' + tex('|x-2|' + approx(a, 2)) + '</span> ; <span class="c-sky">' + tex('|y+1|' + approx(b, 2)) + '</span> : somme ' + tex(approx(a + b, 2).replace(/^=/, '')) + ' (il faut ' + tex(texN(k, 1)) + ').'
    },
    regime: function (k) {
      if (k < 0) return regimeVide('<p><span class="c-bad">k < 0 : lieu vide.</span> Une somme de valeurs absolues n’est jamais négative.</p>')
      if (k === 0) return { nature: 'point', html: '<p><span class="c-acc">k = 0 : le point Ω(2 ; −1) seul.</span> Les deux valeurs absolues doivent être nulles en même temps.</p>',
        dist: function (x, y) { return Math.hypot(x - 2, y + 1) }, dessin: function (g) { point(g, 2, -1, 'pt-plan', 6) } }
      var s = [[2 + k, -1], [2, -1 + k], [2 - k, -1], [2, -1 - k]]
      var sT = s.map(function (q) { return tex('(' + texN(q[0], 1) + '\\,;' + texN(q[1], 1) + ')') }).join(', ')
      return { nature: 'losange', html: '<p><span class="c-plan">k > 0 : un losange</span> de centre Ω(2 ; −1), lieu borné. Sommets ' + sT + ' : à chaque sommet, une seule valeur absolue s’annule (jamais les quatre combinaisons ' + tex('(2\\pm k\\,;-1\\pm k)') + ', qui donnent un carré faux). Ses diagonales mesurent toutes les deux 2k : c’est même un carré posé sur une pointe.</p>',
        dist: function (x, y) { return distPolygone(x, y, s) }, dessin: function (g) { polygone(g, s, 'lieu') } }
    },
  },
  differenceAbs: {
    option: '|x − 2| − |y + 1| = k (différence)',
    k: { min: -3, max: 3, pas: 0.5, def: 3, dec: 1 },
    m0: { x: -3, y: 3 },
    texCond: function (k) { return '|x-2|-|y+1|=' + texN(k, 1) },
    fixes: function (svg) { ligne(svg, 2, FEN.yMin, 2, FEN.yMax, 'trait-soft pointille fin'); ligne(svg, FEN.xMin, -1, FEN.xMax, -1, 'trait-soft pointille fin'); point(svg, 2, -1, 'pt'); etiquette(svg, 2, -1, 'Ω(2 ; −1)', '', 6, 16, 'start') },
    liaisons: function (svg, m) { ligne(svg, m.x, m.y, 2, m.y, 'trait-acc fin'); ligne(svg, m.x, m.y, m.x, -1, 'trait-sky fin') },
    mesure: function (m, k) {
      var a = Math.abs(m.x - 2), b = Math.abs(m.y + 1)
      return '<span class="c-acc">' + tex('|x-2|' + approx(a, 2)) + '</span> ; <span class="c-sky">' + tex('|y+1|' + approx(b, 2)) + '</span> : différence ' + tex(approx(a - b, 2).replace(/^=/, '')) + ' (il faut ' + tex(texN(k, 1)) + ').'
    },
    regime: function (k) {
      var rayons
      if (k > 0) rayons = [[2 + k, -1, 1, 1], [2 + k, -1, 1, -1], [2 - k, -1, -1, 1], [2 - k, -1, -1, -1]]
      else if (k < 0) rayons = [[2, -1 - k, 1, 1], [2, -1 - k, -1, 1], [2, -1 + k, 1, -1], [2, -1 + k, -1, -1]]
      else rayons = [[2, -1, 1, 1], [2, -1, -1, -1], [2, -1, 1, -1], [2, -1, -1, 1]]
      var html
      if (k === 0) html = '<p><span class="c-plan">k = 0 : deux droites sécantes en Ω(2 ; −1)</span>, ' + tex('y+1=x-2') + ' et ' + tex('y+1=-(x-2)') + ' (|x − 2| = |y + 1|).</p>'
      else {
        var o1 = k > 0 ? [2 + k, -1] : [2, -1 - k], o2 = k > 0 ? [2 - k, -1] : [2, -1 + k]
        html = '<p><span class="c-plan">Quatre demi-droites</span> : un lieu non borné, d’origines ' + tex('(' + texN(o1[0], 1) + '\\,;' + texN(o1[1], 1) + ')') + ' et ' + tex('(' + texN(o2[0], 1) + '\\,;' + texN(o2[1], 1) + ')') +
          (k > 0 ? ', où |y + 1| = 0. Il faut |x − 2| ≥ ' + nb(k, 1) + ' : rien dans la bande verticale entre les deux origines.' : ', où |x − 2| = 0. Il faut |y + 1| ≥ ' + nb(-k, 1) + ' : rien dans la bande horizontale entre les deux origines.') + '</p>'
      }
      html += '<p class="note">Somme ou différence : deux natures opposées (losange borné contre demi-droites).</p>'
      return { nature: k === 0 ? 'deux droites' : 'quatre demi-droites', html: html,
        dist: function (x, y) { var m = Infinity; rayons.forEach(function (q) { m = Math.min(m, distDemiDroite(x, y, q[0], q[1], q[2], q[3])) }); return m },
        dessin: function (g) { rayons.forEach(function (q) { demiDroite(g, q[0], q[1], q[2], q[3], 'lieu') }); if (k !== 0) { var o = k > 0 ? [[2 + k, -1], [2 - k, -1]] : [[2, -1 - k], [2, -1 + k]]; o.forEach(function (q) { point(g, q[0], q[1], 'pt-plan', 3.5) }) } } }
    },
  },
  bande: {
    option: 'Somme des distances à deux parallèles = k',
    k: { min: 0, max: 12, pas: 0.5, def: 8, dec: 1 },
    m0: { x: -1, y: 3 },
    texCond: function (k) { return 'd(M\\,;d_1)+d(M\\,;d_2)=' + texN(k, 1) },
    fixes: function (svg) {
      ligne(svg, -2, FEN.yMin, -2, FEN.yMax, 'trait'); ligne(svg, 2, FEN.yMin, 2, FEN.yMax, 'trait')
      etiquette(svg, -2, FEN.yMax, 'd₁ : x = −2', '', -5, 16, 'end'); etiquette(svg, 2, FEN.yMax, 'd₂ : x = 2', '', 5, 16, 'start')
    },
    liaisons: function (svg, m) { ligne(svg, m.x, m.y, -2, m.y, 'trait-acc fin'); ligne(svg, m.x, m.y, 2, m.y, 'trait-sky fin') },
    mesure: function (m, k) {
      var a = Math.abs(m.x + 2), b = Math.abs(m.x - 2)
      return '<span class="c-acc">' + tex('d(M\\,;d_1)=|x+2|' + approx(a, 2)) + '</span> ; <span class="c-sky">' + tex('d(M\\,;d_2)=|x-2|' + approx(b, 2)) + '</span> : somme ' + tex(approx(a + b, 2).replace(/^=/, '')) + ' (il faut ' + tex(texN(k, 1)) + ').'
    },
    regime: function (k) {
      var html = '<p>Seuil : l’écart entre les deux droites, 4. Entre elles, la somme vaut toujours ' + tex('(x+2)+(2-x)=4') + '.</p>'
      if (k < 4) return regimeVide(html + '<p><span class="c-bad">k < 4 : lieu vide.</span> La somme vaut au moins l’écart.</p>')
      if (k === 4) return { nature: 'bande pleine', html: html + '<p><span class="c-plan">k = 4 : la bande pleine</span> ' + tex('-2\\leq x\\leq 2') + ', bords compris — toute une région, pas seulement une ligne.</p>',
        dist: function (x) { return Math.max(0, Math.abs(x) - 2) }, dessin: function (g) { polygone(g, [[-2, FEN.yMin], [2, FEN.yMin], [2, FEN.yMax], [-2, FEN.yMax]], 'lieu-zone') } }
      var x0 = k / 2
      return { nature: 'deux droites', html: html + '<p><span class="c-plan">k > 4 : deux droites</span> parallèles à d₁ et d₂, ' + tex('x=-' + texN(x0, 2)) + ' et ' + tex('x=' + texN(x0, 2)) + ' (hors de la bande : ' + tex('2|x|=k') + ').</p>',
        dist: function (x) { return Math.min(Math.abs(x - x0), Math.abs(x + x0)) }, dessin: function (g) { ligne(g, x0, FEN.yMin, x0, FEN.yMax, 'lieu'); ligne(g, -x0, FEN.yMin, -x0, FEN.yMax, 'lieu') } }
    },
  },
  carre: {
    option: 'Somme des distances aux 4 côtés d’un carré = k',
    k: { min: 0, max: 14, pas: 1, def: 12, dec: 0 },
    m0: { x: -4, y: 3.5 },
    texCond: function (k) { return '\\text{somme des 4 distances}=' + k },
    fixes: function (svg) {
      ;[-2, 2].forEach(function (c) { ligne(svg, c, FEN.yMin, c, FEN.yMax, 'trait-soft fin'); ligne(svg, FEN.xMin, c, FEN.xMax, c, 'trait-soft fin') })
      polygone(svg, [[-2, -2], [2, -2], [2, 2], [-2, 2]], 'trait')
      etiquette(svg, 2, 2, 'carré [−2 ; 2]²', 'et-petit', 4, -6, 'start')
    },
    liaisons: function (svg, m) {
      ligne(svg, m.x, m.y, 2, m.y, 'trait-acc fin'); ligne(svg, m.x, m.y, -2, m.y, 'trait-acc fin')
      ligne(svg, m.x, m.y, m.x, 2, 'trait-sky fin'); ligne(svg, m.x, m.y, m.x, -2, 'trait-sky fin')
    },
    mesure: function (m, k) {
      var s = Math.abs(m.x - 2) + Math.abs(m.x + 2), t = Math.abs(m.y - 2) + Math.abs(m.y + 2)
      return '<span class="c-acc">' + tex('|x-2|+|x+2|' + approx(s, 2)) + '</span> ; <span class="c-sky">' + tex('|y-2|+|y+2|' + approx(t, 2)) + '</span> : somme ' + tex(approx(s + t, 2).replace(/^=/, '')) + ' (il faut ' + tex(String(k)) + ').'
    },
    regime: function (k) {
      var html = '<p>Seuil : ' + tex('4c=8') + ' (c = 2, demi-côté). Dans le carré, la somme vaut toujours ' + tex('(2-x)+(x+2)') + ' ' + tex('{}+(2-y)+(y+2)=8') + '.</p>'
      var piege = '<p class="note">Piège : avec les carrés des distances, ' + tex('2x^2+2y^2+16=k') + ' : le seuil devient ' + tex('4c^2=16') + ' et le lieu un cercle.</p>'
      if (k < 8) return regimeVide(html + '<p><span class="c-bad">k < 8 : lieu vide.</span></p>' + piege)
      if (k === 8) return { nature: 'carré plein', html: html + '<p><span class="c-plan">k = 8 : le carré plein</span>, intérieur et bords compris.</p>' + piege,
        dist: function (x, y) { var dx = Math.max(0, Math.abs(x) - 2), dy = Math.max(0, Math.abs(y) - 2); return Math.hypot(dx, dy) },
        dessin: function (g) { polygone(g, [[-2, -2], [2, -2], [2, 2], [-2, 2]], 'lieu-zone') } }
      var e = (k - 4) / 2
      var s = [[e, -2], [e, 2], [2, e], [-2, e], [-e, 2], [-e, -2], [-2, -e], [2, -e]]
      return { nature: 'octogone', html: html + '<p><span class="c-plan">k > 8 : un octogone</span>. En face d’un côté (|y| ≤ 2) : ' + tex('2|x|+4=k') + ', soit ' + tex('|x|=' + texN(e, 1)) + ' ; dans un coin (|x| ≥ 2 et |y| ≥ 2) : ' + tex('2|x|+2|y|=k') + ', un segment oblique.</p>' + piege,
        dist: function (x, y) { return distPolygone(x, y, s) }, dessin: function (g) { polygone(g, s, 'lieu') } }
    },
  },
  thales: {
    option: 'Angle AMB droit (Thalès)',
    k: null,
    m0: { x: -1, y: -3.5 },
    A: { x: -3, y: 0 }, B: { x: 3, y: 0 },
    texCond: function () { return '\\widehat{AMB}=90^\\circ' },
    fixes: function (svg) {
      point(svg, -3, 0, 'pt'); point(svg, 3, 0, 'pt')
      etiquette(svg, -3, 0, 'A(−3 ; 0)', '', -6, -10, 'end'); etiquette(svg, 3, 0, 'B(3 ; 0)', '', 6, -10, 'start')
    },
    liaisons: function (svg, m) { ligne(svg, -3, 0, m.x, m.y, 'trait-soft'); ligne(svg, 3, 0, m.x, m.y, 'trait-soft') },
    mesure: function (m) {
      var ux = -3 - m.x, uy = -m.y, vx = 3 - m.x, vy = -m.y
      var la = Math.hypot(ux, uy), lb = Math.hypot(vx, vy)
      if (la < 0.2 || lb < 0.2) return 'M est (presque) en ' + (la < 0.2 ? 'A' : 'B') + ' : l’angle AMB n’existe pas.'
      var ang = Math.acos(Math.max(-1, Math.min(1, (ux * vx + uy * vy) / (la * lb)))) * 180 / Math.PI
      return tex('\\widehat{AMB}\\approx ' + texN(ang, 1) + '^\\circ') + ' (il faut 90°) ; ' + tex('\\overrightarrow{MA}\\cdot\\overrightarrow{MB}' + approx(ux * vx + uy * vy, 2)) + '.'
    },
    regime: function () {
      return { nature: 'cercle privé de A et B', html: '<p class="ligne">' + texEgalites(['\\overrightarrow{MA}\\cdot\\overrightarrow{MB}=0', '(x+3)(x-3)+y^2=0', 'x^2+y^2=9'], '\\iff ') + '</p>' +
        '<p><span class="c-plan">Le cercle de diamètre [AB]</span>, de centre O et de rayon 3, <span class="c-bad">privé de A et de B</span> : en A (ou en B), le produit scalaire est nul mais l’angle AMB n’existe pas. Ce sont deux points exclus du lieu.</p>',
        dist: function (x, y) { return Math.abs(Math.hypot(x, y) - 3) },
        exclu: function (x, y) { return Math.hypot(x + 3, y) < 0.2 || Math.hypot(x - 3, y) < 0.2 },
        dessin: function (g) { cercle(g, 0, 0, 3, 'lieu'); point(g, -3, 0, 'pt-ouvert trait-bad', 5); point(g, 3, 0, 'pt-ouvert trait-bad', 5) } }
    },
  },
}

var TEMPLATE = document.createElement('template')
TEMPLATE.innerHTML =
  '<style>' + CSS_BASE + CSS_LIEUX +
  '.lieu{fill:none;stroke:var(--plan,#5b4ea3);stroke-width:2.6;opacity:0.85;}' +
  '.lieu-zone{fill:var(--plan,#5b4ea3);fill-opacity:0.18;stroke:var(--plan,#5b4ea3);stroke-width:2.4;}' +
  '.trace{fill:var(--good,#2f7a4f);opacity:0.55;}' +
  '.m-ok{fill:var(--good,#2f7a4f);stroke:var(--surface,#fff);stroke-width:2;}' +
  '.m-ko{fill:var(--bad,#b23a3a);stroke:var(--surface,#fff);stroke-width:2;}' +
  '.halo{fill:var(--good,#2f7a4f);opacity:0.18;}' +
  '.formule-cond{text-align:center;font-size:1.08rem;margin:0 0 6px;min-height:1.8em;}' +
  '.choix{display:flex;justify-content:center;margin:0 0 8px;}' +
  '.choix select{width:min(100%,380px);}' +
  '</style>' +
  '<div class="choix"><select id="cond" aria-label="Condition">' +
  Object.keys(CONDITIONS).map(function (c) { return '<option value="' + c + '">' + CONDITIONS[c].option + '</option>' }).join('') + '</select></div>' +
  '<p class="formule-cond" id="formule"></p>' +
  '<p class="consigne">Fais glisser M dans le repère (ou règle x et y plus bas). Vert : M vérifie la condition et laisse une trace.</p>' +
  '<div class="figure"><svg id="svg" class="glisser" viewBox="0 0 ' + R.L + ' ' + R.H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Repère avec le point M à déplacer"></svg></div>' +
  '<div class="panneau" id="mesure" aria-live="polite"></div>' +
  '<p class="verdict" id="verdict"></p>' +
  '<div class="reglages">' +
  '<div id="zone-k">' + curseurHTML('k', 'Valeur de k', 0, 1, 1) + '</div>' +
  curseurHTML('mx', 'Abscisse de M', FEN.xMin, FEN.xMax, 0.1) +
  curseurHTML('my', 'Ordonnée de M', FEN.yMin, FEN.yMax, 0.1) +
  '</div>' +
  '<div class="rangee"><button class="btn" id="montrer" aria-pressed="false">Montrer le lieu</button><button class="btn" id="effacer">Effacer la trace</button></div>' +
  '<div class="panneau" id="regime" aria-live="polite"></div>'

class TraceLieuWidget extends HTMLElement {
  constructor() {
    super()
    var sh = this.attachShadow({ mode: 'open' })
    sh.appendChild(styleKatex())
    sh.appendChild(TEMPLATE.content.cloneNode(true))
    this._sh = sh
    this._c = 'mediane'
    this._k = CONDITIONS.mediane.k.def
    this._m = { x: CONDITIONS.mediane.m0.x, y: CONDITIONS.mediane.m0.y }
    this._trace = []
    this._montrer = false
    this._ecouteurs = []
  }

  connectedCallback() {
    if (this._monte) return
    this._monte = true
    var self = this, sh = this._sh, svg = sh.getElementById('svg')
    var sel = sh.getElementById('cond')
    sel.value = this._c
    function bornesK() {
      var c = CONDITIONS[self._c]
      if (!c.k) return
      var inp = sh.getElementById('k')
      inp.min = String(c.k.min); inp.max = String(c.k.max); inp.step = String(c.k.pas)
    }
    bornesK()
    sel.addEventListener('change', function () {
      self._c = sel.value
      var c = CONDITIONS[self._c]
      bornesK()
      if (c.k) self._k = c.k.def
      self._m = { x: c.m0.x, y: c.m0.y }
      self._trace = []
      self._rendre(false)
    })
    // Curseur k câblé à la main : son pas dépend de la condition.
    function reglerK(v) {
      var c = CONDITIONS[self._c].k
      self._k = arrondi(borner(Math.round((v - c.min) / c.pas) * c.pas + c.min, c.min, c.max), 2)
      self._trace = []
      self._rendre(true)
    }
    sh.getElementById('k').addEventListener('input', function (e) { reglerK(parseFloat(e.target.value)) })
    sh.getElementById('k-moins').addEventListener('click', function () { reglerK(self._k - CONDITIONS[self._c].k.pas) })
    sh.getElementById('k-plus').addEventListener('click', function () { reglerK(self._k + CONDITIONS[self._c].k.pas) })
    lierCurseur(sh, 'mx', function () { return self._m.x }, function (v) { self._m.x = arrondi(borner(v, FEN.xMin, FEN.xMax), 2); self._rendre(true) }, 0.1)
    lierCurseur(sh, 'my', function () { return self._m.y }, function (v) { self._m.y = arrondi(borner(v, FEN.yMin, FEN.yMax), 2); self._rendre(true) }, 0.1)
    sh.getElementById('montrer').addEventListener('click', function () { self._montrer = !self._montrer; self._rendre(false) })
    sh.getElementById('effacer').addEventListener('click', function () { self._trace = []; self._rendre(false) })
    var glisse = false
    function depuis(e) {
      var p = R.monde(svg, e.clientX, e.clientY)
      if (!p) return
      self._m = { x: arrondi(borner(p.x, FEN.xMin, FEN.xMax), 2), y: arrondi(borner(p.y, FEN.yMin, FEN.yMax), 2) }
      self._rendre(true)
    }
    svg.addEventListener('pointerdown', function (e) { glisse = true; try { svg.setPointerCapture(e.pointerId) } catch { /* facultatif */ } depuis(e); e.preventDefault() })
    svg.addEventListener('pointermove', function (e) { if (glisse) { depuis(e); e.preventDefault() } })
    svg.addEventListener('pointerup', function () { glisse = false })
    svg.addEventListener('pointercancel', function () { glisse = false })
    this._rendre(false)
  }

  /** État de M pour le régime courant : { ok, exclu }. */
  _etat(reg) {
    var m = this._m
    if (reg.exclu && reg.exclu(m.x, m.y)) return { ok: false, exclu: true }
    return { ok: reg.dist(m.x, m.y) <= TOL, exclu: false }
  }

  _rendre(enregistrer) {
    var sh = this._sh, c = CONDITIONS[this._c], k = this._k, m = this._m
    var reg = c.regime(k)
    var et = this._etat(reg)
    if (enregistrer && et.ok) { this._trace.push({ x: m.x, y: m.y }); if (this._trace.length > TRACE_MAX) this._trace.shift() }

    sh.getElementById('formule').innerHTML = tex(c.texCond(k))
    sh.getElementById('zone-k').style.display = c.k ? '' : 'none'
    if (c.k) majCurseur(sh, 'k', k, 'k=' + texN(k, c.k.dec))
    majCurseur(sh, 'mx', m.x, 'x=' + texN(m.x, 2))
    majCurseur(sh, 'my', m.y, 'y=' + texN(m.y, 2))
    var bt = sh.getElementById('montrer')
    bt.setAttribute('aria-pressed', String(this._montrer))
    bt.textContent = this._montrer ? 'Cacher le lieu' : 'Montrer le lieu'

    sh.getElementById('mesure').innerHTML = '<p>' + tex('M(' + texN(m.x, 2) + '\\,;' + texN(m.y, 2) + ')') + ' : ' + c.mesure(m, k) + '</p>'
    var v = sh.getElementById('verdict')
    if (reg.nature === 'vide') { v.className = 'verdict ko'; v.textContent = '✗ Aucun point ne vérifie la condition pour cette valeur de k : le lieu est vide.' }
    else if (et.exclu) { v.className = 'verdict ko'; v.textContent = '✗ M est en un point exclu : l’angle AMB n’y existe pas.' }
    else if (et.ok) { v.className = 'verdict ok'; v.textContent = '✓ M vérifie la condition (à quelques pixels près) : il est sur le lieu.' }
    else { v.className = 'verdict ko'; v.textContent = '✗ M ne vérifie pas la condition : il n’est pas sur le lieu.' }
    sh.getElementById('regime').innerHTML = '<p class="titre-panneau">Le lieu pour cette valeur' + (c.k ? ' de k' : '') + ' : ' + reg.nature + '</p>' + reg.html

    // ---------- Figure ----------
    var svg = sh.getElementById('svg')
    svg.innerHTML = ''
    R.fond(svg, 2)
    var clip = G.el('clipPath', { id: 'cadre' }, svg.querySelector('defs'))
    G.el('rect', { x: R.marge, y: R.marge, width: R.L - 2 * R.marge, height: R.H - 2 * R.marge }, clip)
    c.fixes(svg)
    var g = G.el('g', { 'clip-path': 'url(#cadre)' }, svg)
    if (this._montrer) reg.dessin(g)
    c.liaisons(g, m)
    this._trace.forEach(function (q) { point(g, q.x, q.y, 'trace', 2.4) })
    var pm = R.px(m.x, m.y)
    if (et.ok) G.el('circle', { cx: pm[0].toFixed(1), cy: pm[1].toFixed(1), r: 13, class: 'halo' }, svg)
    G.el('circle', { cx: pm[0].toFixed(1), cy: pm[1].toFixed(1), r: 7, class: et.ok ? 'm-ok' : 'm-ko' }, svg)
    var droite = pm[0] > R.L - 40, haut = pm[1] < 30
    var tm = G.el('text', { x: (pm[0] + (droite ? -11 : 11)).toFixed(1), y: (pm[1] + (haut ? 20 : -10)).toFixed(1), 'text-anchor': droite ? 'end' : 'start', class: 'et ' + (et.ok ? 'et-good' : 'et-bad') }, svg)
    tm.textContent = 'M'
  }
}

if (!customElements.get('trace-lieu-widget')) customElements.define('trace-lieu-widget', TraceLieuWidget)
