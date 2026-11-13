import type { Composantes, EcranConstruction, ExerciceConstruireSomme, Point } from "../core/construireSomme.types";
import { memePoint } from "./modeleConstruireSomme";

/**
 * Vérification de gen83. Une construction est jugée sur le nœud EXACT atteint par l'extrémité
 * (l'origine est imposée). La lecture compare chaque composante saisie ; une saisie illisible
 * (`parse_error`) ne consomme jamais de tentative (c'est l'appli qui ne l'envoie pas au moteur).
 */

export function verifierConstruction(ec: EcranConstruction, extremite: Point): boolean {
  return memePoint(ec.attendu, extremite);
}

export type StatutComposante = "correct" | "signe" | "faux" | "parse_error";

/** Lecture d'une composante : entier ou décimal (virgule ou point), signe « − » accepté. */
export function lireComposante(texte: string): number | null {
  const s = texte.trim().replace(/\s+/g, "").replace(/[−–—]/g, "-").replace(",", ".");
  if (!/^[+-]?\d+(\.\d+)?$/.test(s)) return null;
  return Number(s);
}

export interface SaisieComposantes {
  x: string;
  y: string;
}

export function diagnostiquerComposante(texte: string, attendu: number): StatutComposante {
  const lu = lireComposante(texte);
  if (lu === null) return "parse_error";
  if (Math.abs(lu - attendu) < 1e-9) return "correct";
  if (Math.abs(lu + attendu) < 1e-9) return "signe";
  return "faux";
}

/** Statuts des quatre composantes (u puis v), dans l'ordre x_u, y_u, x_v, y_v. */
export function diagnostiquerLecture(e: ExerciceConstruireSomme, saisies: SaisieComposantes[]): StatutComposante[] {
  const attendus: Composantes[] = [e.u, e.v];
  return attendus.flatMap((c, i) => [diagnostiquerComposante(saisies[i]?.x ?? "", c.x), diagnostiquerComposante(saisies[i]?.y ?? "", c.y)]);
}
