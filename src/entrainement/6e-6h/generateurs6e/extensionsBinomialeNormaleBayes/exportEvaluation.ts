import type { ExerciceExtensionsBinomialeNormaleBayes } from "../../core6e/extensionsBinomialeNormaleBayes.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatExtensionsBinomialeNormaleBayes";
import { phasesPourExercice } from "../../moteur6e/typesExtensionsBinomialeNormaleBayes";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceExtensionsBinomialeNormaleBayes } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceExtensionsBinomialeNormaleBayes>` pour `6gen52`
 * (Extensions binomiale, normale et Bayes) — NOUVEAU, même principe que
 * `variablesDiscretesEsperance/exportEvaluation.ts` (6gen49).
 */

function entete(exercice: ExerciceExtensionsBinomialeNormaleBayes) {
  return [...consigneGenerale(exercice), texte(" Données : "), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceExtensionsBinomialeNormaleBayes): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return { enteteFragments: entete(exercice), questions: phases.map((phase) => ({ consigne: consigneEcran(exercice, phase) })) };
}

function construireCorrection(exercice: ExerciceExtensionsBinomialeNormaleBayes): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

/** Profil (tirage équilibré) de 6gen52 — mêmes décisions que 6gen48 et 6gen51, dont il reprend les familles.
 * Calculatrice des élèves de 6e (6h) : Casio Graph Math+ (lois binomiale, normale, de Poisson et
 * hypergéométrique intégrées, `BinomialPD`/`BinomialCD`, `NormCD`/`InvNormCD`, `HypergeoPD`…). Règle validée
 * (revue des profils, 24/11/2026) : `calcul: 'exacte'` SEULEMENT si la calculatrice donne directement la
 * réponse demandée — la variante n'est alors jamais tirée « calculatrice autorisée ». Aucun cas particulier
 * ni `forme`.
 * - B « exactement k », « aucun », « tous » (n, p, k donnés, terme unique) : `BinomialPD` → `exacte` ;
 *   « au moins » / « au plus » (somme ou complément à choisir) : pas de `calcul`.
 * - C « cumulée » (P(X ≤ a) = p) : `InvNormCD` → `exacte` ; « symétrique » / « encadrée » : pas de `calcul`.
 * - A (trouver n), D (Bayes), E (loi uniforme), F (reconstruire une loi) : raisonnement → pas de `calcul`. */
export function profilExtensionsBinomialeNormaleBayes(exercice: ExerciceExtensionsBinomialeNormaleBayes): ProfilInstance {
  if (exercice.famille === "B" && (exercice.typeQuestion === "exactement" || exercice.typeQuestion === "aucun" || exercice.typeQuestion === "tous")) {
    return { casParticulier: null, calcul: "exacte" };
  }
  if (exercice.famille === "C" && exercice.base.sousType === "cumulee") return { casParticulier: null, calcul: "exacte" };
  return { casParticulier: null };
}

export const adaptateurEvaluationExtensionsBinomialeNormaleBayes: AdaptateurFeuilleExercices<ExerciceExtensionsBinomialeNormaleBayes> = {
  titreDocument: "Extensions binomiale, normale et Bayes — Évaluation",
  nomFichierBase: "extensions-binomiale-normale-bayes",
  genererInstance: genererExerciceExtensionsBinomialeNormaleBayes,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
  profilInstance: profilExtensionsBinomialeNormaleBayes,
};
