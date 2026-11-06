/**
 * Couche présentation (5e) — consignes/labels/aides pour 5gen19 ("Suite récurrente affine et
 * régime permanent"). Séquence fixe à 3 écrans, identique pour les 2 régimes.
 *
 * Nombres affichés en DÉCIMAL à la virgule (a = 0,85 comme l'énoncé dit « 15 % », valeurs arrondies
 * au centième comme demandé) — jamais une fraction illisible du type 51160313/500000 ; la valeur
 * exacte n'est ajoutée à côté que si c'est une fraction lisible (dénominateur ≤ 20).
 */
import type { ExerciceSuiteRecurrenteAffine } from "../core5e/suiteRecurrenteAffine.types";
import type { FractionQ } from "../core5e/suitesGeometriques.types";
import { fractionQVersNombre } from "../generateurs5e/suitesGeometriques/fraction";
import type { PhaseSuiteRecurrenteAffine } from "../moteur5e/typesSuiteRecurrenteAffine";

/** Nombre décimal en LaTeX, virgule belge, au plus `decimales` décimales (zéros inutiles retirés). */
function decimalLatex(valeur: number, decimales = 2): string {
  const arrondi = Math.round(valeur * 10 ** decimales) / 10 ** decimales;
  const texte = (arrondi === 0 ? 0 : arrondi).toFixed(decimales).replace(/\.?0+$/, "");
  return texte.replace(".", "{,}");
}

/** Vrai si la fraction s'écrit exactement avec au plus 2 décimales (dénominateur divisant 100). */
function estDecimalCentieme(f: FractionQ): boolean {
  return 100 % f.den === 0;
}

/** Valeur révélée/affichée : exacte si elle tient en 2 décimales, sinon « ≈ arrondi au centième »,
 * précédée de la fraction exacte seulement si elle est lisible (dénominateur ≤ 20). */
function valeurLatex(nom: string, f: FractionQ): string {
  const v = fractionQVersNombre(f);
  if (estDecimalCentieme(f)) return `${nom}=${decimalLatex(v)}`;
  if (f.den <= 20) {
    const exacte = f.num < 0 ? `-\\dfrac{${-f.num}}{${f.den}}` : `\\dfrac{${f.num}}{${f.den}}`;
    return `${nom}=${exacte}\\approx ${decimalLatex(v)}`;
  }
  return `${nom}\\approx ${decimalLatex(v)}`;
}

/** Coefficient a en décimal (a = 1 ∓ pct/100 : toujours exact au centième). */
export function aLatex(exercice: ExerciceSuiteRecurrenteAffine): string {
  return decimalLatex(fractionQVersNombre(exercice.a));
}

/** Lettre de la grandeur avec indice Unicode, pour du texte brut (consignes, libellés). */
function indiceTexte(lettre: string, indice: string): string {
  const sub: Record<string, string> = { "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", n: "ₙ", "+": "₊" };
  return lettre + [...indice].map((c) => sub[c] ?? c).join("");
}

export function consigneGenerale(exercice: ExerciceSuiteRecurrenteAffine): string {
  return exercice.phraseEnonce;
}

export function consignePoserRecurrence(exercice: ExerciceSuiteRecurrenteAffine): string {
  const V = exercice.variableGrandeur;
  return (
    `${indiceTexte(V, "1")} = ${exercice.u1} est la valeur initiale, et ${indiceTexte(V, "n+1")} la valeur une étape après ${indiceTexte(V, "n")}. ` +
    `Exprime ${indiceTexte(V, "n+1")} en fonction de ${indiceTexte(V, "n")} (tape ${V} ou x pour ${indiceTexte(V, "n")}).`
  );
}

/** Libellé du champ (et de l'aperçu) en texte brut : « Qₙ₊₁ = ». */
export function libellePoserRecurrence(exercice: ExerciceSuiteRecurrenteAffine): string {
  return `${indiceTexte(exercice.variableGrandeur, "n+1")} =`;
}

export function consigneRegimePermanent(_exercice: ExerciceSuiteRecurrenteAffine): string {
  return "Cette suite a-t-elle un régime permanent (une valeur limite L vers laquelle elle se stabilise) ? Si oui, calcule-le (arrondis au centième).";
}

export function consigneTermesSuccessifs(exercice: ExerciceSuiteRecurrenteAffine): string {
  const V = exercice.variableGrandeur;
  return `Calcule les 3 valeurs suivantes (${indiceTexte(V, "2")}, ${indiceTexte(V, "3")}, ${indiceTexte(V, "4")}) à partir de ${indiceTexte(V, "1")} = ${exercice.u1}, arrondies au centième (tu peux réutiliser tes valeurs arrondies).`;
}

