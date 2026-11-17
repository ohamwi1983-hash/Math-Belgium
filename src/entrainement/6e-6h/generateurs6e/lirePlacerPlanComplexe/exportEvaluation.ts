import type { ExerciceLirePlacer } from "../../core6e/lirePlacerPlanComplexe.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { argumentCLatex } from "../../moteur6e/modeleLirePlacerPlanComplexe";
import { PHASES_LIRE_PLACER } from "../../moteur6e/typesLirePlacerPlanComplexe";
import type { PhaseLirePlacer } from "../../moteur6e/typesLirePlacerPlanComplexe";
import {
  JUSTIFICATION_TRANSFORMATION,
  NOMS_IMAGES,
  OPERATION_LATEX,
  PIEGE_OPERATION,
  affixeLatex,
  aideNiveau1,
  calculModuleArgument,
  calculPlacement,
  consigneEcran,
  coordonneesLatex,
  imageDe,
  justificationArgument,
  l,
  piegeAssocier,
  reponseFragments,
  t,
} from "../../ui6e/formatLirePlacerPlanComplexe";
import { figureCorrigeLirePlacerSvg, figureEnonceLirePlacerSvg } from "../../ui6e/figureLirePlacerPlanComplexe";
import { LIBELLE_CAS_LIRE_PLACER, profilLirePlacer } from "./profilEvaluation";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLirePlacer } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceLirePlacer>` de `6gen95` « Lire et placer dans le
 * plan complexe » — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - `construireEnonce` : une question par écran (étapes a à e), titres « Étape n — … » du corrigé.
 * - `enoncePapier` : la figure (A, B, C sur le quadrillage, fenêtre fixe, aucune coordonnée écrite)
 *   et la consigne globale, puis les QUATRE vraies questions du fiche : a) lire les affixes (étape
 *   a), b) placer P et Q (étapes b et c — l'élève les place sur la figure de l'énoncé), c) nommer
 *   les deux transformations (étape d — sans liste d'options sur papier), d) module et argument de
 *   z_C (étape e).
 * - Corrigé : par étape, Méthode (aide de l'écran), Calcul, Piège ciblé, Conclusion (réponse de
 *   l'écran) ; la figure avec P et Q placés (réponse graphique) en `figureHtml` sous l'étape c.
 * - Version aménagée : même énoncé (le pipeline ne change que la mise en page).
 */

const LETTRES: Record<PhaseLirePlacer, string> = { lire: "a", placer1: "b", placer2: "c", associer: "d", moduleArgument: "e" };

/** Consigne d'une étape, version papier (titre « Étape n — … » du corrigé). */
function consigneEtape(e: ExerciceLirePlacer, phase: PhaseLirePlacer): FragmentConsigne[] {
  if (phase === "placer1" || phase === "placer2") {
    const i = phase === "placer1" ? 0 : 1;
    return [t(`Place sur la figure le point ${NOMS_IMAGES[i]} d'affixe `), l(OPERATION_LATEX[e.operations[i]]), t(".")];
  }
  if (phase === "associer") {
    return [
      t("Nomme la transformation du plan qui associe au point M d'affixe "),
      l("z"),
      t(" le point d'affixe "),
      l(OPERATION_LATEX[e.operations[0]]),
      t(", puis celle qui lui associe le point d'affixe "),
      l(OPERATION_LATEX[e.operations[1]]),
      t("."),
    ];
  }
  return consigneEcran(e, phase);
}

function consigneGlobalePapier(e: ExerciceLirePlacer): FragmentConsigne[] {
  return [
    t("Le plan complexe ci-dessous est quadrillé (une unité par carreau) ; les points A"),
    ...(e.w ? [t(", B")] : []),
    t(" et C sont placés sur des intersections du quadrillage. On note "),
    l("z"),
    t(" l'affixe de A"),
    ...(e.w ? [t(", "), l("w"), t(" celle de B")] : []),
    t(" et "),
    l("z_C"),
    t(" celle de C."),
  ];
}

