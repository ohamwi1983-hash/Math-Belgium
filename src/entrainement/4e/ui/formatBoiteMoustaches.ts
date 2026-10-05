/**
 * Présentation — "Boîte à moustaches" (chapitre 5, septième et dernier générateur du chapitre).
 *
 * Piège transversal, explicitement ciblé par les aides : confondre les bornes de la BOÎTE ($Q_1$/
 * $Q_3$) avec les bornes des MOUSTACHES ($x_{min}$/$x_{max}$) — écran "construction" — et confondre
 * la dispersion (largeur de la boîte, écart interquartile) avec l'étendue totale (distance entre
 * les extrémités des moustaches) — écran "comparaisonDispersions".
 *
 * **Contexte narratif** (`promptgen36modifications.md`, section 1) : `formatEnonceTexte` compose une
 * phrase d'intro persistante ("Voici la répartition..."), affichée en tête des 4 écrans possibles —
 * même gabarit que "Tableau de fréquences"/"Regroupement en classes"/"Moyenne pondérée"/"Médiane",
 * étendu d'une variante propre à "comparaison" (2 séries, TOUJOURS le même contexte).
 *
 * **Notation indicielle systématique** (`promptgen36modifications.md`, section 3) : "minimum"/
 * "maximum"/"Q1"/"Q3"/"médiane" (quand désignés symboliquement) deviennent respectivement
 * $x_{min}$/$x_{max}$/$Q_1$/$Q_3$/$Q_2$, rendus en KaTeX — jamais un tiret bas affiché
 * littéralement. Chaque consigne/aide qui mélange prose et symboles passe par `SegmentTexte`
 * (`type: "katex"`), jamais une phrase entière passée à KaTeX — même patron "prose + fragments
 * KaTeX courts" déjà établi ailleurs dans le projet (ex. "Inégalité de Bienaymé-Tchebychev").
 */
import type {
  CinqNombres,
  ExerciceBoiteMoustaches,
  ExerciceBoiteMoustachesComparaison,
  ExerciceBoiteMoustachesConstruction,
  ExerciceBoiteMoustachesLecture,
  VarianteBoiteMoustaches,
} from "../core/boiteMoustaches.types";

export type SegmentTexte = { type: "texte"; valeur: string } | { type: "katex"; valeur: string };

function T(valeur: string): SegmentTexte {
  return { type: "texte", valeur };
}

function Kx(valeur: string): SegmentTexte {
  return { type: "katex", valeur };
}

export const LABEL_X_MIN = "x_{min}";
export const LABEL_X_MAX = "x_{max}";
export const LABEL_Q1 = "Q_1";
export const LABEL_Q2 = "Q_2";
export const LABEL_Q3 = "Q_3";

export function libelleBoutonAide(niveau: number, max: number): string {
  if (niveau >= max) return "Aide utilisée";
  return niveau === 0 ? "Aide" : "Aide supplémentaire";
}

const LIBELLES_VARIANTE: Record<VarianteBoiteMoustaches, string> = {
  construction: "Construction",
  lecture: "Lecture",
  comparaison: "Comparaison",
};

export function libelleVarianteBoiteMoustaches(variante: VarianteBoiteMoustaches): string {
  return LIBELLES_VARIANTE[variante];
}

// ============================================================================
// Énoncé persistant — contexte narratif.
// ============================================================================

/** Élision de "de" devant une voyelle (ou un h muet) — plusieurs entrées de la banque de contextes
 * partagée commencent par une voyelle ("étudiants", "athlètes", "animaux d'un zoo"...), la
 * consigne "comparaison" ci-dessous ne peut donc jamais écrire "de" tel quel sans risquer "chez
 * deux groupes de arbres d'une forêt", grammaticalement incorrect. */
function articleDe(mot: string): string {
  return /^[aeiouyàâäéèêëîïôöùûüh]/i.test(mot) ? "d'" : "de ";
}

/** Même gabarit que les 4 autres générateurs du chapitre — étendu d'une variante propre à
 * "comparaison" (2 séries, TOUJOURS le même contexte, jamais deux contextes indépendants). */
