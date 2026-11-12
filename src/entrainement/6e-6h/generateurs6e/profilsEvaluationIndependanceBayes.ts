/**
 * Profil d'instance (tirage équilibré des évaluations, `AdaptateurFeuilleExercices.profilInstance`)
 * de 6gen32 (indépendance, conditionnement et Bayes) — méthode `.claude/rules/feuilles-evaluations.md`,
 * section « Tirage équilibré ».
 *
 * - Aucun cas particulier. Le seul candidat naturel serait le tableau où A et B sont incompatibles
 *   (n(A ∩ B) = 0 se lit d'un coup d'œil) ou indépendants ; mais c'est le VERDICT que l'élève doit
 *   trouver : le filtrer rendrait la réponse prévisible (règle « un verdict n'est jamais un cas
 *   particulier »). Les trois verdicts restent donc tirés à parts égales, comme à l'écran.
 * - `forme` = la question posée quand elle est tirée au hasard dans la variante (combinaison demandée
 *   pour les pannes, méthode du test d'indépendance, type de lecture du tableau, sens de Bayes) :
 *   identique d'une série à l'autre, question par question.
 * - `calcul` : la formule de Bayes (famille C) exige la calculatrice (quotient de décimaux à 4
 *   chiffres) — `calculatriceIndispensable` sur ses deux variantes ; les familles A et B se font à la
 *   main (produits de décimaux à 2 chiffres, fractions d'effectifs) mais restent faisables avec une
 *   calculatrice : `calcul` sans objet, aucun filtrage.
 */
import type { ProfilInstance } from "../../export/genererFeuilleExercices";
import type { ExerciceIndependanceBayes } from "../core6e/independanceBayes.types";

export function formeIndependanceBayes(e: ExerciceIndependanceBayes): string {
  if (e.famille === "A") return e.sousType === "pannes" ? `A_${e.demandeEcran2}` : "A_union";
  if (e.famille === "B") {
    if (e.sousType === "testIndependance") return `B_test_${e.methode}`;
    if (e.sousType === "tableauDonne") return `B_table_${e.typeQuestion}`;
    return `B_recon_${e.typeQuestionFinale}`;
  }
  return `C_${e.demandeEcran3}`;
}

export function profilIndependanceBayes(e: ExerciceIndependanceBayes): ProfilInstance {
  return { casParticulier: null, calcul: e.famille === "C" ? "calculatrice" : undefined, forme: formeIndependanceBayes(e) };
}

/** Variantes dont toutes les instances exigent la calculatrice (formule de Bayes). */
export const VARIANTES_CALCULATRICE_INDEPENDANCE_BAYES = ["C-causeSachantEffet", "C-causeSachantPasEffet"];
