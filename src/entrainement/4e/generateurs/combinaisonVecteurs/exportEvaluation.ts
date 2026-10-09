import type { ExerciceCombinaisonVecteurs } from "../../core/combinaisonVecteurs.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
  formatConvertiLatex,
  formatDistribueLatex,
  formatEquationReduiteLatex,
  formatExpressionLatex,
  formatPointsLatex,
  formatReponseColonneLatex,
  formatResultatLatex,
  formatSommeAxesLatex,
  formatSubstitutionLatex,
  formatVecteursLibresLatex,
} from "../../ui/formatCombinaisonVecteurs";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceCombinaisonVecteurs } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceCombinaisonVecteurs>` pour gen22 (Calcul de
 * composantes de combinaisons linéaires, `AppCombinaisonVecteurs.tsx`) — voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence, et
 * `generateurs/simplification/exportEvaluation.ts` pour un second exemple avec `catalogueVariantes`.
 * Chapitre Math-Belgium concerné : "Calcul vectoriel" (4e), section "Multiplier un vecteur par un
 * réel et combinaisons linéaires en repère" (`multiplicationReperes`, `src/content/chapters/4e/calcul-vectoriel.ts`).
 *
 * Correspondance écran → question papier — les 5 variantes de `CATALOGUE_VARIANTES` (`plate`,
 * `parentheses`, `vecteur-repete`, `paire-opposee`, `complete`, voir `generateurs/combinaisonVecteurs/index.ts`)
 * partagent TOUTES la même mécanique en 2 écrans (`AppCombinaisonVecteurs.tsx`), seule la STRUCTURE
 * de l'expression tirée diffère (nombre de groupes/termes, présence ou non d'une paire de points
 * A/B) :
 * - Écran 1 (`EtapeSimplificationCombinaisonVecteurs.tsx`, phase "simplification") : l'élève réduit
 *   symboliquement l'expression donnée (distribue les coefficients externes, convertit
 *   `\vec{BA}` en `-\vec{AB}` si besoin, regroupe les vecteurs identiques) — devient la question a).
 * - Écran 2 (`EtapeComposantesCombinaisonVecteurs.tsx`, phase "composantes") : à partir de la forme
 *   réduite (confirmée, rappelée via `RecapitulatifPanel` côté écran), l'élève calcule les
 *   composantes numériques finales — devient la question b).
 *
 * PAS `regroupable` : contrairement à un générateur "une seule question générique par instance"
 * (ex. gen4 du chapitre 6), ce générateur produit TOUJOURS 2 questions substantielles par instance
 * (réduction symbolique puis calcul numérique, jamais fusionnables — la question b) dépend du
 * résultat de la question a)), ce qui disqualifie `regroupable` par construction (voir la doc de
 * `AdaptateurFeuilleExercices.regroupable` dans `genererFeuilleExercices.ts` : réservé aux
 * générateurs à UNE seule question par instance). Accessoirement, la consigne de la question a)
 * mentionne aussi l'expression tirée elle-même (`enteteFragments`), donc dépendante de l'instance —
 * un second obstacle indépendant à `regroupable` même sans la contrainte du nombre de questions.
 *
 * Correction RESYNTHÉTISÉE depuis les valeurs déjà connues et correctes de l'instance tirée, jamais
 * recalculée indépendamment : réutilise directement les formateurs déjà utilisés côté écran
 * interactif (`ui/formatCombinaisonVecteurs.ts`, le même module que `EtapeSimplificationCombinaisonVecteurs.tsx`/
 * `EtapeComposantesCombinaisonVecteurs.tsx` consomment) — `formatDistribueLatex`/`formatConvertiLatex`/
 * `formatEquationReduiteLatex` pour la correction de la question a) (mêmes 3 étapes que les niveaux
 * d'aide 1/3 de l'écran 1, la simple IDENTIFICATION du niveau d'aide 2 étant sans intérêt une fois la
 * conversion déjà montrée), `formatSubstitutionLatex`/`formatSommeAxesLatex`/`formatReponseColonneLatex`
 * pour la question b) (mêmes 2 niveaux d'aide de l'écran 2, plus le résultat final que l'écran ne
 * révèle jamais avant validation). Aucune de ces fonctions n'est dupliquée ici.
 *
 * Pas de zone de réponse dédiée (`reponse` omis sur les 2 questions) : une feuille imprimée pour ce
 * générateur laisse l'élève rédiger librement sous chaque consigne, sans présupposer un nombre de
 * lignes ou un format tabulaire particulier.
 */

function fragmentsGroupeReduction(instance: ExerciceCombinaisonVecteurs): BlocCorrection {
  const fragments = [
    texte("a) On distribue chaque coefficient externe sur les termes de son groupe : "),
    latex(formatDistribueLatex(instance)),
    texte(". On convertit "),
    latex("\\vec{BA}"),
    texte(" en "),
    latex("-\\vec{AB}"),
    texte(" là où c'est nécessaire : "),
    latex(formatConvertiLatex(instance)),
    texte(". On regroupe enfin les vecteurs identiques : "),
    latex(formatEquationReduiteLatex(instance)),
    texte("."),
  ];
  return { type: "paragraphe", fragments };
}

function fragmentsGroupeComposantes(instance: ExerciceCombinaisonVecteurs): BlocCorrection {
  const sommeAxes = formatSommeAxesLatex(instance);
  const fragments = [
    texte("b) On substitue les composantes réelles de chaque vecteur de base : "),
    latex(formatSubstitutionLatex(instance)),
    texte(". On additionne séparément les composantes "),
    latex("x"),
    texte(" et "),
    latex("y"),
    texte(" : "),
    latex(sommeAxes.x),
    texte(", "),
    latex(sommeAxes.y),
    texte(". D'où "),
    latex(formatReponseColonneLatex(instance)),
    texte("."),
  ];
  return { type: "paragraphe", fragments };
}

function construireEnonceCombinaisonVecteurs(instance: ExerciceCombinaisonVecteurs): SectionExercice {
  const pointsLatex = formatPointsLatex(instance);
  const enteteFragments = [texte("On donne les vecteurs "), latex(formatVecteursLibresLatex(instance))];
  if (pointsLatex) {
    enteteFragments.push(texte(", ainsi que les points "), latex(pointsLatex));
  }
  enteteFragments.push(texte(". On considère la combinaison "), latex(formatExpressionLatex(instance)), texte("."));

  return {
    enteteFragments,
    questions: [
      {
        consigne: [
          texte("Réduis cette expression au maximum (distribue les coefficients externes, convertis "),
          latex("\\vec{BA}"),
          texte(" en "),
          latex("-\\vec{AB}"),
          texte(" si nécessaire, puis regroupe les vecteurs identiques)."),
        ],
      },
      { consigne: [texte("Calcule les composantes de "), latex(formatResultatLatex(instance)), texte(".")] },
    ],
  };
}

function construireCorrectionCombinaisonVecteurs(instance: ExerciceCombinaisonVecteurs): BlocCorrection[] {
  return [fragmentsGroupeReduction(instance), fragmentsGroupeComposantes(instance)];
}

export const adaptateurEvaluationCombinaisonVecteurs: AdaptateurFeuilleExercices<ExerciceCombinaisonVecteurs> = {
  titreDocument: "Calcul de composantes de combinaisons linéaires — Évaluation",
  nomFichierBase: "combinaison-vecteurs-composantes",
  genererInstance: genererExerciceCombinaisonVecteurs,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceCombinaisonVecteurs,
  construireCorrection: construireCorrectionCombinaisonVecteurs,
  // Toujours 2 questions substantielles par instance (réduction symbolique, puis calcul numérique),
  // la question a) mentionnant en outre l'expression tirée — jamais `regroupable` (voir le
  // commentaire de tête).
};
