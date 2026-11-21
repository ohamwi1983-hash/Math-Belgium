import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import type { ExerciceVecteursDirecteurs } from "../../core/vecteursDirecteurs.types";
import { consignesEcrans, enonceFragments, figureEnonce, questionsPapier, reponseA, reponseB, reponseC } from "../../ui/formatVecteursDirecteurs";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceVecteursDirecteurs } from "./index";
import { profilVecteursDirecteurs } from "./profil";
import { correctionDetailleeVecteursDirecteurs } from "./corrigeDetaille";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen129 « Vecteurs directeurs d'une droite »
 * (Connaître). Énoncé papier = figure + phrase de l'énoncé + trois VRAIES questions distinctes (un
 * vecteur directeur de d ; lesquels parmi cinq ; un vecteur directeur de g d'après son équation) :
 * elles restent en a) b) c), une étape du corrigé chacune. Jamais regroupé (vraies questions).
 */

type E = ExerciceVecteursDirecteurs;

function construireEnonce(e: E): SectionExercice {
  return { enteteHtml: figureEnonce(e), enteteFragments: enonceFragments(e), questions: consignesEcrans(e).map((consigne) => ({ consigne })) };
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteHtml: figureEnonce(e), enteteFragments: enonceFragments(e), questions: questionsPapier(e).map((consigne) => ({ consigne })) },
    etapesParQuestion: [["a"], ["b"], ["c"]],
  };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return [texte("a) "), ...reponseA(e), texte(" ; b) "), ...reponseB(e), texte(" ; c) "), ...reponseC(e)];
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

/** Connaître : a) lire deux points et soustraire (une étape), b) critère de colinéarité sur cinq
 * vecteurs (une étape), c) lecture du coefficient m dans l'équation (écran de lecture). Méthode
 * imposée (0), aucun piège dans les données ; niveau et durée identiques quel que soit le nombre de
 * vecteurs directeurs (la réponse de l'écran b). */
function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeVecteursDirecteurs(e), ["c"]), sansCharge: true, methode: 0, piege: 0, nombres: 0 };
}

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Points lus et composantes « arrivée moins départ » : un vecteur directeur de d")], points: 1.5 },
      { sousQuestion: "b", critere: [texte("Les vecteurs directeurs cochés, et eux seuls (colinéarité justifiée)")], points: 1.5 },
      { sousQuestion: "c", critere: [texte("Vecteur directeur de g lu sur son équation")], points: 1 },
    ],
    erreursFrequentes: [
      { description: [texte("Composantes échangées (écart des y en premier)")], cout: "0 pt sur la question concernée" },
      { description: [texte("Vecteur perpendiculaire coché, ou opposé rejeté")], cout: "−0,5 pt par vecteur mal classé" },
      { description: [texte("Ordonnée à l'origine p prise comme seconde composante")], cout: "0 pt sur c)" },
    ],
    reponsesAcceptees: [[texte("Tout multiple non nul d'un vecteur directeur (l'opposé, "), latex("\\dfrac{1}{2}"), texte(" fois…)")], [texte("Composantes fractionnaires, par exemple "), latex("\\begin{pmatrix}1\\\\m\\end{pmatrix}")]],
  };
}

export const adaptateurEvaluationVecteursDirecteurs: AdaptateurFeuilleExercices<E> = {
  profilInstance: profilVecteursDirecteurs,
  titreDocument: "Vecteurs directeurs d'une droite — Évaluation",
  nomFichierBase: "vecteurs-directeurs",
  genererInstance: genererExerciceVecteursDirecteurs,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeVecteursDirecteurs,
  bareme,
  enoncePapier,
};
