import type { ExerciceDomaineDefinition, FamilleDomaineDefinition } from "../../core5e/domaineDefinition.types";
import { genererExerciceFractionSousRacine } from "./fractionSousRacine";
import { genererExerciceIrrationnelleSimple } from "./irrationnelleSimple";
import { genererExercicePasDeCE } from "./pasDeCE";
import { genererExerciceRacineImpaireDenominateur } from "./racineImpaireDenominateur";
import { genererExerciceRacineSurFraction } from "./racineSurFraction";
import { genererExerciceRationnelle } from "./rationnelle";

export const CATALOGUE_FAMILLES: { id: FamilleDomaineDefinition; label: string }[] = [
  { id: "rationnelle", label: "Rationnelle" },
  { id: "irrationnelleSimple", label: "Irrationnelle simple" },
  { id: "racineSurFraction", label: "Racine sur fraction" },
  { id: "fractionSousRacine", label: "Fraction sous racine (bonus)" },
  { id: "pasDeCE", label: "Pas de CE" },
  { id: "racineImpaireDenominateur", label: "Racine impaire au dénominateur" },
];

const CONSTRUCTEURS: Record<FamilleDomaineDefinition, () => ExerciceDomaineDefinition> = {
  rationnelle: genererExerciceRationnelle,
  irrationnelleSimple: genererExerciceIrrationnelleSimple,
  racineSurFraction: genererExerciceRacineSurFraction,
  fractionSousRacine: genererExerciceFractionSousRacine,
  pasDeCE: genererExercicePasDeCE,
  racineImpaireDenominateur: genererExerciceRacineImpaireDenominateur,
};

export function construireAvecFamilleId(familleId: FamilleDomaineDefinition): ExerciceDomaineDefinition {
  return CONSTRUCTEURS[familleId]();
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
  for (const { id } of CATALOGUE_FAMILLES) {
    tirage -= POIDS[id];
    if (tirage < 0) return id;
  }
  return CATALOGUE_FAMILLES[CATALOGUE_FAMILLES.length - 1].id;
}

export function genererExerciceDomaineDefinition(): ExerciceDomaineDefinition {
  return construireAvecFamilleId(tirerFamillePonderee());
}
