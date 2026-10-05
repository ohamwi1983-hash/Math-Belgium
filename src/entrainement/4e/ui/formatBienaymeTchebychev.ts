/**
 * Présentation — "Inégalité de Bienaymé-Tchebychev" (chapitre 5) — refonte complète, puis
 * `promptgen37correctionsgroupees.md` (5 corrections groupées, appliquées aux 8 variantes) :
 * précision d'arrondi visible dans chaque consigne, renommage "pourcentage minimal" → "% minimal",
 * unité du contexte dans les consignes x̄/σ/bornes, contenu des aides "trouver σ"/"trouver x̄"
 * (formule non isolée à l'aide 1, équation substituée mais non résolue à l'aide 2), et signe "="
 * vs "≈" conditionnel au résultat réel de l'instance générée (voir "Signe = vs ≈" ci-dessous).
 * **Aucun changement de la logique de calcul ou de vérification sous-jacente** — uniquement des
 * corrections d'affichage et de contenu pédagogique des aides. `promptcorrectionsauditgroupees.md`
 * (point 3) rattrape ensuite 2 titres d'aide résiduels (`texteAideKDepuisPourcentNiveau1`/
 * `texteAidePourcentNiveau1`) que ce renommage avait manqués, jamais reconvertis à l'époque.
 *
 * **Notation systématique $\bar x$/$\sigma$/$k$** (jamais μ) — toute mention de ces symboles, y
 * compris dans l'énoncé en prose, passe par un fragment KaTeX dédié (`SegmentTexte`, type "katex"),
 * jamais un caractère brut "x̄"/"σ" tapé dans le texte. `formatNombreLatex` (notation française,
 * virgule entre accolades) habille toute valeur potentiellement décimale insérée dans un bloc
 * KaTeX ; `formatNombreTexte` fait de même pour du texte HTML brut (jamais passé par KaTeX) — les
 * deux fonctions restent séparées pour ne jamais laisser une syntaxe LaTeX (`{,}`) fuiter dans une
 * balise `<p>`/`<div>` normale (piège déjà rencontré et corrigé sur la première version de ce
 * générateur).
 *
 * **Règle d'affichage transversale** (`promptgen37refonte.md`) : l'énoncé de départ (contexte +
 * question) reste affiché sur TOUS les écrans d'une variante — `formatEnonceSegments` en est
 * l'unique source, consommée par `EnonceBienaymeTchebychev.tsx` (composant partagé, monté par les 8
 * composants d'écran). Chaque écran affiche EN PLUS les résultats déjà validés aux écrans
 * précédents (via `EtatActuelPanel`, jamais resaisis) — voir les fonctions `formatEtatActuelXxxLatex`
 * ci-dessous.
 *
 * **Piège conceptuel central, ciblé explicitement par au moins une aide de chaque variante** : c'est
 * une borne INFÉRIEURE garantie ("au moins"), jamais une valeur exacte.
 *
 * **Signe "=" vs "≈" (`promptgen37correctionsgroupees.md`, point 5)** — chaque valeur "Attendu" du
 * contrat est déjà la valeur ARRONDIE (voir `core/bienaymeTchebychev.types.ts`) ; les fonctions
 * `xxxValeurExacte` ci-dessous RE-DÉRIVENT la valeur AVANT arrondi, en DUPLIQUANT exactement les
 * mêmes formules que `generateurs/bienaymeTchebychev/index.ts` (jamais importées — présentation
 * pure, même principe que le reste du projet, ex. `ajusterAuRatio`) à partir des seuls champs bruts
 * déjà stockés sur l'exercice — jamais une nouvelle donnée de contrat, jamais un changement de la
 * logique de génération elle-même. `estArrondiExact` compare cette valeur re-dérivée à la valeur
 * affichée (tolérance minime, bruit de virgule flottante) pour décider "=" (aucun arrondi réel) vs
 * "≈" (un arrondi a réellement changé la valeur).
 */
import type { ContexteBienaymeTchebychev, ExerciceBienaymeTchebychev, VarianteBienaymeTchebychev } from "../core/bienaymeTchebychev.types";

