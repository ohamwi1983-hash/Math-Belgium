/**
 * Couche présentation — "Centre et rayon d'un cercle depuis l'équation développée"
 * (`src/generateurs/equationCercleDeveloppee/`, `src/moteur/sessionEquationCercleDeveloppee.ts`).
 * Consignes/textes d'aide/formatage LaTeX par écran — dérivés uniquement des champs déjà présents
 * sur le contrat, jamais recalculés différemment côté vérification
 * (`moteur/verificationEquationCercleDeveloppee.ts`).
 *
 * Réutilise `formatSommeTermes` (`ui/formatEquation.ts`, module frère déjà partagé par les
 * exercices 1-6) pour le formatage signé des groupes x²/y² — générique sur le SUFFIXE du terme
 * (`"x^2"`/`"x"`/`"y^2"`/`"y"`), jamais spécifique à une seule variable malgré son usage historique
 * mono-variable x. Réutilise aussi `formatFractionIrreductible` (`ui/formatFraction.ts`, déjà
 * partagée ailleurs sur la plateforme) pour les centres/rayons carrés demi-entiers/en quart —
 * toujours une fraction irréductible, jamais une notation décimale (correction transversale
 * chapitre 6, partie C.2, `promptgen43gen44etcorrectionschapitre6.md`).
 *
 * `texte`/`latex` — helpers locaux dupliqués (pas partagés) pour construire un `FragmentConsigne[]`,
 * même patron que `formatCaracteristiquesDroite.ts`/`formatRelationsDroites.ts` : la consigne de
 * l'écran final mélange du texte brut et du LaTeX inline court (`o(x_o\,;\,y_o)`, `R`),
 * `promptgen50modifications.md`, point 5.
 */
import type { ExerciceEquationCercleDeveloppee } from "../core/equationCercleDeveloppee.types";
import { formatSommeTermes } from "./formatEquation";
import type { FragmentConsigne } from "./formatEquationDroite";
import { formatFractionIrreductible } from "./formatFraction";
import { nombreFr } from "./nombreFr";


function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

/** Consigne générale, affichée sur les 3 écrans (regroupement, complétion, écran final) —
 * `promptgen50modifications.md`, point 1. */
export const CONSIGNE_GENERALE_CENTRE_RAYON = "Détermine le centre et le rayon du cercle d'équation :";

export const LIBELLE_VARIANTE: Record<ExerciceEquationCercleDeveloppee["variante"], string> = {
  rationnel: "Rayon rationnel",
  irrationnel: "Rayon irrationnel",
};

/** Magnitude (toujours ≥0) en fraction irréductible si non entière, jamais en décimal. */
function formatMagnitudeLatex(abs: number): string {
  const texteFraction = formatFractionIrreductible(abs);
  const [numerateur, denominateur] = texteFraction.split("/");
  return denominateur === undefined ? numerateur : `\\frac{${numerateur}}{${denominateur}}`;
}

/** Valeur signée (centre/rayon carré, entier ou demi-entier/en quart) — fraction irréductible si
 * non entière, jamais de décimal, jamais de double signe. */
function formatValeurLatex(valeur: number): string {
  return valeur < 0 ? `-${formatMagnitudeLatex(-valeur)}` : formatMagnitudeLatex(valeur);
}

// ============================================================================
// Énoncé fixe — toujours affiché, sur les 3 écrans.
// ============================================================================

export function formatEquationDeveloppeeLatex(exercice: ExerciceEquationCercleDeveloppee): string {
  const { k, bx, by, c } = exercice;
  const gauche = formatSommeTermes([
    { valeur: k, suffixe: "x^2" },
    { valeur: k, suffixe: "y^2" },
    { valeur: bx, suffixe: "x" },
    { valeur: by, suffixe: "y" },
  ]);
  return `${gauche} = ${c}`;
}

// ============================================================================
// Écran 1 — regroupement, en suivant la méthode du cours (audit chapitre 7, point 46) : diviser
// d'abord par le coefficient commun k, puis regrouper les termes en x et les termes en y. La mise
// en évidence de k devant chaque groupe (`k(x²+…) + k(y²+…) = c`) reste acceptée par la
// vérification, mais n'est plus la forme montrée.
// ============================================================================

export function consigneRegroupement(exercice: ExerciceEquationCercleDeveloppee): string {
  if (exercice.k === 1) return "Regroupe les termes en x entre parenthèses, puis les termes en y entre parenthèses.";
  return `Divise les deux membres par le coefficient commun de x² et de y² (${exercice.k}), puis regroupe les termes en x entre parenthèses et les termes en y entre parenthèses.`;
}

