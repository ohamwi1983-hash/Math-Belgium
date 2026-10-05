import type { Exercice } from "../../core/generateur.types";
import type { PolynomeLineaire } from "../../core/simplification.types";
import type { ValeurCellule } from "../../core/signesProduit.types";
import type { GrilleQuotientNiveau3 } from "../../core/inequationRationnelle.types";
import { signeLineaire, signeQuotient, valeurRepresentative } from "./grilleQuotient";

/** Signe de (P1_2(x))² : jamais négatif, "0" exactement à la racine de P1_2, "+" partout ailleurs. */
function signeLineaireCarre(poly: PolynomeLineaire, x: number): ValeurCellule {
  return poly.k * (x - poly.p) === 0 ? "0" : "+";
}

/**
 * Signe réel du numérateur combiné (ax²+bx+c), évalué DIRECTEMENT — jamais via le raccourci
 * "produit des signes moniques N1×N2" utilisé par construireGrilleQuotientNiveau3.ts, invalide ici
 * car `a` n'est pas garanti positif (voir core/inequationRationnelle.types.ts : l'identité
 * A - k·(P1_2)² impose A = -a·d², donc a et A ont toujours des signes opposés — l'exemple du PDF a
 * précisément A=4>0 avec a=-1<0). Les 2 lignes N affichées à l'élève restent moniques (x-r1)/(x-r2)
 * — un choix purement pédagogique, indépendant du calcul de cette ligne de référence.
 */
function signeQuadratique(enonce: { a: number; b: number; c: number }, x: number): ValeurCellule {
  const v = enonce.a * x * x + enonce.b * x + enonce.c;
  if (v === 0) return "0";
  return v > 0 ? "+" : "-";
}

/**
 * Construit la grille de signes attendue pour [A - k·(P1_2)²]/(P1_2)² ◇ 0 (variante "dénominateur
 * au carré") : même forme exacte que GrilleQuotientNiveau3 (2 lignes N + 1 ligne D + quotient),
 * réutilisée telle quelle — voir core/inequationRationnelle.types.ts. Racines toujours distinctes
 * par construction (r1=p-d, r2=p+d, d≠0 ⟹ r1≠r2≠p) ⇒ toujours 3 racines, 7 colonnes (2×3+1).
 *
 * `ligneCoefficient` (promptgenerateur6inequationRationnelle.md, point 7) : présente uniquement si
 * le coefficient dominant du numérateur combiné (`a`) est négatif — seul niveau du générateur où ce
 * signe n'est jamais garanti positif (voir core/inequationRationnelle.types.ts). Valeur "-" à
 * chaque colonne (constante, indépendante de x) ; absente (undefined) quand `a>0`, exactement comme
 * l'élève n'a alors rien à signaler pour ce facteur (il n'inverse jamais le signe du produit).
 */
export function construireGrilleQuotientDenominateurCarre(
  p2_1: Exercice,
  p1_2: PolynomeLineaire,
): { racines: number[]; ce: number; grille: GrilleQuotientNiveau3 } {
  const [r1, r2] = [...p2_1.solution.racines].sort((a, b) => a - b);
  const racines = [r1, r2, p1_2.p].sort((a, b) => a - b);
  const nbColonnes = 2 * racines.length + 1;
  const points = Array.from({ length: nbColonnes }, (_, colonne) => valeurRepresentative(racines, colonne));

  const ligneN1 = points.map((x) => signeLineaire({ k: 1, p: r1 }, x));
  const ligneN2 = points.map((x) => signeLineaire({ k: 1, p: r2 }, x));
  const ligneDenominateur = points.map((x) => signeLineaireCarre(p1_2, x));
  const ligneQuotient = points.map((x, i) => signeQuotient(signeQuadratique(p2_1.enonce, x), ligneDenominateur[i]));
  const ligneCoefficient: ValeurCellule[] | undefined =
    p2_1.enonce.a < 0 ? points.map(() => "-" as ValeurCellule) : undefined;

  return {
    racines,
    ce: p1_2.p,
    grille: { ligneCoefficient, lignesNumerateur: [ligneN1, ligneN2], ligneDenominateur, ligneQuotient },
  };
}
