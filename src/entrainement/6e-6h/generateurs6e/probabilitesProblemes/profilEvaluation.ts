/**
 * Profil d'instance de `6gen33` (« Probabilités : problèmes ») pour le TIRAGE ÉQUILIBRÉ des
 * évaluations (`AdaptateurFeuilleExercices.profilInstance`, `.claude/rules/feuilles-evaluations.md`).
 *
 * Cas particulier (ce qui RACCOURCIT la résolution) : seulement en B « au moins k succès » avec
 * k = 1 — « au moins un succès » se règle en une ligne par l'événement contraire, 1 − (1 − p)ⁿ, sans
 * compter de chemins. k est uniforme dans {1, …, n − 1} avec n ∈ {3, 4, 5} : ≈ 36 % des instances
 * de la variante « B — au moins k succès », ≈ 18 % de la famille B. Aucune autre famille n'a de
 * raccourci : A (n entre 4 et 8), C (k = 1 ou 2), E, F et G demandent toujours toutes les étapes ; le
 * vrai/faux de F est un verdict, jamais un cas particulier.
 *
 * Calculatrice :
 * - A (produit de facteurs (365 − k)/365), E (Bayes à données réalistes : 0,1395 / 0,2125…) et F
 *   (fiabilités à 4 décimales) l'exigent toujours → `calcul: 'calculatrice'` (et
 *   `calculatriceIndispensable` de l'adaptateur) ;
 * - B : à la main jusqu'à 4 épreuves (p à une décimale), calculatrice pour 5 épreuves ;
 * - C (produits de trois nombres à une décimale) et G (fractions simples) : faisables à la main ET
 *   à la calculatrice → `calcul` absent (sans objet, tirés dans les deux régimes).
 *
 * `forme` : la structure de la question (famille et demande, configuration des montages de F) est
 * imposée identique d'une série à l'autre.
 */
import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceProbabilitesProblemes } from "../../core6e/probabilitesProblemes.types";

export const LIBELLE_CAS_PROBABILITES_PROBLEMES = "Inclure un cas particulier (épreuves répétées : « au moins un succès », réglé par l'événement contraire)";

export function profilProbabilitesProblemes(e: ExerciceProbabilitesProblemes): ProfilInstance {
  switch (e.famille) {
    case "A":
      return { casParticulier: null, calcul: "calculatrice", forme: "A" };
    case "B":
      return {
        casParticulier: e.demandeEcran3 === "auMoinsK" && e.k === 1 ? "au-moins-un-succes" : null,
        ...(e.n === 5 ? { calcul: "calculatrice" as const } : {}),
        forme: `B-${e.demandeEcran3}`,
      };
    case "C":
      return { casParticulier: null, forme: `C-k${e.k}` };
    case "E":
      return { casParticulier: null, calcul: "calculatrice", forme: `E-${e.base.demandeEcran3}` };
    case "F":
      return { casParticulier: null, calcul: "calculatrice", forme: `F-${e.configuration}-${e.demandeEcran3}` };
    case "G":
      return { casParticulier: null, forme: "G" };
  }
}
