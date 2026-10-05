import type { ExerciceAnglesAssocies, RelationAnglesAssocies } from "../core/anglesAssocies.types";

/**
 * Bloc "énoncé" fixe — reste inchangé après la refonte écran unique
 * (`promptgen17refontecomplete.md`) : toujours 2 éléments mis en évidence (`equation-box`) : les
 * valeurs approchées de l'angle de BASE (avec l'angle explicite en degrés, jamais la notation
 * symbolique `\alpha`) et l'expression demandée. Affiché une seule fois désormais (un seul écran par
 * exercice) — jamais recalculé depuis `Math.sin`/`cos`/`tan`, ce sont exactement les valeurs
 * ARRONDIES stockées sur l'exercice pour le premier bloc.
 */
export function formatBlocBaseLatex(exercice: ExerciceAnglesAssocies): string[] {
  if (exercice.variante === "sinCos") {
    return [
      `\\sin(${exercice.alpha}^\\circ) \\approx ${exercice.sinAlpha}`,
      `\\cos(${exercice.alpha}^\\circ) \\approx ${exercice.cosAlpha}`,
    ];
  }
  return [`\\tan(${exercice.alpha}^\\circ) \\approx ${exercice.tanAlpha}`];
}

/** `\sin(287^\circ)`/`\cos(287^\circ)`/`\tan(252^\circ)` selon la variante — l'expression demandée,
 * un vrai nombre affiché, jamais un `\theta` symbolique. */
export function formatBlocDemandeLatex(exercice: ExerciceAnglesAssocies): string {
  const fonction = exercice.variante === "sinCos" ? exercice.fonctionCible : "tan";
  return `\\${fonction}(${exercice.theta}^\\circ)`;
}

const LIBELLES_RELATION: Record<RelationAnglesAssocies, string> = {
  complementaireDirecte: "Complémentaire",
  supplementaire: "Supplémentaire",
  antiSupplementaire: "Anti-supplémentaire",
  oppose: "Négatif équivalent",
};

/** Utilisé uniquement pour le libellé du récapitulatif final (résumé de session). */
export function libelleRelation(relation: RelationAnglesAssocies): string {
  return LIBELLES_RELATION[relation];
}

/**
 * Texte de l'aide 2 (`promptgen17refontecomplete.md`, section "Aide 2") — désigne explicitement la
 * relation par sa nature réelle, en nommant les deux valeurs d'angle concernées (`theta`, l'angle
 * demandé, et `xReference`, son symétrique du 1er quadrant) — ex. "150° est le supplémentaire de
 * 30°." (exemple donné littéralement par le prompt).
 */
const PHRASES_AIDE2: Record<RelationAnglesAssocies, (theta: number, xReference: number) => string> = {
  complementaireDirecte: (theta, xReference) => `${theta}° est le complémentaire de ${xReference}°.`,
  supplementaire: (theta, xReference) => `${theta}° est le supplémentaire de ${xReference}°.`,
  antiSupplementaire: (theta, xReference) => `${theta}° est l'anti-supplémentaire de ${xReference}°.`,
  oppose: (theta, xReference) => `${theta}° est l'angle négatif équivalent à ${xReference}°.`,
};

export function texteAide2(exercice: ExerciceAnglesAssocies): string {
  return PHRASES_AIDE2[exercice.relation](exercice.theta, exercice.xReference);
}

/**
 * Aide 3 (conditionnelle — n'existe que si `necessiteAide3(exercice)`, voir
 * `moteur/verificationAnglesAssocies.ts`) : `xReference` est alors le complémentaire de l'angle de
 * base `alpha` donné dans l'énoncé (`90°-alpha`), jamais l'inverse. Phrase courte nommant
 * directement les deux valeurs, SANS formule générique (`promptgen17gen15correctionsvisuelles.md`,
 * A.5 — supprime l'ancienne dérivation "90° − alpha° = xReference°" ET la formule de co-fonction
 * $\sin(90°-\alpha)=\cos(\alpha)$ précédemment affichées), sur le même modèle que `texteAide2`.
 */
export function texteAide3Intro(exercice: ExerciceAnglesAssocies): string {
  return `${exercice.xReference}° est le complémentaire de ${exercice.alpha}°.`;
}

/** Exemple générique, jamais lié à la valeur réelle de l'exercice courant. */
export const PLACEHOLDER_VALEUR_FINALE = "ex : -0,743";
