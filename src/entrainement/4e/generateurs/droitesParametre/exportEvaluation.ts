import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/fragmentsDocx";
import type { ExerciceDroitesParametre } from "../../core/droitesParametre.types";
import { consigneGlobale, ecrans, enonceFragments, reponseBreveFragments } from "../../ui/formatDroitesParametre";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDroitesParametre } from "./index";
import { correctionDetailleeDroitesParametre } from "./corrigeDetaille";
import { profilDroitesParametre } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen95 « Droites dépendant d'un paramètre ».
 * Énoncé papier = la famille dₘ (et d ou P) + la consigne globale ; les trois écrans (condition,
 * équation en m, valeurs) vont dans le corrigé. Mêmes fonctions que l'appli.
 */

type E = ExerciceDroitesParametre;

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: enonceFragments(e), questions: ecrans(e).map((ec) => ({ consigne: ec.consigne })) };
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: enonceFragments(e), questions: [{ consigne: [texte(consigneGlobale(e))] }] },
    etapesParQuestion: [["a", "b", "c"]],
  };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return reponseBreveFragments(e);
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Condition juste (critère de colinéarité, produit scalaire, point, coefficient nul)")], points: 1 },
      { sousQuestion: "b", critere: [texte("Équation en m posée avec les coefficients de dₘ et développée")], points: 1.5 },
      { sousQuestion: "c", critere: [texte("Équation résolue et chaque solution contrôlée (dₘ reste une droite)")], points: 1.5 },
    ],
    erreursFrequentes: [
      { description: [texte("Critère de colinéarité et produit scalaire confondus (ou coefficients de x et de y échangés)")], cout: "0 pt sur a) et b)" },
      { description: [texte("Valeur de m gardée alors qu'elle annule les deux coefficients de x et de y")], cout: "−1" },
      { description: [texte("Erreur de signe en développant la condition")], cout: "−0,5" },
    ],
    reponsesAcceptees: [[texte("Toute équation en m équivalente (multipliée par une constante non nulle)")]],
  };
}

/** Niveau CONSTANT dans la variante : le nombre de valeurs est le verdict, et le niveau imprimé ne doit
 * pas le trahir. Trois étapes sans charge (le contrôle des coefficients s'écrit toujours), méthode
 * imposée (0) ; piège 1 pour toutes les instances : une valeur à rejeter est toujours possible dans les
 * données et le contrôle est toujours exigé. */
function criteresDifficulte(): CriteresDifficulte {
  return { etapesTransformation: 3, etapesLecture: 0, sansCharge: true, methode: 0, piege: 1, nombres: 0 };
}

export const adaptateurEvaluationDroitesParametre: AdaptateurFeuilleExercices<E> = {
  profilInstance: profilDroitesParametre,
  titreDocument: "Droites dépendant d'un paramètre — Évaluation",
  nomFichierBase: "droites-parametre",
  genererInstance: genererExerciceDroitesParametre,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeDroitesParametre,
  bareme,
  enoncePapier,
};
