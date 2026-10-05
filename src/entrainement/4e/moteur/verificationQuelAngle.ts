/**
 * Couche B — vérification de "Quel angle ?" (chapitre 3, générateur en position 18). Une seule
 * note (l'ensemble-solution), interface "add-as-needed" (`ReponseQuelAngle`, contrat de
 * `core/quelAngle.types.ts`) — comparaison en multi-ensemble, tolérance `0,5°` (même tolérance que
 * les autres comparaisons d'angles en degrés du projet, ex. `verificationAnglesAssocies.ts`), les
 * réponses étant toujours des entiers exacts par construction (jamais de valeur approchée à
 * saisir, contrairement au reste du chapitre — spec section "Interface de réponse").
 */
import type { ExerciceQuelAngle, ReponseQuelAngle } from "../core/quelAngle.types";
import type { StatutVerification } from "./statutVerification";

const TOLERANCE_DEGRES = 0.5;

/** Comparaison en multi-ensemble, ordre indifférent, à tolérance — jamais une comparaison de
 * tableaux triés stricte (une réponse correcte peut être saisie dans n'importe quel ordre). */
function memeMultiensemble(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const bRestant = [...b];
  for (const valeur of a) {
    const index = bRestant.findIndex((v) => Math.abs(v - valeur) <= TOLERANCE_DEGRES);
    if (index === -1) return false;
    bRestant.splice(index, 1);
  }
  return true;
}

/**
 * `reponse.aucune` reste structurellement acceptable (0 solution) mais n'est, en pratique, jamais
 * correcte — `exercice.solutions` a toujours au moins 1 élément (`|k|>1` n'est jamais généré, voir
 * `core/quelAngle.types.ts`). Un `parse_error` ne peut survenir QUE côté "au moins une solution" :
 * chaque valeur de `reponse.valeurs` doit être un nombre fini (le composant d'appel parse chaque
 * champ texte avant d'appeler cette fonction, même convention que le reste du projet — voir
 * `EtapeQuelAngle.tsx`).
 */
export function diagnostiquerReponseQuelAngle(exercice: ExerciceQuelAngle, reponse: ReponseQuelAngle): StatutVerification {
  if (reponse.aucune) {
    return exercice.solutions.length === 0 ? "correct" : "not_equivalent";
  }
  if (reponse.valeurs.some((v) => !Number.isFinite(v))) return "parse_error";
  return memeMultiensemble(reponse.valeurs, exercice.solutions) ? "correct" : "not_equivalent";
}

export function verifierReponseQuelAngle(exercice: ExerciceQuelAngle, reponse: ReponseQuelAngle): boolean {
  return diagnostiquerReponseQuelAngle(exercice, reponse) === "correct";
}
