import type { ExerciceLirePlacer, IdOperationPlan, IdTransformationPlan, PointEntier } from "../core6e/lirePlacerPlanComplexe.types";

/**
 * Couche B (6e) — géométrie PURE de `6gen95` « Lire et placer dans le plan complexe » : image d'un
 * point par chaque opération, transformation associée, positions des erreurs classiques
 * (diagnostic ciblé de l'écran de placement), module et argument exacts du point C. Source UNIQUE
 * de toutes les valeurs : générateur (contraintes de tirage), vérification, textes, corrigé et
 * figures en dérivent.
 */

/** Fenêtre FIXE du repère (écran et papier) : [−5 ; 5] × [−5 ; 5]. */
export const BORNE_FENETRE = 5;
/** Tous les points (données et images) restent dans [−4 ; 4]² : jamais sur le bord du cadre. */
export const BORNE_POINTS = 4;

export function memePoint(p: PointEntier, q: PointEntier): boolean {
  return p.x === q.x && p.y === q.y;
}

/** Image de z (et w) par l'opération. */
export function imageOperation(op: IdOperationPlan, z: PointEntier, w: PointEntier | null): PointEntier {
  const wx = w?.x ?? 0;
  const wy = w?.y ?? 0;
  switch (op) {
    case "conjugue":
      return { x: z.x, y: -z.y };
    case "oppose":
      return { x: -z.x, y: -z.y };
    case "opposeConjugue":
      return { x: -z.x, y: z.y };
    case "rotation":
      return { x: -z.y, y: z.x };
    case "double":
      return { x: 2 * z.x, y: 2 * z.y };
    case "somme":
      return { x: z.x + wx, y: z.y + wy };
    case "difference":
      return { x: z.x - wx, y: z.y - wy };
  }
}

export function utiliseW(op: IdOperationPlan): boolean {
  return op === "somme" || op === "difference";
}

export const TRANSFORMATION_DE: Record<IdOperationPlan, IdTransformationPlan> = {
  conjugue: "symetrieAxeReel",
  oppose: "symetrieCentrale",
  opposeConjugue: "symetrieAxeImaginaire",
  rotation: "rotationPlus",
  double: "homothetie",
  somme: "translationW",
  difference: "translationMoinsW",
};

/** Erreur classique de placement : position fautive + identifiant du message. */
export interface PiegePlacement {
  id: string;
  position: PointEntier;
}

/**
 * Positions fautives diagnostiquées pour une opération (dans l'ordre de priorité). Les pièges du
 * cahier des charges : z̄ ↔ −z, iz placé comme une rotation de −π/2, z − w placé comme w − z ; plus
 * i² = −1 oublié, une seule coordonnée doublée, somme ↔ différence, parties inversées.
 */
export function piegesPlacement(op: IdOperationPlan, z: PointEntier, w: PointEntier | null): PiegePlacement[] {
  const wx = w?.x ?? 0;
  const wy = w?.y ?? 0;
  const pieges: PiegePlacement[] = [];
  const ajouter = (id: string, x: number, y: number) => pieges.push({ id, position: { x, y } });
  switch (op) {
    case "conjugue":
      ajouter("oppose", -z.x, -z.y);
      ajouter("opposeConjugue", -z.x, z.y);
      break;
    case "oppose":
      ajouter("conjugue", z.x, -z.y);
      ajouter("opposeConjugue", -z.x, z.y);
      break;
    case "opposeConjugue":
      ajouter("conjugue", z.x, -z.y);
      ajouter("oppose", -z.x, -z.y);
      break;
    case "rotation":
      ajouter("rotationMoins", z.y, -z.x);
      ajouter("iCarre", z.y, z.x);
      break;
    case "double":
      ajouter("doubleReel", 2 * z.x, z.y);
      ajouter("doubleImaginaire", z.x, 2 * z.y);
      ajouter("plusDeux", z.x + 2, z.y);
      break;
    case "somme":
      ajouter("somme-difference", z.x - wx, z.y - wy);
      ajouter("somme-w-moins-z", wx - z.x, wy - z.y);
      break;
    case "difference":
      ajouter("w-moins-z", wx - z.x, wy - z.y);
      ajouter("difference-somme", z.x + wx, z.y + wy);
      break;
  }
  const attendu = imageOperation(op, z, w);
  // Parties réelle et imaginaire inversées (lecture du repère), en dernier recours.
  ajouter("inversion", attendu.y, attendu.x);
  ajouter("depart", z.x, z.y);
  // Une position fautive ne doit jamais coïncider avec la bonne (z générique : jamais le cas).
  return pieges.filter((p) => !memePoint(p.position, attendu));
}

/** Diagnostic d'un point placé : `null` s'il est juste, sinon l'identifiant du piège (ou « autre »). */
export function diagnostiquerPlacement(op: IdOperationPlan, z: PointEntier, w: PointEntier | null, place: PointEntier): string | null {
  if (memePoint(place, imageOperation(op, z, w))) return null;
  const piege = piegesPlacement(op, z, w).find((p) => memePoint(p.position, place));
  return piege ? piege.id : "autre";
}

// ---------------------------------------------------------------------------------------------
// Point C : module et argument exacts.
// ---------------------------------------------------------------------------------------------

/** C sur un axe (module entier, argument immédiat) ou sur une diagonale (module k√2). */
export function cSurAxe(c: PointEntier): boolean {
  return c.x === 0 || c.y === 0;
}

export function moduleC(c: PointEntier): number {
  return Math.hypot(c.x, c.y);
}

/** Argument principal dans ]−π ; π]. */
export function argumentC(c: PointEntier): number {
  return Math.atan2(c.y, c.x);
}

/** Module en LaTeX exact : « 3 » sur un axe, « 2\sqrt{2} » sur une diagonale. */
export function moduleCLatex(c: PointEntier): string {
  if (cSurAxe(c)) return String(Math.abs(c.x + c.y));
  const k = Math.abs(c.x);
  return k === 1 ? "\\sqrt{2}" : `${k}\\sqrt{2}`;
}

/** Argument principal en LaTeX (multiple de π/4). */
export function argumentCLatex(c: PointEntier): string {
  const huitiemes = Math.round((argumentC(c) / Math.PI) * 4);
  const table: Record<number, string> = {
    0: "0",
    1: "\\frac{\\pi}{4}",
    2: "\\frac{\\pi}{2}",
    3: "\\frac{3\\pi}{4}",
    4: "\\pi",
    [-1]: "-\\frac{\\pi}{4}",
    [-2]: "-\\frac{\\pi}{2}",
    [-3]: "-\\frac{3\\pi}{4}",
  };
  return table[huitiemes] ?? "0";
}

/** Tous les points de la figure finale (données + images), pour les contrôles de tirage. */
export function pointsFigure(e: ExerciceLirePlacer): PointEntier[] {
  const pts: PointEntier[] = [e.z, e.c];
  if (e.w) pts.push(e.w);
  for (const op of e.operations) pts.push(imageOperation(op, e.z, e.w));
  return pts;
}
