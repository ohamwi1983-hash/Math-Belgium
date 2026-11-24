import type { ExerciceLoiNormale } from "../../core6e/loiNormale.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatLoiNormale";
import { phasesPourExercice } from "../../moteur6e/typesLoiNormale";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLoiNormale } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceLoiNormale>` pour `6gen51` (Loi normale) —
 * NOUVEAU, même principe que `variablesDiscretesEsperance/exportEvaluation.ts` (6gen49).
 */

function entete(exercice: ExerciceLoiNormale) {
  return [...consigneGenerale(exercice), texte(" Données : "), latex(blocDonnees(exercice).join(",\\ "))];
}

function construireEnonce(exercice: ExerciceLoiNormale): SectionExercice {
  const phases = phasesPourExercice(exercice);
  return { enteteFragments: entete(exercice), questions: phases.map((phase) => ({ consigne: consigneEcran(exercice, phase) })) };
}

function construireCorrection(exercice: ExerciceLoiNormale): BlocCorrection[] {
  const phases = phasesPourExercice(exercice);
  const lettres = "abcdefghijklmnopqrstuvwxyz";
  return phases.map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${lettres[i] ?? String(i + 1)}) `), latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\ "))],
  }));
}

/** Profil (tirage équilibré) de 6gen51.
 * Calculatrice des élèves de 6e (6h) : Casio Graph Math+ (lois binomiale, normale, de Poisson et
 * hypergéométrique intégrées, `BinomialPD`/`BinomialCD`, `NormCD`/`InvNormCD`, `HypergeoPD`…). Règle validée
 * (revue des profils, 24/11/2026) : `calcul: 'exacte'` SEULEMENT si la calculatrice donne directement la
 * réponse demandée — la variante n'est alors jamais tirée « calculatrice autorisée ». Aucun cas particulier
 * ni `forme`.
 * - A et B (probabilité « à l'aide de la table Φ », Z ou X ~ N(μ, σ)) : `NormCD(a, b, σ, μ)` donne la
 *   probabilité directement (symétrie, standardisation et table court-circuitées) → `exacte`.
 * - C et D « cumulée » (P(Z ≤ t) = p, P(X ≤ a) = p) : `InvNormCD(p, σ, μ)` donne t ou a directement → `exacte`.
 * - C et D « symétrique » / « encadrée » : la transformation de la probabilité (0,5 + p, Φ(k) − p) reste à
 *   faire avant la calculatrice → pas de `calcul`.
 * - E (règle empirique 68-95-99,7) : retrouver μ et σ, compter les côtés → pas de `calcul`. */
export function profilLoiNormale(exercice: ExerciceLoiNormale): ProfilInstance {
  if (exercice.famille === "A" || exercice.famille === "B") return { casParticulier: null, calcul: "exacte" };
  if ((exercice.famille === "C" || exercice.famille === "D") && exercice.sousType === "cumulee") return { casParticulier: null, calcul: "exacte" };
  return { casParticulier: null };
}

export const adaptateurEvaluationLoiNormale: AdaptateurFeuilleExercices<ExerciceLoiNormale> = {
  titreDocument: "Loi normale — Évaluation",
  nomFichierBase: "loi-normale",
  genererInstance: genererExerciceLoiNormale,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
  profilInstance: profilLoiNormale,
};
