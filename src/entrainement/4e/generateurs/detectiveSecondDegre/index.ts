import type {
  DonneesDetectiveSecondDegre,
  ExerciceDetectiveSecondDegre,
  IdDescriptionSecondDegre,
  SymboleInegalite,
  TypeErreurSecondDegre,
  VarianteDetectiveSecondDegre,
} from "../../core/detectiveSecondDegre.types";
import { estCarreParfait } from "../../moteur/modeleDetectiveSecondDegre";

/**
 * Générateur de gen121 « Détective d'erreurs : second degré ». Tout le hasard passe par
 * `Math.random` : `genererAvecCode` (`export/codeExercice.ts`) le remplace par une graine, et le QR
 * code d'une feuille rouvre ainsi le MÊME exercice (données, ordre des descriptions).
 *
 * Variante = exercice support. Dans chaque variante, le TYPE D'ERREUR (donc la ligne fausse) est
 * tiré uniformément AVANT les nombres et avant toute boucle de rejet : c'est le verdict des écrans
 * a) et b), jamais fixé par `forme`. Les contraintes sur les données sont les MÊMES pour les deux
 * types d'une variante (aucun détail des nombres ne trahit le verdict) et garantissent que chaque
 * erreur possible change l'ensemble-solution :
 * - discriminant : carreNegatif (ligne 1) | moinsB (ligne 3) — b < 0, Δ carré parfait, −b² − 4ac > 0 ;
 * - miseEnEvidence : divisionFacteur (ligne 1) | signesRacines (ligne 4) ;
 * - sansSolution : signe4ac (ligne 1) | deltaNegatifUneSolution (ligne 2) — b² + 4ac carré parfait ;
 * - inequation : sensNonInverse (ligne 1) | signeEntre (ligne 4) ;
 * - rationnelle : ceFausse (ligne 1) | racineEtrangere (ligne 6) ;
 * - inequationRationnelle : produitEnCroix (ligne 2) | valeurCEIncluse (ligne 5) — symbole large.
 */

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function nonNul(min: number, max: number): number {
  for (;;) {
    const v = entier(min, max);
    if (v !== 0) return v;
  }
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

function pgcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : pgcd(b, a % b);
}

export const TYPES_PAR_VARIANTE: Record<VarianteDetectiveSecondDegre, readonly TypeErreurSecondDegre[]> = {
  discriminant: ["carreNegatif", "moinsB"],
  miseEnEvidence: ["divisionFacteur", "signesRacines"],
  sansSolution: ["signe4ac", "deltaNegatifUneSolution"],
  inequation: ["sensNonInverse", "signeEntre"],
  rationnelle: ["ceFausse", "racineEtrangere"],
  inequationRationnelle: ["produitEnCroix", "valeurCEIncluse"],
};

/** Racine (−b ± s)/(2a) de dénominateur réduit au plus 4. */
function racineSimple(nb: number, d: number): boolean {
  const g = pgcd(Math.abs(nb), Math.abs(d)) || 1;
  return Math.abs(d / g) <= 4;
}

function tirer(variante: VarianteDetectiveSecondDegre, type: TypeErreurSecondDegre): DonneesDetectiveSecondDegre {
  for (;;) {
    switch (variante) {
      case "discriminant": {
        const a = entier(1, 4);
        const b = entier(-11, -1);
        const c = entier(-30, -1);
        const delta = b * b - 4 * a * c;
        if (pgcd(pgcd(a, b), c) !== 1 || !estCarreParfait(delta) || -b * b - 4 * a * c <= 0) continue;
        const s = Math.round(Math.sqrt(delta));
        if (!racineSimple(-b - s, 2 * a) || !racineSimple(-b + s, 2 * a)) continue;
        return { variante, type: type as "carreNegatif" | "moinsB", a, b, c };
      }
      case "miseEnEvidence": {
        const forme = choisir(["x", "facteur"] as const);
        if (forme === "x") {
          const k = nonNul(-5, 5);
          const r = nonNul(-6, 6);
          if (Math.abs(k) === 1 && Math.abs(r) === 1) continue;
          return { variante, type: type as "divisionFacteur" | "signesRacines", forme, k, m: k * r, p: 0 };
        }
        const p = nonNul(-6, 6);
        const m = nonNul(-6, 6);
        if (m === 2 * p || m === p) continue;
        return { variante, type: type as "divisionFacteur" | "signesRacines", forme, k: 1, m, p };
      }
      case "sansSolution": {
        const a = entier(1, 4);
        const b = nonNul(-9, 9);
        const c = entier(1, 12);
        if (pgcd(pgcd(a, b), c) !== 1 || b * b - 4 * a * c >= 0 || !estCarreParfait(b * b + 4 * a * c)) continue;
        return { variante, type: type as "signe4ac" | "deltaNegatifUneSolution", a, b, c };
      }
      case "inequation": {
        const k = entier(-5, -2);
        const r1 = nonNul(-6, 6);
        const r2 = nonNul(-6, 6);
        if (r1 >= r2 || r1 + r2 === 0) continue;
        const symbole = choisir(["<", ">", "≤", "≥"] as const satisfies readonly SymboleInegalite[]);
        return { variante, type: type as "sensNonInverse" | "signeEntre", k, r1, r2, symbole };
      }
      case "rationnelle": {
        const p = nonNul(-6, 6);
        const r = nonNul(-8, 8);
        if (r === p || r === -p) continue;
        return { variante, type: type as "ceFausse" | "racineEtrangere", p, r };
      }
      case "inequationRationnelle": {
        const z = entier(-6, 6);
        const p = entier(-6, 6);
        if (z === p) continue;
        return { variante, type: type as "produitEnCroix" | "valeurCEIncluse", z, p, symbole: choisir(["≤", "≥"] as const) };
      }
    }
  }
}

