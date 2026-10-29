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
 * Depuis l'audit du chapitre 5, deux cas particuliers s'y ajoutent, tirés à part
 * (`construireAvecVarianteId`) : `k = 0` (deux solutions sur un axe) et, pour sin/cos, `|k| > 1`
 * (aucune solution — `construireHorsDomaine`).
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
  return { fonction, angleReference, magnitudeHorsDomaineLatex: null, signeK, solutions };
}

/** `|k| > 1` — sin/cos uniquement (la tangente prend toutes les valeurs réelles) : aucune solution. */
export function construireHorsDomaine(fonction: "sin" | "cos", magnitudeLatex: string, signeK: 1 | -1): ExerciceQuelAngle {
  return { fonction, angleReference: null, magnitudeHorsDomaineLatex: magnitudeLatex, signeK, solutions: [] };
}

/** Valeurs de `|k|` strictement supérieures à 1, choisies proches des valeurs remarquables pour
 * piéger la confusion (√3 au lieu de √3/2, √2 au lieu de √2/2, 3/2 au lieu de 1/2). */
const MAGNITUDES_HORS_DOMAINE = ["\\sqrt{2}", "\\sqrt{3}", "\\frac{3}{2}", "2"];

/** Angle de référence donnant `k = 0` pour chaque fonction (`sin 0° = tan 0° = 0`, `cos 90° = 0`). */
const REF_K_NUL: Record<FonctionTrig, AngleRemarquable> = { sin: 0, cos: 90, tan: 0 };

/** Parts des cas particuliers (audit du chapitre 5 : « Pas de solution » n'était jamais la bonne
 * réponse, et seuls 22 exercices distincts existaient) — environ 12 % de « Pas de solution » et
 * 9 % de `k = 0` sur l'ensemble des tirages. */
const PROBA_HORS_DOMAINE_SIN_COS = 0.18;
const PROBA_K_NUL = 0.09;

export const CATALOGUE_VARIANTES: { id: FonctionTrig; label: string }[] = [
  { id: "sin", label: "sin α = k" },
  { id: "cos", label: "cos α = k" },
  { id: "tan", label: "tan α = k" },
];

export function construireAvecVarianteId(
  varianteId: FonctionTrig,
  overrides?: { angleReference?: AngleRemarquable; signeK?: 1 | -1 },
): ExerciceQuelAngle {
  const signeK = overrides?.signeK ?? (Math.random() < 0.5 ? 1 : -1);
  if (overrides?.angleReference !== undefined) return construireAvecParametres(varianteId, overrides.angleReference, signeK);

  const tirage = Math.random();
  if (varianteId !== "tan" && tirage < PROBA_HORS_DOMAINE_SIN_COS) {
    return construireHorsDomaine(varianteId, MAGNITUDES_HORS_DOMAINE[randomInt(0, MAGNITUDES_HORS_DOMAINE.length - 1)], signeK);
  }
  if (tirage > 1 - PROBA_K_NUL) return construireAvecParametres(varianteId, REF_K_NUL[varianteId], 1);

  const pool = REF_POOL[varianteId];
  return construireAvecParametres(varianteId, pool[randomInt(0, pool.length - 1)], signeK);
}

export const genererExerciceQuelAngle: GenerateurExerciceQuelAngle = () => {
  const fonctions: FonctionTrig[] = ["sin", "cos", "tan"];
  return construireAvecVarianteId(fonctions[randomInt(0, fonctions.length - 1)]);
};
