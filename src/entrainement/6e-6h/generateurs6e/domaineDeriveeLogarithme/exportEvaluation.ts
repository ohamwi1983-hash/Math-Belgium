import type { ExerciceDomaineDeriveeLogarithme, FamilleDomaineDeriveeLogarithme } from "../../core6e/domaineDeriveeLogarithme.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { phaseApres, phaseInitiale } from "../../moteur6e/typesDomaineDeriveeLogarithme";
import type { PhaseDomaineDeriveeLogarithme } from "../../moteur6e/typesDomaineDeriveeLogarithme";
import { blocDonnees, consigneEcran, reponseAttendueLatex } from "../../ui6e/formatDomaineDeriveeLogarithme";
import { formatEnsembleReelLatex } from "../../ui6e/formatEnsembleReel";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceDomaineDeriveeLogarithme } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceDomaineDeriveeLogarithme>` pour `6gen16` (Domaine,
 * dérivée et dérivation logarithmique) — feuille d'évaluation, voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence.
 *
 * Contrairement à `deriveesCyclometriques` (une seule question générique par instance), les 7
 * familles A-G de ce générateur ont un nombre d'écrans DIFFÉRENT (2 pour A/B/F, 3 pour C/D/E/G) et
 * une consigne d'en-tête qui dépend de la formule tirée (`blocDonnees`) — jamais `regroupable`.
 * Chaque question écrite correspond exactement à un écran interactif réel (voir
 * `moteur6e/typesDomaineDeriveeLogarithme.ts::phaseApres`) — jamais une question inventée.
 *
 * **Corrigé** (audit 6e ch. 3, point 28) : chaque réponse vient de `reponseAttendueLatex`
 * (`ui6e/formatDomaineDeriveeLogarithme.ts`), la MÊME source que la révélation à l'écran —
 * dérivées simplifiées, jamais « ·ln(e) », « (1)·ln(…) » ni « ln5·5ˣ/(5ˣ·ln5) ». Les anciennes
 * copies locales des formateurs (`facteursLatexC`, `uvLatexG`...) sont supprimées.
 */

function entete(exercice: ExerciceDomaineDeriveeLogarithme): SectionExercice["enteteFragments"] {
  return [latex(blocDonnees(exercice)[0])];
}

/** Lignes de réponse par écran — domaine/identification courts, dérivées plus longues. */
function lignesPhase(phase: PhaseDomaineDeriveeLogarithme): number {
  if (phase.endsWith("Domaine") || phase === "eSimplifier" || phase === "gIdentifier") return 2;
  if (phase === "fDerivee") return 4;
  return 3;
}

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

function phasesDeLExercice(exercice: ExerciceDomaineDeriveeLogarithme): PhaseDomaineDeriveeLogarithme[] {
  const phases: PhaseDomaineDeriveeLogarithme[] = [];
  let phase: PhaseDomaineDeriveeLogarithme | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

function construireEnonceDomaineDeriveeLogarithme(exercice: ExerciceDomaineDeriveeLogarithme): SectionExercice {
  return {
    enteteFragments: entete(exercice),
    questions: phasesDeLExercice(exercice).map((phase) => ({ consigne: consigneEcran(exercice, phase), reponse: { type: "lignes", nombre: lignesPhase(phase) } })),
  };
}

function construireCorrectionDomaineDeriveeLogarithme(exercice: ExerciceDomaineDeriveeLogarithme): BlocCorrection[] {
  return phasesDeLExercice(exercice).map((phase, i) => {
    const lettre = LETTRES[i] ?? String(i + 1);
    const reponse = reponseAttendueLatex(exercice, phase);
    if (reponse === null && "domaine" in exercice) {
      const precision = exercice.famille === "E" ? " (sur l'expression originale)" : "";
      return { type: "paragraphe", fragments: [texte(`${lettre}) Domaine${precision} : `), latex(formatEnsembleReelLatex(exercice.domaine))] };
    }
    return { type: "paragraphe", fragments: [texte(`${lettre}) `), latex(reponse ?? "")] };
  });
}

// ============================================================================
// Dispatch public + export de l'adaptateur.
// ============================================================================

export const adaptateurEvaluationDomaineDeriveeLogarithme: AdaptateurFeuilleExercices<ExerciceDomaineDeriveeLogarithme> = {
  titreDocument: "Domaine, dérivée et dérivation logarithmique — Évaluation",
  nomFichierBase: "domaine-derivee-logarithme",
  genererInstance: genererExerciceDomaineDeriveeLogarithme,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as FamilleDomaineDeriveeLogarithme),
  construireEnonce: construireEnonceDomaineDeriveeLogarithme,
  construireCorrection: construireCorrectionDomaineDeriveeLogarithme,
  // Nombre de questions VARIABLE selon la famille (2 pour A/B/F, 3 pour C/D/E/G) et en-tête
  // dépendant de l'instance (`blocDonnees`) — aucune des conditions de `regroupable` n'est réunie.
};
