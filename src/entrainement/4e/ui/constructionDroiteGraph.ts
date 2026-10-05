/**
 * Géométrie pure du graphe Mafs de l'écran "trace" — réutilise `calculerViewBoxVecteurs`
 * (`ui/vecteurGraph.ts`, module frère) pour calculer un cadrage qui couvre à la fois les 2 points
 * CIBLES (jamais affichés directement — ce serait donner la réponse) et les 2 marqueurs actuellement
 * déplacés par l'élève, afin que le graphe reste toujours cohérent même si un marqueur est éloigné
 * des cibles.
 */
import { calculerViewBoxVecteurs } from "./vecteurGraph";
import type { PointAffiche } from "./vecteurGraph";
import type { Point } from "../core/vecteur.types";

export function viewBoxConstructionDroite(cible1: Point, cible2: Point, marqueur1: Point, marqueur2: Point): ReturnType<typeof calculerViewBoxVecteurs> {
  const affiches: PointAffiche[] = [cible1, cible2, marqueur1, marqueur2].map((point) => ({ point, label: "" }));
  return calculerViewBoxVecteurs(affiches);
}
