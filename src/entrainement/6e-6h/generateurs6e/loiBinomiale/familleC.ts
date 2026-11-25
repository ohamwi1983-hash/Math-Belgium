import type { ExerciceLoiBinomialeC } from "../../core6e/loiBinomiale.types";
import { tirerParmi } from "./aleatoire";
import { CONTEXTES_C, virgule } from "./contextes";

/**
 * 6gen50, famille C : plus petit n tel que P(au moins un succès) > seuil. Audit : 60 couples (p, seuil)
 * au lieu de 27, n entre 3 et 230, frontière jamais à moins de 0,05 d'un entier (aucune ambiguïté
 * d'arrondi), plus aucun exemple de champ égal à la réponse.
 */

export const CANDIDATS_P_C: readonly number[] = [0.02, 0.03, 0.04, 0.05, 0.06, 0.08, 0.1, 0.12, 0.15, 0.2, 0.25, 0.3];
export const CANDIDATS_SEUIL_C: readonly number[] = [0.5, 0.75, 0.8, 0.9, 0.95, 0.99];

export function frontiereC(p: number, seuil: number): number {
  return Math.log(1 - seuil) / Math.log(1 - p);
}

export function calculerNMinimalC(p: number, seuil: number): number {
  return Math.floor(frontiereC(p, seuil)) + 1;
}

export function couplesValidesC(): { p: number; seuil: number }[] {
  const r: { p: number; seuil: number }[] = [];
  for (const p of CANDIDATS_P_C)
    for (const seuil of CANDIDATS_SEUIL_C) {
      const f = frontiereC(p, seuil);
      const n = calculerNMinimalC(p, seuil);
      if (n >= 3 && n <= 230 && Math.abs(f - Math.round(f)) > 0.05) r.push({ p, seuil });
    }
  return r;
}

export function construireFamilleC(p?: number, seuil?: number): ExerciceLoiBinomialeC {
  const couple = p !== undefined && seuil !== undefined ? { p, seuil } : tirerParmi(couplesValidesC());
  const c = tirerParmi(CONTEXTES_C);
  return { famille: "C", texte: c.texte(virgule(couple.p)), evenement: c.evenement, p: couple.p, seuil: couple.seuil, valeurN: calculerNMinimalC(couple.p, couple.seuil) };
}

export function uniteC(e: ExerciceLoiBinomialeC): string {
  return CONTEXTES_C.find((c) => c.evenement === e.evenement)?.unite ?? "épreuves";
}
