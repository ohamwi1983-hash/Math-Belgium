import type { ContexteModele, ExerciceModeleTableau, GenreModele, VarianteModeleTableau } from "../../core6e/modeleTableau.types";
import { estDecimal, parmi, q, qAdd, qMul, qVal } from "../../ui6e/nombresExp";
import type { Q } from "../../ui6e/nombresExp";

/**
 * Couche A — générateur de 6gen147 « Modèle exponentiel lu dans un tableau ». `Math.random()` seul
 * (le `?code=` rejoue le tirage). Ordre : genre du modèle (exponentiel / linéaire, 50/50 : c'est le
 * verdict de l'écran 2), sens (croissance / décroissance), contexte de ce sens, puis les nombres —
 * mesures EXACTES (entières pour un effectif, au plus 2 décimales en euros, 3 sinon), rejet sinon.
 */

export type IdVarianteModeleTableau = VarianteModeleTableau;

export const CATALOGUE_VARIANTES: { id: IdVarianteModeleTableau; label: string }[] = [
  { id: "pas1", label: "Mesures à intervalles d'une unité" },
  { id: "pas2", label: "Mesures toutes les deux unités (le rapport vaut a²)" },
];

export const CONTEXTES: ContexteModele[] = [
  { sujet: "Le nombre de bactéries d'une culture", lettre: "N", unite: "bactéries", temps: "heures", sens: "croissance", entier: true, decimales: 0 },
  { sujet: "Le nombre d'abonnés d'une chaîne vidéo", lettre: "N", unite: "abonnés", temps: "mois", sens: "croissance", entier: true, decimales: 0 },
  { sujet: "Le capital d'un placement", lettre: "C", unite: "euros", temps: "années", sens: "croissance", entier: false, decimales: 2 },
  { sujet: "La surface couverte par une algue", lettre: "S", unite: "m²", temps: "semaines", sens: "croissance", entier: false, decimales: 3 },
  { sujet: "La masse de médicament dans le sang", lettre: "M", unite: "mg", temps: "heures", sens: "decroissance", entier: false, decimales: 3 },
  { sujet: "La valeur d'une machine", lettre: "V", unite: "euros", temps: "années", sens: "decroissance", entier: false, decimales: 2 },
  { sujet: "La masse d'un échantillon radioactif", lettre: "M", unite: "g", temps: "jours", sens: "decroissance", entier: false, decimales: 3 },
  { sujet: "Le nombre de poissons d'un lac pollué", lettre: "N", unite: "poissons", temps: "années", sens: "decroissance", entier: true, decimales: 0 },
];

const B = [64, 80, 100, 128, 160, 200, 250, 256, 320, 400, 500, 625, 640, 800, 1000, 1250, 1600, 2000, 2500, 3125, 4000, 5000];
const A_CROISSANCE: Q[] = [q(2), q(3), q(3, 2), q(5, 4), q(6, 5), q(11, 10)];
const A_DECROISSANCE: Q[] = [q(1, 2), q(4, 5), q(9, 10), q(3, 5), q(3, 4), q(2, 5)];
const R_LINEAIRE: Q[] = [q(1, 20), q(1, 10), q(3, 20), q(1, 5), q(1, 4), q(3, 10)];

export function qPuissance(a: Q, n: number): Q {
  let r = q(1);
  for (let i = 0; i < n; i++) r = qMul(r, a);
  return r;
}

/** Valeur exacte du modèle en t. */
export function valeurModele(e: ExerciceModeleTableau, t: number): Q {
  return e.genre === "exponentiel" ? qMul(e.b, qPuissance(e.a, t)) : qAdd(e.b, qMul(e.m, q(t)));
}

export function instants(e: ExerciceModeleTableau): number[] {
  return [0, 1, 2, 3].map((i) => i * e.h);
}

function acceptable(e: ExerciceModeleTableau): boolean {
  const ctx = CONTEXTES[e.contexte];
  for (const t of instants(e)) {
    const v = qVal(valeurModele(e, t));
    if (!(v > 0) || v > 2e6) return false;
    if (!estDecimal(v, ctx.decimales)) return false;
    if (ctx.entier && !Number.isInteger(v)) return false;
  }
  const vT = qVal(valeurModele(e, e.T));
  if (!(vT > 0.05) || vT > 5e6) return false;
  // prévision : on évite une valeur pile au milieu de deux arrondis
  const pas = ctx.entier ? 1 : 0.01;
  const frac = (vT / pas) % 1;
  if (Math.abs(frac - 0.5) < 0.02) return false;
  return true;
}

function construire(variante: VarianteModeleTableau, genreImpose?: GenreModele): ExerciceModeleTableau {
  const genre: GenreModele = genreImpose ?? (Math.random() < 0.5 ? "exponentiel" : "lineaire");
  const sens = Math.random() < 0.55 ? "croissance" : "decroissance";
  const indices = CONTEXTES.map((c, i) => [c, i] as const).filter(([c]) => c.sens === sens).map(([, i]) => i);
  const h: 1 | 2 = variante === "pas1" ? 1 : 2;
  for (let essai = 0; ; essai++) {
    const contexte = parmi(indices);
    const b = q(parmi(B));
    const T = h === 1 ? parmi([4, 5, 6]) : parmi([7, 8, 9, 10]);
    let a = q(1);
    let m = q(0);
    if (genre === "exponentiel") a = parmi(sens === "croissance" ? A_CROISSANCE : A_DECROISSANCE);
    // décroissance linéaire : la pente reste petite devant b pour que f(T) soit encore positive
    else m = sens === "croissance" ? qMul(b, parmi(R_LINEAIRE)) : qMul(b, q(-parmi([1, 2, 3]), h === 1 ? 20 : 40));
    const e: ExerciceModeleTableau = { variante, genre, contexte, h, b, a, m, T };
    if (acceptable(e)) return e;
    if (essai > 5000) throw new Error("6gen147 : aucun tirage acceptable");
  }
}

export function construireAvecVariante(id: string): ExerciceModeleTableau {
  return construire(id === "pas2" ? "pas2" : "pas1");
}

/** Pour les mesures : un genre imposé. */
export function construireAvecGenre(id: VarianteModeleTableau, genre: GenreModele): ExerciceModeleTableau {
  return construire(id, genre);
}

export function genererExerciceModeleTableau(): ExerciceModeleTableau {
  return construireAvecVariante(parmi(CATALOGUE_VARIANTES).id);
}
