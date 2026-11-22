/**
 * Adaptateur feuilles d'exercices / évaluations de `gen53` (construction de la parabole au compas
 * et à l'équerre). Énoncé papier = figure sans grille (F, d oblique, et H₁, H₂, H₃ pour la méthode
 * de la médiatrice) + consigne globale qui nomme la méthode ; les étapes (axe, sommet, trois couples
 * ou trois points, tracé) vont dans le corrigé. `forme` = méthode : la même dans toutes les séries.
 */
import type { ExerciceConstructionParabole } from "../../core/constructionParabole.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { ecransConstructionParabole } from "../../moteur/modeleConstructionParabole";
import { correctionDetailleeConstructionParabole, lettresRepetitivesConstruction } from "./corrigeDetaille";
import { svgConstructionParabole } from "../../ui/figureConstructionParabole";
import { consignePapierEcran, fr } from "../../ui/formatConstructionParabole";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceConstructionParabole } from "./index";

type E = ExerciceConstructionParabole;

function enteteEnonce(e: E): FragmentConsigne[] {
  return e.methode === "cercle"
    ? fr("On donne le foyer $F$ et la directrice $d$ d'une parabole.")
    : fr("On donne le foyer $F$ et la directrice $d$ d'une parabole, ainsi que trois points $H_1$, $H_2$ et $H_3$ de $d$.");
}

/** Une question par ÉCRAN de l'appli (`ecransConstructionParabole`, consigne de l'écran) : ce sont
 * les étapes du corrigé (« Étape n — … »), jamais des sous-questions imprimées (énoncé papier). */
function questions(e: E): FragmentConsigne[][] {
  return ecransConstructionParabole(e).map((ecran) => consignePapierEcran(ecran));
}

function construireEnonce(e: E): SectionExercice {
  return {
    enteteFragments: enteteEnonce(e),
    enteteHtml: svgConstructionParabole(e, false),
    questions: questions(e).map((consigne) => ({ consigne })),
  };
}

function enoncePapier(e: E): EnoncePapier {
  const consigne =
    e.methode === "cercle"
      ? fr("On donne le foyer $F$ et la directrice $d$ d'une parabole. Construis au compas et à l'équerre son axe, son sommet $S$, puis au moins six autres points de la parabole par la méthode du cercle et de la parallèle, avec trois ouvertures de compas différentes. Trace enfin la parabole.")
      : fr("On donne le foyer $F$, la directrice $d$ d'une parabole et trois points $H_1$, $H_2$, $H_3$ de $d$. Construis au compas et à l'équerre son axe, son sommet $S$, puis, par la méthode de la médiatrice, les points de la parabole qui se projettent en $H_1$, $H_2$ et $H_3$ sur $d$, ainsi que leurs symétriques par rapport à l'axe. Trace enfin la parabole.");
  return { section: { enteteFragments: consigne, enteteHtml: svgConstructionParabole(e, false), questions: [] } };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [
    { type: "html", html: svgConstructionParabole(e, true) },
    {
      type: "paragraphe",
      fragments:
        e.methode === "cercle"
          ? fr("Un point $P$ est sur la parabole si et seulement si $PF$ est égale à la distance de $P$ à $d$. Avec une ouverture $r$ plus grande que $KS$, le cercle de centre $F$ et de rayon $r$ coupe la parallèle à $d$ située à la distance $r$, du côté de $F$, en deux points de la parabole.")
          : fr("Un point $P$ est sur la parabole si et seulement si $PF = PH$, où $H$ est son projeté orthogonal sur $d$ : $P$ est à la fois sur la perpendiculaire à $d$ en $H$ et sur la médiatrice de $[FH]$."),
    },
  ];
}

function reponseBreve(e: E): FragmentConsigne[] {
  return e.methode === "cercle"
    ? fr("Axe : perpendiculaire à $d$ par $F$ ; $S$ milieu de $[KF]$ ; trois couples de points obtenus avec trois ouvertures différentes ; parabole tracée (voir la figure du corrigé).")
    : fr("Axe : perpendiculaire à $d$ par $F$ ; $S$ milieu de $[KF]$ ; trois points sur les perpendiculaires en $H_1$, $H_2$, $H_3$ et sur les médiatrices, et leurs symétriques ; parabole tracée (voir la figure du corrigé).");
}

