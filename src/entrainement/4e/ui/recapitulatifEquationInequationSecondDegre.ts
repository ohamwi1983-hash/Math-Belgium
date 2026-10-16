import type { EtatSessionEquationInequationSecondDegre, PhaseEquationInequationSecondDegre } from "../moteur/typesEquationInequationSecondDegre";
import type { ExerciceEquationInequationSecondDegre } from "../core/equationInequationSecondDegre.types";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatEquationInequationLatex, formatResolutionAttendueTexte, formatValidationAttendueTexte, texteAidePoserSystemeNiveau2 } from "./formatEquationInequationSecondDegre";

/** Séquence RÉELLE d'écrans — dépend de `exercice.voieSysteme` (architecture D uniquement, voir
 * `core/equationInequationSecondDegre.types.ts`, en-tête) : `poserSysteme → isolerSubstituer →
 * resoudre → validation → interpretation` (D) ou `poserEquationInequation → resoudre → validation →
 * interpretation` (A/B/C). */
function sequencePourExercice(exercice: ExerciceEquationInequationSecondDegre): PhaseEquationInequationSecondDegre[] {
  if (exercice.voieSysteme) {
    return ["poserSysteme", "isolerSubstituer", "resoudre", "validation", "interpretation"];
  }
  return ["poserEquationInequation", "resoudre", "validation", "interpretation"];
}

/**
 * Valeur d'une entrée du récapitulatif pour une phase donnée — réutilise TELLES QUELLES les
 * fonctions déjà écrites pour le bloc "réponse attendue" de `AppEquationInequationSecondDegre.tsx`.
 * `"isolerSubstituer"` réutilise `formatEquationInequationLatex` (même cible que
 * "poserEquationInequation", voir en-tête de fichier). `"interpretation"` est TOUJOURS la dernière
 * phase — jamais appelée ici.
 */
function valeurPourPhase(
  exercice: ExerciceEquationInequationSecondDegre,
  phase: PhaseEquationInequationSecondDegre,
): Pick<EntreeRecapitulatif, "libelle" | "valeur" | "estLatex"> | null {
  switch (phase) {
    case "poserSysteme":
      return { libelle: "Système posé", estLatex: true, valeur: texteAidePoserSystemeNiveau2(exercice) };
    case "isolerSubstituer":
      return { libelle: exercice.variante === "equation" ? "Équation réduite" : "Inéquation réduite", estLatex: true, valeur: formatEquationInequationLatex(exercice) };
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
    case "poserSysteme":
      return etat.poserSystemeRevele;
    case "isolerSubstituer":
      return etat.isolerSubstituerRevele;
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
 * accumulées sont toujours les phases déjà closes de la séquence de CET exercice
 * (`sequencePourExercice`).
 */
export function calculerRecapitulatifEquationInequationSecondDegre(etat: EtatSessionEquationInequationSecondDegre): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = sequencePourExercice(exercice);
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  const entrees: EntreeRecapitulatif[] = [];
  for (const phase of precedentes) {
    const valeur = valeurPourPhase(exercice, phase);
    if (!valeur) continue;
    entrees.push({ ...valeur, revele: releveePourPhase(etat, phase) });
  }
  return entrees;
}
