import type { ExerciceTiragesArbres } from "../../core6e/tiragesArbres.types";
import { construireFamilleA, genererFamilleA } from "./familleA";
import { construireFamilleB, genererFamilleB } from "./familleB";
import { construireFamilleCParite, construireFamilleCSpecial, genererFamilleC } from "./familleC";

/**
 * Couche A (6e) — point d'entrée pour `6gen31`. Tirage ÉQUIPROBABLE de la famille (A/B/C, spec :
 * "Tirage aléatoire d'1 famille parmi 3 (A, B, C, équiprobable)"), chaque famille tirant ensuite son
 * propre contexte/sous-type en interne (voir `familleA.ts`/`familleB.ts`/`familleC.ts`).
 */

function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

export function genererExerciceTiragesArbres(): ExerciceTiragesArbres {
  const famille = tirerParmi(["A", "B", "C"] as const);
  if (famille === "A") return genererFamilleA();
  if (famille === "B") return genererFamilleB();
  return genererFamilleC();
}

/** Identifiants de variante forcée — granularité "ce qui change la structure de la question",
 * jamais un identifiant par tirage numérique individuel (même convention que 6gen30, voir
 * `generateurs6e/probabilitesEnsembles/index.ts`).
 * Famille A : croise `avecRemise` (2 valeurs) et `k` (2 valeurs) = 4 entrées.
 * Famille B : croise `n` (3 valeurs) et `demandeEcran1` (2 valeurs) = 6 entrées.
 * Famille C : sous-type "special" (1 entrée, m/k restent aléatoires) + sous-type "parite" croisé
 * avec `ecran3Cible` (3 valeurs) = 4 entrées. */
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
  | "C-parite-sousEnsemble";

export const CATALOGUE_VARIANTES: { id: IdVarianteTiragesArbres; label: string }[] = [
  { id: "A-avecRemise-k2", label: "A — avec remise, k=2" },
  { id: "A-avecRemise-k3", label: "A — avec remise, k=3" },
  { id: "A-sansRemise-k2", label: "A — sans remise, k=2" },
  { id: "A-sansRemise-k3", label: "A — sans remise, k=3" },
  { id: "B-n3-une", label: "B — n=3, une position fixée" },
  { id: "B-n3-deux", label: "B — n=3, deux positions fixées" },
  { id: "B-n4-une", label: "B — n=4, une position fixée" },
  { id: "B-n4-deux", label: "B — n=4, deux positions fixées" },
  { id: "B-n5-une", label: "B — n=5, une position fixée" },
  { id: "B-n5-deux", label: "B — n=5, deux positions fixées" },
  { id: "C-special", label: "C — une face fixée p0" },
  { id: "C-parite-pair", label: "C — parité, écran 3 = P(pair)" },
  { id: "C-parite-impair", label: "C — parité, écran 3 = P(impair)" },
  { id: "C-parite-sousEnsemble", label: "C — parité, écran 3 = sous-ensemble" },
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
      return construireFamilleB(3, "une");
    case "B-n3-deux":
      return construireFamilleB(3, "deux");
    case "B-n4-une":
      return construireFamilleB(4, "une");
    case "B-n4-deux":
      return construireFamilleB(4, "deux");
    case "B-n5-une":
      return construireFamilleB(5, "une");
    case "B-n5-deux":
      return construireFamilleB(5, "deux");
    case "C-special":
      return construireFamilleCSpecial(6, 2);
    case "C-parite-pair":
      return construireFamilleCParite(2, "pair");
    case "C-parite-impair":
      return construireFamilleCParite(2, "impair");
    case "C-parite-sousEnsemble":
      return construireFamilleCParite(2, "sousEnsemble");
  }
}
