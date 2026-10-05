/**
 * Couche A (6e) — constantes de marge partagées par les 7 familles de `6gen4`, pour la recherche
 * de points d'échantillonnage valides (voir `pointsEchantillon.ts`).
 */

/** Marge de sécurité sur l'argument d'arcsin/arccos : `|u| < MARGE_ARCFONCTION`, jamais jusqu'à 1
 * (la dérivée `1/√(1-u²)` diverge au bord, rendant la comparaison numérique instable). */
export const MARGE_ARCFONCTION = 0.92;

/** Distance minimale à respecter pour tout dénominateur potentiellement nul (x, x+c, a·x...). */
export const EPSILON_DENOMINATEUR = 0.15;
