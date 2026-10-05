/**
 * Couche présentation (5e) — formatage LaTeX/texte pour 5gen10 ("Équations trigonométriques
 * trig(ax+b)=k"). `ui5e/` peut librement importer `generateurs5e/` (frontière Couche A/B ↔
 * présentation, jamais Couche A/B entre elles) — réutilise `pgcd` (`generateurs5e/parametresSinusoide/rationnelPi.ts`)
 * pour la reconstruction de fraction de π du label du cercle trigonométrique.
 */
import { pgcd } from "../generateurs5e/parametresSinusoide/rationnelPi";
import type { BrancheAngle, CoefficientRationnel, FonctionTrig, RegimeEquationTrig, ValeurCible, ValeurPiOuDecimale } from "../core5e/equationsTrigonometriques.types";

export const CONSIGNE_GENERALE_EQUATION_TRIG = "Résous cette équation.";

/** Annonce de précision (régime "decimal" UNIQUEMENT — jamais affichée en régime "exact", où la
 * réponse attendue est une expression exacte avec π, aucun arrondi en jeu) — même formulation que
 * partout ailleurs sur la plateforme (`formatArcsSecteurs.ts`, `formatParametresSinusoide.ts`...),
 * cohérente avec `TOLERANCE_EQUATION_TRIG = 0.01` (`moteur5e/verificationEquationTrig.ts`). */
export const ANNONCE_PRECISION_DECIMAL = " (arrondis au centième près)";

const NOM_FONCTION_LATEX: Record<FonctionTrig, string> = { sin: "\\sin", cos: "\\cos", tan: "\\tan" };

/** Arrondi à la PREMIÈRE décimale (D.1 — "convention arrondie à la première décimale quand la
 * valeur n'est pas un angle particulier") — n'affecte QUE l'affichage (valeurs générées/attendues
 * montrées à l'élève) ; la vérification (`moteur5e/verificationEquationTrig.ts`) reste en précision
 * complète, totalement indépendante de cet arrondi. */
function arrondi1(v: number): number {
  const r = Math.round(v * 10) / 10;
  return Object.is(r, -0) ? 0 : r;
}

function formatDecimalLatex(v: number): string {
  return arrondi1(v).toString().replace(".", ",");
}

function formatMagnitudePiLatex(numerateur: number, denominateur: number): string {
  if (denominateur === 1) return numerateur === 1 ? "\\pi" : `${numerateur}\\pi`;
  return numerateur === 1 ? `\\frac{\\pi}{${denominateur}}` : `\\frac{${numerateur}\\pi}{${denominateur}}`;
}

/** Valeur signée autonome (constante d'une branche, ou b dans l'argument) — "0" si nulle, jamais de
 * signe redondant. */
export function formatValeurLatex(v: ValeurPiOuDecimale): string {
  if (v.exact !== null) {
    const { numerateur, denominateur } = v.exact;
    if (numerateur === 0) return "0";
    const signe = numerateur < 0 ? "-" : "";
    return `${signe}${formatMagnitudePiLatex(Math.abs(numerateur), denominateur)}`;
  }
  return formatDecimalLatex(v.decimal);
}

/** Terme périodique "k·période" — la période est TOUJOURS strictement positive par construction
 * (jamais de signe à gérer ici, contrairement à `formatValeurLatex`). "k" est le nom conventionnel
 * de l'entier libre sur toute la plateforme (D.1/D.2/D.3 — remplace "n", propagé à toutes les
 * familles via `ui5e/formatEquationTrigonometrique.ts`). */
function formatTermePeriodeLatex(periode: ValeurPiOuDecimale): string {
  if (periode.exact !== null) {
    const { numerateur, denominateur } = periode.exact;
    if (denominateur === 1) return numerateur === 1 ? "k\\pi" : `${numerateur}k\\pi`;
    return numerateur === 1 ? `\\frac{k\\pi}{${denominateur}}` : `\\frac{${numerateur}k\\pi}{${denominateur}}`;
  }
  return `${formatDecimalLatex(periode.decimal)}k`;
}

/** "constante + période·n" — une branche complète (écran 1 : u, écran 2 : x — même forme). */
export function formatBrancheLatex(branche: { constante: ValeurPiOuDecimale; periode: ValeurPiOuDecimale }): string {
  return `${formatValeurLatex(branche.constante)} + ${formatTermePeriodeLatex(branche.periode)}`;
}

function formatCoefficientXLatex(a: CoefficientRationnel): string {
  if (a.numerateur === a.denominateur) return "x";
  if (a.denominateur === 1) return `${a.numerateur}x`;
  return `\\frac{${a.numerateur}}{${a.denominateur}}x`;
}

/** "ax+b" (ou "ax", "ax-|b|"...) — jamais de double signe, jamais de terme b nul affiché. */
export function formatArgumentLatex(a: CoefficientRationnel, b: ValeurPiOuDecimale): string {
  const terme = formatCoefficientXLatex(a);
  if (b.decimal === 0) return terme;
  const magnitude = b.exact !== null ? formatMagnitudePiLatex(Math.abs(b.exact.numerateur), b.exact.denominateur) : formatDecimalLatex(Math.abs(b.decimal));
  const signe = b.decimal > 0 ? "+" : "-";
  return `${terme} ${signe} ${magnitude}`;
}

