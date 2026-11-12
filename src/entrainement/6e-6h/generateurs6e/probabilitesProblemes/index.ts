import type { ExerciceProbabilitesProblemes } from "../../core6e/probabilitesProblemes.types";
import { construireFamilleA, genererFamilleA } from "./familleA";
import { construireFamilleB, genererFamilleB } from "./familleB";
import { construireFamilleC, genererFamilleC } from "./familleC";
import { construireFamilleEMixteAvecDemande, genererFamilleEMixte } from "./familleE";
import { construireFamilleF, genererFamilleF } from "./familleF";
import { construireFamilleGMelange, genererFamilleGMelange } from "./familleG";

/**
 * Couche A (6e) — point d'entrée pour `6gen33`. Tirage équiprobable d'1 famille parmi 6 : A
 * (anniversaires), B (épreuves répétées), C (probabilités différentes), E (Bayes en problème),
 * F (série/parallèle), G (mélange d'objets). Audit 6e ch. 6 (décision F) : probabilité géométrique,
 * Bayes paramétrique, cadre financier et dérangements retirés (hors cours ou doublon de 6gen31).
 */

function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

const FAMILLES: readonly ("A" | "B" | "C" | "E" | "F" | "G")[] = ["A", "B", "C", "E", "F", "G"];

export function genererExerciceProbabilitesProblemes(): ExerciceProbabilitesProblemes {
  const famille = tirerParmi(FAMILLES);
  switch (famille) {
    case "A":
      return genererFamilleA();
    case "B":
      return genererFamilleB();
    case "C":
      return genererFamilleC();
    case "E":
      return genererFamilleEMixte();
    case "F":
      return genererFamilleF();
    case "G":
      return genererFamilleGMelange();
  }
}

/** Identifiants de variante forcée — granularité "ce qui change la structure de la question" (même
 * principe que `6gen30`/`6gen31`/`6gen32`), jamais un identifiant par tirage numérique individuel. */
export type IdVarianteProbabilitesProblemes =
  | "A-n4"
  | "A-n8"
  | "B-auMoinsK"
  | "B-unDeChaqueResultat"
  | "C-k1"
  | "C-k2"
  | "E-mixte-effet"
  | "E-mixte-pasEffet"
  | "F-serie-comparer"
  | "F-serie-verifier"
  | "F-parallele-comparer"
  | "F-parallele-verifier"
  | "F-mixte-comparer"
  | "F-mixte-verifier"
  | "G-melangeObjets";

export const CATALOGUE_VARIANTES: { id: IdVarianteProbabilitesProblemes; label: string }[] = [
  { id: "A-n4", label: "A — anniversaires, n=4" },
  { id: "A-n8", label: "A — anniversaires, n=8" },
  { id: "B-auMoinsK", label: "B — épreuves répétées, P(au moins k succès)" },
  { id: "B-unDeChaqueResultat", label: "B — épreuves répétées, au moins un succès et au moins un échec" },
  { id: "C-k1", label: "C — probabilités différentes, exactement 1 élément concerné" },
  { id: "C-k2", label: "C — probabilités différentes, exactement 2 éléments concernés" },
  { id: "E-mixte-effet", label: "E — Bayes en problème, P(c₁ | E)" },
  { id: "E-mixte-pasEffet", label: "E — Bayes en problème, P(c₁ | non E)" },
  { id: "F-serie-comparer", label: "F — série, fiabilité d'un autre montage" },
  { id: "F-serie-verifier", label: "F — série, vrai ou faux sur un autre montage" },
  { id: "F-parallele-comparer", label: "F — parallèle, fiabilité d'un autre montage" },
  { id: "F-parallele-verifier", label: "F — parallèle, vrai ou faux sur un autre montage" },
  { id: "F-mixte-comparer", label: "F — mixte, fiabilité d'un autre montage" },
  { id: "F-mixte-verifier", label: "F — mixte, vrai ou faux sur un autre montage" },
  { id: "G-melangeObjets", label: "G — mélange de deux urnes, probabilités totales" },
];

export function construireAvecVarianteId(id: IdVarianteProbabilitesProblemes): ExerciceProbabilitesProblemes {
  switch (id) {
    case "A-n4":
      return construireFamilleA(4);
    case "A-n8":
      return construireFamilleA(8);
    case "B-auMoinsK":
      return construireFamilleB(4, "auMoinsK");
    case "B-unDeChaqueResultat":
      return construireFamilleB(4, "unDeChaqueResultat");
    case "C-k1":
      return construireFamilleC(1);
    case "C-k2":
      return construireFamilleC(2);
    case "E-mixte-effet":
      return construireFamilleEMixteAvecDemande("cause1SachantEffet");
    case "E-mixte-pasEffet":
      return construireFamilleEMixteAvecDemande("cause1SachantPasEffet");
    case "F-serie-comparer":
      return construireFamilleF("serie", "comparerValeur");
    case "F-serie-verifier":
      return construireFamilleF("serie", "verifierAffirmation");
    case "F-parallele-comparer":
      return construireFamilleF("parallele", "comparerValeur");
    case "F-parallele-verifier":
      return construireFamilleF("parallele", "verifierAffirmation");
    case "F-mixte-comparer":
      return construireFamilleF("mixte", "comparerValeur");
    case "F-mixte-verifier":
      return construireFamilleF("mixte", "verifierAffirmation");
    case "G-melangeObjets":
      return construireFamilleGMelange(5, 2);
  }
}
