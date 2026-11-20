/**
 * Couche core — `6gen157` « Étude d'une fonction cyclométrique » (6e ch. 1, § 4–5, processus 3
 * TRANSFÉRER ; lot G de l'audit, pendant de 6gen11 / 6gen19 des ch. 2 et 3). Valeurs EXACTES
 * (π, √), aucune calculatrice.
 *
 * Décomposition du raisonnement (un écran par étape) :
 * a. domaine (conditions de chaque morceau : arcsin/arccos sur [−1 ; 1], racine, dénominateur) ;
 * b. dérivée (formules du cours § 4, règle de la chaîne, du produit), sur le domaine de DÉRIVABILITÉ ;
 * c. zéros de f′ (dénominateur jamais nul, ou argument de signe ; « aucun » est une réponse) ;
 * d. variations (signe de f′ intervalle par intervalle — jamais « décroissante sur ℝ₀ ») ;
 * e. valeurs du tableau : extremums exacts, valeurs aux bornes, limites (asymptotes).
 *
 * Familles (variantes) :
 * - `arctan-droite` : f(x) = k·arctan x − x, k ∈ {2, 4, 4/3} — f′ = (k − 1 − x²)/(1 + x²), zéros ±c
 *   avec c ∈ {1, √3, √3/3}, minimum et maximum locaux opposés (f impaire), limites ∓∞ ;
 * - `x-arctan` : f(x) = x·arctan(x/k), k ∈ {1, 2, 3} — f′ = arctan(x/k) + kx/(k² + x²), seul zéro 0
 *   (les deux termes ont le signe de x), minimum 0, limites +∞ ;
 * - `arc-racine` : f(x) = arcsin x (ou arccos x) + k√(1 − x²), k ∈ {±2, ±√2} — domaine [−1 ; 1],
 *   f′ = (±1 − kx)/√(1 − x²) sur ]−1 ; 1[, un extremum intérieur exact et les valeurs aux bornes ;
 * - `arctan-inverse` : f(x) = arctan(k/x), k ∈ {1, 2, 3, −1, −2} — domaine ℝ₀, f′ = −k/(x² + k²),
 *   aucun zéro, monotone sur CHAQUE intervalle (pas sur ℝ₀), limites ±π/2 en 0 et 0 en ±∞.
 */

export type VarianteEtudeCyclo = "arctan-droite" | "x-arctan" | "arc-racine" | "arctan-inverse";

/** Une valeur exacte : nombre, écriture LaTeX, écriture texte (tableau de variation SVG). */
export interface ValeurExacte {
  v: number;
  l: string;
  t: string;
}

export const val = (v: number, l: string, t: string): ValeurExacte => ({ v, l, t });
export const PLUS_INF = val(Infinity, "+\\infty", "+∞");
export const MOINS_INF = val(-Infinity, "-\\infty", "−∞");

/** arctan-droite : f = k·arctan x − x. */
export interface DonneesArctanDroite {
  /** k = kn / kd. */
  kn: number;
  kd: number;
  c: ValeurExacte;
  /** arctan c, multiple de π (« \dfrac{\pi}{3} »). */
  arctanC: ValeurExacte;
  /** k·arctan c (« \dfrac{4\pi}{3} »). */
  kArctanC: ValeurExacte;
  /** Maximum local f(c). */
  fc: ValeurExacte;
  /** Minimum local f(−c) = −f(c). */
  fmc: ValeurExacte;
}