export function texteAideRegroupementNiveau1(exercice: ExerciceEquationCercleDeveloppee): string {
  const regroupement = "Place les termes en x dans une parenthèse, les termes en y dans une autre, et garde la constante dans l'autre membre.";
  if (exercice.k === 1) return regroupement;
  return `x² et y² ont le même coefficient, ${exercice.k} : divise chaque terme des deux membres par ${exercice.k}. ${regroupement}`;
}

/** "x^2 - 4x" (jamais "1x^2") — groupe interne, coefficient du carré toujours 1 (après division). */
function formatGroupeInterne(coefficientLineaire: number, variable: "x" | "y"): string {
  return formatSommeTermes([
    { valeur: 1, suffixe: `${variable}^2` },
    { valeur: coefficientLineaire, suffixe: variable },
  ]);
}

function groupeXInterne(exercice: ExerciceEquationCercleDeveloppee): string {
  return formatGroupeInterne(exercice.bx / exercice.k, "x");
}

function groupeYInterne(exercice: ExerciceEquationCercleDeveloppee): string {
  return formatGroupeInterne(exercice.by / exercice.k, "y");
}

/** Constante après division par k — toujours entière par construction (`c = kQ`). */
function constanteDivisee(exercice: ExerciceEquationCercleDeveloppee): number {
  return exercice.c / exercice.k;
}

/** Réponse de référence de l'écran 1 — (x²+…x) + (y²+…y) = c/k, la forme du cours. */
export function formatRegroupementLatex(exercice: ExerciceEquationCercleDeveloppee): string {
  return `(${groupeXInterne(exercice)}) + (${groupeYInterne(exercice)}) = ${constanteDivisee(exercice)}`;
}

/** Aide niveau 2 — le groupe en x déjà fait (choix fixe), celui en y laissé en suspens — jamais la
 * réponse complète. */
export function formatAideRegroupementNiveau2Latex(exercice: ExerciceEquationCercleDeveloppee): string {
  return `(${groupeXInterne(exercice)}) + (\\ldots) = ${constanteDivisee(exercice)}`;
}

// ============================================================================
// Écran 2 — complétion du carré.
// ============================================================================

export const CONSIGNE_COMPLETION = "Complète le carré dans chaque parenthèse : écris l'équation sous la forme d'un carré en x plus un carré en y.";

/** Fragments texte/LaTeX (jamais une chaîne Unicode brute "x²+px"/"(p/2)²"). */
export function segmentsAideCompletionNiveau1(): FragmentConsigne[] {
  return [
    texte("Dans chaque parenthèse "),
    latex("x^2+px"),
    texte(", ajoute et retranche "),
    latex("\\left(\\frac{p}{2}\\right)^2"),
    texte(" : "),
    latex("x^2+px=\\left(x+\\frac{p}{2}\\right)^2-\\left(\\frac{p}{2}\\right)^2"),
    texte(". Fais ensuite passer les constantes dans l'autre membre."),
  ];
}

/** "x - a" ou "x + |a|" — jamais "x - -1.5" ; "a=0" retourne la variable nue ("x"), jamais "x - 0". */
function formatBinome(variable: "x" | "y", valeur: number): string {
  if (valeur === 0) return variable;
  return valeur > 0 ? `${variable} - ${formatValeurLatex(valeur)}` : `${variable} + ${formatValeurLatex(-valeur)}`;
}

/** Binôme carré — parenthèses UNIQUEMENT si le binôme est une expression composée ("x - a"), jamais
 * autour de la variable nue ("x"), qui donnerait "(x)²" superflu (audit transversal,
 * `promptauditparenthesessuperflues.md`). */
function formatBinomeCarreLatex(variable: "x" | "y", valeur: number): string {
  const binome = formatBinome(variable, valeur);
  return valeur === 0 ? `${binome}^2` : `(${binome})^2`;
}

/** Réponse de référence de l'écran 2 — (x-a)²+(y-b)²=r², la forme centre-rayon du cours (la forme
 * k(x-a)²+k(y-b)²=k·r² reste acceptée par la vérification). */
export function formatCompletionLatex(exercice: ExerciceEquationCercleDeveloppee): string {
  const carreX = formatBinomeCarreLatex("x", exercice.centre.x);
  const carreY = formatBinomeCarreLatex("y", exercice.centre.y);
  return `${carreX} + ${carreY} = ${formatValeurLatex(exercice.rayonCarre)}`;
}

/** Aide niveau 2 — la complétion en x déjà faite (choix fixe), celle en y en suspens. */
export function formatAideCompletionNiveau2Latex(exercice: ExerciceEquationCercleDeveloppee): string {
  const carreX = formatBinomeCarreLatex("x", exercice.centre.x);
  return `${carreX} + (\\ldots)^2 = \\ldots`;
}

