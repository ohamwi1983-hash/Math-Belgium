import type { ExerciceTransformationGraphique } from "../../core/transformationsGraphiques.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { construireSvgFonction, type PointMarqueSvg } from "../../../export/svgGraph";
import { calculerViewBoxTransformation, evaluerCourbe, parametresDepuisExercice, pointUnitaire, RATIO_GRAPHE } from "../../ui/mafsTransformation";
import { formatEquationTransformationLatex } from "../../ui/formatTransformationsGraphiques";
import { genererExerciceTransformationGraphique } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceTransformationGraphique>` pour gen8
 * (Transformations graphiques) — feuille d'évaluation.
 *
 * L'écran interactif fait lire p/q/EV/CV/SOX séparément via 4 curseurs + un toggle, chacun
 * vérifié indépendamment — un exercice papier ne peut pas reproduire cette granularité (le
 * couple (EV,CV) n'est de toute façon pas reconstructible de façon unique à partir du seul
 * coefficient a d'une équation lue sur un graphique : a=2 vaut aussi bien EV=2/CV=1 que
 * EV=4/CV=2). Condensé en UNE question "lis l'équation sur le graphique", qui reste l'exercice
 * réel de lecture graphique porté par ce générateur — le sommet S et le point "croix" (où
 * l'argument de x² vaut exactement 1, `pointUnitaire`) sont marqués et étiquetés sur le
 * graphique, EXACTEMENT comme sur l'écran interactif (légende `MafsGraphTransformation.tsx`,
 * les coordonnées des 2 points y sont déjà révélées en toutes lettres) : ce sont ces deux points
 * qui permettent de lire p, q, puis a = (ordonnée du point croix) − q.
 */

function construireGrapheTransformation(exercice: ExerciceTransformationGraphique, estCorrige: boolean): string {
  const params = parametresDepuisExercice(exercice);
  const viewBox = calculerViewBoxTransformation(params);
  const croix = pointUnitaire(params);
  const largeur = 320;
  const points: PointMarqueSvg[] = [
    { x: params.p, y: params.q, forme: "point", label: estCorrige ? `S(${params.p} ; ${params.q})` : undefined, labelPosition: "dessous" },
    { x: croix.x, y: croix.y, forme: "croix", label: estCorrige ? `(${croix.x} ; ${croix.y})` : undefined, labelPosition: "dessus" },
  ];
  return construireSvgFonction((x) => evaluerCourbe(params, x), { xMin: viewBox.x[0], xMax: viewBox.x[1], yMin: viewBox.y[0], yMax: viewBox.y[1] }, {
    largeur,
    hauteur: largeur / RATIO_GRAPHE,
    classe: "graphe-transformation",
    points,
  });
}

function construireEnonceTransformationsGraphiques(exercice: ExerciceTransformationGraphique): SectionExercice {
  return {
    enteteFragments: [texte("Le graphique ci-dessous représente une parabole — son sommet S et un second point sont marqués.")],
    enteteHtml: construireGrapheTransformation(exercice, false),
    questions: [
      { consigne: [texte("Détermine l'équation de cette parabole sous la forme "), latex("f(x) = a(x-p)^2 + q"), texte(".")], reponse: { type: "lignes", nombre: 3 } },
    ],
  };
}

function construireCorrectionTransformationsGraphiques(exercice: ExerciceTransformationGraphique): BlocCorrection[] {
  return [
    { type: "paragraphe", fragments: [texte("Sommet lu directement sur le graphique : "), latex(`S(${exercice.p} ; ${exercice.q})`), texte(", donc p et q sont connus.")] },
    { type: "html", html: construireGrapheTransformation(exercice, true) },
    { type: "paragraphe", fragments: [texte("Équation : "), latex(formatEquationTransformationLatex(exercice)), texte(".")] },
  ];
}

export const adaptateurEvaluationTransformationsGraphiques: AdaptateurFeuilleExercices<ExerciceTransformationGraphique> = {
  titreDocument: "Transformations graphiques — Évaluation",
  nomFichierBase: "transformations-graphiques",
  genererInstance: genererExerciceTransformationGraphique,
  construireEnonce: construireEnonceTransformationsGraphiques,
  construireCorrection: construireCorrectionTransformationsGraphiques,
};
