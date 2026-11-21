import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { ExerciceTrajectoires } from "../../core/trajectoiresRencontre.types";
import { consignesEcrans, enonceFragments, questionPapier, reponseE, reponseK, reponseVerdict } from "../../ui/formatTrajectoires";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceTrajectoires } from "./index";
import { profilTrajectoires } from "./profil";
import { correctionDetailleeTrajectoires } from "./corrigeDetaille";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen97 « Trajectoires et rencontre ». Énoncé
 * papier = contexte, positions paramétriques et UNE question globale (collision ? sinon point de
 * croisement et écart de temps) ; les écrans deviennent les étapes du corrigé (a–e, ou a, b pour des
 * trajectoires parallèles).
 */

type E = ExerciceTrajectoires;

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: enonceFragments(e), questions: consignesEcrans(e).map((consigne) => ({ consigne })) };
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: enonceFragments(e), questions: [{ consigne: questionPapier(e) }] },
    etapesParQuestion: [e.verdict === "paralleles" ? ["a", "b"] : ["a", "b", "c", "d", "e"]],
  };
}

function reponseBreve(e: E): FragmentConsigne[] {
  if (e.verdict === "paralleles") return reponseVerdict(e);
  if (e.verdict === "collision") return [texte("Collision au point "), ...reponseK(e), texte(", à l'instant "), ...reponseE(e), texte(".")];
  return [texte("Pas de collision : les trajectoires se croisent en "), ...reponseK(e), texte(", passages séparés de "), ...reponseE(e), texte(".")];
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

/** Niveau et durée CONSTANTS dans les trois verdicts (le nombre d'écrans trahirait sinon des
 * trajectoires parallèles) : quatre étapes qui transforment (nature, système, point, décision) et
 * une réponse en contexte lue sur les instants ; méthode 1 (outils du cours : critère de
 * colinéarité, système) ; aucun piège dans les données. */
function criteresDifficulte(_e: E): CriteresDifficulte {
  return { etapesTransformation: 4, etapesLecture: 1, sansCharge: true, methode: 1, piege: 0, nombres: 0 };
}

function bareme(e: E): BaremeExercice {
  if (e.verdict === "paralleles") {
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [texte("Vecteurs directeurs lus et critère de colinéarité calculé (nul)")], points: 2 },
        { sousQuestion: "a", critere: [texte("Départ du mobile 2 hors de la trajectoire 1 : parallèles distinctes")], points: 1 },
        { sousQuestion: "b", critere: [texte("Conclusion : aucune rencontre possible")], points: 1 },
      ],
      erreursFrequentes: [
        { description: [texte("Conclure « confondues » sans tester un point")], cout: "−1 pt" },
        { description: [texte("Résolution d'un système sans solution sans l'interpréter")], cout: "−1 pt" },
      ],
      reponsesAcceptees: [[texte("Parallélisme justifié par des vecteurs directeurs multiples l'un de l'autre")]],
    };
  }
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Critère de colinéarité non nul : trajectoires sécantes")], points: 0.5 },
      { sousQuestion: "b", critere: [texte("Système à deux inconnues "), latex("t_1"), texte(", "), latex("t_2"), texte(" posé et résolu")], points: 1.5 },
      { sousQuestion: "c", critere: [texte("Point commun K")], points: 0.5 },
      { sousQuestion: "d", critere: [texte("Conclusion justifiée par la comparaison de "), latex("t_1"), texte(" et "), latex("t_2")], points: 1 },
      { sousQuestion: "e", critere: [texte(e.verdict === "collision" ? "Instant de la collision, avec l'unité" : "Écart de temps, avec l'unité")], points: 0.5 },
    ],
    erreursFrequentes: [
      { description: [texte("Un seul paramètre t pour les deux mobiles (système sans solution ou mal interprété)")], cout: "0 pt sur b) et d)" },
      { description: [latex("t_1"), texte(" remplacé dans les équations du mobile 2")], cout: "0 pt sur c)" },
      { description: [texte("Conclure à une collision dès que les trajectoires se coupent")], cout: "0 pt sur d)" },
    ],
    reponsesAcceptees: [[texte("Système résolu par substitution")], [texte("K calculé avec le mobile 2 à l'instant "), latex("t_2")]],
  };
}

export const adaptateurEvaluationTrajectoires: AdaptateurFeuilleExercices<E> = {
  profilInstance: profilTrajectoires,
  titreDocument: "Trajectoires et rencontre — Évaluation",
  nomFichierBase: "trajectoires-rencontre",
  genererInstance: genererExerciceTrajectoires,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeTrajectoires,
  bareme,
  enoncePapier,
};
