/**
 * Présentation — "Tableau de fréquences". Toutes les aides sont EN TEXTE SEUL (spec, "Aides (texte
 * seul)" répété aux 3 écrans) — jamais de fragment KaTeX pour ce générateur, contrairement à la
 * plupart des autres générateurs du projet.
 *
 * **Contexte narratif** (`promptgen303132contexte.md`) : `formatEnonceTexte` compose une phrase
 * d'intro persistante ("Voici la répartition de..."), affichée en tête des 4 écrans (règle
 * transversale déjà établie ailleurs) — jamais recalculée différemment d'un écran à l'autre. Seule
 * la colonne "Valeur" (écran 1) est réellement exprimée dans l'unité du contexte — les autres
 * colonnes (effectif, fréquence, effectif/fréquence cumulés) sont des comptages/pourcentages, donc
 * `consigneIdentification` est la seule consigne à mentionner explicitement l'unité.
 */
import type { ExerciceTableauFrequences } from "../core/tableauFrequences.types";

/** Phrase d'intro, persistante sur les 4 écrans — même template que "Inégalité de
 * Bienaymé-Tchebychev" pour la construction `de {caractereComplement}` (`caractereComplement`
 * jamais précédé d'un article, déjà accepté tel quel dans ce module partagé), et `chez les
 * {population}` pour éviter toute élision devant un nom commençant par une voyelle. */
export function formatEnonceTexte(exercice: ExerciceTableauFrequences): string {
  const { contexte } = exercice;
  return `Voici la répartition de ${contexte.caractereComplement} (en ${contexte.unite}) chez les ${contexte.population} :`;
}

export const PLACEHOLDER_VALEUR = "ex : 5";
export const PLACEHOLDER_EFFECTIF = "ex : 3";
export const PLACEHOLDER_FREQUENCE = "ex : 30";
export const PLACEHOLDER_CUMULE = "ex : 6";
export const PLACEHOLDER_FREQUENCE_CUMULEE = "ex : 65";

/**
 * Symboles LaTeX des en-têtes de colonne, réutilisés tels quels sur les 4 écrans
 * (`promptameliorationsgenerateur30.md`, points 2-3-4-5) — chaque en-tête est composé en JSX
 * ("Valeur " + `<Katex expression={LABEL_VALEUR_XI} />`), jamais une phrase entière passée à KaTeX
 * (même principe "prose + court fragment KaTeX" que le reste du projet).
 */
export const LABEL_VALEUR_XI = "x_i";
export const LABEL_EFFECTIF_NI = "n_i";
export const LABEL_FREQUENCE_FI = "f_i";
export const LABEL_EFFECTIF_CUMULE_VI = "v_i";
export const LABEL_FREQUENCE_CUMULEE_PHI_I = "\\varphi_i";

/**
 * La valeur "exemple" utilisée par les aides des écrans 1/2 — toujours la première (la plus
 * petite) valeur distincte, un choix déterministe et dérivé, jamais un second tirage aléatoire côté
 * présentation (le tirage aléatoire vit exclusivement en Couche A, voir CLAUDE.md).
 */
export function ligneExemple(exercice: ExerciceTableauFrequences) {
  return exercice.lignes[0];
}

export function libelleBoutonAide(niveau: number, max: number): string {
  if (niveau >= max) return "Aide utilisée";
  return niveau === 0 ? "Aide" : "Aide supplémentaire";
}

// ============================================================================
// Écran 1 — identification
// ============================================================================

export function consigneIdentification(exercice: ExerciceTableauFrequences): string {
  return `À partir de la liste brute ci-dessus (en ${exercice.contexte.unite}), identifie chaque valeur distincte (dans l'ordre croissant) et son effectif (nombre d'occurrences).`;
}

export function texteAideIdentificationNiveau1(exercice: ExerciceTableauFrequences): string {
  const ligne = ligneExemple(exercice);
  return `Compte les occurrences de la valeur ${ligne.valeur} (surlignées ci-dessus dans la liste) : il y en a ${ligne.effectif}.`;
}

export function texteAideIdentificationNiveau2(exercice: ExerciceTableauFrequences): string {
  return `Il y a exactement ${exercice.lignes.length} valeurs distinctes dans cette liste — vérifie que tu n'en as pas oublié.`;
}