export function formatEnonceTexte(exercice: ExerciceBoiteMoustaches): string {
  const { contexte } = exercice;
  if (exercice.variante === "comparaison") {
    return `Voici la répartition de ${contexte.caractereComplement} (en ${contexte.unite}) chez deux groupes ${articleDe(contexte.population)}${contexte.population} — série A et série B :`;
  }
  return `Voici la répartition de ${contexte.caractereComplement} (en ${contexte.unite}) chez les ${contexte.population} :`;
}

// ============================================================================
// Écran "construction" — 5 marqueurs à placer par glissement.
// ============================================================================

/** Répète l'unité du contexte dans la consigne elle-même (`promptcorrectionsauditgroupees.md`,
 * point 2) — cohérent avec la convention déjà appliquée sur gen33/34/37 : l'énoncé persistant
 * (`formatEnonceTexte`) la mentionne bien une première fois, mais jamais dans la consigne d'action
 * qui porte directement sur les valeurs à placer. */
export function segmentsConsigneConstruction(exercice: ExerciceBoiteMoustachesConstruction): SegmentTexte[] {
  return [
    T("Place les 5 marqueurs ("),
    Kx(LABEL_X_MIN),
    T(", "),
    Kx(LABEL_Q1),
    T(", "),
    Kx(LABEL_Q2),
    T(" — médiane, "),
    Kx(LABEL_Q3),
    T(", "),
    Kx(LABEL_X_MAX),
    T(`) pour construire la boîte à moustaches de cette série (en ${exercice.contexte.unite}).`),
  ];
}

/** Le résumé à 5 nombres DONNÉ par l'énoncé — jamais deviné : c'est ce que l'élève doit placer, pas
 * ce qu'il doit calculer. Affiché en toutes lettres avant le graphe interactif, sans quoi l'écran
 * "construction" serait insoluble (aucune autre source ne donne ces 5 valeurs — l'aide 2 ne révèle
 * jamais que le minimum et le maximum). Rendue en une seule expression KaTeX, réutilisée aussi par
 * la révélation du panneau de résultat (contexte différent, même contenu). */
export function formatCinqNombresLatex(valeurs: CinqNombres): string {
  return formatTermesCinqNombresLatex(valeurs).join(",\\ ");
}

/** Version "bloc fitter" de `formatCinqNombresLatex` (`promptblocfittertousgenerateurs.md`) — un
 * fragment KaTeX par valeur (5 au total, le cas le plus dense trouvé sur toute la plateforme pour
 * ce point) plutôt qu'une seule chaîne jointe par des virgules, pour un retour à la ligne propre
 * entre valeurs sur mobile étroit. */
export function formatTermesCinqNombresLatex(valeurs: CinqNombres): string[] {
  return [
    `${LABEL_X_MIN}=${valeurs.min}`,
    `${LABEL_Q1}=${valeurs.q1}`,
    `${LABEL_Q2}=${valeurs.mediane}`,
    `${LABEL_Q3}=${valeurs.q3}`,
    `${LABEL_X_MAX}=${valeurs.max}`,
  ];
}

export function segmentsAideConstructionNiveau1(): SegmentTexte[] {
  return [
    T("Rappel : les moustaches vont de "),
    Kx(LABEL_X_MIN),
    T(" à "),
    Kx(LABEL_X_MAX),
    T(" de la série ; la boîte va de "),
    Kx(LABEL_Q1),
    T(" à "),
    Kx(LABEL_Q3),
    T(" ; le trait à l'intérieur de la boîte est la médiane ("),
    Kx(LABEL_Q2),
    T(") — ne confonds jamais les bornes de la boîte avec celles des moustaches."),
  ];
}

