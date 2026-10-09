import type { ExerciceLoiPoisson, FamilleLoiPoisson } from "../../core6e/loiPoisson.types";
import { construireFamilleA, genererFamilleA } from "./familleA";
import { CONTEXTES_B } from "./contextes";
import { construireFamilleB, genererFamilleB } from "./familleB";

export { construireFamilleA, genererFamilleA, construireFamilleB, genererFamilleB };

/**
 * Couche A (6e) — point d'entrée `6gen53` ("Loi de Poisson"). Tirage à 2 niveaux (mirroir
 * `generateurs6e/loiBinomiale/index.ts`, 6gen50) : la FAMILLE (A/B) est tirée ÉQUIPROBABLE en
 * premier, PUIS le générateur de famille tire le reste en interne.
 */

const N_DEFAUT_A = 100;
const P_DEFAUT_A = 0.05;

const CONTEXTE_DEFAUT_B = CONTEXTES_B.find((c) => c.id === "peageB")!;
const CONTEXTE_EFFECTIF_DEFAUT_B = CONTEXTES_B.find((c) => c.id === "defectueuxB")!;

export type IdVarianteLoiPoisson = "A_verifier" | "B_exactement" | "B_entreAetB" | "B_auPlus" | "B_auMoins";

export const CATALOGUE_VARIANTES: { id: IdVarianteLoiPoisson; label: string }[] = [
  { id: "A_verifier", label: "A — Approximation Poisson (checklist + λ + P(X=k))" },
  { id: "B_exactement", label: "B — Exactement k occurrences (terme unique, 2 écrans)" },
  { id: "B_entreAetB", label: "B — Entre a et b occurrences (somme, 3 écrans)" },
  { id: "B_auPlus", label: "B — Au plus k occurrences (somme, 3 écrans)" },
  { id: "B_auMoins", label: "B — Au moins k occurrences (complément, 3 écrans)" },
];

export function construireAvecVarianteId(id: IdVarianteLoiPoisson): ExerciceLoiPoisson {
  switch (id) {
    case "A_verifier":
      return construireFamilleA(N_DEFAUT_A, P_DEFAUT_A);
    case "B_exactement":
      // Exemple donné par la spec elle-même : 5 voitures/minute, 15 minutes → λ=75 (vérifie aussi
      // la stabilité numérique à grande échelle via le panneau dev).
      return construireFamilleB(CONTEXTE_DEFAUT_B, 5, 15, "exactement");
    // BUG TROUVÉ EN VÉRIFICATION PLAYWRIGHT (piège λ testé de façon exhaustive via le panneau dev,
    // toutes variantes) : `CONTEXTE_EFFECTIF_DEFAUT_B` (defectueuxB) a `effectifReference=1000` —
    // un `valeurCible` de 1000 ici donnerait `facteurEchelle=1000/1000=1`, rendant le taux de base
    // brut ACCEPTABLE comme λ (facteurEchelle=1 neutralise le piège central du générateur, jamais
    // testable pour CES 2 variantes précises). `valeurCible=500` (facteurEchelle=0,5, λ=4) évite ce
    // piège tout en gardant λ dans la plage attendue pour une stratégie "somme" (≤10, voir
    // `familleB.ts`).
    case "B_entreAetB":
      return construireFamilleB(CONTEXTE_EFFECTIF_DEFAUT_B, 8, 500, "entreAetB");
    case "B_auPlus":
      return construireFamilleB(CONTEXTE_EFFECTIF_DEFAUT_B, 8, 500, "auPlus");
    case "B_auMoins":
      // Exemple donné par la spec elle-même : 3 défectueux/1000, lot de 100 → λ=0,3.
      return construireFamilleB(CONTEXTE_EFFECTIF_DEFAUT_B, 3, 100, "auMoins");
  }
}

const FAMILLES: FamilleLoiPoisson[] = ["A", "B"];

const CONSTRUCTEURS_PAR_FAMILLE: Record<FamilleLoiPoisson, () => ExerciceLoiPoisson> = {
  A: genererFamilleA,
  B: genererFamilleB,
};

export function genererExerciceLoiPoisson(): ExerciceLoiPoisson {
  const famille = tirerFamille();
  return CONSTRUCTEURS_PAR_FAMILLE[famille]();
}

function tirerFamille(): FamilleLoiPoisson {
  return FAMILLES[Math.floor(Math.random() * FAMILLES.length)];
}
