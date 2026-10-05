/**
 * Présentation — "Regroupement en classes et histogramme". Aides des écrans "classement"/"trace" en
 * texte seul (spec, "Aides (texte seul)") — jamais de fragment KaTeX pour ce générateur, même
 * convention que "Tableau de fréquences".
 *
 * **Contexte narratif** (`promptgen303132contexte.md`) : `formatEnonceTexte` compose une phrase
 * d'intro persistante ("Voici les tailles..."), affichée en tête des 3 écrans — même template que
 * "Tableau de fréquences" (`ui/formatTableauFrequences.ts::formatEnonceTexte`, dupliqué ici, pas
 * importé — contrats indépendants entre générateurs du même chapitre).
 */
import type { StatutVerification } from "../moteur/statutVerification";
import type { ExerciceHistogramme } from "../core/histogramme.types";
import { valeurHauteur } from "./histogrammeGraph";

/** Phrase d'intro, persistante sur les 3 écrans — même template que "Tableau de fréquences". */
export function formatEnonceTexte(exercice: ExerciceHistogramme): string {
  const { contexte } = exercice;
  return `Voici la répartition de ${contexte.caractereComplement} (en ${contexte.unite}) chez les ${contexte.population} :`;
}

export function consigneClassement(exercice: ExerciceHistogramme): string {
  return `À partir de la liste de données brutes ci-dessus (en ${exercice.contexte.unite}), détermine l'effectif de chaque classe (bornes déjà données).`;
}
export const CONSIGNE_FREQUENCES = "Calcule la fréquence (%) de chaque classe.";
export const CONSIGNE_TRACE = "Fais glisser chaque barre verticalement pour lui donner la bonne hauteur.";

export const PLACEHOLDER_EFFECTIF_CLASSE = "ex : 4";
export const PLACEHOLDER_FREQUENCE_CLASSE = "ex : 20";

/** Notation indicielle KaTeX des en-têtes de colonne, sur les 3 écrans qui affichent un tableau
 * (`promptgen31corrections.md`, point 2, puis `promptinvestigationpoint3latexmobile.md` qui étend
 * la conversion aux 2 écrans restants — mesure empirique à 375px confirmant l'absence de tout
 * risque de débordement, ces en-têtes étant de simples symboles courts, jamais une fraction
 * substituée) : forme COMPLÈTE ("Classe $x_i$"/"Effectif $n_i$") à leur toute première apparition,
 * sur l'écran "Classement" — puis forme ABRÉGÉE (symbole seul, sans le mot devant) sur les écrans
 * "Fréquences"/"Trace" qui les répètent, même convention transversale que "Tableau de fréquences"/
 * "Moyenne pondérée". `LABEL_FREQUENCE_FI` suit le même principe : forme complète à sa première
 * apparition (écran "Fréquences", variante "frequence" uniquement), abrégée ensuite sur "Trace". */
export const LABEL_CLASSE_XI = "x_i";
export const LABEL_EFFECTIF_NI = "n_i";
export const LABEL_FREQUENCE_FI = "f_i";

export function libelleBoutonAide(niveau: number, max: number): string {
  if (niveau >= max) return "Aide utilisée";
  return niveau === 0 ? "Aide" : "Aide supplémentaire";
}

export function estDerniereClasse(exercice: ExerciceHistogramme, index: number): boolean {
  return index === exercice.classes.length - 1;
}

/** Notation francophone à crochets inversés déjà établie ailleurs dans le projet — `[` fermé/inclus
 * à gauche, `[` ouvert/exclu à droite (`]` fermé/inclus, réservé à la toute dernière classe). */
export function formatClasseTexte(exercice: ExerciceHistogramme, index: number): string {
  const classe = exercice.classes[index];
  return `[${classe.borneInf} ; ${classe.borneSup}${estDerniereClasse(exercice, index) ? "]" : "["}`;
}

/**
 * Première classe dont la correction (`estCorrect`) est fausse, puis le premier index DIFFÉRENT
 * d'elle — jamais la classe fautive elle-même (spec : "une classe autre que celle où l'élève s'est
 * trompé si c'est détectable"). Retourne `null` si rien n'est détectable (aucune tentative encore,
 * ou toutes les classes déjà correctes) ou si aucune autre classe n'existe (jamais en pratique, au
 * moins 4 classes par construction).
 */
export function indexClasseARevelerAide(estCorrect: boolean[] | null): number | null {
  if (estCorrect === null) return null;
  const indexFautif = estCorrect.findIndex((correct) => !correct);
  if (indexFautif === -1) return null;
  const indexAutre = estCorrect.findIndex((_, i) => i !== indexFautif);
  return indexAutre === -1 ? null : indexAutre;
}

