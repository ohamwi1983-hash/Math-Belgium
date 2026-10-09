import type { ExerciceProprieteLogarithme, ExposantLog, SousTypeCompose, TypeProprieteLog } from "../../core6e/proprietesLogarithme.types";

/**
 * Couche A (6e) — génération pour `6gen13` ("Propriétés du logarithme", chapitre 3). Une SEULE
 * famille : le tirage choisit un TYPE de question (banque à 5 entrées ÉQUIPROBABLES, spec) — jamais
 * un nombre d'écrans variable (voir `moteur6e/typesProprietesLogarithme.ts`, 2 écrans fixes).
 */

function tirerDecimal(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 1000) / 1000;
}

function tirerEntier(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

const EXPOSANTS: readonly ExposantLog[] = [2, 3, 4];
const SOUS_TYPES_COMPOSE: readonly SousTypeCompose[] = ["racineQuotient", "puissanceProduit"];

/** Catalogue de variantes `{id,label}` + `construireAvecVarianteId` — convention permanente. UNE
 * SEULE entrée "compose" (pas 2) : le sous-type (racine∘quotient / puissance∘produit) est tiré à
 * l'intérieur, jamais exposé comme variante séparée (spec : "composé (2 opérations)", une seule
 * catégorie de la banque). */
export const CATALOGUE_VARIANTES: { id: TypeProprieteLog; label: string }[] = [
  { id: "produit", label: "Produit — log_a(M·N)" },
  { id: "quotient", label: "Quotient — log_a(M/N)" },
  { id: "puissance", label: "Puissance — log_a(M^p)" },
  { id: "racine", label: "Racine — log_a(ᵏ√N)" },
  { id: "compose", label: "Composé — 2 propriétés" },
];

/** `m`,`n` : décimaux à 3 décimales dans [1,000 ; 9,999] (spec), tirés INDÉPENDAMMENT — leur valeur
 * réelle sert de "vraies" valeurs de log_a(M)/log_a(N) pour l'écran 2. `M`,`N` : entiers
 * d'AFFICHAGE dans [2 ; 999], sans aucune incidence sur le calcul. */
function construireBase(): { m: number; n: number; M: number; N: number } {
  return { m: tirerDecimal(1, 9.999), n: tirerDecimal(1, 9.999), M: tirerEntier(2, 999), N: tirerEntier(2, 999) };
}

export function construireAvecVarianteId(type: TypeProprieteLog): ExerciceProprieteLogarithme {
  const base = construireBase();
  switch (type) {
    case "produit":
      return { ...base, type: "produit" };
    case "quotient":
      return { ...base, type: "quotient" };
    case "puissance":
      return { ...base, type: "puissance", p: tirerParmi(EXPOSANTS) };
    case "racine":
      return { ...base, type: "racine", k: tirerParmi(EXPOSANTS) };
    case "compose": {
      const sousType = tirerParmi(SOUS_TYPES_COMPOSE);
      return sousType === "racineQuotient" ? { ...base, type: "compose", sousType, k: tirerParmi(EXPOSANTS) } : { ...base, type: "compose", sousType, p: tirerParmi(EXPOSANTS) };
    }
  }
}

/** Tirage ÉQUIPROBABLE parmi les 5 types de question (spec explicite, "banque de combinaisons"). */
export function genererExerciceProprietesLogarithme(): ExerciceProprieteLogarithme {
  return construireAvecVarianteId(tirerParmi(CATALOGUE_VARIANTES).id);
}
