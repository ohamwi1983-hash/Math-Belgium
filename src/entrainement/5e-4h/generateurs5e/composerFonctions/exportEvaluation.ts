import type { CompositionDirigee, ExerciceComposerFonctions } from "../../core5e/composerFonctions.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, QuestionExercice, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { formatDomfLatex } from "../../ui5e/formatDomaineDefinition";
import { CATALOGUE_COMBOS, construireAvecCombos, genererExerciceComposerFonctions } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceComposerFonctions>` pour 5gen3 (Composer f et g —
 * expressions et domaines) — feuille d'évaluation. `CompositionDirigee` porte déjà l'expression
 * composée entièrement résolue (`latex`) et son domaine final (`domaine`, un `EnsembleReelGuide`
 * standard réutilisable via `formatDomfLatex`) — la version papier n'a donc besoin de rejouer
 * AUCUNE étape intermédiaire du pipeline guidé (écrans B/C1/C2, réservés au cas "riche") : une
 * question directe "détermine l'expression et le domaine de (f∘g)(x)" par direction active
 * (`sens` peut activer f∘g seul, g∘f seul, ou les deux).
 *
 * `genererInstanceAvecVariante` ne force que la COMBINAISON de familles (`CATALOGUE_COMBOS`), pas
 * le sens (fixé à "lesDeux", la variante la plus complète) — `construireAvecCombos` prend les 2 axes
 * séparément mais le contrat `AdaptateurFeuilleExercices` n'expose qu'un seul id de variante,
 * simplification assumée (même principe que le catalogue à 1 axe de gen8/gen9, 4e).
 */

function labelDirection(exercice: ExerciceComposerFonctions, dir: CompositionDirigee): string {
  return dir === exercice.fRondG ? "(f\\circ g)(x)" : "(g\\circ f)(x)";
}

function directionsActives(exercice: ExerciceComposerFonctions): CompositionDirigee[] {
  return [exercice.fRondG, exercice.gRondF].filter((d): d is CompositionDirigee => d !== null);
}

function construireEnonceComposerFonctions(exercice: ExerciceComposerFonctions): SectionExercice {
  const questions: QuestionExercice[] = directionsActives(exercice).map((dir) => ({
    consigne: [texte("Détermine l'expression de "), latex(labelDirection(exercice, dir)), texte(" et son domaine de définition.")],
    reponse: { type: "lignes", nombre: 4 },
  }));
  return {
    enteteFragments: [texte("Soient les fonctions "), latex(exercice.f.latex), texte(" et "), latex(exercice.g.latex)],
    questions,
  };
}

function construireCorrectionComposerFonctions(exercice: ExerciceComposerFonctions): BlocCorrection[] {
  return directionsActives(exercice).map((dir) => ({
    type: "paragraphe",
    fragments: [latex(`${labelDirection(exercice, dir)} = ${dir.latex}`), texte(", "), latex(formatDomfLatex(dir.domaine)), texte(".")],
  }));
}

export const adaptateurEvaluationComposerFonctions: AdaptateurFeuilleExercices<ExerciceComposerFonctions> = {
  titreDocument: "Composer f et g — Évaluation",
  nomFichierBase: "composer-fonctions",
  genererInstance: genererExerciceComposerFonctions,
  catalogueVariantes: CATALOGUE_COMBOS,
  genererInstanceAvecVariante: (id) => construireAvecCombos(id, "lesDeux"),
  construireEnonce: construireEnonceComposerFonctions,
  construireCorrection: construireCorrectionComposerFonctions,
};
