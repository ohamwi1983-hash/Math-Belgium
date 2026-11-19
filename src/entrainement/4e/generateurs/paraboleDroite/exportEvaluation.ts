import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { ExerciceParaboleDroite } from "../../core/paraboleDroite.types";
import { fLatex, gLatex, inequationLatex, pointsLatex, solutionInequation } from "../../ui/formatParaboleDroite";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceParaboleDroite } from "./index";
import { profilParaboleDroite } from "./profil";
import { correctionDetailleeParaboleDroite } from "./corrigeDetaille";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { ensembleLatex } from "../../moteur/algebreTransfertSecondDegre";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen118. Deux VRAIES questions sur papier :
 * a) les points communs (étapes « ramener à 0 », « résoudre », « ordonnées »), b) l'inéquation
 * (étape « position »). La figure (parabole, droite, points communs) est dans le corrigé seulement.
 */

type E = ExerciceParaboleDroite;

function entete(e: E): FragmentConsigne[] {
  return [texte("On donne "), latex(`f(x)=${fLatex(e)}`), texte(" et "), latex(`g(x)=${gLatex(e)}\\text{.}`)];
}

function questions(e: E): FragmentConsigne[][] {
  return [
    [texte("Détermine les coordonnées des points communs à la parabole d'équation "), latex("y=f(x)"), texte(" et à la droite d'équation "), latex("y=g(x)\\text{.}")],
    [texte("Résous l'inéquation "), latex(`${inequationLatex(e)}\\text{.}`)],
  ];
}

function construireEnonce(e: E): SectionExercice {
  const consignes: FragmentConsigne[][] = [
    [texte("Ramène l'équation "), latex("f(x)=g(x)"), texte(" à 0.")],
    [texte("Résous-la.")],
    ...(e.communs.length ? [[texte("Calcule les ordonnées des points communs.")]] : []),
    [texte("Résous "), latex(`${inequationLatex(e)}\\text{.}`)],
  ];
  return { enteteFragments: entete(e), questions: consignes.map((consigne) => ({ consigne })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  const S = ensembleLatex(solutionInequation(e));
  return [texte("a) "), ...(e.communs.length ? [latex(pointsLatex(e))] : [texte("aucun point commun")]), texte(" ; b) "), latex(`S=${S}`)];
}

function enoncePapier(e: E): EnoncePapier {
  const pts = e.communs.length ? ["a", "b", "c"] : ["a", "b"];
  return { section: { enteteFragments: entete(e), questions: questions(e).map((consigne) => ({ consigne })) }, etapesParQuestion: [pts, [e.communs.length ? "d" : "c"]], reponseBreve: reponseBreve(e) };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: E): BaremeExercice {
  const avec = e.communs.length > 0;
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("f(x) = g(x) ramené à 0 correctement")], points: 1 },
      { sousQuestion: "b", critere: [texte("Résolution (discriminant, solutions)")], points: avec ? 1 : 1.5 },
      ...(avec ? [{ sousQuestion: "c", critere: [texte("Ordonnées des points communs")], points: 0.5 }] : []),
      { sousQuestion: avec ? "d" : "c", critere: [texte("Inéquation par le signe de f − g, crochets corrects")], points: 1.5 },
    ],
    erreursFrequentes: [
      { description: [texte("g(x) ajouté au lieu d'être soustrait, ou parenthèse oubliée")], cout: "0 pt sur l'étape 1" },
      { description: [texte("Ordonnée prise égale à 0 (confusion avec f(x) − g(x))")], cout: "−0,5" },
      { description: [texte("Signe de f seul au lieu du signe de f − g")], cout: "−1" },
    ],
    reponsesAcceptees: [[texte("Ordonnées calculées avec f au lieu de g")]],
  };
}

/** Niveau : 3 ou 4 étapes ; méthode 1 (procédure du cours : ramener à 0, Δ, signe) ; pas de piège
 * dans les données. */
function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeParaboleDroite(e)), methode: 1, piege: 0 };
}

export const adaptateurEvaluationParaboleDroite: AdaptateurFeuilleExercices<E> = {
  profilInstance: profilParaboleDroite,
  titreDocument: "Parabole et droite — Évaluation",
  nomFichierBase: "parabole-droite",
  genererInstance: genererExerciceParaboleDroite,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeParaboleDroite,
  bareme,
  enoncePapier,
};