// ============================================================================
// Écran 1 — classement
// ============================================================================

/** Aide 1 : montre, pour LA donnée proche d'une frontière (`exercice.donneeFrontiere`), comment
 * appliquer la convention d'inclusion/exclusion — modélise le cas piège sans le résoudre pour les
 * autres frontières de l'exercice. */
export function texteAideClassementNiveau1(exercice: ExerciceHistogramme): string {
  const { valeur, classeIndex } = exercice.donneeFrontiere;
  const classe = exercice.classes[classeIndex];
  const classeSuivante = exercice.classes[classeIndex + 1];
  return (
    `La donnée ${valeur} est proche de la frontière ${classe.borneSup} : la borne supérieure d'une classe est TOUJOURS ` +
    `exclue de celle-ci (sauf pour la toute dernière classe de la série) — donc ${valeur} < ${classe.borneSup} appartient ` +
    `bien à la classe ${formatClasseTexte(exercice, classeIndex)}, jamais à la classe suivante ${formatClasseTexte(exercice, classeIndex + 1)}, ` +
    `qui commence tout juste à ${classeSuivante.borneInf}.`
  );
}

/** Aide 2 : révèle l'effectif attendu d'une classe AUTRE que celle où l'élève s'est trompé, si
 * détectable depuis `evaluation` (le statut courant de chaque champ, calculé par le composant
 * d'écran depuis la saisie en cours) ; sinon, révèle simplement n comme rappel de contrôle. */
export function texteAideClassementNiveau2(exercice: ExerciceHistogramme, evaluation: StatutVerification[] | null): string {
  const estCorrect = evaluation ? evaluation.map((s) => s === "correct") : null;
  const index = indexClasseARevelerAide(estCorrect);
  if (index === null) {
    return `Rappel de contrôle : la somme de tous les effectifs doit être égale à n = ${exercice.n}.`;
  }
  const classe = exercice.classes[index];
  return `Pour vérifier ta méthode : la classe ${formatClasseTexte(exercice, index)} a un effectif de ${classe.effectif}.`;
}

// ============================================================================
// Écran 2 — fréquences (%) (variante "frequence" uniquement)
// ============================================================================

export function texteAideFrequencesNiveau1(exercice: ExerciceHistogramme): string {
  return `Fréquence (%) = effectif / n × 100, où n est la taille totale de l'échantillon (ici n = ${exercice.n}).`;
}

export function texteAideFrequencesNiveau2(exercice: ExerciceHistogramme): string {
  const classe = exercice.classes[0];
  return `Pour la classe ${formatClasseTexte(exercice, 0)} : fréquence = ${classe.effectif}/${exercice.n} × 100 = ${classe.frequencePourcent} %.`;
}

// ============================================================================
// Écran final — tracer l'histogramme
// ============================================================================

/** Aide 1 (unique) : rappelle la hauteur correcte d'UNE classe à titre d'exemple, choisie
 * différemment de celle où l'élève s'est le plus trompé si détectable (depuis `evaluationTrace`,
 * le résultat courant de `evaluerTrace`) — les autres classes restent à positionner par l'élève. */
export function texteAideTraceNiveau1(exercice: ExerciceHistogramme, evaluationTrace: boolean[] | null): string {
  const index = indexClasseARevelerAide(evaluationTrace) ?? 0;
  const valeur = valeurHauteur(exercice, index);
  const unite = exercice.variante === "frequence" ? " %" : "";
  return `Pour la classe ${formatClasseTexte(exercice, index)}, la hauteur attendue est ${valeur}${unite}.`;
}

// ============================================================================
// Révélation (panneau de résultat après échec) — toujours la table de référence complète, jamais
// la saisie de l'élève.
// ============================================================================

export function formatClassementAttenduTexte(exercice: ExerciceHistogramme): string {
  return exercice.classes.map((c, i) => `${formatClasseTexte(exercice, i)} → ${c.effectif}`).join(", ");
}

export function formatFrequencesAttenduesTexte(exercice: ExerciceHistogramme): string {
  return exercice.classes.map((c, i) => `${formatClasseTexte(exercice, i)} → ${c.frequencePourcent} %`).join(", ");
}

export function formatTraceAttendueTexte(exercice: ExerciceHistogramme): string {
  const unite = exercice.variante === "frequence" ? " %" : "";
  return exercice.classes.map((_, i) => `${formatClasseTexte(exercice, i)} → ${valeurHauteur(exercice, i)}${unite}`).join(", ");
}
