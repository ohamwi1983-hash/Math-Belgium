import type { ExerciceValeurExacte } from "../core/valeurExacte.types";
import { necessiteReduction } from "./modeleValeurExacte";

/**
 * Session de gen76. Écrans, dans l'ordre : pour CHAQUE terme, [réduction (seulement si l'angle est
 * négatif ou ≥ 360°)] → quadrant et signe → angle associé et valeur exacte ; puis le calcul final.
 * Quadrant et signe : choix fermés, UNE tentative (convention du site). Les autres écrans : champs
 * libres, 3 tentatives ; une saisie illisible, une valeur décimale approchée ou un sin/cos/tan
 * recopié ne consomment jamais de tentative (c'est l'appli qui ne les envoie pas ici).
 */

export type EcranValeurExacte = { type: "reduction" | "placement" | "valeur"; terme: number } | { type: "final" };

export const TENTATIVES_CHAMPS = 3;
export const NIVEAU_AIDE_MAX = 2;

export function ecransDe(e: ExerciceValeurExacte): EcranValeurExacte[] {
  const ecrans: EcranValeurExacte[] = [];
  e.termes.forEach((t, terme) => {
    if (necessiteReduction(t)) ecrans.push({ type: "reduction", terme });
    ecrans.push({ type: "placement", terme }, { type: "valeur", terme });
  });
  ecrans.push({ type: "final" });
  return ecrans;
}

export interface EtatValeurExacte {
  exercice: ExerciceValeurExacte;
  ecrans: EcranValeurExacte[];
  ecran: number;
  tentativesUtilisees: number;
  niveauAide: number;
}

export function demarrer(exercice: ExerciceValeurExacte): EtatValeurExacte {
  return { exercice, ecrans: ecransDe(exercice), ecran: 0, tentativesUtilisees: 0, niveauAide: 0 };
}

export function ecranCourant(etat: EtatValeurExacte): EcranValeurExacte {
  return etat.ecrans[etat.ecran]!;
}

export function tentativesMaxEcran(ecran: EcranValeurExacte): number {
  return ecran.type === "placement" ? 1 : TENTATIVES_CHAMPS;
}

export function soumettre(etat: EtatValeurExacte, correct: boolean): { etat: EtatValeurExacte; clos: boolean; revele: boolean } {
  if (correct) return { etat, clos: true, revele: false };
  const tentativesUtilisees = etat.tentativesUtilisees + 1;
  const epuise = tentativesUtilisees >= tentativesMaxEcran(ecranCourant(etat));
  return { etat: { ...etat, tentativesUtilisees }, clos: epuise, revele: epuise };
}

export function activerAide(etat: EtatValeurExacte): EtatValeurExacte {
  return { ...etat, niveauAide: Math.min(NIVEAU_AIDE_MAX, etat.niveauAide + 1) };
}

export function ecranSuivant(etat: EtatValeurExacte): EtatValeurExacte {
  return { ...etat, ecran: etat.ecran + 1, tentativesUtilisees: 0, niveauAide: 0 };
}
