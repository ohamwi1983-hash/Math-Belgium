/* ================================================================
 * KaTeX dans un Shadow DOM — module partagé par les ateliers qui affichent
 * des formules (5e ch. 1 : composer-en-un-point, projections-domaine-image,
 * image-inter-domaine, commutent-affines).
 *
 * La feuille `katex.min.css` chargée par `main.tsx` ne traverse pas la
 * frontière d'un Shadow DOM : ses règles de classes (.katex, .mfrac, .sqrt…)
 * sont donc recopiées dans chaque racine (`styleKatex()`). Les @font-face,
 * eux, restent ceux du document (ignorés à l'intérieur d'un Shadow DOM par
 * Chromium, mais déjà déclarés globalement) : on les retire de la copie.
 * ================================================================ */
import katex from 'katex'
import { htmlKatexAccessible } from '../lib/katexAccessible'
import katexCss from 'katex/dist/katex.min.css?inline'

var CSS_SANS_POLICES = katexCss.replace(/@font-face\{[^}]*\}/g, '')

/** Un `<style>` à placer dans la racine d'ombre du widget. */
export function styleKatex() {
  var st = document.createElement('style')
  // nowrap : une formule ne se coupe jamais en son milieu (après un « + » ou un « ∘ ») ; les longues
  // chaînes passent par texEgalites, qui laisse la ligne se couper entre deux membres.
  st.textContent = CSS_SANS_POLICES + '.katex{font-size:1.06em;white-space:nowrap;}'
  return st
}

/** Formule KaTeX en ligne (HTML). Jamais d'exception : une formule fautive s'affiche en rouge. */
export function tex(source) {
  return htmlKatexAccessible(katex.renderToString(source, { throwOnError: false, output: 'html', strict: 'ignore' }), source)
}

/** Chaîne d'égalités a = b = c… : un morceau KaTeX par membre, pour que la ligne puisse se
 * couper entre deux « = » sur téléphone (une formule KaTeX ne se coupe jamais à l'intérieur). */
export function texEgalites(membres, rel) {
  var r = rel || '='
  return membres.map(function (m, i) {
    return tex(i === 0 || /^(\\approx|\\ne|<|>|\\le|\\ge)/.test(m) ? m : r + m)
  }).join(' ')
}

/** Nombre décimal pour KaTeX : virgule (« {,} ») et signe moins. */
export function texNombre(n, dec) {
  var d = dec === undefined ? 2 : dec
  if (Math.abs(n) < 0.5 * Math.pow(10, -d)) n = 0
  var s = n.toFixed(d)
  if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '')
  return s.replace('.', '{,}')
}

/** Styles communs aux ateliers : boutons (cibles ≥ 44 px), curseurs, panneaux, figure SVG. */
export var CSS_BASE =
  ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#182430);}' +
  '*{box-sizing:border-box;}' +
  '.rangee{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;align-items:center;margin:0 0 10px;}' +
  '.etiquette{font-size:0.82rem;color:var(--ink-soft,#51626f);font-weight:600;}' +
  '.btn{min-height:44px;min-width:44px;padding:6px 12px;font:inherit;font-size:0.92rem;font-weight:600;line-height:1.2;' +
  'color:var(--ink,#182430);background:var(--surface,#fff);border:1px solid var(--line,#ccd8e0);border-radius:var(--radius,3px);cursor:pointer;' +
  'touch-action:manipulation;}' +
  '.btn:hover{border-color:var(--accent,#b65c1f);}' +
  '.btn[aria-pressed="true"]{background:var(--accent-soft,#f4e3d1);border-color:var(--accent,#b65c1f);color:var(--accent-ink,#7a3c11);}' +
  '.btn:focus-visible,input[type="range"]:focus-visible{outline:2px solid var(--accent,#b65c1f);outline-offset:2px;}' +
  '.btn:disabled{opacity:0.45;cursor:default;}' +
  '.curseur{display:flex;align-items:center;gap:8px;margin:0 0 8px;}' +
  '.curseur .nom{min-width:64px;text-align:right;font-variant-numeric:tabular-nums;}' +
  'input[type="range"]{flex:1 1 auto;min-width:0;height:44px;margin:0;accent-color:var(--accent,#b65c1f);cursor:pointer;}' +
  '.panneau{border:1px solid var(--line,#ccd8e0);border-radius:var(--radius,3px);background:var(--surface,#fff);padding:10px 12px;' +
  'font-size:0.93rem;line-height:1.55;margin:0 0 10px;overflow-wrap:break-word;text-align:left;}' +
  '.panneau p{margin:0 0 6px;}.panneau p:last-child{margin-bottom:0;}' +
  '.formule,.panneau .formule{text-align:center;margin:0 0 8px;line-height:1.9;}' +
  '.ok{color:var(--good,#2f7a4f);font-weight:700;}' +
  '.ko{color:var(--bad,#b23a3a);font-weight:700;}' +
  '.figure{display:flex;justify-content:center;margin:0 0 10px;}' +
  '.figure svg{width:100%;max-width:420px;height:auto;display:block;background:var(--surface-2,#f7f9fb);border-radius:var(--radius,3px);}' +
  '.axe{stroke:var(--ink-soft,#51626f);stroke-width:1.3;}' +
  '.fleche{fill:var(--ink-soft,#51626f);}' +
  '.grille{stroke:var(--line,#ccd8e0);stroke-width:1;}' +
  '.tick{stroke:var(--ink-soft,#51626f);stroke-width:1.2;}' +
  '.tick-label{font-size:10.5px;fill:var(--ink-soft,#51626f);font-family:var(--sans,sans-serif);font-variant-numeric:tabular-nums;' +
  'paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3px;}' +
  '.nom-axe{font-size:12px;font-style:italic;font-family:var(--serif,serif);fill:var(--ink-soft,#51626f);}'

/** Élément SVG avec attributs. */
export function svgEl(tag, attrs) {
  var el = document.createElementNS('http://www.w3.org/2000/svg', tag)
  for (var k in attrs) el.setAttribute(k, attrs[k])
  return el
}

/** `<defs>` avec la flèche de bout d'axe du site (`marker-end: url(#fleche)`). */
export function defsFleche(svg) {
  var defs = svgEl('defs', {})
  var m = svgEl('marker', { id: 'fleche', markerWidth: '8', markerHeight: '8', refX: '6', refY: '4', orient: 'auto' })
  m.appendChild(svgEl('path', { d: 'M0,0 L8,4 L0,8 Z', class: 'fleche' }))
  defs.appendChild(m)
  svg.appendChild(defs)
}

/** Intervalle en LaTeX, crochets à la belge : [a ; b], ]a ; b[, ]−∞ ; b]… (bornes déjà en LaTeX). */
export function texIntervalle(a, b, aOuvert, bOuvert) {
  var g = a === '-\\infty' || aOuvert ? '\\mathopen{]}' : '['
  var d = b === '+\\infty' || bOuvert ? '\\mathclose{[}' : ']'
  return g + a + '\\,;\\,' + b + d
}

/** Nombre décimal en texte courant : virgule et « − ». */
export function txtNombre(n, dec) {
  var d = dec === undefined ? 2 : dec
  if (Math.abs(n) < 0.5 * Math.pow(10, -d)) n = 0
  var s = n.toFixed(d)
  if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '')
  return s.replace('.', ',').replace('-', '−')
}
