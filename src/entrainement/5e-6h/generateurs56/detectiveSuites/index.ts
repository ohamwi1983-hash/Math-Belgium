// Copie 5e (6h) de `5e-4h/generateurs5e/detectiveSuites/index.ts` (56gen10 ← 5gen49, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import type { FractionQ } from "../../../5e-4h/core5e/suitesGeometriques.types";
import type {
  DonneesDetectiveSuites,
  ExerciceArithmetique,
  ExerciceDetectiveSuites,
  ExerciceGeometrique,
  ExerciceLimite,
  ExercicePourcentage,
  ExerciceSommeInfinie,
  IdDescriptionSuites,
  VarianteDetectiveSuites,
} from "./core/detectiveSuites.types";
import { fractionQ } from "../../../5e-4h/moteur5e/fractionQ";
import { CONTEXTES_POURCENTAGE, calculArithmetique, descriptionCorrecte, memesResultats, resultat } from "./moteur/modeleDetectiveSuites";

/**
 * Générateur de 5gen49 « Détective d'erreurs : suites ». Tout le hasard passe par `Math.random` :
 * `genererAvecCode` (`export/codeExercice.ts`) le remplace par une graine, et le QR code d'une
 * feuille rouvre ainsi le MÊME exercice (données, ordre des descriptions).
 *
 * Variante = exercice support. Dans chaque variante, le TYPE D'ERREUR (donc la ligne fausse) est
 * tiré uniformément AVANT les nombres et avant toute boucle de rejet : c'est le verdict des écrans
 * a) et b), jamais fixé par `forme` ni par le mode de calcul.
 * - arithmetique : rangFormule (ligne 1) | nombreTermes (ligne 3) ;
 * - geometrique : raisonInversee (ligne 1) | exposant (ligne 2) | nombreTermes (ligne 3) ;
 * - pourcentage : taux (ligne 1) | nombreTermes — rang d'une année (ligne 2) | exposant (ligne 3) ;
 *   mode exact / calculatrice tiré à pile ou face, INDÉPENDAMMENT du type (leçon de 5gen47) ;
 * - convergence : raisonInversee — somme infinie (ligne 1) | sommeInfinie — |q| ≥ 1 (ligne 2) |
 *   puissance — limite de P(n)/Q(n) (ligne 2).
 *
 * Garanties (vérifiées par tirages massifs) : valeurs exactes (entiers, fractions) hors mode
 * calculatrice ; l'erreur se VOIT (le résultat final de la copie diffère du bon résultat).
 */

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

function melanger<T>(liste: T[]): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j]!, copie[i]!];
  }
  return copie;
}

const signe = () => (Math.random() < 0.5 ? -1 : 1);

// ---------------------------------------------------------------------------------------------
// Tirage des nombres, type d'erreur déjà fixé
// ---------------------------------------------------------------------------------------------

function tirerArithmetique(type: ExerciceArithmetique["type"]): ExerciceArithmetique {
  for (;;) {
    const r = choisir([-7, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 7, 8, 9]);
    const u1 = choisir([-15, -12, -9, -8, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 18, 20, 23, 25, 30]);
    const p = entier(3, 9);
    const N = entier(8, 20);
    const e: ExerciceArithmetique = { variante: "arithmetique", type, u1, r, p, m: p + N - 1 };
    const c = calculArithmetique(e, false);
    if (c.up + c.um === 0) continue;
    if (memesResultats(resultat(e, true), resultat(e, false))) continue;
    return e;
  }
}

/** Raisons de la variante géométrique et puissance de 2 nécessaire pour des termes entiers. */
const RAISONS_GEOMETRIQUES: FractionQ[] = [fractionQ(2, 1), fractionQ(-2, 1), fractionQ(3, 1), fractionQ(1, 2), fractionQ(-1, 2)];

function tirerGeometrique(type: ExerciceGeometrique["type"]): ExerciceGeometrique {
  for (;;) {
    const q = choisir(RAISONS_GEOMETRIQUES);
    const p = entier(3, 4);
    const N = q.num === 3 ? entier(4, 5) : entier(4, 6);
    const m = p + N - 1;
    // Raison 1/2 ou −1/2 : u₁ multiple de 2^(p + N − 2), pour des termes et une somme entiers.
    const u1 = q.den === 1 ? signe() * entier(1, 5) : signe() * 2 ** (p + N - 2) * choisir([1, 1, 3]);
    if (type === "raisonInversee" && q.den === 2 && m > 8) continue;
    const e: ExerciceGeometrique = { variante: "geometrique", type, u1, q, p, m };
    if (memesResultats(resultat(e, true), resultat(e, false))) continue;
    return e;
  }
}