export const LABEL_XBAR = "\\bar{x}";
export const LABEL_SIGMA = "\\sigma";
export const LABEL_K = "k";

export interface AideAvecFormule {
  texte: string;
  latex: string;
}

export type SegmentTexte = { type: "texte"; valeur: string } | { type: "katex"; valeur: string };

function T(valeur: string): SegmentTexte {
  return { type: "texte", valeur };
}

function Kx(valeur: string): SegmentTexte {
  return { type: "katex", valeur };
}

/** Notation décimale FRANÇAISE (virgule, `{,}`) pour toute valeur potentiellement décimale insérée
 * dans un bloc KaTeX — un entier reste affiché tel quel. */
export function formatNombreLatex(valeur: number): string {
  return String(valeur).replace(".", "{,}");
}

/** Même notation décimale française que `formatNombreLatex`, mais pour du texte HTML brut (jamais
 * passé par KaTeX) — sans les accolades `{,}` (syntaxe LaTeX uniquement, qui s'afficherait
 * littéralement si insérée dans un `<p>`/`<div>` normal — piège rencontré et corrigé sur la
 * première version de ce générateur, voir CLAUDE.md). */
export function formatNombreTexte(valeur: number): string {
  return String(valeur).replace(".", ",");
}

const LIBELLES_VARIANTE: Record<VarianteBienaymeTchebychev, string> = {
  intervalleVersPourcent: "Intervalle → % minimal",
  pourcentVersIntervalle: "% minimal → intervalle",
  intervalleVersNombre: "Intervalle → nombre minimal",
  nombreVersIntervalle: "Nombre minimal → intervalle",
  intervalleVersSigma: "Intervalle + % → σ",
  intervalleVersXBar: "Intervalle + % → x̄",
  nombreVersSigma: "Intervalle + nombre minimal → σ",
  nombreVersXBar: "Intervalle + nombre minimal → x̄",
};

export function libelleVarianteBienaymeTchebychev(variante: VarianteBienaymeTchebychev): string {
  return LIBELLES_VARIANTE[variante];
}

export function libelleBoutonAide(niveau: number, max: number): string {
  if (niveau >= max) return "Aide utilisée";
  return niveau === 0 ? "Aide" : "Aide supplémentaire";
}

// ============================================================================
// Précision d'arrondi affichée dans les consignes (`promptgen37correctionsgroupees.md`, point 1) —
// cohérente avec la règle de vérification réellement appliquée
// (`generateurs/bienaymeTchebychev/arrondis.ts`), jamais une nouvelle tolérance.
// ============================================================================

export const PRECISION_K = "arrondi à la deuxième décimale";
export const PRECISION_POURCENT_INTERMEDIAIRE = "arrondi à la 2e décimale";
export const PRECISION_UNITE = "arrondi à l'unité";

/** L'écran "pourcentage minimal" est partagé entre V1 (final, `arrondiVersLeBas` à l'UNITÉ) et V3
 * (intermédiaire, `arrondi2` standard à la 2e décimale) — seule la précision AFFICHÉE en dépend,
 * jamais la vérification elle-même (déjà capturée par la valeur de `pourcentAttendu`). */
export function precisionPourcentFinal(variante: "intervalleVersPourcent" | "intervalleVersNombre"): string {
  return variante === "intervalleVersPourcent" ? PRECISION_UNITE : PRECISION_POURCENT_INTERMEDIAIRE;
}

// ============================================================================
// Énoncé — segments texte/KaTeX, une seule source pour les 8 variantes, affichée sur tous les
// écrans d'une variante (règle d'affichage transversale).
// ============================================================================

function phraseCesPopulation(contexte: ContexteBienaymeTchebychev): string {
  return `ces ${contexte.population}`;
}

function phraseCaractereComprisEntre(contexte: ContexteBienaymeTchebychev, borneInf: number, borneSup: number): string {
  return `${contexte.caractereIndefini} ${contexte.comprisAccord} entre ${borneInf} et ${borneSup} ${contexte.unite}`;
}

