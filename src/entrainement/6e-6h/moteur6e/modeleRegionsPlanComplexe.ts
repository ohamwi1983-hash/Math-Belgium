import type { ConditionRegion, ExerciceRegions, NatureFrontiere, PointEntier } from "../core6e/regionsPlanComplexe.types";
import { graineDepuis, melangerParGraine } from "./saisieComplexe";

/**
 * Couche B (6e) — géométrie PURE de `6gen98` « Régions du plan complexe » : nature et éléments de
 * la frontière, appartenance d'un point, zones dessinées (bonne région, région opposée, frontière
 * fausse issue d'une erreur classique). Source UNIQUE : générateur, vérification, textes, corrigé
 * et figures en dérivent.
 */

/** Fenêtre FIXE du repère (écran et papier) : [−5 ; 5]². */
export const BORNE_FENETRE = 5;

const EPS = 1e-9;

export function estOrigine(p: PointEntier): boolean {
  return p.x === 0 && p.y === 0;
}

export function oppose(p: PointEntier): PointEntier {
  return { x: p.x === 0 ? 0 : -p.x, y: p.y === 0 ? 0 : -p.y };
}

export function natureDe(c: ConditionRegion): NatureFrontiere {
  switch (c.type) {
    case "cercle":
      return "cercle";
    case "demiPlan":
      return c.axe === "re" ? "verticale" : "horizontale";
    case "mediatrice":
      return "mediatrice";
    case "secteur":
      return "demiDroites";
  }
}

/** Partie de w qui compte (Re pour « re », Im pour « im »). */
export function partieUtile(c: Extract<ConditionRegion, { type: "demiPlan" }>): number {
  return c.axe === "re" ? c.w.x : c.w.y;
}

/** L'autre partie de w (piège : elle n'intervient pas). */
export function partieInutile(c: Extract<ConditionRegion, { type: "demiPlan" }>): number {
  return c.axe === "re" ? c.w.y : c.w.x;
}

/** Valeur k de la frontière x = k (ou y = k). */
export function valeurFrontiere(c: Extract<ConditionRegion, { type: "demiPlan" }>): number {
  return c.m + partieUtile(c);
}

/** Ouverture du secteur, en quarts de π/4 (« huitièmes de tour »). */
export function ouverture(c: Extract<ConditionRegion, { type: "secteur" }>): number {
  return c.t2 - c.t1;
}

/** Cas particulier : la condition est centrée en O (|z| ≤ r, Re(z) ≥ k, |z − a| < |z|, arg z). */
export function conditionEnO(c: ConditionRegion): boolean {
  switch (c.type) {
    case "cercle":
      return estOrigine(c.centre);
    case "demiPlan":
      return estOrigine(c.w);
    case "mediatrice":
      return estOrigine(c.b);
    case "secteur":
      return estOrigine(c.sommet);
  }
}

/** Le point (x ; y) vérifie-t-il la condition ? (le bord compte selon `large`). */
export function verifie(c: ConditionRegion, x: number, y: number): boolean {
  const comparer = (gauche: number, droite: number, superieur: boolean, large: boolean) => {
    const d = gauche - droite;
    if (Math.abs(d) < EPS) return large;
    return superieur ? d > 0 : d < 0;
  };
  switch (c.type) {
    case "cercle":
      return comparer(Math.hypot(x - c.centre.x, y - c.centre.y), c.rayon, !c.interieur, c.large);
    case "demiPlan":
      return comparer(c.axe === "re" ? x : y, valeurFrontiere(c), c.superieur, c.large);
    case "mediatrice":
      return comparer(Math.hypot(x - c.a.x, y - c.a.y), Math.hypot(x - c.b.x, y - c.b.y), !c.procheA, c.large);
    case "secteur": {
      if (Math.abs(x - c.sommet.x) < EPS && Math.abs(y - c.sommet.y) < EPS) return false;
      const theta = Math.atan2(y - c.sommet.y, x - c.sommet.x);
      const t = theta <= -Math.PI + EPS ? Math.PI : theta;
      const t1 = (c.t1 * Math.PI) / 4;
      const t2 = (c.t2 * Math.PI) / 4;
      if (Math.abs(t - t1) < EPS || Math.abs(t - t2) < EPS) return c.large;
      return t > t1 && t < t2;
    }
  }
}

/** Le point est-il sur la frontière de la condition ? */
export function surFrontiere(c: ConditionRegion, x: number, y: number): boolean {
  if (c.type === "secteur" && x === c.sommet.x && y === c.sommet.y) return true;
  return verifie({ ...c, large: true }, x, y) && !verifie({ ...c, large: false }, x, y);
}

/** Point test pour l'aide de l'écran « région » : O si possible, sinon un point simple hors de
 * toutes les frontières. */
export function pointTest(e: ExerciceRegions): PointEntier {
  const candidats: PointEntier[] = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 0, y: -1 },
    { x: 2, y: 0 },
    { x: 0, y: 2 },
    { x: -2, y: 0 },
    { x: 0, y: -2 },
    { x: 1, y: 1 },
    { x: -1, y: -1 },
    { x: 3, y: 0 },
    { x: -3, y: 0 },
  ];
  return candidats.find((p) => e.conditions.every((c) => !surFrontiere(c, p.x, p.y))) ?? { x: 4, y: 4 };
}

// ---------------------------------------------------------------------------------------------
// Zones dessinées (figures de l'écran « région », du corrigé papier).
// ---------------------------------------------------------------------------------------------

export type RegionGeo =
  | { type: "disque"; cx: number; cy: number; r: number; interieur: boolean }
  | { type: "demiPlan"; px: number; py: number; nx: number; ny: number }
  | { type: "secteur"; sx: number; sy: number; de: number; a: number };

