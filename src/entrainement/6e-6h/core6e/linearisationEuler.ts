/**
 * Couche core (6e) — `6gen93` « Linéariser avec les formules d'Euler » (chapitre 5 de 6e, « Nombres
 * complexes », section `formulemoivre`, sous-partie « Le chemin inverse : linéariser cosⁿx »).
 *
 * Une expression f(x) = cosᵖx · sinᑫx (n = p + q ≤ 4) se linéarise en quatre temps :
 * (écrit ici pour la pulsation a = 1 ; pour cosᵖ(ax)·sinᑫ(ax), chaque x devient ax et les fréquences
 * k sont multipliées par a)
 * 1. Euler : f(x) = K · (e^{ix} + e^{−ix})ᵖ (e^{ix} − e^{−ix})ᑫ, avec K = 1 / (2ᵖ (2i)ᑫ) ;
 * 2. binôme : le produit P = Σ c_k e^{ikx} (k = n, n − 2, …, −n), coefficients ENTIERS ;
 * 3. regroupement : c_k (e^{ikx} + e^{−ikx}) = 2c_k cos(kx) quand q est pair (P symétrique),
 *    c_k (e^{ikx} − e^{−ikx}) = 2i c_k sin(kx) quand q est impair (P antisymétrique) ;
 * 4. f(x) = K · P : combinaison à coefficients RATIONNELS de cos(kx) (q pair) ou sin(kx) (q impair).
 *
 * SOURCE UNIQUE de tous les nombres du générateur (écran, vérification, feuilles) : fractions
 * exactes, valeurs remarquables des sinus/cosinus aux bornes, primitive et intégrale exactes.
 */

// ============================================================================
// Fractions exactes.
// ============================================================================

export interface Fraction {
  num: number;
  den: number;
}

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) [a, b] = [b, a % b];
  return a || 1;
}

export function fr(num: number, den = 1): Fraction {
  if (den === 0) throw new Error("fraction de dénominateur nul");
  const s = den < 0 ? -1 : 1;
  const g = pgcd(num, den);
  const n = (s * num) / g;
  return { num: n === 0 ? 0 : n, den: (s * den) / g };
}

export const ZERO: Fraction = { num: 0, den: 1 };

export function plus(a: Fraction, b: Fraction): Fraction {
  return fr(a.num * b.den + b.num * a.den, a.den * b.den);
}

export function moins(a: Fraction, b: Fraction): Fraction {
  return fr(a.num * b.den - b.num * a.den, a.den * b.den);
}

export function fois(a: Fraction, b: Fraction): Fraction {
  return fr(a.num * b.num, a.den * b.den);
}

export function valeur(a: Fraction): number {
  return a.num / a.den;
}

export function estNulle(a: Fraction): boolean {
  return a.num === 0;
}

// ============================================================================
// Expressions et exercice.
// ============================================================================

export type IdExpressionLinearisation = "cos2" | "sin2" | "cos3" | "sin3" | "cos4" | "sin4" | "cos2sin" | "cossin2" | "cos2sin2";

export const EXPRESSIONS: Record<IdExpressionLinearisation, { p: number; q: number }> = {
  cos2: { p: 2, q: 0 },
  sin2: { p: 0, q: 2 },
  cos3: { p: 3, q: 0 },
  sin3: { p: 0, q: 3 },
  cos4: { p: 4, q: 0 },
  sin4: { p: 0, q: 4 },
  cos2sin: { p: 2, q: 1 },
  cossin2: { p: 1, q: 2 },
  cos2sin2: { p: 2, q: 2 },
};

export const EXPRESSIONS_PAR_DEGRE: Record<2 | 3 | 4, IdExpressionLinearisation[]> = {
  2: ["cos2", "sin2"],
  3: ["cos3", "sin3", "cos2sin", "cossin2"],
  4: ["cos4", "sin4", "cos2sin2"],
};

export type IdVarianteLinearisation = "degre2" | "degre3" | "degre4" | "application";

/** Borne d'intégration : multiple rationnel de π (`{num: 1, den: 3}` = π/3). */
export type BornePi = Fraction;

export interface ExerciceLinearisation {
  variante: IdVarianteLinearisation;
  expression: IdExpressionLinearisation;
  /** Pulsation a : l'expression porte sur ax (cos²(2x), sin³(3x)…) ; toujours 1 en application. */
  a: number;
  /** Variante `application` seulement : intervalle d'intégration [a ; b] (multiples de π). */
  intervalle: { a: BornePi; b: BornePi } | null;
}

export function puissances(e: ExerciceLinearisation): { p: number; q: number; n: number } {
  const { p, q } = EXPRESSIONS[e.expression];
  return { p, q, n: p + q };
}

/** q impair : la forme linéarisée est en sin(kx) ; q pair : en cos(kx) (et une constante si n est pair). */
export function enSinus(e: ExerciceLinearisation): boolean {
  return puissances(e).q % 2 === 1;
}

