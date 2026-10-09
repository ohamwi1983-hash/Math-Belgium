import type {
  ExerciceDetermParamA_Ordonnee,
  ExerciceDetermParamA_Point,
  ExerciceDetermParamB,
  ExerciceDetermParamC,
  ExerciceDeterminerParametresLogarithme,
} from "../../core6e/determinerParametresLogarithme.types";

/**
 * Couche A (6e) — génération pour `6gen18` ("Déterminer des paramètres depuis des conditions
 * graphiques", chapitre 3). Tirage à 2 niveaux (spec) : d'abord la FAMILLE (A/B/C, équiprobable),
 * puis, pour la famille A seulement, le SOUS-TYPE (ordonnée à l'origine / point de passage,
 * équiprobable) — `CATALOGUE_VARIANTES` a donc 4 entrées (2 pour A) mais `genererExerciceXxx` ne
 * tire PAS uniformément parmi ces 4 entrées (ça biaiserait la famille A à 50 %, contrairement à la
 * spec) : la famille est tirée en premier, le sous-type de A ensuite.
 *
 * **Convention retenue pour la famille A, sous-type "ordonnée à l'origine"** (résout une ambiguïté
 * du prompt source) : la spec donne littéralement l'équation "n=k" pour traduire "l'ordonnée à
 * l'origine = k" — au sens strict, l'ordonnée à l'origine de f(x)=ln(mx+n) serait f(0)=ln(n)=k
 * (donc n=e^k), mais la spec fournit l'équation cible EXPLICITEMENT ("Ordonnée à l'origine : n=k")
 * et l'utilise ensuite telle quelle dans le système à résoudre à l'écran 2 — je suis donc la lettre
 * de la spec (n=k, "ordonnée à l'origine" désignant ici la valeur en x=0 de l'ARGUMENT mx+n, pas de
 * f elle-même) plutôt que la lecture usuelle du terme, pour rester fidèle à l'équation donnée et
 * conserver des valeurs `m` simples (rationnelles, jamais un `e^k` qui aurait cassé la convention
 * "fraction irréductible, jamais de décimal" pour une valeur affichée).
 */

function tirerEntier(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

const K_ORDONNEE = [-2, -1, 1, 2, 3] as const;

function construireFamilleA_Ordonnee(): ExerciceDetermParamA_Ordonnee {
  const x0 = tirerEntier(2, 8);
  const k = tirerParmi(K_ORDONNEE);
  const n = k;
  const m = -n / x0;
  return { famille: "A", sousType: "ordonnee", x0, k, m, n };
}

function construireFamilleA_Point(): ExerciceDetermParamA_Point {
  const x0 = tirerEntier(2, 8);
  let x1: number;
  do {
    x1 = tirerEntier(1, 10);
  } while (x1 === x0);
  const k1 = tirerEntier(2, 10);
  // Système {m·x0+n=0, m·x1+n=ln(k1)} — soustraction membre à membre : m·(x1-x0)=ln(k1).
  const m = Math.log(k1) / (x1 - x0);
  const n = -m * x0;
  return { famille: "A", sousType: "point", x0, x1, k1, m, n };
}

/** r1<r2 dans {2,...,10}, avec un écart d'AU MOINS 2 (garantit l'existence d'un entier x1
 * strictement entre les deux, spec explicite "cohérent avec le domaine"). */
function construireFamilleB(): ExerciceDetermParamB {
  const r1 = tirerEntier(2, 8);
  const ecart = tirerEntier(2, 10 - r1);
  const r2 = r1 + ecart;
  const x1 = tirerEntier(r1 + 1, r2 - 1);
  const k1 = tirerEntier(2, 10);
  // px²+qx+r = p(x-r1)(x-r2) = p·x² - p(r1+r2)·x + p·r1·r2 → q=-p(r1+r2), r=p·r1·r2.
  // Point de passage : p·x1²+q·x1+r = p·(x1-r1)(x1-r2) = ln(k1).
  const p = Math.log(k1) / ((x1 - r1) * (x1 - r2));
  const q = -p * (r1 + r2);
  const r = p * r1 * r2;
  return { famille: "B", r1, r2, x1, k1, p, q, r };
}

function construireFamilleC(): ExerciceDetermParamC {
  const x0 = tirerEntier(2, 8);
  const typeExtremum = tirerParmi(["maximum", "minimum"] as const);
  return { famille: "C", x0, typeExtremum };
}

export type IdVarianteDeterminerParametresLogarithme = "A_ordonnee" | "A_point" | "B" | "C";

/** Catalogue de variantes `{id,label}` + `construireAvecVarianteId` — convention permanente. 4
 * entrées : une par famille, plus une pour le 2e sous-type de la famille A (spec, point 6 des
 * clarifications). */
export const CATALOGUE_VARIANTES: { id: IdVarianteDeterminerParametresLogarithme; label: string }[] = [
  { id: "A_ordonnee", label: "A — Asymptote + ordonnée à l'origine" },
  { id: "A_point", label: "A — Asymptote + point de passage" },
  { id: "B", label: "B — 2 racines + point de passage" },
  { id: "C", label: "C — Conditions pour un extremum" },
];

export function construireAvecVarianteId(id: IdVarianteDeterminerParametresLogarithme): ExerciceDeterminerParametresLogarithme {
  switch (id) {
    case "A_ordonnee":
      return construireFamilleA_Ordonnee();
    case "A_point":
      return construireFamilleA_Point();
    case "B":
      return construireFamilleB();
    case "C":
      return construireFamilleC();
  }
}

/** Tirage à 2 niveaux : famille (A/B/C) ÉQUIPROBABLE en premier (spec explicite), puis sous-type de
 * A ÉQUIPROBABLE ensuite — jamais un tirage uniforme direct parmi les 4 entrées de
 * `CATALOGUE_VARIANTES`, qui biaiserait la famille A. */
export function genererExerciceDeterminerParametresLogarithme(): ExerciceDeterminerParametresLogarithme {
  const famille = tirerParmi(["A", "B", "C"] as const);
  if (famille === "A") return construireAvecVarianteId(tirerParmi(["A_ordonnee", "A_point"] as const));
  if (famille === "B") return construireAvecVarianteId("B");
  return construireAvecVarianteId("C");
}