function segmentsBaseComplete(contexte: ContexteBienaymeTchebychev, xBar: number, sigma: number): SegmentTexte[] {
  return [
    T(`Chez les ${contexte.population}, ${contexte.caractereDefini} ${contexte.moyenAccord} est `),
    Kx(`${LABEL_XBAR} = ${xBar}\\text{ ${contexte.unite}}`),
    T(", avec un écart-type "),
    Kx(`${LABEL_SIGMA} = ${sigma}\\text{ ${contexte.unite}}`),
    T("."),
  ];
}

function segmentsBaseXBarSeul(contexte: ContexteBienaymeTchebychev, xBar: number): SegmentTexte[] {
  return [T(`Chez les ${contexte.population}, ${contexte.caractereDefini} ${contexte.moyenAccord} est `), Kx(`${LABEL_XBAR} = ${xBar}\\text{ ${contexte.unite}}`), T(".")];
}

function segmentsBaseSigmaSeul(contexte: ContexteBienaymeTchebychev, sigma: number): SegmentTexte[] {
  return [T(`Chez les ${contexte.population}, ${contexte.caractereDefini} a un écart-type `), Kx(`${LABEL_SIGMA} = ${sigma}\\text{ ${contexte.unite}}`), T(".")];
}

function segmentsQuestionV1(contexte: ContexteBienaymeTchebychev, borneInf: number, borneSup: number): SegmentTexte[] {
  return [T(`Quelle est la proportion minimale de ${phraseCesPopulation(contexte)} qui ont ${phraseCaractereComprisEntre(contexte, borneInf, borneSup)} ?`)];
}

function segmentsQuestionV2(contexte: ContexteBienaymeTchebychev, pourcentDonne: number): SegmentTexte[] {
  return [
    T(
      `Dans quel intervalle de ${contexte.caractereComplement} centré autour de la moyenne peut-on trouver au moins ${pourcentDonne} % de ${phraseCesPopulation(contexte)} ?`,
    ),
  ];
}

function segmentsQuestionV3(contexte: ContexteBienaymeTchebychev, n: number, borneInf: number, borneSup: number): SegmentTexte[] {
  return [T(`Sur un échantillon de ${n} ${contexte.population}, quel est le nombre minimal qui ont ${phraseCaractereComprisEntre(contexte, borneInf, borneSup)} ?`)];
}

function segmentsQuestionV4(contexte: ContexteBienaymeTchebychev, n: number, nombreMinDonne: number): SegmentTexte[] {
  return [
    T(
      `Sur un échantillon de ${n} ${contexte.population}, dans quel intervalle de ${contexte.caractereComplement} centré autour de la moyenne peut-on trouver au moins ${nombreMinDonne} de ${phraseCesPopulation(contexte)} ?`,
    ),
  ];
}

function segmentsQuestionV5(contexte: ContexteBienaymeTchebychev, pourcentDonne: number, borneInf: number, borneSup: number): SegmentTexte[] {
  return [
    T(`Sachant qu'au moins ${pourcentDonne} % de ${phraseCesPopulation(contexte)} ont ${phraseCaractereComprisEntre(contexte, borneInf, borneSup)}, quel est l'écart-type `),
    Kx(LABEL_SIGMA),
    T(" ?"),
  ];
}

function segmentsQuestionV6(contexte: ContexteBienaymeTchebychev, pourcentDonne: number, borneInf: number, borneSup: number): SegmentTexte[] {
  return [
    T(`Sachant qu'au moins ${pourcentDonne} % de ${phraseCesPopulation(contexte)} ont ${phraseCaractereComprisEntre(contexte, borneInf, borneSup)}, quelle est la moyenne `),
    Kx(LABEL_XBAR),
    T(" ?"),
  ];
}

function segmentsQuestionV7(contexte: ContexteBienaymeTchebychev, n: number, nombreMinDonne: number, borneInf: number, borneSup: number): SegmentTexte[] {
  return [
    T(
      `Sur un échantillon de ${n} ${contexte.population}, sachant qu'au moins ${nombreMinDonne} de ${phraseCesPopulation(contexte)} ont ${phraseCaractereComprisEntre(contexte, borneInf, borneSup)}, quel est l'écart-type `,
    ),
    Kx(LABEL_SIGMA),
    T(" ?"),
  ];
}

