import type { EtatSessionEquationInequationSecondDegre, PhaseEquationInequationSecondDegre } from "../moteur/typesEquationInequationSecondDegre";
import type { ExerciceEquationInequationSecondDegre } from "../core/equationInequationSecondDegre.types";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatEquationInequationLatex, formatResolutionAttendueTexte, formatValidationAttendueTexte } from "./formatEquationInequationSecondDegre";

/** Séquence RÉELLE d'écrans — UNIQUE depuis la refonte (voir
 * `core/equationInequationSecondDegre.types.ts`, en-tête) : `poserEquationInequation → resoudre →
 * validation → interpretation`, pour les 7 familles. */
const SEQUENCE: PhaseEquationInequationSecondDegre[] = ["poserEquationInequation", "resoudre", "validation", "interpretation"];

/**
 * Valeur d'une entrée du récapitulatif pour une phase donnée — réutilise TELLES QUELLES les
 * fonctions déjà écrites pour le bloc "réponse attendue" de `AppEquationInequationSecondDegre.tsx`.
 * `"interpretation"` est TOUJOURS la dernière phase — jamais appelée ici.
 */
function valeurPourPhase(
  exercice: ExerciceEquationInequationSecondDegre,
  phase: PhaseEquationInequationSecondDegre,
): Pick<EntreeRecapitulatif, "libelle" | "valeur" | "estLatex"> | null {
  switch (phase) {
    case "poserEquationInequation":
      return { libelle: exercice.variante === "equation" ? "Équation posée" : "Inéquation posée", estLatex: true, valeur: formatEquationInequationLatex(exercice) };
    case "resoudre":
      return { libelle: "Résolution", estLatex: false, valeur: formatResolutionAttendueTexte(exercice) };
    case "validation":
      return { libelle: "Validation", estLatex: false, valeur: formatValidationAttendueTexte(exercice) };
    default:
      throw new Error(`recapitulatifEquationInequationSecondDegre : phase sans entrée récap (${phase})`);
  }
}

function releveePourPhase(etat: EtatSessionEquationInequationSecondDegre, phase: PhaseEquationInequationSecondDegre): boolean {
  switch (phase) {
    case "poserEquationInequation":
      return etat.poserEquationInequationRevele;
    case "resoudre":
      return etat.resoudreRevele;
    case "validation":
      return etat.validationRevele;
    default:
      throw new Error(`recapitulatifEquationInequationSecondDegre : phase sans révélation trackée (${phase})`);
  }
}

/**
 * Récapitulatif "Ce qu'on sait déjà" de `AppEquationInequationSecondDegre.tsx` — les entrées
 * accumulées sont toujours les phases déjà closes de la séquence unique (`SEQUENCE`).
 */
export function calculerRecapitulatifEquationInequationSecondDegre(etat: EtatSessionEquationInequationSecondDegre): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const precedentes = SEQUENCE.slice(0, SEQUENCE.indexOf(etat.phase));

  const entrees: EntreeRecapitulatif[] = [];
  for (const phase of precedentes) {
    const valeur = valeurPourPhase(exercice, phase);
    if (!valeur) continue;
    entrees.push({ ...valeur, revele: releveePourPhase(etat, phase) });
  }
  return entrees;
}
