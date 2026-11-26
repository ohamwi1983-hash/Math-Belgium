/* ================================================================
 * Outils partagés par les ateliers du chapitre 5e (6h) « Nombres réels
 * et suites » : écritures à la belge (virgule, « − », espace fine des
 * milliers, « 3,5 % », « 1 234,56 € »), exposants Unicode, notation
 * scientifique en LaTeX, droite graduée à fenêtre FIXE avec flèche,
 * styles communs. Les autres briques viennent des modules déjà
 * partagés : KaTeX (`katex-shadow.js`), curseurs − / +
 * (`variables-aleatoires-commun.js`), tracés (`lieux-geometriques-commun.js`),
 * repère à fenêtre fixe (`statistique-deux-variables-commun.js`).
 * ================================================================ */
import { el, texte, arr } from './statistique-deux-variables-commun.js'

var FINE = ' '
var INSEC = ' '

/** Chaîne décimale « 1234.5 » → partie entière groupée par trois (séparateur `sep`). */
function grouper(s, sep) {
  var neg = s.charAt(0) === '-'
  if (neg) s = s.slice(1)
  var p = s.split('.')
  var ent = p[0]
  if (ent.length > 3) ent = ent.replace(/\B(?=(\d{3})+$)/g, sep)
  return (neg ? '-' : '') + ent + (p.length > 1 ? '.' + p[1] : '')
}

/** Nombre en texte courant : au plus d décimales (zéros finaux retirés), virgule, « − », milliers. */
export function nb(x, d) {
  d = d === undefined ? 2 : d
  var v = arr(x, d)
  if (v === 0) v = 0
  var s = v.toFixed(d)
  if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '')
  return grouper(s, FINE).replace('.', ',').replace('-', '−')
}

/** Nombre en texte courant avec exactement d décimales (zéros gardés). */
export function nbFixe(x, d) {
  var v = arr(x, d)
  if (v === 0) v = 0
  return grouper(v.toFixed(d), FINE).replace('.', ',').replace('-', '−')
}

/** Nombre en LaTeX : au plus d décimales, « {,} », milliers « \, ». */
export function texNb(x, d) {
  d = d === undefined ? 2 : d
  var v = arr(x, d)
  if (v === 0) v = 0
  var s = v.toFixed(d)
  if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '')
  return grouper(s, '\\,').replace('.', '{,}')
}

/** Nombre en LaTeX avec exactement d décimales. */
export function texNbFixe(x, d) {
  var v = arr(x, d)
  if (v === 0) v = 0
  return grouper(v.toFixed(d), '\\,').replace('.', '{,}')
}

/** Montant en euros, au centime : « 10 340,04 € » (texte courant). */
export function euros(x) { return nbFixe(x, 2) + INSEC + '€' }
/** Montant en euros en LaTeX (sans le symbole). */
export function texEuros(x) { return texNbFixe(x, 2) }

/** Taux (0,035) → « 3,5 % » ; d décimales au plus sur le pourcentage. */
export function pct(t, d) { return nb(t * 100, d === undefined ? 2 : d) + INSEC + '%' }
/** Taux en LaTeX : « 3{,}5\,\% ». */
export function texPct(t, d) { return texNb(t * 100, d === undefined ? 2 : d) + '\\,\\%' }

var EXP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' }
/** Exposant en chiffres Unicode : 12 → « ¹² », −3 → « ⁻³ ». */
export function exposant(n) { return String(n).split('').map(function (c) { return EXP[c] || c }).join('') }
var IND = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉' }
/** Indice en chiffres Unicode : 12 → « ₁₂ ». */
export function indice(n) { return String(n).split('').map(function (c) { return IND[c] || c }).join('') }

/**
 * Notation scientifique en LaTeX : « -2{,}6\cdot 10^{26} » (d chiffres après la virgule de la mantisse).
 * Entre 10⁻³ et 10⁶ (en valeur absolue), on garde l'écriture décimale ordinaire (dDec décimales).
 */
export function texSci(x, d, dDec) {
  if (x === 0) return '0'
  var a = Math.abs(x)
  if (a >= 1e-3 && a < 1e6) return texNb(x, dDec === undefined ? 4 : dDec)
  var e = Math.floor(Math.log10(a)), m = x / Math.pow(10, e)
  if (Math.abs(arr(m, d)) >= 10) { e++; m = x / Math.pow(10, e) }
  return texNb(m, d) + '\\cdot 10^{' + e + '}'
}
/** Même chose en texte courant : « −2,6 · 10²⁶ ». */
export function txtSci(x, d, dDec) {
  if (x === 0) return '0'
  var a = Math.abs(x)
  if (a >= 1e-3 && a < 1e6) return nb(x, dDec === undefined ? 4 : dDec)
  var e = Math.floor(Math.log10(a)), m = x / Math.pow(10, e)
  if (Math.abs(arr(m, d)) >= 10) { e++; m = x / Math.pow(10, e) }
  return nb(m, d) + INSEC + '·' + INSEC + '10' + exposant(e)
}

