import type { ExerciceGeometrieCercle, ScenarioGeometrieCercle } from "../../core5e/geometrieCercle.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { construireSvgGeometrieCercle } from "../../export5e/svgGraphGeometrieCercle";
import { blocDonneesLatex, consigneGenerale, formatValeurPhaseLatex, phasesDuScenario } from "../../ui5e/formatGeometrieCercle";
import { CATALOGUE_SCENARIOS, construireAvecScenarioId, genererExerciceGeometrieCercle } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceGeometrieCercle>` pour 5gen12 (Problèmes de
 * géométrie du cercle) — feuille d'évaluation. `formatValeurPhaseLatex` (déjà utilisée par le
 * récapitulatif final de l'écran interactif) rend chaque grandeur cible en un seul fragment
 * "symbole = valeur" — le corrigé énumère simplement toutes les phases de `phasesDuScenario`, dans
 * l'ordre, sans recalcul. Les 3 scénarios (secteurBalaye/segmentCirculaire/lentille) sont tous les
 * 3 couverts (structurellement homogènes via ce même mécanisme phase par phase, contrairement à
 * 5gen5/5gen13 où seul un sous-cas a été retenu).
 *
 * Croquis SVG (`export/svgGraphGeometrieCercle.ts`, même tracé que l'écran interactif
 * `GeometrieCercleSketch.tsx`) injecté via `enteteHtml` dans l'énoncé ET répété dans le corrigé (pas
 * de distinction énoncé/réponse à masquer ici, contrairement à `svgGraphCyclo.ts` — le croquis est
 * purement illustratif, identique des deux côtés, donc aucune raison de ne l'afficher qu'une fois).
 */

function construireEnonceGeometrieCercle(exercice: ExerciceGeometrieCercle): SectionExercice {
  const donnees = blocDonneesLatex(exercice);
  return {
    enteteFragments: [texte(consigneGenerale(exercice) + " Données : "), latex(donnees.join(" \\quad "))],
    enteteHtml: construireSvgGeometrieCercle(exercice),
    questions: [
      {
        consigne: [texte("Calcule, dans l'ordre, toutes les grandeurs intermédiaires nécessaires jusqu'au résultat final (arrondis au centième ou à l'unité selon la grandeur).")],
        reponse: { type: "lignes", nombre: phasesDuScenario(exercice.scenario).length + 1 },
      },
    ],
  };
}

function construireCorrectionGeometrieCercle(exercice: ExerciceGeometrieCercle): BlocCorrection[] {
  return [
    { type: "html", html: construireSvgGeometrieCercle(exercice) },
    ...phasesDuScenario(exercice.scenario).map((phase): BlocCorrection => ({ type: "paragraphe", fragments: [latex(formatValeurPhaseLatex(exercice, phase))] })),
  ];
}

export const adaptateurEvaluationGeometrieCercle: AdaptateurFeuilleExercices<ExerciceGeometrieCercle> = {
  titreDocument: "Problèmes de géométrie du cercle — Évaluation",
  nomFichierBase: "geometrie-cercle",
  genererInstance: genererExerciceGeometrieCercle,
  catalogueVariantes: CATALOGUE_SCENARIOS,
  genererInstanceAvecVariante: (id) => construireAvecScenarioId(id as ScenarioGeometrieCercle),
  construireEnonce: construireEnonceGeometrieCercle,
  construireCorrection: construireCorrectionGeometrieCercle,
};
