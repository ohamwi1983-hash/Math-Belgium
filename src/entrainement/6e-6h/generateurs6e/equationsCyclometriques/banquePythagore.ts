/**
 * Couche A (6e) — petites banques de valeurs RATIONNELLES remarquables propres à la variante 4 de
 * `6gen3` ("arcfonctions différentes"), utilisées pour construire les instances "à l'envers" depuis
 * des racines cibles propres (spec explicite — jamais de a,b,c,d tirés librement pour cette
 * variante, le risque de racines irrationnelles étant trop élevé une fois l'équation mise au carré).
 */

/** Triplets pythagoriciens `(p,q,r)`, `p²+q²=r²`, `p,q,r>0` — utilisés pour un angle θ avec
 * `sin θ=p/r`, `cos θ=q/r`, `tan θ=p/q`, tous rationnels. */
export interface TripletPythagore {
  p: number;
  q: number;
  r: number;
}

export const BANQUE_PYTHAGORE: TripletPythagore[] = [
  { p: 3, q: 4, r: 5 },
  { p: 4, q: 3, r: 5 },
  { p: 5, q: 12, r: 13 },
  { p: 12, q: 5, r: 13 },
  { p: 8, q: 15, r: 17 },
];

/** Points rationnels `(u,v)` du cercle trigonométrique `u²+v²=1` — utilisés pour la variante 4,
 * sous-cas asin_acos (identité `v=√(1-u²)`, une DROITE passant par 2 points du cercle intersecte le
 * cercle EXACTEMENT en ces 2 points, garantissant une équation du second degré à racines rationnelles
 * connues d'avance). */
export interface PointCercleRationnel {
  u: number;
  v: number;
}

function depuisTriplet(p: number, q: number, r: number): PointCercleRationnel[] {
  return [
    { u: q / r, v: p / r },
    { u: q / r, v: -p / r },
    { u: -q / r, v: p / r },
    { u: -q / r, v: -p / r },
    { u: p / r, v: q / r },
    { u: p / r, v: -q / r },
    { u: -p / r, v: q / r },
    { u: -p / r, v: -q / r },
  ];
}

export const BANQUE_CERCLE_RATIONNEL: PointCercleRationnel[] = [
  { u: 0, v: 1 },
  { u: 0, v: -1 },
  { u: 1, v: 0 },
  { u: -1, v: 0 },
  ...depuisTriplet(3, 4, 5),
  ...depuisTriplet(5, 12, 13),
];
