import type { ExerciceRotationsContexte, GrandeurRetour, SituationRotation } from "../core/rotationsContexte.types";

/**
 * Modèle de gen79 (« Le cercle dans le réel : rotations en contexte ») : toutes les grandeurs
 * dérivées du contrat, calculées en valeurs EXACTES (jamais arrondies ici — l'arrondi n'est qu'une
 * affaire d'affichage, et la vérification compare à la valeur exacte, comme la calculatrice qui
 * garde ses résultats en mémoire). Seule source de vérité de l'appli, des aides et du corrigé.
 */

const RAD = Math.PI / 180;

/** Ramène un angle (degrés) dans [0° ; 360°[, en nettoyant le bruit de virgule flottante. */
export function normaliserAngle(angle: number): number {
  const a = ((angle % 360) + 360) % 360;
  const propre = Math.round(a * 1e9) / 1e9;
  return propre >= 360 ? 0 : propre;
}

/** Nettoie le bruit flottant (0,1 + 0,2…) sans arrondir une vraie décimale. */
export function propre(v: number): number {
  const r = Math.round(v * 1e9) / 1e9;
  return r === 0 ? 0 : r;
}

export function sinDeg(angle: number): number {
  const a = normaliserAngle(angle);
  if (a === 0 || a === 180) return 0;
  if (a === 90) return 1;
  if (a === 270) return -1;
  if (a === 30 || a === 150) return 0.5;
  if (a === 210 || a === 330) return -0.5;
  return Math.sin(a * RAD);
}

export function cosDeg(angle: number): number {
  return sinDeg(angle + 90);
}

// ---------------------------------------------------------------------------------------------
// Sens direct
// ---------------------------------------------------------------------------------------------

/** Angle trigonométrique de la position atteinte : θ₀ + α (sens trigonométrique) ou θ₀ − α (horaire), réduit. */
export function thetaDirect(e: ExerciceRotationsContexte): number {
  return normaliserAngle(e.origine + e.rotation * (e.alpha ?? 0));
}

/** Angle non réduit θ₀ ± α (corrigé : on montre le calcul avant la réduction). */
export function thetaBrut(e: ExerciceRotationsContexte): number {
  return e.origine + e.rotation * (e.alpha ?? 0);
}

export function positionDirecte(e: ExerciceRotationsContexte): { x: number; y: number } {
  const t = thetaDirect(e);
  return { x: propre(e.rayon * cosDeg(t)), y: propre(e.rayon * sinDeg(t)) };
}

export function hauteurDirecte(e: ExerciceRotationsContexte): number {
  return propre(e.hauteurCentre + positionDirecte(e).y);
}

/** Durée écoulée (sens direct, grande roue) en secondes : α/360 d'un tour de `periode` minutes. */
export function dureeDirecteSecondes(e: ExerciceRotationsContexte): number {
  return propre(((e.alpha ?? 0) * (e.periode ?? 0) * 60) / 360);
}

/** Minutes écoulées depuis midi (sens direct, horloge) : 6° par minute. */
export function minutesDirectes(e: ExerciceRotationsContexte): number {
  return propre((e.alpha ?? 0) / 6);
}

// ---------------------------------------------------------------------------------------------
// Sens inverse
// ---------------------------------------------------------------------------------------------

/** k = (H − h) / r : la valeur que doit prendre sin θ. */
export function kInverse(e: ExerciceRotationsContexte): number {
  return propre(((e.hauteurCible ?? 0) - e.hauteurCentre) / e.rayon);
}

/** Solutions de sin θ = k dans [0° ; 360°[, triées (une seule si k = ±1). */
export function solutionsTheta(e: ExerciceRotationsContexte): number[] {
  const k = kInverse(e);
  if (k === 1) return [90];
  if (k === -1) return [270];
  if (k === 0.5) return [30, 150];
  if (k === -0.5) return [210, 330];
  const a = Math.asin(k) / RAD;
  return [normaliserAngle(a), normaliserAngle(180 - a)].sort((p, q) => p - q);
}

/** Angle parcouru depuis le départ pour atteindre la position θ : (θ − θ₀) ou (θ₀ − θ), réduit. */
export function alphaDepuisTheta(e: ExerciceRotationsContexte, theta: number): number {
  return normaliserAngle(e.rotation * (theta - e.origine));
}

export function grandeurRetour(situation: SituationRotation): GrandeurRetour {
  if (situation === "roue" || situation === "eolienne") return "secondes";
  if (situation === "horloge") return "minutes";
  return "angle";
}

/** Valeur du contexte qui correspond à un angle parcouru α : durée, minutes après midi ou angle. */
export function valeurRetour(e: ExerciceRotationsContexte, alpha: number): number {
  switch (e.situation) {
    case "roue":
      return propre((alpha / 360) * (e.periode ?? 0) * 60);
    case "eolienne":
      return propre((alpha / 360) * (e.periode ?? 0));
    case "horloge":
      return propre(alpha / 6);
    default:
      return propre(alpha);
  }
}

/** Pour chaque solution (dans l'ordre chronologique) : θ, α et la valeur du contexte. */
export function solutionsContexte(e: ExerciceRotationsContexte): { theta: number; alpha: number; valeur: number }[] {
  return solutionsTheta(e)
    .map((theta) => {
      const alpha = alphaDepuisTheta(e, theta);
      return { theta, alpha, valeur: valeurRetour(e, alpha) };
    })
    .sort((p, q) => p.alpha - q.alpha);
}

// ---------------------------------------------------------------------------------------------
// Repérage sur le cercle (quadrant, angle du premier quadrant) — petite copie locale de
// `generateurs/cercleTrigonometrique/quadrantCalculs.ts` : la couche moteur n'importe pas les
// générateurs.
// ---------------------------------------------------------------------------------------------

export type QuadrantRotation = "I" | "II" | "III" | "IV" | "axe";

export function quadrantDe(theta: number): QuadrantRotation {
  const t = normaliserAngle(theta);
  if (t % 90 === 0) return "axe";
  if (t < 90) return "I";
  if (t < 180) return "II";
  if (t < 270) return "III";
  return "IV";
}

/** Angle du premier quadrant (angle de référence) associé à θ. */
export function angleReference(theta: number): number {
  const t = normaliserAngle(theta);
  switch (quadrantDe(t)) {
    case "I":
      return t;
    case "II":
      return propre(180 - t);
    case "III":
      return propre(t - 180);
    case "IV":
      return propre(360 - t);
    default:
      return t % 180 === 0 ? 0 : 90;
  }
}

/** Angle « remarquable » : multiple de 30° ou de 45° (valeurs exactes de sin et cos connues). */
export function estRemarquable(theta: number): boolean {
  const t = normaliserAngle(theta);
  return Number.isInteger(t) && (t % 30 === 0 || t % 45 === 0);
}

/** Faisable sans calculatrice ? Direct : θ remarquable ; inverse : sin θ = ±1/2 ou ±1. */
export function calculExact(e: ExerciceRotationsContexte): boolean {
  if (e.sens === "direct") return estRemarquable(thetaDirect(e));
  return [0.5, -0.5, 1, -1].includes(kInverse(e));
}

export function solutionUnique(e: ExerciceRotationsContexte): boolean {
  return e.sens === "inverse" && solutionsTheta(e).length === 1;
}
