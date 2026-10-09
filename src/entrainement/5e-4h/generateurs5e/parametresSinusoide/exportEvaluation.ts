import type { ExerciceParametresSinusoide, FormeAffichageSinusoide } from "../../core5e/parametresSinusoide.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { formatChampParametreLatex, formatFormuleLatex } from "../../ui5e/formatParametresSinusoide";
import { ORDRE_PHASES_SINUSOIDE } from "../../moteur5e/typesParametresSinusoide";
import { CATALOGUE_FORMES, construireAvecFormeId, genererExerciceParametresSinusoide } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceParametresSinusoide>` pour 5gen8 (Paramètres d'une
 * fonction sinusoïdale) — feuille d'évaluation. `formatChampParametreLatex` (déjà utilisé par le
 * bloc "état actuel"/récapitulatif de l'écran interactif) donne directement chaque fragment
 * "label = valeur" — la version papier n'a donc besoin d'aucune reformulation, juste la liste
 * complète des 5 paramètres dans l'ordre canonique `ORDRE_PHASES_SINUSOIDE`.
 */

function construireEnonceParametresSinusoide(exercice: ExerciceParametresSinusoide): SectionExercice {
  return {
    enteteFragments: [texte("On considère la fonction sinusoïdale "), latex(formatFormuleLatex(exercice))],
    questions: [
      {
        consigne: [texte("Détermine l'amplitude A, le décalage horizontal Φ, la période T, la fréquence f et le décalage vertical b de cette fonction (arrondis au centième près).")],
        reponse: { type: "lignes", nombre: 5 },
      },
    ],
  };
}

function construireCorrectionParametresSinusoide(exercice: ExerciceParametresSinusoide): BlocCorrection[] {
  return ORDRE_PHASES_SINUSOIDE.map((champ) => ({ type: "paragraphe", fragments: [latex(formatChampParametreLatex(exercice, champ))] }));
}

export const adaptateurEvaluationParametresSinusoide: AdaptateurFeuilleExercices<ExerciceParametresSinusoide> = {
  titreDocument: "Paramètres d'une fonction sinusoïdale — Évaluation",
  nomFichierBase: "parametres-sinusoide",
  genererInstance: genererExerciceParametresSinusoide,
  catalogueVariantes: CATALOGUE_FORMES,
  genererInstanceAvecVariante: (id) => construireAvecFormeId(id as FormeAffichageSinusoide),
  construireEnonce: construireEnonceParametresSinusoide,
  construireCorrection: construireCorrectionParametresSinusoide,
};
