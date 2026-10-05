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

export { libelleBoutonAide } from "./formatEquationDroite";

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

/** Préfixe "k(" — jamais "1(" (coefficient 1 implicite, même convention que `formatFormeFactoriseeDepuisRacines`). */
function prefixeCoefficient(k: number): string {
  return k === 1 ? "" : String(k);
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
// Écran 1 — regroupement et factorisation du coefficient commun.
// ============================================================================

export const CONSIGNE_REGROUPEMENT = "Regroupe les termes en x, regroupe les termes en y, puis factorise le coefficient commun devant chacun.";

export const TEXTE_AIDE_REGROUPEMENT_NIVEAU1 =
  "Isole d'abord les termes en x d'un côté, les termes en y de l'autre, en gardant le second membre inchangé. Factorise ensuite le coefficient commun devant chaque groupe.";

/** "x^2 - 4x" (jamais "1x^2") — groupe interne, coefficient du carré toujours 1 (déjà factorisé). */
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

/** Réponse de référence de l'écran 1 — k(x²+...x) + k(y²+...y) = c, toujours "+" entre les deux
 * groupes (k est toujours strictement positif sur les deux termes, jamais un signe distinct). */
export function formatRegroupementLatex(exercice: ExerciceEquationCercleDeveloppee): string {
  const prefixe = prefixeCoefficient(exercice.k);
  return `${prefixe}(${groupeXInterne(exercice)}) + ${prefixe}(${groupeYInterne(exercice)}) = ${exercice.c}`;
}

/** Aide niveau 2 — un des deux groupements déjà fait (toujours celui en x, choix fixe), l'autre
 * laissé en suspens ("\\ldots") — jamais la réponse complète. */
export function formatAideRegroupementNiveau2Latex(exercice: ExerciceEquationCercleDeveloppee): string {
  const prefixe = prefixeCoefficient(exercice.k);
  return `${prefixe}(${groupeXInterne(exercice)}) + ${prefixe}(\\ldots) = ${exercice.c}`;
}

// ============================================================================
// Écran 2 — complétion du carré.
// ============================================================================

export const CONSIGNE_COMPLETION = "De ces 2 parenthèses, forme deux produits remarquables, l'un en x et l'autre en y.";

/** `p` explicitement introduit (le coefficient linéaire déjà factorisé à l'écran précédent) avant
 * d'être réutilisé dans la formule de complétion — jamais une lettre générique non expliquée
 * (`promptgen46etcorrectionstransversaleschapitre6.md`, point B.4). */
export const TEXTE_AIDE_COMPLETION_NIVEAU1 =
  "Dans chaque parenthèse x²+px (p étant le coefficient linéaire déjà factorisé à l'écran précédent), ajoute et retranche (p/2)² pour obtenir (x+p/2)² — attention à multiplier ce terme par le coefficient commun avant de le déplacer de l'autre côté.";

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

/** Constante du second membre une fois les carrés complétés — k(x-a)²+k(y-b)²=k·r² (voir l'en-tête
 * de `verificationEquationCercleDeveloppee.ts` : algébriquement identique à l'équation développée). */
function constanteCompletion(exercice: ExerciceEquationCercleDeveloppee): number {
  return exercice.k * exercice.rayonCarre;
}

export function formatCompletionLatex(exercice: ExerciceEquationCercleDeveloppee): string {
  const prefixe = prefixeCoefficient(exercice.k);
  const carreX = formatBinomeCarreLatex("x", exercice.centre.x);
  const carreY = formatBinomeCarreLatex("y", exercice.centre.y);
  return `${prefixe}${carreX} + ${prefixe}${carreY} = ${formatValeurLatex(constanteCompletion(exercice))}`;
}

/** Aide niveau 2 — une des deux complétions déjà faite (toujours celle en x), l'autre en suspens. */
export function formatAideCompletionNiveau2Latex(exercice: ExerciceEquationCercleDeveloppee): string {
  const prefixe = prefixeCoefficient(exercice.k);
  const carreX = formatBinomeCarreLatex("x", exercice.centre.x);
  return `${prefixe}${carreX} + ${prefixe}(\\ldots)^2 = \\ldots`;
}

// ============================================================================
// Écran 3 — centre et rayon.
// ============================================================================

/** Consigne de l'écran final — nomme explicitement le centre $o(x_o\,;\,y_o)$ et le rayon $R$
 * (`promptgen50modifications.md`, point 5 — casse minuscule pour $o$/$x_o$/$y_o$ conservée
 * volontairement, contrairement à la notation $R$ majuscule du rayon déjà en place).
 *
 * Pour la variante `irrationnel`, le rayon est irrationnel (`\sqrt{...}`) — `diagnostiquerRayon`
 * (`verificationEquationCercleDeveloppee.ts`) accepte AUSSI BIEN cette forme exacte qu'une valeur
 * décimale approchée (arrondie au centième), mais `PLACEHOLDER_RAYON` ne montre que la forme exacte :
 * annoncé explicitement ici pour cette seule variante (audit de traçabilité de précision). Pour la
 * variante `rationnel`, le rayon est toujours une décimale exacte simple (voir `formatRayonAttenduLatex`) —
 * aucune note nécessaire. */
export function segmentsConsigneCentreRayon(exercice: ExerciceEquationCercleDeveloppee): FragmentConsigne[] {
  const base: FragmentConsigne[] = [texte("Identifie le centre "), latex("o(x_o\\,;\\,y_o)"), texte(" et le rayon "), latex("R"), texte(" du cercle.")];
  if (exercice.variante !== "irrationnel") return base;
  return [...base, texte(" (rayon : forme exacte ou valeur décimale arrondie au centième)")];
}

export const TEXTE_AIDE_CENTRE_RAYON_NIVEAU1 = "Divise chaque membre de l'équation par le coefficient commun devant les parenthèses pour isoler (x-x₀)²+(y-y₀)²=R², avec (x₀ ; y₀) le centre cherché.";

/** Forme réduite (x-a)²+(y-b)²=r² — coefficient k TOUJOURS absent après division, jamais montré. */
export function formatEquationReduiteLatex(exercice: ExerciceEquationCercleDeveloppee): string {
  const carreX = formatBinomeCarreLatex("x", exercice.centre.x);
  const carreY = formatBinomeCarreLatex("y", exercice.centre.y);
  return `${carreX} + ${carreY} = ${formatValeurLatex(exercice.rayonCarre)}`;
}

/** Centre + rayon CONFIRMÉS — forme complétée rappelée dans le bloc "État actuel" de l'écran 3
 * (jamais resaisie, même principe que le reste du projet). */
export function formatEtatActuelCompletionLatex(exercice: ExerciceEquationCercleDeveloppee): string {
  return formatCompletionLatex(exercice);
}

/** Regroupement CONFIRMÉ — rappelé dans le bloc "État actuel" de l'écran 2. */
export function formatEtatActuelRegroupementLatex(exercice: ExerciceEquationCercleDeveloppee): string {
  return formatRegroupementLatex(exercice);
}

export function formatCentreAttenduLatex(exercice: ExerciceEquationCercleDeveloppee): string {
  const { x, y } = exercice.centre;
  return `(${formatValeurLatex(x)} \\; ; \\; ${formatValeurLatex(y)})`;
}

/** Rayon exact — jamais la valeur décimale approchée : décimal simple pour la variante rationnelle,
 * racine de r² exact (notation française) pour la variante irrationnelle. */
export function formatRayonAttenduLatex(exercice: ExerciceEquationCercleDeveloppee): string {
  if (exercice.variante === "rationnel") return formatValeurLatex(exercice.rayon);
  return `\\sqrt{${formatValeurLatex(exercice.rayonCarre)}}`;
}

/** Écran "regroupement" — exemple de forme regroupée/factorisée. */
export const PLACEHOLDER_EQUATION = "ex : 3(x^2-4x)+3(y^2+3y)=6";
/** Écran "complétion du carré" — exemple de forme complétée (somme de carrés), jamais la forme
 * regroupée de l'écran précédent (copiée par erreur jusqu'ici — `promptgen50modifications.md`,
 * point 4). */
export const PLACEHOLDER_COMPLETION = "ex : 3(x-2)^2+3(y+1)^2=6";
export const PLACEHOLDER_COORDONNEE = "ex : 3";
export const PLACEHOLDER_RAYON = "ex : sqrt(8.25)";
