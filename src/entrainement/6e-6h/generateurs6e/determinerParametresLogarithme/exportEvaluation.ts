import type { ExerciceDeterminerParametresLogarithme } from "../../core6e/determinerParametresLogarithme.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { CONSIGNE_GENERALE, consigneEcran, descriptionGraphique, formatEquationBLatex, formatFonctionLatex } from "../../ui6e/formatDeterminerParametresLogarithme";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDeterminerParametresLogarithme } from "./index";
import { construireSvgParametresLogarithme } from "./svgParametresLogarithme";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceDeterminerParametresLogarithme>` pour `6gen18`
 * (f(x) = a + b·ln(x) depuis un graphique) — feuille d'évaluation. Le graphique est joint en SVG
 * (`enteteHtml`, pipeline HTML) ; comme les pipelines Word/PDF ne reçoivent pas la figure,
 * l'en-tête décrit aussi les informations lues (coordonnées des points / de la tangente), pour
 * que la feuille reste faisable dans tous les formats. Trois questions, une par écran (a, équation
 * en b, f(x)) ; le corrigé reprend les mêmes formes que la réponse attendue à l'écran.
 */

function construireEnonce(exercice: ExerciceDeterminerParametresLogarithme): SectionExercice {
  return {
    enteteFragments: [...CONSIGNE_GENERALE, texte(" Sur le graphique : "), ...descriptionGraphique(exercice, true)],
    enteteHtml: construireSvgParametresLogarithme(exercice),
    questions: [
      { consigne: consigneEcran("lireA", exercice), reponse: { type: "lignes", nombre: 2 } },
      { consigne: consigneEcran("equationB", exercice), reponse: { type: "lignes", nombre: 2 } },
      { consigne: consigneEcran("fonction", exercice), reponse: { type: "lignes", nombre: 2 } },
    ],
  };
}

function construireCorrection(exercice: ExerciceDeterminerParametresLogarithme): BlocCorrection[] {
  const raison =
    exercice.variante === "pente"
      ? "la pente de la tangente en x = 1 est f′(1), et f′(x) = b/x : "
      : exercice.variante === "pointE"
        ? `le point ${exercice.lettrePoint2} est sur la courbe et ln(e) = 1 (piège : f(e) = a + b, pas a) : `
        : `le point ${exercice.lettrePoint2} est sur la courbe et ln(e²) = 2 : `;
  return [
    { type: "paragraphe", fragments: [texte("a) Comme ln(1) = 0, "), latex(`f(1) = a + b\\cdot\\ln(1) = a`), texte(` : on lit f(1) = ${exercice.a}, donc a = ${exercice.a}.`)] },
    { type: "paragraphe", fragments: [texte(`b) ${raison[0].toUpperCase()}${raison.slice(1)}`), latex(formatEquationBLatex(exercice)), texte(".")] },
    { type: "paragraphe", fragments: [texte(`c) b = ${exercice.b}, donc `), latex(formatFonctionLatex(exercice)), texte(".")] },
  ];
}

export const adaptateurEvaluationDeterminerParametresLogarithme: AdaptateurFeuilleExercices<ExerciceDeterminerParametresLogarithme> = {
  titreDocument: "Paramètres depuis des conditions graphiques — Évaluation",
  nomFichierBase: "determiner-parametres-logarithme",
  genererInstance: genererExerciceDeterminerParametresLogarithme,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
};