function bareme(e: E): BaremeExercice {
  const criteres =
    e.methode === "cercle"
      ? ["Premier couple : arc de centre K, parallèle à d, cercle de centre F de même ouverture", "Deuxième couple (autre ouverture)", "Troisième couple (autre ouverture)"]
      : ["Point de H₁ : perpendiculaire en H₁, médiatrice de [FH₁], symétrique", "Point de H₂ et son symétrique", "Point de H₃ et son symétrique"];
  const erreurs =
    e.methode === "cercle"
      ? [
          { description: fr("Distance reportée depuis $F$ au lieu de la directrice (arc de centre $F$ pour placer la parallèle)"), cout: "0 pt sur le couple" },
          { description: fr("Parallèle tracée du côté de $d$ opposé à $F$"), cout: "0 pt sur le couple" },
          { description: fr("Ouverture changée entre l'arc de centre $K$ et le cercle de centre $F$"), cout: "0 pt sur le couple" },
          { description: fr("Ouverture inférieure à $KS$ : aucun point obtenu"), cout: "0 pt sur le couple" },
        ]
      : [
          { description: fr("Perpendiculaire qui ne passe pas par le point $H$ donné"), cout: "0 pt sur le point" },
          { description: fr("Arcs de la médiatrice tracés avec deux ouvertures différentes"), cout: "0 pt sur le point" },
          { description: fr("Symétrique par rapport à l'axe oublié"), cout: "moitié des points du point" },
        ];
  return {
    reponseFinale: reponseBreve(e),
    criteres:
      e.methode === "cercle"
        ? [
            { sousQuestion: "a", critere: fr("Axe : perpendiculaire à $d$ passant par $F$, tracée à l'équerre"), points: 0.5 },
            { sousQuestion: "b", critere: fr("Sommet $S$ construit comme milieu de $[KF]$ (médiatrice au compas)"), points: 0.5 },
            { sousQuestion: "c", critere: fr("Premier couple : arc de centre $K$, point $A$ sur l'axe du côté de $F$"), points: 0.25 },
            { sousQuestion: "d", critere: fr("Premier couple : parallèle à $d$ passant par $A$"), points: 0.25 },
            { sousQuestion: "e", critere: fr("Premier couple : cercle de centre $F$ de même ouverture, deux points"), points: 0.25 },
            { sousQuestion: "f", critere: [{ type: "texte", valeur: criteres[1]! }], points: 0.75 },
            { sousQuestion: "g", critere: [{ type: "texte", valeur: criteres[2]! }], points: 0.75 },
            { sousQuestion: "h", critere: fr("Courbe lisse par $S$ et les six points, symétrique par rapport à l'axe"), points: 0.75 },
          ]
        : [
            { sousQuestion: "a", critere: fr("Axe : perpendiculaire à $d$ passant par $F$, tracée à l'équerre"), points: 0.5 },
            { sousQuestion: "b", critere: fr("Sommet $S$ construit comme milieu de $[KF]$ (médiatrice au compas)"), points: 0.5 },
            { sousQuestion: "c", critere: fr("Point de $H_1$ : perpendiculaire à $d$ en $H_1$"), points: 0.25 },
            { sousQuestion: "d", critere: fr("Point de $H_1$ : médiatrice de $[FH_1]$, point et symétrique"), points: 0.5 },
            { sousQuestion: "e", critere: [{ type: "texte", valeur: criteres[1]! }], points: 0.75 },
            { sousQuestion: "f", critere: [{ type: "texte", valeur: criteres[2]! }], points: 0.75 },
            { sousQuestion: "g", critere: fr("Courbe lisse par $S$ et les six points, symétrique par rapport à l'axe"), points: 0.75 },
          ],
    erreursFrequentes: [...erreurs, { description: fr("Points reliés par des segments, ou pointe anguleuse au sommet"), cout: "moitié des points du tracé" }],
    reponsesAcceptees:
      e.methode === "cercle"
        ? [fr("Toutes ouvertures distinctes plus grandes que $KS$ (les points obtenus diffèrent du corrigé)")]
        : [fr("Toute ouverture de compas plus grande que la moitié du segment pour chaque médiatrice")],
  };
}

/** Niveau (« Noter un nouveau chapitre ») : axe, sommet et premier couple (ou premier point)
 * transforment ; les couples / points suivants répètent les mêmes gestes et le tracé est un geste à
 * main levée — comptés comme des lectures (écrans répétitifs). Méthode imposée par l'énoncé, aucun
 * piège dans les données, aucun nombre. */
function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeConstructionParabole(e), lettresRepetitivesConstruction(e)), methode: 0, piege: 0, nombres: 0 };
}

function profilInstance(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.methode };
}

export const adaptateurEvaluationConstructionParabole: AdaptateurFeuilleExercices<E> = {
  profilInstance,
  titreDocument: "Construction de la parabole au compas et à l'équerre — Évaluation",
  nomFichierBase: "construction-parabole",
  genererInstance: genererExerciceConstructionParabole,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  construireEnonce,
  construireCorrection,
  reponseBreve,
  correctionDetaillee: correctionDetailleeConstructionParabole,
  criteresDifficulte,
  bareme,
  enoncePapier,
};
