import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { ExerciceIntersectionCercles } from "../../core/intersectionCercles.types";
import { consignesEcrans, enonceFragments, questionPapier, reponsePoints } from "../../ui/formatIntersectionCercles";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceIntersectionCercles } from "./index";
import { profilIntersectionCercles } from "./profil";
import { correctionDetailleeIntersectionCercles } from "./corrigeDetaille";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen98 « Intersection de deux cercles ». Énoncé
 * papier = les deux équations + la consigne globale (points communs) ; les trois écrans deviennent
 * les étapes a, b, c du corrigé. Regroupable a), b), c) (même consigne par variante).
 */

type E = ExerciceIntersectionCercles;

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: enonceFragments(e), questions: consignesEcrans(e).map((consigne) => ({ consigne })) };
}

function enoncePapier(e: E): EnoncePapier {
  return { section: { enteteFragments: enonceFragments(e), questions: [{ consigne: questionPapier(e) }] }, etapesParQuestion: [["a", "b", "c"]] };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return reponsePoints(e);
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

/** Trois étapes qui transforment, méthode 1 (choisir la soustraction / la substitution du cours),
 * sans charge : le nombre de lignes dépend du nombre de points (verdict). Piège dans les données
 * pour cercle-parabole : une solution de l'équation est TOUJOURS à rejeter (ou les deux). Niveau et
 * durée constants dans les trois issues d'une variante. */
function criteresDifficulte(e: E): CriteresDifficulte {
  return { etapesTransformation: 3, etapesLecture: 0, sansCharge: true, methode: 1, piege: e.variante === "cercle-parabole" ? 1 : 0, nombres: 0 };
}

function bareme(e: E): BaremeExercice {
  if (e.variante === "cercle-cercle") {
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [texte("Équations soustraites : équation de la droite des points communs")], points: 1 },
        { sousQuestion: "b", critere: [texte("Substitution, équation du second degré réduite et résolue")], points: 2 },
        { sousQuestion: "c", critere: [texte("Points communs (les deux coordonnées), ou « aucun point commun » justifié")], points: 1 },
      ],
      erreursFrequentes: [
        { description: [texte("Erreur de signe en soustrayant (terme constant additionné)")], cout: "−1 pt ; suite corrigée sans double sanction" },
        { description: [texte("S'arrêter à l'équation de la droite")], cout: "0 pt sur b) et c)" },
        { description: [texte("Oublier de calculer l'autre coordonnée")], cout: "moitié des points sur c)" },
      ],
      reponsesAcceptees: [[texte("Substitution dans "), latex("c_2"), texte(" au lieu de "), latex("c_1")], [texte("Équation résolue par factorisation au lieu du discriminant")]],
    };
  }
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Carré commun remplacé : équation du second degré à une inconnue")], points: 1 },
      { sousQuestion: "b", critere: [texte("Équation développée, réduite et résolue")], points: 1.5 },
      { sousQuestion: "c", critere: [texte("Solution(s) rejetée(s) justifiée(s) (carré négatif) et points communs")], points: 1.5 },
    ],
    erreursFrequentes: [
      { description: [texte("Garder une solution qui rend le carré négatif")], cout: "−1 pt sur c)" },
      { description: [texte("Un seul point pour un carré positif (oubli du ±)")], cout: "−0,5 pt sur c)" },
      { description: [texte("Isoler une coordonnée dans la parabole (équation de degré 4, non résolue)")], cout: "0 pt sur a) et b)" },
    ],
    reponsesAcceptees: [[texte("Soustraction des deux équations membre à membre (elle donne la même équation du second degré)")]],
  };
}

export const adaptateurEvaluationIntersectionCercles: AdaptateurFeuilleExercices<E> = {
  profilInstance: profilIntersectionCercles,
  titreDocument: "Intersection de deux cercles — Évaluation",
  nomFichierBase: "intersection-cercles",
  genererInstance: genererExerciceIntersectionCercles,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeIntersectionCercles,
  bareme,
  enoncePapier,
};
