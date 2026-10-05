/**
 * Couche core (6e) — types partagés par 6gen2 ("Fonctions cyclométriques"), 6gen3 ("Équations
 * avec fonctions cyclométriques") et, pour la seule notion d'arcfonction/trigfonction, 6gen4
 * ("Dérivées de fonctions cyclométriques"). Chapitre 1, "Fonctions réciproques et cyclométriques".
 */
export type Arcfonction = "arcsin" | "arccos" | "arctan";
export type Trigfonction = "sin" | "cos" | "tan";

export interface ValeurExacte {
  latex: string;
  numerique: number;
}

/** Une ligne de banque arcfonction→angle (tables "variante A" de 6gen2, réutilisées par 6gen3
 * famille 1) — une valeur remarquable d'entrée et l'angle PRINCIPAL (dans l'image de
 * l'arcfonction) qu'elle produit. */
export interface EntreeBanqueArc {
  valeur: ValeurExacte;
  angle: ValeurExacte;
}

/**
 * Un des 16 points standards du cercle trigonométrique (multiples de π/6 et π/4 dans [0;2π[),
 * avec ses valeurs exactes de sin/cos/tan et les métadonnées utiles aux aides ("angles associés"
 * déjà construites en 4e — quadrant, angle de référence). `quadrant=0`/`angleReference=null`
 * pour un point sur un AXE (0, π/2, π, 3π/2) — aucun quadrant réel, aucune réduction nécessaire.
 * `tan=null` en π/2 et 3π/2 (tangente indéfinie).
 */
export interface PointCercleTrig {
  angle: ValeurExacte;
  quadrant: 0 | 1 | 2 | 3 | 4;
  /** `null` ssi `quadrant===0` (point sur un axe, rien à réduire). */
  angleReference: ValeurExacte | null;
  sin: ValeurExacte;
  cos: ValeurExacte;
  tan: ValeurExacte | null;
}
