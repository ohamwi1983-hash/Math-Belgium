import type { ExerciceTiragesArbres } from "../../core6e/tiragesArbres.types";
import { construireFamilleA, genererFamilleA } from "./familleA";
import { construireFamilleB, genererFamilleB } from "./familleB";
import { genererFamilleC, genererFamilleCParite, genererFamilleCSpecial } from "./familleC";
import { construireFamilleD, genererFamilleD } from "./familleD";

/**
 * Couche A (6e) — point d'entrée pour `6gen31`. Tirage ÉQUIPROBABLE de la famille (A, B, C, D),
 * chaque famille tirant ensuite son propre contexte/sous-type en interne.
 */

function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

export function genererExerciceTiragesArbres(): ExerciceTiragesArbres {
  const famille = tirerParmi(["A", "B", "C", "D"] as const);
  if (famille === "A") return genererFamilleA();
  if (famille === "B") return genererFamilleB();
  if (famille === "C") return genererFamilleC();
  return genererFamilleD();
}

/** Identifiants de variante forcée — granularité « ce qui change la structure de la question » ;
 * tout le reste (effectifs, couleurs, question de l'écran 3, nombre de faces, rapport r…) est tiré au
 * hasard À L'INTÉRIEUR de la variante (audit 6e ch. 6 : une variante forcée ne fige plus un tirage).
 * `B-n3-deux` n'est plus proposé (deux positions fixées sur 3 ⟺ tout est bien placé) mais reste
 * accepté pour les plans d'évaluation déjà enregistrés (il donne alors « une position »). */
export type IdVarianteTiragesArbres =
  | "A-avecRemise-k2"
  | "A-avecRemise-k3"
  | "A-sansRemise-k2"
  | "A-sansRemise-k3"
  | "B-n3-une"
  | "B-n3-deux"
  | "B-n4-une"
  | "B-n4-deux"
  | "B-n5-une"
  | "B-n5-deux"
  | "C-special"
  | "C-parite-pair"
  | "C-parite-impair"
  | "C-parite-sousEnsemble"
  | "D-avecRemise"
  | "D-sansRemise";

export const CATALOGUE_VARIANTES: { id: IdVarianteTiragesArbres; label: string }[] = [
  { id: "A-avecRemise-k2", label: "A — 2 tirages avec remise" },
  { id: "A-avecRemise-k3", label: "A — 3 tirages avec remise" },
  { id: "A-sansRemise-k2", label: "A — 2 tirages sans remise" },
  { id: "A-sansRemise-k3", label: "A — 3 tirages sans remise" },
  { id: "B-n3-une", label: "B — 3 objets" },
  { id: "B-n4-une", label: "B — 4 objets, une position donnée" },
  { id: "B-n4-deux", label: "B — 4 objets, deux positions données" },
  { id: "B-n5-une", label: "B — 5 objets, une position donnée" },
  { id: "B-n5-deux", label: "B — 5 objets, deux positions données" },
  { id: "C-special", label: "C — dé truqué, une face connue" },
  { id: "C-parite-pair", label: "C — dé truqué pair/impair, P(pair)" },
  { id: "C-parite-impair", label: "C — dé truqué pair/impair, P(impair)" },
  { id: "C-parite-sousEnsemble", label: "C — dé truqué pair/impair, quelques faces" },
  { id: "D-avecRemise", label: "D — arbre pondéré, avec remise" },
  { id: "D-sansRemise", label: "D — arbre pondéré, sans remise" },
];

export function construireAvecVarianteId(id: IdVarianteTiragesArbres): ExerciceTiragesArbres {
  switch (id) {
    case "A-avecRemise-k2":
      return construireFamilleA(true, 2);
    case "A-avecRemise-k3":
      return construireFamilleA(true, 3);
    case "A-sansRemise-k2":
      return construireFamilleA(false, 2);
    case "A-sansRemise-k3":
      return construireFamilleA(false, 3);
    case "B-n3-une":
    case "B-n3-deux":
      return construireFamilleB(3, "une");
    case "B-n4-une":
      return construireFamilleB(4, "une");
    case "B-n4-deux":
      return construireFamilleB(4, "deux");
    case "B-n5-une":
      return construireFamilleB(5, "une");
    case "B-n5-deux":
      return construireFamilleB(5, "deux");
    case "C-special":
      return genererFamilleCSpecial();
    case "C-parite-pair":
      return genererFamilleCParite("pair");
    case "C-parite-impair":
      return genererFamilleCParite("impair");
    case "C-parite-sousEnsemble":
      return genererFamilleCParite("sousEnsemble");
    case "D-avecRemise":
      return construireFamilleD(true);
    case "D-sansRemise":
      return construireFamilleD(false);
  }
}