function segmentsQuestionV8(contexte: ContexteBienaymeTchebychev, n: number, nombreMinDonne: number, borneInf: number, borneSup: number): SegmentTexte[] {
  return [
    T(
      `Sur un échantillon de ${n} ${contexte.population}, sachant qu'au moins ${nombreMinDonne} de ${phraseCesPopulation(contexte)} ont ${phraseCaractereComprisEntre(contexte, borneInf, borneSup)}, quelle est la moyenne `,
    ),
    Kx(LABEL_XBAR),
    T(" ?"),
  ];
}

/** Unique source de l'énoncé (contexte + question) pour les 8 variantes — consommée telle quelle
 * par les 20 écrans (`EnonceBienaymeTchebychev.tsx`), jamais recalculée différemment d'un écran à
 * l'autre de la même variante (règle d'affichage transversale). */
export function formatEnonceSegments(exercice: ExerciceBienaymeTchebychev): SegmentTexte[] {
  switch (exercice.variante) {
    case "intervalleVersPourcent":
      return [...segmentsBaseComplete(exercice.contexte, exercice.xBar, exercice.sigma), T(" "), ...segmentsQuestionV1(exercice.contexte, exercice.borneInf, exercice.borneSup)];
    case "pourcentVersIntervalle":
      return [...segmentsBaseComplete(exercice.contexte, exercice.xBar, exercice.sigma), T(" "), ...segmentsQuestionV2(exercice.contexte, exercice.pourcentDonne)];
    case "intervalleVersNombre":
      return [
        ...segmentsBaseComplete(exercice.contexte, exercice.xBar, exercice.sigma),
        T(" "),
        ...segmentsQuestionV3(exercice.contexte, exercice.n, exercice.borneInf, exercice.borneSup),
      ];
    case "nombreVersIntervalle":
      return [...segmentsBaseComplete(exercice.contexte, exercice.xBar, exercice.sigma), T(" "), ...segmentsQuestionV4(exercice.contexte, exercice.n, exercice.nombreMinDonne)];
    case "intervalleVersSigma":
      return [
        ...segmentsBaseXBarSeul(exercice.contexte, exercice.xBar),
        T(" "),
        ...segmentsQuestionV5(exercice.contexte, exercice.pourcentDonne, exercice.borneInf, exercice.borneSup),
      ];
    case "intervalleVersXBar":
      return [
        ...segmentsBaseSigmaSeul(exercice.contexte, exercice.sigma),
        T(" "),
        ...segmentsQuestionV6(exercice.contexte, exercice.pourcentDonne, exercice.borneInf, exercice.borneSup),
      ];
    case "nombreVersSigma":
      return [
        ...segmentsBaseXBarSeul(exercice.contexte, exercice.xBar),
        T(" "),
        ...segmentsQuestionV7(exercice.contexte, exercice.n, exercice.nombreMinDonne, exercice.borneInf, exercice.borneSup),
      ];
    case "nombreVersXBar":
      return [
        ...segmentsBaseSigmaSeul(exercice.contexte, exercice.sigma),
        T(" "),
        ...segmentsQuestionV8(exercice.contexte, exercice.n, exercice.nombreMinDonne, exercice.borneInf, exercice.borneSup),
      ];
  }
}

/** Concatène les segments en une seule chaîne — utilisée par les tests (assertions de contenu),
 * jamais par le rendu réel (qui doit distinguer texte/KaTeX, voir `EnonceBienaymeTchebychev.tsx`). */
export function segmentsVersTexte(segments: SegmentTexte[]): string {
  return segments.map((s) => s.valeur).join("");
}

// ============================================================================
// Signe "=" vs "≈" (`promptgen37correctionsgroupees.md`, point 5) — voir le commentaire d'en-tête
// pour la justification complète. Chaque `xxxValeurExacte` duplique exactement la formule utilisée
// à la génération (`generateurs/bienaymeTchebychev/index.ts`), jamais importée.
// ============================================================================

const EPSILON_SIGNE = 1e-9;

function estArrondiExact(valeurExacte: number, valeurAffichee: number): boolean {
  return Math.abs(valeurExacte - valeurAffichee) < EPSILON_SIGNE;
}

export interface ValeurEtatActuel {
  valeur: number;
  exact: boolean;
}

