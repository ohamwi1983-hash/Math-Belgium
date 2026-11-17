import type { ExerciceDetectiveEspace } from "../core/detectiveEspace.types";

/**
 * Session de gen107 (« Détective d'erreurs : géométrie dans l'espace ») : 3 écrans (ligne fausse,
 * erreur commise, correction), tous des choix fermés : UNE tentative chacun (convention du site),
 * la bonne réponse est montrée après un échec. Deux aides par écran, sans pénalité affichée.
 */

export const NIVEAU_AIDE_MAX = 2;

export interface EtatDetectiveEspace {
  exercice: ExerciceDetectiveEspace;
  ecran: number;
  niveauAide: number;
}

export function demarrer(exercice: ExerciceDetectiveEspace): EtatDetectiveEspace {
  return { exercice, ecran: 0, niveauAide: 0 };
}

export function activerAide(etat: EtatDetectiveEspace): EtatDetectiveEspace {
  return { ...etat, niveauAide: Math.min(NIVEAU_AIDE_MAX, etat.niveauAide + 1) };
}

export function ecranSuivant(etat: EtatDetectiveEspace): EtatDetectiveEspace {
  return { ...etat, ecran: etat.ecran + 1, niveauAide: 0 };
}

/** Choix fermé : correct ou non, l'écran se clôt ; une erreur révèle la bonne réponse. */
export function verifierChoix(e: ExerciceDetectiveEspace, ecran: number, choix: number): boolean {
  if (ecran === 0) return choix === e.ligneFausse;
  if (ecran === 1) return e.descriptions[choix]?.correcte === true;
  return e.corrections[choix]?.correcte === true;
}
