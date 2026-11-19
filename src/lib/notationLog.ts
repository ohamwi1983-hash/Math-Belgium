/**
 * Notation du logarithme décimal (décision de l'utilisateur) : « log », jamais « log₁₀ ».
 * Appliquée au RENDU (KaTeX de l'écran 6e, documents imprimés, cours) : les générateurs qui
 * construisent « \log_{base} » à partir d'un nombre affichent donc « \log » pour la base 10 sans
 * avoir à traiter ce cas un par un. Le cours définit « log » comme le logarithme de base 10.
 */
export function normaliserLogDecimal(latex: string): string {
  return normaliserLimites(latex.replace(/\\log_\{\s*10\s*\}/g, "\\log").replace(/\\log_10(?![0-9])/g, "\\log").replace(/log₁₀/g, "log"));
}

/**
 * « lim » avec « x → a » TOUJOURS sous « lim » (décision de l'utilisateur), même dans une formule en
 * ligne, où KaTeX le mettait à droite (\lim_{x\to a} en mode texte). Appliqué ici parce que tous les
 * rendus KaTeX du site passent par cette normalisation (cours, générateurs, feuilles, Word) : les
 * sources gardent l'écriture habituelle \lim_{…}.
 */
export function normaliserLimites(latex: string): string {
  return latex.replace(/\\lim(?!\\limits|\\nolimits|[a-zA-Z])\s*_/g, "\\lim\\limits_");
}