export const TABLE_ARCTAN_DROITE: DonneesArctanDroite[] = [
  { kn: 2, kd: 1, c: val(1, "1", "1"), arctanC: val(Math.PI / 4, "\\dfrac{\\pi}{4}", "π/4"), kArctanC: val(Math.PI / 2, "\\dfrac{\\pi}{2}", "π/2"), fc: val(Math.PI / 2 - 1, "\\dfrac{\\pi}{2}-1", "π/2 − 1"), fmc: val(1 - Math.PI / 2, "1-\\dfrac{\\pi}{2}", "1 − π/2") },
  { kn: 4, kd: 1, c: val(Math.sqrt(3), "\\sqrt{3}", "√3"), arctanC: val(Math.PI / 3, "\\dfrac{\\pi}{3}", "π/3"), kArctanC: val((4 * Math.PI) / 3, "\\dfrac{4\\pi}{3}", "4π/3"), fc: val((4 * Math.PI) / 3 - Math.sqrt(3), "\\dfrac{4\\pi}{3}-\\sqrt{3}", "4π/3 − √3"), fmc: val(Math.sqrt(3) - (4 * Math.PI) / 3, "\\sqrt{3}-\\dfrac{4\\pi}{3}", "√3 − 4π/3") },
  { kn: 4, kd: 3, c: val(Math.sqrt(3) / 3, "\\dfrac{\\sqrt{3}}{3}", "√3/3"), arctanC: val(Math.PI / 6, "\\dfrac{\\pi}{6}", "π/6"), kArctanC: val((2 * Math.PI) / 9, "\\dfrac{2\\pi}{9}", "2π/9"), fc: val((2 * Math.PI) / 9 - Math.sqrt(3) / 3, "\\dfrac{2\\pi}{9}-\\dfrac{\\sqrt{3}}{3}", "2π/9 − √3/3"), fmc: val(Math.sqrt(3) / 3 - (2 * Math.PI) / 9, "\\dfrac{\\sqrt{3}}{3}-\\dfrac{2\\pi}{9}", "√3/3 − 2π/9") },
];

/** arc-racine : f = arc(x) + k√(1 − x²), k = signe × (2 ou √2). */
export interface DonneesArcRacine {
  arc: "arcsin" | "arccos";
  signe: 1 | -1;
  racine2: boolean;
  /** Zéro de f′ : x₀ = 1/k (arcsin) ou −1/k (arccos). */
  x0: ValeurExacte;
  /** arc(x₀). */
  arcX0: ValeurExacte;
  /** √(1 − x₀²). */
  racX0: ValeurExacte;
  /** f(x₀) : maximum (k > 0) ou minimum (k < 0). */
  fx0: ValeurExacte;
}

const S3 = Math.sqrt(3);
const S2 = Math.SQRT2;

export const TABLE_ARC_RACINE: DonneesArcRacine[] = [
  { arc: "arcsin", signe: 1, racine2: false, x0: val(0.5, "\\dfrac{1}{2}", "1/2"), arcX0: val(Math.PI / 6, "\\dfrac{\\pi}{6}", "π/6"), racX0: val(S3 / 2, "\\dfrac{\\sqrt{3}}{2}", "√3/2"), fx0: val(Math.PI / 6 + S3, "\\dfrac{\\pi}{6}+\\sqrt{3}", "π/6 + √3") },
  { arc: "arcsin", signe: 1, racine2: true, x0: val(S2 / 2, "\\dfrac{\\sqrt{2}}{2}", "√2/2"), arcX0: val(Math.PI / 4, "\\dfrac{\\pi}{4}", "π/4"), racX0: val(S2 / 2, "\\dfrac{\\sqrt{2}}{2}", "√2/2"), fx0: val(Math.PI / 4 + 1, "\\dfrac{\\pi}{4}+1", "π/4 + 1") },
  { arc: "arcsin", signe: -1, racine2: false, x0: val(-0.5, "-\\dfrac{1}{2}", "−1/2"), arcX0: val(-Math.PI / 6, "-\\dfrac{\\pi}{6}", "−π/6"), racX0: val(S3 / 2, "\\dfrac{\\sqrt{3}}{2}", "√3/2"), fx0: val(-Math.PI / 6 - S3, "-\\dfrac{\\pi}{6}-\\sqrt{3}", "−π/6 − √3") },
  { arc: "arcsin", signe: -1, racine2: true, x0: val(-S2 / 2, "-\\dfrac{\\sqrt{2}}{2}", "−√2/2"), arcX0: val(-Math.PI / 4, "-\\dfrac{\\pi}{4}", "−π/4"), racX0: val(S2 / 2, "\\dfrac{\\sqrt{2}}{2}", "√2/2"), fx0: val(-Math.PI / 4 - 1, "-\\dfrac{\\pi}{4}-1", "−π/4 − 1") },
  { arc: "arccos", signe: 1, racine2: false, x0: val(-0.5, "-\\dfrac{1}{2}", "−1/2"), arcX0: val((2 * Math.PI) / 3, "\\dfrac{2\\pi}{3}", "2π/3"), racX0: val(S3 / 2, "\\dfrac{\\sqrt{3}}{2}", "√3/2"), fx0: val((2 * Math.PI) / 3 + S3, "\\dfrac{2\\pi}{3}+\\sqrt{3}", "2π/3 + √3") },
  { arc: "arccos", signe: 1, racine2: true, x0: val(-S2 / 2, "-\\dfrac{\\sqrt{2}}{2}", "−√2/2"), arcX0: val((3 * Math.PI) / 4, "\\dfrac{3\\pi}{4}", "3π/4"), racX0: val(S2 / 2, "\\dfrac{\\sqrt{2}}{2}", "√2/2"), fx0: val((3 * Math.PI) / 4 + 1, "\\dfrac{3\\pi}{4}+1", "3π/4 + 1") },
  { arc: "arccos", signe: -1, racine2: false, x0: val(0.5, "\\dfrac{1}{2}", "1/2"), arcX0: val(Math.PI / 3, "\\dfrac{\\pi}{3}", "π/3"), racX0: val(S3 / 2, "\\dfrac{\\sqrt{3}}{2}", "√3/2"), fx0: val(Math.PI / 3 - S3, "\\dfrac{\\pi}{3}-\\sqrt{3}", "π/3 − √3") },
  { arc: "arccos", signe: -1, racine2: true, x0: val(S2 / 2, "\\dfrac{\\sqrt{2}}{2}", "√2/2"), arcX0: val(Math.PI / 4, "\\dfrac{\\pi}{4}", "π/4"), racX0: val(S2 / 2, "\\dfrac{\\sqrt{2}}{2}", "√2/2"), fx0: val(Math.PI / 4 - 1, "\\dfrac{\\pi}{4}-1", "π/4 − 1") },
];

