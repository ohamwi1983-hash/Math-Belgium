import type { ExerciceCerclesD } from "../../core6e/cercles.types";
import type { Point } from "./geometrie";
import { tirerEntier } from "./geometrie";

/**
 * Couche A (6e) — génération, famille D ("Cercle par un point, tangent à un axe en un point
 * donné") de `6gen55`. Convention DÉLIBÉRÉE : `A.y > 0` toujours (A strictement au-dessus de l'axe
 * des abscisses) — le centre est alors nécessairement au-dessus de l'axe lui aussi (même demi-plan
 * que A, sans quoi le cercle centré sous l'axe ne pourrait pas passer par un point situé au-dessus),
 * donc son ordonnée EST directement le rayon `r` (pas besoin de distinguer un signe) : poser le
 * centre sous la forme `(Bx, r)` avec `r>0` est alors la SEULE forme paramétrée cohérente, exactement
 * ce que demande l'énoncé.
 *
 * `r = ((Bx-Ax)² + Ay²) / (2·Ay)` — dérivé de `distance((Bx,r), A) = r`, dans lequel le terme `r²`
 * s'annule des deux côtés (voir `docs/historique-6e.md` pour le détail algébrique, réutilisé tel
 * quel dans les aides de l'écran 3).
 */

export function construireFamilleD(): ExerciceCerclesD {
  const Ay = tirerEntier(2, 8);
  const Ax = tirerEntier(-6, 6);
  const A: Point = { x: Ax, y: Ay };
  let Bx: number;
  do {
    Bx = tirerEntier(-6, 6);
  } while (Bx === Ax); // Bx=Ax donnerait un point de tangence directement sous A (cas dégénéré à éviter pour la lisibilité pédagogique, pas mathématiquement invalide).

  const r = ((Bx - Ax) * (Bx - Ax) + Ay * Ay) / (2 * Ay);

  return { famille: "D", A, Bx, r };
}
