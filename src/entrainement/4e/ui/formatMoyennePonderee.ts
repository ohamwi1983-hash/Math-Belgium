/**
 * Présentation — "Moyenne pondérée" (chapitre 5, troisième générateur) — voir
 * `promptgen32creation.md`, puis `promptgen32modifications.md` (format crochets des classes, aides
 * "centres" en 2 lignes LaTeX + surbrillance de la ligne exemple, tableau "sommes" avec une colonne
 * produit par ligne + une ligne de totaux intégrée, wording "moyenne $\bar{x}$" à l'écran "quotient",
 * retrait de l'écran "conceptuel").
 *
 * **En-têtes indiciels KaTeX** (convention transversale, "entier la première apparition, symbole
 * seul ensuite") : `LABEL_VALEUR_XI`/`LABEL_EFFECTIF_NI` désignent la même quantité "xᵢ" pour les
 * 2 variantes — les valeurs déjà données (variante "discrete") ou les centres de classe
 * (variante "classes", une fois confirmés à l'écran "centres") — cohérent avec la formule
 * universelle Σ(xᵢ·nᵢ)/Σnᵢ répétée telle quelle dans les deux cas.
 *
 * **Format des classes — crochets inversés francophones** (`estDerniereClasse`/`formatClasseTexte`,
 * même convention que "Regroupement en classes et histogramme"/"Médiane"/"Mode et classe modale" —
 * bornes fermée-ouverte sauf la dernière classe, fermée des deux côtés).
 *
 * **Contexte narratif** (`promptgen303132contexte.md`) : `formatEnonceTexte` compose une phrase
 * d'intro persistante ("Voici la répartition..."), affichée en tête des écrans "centres"/"sommes"/
 * "quotient" — même template que "Tableau de fréquences"/"Regroupement en classes et histogramme"
 * (dupliqué ici, pas importé — contrats indépendants entre générateurs du même chapitre).
 *
 * **Notation KaTeX des aides/révélation de l'écran "sommes"** (`promptinvestigationpoint3latexmobile.md`) :
 * `texteAideSommesNiveau1`/`Niveau2`/`formatSommesAttenduesTexte` retournent désormais des
 * `SegmentTexte[]` (Σ(xᵢ·nᵢ)/Σnᵢ en KaTeX plutôt qu'en Unicode souscrit brut) — mesuré empiriquement
 * à 375px sans aucun débordement (simples symboles courts insérés dans une phrase qui enveloppe
 * naturellement, jamais une fraction substituée comme `texteAideCentresNiveau1`, restée en texte
 * simple pour cette raison précise).
 */
import type { ExerciceMoyennePonderee, ExerciceMoyennePondereeClasses } from "../core/moyennePonderee.types";

/** Phrase d'intro, persistante sur les écrans de ce générateur. */
export function formatEnonceTexte(exercice: ExerciceMoyennePonderee): string {
  const { contexte } = exercice;
  return `Voici la répartition de ${contexte.caractereComplement} (en ${contexte.unite}) chez les ${contexte.population} :`;
}

export const LABEL_VALEUR_XI = "x_i";
export const LABEL_EFFECTIF_NI = "n_i";
export const LABEL_PRODUIT_XN = "x_i \\cdot n_i";
export const LABEL_SOMME_XN = "\\Sigma(x_i \\cdot n_i)";
export const LABEL_SOMME_N = "\\Sigma n_i";
export const LABEL_MOYENNE_BARRE = "\\bar{x}";

export const PLACEHOLDER_CENTRE = "ex : 7,5";
export const PLACEHOLDER_PRODUIT = "ex : 10";
export const PLACEHOLDER_SOMME_XN = "ex : 132";
export const PLACEHOLDER_SOMME_N = "ex : 20";
export const PLACEHOLDER_QUOTIENT = "ex : 6,6";

/** Index de la ligne "exemple" utilisée par les Aides 2 des écrans "centres"/"sommes" — toujours la
 * première ligne du tableau (voir `classeExemple`/`ligneExempleSommes`), jamais un second tirage
 * côté présentation. Exportée pour piloter la surbrillance de cette même ligne dans le tableau dès
 * l'activation de l'aide correspondante (`promptgen32modifications.md`, points 2 et 3). */
export const INDEX_LIGNE_EXEMPLE = 0;

