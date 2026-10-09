import type { Droite, ExercicePDRT_F, Fraction, Point } from "../../core6e/pointsDroitesRemarquablesTriangle.types";
import { tirerEntier } from "./aleatoire";
import { ligneParDeuxPoints, pointSurDroite } from "./geometrie";
import { simplifier, versNombre } from "./fraction";

/**
 * Couche A (6e) — famille F de `6gen54` : symétrique Q d'un point P par rapport à une droite (AB).
 *
 * **Fonction PURE réutilisée intégralement par la famille H** (`familleH.ts` l'importe directement
 * — voir CLAUDE.md, "Couche A ↔ Couche A libre" : deux familles du MÊME générateur peuvent
 * échanger des fonctions sans jamais dupliquer le calcul) : H a besoin exactement du même
 * symétrique-par-rapport-à-une-droite pour construire le rayon réfléchi, condensé en un seul écran
 * au lieu des 3 de F.
 *
 * **H (et donc Q) n'est PAS structurellement entier** — contrairement à toutes les autres familles
 * de ce générateur : le pied de la perpendiculaire abaissée de `P` sur (AB) a pour dénominateur
 * `a²+b²` (a,b = coefficients de la normale de (AB)), qui vaut rarement 1. Pour respecter "jamais
 * de décimal pour une valeur générée" (CLAUDE.md), H et Q sont calculés en fractions EXACTES par
 * arithmétique entière (jamais par division flottante suivie d'un arrondi) : `HxNum/den`,
 * `HyNum/den` avec un dénominateur COMMUN `den` — ce dénominateur commun, exposé via `denCommun`/
 * `QNumCommun`, est réutilisé tel quel par `familleH.ts` pour construire l'équation du rayon
 * réfléchi avec des coefficients ENTIERS (sans jamais passer par une division), voir sa propre
 * documentation d'en-tête.
 */
export interface SymetriqueParRapportADroite {
  droiteAB: Droite;
  perpendiculaire: Droite;
  HFrac: { x: Fraction; y: Fraction };
  H: Point;
  QFrac: { x: Fraction; y: Fraction };
  Q: Point;
  /** Dénominateur COMMUN aux 2 coordonnées de Q (= a²+b², a,b normale de (AB)) — réutilisé par
   * `familleH.ts` pour rester en arithmétique entière exacte. */
  denCommun: number;
  /** Numérateurs de Q SUR `denCommun` (avant toute simplification indépendante par coordonnée —
   * `QFrac` ci-dessus est simplifiée séparément par coordonnée pour l'affichage). */
  QNumCommun: { x: number; y: number };
}

export function calculerSymetriqueParRapportADroite(P: Point, A: Point, B: Point): SymetriqueParRapportADroite {
  const droiteAB = ligneParDeuxPoints(A, B);
  const { a: a1, b: b1, c: c1 } = droiteAB;
  // Perpendiculaire à (AB) passant par P — normale = direction de (AB) = (-b1, a1).
  const a2 = -b1;
  const b2 = a1;
  const c2 = -(a2 * P.x + b2 * P.y);
  const perpendiculaire: Droite = { a: a2, b: b2, c: c2 };

  // Intersection (Cramer) de droiteAB et perpendiculaire — det = a1*b2-a2*b1 = a1²+b1².
  const den = a1 * b2 - a2 * b1;
  const HxNum = b1 * c2 - b2 * c1;
  const HyNum = a2 * c1 - a1 * c2;
  const HFrac = { x: simplifier(HxNum, den), y: simplifier(HyNum, den) };
  const H: Point = { x: versNombre(HFrac.x), y: versNombre(HFrac.y) };

  // Q = 2H - P, en gardant le dénominateur commun `den` (jamais de division avant la toute
  // dernière étape, pour rester exact).
  const QxNum = 2 * HxNum - P.x * den;
  const QyNum = 2 * HyNum - P.y * den;
  const QFrac = { x: simplifier(QxNum, den), y: simplifier(QyNum, den) };
  const Q: Point = { x: versNombre(QFrac.x), y: versNombre(QFrac.y) };

  return { droiteAB, perpendiculaire, HFrac, H, QFrac, Q, denCommun: den, QNumCommun: { x: QxNum, y: QyNum } };
}

function pointAleatoire(): Point {
  return { x: tirerEntier(-6, 6), y: tirerEntier(-6, 6) };
}

export function construireFamilleF(): ExercicePDRT_F {
  let P: Point, A: Point, B: Point;
  for (;;) {
    P = pointAleatoire();
    A = pointAleatoire();
    B = pointAleatoire();
    if (A.x === B.x && A.y === B.y) continue;
    const droiteAB = ligneParDeuxPoints(A, B);
    if (pointSurDroite(P, droiteAB)) continue; // P sur le miroir : symétrique trivial (Q=P)
    break;
  }
  const { droiteAB, perpendiculaire, HFrac, H, QFrac, Q } = calculerSymetriqueParRapportADroite(P, A, B);
  return { famille: "F", P, A, B, droiteAB, perpendiculaire, HFrac, H, QFrac, Q };
}
