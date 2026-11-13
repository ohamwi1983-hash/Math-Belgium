import type { ExerciceDetectiveErreurs, IdDescription } from "../core/detectiveErreurs.types";
import { attenduFinal, attenduLigne, dansLaTolerance, descriptionCorrecte, indiceLigneFausse, type ValeurAttendue } from "./modeleDetectiveErreurs";

/**
 * Vérification de gen81. Écran 1 : le numéro de la ligne fausse. Écran 2 : la description de
 * l'erreur. Écran 3 : chaque champ est comparé à la valeur EXACTE (gardée en mémoire), à une unité
 * près du dernier chiffre demandé (`TOLERANCE`) — une valeur arrondie trop tôt est donc refusée.
 */

export type StatutChamp = "correct" | "faux" | "parse_error";

/** Lecture d'un nombre : virgule ou point, signe moins, unité éventuelle (°, cm, cm²) ignorée.
 * `null` si illisible. */
export function lireNombre(texte: string): number | null {
  const s = texte
    .trim()
    .replace(/\s+/g, "")
    .replace(/[−–—]/g, "-")
    .replace(/(cm²|cm2|cm|°)$/i, "")
    .replace(",", ".");
  if (!/^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(s)) return null;
  return Number(s);
}

export function verifierLigne(e: ExerciceDetectiveErreurs, indice: number): boolean {
  return indice === indiceLigneFausse(e);
}

export function verifierDescription(e: ExerciceDetectiveErreurs, choix: IdDescription): boolean {
  return choix === descriptionCorrecte(e);
}

/** Champs attendus de l'écran 3 : la ligne corrigée, puis (sauf si elle est la dernière) le
 * résultat final. */
export function champsAttendus(e: ExerciceDetectiveErreurs): ValeurAttendue[] {
  const final = attenduFinal(e);
  return final ? [attenduLigne(e), final] : [attenduLigne(e)];
}

export function diagnostiquerCorrection(e: ExerciceDetectiveErreurs, saisies: string[]): StatutChamp[] {
  return champsAttendus(e).map((attendu, i) => {
    const lu = lireNombre(saisies[i] ?? "");
    if (lu === null) return "parse_error";
    return dansLaTolerance(lu, attendu.valeur, attendu.nature) ? "correct" : "faux";
  });
}