function construireEnonce(e: ExerciceLirePlacer): SectionExercice {
  return {
    enteteFragments: consigneGlobalePapier(e),
    enteteHtml: figureEnonceLirePlacerSvg(e),
    questions: PHASES_LIRE_PLACER.map((phase) => ({ consigne: consigneEtape(e, phase) })),
  };
}

function construireCorrection(e: ExerciceLirePlacer): BlocCorrection[] {
  return PHASES_LIRE_PLACER.map((phase) => ({ type: "paragraphe", fragments: [t(`${LETTRES[phase]}) `), ...reponseFragments(e, phase)] }));
}

function questionsPapier(e: ExerciceLirePlacer): FragmentConsigne[][] {
  return [
    e.w ? [t("Donne l'affixe "), l("z"), t(" du point A et l'affixe "), l("w"), t(" du point B.")] : [t("Donne l'affixe "), l("z"), t(" du point A.")],
    [t("Place sur la figure le point P d'affixe "), l(OPERATION_LATEX[e.operations[0]]), t(" et le point Q d'affixe "), l(OPERATION_LATEX[e.operations[1]]), t(".")],
    consigneEtape(e, "associer"),
    [t("Calcule le module et un argument de "), l("z_C"), t(" (valeurs exactes, argument en radians).")],
  ];
}

function reponseBreve(e: ExerciceLirePlacer): FragmentConsigne[] {
  return [
    t("a) "),
    ...reponseFragments(e, "lire"),
    t(" ; b) "),
    l(`P${coordonneesLatex(imageDe(e, 0))}`),
    t(", "),
    l(`Q${coordonneesLatex(imageDe(e, 1))}`),
    t(" ; c) "),
    ...reponseFragments(e, "associer"),
    t(" ; d) "),
    ...reponseFragments(e, "moduleArgument"),
  ];
}

function enoncePapier(e: ExerciceLirePlacer): EnoncePapier {
  return {
    section: {
      enteteFragments: consigneGlobalePapier(e),
      enteteHtml: figureEnonceLirePlacerSvg(e),
      questions: questionsPapier(e).map((consigne) => ({ consigne })),
    },
    etapesParQuestion: [["a"], ["b", "c"], ["d"], ["e"]],
    reponseBreve: reponseBreve(e),
  };
}

function methode(e: ExerciceLirePlacer, phase: PhaseLirePlacer): FragmentConsigne[] {
  const aide = aideNiveau1(e, phase);
  return aide.latex ? [t(`${aide.texte} `), l(aide.latex)] : [t(aide.texte)];
}

function correctionDetaillee(e: ExerciceLirePlacer): EtapeCorrection[] {
  const lignes: EtapeCorrection[] = [];
  // a) Lecture.
  const lecture = [`A${coordonneesLatex(e.z)}\\ \\Rightarrow\\ z=${affixeLatex(e.z)}`];
  if (e.w) lecture.push(`B${coordonneesLatex(e.w)}\\ \\Rightarrow\\ w=${affixeLatex(e.w)}`);
  lignes.push(
    { label: "Méthode", sousQuestion: "a", fragments: methode(e, "lire") },
    { label: "Calcul", sousQuestion: "a", fragments: [l(lecture.join("\\qquad "))] },
    { label: "Piège", sousQuestion: "a", fragments: [t("Échanger partie réelle et partie imaginaire : la partie réelle est l'abscisse (axe horizontal).")] },
    { label: "Conclusion", sousQuestion: "a", fragments: reponseFragments(e, "lire") },
  );
  // b), c) Placement.
  ([0, 1] as const).forEach((i) => {
    const phase: PhaseLirePlacer = i === 0 ? "placer1" : "placer2";
    const sousQuestion = LETTRES[phase];
    lignes.push(
      { label: "Méthode", sousQuestion, fragments: methode(e, phase) },
      { label: "Calcul", sousQuestion, fragments: [l(calculPlacement(e, i))] },
      { label: "Piège", sousQuestion, fragments: PIEGE_OPERATION[e.operations[i]] },
      { label: "Conclusion", sousQuestion, fragments: reponseFragments(e, phase), ...(i === 1 ? { figureHtml: figureCorrigeLirePlacerSvg(e) } : {}) },
    );
  });
  // d) Transformations.
  lignes.push(
    { label: "Méthode", sousQuestion: "d", fragments: [t("Traduis chaque opération sur un point quelconque d'affixe "), l("a+bi"), t(" (ou sur "), l("z"), t(") et reconnais la transformation :")] },
    { label: "Calcul", sousQuestion: "d", fragments: [l(e.operations.map((op) => JUSTIFICATION_TRANSFORMATION[op]).join("\\qquad "))] },
    { label: "Piège", sousQuestion: "d", fragments: piegeAssocier(e) },
    { label: "Conclusion", sousQuestion: "d", fragments: reponseFragments(e, "associer") },
  );
  // e) Module et argument.
  lignes.push(
    { label: "Méthode", sousQuestion: "e", fragments: methode(e, "moduleArgument") },
    { label: "Calcul", sousQuestion: "e", fragments: [l(calculModuleArgument(e))] },
    { label: "Argument", sousQuestion: "e", fragments: justificationArgument(e) },
    { label: "Piège", sousQuestion: "e", fragments: [t("Oublier la racine carrée (donner "), l("|z_C|^2"), t("), ou se tromper de quadrant pour l'argument.")] },
    { label: "Conclusion", sousQuestion: "e", fragments: reponseFragments(e, "moduleArgument") },
  );
  return lignes;
}

