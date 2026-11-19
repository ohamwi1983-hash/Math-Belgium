import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/fragmentsDocx";
import type { ExerciceMethodeNombreSolutions } from "../../core/methodeNombreSolutions.types";
import { aEcranSolutions } from "../../moteur/modeleMethodeNombreSolutions";
import { consignesEcrans, enonceFragments, libelleMethode, nombreSolutionsTexte, reponseSolutionsFragments, souderPonctuation } from "../../ui/formatMethodeNombreSolutions";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceMethodeNombreSolutions } from "./index";
import { profilMethodeNombreSolutions } from "./profil";
import { correctionDetailleeMethodeNombreSolutions } from "./corrigeDetaille";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen113 « Reconnaître la méthode et le nombre de
 * solutions ». Énoncé papier = l'équation + la consigne globale (méthode, nombre de solutions justifié,
 * solutions si elles sont évidentes) ; les écrans deviennent les étapes a, b (et c) du corrigé.
 */

const CONSIGNE_PAPIER = "Sans calculer le discriminant quand un raccourci existe : donne la méthode la plus rapide pour résoudre cette équation et son nombre de solutions, en le justifiant en une ligne ; si ses solutions sont évidentes, donne-les.";

function construireEnonce(e: ExerciceMethodeNombreSolutions): SectionExercice {
  const c = consignesEcrans();
  return { enteteFragments: enonceFragments(e), questions: (aEcranSolutions(e) ? c : c.slice(0, 2)).map((consigne) => ({ consigne })) };
}

function enoncePapier(e: ExerciceMethodeNombreSolutions): EnoncePapier {
  return {
    section: { enteteFragments: enonceFragments(e), questions: [{ consigne: [texte(CONSIGNE_PAPIER)] }] },
    etapesParQuestion: [aEcranSolutions(e) ? ["a", "b", "c"] : ["a", "b"]],
  };
}

function reponseBreve(e: ExerciceMethodeNombreSolutions): FragmentConsigne[] {
  const debut = texte(`${libelleMethode(e.methode)} ; ${nombreSolutionsTexte(e)}`);
  return souderPonctuation(aEcranSolutions(e) ? [debut, texte(" : "), ...reponseSolutionsFragments(e)] : [debut, texte(".")]);
}

/** Niveau (grille commune) : CONSTANT pour toutes les instances — la méthode est le verdict, et le
 * nombre d'écrans (2 ou 3) en dépend : un niveau ou une durée qui varierait avec lui trahirait la
 * réponse. Deux écrans de raisonnement (méthode, nombre) + les solutions évidentes comptées comme
 * une lecture ; méthode : choisir parmi les techniques du cours (1). */
function criteresDifficulte(): CriteresDifficulte {
  return { etapesTransformation: 2, etapesLecture: 1, methode: 1, piege: 0, nombres: 0, sansCharge: true };
}

function construireCorrection(e: ExerciceMethodeNombreSolutions): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: ExerciceMethodeNombreSolutions): BaremeExercice {
  const avecSol = aEcranSolutions(e);
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Méthode la plus rapide reconnue")], points: avecSol ? 1.5 : 2 },
      { sousQuestion: "b", critere: [texte("Nombre de solutions justifié en une ligne")], points: avecSol ? 1.5 : 2 },
      ...(avecSol ? [{ sousQuestion: "c", critere: [texte("Solutions correctes")], points: 1 }] : []),
    ],
    erreursFrequentes: [
      { description: [texte("Discriminant calculé alors qu'un raccourci s'appliquait")], cout: "moitié des points de a)" },
      { description: [texte("Nombre de solutions donné sans justification")], cout: "moitié des points de b)" },
    ],
    reponsesAcceptees: e.methode === "racineEvidente" ? [[texte("Méthode « discriminant » acceptée (décision du professeur : la racine évidente est plus rapide, le discriminant reste juste)")]] : [],
  };
}

export const adaptateurEvaluationMethodeNombreSolutions: AdaptateurFeuilleExercices<ExerciceMethodeNombreSolutions> = {
  profilInstance: profilMethodeNombreSolutions,
  titreDocument: "Méthode et nombre de solutions — Évaluation",
  nomFichierBase: "methode-nombre-solutions",
  genererInstance: genererExerciceMethodeNombreSolutions,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeMethodeNombreSolutions,
  bareme,
  enoncePapier,
};
