/**
 * Profil d'instance de `6gen25` (« Intégrales définies ») pour le TIRAGE ÉQUILIBRÉ des évaluations
 * (`.claude/rules/feuilles-evaluations.md`).
 *
 * Cas particuliers (ils RACCOURCISSENT la résolution) :
 * - valeur moyenne sur un intervalle de longueur 1 (la division par b − a disparaît) ;
 * - intégrale nulle sur un intervalle symétrique (f impaire : résultat lisible sans calcul).
 * Le scénario « paramètre » n'en a pas : la racine double du second degré est un verdict (une ou
 * deux valeurs de m), jamais un cas particulier.
 *
 * Calculatrice (scénarios simple et moyenne) : `'exacte'` si le résultat (l'intégrale, et la valeur
 * moyenne en mode moyenne) est rationnel ; `'calculatrice'` sinon (ln, arctan, racines, π…). Le
 * scénario paramètre n'a qu'un régime par technique (m rationnel, m = ln(A), angle remarquable) :
 * `calcul` absent. Mesures sur 5 000 tirages par variante : voir le rapport de la refonte.
 */
import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceIntegralesDefinies } from "../../core6e/integralesDefinies.types";
import { estRationnel } from "../quellePrimitive/profilEvaluation";

export const LIBELLE_CAS_INTEGRALES_DEFINIES = "Inclure un cas particulier (valeur moyenne sur un intervalle de longueur 1, intégrale nulle par symétrie)";

function cas(liste: (string | false)[]): string | null {
  const presents = liste.filter((c): c is string => !!c);
  return presents.length === 0 ? null : presents.join("+");
}

export function profilIntegralesDefinies(e: ExerciceIntegralesDefinies): ProfilInstance {
  if (e.scenario === "parametre") return { casParticulier: null };
  const integrale = e.primitive.primitiveReference(e.b) - e.primitive.primitiveReference(e.a);
  const nulle = Math.abs(integrale) < 1e-9 && Math.abs(e.a + e.b) < 1e-9;
  if (e.scenario === "simple") {
    return { casParticulier: nulle ? "integrale-nulle" : null, calcul: estRationnel(integrale) ? "exacte" : "calculatrice" };
  }
  const moyenne = integrale / (e.b - e.a);
  return {
    casParticulier: cas([Math.abs(e.b - e.a - 1) < 1e-9 && "intervalle-longueur-1", nulle && "integrale-nulle"]),
    calcul: estRationnel(integrale) && estRationnel(moyenne) ? "exacte" : "calculatrice",
  };
}
