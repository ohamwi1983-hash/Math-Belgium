import type { ExerciceDomaineDefinition, FamilleDomaineDefinition } from "../../core5e/domaineDefinition.types";
import { genererExerciceFractionSousRacine } from "./fractionSousRacine";
import { construireIrrationnelleSimple, genererExerciceIrrationnelleSimple } from "./irrationnelleSimple";
import { genererExercicePasDeCE } from "./pasDeCE";
import { construireRacineImpaireDenominateur, genererExerciceRacineImpaireDenominateur } from "./racineImpaireDenominateur";
import { construireRacineSurFraction, genererExerciceRacineSurFraction } from "./racineSurFraction";
import { construireRationnelleAvecSousCas, genererExerciceRationnelle } from "./rationnelle";

/** Les 6 familles du tirage pondéré (voir `POIDS`). */
const FAMILLES: FamilleDomaineDefinition[] = ["rationnelle", "irrationnelleSimple", "racineSurFraction", "fractionSousRacine", "pasDeCE", "racineImpaireDenominateur"];

/** Catalogue du sélecteur de variante : les 6 familles, puis des SOUS-CAS forçables (audit 5e
 * ch. 1, point 10 — données seulement, composant du sélecteur inchangé). Les sous-cas ne changent
 * pas le tirage libre, qui reste pondéré par famille. */
export const CATALOGUE_FAMILLES: { id: string; label: string }[] = [
  { id: "rationnelle", label: "Rationnelle" },
  { id: "irrationnelleSimple", label: "Irrationnelle simple" },
  { id: "racineSurFraction", label: "Racine sur fraction" },
  { id: "fractionSousRacine", label: "Fraction sous racine (bonus)" },
  { id: "pasDeCE", label: "Pas de CE" },
  { id: "racineImpaireDenominateur", label: "Racine impaire au dénominateur" },
  { id: "rationnelle-jamaisNul", label: "Rationnelle — dénominateur jamais nul" },
  { id: "irrationnelle-coefNegatif", label: "Irrationnelle — coefficient négatif (sens inversé)" },
  { id: "racineSurFraction-strict", label: "Racine sur fraction — N/√D (condition stricte)" },
  { id: "racineSurFraction-exclusionDedans", label: "Racine sur fraction — √N/D, exclusion dans l'intervalle" },
  { id: "racineImpaire-deltaNegatif", label: "Racine impaire — Δ < 0 (dénominateur jamais nul)" },
];

const SOUS_CAS: Record<string, () => ExerciceDomaineDefinition> = {
  "rationnelle-jamaisNul": () => construireRationnelleAvecSousCas("vacuous"),
  "irrationnelle-coefNegatif": () => construireIrrationnelleSimple(false, -1),
  "racineSurFraction-strict": () => construireRacineSurFraction("nSurRacineD", Math.random() < 0.5, false),
  "racineSurFraction-exclusionDedans": () => construireRacineSurFraction("racineSurD", Math.random() < 0.5, true),
  "racineImpaire-deltaNegatif": () => construireRacineImpaireDenominateur(2, ([0, 1, 2] as const)[Math.floor(Math.random() * 3)], "discriminantNegatif"),
};

const CONSTRUCTEURS: Record<FamilleDomaineDefinition, () => ExerciceDomaineDefinition> = {
  rationnelle: genererExerciceRationnelle,
  irrationnelleSimple: genererExerciceIrrationnelleSimple,
  racineSurFraction: genererExerciceRacineSurFraction,
  fractionSousRacine: genererExerciceFractionSousRacine,
  pasDeCE: genererExercicePasDeCE,
  racineImpaireDenominateur: genererExerciceRacineImpaireDenominateur,
};

export function construireAvecFamilleId(familleId: string): ExerciceDomaineDefinition {
  const sousCas = SOUS_CAS[familleId];
  if (sousCas) return sousCas();
  return CONSTRUCTEURS[familleId as FamilleDomaineDefinition]();
}

/**
 * Tirage pondéré, PAS uniforme (consigne explicite de la spec) : la famille 4 ("bonus" dans la
 * spec) est tirée nettement moins souvent, la famille 5 un peu moins que les 4 familles "cœur du
 * programme". Poids proposés faute de chiffres précis fournis par la spec, documentés ici pour
 * pouvoir être ajustés facilement.
 */
const POIDS: Record<FamilleDomaineDefinition, number> = {
  rationnelle: 20,
  irrationnelleSimple: 18,
  racineSurFraction: 18,
  fractionSousRacine: 8,
  pasDeCE: 16,
  racineImpaireDenominateur: 20,
};

const POIDS_TOTAL = Object.values(POIDS).reduce((s, p) => s + p, 0);

export function tirerFamillePonderee(): FamilleDomaineDefinition {
  let tirage = Math.random() * POIDS_TOTAL;
  for (const id of FAMILLES) {
    tirage -= POIDS[id];
    if (tirage < 0) return id;
  }
  return FAMILLES[FAMILLES.length - 1];
}

export function genererExerciceDomaineDefinition(): ExerciceDomaineDefinition {
  return construireAvecFamilleId(tirerFamillePonderee());
}
