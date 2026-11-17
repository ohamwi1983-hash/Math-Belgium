import type { ExerciceLirePlacer, IdOperationPlan, IdVarianteLirePlacer, PointEntier } from "../../core6e/lirePlacerPlanComplexe.types";
import { BORNE_POINTS, memePoint, pointsFigure, utiliseW } from "../../moteur6e/modeleLirePlacerPlanComplexe";

export type { IdVarianteLirePlacer } from "../../core6e/lirePlacerPlanComplexe.types";

/**
 * Couche A (6e) — tirage de `6gen95` « Lire et placer dans le plan complexe ». Uniquement
 * `Math.random` : la graine des feuilles imprimées (`export/codeExercice.ts::avecGraine`) rejoue la
 * même instance.
 *
 * Ordre du tirage : la PAIRE d'opérations et leur ordre, puis le type du point C (axe 1 fois sur 4,
 * diagonale sinon) sont tirés AVANT la boucle de rejet — leurs fréquences ne sont pas biaisées par
 * les contraintes géométriques. Contraintes : z = a + bi avec a, b ≠ 0 et |a| ≠ |b| (z̄, −z, −z̄, iz,
 * −iz tous distincts : chaque erreur classique a sa propre position) ; tous les points de la figure
 * (A, B, C, P, Q) dans [−4 ; 4]², distincts, hors de O, à une distance ≥ 1,5 l'un de l'autre (ni
 * voisins ni en diagonale : étiquettes lisibles, placement au doigt sans ambiguïté).
 */

export const CATALOGUE_VARIANTES: { id: IdVarianteLirePlacer; label: string }[] = [
  { id: "symetries", label: "Symétries : deux opérations parmi z̄, −z et −z̄ (un point à lire)" },
  { id: "rotation-homothetie", label: "Rotation et homothétie : iz ou 2z, avec une autre opération sur z (un point à lire)" },
  { id: "translations", label: "Translations : z + w ou z − w, avec une autre opération (deux points à lire)" },
];

const SYMETRIES: IdOperationPlan[] = ["conjugue", "oppose", "opposeConjugue"];

/** Paires d'opérations (non ordonnées) de chaque variante. */
export const PAIRES_PAR_VARIANTE: Record<IdVarianteLirePlacer, [IdOperationPlan, IdOperationPlan][]> = {
  symetries: [
    ["conjugue", "oppose"],
    ["conjugue", "opposeConjugue"],
    ["oppose", "opposeConjugue"],
  ],
  "rotation-homothetie": [["rotation", "double"], ...SYMETRIES.map((s): [IdOperationPlan, IdOperationPlan] => ["rotation", s]), ...SYMETRIES.map((s): [IdOperationPlan, IdOperationPlan] => ["double", s])],
  translations: [
    ["somme", "difference"],
    ...(["somme", "difference"] as const).flatMap((t) => (["conjugue", "oppose", "opposeConjugue", "rotation", "double"] as const).map((o): [IdOperationPlan, IdOperationPlan] => [t, o])),
  ],
};

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)];
}

function entierNonNul(borne: number): number {
  const v = 1 + Math.floor(Math.random() * borne);
  return Math.random() < 0.5 ? -v : v;
}

function dansCadre(p: PointEntier): boolean {
  return Math.abs(p.x) <= BORNE_POINTS && Math.abs(p.y) <= BORNE_POINTS;
}

/** Point C : sur un axe (k de 1 à 4) ou sur une diagonale (k de 1 à 3). */
function tirerC(surAxe: boolean): PointEntier {
  if (surAxe) {
    const k = 1 + Math.floor(Math.random() * 4);
    return choisir([
      { x: k, y: 0 },
      { x: -k, y: 0 },
      { x: 0, y: k },
      { x: 0, y: -k },
    ]);
  }
  const k = 1 + Math.floor(Math.random() * 3);
  return { x: choisir([k, -k]), y: choisir([k, -k]) };
}

function figureValide(e: ExerciceLirePlacer): boolean {
  const pts = pointsFigure(e);
  if (!pts.every(dansCadre)) return false;
  if (pts.some((p) => p.x === 0 && p.y === 0)) return false;
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      if (memePoint(pts[i], pts[j])) return false;
      if (Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y) < 1.5) return false;
    }
  }
  return true;
}

export function construireAvecVarianteId(id: string): ExerciceLirePlacer {
  const variante = (CATALOGUE_VARIANTES.some((v) => v.id === id) ? id : "symetries") as IdVarianteLirePlacer;
  const paire = choisir(PAIRES_PAR_VARIANTE[variante]);
  const operations: [IdOperationPlan, IdOperationPlan] = Math.random() < 0.5 ? [paire[0], paire[1]] : [paire[1], paire[0]];
  const surAxe = Math.random() < 0.25;
  const avecW = operations.some(utiliseW);
  const borneZ = operations.includes("double") ? 2 : BORNE_POINTS;
  for (;;) {
    const z = { x: entierNonNul(borneZ), y: entierNonNul(borneZ) };
    if (Math.abs(z.x) === Math.abs(z.y)) continue;
    let w: PointEntier | null = null;
    if (avecW) {
      w = { x: Math.floor(Math.random() * 9) - 4, y: Math.floor(Math.random() * 9) - 4 };
      if (w.x === 0 && w.y === 0) continue;
    }
    const c = tirerC(surAxe);
    const e: ExerciceLirePlacer = { variante, z, w, c, operations };
    if (!figureValide(e)) continue;
    return e;
  }
}

/** Tirage libre : variante équiprobable, puis paire équiprobable dans la variante. */
export function genererExerciceLirePlacer(): ExerciceLirePlacer {
  return construireAvecVarianteId(choisir(CATALOGUE_VARIANTES).id);
}
