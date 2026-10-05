import type { EnsembleReelGuide, MorceauEnsemble, Polynome } from "../../core5e/domaineDefinition.types";
import type { FonctionComposable } from "../../core5e/composerFonctions.types";
import { evaluerPolynome } from "../domaineDefinition/polynome";
import { intersecterEnsembles, normaliserEnMorceaux, unionEnsembles } from "./intervalles";

/**
 * Solveur symbolique général pour 5gen3 — calcule `{x : g(x) ◇ seuil}` puis, plus haut niveau,
 * `{x : g(x) ∈ dom(f)}`, pour les 4 familles composables (toutes construites avec des polynômes
 * de degré ≤1 — voir `familles.ts`). Toute comparaison intermédiaire (élévation au carré pour
 * éliminer une racine, mise au même dénominateur pour une fraction) se ramène à un polynôme de
 * degré ≤2, résolu UNIFORMÉMENT par `resoudrePolynomeComparateur` (racines réelles + test de signe
 * par échantillonnage entre les racines) — jamais une dérivation analytique séparée par cas, pour
 * limiter le risque d'erreur de signe. Cross-vérifié par échantillonnage (voir `solveur.test.ts`),
 * jamais par la même logique que le code testé.
 */

export type Comparateur = "eq" | "ne" | "ge" | "gt" | "le" | "lt";

function degreeReel(coeffs: Polynome, epsilon = 1e-9): number {
  let d = coeffs.length - 1;
  while (d > 0 && Math.abs(coeffs[d]) < epsilon) d--;
  return d;
}

function soustrairePoly(p: Polynome, q: Polynome): Polynome {
  const n = Math.max(p.length, q.length);
  return Array.from({ length: n }, (_, i) => (p[i] ?? 0) - (q[i] ?? 0));
}

function multiplierScalairePoly(k: number, p: Polynome): Polynome {
  return p.map((c) => k * c);
}

function multiplierPoly(p: Polynome, q: Polynome): Polynome {
  const resultat = Array(p.length + q.length - 1).fill(0);
  for (let i = 0; i < p.length; i++) for (let j = 0; j < q.length; j++) resultat[i + j] += p[i] * q[j];
  return resultat;
}

/** Racines réelles d'un polynôme de degré ≤2 (coeffs ascendants), triées croissant, sans doublon. */
export function racinesPolynome(coeffs: Polynome): number[] {
  const deg = degreeReel(coeffs);
  if (deg <= 0) return [];
  if (deg === 1) return [-coeffs[0] / coeffs[1]];
  const [c, b, a] = coeffs;
  const disc = b * b - 4 * a * c;
  if (disc < -1e-9) return [];
  if (disc < 1e-9) return [-b / (2 * a)];
  const sq = Math.sqrt(disc);
  return [(-b - sq) / (2 * a), (-b + sq) / (2 * a)].sort((x, y) => x - y);
}

function pointUnique(r: number): EnsembleReelGuide {
  return { forme: "intervalles", points: [], morceaux: [{ inf: r, sup: r, infInclus: true, supInclus: true }] };
}

function ensembleVide(): EnsembleReelGuide {
  return { forme: "intervalles", points: [], morceaux: [] };
}

function ensembleReel(): EnsembleReelGuide {
  return { forme: "reel", points: [], morceaux: [] };
}

function choisirMilieu(inf: number, sup: number): number {
  if (Number.isFinite(inf) && Number.isFinite(sup)) return (inf + sup) / 2;
  if (Number.isFinite(inf)) return inf + 1;
  if (Number.isFinite(sup)) return sup - 1;
  return 0;
}

/** Résout `P(x) ◇ 0` pour un polynôme de degré ≤2 (coeffs ascendants), `◇` ∈ Comparateur — via ses
 * racines réelles + un test de signe par échantillonnage au milieu de chaque intervalle délimité
 * par elles (jamais une dérivation analytique du signe, qui doublerait le risque d'erreur avec
 * `racinesPolynome`). */