/**
 * Droite graduée horizontale à fenêtre FIXE. o = { min, max, x0, x1 (px), y (px), pas (graduations),
 * etiq(v) (texte), etiqPas (graduations écrites, défaut = pas) }. Renvoie la conversion valeur → px.
 * Flèche au bout (marker « fleche-rs » défini ici).
 */
export function droiteGraduee(svg, o) {
  var defs = el('defs', {}, svg)
  var mk = el('marker', { id: 'fleche-rs', markerWidth: '8', markerHeight: '8', refX: '6', refY: '4', orient: 'auto' }, defs)
  el('path', { d: 'M0,0 L8,4 L0,8 Z', class: 'fleche-axe' }, mk)
  function px(v) { return o.x0 + (v - o.min) * (o.x1 - o.x0) / (o.max - o.min) }
  el('line', { x1: (o.x0 - 6).toFixed(1), y1: o.y, x2: (o.x1 + 14).toFixed(1), y2: o.y, class: 'axe', 'marker-end': 'url(#fleche-rs)' }, svg)
  var etiq = o.etiq || function (v) { return nb(v, 3) }
  var ep = o.etiqPas || o.pas
  for (var k = Math.ceil(o.min / o.pas - 1e-9); k * o.pas <= o.max + 1e-9; k++) {
    var v = arr(k * o.pas, 9), p = px(v)
    var ecrit = Math.abs(v / ep - Math.round(v / ep)) < 1e-6
    el('line', { x1: p.toFixed(1), y1: o.y - (ecrit ? 5 : 3), x2: p.toFixed(1), y2: o.y + (ecrit ? 5 : 3), class: 'tick' }, svg)
    if (ecrit && o.etiquettes !== false) texte(svg, p, o.y + 19, etiq(v), 'graduation')
  }
  return px
}

/**
 * Espaces insécables à la française dans tout le texte d'une racine (hors <style> et KaTeX) :
 * espace ordinaire avant « : ; ? ! » et à l'intérieur de « … » → U+00A0. À appeler à la fin de chaque rendu.
 */
export function insecables(racine) {
  var tw = document.createTreeWalker(racine, NodeFilter.SHOW_TEXT), n
  while ((n = tw.nextNode())) {
    var p = n.parentElement
    if (!p || p.closest('style,.katex')) continue
    var t = n.nodeValue
    if (!/ [:;?!»]|« /.test(t)) continue
    n.nodeValue = t.replace(/ ([:;?!»])/g, '\u00a0$1').replace(/« /g, '«\u00a0')
  }
}

/** Styles propres aux ateliers du chapitre (en plus de CSS_BASE, CSS_LIEUX, CSS_STAT). */
export var CSS_RS =
  '.tableau td.g,.tableau th.g{text-align:left;}' +
  '.tableau td.d{text-align:right;}' +
  '.tableau tr.actif td{background:var(--accent-soft,#f4e3d1);}' +
  '.chiffres-ok{color:var(--good,#2f7a4f);font-weight:700;}' +
  '.zone-ok{fill:var(--good,#2f7a4f);fill-opacity:0.16;}' +
  '.zone-ko{fill:var(--bad,#b23a3a);fill-opacity:0.12;}' +
  '.zone-attn{fill:var(--attn,#96650c);fill-opacity:0.14;}' +
  '.zone-sky{fill:var(--sky,#2f6fb0);fill-opacity:0.16;}' +
  '.zone-plan{fill:var(--plan,#5b4ea3);fill-opacity:0.16;}' +
  '.zone-acc{fill:var(--accent,#b65c1f);fill-opacity:0.18;}' +
  '.segment-solution{stroke:var(--good,#2f7a4f);stroke-width:6;stroke-linecap:butt;fill:none;}' +
  '.point-inclus{fill:var(--good,#2f7a4f);stroke:var(--good,#2f7a4f);stroke-width:2;}' +
  '.point-exclus{fill:var(--surface,#fff);stroke:var(--good,#2f7a4f);stroke-width:2.2;}' +
  '.grand{font-size:1.02rem;}' +
  '.centre{text-align:center;}' +
  '.defile-v{max-height:320px;overflow:auto;border:1px solid var(--line,#ccd8e0);border-radius:var(--radius,3px);}' +
  '.defile-v .tableau{margin:0;width:100%;}' +
  '.defile-v .tableau th{position:sticky;top:0;z-index:1;}'
