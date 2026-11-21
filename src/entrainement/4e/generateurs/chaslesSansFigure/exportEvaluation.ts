import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import type { ExerciceChaslesSansFigure } from "../../core/chaslesSansFigure.types";
import { consignesEcrans, donneesEcran, enteteFragments, questionPapier, reponseFinale } from "../../ui/formatChaslesSansFigure";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceChasles } from "./index";
import { profilChasles } from "./profil";
import { correctionDetailleeChasles } from "./corrigeDetaille";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen130 « Chasles sans figure ». Énoncé papier =
 * les données + UNE consigne (réduire, démontrer, exprimer) ; les deux écrans deviennent les étapes
 * a et b du corrigé. Regroupable a), b), c) pour « réduire / simplifier » et « démontrer » (consigne
 * commune, donnée = l'expression ou l'égalité) ; « insérer » garde ses données propres (milieu ou
 * point défini par une égalité).
 */

type E = ExerciceChaslesSansFigure;

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: donneesEcran(e), questions: consignesEcrans(e).map((consigne) => ({ consigne })) };
}

function enoncePapier(e: E): EnoncePapier {
  const entete = enteteFragments(e);
  return { section: { ...(entete.length ? { enteteFragments: entete } : {}), questions: [{ consigne: questionPapier(e) }] }, etapesParQuestion: [["a", "b"]] };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return reponseFinale(e);
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

/** Deux étapes qui transforment. Méthode : imposée pour réduire / simplifier (0), à choisir pour
 * démontrer et insérer (1 : quel point insérer, quel membre transformer). Piège dans les données :
 * vecteurs écrits « à l'envers » avec un « − » (réduire toujours ; simplifier si un terme est
 * retourné — dans `forme`, donc constant d'une série à l'autre). Niveau et durée indépendants du
 * résultat (vecteur nul ou non). */
function criteresDifficulte(e: E): CriteresDifficulte {
  const methode = e.variante === "demontrer" || e.variante === "inserer" ? 1 : 0;
  const piege = e.variante === "reduire" || (e.variante === "coefficients" && (e.retourneK || e.retourneC)) ? 1 : 0;
  return { ...etapesDuCorrige(correctionDetailleeChasles(e), []), sansCharge: true, methode, piege, nombres: 0 };
}

function bareme(e: E): BaremeExercice {
  if (e.variante === "reduire" || e.variante === "coefficients") {
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [texte(e.variante === "reduire" ? "Vecteurs retranchés remplacés par leur opposé (lettres échangées)" : "Termes de même coefficient regroupés et réduits")], points: 2 },
        { sousQuestion: "b", critere: [texte("Relation de Chasles appliquée de proche en proche : un seul vecteur, ou le vecteur nul")], points: 2 },
      ],
      erreursFrequentes: [
        { description: [texte("Signe changé sans échanger les lettres ("), latex("-\\vec{CB}\\to\\vec{CB}"), texte(")")], cout: "0 pt sur l'étape 1, suite corrigée sans double sanction" },
        { description: [texte("Télescoper deux vecteurs qui ne se relaient pas")], cout: "0 pt sur l'étape 2" },
        { description: [texte("Résultat de sens contraire")], cout: "moitié des points sur l'étape 2" },
      ],
      reponsesAcceptees: [[texte("Tout ordre de réduction correct (on peut réordonner autrement)")], [latex("\\vec{AA}"), texte(" écrit pour le vecteur nul, s'il est ensuite noté "), latex("\\vec{0}")]],
    };
  }
  if (e.variante === "demontrer") {
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [texte(e.sousForme === "echange" ? "Point inséré correctement dans un vecteur du membre de gauche" : "Vecteur retranché remplacé par son opposé")], points: 2 },
        { sousQuestion: "b", critere: [texte("Réordonné, réduit par Chasles et conclusion : on obtient l'autre membre")], points: 2 },
      ],
      erreursFrequentes: [
        { description: [texte("Partir de l'égalité à démontrer (raisonnement circulaire)")], cout: "moitié des points" },
        { description: [texte("Insertion mal enchaînée ("), latex("\\vec{PQ}=\\vec{PS}+\\vec{QS}"), texte(")")], cout: "0 pt sur l'étape 1" },
      ],
      reponsesAcceptees: [[texte("Transformer le membre de droite jusqu'à obtenir celui de gauche")], [texte("Insérer un autre point, si toutes les lignes sont justes")]],
    };
  }
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Point inséré par la relation de Chasles, termes regroupés")], points: 2 },
      { sousQuestion: "b", critere: [texte(e.sousForme === "milieu" ? "Somme nulle du milieu utilisée, résultat" : "Vecteur isolé, signe et coefficient justes")], points: 2 },
    ],
    erreursFrequentes: [
      { description: [texte("Insertion mal enchaînée (point inséré écrit à l'arrivée des deux vecteurs)")], cout: "0 pt sur l'étape 1" },
      { description: [texte(e.sousForme === "milieu" ? "Facteur 2 oublié" : "Signe perdu en retournant le vecteur")], cout: "−1 pt" },
    ],
    reponsesAcceptees: [[texte("Toute insertion correcte d'un autre point, si elle mène au résultat")]],
  };
}

export const adaptateurEvaluationChasles: AdaptateurFeuilleExercices<E> = {
  profilInstance: profilChasles,
  titreDocument: "Chasles sans figure — Évaluation",
  nomFichierBase: "chasles-sans-figure",
  genererInstance: genererExerciceChasles,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeChasles,
  bareme,
  enoncePapier,
};
