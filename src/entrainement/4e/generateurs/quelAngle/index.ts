/**
 * Couche A — "Quel angle ?" (chapitre 3, générateur en position 18). Totalement indépendant du
 * reste du projet côté construction (aucun import de `src/generateurs/`) : le contrat ne stocke
 * volontairement AUCUN champ "quadrants" — chaque quadrant se dérive à la demande de `solutions`
 * via `calculerQuadrant` (générateur 14, `quadrantCalculs.ts`), réutilisé côté Couche présentation
 * uniquement (aides 2/3), jamais dupliqué ici ni stocké redondamment sur le contrat.
 *
 * `réf` (angle de référence, `|fonction(réf)|=|k|`) est TOUJOURS choisi en premier dans un pool
 * propre à chaque fonction, jamais tiré au hasard puis classé a posteriori — même principe que le
 * reste du projet ("technique choisie avant construction"). Le pool exclut systématiquement toute
 * valeur qui donnerait `k=0` (aucun signe à déterminer, cf. `core/quelAngle.types.ts`) :
 * - `sin` : `réf ∈ {30,45,60,90}` (jamais 0, `sin(0)=0`) — `réf=90` donne `k=±1`, 1 seule solution.
 * - `cos` : `réf ∈ {0,30,45,60}` (jamais 90, `cos(90)=0`) — `réf=0` donne `k=±1`, 1 seule solution.
 * - `tan` : `réf ∈ {30,45,60}` (jamais 0 — `tan(0)=0` — ni 90, `tan(90)` indéfinie) — toujours
 *   exactement 2 solutions, jamais de collapse possible (voir `promptextensiongenerateur18costan.md`,
 *   "il y a donc toujours exactement 2 solutions distinctes, jamais 0, jamais 1").
 */
import type { AngleRemarquable } from "../../core/valeursRemarquables.types";
import type { ExerciceQuelAngle, FonctionTrig, GenerateurExerciceQuelAngle } from "../../core/quelAngle.types";
import { randomInt } from "../cercleTrigonometrique/aleatoire";

const REF_POOL: Record<FonctionTrig, AngleRemarquable[]> = {
  sin: [30, 45, 60, 90],
  cos: [0, 30, 45, 60],
  tan: [30, 45, 60],
};

function normaliserAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

/**
 * Un candidat par quadrant "naturel" de la fonction — jamais dédupliqué ici (voir
 * `construireAvecParametres`, la déduplication est un souci de présentation finale, pas de cette
 * étape de construction géométrique pure).
 */
function construireCandidats(fonction: FonctionTrig, ref: number, signeK: 1 | -1): [number, number] {
  switch (fonction) {
    case "sin":
      return signeK === 1 ? [ref, normaliserAngle(180 - ref)] : [normaliserAngle(180 + ref), normaliserAngle(360 - ref)];
    case "cos":
      return signeK === 1 ? [ref, normaliserAngle(360 - ref)] : [normaliserAngle(180 - ref), normaliserAngle(180 + ref)];
    case "tan":
      return signeK === 1 ? [ref, normaliserAngle(180 + ref)] : [normaliserAngle(180 - ref), normaliserAngle(360 - ref)];
  }
}

export function construireAvecParametres(fonction: FonctionTrig, angleReference: AngleRemarquable, signeK: 1 | -1): ExerciceQuelAngle {
  const candidats = construireCandidats(fonction, angleReference, signeK);
  const solutions = [...new Set(candidats)].sort((a, b) => a - b);
  return { fonction, angleReference, signeK, solutions };
}

export const CATALOGUE_VARIANTES: { id: FonctionTrig; label: string }[] = [
  { id: "sin", label: "sin α = k" },
  { id: "cos", label: "cos α = k" },
  { id: "tan", label: "tan α = k" },
];

export function construireAvecVarianteId(
  varianteId: FonctionTrig,
  overrides?: { angleReference?: AngleRemarquable; signeK?: 1 | -1 },
): ExerciceQuelAngle {
  const pool = REF_POOL[varianteId];
  const angleReference = overrides?.angleReference ?? pool[randomInt(0, pool.length - 1)];
  const signeK = overrides?.signeK ?? (Math.random() < 0.5 ? 1 : -1);
  return construireAvecParametres(varianteId, angleReference, signeK);
}

export const genererExerciceQuelAngle: GenerateurExerciceQuelAngle = () => {
  const fonctions: FonctionTrig[] = ["sin", "cos", "tan"];
  return construireAvecVarianteId(fonctions[randomInt(0, fonctions.length - 1)]);
};
