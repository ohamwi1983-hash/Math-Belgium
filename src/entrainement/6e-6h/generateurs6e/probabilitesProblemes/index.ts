import type { ExerciceProbabilitesProblemes } from "../../core6e/probabilitesProblemes.types";
import { construireFamilleA, genererFamilleA } from "./familleA";
import { construireFamilleB, genererFamilleB } from "./familleB";
import { construireFamilleC, genererFamilleC } from "./familleC";
import { construireFamilleD, genererFamilleD } from "./familleD";
import { construireFamilleEMixteAvecDemande, construireFamilleEParametrique, genererFamilleEMixte, genererFamilleEParametrique } from "./familleE";
import { construireFamilleF, genererFamilleF } from "./familleF";
import { construireFamilleGDerangements, construireFamilleGFinancier, construireFamilleGMelange, genererFamilleGDerangements, genererFamilleGFinancier, genererFamilleGMelange } from "./familleG";

/**
 * Couche A (6e) — point d'entrée pour `6gen33`. Tirage ÉQUIPROBABLE d'1 famille parmi 7 (A à G, spec
 * : "Tirage aléatoire d'1 famille parmi 7 (A à G, équiprobable)"), chaque famille tirant ensuite son
 * propre contexte/sous-type en interne (voir `familleA.ts` à `familleG.ts`).
 */

function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

const FAMILLES: readonly ("A" | "B" | "C" | "D" | "E" | "F" | "G")[] = ["A", "B", "C", "D", "E", "F", "G"];

export function genererExerciceProbabilitesProblemes(): ExerciceProbabilitesProblemes {
  const famille = tirerParmi(FAMILLES);
  switch (famille) {
    case "A":
      return genererFamilleA();
    case "B":
      return genererFamilleB();
    case "C":
      return genererFamilleC();
    case "D":
      return genererFamilleD();
    case "E":
      return Math.random() < 0.5 ? genererFamilleEMixte() : genererFamilleEParametrique();
    case "F":
      return genererFamilleF();
    case "G": {
      const sousType = tirerParmi(["derangements", "melangeObjets", "financier"] as const);
      if (sousType === "derangements") return genererFamilleGDerangements();
      if (sousType === "melangeObjets") return genererFamilleGMelange();
      return genererFamilleGFinancier();
    }
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
  | "D-simple"
  | "D-union"
  | "E-mixte-effet"
  | "E-mixte-pasEffet"
  | "E-parametrique"
  | "F-serie-comparer"
  | "F-serie-verifier"
  | "F-parallele-comparer"
  | "F-parallele-verifier"
  | "F-mixte-comparer"
  | "F-mixte-verifier"
  | "G-derangements-une"
  | "G-derangements-deux"
  | "G-melangeObjets"
  | "G-financier2"
  | "G-financier3";

export const CATALOGUE_VARIANTES: { id: IdVarianteProbabilitesProblemes; label: string }[] = [
  { id: "A-n4", label: "A — anniversaires, n=4" },
  { id: "A-n8", label: "A — anniversaires, n=8" },
  { id: "B-auMoinsK", label: "B — binomiale, P(au moins k succès)" },
  { id: "B-unDeChaqueResultat", label: "B — binomiale, P(un de chaque résultat)" },
  { id: "C-k1", label: "C — probabilités différentes, exactement 1 succès" },
  { id: "C-k2", label: "C — probabilités différentes, exactement 2 succès" },
  { id: "D-simple", label: "D — géométrique, une seule zone" },
  { id: "D-union", label: "D — géométrique, union de 2 zones" },
  { id: "E-mixte-effet", label: "E — Bayes mixte, P(cause1|effet)" },
  { id: "E-mixte-pasEffet", label: "E — Bayes mixte, P(cause1|pas effet)" },
  { id: "E-parametrique", label: "E — Bayes paramétrique (inéquation en x)" },
  { id: "F-serie-comparer", label: "F — série, comparer à une valeur" },
  { id: "F-serie-verifier", label: "F — série, vérifier une affirmation" },
  { id: "F-parallele-comparer", label: "F — parallèle, comparer à une valeur" },
  { id: "F-parallele-verifier", label: "F — parallèle, vérifier une affirmation" },
  { id: "F-mixte-comparer", label: "F — mixte, comparer à une valeur" },
  { id: "F-mixte-verifier", label: "F — mixte, vérifier une affirmation" },
  { id: "G-derangements-une", label: "G — dérangements n=4, 1 position fixée" },
  { id: "G-derangements-deux", label: "G — dérangements n=4, 2 positions fixées" },
  { id: "G-melangeObjets", label: "G — mélange d'objets, probabilités totales" },
  { id: "G-financier2", label: "G — financier, 2 catégories" },
  { id: "G-financier3", label: "G — financier, 3 catégories" },
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
    case "D-simple":
      return construireFamilleD([1]);
    case "D-union":
      return construireFamilleD([0, 1]);
    case "E-mixte-effet":
      return construireFamilleEMixteAvecDemande("cause1SachantEffet");
    case "E-mixte-pasEffet":
      return construireFamilleEMixteAvecDemande("cause1SachantPasEffet");
    case "E-parametrique":
      return construireFamilleEParametrique();
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
    case "G-derangements-une":
      return construireFamilleGDerangements("une");
    case "G-derangements-deux":
      return construireFamilleGDerangements("deux");
    case "G-melangeObjets":
      return construireFamilleGMelange(5, 2);
    case "G-financier2":
      return construireFamilleGFinancier(2);
    case "G-financier3":
      return construireFamilleGFinancier(3);
  }
}
