import type { ConfigurationResolution, ExerciceResoudreTriangle, LoiResolution } from "../core/resoudreTriangle.types";
import type { SommetTriangle } from "../core/triangle.types";
import { angleAiguDeLArcsin, angleDuControle, planResolution, plusGrandAngle, premiereLoi, valeurEnRadians, type EtapeResolution } from "./resolutionTriangle";

/**
 * Vérification de gen73. Écrans 1 et 2 : choix fermés. Écran 3 : chaque champ est comparé à la
 * valeur EXACTE de son élément (triangle calculé à partir des données), jamais à la saisie
 * précédente de l'élève. Écran 4 (contrôle) : l'angle obtenu par la somme, recalculé par Al-Kashi.
 * Tolérance de gen19 (`verificationTriangle.ts::diagnostiquerCalculNumeriqueTriangle`) : 1 % de la
 * valeur attendue, au moins 0,05. Diagnostics ciblés : l'angle aigu de l'arcsin à la place d'un
 * angle obtus, et la calculatrice en radians.
 */

export type StatutChamp = "correct" | "faux" | "aigu-arcsin" | "radians" | "parse_error";

export function tolerance(attendu: number): number {
  return Math.max(0.05, Math.abs(attendu) * 0.01);
}

export function proche(valeur: number, attendu: number, marge = 1): boolean {
  return Math.abs(valeur - attendu) <= marge * tolerance(attendu);
}

/** Lecture d'un nombre : virgule ou point décimal, signe moins typographique, « ° » final toléré. */
export function lireNombre(texte: string): number | null {
  const s = texte.trim().replace(/\s+/g, "").replace(/[−–—]/g, "-").replace(",", ".").replace(/°$/, "");
  if (!/^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(s)) return null;
  return Number(s);
}

export function planExercice(e: ExerciceResoudreTriangle): EtapeResolution[] {
  return planResolution(e.configuration, e.donnees, e.triangle);
}

/** Étape du contrôle : l'angle de la somme, recalculé par Al-Kashi. */
export function etapeControle(e: ExerciceResoudreTriangle): EtapeResolution {
  return { inconnue: angleDuControle(planExercice(e)), loi: "kashiAngle" };
}

export function diagnostiquerChamp(e: ExerciceResoudreTriangle, etape: EtapeResolution, texte: string): StatutChamp {
  const v = lireNombre(texte);
  if (v === null) return "parse_error";
  const attendu = e.triangle[etape.inconnue];
  if (proche(v, attendu)) return "correct";
  const aigu = angleAiguDeLArcsin(e.triangle, etape.inconnue);
  if (aigu !== null && proche(v, aigu)) return "aigu-arcsin";
  const radians = valeurEnRadians(e.triangle, etape);
  if (radians !== null && Math.abs(v - radians) <= Math.max(0.05, Math.abs(radians) * 0.01)) return "radians";
  return "faux";
}

/** Écran 3 : un statut par champ, dans l'ordre du plan. */
export function diagnostiquerCalculs(e: ExerciceResoudreTriangle, saisies: string[]): StatutChamp[] {
  return planExercice(e).map((etape, i) => diagnostiquerChamp(e, etape, saisies[i] ?? ""));
}

export function verifierConfiguration(e: ExerciceResoudreTriangle, choix: ConfigurationResolution): boolean {
  return choix === e.configuration;
}

/** Écran 2 : la loi ; pour 3 côtés, il faut aussi l'angle — le PLUS GRAND. */
export function verifierPremiereLoi(e: ExerciceResoudreTriangle, loi: LoiResolution, angle: SommetTriangle | null): boolean {
  if (loi !== premiereLoi(e.configuration)) return false;
  if (e.configuration === "SSS") return angle === plusGrandAngle(e.triangle);
  return true;
}
