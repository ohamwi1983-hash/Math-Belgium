import type { EnsembleReelGuide, MorceauIntervalle } from "../core6e/ensembleReel.types";
import { approxFractionLatex, approxFractionTexte } from "./formatFraction";

/**
 * Rendu LaTeX d'un `EnsembleReelGuide` déjà complet (révélation, bloc "état actuel") — jamais pour
 * l'aperçu en cours de saisie (l'élève construit via `EnsembleReelGuideBuilder`, jamais de LaTeX
 * libre à interpréter). Réplique le principe déjà établi par `ui5e/formatDomaineDefinition.ts`
 * (5gen1) — jamais importé, chaque chantier reste indépendant (voir CLAUDE.md).
 *
 * Bornes formatées en fraction irréductible (`approxFractionLatex`/`approxFractionTexte`), jamais
 * en décimal — nécessaire depuis `6gen1` (refonte) : un pivot -b/a ou -b/(2a) n'est pas toujours
 * entier. Sans effet sur tout appelant existant (6gen3 compris) dont les bornes sont déjà entières
 * (`approxFraction*` renvoie l'entier tel quel dans ce cas).
 *
 * `maxDenominateur` optionnel (défaut celui d'`approxFractionLatex`, `12`) — ajouté pour `6gen3`
 * variante 4a/asin_acos (BUG "CE établie à l'écran 1" affichée en décimal brut, ex.
 * `-0.2626262626262627` au lieu de `-\dfrac{26}{99}`) : ses bornes de CE dérivent de coefficients
 * eux-mêmes tirés de triplets pythagoriciens combinés (dénominateur jusqu'à `260`, voir
 * `ui6e/formatEquationsCyclometriques.ts::MAX_DEN`), au-delà du défaut `12` — PARAMÈTRE ADDITIF,
 * n'affecte aucun appelant existant qui ne le passe pas (6gen1 et tout autre générateur 6e).
 */
function formatBorneLatex(valeur: number | null, infini: string, maxDenominateur?: number): string {
  return valeur === null ? infini : approxFractionLatex(valeur, maxDenominateur);
}

function formatMorceauLatex(m: MorceauIntervalle, maxDenominateur?: number): string {
  const gauche = m.infInclus ? "[" : "]";
  const droite = m.supInclus ? "]" : "[";
  return `${gauche}${formatBorneLatex(m.inf, "-\\infty", maxDenominateur)}\\,;\\,${formatBorneLatex(m.sup, "+\\infty", maxDenominateur)}${droite}`;
}

export function formatEnsembleReelLatex(ensemble: EnsembleReelGuide, maxDenominateur?: number): string {
  if (ensemble.forme === "reel") return "\\mathbb{R}";
  if (ensemble.forme === "prive_points") {
    // `.map((v) => approxFractionLatex(v))`, JAMAIS `.map(approxFractionLatex)` — piège classique
    // (comme `["1","2"].map(parseInt)`) : `Array.prototype.map` passe aussi l'INDEX en 2e argument,
    // qui écraserait silencieusement `maxDenominateur` (0 pour le 1er point, 1 pour le 2e...),
    // cassant la boucle de recherche de fraction pour tout point non entier. Bug trouvé par
    // vérification Playwright manuelle sur le build de production (`0.75` affiché tel quel au lieu
    // de `3/4`) avant d'être corrigé ici.
    return `\\mathbb{R} \\setminus \\{${ensemble.points.map((v) => approxFractionLatex(v, maxDenominateur)).join("\\,;\\,")}\\}`;
  }
  return ensemble.morceaux.map((m) => formatMorceauLatex(m, maxDenominateur)).join(" \\cup ");
}

/** Variante TEXTE BRUT (unicode, jamais de LaTeX) — nécessaire pour une `<option>` de `<select>`
 * natif, qui ne peut afficher que du texte (voir `components6e/DoubleComboboxIntervalle.tsx`,
 * `6gen1`). */
function formatBorneTexte(valeur: number | null, infini: string): string {
  return valeur === null ? infini : approxFractionTexte(valeur);
}

function formatMorceauTexte(m: MorceauIntervalle): string {
  const gauche = m.infInclus ? "[" : "]";
  const droite = m.supInclus ? "]" : "[";
  return `${gauche}${formatBorneTexte(m.inf, "-∞")} ; ${formatBorneTexte(m.sup, "+∞")}${droite}`;
}

export function formatEnsembleReelTexte(ensemble: EnsembleReelGuide): string {
  if (ensemble.forme === "reel") return "ℝ (tout)";
  if (ensemble.forme === "prive_points") {
    // Même piège `.map(fn)`/index qu'au-dessus — voir le commentaire de `formatEnsembleReelLatex`.
    return `ℝ \\ {${ensemble.points.map((v) => approxFractionTexte(v)).join(" ; ")}}`;
  }
  return ensemble.morceaux.map(formatMorceauTexte).join(" ∪ ");
}
