/**
 * Tableau de signes en LaTeX (environnement `array`), pour le corrigé détaillé des feuilles
 * d'exercices et évaluations (gen5 « signe d'un produit », gen6 « inéquations rationnelles ») :
 * une ligne `x` (−∞, racines, +∞), une ligne par facteur, puis la ligne du résultat, séparée par un
 * filet. Les valeurs suivent la grille du générateur (colonnes alternées zone / racine, 2n + 1
 * colonnes pour n racines) — jamais recalculées ici. « ∄ » (valeur interdite d'un quotient)
 * s'écrit avec la double barre usuelle.
 */

export type CelluleSigne = "+" | "-" | "0" | "∄";

export interface LigneTableauSignes {
  /** Libellé de la ligne, déjà en LaTeX (ex. `x-4`, `\text{Signe du produit}`). */
  libelle: string;
  /** 2n + 1 valeurs (zone, racine, zone, …, zone). */
  valeurs: CelluleSigne[];
}

function nombreLatex(valeur: number): string {
  return Number.isInteger(valeur) ? String(valeur) : String(Math.round(valeur * 1000) / 1000).replace(".", "{,}");
}

function celluleLatex(valeur: CelluleSigne): string {
  if (valeur === "∄") return "\\|";
  return valeur;
}

/** `lignesFacteurs` puis `ligneResultat` (séparée par un filet). */
export function tableauSignesLatex(racines: number[], lignesFacteurs: LigneTableauSignes[], ligneResultat: LigneTableauSignes): string {
  const interieur = racines.length * 2 + 1;
  const colonnes = `c|${"c".repeat(interieur + 2)}`;
  const enteteX = Array.from({ length: interieur }, (_, i) => (i % 2 === 1 ? nombreLatex(racines[(i - 1) / 2]) : ""));
  const ligne = (l: LigneTableauSignes) => [l.libelle, "", ...l.valeurs.map(celluleLatex), ""].join(" & ");
  return [
    `\\begin{array}{${colonnes}}`,
    `x & -\\infty & ${enteteX.join(" & ")} & +\\infty \\\\ \\hline`,
    ...lignesFacteurs.map((l) => `${ligne(l)} \\\\`),
    `\\hline ${ligne(ligneResultat)}`,
    "\\end{array}",
  ].join(" ");
}
