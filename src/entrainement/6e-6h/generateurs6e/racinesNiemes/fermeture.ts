import type { AngleRemarquable } from "../../core6e/formeTrigonometrique.types";
import { angleDepuisFraction } from "../formeTrigonometrique/angles";
import { ANGLES_REMARQUABLES, POINTS_REMARQUABLES } from "../formeTrigonometrique/familleA";

/**
 * Couche A (6e) — fermeture arithmétique EXACTE requise par `6gen39` (familles A et C). Garantit que
 * les `n` racines n-ièmes d'un `w` "propre" (module puissance n-ième parfaite pour la famille A /
 * module entier simple pour la famille C, angle `θ` remarquable) restent, TOUTES, dans la banque des
 * 16 angles remarquables réutilisée depuis `formeTrigonometrique/familleA.ts` (`ANGLES_REMARQUABLES`)
 * — condition NÉCESSAIRE ET SUFFISANTE pour que chaque racine ait un cos/sin EXACT dans la table des
 * 9 valeurs connues (`combinerModuleAngle`), donc pour que sa partie réelle/imaginaire reste un
 * radical simple/rationnel que l'élève peut effectivement taper (voir en-tête
 * `moteur6e/verificationRacinesNiemes.ts` pour la raison précise pour laquelle ce générateur utilise
 * 2 champs réels séparés re/im plutôt qu'un seul champ complexe "a+bi").
 *
 * ============================================================================
 * **Pourquoi une fermeture SUR LA BANQUE DE 16 (jamais seulement "axe" 0/π/2/π/-π/2) suffit ici**
 * ============================================================================
 * Les champs "partie réelle"/"partie imaginaire" de ce générateur sont évalués via
 * `moteur6e/expressionExponentielle.ts`, qui supporte `sqrt` — un résultat comme `a=√2` (angle π/4,
 * module 2) est donc PARFAITEMENT tapable ("sqrt(2)"). Contrairement à un générateur qui devrait
 * taper une expression COMPLEXE unique ("a+bi", sans `sqrt` disponible — voir
 * `moteur6e/expressionComplexe.ts`), il n'y a ici AUCUNE raison de se restreindre aux seuls angles
 * d'axe : toute racine dont l'angle tombe sur UN DES 16 REMARQUABLES a un cos/sin EXACT connu
 * (`combinerModuleAngle`), donc une partie réelle/imaginaire tapable, qu'elle soit rationnelle ou un
 * radical simple.
 *
 * ============================================================================
 * **`thetasFermesPour(n)` — calculé PAR BALAYAGE EXHAUSTIF à chaque appel, jamais une table recopiée
 * à la main** (16 angles × n≤6 vérifications, coût négligeable) — couverture de régression
 * exhaustive : `fermeture.test.ts`.
 * ============================================================================
 * Résultats (documentés ici pour référence, RE-PROUVÉS par le test, jamais supposés a priori) :
 * - n=2 : 8 des 16 angles remarquables ferment (tous les multiples de π/3, plus 0/π/±π/2).
 * - n=3 : seulement 4 ferment (0, π, ±π/2) — π/3 et dérivés NE ferment PAS : π/3⁄3=π/9∉banque.
 * - n=4 : seulement 4 ferment (0, π, ±2π/3).
 * - n=5 : ∅ — AUCUN angle ne ferme, y compris θ=0 (racines à 2π/5, 4π/5... jamais multiples de π/6
 *   NI de π/4, donc structurellement hors banque quel que soit le point de départ). Conséquence :
 *   `familleC.ts` EXCLUT n=5 de sa génération, bien que la spec source le liste dans `n∈{3,4,5,6}`
 *   (n=5 y est listé pour la famille B, qui n'a AUCUNE contrainte de fermeture — voir son en-tête).
 * - n=6 : seulement 2 ferment (0, π).
 *
 * `pointRemarquablePour(angle)` : retrouve l'entrée `{cos,sin}` EXACTE de `POINTS_REMARQUABLES`
 * correspondant à un angle DÉJÀ connu pour être dans la banque (égalité entière p,q, jamais une
 * tolérance flottante) — lève si l'angle n'y est pas (ne devrait jamais arriver pour un angle
 * effectivement issu de `thetasFermesPour`/d'une combinaison fermée, voir `familleA.ts`/`familleC.ts`
 * pour la preuve d'usage correcte).
 */

export function racineAppartientBanque(theta: AngleRemarquable, j: number, n: number): boolean {
  const candidat = angleDepuisFraction(theta.p + 2 * j * theta.q, theta.q * n);
  return ANGLES_REMARQUABLES.some((a) => a.p === candidat.p && a.q === candidat.q);
}

export function toutesLesRacinesFermees(theta: AngleRemarquable, n: number): boolean {
  for (let j = 0; j < n; j++) {
    if (!racineAppartientBanque(theta, j, n)) return false;
  }
  return true;
}

/** Sous-ensemble de `ANGLES_REMARQUABLES` pour lesquels les `n` racines n-ièmes restent TOUTES dans
 * la banque — voir en-tête de fichier pour les tailles exactes par `n`. */
export function thetasFermesPour(n: number): AngleRemarquable[] {
  return ANGLES_REMARQUABLES.filter((theta) => toutesLesRacinesFermees(theta, n));
}

export function pointRemarquablePour(angle: AngleRemarquable) {
  const point = POINTS_REMARQUABLES.find((pt) => pt.angle.p === angle.p && pt.angle.q === angle.q);
  if (!point) throw new Error(`pointRemarquablePour : angle "${angle.latex}" (p=${angle.p}, q=${angle.q}) absent de POINTS_REMARQUABLES`);
  return point;
}
