import type { ExerciceAnglesAssocies } from "../core/anglesAssocies.types";
import type { StatutVerification } from "./statutVerification";

const TOLERANCE_VALEUR = 0.005;

/** Champ libre numérique (valeur approchée de sin/cos/tan), SEUL champ de réponse de ce générateur
 * depuis la refonte à écran unique (`promptgen17refontecomplete.md`) — inchangé par rapport à la
 * version précédente (dernière étape "Valeur finale"). Statut à 3 valeurs (convention CLAUDE.md) :
 * `NaN`/non fini est toujours un `parse_error`, tolérance `0,005` sinon. */
export function diagnostiquerValeurFinale(exercice: ExerciceAnglesAssocies, valeur: number): StatutVerification {
  if (!Number.isFinite(valeur)) return "parse_error";
  return Math.abs(valeur - exercice.valeurCible) <= TOLERANCE_VALEUR ? "correct" : "not_equivalent";
}

export function verifierValeurFinale(exercice: ExerciceAnglesAssocies, valeur: number): boolean {
  return diagnostiquerValeurFinale(exercice, valeur) === "correct";
}

/**
 * Décide si l'aide 3 (conditionnelle, relation de complémentarité) doit exister pour cet exercice —
 * TOUJOURS déterminé à partir de champs déjà figés à la génération (`xReference`/`alpha`), jamais
 * recalculé dynamiquement (même principe que l'ancien `necessiteQuestionComplementaire`, renommé ici
 * pour refléter la nouvelle structure à paliers d'aide plutôt qu'un écran séparé). Vrai ssi le
 * symétrique en quadrant I de `theta` (`xReference`) diffère de l'angle de base (`alpha`) — jamais
 * `sousCas` directement (cas dégénéré `alpha=45`, où les deux divergeraient à tort). Toujours faux
 * pour la variante tangente (jamais de relation complémentaire pour cette variante, `xReference===alpha`
 * y est garanti par construction).
 */
export function necessiteAide3(exercice: ExerciceAnglesAssocies): boolean {
  return exercice.xReference !== exercice.alpha;
}

/** Nombre de niveaux d'aide disponibles pour cet exercice — 2 (cercle avec l'angle de la question,
 * puis l'angle symétrique du 1er quadrant) ou 3 si l'aide 3 (relation de complémentarité) a lieu. */
export function niveauAideMax(exercice: ExerciceAnglesAssocies): number {
  return necessiteAide3(exercice) ? 3 : 2;
}