function kValeurExacte(exercice: ExerciceBienaymeTchebychev): number {
  switch (exercice.variante) {
    case "intervalleVersPourcent":
    case "intervalleVersNombre":
      return (exercice.borneSup - exercice.xBar) / exercice.sigma;
    case "pourcentVersIntervalle":
    case "intervalleVersSigma":
    case "intervalleVersXBar":
      return Math.sqrt(100 / (100 - exercice.pourcentDonne));
    case "nombreVersIntervalle":
    case "nombreVersSigma":
    case "nombreVersXBar":
      return Math.sqrt(100 / (100 - exercice.pourcentAttendu0));
  }
}

/** État actuel de k — appelée uniquement sur des écrans APRÈS le rôle "k depuis...", où
 * `exercice.kAttendu` est déjà confirmé. */
export function kEtatActuel(exercice: ExerciceBienaymeTchebychev): ValeurEtatActuel {
  return { valeur: exercice.kAttendu, exact: estArrondiExact(kValeurExacte(exercice), exercice.kAttendu) };
}

/** État actuel de `pourcentAttendu0` (écran 0 des variantes V4/V7/V8), rappelé aux écrans suivants. */
export function pourcentAttendu0EtatActuel(exercice: { n: number; nombreMinDonne: number; pourcentAttendu0: number }): ValeurEtatActuel {
  return { valeur: exercice.pourcentAttendu0, exact: estArrondiExact((100 * exercice.nombreMinDonne) / exercice.n, exercice.pourcentAttendu0) };
}

/** État actuel de `pourcentAttendu` (V3, intermédiaire) — rappelé à l'écran "nombre minimal". */
export function pourcentAttenduEtatActuel(exercice: { kAttendu: number; pourcentAttendu: number }): ValeurEtatActuel {
  return { valeur: exercice.pourcentAttendu, exact: estArrondiExact(100 * (1 - 1 / (exercice.kAttendu * exercice.kAttendu)), exercice.pourcentAttendu) };
}

function sigmaValeurExacte(exercice: { borneSup: number; xBar: number; kAttendu: number }): number {
  return (exercice.borneSup - exercice.xBar) / exercice.kAttendu;
}

function xBarValeurExacte(exercice: { borneSup: number; sigma: number; kAttendu: number }): number {
  return exercice.borneSup - exercice.kAttendu * exercice.sigma;
}

function borneInfValeurExacte(exercice: { xBar: number; kAttendu: number; sigma: number }): number {
  return exercice.xBar - exercice.kAttendu * exercice.sigma;
}

function borneSupValeurExacte(exercice: { xBar: number; kAttendu: number; sigma: number }): number {
  return exercice.xBar + exercice.kAttendu * exercice.sigma;
}

// ============================================================================
// "État actuel" — résultats déjà validés, rappelés (jamais resaisis) sur les écrans suivants d'une
// même variante, via `EtatActuelPanel`.
// ============================================================================

export function formatEtatActuelKLatex(v: ValeurEtatActuel): string {
  return `${LABEL_K} ${v.exact ? "=" : "\\approx"} ${formatNombreLatex(v.valeur)}`;
}

export function formatEtatActuelPourcentLatex(v: ValeurEtatActuel): string {
  return `\\text{\\% minimal} ${v.exact ? "=" : "\\approx"} ${formatNombreLatex(v.valeur)}\\,\\%`;
}

/** Combine 0, 1 ou 2 résultats déjà confirmés (pourcentage écran 0, k) en un seul bloc "état actuel"
 * — `null` si aucun des deux n'est fourni (première écran de la variante), une seule ligne si un
 * seul, empilé sur 2 lignes (`\begin{gathered}`, jamais côte à côte) si les deux — même précaution
 * de débordement horizontal déjà rencontrée ailleurs dans le projet (ex. "Médiane"). */
export function formatEtatActuelCombineLatex(pourcent: ValeurEtatActuel | null, k: ValeurEtatActuel | null): string | null {
  const lignes: string[] = [];
  if (pourcent !== null) lignes.push(formatEtatActuelPourcentLatex(pourcent));
  if (k !== null) lignes.push(formatEtatActuelKLatex(k));
  if (lignes.length === 0) return null;
  if (lignes.length === 1) return lignes[0];
  return `\\begin{gathered}${lignes.join("\\\\")}\\end{gathered}`;
}

