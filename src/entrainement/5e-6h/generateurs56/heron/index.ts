import { pgcd } from "../../../5e-4h/ui5e/nombresTrigo";

/**
 * `56gen20` — « Héron et encadrements successifs » (5e (6h), « Nombres réels et suites », étape 5
 * `approcher-densite`). Couche A : types et générateur (`Math.random()` seul, pour `?code=`).
 *
 * Héron (variantes `rectangle` et `unite`) : rectangle de départ p × q d'aire A (p < q, A non carré),
 * longueur a₁ = q ; aₙ₊₁ = ½(aₙ + A/aₙ), largeur A/aₙ ; A/aₙ ≤ √A ≤ aₙ. Écrans : deuxième rectangle,
 * encadrement par le troisième, premier rectangle dont l'écart aₙ − A/aₙ est < 10⁻ᵏ (menu Récurrence),
 * valeur approchée de √A à 10⁻ᵏ près. Le seuil k est choisi pour qu'aucun écart ne soit à moins d'un
 * facteur 2 de 10⁻ᵏ (réponse nette malgré les arrondis de l'affichage).
 *
 * Méthode des puissances (variante `puissances`) : c entier le plus proche de √P (P sans facteur carré,
 * non carré), base = √P − c ou c − √P, comprise entre 0 et 1/2 ; base² = u₁ − v₁√P, base⁴ = u₂ − v₂√P
 * (u, v entiers positifs) ; base⁴ ≈ 0 donne √P ≈ u₂/v₂ (fraction réduite), toujours par EXCÈS
 * (u₂/v₂ − √P = base⁴/v₂ > 0).
 */

export type VarianteHeron = "rectangle" | "unite" | "puissances";
export type IdVarianteHeron = VarianteHeron;

export interface ExerciceHeronRectangles {
  type: "heron";
  variante: "rectangle" | "unite";
  A: number;
  /** Rectangle de départ p × q (p < q) ; a₁ = q. */
  p: number;
  q: number;
  /** Précision demandée : 10⁻ᵏ. */
  k: number;
  /** Longueurs a₁, a₂, … a_nPrecision (indice 0 = a₁). */
  longueurs: number[];
  /** Premier numéro de rectangle n dont l'écart aₙ − A/aₙ est < 10⁻ᵏ. */
  nPrecision: number;
  cleCollecteur: string;
}

export interface ExercicePuissances {
  type: "puissances";
  variante: "puissances";
  P: number;
  c: number;
  /** `true` : base = √P − c (√P > c) ; `false` : base = c − √P. */
  racineDAbord: boolean;
  u1: number;
  v1: number;
  u2: number;
  v2: number;
  /** Fraction réduite u₂/v₂. */
  num: number;
  den: number;
  cleCollecteur: string;
}

export type ExerciceHeron = ExerciceHeronRectangles | ExercicePuissances;

function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)];
}
function entre(a: number, b: number): number {
  return a + Math.floor(Math.random() * (b - a + 1));
}
const estCarre = (n: number) => Number.isInteger(Math.sqrt(n));

export const longueurSuivante = (A: number, a: number) => (a + A / a) / 2;
export const largeurDe = (e: ExerciceHeronRectangles, n: number) => e.A / e.longueurs[n - 1];
export const longueurDe = (e: ExerciceHeronRectangles, n: number) => e.longueurs[n - 1];
export const ecartDe = (e: ExerciceHeronRectangles, n: number) => longueurDe(e, n) - largeurDe(e, n);

/** Longueurs a₁ … a_N (N assez grand : écart < 10⁻¹⁰ ou 12 rectangles). */
export function longueursHeron(A: number, q: number, nMax = 12): number[] {
  const out = [q];
  while (out.length < nMax) out.push(longueurSuivante(A, out[out.length - 1]));
  return out;
}

const SEUILS_K = [3, 4, 5, 6];

function construireHeron(variante: "rectangle" | "unite"): ExerciceHeronRectangles {
  for (;;) {
    let p: number;
    let q: number;
    if (variante === "rectangle") {
      p = entre(2, 6);
      q = entre(p + 3, 16);
    } else {
      p = 1;
      q = entre(5, 40);
    }
    const A = p * q;
    if (estCarre(A)) continue;
    const toutes = longueursHeron(A, q);
    const ecart = (n: number) => toutes[n - 1] - A / toutes[n - 1];
    const candidats: { k: number; n: number }[] = [];
    for (const k of SEUILS_K) {
      const eps = 10 ** -k;
      let n = 1;
      while (n <= toutes.length && ecart(n) >= eps) n++;
      if (n > toutes.length) continue;
      // Réponse nette : écart du rectangle trouvé ≤ ε/2, celui d'avant ≥ 2ε ; au moins 4 rectangles
      // (le 3e sert à l'encadrement de l'écran précédent), au plus 9 (table de la calculatrice).
      if (n < 4 || n > 9) continue;
      if (ecart(n) > eps / 2 || ecart(n - 1) < 2 * eps) continue;
      candidats.push({ k, n });
    }
    if (candidats.length === 0) continue;
    const { k, n } = parmi(candidats);
    return {
      type: "heron",
      variante,
      A,
      p,
      q,
      k,
      longueurs: toutes.slice(0, Math.max(n, 3)),
      nPrecision: n,
      cleCollecteur: `${variante}/k${k}/n${n}`,
    };
  }
}

/** Naturels sans facteur carré, non carrés, entre 2 et 23. */
const P_POSSIBLES = [2, 3, 5, 6, 7, 10, 11, 13, 14, 15, 17, 19, 21, 22, 23];

function construirePuissances(): ExercicePuissances {
  const P = parmi(P_POSSIBLES);
  const c = Math.round(Math.sqrt(P));
  const racineDAbord = Math.sqrt(P) > c;
  // (√P − c)² = (c − √P)² = (c² + P) − 2c√P ; (u − v√P)² = (u² + P v²) − 2uv√P.
  const u1 = c * c + P;
  const v1 = 2 * c;
  const u2 = u1 * u1 + P * v1 * v1;
  const v2 = 2 * u1 * v1;
  const g = pgcd(u2, v2);
  return { type: "puissances", variante: "puissances", P, c, racineDAbord, u1, v1, u2, v2, num: u2 / g, den: v2 / g, cleCollecteur: `puissances/P${P}` };
}

export const CATALOGUE_VARIANTES: { id: IdVarianteHeron; label: string }[] = [
  { id: "rectangle", label: "Héron : départ d'un rectangle aux côtés entiers p × q" },
  { id: "unite", label: "Héron : départ du rectangle A × 1" },
  { id: "puissances", label: "Méthode des puissances : √p approché par une fraction" },
];

export function construireAvecVarianteId(id: IdVarianteHeron): ExerciceHeron {
  return id === "puissances" ? construirePuissances() : construireHeron(id);
}

export function genererExerciceHeron(): ExerciceHeron {
  return construireAvecVarianteId(parmi(CATALOGUE_VARIANTES).id);
}

/** Écart de la fraction à √P (positif : la fraction est une valeur par excès). */
export const ecartFraction = (e: ExercicePuissances) => e.num / e.den - Math.sqrt(e.P);