/** Une aide composée de deux lignes — une phrase de rappel en texte brut, suivie d'un fragment
 * LaTeX (formule, ou formule substituée) rendu par-dessous en bloc — jamais un unique bloc `\text`
 * monolithique (même précaution que le reste du projet contre le débordement horizontal mobile). */
export interface AideDeuxLignes {
  texte: string;
  latex: string;
}

/** Consigne composée en 3 morceaux — texte brut avant / fragment LaTeX pur / texte brut après —
 * pour être assemblée directement en JSX (`{avant}<Katex expression={latex}/>{apres}`), jamais
 * passée entière à KaTeX (même patron que `consignePointVectoriel`, CLAUDE.md). */
export interface ConsigneSegmentee {
  avant: string;
  latex: string;
  apres: string;
}

/** Généralisation de `ConsigneSegmentee` à un nombre arbitraire de fragments (nécessaire dès qu'une
 * phrase mêle plusieurs symboles KaTeX distincts, ex. Σ(xᵢ·nᵢ) ET Σnᵢ dans la même aide) — même
 * patron que `formatDispersion.ts`/`formatComparaisonSeries.ts` (`SegmentTexte` dupliqué ici, pas
 * importé, petit type pur — `promptinvestigationpoint3latexmobile.md`), rendu via le composant
 * partagé `SegmentsInline` côté présentation. */
export type SegmentTexte = { type: "texte"; valeur: string } | { type: "katex"; valeur: string };

function T(valeur: string): SegmentTexte {
  return { type: "texte", valeur };
}

function Kx(valeur: string): SegmentTexte {
  return { type: "katex", valeur };
}

/** Convertit un nombre en une représentation directement intégrable dans une chaîne LaTeX, en
 * notation décimale FRANÇAISE (virgule, `{,}` pour éviter tout espacement LaTeX parasite autour du
 * séparateur) — un entier reste affiché tel quel. */
function formatNombreLatex(valeur: number): string {
  return String(valeur).replace(".", "{,}");
}

// ============================================================================
// Format des classes — crochets inversés francophones (variante "classes" uniquement).
// ============================================================================

export function estDerniereClasse(exercice: ExerciceMoyennePondereeClasses, index: number): boolean {
  return index === exercice.classes.length - 1;
}

export function formatClasseTexte(exercice: ExerciceMoyennePondereeClasses, index: number): string {
  const classe = exercice.classes[index];
  const fermante = estDerniereClasse(exercice, index) ? "]" : "[";
  return `[${classe.borneInf} ; ${classe.borneSup}${fermante}`;
}

// ============================================================================
// Écran "centres" — variante "classes" uniquement
// ============================================================================

export function consigneCentres(exercice: ExerciceMoyennePondereeClasses): string {
  return `Calcule le centre de chaque classe (en ${exercice.contexte.unite}).`;
}

/** Classe "exemple" utilisée par l'Aide 2 — toujours la première (`INDEX_LIGNE_EXEMPLE`), un choix
 * déterministe et dérivé, jamais un second tirage aléatoire côté présentation (le tirage aléatoire
 * vit exclusivement en Couche A). */
export function classeExemple(exercice: ExerciceMoyennePondereeClasses) {
  return exercice.classes[INDEX_LIGNE_EXEMPLE];
}

/** Rappel générique de la formule du centre — TEXTE SIMPLE, jamais du LaTeX ici
 * (`promptgen32corrections2.md`, point 2 : le rendu en fraction `\dfrac` débordait du cadre sur
 * mobile ; le format texte tient toujours sur une ligne). L'Aide 2 (`texteAideCentresNiveau2`,
 * exemple numérique substitué) n'est pas concernée par ce changement et reste en LaTeX. */
export interface AideCentresNiveau1 {
  texte: string;
  formule: string;
}

export function texteAideCentresNiveau1(): AideCentresNiveau1 {
  return {
    texte: "Rappel : le centre d'une classe est la moyenne de ses bornes :",
    formule: "centre = (borne inférieure + borne supérieure) / 2",
  };
}

export function texteAideCentresNiveau2(exercice: ExerciceMoyennePondereeClasses): AideDeuxLignes {
  const classe = classeExemple(exercice);
  return {
    texte: `Pour la classe ${formatClasseTexte(exercice, INDEX_LIGNE_EXEMPLE)} :`,
    latex: `\\text{centre} = \\dfrac{${classe.borneInf}+${classe.borneSup}}{2} = ${formatNombreLatex(classe.centre)}`,
  };
}

