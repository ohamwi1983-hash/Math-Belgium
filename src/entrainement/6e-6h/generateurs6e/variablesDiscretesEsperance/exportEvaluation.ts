import type { ExerciceVariablesDiscretesEsperance } from "../../core6e/variablesDiscretesEsperance.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatVariablesDiscretesEsperance";
import { phasesPourExercice } from "../../moteur6e/typesVariablesDiscretesEsperance";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceVariablesDiscretesEsperance } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceVariablesDiscretesEsperance>` pour `6gen49`
 * (Variables aléatoires discrètes et espérance) — NOUVEAU (aucun équivalent côté plateforme-maths,
 * comme pour tout le chapitre « Variables aléatoires » et son chapitre prérequis « Analyse
 * combinatoire ») : une question imprimée par écran interactif traversé (`phasesPourExercice`),
 * réutilisant directement `consigneEcran`/`formatReponseAttenduePhaseLatex`.
 */

function entete(exercice: ExerciceVariablesDiscretesEsperance) {
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceVariablesDiscretesEsperance): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return { enteteFragments: entete(exercice), questions: phases.map((phase) => ({ consigne: [texte(consigneEcran(exercice, phase))] })) };
}

function construireCorrection(exercice: ExerciceVariablesDiscretesEsperance): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

export const adaptateurEvaluationVariablesDiscretesEsperance: AdaptateurFeuilleExercices<ExerciceVariablesDiscretesEsperance> = {
  titreDocument: "Variables aléatoires discrètes et espérance — Évaluation",
  nomFichierBase: "variables-discretes-esperance",
  genererInstance: genererExerciceVariablesDiscretesEsperance,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
