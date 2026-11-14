import { RELATIONS, analyser, avecCarres, degreEquation, equationSimplifiee, raisonEn, termesEn } from "../../core5e/troisTermes.types";
import type { ExerciceTroisTermes, IdRelation, IdVarianteTroisTermes, Poly } from "../../core5e/troisTermes.types";

export type { IdVarianteTroisTermes };

/**
 * Couche A (5e) — générateur de `5gen46` « Trois termes consécutifs ». N'utilise QUE
 * `Math.random()` : le `?code=` (`export/codeExercice.ts::avecGraine`) rejoue exactement le même
 * tirage, dans l'appli comme dans l'adaptateur de feuilles (`exportEvaluation.ts`).
 *
 * VERDICT (nombre de valeurs de x qui conviennent, géométrique) tiré AVANT la construction, issues
 * équilibrées (1/3 chacune) : la boucle de rejet ne travaille qu'à l'intérieur d'une issue, elle ne
 * biaise donc jamais leurs fréquences. Le degré de l'équation réduite (la `forme` du profil) est tiré
 * ensuite : 2 valeurs → second degré ; 0 ou 1 valeur → premier degré une fois sur trois.
 * - 2 valeurs : second degré, deux racines, aucun terme nul ;
 * - 1 valeur : second degré à racine double, ou second degré dont une racine annule deux termes
 *   (le piège à écarter) ; premier degré dont la racine convient ;
 * - 0 valeur : second degré à discriminant négatif ; premier degré dont la racine annule deux termes,
 *   ou dont les termes en x s'éliminent (« 0 = k », ex. x, x + 1, x + 2).
 * Arithmétique : toujours une solution (premier degré), expressions affines ou avec des x² qui
 * s'éliminent (moitié-moitié).
 *
 * Bornes (calcul sans calculatrice) : racines entières de −8 à 10, termes de valeur absolue ≤ 300,
 * coefficients de l'équation simplifiée ≤ 60, coefficients des expressions ≤ 9 (x², x) et ≤ 40.
 */

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)];
}

function nonNul(min: number, max: number): number {
  for (;;) {
    const v = entier(min, max);
    if (v !== 0) return v;
  }
}