// ============================================================================
// Aides — rôle "k depuis un intervalle donné" (v1K, v3K).
// ============================================================================

export function texteAideKDepuisIntervalleNiveau1(): AideAvecFormule {
  return {
    texte: "Formule de l'intervalle garanti (non substituée) :",
    latex: `[${LABEL_XBAR}-${LABEL_K}${LABEL_SIGMA} \\,;\\, ${LABEL_XBAR}+${LABEL_K}${LABEL_SIGMA}]`,
  };
}

export function texteAideKDepuisIntervalleNiveau2(exercice: { xBar: number; sigma: number; borneSup: number }): AideAvecFormule {
  return {
    texte: "Équation en k, formule substituée (non résolue) :",
    latex: `${exercice.xBar} + ${LABEL_K}\\times ${exercice.sigma} = ${exercice.borneSup}`,
  };
}

// ============================================================================
// Aides — rôle "k depuis un pourcentage donné" (v2K, v4K, v5K, v6K, v7K, v8K).
// ============================================================================

export function texteAideKDepuisPourcentNiveau1(): AideAvecFormule {
  return {
    texte: "Formule du % minimal, non substituée — à isoler pour k :",
    latex: `1-\\dfrac{1}{${LABEL_K}^2}`,
  };
}

export function texteAideKDepuisPourcentNiveau2(pourcentAffiche: number): AideAvecFormule {
  return {
    texte: "Équation en k, formule substituée avec les données de l'exercice (non résolue) :",
    latex: `1-\\dfrac{1}{${LABEL_K}^2} = \\dfrac{${formatNombreLatex(pourcentAffiche)}}{100}`,
  };
}

// ============================================================================
// Aides — rôle "pourcentage minimal, écran final ou intermédiaire" (v1Pourcent, v3Pourcent).
// ============================================================================

export function texteAidePourcentNiveau1(): AideAvecFormule {
  return {
    texte: "Formule du % minimal (non substituée) :",
    latex: `1-\\dfrac{1}{${LABEL_K}^2}`,
  };
}

export function texteAidePourcentNiveau2(kAttendu: number): AideAvecFormule {
  return {
    texte: "Formule substituée avec le k validé à l'écran précédent (non calculée) :",
    latex: `1-\\dfrac{1}{${formatNombreLatex(kAttendu)}^2}`,
  };
}

// ============================================================================
// Aides — rôle "intervalle final" (v2Intervalle, v4Intervalle).
// ============================================================================

export function texteAideIntervalleFinalNiveau1(): AideAvecFormule {
  return {
    texte: "Formule de l'intervalle (non substituée), à partir du k déjà validé :",
    // `\begin{gathered}` (empilement vertical dans un seul bloc KaTeX) plutôt que `\quad\text{et}\quad`
    // sur une seule ligne — retour à la ligne propre sur mobile étroit (`promptblocfittertousgenerateurs.md`).
    latex: `\\begin{gathered} ${LABEL_XBAR}-${LABEL_K}${LABEL_SIGMA} \\\\ ${LABEL_XBAR}+${LABEL_K}${LABEL_SIGMA} \\end{gathered}`,
  };
}

// ============================================================================
// Aides — rôle "σ retrouvé" (v5Sigma, v7Sigma) — `promptgen37correctionsgroupees.md`, point 4 :
// Aide 1 = formule NON isolée pour σ (relation générale de l'intervalle, aucune valeur substituée) ;
// Aide 2 = équation SUBSTITUÉE avec les valeurs de l'exercice mais PAS résolue pour σ (jamais de
// division — l'élève doit encore isoler σ lui-même).
// ============================================================================

export function texteAideSigmaNiveau1(): AideAvecFormule {
  return {
    texte: "Formule de l'intervalle garanti, sans isoler σ (non substituée) :",
    latex: `\\text{borne sup} = ${LABEL_XBAR} + ${LABEL_K}${LABEL_SIGMA}`,
  };
}

