import type { PolynomeLineaire } from "../../core/simplification.types";
import type { Symbole } from "../../core/inequation.types";
import type { SolutionEnsembleProduit, ValeurCellule } from "../../core/signesProduit.types";
import { classifierSolutionParColonnes } from "../signesProduit/grille";
import type { GrilleQuotient, ValeurCelluleQuotient } from "../../core/inequationRationnelle.types";

/**
 * Valeur x représentative d'une colonne (n racines distinctes ⇒ 2n+1 colonnes — 5 en niveaux 1-2,
 * 7 en niveau 3) : exactement la racine pour une colonne "point" (indices impairs), un point
 * d'échantillonnage strictement à l'intérieur de la zone pour une colonne "zone" (indices pairs) —
 * même principe que valeurRepresentative (generateurs/signesProduit/grille.ts), dupliqué ici car
 * non exporté là-bas (calcul trivial, pas de couplage supplémentaire souhaité). Générique sur le
 * nombre de racines — réutilisé tel quel par construireGrilleQuotientNiveau3.ts.
 */
export function valeurRepresentative(racines: number[], colonne: number): number {
  const n = racines.length;
  if (colonne % 2 === 1) return racines[(colonne - 1) / 2];
  const zone = colonne / 2;
  if (zone === 0) return racines[0] - 1;
  if (zone === n) return racines[n - 1] + 1;
  return (racines[zone - 1] + racines[zone]) / 2;
}

/** Signe de k(x-p) — réutilisé tel quel par construireGrilleQuotientNiveau3.ts pour sa ligne D. */
export function signeLineaire(poly: PolynomeLineaire, x: number): ValeurCellule {
  const valeur = poly.k * (x - poly.p);
  if (valeur === 0) return "0";
  return valeur > 0 ? "+" : "-";
}

/**
 * Signe du quotient N/D — calculé par DIVISION des deux lignes précédentes, jamais par
 * multiplication (contrairement au tableau de signes produit) : "∄" dès que D vaut "0" (quotient
 * non défini, priment sur tout le reste), "0" si N vaut "0" (et D non nul — garanti par
 * construction, racines toujours distinctes), sinon "+" si N et D ont même signe, "-" sinon.
 * Exportée : réutilisée par construireGrilleQuotientNiveau3.ts (avec N = signe du PRODUIT des deux
 * facteurs de P2_1, calculé séparément — voir ce fichier).
 */
export function signeQuotient(n: ValeurCellule, d: ValeurCellule): ValeurCelluleQuotient {
  if (d === "0") return "∄";
  if (n === "0") return "0";
  return n === d ? "+" : "-";
}

/**
 * Construit la grille de signes attendue pour P1_1/P1_2 ◇ 0 (niveau 1) : les deux racines
 * (numérateur, dénominateur) sont toujours distinctes (garanti par la construction de l'exercice,
 * jamais vérifié ici) — triées croissant pour former l'en-tête. Chaque colonne est évaluée
 * directement à sa valeur représentative (jamais par propagation de signe zone à zone), même
 * principe que construireGrille (signesProduit).
 */
export function construireGrilleQuotient(
  numerateur: PolynomeLineaire,
  denominateur: PolynomeLineaire,
): { racines: [number, number]; ce: number; grille: GrilleQuotient } {
  const racines = [numerateur.p, denominateur.p].sort((a, b) => a - b) as [number, number];
  const nbColonnes = 2 * racines.length + 1;
  const points = Array.from({ length: nbColonnes }, (_, colonne) => valeurRepresentative(racines, colonne));

  const ligneNumerateur = points.map((x) => signeLineaire(numerateur, x));
  const ligneDenominateur = points.map((x) => signeLineaire(denominateur, x));
  const ligneQuotient = ligneNumerateur.map((n, i) => signeQuotient(n, ligneDenominateur[i]));

  return { racines, ce: denominateur.p, grille: { ligneNumerateur, ligneDenominateur, ligneQuotient } };
}

/**
 * Ensemble-solution à partir de la ligne quotient COMPLÈTE (zones ET points) — même algorithme que
 * le produit (`classifierSolutionParColonnes`, generateurs/signesProduit/grille.ts) : une colonne est
 * satisfaite selon `colonneSatisfaitQuotient` ("∄" jamais), et une colonne point dont la racine est
 * une CE ne l'est jamais non plus (garde-fou : toute borne CE reste ouverte, quel que soit le
 * symbole). Racines simples : résultat identique à l'ancienne construction zone par zone. Racine
 * double au numérateur (niveau 3, audit gen6) : point isolé (≤/≥) ou trou (</>) en cette racine.
 * `ce` : une seule valeur (niveaux 1-3) ou un tableau (deux dénominateurs).
 */
export function classifierSolutionQuotient(
  racines: number[],
  ce: number | number[],
  ligneQuotient: ValeurCelluleQuotient[],
  symbole: Symbole,
): SolutionEnsembleProduit {
  const ceListe = Array.isArray(ce) ? ce : [ce];
  const colonnes = ligneQuotient.map((valeur, colonne) => {
    if (colonne % 2 === 1 && ceListe.includes(racines[(colonne - 1) / 2])) return false;
    return colonneSatisfaitQuotient(valeur, symbole);
  });
  return classifierSolutionParColonnes(racines, colonnes);
}

export function colonneSatisfaitQuotient(valeur: ValeurCelluleQuotient, symbole: Symbole): boolean {
  if (valeur === "∄") return false;
  if (valeur === "0") return symbole === "≤" || symbole === "≥";
  const positif = valeur === "+";
  return symbole === ">" || symbole === "≥" ? positif : !positif;
}

/**
 * Étape "Aide" de l'écran intervalle (prompt de corrections, section 3) : détermine quelles
 * colonnes de la grille confirmée satisfont l'inégalité demandée, et lesquelles des racines de
 * l'en-tête leur correspondent — même principe que calculerAideGrille (signesProduit), jamais
 * utilisée pour la vérification de la réponse de l'élève (qui reste verifierSolutionSignesProduit).
 * Typé structurellement (pas sur un niveau précis) : `GrilleQuotient` (niveaux 1-2) et
 * `GrilleQuotientNiveau3` partagent tous deux un champ `ligneQuotient`, donc la même fonction sert
 * aux trois niveaux sans variante dédiée.
 */
export function calculerAideGrilleQuotient(exercice: {
  grille: { ligneQuotient: ValeurCelluleQuotient[] };
  racines: number[];
  symbole: Symbole;
}): { colonnes: boolean[]; racines: boolean[] } {
  const colonnes = exercice.grille.ligneQuotient.map((valeur) => colonneSatisfaitQuotient(valeur, exercice.symbole));
  const racines = exercice.racines.map((_, j) => colonnes[2 * j + 1]);
  return { colonnes, racines };
}
