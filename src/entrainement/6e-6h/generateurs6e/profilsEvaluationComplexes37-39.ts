/**
 * Profils d'instance (tirage équilibré des évaluations, `AdaptateurFeuilleExercices.profilInstance`)
 * de 6gen37 (forme trigonométrique), 6gen38 (formule de Moivre) et 6gen39 (racines n-ièmes) —
 * méthode `.claude/rules/feuilles-evaluations.md`, section « Tirage équilibré ».
 *
 * Mesures sur 5 000 tirages par variante : voir le rapport du lot (scratchpad `6c5-R2/mesures.txt`).
 *
 * - 6gen37 : `forme` = famille, et sous-type pour B (produit, quotient, puissance). Cas particulier
 *   « point sur un axe » : un nombre complexe donné (z, z₁, z₂) est réel ou imaginaire pur — module et
 *   argument se lisent sans calcul. Hors évaluation par défaut, offert par la case. Toutes les
 *   familles se traitent avec des valeurs remarquables : `calcul` = `'exacte'`.
 * - 6gen38 : douze exercices seulement (n ∈ {3 ; 4 ; 5 ; 6} × trois cibles) : `forme` = cible SEULE —
 *   avec `forme` = n et cible, chaque série recevait exactement les mêmes douze exercices mélangés ;
 *   n reste tiré librement pour que deux séries diffèrent. Aucun cas particulier, calcul symbolique (`calcul` sans objet).
 * - 6gen39 : `forme` = famille. Familles A et C : valeurs exactes. Famille B : racine n-ième du module
 *   et arguments arrondis, calculatrice — sauf w ∈ {1 ; −1 ; i ; −i}. Cas particuliers : w réel
 *   positif (θ = 0, familles A et C : argument lu sans calcul) ; argument remarquable en famille B
 *   (point sur un axe ou une bissectrice : plus d'arctangente ni de correction de quadrant).
 */
import type { ProfilInstance } from "../../export/genererFeuilleExercices";
import type { ExerciceFormeTrigonometrique, FacteurComplexe } from "../core6e/formeTrigonometrique.types";
import type { ExerciceFormuleMoivre } from "../core6e/formuleMoivre.types";
import type { ExerciceRacinesNiemes } from "../core6e/racinesNiemes.types";

// ============================================================================
// 6gen37 — forme trigonométrique.
// ============================================================================

export const LIBELLE_CAS_FORME_TRIGONOMETRIQUE = "Inclure un cas particulier (nombre complexe situé sur un axe : réel ou imaginaire pur)";

function surAxe(z: FacteurComplexe): boolean {
  return z.angle.q <= 2;
}

export function formeFormeTrigonometrique(e: ExerciceFormeTrigonometrique): string {
  return e.famille === "B" ? `B_${e.sousType}` : e.famille;
}

export function profilFormeTrigonometrique(e: ExerciceFormeTrigonometrique): ProfilInstance {
  let axe = false;
  switch (e.famille) {
    case "A":
      axe = e.angle.q <= 2;
      break;
    case "B":
      axe = e.sousType === "puissance" ? surAxe(e.z) : surAxe(e.z1) || surAxe(e.z2);
      break;
    case "C":
      axe = e.a === 0 || e.b === 0;
      break;
    case "D":
      axe = surAxe(e.z);
      break;
    case "E":
      axe = false;
      break;
  }
  return { casParticulier: axe ? "point-sur-un-axe" : null, calcul: "exacte", forme: formeFormeTrigonometrique(e) };
}

// ============================================================================
// 6gen38 — formule de Moivre.
// ============================================================================

export function profilFormuleMoivre(e: ExerciceFormuleMoivre): ProfilInstance {
  return { casParticulier: null, forme: e.cible };
}

// ============================================================================
// 6gen39 — racines n-ièmes.
// ============================================================================

export const LIBELLE_CAS_RACINES_NIEMES = "Inclure un cas particulier (w réel positif ; en famille B, argument remarquable)";

export function profilRacinesNiemes(e: ExerciceRacinesNiemes): ProfilInstance {
  if (e.famille === "B") {
    const remarquable = e.angle.q !== 1e6;
    const unitaire = e.a * e.a + e.b * e.b === 1;
    return { casParticulier: remarquable ? "argument-remarquable" : null, calcul: unitaire ? "exacte" : "calculatrice", forme: "B" };
  }
  return { casParticulier: e.angle.p === 0 ? "w-reel-positif" : null, calcul: "exacte", forme: e.famille };
}
