import type { StatutVerification } from "../moteur/statutVerification";

/**
 * Message affiché à l'élève après une tentative échouée sur un champ libre — distingue désormais
 * un échec de parsing (l'expression n'a pas pu être lue du tout) d'une réponse mathématiquement
 * fausse (convention CLAUDE.md, "Statut de vérification à 3 valeurs" ; AUDIT-comparaison-
 * reponses.md, addendum "statut à 3 valeurs"). Piste concrète et générique, jamais la réponse
 * attendue. `statut` est optionnel : un appelant qui ne le fournit pas (champ non concerné par un
 * risque de parse_error, ex. un champ purement numérique) garde le message générique historique,
 * comportement strictement inchangé.
 */
export function formatMessageErreur(tentativesUtilisees: number, tentativesMax: number, statut?: StatutVerification | null): string {
  if (statut === "parse_error") {
    return 'Expression non reconnue — vérifie la syntaxe de ton expression (parenthèses, "*" entre un nombre et une variable, etc.).';
  }
  return `Incorrect — tentative ${tentativesUtilisees}/${tentativesMax}, réessaie.`;
}
