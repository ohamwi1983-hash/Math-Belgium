export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Un entier dans [1,359] qui n'est jamais un multiple de 90 (donc jamais 0/90/180/270) — l'angle
 * réduit de base des variantes "angle simple"/"angle négatif"/"angle ≥360°", toujours strictement
 * à l'intérieur d'un quadrant, jamais sur un axe (réservé à la variante "multiple de 90").
 */
export function construireAngleReduitNonAxe(): number {
  let angle = randomInt(1, 359);
  while (angle % 90 === 0) {
    angle = randomInt(1, 359);
  }
  return angle;
}