export type BordGeo =
  | { type: "cercle"; cx: number; cy: number; r: number }
  | { type: "droite"; p1: [number, number]; p2: [number, number] }
  | { type: "rayons"; sx: number; sy: number; angles: [number, number] };

export interface RepereGeo {
  x: number;
  y: number;
  nom: string;
  creux?: boolean;
}

export interface ZoneDessin {
  region: RegionGeo;
  bord: BordGeo;
  reperes: RepereGeo[];
  inclus: boolean;
}

/**
 * Zone d'une condition : `inverse` = l'autre côté de la frontière (région opposée) ; `erreur` =
 * frontière fausse issue d'une erreur classique — centre de signe opposé (ou rayon faux si le
 * centre est O), frontière x = m − Re(w) (ou Re/Im confondus si w = 0), droite (AB) au lieu de la
 * médiatrice, angles mesurés dans le sens des aiguilles d'une montre.
 */
export function zoneCondition(c: ConditionRegion, inverse: boolean, erreur: boolean): ZoneDessin {
  switch (c.type) {
    case "cercle": {
      const centre = erreur && !estOrigine(c.centre) ? oppose(c.centre) : c.centre;
      const r = erreur && estOrigine(c.centre) ? (c.rayon >= 4 ? c.rayon - 1 : c.rayon + 1) : c.rayon;
      return {
        region: { type: "disque", cx: centre.x, cy: centre.y, r, interieur: c.interieur !== inverse },
        bord: { type: "cercle", cx: centre.x, cy: centre.y, r },
        reperes: [{ x: centre.x, y: centre.y, nom: "Ω" }],
        inclus: c.large,
      };
    }
    case "demiPlan": {
      let axe = c.axe;
      let k = valeurFrontiere(c);
      if (erreur) {
        if (estOrigine(c.w)) axe = c.axe === "re" ? "im" : "re";
        else k = c.m - partieUtile(c);
      }
      const signe = c.superieur !== inverse ? 1 : -1;
      return axe === "re"
        ? { region: { type: "demiPlan", px: k, py: 0, nx: signe, ny: 0 }, bord: { type: "droite", p1: [k, 0], p2: [k, 1] }, reperes: [], inclus: c.large }
        : { region: { type: "demiPlan", px: 0, py: k, nx: 0, ny: signe }, bord: { type: "droite", p1: [0, k], p2: [1, k] }, reperes: [], inclus: c.large };
    }
    case "mediatrice": {
      const reperes: RepereGeo[] = [
        { x: c.a.x, y: c.a.y, nom: "A" },
        { x: c.b.x, y: c.b.y, nom: "B" },
      ];
      const ux = c.b.x - c.a.x;
      const uy = c.b.y - c.a.y;
      const versA = c.procheA !== inverse;
      if (erreur) {
        // Droite (AB) au lieu de la médiatrice : un côté, puis l'autre.
        const s = versA ? 1 : -1;
        return { region: { type: "demiPlan", px: c.a.x, py: c.a.y, nx: -uy * s, ny: ux * s }, bord: { type: "droite", p1: [c.a.x, c.a.y], p2: [c.b.x, c.b.y] }, reperes, inclus: c.large };
      }
      const mx = (c.a.x + c.b.x) / 2;
      const my = (c.a.y + c.b.y) / 2;
      const s = versA ? -1 : 1;
      return { region: { type: "demiPlan", px: mx, py: my, nx: ux * s, ny: uy * s }, bord: { type: "droite", p1: [mx, my], p2: [mx - uy, my + ux] }, reperes, inclus: c.large };
    }
    case "secteur": {
      const t1 = erreur ? -c.t2 : c.t1;
      const t2 = erreur ? -c.t1 : c.t2;
      const q = Math.PI / 4;
      const [de, a] = inverse ? [t2 * q, (t1 + 8) * q] : [t1 * q, t2 * q];
      return {
        region: { type: "secteur", sx: c.sommet.x, sy: c.sommet.y, de, a },
        bord: { type: "rayons", sx: c.sommet.x, sy: c.sommet.y, angles: [t1 * q, t2 * q] },
        reperes: [{ x: c.sommet.x, y: c.sommet.y, nom: "S", creux: true }],
        inclus: c.large,
      };
    }
  }
}

/** Une figure proposée à l'écran « région » : zones (une par condition) et verdict. */
export interface OptionRegion {
  id: string;
  correcte: boolean;
  zones: ZoneDessin[];
}

/**
 * Les quatre figures de l'écran « région », mélangées par une graine tirée de l'exercice (même
 * ordre à chaque affichage). Une condition : {bonne frontière, frontière fausse} × {bon côté, côté
 * opposé}. Deux conditions : les quatre combinaisons de côtés (frontières justes).
 */
export function optionsRegion(e: ExerciceRegions): OptionRegion[] {
  const options: OptionRegion[] = [];
  if (e.conditions.length === 1) {
    const c = e.conditions[0];
    [false, true].forEach((erreur) =>
      [false, true].forEach((inverse) => options.push({ id: `f${options.length}`, correcte: !erreur && !inverse, zones: [zoneCondition(c, inverse, erreur)] })),
    );
  } else {
    [false, true].forEach((inv1) =>
      [false, true].forEach((inv2) => options.push({ id: `f${options.length}`, correcte: !inv1 && !inv2, zones: [zoneCondition(e.conditions[0], inv1, false), zoneCondition(e.conditions[1], inv2, false)] })),
    );
  }
  return melangerParGraine(options, graineDepuis(e, "region"));
}

export function idOptionCorrecte(e: ExerciceRegions): string {
  return optionsRegion(e).find((o) => o.correcte)?.id ?? "f0";
}