export function resoudrePolynomeComparateur(coeffs: Polynome, comparateur: Comparateur): EnsembleReelGuide {
  // Polynôme identiquement nul (tous les coefficients ~0, y compris le terme constant — jamais
  // seulement "de degré 0", qui peut légitimement rester une constante NON nulle) : dégénérescence
  // rare mais réelle (ex. deux polynômes intermédiaires strictement proportionnels dont la
  // soustraction s'annule totalement) — "0" satisfait =/≥/≤ PARTOUT, jamais ≠/>/<.
  if (coeffs.every((c) => Math.abs(c) < 1e-9)) {
    return comparateur === "eq" || comparateur === "ge" || comparateur === "le" ? ensembleReel() : ensembleVide();
  }
  const racines = racinesPolynome(coeffs);
  if (comparateur === "eq") {
    return racines.reduce((acc, r) => unionEnsembles(acc, pointUnique(r)), ensembleVide());
  }
  if (comparateur === "ne") {
    if (racines.length === 0) return ensembleReel();
    return { forme: "prive_points", points: racines, morceaux: [] };
  }
  const inclus = comparateur === "ge" || comparateur === "le";
  const veutPositif = comparateur === "ge" || comparateur === "gt";
  const bornes = [-Infinity, ...racines, Infinity];
  let resultat = ensembleVide();
  for (let i = 0; i < bornes.length - 1; i++) {
    const inf = bornes[i];
    const sup = bornes[i + 1];
    const valeur = evaluerPolynome(coeffs, choisirMilieu(inf, sup));
    const satisfait = veutPositif ? valeur > 1e-9 : valeur < -1e-9;
    if (satisfait) {
      resultat = unionEnsembles(resultat, {
        forme: "intervalles",
        points: [],
        morceaux: [{ inf: Number.isFinite(inf) ? inf : null, sup: Number.isFinite(sup) ? sup : null, infInclus: false, supInclus: false }],
      });
    }
  }
  if (inclus) {
    resultat = racines.reduce((acc, r) => unionEnsembles(acc, pointUnique(r)), resultat);
  }
  return resultat;
}

function comparateurOppose(c: "ge" | "gt" | "le" | "lt"): "ge" | "gt" | "le" | "lt" {
  return { ge: "le", gt: "lt", le: "ge", lt: "gt" }[c] as "ge" | "gt" | "le" | "lt";
}

/** Résout `sqrt(U(x)) ≥ W(x)` (ou `>` si `strict`), U/W polynômes quelconques de degré ≤2 (U
 * supposé ≥0 sur le domaine appelant, jamais vérifié ici) — `(w<0)` est TOUJOURS vrai (sqrt≥0>w),
 * sinon `u ◇ w²`. */
function resoudreSqrtGE(u: Polynome, w: Polynome, strict: boolean): EnsembleReelGuide {
  const wNegatif = resoudrePolynomeComparateur(w, "lt");
  const wPositifOuNul = resoudrePolynomeComparateur(w, "ge");
  const uVsWCarre = resoudrePolynomeComparateur(soustrairePoly(u, multiplierPoly(w, w)), strict ? "gt" : "ge");
  return unionEnsembles(wNegatif, intersecterEnsembles(wPositifOuNul, uVsWCarre));
}

/** Résout `sqrt(U(x)) ≤ W(x)` (ou `<` si `strict`) — impossible si `w<0` (resp. `w≤0` en strict),
 * sinon `u ◇ w²`. */
function resoudreSqrtLE(u: Polynome, w: Polynome, strict: boolean): EnsembleReelGuide {
  const wValide = resoudrePolynomeComparateur(w, strict ? "gt" : "ge");
  const uVsWCarre = resoudrePolynomeComparateur(soustrairePoly(multiplierPoly(w, w), u), strict ? "gt" : "ge");
  return intersecterEnsembles(wValide, uVsWCarre);
}

/**
 * Résout `g(x) ◇ seuil` (seuil TOUJOURS une constante — c'est la seule forme de condition qui
 * apparaît en pratique, voir `xTelQueGDansDomF` ci-dessous) pour les 4 familles composables.
 * Ne restreint JAMAIS au domaine propre de `g` (ex. `mx+p≠0`) — l'appelant intersecte toujours le
 * résultat avec `g.domaine` séparément, ce qui filtre automatiquement toute racine parasite
 * introduite par une mise au même dénominateur ou une élévation au carré.
 */