// ============================================================================
// Étape 1 — facteur K = 1 / (2ᵖ (2i)ᑫ), de la forme ±1/2ⁿ ou ±i/2ⁿ.
// ============================================================================

/** K = (re + im·i) / 2ⁿ avec (re, im) ∈ {(1,0), (0,−1), (−1,0), (0,1)} selon q mod 4. */
export function facteurK(e: ExerciceLinearisation): { re: Fraction; im: Fraction } {
  const { q, n } = puissances(e);
  const d = 2 ** n;
  switch (q % 4) {
    case 0:
      return { re: fr(1, d), im: ZERO };
    case 1:
      return { re: ZERO, im: fr(-1, d) };
    case 2:
      return { re: fr(-1, d), im: ZERO };
    default:
      return { re: ZERO, im: fr(1, d) };
  }
}

// ============================================================================
// Étape 2 — développement P = (u + 1/u)ᵖ (u − 1/u)ᑫ, u = e^{ix}.
// ============================================================================

/** Coefficients entiers de P, du plus grand exposant au plus petit, par pas de 2 ; `k` est la
 * fréquence RÉELLE (indice × a) : le terme est c·e^{ikx}. */
export function coefficientsProduit(e: ExerciceLinearisation): { k: number; c: number }[] {
  const { p, q, n } = puissances(e);
  // Polynôme en u indexé par exposant + n.
  let poly = new Map<number, number>([[0, 1]]);
  const multiplier = (signe: 1 | -1) => {
    const suivant = new Map<number, number>();
    for (const [k, c] of poly) {
      suivant.set(k + 1, (suivant.get(k + 1) ?? 0) + c);
      suivant.set(k - 1, (suivant.get(k - 1) ?? 0) + signe * c);
    }
    poly = suivant;
  };
  for (let j = 0; j < p; j++) multiplier(1);
  for (let j = 0; j < q; j++) multiplier(-1);
  const resultat: { k: number; c: number }[] = [];
  for (let j = n; j >= -n; j -= 2) resultat.push({ k: j * e.a, c: poly.get(j) ?? 0 });
  return resultat;
}

// ============================================================================
// Étape 3 — regroupement : P = c₀ + Σ_{k>0} 2c_k cos(kx)   (q pair)
//                         P = Σ_{k>0} 2i c_k sin(kx)       (q impair).
// ============================================================================

export interface TermeRegroupe {
  /** Fréquence k > 0 pour cos(kx)/sin(kx) (multiple de a), 0 pour le terme constant. */
  k: number;
  /** Coefficient entier (réel si q pair ; il multiplie i si q impair). */
  coef: number;
}

/** Termes du regroupement, k décroissant, terme constant en dernier quand n est pair. */
export function termesRegroupes(e: ExerciceLinearisation): TermeRegroupe[] {
  const { n } = puissances(e);
  const coefs = coefficientsProduit(e);
  const c = (k: number) => coefs.find((t) => t.k === k)?.c ?? 0;
  const termes: TermeRegroupe[] = [];
  for (let j = n; j >= 1; j -= 2) termes.push({ k: j * e.a, coef: 2 * c(j * e.a) });
  if (n % 2 === 0) termes.push({ k: 0, coef: c(0) });
  return termes;
}

// ============================================================================
// Étape 4 — forme linéarisée : f(x) = a₀ + Σ a_k cos(kx) (q pair) ou Σ b_k sin(kx) (q impair).
// ============================================================================

export interface TermeLineaire {
  /** 0 = constante. */
  k: number;
  /** Fonction du terme (`null` pour la constante). */
  fonction: "cos" | "sin" | null;
  coef: Fraction;
}

/** Termes de la forme linéarisée, k CROISSANT (constante d'abord), coefficients non nuls. */
export function formeLineaire(e: ExerciceLinearisation): TermeLineaire[] {
  const K = facteurK(e);
  const sinus = enSinus(e);
  const termes: TermeLineaire[] = [];
  for (const t of termesRegroupes(e)) {
    // q pair : K réel, coefficient réel ; q impair : K = ±i/2ⁿ, (im·i)(coef·i) = −im·coef.
    const coef = sinus ? fois(fr(-1), fois(K.im, fr(t.coef))) : fois(K.re, fr(t.coef));
    if (estNulle(coef)) continue;
    termes.push({ k: t.k, fonction: t.k === 0 ? null : sinus ? "sin" : "cos", coef });
  }
  return termes.sort((a, b) => a.k - b.k);
}

/** Valeur numérique de la forme linéarisée (sert aux contrôles du générateur). */
export function evaluerLineaire(termes: TermeLineaire[], x: number): number {
  return termes.reduce((s, t) => s + valeur(t.coef) * (t.fonction === "cos" ? Math.cos(t.k * x) : t.fonction === "sin" ? Math.sin(t.k * x) : 1), 0);
}

