/**
 * Notation du logarithme décimal (décision de l'utilisateur) : « log », jamais « log₁₀ ».
 * Appliquée au RENDU (KaTeX de l'écran 6e, documents imprimés, cours) : les générateurs qui
 * construisent « \log_{base} » à partir d'un nombre affichent donc « \log » pour la base 10 sans
 * avoir à traiter ce cas un par un. Le cours définit « log » comme le logarithme de base 10.
 */
export function normaliserLogDecimal(latex: string): string {
  return latex.replace(/\\log_\{\s*10\s*\}/g, "\\log").replace(/\\log_10(?![0-9])/g, "\\log").replace(/log₁₀/g, "log");
}
