import type { ExerciceTrianglesZigzag } from "../../core5e/suitesClassiques.types";
import { termeGeometrique } from "../suitesGeometriques/parametres";

/** Scénario 6 — triangles emboîtés et zigzag (Thalès). h1=√3/2, raison=1/2 pour les hauteurs — les
 * aires (proportionnelles au CARRÉ de la hauteur) sont donc géométriques de raison (1/2)²=1/4, et
 * la longueur du chemin en zigzag reste TOUJOURS égale à 2 (piège central : elle ne tend PAS vers
 * 0, contrairement aux hauteurs/aires). */
export function construireTrianglesZigzag(): ExerciceTrianglesZigzag {
  const h1 = Math.sqrt(3) / 2;
  const raisonHauteurs = 1 / 2;
  const hauteurs: [number, number, number, number] = [
    termeGeometrique(h1, raisonHauteurs, 1),
    termeGeometrique(h1, raisonHauteurs, 2),
    termeGeometrique(h1, raisonHauteurs, 3),
    termeGeometrique(h1, raisonHauteurs, 4),
  ];
  const u1Aire = Math.sqrt(3) / 4;
  const raisonAires = raisonHauteurs * raisonHauteurs; // 1/4 — l'aire est proportionnelle au carré de la hauteur
  const aires: [number, number, number, number] = [
    termeGeometrique(u1Aire, raisonAires, 1),
    termeGeometrique(u1Aire, raisonAires, 2),
    termeGeometrique(u1Aire, raisonAires, 3),
    termeGeometrique(u1Aire, raisonAires, 4),
  ];
  const longueurZigzag = 2;
  const raisonAiresZigzagAC = raisonHauteurs; // 1/2
  const airesEntreZigzagEtAC: [number, number, number] = [
    termeGeometrique(u1Aire, raisonAiresZigzagAC, 1),
    termeGeometrique(u1Aire, raisonAiresZigzagAC, 2),
    termeGeometrique(u1Aire, raisonAiresZigzagAC, 3),
  ];
  return { scenario: "trianglesZigzag", h1, raisonHauteurs, hauteurs, aires, longueurZigzag, airesEntreZigzagEtAC };
}