// ---------------------------------------------------------------------------------------------
// Descriptions de l'écran 2 : la bonne + 3 leurres (toujours FAUX pour cette ligne)
// ---------------------------------------------------------------------------------------------

export const LEURRES: Record<TypeErreurSecondDegre, IdDescriptionSecondDegre[]> = {
  carreNegatif: ["leurre4ac", "leurreDeltaPlus", "leurreSigneC"],
  moinsB: ["leurreDenominateurA", "leurreRacineDenominateur", "leurreSansRacine"],
  divisionFacteur: ["leurreMiseEnEvidence", "leurreDevelopper", "leurreDiviserCoefficient"],
  signesRacines: ["leurreDeuxFacteursNuls", "leurreSolutionManquante", "leurreMiseEnEvidence"],
  signe4ac: ["leurreCarre", "leurreDeuxOpposees", "leurreDenominateurA"],
  deltaNegatifUneSolution: ["leurreDeuxOpposees", "leurreDeltaFaux", "leurreDoubleSigne"],
  sensNonInverse: ["leurrePasDiviser", "leurreCoefficientsDivision", "leurreDiviserPositif"],
  signeEntre: ["leurreRacinesFausses", "leurreSigneA", "leurreToujoursSigneA"],
  ceFausse: ["leurrePasDeCE", "leurreCENumerateur", "leurreCEZero"],
  racineEtrangere: ["leurreCEFausse", "leurreDeltaFaux", "leurreMultiplication"],
  produitEnCroix: ["leurreCEFausse", "leurreToujoursChanger", "leurreNumerateur"],
  valeurCEIncluse: ["leurreZeroExclu", "leurreTableauFaux", "leurreCEFausse"],
};

function avecOptions(d: DonneesDetectiveSecondDegre): ExerciceDetectiveSecondDegre {
  return { ...d, options: melanger([d.type, ...LEURRES[d.type]]) };
}

// ---------------------------------------------------------------------------------------------
// Catalogue de variantes (SelecteurVarianteDev, `?code=`, adaptateur de feuilles)
// ---------------------------------------------------------------------------------------------

export const CATALOGUE_VARIANTES: { id: VarianteDetectiveSecondDegre; label: string }[] = [
  { id: "discriminant", label: "Équation : discriminant et formule des racines" },
  { id: "miseEnEvidence", label: "Équation : facteur commun et produit nul" },
  { id: "sansSolution", label: "Équation sans solution (Δ < 0)" },
  { id: "inequation", label: "Inéquation du second degré" },
  { id: "rationnelle", label: "Équation rationnelle (condition d'existence)" },
  { id: "inequationRationnelle", label: "Inéquation rationnelle (signe d'un quotient)" },
];

export function genererDetectiveSecondDegre(variante: VarianteDetectiveSecondDegre): ExerciceDetectiveSecondDegre {
  const type = choisir(TYPES_PAR_VARIANTE[variante]);
  return avecOptions(tirer(variante, type));
}

export function construireAvecVariante(id: string): ExerciceDetectiveSecondDegre {
  if (!CATALOGUE_VARIANTES.some((v) => v.id === id)) return genererExerciceDetectiveSecondDegre();
  return genererDetectiveSecondDegre(id as VarianteDetectiveSecondDegre);
}

/** Tirage libre : une variante au hasard. */
export function genererExerciceDetectiveSecondDegre(): ExerciceDetectiveSecondDegre {
  return genererDetectiveSecondDegre(choisir(CATALOGUE_VARIANTES).id);
}
