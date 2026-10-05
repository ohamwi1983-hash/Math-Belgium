/**
 * Couche B (5e) — types pour 5gen20 ("Limites, reconnaissance et calcul"). 4 familles
 * STRUCTURELLEMENT DISJOINTES (`ExerciceLimite`, core) — `ordreComplet` dispatche par
 * `exercice.famille` puis construit la séquence FIXE de cette famille (aucune branche interne
 * variable, contrairement à 5gen14 — chaque famille a toujours exactement le même nombre d'écrans).
 *
 * "reconnaissance" est TOUJOURS le premier écran, pour LES 4 familles — écran 0 IDENTIQUE (3
 * boutons + sous-boutons "Forme indéterminée") pour toutes les familles, sauf pour "limiteReelle" où
 * ce même écran porte AUSSI la réponse numérique (champ sous le bouton "Nombre réel R", même
 * geste) : c'est donc le SEUL et DERNIER écran de cette famille (`ORDRE_LIMITE_REELLE` à 1 élément).
 * Pour les 3 autres familles, la réponse de classification donnée à cet écran est notée
 * (`scoresPartiels`/récapitulatif) mais **jamais un gate-keeper** : elle n'est JAMAIS lue par
 * `ordreComplet`/le reste du moteur, qui dispatchent uniquement sur `exercice.famille` (la VRAIE
 * famille générée) — voir `soumettreReponseReconnaissance` dans `sessionLimites.ts`.
 *
 * "factoriserDenominateur" (limiteInfiniePoint, dénominateur seul, non factorisé au départ) est
 * distinct de "factoriser" (formeIndeterminee, numérateur ET dénominateur, réutilisé tel quel).
 * "limitesGaucheDroite" (limiteInfiniePoint uniquement) remplace les anciennes
 * "signeNumerateur"/"signeDenominateur" — un seul écran pose désormais les 2 questions gauche/droite
 * ensemble ; "conclureLimite" passe de 2 à 3 options (−∞/+∞/∄) mais garde son nom (le TYPE de
 * réponse attendue change, pas la place dans la séquence).
 */
import type { ExerciceLimite } from "../core5e/limites.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseLimite =
  | "reconnaissance"
  | "factoriserDenominateur"
  | "limitesGaucheDroite"
  | "conclureLimite"
  | "factoriser"
  | "simplifierEvaluer"
  | "termeDominant"
  | "simplifierLimiteRef"
  | "evaluerLimiteFinale";

const ORDRE_LIMITE_REELLE: PhaseLimite[] = ["reconnaissance"];
const ORDRE_FORME_INDETERMINEE: PhaseLimite[] = ["reconnaissance", "factoriser", "simplifierEvaluer"];
const ORDRE_INFINIE_POINT: PhaseLimite[] = [
  "reconnaissance",
  "factoriserDenominateur",
  "limitesGaucheDroite",
  "conclureLimite",
];
const ORDRE_INFINI: PhaseLimite[] = ["reconnaissance", "termeDominant", "simplifierLimiteRef", "evaluerLimiteFinale"];

export function ordreComplet(exercice: ExerciceLimite): PhaseLimite[] {
  switch (exercice.famille) {
    case "limiteReelle":
      return ORDRE_LIMITE_REELLE;
    case "formeIndeterminee":
      return ORDRE_FORME_INDETERMINEE;
    case "limiteInfiniePoint":
      return ORDRE_INFINIE_POINT;
    case "limiteInfini":
      return ORDRE_INFINI;
  }
}

export function phaseInitiale(exercice: ExerciceLimite): PhaseLimite {
  return ordreComplet(exercice)[0];
}

export function phaseApres(exercice: ExerciceLimite, phase: PhaseLimite): PhaseLimite | "termine" {
  const ordre = ordreComplet(exercice);
  const index = ordre.indexOf(phase);
  return index + 1 < ordre.length ? ordre[index + 1] : "termine";
}

export interface ResultatExerciceLimite {
  exercice: ExerciceLimite;
  scores: Partial<Record<PhaseLimite, number>>;
}

export interface EtatSessionLimite {
  reglages: ReglagesSession5e;
  generateur: () => ExerciceLimite;
  exerciceCourant: ExerciceLimite;
  phase: PhaseLimite;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseLimite, number>>;
  indexExercice: number;
  resultats: ResultatExerciceLimite[];
  terminee: boolean;
  /** Capture POST-soumission de `etapeCourante.revelee` de la dernière phase close — même motif A.1
   * que `EtatSessionSuiteArithmetique.derniereEtapeRevelee` (5gen14). */
  derniereEtapeRevelee: boolean;
}
