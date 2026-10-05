/**
 * Couche B — vérification pour "Triangles liés (triangulation, côté ou angle partagé)"
 * (cinquante-huitième générateur). Tolérance RELATIVE (1 % de la valeur attendue, plancher absolu
 * 0,05) — même formule que `verificationTriangle.ts::diagnostiquerCalculNumeriqueTriangle` (gen19),
 * DUPLIQUÉE ici plutôt que partagée (même principe déjà établi dans ce fichier : répliquer le
 * patron plutôt que le partager entre générateurs). Remplace l'ancienne constante ABSOLUE unique
 * `TOLERANCE_ARRONDI = 0.5` (héritée de "Applications physiques") — celle-ci mélangeait sans
 * distinction des degrés, des mètres et des m² (écran "cible", `uniteGrandeurCible`) alors que ces
 * grandeurs n'ont pas la même échelle ; une composante relative reste cohérente quelle que soit
 * l'unité, exactement comme pour gen19 (audit de traçabilité de précision, section 2).
 */
import type { ExerciceTriangleLies } from "../core/triangleLies.types";
import type { StatutVerification } from "./statutVerification";

const TOLERANCE_ABSOLUE_MIN = 0.05;
const TOLERANCE_RELATIVE = 0.01;

function diagnostiquerCalculArrondi(valeur: number, attendu: number): StatutVerification {
  if (!Number.isFinite(valeur)) return "parse_error";
  const tolerance = Math.max(TOLERANCE_ABSOLUE_MIN, Math.abs(attendu) * TOLERANCE_RELATIVE);
  return Math.abs(valeur - attendu) <= tolerance ? "correct" : "not_equivalent";
}

/** Écran "pont" — le côté transféré, toujours `trianglePont.a`. */
export function diagnostiquerPont(exercice: ExerciceTriangleLies, valeur: number): StatutVerification {
  return diagnostiquerCalculArrondi(valeur, exercice.trianglePont.a);
}

export function verifierPont(exercice: ExerciceTriangleLies, valeur: number): boolean {
  return diagnostiquerPont(exercice, valeur) === "correct";
}

/** Écran "angles" (`anglePartage` uniquement) — les 2 angles qui ferment le triangle cible :
 * l'angle utile (`triangleCible.B`, différence des 2 visées) et l'angle déduit de l'hypothèse
 * annexe (`triangleCible.C`). Les deux doivent être corrects pour valider l'écran — `parse_error`
 * prioritaire si l'un des deux champs n'est pas un nombre fini (même convention que les écrans à
 * champs multiples combinés ailleurs sur la plateforme, voir CLAUDE.md "Statut de vérification à 3
 * valeurs", point 4). */
export interface ReponseAnglesTriangleLies {
  angleUtile: number;
  angleHypothese: number;
}

export function diagnostiquerAngles(exercice: ExerciceTriangleLies, reponse: ReponseAnglesTriangleLies): StatutVerification {
  const statutUtile = diagnostiquerCalculArrondi(reponse.angleUtile, exercice.triangleCible.B);
  const statutHypothese = diagnostiquerCalculArrondi(reponse.angleHypothese, exercice.triangleCible.C);
  if (statutUtile === "parse_error" || statutHypothese === "parse_error") return "parse_error";
  return statutUtile === "correct" && statutHypothese === "correct" ? "correct" : "not_equivalent";
}

export function verifierAngles(exercice: ExerciceTriangleLies, reponse: ReponseAnglesTriangleLies): boolean {
  return diagnostiquerAngles(exercice, reponse) === "correct";
}

/** Écran "pont" (`sommetPartage` uniquement) — 3 valeurs : l'angle au sommet commun et les 2 côtés
 * qui en partent (`trianglePont.A`/`.b`/`.c`). Même motif de combinaison à 3 champs que
 * `diagnostiquerAngles` (parse_error prioritaire dès qu'un champ n'est pas fini, sinon correct
 * seulement si les 3 le sont). */
export interface ReponsePontSommetPartage {
  angle: number;
  cote1: number;
  cote2: number;
}

export function diagnostiquerPontSommetPartage(exercice: ExerciceTriangleLies, reponse: ReponsePontSommetPartage): StatutVerification {
  const statutAngle = diagnostiquerCalculArrondi(reponse.angle, exercice.trianglePont.A);
  const statutCote1 = diagnostiquerCalculArrondi(reponse.cote1, exercice.trianglePont.b);
  const statutCote2 = diagnostiquerCalculArrondi(reponse.cote2, exercice.trianglePont.c);
  if (statutAngle === "parse_error" || statutCote1 === "parse_error" || statutCote2 === "parse_error") return "parse_error";
  return statutAngle === "correct" && statutCote1 === "correct" && statutCote2 === "correct" ? "correct" : "not_equivalent";
}

export function verifierPontSommetPartage(exercice: ExerciceTriangleLies, reponse: ReponsePontSommetPartage): boolean {
  return diagnostiquerPontSommetPartage(exercice, reponse) === "correct";
}

/** Écran "soustraction" (`sommetPartage` uniquement) — les 2 côtés du triangle cible, chacun
 * obtenu en soustrayant la distance déjà parcourue au côté correspondant du pont
 * (`triangleCible.b`/`.c`, déjà précalculés à la génération — jamais recalculés ici). */
export interface ReponseSoustractionTriangleLies {
  cote1: number;
  cote2: number;
}

export function diagnostiquerSoustraction(exercice: ExerciceTriangleLies, reponse: ReponseSoustractionTriangleLies): StatutVerification {
  const statutCote1 = diagnostiquerCalculArrondi(reponse.cote1, exercice.triangleCible.b);
  const statutCote2 = diagnostiquerCalculArrondi(reponse.cote2, exercice.triangleCible.c);
  if (statutCote1 === "parse_error" || statutCote2 === "parse_error") return "parse_error";
  return statutCote1 === "correct" && statutCote2 === "correct" ? "correct" : "not_equivalent";
}

export function verifierSoustraction(exercice: ExerciceTriangleLies, reponse: ReponseSoustractionTriangleLies): boolean {
  return diagnostiquerSoustraction(exercice, reponse) === "correct";
}

/** Écran "cible" — la grandeur demandée (côté/angle/aire), toujours `exercice.valeurCibleAttendue`,
 * pré-calculée une fois pour toutes à la génération (jamais recalculée ici). */
export function diagnostiquerCible(exercice: ExerciceTriangleLies, valeur: number): StatutVerification {
  return diagnostiquerCalculArrondi(valeur, exercice.valeurCibleAttendue);
}

export function verifierCible(exercice: ExerciceTriangleLies, valeur: number): boolean {
  return diagnostiquerCible(exercice, valeur) === "correct";
}

/** Écran "interpretation" (QCM) — vérification par sélection, jamais par équivalence. */
export function verifierInterpretation(exercice: ExerciceTriangleLies, indexChoisi: number | null): boolean {
  if (indexChoisi === null) return false;
  return exercice.optionsInterpretation[indexChoisi]?.correcte === true;
}
