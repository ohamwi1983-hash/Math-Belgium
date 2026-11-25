import { comb } from "../ui6e/nombresCombinatoireLotH";

/**
 * Couche A — modèle de `6gen102` « Triangle de Pascal et propriétés de Cₙᵏ » (6e ch. 7, § 3,
 * Connaître). Relation de Pascal Cₙᵏ + Cₙᵏ⁺¹ = Cₙ₊₁ᵏ⁺¹, symétrie Cₙᵏ = Cₙⁿ⁻ᵏ, somme d'une ligne 2ⁿ,
 * nombre de parties d'un ensemble (2ⁿ, 2ⁿ − 1 sans la partie vide). Variante « identité » : le
 * verdict vrai / faux est tiré à 50 % AVANT l'identité.
 */

export type Variante102 = "ligne" | "symetrie" | "parties" | "identite";
export type Phase102 = "pascal" | "symetrique" | "somme" | "partenaire" | "suivant" | "toutes" | "contrainte" | "propriete" | "verdict";
export type Propriete102 = "pascal" | "symetrie" | "somme";
export type Contrainte102 = "auMoinsUn" | "auMoinsDeux" | "pasTous";
export type ContexteParties = "pizza" | "options" | "invites";

export interface Exercice102 {
  variante: Variante102;
  n: number;
  k: number;
  /** Parties : contrainte et contexte. */
  contrainte: Contrainte102;
  contexte: ContexteParties;
  /** Identité : propriété en jeu, verdict, forme fausse (0 = juste). */
  propriete: Propriete102;
  vrai: boolean;
  fausse: number;
}

export function phases102(e: Exercice102): Phase102[] {
  switch (e.variante) {
    case "ligne":
      return ["pascal", "symetrique", "somme"];
    case "symetrie":
      return ["partenaire", "suivant"];
    case "parties":
      return ["toutes", "contrainte"];
    case "identite":
      return ["propriete", "verdict"];
  }
}

/** Ligne n du triangle. */
export const ligneTriangle = (n: number) => Array.from({ length: n + 1 }, (_, k) => comb(n, k));

export function valeur102(e: Exercice102, p: Phase102): number {
  const { n, k } = e;
  switch (p) {
    case "pascal":
      return comb(n + 1, k);
    case "symetrique":
      return comb(n + 1, n + 1 - k);
    case "somme":
      return 2 ** (n + 1);
    case "partenaire":
      return comb(n, n - k);
    case "suivant":
      return comb(n + 1, k + 1);
    case "toutes":
      return 2 ** n;
    case "contrainte":
      return e.contrainte === "auMoinsDeux" ? 2 ** n - 1 - n : 2 ** n - 1;
    default:
      return 0;
  }
}

/** Identité affichée : membres gauche et droit (LaTeX) et leurs valeurs. */
export function identite(e: Exercice102): { gauche: string; droite: string; vg: number; vd: number } {
  const { n, k } = e;
  const C = (a: number | string, b: number | string) => `C_{${a}}^{${b}}`;
  if (e.propriete === "pascal") {
    const gauche = `${C(n, k)}+${C(n, k + 1)}`;
    const vg = comb(n, k) + comb(n, k + 1);
    const formes: [string, number][] = [
      [C(n + 1, k + 1), comb(n + 1, k + 1)],
      [C(n + 1, k), comb(n + 1, k)],
      [C(n, 2 * k + 1), comb(n, 2 * k + 1)],
      [C(2 * n, 2 * k + 1), comb(2 * n, 2 * k + 1)],
    ];
    const [droite, vd] = formes[e.fausse]!;
    return { gauche, droite, vg, vd };
  }
  if (e.propriete === "symetrie") {
    const gauche = C(n, k);
    const vg = comb(n, k);
    const formes: [string, number][] = [
      [C(n, n - k), comb(n, n - k)],
      [C(n, n - k + 1), comb(n, n - k + 1)],
      [C(n, k + 1), comb(n, k + 1)],
      [C(n + 1, n - k), comb(n + 1, n - k)],
    ];
    const [droite, vd] = formes[e.fausse]!;
    return { gauche, droite, vg, vd };
  }
  const gauche = `${C(n, 0)}+${C(n, 1)}+\\cdots+${C(n, n)}`;
  const vg = 2 ** n;
  const formes: [string, number][] = [
    [`${2 ** n}`, 2 ** n],
    [`${2 * n}`, 2 * n],
    [`${n * n}`, n * n],
    [`${2 ** (n + 1)}`, 2 ** (n + 1)],
  ];
  const [droite, vd] = formes[e.fausse]!;
  return { gauche, droite, vg, vd };
}