// ============================================================================
// Écran 2 — fréquences (%)
// ============================================================================

export const CONSIGNE_FREQUENCES = "Calcule la fréquence (%) de chaque valeur.";

export function texteAideFrequencesNiveau1(exercice: ExerciceTableauFrequences): string {
  return `Fréquence (%) = effectif / n × 100, où n est le nombre total de valeurs de la liste (ici n = ${exercice.n}).`;
}

export function texteAideFrequencesNiveau2(exercice: ExerciceTableauFrequences): string {
  const ligne = ligneExemple(exercice);
  return `Pour la valeur ${ligne.valeur} : fréquence = ${ligne.effectif}/${exercice.n} × 100 = ${ligne.frequencePourcent} %.`;
}

// ============================================================================
// Écran 3 — effectifs cumulés
// ============================================================================

export const CONSIGNE_CUMULES = "Calcule l'effectif cumulé de chaque ligne.";

export function texteAideCumulesNiveau1(exercice: ExerciceTableauFrequences): string {
  const premiere = exercice.lignes[0];
  return `Méthode : effectif cumulé d'une ligne = effectif cumulé de la ligne précédente + effectif de cette ligne. Pour la première valeur (${premiere.valeur}), il n'y a pas de ligne précédente : son effectif cumulé est simplement son propre effectif (${premiere.effectif}).`;
}

/** Révèle tous les effectifs cumulés SAUF le dernier — l'élève doit reconnaître lui-même que la
 * dernière ligne doit valoir n et la produire, jamais une contrainte donnée explicitement. */
export function cumulesReveles(exercice: ExerciceTableauFrequences): { valeur: number; effectifCumule: number }[] {
  return exercice.lignes.slice(0, -1).map((l) => ({ valeur: l.valeur, effectifCumule: l.effectifCumule }));
}

// ============================================================================
// Écran 4 — fréquences cumulées (%) (`promptameliorationsgenerateur30.md`, point 5)
// ============================================================================

export const CONSIGNE_FREQUENCES_CUMULEES = "Calcule la fréquence cumulée de chaque ligne.";

export function texteAideFrequencesCumuleesNiveau1(exercice: ExerciceTableauFrequences): string {
  const premiere = exercice.lignes[0];
  return `Méthode : fréquence cumulée d'une ligne = fréquence cumulée de la ligne précédente + fréquence de cette ligne. Pour la première valeur (${premiere.valeur}), il n'y a pas de ligne précédente : sa fréquence cumulée est simplement sa propre fréquence (${premiere.frequencePourcent} %).`;
}

/** Révèle toutes les fréquences cumulées SAUF la dernière — l'élève doit reconnaître lui-même que
 * la dernière ligne doit valoir 100 % et la produire, jamais une contrainte donnée explicitement —
 * même principe que `cumulesReveles`. */
export function frequencesCumuleesRevelees(exercice: ExerciceTableauFrequences): { valeur: number; frequenceCumulee: number }[] {
  return exercice.lignes.slice(0, -1).map((l) => ({ valeur: l.valeur, frequenceCumulee: l.frequenceCumulee }));
}

// ============================================================================
// Révélation (panneau de résultat après échec) — toujours la table de référence complète,
// jamais la saisie de l'élève.
// ============================================================================

export function formatTableIdentificationTexte(exercice: ExerciceTableauFrequences): string {
  return exercice.lignes.map((l) => `${l.valeur} → ${l.effectif}`).join(", ");
}

export function formatTableFrequencesTexte(exercice: ExerciceTableauFrequences): string {
  return exercice.lignes.map((l) => `${l.valeur} → ${l.frequencePourcent} %`).join(", ");
}

export function formatTableCumulesTexte(exercice: ExerciceTableauFrequences): string {
  return exercice.lignes.map((l) => `${l.valeur} → ${l.effectifCumule}`).join(", ");
}

export function formatTableFrequencesCumuleesTexte(exercice: ExerciceTableauFrequences): string {
  return exercice.lignes.map((l) => `${l.valeur} → ${l.frequenceCumulee} %`).join(", ");
}
