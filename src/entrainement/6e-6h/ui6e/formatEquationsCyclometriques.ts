import type { Arcfonction } from "../core6e/cyclometrique.types";
import type { ArgumentLineaire, ArgumentQuadratique, ExerciceEquationsCyclometriques, SousCasArcfonctionsDifferentes } from "../core6e/equationsCyclometriques.types";
import { BANQUES_ARC } from "../generateurs6e/cyclometrique/banqueAngles";
import { approxFractionLatex } from "./formatFraction";

/**
 * Textes de consigne/aide + formatage LaTeX pour `6gen3` (REFONTE TOTALE).
 *
 * BUG 1 (artefacts flottants/décimales périodiques brutes, variantes 4a/4c) — `approxFractionLatex`
 * cherche le PLUS PETIT dénominateur ≤ `MAX_DEN` reproduisant la valeur ; au-delà, elle tombe dans
 * son filet de sécurité et renvoie le flottant JS BRUT (ex. `0.26923076923076925`). La variante 4a
 * (`asin_acos`) combine 2 points de `BANQUE_CERCLE_RATIONNEL` dont les dénominateurs peuvent différer
 * (`1`, `5`, `13`) puis divise par un écart entier `x2-x1∈{1..4}` : dénominateur final jusqu'à
 * `lcm(5,13)×4=260`. La variante 4c (`acos_atan`) combine un triplet pythagoricien (`q∈{3,4,5,12,15}`
 * ⟹ `q²` jusqu'à `225`) avec un entier `b∈[-3;3]`. `20` (l'ancien seuil, déjà relevé depuis `12`)
 * était donc insuffisant dans les deux cas — `300` couvre le maximum théorique (`260`) avec marge de
 * sécurité ; toute valeur affichée par ce module reste un rationnel EXACT par construction (jamais
 * une approximation numérique accidentelle), donc élargir la recherche ne risque aucun faux positif.
 */
export const MAX_DEN = 300;

export const CONSIGNE_GENERALE = "Résous l'équation cyclométrique suivante, étape par étape :";
export const NOM_LATEX: Record<Arcfonction, string> = { arcsin: "\\arcsin", arccos: "\\arccos", arctan: "\\arctan" };

function fx(v: number): string {
  return approxFractionLatex(v, MAX_DEN);
}

interface TermeSigne {
  valeur: number;
  suffixe: string;
}

function formatSommeTermes(termes: TermeSigne[]): string {
  const nonNuls = termes.filter((t) => t.valeur !== 0);
  if (nonNuls.length === 0) return "0";
  return nonNuls
    .map((t, i) => {
      const abs = Math.abs(t.valeur);
      const absLatex = fx(abs);
      const corps = t.suffixe === "" ? absLatex : abs === 1 ? t.suffixe : `${absLatex}${t.suffixe}`;
      if (i === 0) return t.valeur < 0 ? `-${corps}` : corps;
      return `${t.valeur < 0 ? "-" : "+"} ${corps}`;
    })
    .join(" ");
}

export function formatLineaireLatex(arg: ArgumentLineaire): string {
  return formatSommeTermes([
    { valeur: arg.a, suffixe: "x" },
    { valeur: arg.b, suffixe: "" },
  ]);
}

export function formatQuadratiqueLatex(arg: ArgumentQuadratique): string {
  return formatSommeTermes([
    { valeur: arg.a, suffixe: "x^{2}" },
    { valeur: arg.b, suffixe: "x" },
    { valeur: arg.c, suffixe: "" },
  ]);
}

const TOLERANCE_RECHERCHE_ANGLE = 1e-9;

/**
 * BUG 2 (trig remarquable non évaluée, écran "équation non cyclométrique", variantes 1/3) — `angle`
 * est TOUJOURS une entrée de `BANQUES_ARC[arcfonction]` par construction (`angleLineaire.ts`/
 * `angleQuadratique.ts` filtrent sur les entrées entières de cette même banque, PARTAGÉE avec
 * 6gen2 — voir `generateurs6e/fonctionsCyclometriques/index.ts::trouverAngleBanque` pour le même
 * principe de lookup, jamais un calcul flottant direct). On retrouve donc ici la valeur EXACTE déjà
 * connue (`entree.valeur`, ex. `-1`) par recherche inverse dans la banque plutôt que de construire
 * `\cos(\pi)` en LaTeX brut non résolu.
 */
