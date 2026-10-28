/** Texte LaTeX des racines révélées à l'écran "factorisation" — jamais "x_1=3 \\text{ et } x_2=3"
 * pour une racine double (même principe que `formatRacinesTriees`/`recapitulatifInequation.ts`
 * ailleurs sur ce chantier : une racine double s'affiche une seule fois). */
export function formatRacinesRevelees(racines: [number, number]): string {
  const [x1, x2] = racines;
  return x1 === x2 ? `x_1 = x_2 = ${x1}` : `x_1 = ${x1} \\quad x_2 = ${x2}`;
}
