import type { ExerciceCerclesG } from "../../core6e/cercles.types";
import { construireDepuisTriangle } from "./familleE";
import type { DroiteAffine } from "./geometrie";
import { intersectionDroites, sontAlignes, tirerEntier } from "./geometrie";

/**
 * Couche A (6e) — génération, famille G ("Cercles tangents à 3 droites") de `6gen55`.
 *
 * **RÉUTILISATION DE LA FAMILLE E** (exigence explicite de la mission, "ne jamais réimplémenter le
 * calcul du cercle inscrit deux fois") : une fois les 3 sommets du triangle trouvés par
 * intersection des droites deux à deux (l'étape PRÉLIMINAIRE propre à cette famille, écran 1),
 * `construireDepuisTriangle` — importée TELLE QUELLE de `familleE.ts`, jamais redéfinie ici — fait
 * tout le reste (côtés, incentre, rayon). Les écrans 2 à 4 de cette famille sont ensuite pilotés,
 * côté `moteur6e/verificationCercles.ts` et `ui6e/formatCercles.ts`, par les MÊMES fonctions de
 * dispatch que la famille E (voir en-tête de ces 2 fichiers), jamais un second jeu de fonctions
 * dupliqué.
 */

function tirerDroiteAvecPenteDifferenteDe(pentesExclues: readonly number[]): DroiteAffine {
  let m: number;
  do {
    m = tirerEntier(-4, 4);
  } while (pentesExclues.some((p) => p === m));
  const p = tirerEntier(-6, 6);
  return { m, p };
}

export function construireFamilleG(): ExerciceCerclesG {
  const d1 = tirerDroiteAvecPenteDifferenteDe([]);
  const d2 = tirerDroiteAvecPenteDifferenteDe([d1.m]);
  const d3 = tirerDroiteAvecPenteDifferenteDe([d1.m, d2.m]);

  const sommet12 = intersectionDroites(d1, d2);
  const sommet23 = intersectionDroites(d2, d3);
  const sommet31 = intersectionDroites(d3, d1);
  if (!sommet12 || !sommet23 || !sommet31) return construireFamilleG(); // pentes distinctes garanties, ne devrait jamais arriver.
  if (sontAlignes(sommet12, sommet23, sommet31)) return construireFamilleG(); // 3 droites concourantes (ou quasi) — retirage, ne forme pas de triangle.

  const triangle = construireDepuisTriangle(sommet12, sommet23, sommet31);

  return { famille: "G", d1, d2, d3, sommet12, sommet23, sommet31, triangle };
}
