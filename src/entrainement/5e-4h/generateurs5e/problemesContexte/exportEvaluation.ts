import type { ExerciceScenarioB, ModeleCoutUnitaire } from "../../core5e/problemesContexte.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
  CONSIGNE_FORMULE_B,
  CONSIGNE_RESOLUTION_B,
  consigneContexteBIntro,
  consigneContexteBReleve,
  consigneEvaluationB,
  consigneSystemeB,
  formatTermeABLatex,
  formatTermeFormuleBLatex,
  formatTermesEvaluationBLatex,
  formatTermesSystemeBLatex,
  latexCoutTotalB,
  latexFormuleCuB,
} from "../../ui5e/formatProblemesContexte";
import { construireScenarioBAvecModele, genererExerciceScenarioB } from "./scenarioB";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceScenarioB>` pour 5gen5 (Problèmes-contexte) —
 * feuille d'évaluation. `5gen5` tire au hasard parmi 3 scénarios structurellement indépendants
 * (A/B/C, voir `core5e/problemesContexte.types.ts` — jamais unifiés, chacun sa propre séquence
 * d'écrans) : la version papier n'en couvre volontairement qu'UN — le scénario B (coût unitaire de
 * production, système à 2 inconnues) — condensé en 3 questions écrites, même principe que gen8
 * (4e) : un seul scénario représentatif plutôt que les 3 écrans-par-écran des 3 scénarios (dont le
 * scénario A à 5 étapes pour son combo de référence, nettement plus long à mettre en questions
 * papier). Toutes les formules réutilisent directement `ui5e/formatProblemesContexte.ts`, déjà
 * utilisé par l'écran interactif — jamais de texte re-rédigé.
 */

function construireEnonceProblemesContexte(exercice: ExerciceScenarioB): SectionExercice {
  return {
    enteteFragments: [
      texte(consigneContexteBIntro(exercice) + " "),
      latex(latexFormuleCuB(exercice.modele)),
      texte(consigneContexteBReleve(exercice)),
    ],
    questions: [
      {
        consigne: [
          texte(consigneSystemeB() + " " + CONSIGNE_RESOLUTION_B + " Rappel : le coût TOTAL vaut "),
          latex(latexCoutTotalB(exercice.modele)),
        ],
        reponse: { type: "lignes", nombre: 4 },
      },
      { consigne: [texte(CONSIGNE_FORMULE_B)], reponse: { type: "lignes", nombre: 2 } },
      { consigne: [texte(consigneEvaluationB(exercice))], reponse: { type: "lignes", nombre: 2 } },
    ],
  };
}

function construireCorrectionProblemesContexte(exercice: ExerciceScenarioB): BlocCorrection[] {
  const { aArrondiAttendu, bArrondiAttendu, modele } = exercice;
  const [eq1, eq2] = formatTermesSystemeBLatex(exercice);
  const [ev1, ev2] = formatTermesEvaluationBLatex(exercice, aArrondiAttendu, bArrondiAttendu);
  return [
    {
      type: "paragraphe",
      fragments: [texte("Système (coût TOTAL = cu(x)·x = "), latex(latexCoutTotalB(modele)), texte(") : "), latex(eq1), texte(" et "), latex(eq2), texte(".")],
    },
    { type: "paragraphe", fragments: [texte("Résolution : "), latex(formatTermeABLatex(aArrondiAttendu, bArrondiAttendu)), texte(".")] },
    { type: "paragraphe", fragments: [latex(formatTermeFormuleBLatex(aArrondiAttendu, bArrondiAttendu, modele)), texte(".")] },
    { type: "paragraphe", fragments: [latex(ev1), texte(", "), latex(ev2), texte(".")] },
  ];
}

export const adaptateurEvaluationProblemesContexte: AdaptateurFeuilleExercices<ExerciceScenarioB> = {
  titreDocument: "Problèmes-contexte — Évaluation",
  nomFichierBase: "problemes-contexte",
  genererInstance: genererExerciceScenarioB,
  catalogueVariantes: (["B1", "B2", "B3", "B4", "B5"] as ModeleCoutUnitaire[]).map((id) => ({ id, label: `Modèle ${id}` })),
  genererInstanceAvecVariante: (id) => construireScenarioBAvecModele(id as ModeleCoutUnitaire),
  construireEnonce: construireEnonceProblemesContexte,
  construireCorrection: construireCorrectionProblemesContexte,
};
