import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { ExerciceBicarree } from "../../core/bicarree.types";
import { equationLatex, solutionLatex } from "../../ui/formatBicarree";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceBicarree } from "./index";
import { profilBicarree } from "./profil";
import { correctionDetailleeBicarree } from "./corrigeDetaille";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen116. Énoncé papier : « Résous dans ℝ » et
 * l'équation (jamais la méthode) ; les quatre écrans (changement d'inconnue, résolution en t, tri,
 * retour à x) vont dans le corrigé.
 */

type E = ExerciceBicarree;

function entete(e: E): FragmentConsigne[] {
  return [texte("Résous dans ℝ l'équation "), latex(`{${equationLatex(e)}}\\text{.}`)];
}

function construireEnonce(e: E): SectionExercice {
  return {
    enteteFragments: entete(e),
    questions: [
      [texte("Pose une nouvelle inconnue t et écris l'équation obtenue.")],
      [texte("Résous l'équation en t.")],
      [texte("Garde les valeurs de t compatibles avec un carré positif.")],
      [texte("Reviens à x.")],
    ].map((consigne) => ({ consigne: consigne as FragmentConsigne[] })),
  };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return [latex(solutionLatex(e))];
}

function enoncePapier(e: E): EnoncePapier {
  return { section: { enteteFragments: entete(e), questions: [] }, reponseBreve: reponseBreve(e) };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: E): BaremeExercice {
  void e;
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Changement d'inconnue et équation en t")], points: 1 },
      { sousQuestion: "b", critere: [texte("Résolution de l'équation en t")], points: 1 },
      { sousQuestion: "c", critere: [texte("Valeur(s) de t rejetée(s) car un carré est positif")], points: 1 },
      { sousQuestion: "d", critere: [texte("Retour à x : deux solutions opposées par valeur gardée")], points: 1 },
    ],
    erreursFrequentes: [
      { description: [texte("Valeur négative de t gardée (x² = t négatif)")], cout: "−1" },
      { description: [texte("Seulement la racine positive : x² = a donne aussi −√a")], cout: "−0,5" },
      { description: [texte("Réponse donnée en t au lieu de x")], cout: "−1" },
    ],
    reponsesAcceptees: [[texte("Toute autre nouvelle inconnue (u, X…) si la démarche est la même")]],
  };
}

/** Niveau : quatre étapes ; méthode 1 (changement d'inconnue du cours) ; piège dans les données :
 * une valeur de t à rejeter (x² négatif). */
function criteresDifficulte(e: E): CriteresDifficulte {
  const rejet = [e.t1, e.t2].some((t) => t - e.k < 0);
  return { ...etapesDuCorrige(correctionDetailleeBicarree(e)), methode: 1, piege: rejet ? 1 : 0 };
}

export const adaptateurEvaluationBicarree: AdaptateurFeuilleExercices<E> = {
  profilInstance: profilBicarree,
  titreDocument: "Bicarrées et changement de variable — Évaluation",
  nomFichierBase: "bicarree",
  genererInstance: genererExerciceBicarree,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeBicarree,
  bareme,
  enoncePapier,
};
