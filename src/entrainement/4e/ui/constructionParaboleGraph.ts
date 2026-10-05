/**
 * Géométrie présentationnelle pure de l'écran "construction" — "Construction graphique de la
 * parabole" (position 53). Dérive uniquement les points à couvrir par la viewBox/la grille tournée
 * (`ui/grilleTourneeGraph.ts`) depuis l'état LIVE des 2 poignées (rayon, ligne) — jamais recalculé
 * différemment côté vérification (`moteur/verificationConstructionParabole.ts`).
 */
import type { ExerciceConstructionParabole } from "../core/constructionParabole.types";
import type { Point } from "../core/vecteur.types";

/** Décalage horizontal (repère local) de la poignée "ligne" par rapport au foyer — purement
 * visuel, pour ne jamais superposer le bras du compas et la droite construite à l'écran. */
export const DECALAGE_POIGNEE_LIGNE = 3;

/** Plancher d'étendue toujours couvert (même avant toute manipulation, et des deux côtés de la
 * directrice — y compris le côté "piège", pour que le geste invalide reste visible dans le cadre
 * dès le départ plutôt que de forcer l'élève à dézoomer pour le découvrir). */
function plancherEtendue(exercice: ExerciceConstructionParabole): number {
  return exercice.foyer.y * 3;
}

/** Points à couvrir par la viewBox/la grille — foyer, directrice, poignée rayon (et son plancher),
 * poignée ligne (et son plancher des deux côtés), plus les points d'intersection déjà confirmés aux
 * itérations précédentes (`pointsConfirmes`, vide par défaut — `promptgen53corrections.md`, A.2) :
 * la viewBox doit rester assez large pour les garder tous visibles au fil des itérations. */
export function pointsAffichesConstruction(exercice: ExerciceConstructionParabole, r: number, ligneY: number, pointsConfirmes: Point[] = []): Point[] {
  const { foyer } = exercice;
  const refX = foyer.x + DECALAGE_POIGNEE_LIGNE;
  const plancher = plancherEtendue(exercice);
  return [
    foyer,
    { x: foyer.x, y: 0 },
    { x: foyer.x, y: foyer.y + Math.max(r, plancher) },
    { x: refX, y: ligneY },
    { x: refX, y: -plancher },
    { x: refX, y: plancher },
    ...pointsConfirmes,
  ];
}