export function segmentsAideConstructionNiveau2(exercice: ExerciceBoiteMoustachesConstruction): SegmentTexte[] {
  return [
    T("Les 2 moustaches sont déjà tracées : "),
    Kx(`${LABEL_X_MIN}=${exercice.valeurs.min}`),
    T(", "),
    Kx(`${LABEL_X_MAX}=${exercice.valeurs.max}`),
    T(". Il te reste à placer "),
    Kx(LABEL_Q1),
    T(", la médiane ("),
    Kx(LABEL_Q2),
    T(") et "),
    Kx(LABEL_Q3),
    T("."),
  ];
}

// ============================================================================
// Écran "lecture" — 5 champs libres.
// ============================================================================

/** Même correction que `segmentsConsigneConstruction` — unité répétée dans la consigne elle-même. */
export function segmentsConsigneLecture(exercice: ExerciceBoiteMoustachesLecture): SegmentTexte[] {
  return [
    T("Relève les 5 valeurs ("),
    Kx(LABEL_X_MIN),
    T(", "),
    Kx(LABEL_Q1),
    T(", "),
    Kx(LABEL_Q2),
    T(" — médiane, "),
    Kx(LABEL_Q3),
    T(", "),
    Kx(LABEL_X_MAX),
    T(`) de cette boîte à moustaches (en ${exercice.contexte.unite}).`),
  ];
}

export function segmentsAideLectureNiveau1(): SegmentTexte[] {
  return segmentsAideConstructionNiveau1();
}

export function segmentsAideLectureNiveau2(exercice: ExerciceBoiteMoustachesLecture): SegmentTexte[] {
  return [
    T("Les 2 moustaches valent : "),
    Kx(`${LABEL_X_MIN}=${exercice.valeurs.min}`),
    T(", "),
    Kx(`${LABEL_X_MAX}=${exercice.valeurs.max}`),
    T(". Il te reste à lire "),
    Kx(LABEL_Q1),
    T(", la médiane ("),
    Kx(LABEL_Q2),
    T(") et "),
    Kx(LABEL_Q3),
    T("."),
  ];
}

// ============================================================================
// Écran "comparaisonMedianes".
// ============================================================================

export function segmentsConsigneComparaisonMedianes(): SegmentTexte[] {
  return [T("Laquelle des 2 séries a la plus grande médiane ("), Kx(LABEL_Q2), T(") ?")];
}

export function segmentsAideComparaisonMediane(): SegmentTexte[] {
  return [
    T("Rappel : la médiane ("),
    Kx(LABEL_Q2),
    T(") est le trait vertical À L'INTÉRIEUR de chaque boîte — compare la position de ce trait, pas les extrémités des moustaches."),
  ];
}

// ============================================================================
// Écran "comparaisonDispersions".
// ============================================================================

export function segmentsConsigneComparaisonDispersions(): SegmentTexte[] {
  return [T("Laquelle des 2 séries est la plus dispersée (le plus grand écart interquartile, "), Kx(`${LABEL_Q3}-${LABEL_Q1}`), T(") ?")];
}

export function segmentsAideComparaisonDispersion(): SegmentTexte[] {
  return [
    T("Rappel : la dispersion se lit par la LARGEUR DE LA BOÎTE (écart interquartile = "),
    Kx(`${LABEL_Q3}-${LABEL_Q1}`),
    T("), jamais par la distance entre les extrémités des moustaches (l'étendue = "),
    Kx(`${LABEL_X_MAX}-${LABEL_X_MIN}`),
    T(") — une série aux moustaches longues peut avoir une boîte étroite."),
  ];
}

// ============================================================================
// Révélation — panneau de résultat.
// ============================================================================

export function segmentsComparaisonMedianesAttendue(exercice: ExerciceBoiteMoustachesComparaison): SegmentTexte[] {
  return [T(`La série ${exercice.medianePlusGrande} a la plus grande médiane (`), Kx(LABEL_Q2), T(").")];
}

export function segmentsComparaisonDispersionsAttendue(exercice: ExerciceBoiteMoustachesComparaison): SegmentTexte[] {
  return [T(`La série ${exercice.ecartInterquartilePlusGrand} a le plus grand écart interquartile (`), Kx(`${LABEL_Q3}-${LABEL_Q1}`), T(").")];
}