// ============================================================================
// Écran 3 — centre et rayon.
// ============================================================================

/** Consigne de l'écran final — même notation x₀/y₀ que les champs (audit chapitre 7, point 47 :
 * « o(x_o ; y_o) » ne correspondait ni aux champs ni au cours). Pour la variante `irrationnel`, la
 * forme acceptée du rayon est annoncée (valeur exacte ou arrondie au centième). */
export function segmentsConsigneCentreRayon(exercice: ExerciceEquationCercleDeveloppee): FragmentConsigne[] {
  const base: FragmentConsigne[] = [texte("Donne le centre "), latex("(x_0\\,;\\,y_0)"), texte(" et le rayon "), latex("R"), texte(" du cercle.")];
  if (exercice.variante !== "irrationnel") return base;
  return [...base, texte(" (rayon : valeur exacte, par exemple √18 ou 3√2, ou valeur arrondie au centième)")];
}

/** Fragments texte/LaTeX (jamais une chaîne Unicode brute "(x-x₀)²+(y-y₀)²=R²"). */
export function segmentsAideCentreRayonNiveau1(): FragmentConsigne[] {
  return [
    texte("Compare ton équation complétée avec "),
    latex("(x-x_0)^2+(y-y_0)^2=R^2"),
    texte(" : le centre est "),
    latex("(x_0\\,;\\,y_0)"),
    texte(" — attention aux signes — et le second membre vaut "),
    latex("R^2"),
    texte(", pas R."),
  ];
}

/** Forme réduite (x-a)²+(y-b)²=r² — rappelée à l'aide de niveau 2 de l'écran 3. */
export function formatEquationReduiteLatex(exercice: ExerciceEquationCercleDeveloppee): string {
  return formatCompletionLatex(exercice);
}

/** Complétion CONFIRMÉE — rappelée dans le récapitulatif (jamais resaisie). */
export function formatEtatActuelCompletionLatex(exercice: ExerciceEquationCercleDeveloppee): string {
  return formatCompletionLatex(exercice);
}

/** Regroupement CONFIRMÉ — rappelé dans le récapitulatif. */
export function formatEtatActuelRegroupementLatex(exercice: ExerciceEquationCercleDeveloppee): string {
  return formatRegroupementLatex(exercice);
}

export function formatCentreAttenduLatex(exercice: ExerciceEquationCercleDeveloppee): string {
  const { x, y } = exercice.centre;
  return `(${formatValeurLatex(x)} \\; ; \\; ${formatValeurLatex(y)})`;
}

/** `√n` décomposé en `m√k` (k sans facteur carré). */
function decomposerRacine(n: number): { m: number; k: number } {
  let m = 1;
  let k = n;
  for (let d = 2; d * d <= k; d++) {
    while (k % (d * d) === 0) {
      k /= d * d;
      m *= d;
    }
  }
  return { m, k };
}

/** Rayon exact, racine simplifiée (audit chapitre 7, point 45 : `\sqrt{\frac{27}{2}}` s'écrit
 * `\frac{3\sqrt{6}}{2}`). r² = R/4 avec R entier par construction, donc r = √R/2 = m√k/2, réduit. */
export function formatRayonAttenduLatex(exercice: ExerciceEquationCercleDeveloppee): string {
  if (exercice.variante === "rationnel") return formatValeurLatex(exercice.rayon);
  const { m, k } = decomposerRacine(Math.round(exercice.rayonCarre * 4));
  const racine = `${m === 1 ? "" : m}\\sqrt{${k}}`;
  if (m % 2 === 0) {
    const m2 = m / 2;
    return `${m2 === 1 ? "" : m2}\\sqrt{${k}}`;
  }
  return `\\frac{${racine}}{2}`;
}

/** Valeur arrondie au centième, virgule décimale (jamais « 3.81 » — audit chapitre 7, point 45). */
export function formatRayonApprocheTexte(exercice: ExerciceEquationCercleDeveloppee): string {
  return nombreFr(Math.round(exercice.rayon * 100) / 100);
}

/** Exemples de saisie choisis HORS de l'espace des tirages (|x₀|, |y₀| ≤ 3, coefficients linéaires
 * divisés ≤ 6, r² ≤ 30) — un placeholder ne vaut jamais la réponse (audit chapitre 7, point 10). */
export const PLACEHOLDER_EQUATION = "ex : (x^2-14x)+(y^2+16y)=5";
export const PLACEHOLDER_COMPLETION = "ex : (x-7)^2+(y+8)^2=40";
export const PLACEHOLDER_COORDONNEE = "ex : 7/2";
export const PLACEHOLDER_RAYON = "ex : 3√15";