function difficulte(e: ExerciceLirePlacer): 1 | 2 | 3 {
  return e.variante === "symetries" ? 1 : 2;
}

const POIDS: Record<PhaseLirePlacer, number> = { lire: 0.5, placer1: 0.75, placer2: 0.75, associer: 1, moduleArgument: 1 };

function critere(e: ExerciceLirePlacer, phase: PhaseLirePlacer): FragmentConsigne[] {
  switch (phase) {
    case "lire":
      return [t(e.w ? "Affixes de A et de B lues : " : "Affixe de A lue : "), ...reponseFragments(e, phase)];
    case "placer1":
    case "placer2":
      return [t("Point placé : "), ...reponseFragments(e, phase)];
    case "associer":
      return [t("Les deux transformations nommées avec leurs éléments (0,5 chacune) : "), ...reponseFragments(e, phase)];
    case "moduleArgument":
      return [t("Module exact et argument (0,5 chacun) : "), ...reponseFragments(e, phase)];
  }
}

function bareme(e: ExerciceLirePlacer): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: PHASES_LIRE_PLACER.map((phase) => ({ sousQuestion: LETTRES[phase], critere: critere(e, phase), points: POIDS[phase] })),
    erreursFrequentes: [
      { description: [t("Partie réelle et partie imaginaire échangées à la lecture")], cout: "−0,5" },
      { description: PIEGE_OPERATION[e.operations[0]], cout: "−0,5" },
      { description: PIEGE_OPERATION[e.operations[1]], cout: "−0,5" },
      { description: [t("Transformation nommée sans ses éléments (centre, axe, angle, vecteur ou rapport)")], cout: "−0,25" },
      { description: [t("Module sans racine carrée ("), l("|z_C|^2"), t(") ou argument du mauvais quadrant")], cout: "−0,5" },
    ],
    reponsesAcceptees: [
      [t("Tout argument égal à "), l(argumentCLatex(e.c)), t(" à "), l("2k\\pi"), t(" près")],
      [t("Rotation d'un quart de tour dans le sens contraire des aiguilles d'une montre pour l'angle "), l("\\frac{\\pi}{2}"), t(" ; translation décrite par son vecteur ou par l'affixe de ce vecteur")],
    ],
  };
}

export const adaptateurEvaluationLirePlacerPlanComplexe: AdaptateurFeuilleExercices<ExerciceLirePlacer> = {
  titreDocument: "Lire et placer dans le plan complexe — Évaluation",
  nomFichierBase: "lire-placer-plan-complexe",
  genererInstance: genererExerciceLirePlacer,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 10,
  profilInstance: profilLirePlacer,
  libelleCasParticulier: LIBELLE_CAS_LIRE_PLACER,
};