export type PhaseAide = "poserRecurrence" | "regimePermanent" | "termesSuccessifs";

/** Aide = une phrase (rendue en `<p>`, qui passe à la ligne sur téléphone) + une formule LaTeX
 * optionnelle (rendue à part) — jamais un long `\text{…}` dans KaTeX, qui ne passe pas à la ligne. */
export interface AideSuiteRecurrenteAffine {
  texte: string;
  latex: string;
}

export function texteAideNiveau1(exercice: ExerciceSuiteRecurrenteAffine, phase: PhaseAide): AideSuiteRecurrenteAffine {
  const V = exercice.variableGrandeur;
  switch (phase) {
    case "poserRecurrence":
      return {
        texte: "Repère le facteur multiplicatif appliqué à chaque étape (a), puis la quantité fixe qui s'ajoute — ou se retranche — à chaque étape (b) :",
        latex: `${V}_{n+1}=a\\times ${V}_n+b`,
      };
    case "regimePermanent":
      return { texte: "À l'équilibre (régime permanent), la valeur ne change plus d'une étape à l'autre :", latex: `${V}_{n+1}=${V}_n=L` };
    case "termesSuccessifs":
      return { texte: "Applique la relation de récurrence trouvée au premier écran, en partant de la valeur initiale :", latex: `${V}_2=a\\times ${V}_1+b` };
  }
}

export function texteAideNiveau2(exercice: ExerciceSuiteRecurrenteAffine, phase: PhaseAide): AideSuiteRecurrenteAffine {
  if (phase === "poserRecurrence") {
    return { texte: "Ici :", latex: `a=${aLatex(exercice)} \\quad\\text{et}\\quad b=${exercice.b}` };
  }
  if (phase === "regimePermanent") {
    // Même aide dans les deux régimes : le critère et la formule, jamais la conclusion.
    return {
      texte: `Critère : un régime permanent existe seulement si |a| < 1 (ici a = ${aLatex(exercice).replace("{,}", ",")}). Dans ce cas, on résout L = a × L + b :`,
      latex: `L=a\\times L+b \\iff L=\\dfrac{b}{1-a}`,
    };
  }
  return { texte: "", latex: "" };
}

// ============================================================================
// Bloc "état actuel" + récapitulatif final — valeurs déjà CONFIRMÉES, dérivées PUREMENT de
// `exercice` (jamais la saisie de l'élève).
// ============================================================================

/** Terme `b` signé (sinon double-signe `+-5` quand `b<0`, cas des contextes divergents). */
function formatTermeB(b: number): string {
  return b < 0 ? `-${-b}` : `+${b}`;
}

function formatRecurrenceConfirmeeLatex(exercice: ExerciceSuiteRecurrenteAffine): string {
  return `${exercice.variableGrandeur}_{n+1}=${aLatex(exercice)}\\times ${exercice.variableGrandeur}_n${formatTermeB(exercice.b)}`;
}

/** Régime confirmé à l'écran "regimePermanent" — L décimal (fraction exacte à côté si lisible),
 * jamais une valeur inventée si divergent (n'existe pas). */
export function formatRegimeConfirmeLatex(exercice: ExerciceSuiteRecurrenteAffine): string {
  if (exercice.regime === "divergent") return "L\\ \\text{n'existe pas}\\ (|a|\\geq 1)";
  return valeurLatex("L", exercice.L as FractionQ);
}

export function formatTermesEtatActuelLatex(exercice: ExerciceSuiteRecurrenteAffine, phase: PhaseSuiteRecurrenteAffine): string[] | null {
  if (phase === "poserRecurrence") return null;
  const termes = [formatRecurrenceConfirmeeLatex(exercice)];
  if (phase === "termesSuccessifs") termes.push(formatRegimeConfirmeLatex(exercice));
  return termes;
}

/** Réponse attendue à un écran donné — en fragments LaTeX, un fragment par valeur pour
 * "termesSuccessifs" (3 valeurs, arrondies au centième comme demandé). */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceSuiteRecurrenteAffine, phase: PhaseSuiteRecurrenteAffine): string[] {
  const V = exercice.variableGrandeur;
  switch (phase) {
    case "poserRecurrence":
      return [formatRecurrenceConfirmeeLatex(exercice)];
    case "regimePermanent":
      return [formatRegimeConfirmeLatex(exercice)];
    case "termesSuccessifs":
      return [valeurLatex(`${V}_2`, exercice.u2), valeurLatex(`${V}_3`, exercice.u3), valeurLatex(`${V}_4`, exercice.u4)];
  }
}
