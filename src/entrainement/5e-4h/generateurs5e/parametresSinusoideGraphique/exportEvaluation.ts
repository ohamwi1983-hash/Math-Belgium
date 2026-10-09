import type { ExerciceParametresSinusoideGraphique } from "../../core5e/parametresSinusoideGraphique.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { construireSvgFonction } from "../../../export/svgGraph";
import { ORDRE_PHASES_SINUSOIDE_GRAPHIQUE } from "../../moteur5e/typesParametresSinusoideGraphique";
import { evaluerY, viewBoxX, viewBoxY } from "../../ui5e/sinusoideGraph";
import { formatChampParametreGraphiqueLatex } from "../../ui5e/formatParametresSinusoideGraphique";
import { genererExerciceParametresSinusoideGraphique } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceParametresSinusoideGraphique>` pour 5gen9
 * (Paramètres — lecture graphique) — feuille d'évaluation. Réutilise DIRECTEMENT la géométrie déjà
 * établie de l'écran interactif (`ui5e/sinusoideGraph.ts::evaluerY`/`viewBoxX`/`viewBoxY`, couvrant
 * 2,5 périodes) via `construireSvgFonction` (`export/svgGraph.ts`, déjà utilisé par 5gen4 et gen8
 * 4e) — le graphique imprimé est donc géométriquement identique à celui vu à l'écran, jamais un
 * second moteur de tracé.
 */

function construireGrapheParametresSinusoide(exercice: ExerciceParametresSinusoideGraphique): string {
  const [xMin, xMax] = viewBoxX(exercice);
  const [yMin, yMax] = viewBoxY(exercice);
  const largeur = 420;
  return construireSvgFonction((x) => evaluerY(exercice, x), { xMin, xMax, yMin, yMax }, { largeur, hauteur: largeur / 2, classe: "graphe-sinusoide" });
}

function construireEnonceParametresSinusoideGraphique(exercice: ExerciceParametresSinusoideGraphique): SectionExercice {
  return {
    enteteFragments: [texte("Le graphique ci-dessous représente une fonction sinusoïdale.")],
    enteteHtml: construireGrapheParametresSinusoide(exercice),
    questions: [
      {
        consigne: [texte("Détermine le décalage vertical b, l'amplitude A, la période T, la fréquence f et le décalage horizontal Φ de cette fonction (arrondis au centième près).")],
        reponse: { type: "lignes", nombre: 5 },
      },
    ],
  };
}

function construireCorrectionParametresSinusoideGraphique(exercice: ExerciceParametresSinusoideGraphique): BlocCorrection[] {
  return ORDRE_PHASES_SINUSOIDE_GRAPHIQUE.map((champ) => ({ type: "paragraphe", fragments: [latex(formatChampParametreGraphiqueLatex(exercice, champ))] }));
}

export const adaptateurEvaluationParametresSinusoideGraphique: AdaptateurFeuilleExercices<ExerciceParametresSinusoideGraphique> = {
  titreDocument: "Paramètres d'une fonction sinusoïdale (graphique) — Évaluation",
  nomFichierBase: "parametres-sinusoide-graphique",
  genererInstance: genererExerciceParametresSinusoideGraphique,
  construireEnonce: construireEnonceParametresSinusoideGraphique,
  construireCorrection: construireCorrectionParametresSinusoideGraphique,
};
