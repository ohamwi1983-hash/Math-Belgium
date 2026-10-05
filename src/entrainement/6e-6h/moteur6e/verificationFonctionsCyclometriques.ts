import type { ExerciceFonctionsCyclometriques } from "../core6e/fonctionsCyclometriques.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { evaluerValeurCyclometrique } from "./expressionCyclometrique";

/**
 * Couche B (6e) — vérification pour `6gen2` (REFONTE TOTALE). Le contrat unifié
 * `existe`/`valeurLatex`/`valeurNumerique` (identique sur les 3 variantes, voir
 * `core6e/fonctionsCyclometriques.types.ts`) permet UNE SEULE fonction de vérification, jamais 3
 * comme dans l'ancienne version de ce générateur (une par variante/écran).
 */
const TOLERANCE = 0.001;

/** "N'existe pas" est une réponse correcte À PART ENTIÈRE quand `exercice.existe===false`, jamais
 * une variante de "faux" (même principe que 5gen4 / l'ancien écran "appliquerArc" de ce même
 * générateur). */
export interface ReponseFonctionsCyclometriques {
  existe: boolean;
  /** ignoré si `existe===false`. */
  texte: string | null;
}

export function verifierReponseFonctionsCyclometriques(exercice: ExerciceFonctionsCyclometriques, reponse: ReponseFonctionsCyclometriques): boolean {
  if (reponse.existe !== exercice.existe) return false;
  if (!exercice.existe) return true;
  if (reponse.texte === null) return false;
  const v = evaluerValeurCyclometrique(reponse.texte);
  return v !== null && Math.abs(v - (exercice.valeurNumerique as number)) <= TOLERANCE;
}

/** Statut à 3 valeurs (convention CLAUDE.md) sur le SEUL champ de saisie libre de l'écran (le champ
 * "valeur", actif seulement quand l'élève a choisi "Existe") — jamais sur le choix Existe/N'existe
 * pas lui-même (binaire, pas une expression à parser). `null` tant que `existe===false` côté
 * exercice N'a PAS de sens ici : cette fonction n'est appelée par l'UI que quand la case "Existe" a
 * ELLE-MÊME été cochée par l'élève, jamais autrement. */
export function diagnostiquerValeurFonctionsCyclometriques(exercice: ExerciceFonctionsCyclometriques, texte: string): StatutVerification {
  const v = evaluerValeurCyclometrique(texte);
  if (v === null) return "parse_error";
  if (!exercice.existe) return "not_equivalent"; // l'élève a choisi "Existe" alors que ce n'est pas le cas — jamais "correct"
  return Math.abs(v - (exercice.valeurNumerique as number)) <= TOLERANCE ? "correct" : "not_equivalent";
}
