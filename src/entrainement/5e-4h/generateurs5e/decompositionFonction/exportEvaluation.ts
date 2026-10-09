import type { ExerciceDecompositionFonction } from "../../core5e/decompositionFonction.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { labelLigne } from "../../ui5e/formatDecompositionFonction";
import { construireAvecProfondeur, genererExerciceDecompositionFonction } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceDecompositionFonction>` pour 5gen2 (Décomposer une
 * fonction composée) — feuille d'évaluation. L'écran interactif fait deviner la décomposition
 * couche par couche, de l'extérieur vers l'intérieur, avec des aides progressives ; la version
 * papier demande directement la chaîne complète (de la plus intérieure à la plus extérieure), et
 * le corrigé énumère chaque couche via `couches[].propreLatex` (déjà l'expression "propre" de
 * cette seule couche, appliquée à x — voir `core5e/decompositionFonction.types.ts`), jamais une
 * transcription des aides progressives (purement des indices, pas du texte de correction).
 */

function construireEnonceDecompositionFonction(exercice: ExerciceDecompositionFonction): SectionExercice {
  return {
    enteteFragments: [latex(exercice.fLatex)],
    questions: [
      {
        consigne: [
          texte("Décompose "),
          latex("f"),
          texte(" en une chaîne de "),
          latex(String(exercice.couches.length)),
          texte(" fonctions simples, de la plus intérieure à la plus extérieure (une ligne par fonction intermédiaire)."),
        ],
        reponse: { type: "lignes", nombre: exercice.couches.length + 1 },
      },
    ],
  };
}

function construireCorrectionDecompositionFonction(exercice: ExerciceDecompositionFonction): BlocCorrection[] {
  return exercice.couches.map((couche, i) => ({
    type: "paragraphe",
    fragments: [latex(`${labelLigne(i)} ${couche.propreLatex}`)],
  }));
}

export const adaptateurEvaluationDecompositionFonction: AdaptateurFeuilleExercices<ExerciceDecompositionFonction> = {
  titreDocument: "Décomposer une fonction composée — Évaluation",
  nomFichierBase: "decomposition-fonction",
  genererInstance: genererExerciceDecompositionFonction,
  catalogueVariantes: [
    { id: "2", label: "2 couches" },
    { id: "3", label: "3 couches" },
    { id: "4", label: "4 couches" },
  ],
  genererInstanceAvecVariante: (id) => construireAvecProfondeur(Number(id) as 2 | 3 | 4),
  construireEnonce: construireEnonceDecompositionFonction,
  construireCorrection: construireCorrectionDecompositionFonction,
};
