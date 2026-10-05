/**
 * Présentation — "Paramètres de dispersion" (remplace "Mode et classe modale",
 * `promptgen34remplacement.md`). Structure du tableau/aides à paliers directement inspirée de
 * "Moyenne pondérée" (`ui/formatMoyennePonderee.ts`) ; règle de signe "=" vs "≈" et notation
 * décimale française directement dupliquées depuis "Inégalité de Bienaymé-Tchebychev"
 * (`ui/formatBienaymeTchebychev.ts`, jamais importées — présentation pure, même principe que le
 * reste du projet).
 *
 * **Signe "=" vs "≈"** — `sommeProduits`/`n` (écran 1, et leur rappel en état actuel sur l'écran 2)
 * sont TOUJOURS des entiers exacts par construction (`core/dispersion.types.ts`), donc toujours "="
 * — jamais besoin de la machinerie de signe dynamique pour eux. `varianceAttendue`/`ecartTypeAttendu`
 * sont en revanche de VRAIES valeurs arrondies : `varianceValeurExacte`/`ecartTypeValeurExacte`
 * RE-DÉRIVENT la valeur AVANT arrondi (dupliquant exactement les formules de
 * `generateurs/dispersion/index.ts`) pour décider "=" (aucun arrondi réel) vs "≈" (un arrondi a
 * réellement changé la valeur) — même principe exact que `kValeurExacte`/`estArrondiExact`
 * (`formatBienaymeTchebychev.ts`).
 */
import type { ContexteBienaymeTchebychev } from "../core/bienaymeTchebychev.types";
import type { ExerciceDispersion } from "../core/dispersion.types";

export const LABEL_XBAR = "\\bar{x}";
export const LABEL_VALEUR_XI = "x_i";
export const LABEL_EFFECTIF_NI = "n_i";
export const LABEL_PRODUIT = "(x_i-\\bar{x})^2 \\cdot n_i";
export const LABEL_SOMME_N = "\\Sigma n_i";
export const LABEL_SOMME_PRODUIT = "\\Sigma(x_i-\\bar{x})^2 \\cdot n_i";
export const LABEL_VARIANCE = "V";
export const LABEL_ECART_TYPE = "\\sigma";

export const PLACEHOLDER_PRODUIT = "ex : 18";
export const PLACEHOLDER_SOMME_N = "ex : 20";
export const PLACEHOLDER_SOMME_PRODUIT = "ex : 96";
export const PLACEHOLDER_VARIANCE = "ex : 4,8";
export const PLACEHOLDER_ECART_TYPE = "ex : 2,19";

export const PRECISION_2_DECIMALES = "arrondi à la 2e décimale";

/** Index de la ligne "exemple" utilisée par l'Aide 2 de l'écran "tableau" — toujours la première
 * ligne du tableau, jamais un second tirage côté présentation (le tirage aléatoire vit exclusivement
 * en Couche A) — même principe que "Moyenne pondérée"/"Médiane". */
export const INDEX_LIGNE_EXEMPLE = 0;

export function libelleBoutonAide(niveau: number, max: number): string {
  if (niveau >= max) return "Aide utilisée";
  return niveau === 0 ? "Aide" : "Aide supplémentaire";
}

/** Consigne composée en 3 morceaux — texte brut avant / fragment LaTeX pur / texte brut après —
 * assemblée en JSX (`{avant}<Katex expression={latex}/>{apres}`), jamais passée entière à KaTeX
 * (même patron que "Moyenne pondérée"/"Point à partir d'une relation vectorielle"). */
export interface ConsigneSegmentee {
  avant: string;
  latex: string;
  apres: string;
}

/** Une aide composée de deux lignes — phrase de rappel en texte brut, suivie d'un fragment LaTeX
 * rendu en bloc — jamais un unique bloc `\text` monolithique. */
export interface AideDeuxLignes {
  texte: string;
  latex: string;
}

/** Notation décimale FRANÇAISE (virgule, `{,}`) pour une valeur insérée dans un bloc KaTeX. */
export function formatNombreLatex(valeur: number): string {
  return String(valeur).replace(".", "{,}");
}

/** Même notation française, pour du texte HTML brut (jamais passé par KaTeX). */
export function formatNombreTexte(valeur: number): string {
  return String(valeur).replace(".", ",");
}

