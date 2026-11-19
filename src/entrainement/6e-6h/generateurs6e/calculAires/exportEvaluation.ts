import type { ExerciceCalculAires } from "../../core6e/calculAires.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatCalculAires";
import { CONSIGNE_PRECISION } from "../../ui6e/nombresExactsIntegrales";
import { phasesPourExercice } from "../../moteur6e/typesCalculAires";
import type { PhaseCalculAires } from "../../moteur6e/typesCalculAires";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceCalculAires } from "./index";
import type { IdVarianteCalculAires } from "./index";
import { donneesPapier, nettoyerConsigne } from "./papierCommun";
import { LIBELLE_CAS_CALCUL_AIRES, profilCalculAires } from "./profilEvaluation";
import { correctionDetailleeCalculAires, piegeCalculAires } from "./corrigeDetaille";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceCalculAires>` pour `6gen26` (Calcul d'aires par
 * intégrale) — feuille d'exercices et évaluation, méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - `construireEnonce` : une question par ÉCRAN du générateur (= une étape, lettres a, b… dans l'ordre
 *   des écrans) ; ses consignes (`consigneEcran`, nettoyées des tournures d'écran) deviennent les
 *   titres « Étape n — … » du corrigé.
 * - `enoncePapier` : l'énoncé imprimé — consigne globale, données, UNE seule demande (l'aire, ou m
 *   pour le paramètre). Signe, racines, ordre des courbes, intégrales par morceau : étapes du corrigé.
 * - Résultats : `formatReponseAttenduePhaseLatex` (ceux de l'appli). Les lignes « Calcul » posent
 *   l'opération avec les valeurs de l'instance (primitive, forme factorisée…).
 * - Figure (région hachurée, racines ou intersections) : `figureCalculAiresSvg`, la même qu'à l'écran,
 *   sous la dernière étape du corrigé — jamais dans l'énoncé (les données sont des formules).
 */

const LETTRES = "abcdefgh";
const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);

function reponse(exercice: ExerciceCalculAires, phase: PhaseCalculAires): FragmentConsigne[] {
  return [latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\quad "))];
}

function derniere(exercice: ExerciceCalculAires): PhaseCalculAires {
  const phases = phasesPourExercice(exercice);
  return phases[phases.length - 1];
}

// ============================================================================
// Énoncé interactif (étapes) et corrigé historique.
// ============================================================================

function entete(exercice: ExerciceCalculAires): FragmentConsigne[] {
  return [...consigneGenerale(exercice), ...donneesPapier(blocDonnees(exercice))];
}

function construireEnonce(exercice: ExerciceCalculAires): SectionExercice {
  return { enteteFragments: entete(exercice), questions: phasesPourExercice(exercice).map((phase) => ({ consigne: nettoyerConsigne(consigneEcran(exercice, phase)) })) };
}

function construireCorrection(exercice: ExerciceCalculAires): BlocCorrection[] {
  return phasesPourExercice(exercice).map((phase, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(exercice, phase)] }));
}

// ============================================================================
// Énoncé papier : une seule demande.
// ============================================================================

function demande(exercice: ExerciceCalculAires): FragmentConsigne[] {
  if (exercice.famille === "D" && exercice.sousType === "parametre") return [t(" Détermine la valeur de "), f("m"), t(".")];
  if (exercice.famille === "C") return [t(` Calcule cette aire totale. ${CONSIGNE_PRECISION}`)];
  return [t(` Calcule cette aire. ${CONSIGNE_PRECISION}`)];
}

function enoncePapier(exercice: ExerciceCalculAires): EnoncePapier {
  return {
    section: { enteteFragments: [...entete(exercice), ...demande(exercice)], questions: [] },
    reponseBreve: reponse(exercice, derniere(exercice)),
  };
}

// ============================================================================
// Corrigé détaillé : par étape, Méthode, Calcul, Piège éventuel, Conclusion.
// ============================================================================

function difficulte(exercice: ExerciceCalculAires): 1 | 2 | 3 {
  switch (exercice.famille) {
    case "A":
      return 1;
    case "B":
      return 2;
    case "C":
      return 3;
    case "D":
      return exercice.sousType === "parametre" ? 3 : 2;
  }
}

function reponseBreve(exercice: ExerciceCalculAires): FragmentConsigne[] {
  return reponse(exercice, derniere(exercice));
}

/** Poids des étapes (total 4) : le calcul final pèse le plus. */
function poids(exercice: ExerciceCalculAires): number[] {
  switch (exercice.famille) {
    case "A":
      return [1, 3];
    case "B":
      return [1, 1, 2];
    case "C":
      return [1, 1, 1, 1];
    case "D":
      if (exercice.sousType === "bornesDonnees") return [1, 3];
      if (exercice.sousType === "bornesATrouver") return [1, 1, 2];
      return [1, 1.5, 1.5];
  }
}

function bareme(exercice: ExerciceCalculAires): BaremeExercice {
  const phases = phasesPourExercice(exercice);
  const w = poids(exercice);
  const erreurs: { description: FragmentConsigne[]; cout: string }[] = [];
  for (const phase of phases) {
    const piege = piegeCalculAires(exercice, phase);
    if (piege) erreurs.push({ description: [t(piege)], cout: "−1" });
  }
  erreurs.push({ description: [t("Erreur dans la primitive ou dans le calcul de F(b) − F(a)")], cout: "−1" });
  return {
    reponseFinale: reponse(exercice, derniere(exercice)),
    criteres: phases.map((phase, i) => ({ sousQuestion: LETTRES[i], critere: reponse(exercice, phase), points: w[i] })),
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[t("Valeur exacte ou arrondie au centième ; toute écriture équivalente de la valeur exacte")]],
  };
}

export const adaptateurEvaluationCalculAires: AdaptateurFeuilleExercices<ExerciceCalculAires> = {
  titreDocument: "Calcul d'aires par intégrale — Évaluation",
  nomFichierBase: "calcul-aires",
  genererInstance: genererExerciceCalculAires,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteCalculAires),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeCalculAires,
  bareme,
  enoncePapier,
  dureeMinutes: 8,
  profilInstance: profilCalculAires,
  libelleCasParticulier: LIBELLE_CAS_CALCUL_AIRES,
};
