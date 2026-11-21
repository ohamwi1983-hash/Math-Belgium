import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CriteresDifficulte,
  EnoncePapier,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { correctionDetailleeDemontrerVecteurs } from "./corrigeDetaille";
import type { ExerciceDemontrerVecteurs } from "../../core/demontrerVecteurs.types";
import { coefficientsVecteur } from "../../moteur/modeleDemontrerVecteurs";
import {
  aDemontrerFragments,
  combinaisonLatex,
  conclusionFragments,
  consignesEcrans,
  enonceFragments,
  uLatex,
  vLatex,
  vecLatex,
} from "../../ui/formatDemontrerVecteurs";
import { construireFigureDemontrerVecteurs } from "../../ui/figureDemontrerVecteurs";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDemontrerVecteurs } from "./index";
import { profilDemontrerVecteurs } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen85. Énoncé papier = figure de base + relations
 * qui définissent E et F + figure + « Démontre que … » (ce qu'il faut démontrer, JAMAIS la méthode —
 * décision de l'utilisateur). Les quatre écrans (base, expressions, coefficient k, conclusion)
 * deviennent les étapes a, b, c, d du corrigé ; la figure avec les deux vecteurs utiles va dans le
 * corrigé (`figureHtml`). Séries équilibrées : `profil.ts`.
 */

function figureEnonce(e: ExerciceDemontrerVecteurs): string {
  return construireFigureDemontrerVecteurs(e, { theme: "papier" });
}

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: ExerciceDemontrerVecteurs): SectionExercice {
  return {
    enteteFragments: [...enonceFragments(e), texte(" "), ...aDemontrerFragments(e)],
    enteteHtml: figureEnonce(e),
    questions: consignesEcrans(e).map((consigne) => ({ consigne })),
  };
}

function enoncePapier(e: ExerciceDemontrerVecteurs): EnoncePapier {
  return {
    section: {
      enteteFragments: enonceFragments(e),
      enteteHtml: figureEnonce(e),
      questions: [{ consigne: aDemontrerFragments(e) }],
    },
    etapesParQuestion: [["a", "b", "c", "d"]],
  };
}

function reponseBreve(e: ExerciceDemontrerVecteurs): FragmentConsigne[] {
  return conclusionFragments(e, "juste");
}

function correctionDetaillee(e: ExerciceDemontrerVecteurs): EtapeCorrection[] {
  return correctionDetailleeDemontrerVecteurs(e);
}

function criteresDifficulte(_e: ExerciceDemontrerVecteurs): CriteresDifficulte {
  // Démonstration sans méthode donnée sur papier (« Démontre que… ») : l'élève choisit la base, exprime, compare — méthode 2 ; piège : une conclusion où les vecteurs sont seulement colinéaires sans point commun (parallèles) ou un Chasles avec signe — constant 0 (ce que la cible demande est l'issue). Niveau constant par cible : sansCharge.
  return { etapesTransformation: 4, etapesLecture: 0, sansCharge: true, methode: 2, piege: 0, nombres: 0 };
}

function construireCorrection(e: ExerciceDemontrerVecteurs): BlocCorrection[] {
  return [
    { type: "paragraphe", fragments: [latex(`${vecLatex(e.w)} = ${combinaisonLatex(coefficientsVecteur(e, e.w), uLatex(), vLatex(e))}`), texte(" et "), latex(`${vecLatex(e.v)} = ${combinaisonLatex(coefficientsVecteur(e, e.v), uLatex(), vLatex(e))}`), texte(".")] },
    { type: "paragraphe", fragments: conclusionFragments(e, "juste") },
  ];
}

function propriete(e: ExerciceDemontrerVecteurs): string {
  switch (e.cible.type) {
    case "alignes":
      return "vecteurs colinéaires ET point commun";
    case "paralleles":
      return "vecteurs colinéaires, droites distinctes";
    case "milieu":
      return "deux vecteurs égaux bout à bout";
    case "parallelogramme":
      return "deux côtés opposés représentant le même vecteur, dans l'ordre des sommets";
  }
}

function bareme(e: ExerciceDemontrerVecteurs): BaremeExercice {
  const type = e.cible.type;
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Base adaptée : deux vecteurs non colinéaires (de préférence de même origine, sur les côtés)")], points: 0.5 },
      { sousQuestion: "b", critere: [texte("Les deux vecteurs utiles exprimés dans la base, par la relation de Chasles")], points: 1.5 },
      { sousQuestion: "c", critere: [texte("Coefficients proportionnels : k trouvé et vérifié sur les deux coefficients")], points: 1 },
      { sousQuestion: "d", critere: [texte(`Conclusion qui cite la propriété (${propriete(e)})`)], points: 1 },
    ],
    erreursFrequentes: [
      { description: [texte("Chasles mal enchaîné (un vecteur XA remplacé par AX au lieu de −AX) : signe d'un coefficient faux")], cout: "0,5 pt par vecteur" },
      { description: [texte("Proportionnalité testée sur un seul coefficient")], cout: "0,5 pt" },
      type === "alignes" || type === "paralleles"
        ? { description: [texte("Parallélisme et alignement confondus (point commun oublié ou inventé)")], cout: "0 pt sur la conclusion" }
        : { description: [texte("Ordre des points ou des sommets inversé dans la conclusion")], cout: "0,5 pt" },
    ],
    reponsesAcceptees: [[texte("Toute autre base adaptée correctement utilisée (calculs justes), et k écrit sous forme décimale exacte")]],
  };
}

export const adaptateurEvaluationDemontrerVecteurs: AdaptateurFeuilleExercices<ExerciceDemontrerVecteurs> = {
  profilInstance: profilDemontrerVecteurs,
  titreDocument: "Démontrer avec des vecteurs — Évaluation",
  nomFichierBase: "demontrer-avec-des-vecteurs",
  genererInstance: genererExerciceDemontrerVecteurs,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
};
