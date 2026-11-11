/**
 * Profil d'instance de `6gen26` (« Calcul d'aires par intégrale ») pour le TIRAGE ÉQUILIBRÉ des
 * évaluations (`AdaptateurFeuilleExercices.profilInstance`, `.claude/rules/feuilles-evaluations.md`).
 *
 * Est un cas particulier ce qui RACCOURCIT la résolution — jamais un verdict : le signe de f (familles
 * A, B, C) et l'ordre des courbes (famille D) sont ce que l'élève doit DÉCIDER, ils ne sont donc
 * jamais filtrés. Mesures sur 5 000 tirages par variante (rapport de la refonte papier) :
 * - A : une borne nulle (F(0) se calcule de tête) — exponentielle ≈ 28 %, trigonométrique ≈ 66 %,
 *   rationnelle 0 % (0 est exclu du domaine de 1/x) ;
 * - B : racines opposées (−r et r : la parité du § 3 du cours divise le calcul par deux) ou racine
 *   nulle (une borne vaut 0) ;
 * - C : racines −r, 0, r (fonction impaire : les deux morceaux ont la même aire) ;
 * - D (deux courbes) : g identiquement nulle (aire sous une seule courbe) ou g constante ;
 * - D (paramètre) : aire visée entière.
 *
 * Calculatrice : jamais indispensable — toutes les aires ont une valeur EXACTE (fractions ; e, ln, sin 1
 * en famille A), affichée au corrigé avant la valeur approchée. `calcul` est donc absent (un seul
 * régime par variante, aucune contrainte « calculatrice » ne s'y applique).
 */
import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceCalculAires } from "../../core6e/calculAires.types";

export const LIBELLE_CAS_CALCUL_AIRES =
  "Inclure un cas particulier (borne nulle, racines opposées ou nulle, racines −r, 0, r, courbe g nulle ou constante, aire visée entière)";

const estEntier = (v: number) => Math.abs(v - Math.round(v)) < 1e-9;

export function profilCalculAires(e: ExerciceCalculAires): ProfilInstance {
  switch (e.famille) {
    case "A":
      return { casParticulier: e.a === 0 || e.b === 0 ? "borne-nulle" : null };
    case "B":
      // Racines opposées : seulement pour la parabole (intégrande pair) ; la cubique a une racine double.
      if (e.type === "parabole" && e.r1 === -e.r2) return { casParticulier: "racines-opposees" };
      return { casParticulier: e.r1 === 0 || e.r2 === 0 ? "racine-nulle" : null };
    case "C":
      return { casParticulier: e.r2 === 0 && e.r1 === -e.r3 ? "racines-symetriques" : null };
    case "D":
      if (e.sousType === "parametre") return { casParticulier: estEntier(e.cible) ? "aire-entiere" : null };
      if (e.termesG.length === 0) return { casParticulier: "g-nulle" };
      return { casParticulier: e.termesG.every((t) => t.type === "constante") ? "g-constante" : null };
  }
}
