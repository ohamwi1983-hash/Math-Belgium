import type { Q } from "../../5e-4h/ui5e/nombresTrigo";
import { piL, q, qAdd, qDiv, qL, qMul, qSub, qVal } from "../../5e-4h/ui5e/nombresTrigo";

/**
 * Couche core — `6gen162` « Probabilités géométriques » (6e ch. 6, § 1, processus 2 APPLIQUER).
 * Un point est choisi au hasard dans une figure (chaque zone de même aire, ou chaque morceau de même
 * longueur, a la même chance) : P = aire favorable / aire totale (longueur sur un segment). Six
 * variantes :
 * - `cible` : fléchette sur une cible circulaire de rayon R, zone = couronne entre r₁ et r₂ (r₁ = 0 :
 *   disque central, CAS PARTICULIER — une seule aire à calculer) ;
 * - `cibleInverse` : rayon r du disque central à trouver pour une probabilité donnée (« ? » sur la
 *   figure) ;
 * - `carreDisque` : carré de côté c et disque inscrit, point dans (ou hors) du disque ;
 * - `rectangleQuart` : rectangle L × l et quart de disque de rayon r centré en un sommet ;
 * - `segment` : point M au hasard sur [AB] de longueur L (entre deux distances, loin des deux
 *   extrémités, plus long morceau au moins m) ;
 * - `rendezVous` : deux arrivées uniformes sur [0 ; T] minutes, chacun attend t minutes : carré
 *   T × T et bande |x − y| ≤ t.
 * Réponses EXACTES : rationnels ou a + bπ (`ValPi`) ; aucune valeur approchée demandée.
 */

export type VarianteProbaGeo = "cible" | "cibleInverse" | "carreDisque" | "rectangleQuart" | "segment" | "rendezVous";
export type TypeSegment = "entre" | "loin" | "grandMorceau";

export type ExerciceProbaGeo =
  /** r1 = 0 : disque central de rayon r2. */
  | { variante: "cible"; R: number; r1: number; r2: number }
  | { variante: "cibleInverse"; R: number; r: number }
  | { variante: "carreDisque"; c: number; hors: boolean }
  | { variante: "rectangleQuart"; L: number; l: number; r: number; hors: boolean }
  /** entre : a ≤ AM ≤ b ; loin : a = d (à plus de d de A et de B) ; grandMorceau : a = m. */
  | { variante: "segment"; L: number; type: TypeSegment; a: number; b: number }
  | { variante: "rendezVous"; T: number; t: number; rencontre: boolean; noms: [string, string]; heure: number };

export type PhaseProbaGeo = "totale" | "favorable" | "proba" | "rayon";

/** Valeur exacte a + bπ (a, b rationnels). */
export interface ValPi {
  a: Q;
  b: Q;
}

export const vp = (a: Q, b: Q = q(0)): ValPi => ({ a, b });
export const valeurPi = (v: ValPi): number => qVal(v.a) + qVal(v.b) * Math.PI;

/** a + bπ en LaTeX : « 25\pi », « 64-16\pi », « 1-\dfrac{\pi}{4} », « \dfrac{9}{25} ». */
export function valPiL(v: ValPi): string {
  const a = v.a.n === 0 ? "" : qL(v.a);
  if (v.b.n === 0) return a === "" ? "0" : a;
  const b = piL(v.b);
  if (a === "") return b;
  return b.startsWith("-") ? `${a}${b}` : `${a}+${b}`;
}

/** Les phases (écrans) de l'instance. */
export function phasesProbaGeo(e: ExerciceProbaGeo): PhaseProbaGeo[] {
  if (e.variante === "segment") return ["favorable", "proba"];
  if (e.variante === "cibleInverse") return ["totale", "favorable", "rayon"];
  return ["totale", "favorable", "proba"];
}

/** Aire (ou longueur) totale. */
export function totale(e: ExerciceProbaGeo): ValPi {
  switch (e.variante) {
    case "cible":
    case "cibleInverse":
      return vp(q(0), q(e.R * e.R));
    case "carreDisque":
      return vp(q(e.c * e.c));
    case "rectangleQuart":
      return vp(q(e.L * e.l));
    case "segment":
      return vp(q(e.L));
    case "rendezVous":
      return vp(q(e.T * e.T));
  }
}

/** Aire du disque (ou quart de disque) dessiné — avant un éventuel passage au complément. */
export function aireForme(e: ExerciceProbaGeo): ValPi {
  switch (e.variante) {
    case "carreDisque":
      return vp(q(0), q(e.c * e.c, 4));
    case "rectangleQuart":
      return vp(q(0), q(e.r * e.r, 4));
    default:
      return favorable(e);
  }
}