/** Mode exact : pourcentage → dénominateur de q (u₁ multiple de den^rang : termes entiers). */
const POURCENTAGES_EXACTS: { t: number; den: number }[] = [
  { t: 50, den: 2 },
  { t: 25, den: 4 },
  { t: 20, den: 5 },
  { t: -25, den: 4 },
  { t: -20, den: 5 },
];
const HAUSSES_CALCUL = [1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 8];
const BAISSES_CALCUL = [2, 3, 4, 5, 6, 8, 10, 12, 15];

function tirerPourcentage(type: ExercicePourcentage["type"]): ExercicePourcentage {
  // Mode tiré à pile ou face, indépendamment du type d'erreur.
  const mode: ExercicePourcentage["mode"] = Math.random() < 0.5 ? "exact" : "calcul";
  for (;;) {
    const contexte = entier(0, CONTEXTES_POURCENTAGE.length - 1);
    const ctx = CONTEXTES_POURCENTAGE[contexte]!;
    const sens = choisir(ctx.sens);
    const annee1 = entier(2014, 2022);
    let t: number;
    let rang: number;
    let u1: number;
    if (mode === "exact") {
      const choix = POURCENTAGES_EXACTS.filter((x) => (sens === "hausse" ? x.t > 0 : x.t < 0));
      const pc = choisir(choix);
      t = pc.t;
      rang = pc.den === 2 ? entier(3, 7) : entier(3, 5);
      const base = pc.den ** rang;
      const multiples = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 24, 30, 40, 50].filter((k) => base * k >= 300 && base * k <= 60000);
      if (multiples.length === 0) continue;
      u1 = base * choisir(multiples);
    } else {
      t = sens === "hausse" ? choisir(HAUSSES_CALCUL) : -choisir(BAISSES_CALCUL);
      rang = entier(5, 12);
      u1 = ctx.unite === "€" ? 500 * entier(30, 90) : choisir([100, 1000]) * entier(12, 95);
    }
    const e: ExercicePourcentage = { variante: "pourcentage", type, contexte, mode, u1, t, annee1, rang };
    if (memesResultats(resultat(e, true), resultat(e, false))) continue;
    return e;
  }
}

const RAISONS_CONVERGENTES: FractionQ[] = [
  [1, 2],
  [1, 3],
  [1, 4],
  [2, 3],
  [3, 4],
  [-1, 2],
  [-1, 3],
  [-2, 3],
  [2, 5],
  [3, 5],
].map(([a, b]) => fractionQ(a!, b!));
const RAISONS_DIVERGENTES: FractionQ[] = [
  [2, 1],
  [3, 1],
  [-2, 1],
  [-3, 1],
  [3, 2],
  [-3, 2],
  [4, 3],
  [5, 2],
].map(([a, b]) => fractionQ(a!, b!));
/** |q| ≥ 1 avec q < 1 : la copie lit « q < 1 » au lieu de « |q| < 1 ». */
const RAISONS_NEGATIVES: FractionQ[] = [
  [-1, 1],
  [-2, 1],
  [-3, 1],
  [-3, 2],
  [-5, 2],
  [-4, 3],
  [-5, 4],
].map(([a, b]) => fractionQ(a!, b!));

function tirerSommeInfinie(type: ExerciceSommeInfinie["type"]): ExerciceSommeInfinie {
  for (;;) {
    const q = type === "sommeInfinie" ? choisir(RAISONS_NEGATIVES) : Math.random() < 2 / 3 ? choisir(RAISONS_CONVERGENTES) : choisir(RAISONS_DIVERGENTES);
    // u₁ multiple de den² : u₂ et u₃ entiers.
    const k = choisir([1, 2, 3, 4, 5]);
    const u1 = (Math.random() < 0.8 ? 1 : -1) * q.den * q.den * k;
    if (Math.abs(u1) > 150) continue;
    const e: ExerciceSommeInfinie = { variante: "convergence", support: "sommeInfinie", type, u1, q };
    if (memesResultats(resultat(e, true), resultat(e, false))) continue;
    return e;
  }
}

