import type { ExerciceAireB, ExerciceAireExcentriciteConique } from "../core6e/aireExcentriciteConique.types";
import type { Attente } from "./attentesCombinatoire";
import { diagnostiquerAttentes } from "./attentesCombinatoire";
import type { DefinitionSession } from "./sessionCombinatoire";
import { phasesPourExercice } from "./typesAireExcentriciteConique";
import type { PhaseAireExcentriciteConique } from "./typesAireExcentriciteConique";
import { qNum } from "./algebreLieux";
import { champNombre } from "./saisieLieux";
import { champRelationExcentricite } from "./saisieConiques";

/**
 * Attentes des écrans de `6gen60` (audit du 6e ch. 10, lots B et C) : valeurs EXACTES (une aire arrondie
 * est refusée sans tentative, avec un message qui demande la valeur exacte) ; la relation de la
 * famille B est jugée par la valeur de e qu'elle impose (toute relation équivalente en a, b, c, e
 * acceptée — « 2a²/c = k·2c », « b = c », « e² = 1/2 »…, audit G16).
 */

type E = ExerciceAireExcentriciteConique;
type P = PhaseAireExcentriciteConique;

/** Une relation juste (contrôles automatiques seulement, jamais affichée). */
export function referenceRelation(e: ExerciceAireB): string {
  const p = `(${e.parametre.n}/${e.parametre.d})`;
  if (e.sousType === "abscisseFoyerParallele") return `b=${p}*c`;
  if (e.sousType === "angleSommetNonFocal") return `b^2-c^2=${p}*a^2`;
  return `a^2=${p}*c^2`;
}

export function attentesAireExcentriciteConique(e: E, p: P): Attente[] {
  if (e.famille === "A") {
    if (p === "aRayons") return [{ verif: champNombre(qNum(e.pf)) }, { verif: champNombre(qNum(e.pfp)) }];
    if (p === "aCos") return [{ verif: champNombre(qNum(e.cos)) }];
    return [{ verif: champNombre(Math.sqrt(qNum(e.aire2))) }];
  }
  if (p === "bRelation") return [{ verif: champRelationExcentricite(Math.sqrt(qNum(e.e2)), referenceRelation(e)) }];
  return [{ verif: champNombre(Math.sqrt(qNum(e.e2))) }];
}

export const DEFINITION_6GEN60: DefinitionSession<E, P> = {
  phases: phasesPourExercice,
  diagnostiquer: (e, p, v) => diagnostiquerAttentes(attentesAireExcentriciteConique(e, p), v),
  estChoix: () => false,
};