export type ExerciceEtudeCyclo =
  | { variante: "arctan-droite"; d: DonneesArctanDroite; ordre: number[]; cleCollecteur: string }
  | { variante: "x-arctan"; k: 1 | 2 | 3; ordre: number[]; cleCollecteur: string }
  | { variante: "arc-racine"; d: DonneesArcRacine; ordre: number[]; cleCollecteur: string }
  | { variante: "arctan-inverse"; k: number; ordre: number[]; cleCollecteur: string };

export type ExArctanDroite = Extract<ExerciceEtudeCyclo, { variante: "arctan-droite" }>;
export type ExXArctan = Extract<ExerciceEtudeCyclo, { variante: "x-arctan" }>;
export type ExArcRacine = Extract<ExerciceEtudeCyclo, { variante: "arc-racine" }>;
export type ExArctanInverse = Extract<ExerciceEtudeCyclo, { variante: "arctan-inverse" }>;

export const kArcRacine = (d: DonneesArcRacine): number => d.signe * (d.racine2 ? S2 : 2);

/** f(x), pour les contrôles et les tests (NaN hors domaine). */
export function f(e: ExerciceEtudeCyclo, x: number): number {
  switch (e.variante) {
    case "arctan-droite":
      return (e.d.kn / e.d.kd) * Math.atan(x) - x;
    case "x-arctan":
      return x * Math.atan(x / e.k);
    case "arc-racine": {
      if (Math.abs(x) > 1) return NaN;
      const a = e.d.arc === "arcsin" ? Math.asin(x) : Math.acos(x);
      return a + kArcRacine(e.d) * Math.sqrt(1 - x * x);
    }
    case "arctan-inverse":
      return x === 0 ? NaN : Math.atan(e.k / x);
  }
}

/** f′(x), forme simplifiée du corrigé. */
export function fPrime(e: ExerciceEtudeCyclo, x: number): number {
  switch (e.variante) {
    case "arctan-droite": {
      const k = e.d.kn / e.d.kd;
      return (k - 1 - x * x) / (1 + x * x);
    }
    case "x-arctan":
      return Math.atan(x / e.k) + (e.k * x) / (e.k * e.k + x * x);
    case "arc-racine": {
      const k = kArcRacine(e.d);
      return ((e.d.arc === "arcsin" ? 1 : -1) - k * x) / Math.sqrt(1 - x * x);
    }
    case "arctan-inverse":
      return -e.k / (x * x + e.k * e.k);
  }
}

/** Zéros de f′ (exacts). */
export function zerosDerivee(e: ExerciceEtudeCyclo): ValeurExacte[] {
  switch (e.variante) {
    case "arctan-droite":
      return [val(-e.d.c.v, `-${e.d.c.l}`, `−${e.d.c.t}`), e.d.c];
    case "x-arctan":
      return [val(0, "0", "0")];
    case "arc-racine":
      return [e.d.x0];
    case "arctan-inverse":
      return [];
  }
}