/** Aire (ou longueur) de la zone de l'écran 2 : favorable, sauf en `rendezVous` (zone où ils NE se
 * rencontrent PAS : les deux triangles) et en `cibleInverse` (aire que doit avoir le disque central). */
export function favorable(e: ExerciceProbaGeo): ValPi {
  switch (e.variante) {
    case "cible":
      return vp(q(0), q(e.r2 * e.r2 - e.r1 * e.r1));
    case "cibleInverse":
      return vp(q(0), q(e.r * e.r));
    case "carreDisque": {
      const d = q(e.c * e.c, 4);
      return e.hors ? vp(q(e.c * e.c), q(-d.n, d.d)) : vp(q(0), d);
    }
    case "rectangleQuart": {
      const d = q(e.r * e.r, 4);
      return e.hors ? vp(q(e.L * e.l), q(-d.n, d.d)) : vp(q(0), d);
    }
    case "segment":
      return vp(q(longueurFavorable(e)));
    case "rendezVous":
      return vp(q((e.T - e.t) * (e.T - e.t)));
  }
}

export function longueurFavorable(e: Extract<ExerciceProbaGeo, { variante: "segment" }>): number {
  if (e.type === "entre") return e.b - e.a;
  if (e.type === "loin") return e.L - 2 * e.a;
  return 2 * (e.L - e.a);
}

/** Probabilité cherchée (rationnel ou a + bπ). */
export function probabilite(e: ExerciceProbaGeo): ValPi {
  const tot = totale(e);
  switch (e.variante) {
    case "cible":
    case "cibleInverse":
      return vp(qDiv(favorable(e).b, tot.b));
    case "carreDisque":
    case "rectangleQuart": {
      const f = favorable(e);
      return vp(qDiv(f.a, tot.a), qDiv(f.b, tot.a));
    }
    case "segment":
      return vp(qDiv(favorable(e).a, tot.a));
    case "rendezVous": {
      const pas = qDiv(favorable(e).a, tot.a);
      return vp(e.rencontre ? qSub(q(1), pas) : pas);
    }
  }
}

/** Probabilité donnée (`cibleInverse`) : r²/R². */
export const probaDonnee = (e: Extract<ExerciceProbaGeo, { variante: "cibleInverse" }>): Q => q(e.r * e.r, e.R * e.R);

/** Valeur attendue d'un écran (le rayon de `cibleInverse` est un entier). */
export function valeurAttendue(e: ExerciceProbaGeo, p: PhaseProbaGeo): ValPi {
  if (p === "totale") return totale(e);
  if (p === "favorable") return favorable(e);
  if (p === "rayon") return vp(q(e.variante === "cibleInverse" ? e.r : 0));
  return probabilite(e);
}

/** Valeur (fausse) que donne la confusion classique « rapport des longueurs » (cible) ou « une seule
 * extrémité » (segment) — message ciblé. `null` : sans objet. */
export function valeurPiege(e: ExerciceProbaGeo, p: PhaseProbaGeo): { valeur: number; message: string } | null {
  if (p === "proba" && e.variante === "cible") return { valeur: (e.r2 - e.r1) / e.R, message: "rapport" };
  if (p === "rayon" && e.variante === "cibleInverse") return { valeur: qVal(qMul(probaDonnee(e), q(e.R))), message: "rayonSansRacine" };
  if (p === "favorable" && e.variante === "segment" && e.type === "loin") return { valeur: e.L - e.a, message: "uneExtremite" };
  if (p === "favorable" && e.variante === "segment" && e.type === "grandMorceau") return { valeur: e.L - e.a, message: "unSeulCote" };
  if (p === "favorable" && (e.variante === "carreDisque" || e.variante === "rectangleQuart") && e.hors) return { valeur: valeurPi(aireForme(e)), message: "forme" };
  if (p === "proba" && e.variante === "rendezVous" && e.rencontre) return { valeur: qVal(qDiv(favorable(e).a, totale(e).a)), message: "complement" };
  if (p === "favorable" && e.variante === "rendezVous") return { valeur: (e.T - e.t) * (e.T - e.t) / 2, message: "unTriangle" };
  return null;
}

/** Somme utile aux contrôles : P(zone) + P(complément) = 1. */
export const complement = (v: ValPi): ValPi => vp(qSub(q(1), v.a), q(-v.b.n, v.b.d));
export const ajouter = (u: ValPi, v: ValPi): ValPi => vp(qAdd(u.a, v.a), qAdd(u.b, v.b));
