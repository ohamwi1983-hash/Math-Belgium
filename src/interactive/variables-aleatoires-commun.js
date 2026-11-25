/* ================================================================
 * Outils partagés par les ateliers du chapitre « Variables aléatoires »
 * (6e, ch. 8) : loi normale (densité, Φ en double précision, table de Φ
 * à 4 décimales, inverse), loi binomiale, écritures décimales à la belge
 * (virgule, « − ») et curseurs avec boutons − / +.
 * ================================================================ */
import { tex } from './katex-shadow.js'

/** Φ(z) = P(Z ≤ z), Z ∼ 𝒩(0 ; 1) — série de Marsaglia (précision ≈ 1e−15 pour |z| ≤ 8). */
export function phi(z) {
  if (z <= -8) return 0
  if (z >= 8) return 1
  var s = z, t = 0, b = z, q = z * z, i = 1
  while (s !== t) { t = s; i += 2; b *= q / i; s = t + b }
  return 0.5 + s * Math.exp(-0.5 * q - 0.9189385332046727)
}

/** Densité de 𝒩(μ ; σ) (σ = écart-type). */
export function densite(x, mu, sigma) {
  var u = (x - mu) / sigma
  return Math.exp(-0.5 * u * u) / (sigma * Math.sqrt(2 * Math.PI))
}

/** Arrondi à d décimales, demi vers le haut (sans les erreurs de 1,005 × 100). */
export function arrondi(x, d) {
  var f = Math.pow(10, d)
  return Math.round(x * f + (x >= 0 ? 1e-9 : -1e-9)) / f
}

/** Valeur lue dans la table de Φ (z ≥ 0 au centième, 4 décimales). */
export function phiTable(z) {
  return arrondi(phi(arrondi(Math.abs(z), 2)), 4)
}

/** Φ(z) par la table, z de signe quelconque (Φ(−z) = 1 − Φ(z)). */
export function phiTableSigne(z) {
  var v = phiTable(z)
  return z < 0 ? arrondi(1 - v, 4) : v
}

/** Lois binomiales : P(X = k) pour k = 0…n (logarithmes : n jusqu'à quelques milliers). */
var LNF = [0]
function lnFact(n) { while (LNF.length <= n) LNF.push(LNF[LNF.length - 1] + Math.log(LNF.length)); return LNF[n] }
export function loiBinomiale(n, p) {
  var r = []
  for (var k = 0; k <= n; k++) {
    if (p <= 0) r.push(k === 0 ? 1 : 0)
    else if (p >= 1) r.push(k === n ? 1 : 0)
    else r.push(Math.exp(lnFact(n) - lnFact(k) - lnFact(n - k) + k * Math.log(p) + (n - k) * Math.log(1 - p)))
  }
  return r
}

/** Nombre → LaTeX : d décimales FIXES (zéros gardés), virgule, signe moins. */
export function texFixe(x, d) {
  var v = arrondi(x, d)
  if (v === 0) v = 0
  return v.toFixed(d).replace('.', '{,}')
}
/** Nombre → texte courant : d décimales fixes, virgule, « − ». */
export function txtFixe(x, d) {
  var v = arrondi(x, d)
  if (v === 0) v = 0
  return v.toFixed(d).replace('.', ',').replace('-', '−')
}
/** Nombre → LaTeX, au plus d décimales (zéros finaux retirés). */
export function texCourt(x, d) {
  var s = txtFixe(x, d === undefined ? 2 : d)
  if (s.indexOf(',') >= 0) s = s.replace(/0+$/, '').replace(/,$/, '')
  return s.replace('−', '-').replace(',', '{,}')
}
/** Nombre → texte courant, au plus d décimales. */
export function txtCourt(x, d) {
  var s = txtFixe(x, d === undefined ? 2 : d)
  if (s.indexOf(',') >= 0) s = s.replace(/0+$/, '').replace(/,$/, '')
  return s
}
/** Valeur exacte à 4 décimales près ? (sinon on écrit « ≈ »). */
export function estExact(x, d) {
  var f = Math.pow(10, d === undefined ? 4 : d)
  return Math.abs(Math.round(x * f) - x * f) < 1e-7
}

/** Pas de graduation « joli » (1, 2, 5 × 10ⁿ) pour au plus `nb` intervalles sur une étendue. */
export function pasJoli(etendue, nb) {
  var brut = etendue / nb, p = Math.pow(10, Math.floor(Math.log10(brut)))
  var m = brut / p
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p
}

/** HTML d'un curseur avec boutons − / + (étiquette KaTeX mise à jour par `majCurseur`). */
export function curseurHTML(id, aria, min, max, pas) {
  return '<div class="curseur"><span class="nom" id="nom-' + id + '"></span>' +
    '<button class="btn" id="' + id + '-moins" aria-label="' + aria + ' : diminuer">−</button>' +
    '<input type="range" id="' + id + '" min="' + min + '" max="' + max + '" step="' + pas + '" aria-label="' + aria + '">' +
    '<button class="btn" id="' + id + '-plus" aria-label="' + aria + ' : augmenter">+</button></div>'
}

/** Branche un curseur : `regler(v)` reçoit la valeur voulue (curseur, ou valeur courante ± pas). */
export function lierCurseur(sh, id, get, regler, pas) {
  var input = sh.getElementById(id)
  input.addEventListener('input', function () { regler(parseFloat(input.value)) })
  sh.getElementById(id + '-moins').addEventListener('click', function () { regler(arrondi(get() - pas, 6)) })
  sh.getElementById(id + '-plus').addEventListener('click', function () { regler(arrondi(get() + pas, 6)) })
}

/** Met à jour valeur, étiquette (LaTeX) et boutons d'un curseur. */
export function majCurseur(sh, id, v, etiquetteTex) {
  var input = sh.getElementById(id)
  input.value = String(v)
  sh.getElementById('nom-' + id).innerHTML = tex(etiquetteTex)
  sh.getElementById(id + '-moins').disabled = v <= parseFloat(input.min) + 1e-9
  sh.getElementById(id + '-plus').disabled = v >= parseFloat(input.max) - 1e-9
}

/** Borne v dans [min ; max]. */
export function borner(v, min, max) { return Math.max(min, Math.min(max, v)) }
