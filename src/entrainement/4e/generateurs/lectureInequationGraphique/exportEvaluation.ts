import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/fragmentsDocx";
import type { ExerciceLectureInequation } from "../../core/lectureInequationGraphique.types";
import { consignesEcrans, enonceFragments, figureSvg, reponseSolutionFragments } from "../../ui/formatLectureInequationGraphique";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceLectureInequation } from "./index";
import { profilLectureInequation } from "./profil";
import { correctionDetailleeLectureInequation } from "./corrigeDetaille";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen117 « Lire une inéquation sur un graphique ».
 * Énoncé papier = la figure (parabole et droite sur un quadrillage d'une unité, AUCUN point marqué :
 * les points communs tombent sur des nœuds de la grille et se lisent) + l'inéquation à résoudre
 * graphiquement ; les trois écrans deviennent les étapes a, b, c du corrigé (figure annotée en c).
 */

function figureHtml(e: ExerciceLectureInequation): string {
  return `<div class="paragraphe" style="text-align:center">${figureSvg(e)}</div>`;
}

function construireEnonce(e: ExerciceLectureInequation): SectionExercice {
  return { enteteFragments: enonceFragments(e), enteteHtml: figureHtml(e), questions: consignesEcrans(e).map((consigne) => ({ consigne })) };
}

function enoncePapier(e: ExerciceLectureInequation): EnoncePapier {
  return {
    section: { enteteFragments: enonceFragments(e), enteteHtml: figureHtml(e), questions: [{ consigne: [texte("Lis les abscisses des points communs sur la grille, puis écris l'ensemble-solution avec les crochets.")] }] },
    etapesParQuestion: [["a", "b", "c"]],
  };
}

function reponseBreve(e: ExerciceLectureInequation): FragmentConsigne[] {
  return reponseSolutionFragments(e);
}

/** Niveau : la lecture des points communs est un écran de pure lecture ; position et ensemble
 * transforment ; méthode imposée (lecture graphique) ; aucun piège dans les données (le contact ou
 * l'absence de point commun sont des issues, pas des pièges posés). */
function criteresDifficulte(): CriteresDifficulte {
  return { etapesTransformation: 2, etapesLecture: 1, methode: 0, piege: 0, nombres: 0, sansCharge: true };
}

function construireCorrection(e: ExerciceLectureInequation): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: ExerciceLectureInequation): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Abscisses des points communs lues")], points: 1 },
      { sousQuestion: "b", critere: [texte("Position de la parabole par rapport à la droite, zone par zone")], points: 1 },
      { sousQuestion: "c", critere: [texte("Ensemble-solution correct, crochets compris")], points: 2 },
    ],
    erreursFrequentes: [
      { description: [texte("Ordonnées des points communs données au lieu des abscisses")], cout: "0 pt sur a)" },
      { description: [texte("Zone inversée (au-dessus / en dessous)")], cout: "0 pt sur b) et c)" },
      { description: [texte("Bonnes bornes, crochets faux")], cout: "moitié des points de c)" },
    ],
    reponsesAcceptees: [[texte("Écriture avec des inégalités (« x ≤ −1 ou x ≥ 3 ») si elle est juste")]],
  };
}

export const adaptateurEvaluationLectureInequation: AdaptateurFeuilleExercices<ExerciceLectureInequation> = {
  profilInstance: profilLectureInequation,
  titreDocument: "Lire une inéquation sur un graphique — Évaluation",
  nomFichierBase: "lire-inequation-graphique",
  genererInstance: genererExerciceLectureInequation,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeLectureInequation,
  bareme,
  enoncePapier,
};
