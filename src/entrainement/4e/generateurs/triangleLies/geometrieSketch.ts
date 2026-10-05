/**
 * Couche A — géométrie pure partagée par les 4 familles pour construire les coordonnées réelles du
 * croquis Mafs (`ExerciceTriangleLies.points`). Aucune connaissance du contrat core ni d'une
 * famille en particulier — juste du calcul vectoriel 2D générique.
 */
export interface Vecteur2D {
  x: number;
  y: number;
}

function rotationVecteur(v: Vecteur2D, angleDeg: number): Vecteur2D {
  const r = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(r);
  const sin = Math.sin(r);
  return { x: v.x * cos - v.y * sin, y: v.x * sin + v.y * cos };
}

/** Signe du produit vectoriel (Q-P)×(R-P) — >0 si R est à gauche du rayon P→Q, <0 à droite, 0 si
 * R est sur la droite (PQ). */
export function cotePointDroite(P: Vecteur2D, Q: Vecteur2D, R: Vecteur2D): number {
  return (Q.x - P.x) * (R.y - P.y) - (Q.y - P.y) * (R.x - P.x);
}

/**
 * Place un point D tel que l'angle (rayon P→Q, rayon P→D) vaille `angleDeg` et la distance P→D
 * vaille `distance`, du côté OPPOSÉ de la droite (PQ) par rapport à `reference` — utilisé pour
 * placer le 3e sommet du triangle "cible" de l'autre côté du côté partagé par rapport au triangle
 * "pont" (jamais les deux triangles superposés/imbriqués l'un dans l'autre sur le croquis). Essaie
 * d'abord la rotation antihoraire ; si le résultat tombe du même côté que `reference`, bascule sur
 * la rotation horaire (l'une des deux est toujours du bon côté, sauf le cas dégénéré P=Q, jamais
 * atteint en pratique — les 2 points d'un côté partagé sont toujours distincts par construction).
 */
export function placerSommetOppose(P: Vecteur2D, Q: Vecteur2D, angleDeg: number, distance: number, reference: Vecteur2D): Vecteur2D {
  const direction = { x: Q.x - P.x, y: Q.y - P.y };
  const norme = Math.hypot(direction.x, direction.y);
  const essaiAntihoraire = rotationVecteur(direction, angleDeg);
  const candidatAntihoraire = { x: P.x + (essaiAntihoraire.x / norme) * distance, y: P.y + (essaiAntihoraire.y / norme) * distance };
  const memeCoteQueReference = cotePointDroite(P, Q, candidatAntihoraire) * cotePointDroite(P, Q, reference) > 0;
  if (!memeCoteQueReference) return candidatAntihoraire;
  const essaiHoraire = rotationVecteur(direction, -angleDeg);
  return { x: P.x + (essaiHoraire.x / norme) * distance, y: P.y + (essaiHoraire.y / norme) * distance };
}