const DEGRES_LIMITE: [number, number][] = [
  [1, 2],
  [2, 3],
  [2, 1],
  [3, 2],
];

function tirerLimite(): ExerciceLimite {
  for (;;) {
    const [dp, dq] = choisir(DEGRES_LIMITE);
    const P = [(Math.random() < 0.7 ? 1 : -1) * entier(1, 7), ...Array.from({ length: dp }, () => entier(-9, 9))];
    const Q = [entier(1, 6), ...Array.from({ length: dq }, () => entier(-6, 9))];
    if (P[P.length - 1] === 0 || Q[Q.length - 1] === 0) continue;
    if (P[0] === Q[0]) continue;
    let positif = true;
    for (let n = 1; n <= 200 && positif; n++) positif = Q.reduce((acc, c) => acc * n + c, 0) > 0;
    if (!positif) continue;
    return { variante: "convergence", support: "limite", type: "puissance", P, Q };
  }
}

// ---------------------------------------------------------------------------------------------
// Descriptions de l'écran 2 : la bonne + 3 leurres (toujours FAUX pour cette ligne)
// ---------------------------------------------------------------------------------------------

export const LEURRES: Record<"rangFormule" | "nombreTermes" | "rangAnnee" | "exposant" | "sommeInfinie" | "taux" | "puissance" | "raisonInversee", IdDescriptionSuites[]> = {
  rangFormule: ["formuleGeometrique", "raisonRetranchee", "premierTermeOublie"],
  nombreTermes: ["termesDernierRang", "termesSansExtremites", "termesDiviserRaison"],
  rangAnnee: ["rangSansExtremites", "rangAnneeBrute", "rangDouble"],
  exposant: ["exposantProduit", "exposantAddition", "exposantPlusUn"],
  sommeInfinie: ["sommeFormulePlus", "sommeFormuleQMoinsUn", "sommeToujours"],
  taux: ["tauxEntier", "tauxArithmetique", "tauxSensInverse"],
  puissance: ["puissanceN", "puissanceVersUn", "puissanceNumerateurSeul"],
  raisonInversee: ["raisonDifference", "raisonProduit", "raisonTaux"],
};

function avecOptions(d: DonneesDetectiveSuites): ExerciceDetectiveSuites {
  const bonne = descriptionCorrecte(d) as keyof typeof LEURRES;
  return { ...d, options: melanger([bonne, ...LEURRES[bonne]]) };
}

// ---------------------------------------------------------------------------------------------
// Catalogue de variantes (SelecteurVarianteDev, `?code=`, adaptateur de feuilles)
// ---------------------------------------------------------------------------------------------

export const CATALOGUE_VARIANTES: { id: VarianteDetectiveSuites; label: string }[] = [
  { id: "arithmetique", label: "Suite arithmétique : somme de termes" },
  { id: "geometrique", label: "Suite géométrique : raison, terme, somme" },
  { id: "pourcentage", label: "Évolution en pourcentage (contexte)" },
  { id: "convergence", label: "Somme infinie ou limite de P(n)/Q(n)" },
];

export function genererDetectiveSuites(variante: VarianteDetectiveSuites): ExerciceDetectiveSuites {
  switch (variante) {
    case "arithmetique":
      return avecOptions(tirerArithmetique(choisir(["rangFormule", "nombreTermes"] as const)));
    case "geometrique":
      return avecOptions(tirerGeometrique(choisir(["raisonInversee", "exposant", "nombreTermes"] as const)));
    case "pourcentage":
      return avecOptions(tirerPourcentage(choisir(["taux", "nombreTermes", "exposant"] as const)));
    case "convergence": {
      const type = choisir(["raisonInversee", "sommeInfinie", "puissance"] as const);
      return avecOptions(type === "puissance" ? tirerLimite() : tirerSommeInfinie(type));
    }
  }
}

export function construireAvecVariante(id: string): ExerciceDetectiveSuites {
  if (!CATALOGUE_VARIANTES.some((v) => v.id === id)) return genererExerciceDetectiveSuites();
  return genererDetectiveSuites(id as VarianteDetectiveSuites);
}

/** Tirage libre : une variante au hasard. */
export function genererExerciceDetectiveSuites(): ExerciceDetectiveSuites {
  return genererDetectiveSuites(choisir(CATALOGUE_VARIANTES).id);
}