// ============================================================================
// Énoncé — persistant sur les 2 écrans (règle d'affichage transversale, même principe que
// "Inégalité de Bienaymé-Tchebychev").
// ============================================================================

export type SegmentTexte = { type: "texte"; valeur: string } | { type: "katex"; valeur: string };

function T(valeur: string): SegmentTexte {
  return { type: "texte", valeur };
}

function Kx(valeur: string): SegmentTexte {
  return { type: "katex", valeur };
}

export function formatEnonceSegments(exercice: ExerciceDispersion): SegmentTexte[] {
  const { contexte, xBar } = exercice;
  return [
    T(`Chez les ${contexte.population}, ${contexte.caractereDefini} ${contexte.moyenAccord} est `),
    Kx(`${LABEL_XBAR} = ${xBar}\\text{ ${contexte.unite}}`),
    T("."),
  ];
}

export function segmentsVersTexte(segments: SegmentTexte[]): string {
  return segments.map((s) => s.valeur).join("");
}

// ============================================================================
// Écran 1 — "Tableau et sommes intermédiaires".
// ============================================================================

export function consigneTableau(): string {
  return "Complète le tableau ci-dessous, ainsi que les deux sommes nécessaires au calcul de la variance.";
}

/** Convertie en `SegmentTexte[]` — `promptinvestigationpoint3latexmobile.md`, occurrence gen34 :
 * texte court, sans risque de débordement mobile mesuré, indices xᵢ/nᵢ/Σnᵢ rendus en KaTeX plutôt
 * qu'en Unicode brut. */
export function texteAideTableauNiveau1(): SegmentTexte[] {
  return [
    T("Rappel : pour chaque ligne, calcule l'écart à la moyenne ("),
    Kx(`${LABEL_VALEUR_XI} - ${LABEL_XBAR}`),
    T("), élève-le au carré, puis multiplie par l'effectif "),
    Kx(LABEL_EFFECTIF_NI),
    T(". "),
    Kx(LABEL_SOMME_N),
    T(" est simplement la somme de tous les effectifs."),
  ];
}

export function texteAideTableauNiveau2(exercice: ExerciceDispersion): AideDeuxLignes {
  const ligne = exercice.lignes[INDEX_LIGNE_EXEMPLE];
  const ecart = ligne.valeur - exercice.xBar;
  return {
    texte: "Pour la première ligne :",
    latex: `(${ligne.valeur}-${exercice.xBar})^2 \\cdot ${ligne.effectif} = ${formatNombreLatex(ecart)}^2 \\cdot ${ligne.effectif} = ${ligne.produitAttendu}`,
  };
}

// ============================================================================
// Écran 2 — "Variance et écart-type" — 2 champs indépendants, sur le même écran.
// ============================================================================

export function consigneVariance(contexte: ContexteBienaymeTchebychev): ConsigneSegmentee {
  return {
    avant: "Calcule la variance ",
    latex: LABEL_VARIANCE,
    apres: ` à partir des deux sommes ci-dessus (${PRECISION_2_DECIMALES}, en ${contexte.unite}²).`,
  };
}

export function consigneEcartType(contexte: ContexteBienaymeTchebychev): ConsigneSegmentee {
  return {
    avant: "Déduis-en l'écart-type ",
    latex: `${LABEL_ECART_TYPE}=\\sqrt{${LABEL_VARIANCE}}`,
    apres: ` (${PRECISION_2_DECIMALES}, en ${contexte.unite}).`,
  };
}

/** Deux formules combinées via `\begin{gathered}` (empilement vertical dans un seul bloc KaTeX,
 * jamais `\qquad` sur une seule ligne — retour à la ligne propre sur mobile étroit,
 * `promptblocfittertousgenerateurs.md`), même patron que `formatEtatActuelTableauLatex` ci-dessous. */
export function texteAideVarianceEcartTypeNiveau1(): AideDeuxLignes {
  return {
    texte: "Rappel :",
    latex: `\\begin{gathered} ${LABEL_VARIANCE} = \\dfrac{${LABEL_SOMME_PRODUIT}}{${LABEL_SOMME_N}} \\\\ ${LABEL_ECART_TYPE} = \\sqrt{${LABEL_VARIANCE}} \\end{gathered}`,
  };
}