/** Énoncé complet de l'équation, ex. "\\cos\\left(2x-\\frac{\\pi}{4}\\right) = \\frac{1}{2}". */
export function formatEquationEnonceLatex(exercice: { fonction: FonctionTrig; a: CoefficientRationnel; b: ValeurPiOuDecimale; k: ValeurCible }): string {
  return `${NOM_FONCTION_LATEX[exercice.fonction]}\\left(${formatArgumentLatex(exercice.a, exercice.b)}\\right) = ${exercice.k.latex}`;
}

export function formatBranchesLatex(branches: BrancheAngle[]): string[] {
  return branches.map(formatBrancheLatex);
}

function formatCoefficientRationnelLatex(a: CoefficientRationnel): string {
  return a.denominateur === 1 ? `${a.numerateur}` : `\\frac{${a.numerateur}}{${a.denominateur}}`;
}

/** Aide 1 (D.1) — rappel de l'identité selon la fonction, jamais la valeur résolue. */
export function texteAideArgumentNiveau1(fonction: FonctionTrig): string {
  if (fonction === "sin") return "Deux angles supplémentaires ont le même sinus.";
  if (fonction === "cos") return "Deux angles opposés ont le même cosinus.";
  return "La tangente ne donne qu'une seule famille de solutions par période — pas de second angle à chercher, contrairement à sin et cos.";
}

/** Aide 2 (D.1) — formule générale selon la fonction, SANS jamais donner la valeur résolue. Fixe
 * par fonction, jamais conditionnée par `aucuneSolution`/`casSpecial` (simplification assumée —
 * voir CLAUDE.md section 5gen10). */
export function texteAideArgumentNiveau2(fonction: FonctionTrig): string {
  if (fonction === "sin") return "sin(X)=a ⟹ X = arcsin(a) + 2kπ OU X = (π − arcsin(a)) + 2kπ (k entier)";
  if (fonction === "cos") return "cos(X)=a ⟹ X = arccos(a) + 2kπ OU X = −arccos(a) + 2kπ (k entier)";
  return "tan(X)=a ⟹ X = arctan(a) + kπ (k entier)";
}

export const TEXTE_AIDE_ISOLER_X_NIVEAU1 =
  "N'oublie pas de diviser TOUT le membre de droite par a : la constante ET le terme périodique (nπ devient nπ/a, ou 2nπ/a selon le cas) — jamais seulement la constante.";

/** Aide 2 — formule x=(u-b)/a SUBSTITUÉE (les vraies valeurs de u, a, b) mais PAS calculée/simplifiée
 * — une entrée par branche de `branchesU`. */
export function formatAideIsolerXNiveau2Latex(exercice: { a: CoefficientRationnel; b: ValeurPiOuDecimale; branchesU: BrancheAngle[] }): string[] {
  const aLatex = formatCoefficientRationnelLatex(exercice.a);
  const bLatex = formatValeurLatex(exercice.b);
  return exercice.branchesU.map((u) => `x = \\dfrac{(${formatBrancheLatex(u)}) - (${bLatex})}{${aLatex}}`);
}

export const TEXTE_AIDE_SOLUTIONS_NIVEAU1 = "Combien de points distincts un tour complet ([0;2π[) contient-il pour cette série ? Balaye k jusqu'au bouclage complet, pas seulement k=-1, 0, 1.";
export const TEXTE_AIDE_SOLUTIONS_NIVEAU2 = "Le premier point est déjà placé sur le cercle, à titre d'exemple. Retrouve les autres en balayant n.";

/** Cherche p/q (q≤24) tel que v≈(p/q)·π, à tolérance serrée — reconstruction du label texte (pas
 * KaTeX, un `<text>` SVG brut ne peut pas rendre de LaTeX réel) du cercle trigonométrique en régime
 * exact. `null` si aucune fraction "simple" ne correspond (jamais atteint en pratique pour ce
 * générateur, les solutions en régime exact sont TOUJOURS des multiples de π/24 au maximum, voir
 * `generateurs5e/equationsTrigonometriques/coefficients.ts`). */
function approximerFractionPi(v: number): { numerateur: number; denominateur: number } | null {
  for (let denominateur = 1; denominateur <= 24; denominateur++) {
    const numerateur = Math.round((v / Math.PI) * denominateur);
    if (Math.abs(v - (numerateur / denominateur) * Math.PI) < 1e-4) {
      if (numerateur === 0) return { numerateur: 0, denominateur: 1 };
      const g = pgcd(Math.abs(numerateur), denominateur);
      return { numerateur: numerateur / g, denominateur: denominateur / g };
    }
  }
  return null;
}

/** Label PLAIN TEXT (jamais de LaTeX — rendu directement dans un `<text>` SVG, voir
 * `components5e/CercleTrigEquationSketch.tsx`) d'une solution du cercle trigonométrique. */
export function formatAngleLabelTexte(v: number, regime: RegimeEquationTrig): string {
  if (regime === "exact") {
    const frac = approximerFractionPi(v);
    if (frac) {
      if (frac.numerateur === 0) return "0";
      if (frac.denominateur === 1) return frac.numerateur === 1 ? "π" : `${frac.numerateur}π`;
      return frac.numerateur === 1 ? `π/${frac.denominateur}` : `${frac.numerateur}π/${frac.denominateur}`;
    }
  }
  return formatDecimalLatex(v);
}
