import type { ExercicePDRT_H, Point } from "../../core6e/pointsDroitesRemarquablesTriangle.types";
import { tirerEntier } from "./aleatoire";
import { calculerSymetriqueParRapportADroite } from "./familleF";
import { ligneParDeuxPoints, pointSurDroite } from "./geometrie";

/**
 * Couche A (6e) — famille H de `6gen54` : rayon réfléchi. Miroir d (défini par 2 points Ad, Bd),
 * source P, point d'incidence M sur d — trouver l'équation du rayon réfléchi (P'M), où P' est le
 * symétrique de P par rapport à d.
 *
 * **Réutilise `familleF.calculerSymetriqueParRapportADroite` TEL QUEL** pour calculer P' — jamais
 * une seconde implémentation du symétrique par rapport à une droite (voir en-tête `familleF.ts`).
 *
 * **Équation du rayon réfléchi en coefficients ENTIERS, sans jamais diviser** : P' n'est
 * structurellement PAS un point entier (voir `familleF.ts`) — mais une équation de droite reste
 * valide à un facteur multiplicatif près, donc jamais besoin de connaître P' comme point flottant
 * pour construire son équation. `familleF` expose `denCommun`/`QNumCommun` (P' = `QNumCommun/
 * denCommun`, M est entier) : le vecteur directeur `M·denCommun − QNumCommun` est ENTIER (même
 * ligne que `M−P'`, juste mis à la même échelle `denCommun`), d'où une normale et un `c` entiers
 * en substituant M (entier) dans l'équation — jamais de division nulle part dans cette famille.
 */

function pointAleatoire(): Point {
  return { x: tirerEntier(-6, 6), y: tirerEntier(-6, 6) };
}

export function construireFamilleH(): ExercicePDRT_H {
  let Ad: Point, Bd: Point, P: Point;
  for (;;) {
    Ad = pointAleatoire();
    Bd = pointAleatoire();
    P = pointAleatoire();
    if (Ad.x === Bd.x && Ad.y === Bd.y) continue;
    const droiteD = ligneParDeuxPoints(Ad, Bd);
    if (pointSurDroite(P, droiteD)) continue; // source jamais sur le miroir
    break;
  }
  const droiteD = ligneParDeuxPoints(Ad, Bd);
  const { QFrac: PpFrac, Q: Pp, denCommun, QNumCommun } = calculerSymetriqueParRapportADroite(P, Ad, Bd);

  const t = tirerEntier(-3, 3);
  const dir = { x: Bd.x - Ad.x, y: Bd.y - Ad.y };
  const M: Point = { x: Ad.x + t * dir.x, y: Ad.y + t * dir.y };

  // Vecteur directeur (M-Pp), mis à l'échelle `denCommun` pour rester entier (voir en-tête).
  const dirX = M.x * denCommun - QNumCommun.x;
  const dirY = M.y * denCommun - QNumCommun.y;
  const a = -dirY;
  const b = dirX;
  const c = -(a * M.x + b * M.y);
  const rayonReflechi = { a, b, c };

  return { famille: "H", Ad, Bd, droiteD, P, M, PpFrac, Pp, rayonReflechi };
}