export function texteAideVarianceEcartTypeNiveau2(exercice: ExerciceDispersion): AideDeuxLignes {
  return {
    texte: "Substitué (non calculé) :",
    latex: `\\begin{gathered} ${LABEL_VARIANCE} = \\dfrac{${exercice.sommeProduits}}{${exercice.n}} \\\\ ${LABEL_ECART_TYPE} = \\sqrt{${formatNombreLatex(exercice.varianceAttendue)}} \\end{gathered}`,
  };
}

/** État actuel de l'écran 2 — les deux sommes CONFIRMÉES à l'écran 1, toujours des entiers exacts
 * (jamais de rounding, donc toujours "=" — pas de machinerie de signe dynamique nécessaire pour
 * elles, même principe que "Moyenne pondérée"). Sur 2 lignes séparées (`\begin{gathered}`, jamais
 * côte à côte — précaution anti-débordement mobile déjà établie ailleurs dans le projet). */
export function formatEtatActuelTableauLatex(exercice: ExerciceDispersion): string {
  return `\\begin{gathered} ${LABEL_SOMME_PRODUIT} = ${exercice.sommeProduits} \\\\ ${LABEL_SOMME_N} = ${exercice.n} \\end{gathered}`;
}

// ============================================================================
// Signe "=" vs "≈" — dupliqué depuis "Inégalité de Bienaymé-Tchebychev"
// (`formatBienaymeTchebychev.ts::estArrondiExact`), jamais importé.
// ============================================================================

const EPSILON_SIGNE = 1e-9;

function estArrondiExact(valeurExacte: number, valeurAffichee: number): boolean {
  return Math.abs(valeurExacte - valeurAffichee) < EPSILON_SIGNE;
}

export interface ValeurEtatActuel {
  valeur: number;
  exact: boolean;
}

/** Re-dérive la valeur AVANT arrondi de la variance — duplique exactement
 * `generateurs/dispersion/index.ts`, jamais importée. */
function varianceValeurExacte(exercice: ExerciceDispersion): number {
  return exercice.sommeProduits / exercice.n;
}

/** Re-dérive la valeur AVANT arrondi de l'écart-type — cascade : `√varianceAttendue` (déjà
 * arrondie), jamais du ratio brut, cohérent avec la construction (voir `core/dispersion.types.ts`). */
function ecartTypeValeurExacte(exercice: ExerciceDispersion): number {
  return Math.sqrt(exercice.varianceAttendue);
}

export function varianceEtatActuel(exercice: ExerciceDispersion): ValeurEtatActuel {
  return { valeur: exercice.varianceAttendue, exact: estArrondiExact(varianceValeurExacte(exercice), exercice.varianceAttendue) };
}

export function ecartTypeEtatActuel(exercice: ExerciceDispersion): ValeurEtatActuel {
  return { valeur: exercice.ecartTypeAttendu, exact: estArrondiExact(ecartTypeValeurExacte(exercice), exercice.ecartTypeAttendu) };
}

// ============================================================================
// Révélation (panneau de résultat après échec) — toujours la vraie valeur confirmée, jamais la
// saisie de l'élève.
// ============================================================================

/** Convertie en `SegmentTexte[]` — `promptinvestigationpoint3latexmobile.md`, occurrence gen34 :
 * indices Σnᵢ/Σ(xᵢ-x̄)²·nᵢ rendus en KaTeX plutôt qu'en Unicode brut. */
export function formatTableauAttenduTexte(exercice: ExerciceDispersion): SegmentTexte[] {
  return [Kx(LABEL_SOMME_N), T(` = ${exercice.n}, `), Kx(LABEL_SOMME_PRODUIT), T(` = ${exercice.sommeProduits}`)];
}

export function formatVarianceAttendueTexte(exercice: ExerciceDispersion): string {
  const v = varianceEtatActuel(exercice);
  return `V ${v.exact ? "=" : "≈"} ${formatNombreTexte(v.valeur)}`;
}

export function formatEcartTypeAttendueTexte(exercice: ExerciceDispersion): string {
  const v = ecartTypeEtatActuel(exercice);
  return `σ ${v.exact ? "=" : "≈"} ${formatNombreTexte(v.valeur)}`;
}
