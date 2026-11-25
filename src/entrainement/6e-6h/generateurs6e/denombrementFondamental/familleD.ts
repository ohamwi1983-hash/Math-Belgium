import { factorielle } from "../combinatoire";
import type { ExerciceDenombrementD, GroupeDenombD } from "../../core6e/denombrementFondamental.types";
import { melanger, tirerEntier, tirerParmi } from "./aleatoire";

/**
 * Famille D de `6gen43` — blocs : des éléments qui doivent rester ensemble forment une seule unité ;
 * on range les unités, puis l'intérieur de chaque bloc (un seul ordre s'il est imposé, k! s'il est
 * libre).
 */

const MATIERES = ["mathématiques", "histoire", "sciences", "littérature", "géographie"];
/** Mots aux lettres toutes différentes. */
export const MOTS_LETTRES_DISTINCTES = ["CAHIER", "CRAYON", "BRIQUE", "MOULIN", "PLANCHE", "MONTAGE", "FABRIQUE", "JOURNAL", "CITRON", "LUNDI", "PRIME", "FLEUR", "TIGRE", "JOUET"];

export function construireGrouper(): ExerciceDenombrementD {
  const g = tirerParmi([3, 4] as const);
  const groupes: GroupeDenombD[] = melanger(MATIERES)
    .slice(0, g)
    .map((nom) => ({ nom, taille: tirerEntier(2, 4) }));
  const arrangementsBlocs = factorielle(g);
  const internesParGroupe = groupes.map((grp) => factorielle(grp.taille));
  const resultatFinal = arrangementsBlocs * internesParGroupe.reduce((a, b) => a * b, 1);
  return { famille: "D", sousType: "grouper", groupes, nombreUnites: g, arrangementsBlocs, internesParGroupe, resultatFinal };
}

function construireConsecutives(sousType: "consecutivesOrdreFixe" | "consecutivesOrdreLibre"): ExerciceDenombrementD {
  const mot = tirerParmi(MOTS_LETTRES_DISTINCTES.filter((m) => m.length >= 6));
  const k = tirerParmi([2, 3] as const);
  const bloc = melanger(mot.split("")).slice(0, k);
  const nombreUnites = mot.length - k + 1;
  const arrangementsBlocs = factorielle(nombreUnites);
  const interne = sousType === "consecutivesOrdreFixe" ? 1 : factorielle(k);
  return { famille: "D", sousType, mot, lettresConsecutives: bloc.join(""), nombreUnites, arrangementsBlocs, internesParGroupe: [interne], resultatFinal: arrangementsBlocs * interne };
}

export function construireConsecutivesOrdreFixe(): ExerciceDenombrementD {
  return construireConsecutives("consecutivesOrdreFixe");
}

export function construireConsecutivesOrdreLibre(): ExerciceDenombrementD {
  return construireConsecutives("consecutivesOrdreLibre");
}