export function valeurTrigDepuisAngle(arcfonction: Arcfonction, angle: { latex: string; numerique: number }): string {
  const entree = BANQUES_ARC[arcfonction].find((e) => Math.abs(e.angle.numerique - angle.numerique) < TOLERANCE_RECHERCHE_ANGLE);
  if (!entree) throw new Error(`valeurTrigDepuisAngle : aucune entrée trouvée pour ${arcfonction}(${angle.latex}) — ne devrait jamais arriver`);
  return entree.valeur.latex;
}

/** Les 2 arcfonctions (gauche=u, droite=v) associées à chaque sous-cas de la variante 4. */
export const ARCFONCTIONS_SOUS_CAS: Record<SousCasArcfonctionsDifferentes, [Arcfonction, Arcfonction]> = {
  asin_acos: ["arcsin", "arccos"],
  asin_atan: ["arcsin", "arctan"],
  acos_atan: ["arccos", "arctan"],
};

// ============================================================================
// Équation ORIGINALE (bloc "données", affichée sur les 4 écrans).
// ============================================================================

export function formatEquationOriginaleLatex(exercice: ExerciceEquationsCyclometriques): string {
  switch (exercice.variante) {
    case "angleLineaire":
      return `${NOM_LATEX[exercice.arcfonction]}\\left(${formatLineaireLatex(exercice.arg)}\\right) = ${exercice.angle.latex}`;
    case "memeArcfonction": {
      const nom = NOM_LATEX[exercice.arcfonction];
      return `${nom}\\left(${formatLineaireLatex(exercice.arg1)}\\right) = ${nom}\\left(${formatLineaireLatex(exercice.arg2)}\\right)`;
    }
    case "angleQuadratique":
      return `${NOM_LATEX[exercice.arcfonction]}\\left(${formatQuadratiqueLatex(exercice.arg)}\\right) = ${exercice.angle.latex}`;
    case "arcfonctionsDifferentes": {
      const [nom1, nom2] = ARCFONCTIONS_SOUS_CAS[exercice.sousCas];
      return `${NOM_LATEX[nom1]}\\left(${formatLineaireLatex(exercice.arg1)}\\right) = ${NOM_LATEX[nom2]}\\left(${formatLineaireLatex(exercice.arg2)}\\right)`;
    }
  }
}

// ============================================================================
// Équation NON CYCLOMÉTRIQUE (bloc "état actuel", à partir de l'écran "equation").
// ============================================================================

export function formatEquationNonCycloLatex(exercice: ExerciceEquationsCyclometriques): string {
  switch (exercice.variante) {
    case "angleLineaire":
      return `${formatLineaireLatex(exercice.arg)} = ${valeurTrigDepuisAngle(exercice.arcfonction, exercice.angle)}`;
    case "memeArcfonction":
      return `${formatLineaireLatex(exercice.arg1)} = ${formatLineaireLatex(exercice.arg2)}`;
    case "angleQuadratique":
      return `${formatQuadratiqueLatex(exercice.arg)} = ${valeurTrigDepuisAngle(exercice.arcfonction, exercice.angle)}`;
    case "arcfonctionsDifferentes": {
      const u = formatLineaireLatex(exercice.arg1);
      const v = formatLineaireLatex(exercice.arg2);
      if (exercice.sousCas === "asin_acos") return `\\left(${v}\\right)^{2} = 1 - \\left(${u}\\right)^{2}`;
      if (exercice.sousCas === "asin_atan") return `\\left(${v}\\right)^{2}\\left(1-\\left(${u}\\right)^{2}\\right) = \\left(${u}\\right)^{2}`;
      return `\\left(${u}\\right)^{2}\\left(1+\\left(${v}\\right)^{2}\\right) = 1`;
    }
  }
}

/** Forme intermédiaire, AVANT mise au carré (variante 4 seulement) — utilisée par l'aide de
 * l'écran "equation" (niveau 2, "transformation partiellement appliquée") et par l'aide de l'écran
 * "acceptRejet" (réinjection pour détecter une solution parasite). */
export function formatIdentiteAvantCarreLatex(exercice: Extract<ExerciceEquationsCyclometriques, { variante: "arcfonctionsDifferentes" }>): string {
  const u = formatLineaireLatex(exercice.arg1);
  const v = formatLineaireLatex(exercice.arg2);
  if (exercice.sousCas === "asin_acos") return `${v} = \\sqrt{1-\\left(${u}\\right)^{2}}`;
  if (exercice.sousCas === "asin_atan") return `${v} = \\dfrac{${u}}{\\sqrt{1-\\left(${u}\\right)^{2}}}`;
  return `${v} = \\dfrac{\\sqrt{1-\\left(${u}\\right)^{2}}}{${u}}`;
}

export function formatCandidatLatex(x: number): string {
  return `x = ${fx(x)}`;
}

