import type { ExerciceGraphiquesCyclometriques } from "../../core6e/graphiquesCyclometriques.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/corrigeTableau";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { construireGrilleSvgCandidatsCyclo } from "../../export6e/svgGraphCyclo";
import { calculerViewBoxGraphique, formatExpressionLatex } from "../../ui6e/formatGraphiquesCyclometriques";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceGraphiquesCyclometriques } from "./index";
import { correctionDetailleeGraphiquesCyclometriques as correction, lettreCorrecteGraphiquesCyclo, reponseGraphiquesCyclo } from "./corrigeDetaille";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceGraphiquesCyclometriques>` pour `6gen5` (associer
 * graphique et expression d'une fonction cyclométrique) — feuille d'exercices et évaluation.
 *
 * Un seul écran (le graphique, puis les six caractéristiques qui le justifient) : une question
 * d'écran ; papier = « f(x) = … », les candidats A à D (SVG statiques, mêmes données que l'écran)
 * et la consigne globale. Corrigé détaillé partagé avec l'appli (`corrigeDetaille.ts`), figure des
 * candidats (le bon mis en évidence) dans le corrigé seulement.
 */

type E = ExerciceGraphiquesCyclometriques;

function entete(e: E): FragmentConsigne[] {
  return [texte("On considère la fonction "), latex(`f(x)=${formatExpressionLatex(e)}`), texte(".")];
}

const CONSIGNE = "Indique lequel des graphiques représente f, puis justifie ton choix par le domaine, l'image, la parité, l'ordonnée à l'origine, le maximum et le minimum de f.";

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: entete(e), enteteHtml: construireGrilleSvgCandidatsCyclo(e, calculerViewBoxGraphique(e)), questions: [{ consigne: [texte(CONSIGNE)] }] };
}

function enoncePapier(e: E): EnoncePapier {
  return { section: { enteteFragments: [...entete(e), texte(` ${CONSIGNE}`)], enteteHtml: construireGrilleSvgCandidatsCyclo(e, calculerViewBoxGraphique(e)), questions: [] } };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return reponseGraphiquesCyclo(e);
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }, { type: "html", html: construireGrilleSvgCandidatsCyclo(e, calculerViewBoxGraphique(e), e.indexCorrect) }];
}

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: [texte(`Graphique ${lettreCorrecteGraphiquesCyclo(e)}`)],
    criteres: [
      { sousQuestion: "a", critere: [texte("Domaine et image exacts")], points: 1.5 },
      { sousQuestion: "a", critere: [texte("Parité, ordonnée à l'origine, maximum et minimum")], points: 1.5 },
      { sousQuestion: "a", critere: [texte(`Graphique ${lettreCorrecteGraphiquesCyclo(e)}, choix justifié par ces caractéristiques`)], points: 1 },
    ],
    erreursFrequentes: [{ description: [texte("Graphique choisi sans justification")], cout: "moitié des points sur le choix" }],
    reponsesAcceptees: [[texte("Valeurs approchées au centième à la place des valeurs exactes")]],
  };
}

/**
 * Niveau 1–7 — méthode 1 (relever les bonnes caractéristiques et les confronter aux graphiques),
 * piège dans les données : k < 0 (sens inversé, A, B), point exclu (D), deux contraintes de domaine
 * (E), carré qui change le sens (F) ; C (argument en x²) 0. Nombres : valeurs approchées dès
 * qu'une borne n'est pas remarquable (détectées sur le corrigé, « ≈ »).
 */
function criteresDifficulte(e: E): CriteresDifficulte {
  let piege: 0 | 1 = 0;
  if (e.famille === "A" || e.famille === "B") piege = e.reel.k < 0 ? 1 : 0;
  else if (e.famille !== "C") piege = 1;
  return { ...etapesDuCorrige(correction(e)), methode: 1, piege };
}

export const adaptateurEvaluationGraphiquesCyclometriques: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Propriétés de fonctions cyclométriques — Évaluation",
  nomFichierBase: "graphiques-cyclometriques",
  genererInstance: genererExerciceGraphiquesCyclometriques,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0]),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correction,
  bareme,
  enoncePapier,
};
