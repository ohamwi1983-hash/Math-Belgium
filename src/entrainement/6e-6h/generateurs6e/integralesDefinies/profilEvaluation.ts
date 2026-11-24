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
 * Calculatrice (scénarios simple et moyenne ; décision de l'utilisateur du 24/11/2026 — la Graph
 * Math+ des élèves de 6e calcule ∫ directement) : `'exacte'` si le résultat (l'intégrale, et la
 * valeur moyenne en mode moyenne) est un entier ou une fraction — la calculatrice l'affiche tel quel,
 * « diviser d'abord (fraction) » compris ; sinon (ln, e, π, √, arctan…) `calcul` ABSENT : la consigne
 * exige la forme exacte (la calculatrice n'en donne qu'un décimal), l'instance est proposée dans les
 * deux cas (arbitrage de l'utilisateur, 24/11/2026). Rationalité lue sur
 * la valeur exacte SYMBOLIQUE (`moteur6e/valeurExacteIntegrale.ts`), même critère que la consigne et
 * l'écran (`formeExacteExigee`). Le scénario paramètre (résoudre une équation en m) n'a pas de `calcul`.
 */
import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceIntegralesDefinies } from "../../core6e/integralesDefinies.types";
import { formeExacteExigee } from "../../moteur6e/verificationIntegralesDefinies";

export const LIBELLE_CAS_INTEGRALES_DEFINIES = "Inclure un cas particulier (valeur moyenne sur un intervalle de longueur 1, intégrale nulle par symétrie)";

function cas(liste: (string | false)[]): string | null {
  const presents = liste.filter((c): c is string => !!c);
  return presents.length === 0 ? null : presents.join("+");
}

export function profilIntegralesDefinies(e: ExerciceIntegralesDefinies): ProfilInstance {
  if (e.scenario === "parametre") return { casParticulier: null };
  const integrale = e.primitive.primitiveReference(e.b) - e.primitive.primitiveReference(e.a);
  const nulle = Math.abs(integrale) < 1e-9 && Math.abs(e.a + e.b) < 1e-9;
  // Forme exacte exigée : `calcul` absent (tirée « interdite » ET « autorisée »).
  const calcul = formeExacteExigee(e) ? {} : { calcul: "exacte" as const };
  if (e.scenario === "simple") return { casParticulier: nulle ? "integrale-nulle" : null, ...calcul };
  return {
    casParticulier: cas([Math.abs(e.b - e.a - 1) < 1e-9 && "intervalle-longueur-1", nulle && "integrale-nulle"]),
    ...calcul,
  };
}