export function evaluerExpressionInitiale(e: ExerciceLinearisation, x: number): number {
  const { p, q } = puissances(e);
  return Math.cos(e.a * x) ** p * Math.sin(e.a * x) ** q;
}

// ============================================================================
// Variante « application » — primitive et intégrale exactes.
// ============================================================================

export interface TermePrimitive {
  /** 0 = terme a₀·x. */
  k: number;
  fonction: "cos" | "sin" | "x";
  coef: Fraction;
}

/** Primitive (constante nulle) : a₀x + Σ (a_k/k) sin(kx) − Σ (b_k/k) cos(kx). */
export function primitive(e: ExerciceLinearisation): TermePrimitive[] {
  return formeLineaire(e).map((t) => {
    if (t.fonction === null) return { k: 0, fonction: "x", coef: t.coef };
    if (t.fonction === "cos") return { k: t.k, fonction: "sin", coef: fois(t.coef, fr(1, t.k)) };
    return { k: t.k, fonction: "cos", coef: fois(t.coef, fr(-1, t.k)) };
  });
}

export function evaluerPrimitive(termes: TermePrimitive[], x: number): number {
  return termes.reduce((s, t) => s + valeur(t.coef) * (t.fonction === "x" ? x : t.fonction === "cos" ? Math.cos(t.k * x) : Math.sin(t.k * x)), 0);
}

/** Nombre exact de la forme pi·π + un + r2·√2 + r3·√3 (coefficients rationnels). */
export interface NombreExact {
  pi: Fraction;
  un: Fraction;
  r2: Fraction;
  r3: Fraction;
}

export const EXACT_NUL: NombreExact = { pi: ZERO, un: ZERO, r2: ZERO, r3: ZERO };

export function plusExact(a: NombreExact, b: NombreExact): NombreExact {
  return { pi: plus(a.pi, b.pi), un: plus(a.un, b.un), r2: plus(a.r2, b.r2), r3: plus(a.r3, b.r3) };
}

export function foisExact(a: NombreExact, c: Fraction): NombreExact {
  return { pi: fois(a.pi, c), un: fois(a.un, c), r2: fois(a.r2, c), r3: fois(a.r3, c) };
}

export function valeurExacte(a: NombreExact): number {
  return valeur(a.pi) * Math.PI + valeur(a.un) + valeur(a.r2) * Math.SQRT2 + valeur(a.r3) * Math.sqrt(3);
}

/** Sinus exact d'un angle en degrés multiple de 30° ou de 45°. */
export function sinusExact(degres: number): NombreExact {
  const d = ((degres % 360) + 360) % 360;
  const signe = d > 180 ? -1 : 1;
  const r = d > 180 ? d - 180 : d;
  const ref = r > 90 ? 180 - r : r;
  const base: Record<number, NombreExact> = {
    0: EXACT_NUL,
    30: { ...EXACT_NUL, un: fr(1, 2) },
    45: { ...EXACT_NUL, r2: fr(1, 2) },
    60: { ...EXACT_NUL, r3: fr(1, 2) },
    90: { ...EXACT_NUL, un: fr(1) },
  };
  const v = base[ref];
  if (!v) throw new Error(`sinusExact : angle non remarquable ${degres}°`);
  return foisExact(v, fr(signe));
}

export function cosinusExact(degres: number): NombreExact {
  return sinusExact(degres + 90);
}

/** Degrés de k·borne (borne en multiples de π). */
export function degresDe(k: number, borne: BornePi): number {
  return (180 * k * borne.num) / borne.den;
}

/** Valeur exacte de la primitive (constante nulle) en une borne. */
export function primitiveExacteEn(e: ExerciceLinearisation, borne: BornePi): NombreExact {
  let total = EXACT_NUL;
  for (const t of primitive(e)) {
    if (t.fonction === "x") total = plusExact(total, { ...EXACT_NUL, pi: fois(t.coef, borne) });
    else total = plusExact(total, foisExact(t.fonction === "sin" ? sinusExact(degresDe(t.k, borne)) : cosinusExact(degresDe(t.k, borne)), t.coef));
  }
  return total;
}

/** I = F(b) − F(a), exacte. */
export function integraleExacte(e: ExerciceLinearisation): NombreExact {
  if (!e.intervalle) throw new Error("integraleExacte : pas d'intervalle");
  return plusExact(primitiveExacteEn(e, e.intervalle.b), foisExact(primitiveExacteEn(e, e.intervalle.a), fr(-1)));
}

/** Vrai si l'intégrale se réduit au terme a₀(b − a) : tous les sinus/cosinus s'annulent entre les bornes. */
export function integraleReduiteAuTermeConstant(e: ExerciceLinearisation): boolean {
  const I = integraleExacte(e);
  return estNulle(I.un) && estNulle(I.r2) && estNulle(I.r3);
}