function melanger<T>(t: readonly T[]): T[] {
  const r = [...t];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

function affine(pente: number, constante: number): Poly {
  return [constante + 0, pente + 0, 0];
}

/** Contrôles communs : expressions distinctes, au moins deux dépendent de x, coefficients bornés,
 * équation simplifiée bornée, racines entières et bornées, termes bornés, pas de suite constante. */
function acceptable(e: ExerciceTroisTermes): boolean {
  const [a, b, c] = e.termes;
  const cles = e.termes.map((p) => p.join(","));
  if (new Set(cles).size < 3) return false;
  if (e.termes.filter((p) => p[1] !== 0 || p[2] !== 0).length < 2) return false;
  if (e.termes.some((p) => Math.abs(p[2]) > 4 || Math.abs(p[1]) > 9 || Math.abs(p[0]) > 40)) return false;
  if (e.variante === "geometrique" && [a, b, c].some((p) => p[2] !== 0)) return false;
  const s = equationSimplifiee(e);
  if (s.some((k) => Math.abs(k) > 60)) return false;
  const an = analyser(e);
  for (const x of an.resolution.racines) {
    if (!Number.isInteger(x) || x < -8 || x > 10) return false;
    if (termesEn(e, x).some((t) => Math.abs(t) > 300)) return false;
  }
  for (const x of an.valables) {
    const r = raisonEn(e, x);
    // Pas de suite constante (raison 0 en arithmétique, 1 en géométrique).
    if (e.variante === "arithmetique" ? r.num === 0 : r.num === r.den) return false;
    if (r.den > 4 || Math.abs(r.num) > 12) return false;
  }
  return true;
}

function avecOrdre(variante: IdVarianteTroisTermes, termes: [Poly, Poly, Poly]): ExerciceTroisTermes {
  return { variante, termes, ordreRelations: melanger<IdRelation>(RELATIONS) };
}

// ============================================================================
// Arithmétique.
// ============================================================================

/** Coefficients de x² (a₂, b₂, c₂) avec 2b₂ = a₂ + c₂ : les x² s'éliminent dans 2b − a − c. */
const CARRES_ARITH: [number, number, number][] = [
  [1, 1, 1],
  [1, 2, 3],
  [3, 2, 1],
  [2, 1, 0],
  [0, 1, 2],
  [1, 0, -1],
  [-1, 0, 1],
  [2, 2, 2],
];

function construireArithmetique(): ExerciceTroisTermes {
  const carres = Math.random() < 0.5;
  for (;;) {
    const [a2, b2, c2] = carres ? parmi(CARRES_ARITH) : [0, 0, 0];
    const a1 = entier(-5, 8);
    const b1 = entier(-5, 8);
    const c1 = entier(-5, 8);
    if (2 * b1 - a1 - c1 === 0) continue;
    const r = nonNul(-6, 8);
    const a0 = entier(-15, 20);
    const b0 = entier(-15, 20);
    const a: Poly = [a0, a1, a2];
    const b: Poly = [b0, b1, b2];
    // c₀ fixé pour que 2b(r) = a(r) + c(r).
    const ar = a0 + a1 * r + a2 * r * r;
    const br = b0 + b1 * r + b2 * r * r;
    const c0 = 2 * br - ar - c1 * r - c2 * r * r;
    const c: Poly = [c0 + 0, c1, c2];
    const e = avecOrdre("arithmetique", [a, b, c]);
    if (!acceptable(e)) continue;
    if (avecCarres(e) !== carres || degreEquation(e) !== 1) continue;
    const an = analyser(e);
    if (an.valables.length !== 1 || an.valables[0] !== r) continue;
    return e;
  }
}

// ============================================================================
// Géométrique.
// ============================================================================

/** Raisons entières (q ≠ 0, 1). */
const Q_ENTIERS = [2, 3, -2, -3, -1, 4];

/** Pentes (a₁, b₁, c₁) avec b₁² = a₁·c₁ : les x² s'éliminent dans b² − a·c. */
const PENTES_PREMIER_DEGRE: [number, number, number][] = [
  [1, 1, 1],
  [1, -1, 1],
  [2, 2, 2],
  [1, 2, 4],
  [4, 2, 1],
  [1, -2, 4],
  [4, -2, 1],
  [3, 3, 3],
  [-1, 1, -1],
  [2, -2, 2],
  [1, 3, 9],
  [9, 3, 1],
];

/** Un terme non nul et la raison pour une racine valable : (t, t·q, t·q²) entiers. */
function suiteGeometrique(): [number, number, number] {
  if (Math.random() < 0.2) {
    // q = ±1/2 : t multiple de 4.
    const s = parmi([1, -1]);
    const t = 4 * nonNul(-5, 5);
    return [t, (t * s) / 2, t / 4];
  }
  const q = parmi(Q_ENTIERS);
  const t = nonNul(-6, 6);
  return [t, t * q, t * q * q];
}

/** Second degré, deux racines valables : a, b, c interpolent deux suites géométriques en r₁ et r₂.
 * Pour des pentes entières : s ≡ t et p ≡ q (mod d), d = r₂ − r₁. */
function deuxValables(): [Poly, Poly, Poly] {
  const r1 = entier(-6, 6);
  const d = entier(1, 4); // seconde racine r₂ = r₁ + d
  const q = parmi(Q_ENTIERS);
  const t = nonNul(-6, 6);
  const p = Math.random() < 0.3 ? q : q + d * nonNul(-1, 1);
  const s = t + d * entier(-3, 3);
  const valeurs1 = [t, t * q, t * q * q];
  const valeurs2 = [s, s * p, s * p * p];
  return [0, 1, 2].map((i) => {
    const pente = (valeurs2[i] - valeurs1[i]) / d;
    return affine(pente, valeurs1[i] - pente * r1);
  }) as [Poly, Poly, Poly];
}

/** Second degré, racine double r : c₁ = q(2b₁ − a₁q) annule la dérivée de b² − a·c en r. */
function racineDouble(): [Poly, Poly, Poly] {
  const r = entier(-6, 8);
  const q = parmi(Q_ENTIERS);
  const t = nonNul(-6, 6);
  const a1 = nonNul(-4, 5);
  const b1 = nonNul(-5, 6);
  const c1 = q * (2 * b1 - a1 * q);
  return [affine(a1, t - a1 * r), affine(b1, t * q - b1 * r), affine(c1, t * q * q - c1 * r)];
}

/** Deux termes consécutifs qui s'annulent en r₀ (racine à écarter), et une racine valable r₁ si
 * `avecValable` (second degré), sinon le premier degré (pentes b₁² = a₁·c₁). */
function racineEcartee(avecValable: boolean): [Poly, Poly, Poly] | null {
  const r0 = entier(-6, 8);
  const debut = Math.random() < 0.5; // a et b nuls en r₀ (sinon b et c)
  if (avecValable) {
    const r1 = r0 + nonNul(-5, 5);
    const k = r1 - r0;
    const alpha = nonNul(-3, 4);
    const beta = nonNul(-5, 5);
    // Facteur commun nul en r₀ : u = alpha(x − r₀), v = beta(x − r₀) ; le troisième terme w vaut
    // v(r₁)²/u(r₁) (ou u… selon le côté) en r₁.
    const wR1 = (beta * beta * k) / alpha;
    if (!Number.isInteger(wR1)) return null;
    const w1 = entier(-6, 7);
    if (beta * beta === alpha * w1) return null; // le second degré doit le rester
    const u = affine(alpha, -alpha * r0);
    const v = affine(beta, -beta * r0);
    const w = affine(w1, wR1 - w1 * r1);
    return debut ? [u, v, w] : [w, v, u];
  }
  const [a1, b1, c1] = parmi(PENTES_PREMIER_DEGRE);
  const autre = nonNul(-12, 12); // valeur non nulle du troisième terme en r₀
  if (debut) return [affine(a1, -a1 * r0), affine(b1, -b1 * r0), affine(c1, autre - c1 * r0)];
  return [affine(a1, autre - a1 * r0), affine(b1, -b1 * r0), affine(c1, -c1 * r0)];
}

/** Premier degré, racine valable r : pentes b₁² = a₁·c₁ et une suite géométrique en r. */
function premierDegreValable(): [Poly, Poly, Poly] {
  const [a1, b1, c1] = parmi(PENTES_PREMIER_DEGRE);
  const r = entier(-6, 8);
  const [ta, tb, tc] = suiteGeometrique();
  return [affine(a1, ta - a1 * r), affine(b1, tb - b1 * r), affine(c1, tc - c1 * r)];
}

/** Premier degré dont les termes en x s'éliminent aussi : « 0 = k », aucune solution. */
function contradiction(): [Poly, Poly, Poly] | null {
  const [a1, b1, c1] = parmi(PENTES_PREMIER_DEGRE);
  const a0 = entier(-10, 12);
  const b0 = entier(-10, 12);
  const c0 = (2 * b1 * b0 - a0 * c1) / a1;
  if (!Number.isInteger(c0) || b0 * b0 === a0 * c0) return null;
  return [affine(a1, a0), affine(b1, b0), affine(c1, c0)];
}

/** Second degré sans racine réelle (discriminant négatif). */
function deltaNegatif(): [Poly, Poly, Poly] {
  return [affine(entier(-4, 5), entier(-12, 15)), affine(entier(-5, 6), entier(-12, 15)), affine(entier(-5, 7), entier(-12, 15))];
}

export type VerdictTroisTermes = 0 | 1 | 2;

function construireGeometrique(): ExerciceTroisTermes {
  // Verdict tiré AVANT la construction (issues équilibrées), puis le degré, puis le sous-cas.
  const verdict = parmi([0, 1, 2] as const);
  const degre: 1 | 2 = verdict === 2 ? 2 : Math.random() < 1 / 3 ? 1 : 2;
  const sousCas = Math.random() < 0.5;
  for (;;) {
    let termes: [Poly, Poly, Poly] | null;
    if (verdict === 2) termes = deuxValables();
    else if (verdict === 1) termes = degre === 1 ? premierDegreValable() : sousCas ? racineDouble() : racineEcartee(true);
    else termes = degre === 1 ? (sousCas ? racineEcartee(false) : contradiction()) : deltaNegatif();
    if (!termes) continue;
    const e = avecOrdre("geometrique", termes);
    if (!acceptable(e) || degreEquation(e) !== degre) continue;
    const an = analyser(e);
    if (an.valables.length !== verdict) continue;
    // Le sous-cas visé est bien celui obtenu (sinon le tirage du sous-cas serait biaisé).
    const type = an.resolution.type;
    if (verdict === 1 && degre === 2 && (sousCas ? type !== "delta-nul" : an.ecartees.length !== 1)) continue;
    if (verdict === 0 && degre === 1 && (sousCas ? an.ecartees.length !== 1 : type !== "contradiction")) continue;
    if (verdict === 0 && degre === 2 && type !== "delta-negatif") continue;
    return e;
  }
}

// ============================================================================
// Catalogue.
// ============================================================================

export const CATALOGUE_VARIANTES: { id: IdVarianteTroisTermes; label: string }[] = [
  { id: "arithmetique", label: "Suite arithmétique : 2b = a + c" },
  { id: "geometrique", label: "Suite géométrique : b² = a·c (0, 1 ou 2 valeurs de x)" },
];

export function construireAvecVarianteId(id: IdVarianteTroisTermes): ExerciceTroisTermes {
  return id === "arithmetique" ? construireArithmetique() : construireGeometrique();
}

/** Tirage libre : les deux variantes à parts égales. */
export function genererExerciceTroisTermes(): ExerciceTroisTermes {
  return construireAvecVarianteId(parmi(CATALOGUE_VARIANTES).id);
}
