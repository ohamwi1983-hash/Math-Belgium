import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import type { ExerciceEquationParabolePoints } from "../../core/equationParabolePoints.types";
import { consignesEcrans, enonceFragments, figure, reponseEquation } from "../../ui/formatEquationParabolePoints";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceEquationParabolePoints } from "./index";
import { profilEquationParabole } from "./profil";
import { correctionDetailleeEquationParabole } from "./corrigeDetaille";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen125 « Retrouver l'équation d'une parabole ».
 * Énoncé papier = les données (ou la figure, P marqué, pour la variante graphique), qui contiennent
 * déjà la consigne globale « Détermine son équation, sous forme développée » ; les trois écrans
 * deviennent les étapes a (forme de départ), b (coefficient(s)), c (développement) du corrigé.
 */

type E = ExerciceEquationParabolePoints;

function figureHtml(e: E): string | undefined {
  return e.variante === "graphique" ? `<div class="paragraphe" style="text-align:center">${figure(e)}</div>` : undefined;
}

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: enonceFragments(e), enteteHtml: figureHtml(e), questions: consignesEcrans(e).map((consigne) => ({ consigne })) };
}

function enoncePapier(e: E): EnoncePapier {
  return { section: { enteteFragments: enonceFragments(e), enteteHtml: figureHtml(e), questions: [] }, etapesParQuestion: [] };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return reponseEquation(e);
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

/** Niveau : trois étapes qui transforment (la forme de départ est une décision) ; méthode 0 quand
 * les données imposent la forme (sommet, zéros), 1 quand l'élève doit voir ce qui se lit (graphique)
 * ou monter un système (trois points) ; aucun piège dans les données. */
function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeEquationParabole(e)), methode: e.variante === "graphique" || e.variante === "troisPoints" ? 1 : 0, piege: 0 };
}

function bareme(e: E): BaremeExercice {
  const systeme = e.donnees === "troisPoints";
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: systeme ? [texte("Forme développée avec "), latex("c=f(0)")] : [texte(e.donnees === "sommet" ? "Forme canonique écrite avec le sommet" : "Forme factorisée écrite avec les zéros")], points: 1 },
      { sousQuestion: "b", critere: systeme ? [texte("Système résolu : "), latex("a"), texte(" et "), latex("b")] : [texte("Coefficient "), latex("a"), texte(" calculé avec le point P")], points: systeme ? 2 : 1.5 },
      { sousQuestion: "c", critere: [texte("Équation développée et réduite")], points: systeme ? 1 : 1.5 },
    ],
    erreursFrequentes: systeme
      ? [
          { description: [texte("c pris sur un autre point que celui d'abscisse 0")], cout: "0 pt sur a)" },
          { description: [texte("Erreur de signe en éliminant "), latex("b")], cout: "−1 sur b)" },
        ]
      : [
          { description: [texte("Signe changé à tort dans la parenthèse (sommet ou zéros lus avec le mauvais signe)")], cout: "−1" },
          { description: [texte("Point P pris pour le sommet")], cout: "0 pt sur a) et b)" },
          { description: [latex("a"), texte(" distribué seulement sur "), latex("x^2")], cout: "−0,5 sur c)" },
        ],
    reponsesAcceptees: [[texte("Équation laissée sous forme canonique ou factorisée si elle est juste (−0,5 : la forme développée était demandée)")]],
  };
}

export const adaptateurEvaluationEquationParabolePoints: AdaptateurFeuilleExercices<E> = {
  profilInstance: profilEquationParabole,
  titreDocument: "Retrouver l'équation d'une parabole — Évaluation",
  nomFichierBase: "equation-parabole-points",
  genererInstance: genererExerciceEquationParabolePoints,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeEquationParabole,
  bareme,
  enoncePapier,
};
