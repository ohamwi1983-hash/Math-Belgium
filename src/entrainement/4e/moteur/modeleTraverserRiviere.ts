import type { ExerciceTraverserRiviere, GrandeurRiviere } from "../core/traverserRiviere.types";

/**
 * Modèle de gen87 (« Traverser une rivière ») : toutes les valeurs attendues viennent d'ICI (écran,
 * vérification, corrigé papier, figure) — jamais recalculées ailleurs.
 */

/** Composantes de la vitesse réelle v_R = v_p + v_c (variante `accostage`). */
export function vitesseReelle(e: ExerciceTraverserRiviere): { x: number; y: number } {
  if (e.variante === "enFace") return { x: 0, y: composanteYEnFace(e) };
  return { x: arrondi(e.px + e.courant, 10), y: e.py };
}

/** `enFace` : composante y de la vitesse propre, √(v² − c²). */
export function composanteYEnFace(e: ExerciceTraverserRiviere): number {
  return Math.sqrt(e.normePropre ** 2 - e.courant ** 2);
}

/** Durée de la traversée (s) : L / y(v_R) — le courant n'y change rien. */
export function duree(e: ExerciceTraverserRiviere): number {
  return e.largeur / vitesseReelle(e).y;
}

/** Abscisse du point d'accostage A(x_A ; L) (m) : x(v_R) · t. */
export function abscisseAccostage(e: ExerciceTraverserRiviere): number {
  if (e.variante === "enFace") return 0;
  return arrondi(vitesseReelle(e).x * duree(e), 10);
}

/** Vitesse réelle ‖v_R‖ (m/s). */
export function normeVitesseReelle(e: ExerciceTraverserRiviere): number {
  const v = vitesseReelle(e);
  return Math.hypot(v.x, v.y);
}

/** Distance réellement parcourue DA (m). */
export function distanceParcourue(e: ExerciceTraverserRiviere): number {
  return Math.hypot(abscisseAccostage(e), e.largeur);
}

export function arrondi(v: number, facteur: number): number {
  return Math.round(v * facteur) / facteur;
}

/** Nombre décimal à au plus deux décimales (valeur exacte affichable telle quelle). */
export function estDecimalCourt(v: number): boolean {
  return Math.abs(v * 100 - Math.round(v * 100)) < 1e-7;
}

/** Grandeurs de chaque écran, dans l'ordre. */
export function ecransDe(e: ExerciceTraverserRiviere): GrandeurRiviere[][] {
  if (e.variante === "enFace") return [["compensation"], ["pythagore"], ["dureeEnFace"]];
  return [["vRx", "vRy"], ["duree"], ["accostage"], [e.quatrieme]];
}

export function nombreEcrans(e: ExerciceTraverserRiviere): number {
  return ecransDe(e).length;
}

/** Valeur exacte (non arrondie) d'une grandeur. */
export function valeurExacte(e: ExerciceTraverserRiviere, g: GrandeurRiviere): number {
  switch (g) {
    case "vRx":
      return vitesseReelle(e).x;
    case "vRy":
      return vitesseReelle(e).y;
    case "duree":
    case "dureeEnFace":
      return duree(e);
    case "accostage":
      return abscisseAccostage(e);
    case "vitesse":
      return normeVitesseReelle(e);
    case "distance":
      return distanceParcourue(e);
    case "compensation":
      return -e.courant;
    case "pythagore":
      return composanteYEnFace(e);
  }
}

/** Précision d'arrondi affichée quand la valeur n'est pas un décimal court : vitesses au centième,
 * durées et distances au dixième. */
export function precision(g: GrandeurRiviere): number {
  return g === "duree" || g === "dureeEnFace" || g === "accostage" || g === "distance" ? 0.1 : 0.01;
}

/** La grandeur a-t-elle une valeur exacte décimale (sinon, une valeur arrondie est attendue) ? */
export function estExacte(e: ExerciceTraverserRiviere, g: GrandeurRiviere): boolean {
  return estDecimalCourt(valeurExacte(e, g));
}

/** Valeur affichée : exacte si décimal court, sinon arrondie à la précision de la grandeur. */
export function valeurAffichee(e: ExerciceTraverserRiviere, g: GrandeurRiviere): number {
  const v = valeurExacte(e, g);
  if (estDecimalCourt(v)) return arrondi(v, 100);
  return arrondi(v, Math.round(1 / precision(g)));
}

/** Toute l'instance se fait-elle sans calculatrice (aucune racine irrationnelle) ? */
export function instanceExacte(e: ExerciceTraverserRiviere): boolean {
  return ecransDe(e).flat().every((g) => estExacte(e, g));
}