export function resoudreConditionSeuil(g: FonctionComposable, comparateur: Comparateur, seuil: number): EnsembleReelGuide {
  if (g.type === "rationnelle") {
    const D = g.denominateur;
    const N = g.numerateur;
    // N(x)/D(x) ◇ seuil  ⟺  N·D - seuil·D²  ◇  0  (multiplié par D² ≥ 0, direction préservée)
    const p = soustrairePoly(multiplierPoly(N, D), multiplierScalairePoly(seuil, multiplierPoly(D, D)));
    return resoudrePolynomeComparateur(p, comparateur);
  }
  if (g.type === "irrationnelleSimple") {
    const U = g.radicande;
    if (comparateur === "eq") {
      if (seuil < 0) return ensembleVide();
      return resoudrePolynomeComparateur(soustrairePoly(U, [seuil * seuil]), "eq");
    }
    if (comparateur === "ne") {
      if (seuil < 0) return ensembleReel();
      return resoudrePolynomeComparateur(soustrairePoly(U, [seuil * seuil]), "ne");
    }
    if (comparateur === "ge" || comparateur === "gt") {
      const strict = comparateur === "gt";
      if (strict ? seuil < 0 : seuil <= 0) return ensembleReel();
      return resoudrePolynomeComparateur(soustrairePoly(U, [seuil * seuil]), comparateur);
    }
    // le / lt
    const strict = comparateur === "lt";
    if (strict ? seuil <= 0 : seuil < 0) return ensembleVide();
    return resoudrePolynomeComparateur(soustrairePoly(U, [seuil * seuil]), comparateur);
  }
  if (g.type === "racineSurFraction") {
    const U = g.radicande;
    const V = g.denominateur;
    if (comparateur === "eq" || comparateur === "ne") {
      const p = soustrairePoly(U, multiplierScalairePoly(seuil * seuil, multiplierPoly(V, V)));
      const candidats = racinesPolynome(p).filter((r) => seuil * evaluerPolynome(V, r) >= -1e-9);
      if (comparateur === "eq") return candidats.reduce((acc, r) => unionEnsembles(acc, pointUnique(r)), ensembleVide());
      return candidats.length === 0 ? ensembleReel() : { forme: "prive_points", points: candidats, morceaux: [] };
    }
    const strict = comparateur === "gt" || comparateur === "lt";
    const veutGE = comparateur === "ge" || comparateur === "gt";
    const W = multiplierScalairePoly(seuil, V);
    const regionVPos = resoudrePolynomeComparateur(V, "gt");
    const regionVNeg = resoudrePolynomeComparateur(V, "lt");
    const partVPos = intersecterEnsembles(regionVPos, veutGE ? resoudreSqrtGE(U, W, strict) : resoudreSqrtLE(U, W, strict));
    const partVNeg = intersecterEnsembles(regionVNeg, veutGE ? resoudreSqrtLE(U, W, strict) : resoudreSqrtGE(U, W, strict));
    return unionEnsembles(partVPos, partVNeg);
  }
  // fractionSousRacine : sqrt(N(x)/D(x)) ◇ seuil
  const N = g.numerateur;
  const D = g.denominateur;
  if (comparateur === "eq" || comparateur === "ne") {
    if (seuil < 0) return comparateur === "eq" ? ensembleVide() : ensembleReel();
    const p = seuil === 0 ? N : soustrairePoly(N, multiplierScalairePoly(seuil * seuil, D));
    return resoudrePolynomeComparateur(p, comparateur);
  }
  const strict = comparateur === "gt" || comparateur === "lt";
  const veutGE = comparateur === "ge" || comparateur === "gt";
  if (veutGE) {
    if (strict ? seuil < 0 : seuil <= 0) return ensembleReel();
    const p = seuil === 0 ? multiplierPoly(N, D) : multiplierPoly(soustrairePoly(N, multiplierScalairePoly(seuil * seuil, D)), D);
    return resoudrePolynomeComparateur(p, comparateur);
  }
  if (strict ? seuil <= 0 : seuil < 0) return ensembleVide();
  const p = seuil === 0 ? multiplierPoly(N, D) : multiplierPoly(soustrairePoly(N, multiplierScalairePoly(seuil * seuil, D)), D);
  // seuil===0 && comparateur "le" : Q(x) <= 0, combiné à Q(x) >= 0 (implicite dom(g)) => Q(x)=0
  if (seuil === 0 && comparateur === "le") return resoudrePolynomeComparateur(N, "eq");
  return resoudrePolynomeComparateur(p, comparateur);
}

/**
 * `{x : g(x) ∈ domF}` — décompose `domF` (le domaine de f, dans SA propre variable) en morceaux
 * canoniques via `normaliserEnMorceaux` (déjà valable pour les 3 formes, y compris `prive_points`,
 * vues comme une union d'intervalles ouverts) puis, pour chaque morceau `[inf,sup]`, combine les 2
 * conditions de seuil (`g(x) ◇ inf`, `g(x) ◇ sup`) et unionne sur l'ensemble des morceaux. Ne
 * restreint PAS au domaine de `g` lui-même — l'appelant (`composition.ts`) intersecte toujours avec
 * `g.domaine` séparément.
 */
export function xTelQueGDansDomF(g: FonctionComposable, domF: EnsembleReelGuide): EnsembleReelGuide {
  const morceaux = normaliserEnMorceaux(domF);
  return morceaux.reduce((acc: EnsembleReelGuide, m: MorceauEnsemble) => {
    let piece = ensembleReel();
    if (m.inf !== null) piece = intersecterEnsembles(piece, resoudreConditionSeuil(g, m.infInclus ? "ge" : "gt", m.inf));
    if (m.sup !== null) piece = intersecterEnsembles(piece, resoudreConditionSeuil(g, m.supInclus ? "le" : "lt", m.sup));
    return unionEnsembles(acc, piece);
  }, ensembleVide());
}

export const _internal = { comparateurOppose, soustrairePoly, multiplierPoly, multiplierScalairePoly, degreeReel };