export function texteAideSigmaNiveau2(exercice: { borneSup: number; xBar: number; kAttendu: number }): AideAvecFormule {
  return {
    texte: "Équation substituée avec le k validé à l'écran précédent et la borne connue (non résolue) :",
    latex: `${exercice.xBar} + ${formatNombreLatex(exercice.kAttendu)}\\times ${LABEL_SIGMA} = ${exercice.borneSup}`,
  };
}

// ============================================================================
// Aides — rôle "x̄ retrouvé" (v6XBar, v8XBar) — même principe en miroir : Aide 1 = même formule
// générale non isolée (identique à celle de σ, seule l'inconnue à retrouver diffère) ; Aide 2 =
// équation substituée, non résolue pour x̄.
// ============================================================================

export function texteAideXBarNiveau1(): AideAvecFormule {
  return {
    texte: "Formule de l'intervalle garanti, sans isoler x̄ (non substituée) :",
    latex: `\\text{borne sup} = ${LABEL_XBAR} + ${LABEL_K}${LABEL_SIGMA}`,
  };
}

export function texteAideXBarNiveau2(exercice: { borneSup: number; sigma: number; kAttendu: number }): AideAvecFormule {
  return {
    texte: "Équation substituée avec le k validé à l'écran précédent et la borne connue (non résolue) :",
    latex: `${LABEL_XBAR} + ${formatNombreLatex(exercice.kAttendu)}\\times ${exercice.sigma} = ${exercice.borneSup}`,
  };
}

// ============================================================================
// Révélation — panneau de résultat. Signe "=" vs "≈" conditionnel (point 5) pour k, % minimal
// (les deux formes), σ, x̄ et les bornes d'intervalle — jamais pour le nombre minimal d'individus
// (absent de la liste du point 5, reste un simple "X individus").
// ============================================================================

export function formatKAttenduTexte(exercice: ExerciceBienaymeTchebychev): string {
  const v = kEtatActuel(exercice);
  return `k ${v.exact ? "=" : "≈"} ${formatNombreTexte(v.valeur)}`;
}

export function formatPourcentAttenduTexte(exercice: { kAttendu: number; pourcentAttendu: number }): string {
  const v = pourcentAttenduEtatActuel(exercice);
  return `${v.exact ? "=" : "≈"} ${formatNombreTexte(v.valeur)} %`;
}

export function formatPourcentDepuisNombreAttenduTexte(exercice: { n: number; nombreMinDonne: number; pourcentAttendu0: number }): string {
  const v = pourcentAttendu0EtatActuel(exercice);
  return `${v.exact ? "=" : "≈"} ${formatNombreTexte(v.valeur)} %`;
}

export function formatIntervalleAttenduTexte(exercice: {
  xBar: number;
  kAttendu: number;
  sigma: number;
  borneInfAttendue: number;
  borneSupAttendue: number;
}): string {
  const exactInf = estArrondiExact(borneInfValeurExacte(exercice), exercice.borneInfAttendue);
  const exactSup = estArrondiExact(borneSupValeurExacte(exercice), exercice.borneSupAttendue);
  const signe = exactInf && exactSup ? "=" : "≈";
  return `${signe} [${formatNombreTexte(exercice.borneInfAttendue)} ; ${formatNombreTexte(exercice.borneSupAttendue)}]`;
}

export function formatNombreAttenduTexte(nMinAttendu: number): string {
  return `${nMinAttendu} individus`;
}

export function formatSigmaAttenduTexte(exercice: { borneSup: number; xBar: number; kAttendu: number; sigmaAttendu: number }): string {
  const exact = estArrondiExact(sigmaValeurExacte(exercice), exercice.sigmaAttendu);
  return `σ ${exact ? "=" : "≈"} ${formatNombreTexte(exercice.sigmaAttendu)}`;
}

export function formatXBarAttenduTexte(exercice: { borneSup: number; sigma: number; kAttendu: number; xBarAttendu: number }): string {
  const exact = estArrondiExact(xBarValeurExacte(exercice), exercice.xBarAttendu);
  return `x̄ ${exact ? "=" : "≈"} ${formatNombreTexte(exercice.xBarAttendu)}`;
}
