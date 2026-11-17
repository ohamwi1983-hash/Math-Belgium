import type { ConditionRegion, ExerciceRegions, IdVarianteRegions, PointEntier, SousTypeIntersection } from "../../core6e/regionsPlanComplexe.types";

export type { IdVarianteRegions } from "../../core6e/regionsPlanComplexe.types";

/**
 * Couche A (6e) — tirage de `6gen98` « Régions du plan complexe ». Uniquement `Math.random` : la
 * graine des feuilles imprimées (`export/codeExercice.ts::avecGraine`) rejoue la même instance.
 *
 * Ordre du tirage : les VERDICTS (côté de la région — intérieur/extérieur, ≥/≤, plus proche de A ou
 * de B, petit ou grand secteur — et bord inclus) et le cas particulier « centré en O » (1 fois sur
 * 6, variantes à une condition) sont tirés AVANT la boucle de rejet : leurs fréquences ne sont pas
 * biaisées par les contraintes géométriques. Contraintes : frontières sur le quadrillage (données
 * entières, angles multiples de π/4), figure lisible dans la fenêtre fixe [−5 ; 5]², et la
 * frontière « fausse » des distracteurs toujours différente de la vraie.
 */

export const CATALOGUE_VARIANTES: { id: IdVarianteRegions; label: string }[] = [
  { id: "disque", label: "Disque ou extérieur d'un disque : |z − a| ≤ r, |z − a| > r…" },
  { id: "demi-plan", label: "Demi-plan : Re(z − w) ≥ m ou Im(z − w) < m…" },
  { id: "mediatrice", label: "Demi-plan limité par une médiatrice : |z − a| < |z − b|…" },
  { id: "secteur", label: "Secteur angulaire : θ₁ ≤ arg(z − a) ≤ θ₂" },
  { id: "intersection", label: "Intersection de deux conditions (disque et demi-plan, ou Re et Im)" },
];

const PROBA_CAS_PARTICULIER = 1 / 6;

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)];
}

function pile(): boolean {
  return Math.random() < 0.5;
}

/** Entier dans [min ; max]. */
function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function point(borne: number): PointEntier {
  return { x: entier(-borne, borne), y: entier(-borne, borne) };
}

const ORIGINE: PointEntier = { x: 0, y: 0 };

function cercleDansCadre(c: PointEntier, r: number): boolean {
  return Math.abs(c.x) + r <= 4 && Math.abs(c.y) + r <= 4;
}

function tirerDisque(particulier: boolean): ConditionRegion {
  const interieur = pile();
  const large = pile();
  for (;;) {
    // Centré en O : rayon jusqu'à 4 (plus d'instances distinctes pour le cas particulier).
    const rayon = entier(1, particulier ? 4 : 3);
    const centre = particulier ? ORIGINE : point(3);
    if (!particulier && centre.x === 0 && centre.y === 0) continue;
    if (!cercleDansCadre(centre, rayon)) continue;
    return { type: "cercle", centre, rayon, interieur, large };
  }
}

function tirerDemiPlan(particulier: boolean): ConditionRegion {
  const axe = pile() ? "re" : "im";
  const superieur = pile();
  const large = pile();
  for (;;) {
    const k = entier(-3, 3);
    if (particulier) return { type: "demiPlan", axe, w: ORIGINE, m: k, superieur, large };
    const utile = entier(-3, 3);
    if (utile === 0) continue;
    const inutile = entier(-3, 3);
    const m = k - utile;
    if (Math.abs(m) > 4) continue;
    // Frontière fausse x = m − Re(w) : dans la fenêtre.
    if (Math.abs(m - utile) > 4) continue;
    const w = axe === "re" ? { x: utile, y: inutile } : { x: inutile, y: utile };
    return { type: "demiPlan", axe, w, m, superieur, large };
  }
}

function tirerMediatrice(particulier: boolean): ConditionRegion {
  const procheA = pile();
  const large = pile();
  for (;;) {
    const a = point(4);
    const b = particulier ? ORIGINE : point(4);
    if (a.x === b.x || a.y === b.y) continue; // médiatrice oblique (ni verticale ni horizontale)
    if (!particulier && ((a.x === 0 && a.y === 0) || (b.x === 0 && b.y === 0))) continue;
    if (particulier && a.x === 0 && a.y === 0) continue;
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    if (d < 2 || d > 6) continue;
    if (Math.abs(a.x + b.x) > 6 || Math.abs(a.y + b.y) > 6) continue; // milieu dans [−3 ; 3]²
    return { type: "mediatrice", a, b, procheA, large };
  }
}

function tirerSecteur(particulier: boolean): ConditionRegion {
  const grand = pile();
  const large = pile();
  for (;;) {
    const ouv = grand ? entier(5, 7) : entier(1, 3);
    const t1 = entier(-3, 4 - ouv);
    const t2 = t1 + ouv;
    if (t1 === -t2) continue; // la frontière « angles mesurés à l'envers » serait la même
    const sommet = particulier ? ORIGINE : point(2);
    if (!particulier && sommet.x === 0 && sommet.y === 0) continue;
    return { type: "secteur", sommet, t1, t2, large };
  }
}

function tirerIntersection(sousType: SousTypeIntersection): ConditionRegion[] {
  if (sousType === "quadrant") {
    const supRe = pile();
    const supIm = pile();
    const largeRe = pile();
    const largeIm = pile();
    return [
      { type: "demiPlan", axe: "re", w: ORIGINE, m: entier(-3, 3), superieur: supRe, large: largeRe },
      { type: "demiPlan", axe: "im", w: ORIGINE, m: entier(-3, 3), superieur: supIm, large: largeIm },
    ];
  }
  const interieur = pile();
  const largeCercle = pile();
  const axe = pile() ? "re" : "im";
  const superieur = pile();
  const largeDroite = pile();
  for (;;) {
    const rayon = entier(2, 3);
    const centre = point(2);
    if (!cercleDansCadre(centre, rayon)) continue;
    const coord = axe === "re" ? centre.x : centre.y;
    const k = coord + entier(-(rayon - 1), rayon - 1);
    if (Math.abs(k) > 3) continue;
    return [
      { type: "cercle", centre, rayon, interieur, large: largeCercle },
      { type: "demiPlan", axe, w: ORIGINE, m: k, superieur, large: largeDroite },
    ];
  }
}

export function construireAvecVarianteId(id: string): ExerciceRegions {
  const variante = (CATALOGUE_VARIANTES.some((v) => v.id === id) ? id : "disque") as IdVarianteRegions;
  if (variante === "intersection") {
    const sousType: SousTypeIntersection = pile() ? "cercle-demiplan" : "quadrant";
    return { variante, sousType, conditions: tirerIntersection(sousType) };
  }
  const particulier = Math.random() < PROBA_CAS_PARTICULIER;
  const tirage: Record<Exclude<IdVarianteRegions, "intersection">, (p: boolean) => ConditionRegion> = {
    disque: tirerDisque,
    "demi-plan": tirerDemiPlan,
    mediatrice: tirerMediatrice,
    secteur: tirerSecteur,
  };
  return { variante, sousType: null, conditions: [tirage[variante](particulier)] };
}

/** Tirage libre : variante équiprobable. */
export function genererExerciceRegions(): ExerciceRegions {
  return construireAvecVarianteId(choisir(CATALOGUE_VARIANTES).id);
}
