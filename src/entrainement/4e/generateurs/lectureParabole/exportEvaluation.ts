import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, GroupeVerdict, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import type { ExerciceLectureParabole } from "../../core/lectureParabole.types";
import { consignePapier, consignesEcrans, enonceFragments, figure, reponseComplete } from "../../ui/formatLectureParabole";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceLectureParabole } from "./index";
import { profilLectureParabole } from "./profil";
import { correctionDetailleeLectureParabole } from "./corrigeDetaille";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen123 « Lire une parabole sur un graphique ».
 * Énoncé papier = la figure (quadrillage d'une unité, échelle unique, AUCUN point marqué : sommet,
 * zéros et ordonnée à l'origine tombent sur des nœuds) + l'énoncé + la consigne globale ; les quatre
 * écrans deviennent les étapes a–d du corrigé (figure annotée en d).
 */

type E = ExerciceLectureParabole;

function figureHtml(e: E): string {
  return `<div class="paragraphe" style="text-align:center">${figure(e)}</div>`;
}

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: enonceFragments(), enteteHtml: figureHtml(e), questions: consignesEcrans().map((consigne) => ({ consigne })) };
}

function enoncePapier(e: E): EnoncePapier {
  return { section: { enteteFragments: enonceFragments(), enteteHtml: figureHtml(e), questions: [{ consigne: consignePapier() }] }, etapesParQuestion: [["a", "b", "c", "d"]] };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return reponseComplete(e);
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

/** Niveau : b (sommet, axe), c (zéros, f(0)) et d (image) sont des écrans de pure lecture ; a
 * (signes) raisonne avec x_S = −b/(2a). Méthode imposée (lecture), aucun piège dans les données. Le
 * nombre de zéros est le verdict du groupe : niveau et durée ne dépendent pas de lui (constants). */
function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeLectureParabole(e), ["b", "c", "d"]), methode: 0, piege: 0, nombres: 0 };
}

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Signes de a, b et c justifiés (ouverture, ordonnée à l'origine, position de l'axe)")], points: 1 },
      { sousQuestion: "b", critere: [texte("Sommet et équation de l'axe de symétrie")], points: 1 },
      { sousQuestion: "c", critere: [texte("Zéros (ou « aucun ») et ordonnée à l'origine")], points: 1 },
      { sousQuestion: "d", critere: [texte("Image, sens et crochet compris")], points: 1 },
    ],
    erreursFrequentes: [
      { description: [texte("Signe de b lu seul (sans tenir compte du signe de a)")], cout: "−0,5 sur a)" },
      { description: [texte("Axe écrit "), latex("y=y_S"), texte(" au lieu de "), latex("x=x_S")], cout: "−0,5 sur b)" },
      { description: [texte("Image bornée par "), latex("x_S"), texte(", ou crochet ouvert au sommet")], cout: "−0,5 sur d)" },
    ],
    reponsesAcceptees: [[texte("Image écrite avec une inégalité ("), latex("f(x)\\geq y_S"), texte(" pour tout x) si elle est juste")]],
  };
}

const GROUPES_VERDICT: GroupeVerdict[] = [{ id: "groupe_zeros", label: "Nombre de zéros (au hasard : deux, un ou aucun)", variantes: ["deuxZeros", "unZero", "aucunZero"] }];

export const adaptateurEvaluationLectureParabole: AdaptateurFeuilleExercices<E> = {
  profilInstance: profilLectureParabole,
  titreDocument: "Lire une parabole sur un graphique — Évaluation",
  nomFichierBase: "lire-parabole-graphique",
  genererInstance: genererExerciceLectureParabole,
  catalogueVariantes: CATALOGUE_VARIANTES,
  groupesVerdict: GROUPES_VERDICT,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeLectureParabole,
  bareme,
  enoncePapier,
};
