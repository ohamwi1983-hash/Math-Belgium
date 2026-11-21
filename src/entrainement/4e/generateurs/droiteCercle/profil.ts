import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceDroiteCercle } from "../../core/droiteCercle.types";

/**
 * Profil d'instance de gen92 (tirage équilibré des évaluations, `.claude/rules/feuilles-evaluations.md`).
 * - `forme` = la variante seule.
 * - Cas particulier `parallele-axe` : rayon [CP] (tangente-point) ou droite d (position relative,
 *   cercle tangent) parallèle à un axe — la tangente s'écrit x = k ou y = k, le pied et la distance
 *   se lisent sans construction (raccourci du cours, § 6). ≈ 17 % des tirages (`PROBA_AXE`).
 * - « extérieure / tangente / sécante » est le VERDICT de la variante « position-relative » (tiré à
 *   parts égales avant les nombres) : jamais un cas particulier, jamais dans `forme` ; niveau et
 *   durée constants dans la variante. Aucun nom de variante ne donne le verdict : pas de groupe.
 * - Pas de `calcul` : toutes les valeurs sont exactes (entiers, racines).
 */
export const CAS_AXE_DROITE_CERCLE = "parallele-axe";
export const LIBELLE_CAS_DROITE_CERCLE = "Inclure un cas particulier (droite ou rayon parallèle à un axe : horizontale ou verticale)";

export function profilDroiteCercle(e: ExerciceDroiteCercle): ProfilInstance {
  const axe = e.variante === "tangente-point" ? e.cp.x === 0 || e.cp.y === 0 : e.d.a === 0 || e.d.b === 0;
  return { casParticulier: axe ? CAS_AXE_DROITE_CERCLE : null, forme: e.variante };
}
