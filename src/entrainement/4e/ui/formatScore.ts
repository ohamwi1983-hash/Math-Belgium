/** Arrondi à 1 décimale pour l'affichage (le calcul interne garde la valeur exacte p/t). */
export function formatScore(score: number): string {
  return `${Math.round(score * 10) / 10}`;
}