// ============================================================================
// Écran "sommes" — communes aux 2 variantes (un produit xᵢ·nᵢ par ligne, isole une erreur
// localisée à une seule ligne ; les deux totaux Σ(xᵢ·nᵢ)/Σnᵢ intégrés à la dernière ligne du
// tableau, jamais deux champs externes séparés).
// ============================================================================

export const CONSIGNE_SOMMES = "Calcule les deux sommes intermédiaires nécessaires au calcul de la moyenne.";

/** Ligne "exemple" utilisée par l'Aide 2 — toujours la première ligne du tableau (valeur ou
 * centre de classe), un choix déterministe, jamais un second tirage côté présentation. */
export function ligneExempleSommes(exercice: ExerciceMoyennePonderee): { x: number; n: number } {
  if (exercice.variante === "discrete") {
    const ligne = exercice.lignes[INDEX_LIGNE_EXEMPLE];
    return { x: ligne.valeur, n: ligne.effectif };
  }
  const classe = exercice.classes[INDEX_LIGNE_EXEMPLE];
  return { x: classe.centre, n: classe.effectif };
}

/** Rendu KaTeX (`promptinvestigationpoint3latexmobile.md`) — de simples symboles courts insérés
 * dans une phrase qui enveloppe naturellement sur mobile, mesuré à 375px sans aucun débordement
 * (contrairement à `texteAideCentresNiveau1`, une fraction substituée, jamais concernée). */
export function texteAideSommesNiveau1(): SegmentTexte[] {
  return [
    T("Rappel : "),
    Kx(LABEL_SOMME_XN),
    T(" est la somme, pour chaque ligne, du produit de la valeur (ou du centre) par son effectif ; "),
    Kx(LABEL_SOMME_N),
    T(" est simplement la somme de tous les effectifs."),
  ];
}

export function texteAideSommesNiveau2(exercice: ExerciceMoyennePonderee): SegmentTexte[] {
  const { x, n } = ligneExempleSommes(exercice);
  return [
    T(`Pour la première ligne : ${x} × ${n} = ${x * n} — ce produit fait partie de la somme `),
    Kx(LABEL_SOMME_XN),
    T(", les autres lignes restent à calculer."),
  ];
}

// ============================================================================
// Écran "quotient" — communes aux 2 variantes, calculé depuis les sommes déjà validées (jamais
// resaisies) — toujours la phase terminale, pour les 2 variantes.
// ============================================================================

export function consigneQuotient(exercice: ExerciceMoyennePonderee): ConsigneSegmentee {
  return {
    avant: "Calcule la moyenne ",
    latex: LABEL_MOYENNE_BARRE,
    apres: ` à partir de ces deux sommes (en ${exercice.contexte.unite}).`,
  };
}

export function texteAideQuotientNiveau1(): AideDeuxLignes {
  return {
    texte: "Rappel :",
    latex: `${LABEL_MOYENNE_BARRE} = \\dfrac{${LABEL_SOMME_XN}}{${LABEL_SOMME_N}}`,
  };
}

/** État actuel — les deux sommes CONFIRMÉES (toujours la vraie valeur, jamais la saisie de
 * l'élève), affiché en rappel persistant sur l'écran "quotient" — sur 2 lignes séparées
 * (`\begin{gathered}`, jamais côte à côte, `promptgen32modifications.md` point 4). */
export function formatEtatActuelSommesLatex(exercice: ExerciceMoyennePonderee): string {
  return `\\begin{gathered} ${LABEL_SOMME_XN} = ${exercice.sommeXN} \\\\ ${LABEL_SOMME_N} = ${exercice.n} \\end{gathered}`;
}

// ============================================================================
// Révélation (panneau de résultat après échec) — toujours la vraie valeur confirmée, jamais la
// saisie de l'élève.
// ============================================================================

export function formatCentresAttendusTexte(exercice: ExerciceMoyennePondereeClasses): string {
  return exercice.classes.map((c, i) => `${formatClasseTexte(exercice, i)} → ${c.centre}`).join(", ");
}

export function formatSommesAttenduesTexte(exercice: ExerciceMoyennePonderee): SegmentTexte[] {
  return [Kx(LABEL_SOMME_XN), T(` = ${exercice.sommeXN}, `), Kx(LABEL_SOMME_N), T(` = ${exercice.n}`)];
}
